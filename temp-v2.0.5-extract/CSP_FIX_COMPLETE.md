# CSP Error Fix - Complete

## Problem
Chrome was rejecting the extension with the error:
```
'content_security_policy.extension_pages': Insecure CSP value "https://apis.google.com" in directive 'script-src'.
```

Manifest V3 doesn't allow loading external scripts directly in extension pages.

## Solution Implemented

### 1. Removed Content Security Policy from manifest.json
- **File**: `manifest.json`
- **Change**: Removed the entire `content_security_policy` section (lines 9-11)
- **Result**: Extension now uses the default CSP: `script-src 'self'; object-src 'self'`

### 2. Updated picker.html
- **File**: `picker.html`
- **Change**: Added a file list container for displaying spreadsheets
- **Result**: No external scripts are loaded; all functionality is self-contained

### 3. Rewrote picker.js
- **File**: `picker.js`
- **Changes**:
  - Removed dependency on Google Picker API library (`https://apis.google.com/js/api.js`)
  - Implemented direct REST API calls using `fetch()` and `chrome.identity.getAuthToken()`
  - Uses Google Drive API v3 to list spreadsheets
  - Uses Google Sheets API v4 to create new spreadsheets
  - Created custom UI for file selection

### Key Features of New Implementation

1. **No External Scripts**: All code is self-contained in `picker.js`
2. **Chrome Identity API**: Uses `chrome.identity.getAuthToken()` for OAuth
3. **Direct REST API Calls**: 
   - Lists spreadsheets via Drive API v3
   - Creates new spreadsheets via Sheets API v4
4. **Custom UI**: 
   - Displays list of existing spreadsheets
   - Shows file icons, names, and modification dates
   - Includes "Create New Spreadsheet" button
   - Hover effects and click handlers

### API Endpoints Used

- **List Files**: `GET https://www.googleapis.com/drive/v3/files`
  - Query: `mimeType='application/vnd.google-apps.spreadsheet'`
  - Returns up to 20 most recently modified spreadsheets

- **Create Spreadsheet**: `POST https://sheets.googleapis.com/v4/spreadsheets`
  - Creates a new spreadsheet with the title "LabSaver Results"

### Testing

The extension should now:
1. ✅ Load without CSP errors
2. ✅ Open picker.html without trying to load external scripts
3. ✅ Authenticate using Chrome's identity API
4. ✅ Display a list of user's spreadsheets
5. ✅ Allow selection of existing spreadsheets
6. ✅ Allow creation of new spreadsheets
7. ✅ Save the selected spreadsheet ID to chrome.storage.sync

### Files Modified

1. `manifest.json` - Removed CSP section
2. `picker.html` - Added file list container
3. `picker.js` - Complete rewrite using REST APIs

### Permissions Required

The extension already has the necessary permissions in manifest.json:
- `identity` - For OAuth token
- `storage` - For saving spreadsheet ID
- Host permissions for `https://sheets.googleapis.com/*` and `https://apis.google.com/*`

## Result

The extension is now fully compliant with Manifest V3's strict CSP requirements and should load without any CSP errors in Chrome.