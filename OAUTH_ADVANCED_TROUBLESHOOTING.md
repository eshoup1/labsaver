# OAuth Advanced Troubleshooting Guide

This guide provides advanced troubleshooting steps for resolving OAuth authentication issues, particularly the "bad client id" error that persists even after adding the correct scopes.

## Table of Contents

1. [Clear Chrome's OAuth Cache](#1-clear-chromes-oauth-cache)
2. [Verify OAuth Client ID Configuration](#2-verify-oauth-client-id-configuration)
3. [Check OAuth Consent Screen Status](#3-check-oauth-consent-screen-status)
4. [Verify Scope Configuration](#4-verify-scope-configuration)
5. [Extension Reload Steps](#5-extension-reload-steps)
6. [Check for Propagation Delays](#6-check-for-propagation-delays)
7. [Understanding Extension IDs](#7-understanding-extension-ids)
8. [Common Issues Checklist](#8-common-issues-checklist)

---

## 1. Clear Chrome's OAuth Cache

Chrome caches OAuth tokens and credentials, which can cause issues when you update your OAuth configuration.

### Steps:

1. **Open Chrome's Identity Internals**
   - Navigate to `chrome://identity-internals/` in your Chrome browser
   - This page shows all cached OAuth tokens for extensions

2. **Find Your Extension's Tokens**
   - Look for entries matching your extension's ID
   - You'll see tokens listed with their associated scopes and expiration times

3. **Revoke All Tokens**
   - Click the "Revoke" button next to each token associated with your extension
   - This clears the cached authentication state

4. **Reload the Extension**
   - Go to `chrome://extensions/`
   - Click the reload icon (circular arrow) for your extension
   - Or toggle the extension off and back on

5. **Test Authentication Again**
   - Try the OAuth flow again with a fresh authentication state

**Screenshot Description**: The `chrome://identity-internals/` page shows a list of cached tokens with columns for Extension ID, Token, Scopes, and a Revoke button for each entry.

---

## 2. Verify OAuth Client ID Configuration

The OAuth Client ID must be properly configured in both the Google Cloud Console and your extension's manifest.

### A. Check Client ID Match

1. **Get Client ID from Cloud Console**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to: APIs & Services > Credentials
   - Find your OAuth 2.0 Client ID
   - Copy the full Client ID (format: `xxxxx.apps.googleusercontent.com`)

2. **Check manifest.json**
   - Open your extension's [`manifest.json`](manifest.json)
   - Verify the `oauth2.client_id` field matches exactly:
   ```json
   {
     "oauth2": {
       "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
       "scopes": [...]
     }
   }
   ```

3. **Verify No Typos**
   - Check for extra spaces, missing characters, or incorrect domain
   - The Client ID should end with `.apps.googleusercontent.com`

### B. Verify Client Type

**CRITICAL**: The OAuth client must be configured as a "Chrome App" type, not "Web application".

1. **Check Client Type in Cloud Console**
   - Go to APIs & Services > Credentials
   - Click on your OAuth 2.0 Client ID
   - Under "Application type", it should show **"Chrome App"**

2. **If It's Wrong Type**
   - You cannot change the type of an existing client
   - You must create a new OAuth 2.0 Client ID:
     - Click "Create Credentials" > "OAuth client ID"
     - Select "Chrome App" as the application type
     - Enter your extension's ID (see [Section 7](#7-understanding-extension-ids))
     - Click "Create"
   - Update your [`manifest.json`](manifest.json) with the new Client ID

**Screenshot Description**: The OAuth client details page shows "Application type: Chrome App" at the top, with the Client ID and extension ID fields below.

---

## 3. Check OAuth Consent Screen Status

The OAuth consent screen configuration can prevent authentication if not properly set up.

### A. Check Publishing Status

1. **Navigate to OAuth Consent Screen**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to: APIs & Services > OAuth consent screen

2. **Check Publishing Status**
   - Look for the "Publishing status" field
   - It will show either "Testing" or "In production"

### B. If in Testing Mode

When your app is in "Testing" mode, only specified test users can authenticate.

1. **Add Test Users**
   - Scroll down to "Test users" section
   - Click "Add Users"
   - Add your Google account email address
   - Click "Save"

2. **Or Publish to Production**
   - Click "Publish App" button
   - Review the warning about verification requirements
   - For personal/internal use, you can publish without verification
   - Click "Confirm" to publish

**Important**: Apps in Testing mode with sensitive scopes (like Drive access) are limited to 100 test users and require each user to be explicitly added.

**Screenshot Description**: The OAuth consent screen page shows a "Publishing status" badge (either blue "Testing" or green "In production") at the top, with a "Test users" section below showing a list of authorized email addresses.

---

## 4. Verify Scope Configuration

Incorrect scope configuration is a common cause of authentication failures.

### A. Check Scope Format

Scopes must use the full URL format, not shorthand.

**Correct Format**:
```json
{
  "oauth2": {
    "scopes": [
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/userinfo.email"
    ]
  }
}
```

**Incorrect Format** (will cause errors):
```json
{
  "oauth2": {
    "scopes": [
      "drive.file",  // ❌ Missing URL prefix
      "userinfo.email"  // ❌ Missing URL prefix
    ]
  }
}
```

### B. Verify Scopes in Cloud Console

1. **Check OAuth Consent Screen Scopes**
   - Go to APIs & Services > OAuth consent screen
   - Scroll to "Scopes" section
   - Click "Edit" if needed
   - Verify these scopes are present:
     - `https://www.googleapis.com/auth/drive.file`
     - `https://www.googleapis.com/auth/userinfo.email`

2. **Remove Old Scopes**
   - If you previously used `spreadsheets` scope, remove it
   - Click "Update" to save changes

3. **Verify in OAuth Client**
   - Go to APIs & Services > Credentials
   - Click on your OAuth 2.0 Client ID
   - The scopes should match what's in the consent screen

**Screenshot Description**: The OAuth consent screen's "Scopes" section shows a table with columns for "API", "Scope", and "User-facing description", listing the authorized scopes with their full URLs.

---

## 5. Extension Reload Steps

Sometimes a simple reload isn't enough; you need to completely remove and reinstall the extension.

### Complete Reload Process:

1. **Remove the Extension**
   - Go to `chrome://extensions/`
   - Find your extension
   - Click "Remove" button
   - Confirm removal

2. **Close Chrome Completely**
   - Close all Chrome windows
   - On Mac: Quit Chrome from the menu bar (Cmd+Q)
   - On Windows: Close Chrome from the taskbar
   - Wait 10 seconds

3. **Reopen Chrome**
   - Launch Chrome again
   - This ensures all cached data is cleared

4. **Load Extension Again**
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select your extension directory
   - Note the new Extension ID (it may change)

5. **Update OAuth Client if Needed**
   - If the Extension ID changed, update it in Cloud Console
   - See [Section 7](#7-understanding-extension-ids) for details

**Screenshot Description**: The `chrome://extensions/` page shows the extension card with a "Remove" button in the bottom right, and "Developer mode" toggle in the top right corner.

---

## 6. Check for Propagation Delays

Google Cloud changes don't take effect immediately.

### Understanding Propagation:

- **OAuth configuration changes** can take 5-10 minutes to propagate
- **Scope changes** may take up to 10 minutes
- **Publishing status changes** can take 5-15 minutes

### What to Do:

1. **Wait After Making Changes**
   - After updating scopes, wait at least 10 minutes
   - After publishing the app, wait at least 15 minutes
   - After creating a new OAuth client, wait at least 5 minutes

2. **Clear Cache While Waiting**
   - Follow [Section 1](#1-clear-chromes-oauth-cache) to clear OAuth cache
   - This ensures you're not using old cached credentials

3. **Test Again**
   - After waiting, try the authentication flow again
   - If it still fails, proceed to other troubleshooting steps

**Pro Tip**: Make all your OAuth configuration changes at once, then wait 15 minutes before testing. This is more efficient than making changes incrementally.

---

## 7. Understanding Extension IDs

Chrome generates a unique Extension ID for unpacked extensions, and this ID must be registered in your OAuth client configuration.

### What is an Extension ID?

- A 32-character string (e.g., `abcdefghijklmnopqrstuvwxyzabcdef`)
- Uniquely identifies your extension
- Generated based on the extension's directory path and contents
- **Changes** if you load the extension from a different directory

### Finding Your Extension ID:

1. **In Chrome Extensions Page**
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Your extension's ID is shown under its name
   - Format: `ID: abcdefghijklmnopqrstuvwxyzabcdef`

2. **Copy the Extension ID**
   - Select and copy the entire 32-character ID
   - You'll need this for the OAuth client configuration

**Screenshot Description**: The extension card on `chrome://extensions/` shows the extension name, version, and below that "ID: [32-character string]" in a monospace font.

### Registering Extension ID in OAuth Client:

1. **Open OAuth Client Configuration**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to: APIs & Services > Credentials
   - Click on your OAuth 2.0 Client ID (must be "Chrome App" type)

2. **Add Extension ID**
   - Look for "Application ID" or "Item ID" field
   - Paste your extension's ID
   - Click "Save"

3. **Wait for Propagation**
   - Changes take 5-10 minutes to propagate
   - Clear OAuth cache (see [Section 1](#1-clear-chromes-oauth-cache))
   - Reload extension and test

### Important Notes:

- **Unpacked extensions** get a new ID each time they're loaded from a different directory
- **Packed extensions** (.crx files) have a stable ID based on the signing key
- **Published extensions** have a permanent ID from the Chrome Web Store
- If you move your extension folder, the ID will change and you'll need to update the OAuth client

### For Development:

To maintain a consistent Extension ID during development:

1. **Keep extension in the same directory**
   - Don't move or rename the extension folder
   - Load from the same path each time

2. **Or use a packed extension**
   - Pack your extension: `chrome://extensions/` > "Pack extension"
   - This creates a `.crx` file and `.pem` key file
   - The `.pem` key ensures the same ID each time
   - Load the `.crx` file instead of unpacked folder

3. **Or generate a stable key**
   - Add a `key` field to [`manifest.json`](manifest.json)
   - This locks the extension ID
   - See [Chrome Extension documentation](https://developer.chrome.com/docs/extensions/mv3/manifest/key/) for details

---

## 8. Common Issues Checklist

Use this checklist to systematically verify your OAuth configuration:

### OAuth Client Configuration:
- [ ] Client ID in [`manifest.json`](manifest.json) matches Cloud Console exactly
- [ ] Client type is "Chrome App" (not "Web application")
- [ ] Extension ID is registered in the OAuth client
- [ ] Extension ID matches the current loaded extension

### Scopes:
- [ ] Scopes use full URL format (`https://www.googleapis.com/auth/...`)
- [ ] `drive.file` scope is present in [`manifest.json`](manifest.json)
- [ ] `userinfo.email` scope is present in [`manifest.json`](manifest.json)
- [ ] Same scopes are configured in OAuth consent screen
- [ ] Old/unused scopes have been removed

### OAuth Consent Screen:
- [ ] App is published to "Production" OR
- [ ] App is in "Testing" mode with your account added as test user
- [ ] All required scopes are listed in the consent screen
- [ ] App name and details are filled out

### APIs:
- [ ] Google Drive API is enabled in Cloud Console
- [ ] Google Picker API is enabled in Cloud Console
- [ ] Any other required APIs are enabled

### Extension State:
- [ ] Extension has been completely removed and reloaded
- [ ] Chrome has been closed and reopened
- [ ] OAuth cache has been cleared (`chrome://identity-internals/`)
- [ ] Extension ID hasn't changed since OAuth client configuration

### Timing:
- [ ] Waited at least 10 minutes after making OAuth changes
- [ ] Waited at least 15 minutes after publishing app
- [ ] Cleared cache after waiting period

---

## Still Having Issues?

If you've gone through all these steps and still encounter the "bad client id" error:

1. **Create a New OAuth Client**
   - Sometimes OAuth clients become corrupted
   - Create a fresh "Chrome App" OAuth client
   - Configure it with your extension ID and scopes
   - Update [`manifest.json`](manifest.json) with the new client ID

2. **Check Browser Console**
   - Open DevTools (F12) on the extension page
   - Look for specific error messages
   - Check the Network tab for failed API calls
   - Note any error codes or messages

3. **Verify Project Settings**
   - Ensure your Google Cloud project is active
   - Check that billing is enabled (if required)
   - Verify you have the necessary permissions on the project

4. **Test with a Different Google Account**
   - Try authenticating with a different Google account
   - This can help identify if the issue is account-specific

5. **Review Extension Manifest**
   - Ensure [`manifest.json`](manifest.json) is valid JSON
   - Check that all required fields are present
   - Verify manifest version is correct (v3 recommended)

---

## Additional Resources

- [Chrome Extension OAuth Documentation](https://developer.chrome.com/docs/extensions/mv3/tut_oauth/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Drive API Documentation](https://developers.google.com/drive/api/guides/about-sdk)
- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/)

---

## Related Documentation

- [`OAUTH_SETUP.md`](OAUTH_SETUP.md) - Initial OAuth setup guide
- [`OAUTH_TROUBLESHOOTING.md`](OAUTH_TROUBLESHOOTING.md) - Basic troubleshooting steps
- [`GOOGLE_OAUTH_IMPLEMENTATION_PLAN.md`](GOOGLE_OAUTH_IMPLEMENTATION_PLAN.md) - Implementation details
- [`PRODUCTION_OAUTH_SETUP.md`](PRODUCTION_OAUTH_SETUP.md) - Production deployment guide