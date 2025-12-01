# Google OAuth `drive.file` Implementation Plan

This document outlines the technical plan to refactor the LabSaver Chrome extension to use the `https://www.googleapis.com/auth/drive.file` scope with the Google Picker API, as required by Google's OAuth Verification team.

## 1. Architectural Changes

### 1.1. Storage (`chrome.storage.sync`)

- **Current:** `sheetNameToId` - A mapping of user-provided names to spreadsheet IDs.
- **New:** `spreadsheetId` - A single, static string storing the ID of the user-authorized spreadsheet.

This simplifies the storage model significantly. We no longer manage multiple files or names.

### 1.2. Authentication & Authorization Flow

The core logic in `background.js` will be changed. The `getOrCreateSpreadsheet` function, which relies on searching for files by name, will be removed.

The new flow is as follows:
1.  An export is initiated.
2.  The background script attempts to read `spreadsheetId` from storage.
3.  **If `spreadsheetId` exists:** Proceed with the API calls to that specific spreadsheet.
4.  **If `spreadsheetId` is `null` or `undefined`:** The export fails, and a specific error message (`picker_required`) is sent back to the content script. This signals that the user must select a file.

### 1.3. User Interface (Google Picker)

A new UI component will be created to host the Google Picker.

-   **`picker.html`:** A simple page that contains a button to launch the Picker and status text.
-   **`picker.js`:**
    -   Loads the Google API client and the Picker API.
    -   Requires an **API Key** (separate from OAuth Client ID).
    -   Configures the Picker to show spreadsheets (`google.picker.ViewId.SPREADSHEETS`) and allow creation of new ones.
    -   Handles the Picker callback. When a user selects or creates a file, the `fileId` is received.
    -   Saves the `fileId` to `chrome.storage.sync` as `spreadsheetId`.
    -   Updates the UI to inform the user the selection was successful and they can return to their export.

## 2. File-by-File Implementation Details

### 2.1. `manifest.json`

-   **`oauth2.scopes`**:
    -   Remove: `"https://www.googleapis.com/auth/spreadsheets"`
    -   Add: `"https://www.googleapis.com/auth/drive.file"`
-   **`host_permissions`**:
    -   Add: `"https://apis.google.com/*"` (Required for the Picker API script to load).
-   **`web_accessible_resources`**:
    -   Add `picker.html` and `picker.js` to the resources array so they can be opened in a tab from the content script.

### 2.2. `background.js`

-   **Remove `getOrCreateSpreadsheet(sheetName)`:** This entire function (lines 145-194) will be deleted. It is incompatible with the `drive.file` scope as it relies on searching/listing files.
-   **Modify `getSpreadsheetId()`:**
    -   This function will be simplified. It will only fetch the `spreadsheetId` from storage. If it's not present, it will return `null`. It will no longer contain default values or complex logic.
-   **Update `processSutterHealthExport` and `syncSheetWithData`:**
    -   These functions will be the entry points for the export process.
    -   At the beginning of each, they will call `getSpreadsheetId()`.
    -   If the ID is `null`, they will immediately throw a special error (e.g., `new Error('picker_required')`).
    -   If the ID exists, they will use it for all subsequent API calls.
-   **Update Message Listener (`chrome.runtime.onMessage`):**
    -   The error handling in the `catch` block for `FH_EXPORT_DATA` and `SH_EXPORT_ROWS` will be updated to check for the `'picker_required'` error message.
    -   If this specific error is caught, it will send a structured error response back to the content script: `{ status: "error", message: "picker_required" }`.

### 2.3. `content.js`

-   **Update Export Handlers (e.g., the function that calls `chrome.runtime.sendMessage`):**
    -   The callback function for `sendMessage` will be updated.
    -   It will check if the response `status` is `"error"` and if `message` is `"picker_required"`.
    -   If so, it will execute `chrome.runtime.sendMessage({ type: 'OPEN_PICKER' });` or directly open the picker page: `window.open(chrome.runtime.getURL('picker.html'));`.
    -   It will also display a message to the user on the page (e.g., "Please select a spreadsheet in the new tab to continue").

### 2.4. `picker.html` (New File)

```html
<!DOCTYPE html>
<html>
<head>
  <title>Select Google Sheet</title>
</head>
<body>
  <h1>Select Your LabSaver Spreadsheet</h1>
  <p>Please select the Google Sheet where you'd like to save your lab results.</p>
  <p>You can choose an existing spreadsheet or create a new one.</p>
  <button id="authorize_button" style="display: none;">Authorize and Select File</button>
  <p id="status"></p>
  <script src="picker.js"></script>
</body>
</html>
```

### 2.5. `picker.js` (New File)

This script will contain the logic for loading the Google Picker API, handling user interaction, and saving the selected file ID. It will require an API key to be created in the Google Cloud Console.

## 3. Testing and Deployment Checklist

1.  **Create API Key:** In Google Cloud Console, create a new API Key (unrestricted for local testing, but should be restricted to the extension's domain for production).
2.  **Local Testing:**
    -   Load the unpacked extension in Chrome.
    -   Clear existing `spreadsheetId` from storage using the dev tools.
    -   Initiate an export from Function Health.
    -   **Verify:** A new tab opens with `picker.html`.
    -   **Verify:** The Google Picker UI appears.
    -   Create a new spreadsheet using the Picker.
    -   **Verify:** The picker tab shows a success message, and the `spreadsheetId` is saved in `chrome.storage.sync`.
    -   Return to the Function Health page and click export again.
    -   **Verify:** The export completes successfully to the newly created sheet without showing the picker.
    -   Repeat the process for Sutter Health, verifying it exports to the *same* sheet.
3.  **Update Cloud Console:**
    -   Go to the OAuth Consent Screen configuration.
    -   Remove the `.../auth/spreadsheets` scope.
    -   Add the `.../auth/drive.file` scope.
    -   Save the changes.
4.  **Reply to Google:**
    -   Send the email with the subject "Confirming narrower scopes".
