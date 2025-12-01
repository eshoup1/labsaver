/**
 * LabSaver - Google Picker Integration
 * Handles spreadsheet selection using Google Picker API
 */

// Google API configuration
// Development API Key - Replace with production key before publishing
const DEVELOPER_KEY = 'AIzaSyBQM5X5npgqXYPISCF1oW4P1UpDAr9Ce38';
const CLIENT_ID = '609855124330-qhqklvllcvmft7v8f9k42csfqupu1p6d.apps.googleusercontent.com';
const SCOPE = 'https://www.googleapis.com/auth/drive.file';

// Production API Key (use this when deploying to Chrome Web Store):
// AIzaSyDDKLIV9zX_n1pO5kBqHY3au7sKLps37BA

let pickerApiLoaded = false;
let oauthToken = null;

/**
 * Initialize the page
 */
document.addEventListener('DOMContentLoaded', () => {
  const pickerButton = document.getElementById('picker-button');
  const statusDiv = document.getElementById('status');
  const loader = document.getElementById('loader');

  // Load Google API
  loadGoogleAPI();

  // Handle picker button click
  pickerButton.addEventListener('click', async () => {
    try {
      pickerButton.disabled = true;
      showStatus('Loading...', 'info');
      
      // Get OAuth token
      if (!oauthToken) {
        oauthToken = await getAuthToken();
      }

      // Create and show picker
      if (pickerApiLoaded && oauthToken) {
        createPicker();
      } else {
        throw new Error('Picker API not loaded or authentication failed');
      }
    } catch (error) {
      console.error('Error opening picker:', error);
      showStatus(`Error: ${error.message}`, 'error');
      pickerButton.disabled = false;
    }
  });
});

/**
 * Load Google API scripts
 */
function loadGoogleAPI() {
  const loader = document.getElementById('loader');
  loader.classList.add('active');

  // Load Google API Loader
  const script = document.createElement('script');
  script.src = 'https://apis.google.com/js/api.js';
  script.onload = () => {
    gapi.load('picker', {
      callback: () => {
        pickerApiLoaded = true;
        loader.classList.remove('active');
        showStatus('Ready! Click the button to select your spreadsheet.', 'info');
      },
      onerror: () => {
        loader.classList.remove('active');
        showStatus('Failed to load Google Picker API', 'error');
      }
    });
  };
  script.onerror = () => {
    loader.classList.remove('active');
    showStatus('Failed to load Google API', 'error');
  };
  document.head.appendChild(script);
}

/**
 * Get OAuth token from Chrome Identity API
 */
function getAuthToken() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else if (!token) {
        reject(new Error('No token received'));
      } else {
        resolve(token);
      }
    });
  });
}

/**
 * Create and display the Google Picker
 */
function createPicker() {
  const view = new google.picker.DocsView(google.picker.ViewId.SPREADSHEETS)
    .setIncludeFolders(true)
    .setSelectFolderEnabled(false);

  const picker = new google.picker.PickerBuilder()
    .addView(view)
    .addView(new google.picker.DocsUploadView()
      .setIncludeFolders(true))
    .setOAuthToken(oauthToken)
    .setDeveloperKey(DEVELOPER_KEY)
    .setCallback(pickerCallback)
    .setTitle('Select a spreadsheet for LabSaver')
    .setSize(1051, 650)
    .build();

  picker.setVisible(true);
}

/**
 * Handle picker selection callback
 */
async function pickerCallback(data) {
  const pickerButton = document.getElementById('picker-button');

  if (data.action === google.picker.Action.PICKED) {
    const doc = data.docs[0];
    const spreadsheetId = doc.id;
    const spreadsheetName = doc.name;

    console.log('Selected spreadsheet:', { id: spreadsheetId, name: spreadsheetName });

    try {
      showStatus('Saving your selection...', 'info');

      // Store the spreadsheet ID
      await storeSpreadsheetId(spreadsheetId);

      // Notify background script
      chrome.runtime.sendMessage({
        type: 'SPREADSHEET_SELECTED',
        spreadsheetId: spreadsheetId,
        spreadsheetName: spreadsheetName
      });

      showStatus(`✓ Selected: ${spreadsheetName}`, 'success');

      // Close this tab after a short delay
      setTimeout(() => {
        window.close();
      }, 1500);

    } catch (error) {
      console.error('Error storing spreadsheet ID:', error);
      showStatus(`Error: ${error.message}`, 'error');
      pickerButton.disabled = false;
    }

  } else if (data.action === google.picker.Action.CANCEL) {
    showStatus('Selection cancelled', 'info');
    pickerButton.disabled = false;

    // Notify background script of cancellation
    chrome.runtime.sendMessage({
      type: 'PICKER_CANCELLED'
    });

    // Close this tab after a short delay
    setTimeout(() => {
      window.close();
    }, 1000);
  }
}

/**
 * Store spreadsheet ID in Chrome storage
 */
function storeSpreadsheetId(spreadsheetId) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({ spreadsheetId }, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        console.log('Stored spreadsheet ID:', spreadsheetId);
        resolve();
      }
    });
  });
}

/**
 * Show status message
 */
function showStatus(message, type) {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
  statusDiv.style.display = 'block';
}