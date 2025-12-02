# API Keys and Deployment Guide

## API Keys

### Development API Key
```
AIzaSyBQM5X5npgqXYPISCF1oW4P1UpDAr9Ce38
```
- **Project:** Lab Saver (Development)
- **Current Status:** ✅ Active in [`temp-v2.0.3-extract/picker.js`](temp-v2.0.3-extract/picker.js:11)
- **Use For:** Local testing and development

### Production API Key
```
AIzaSyDDKLIV9zX_n1pO5kBqHY3au7sKLps37BA
```
- **Project:** LabSaver Production
- **Current Status:** ⚠️ Documented but not yet applied
- **Use For:** Chrome Web Store deployment

## Before Publishing to Chrome Web Store

**CRITICAL:** Update the API key in [`picker.js`](temp-v2.0.3-extract/picker.js:11) line 11:

```javascript
// Change from:
const DEVELOPER_KEY = 'AIzaSyBQM5X5npgqXYPISCF1oW4P1UpDAr9Ce38';

// To:
const DEVELOPER_KEY = 'AIzaSyDDKLIV9zX_n1pO5kBqHY3au7sKLps37BA';
```

## Testing Checklist

### Local Testing (Development Key)
- [ ] Load unpacked extension in Chrome
- [ ] Navigate to Function Health
- [ ] Click "Export Labs" button
- [ ] Verify Google Picker appears
- [ ] Select a spreadsheet
- [ ] Verify export completes successfully
- [ ] Refresh page and export again
- [ ] Verify Picker does NOT appear (uses stored ID)
- [ ] Test Sutter Health export (same flow)

### Pre-Production Checklist
- [ ] Update API key to production key
- [ ] Update OAuth scopes in Google Cloud Console
  - [ ] Remove `https://www.googleapis.com/auth/spreadsheets`
  - [ ] Add `https://www.googleapis.com/auth/drive.file`
- [ ] Test with production key locally
- [ ] Verify all functionality works
- [ ] Update version number in manifest.json
- [ ] Create release notes

### Google OAuth Verification
- [ ] Send email to Google (draft in [`GOOGLE_OAUTH_RESPONSE.md`](GOOGLE_OAUTH_RESPONSE.md:5))
- [ ] Wait for Google's approval
- [ ] Confirm scope changes in Cloud Console

### Chrome Web Store Deployment
- [ ] Package extension as .zip
- [ ] Upload to Chrome Web Store Developer Dashboard
- [ ] Update store listing if needed
- [ ] Submit for review
- [ ] Monitor for approval

## OAuth Scopes Configuration

### Google Cloud Console Settings

**For Development Project:**
- OAuth 2.0 Client ID: `609855124330-qhqklvllcvmft7v8f9k42csfqupu1p6d.apps.googleusercontent.com`
- Authorized JavaScript origins: `chrome-extension://[your-extension-id]`
- Scopes:
  - ✅ `https://www.googleapis.com/auth/drive.file`
  - ✅ `https://www.googleapis.com/auth/userinfo.email`
  - ❌ ~~`https://www.googleapis.com/auth/spreadsheets`~~ (REMOVED)

**For Production Project:**
- Same configuration as development
- Ensure production API key is enabled for Google Picker API

## Troubleshooting

### Picker Not Appearing
1. Check browser console for errors
2. Verify API key is correct
3. Ensure Google Picker API is enabled in Cloud Console
4. Check that `picker.html` and `picker.js` are in web_accessible_resources

### OAuth Errors
1. Verify OAuth scope in manifest.json matches Cloud Console
2. Clear extension storage: `chrome.storage.sync.clear()`
3. Remove and re-add extension
4. Check that user has granted permissions

### Spreadsheet Access Denied
1. Verify `drive.file` scope is active
2. Check that spreadsheet was created by or shared with the extension
3. User may need to re-select spreadsheet via picker

## Migration Notes for Existing Users

When users update to this version:
1. They will be prompted to select their spreadsheet again (one-time)
2. Old `sheetNameToId` storage will be ignored
3. New storage uses single `spreadsheetId` key
4. All existing spreadsheets remain intact in their Google Drive

## Security Notes

- API keys are client-side visible (this is normal for Picker API)
- Actual file access is controlled by OAuth scope, not API key
- `drive.file` scope only grants access to files user explicitly selects
- No annual CASA security assessment required with `drive.file` scope

## Support Resources

- [Google Picker API Documentation](https://developers.google.com/picker/docs)
- [Chrome Extension OAuth Guide](https://developer.chrome.com/docs/extensions/mv3/oauth2/)
- [Google Drive API Scopes](https://developers.google.com/drive/api/guides/api-specific-auth)

## Contact

For questions about this implementation:
- Review [`GOOGLE_OAUTH_IMPLEMENTATION_PLAN.md`](GOOGLE_OAUTH_IMPLEMENTATION_PLAN.md:1)
- Check [`GOOGLE_OAUTH_RESPONSE.md`](GOOGLE_OAUTH_RESPONSE.md:1) for deployment steps