/**
 * LabSaver - Content Script
 * Injects export button and handles data fetching from lab provider APIs
 */

// Detect which site we're on
const isFunctionHealth = window.location.hostname === "my.functionhealth.com";
const isSutterHealth = window.location.hostname === "myhealthonline.sutterhealth.org";

function injectFunctionHealthButton() {
  // Check if extension context is valid
  if (!chrome?.runtime?.id) {
    console.warn('Extension context invalidated - please reload the page');
    return;
  }
  
  // Prevent duplicate buttons
  if (document.getElementById("fh-export-btn")) return;

  // Create container for buttons
  const container = document.createElement("div");
  container.id = "fh-export-container";
  Object.assign(container.style, {
    position: "fixed",
    top: "20px",
    right: "20px",
    zIndex: "9999",
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  });

  // Create Export button
  const btn = document.createElement("button");
  btn.id = "fh-export-btn";
  
  // Create icon element
  const icon = document.createElement("img");
  icon.src = chrome.runtime.getURL("icons/icon48.png");
  icon.style.width = "20px";
  icon.style.height = "20px";
  icon.style.marginRight = "8px";
  icon.style.verticalAlign = "middle";
  
  // Create text span
  const textSpan = document.createElement("span");
  textSpan.textContent = "Export Labs";
  textSpan.style.verticalAlign = "middle";
  
  // Add icon and text to button
  btn.appendChild(icon);
  btn.appendChild(textSpan);

  // Style the export button with dark charcoal background (neutral contrast to logo)
  Object.assign(btn.style, {
    background: "#1f2937",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontFamily: "system-ui, sans-serif",
    fontSize: "14px",
    fontWeight: "500",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  });

  // Add hover effects for Export button (lighter slate on hover)
  btn.onmouseenter = () => {
    btn.style.background = "#374151";
    btn.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
  };
  btn.onmouseleave = () => {
    btn.style.background = "#1f2937";
    btn.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
  };

  btn.onclick = async () => {
    // Get the last used sheet name from storage via background script
    let lastSheetName = 'Lab Results';
    try {
      const storageResponse = await chrome.runtime.sendMessage({
        type: "GET_STORAGE",
        keys: ['lastSheetName']
      });
      if (storageResponse?.success && storageResponse.data) {
        lastSheetName = storageResponse.data.lastSheetName || 'Lab Results';
      }
    } catch (e) {
      console.warn('Failed to get stored sheet name:', e);
    }
    
    // Prompt user for sheet name
    const sheetName = prompt('Enter a name for your Google Sheet:', lastSheetName);
    
    // If user cancels, don't proceed
    if (sheetName === null) {
      return;
    }
    
    // Sanitize sheet name: remove invalid characters and limit length
    // Google Sheets doesn't allow: < > : " / \ | ? *
    let sanitizedName = sheetName
      .replace(/[<>:"\/\\|?*]/g, '')  // Remove invalid characters
      .trim()                          // Remove leading/trailing whitespace
      .substring(0, 100);              // Limit to 100 characters
    
    // Use default if sanitized name is empty
    const finalSheetName = sanitizedName || 'Lab Results';
    
    // Save the sheet name for next time via background script
    try {
      await chrome.runtime.sendMessage({
        type: "SET_STORAGE",
        data: { lastSheetName: finalSheetName }
      });
    } catch (e) {
      console.warn('Failed to save sheet name:', e);
    }
    
    btn.disabled = true;
    btn.style.cursor = "wait";
    btn.style.opacity = "0.7";
    textSpan.textContent = "Exporting...";

    try {
      // Get Firebase ID token from localStorage
      const userDataStr = localStorage.getItem('userData');
      if (!userDataStr) {
        throw new Error('Not logged in - please refresh the page and try again');
      }
      
      const userData = JSON.parse(userDataStr);
      const idToken = userData.idToken;
      
      if (!idToken) {
        throw new Error('Authentication token not found - please log out and log back in');
      }

      // Fetch data from Function Health API with authentication
      const url = "https://production-member-app-mid-lhuqotpy2a-ue.a.run.app/api/v1/results-report";
      
      // Required headers for Function Health API authentication
      // The Authorization header with Firebase ID token is critical for authentication
      const res = await fetch(url, {
        credentials: "include",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${idToken}`,
          "fe-app-version": "0.84.70",
          "origin": "https://my.functionhealth.com",
          "referer": "https://my.functionhealth.com/",
          "x-backend-skip-cache": "true"
        }
      });

      if (!res.ok) {
        throw new Error(`API request failed: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();

      // Check if extension context is valid
      if (!chrome?.runtime?.id) {
        throw new Error('Extension context invalidated - please reload the page');
      }

      // Send data to background script for processing with sheet name
      chrome.runtime.sendMessage(
        { type: "FH_EXPORT_DATA", payload: data, sheetName: finalSheetName },
        (response) => {
          btn.disabled = false;
          btn.style.cursor = "pointer";
          btn.style.opacity = "1";
          
          if (response?.status === "ok") {
            textSpan.textContent = `✓ Exported ${response.rowCount} results!`;
            btn.style.background = "#10b981";
          } else {
            textSpan.textContent = "Export Failed";
            btn.style.background = "#ef4444";
            console.error("Export error:", response?.message);
          }
          
          // Reset button after 3 seconds
          setTimeout(() => {
            textSpan.textContent = "Export Labs";
            btn.style.background = "#1f2937";
          }, 3000);
        }
      );
    } catch (e) {
      console.error("Export error:", e);
      alert(e.message || 'Export failed - please try again');
      btn.disabled = false;
      btn.style.cursor = "pointer";
      btn.style.opacity = "1";
      textSpan.textContent = "Error — Try Again";
      btn.style.background = "#ef4444";
      
      setTimeout(() => {
        textSpan.textContent = "Export Labs";
        btn.style.background = "#1f2937";
      }, 3000);
    }
  };

  // Add button to container and container to page
  container.appendChild(btn);
  document.body.appendChild(container);
  console.log("Function Health Export button injected");
}

function injectSutterHealthButton() {
  // Check if extension context is valid
  if (!chrome?.runtime?.id) {
    console.warn('Extension context invalidated - please reload the page');
    return;
  }
  
  console.log('🔧 [SH BUTTON v2.0 - ' + Date.now() + '] Injecting button');
  console.log("🔧 [DEBUG] injectSutterHealthButton() called");
  console.log("🔧 [DEBUG] Current URL:", window.location.href);
  console.log("🔧 [DEBUG] Document ready state:", document.readyState);
  
  // Prevent duplicate buttons
  if (document.getElementById("sh-export-btn")) {
    console.log("🔧 [DEBUG] Button already exists, skipping injection");
    return;
  }
  
  // Only show button on Test Results pages
  const isTestResultsPage = window.location.pathname.includes('/test-results') ||
                            window.location.pathname.includes('/TestResults') ||
                            document.querySelector('[data-test-results]') ||
                            document.title.toLowerCase().includes('test results');
  
  if (!isTestResultsPage) {
    console.log("🔧 [DEBUG] Not on Test Results page, skipping Sutter Health button injection");
    return;
  }
  
  console.log("🔧 [DEBUG] On Test Results page, proceeding with button injection");

  // Create container for button
  const container = document.createElement("div");
  container.id = "sh-export-container";
  container.setAttribute('data-version', '2.0-' + Date.now());
  
  console.log("🔧 [DEBUG] Container created with ID:", container.id);
  
  // Set positioning styles in specific order to avoid inset shorthand issues
  container.style.setProperty('position', 'fixed', 'important');
  container.style.setProperty('z-index', '99999', 'important');
  container.style.setProperty('display', 'flex', 'important');
  container.style.setProperty('flex-direction', 'column', 'important');
  container.style.setProperty('gap', '10px', 'important');
  
  // Set positioning properties - use right instead of left with calc()
  container.style.setProperty('left', 'auto', 'important');
  container.style.setProperty('top', '20px', 'important');
  container.style.setProperty('right', '20px', 'important');
  
  console.log("🔧 [DEBUG] Container styles applied via setProperty");

  // Create Export button
  const btn = document.createElement("button");
  btn.id = "sh-export-btn";
  
  // Create icon element
  const icon = document.createElement("img");
  icon.src = chrome.runtime.getURL("icons/icon48.png");
  icon.style.width = "20px";
  icon.style.height = "20px";
  icon.style.marginRight = "8px";
  icon.style.verticalAlign = "middle";
  
  // Create text span
  const textSpan = document.createElement("span");
  textSpan.textContent = "Export Labs";
  textSpan.style.verticalAlign = "middle";
  
  // Add icon and text to button
  btn.appendChild(icon);
  btn.appendChild(textSpan);

  // Style the export button - use setAttribute to completely override
  btn.setAttribute('style', `
    background: #1f2937 !important;
    color: #fff !important;
    padding: 10px 16px !important;
    border-radius: 8px !important;
    border: none !important;
    cursor: pointer !important;
    font-family: system-ui, sans-serif !important;
    font-size: 14px !important;
    font-weight: 500 !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important;
    transition: all 0.2s ease !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    white-space: nowrap !important;
    width: auto !important;
    max-width: 200px !important;
    flex-shrink: 0 !important;
  `);

  // Add hover effects
  btn.onmouseenter = () => {
    btn.style.background = "#374151";
    btn.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
  };
  btn.onmouseleave = () => {
    btn.style.background = "#1f2937";
    btn.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
  };

  btn.onclick = async () => {
    // Get the last used sheet name from storage via background script
    let lastSheetName = 'Lab Results';
    try {
      const storageResponse = await chrome.runtime.sendMessage({
        type: "GET_STORAGE",
        keys: ['lastSheetName']
      });
      if (storageResponse?.success && storageResponse.data) {
        lastSheetName = storageResponse.data.lastSheetName || 'Lab Results';
      }
    } catch (e) {
      console.warn('Failed to get stored sheet name:', e);
    }
    
    // Prompt user for sheet name
    const sheetName = prompt('Enter a name for your Google Sheet:', lastSheetName);
    
    // If user cancels, don't proceed
    if (sheetName === null) {
      return;
    }
    
    // Sanitize sheet name: remove invalid characters and limit length
    // Google Sheets doesn't allow: < > : " / \ | ? *
    let sanitizedName = sheetName
      .replace(/[<>:"\/\\|?*]/g, '')  // Remove invalid characters
      .trim()                          // Remove leading/trailing whitespace
      .substring(0, 100);              // Limit to 100 characters
    
    // Use default if sanitized name is empty
    const finalSheetName = sanitizedName || 'Lab Results';
    
    // Save the sheet name for next time via background script
    try {
      await chrome.runtime.sendMessage({
        type: "SET_STORAGE",
        data: { lastSheetName: finalSheetName }
      });
    } catch (e) {
      console.warn('Failed to save sheet name:', e);
    }
    
    btn.disabled = true;
    btn.style.cursor = "wait";
    btn.style.opacity = "0.7";
    textSpan.textContent = "Exporting...";

    try {
      // Extract __RequestVerificationToken from page
      const verificationToken = findRequestVerificationToken();
      console.log("__RequestVerificationToken found:", verificationToken ? "yes" : "no");

      if (!verificationToken) {
        throw new Error("Could not find __RequestVerificationToken on page. Please refresh and try again.");
      }

      // Fetch lab list using correct API endpoint and request body
      console.log("Fetching lab list from GetList API...");
      const listRes = await fetch("/MHO/api/test-results/GetList", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "__RequestVerificationToken": verificationToken
        },
        body: JSON.stringify({
          groupType: 0,
          searchString: "",
          maxResults: 0,
          isCurAdmFilterEnabled: false
        })
      });

      if (!listRes.ok) {
        throw new Error(`GetList API failed: ${listRes.status} ${listRes.statusText}`);
      }

      // Check if response is JSON
      const contentType = listRes.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await listRes.text();
        console.error("GetList returned non-JSON response:", text.substring(0, 500));
        throw new Error("GetList API returned HTML instead of JSON. Please ensure you're logged in and on the Test Results page.");
      }

      const listJson = await listRes.json();
      console.log("Lab list fetched successfully");

      // Extract order keys from list
      const orderSummaries = extractOrderKeys(listJson);
      console.log(`Found ${orderSummaries.length} lab orders`);

      if (orderSummaries.length === 0) {
        throw new Error("No lab orders found in the response");
      }

      // Fetch details for each order and flatten to rows
      console.log("Fetching order details...");
      const allRows = [];
      
      for (let i = 0; i < orderSummaries.length; i++) {
        const summary = orderSummaries[i];
        console.log(`  Fetching ${i + 1}/${orderSummaries.length}: ${summary.orderName}...`);
        
        try {
          const detailJson = await fetchOrderDetails(summary.orderKey, verificationToken, i === 0);
          const rows = flattenOrderDetailsToRows(summary, detailJson);
          allRows.push(...rows);
          console.log(`    ✓ Extracted ${rows.length} component results`);
        } catch (err) {
          console.error(`    ❌ Failed to fetch details for ${summary.orderKey}:`, err);
          // Continue with other orders even if one fails
        }
      }

      console.log(`Total component results extracted: ${allRows.length}`);

      // Check if extension context is valid
      if (!chrome?.runtime?.id) {
        throw new Error('Extension context invalidated - please reload the page');
      }

      // Send flattened rows to background script for Google Sheets writing
      chrome.runtime.sendMessage(
        {
          type: "SH_EXPORT_ROWS",
          payload: { rows: allRows },
          sheetName: finalSheetName
        },
        (response) => {
          btn.disabled = false;
          btn.style.cursor = "pointer";
          btn.style.opacity = "1";
          
          if (response?.status === "ok") {
            textSpan.textContent = `✓ Exported ${response.rowCount} results!`;
            btn.style.background = "#10b981";
          } else {
            textSpan.textContent = "Export Failed";
            btn.style.background = "#ef4444";
            console.error("Export error:", response?.message);
          }
          
          // Reset button after 3 seconds
          setTimeout(() => {
            textSpan.textContent = "Export Labs";
            btn.style.background = "#1f2937";
          }, 3000);
        }
      );
    } catch (e) {
      console.error("Export error:", e);
      alert(e.message || 'Export failed - please try again');
      btn.disabled = false;
      btn.style.cursor = "pointer";
      btn.style.opacity = "1";
      textSpan.textContent = "Error — Try Again";
      btn.style.background = "#ef4444";
      
      setTimeout(() => {
        textSpan.textContent = "Export Labs";
        btn.style.background = "#1f2937";
      }, 3000);
    }
  };

  // Add button to container and container to page
  container.appendChild(btn);
  console.log("🔧 [DEBUG] Button added to container");
  
  // Verify body exists before appending
  if (!document.body) {
    console.error("🔧 [DEBUG] ERROR: document.body is null!");
    return;
  }
  
  document.documentElement.appendChild(container);
  console.log("🔧 [DEBUG] Container appended to document.documentElement");
  
  // Watch for style changes and aggressively re-enforce positioning
  const observer = new MutationObserver(() => {
    container.style.removeProperty('bottom');
    // Re-apply positioning with left: auto and right
    container.style.setProperty('left', 'auto', 'important');
    container.style.setProperty('top', '20px', 'important');
    container.style.setProperty('right', '20px', 'important');
  });
  observer.observe(container, { attributes: true, attributeFilter: ['style'], childList: false, subtree: false });
  console.log("🔧 [DEBUG] MutationObserver attached to watch for style changes");
  
  // Immediately force correct positioning
  container.style.removeProperty('bottom');
  container.style.setProperty('left', 'auto', 'important');
  container.style.setProperty('top', '20px', 'important');
  container.style.setProperty('right', '20px', 'important');

  // Use setInterval as backup since CSS rules don't trigger MutationObserver
  setInterval(() => {
    const computed = window.getComputedStyle(container);
    const expectedRight = 20;
    const actualRight = parseInt(computed.right);
    // Re-apply if right position is wrong (allow 5px tolerance)
    if (Math.abs(actualRight - expectedRight) > 5) {
      container.style.removeProperty('bottom');
      container.style.setProperty('left', 'auto', 'important');
      container.style.setProperty('top', '20px', 'important');
      container.style.setProperty('right', '20px', 'important');
    }
  }, 100); // Check every 100ms
  
  // Verify the container is in the DOM and check its computed styles
  setTimeout(() => {
    const insertedContainer = document.getElementById("sh-export-container");
    if (insertedContainer) {
      const computedStyles = window.getComputedStyle(insertedContainer);
      console.log("🔧 [DEBUG] Container found in DOM");
      console.log("🔧 [DEBUG] Computed position:", computedStyles.position);
      console.log("🔧 [DEBUG] Computed top:", computedStyles.top);
      console.log("🔧 [DEBUG] Computed right:", computedStyles.right);
      console.log("🔧 [DEBUG] Computed left:", computedStyles.left);
      console.log("🔧 [DEBUG] Computed z-index:", computedStyles.zIndex);
      console.log("🔧 [DEBUG] Inline styles:", insertedContainer.style.cssText);
    } else {
      console.error("🔧 [DEBUG] ERROR: Container not found in DOM after insertion!");
    }
  }, 100);
  
  console.log("✅ Sutter Health Export button injected");
}

/**
 * Find __RequestVerificationToken on the page
 * This token is required for Sutter Health API authentication
 */
function findRequestVerificationToken() {
  console.log("Searching for __RequestVerificationToken...");
  
  // Method 1: Check for meta tag
  let el = document.querySelector("meta[name='__RequestVerificationToken']");
  if (el && el.content) {
    console.log("✓ Found __RequestVerificationToken in meta tag");
    return el.content;
  }
  
  // Method 2: Check for hidden input field
  el = document.querySelector("input[name='__RequestVerificationToken']");
  if (el && el.value) {
    console.log("✓ Found __RequestVerificationToken in hidden input");
    return el.value;
  }
  
  // Method 3: Check cookies
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === '__RequestVerificationToken') {
      console.log("✓ Found __RequestVerificationToken in cookie");
      return decodeURIComponent(value);
    }
  }
  
  // Method 4: Check window object
  if (window.__RequestVerificationToken) {
    console.log("✓ Found __RequestVerificationToken in window object");
    return window.__RequestVerificationToken;
  }
  
  console.warn("✗ __RequestVerificationToken not found");
  return null;
}

/**
 * Extract orderKeys from Sutter Health GetList response
 * Note: resultList contains strings (order IDs), not objects
 * The actual lab data is in response.newResults[orderKey + '^']
 */
function extractOrderKeys(listJson) {
  const orderKeys = [];
  
  // Check for newResultGroups structure
  if (listJson?.newResultGroups && listJson?.newResults) {
    console.log(`Found ${listJson.newResultGroups.length} result groups`);
    
    for (const group of listJson.newResultGroups) {
      if (!group.resultList || !Array.isArray(group.resultList)) {
        continue;
      }
      
      // resultList contains strings (order IDs), not objects
      for (const orderKey of group.resultList) {
        // orderKey is a string like "WP-24q5la..."
        // The actual lab data is in newResults with key "orderKey^"
        const labDataKey = orderKey + '^';
        const labData = listJson.newResults[labDataKey];
        
        if (labData) {
          orderKeys.push({
            orderKey: orderKey,
            orderName: labData.orderName || "",
            displayDate: labData.displayDate || "",
            resultStatus: labData.resultStatus || ""
          });
        }
      }
    }
  }
  // Fallback: Check for direct resultList
  else if (listJson?.resultList && Array.isArray(listJson.resultList)) {
    for (const item of listJson.resultList) {
      // Handle both string and object formats
      if (typeof item === 'string') {
        orderKeys.push({
          orderKey: item,
          orderName: "",
          displayDate: "",
          resultStatus: ""
        });
      } else if (item?.orderKey) {
        orderKeys.push({
          orderKey: item.orderKey,
          orderName: item.orderName || "",
          displayDate: item.displayDate || "",
          resultStatus: item.resultStatus || ""
        });
      }
    }
  }
  // Fallback: Check for Results array
  else if (listJson?.Results && Array.isArray(listJson.Results)) {
    for (const result of listJson.Results) {
      if (result.orderKey || result.OrderKey) {
        orderKeys.push({
          orderKey: result.orderKey || result.OrderKey,
          orderName: result.orderName || result.OrderName || "",
          displayDate: result.displayDate || result.DisplayDate || "",
          resultStatus: result.resultStatus || result.ResultStatus || ""
        });
      }
    }
  }
  
  console.log(`Extracted ${orderKeys.length} order keys`);
  return orderKeys;
}

/**
 * Fetch details for a single order from Sutter Health
 */
async function fetchOrderDetails(orderKey, verificationToken, isFirstOrder = false) {
  const url = "/MHO/api/test-results/GetDetails";
  
  const response = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "__RequestVerificationToken": verificationToken
    },
    body: JSON.stringify({
      groupType: 0,
      searchString: "",
      maxResults: 0,
      isCurAdmFilterEnabled: false,
      orderKey: orderKey,
      organizationID: ""
    })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch order details for ${orderKey}: ${response.status}`);
  }
  
  // Check if response is JSON
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await response.text();
    console.error("GetDetails returned non-JSON response:", text.substring(0, 500));
    throw new Error(`GetDetails API returned HTML instead of JSON for order ${orderKey}`);
  }
  
  const details = await response.json();
  
  return details;
}

/**
 * Flatten a single order's details into rows for Google Sheets
 */
function flattenOrderDetailsToRows(orderSummary, detailJson) {
  const rows = [];
  
  // Check for lowercase 'results' (actual API response structure)
  if (!detailJson?.results) {
    console.warn(`No results found for order ${orderSummary.orderKey}`);
    return rows;
  }
  
  // Extract order-level metadata from detailJson
  const orderName = detailJson.orderName || orderSummary.orderName || "";
  
  // Process each result in the results array
  for (const result of detailJson.results) {
    if (!result.resultComponents || !Array.isArray(result.resultComponents)) {
      continue;
    }
    
    // Extract result-level metadata
    const orderMetadata = result.orderMetadata || {};
    const orderProviderName = orderMetadata.orderProviderName || "";
    const resultTimestampDisplay = orderMetadata.resultTimestampDisplay || "";
    const prioritizedInstantISO = orderMetadata.prioritizedInstant || "";
    const prioritizedInstantDisplay = orderMetadata.prioritizedInstantDisplay || "";
    const collectionTimestampsDisplay = orderMetadata.collectionTimestampsDisplay || "";
    const resultingLabName = orderMetadata.resultingLabName || "";
    const resultStatus = orderMetadata.resultStatus || orderSummary.resultStatus || "";
    
    // Process each component in resultComponents
    for (const component of result.resultComponents) {
      const componentInfo = component.componentInfo || {};
      const componentResultInfo = component.componentResultInfo || {};
      const referenceRange = componentResultInfo.referenceRange || {};
      
      rows.push([
        orderSummary.orderKey,
        orderName,
        orderSummary.displayDate,
        resultStatus,
        componentInfo.componentID || "",
        componentInfo.name || "",
        componentInfo.commonName || "",
        componentInfo.loincCode || "",
        componentResultInfo.value || "",
        componentResultInfo.numericValue || "",
        componentInfo.units || "",
        referenceRange.formattedReferenceRange || "",
        referenceRange.displayLow || "",
        referenceRange.displayHigh || "",
        componentResultInfo.abnormalFlagCategoryValue || "",
        orderProviderName,
        resultTimestampDisplay,
        prioritizedInstantISO,
        prioritizedInstantDisplay,
        collectionTimestampsDisplay,
        resultingLabName
      ]);
    }
  }
  
  return rows;
}

// Wait for page load and inject appropriate button
console.log("🔧 [DEBUG] Content script loaded");
console.log("🔧 [DEBUG] isFunctionHealth:", isFunctionHealth);
console.log("🔧 [DEBUG] isSutterHealth:", isSutterHealth);
console.log("🔧 [DEBUG] document.readyState:", document.readyState);

if (document.readyState === "loading") {
  console.log("🔧 [DEBUG] Document still loading, waiting for DOMContentLoaded");
  document.addEventListener("DOMContentLoaded", () => {
    console.log("🔧 [DEBUG] DOMContentLoaded fired, waiting 2 seconds before injection");
    setTimeout(() => {
      if (isFunctionHealth) {
        console.log("🔧 [DEBUG] Calling injectFunctionHealthButton()");
        injectFunctionHealthButton();
      } else if (isSutterHealth) {
        console.log("🔧 [DEBUG] Calling injectSutterHealthButton()");
        injectSutterHealthButton();
      }
    }, 2000);
  });
} else {
  console.log("🔧 [DEBUG] Document already loaded, waiting 2 seconds before injection");
  setTimeout(() => {
    if (isFunctionHealth) {
      console.log("🔧 [DEBUG] Calling injectFunctionHealthButton()");
      injectFunctionHealthButton();
    } else if (isSutterHealth) {
      console.log("🔧 [DEBUG] Calling injectSutterHealthButton()");
      injectSutterHealthButton();
    }
  }, 2000);
}