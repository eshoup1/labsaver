# API Key Clarification for LabSaver Extension

## Current Authentication Status

### ⚠️ ISSUE FOUND: Unnecessary API Key in Code

**Line 6 of [`picker.js`](temp-v2.0.5-extract/picker.js:6):**
```javascript
const API_KEY = 'AIzaSyBQM5X5npgqXYPISCF1oW4P1UpDAr9Ce38';
```

**This API key should be REMOVED** - it is not needed and represents a security risk.

---

## Authentication Method Being Used

The extension correctly uses **OAuth 2.0 authentication** via Chrome's Identity API:

### Primary Authentication (Correct ✓)
- **Method**: [`chrome.identity.getAuthToken()`](temp-v2.0.5-extract/picker.js:14)
- **Location**: Lines 12-24 in picker.js
- **Purpose**: Obtains OAuth token for authenticated API requests
- **Credential Source**: OAuth Client ID from manifest.json

### Unnecessary API Key Usage (Incorrect ✗)
The API key is being appended to API requests on:
- **Line 36**: Drive API list files request
- **Line 58**: Sheets API create spreadsheet request

**These `&key=${API_KEY}` parameters should be removed** because:
1. The OAuth token in the `Authorization` header is sufficient
2. Including an API key is redundant when using OAuth
3. Exposing API keys in client-side code is a security risk

---

## Understanding the Difference

### API Keys vs OAuth Client IDs

| Aspect | API Key | OAuth Client ID |
|--------|---------|-----------------|
| **Purpose** | Identifies the application making requests | Enables user authentication and authorization |
| **Security** | Low - identifies app only | High - authenticates specific users |
| **User Context** | No user identity | Tied to specific Google account |
| **Permissions** | Limited to public/quota tracking | Full access to user's authorized resources |
| **Best For** | Public APIs, anonymous requests | Private user data, authenticated actions |

### Why OAuth is Correct for This Extension

1. **User-Specific Data**: The extension accesses user's Google Drive files
2. **Write Permissions**: Creates and modifies spreadsheets in user's Drive
3. **Privacy**: Each user's data remains private to their account
4. **Scopes**: Properly limited to `drive.file` scope (only files created by the app)

---

## What Credentials Are Actually Required

### ✅ Required Credentials

1. **OAuth 2.0 Client ID** (already configured in manifest.json)
   - Type: Chrome Extension
   - Configured in: Google Cloud Console → APIs & Credentials
   - Used by: `chrome.identity.getAuthToken()`

2. **OAuth Consent Screen** (must be configured)
   - Required scope: `https://www.googleapis.com/auth/drive.file`
   - User consent: Allows extension to access Drive files

### ❌ NOT Required

1. **API Key** - Not needed when using OAuth authentication
2. **Service Account** - Not applicable for Chrome extensions
3. **Additional Credentials** - OAuth Client ID is sufficient

---

## Recommended Fix

### Remove API Key from picker.js

**Change line 36 from:**
```javascript
`https://www.googleapis.com/drive/v3/files?` +
`q=mimeType='application/vnd.google-apps.spreadsheet'` +
`&orderBy=modifiedTime desc` +
`&pageSize=20` +
`&fields=files(id,name,modifiedTime,iconLink)` +
`&key=${API_KEY}`,
```

**To:**
```javascript
`https://www.googleapis.com/drive/v3/files?` +
`q=mimeType='application/vnd.google-apps.spreadsheet'` +
`&orderBy=modifiedTime desc` +
`&pageSize=20` +
`&fields=files(id,name,modifiedTime,iconLink)`,
```

**Change line 58 from:**
```javascript
`https://sheets.googleapis.com/v4/spreadsheets?key=${API_KEY}`,
```

**To:**
```javascript
`https://sheets.googleapis.com/v4/spreadsheets`,
```

**Remove line 6 entirely:**
```javascript
const API_KEY = 'AIzaSyBQM5X5npgqXYPISCF1oW4P1UpDAr9Ce38'; // DELETE THIS LINE
```

---

## Security Note

The exposed API key should be:
1. **Revoked** in Google Cloud Console (if it has any quota or restrictions)
2. **Removed** from all code and documentation
3. **Not committed** to version control (add to .gitignore if needed)

API keys in client-side code can be extracted and misused, even if they have restrictions. Since OAuth provides complete authentication, the API key serves no purpose and should be eliminated.

---

## Summary

✅ **Current Authentication**: OAuth 2.0 via Chrome Identity API (CORRECT)  
❌ **Unnecessary Addition**: API key in code (SHOULD BE REMOVED)  
✅ **Required Credentials**: Only OAuth Client ID from manifest.json  
🔒 **Security**: Remove API key to eliminate unnecessary exposure