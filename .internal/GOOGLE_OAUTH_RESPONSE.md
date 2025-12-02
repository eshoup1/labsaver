# Response to Google OAuth Verification Team

## Email Draft

**Subject:** Re: OAuth Verification - Confirming narrower scopes

---

Hello Google Developer Relations Team,

Thank you for your feedback regarding our OAuth scope request for LabSaver.

After careful review of your recommendations, we have implemented the changes to use the narrower `https://www.googleapis.com/auth/drive.file` scope as suggested.

## Changes Implemented

We have updated our application with the following modifications:

1. **Updated OAuth Scope**: Changed from `https://www.googleapis.com/auth/spreadsheets` to `https://www.googleapis.com/auth/drive.file`

2. **Integrated Google Picker API**: Implemented the Google Picker to allow users to explicitly select which spreadsheet they want to use for their lab results

3. **Simplified Storage Model**: Removed the name-based spreadsheet lookup system and now store only the user-selected spreadsheet ID

4. **Updated Manifest**: Modified our Chrome extension manifest to include the necessary permissions for the Picker API

## User Experience

The updated flow works as follows:
- On first use, users are prompted to select a spreadsheet via the Google Picker
- The extension remembers their selection for all future exports
- Users can change their spreadsheet selection at any time through the extension settings

This approach provides users with explicit control over which file our extension can access, aligning with the principle of least privilege while maintaining a smooth user experience after the initial setup.

## Confirmation

**Confirming narrower scopes**

We have:
- Added the `https://www.googleapis.com/auth/drive.file` scope to our Cloud Console project
- Removed the `https://www.googleapis.com/auth/spreadsheets` scope from our application codebase and Cloud Console project
- Integrated the Google Picker API for file selection

The changes have been implemented in our codebase and are ready for deployment pending your approval.

Thank you for your guidance in helping us implement a more secure permission model for our users.

Best regards,  
Eric Shoup  
LabSaver Developer  
[Your contact email]

---

## Implementation Summary

### Files Modified

1. **`temp-v2.0.3-extract/manifest.json`**
   - Changed OAuth scope from `spreadsheets` to `drive.file`
   - Added `https://apis.google.com/*` to host_permissions for Picker API
   - Added picker.html and picker.js to web_accessible_resources

2. **`temp-v2.0.3-extract/background.js`**
   - Removed `getOrCreateSpreadsheet()` function (lines 145-194)
   - Simplified `getSpreadsheetId()` to return null if not set
   - Added `storeSpreadsheetId()` helper function
   - Updated `syncSheetWithData()` to check for spreadsheet ID
   - Updated `processSutterHealthExport()` to check for spreadsheet ID
   - Added message handlers for picker selection/cancellation
   - Modified error responses to return `picker_required` status

3. **`temp-v2.0.3-extract/content.js`**
   - Added `openPicker()` function to launch picker window
   - Added `waitForSpreadsheetSelection()` to poll for user selection
   - Updated both Function Health and Sutter Health export handlers to:
     - Detect `picker_required` response
     - Open picker when needed
     - Retry export after spreadsheet selected

4. **`temp-v2.0.3-extract/picker.html`** (NEW)
   - Clean, user-friendly interface for spreadsheet selection
   - Instructions for users
   - Status messages and loading indicators

5. **`temp-v2.0.3-extract/picker.js`** (NEW)
   - Loads Google Picker API
   - Handles OAuth token retrieval
   - Configures picker to show only Google Sheets
   - Stores selected spreadsheet ID
   - Notifies background script of selection

### Key Changes

**Before:**
- Extension automatically searched for spreadsheets by name
- Maintained a name-to-ID mapping in storage
- Required broad `spreadsheets` scope to search Drive

**After:**
- Users explicitly select their spreadsheet via Google Picker
- Extension stores single spreadsheet ID
- Uses restricted `drive.file` scope (no verification needed)
- No annual CASA security assessment required

### Testing Checklist

Before deploying to production:

- [ ] Test first-time user flow (picker appears)
- [ ] Test returning user flow (picker doesn't appear)
- [ ] Test Function Health export with picker
- [ ] Test Sutter Health export with picker
- [ ] Test picker cancellation handling
- [ ] Test spreadsheet selection persistence
- [ ] Verify OAuth token works with new scope
- [ ] Test on multiple browsers (Chrome, Edge)
- [ ] Verify picker window closes after selection
- [ ] Test error handling for invalid spreadsheet IDs

### Next Steps

1. **Update Google Cloud Console**
   - Remove `https://www.googleapis.com/auth/spreadsheets` scope
   - Add `https://www.googleapis.com/auth/drive.file` scope
   - Save changes

2. **Send Response Email**
   - Copy the email draft above
   - Send to Google OAuth verification team
   - Reply directly to their email thread

3. **Test Implementation**
   - Load unpacked extension in Chrome
   - Test both Function Health and Sutter Health exports
   - Verify picker appears on first use
   - Verify subsequent exports work without picker

4. **Deploy to Production**
   - After Google approves the scope change
   - Update extension in Chrome Web Store
   - Users will need to re-authorize the extension

5. **Update Documentation**
   - Update README with new user flow
   - Update PRIVACY_POLICY if needed
   - Add migration notes for existing users

### Important Notes

- **Breaking Change**: Existing users will need to re-select their spreadsheet
- **No Data Loss**: All existing spreadsheets remain intact
- **Better Security**: Users have explicit control over file access
- **Cost Savings**: No annual CASA assessment ($15k-75k) required
- **Faster Approval**: No verification process for `drive.file` scope

### Developer API Key

**IMPORTANT**: The `picker.js` file contains a placeholder for the Google API Developer Key:

```javascript
const DEVELOPER_KEY = 'AIzaSyBqTXH8vqH_5kqH5qH5qH5qH5qH5qH5qH5'; // TODO: Replace with actual API key
```

You need to:
1. Go to Google Cloud Console
2. Enable the Google Picker API
3. Create an API key (or use existing one)
4. Replace the placeholder in `picker.js` with your actual API key

Without a valid API key, the Picker will not work.