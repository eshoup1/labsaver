# OAuth Troubleshooting Guide

## "Bad Client ID" Error - Expected Behavior

If you're seeing an OAuth error with "bad client id" when trying to authorize the extension, **this is expected** until you complete the Google Cloud Console configuration.

## Why This Error Occurs

The extension's [`manifest.json`](temp-v2.0.5-extract/manifest.json:71) contains the OAuth client ID:
```json
"oauth2": {
  "client_id": "609855124330-qhqklvllcvmft7v8f9k42csfqupu1p6d.apps.googleusercontent.com",
  "scopes": [
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/userinfo.email"
  ]
}
```

However, the Google Cloud Console OAuth Consent Screen hasn't been updated yet to include the required scopes. The extension needs the `drive.file` scope to access Google Sheets, but this scope must be explicitly added in the Cloud Console before the OAuth flow will work.

## Required Configuration Steps

### Step 1: Access Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (the one containing client ID `609855124330-qhqklvllcvmft7v8f9k42csfqupu1p6d`)
3. Navigate to **APIs & Services** → **OAuth consent screen**

**Direct URL:** https://console.cloud.google.com/apis/credentials/consent

### Step 2: Update OAuth Consent Screen

1. Click **"EDIT APP"** button at the top of the OAuth consent screen page
2. Click through to **Step 2: Scopes**
3. Click **"ADD OR REMOVE SCOPES"** button

### Step 3: Add Required Scopes

In the scopes panel that appears:

1. **Search for "Google Drive API"** in the filter box
2. Find and check the box for:
   - **`https://www.googleapis.com/auth/drive.file`**
   - Description: "View and manage Google Drive files and folders that you have opened or created with this app"
3. The scope should also show as **"Non-sensitive"**
4. Click **"UPDATE"** at the bottom of the scopes panel

**Screenshot description:** You should see a table with columns for "API", "Scope", and "User-facing description". The Drive API scope will be listed with a checkbox.

### Step 4: Save Changes

1. Click **"SAVE AND CONTINUE"** at the bottom of the Scopes page
2. Continue through the remaining steps (Test users, Summary)
3. Click **"BACK TO DASHBOARD"** when complete

### Step 5: Verify Configuration

On the OAuth consent screen dashboard, verify:
- **Scopes** section shows: `https://www.googleapis.com/auth/drive.file`
- **Publishing status** can remain "Testing" for personal use
- Your email is listed under **Test users** (if in Testing mode)

### Step 6: Reload Extension

1. Go to `chrome://extensions/`
2. Find "LabSaver - Lab Result Exporter"
3. Click the **reload icon** (circular arrow)
4. Try the authorization flow again

## Verification

After completing these steps, the extension should:
1. Successfully open the OAuth consent screen
2. Show the requested permissions (Drive file access)
3. Allow you to authorize the extension
4. Display your Google Sheets for selection

## Common Issues

### "Access Blocked: This app's request is invalid"
- **Cause:** The scope hasn't been added to the OAuth consent screen
- **Solution:** Follow Step 3 above to add the `drive.file` scope

### "This app isn't verified"
- **Cause:** The app is in Testing mode (normal for personal use)
- **Solution:** Click "Advanced" → "Go to [App Name] (unsafe)" to proceed
- **Note:** This is safe for your own extension

### "The developer hasn't given you access to this app"
- **Cause:** Your email isn't listed as a test user
- **Solution:** Add your email under "Test users" in the OAuth consent screen

## Technical Details

### Manifest Configuration (Verified ✓)

The [`manifest.json`](temp-v2.0.5-extract/manifest.json) is correctly configured with:
- **Client ID:** `609855124330-qhqklvllcvmft7v8f9k42csfqupu1p6d.apps.googleusercontent.com` ✓
- **Required Scopes:**
  - `https://www.googleapis.com/auth/drive.file` ✓
  - `https://www.googleapis.com/auth/userinfo.email` ✓

### OAuth Flow

The extension uses Chrome's Identity API ([`picker.js:14`](temp-v2.0.5-extract/picker.js:14)):
```javascript
chrome.identity.getAuthToken({ interactive: true }, (token) => {
  // Token handling
});
```

This requires the Cloud Console configuration to match the manifest scopes.

## Support

If you continue to experience issues after following these steps:
1. Check the browser console for detailed error messages
2. Verify the client ID matches in both manifest.json and Cloud Console
3. Ensure you're signed in with the correct Google account
4. Try removing and re-adding your email as a test user

## Next Steps

Once OAuth is working:
1. The extension will display your Google Sheets
2. You can select an existing sheet or create a new one
3. Lab results will be exported to the selected sheet
4. The spreadsheet ID is saved for future exports

---

**Important:** This configuration MUST be completed before the extension will function. The "bad client id" error is expected until the Cloud Console OAuth consent screen includes the required scopes.