/**
 * Function Health Lab Exporter - Background Service Worker
 * Handles OAuth, data parsing, and Google Sheets API integration
 */

// Google Sheets column headers
const HEADER_ROW = [
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
  "createdAt"
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
 * Get spreadsheet ID from storage or use default
 */
function getSpreadsheetId() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["spreadsheetId"], (result) => {
      resolve(result.spreadsheetId || DEFAULT_SHEET_ID);
    });
  });
}

/**
 * Create a new Google Sheet
 */
async function createSpreadsheet() {
  const token = await getAuthToken(true);
  
  const response = await fetch(
    'https://sheets.googleapis.com/v4/spreadsheets',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          title: 'Function Health Data'
        }
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to create spreadsheet: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const spreadsheetId = data.spreadsheetId;
  
  // Store the ID for future use
  await new Promise((resolve) => {
    chrome.storage.sync.set({ spreadsheetId }, resolve);
  });
  
  console.log(`Created new Google Sheet: ${spreadsheetId}`);
  console.log(`View at: https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`);
  
  return spreadsheetId;
}

/**
 * Get spreadsheet ID from storage, or create new sheet if needed
 */
async function getOrCreateSpreadsheetId() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['spreadsheetId'], async (result) => {
      let spreadsheetId = result.spreadsheetId;
      
      // If no sheet exists or using default placeholder, create new one
      if (!spreadsheetId || spreadsheetId === DEFAULT_SHEET_ID) {
        spreadsheetId = await createSpreadsheet();
      }
      
      resolve(spreadsheetId);
    });
  });
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
function parseFunctionHealthData(json) {
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
        createdAt
      ]);
    }
  }

  return rows;
}

/**
 * Clear and rewrite Google Sheet with new data
 */
async function syncSheetWithData(rows) {
  const token = await getAuthToken(true);
  const spreadsheetId = await getOrCreateSpreadsheetId();

  const allValues = [HEADER_ROW, ...rows];

  // Clear existing data
  const clearResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A:Z:clear`,
    {
      method: "POST",
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    }
  );

  if (!clearResponse.ok) {
    throw new Error(`Failed to clear sheet: ${clearResponse.status} ${clearResponse.statusText}`);
  }

  // Write new data
  const writeResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1?valueInputOption=RAW`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ values: allValues })
    }
  );

  if (!writeResponse.ok) {
    throw new Error(`Failed to write data: ${writeResponse.status} ${writeResponse.statusText}`);
  }

  return allValues.length - 1; // Return row count (excluding header)
}

/**
 * Handle messages from content script
 */
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "FH_EXPORT_DATA") {
    (async () => {
      try {
        console.log("Processing Function Health data export...");
        const rows = parseFunctionHealthData(msg.payload);
        console.log(`Parsed ${rows.length} biomarker results`);
        
        await syncSheetWithData(rows);
        console.log("Successfully synced data to Google Sheets");
        
        sendResponse({ status: "ok", rowCount: rows.length });
      } catch (err) {
        console.error("Sync error:", err);
        sendResponse({ status: "error", message: String(err) });
      }
    })();

    // Return true to indicate async response
    return true;
  }
});

console.log("Function Health Lab Exporter background service worker loaded");