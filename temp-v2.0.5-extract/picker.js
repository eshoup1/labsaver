/**
 * LabSaver - Google Drive File Picker
 * Uses Chrome Identity API and Google Drive REST API (no external scripts)
 */

let oauthToken = null;

/**
 * Get OAuth token from Chrome Identity API
 */
async function getAuthToken() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else if (!token) {
        reject(new Error('No token received'));
      } else {
        resolve(token);
      }
    });
  });
}

/**
 * List Google Sheets files using Drive API v3
 */
async function listSpreadsheets(token) {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?` +
    `q=mimeType='application/vnd.google-apps.spreadsheet'` +
    `&orderBy=modifiedTime desc` +
    `&pageSize=20` +
    `&fields=files(id,name,modifiedTime,iconLink)`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to list files');
  }

  return await response.json();
}

/**
 * Create a new Google Sheet
 */
async function createNewSpreadsheet(token, title = 'LabSaver Results') {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          title: title
        }
      })
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to create spreadsheet');
  }

  return await response.json();
}

/**
 * Display the list of spreadsheets
 */
function displaySpreadsheets(files) {
  const fileListDiv = document.getElementById('file-list');
  const filesDiv = document.getElementById('files');
  const statusEl = document.getElementById('status');
  
  filesDiv.innerHTML = '';
  
  if (!files || files.length === 0) {
    filesDiv.innerHTML = '<p style="color: #6b7280; padding: 10px;">No spreadsheets found. Create a new one below.</p>';
  } else {
    files.forEach(file => {
      const fileItem = document.createElement('div');
      fileItem.style.cssText = `
        padding: 12px;
        margin-bottom: 8px;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 10px;
      `;
      
      fileItem.innerHTML = `
        <img src="${file.iconLink || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect fill="%230F9D58" width="16" height="16"/></svg>'}" 
             width="16" height="16" alt="Sheet icon" style="flex-shrink: 0;">
        <div style="flex: 1; min-width: 0;">
          <div style="font-weight: 500; color: #1f2937; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${file.name}
          </div>
          <div style="font-size: 12px; color: #6b7280;">
            Modified: ${new Date(file.modifiedTime).toLocaleDateString()}
          </div>
        </div>
      `;
      
      fileItem.addEventListener('mouseenter', () => {
        fileItem.style.backgroundColor = '#f3f4f6';
        fileItem.style.borderColor = '#1f2937';
      });
      
      fileItem.addEventListener('mouseleave', () => {
        fileItem.style.backgroundColor = 'white';
        fileItem.style.borderColor = '#e5e7eb';
      });
      
      fileItem.addEventListener('click', () => {
        selectSpreadsheet(file.id, file.name);
      });
      
      filesDiv.appendChild(fileItem);
    });
  }
  
  // Add "Create New" button
  const createButton = document.createElement('button');
  createButton.textContent = '+ Create New Spreadsheet';
  createButton.style.cssText = `
    width: 100%;
    margin-top: 10px;
    background: #10b981;
    color: white;
    padding: 12px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
  `;
  
  createButton.addEventListener('mouseenter', () => {
    createButton.style.background = '#059669';
  });
  
  createButton.addEventListener('mouseleave', () => {
    createButton.style.background = '#10b981';
  });
  
  createButton.addEventListener('click', async () => {
    try {
      createButton.disabled = true;
      createButton.textContent = 'Creating...';
      statusEl.className = 'info';
      statusEl.textContent = 'Creating new spreadsheet...';
      
      const sheet = await createNewSpreadsheet(oauthToken);
      selectSpreadsheet(sheet.spreadsheetId, sheet.properties.title);
    } catch (error) {
      console.error('Error creating spreadsheet:', error);
      statusEl.className = 'error';
      statusEl.textContent = `Error creating spreadsheet: ${error.message}`;
      createButton.disabled = false;
      createButton.textContent = '+ Create New Spreadsheet';
    }
  });
  
  filesDiv.appendChild(createButton);
  fileListDiv.style.display = 'block';
  statusEl.style.display = 'none';
}

/**
 * Handle spreadsheet selection
 */
function selectSpreadsheet(fileId, fileName) {
  const statusEl = document.getElementById('status');
  
  console.log('✓ File selected:', fileName, fileId);
  
  // Save the spreadsheet ID to chrome.storage.sync
  chrome.storage.sync.set({ spreadsheetId: fileId }, () => {
    if (chrome.runtime.lastError) {
      console.error('Error saving spreadsheet ID:', chrome.runtime.lastError);
      statusEl.className = 'error';
      statusEl.textContent = `Error saving selection: ${chrome.runtime.lastError.message}`;
    } else {
      console.log('✓ Spreadsheet ID saved to storage');
      statusEl.className = 'success';
      statusEl.textContent = `✓ Successfully selected: ${fileName}\n\nYou can now close this tab and return to export your lab results.`;
      
      // Hide file list after selection
      document.getElementById('file-list').style.display = 'none';
      document.getElementById('authorize_button').style.display = 'none';
    }
  });
}

/**
 * Load and display spreadsheets
 */
async function loadSpreadsheets() {
  const statusEl = document.getElementById('status');
  const button = document.getElementById('authorize_button');
  
  try {
    // Show loading state
    statusEl.className = 'info';
    statusEl.textContent = 'Authenticating with Google...';
    button.disabled = true;
    
    // Get OAuth token
    if (!oauthToken) {
      oauthToken = await getAuthToken();
      console.log('✓ OAuth token obtained');
    }
    
    statusEl.textContent = 'Loading your spreadsheets...';
    
    // List spreadsheets
    const result = await listSpreadsheets(oauthToken);
    console.log('✓ Spreadsheets loaded:', result.files?.length || 0);
    
    // Display the list
    displaySpreadsheets(result.files || []);
    button.disabled = false;
    
  } catch (error) {
    console.error('Error loading spreadsheets:', error);
    statusEl.className = 'error';
    
    // Check if this is the expected OAuth configuration error
    if (error.message && (
      error.message.includes('bad client id') ||
      error.message.includes('invalid_client') ||
      error.message.includes('OAuth2')
    )) {
      statusEl.innerHTML = `
        <strong>⚠️ OAuth Configuration Required</strong><br><br>
        This error is expected until you configure the Google Cloud Console.<br><br>
        <strong>Next Steps:</strong><br>
        1. Open <a href="https://console.cloud.google.com/apis/credentials/consent" target="_blank" style="color: #2563eb; text-decoration: underline;">Google Cloud Console OAuth Consent Screen</a><br>
        2. Click "EDIT APP" → Navigate to "Scopes"<br>
        3. Add scope: <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 3px;">https://www.googleapis.com/auth/drive.file</code><br>
        4. Save changes and reload this extension<br><br>
        📖 See <strong>OAUTH_TROUBLESHOOTING.md</strong> for detailed instructions.<br><br>
        <em>Error details: ${error.message}</em>
      `;
    } else {
      statusEl.textContent = `Error: ${error.message}`;
    }
    
    button.disabled = false;
  }
}

/**
 * Initialize the picker
 */
document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById('authorize_button');
  const statusEl = document.getElementById('status');
  
  button.addEventListener('click', () => {
    loadSpreadsheets();
  });
  
  // Ready to use
  console.log('✓ Picker ready (no external scripts needed)');
});