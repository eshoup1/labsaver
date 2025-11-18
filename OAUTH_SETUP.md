# OAuth Setup Guide for LabSaver

This guide explains how to set up Google OAuth credentials for the LabSaver Chrome extension.

## Overview

LabSaver uses Google OAuth 2.0 to authenticate with Google Sheets API. Before publishing or using the extension, you need to:

1. Create a Google Cloud Project
2. Enable Google Sheets API
3. Create OAuth 2.0 credentials
4. Configure the extension with your credentials

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "LabSaver" (or your preferred name)
4. Click "Create"
5. Wait for the project to be created and select it

### 2. Enable Google Sheets API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google Sheets API"
3. Click on "Google Sheets API"
4. Click "Enable"
5. Wait for the API to be enabled

### 3. Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External" user type (unless you have a Google Workspace)
3. Click "Create"

**App Information:**
- App name: `LabSaver - Health Data Exporter`
- User support email: Your email address
- App logo: Upload your extension icon (128x128)

**App Domain:**
- Application home page: Your GitHub repository or website
- Application privacy policy: Link to your hosted PRIVACY_POLICY.md
- Application terms of service: (Optional)

**Authorized Domains:**
- Add your domain if you have one (optional for Chrome extensions)

**Developer Contact Information:**
- Email addresses: Your email address

4. Click "Save and Continue"

**Scopes:**
1. Click "Add or Remove Scopes"
2. Add these scopes:
   - `https://www.googleapis.com/auth/spreadsheets`
   - `https://www.googleapis.com/auth/userinfo.email`
3. Click "Update"
4. Click "Save and Continue"

**Test Users (for development):**
1. Add your email address and any test users
2. Click "Save and Continue"

5. Review the summary and click "Back to Dashboard"

### 4. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: Select "Chrome extension"
4. Name: `LabSaver Chrome Extension`
5. Item ID: 
   - For development: Leave blank (will use extension ID after loading unpacked)
   - For production: Enter your Chrome Web Store extension ID

6. Click "Create"
7. Copy the Client ID (format: `xxxxx.apps.googleusercontent.com`)

### 5. Update manifest.json

Open `manifest.json` and update the OAuth client ID:

```json
{
  "oauth2": {
    "client_id": "YOUR_CLIENT_ID_HERE.apps.googleusercontent.com",
    "scopes": [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/userinfo.email"
    ]
  }
}
```

Replace `YOUR_CLIENT_ID_HERE` with your actual client ID.

### 6. Get Extension ID (for development)

1. Load the extension in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `lab-result-exporter` directory

2. Copy the Extension ID shown under your extension

3. Go back to Google Cloud Console → Credentials
4. Edit your OAuth client ID
5. Update the Item ID with your extension ID
6. Save

### 7. For Chrome Web Store Publication

When you publish to Chrome Web Store:

1. Note your Chrome Web Store extension ID (different from dev ID)
2. Create a new OAuth client ID OR update existing one:
   - Application type: Chrome extension
   - Item ID: Your Chrome Web Store extension ID
3. Update `manifest.json` with the new client ID
4. Submit to Chrome Web Store

## Security Best Practices

### For Open Source Projects

**DO NOT commit your OAuth client ID to public repositories if:**
- You want to control who can use your credentials
- You're concerned about quota limits
- You want to track usage

**Instead:**
1. Use environment variables or config files (add to `.gitignore`)
2. Provide setup instructions for users to create their own credentials
3. Use a placeholder in the public manifest.json

**Example `.gitignore` entry:**
```
# OAuth credentials
manifest.json.local
oauth-config.json
```

### For Private/Personal Use

If you're using this privately:
- You can include your client ID in manifest.json
- Keep the repository private
- Don't share your credentials

### For Public Distribution

If publishing to Chrome Web Store:
- Use a dedicated OAuth client ID for the published version
- Monitor usage in Google Cloud Console
- Set up quota alerts if needed

## Troubleshooting

### "OAuth client ID not found"
- Verify the client ID is correct in manifest.json
- Ensure the extension ID matches in Google Cloud Console
- Check that Google Sheets API is enabled

### "Access blocked: This app's request is invalid"
- Complete the OAuth consent screen configuration
- Add required scopes
- Add yourself as a test user (for development)

### "Redirect URI mismatch"
- Verify extension ID matches in OAuth client configuration
- For Chrome Web Store, use the store extension ID, not dev ID

### "This app isn't verified"
- During development, click "Advanced" → "Go to [App Name] (unsafe)"
- For production, submit for OAuth verification (if needed)

## OAuth Verification (Optional)

For public Chrome Web Store extensions with many users:

1. Google may require OAuth verification
2. This involves a security review by Google
3. Required if you exceed certain user thresholds
4. See [Google's OAuth verification guide](https://support.google.com/cloud/answer/9110914)

## Testing

After setup:

1. Load the extension in Chrome
2. Navigate to Function Health or Sutter Health
3. Click the export button
4. You should see Google OAuth consent screen
5. Grant permissions
6. Export should complete successfully

## Support

If you encounter issues:
- Check Google Cloud Console for error messages
- Review OAuth consent screen configuration
- Verify all scopes are added
- Ensure APIs are enabled

## References

- [Chrome Extension Identity API](https://developer.chrome.com/docs/extensions/reference/identity/)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)