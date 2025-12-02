// 🚀 LabSaver v2.3.0 - OAuth Compliance Update (drive.file scope)
console.log("🚀 LabSaver v2.3.0 - Multi-Provider Lab Exporter");

/**
 * LabSaver - Background Service Worker
 * Handles OAuth, data parsing, and Google Sheets API integration
 * Supports both Function Health and Sutter Health
 */

import { deriveLoincFromFH, deriveLoincFromSH } from './loinc-derivation.js';

// Function Health column headers
const FH_HEADER_ROW = [
  "biomarkerId",
  "biomarkerName",
  "primaryCategory",
  "questBiomarkerCode",
  "questBiomarkerId",
  "dateOfService",
  "testResultRaw",
  "testResultNumeric",
  "measurementUnits",
  "statusLabel",
  "testResultOutOfRange",
  "rangeString",
  "rangeMinDisplay",
  "rangeMaxDisplay",
  "questReferenceRange",
  "improving",
  "neutral",
  "hasNewResults",
  "type",
  "requisitionId",
  "createdAt",
  "Derived_LOINC"
];

// Sutter Health column headers
const SH_HEADER_ROW = [
  "orderKey",
  "orderName",
  "orderDisplayDate",
  "resultStatus",
  "componentID",
  "componentName",
  "componentCommonName",
  "loincCode",
  "value",
  "numericValue",
  "units",
  "referenceRangeFormatted",
  "referenceRangeLowDisplay",
  "referenceRangeHighDisplay",
  "abnormalFlagCategory",
  "authorizingProviderName",
  "resultTimestampDisplay",
  "prioritizedInstantISO",
  "prioritizedInstantDisplay",
  "collectionTimestampsDisplay",
  "resultingLabName",
  "Derived_LOINC"
];

// Default spreadsheet ID (user should update this)
const DEFAULT_SHEET_ID = "YOUR_SHEET_ID_HERE";

/**
 * Get OAuth token for Google Sheets API
 */
function getAuthToken(interactive = true) {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive }, (token) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else if (!token) {
        reject(new Error("No token received"));
      } else {
        resolve(token);
      }
    });
  });
}

/**
 * Get spreadsheet ID from storage
 * Returns null if not set - user must select via picker
 */
function getSpreadsheetId() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["spreadsheetId"], (result) => {
      resolve(result.spreadsheetId || null);
    });
  });
}

/**
 * Create a new Google Sheet using Drive API
 * Uses drive.file scope for minimal permissions
 */
async function createSpreadsheet(sheetName = 'Lab Results') {
  const token = await getAuthToken(true);
  
  console.log(`Creating spreadsheet with name: "${sheetName}"`);
  
  const response = await fetch(
    'https://www.googleapis.com/drive/v3/files',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: sheetName,
        mimeType: 'application/vnd.google-apps.spreadsheet'
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Failed to create spreadsheet: ${response.status} ${response.statusText}`);
    console.error(`Error details: ${errorText}`);
    throw new Error(`Failed to create spreadsheet: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const spreadsheetId = data.id;
  
  console.log(`✓ Created spreadsheet: ${spreadsheetId}`);
  console.log(`View at: https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`);
  
  return spreadsheetId;
}

/**
 * Create a new spreadsheet with the given name (always creates new)
 */
/**
 * Get or create spreadsheet based on stored mapping
 * Storage format: { sheetNameToId: { "Sheet Name": "spreadsheetId" } }
 */
async function getOrCreateSpreadsheet(sheetName = 'Lab Results') {
  // Check if we have a stored spreadsheet ID for this name
  const result = await new Promise((resolve) => {
    chrome.storage.sync.get(['sheetNameToId'], resolve);
  });
  
  const sheetNameToId = result.sheetNameToId || {};
  const existingId = sheetNameToId[sheetName];
  
  if (existingId) {
    console.log(`Using stored spreadsheet for "${sheetName}": ${existingId}`);
    console.log(`View at: https://docs.google.com/spreadsheets/d/${existingId}/edit`);
    
    // Verify the spreadsheet still exists by trying to access it
    try {
      const token = await getAuthToken(true);
      const testResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${existingId}?fields=spreadsheetId`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (testResponse.ok) {
        return existingId;
      } else {
        console.warn(`Stored spreadsheet ${existingId} no longer accessible, creating new one`);
      }
    } catch (err) {
      console.warn(`Error accessing stored spreadsheet, creating new one:`, err);
    }
  }
  
  // Create new spreadsheet
  console.log(`Creating new spreadsheet: "${sheetName}"`);
  const spreadsheetId = await createSpreadsheet(sheetName);
  
  // Store the mapping
  sheetNameToId[sheetName] = spreadsheetId;
  await new Promise((resolve) => {
    chrome.storage.sync.set({ sheetNameToId }, resolve);
  });
  
  console.log(`Stored mapping: "${sheetName}" -> ${spreadsheetId}`);
  
  return spreadsheetId;
}

/**
 * Compute status label based on test result and ranges
 */
function computeStatusLabel(testResultOutOfRange, numericResult, rangeMin, rangeMax) {
  // If we have a numeric result and numeric ranges, compute status
  if (numericResult !== "" && rangeMin !== "" && rangeMax !== "") {
    const value = parseFloat(numericResult);
    const min = parseFloat(rangeMin);
    const max = parseFloat(rangeMax);
    
    if (!isNaN(value) && !isNaN(min) && !isNaN(max)) {
      if (value < min) return "BELOW_RANGE";
      if (value > max) return "ABOVE_RANGE";
      return "IN_RANGE";
    }
  }
  
  // Fall back to boolean flag if available
  if (typeof testResultOutOfRange === "boolean") {
    return testResultOutOfRange ? "OUT_OF_RANGE" : "IN_RANGE";
  }
  
  return "";
}

/**
 * Parse Function Health JSON data into rows for Google Sheets
 */
async function parseFunctionHealthData(json) {
  if (!json?.data?.biomarkerResultsRecord) {
    throw new Error("Invalid data structure: missing biomarkerResultsRecord");
  }

  const records = json.data.biomarkerResultsRecord;
  const rows = [];

  for (const rec of records) {
    const biomarker = rec.biomarker;
    if (!biomarker) continue;

    const biomarkerId = biomarker.id || "";
    const biomarkerName = biomarker.name || "";
    const questCode = biomarker.questBiomarkerCode || "";
    const categories = biomarker.categories || [];
    const primaryCategory = categories.length > 0 ? categories[0].categoryName : "";

    const questBiomarkerId = rec.questBiomarkerId || "";
    const rangeString = rec.rangeString || "";
    const rangeMin = rec.rangeMin || "";
    const rangeMax = rec.rangeMax || "";
    const rangeMinDisplay = rec.rangeMinDisplay || "";
    const rangeMaxDisplay = rec.rangeMaxDisplay || "";
    const improving = rec.improving ?? "";
    const neutral = rec.neutral ?? "";
    const hasNewResults = rec.hasNewResults ?? "";
    const type = rec.type ?? "";

    const biomarkerResults = rec.biomarkerResults || [];

    for (const r of biomarkerResults) {
      // Skip hidden results
      if (r.visible === false) continue;

      const dateOfService = r.dateOfService || "";
      const testResultRaw = r.testResult ?? "";
      const measurementUnits = r.measurementUnits || "";
      const testResultOutOfRange = r.testResultOutOfRange;
      const questReferenceRange = r.questReferenceRange || "";
      const requisitionId = r.requisitionId || "";
      const createdAt = r.createdAt || "";

      // Extract numeric value from test result
      let numericResult = "";
      const match = typeof testResultRaw === "string" 
        ? testResultRaw.match(/^[<>]?\s*(-?\d+(\.\d+)?)/)
        : null;
      if (match) {
        numericResult = match[1];
      }

      // Compute status label
      const statusLabel = computeStatusLabel(
        testResultOutOfRange,
        numericResult,
        rangeMin,
        rangeMax
      );

      // Create row object for LOINC derivation
      const rowObj = {
        questBiomarkerCode: questCode
      };
      const derivedLoinc = await deriveLoincFromFH(rowObj);

      rows.push([
        biomarkerId,
        biomarkerName,
        primaryCategory,
        questCode,
        questBiomarkerId,
        dateOfService,
        testResultRaw,
        numericResult,
        measurementUnits,
        statusLabel,
        typeof testResultOutOfRange === "boolean" ? testResultOutOfRange : "",
        rangeString,
        rangeMinDisplay,
        rangeMaxDisplay,
        questReferenceRange,
        improving,
        neutral,
        hasNewResults,
        type,
        requisitionId,
        createdAt,
        derivedLoinc
      ]);
    }
  }

  return rows;
}

/**
 * Process Sutter Health export - write pre-flattened rows to Google Sheets
 */
async function processSutterHealthExport(rows, sheetName = 'Lab Results') {
  console.log("\n" + "=".repeat(60));
  console.log("🏥 SUTTER HEALTH DATA EXPORT STARTED");
  console.log("=".repeat(60));
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Sheet Name: ${sheetName}`);
  console.log(`Received ${rows.length} component results from content script`);
  
  // Check if spreadsheet ID is set
  const spreadsheetId = await getSpreadsheetId();
  if (!spreadsheetId) {
    console.log("❌ No spreadsheet selected - user must use picker");
    throw new Error('No spreadsheet selected. Please select a spreadsheet first.');
  }
  
  console.log("\n--- Writing to Google Sheets ---");
  const token = await getAuthToken(true);
  console.log(`✓ Using spreadsheet: ${spreadsheetId}`);
  
  // Ensure SH_Export sheet exists
  await ensureSheetExists(token, spreadsheetId, "SH_Export");
  
  // Add derived LOINC to each row
  console.log(`[SH_Export DEBUG] Processing ${rows.length} rows to add LOINC codes...`);
  
  const rowsWithLoinc = await Promise.all(rows.map(async (row, index) => {
    try {
      const rowObj = {
        componentName: row[5],
        componentCommonName: row[6],
        units: row[10]
      };
      const derivedLoinc = await deriveLoincFromSH(rowObj);
      const newRow = [...row, derivedLoinc];
      
      return newRow;
    } catch (error) {
      console.error(`[SH_Export DEBUG] Error processing row ${index}:`, error);
      console.error(`[SH_Export DEBUG] Problematic row:`, row);
      throw error;
    }
  }));
  
  console.log(`[SH_Export DEBUG] After LOINC derivation: ${rowsWithLoinc.length} rows`);
  
  // Write data to SH_Export sheet
  console.log("\n--- Creating SH_Export Sheet ---");
  const allValues = [SH_HEADER_ROW, ...rowsWithLoinc];
  await writeSheetData(token, spreadsheetId, "SH_Export", allValues);
  console.log("✓ Successfully created SH_Export sheet");
  console.log(`  - ${rows.length} component results`);
  
  // Create SH_Definitions sheet
  console.log("\n--- Creating SH_Definitions Sheet ---");
  const definitionsRows = buildSHDefinitionsRows(rowsWithLoinc);
  await ensureSheetExists(token, spreadsheetId, "SH_Definitions");
  await writeSheetData(token, spreadsheetId, "SH_Definitions", definitionsRows);
  console.log("✓ Successfully created SH_Definitions sheet");
  console.log(`  - ${definitionsRows.length - 1} unique components`);
  
  // Create SH_Latest sheet
  console.log("\n--- Creating SH_Latest Sheet ---");
  const latestValuesRows = buildSHLatestValuesRows(rowsWithLoinc);
  await ensureSheetExists(token, spreadsheetId, "SH_Latest");
  await writeSheetData(token, spreadsheetId, "SH_Latest", latestValuesRows);
  console.log("✓ Successfully created SH_Latest sheet");
  console.log(`  - ${latestValuesRows.length - 1} components with latest values`);
  
  // Create SH_Table sheet
  console.log("\n--- Creating SH_Table Sheet ---");
  console.log(`[SH_Export DEBUG] Calling createSHTableSheet with ${rowsWithLoinc.length} rows`);
  const tableStats = await createSHTableSheet(rowsWithLoinc, spreadsheetId);
  console.log("✓ Successfully created SH_Table sheet");
  console.log(`  - ${tableStats.componentCount} components`);
  console.log(`  - ${tableStats.dateCount} dates`);
  console.log(`  - ${tableStats.redCellCount} abnormal cells marked in red`);
  
  // Create Contents tab with metadata for all Sutter Health tabs
  const currentTimestamp = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  
  const shTabsMetadata = [
    {
      name: "SH_Export",
      description: "Raw component results from Sutter Health",
      lastUpdated: currentTimestamp
    },
    {
      name: "SH_Definitions",
      description: "Unique component definitions and metadata",
      lastUpdated: currentTimestamp
    },
    {
      name: "SH_Latest",
      description: "Most recent value for each component",
      lastUpdated: currentTimestamp
    },
    {
      name: "SH_Table",
      description: "Pivot table with components as rows and dates as columns",
      lastUpdated: currentTimestamp
    }
  ];
  
  await createOrUpdateContentsTab(token, spreadsheetId, shTabsMetadata);
  
  console.log("\n" + "=".repeat(60));
  console.log("✅ SUTTER HEALTH EXPORT COMPLETED SUCCESSFULLY");
  console.log("=".repeat(60) + "\n");
  console.log(`View at: https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`);
  
  return {
    rowCount: rows.length,
    spreadsheetId: spreadsheetId,
    definitionsCount: definitionsRows.length - 1,
    latestValuesCount: latestValuesRows.length - 1,
    tableStats: tableStats
  };
}

/**
 * Build SH_Definitions sheet rows from SH export data
 */
function buildSHDefinitionsRows(rows) {
  const seen = new Set();
  const definitionRows = [];

  // Header row for SH_Definitions sheet
  definitionRows.push([
    "componentID",
    "componentName",
    "componentCommonName",
    "loincCode",
    "units",
    "referenceRangeFormatted"
  ]);

  for (const row of rows) {
    const componentID = row[4]; // componentID
    const componentName = row[5]; // componentName
    const componentCommonName = row[6]; // componentCommonName
    const loincCode = row[7]; // loincCode
    const units = row[10]; // units
    const referenceRangeFormatted = row[11]; // referenceRangeFormatted

    if (!componentID) continue;
    if (seen.has(componentID)) continue;
    seen.add(componentID);

    definitionRows.push([
      componentID,
      componentName,
      componentCommonName,
      loincCode,
      units,
      referenceRangeFormatted
    ]);
  }

  return definitionRows;
}

/**
 * Build SH_Latest sheet rows from SH export data
 */
function buildSHLatestValuesRows(rows) {
  // Helper function to parse timestamp strings into Date objects
  function parseTimestamp(timestampStr) {
    if (!timestampStr) return null;
    try {
      // Parse format: "MMM DD, YYYY H:MM AM/PM" (e.g., "Oct 05, 2017 6:46 AM")
      const date = new Date(timestampStr);
      return isNaN(date.getTime()) ? null : date;
    } catch (e) {
      return null;
    }
  }

  // Header for SH_Latest sheet
  const latestRows = [];
  latestRows.push([
    "componentID",
    "componentName",
    "componentCommonName",
    "loincCode",
    "latestValue",
    "latestNumericValue",
    "units",
    "referenceRangeFormatted",
    "referenceRangeLowDisplay",
    "referenceRangeHighDisplay",
    "abnormalFlagCategory",
    "latestOrderDisplayDate",
    "latestResultTimestampDisplay",
    "latestPrioritizedInstantISO"
  ]);

  // Group by componentID and pick the latest row
  const latestByComponent = new Map();

  for (const row of rows) {
    const componentID = row[4]; // componentID
    if (!componentID) continue;

    // DEBUG: Log comparison details for the problematic component
    const isProblematicComponent = componentID === "WP-24k3WhwqqY4X704xIBBkIs4Q-3D-3D-24ZE5f29q4HC0nXgr7v1Tnn7m-2FI6WyGdZDt0ICxUg-2BJTY-3D";
    if (isProblematicComponent) {
      console.log(`[SH_Latest DEBUG] Processing componentID: ${componentID}`);
      console.log(`[SH_Latest DEBUG] Current row data:`, {
        orderDisplayDate: row[2],
        resultTimestampDisplay: row[16],
        prioritizedInstantISO: row[17],
        prioritizedInstantDisplay: row[18],
        value: row[8]
      });
    }

    const existing = latestByComponent.get(componentID);
    if (!existing) {
      latestByComponent.set(componentID, row);
      continue;
    }

    if (isProblematicComponent) {
      console.log(`[SH_Latest DEBUG] Existing row data:`, {
        orderDisplayDate: existing[2],
        resultTimestampDisplay: existing[16],
        prioritizedInstantISO: existing[17],
        prioritizedInstantDisplay: existing[18],
        value: existing[8]
      });
    }

    // Compare prioritizedInstantISO (index 17) with proper empty date handling
    const dateA = row[17] || "";
    const dateB = existing[17] || "";
    
    // Handle empty date cases
    if (dateA === "" && dateB === "") {
      // Case 1: Both dates empty - parse and compare resultTimestampDisplay
      const timestampA = row[16] || "";
      const timestampB = existing[16] || "";
      const dateObjA = parseTimestamp(timestampA);
      const dateObjB = parseTimestamp(timestampB);
      
      if (dateObjA && dateObjB) {
        if (dateObjA > dateObjB) {
          latestByComponent.set(componentID, row);
        }
      } else if (dateObjA && !dateObjB) {
        // New has valid timestamp, existing doesn't
        latestByComponent.set(componentID, row);
      }
      // If neither can be parsed or only existing has valid timestamp, keep existing
    } else if (dateA === "" && dateB !== "") {
      // Case 2: New date is empty but existing has a value - use fallback comparison
      // Try resultTimestampDisplay first
      const timestampA = row[16] || "";
      const timestampB = existing[16] || "";
      const dateObjA = parseTimestamp(timestampA);
      const dateObjB = parseTimestamp(timestampB);
      
      if (dateObjA && dateObjB) {
        if (dateObjA > dateObjB) {
          latestByComponent.set(componentID, row);
        }
      } else if (timestampA !== "" && timestampB !== "") {
        // Fallback to orderDisplayDate if timestamp parsing fails
        const orderDateA = row[2] || "";
        const orderDateB = existing[2] || "";
        const orderDateObjA = parseTimestamp(orderDateA);
        const orderDateObjB = parseTimestamp(orderDateB);
        
        if (orderDateObjA && orderDateObjB && orderDateObjA > orderDateObjB) {
          latestByComponent.set(componentID, row);
        }
      }
    } else if (dateA !== "" && dateB === "") {
      // Case 3: New date has a value but existing is empty - update to new entry
      latestByComponent.set(componentID, row);
    } else {
      // Case 4: Both dates have values - compare normally
      if (dateA > dateB) {
        latestByComponent.set(componentID, row);
      } else if (dateA === dateB) {
        // If same date, parse and compare resultTimestampDisplay (index 16)
        const timestampA = row[16] || "";
        const timestampB = existing[16] || "";
        const dateObjA = parseTimestamp(timestampA);
        const dateObjB = parseTimestamp(timestampB);
        
        if (dateObjA && dateObjB && dateObjA > dateObjB) {
          latestByComponent.set(componentID, row);
        }
      }
    }

    if (isProblematicComponent) {
      console.log(`[SH_Latest DEBUG] Comparison results:`, {
        dateA: dateA,
        dateB: dateB,
        'dateA empty': dateA === "",
        'dateB empty': dateB === "",
        'dateA > dateB': dateA > dateB,
        'dateA === dateB': dateA === dateB
      });
    }
  }

  for (const [componentID, r] of latestByComponent.entries()) {
    latestRows.push([
      componentID,                                    // componentID
      r[5] || "",                                     // componentName
      r[6] || "",                                     // componentCommonName
      r[7] || "",                                     // loincCode
      r[8] || "",                                     // latestValue
      r[9] || "",                                     // latestNumericValue
      r[10] || "",                                    // units
      r[11] || "",                                    // referenceRangeFormatted
      r[12] || "",                                    // referenceRangeLowDisplay
      r[13] || "",                                    // referenceRangeHighDisplay
      r[14] || "",                                    // abnormalFlagCategory
      r[2] || "",                                     // latestOrderDisplayDate
      r[16] || "",                                    // latestResultTimestampDisplay
      r[17] || ""                                     // latestPrioritizedInstantISO
    ]);
  }

  return latestRows;
}

/**
 * Create a pivot-style "SH_Table" sheet with components as rows and dates as columns
 */
async function createSHTableSheet(rows, spreadsheetId) {
  const token = await getAuthToken(true);

  // DIAGNOSTIC: Log input data
  console.log(`[SH_Table DEBUG] Received ${rows.length} rows for processing`);
  if (rows.length > 0) {
    console.log(`[SH_Table DEBUG] First row structure:`, rows[0]);
    console.log(`[SH_Table DEBUG] First row length: ${rows[0].length}`);
  }

  // Extract unique component names, months, units, and abnormal flags
  const componentMap = new Map(); // componentName -> { months: Map(month -> {value, abnormal, date}), units, referenceRange }
  const allMonths = new Set();

  // Process rows to build the data structure
  let processedCount = 0;
  let skippedCount = 0;
  for (const row of rows) {
    const componentName = row[5]; // componentName
    const orderDisplayDate = row[18]; // prioritizedInstantDisplay (e.g., "April 25, 2014")
    const value = row[8]; // value
    const units = row[10]; // units
    const referenceRangeFormatted = row[11]; // referenceRangeFormatted
    const abnormalFlagCategory = row[14]; // abnormalFlagCategory
    const prioritizedInstantISO = row[17]; // prioritizedInstantISO

    // DIAGNOSTIC: Log data extraction
    if (processedCount < 3) {
      console.log(`[SH_Table DEBUG] Row ${processedCount}:`, {
        componentName,
        orderDisplayDate,
        value,
        units,
        abnormalFlagCategory
      });
    }

    if (!componentName || !orderDisplayDate) {
      skippedCount++;
      if (skippedCount <= 3) {
        console.log(`[SH_Table DEBUG] Skipping row - componentName: "${componentName}", orderDisplayDate: "${orderDisplayDate}"`);
      }
      continue;
    }
    
    processedCount++;

    // Parse date from text format (e.g., "April 25, 2014") and convert to YYYY-MM
    let month;
    try {
      const parsedDate = new Date(orderDisplayDate);
      if (!isNaN(parsedDate.getTime())) {
        const year = parsedDate.getFullYear();
        const monthNum = String(parsedDate.getMonth() + 1).padStart(2, '0');
        month = `${year}-${monthNum}`; // Format as YYYY-MM
      } else {
        // Fallback: try to use ISO format if available
        month = prioritizedInstantISO ? prioritizedInstantISO.substring(0, 7) : orderDisplayDate.substring(0, 7);
      }
    } catch (e) {
      // Fallback: try to use ISO format if available
      month = prioritizedInstantISO ? prioritizedInstantISO.substring(0, 7) : orderDisplayDate.substring(0, 7);
    }
    allMonths.add(month);

    if (!componentMap.has(componentName)) {
      componentMap.set(componentName, {
        months: new Map(),
        units: units || "",
        referenceRange: referenceRangeFormatted || ""
      });
    }

    const componentData = componentMap.get(componentName);
    
    // If this month already has data, keep the most recent one
    const existingData = componentData.months.get(month);
    const currentDate = prioritizedInstantISO || orderDisplayDate;
    if (!existingData || currentDate > existingData.date) {
      componentData.months.set(month, {
        value: value,
        abnormal: abnormalFlagCategory && abnormalFlagCategory !== "" && abnormalFlagCategory !== "Unknown",
        date: currentDate
      });
    }
  }

  // DIAGNOSTIC: Log processing results
  console.log(`[SH_Table DEBUG] Processing complete:`);
  console.log(`  - Processed rows: ${processedCount}`);
  console.log(`  - Skipped rows: ${skippedCount}`);
  console.log(`  - Unique components: ${componentMap.size}`);
  console.log(`  - Unique months: ${allMonths.size}`);
  console.log(`  - Component names:`, Array.from(componentMap.keys()));
  console.log(`  - Months:`, Array.from(allMonths));

  // Sort months chronologically
  const sortedMonths = Array.from(allMonths).sort((a, b) => {
    return a.localeCompare(b);
  });

  // Sort component names alphabetically
  const sortedComponents = Array.from(componentMap.keys()).sort();

  // Build the table data
  const tableData = [];
  
  // Header row: Component | Month1 | Month2 | ... | BLANK | Units | Range
  const headerRow = ["Component", ...sortedMonths, "", "Units", "Range"];
  tableData.push(headerRow);

  // Track cells that need red formatting (row, col)
  const redCells = [];

  // Data rows
  for (let i = 0; i < sortedComponents.length; i++) {
    const componentName = sortedComponents[i];
    const componentData = componentMap.get(componentName);
    
    const row = [componentName];
    
    // Add values for each month column
    for (let j = 0; j < sortedMonths.length; j++) {
      const month = sortedMonths[j];
      const cellData = componentData.months.get(month);
      
      if (cellData) {
        row.push(cellData.value);
        
        // Track if this cell should be red (abnormal)
        if (cellData.abnormal) {
          redCells.push({
            row: i + 1, // +1 because header is row 0
            col: j + 1  // +1 because component name is col 0
          });
        }
      } else {
        row.push(""); // Empty cell if no data for this month
      }
    }
    
    // Add one blank column
    row.push("");
    
    // Add measurement units column
    row.push(componentData.units);
    
    // Add range string as the last column
    row.push(componentData.referenceRange);
    
    tableData.push(row);
  }

  // DIAGNOSTIC: Log table data structure
  console.log(`[SH_Table DEBUG] Table data built:`);
  console.log(`  - Total rows (including header): ${tableData.length}`);
  console.log(`  - Header row length: ${tableData[0].length}`);
  console.log(`  - Data rows: ${tableData.length - 1}`);
  console.log(`  - Red cells to format: ${redCells.length}`);

  // Ensure SH_Table sheet exists
  await ensureSheetExists(token, spreadsheetId, "SH_Table");

  // Get the sheetId for clearing formatting
  const metadataResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!metadataResponse.ok) {
    throw new Error(`Failed to get sheet metadata for clearing: ${metadataResponse.status}`);
  }

  const metadata = await metadataResponse.json();
  const sheetForClearing = metadata.sheets.find(s => s.properties.title === "SH_Table");
  
  if (sheetForClearing) {
    const sheetIdForClearing = sheetForClearing.properties.sheetId;
    
    // Clear all formatting from the sheet before writing new data
    const clearFormatResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          requests: [{
            updateCells: {
              range: {
                sheetId: sheetIdForClearing
              },
              fields: "userEnteredFormat"
            }
          }]
        })
      }
    );

    if (!clearFormatResponse.ok) {
      const errorText = await clearFormatResponse.text();
      console.warn(`   Warning: Failed to clear formatting: ${clearFormatResponse.status} - ${errorText}`);
    } else {
      console.log(`   ✓ Cleared existing formatting from SH_Table`);
    }
  }

  // Clear all existing data from the sheet before writing new data
  const clearDataResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/SH_Table:clear`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    }
  );

  if (!clearDataResponse.ok) {
    const errorText = await clearDataResponse.text();
    console.warn(`   Warning: Failed to clear data: ${clearDataResponse.status} - ${errorText}`);
  } else {
    console.log(`   ✓ Cleared existing data from SH_Table`);
  }

  // Write table data
  const writeResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/SH_Table!A1?valueInputOption=RAW`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ values: tableData })
    }
  );

  if (!writeResponse.ok) {
    throw new Error(`Failed to write SH_Table data: ${writeResponse.status}`);
  }

  // Get the sheetId for the "SH_Table" sheet (needed for formatting)
  const getResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!getResponse.ok) {
    throw new Error(`Failed to get sheet info for formatting: ${getResponse.status}`);
  }

  const spreadsheetData = await getResponse.json();
  const tableSheet = spreadsheetData.sheets.find(sheet => sheet.properties.title === "SH_Table");
  
  if (!tableSheet) {
    throw new Error("SH_Table sheet not found for formatting");
  }

  const sheetId = tableSheet.properties.sheetId;

  // Build formatting requests
  const formatRequests = [];

  // Add bold formatting for the entire header row (row 0)
  formatRequests.push({
    repeatCell: {
      range: {
        sheetId: sheetId,
        startRowIndex: 0,
        endRowIndex: 1,
        startColumnIndex: 0,
        endColumnIndex: headerRow.length
      },
      cell: {
        userEnteredFormat: {
          textFormat: {
            bold: true
          }
        }
      },
      fields: "userEnteredFormat.textFormat.bold"
    }
  });

  // Add center alignment for all columns except column A (Component column)
  formatRequests.push({
    repeatCell: {
      range: {
        sheetId: sheetId,
        startRowIndex: 0,
        endRowIndex: tableData.length,
        startColumnIndex: 1, // Start from column B (skip column A)
        endColumnIndex: headerRow.length
      },
      cell: {
        userEnteredFormat: {
          horizontalAlignment: "CENTER"
        }
      },
      fields: "userEnteredFormat.horizontalAlignment"
    }
  });

  // Add red formatting for abnormal cells
  if (redCells.length > 0) {
    const redFormatRequests = redCells.map(cell => ({
      repeatCell: {
        range: {
          sheetId: sheetId,
          startRowIndex: cell.row,
          endRowIndex: cell.row + 1,
          startColumnIndex: cell.col,
          endColumnIndex: cell.col + 1
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: {
              red: 1.0,
              green: 0.8,
              blue: 0.8
            }
          }
        },
        fields: "userEnteredFormat.backgroundColor"
      }
    }));
    
    formatRequests.push(...redFormatRequests);
  }

  // Apply all formatting in a single batch request
  const formatResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        requests: formatRequests
      })
    }
  );

  if (!formatResponse.ok) {
    throw new Error(`Failed to apply formatting: ${formatResponse.status}`);
  }

  console.log(`Applied bold formatting to header row`);
  if (redCells.length > 0) {
    console.log(`Applied red formatting to ${redCells.length} abnormal cells`);
  }

  console.log(`Created SH_Table sheet with ${sortedComponents.length} components and ${sortedMonths.length} months`);
  return {
    componentCount: sortedComponents.length,
    dateCount: sortedMonths.length,
    redCellCount: redCells.length
  };
}

/**
 * Build Definitions sheet rows (no derived fields, only direct JSON values)
 */
function buildDefinitionsRows(resultsReportJson) {
  const seen = new Set();
  const rows = [];

  // Header row for Definitions sheet
  rows.push([
    "biomarkerId",
    "biomarkerName",
    "primaryCategory",
    "questBiomarkerCode",
    "questBiomarkerId",
    "sexContext",
    "oneLineDescription",
    "whyItMatters",
    "optimalRangeLow",
    "optimalRangeHigh",
    "questRefRangeLow",
    "questRefRangeHigh"
  ]);

  const records = resultsReportJson?.data?.biomarkerResultsRecord || [];

  // Detect user's sex from categories in the data
  let userSex = "All"; // Default to "All"
  for (const rec of records) {
    const bm = rec.biomarker;
    if (!bm) continue;
    
    const categories = bm.categories || [];
    for (const cat of categories) {
      if (cat.categoryName === "Male Health") {
        userSex = "Male";
        break;
      } else if (cat.categoryName === "Female Health") {
        userSex = "Female";
        break;
      }
    }
    if (userSex !== "All") break; // Found sex, stop searching
  }

  console.log(`Detected user sex: ${userSex}`);

  for (const rec of records) {
    const bm = rec.biomarker;
    if (!bm || !bm.id) continue;
    if (seen.has(bm.id)) continue;
    seen.add(bm.id);

    const category =
      bm.categories && bm.categories.length > 0 ? bm.categories[0].categoryName || "" : "";

    // Select sexDetails based on detected user sex
    let sexDetails = undefined;
    if (bm.sexDetails && bm.sexDetails.length > 0) {
      // Try to find matching sex first
      sexDetails = bm.sexDetails.find(sd => sd.sex === userSex);
      
      // If no match, try "All"
      if (!sexDetails) {
        sexDetails = bm.sexDetails.find(sd => sd.sex === "All");
      }
      
      // If still no match, use first available
      if (!sexDetails) {
        sexDetails = bm.sexDetails[0];
      }
    }

    const sexContext = sexDetails?.sex || "";
    const optimalRangeLow = sexDetails?.optimalRangeLow || "";
    const optimalRangeHigh = sexDetails?.optimalRangeHigh || "";
    const questRefRangeLow = sexDetails?.questRefRangeLow || "";
    const questRefRangeHigh = sexDetails?.questRefRangeHigh || "";

    rows.push([
      bm.id,
      bm.name || "",
      category,
      bm.questBiomarkerCode || "",
      rec.questBiomarkerId || "",
      sexContext,
      bm.oneLineDescription || "",
      bm.whyItMatters || "",
      optimalRangeLow,
      optimalRangeHigh,
      questRefRangeLow,
      questRefRangeHigh
    ]);
  }

  return rows;
}

/**
 * Build Latest_Values sheet rows from Export data
 */
function buildLatestValuesRows(exportRows) {
  // Header for Latest_Values sheet
  const rows = [];
  rows.push([
    "biomarkerId",
    "biomarkerName",
    "primaryCategory",
    "questBiomarkerCode",
    "questBiomarkerId",
    "latestDateOfService",
    "latestTestResultRaw",
    "latestTestResultNumeric",
    "measurementUnits",
    "statusLabel",
    "testResultOutOfRange",
    "rangeString",
    "rangeMinDisplay",
    "rangeMaxDisplay",
    "questReferenceRange",
    "improving",
    "neutral",
    "hasNewResults",
    "type",
    "latestRequisitionId",
    "latestCreatedAt"
  ]);

  // Group by biomarkerId and pick the latest row
  const latestByBiomarker = new Map();

  for (const row of exportRows) {
    const id = row[0]; // biomarkerId
    if (!id) continue;

    const existing = latestByBiomarker.get(id);
    if (!existing) {
      latestByBiomarker.set(id, row);
      continue;
    }

    // Compare dateOfService (index 5) with proper empty date handling
    const dateA = row[5] || "";
    const dateB = existing[5] || "";
    
    // Handle empty date cases
    if (dateA === "" && dateB === "") {
      // Both dates empty - compare using createdAt timestamps
      const createdA = row[20] || "";
      const createdB = existing[20] || "";
      if (createdA > createdB) {
        latestByBiomarker.set(id, row);
      }
    } else if (dateA === "" && dateB !== "") {
      // New date is empty but existing has a value - use fallback comparison
      // Try createdAt timestamp
      const createdA = row[20] || "";
      const createdB = existing[20] || "";
      if (createdA !== "" && createdB !== "") {
        if (createdA > createdB) {
          latestByBiomarker.set(id, row);
        }
      }
      // If createdAt is also empty, keep existing entry (don't update)
    } else if (dateA !== "" && dateB === "") {
      // New date has a value but existing is empty - update to new entry
      latestByBiomarker.set(id, row);
    } else {
      // Both dates have values - compare normally
      if (dateA > dateB) {
        latestByBiomarker.set(id, row);
      } else if (dateA === dateB) {
        // If same date, use latest createdAt (index 20)
        const createdA = row[20] || "";
        const createdB = existing[20] || "";
        if (createdA > createdB) {
          latestByBiomarker.set(id, row);
        }
      }
    }
  }

  for (const [biomarkerId, r] of latestByBiomarker.entries()) {
    rows.push([
      biomarkerId,                                    // biomarkerId
      r[1] || "",                                     // biomarkerName
      r[2] || "",                                     // primaryCategory
      r[3] || "",                                     // questBiomarkerCode
      r[4] || "",                                     // questBiomarkerId
      r[5] || "",                                     // latestDateOfService
      r[6] != null ? String(r[6]) : "",              // latestTestResultRaw
      r[7] != null ? String(r[7]) : "",              // latestTestResultNumeric
      r[8] || "",                                     // measurementUnits
      r[9] || "",                                     // statusLabel
      r[10] != null ? String(r[10]) : "",            // testResultOutOfRange
      r[11] || "",                                    // rangeString
      r[12] || "",                                    // rangeMinDisplay
      r[13] || "",                                    // rangeMaxDisplay
      r[14] || "",                                    // questReferenceRange
      r[15] != null ? String(r[15]) : "",            // improving
      r[16] != null ? String(r[16]) : "",            // neutral
      r[17] != null ? String(r[17]) : "",            // hasNewResults
      r[18] != null ? String(r[18]) : "",            // type
      r[19] || "",                                    // latestRequisitionId
      r[20] || ""                                     // latestCreatedAt
    ]);
  }

  return rows;
}

/**
 * Helper function to ensure a sheet exists, creating it if necessary
 */
async function ensureSheetExists(token, spreadsheetId, sheetName) {
  // Get spreadsheet metadata to check if sheet exists
  console.log(`   Checking if sheet "${sheetName}" exists...`);
  const metadataResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!metadataResponse.ok) {
    throw new Error(`Failed to get spreadsheet metadata: ${metadataResponse.status}`);
  }

  const metadata = await metadataResponse.json();
  const sheets = metadata.sheets || [];
  console.log(`   Found ${sheets.length} existing sheets: ${sheets.map(s => s.properties.title).join(', ')}`);
  const sheetExists = sheets.some(sheet => sheet.properties.title === sheetName);
  console.log(`   Sheet "${sheetName}" exists: ${sheetExists}`);

  if (!sheetExists) {
    console.log(`   Creating ${sheetName} sheet...`);
    
    const createResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          requests: [{
            addSheet: {
              properties: {
                title: sheetName
              }
            }
          }]
        })
      }
    );

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      
      // Check if the error is because the sheet already exists
      if (errorText.includes('already exists')) {
        console.log(`   ℹ Sheet "${sheetName}" already exists (detected during creation attempt)`);
        // Sheet exists, this is fine - just continue
        return;
      }
      
      throw new Error(`Failed to create ${sheetName} sheet: ${createResponse.status} - ${errorText}`);
    }
    
    console.log(`   ✓ Created "${sheetName}" sheet`);
    
    // After creating the first sheet, delete Sheet1 if it exists
    const sheet1 = sheets.find(s => s.properties.title === "Sheet1");
    if (sheet1) {
      console.log(`   Deleting default Sheet1...`);
      const deleteResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            requests: [{
              deleteSheet: {
                sheetId: sheet1.properties.sheetId
              }
            }]
          })
        }
      );
      
      if (deleteResponse.ok) {
        console.log(`   ✓ Deleted Sheet1`);
      } else {
        console.warn(`   Warning: Could not delete Sheet1`);
      }
    } else {
      console.log(`   ✓ Sheet "${sheetName}" already exists`);
    }
  }
}

/**
 * Helper function to write data to a sheet
 */
async function writeSheetData(token, spreadsheetId, sheetName, rows) {
  console.log(`   Writing ${rows.length} rows (including header) to ${sheetName}...`);
  
  // Step 1: Get the sheetId for clearing formatting
  const metadataResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!metadataResponse.ok) {
    throw new Error(`Failed to get sheet metadata: ${metadataResponse.status}`);
  }

  const metadata = await metadataResponse.json();
  const sheet = metadata.sheets.find(s => s.properties.title === sheetName);
  
  if (sheet) {
    const sheetId = sheet.properties.sheetId;
    
    // Step 2: Clear all formatting from the sheet
    const clearFormatResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          requests: [{
            updateCells: {
              range: {
                sheetId: sheetId
              },
              fields: "userEnteredFormat"
            }
          }]
        })
      }
    );

    if (!clearFormatResponse.ok) {
      const errorText = await clearFormatResponse.text();
      console.warn(`   Warning: Failed to clear formatting: ${clearFormatResponse.status} - ${errorText}`);
    } else {
      console.log(`   ✓ Cleared existing formatting`);
    }
  }
  
  // Step 3: Write new data
  const writeResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A1?valueInputOption=RAW`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ values: rows })
    }
  );

  if (!writeResponse.ok) {
    const errorText = await writeResponse.text();
    throw new Error(`Failed to write ${sheetName} data: ${writeResponse.status} - ${errorText}`);
  }

  console.log(`   ✓ Data written successfully to ${sheetName}`);
}

/**
 * Create or update the Contents tab with metadata about all tabs
 */
async function createOrUpdateContentsTab(token, spreadsheetId, tabsMetadata) {
  console.log("\n--- Creating/Updating Contents Tab ---");
  
  try {
    // Ensure Contents sheet exists
    await ensureSheetExists(token, spreadsheetId, "Contents");
    
    // Step 1: Read existing Contents tab data to merge with new tabs
    let existingTabs = new Map(); // Map of tab name -> {description, lastUpdated}
    
    try {
      const readResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Contents`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (readResponse.ok) {
        const readData = await readResponse.json();
        const values = readData.values || [];
        
        // Parse existing entries (skip title row at index 0, empty row at index 1, header at index 2)
        // Data rows start at index 3
        if (values.length > 3) {
          for (let i = 3; i < values.length; i++) {
            const row = values[i];
            if (row && row.length >= 3) {
              // Extract tab name from potential HYPERLINK formula
              let tabName = row[0];
              if (typeof tabName === 'string' && tabName.startsWith('=HYPERLINK')) {
                // Extract tab name from formula: =HYPERLINK("#gid=123", "TabName")
                const match = tabName.match(/=HYPERLINK\("[^"]*",\s*"([^"]*)"\)/);
                if (match) {
                  tabName = match[1];
                }
              }
              
              existingTabs.set(tabName, {
                description: row[1] || "",
                lastUpdated: row[2] || ""
              });
            }
          }
          console.log(`  - Found ${existingTabs.size} existing tabs in Contents`);
        }
      }
    } catch (readError) {
      console.log(`  - No existing Contents data to merge (this is normal for first export)`);
    }
    
    // Step 2: Merge new tabs with existing tabs
    for (const tab of tabsMetadata) {
      existingTabs.set(tab.name, {
        description: tab.description,
        lastUpdated: tab.lastUpdated
      });
    }
    
    // Step 3: Sort tabs in custom order: Export, Definitions, Latest, Table, then alphabetically
    const customOrder = ['FH_Export', 'FH_Definitions', 'FH_Latest', 'FH_Table', 'SH_Export'];
    const sortedTabNames = Array.from(existingTabs.keys()).sort((a, b) => {
      const aIndex = customOrder.indexOf(a);
      const bIndex = customOrder.indexOf(b);
      
      // If both are in custom order, sort by their position
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      // If only a is in custom order, it comes first
      if (aIndex !== -1) return -1;
      // If only b is in custom order, it comes first
      if (bIndex !== -1) return 1;
      // Otherwise, sort alphabetically
      return a.localeCompare(b);
    });
    console.log(`  - Total tabs after custom sort: ${sortedTabNames.length}`);
    
    // Step 4: Get sheet metadata to retrieve sheet IDs (gid) for hyperlinks
    const metadataResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    if (!metadataResponse.ok) {
      throw new Error(`Failed to get sheet metadata: ${metadataResponse.status}`);
    }
    
    const metadata = await metadataResponse.json();
    const sheets = metadata.sheets || [];
    
    // Create a map of sheet name -> sheet ID (gid)
    const sheetIdMap = new Map();
    for (const sheet of sheets) {
      sheetIdMap.set(sheet.properties.title, sheet.properties.sheetId);
    }
    
    // Step 5: Build the Contents tab data with HYPERLINK formulas
    const contentsData = [];
    
    // Title row
    contentsData.push([{
      userEnteredValue: { stringValue: "LabSaver" }
    }]);
    
    // Empty row for spacing
    contentsData.push([]);
    
    // Header row
    contentsData.push([
      { userEnteredValue: { stringValue: "Tab Name" } },
      { userEnteredValue: { stringValue: "Description" } },
      { userEnteredValue: { stringValue: "Last Updated" } }
    ]);
    
    // Add each tab's metadata with HYPERLINK formula
    for (const tabName of sortedTabNames) {
      const tabData = existingTabs.get(tabName);
      const sheetId = sheetIdMap.get(tabName);
      
      let tabNameCell;
      if (sheetId !== undefined) {
        // Create HYPERLINK formula for internal navigation
        tabNameCell = {
          userEnteredValue: {
            formulaValue: `=HYPERLINK("#gid=${sheetId}", "${tabName}")`
          }
        };
      } else {
        // If sheet doesn't exist (shouldn't happen), just use plain text
        tabNameCell = {
          userEnteredValue: { stringValue: tabName }
        };
      }
      
      contentsData.push([
        tabNameCell,
        { userEnteredValue: { stringValue: tabData.description } },
        { userEnteredValue: { stringValue: tabData.lastUpdated } }
      ]);
    }
    
    // Step 6: Write data using batchUpdate to support formulas
    const batchUpdateResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          requests: [{
            updateCells: {
              range: {
                sheetId: sheetIdMap.get("Contents"),
                startRowIndex: 0,
                startColumnIndex: 0
              },
              rows: contentsData.map(row => ({
                values: row.length > 0 ? row : [{ userEnteredValue: { stringValue: "" } }]
              })),
              fields: "userEnteredValue"
            }
          }]
        })
      }
    );
    
    if (!batchUpdateResponse.ok) {
      const errorText = await batchUpdateResponse.text();
      throw new Error(`Failed to write Contents data: ${batchUpdateResponse.status} - ${errorText}`);
    }
    
    // Get the sheetId for the Contents sheet for formatting
    const formattingMetadataResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    if (!formattingMetadataResponse.ok) {
      throw new Error(`Failed to get sheet metadata for formatting: ${formattingMetadataResponse.status}`);
    }
    
    const formattingMetadata = await formattingMetadataResponse.json();
    const contentsSheet = formattingMetadata.sheets.find(s => s.properties.title === "Contents");
    
    if (!contentsSheet) {
      throw new Error("Contents sheet not found for formatting");
    }
    
    const sheetId = contentsSheet.properties.sheetId;
    
    // Build formatting requests
    const formatRequests = [];
    
    // Format title row (row 0) - bold and larger font
    formatRequests.push({
      repeatCell: {
        range: {
          sheetId: sheetId,
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: 0,
          endColumnIndex: 1
        },
        cell: {
          userEnteredFormat: {
            textFormat: {
              bold: true,
              fontSize: 16
            }
          }
        },
        fields: "userEnteredFormat.textFormat"
      }
    });
    
    // Format header row (row 2) - bold
    formatRequests.push({
      repeatCell: {
        range: {
          sheetId: sheetId,
          startRowIndex: 2,
          endRowIndex: 3,
          startColumnIndex: 0,
          endColumnIndex: 3
        },
        cell: {
          userEnteredFormat: {
            textFormat: {
              bold: true
            }
          }
        },
        fields: "userEnteredFormat.textFormat.bold"
      }
    });
    
    // Apply formatting
    const formatResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          requests: formatRequests
        })
      }
    );
    
    if (!formatResponse.ok) {
      throw new Error(`Failed to apply formatting to Contents tab: ${formatResponse.status}`);
    }
    
    // Move Contents sheet to index 0 (leftmost position)
    const moveResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          requests: [{
            updateSheetProperties: {
              properties: {
                sheetId: sheetId,
                index: 0
              },
              fields: "index"
            }
          }]
        })
      }
    );
    
    if (!moveResponse.ok) {
      throw new Error(`Failed to move Contents tab to index 0: ${moveResponse.status}`);
    }
    
    console.log("✓ Successfully created/updated Contents tab");
    console.log(`  - ${tabsMetadata.length} tabs listed`);
    console.log("  - Positioned at index 0 (leftmost)");
    
  } catch (error) {
    console.error("Error creating/updating Contents tab:", error);
    throw error;
  }
}

/**
 * Clear and rewrite Google Sheet with new data
 */
async function syncSheetWithData(rows, sheetName = 'Lab Results') {
  console.log("=== syncSheetWithData START ===");
  console.log(`Processing ${rows.length} rows`);
  
  // Check if spreadsheet ID is set
  const spreadsheetId = await getSpreadsheetId();
  if (!spreadsheetId) {
    console.log("❌ No spreadsheet selected - user must use picker");
    throw new Error('No spreadsheet selected. Please select a spreadsheet first.');
  }
  
  const token = await getAuthToken(true);
  console.log("✓ Auth token obtained");
  console.log(`✓ Using spreadsheet: ${spreadsheetId}`);
  console.log(`   Sheet name: "${sheetName}"`);
  console.log(`   View at: https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`);

  // Store spreadsheetId for other functions to use
  await new Promise((resolve) => {
    chrome.storage.sync.set({ spreadsheetId }, resolve);
  });

  // Ensure FH_Export sheet exists and write data
  await ensureSheetExists(token, spreadsheetId, "FH_Export");
  
  const allValues = [FH_HEADER_ROW, ...rows];
  await writeSheetData(token, spreadsheetId, "FH_Export", allValues);
  
  console.log("=== syncSheetWithData COMPLETE ===");
  return allValues.length - 1; // Return row count (excluding header)
}

/**
 * Create a pivot-style "FH_Table" sheet with biomarkers as rows and dates as columns
 */
async function createTableSheet(rows) {
  const token = await getAuthToken(true);
  // Get the spreadsheet ID that was just created/used
  const result = await new Promise((resolve) => {
    chrome.storage.sync.get(['spreadsheetId'], resolve);
  });
  const spreadsheetId = result.spreadsheetId;

  // Extract unique biomarker names, months, measurement units, and categories
  const biomarkerMap = new Map(); // biomarkerName -> { months: Map(month -> {value, outOfRange, date}), rangeString, measurementUnits, primaryCategory }
  const allMonths = new Set();

  // Process rows to build the data structure
  for (const row of rows) {
    const biomarkerName = row[1]; // biomarkerName
    const primaryCategory = row[2]; // primaryCategory
    const dateOfService = row[5]; // dateOfService
    const testResultRaw = row[6]; // testResultRaw
    const measurementUnits = row[8]; // measurementUnits
    const testResultOutOfRange = row[10]; // testResultOutOfRange
    const rangeString = row[11]; // rangeString

    if (!biomarkerName || !dateOfService) continue;

    // Extract month in YYYY-MM format
    const month = dateOfService.substring(0, 7); // "2024-11-21" -> "2024-11"
    allMonths.add(month);

    if (!biomarkerMap.has(biomarkerName)) {
      biomarkerMap.set(biomarkerName, {
        months: new Map(),
        rangeString: rangeString || "",
        measurementUnits: measurementUnits || "",
        primaryCategory: primaryCategory || ""
      });
    }

    const biomarkerData = biomarkerMap.get(biomarkerName);
    
    // If this month already has data, keep the most recent one
    const existingData = biomarkerData.months.get(month);
    if (!existingData || dateOfService > existingData.date) {
      biomarkerData.months.set(month, {
        value: testResultRaw,
        outOfRange: testResultOutOfRange === true,
        date: dateOfService
      });
    }
  }

  // Sort months chronologically
  const sortedMonths = Array.from(allMonths).sort((a, b) => {
    return a.localeCompare(b);
  });

  // Sort biomarker names alphabetically
  const sortedBiomarkers = Array.from(biomarkerMap.keys()).sort();

  // Build the table data
  const tableData = [];
  
  // Header row: Biomarker | Category | Month1 | Month2 | ... | BLANK | Units | Range
  const headerRow = ["Biomarker", "Category", ...sortedMonths, "", "Units", "Range"];
  tableData.push(headerRow);

  // Track cells that need red formatting (row, col)
  const redCells = [];

  // Data rows
  for (let i = 0; i < sortedBiomarkers.length; i++) {
    const biomarkerName = sortedBiomarkers[i];
    const biomarkerData = biomarkerMap.get(biomarkerName);
    
    const row = [biomarkerName, biomarkerData.primaryCategory];
    
    // Add values for each month column
    for (let j = 0; j < sortedMonths.length; j++) {
      const month = sortedMonths[j];
      const cellData = biomarkerData.months.get(month);
      
      if (cellData) {
        row.push(cellData.value);
        
        // Track if this cell should be red (out of range)
        if (cellData.outOfRange) {
          redCells.push({
            row: i + 1, // +1 because header is row 0
            col: j + 2  // +2 because biomarker name is col 0 and category is col 1
          });
        }
      } else {
        row.push(""); // Empty cell if no data for this month
      }
    }
    
    // Add one blank column
    row.push("");
    
    // Add measurement units column
    row.push(biomarkerData.measurementUnits);
    
    // Add range string as the last column
    row.push(biomarkerData.rangeString);
    
    tableData.push(row);
  }

  // Step 1: Check if "FH_Table" sheet exists, if not create it
  try {
    // Try to get sheet properties
    const getResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!getResponse.ok) {
      throw new Error(`Failed to get spreadsheet info: ${getResponse.status}`);
    }

    const spreadsheetData = await getResponse.json();
    const sheets = spreadsheetData.sheets || [];
    const tableSheetExists = sheets.some(sheet => sheet.properties.title === "FH_Table");

    if (!tableSheetExists) {
      // Create the "FH_Table" sheet
      const addSheetResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            requests: [{
              addSheet: {
                properties: {
                  title: "FH_Table"
                }
              }
            }]
          })
        }
      );

      if (!addSheetResponse.ok) {
        throw new Error(`Failed to create FH_Table sheet: ${addSheetResponse.status}`);
      }
    }
  } catch (err) {
    console.error("Error checking/creating FH_Table sheet:", err);
    throw err;
  }

  // Step 2: Write table data (overwrites existing data)
  const writeResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/FH_Table!A1?valueInputOption=RAW`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ values: tableData })
    }
  );

  if (!writeResponse.ok) {
    throw new Error(`Failed to write FH_Table data: ${writeResponse.status}`);
  }

  // Step 3: Get the sheetId for the "FH_Table" sheet (needed for formatting)
  const getResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!getResponse.ok) {
    throw new Error(`Failed to get sheet info for formatting: ${getResponse.status}`);
  }

  const spreadsheetData = await getResponse.json();
  const tableSheet = spreadsheetData.sheets.find(sheet => sheet.properties.title === "FH_Table");
  
  if (!tableSheet) {
    throw new Error("FH_Table sheet not found for formatting");
  }

  const sheetId = tableSheet.properties.sheetId;

  // Build formatting requests
  const formatRequests = [];

  // Add bold formatting for the entire header row (row 0)
  formatRequests.push({
    repeatCell: {
      range: {
        sheetId: sheetId,
        startRowIndex: 0,
        endRowIndex: 1,
        startColumnIndex: 0,
        endColumnIndex: headerRow.length
      },
      cell: {
        userEnteredFormat: {
          textFormat: {
            bold: true
          }
        }
      },
      fields: "userEnteredFormat.textFormat.bold"
    }
  });

  // Add center alignment for all columns except column A (Biomarker column)
  formatRequests.push({
    repeatCell: {
      range: {
        sheetId: sheetId,
        startRowIndex: 0,
        endRowIndex: tableData.length,
        startColumnIndex: 1, // Start from column B (skip column A)
        endColumnIndex: headerRow.length
      },
      cell: {
        userEnteredFormat: {
          horizontalAlignment: "CENTER"
        }
      },
      fields: "userEnteredFormat.horizontalAlignment"
    }
  });

  // Add red formatting for out-of-range cells
  if (redCells.length > 0) {
    const redFormatRequests = redCells.map(cell => ({
      repeatCell: {
        range: {
          sheetId: sheetId,
          startRowIndex: cell.row,
          endRowIndex: cell.row + 1,
          startColumnIndex: cell.col,
          endColumnIndex: cell.col + 1
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: {
              red: 1.0,
              green: 0.8,
              blue: 0.8
            }
          }
        },
        fields: "userEnteredFormat.backgroundColor"
      }
    }));
    
    formatRequests.push(...redFormatRequests);
  }

  // Apply all formatting in a single batch request
  const formatResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        requests: formatRequests
      })
    }
  );

  if (!formatResponse.ok) {
    throw new Error(`Failed to apply formatting: ${formatResponse.status}`);
  }

  console.log(`Applied bold formatting to header row`);
  if (redCells.length > 0) {
    console.log(`Applied red formatting to ${redCells.length} out-of-range cells`);
  }

  console.log(`Created FH_Table sheet with ${sortedBiomarkers.length} biomarkers and ${sortedMonths.length} months`);
  return {
    biomarkerCount: sortedBiomarkers.length,
    dateCount: sortedMonths.length,
    redCellCount: redCells.length
  };
}

/**
 * Handle messages from content script
 */
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // Handle OAuth token request from content script
  if (msg.type === "GET_AUTH_TOKEN") {
    (async () => {
      try {
        const token = await getAuthToken(true); // interactive = true
        sendResponse({ success: true, token: token });
      } catch (err) {
        console.error("Error getting auth token:", err);
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true; // Indicates async response
  }
  
  // Handle storage get request
  if (msg.type === "GET_STORAGE") {
    chrome.storage.sync.get(msg.keys, (result) => {
      if (chrome.runtime.lastError) {
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        sendResponse({ success: true, data: result });
      }
    });
    return true;
  }
  
  // Handle storage set request
  if (msg.type === "SET_STORAGE") {
    chrome.storage.sync.set(msg.data, () => {
      if (chrome.runtime.lastError) {
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        sendResponse({ success: true });
      }
    });
    return true;
  }
  
  // Handle storage clearing request
  if (msg.action === "CLEAR_STORAGE") {
    chrome.storage.sync.remove('spreadsheetId', () => {
      console.log("✓ Cleared stored spreadsheet ID");
      sendResponse({ success: true, message: "Storage cleared successfully" });
    });
    return true;
  }
  
  if (msg.type === "FH_EXPORT_DATA") {
    (async () => {
      try {
        const sheetName = msg.sheetName || 'Lab Results';
        console.log("\n" + "=".repeat(60));
        console.log("📊 FUNCTION HEALTH DATA EXPORT STARTED");
        console.log("=".repeat(60));
        console.log(`Timestamp: ${new Date().toISOString()}`);
        console.log(`Sheet Name: ${sheetName}`);
        
        console.log("\n--- Parsing Data ---");
        const rows = await parseFunctionHealthData(msg.payload);
        console.log(`✓ Parsed ${rows.length} biomarker results`);
        
        console.log("\n--- Syncing to FH_Values Sheet ---");
        await syncSheetWithData(rows, sheetName);
        console.log("✓ Successfully synced data to FH_Values sheet");
        
        // Store as master sheet ID for both FH and SH exports
        const result = await new Promise((resolve) => {
          chrome.storage.sync.get(['spreadsheetId'], resolve);
        });
        await new Promise((resolve) => {
          chrome.storage.sync.set({ masterSheetId: result.spreadsheetId }, resolve);
        });
        
        // Get auth token and spreadsheet ID for the new sheets
        const token = await getAuthToken(true);
        const spreadsheetId = result.spreadsheetId;
        
        console.log("\n--- Creating FH_Definitions Sheet ---");
        // Build Definitions rows from original JSON (no derived fields)
        const definitionsRows = buildDefinitionsRows(msg.payload);
        await ensureSheetExists(token, spreadsheetId, "FH_Definitions");
        await writeSheetData(token, spreadsheetId, "FH_Definitions", definitionsRows);
        console.log("✓ Successfully created FH_Definitions sheet");
        console.log(`  - ${definitionsRows.length - 1} unique biomarkers`);
        
        console.log("\n--- Creating FH_Latest Sheet ---");
        // Build Latest_Values rows from FH_Values data
        const latestValuesRows = buildLatestValuesRows(rows);
        await ensureSheetExists(token, spreadsheetId, "FH_Latest");
        await writeSheetData(token, spreadsheetId, "FH_Latest", latestValuesRows);
        console.log("✓ Successfully created FH_Latest sheet");
        console.log(`  - ${latestValuesRows.length - 1} biomarkers with latest values`);
        
        console.log("\n--- Creating FH_Table Sheet ---");
        // Create the FH_Table sheet with pivot-style layout
        const tableStats = await createTableSheet(rows);
        console.log("✓ Successfully created FH_Table sheet");
        console.log(`  - ${tableStats.biomarkerCount} biomarkers`);
        console.log(`  - ${tableStats.dateCount} dates`);
        console.log(`  - ${tableStats.redCellCount} out-of-range cells marked in red`);
        
        // Create Contents tab with metadata for all Function Health tabs
        const currentTimestamp = new Date().toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        });
        
        const fhTabsMetadata = [
          {
            name: "FH_Export",
            description: "Raw biomarker results from Function Health",
            lastUpdated: currentTimestamp
          },
          {
            name: "FH_Definitions",
            description: "Unique biomarker definitions and metadata",
            lastUpdated: currentTimestamp
          },
          {
            name: "FH_Latest",
            description: "Most recent value for each biomarker",
            lastUpdated: currentTimestamp
          },
          {
            name: "FH_Table",
            description: "Pivot table with biomarkers as rows and dates as columns",
            lastUpdated: currentTimestamp
          }
        ];
        
        await createOrUpdateContentsTab(token, spreadsheetId, fhTabsMetadata);
        
        console.log("\n" + "=".repeat(60));
        console.log("✅ EXPORT COMPLETED SUCCESSFULLY");
        console.log("=".repeat(60) + "\n");
        
        sendResponse({
          status: "ok",
          rowCount: rows.length,
          spreadsheetId: spreadsheetId,
          sheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
          definitionsCount: definitionsRows.length - 1,
          latestValuesCount: latestValuesRows.length - 1,
          tableStats: tableStats
        });
      } catch (err) {
        console.log("\n" + "=".repeat(60));
        console.error("❌ EXPORT FAILED");
        console.error("=".repeat(60));
        console.error("Error:", err);
        console.error("Error name:", err.name);
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
        console.error("=".repeat(60) + "\n");
        
        sendResponse({ status: "error", message: String(err) });
      }
    })();

    // Return true to indicate async response
    return true;
  }
  
  // Handle Sutter Health export (receives pre-flattened rows from content script)
  if (msg.type === "SH_EXPORT_ROWS") {
    (async () => {
      try {
        const { rows } = msg.payload;
        const sheetName = msg.sheetName || 'Lab Results';
        const result = await processSutterHealthExport(rows, sheetName);
        
        sendResponse({
          status: "ok",
          rowCount: result.rowCount,
          spreadsheetId: result.spreadsheetId,
          sheetUrl: `https://docs.google.com/spreadsheets/d/${result.spreadsheetId}/edit`
        });
      } catch (err) {
        console.log("\n" + "=".repeat(60));
        console.error("❌ SUTTER HEALTH EXPORT FAILED");
        console.error("=".repeat(60));
        console.error("Error:", err);
        console.error("Error name:", err.name);
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
        console.error("=".repeat(60) + "\n");
        
        sendResponse({ status: "error", message: String(err) });
      }
    })();
    
    // Return true to indicate async response
    return true;
  }
});

console.log("LabSaver background service worker loaded - Multi-provider support");