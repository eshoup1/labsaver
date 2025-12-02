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

      // Send data to background script for processing
      chrome.runtime.sendMessage(
        { type: "FH_EXPORT_DATA", payload: data, sheetName: 'Lab Results' },
        async (response) => {
          // Check if spreadsheet ID is not set - show naming modal for first-time setup
          if (response?.status === "error" && response?.message?.includes('spreadsheet')) {
            console.log("No spreadsheet configured - showing naming modal for first-time setup...");
            
            // Show naming modal for first-time setup
            showNamingModal(data, 'Lab Results', "FH");
            
            // Reset button state
            btn.disabled = false;
            btn.style.cursor = "pointer";
            btn.style.opacity = "1";
            textSpan.textContent = "Export Labs";
            return;
          }
          
          // Check if spreadsheet was deleted/invalid - clear and show naming modal
          if (response?.status === "error" && (response?.message?.includes('404') || response?.message?.includes('not found') || response?.message?.includes('deleted'))) {
            console.log("Spreadsheet no longer exists - clearing saved ID and showing naming modal...");
            
            // Clear the invalid spreadsheet ID
            chrome.storage.sync.remove('spreadsheetId', () => {
              // Show naming modal to create a new one
              showNamingModal(data, 'Lab Results', "FH");
            });
            
            // Reset button state
            btn.disabled = false;
            btn.style.cursor = "pointer";
            btn.style.opacity = "1";
            textSpan.textContent = "Export Labs";
            return;
          }
          
          // Handle successful export
          btn.disabled = false;
          btn.style.cursor = "pointer";
          btn.style.opacity = "1";
          
          if (response?.status === "ok") {
            const sheetUrl = `https://docs.google.com/spreadsheets/d/${response.spreadsheetId}/edit`;
            const state = {
              rowCount: response.rowCount,
              sheetUrl: sheetUrl
            };
            updateFHButtonState(btn, state);
          } else {
            textSpan.textContent = "Export Failed";
            btn.style.background = "#ef4444";
            console.error("Export error:", response?.message);
          }
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

      // Send flattened rows to background script for Google Sheets writing
      chrome.runtime.sendMessage(
        {
          type: "SH_EXPORT_ROWS",
          payload: { rows: allRows },
          sheetName: 'Lab Results'
        },
        async (response) => {
          // Check if spreadsheet ID is not set - show naming modal for first-time setup
          if (response?.status === "error" && response?.message?.includes('spreadsheet')) {
            console.log("No spreadsheet configured - showing naming modal for first-time setup...");
            
            // Show naming modal for first-time setup
            showNamingModal(allRows, 'Lab Results', "SH");
            
            // Reset button state
            btn.disabled = false;
            btn.style.cursor = "pointer";
            btn.style.opacity = "1";
            textSpan.textContent = "Export Labs";
            return;
          }
          
          // Check if spreadsheet was deleted/invalid - clear and show naming modal
          if (response?.status === "error" && (response?.message?.includes('404') || response?.message?.includes('not found') || response?.message?.includes('deleted'))) {
            console.log("Spreadsheet no longer exists - clearing saved ID and showing naming modal...");
            
            // Clear the invalid spreadsheet ID
            chrome.storage.sync.remove('spreadsheetId', () => {
              // Show naming modal to create a new one
              showNamingModal(allRows, 'Lab Results', "SH");
            });
            
            // Reset button state
            btn.disabled = false;
            btn.style.cursor = "pointer";
            btn.style.opacity = "1";
            textSpan.textContent = "Export Labs";
            return;
          }
          
          // Handle successful export
          btn.disabled = false;
          btn.style.cursor = "pointer";
          btn.style.opacity = "1";
          
          if (response?.status === "ok") {
            const sheetUrl = `https://docs.google.com/spreadsheets/d/${response.spreadsheetId}/edit`;
            const state = {
              rowCount: response.rowCount,
              sheetUrl: sheetUrl
            };
            updateSHButtonState(btn, state);
          } else {
            textSpan.textContent = "Export Failed";
            btn.style.background = "#ef4444";
            console.error("Export error:", response?.message);
          }
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
 * FIRST-TIME SETUP MODAL IMPLEMENTATION
 * -----------------------------------------------------------------
 */

let setupState = {
  oauthToken: null,
  exportData: null,
  sheetName: null,
  exportType: null // 'FH' or 'SH'
};

/**
 * Show the naming modal for first-time setup.
 */
function showNamingModal(exportData, sheetName, exportType) {
  setupState.exportData = exportData;
  setupState.sheetName = sheetName;
  setupState.exportType = exportType;

  // Create and inject the modal UI
  createNamingModalUI();
}

/**
 * Create and inject the naming modal overlay and content.
 */
function createNamingModalUI() {
  // Remove existing modal if any
  const existingModal = document.getElementById('labsaver-naming-modal');
  if (existingModal) {
    existingModal.remove();
  }

  const modal = document.createElement('div');
  modal.id = 'labsaver-naming-modal';
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0, 0, 0, 0.6); z-index: 10000; display: flex;
    align-items: center; justify-content: center;
  `;

  modal.innerHTML = `
    <div style="background: white; width: 90%; max-width: 500px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); font-family: system-ui, sans-serif; display: flex; flex-direction: column;">
      <div style="padding: 24px; border-bottom: 1px solid #e5e7eb;">
        <h2 style="margin: 0 0 8px 0; font-size: 22px; color: #1f2937; font-weight: 600;">Welcome to LabSaver! 🎉</h2>
        <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">What would you like to name your lab results spreadsheet?</p>
      </div>
      <div style="padding: 24px;">
        <label style="display: block; margin-bottom: 8px; color: #374151; font-size: 14px; font-weight: 500;">Spreadsheet Name</label>
        <input
          type="text"
          id="spreadsheet-name-input"
          value="My Lab Results"
          placeholder="Enter spreadsheet name"
          style="width: 100%; padding: 10px 12px; border: 2px solid #e5e7eb; border-radius: 6px; font-size: 14px; font-family: system-ui, sans-serif; box-sizing: border-box; transition: border-color 0.2s;"
        />
        <div id="naming-status" style="margin-top: 12px; padding: 10px; border-radius: 6px; display: none;"></div>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e5e7eb; display: flex; gap: 10px; justify-content: flex-end;">
        <button id="naming-cancel-btn" style="background: #f3f4f6; color: #374151; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; transition: background 0.2s;">Cancel</button>
        <button id="naming-create-btn" style="background: #10b981; color: white; border: none; padding: 10px 24px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; transition: background 0.2s;">Create Spreadsheet</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Get elements
  const input = modal.querySelector('#spreadsheet-name-input');
  const createBtn = modal.querySelector('#naming-create-btn');
  const cancelBtn = modal.querySelector('#naming-cancel-btn');

  // Focus and select the input
  setTimeout(() => {
    input.focus();
    input.select();
  }, 100);

  // Add hover effects
  createBtn.addEventListener('mouseenter', () => {
    createBtn.style.background = '#059669';
  });
  createBtn.addEventListener('mouseleave', () => {
    if (!createBtn.disabled) {
      createBtn.style.background = '#10b981';
    }
  });

  cancelBtn.addEventListener('mouseenter', () => {
    cancelBtn.style.background = '#e5e7eb';
  });
  cancelBtn.addEventListener('mouseleave', () => {
    cancelBtn.style.background = '#f3f4f6';
  });

  // Handle input styling on focus
  input.addEventListener('focus', () => {
    input.style.borderColor = '#10b981';
  });
  input.addEventListener('blur', () => {
    input.style.borderColor = '#e5e7eb';
  });

  // Handle create button click
  createBtn.addEventListener('click', () => handleCreateSpreadsheet(input.value.trim()));

  // Handle Enter key in input
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleCreateSpreadsheet(input.value.trim());
    }
  });

  // Handle cancel
  cancelBtn.addEventListener('click', closeNamingModal);

  // Close if clicking the backdrop
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeNamingModal();
    }
  });
}

/**
 * Handle spreadsheet creation with user-provided name.
 */
async function handleCreateSpreadsheet(name) {
  const createBtn = document.getElementById('naming-create-btn');
  const cancelBtn = document.getElementById('naming-cancel-btn');
  const input = document.getElementById('spreadsheet-name-input');
  const statusEl = document.getElementById('naming-status');

  // Validate name
  if (!name || name.length === 0) {
    showNamingStatus('Please enter a spreadsheet name', 'error');
    input.focus();
    return;
  }

  // Disable inputs during creation
  createBtn.disabled = true;
  cancelBtn.disabled = true;
  input.disabled = true;
  createBtn.textContent = 'Creating...';
  createBtn.style.background = '#6b7280';
  createBtn.style.cursor = 'wait';

  try {
    // Get OAuth token
    if (!setupState.oauthToken) {
      const response = await chrome.runtime.sendMessage({ type: "GET_AUTH_TOKEN" });
      if (!response.success) throw new Error(response.error || 'Failed to get auth token');
      setupState.oauthToken = response.token;
    }

    showNamingStatus('Creating your spreadsheet...', 'info');

    // Create the spreadsheet
    const sheet = await createNewSpreadsheet(setupState.oauthToken, name);
    
    showNamingStatus('Saving spreadsheet...', 'success');

    // Save the spreadsheet ID
    await new Promise((resolve, reject) => {
      chrome.storage.sync.set({ spreadsheetId: sheet.spreadsheetId }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });

    console.log('✓ Spreadsheet created and ID saved:', sheet.spreadsheetId);
    
    showNamingStatus('Exporting your data...', 'success');

    // Close modal
    closeNamingModal();

    // Trigger the export with the new spreadsheet
    await performExport(sheet.spreadsheetId);

  } catch (error) {
    console.error('Error creating spreadsheet:', error);
    showNamingStatus(`Error: ${error.message}`, 'error');
    
    // Re-enable inputs
    createBtn.disabled = false;
    cancelBtn.disabled = false;
    input.disabled = false;
    createBtn.textContent = 'Create Spreadsheet';
    createBtn.style.background = '#10b981';
    createBtn.style.cursor = 'pointer';
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
    if (finalResponse?.status === "ok") {
      const sheetUrl = `https://docs.google.com/spreadsheets/d/${finalResponse.spreadsheetId}/edit`;
      const state = { rowCount: finalResponse.rowCount, sheetUrl: sheetUrl };
      if (setupState.exportType === 'FH') {
        updateFHButtonState(exportButton, state);
      } else {
        updateSHButtonState(exportButton, state);
      }
    } else {
      if (textSpan) textSpan.textContent = "Export Failed";
      exportButton.style.background = "#ef4444";
    }
  });
}

/**
 * Show status message in the naming modal.
 */
function showNamingStatus(message, type = 'info') {
  const statusEl = document.getElementById('naming-status');
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
 * Close and remove the naming modal.
 */
function closeNamingModal() {
  const modal = document.getElementById('labsaver-naming-modal');
  if (modal) {
    modal.remove();
  }
}

/**
 * Create a new Google Sheet with the specified title.
 */
async function createNewSpreadsheet(token, title = 'My Lab Results') {
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ properties: { title: title } })
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create spreadsheet: ${response.status} ${errorText}`);
  }
  return await response.json();
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