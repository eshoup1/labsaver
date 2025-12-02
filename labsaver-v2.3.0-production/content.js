/**
 * LabSaver - Content Script
 * Injects export button and handles data fetching from lab provider APIs
 */

// Export state management
let fhExportState = null; // { rowCount: number, sheetUrl: string }
let shExportState = null; // { rowCount: number, sheetUrl: string }

// Detect which site we're on
const isFunctionHealth = window.location.hostname === "my.functionhealth.com";
const isSutterHealth = window.location.hostname === "myhealthonline.sutterhealth.org";

/**
 * Check if user is authenticated on Function Health
 * Returns true only if we can confirm user is actually logged in
 */
function isUserAuthenticated() {
  console.log('🔍 Starting authentication check...');
  console.log('  Current URL:', window.location.href);
  console.log('  Current pathname:', window.location.pathname);
  
  // Method 1: Check for authenticated user content FIRST
  // Function Health shows specific elements only when logged in
  const authenticatedIndicators = [
    document.querySelector('[data-testid="user-menu"]'),
    document.querySelector('[aria-label*="user menu" i]'),
    document.querySelector('[class*="UserMenu"]'),
    document.querySelector('button[aria-label*="account" i]'),
    document.querySelector('nav[aria-label*="main" i]'),
    document.querySelector('[data-testid="navigation"]'),
    document.querySelector('a[href*="/labs"]'), // Labs link only shows when logged in
    document.querySelector('a[href*="/results"]'), // Results link only shows when logged in
  ];
  
  const hasAuthenticatedContent = authenticatedIndicators.some(el => el !== null);
  if (hasAuthenticatedContent) {
    console.log('✅ Found authenticated user interface elements - user is logged in');
    return true;
  }
  
  // Method 2: Check if we're specifically on the login page
  // Only consider it a login page if we have BOTH the URL pattern AND login form elements
  const isLoginURL = window.location.pathname === '/login' ||
                     window.location.pathname === '/signin' ||
                     window.location.pathname === '/auth/login';
  
  const hasLoginForm = document.querySelector('form[action*="login"]') !== null ||
                      document.querySelector('input[name="email"][type="email"]') !== null ||
                      (document.querySelector('input[type="password"]') !== null &&
                       document.querySelector('button[type="submit"]') !== null &&
                       document.title.toLowerCase().includes('log in'));
  
  if (isLoginURL || (hasLoginForm && document.querySelectorAll('input').length <= 5)) {
    console.log('❌ On login page - user is logged out');
    return false;
  }
  
  // Method 3: Check for auth token in localStorage
  const authKeys = [
    'accessToken',
    'access_token',
    'authToken',
    'auth_token',
    'fh_token',
    'functionhealth_token',
    'jwt',
    'id_token'
  ];
  
  for (const key of authKeys) {
    const value = localStorage.getItem(key);
    if (value && value.length > 20) {
      console.log(`✅ Found auth token in localStorage: ${key}`);
      return true;
    }
  }
  
  // Method 4: Check for user data in localStorage
  const userKeys = ['user', 'userData', 'currentUser', 'userInfo'];
  for (const key of userKeys) {
    const value = localStorage.getItem(key);
    if (value && value.length > 10) {
      try {
        const parsed = JSON.parse(value);
        if (parsed && (parsed.id || parsed.email || parsed.userId)) {
          console.log(`✅ Found user data in localStorage: ${key}`);
          return true;
        }
      } catch (e) {
        // Not JSON, skip
      }
    }
  }
  
  // Method 5: Check for specific auth cookies
  const cookies = document.cookie;
  const specificAuthPatterns = [
    'auth_token=',
    'access_token=',
    'jwt=',
    'fh_session=',
    'functionhealth_session='
  ];
  
  for (const pattern of specificAuthPatterns) {
    if (cookies.includes(pattern)) {
      console.log(`✅ Found specific auth cookie: ${pattern}`);
      return true;
    }
  }
  
  console.log('❌ No authentication indicators found - user appears logged out');
  return false;
}

/**
 * Update Function Health button state after export
 */
function updateFHButtonState(exportButton, state) {
  if (!state) return;
  
  fhExportState = state;
  exportButton.textContent = `✓ Exported ${state.rowCount} results! Click to view →`;
  exportButton.style.backgroundColor = '#10b981';
  exportButton.style.cursor = 'pointer';
  exportButton.style.whiteSpace = 'nowrap';
  exportButton.style.padding = '10px 20px';
  exportButton.style.width = 'auto';
  exportButton.onclick = () => {
    if (state.sheetUrl) {
      window.open(state.sheetUrl, '_blank');
    }
  };
}

/**
 * Update Sutter Health button state after export
 */
function updateSHButtonState(exportButton, state) {
  if (!state) return;
  
  shExportState = state;
  exportButton.textContent = `✓ Exported ${state.rowCount} results! Click to view →`;
  exportButton.style.backgroundColor = '#10b981';
  exportButton.style.cursor = 'pointer';
  exportButton.style.whiteSpace = 'nowrap';
  exportButton.style.padding = '10px 20px';
  exportButton.style.width = 'auto';
  exportButton.onclick = () => {
    if (state.sheetUrl) {
      window.open(state.sheetUrl, '_blank');
    }
  };
}

function injectFunctionHealthButton() {
  // Check if extension context is valid
  if (!chrome?.runtime?.id) {
    console.warn('Extension context invalidated - please reload the page');
    return;
  }
  
  // Prevent duplicate buttons
  if (document.getElementById("fh-export-btn")) return;

  // Check if user is logged in
  console.log('Checking authentication status...');
  const isAuth = isUserAuthenticated();
  console.log(`Authentication check result: ${isAuth}`);

  if (!isAuth) {
    console.log('User not logged in - skipping button injection');
    return;
  }
  console.log('User is logged in - proceeding with button injection');

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

      // Always show the choice modal - let user decide where to export
      console.log("Showing export choice modal...");
      showExportChoiceModal(data, 'Lab Results', "FH");
      
      // Reset button state
      btn.disabled = false;
      btn.style.cursor = "pointer";
      btn.style.opacity = "1";
      textSpan.textContent = "Export Labs";
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
  
  // Use comprehensive approach with !important flags to override Sutter Health's CSS
  container.style.setProperty('position', 'fixed', 'important');
  container.style.setProperty('top', '20px', 'important');
  container.style.setProperty('right', '20px', 'important');
  container.style.setProperty('left', 'auto', 'important');
  container.style.setProperty('transform', 'translateX(0)', 'important');
  container.style.setProperty('margin-left', 'auto', 'important');
  container.style.setProperty('width', 'fit-content', 'important');
  container.style.setProperty('z-index', '99999', 'important');
  container.style.setProperty('display', 'flex', 'important');
  container.style.setProperty('flex-direction', 'column', 'important');
  container.style.setProperty('gap', '10px', 'important');
  
  console.log("🔧 [DEBUG] Container styles applied via Object.assign");

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

      // Always show the choice modal - let user decide where to export
      console.log("Showing export choice modal...");
      showExportChoiceModal(allRows, 'Lab Results', "SH");
      
      // Reset button state
      btn.disabled = false;
      btn.style.cursor = "pointer";
      btn.style.opacity = "1";
      textSpan.textContent = "Export Labs";
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

/**
 * -----------------------------------------------------------------
 * EXPORT CHOICE MODAL IMPLEMENTATION
 * -----------------------------------------------------------------
 */

let setupState = {
  oauthToken: null,
  exportData: null,
  sheetName: null,
  exportType: null, // 'FH' or 'SH'
  existingSpreadsheetId: null,
  existingSpreadsheetName: null
};

/**
 * Show the choice modal - always shown on export, not just first time.
 * Allows user to choose between existing spreadsheet or creating new one.
 */
function showExportChoiceModal(exportData, sheetName, exportType) {
  setupState.exportData = exportData;
  setupState.sheetName = sheetName;
  setupState.exportType = exportType;

  // Get existing spreadsheet info
  chrome.storage.sync.get(['spreadsheetId', 'spreadsheetName'], (result) => {
    setupState.existingSpreadsheetId = result.spreadsheetId || null;
    setupState.existingSpreadsheetName = result.spreadsheetName || null;

    // Create and inject the modal UI
    createExportChoiceModalUI();
  });
}

/**
 * Create and inject the export choice modal overlay and content.
 * Shows radio buttons to choose between existing or new spreadsheet.
 */
function createExportChoiceModalUI() {
  // Remove existing modal if any
  const existingModal = document.getElementById('labsaver-export-modal');
  if (existingModal) {
    existingModal.remove();
  }

  const hasExisting = setupState.existingSpreadsheetId && setupState.existingSpreadsheetName;
  const displayName = setupState.existingSpreadsheetName || 'My Lab Results';

  const modal = document.createElement('div');
  modal.id = 'labsaver-export-modal';
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0, 0, 0, 0.6); z-index: 10000; display: flex;
    align-items: center; justify-content: center;
  `;

  // Build the modal content based on whether there's an existing spreadsheet
  const iconUrl = chrome.runtime.getURL('icons/icon48.png');
  let modalContent = `
    <div style="background: white; width: 90%; max-width: 500px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); font-family: system-ui, sans-serif; display: flex; flex-direction: column;">
      <div style="padding: 24px; border-bottom: 1px solid #e5e7eb;">
        <h2 style="margin: 0 0 8px 0; font-size: 22px; color: #1f2937; font-weight: 600; display: flex; align-items: center; gap: 8px;">
          <img src="${iconUrl}" style="width: 24px; height: 24px;" alt="LabSaver">
          Export Labs
        </h2>
        <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">Choose where to export your data:</p>
      </div>
      <div style="padding: 24px;">
  `;

  if (hasExisting) {
    // Show both options when there's an existing spreadsheet
    modalContent += `
        <label style="display: flex; align-items: flex-start; padding: 16px; border: 2px solid #e5e7eb; border-radius: 8px; cursor: pointer; margin: 0 0 12px 0; transition: all 0.2s; width: 100%; box-sizing: border-box;" id="use-existing-option">
          <input type="radio" name="export-choice" value="existing" checked style="margin-top: 2px; margin-right: 12px; width: 18px; height: 18px; cursor: pointer; accent-color: #10b981;">
          <div style="flex: 1;">
            <div style="font-weight: 600; color: #1f2937; font-size: 15px; margin-bottom: 4px;">Use existing spreadsheet</div>
            <div style="color: #6b7280; font-size: 14px;">"${displayName}"</div>
          </div>
        </label>
        
        <label style="display: flex; align-items: flex-start; padding: 16px; border: 2px solid #e5e7eb; border-radius: 8px; cursor: pointer; margin: 0; transition: all 0.2s; width: 100%; box-sizing: border-box;" id="create-new-option">
          <input type="radio" name="export-choice" value="new" style="margin-top: 2px; margin-right: 12px; width: 18px; height: 18px; cursor: pointer; accent-color: #10b981;">
          <div style="flex: 1;">
            <div style="font-weight: 600; color: #1f2937; font-size: 15px; margin-bottom: 8px;">Create new spreadsheet</div>
            <input
              type="text"
              id="new-spreadsheet-name"
              value="My Lab Results"
              placeholder="Enter name..."
              disabled
              style="width: 100%; padding: 8px 10px; border: 2px solid #e5e7eb; border-radius: 6px; font-size: 14px; font-family: system-ui, sans-serif; box-sizing: border-box; transition: border-color 0.2s; background: #f9fafb;"
            />
          </div>
        </label>
    `;
  } else {
    // First time - only show create new option (simplified without green background)
    modalContent += `
        <div style="margin-bottom: 12px;">
          <input
            type="text"
            id="new-spreadsheet-name"
            value="My Lab Results"
            placeholder="Enter spreadsheet name..."
            style="width: 100%; padding: 10px 12px; border: 2px solid #e5e7eb; border-radius: 6px; font-size: 14px; font-family: system-ui, sans-serif; box-sizing: border-box; transition: border-color 0.2s;"
          />
        </div>
    `;
  }

  modalContent += `
        <div id="export-status" style="margin-top: 12px; padding: 10px; border-radius: 6px; display: none;"></div>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e5e7eb; display: flex; gap: 10px; justify-content: flex-end;">
        <button id="export-cancel-btn" style="background: #f3f4f6; color: #374151; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; transition: background 0.2s;">Cancel</button>
        <button id="export-confirm-btn" style="background: #374151; color: white; border: none; padding: 10px 24px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; transition: background 0.2s;">Export</button>
      </div>
    </div>
  `;

  modal.innerHTML = modalContent;
  document.body.appendChild(modal);

  // Get elements
  const newNameInput = modal.querySelector('#new-spreadsheet-name');
  const confirmBtn = modal.querySelector('#export-confirm-btn');
  const cancelBtn = modal.querySelector('#export-cancel-btn');
  const useExistingOption = modal.querySelector('#use-existing-option');
  const createNewOption = modal.querySelector('#create-new-option');
  const existingRadio = modal.querySelector('input[value="existing"]');
  const newRadio = modal.querySelector('input[value="new"]');

  // Setup radio button interactions (only if both options exist)
  if (hasExisting && existingRadio && newRadio) {
    const updateSelection = () => {
      if (existingRadio.checked) {
        useExistingOption.style.borderColor = '#10b981';
        useExistingOption.style.background = 'white';
        createNewOption.style.borderColor = '#e5e7eb';
        createNewOption.style.background = 'white';
        newNameInput.disabled = true;
        newNameInput.style.background = '#f9fafb';
        newNameInput.style.borderColor = '#e5e7eb';
      } else {
        useExistingOption.style.borderColor = '#e5e7eb';
        useExistingOption.style.background = 'white';
        createNewOption.style.borderColor = '#10b981';
        createNewOption.style.background = 'white';
        newNameInput.disabled = false;
        newNameInput.style.background = 'white';
        newNameInput.style.borderColor = '#10b981';
        setTimeout(() => {
          newNameInput.focus();
          newNameInput.select();
        }, 100);
      }
    };

    existingRadio.addEventListener('change', updateSelection);
    newRadio.addEventListener('change', updateSelection);
    
    // Make the entire label clickable
    useExistingOption.addEventListener('click', (e) => {
      if (e.target !== existingRadio) {
        existingRadio.checked = true;
        updateSelection();
      }
    });
    
    createNewOption.addEventListener('click', (e) => {
      if (e.target !== newRadio && e.target !== newNameInput) {
        newRadio.checked = true;
        updateSelection();
      }
    });

    // Initial state
    updateSelection();
  } else {
    // First time - focus the input
    setTimeout(() => {
      newNameInput.focus();
      newNameInput.select();
    }, 100);
  }

  // Add hover effects
  confirmBtn.addEventListener('mouseenter', () => {
    confirmBtn.style.background = '#4b5563';
  });
  confirmBtn.addEventListener('mouseleave', () => {
    if (!confirmBtn.disabled) {
      confirmBtn.style.background = '#374151';
    }
  });

  cancelBtn.addEventListener('mouseenter', () => {
    cancelBtn.style.background = '#e5e7eb';
  });
  cancelBtn.addEventListener('mouseleave', () => {
    cancelBtn.style.background = '#f3f4f6';
  });

  // Handle input styling on focus
  newNameInput.addEventListener('focus', () => {
    if (!newNameInput.disabled) {
      newNameInput.style.borderColor = '#374151';
    }
  });
  newNameInput.addEventListener('blur', () => {
    if (!newNameInput.disabled) {
      newNameInput.style.borderColor = '#e5e7eb';
    }
  });

  // Handle confirm button click
  confirmBtn.addEventListener('click', () => {
    if (hasExisting && existingRadio && existingRadio.checked) {
      handleUseExistingSpreadsheet();
    } else {
      handleCreateNewSpreadsheet(newNameInput.value.trim());
    }
  });

  // Handle Enter key in input
  newNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !newNameInput.disabled) {
      handleCreateNewSpreadsheet(newNameInput.value.trim());
    }
  });

  // Handle cancel
  cancelBtn.addEventListener('click', closeExportModal);

  // Close if clicking the backdrop
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeExportModal();
    }
  });
}

/**
 * Handle using the existing spreadsheet.
 */
async function handleUseExistingSpreadsheet() {
  const confirmBtn = document.getElementById('export-confirm-btn');
  const cancelBtn = document.getElementById('export-cancel-btn');
  const statusEl = document.getElementById('export-status');

  // Disable inputs during export
  confirmBtn.disabled = true;
  cancelBtn.disabled = true;
  confirmBtn.textContent = 'Exporting...';
  confirmBtn.style.background = '#6b7280';
  confirmBtn.style.cursor = 'wait';

  try {
    showExportStatus('Exporting to existing spreadsheet...', 'info');

    // Close modal
    closeExportModal();

    // Update main button to show "Exporting..." status
    const exportButton = document.getElementById(setupState.exportType === 'FH' ? 'fh-export-btn' : 'sh-export-btn');
    if (exportButton) {
      const textSpan = exportButton.querySelector('span');
      if (textSpan) textSpan.textContent = 'Exporting...';
    }

    // Trigger the export with the existing spreadsheet
    await performExport(setupState.existingSpreadsheetId);

  } catch (error) {
    console.error('Error exporting:', error);
    showExportStatus(`Error: ${error.message}`, 'error');
    
    // Re-enable inputs
    confirmBtn.disabled = false;
    cancelBtn.disabled = false;
    confirmBtn.textContent = 'Export';
    confirmBtn.style.background = '#374151';
    confirmBtn.style.cursor = 'pointer';
  }
}

/**
 * Handle creating a new spreadsheet with user-provided name.
 */
async function handleCreateNewSpreadsheet(name) {
  const confirmBtn = document.getElementById('export-confirm-btn');
  const cancelBtn = document.getElementById('export-cancel-btn');
  const input = document.getElementById('new-spreadsheet-name');
  const statusEl = document.getElementById('export-status');

  // Validate name
  if (!name || name.length === 0) {
    showExportStatus('Please enter a spreadsheet name', 'error');
    input.focus();
    return;
  }

  // Disable inputs during creation
  confirmBtn.disabled = true;
  cancelBtn.disabled = true;
  if (input) input.disabled = true;
  confirmBtn.textContent = 'Creating...';
  confirmBtn.style.background = '#6b7280';
  confirmBtn.style.cursor = 'wait';

  try {
    // Get OAuth token
    if (!setupState.oauthToken) {
      const response = await chrome.runtime.sendMessage({ type: "GET_AUTH_TOKEN" });
      if (!response.success) throw new Error(response.error || 'Failed to get auth token');
      setupState.oauthToken = response.token;
    }

    showExportStatus('Creating your spreadsheet...', 'info');

    // Create the spreadsheet
    const sheet = await createNewSpreadsheet(setupState.oauthToken, name);
    
    showExportStatus('Saving spreadsheet...', 'success');

    // Save the spreadsheet ID and name
    await new Promise((resolve, reject) => {
      chrome.storage.sync.set({
        spreadsheetId: sheet.spreadsheetId,
        spreadsheetName: name
      }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });

    console.log('✓ Spreadsheet created and ID saved:', sheet.spreadsheetId);
    
    showExportStatus('Exporting your data...', 'success');

    // Close modal
    closeExportModal();

    // Update main button to show "Exporting..." status
    const exportButton = document.getElementById(setupState.exportType === 'FH' ? 'fh-export-btn' : 'sh-export-btn');
    if (exportButton) {
      const textSpan = exportButton.querySelector('span');
      if (textSpan) textSpan.textContent = 'Exporting...';
    }

    // Trigger the export with the new spreadsheet
    await performExport(sheet.spreadsheetId);

  } catch (error) {
    console.error('Error creating spreadsheet:', error);
    showExportStatus(`Error: ${error.message}`, 'error');
    
    // Re-enable inputs
    confirmBtn.disabled = false;
    cancelBtn.disabled = false;
    if (input) input.disabled = false;
    confirmBtn.textContent = 'Export';
    confirmBtn.style.background = '#374151';
    confirmBtn.style.cursor = 'pointer';
  }
}

/**
 * Perform the export after spreadsheet is created/selected.
 */
async function performExport(spreadsheetId) {
  const messageType = setupState.exportType === 'FH' ? "FH_EXPORT_DATA" : "SH_EXPORT_ROWS";
  
  const message = {
    type: messageType,
    sheetName: setupState.sheetName
  };
  
  if (setupState.exportType === 'FH') {
    message.payload = setupState.exportData;
  } else {
    message.payload = { rows: setupState.exportData };
  }

  chrome.runtime.sendMessage(message, (finalResponse) => {
    const exportButton = document.getElementById(setupState.exportType === 'FH' ? 'fh-export-btn' : 'sh-export-btn');
    if (!exportButton) return;
    
    const textSpan = exportButton.querySelector('span');
    
    // Handle spreadsheet deleted/invalid error - clear saved ID and show modal again
    if (finalResponse?.status === "error" &&
        (finalResponse?.message?.includes('404') ||
         finalResponse?.message?.includes('not found') ||
         finalResponse?.message?.includes('deleted'))) {
      console.log("Spreadsheet no longer exists during export - clearing saved ID...");
      
      // Clear the invalid spreadsheet ID and name
      chrome.storage.sync.remove(['spreadsheetId', 'spreadsheetName'], () => {
        // Show the choice modal again (will only show "create new" option)
        showExportChoiceModal(setupState.exportData, setupState.sheetName, setupState.exportType);
      });
      
      // Reset button
      if (textSpan) textSpan.textContent = "Export Labs";
      exportButton.style.background = "#1f2937";
      exportButton.disabled = false;
      exportButton.style.cursor = "pointer";
      exportButton.style.opacity = "1";
      
      alert("The saved spreadsheet no longer exists. Please choose a new spreadsheet.");
      return;
    }
    
    // Handle successful export
    if (finalResponse?.status === "ok") {
      const sheetUrl = `https://docs.google.com/spreadsheets/d/${finalResponse.spreadsheetId}/edit`;
      const state = { rowCount: finalResponse.rowCount, sheetUrl: sheetUrl };
      if (setupState.exportType === 'FH') {
        updateFHButtonState(exportButton, state);
      } else {
        updateSHButtonState(exportButton, state);
      }
    } else {
      // Handle other errors
      if (textSpan) textSpan.textContent = "Export Failed";
      exportButton.style.background = "#ef4444";
      console.error("Export error:", finalResponse?.message);
      
      // Reset after 3 seconds
      setTimeout(() => {
        if (textSpan) textSpan.textContent = "Export Labs";
        exportButton.style.background = "#1f2937";
      }, 3000);
    }
  });
}

/**
 * Show status message in the export modal.
 */
function showExportStatus(message, type = 'info') {
  const statusEl = document.getElementById('export-status');
  if (!statusEl) return;
  
  const colors = {
    info: { bg: '#dbeafe', text: '#1e40af' },
    error: { bg: '#fee2e2', text: '#991b1b' },
    success: { bg: '#d1fae5', text: '#065f46' }
  };
  
  statusEl.textContent = message;
  statusEl.style.background = colors[type].bg;
  statusEl.style.color = colors[type].text;
  statusEl.style.display = 'block';
}

/**
 * Close and remove the export modal.
 */
function closeExportModal() {
  const modal = document.getElementById('labsaver-export-modal');
  if (modal) {
    modal.remove();
  }
}

/**
 * Create a new Google Sheet with the specified title using Drive API.
 * Uses drive.file scope for minimal permissions.
 */
async function createNewSpreadsheet(token, title = 'My Lab Results') {
  const response = await fetch(`https://www.googleapis.com/drive/v3/files`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: title,
      mimeType: 'application/vnd.google-apps.spreadsheet'
    })
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create spreadsheet: ${response.status} ${errorText}`);
  }
  const data = await response.json();
  // Return in the same format as Sheets API for compatibility
  return { spreadsheetId: data.id };
}

/**
 * Setup navigation detection for Function Health SPA
 * Detects URL changes and re-injects button after login
 */
function setupNavigationDetection() {
  if (!isFunctionHealth) return;
  
  let lastUrl = window.location.href;
  console.log('🔍 Setting up navigation detection for Function Health SPA');
  
  // Check for URL changes every 500ms
  const urlCheckInterval = setInterval(() => {
    const currentUrl = window.location.href;
    
    if (currentUrl !== lastUrl) {
      console.log('🔄 URL changed from', lastUrl, 'to', currentUrl);
      lastUrl = currentUrl;
      
      // Wait a moment for the page to render, then check auth and inject button
      setTimeout(() => {
        console.log('🔍 Re-checking authentication after navigation...');
        injectFunctionHealthButton();
      }, 1000);
    }
  }, 500);
  
  // Also listen for popstate events (back/forward navigation)
  window.addEventListener('popstate', () => {
    console.log('🔄 Popstate event detected');
    setTimeout(() => {
      console.log('🔍 Re-checking authentication after popstate...');
      injectFunctionHealthButton();
    }, 1000);
  });
  
  // Store interval ID for potential cleanup
  window.__fhNavDetectionInterval = urlCheckInterval;
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
        // Setup navigation detection for SPA
        setupNavigationDetection();
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
      // Setup navigation detection for SPA
      setupNavigationDetection();
    } else if (isSutterHealth) {
      console.log("🔧 [DEBUG] Calling injectSutterHealthButton()");
      injectSutterHealthButton();
    }
  }, 2000);
}