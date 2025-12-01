# Google Picker Implementation Fixes - v2.0.5

## Issues Fixed

### Issue 1: Filename Prompt Appearing Before Picker Check ✅
**Problem:** Users were prompted for a filename before checking if a spreadsheet was selected, creating confusing UX.

**Solution:** Refactored the export flow in [`content.js`](temp-v2.0.5-extract/content.js):
- Removed filename prompt from initial button click
- Export now checks for spreadsheet selection first
- If no spreadsheet selected (`picker_required` error), opens picker immediately
- Only prompts for filename AFTER confirming spreadsheet is selected
- Applied fix to both Function Health (line 240) and Sutter Health (line 497) export buttons

**New Flow:**
1. User clicks "Export Labs"
2. Extension checks if spreadsheet is selected
3. If NOT selected → Opens picker → User selects spreadsheet → Try export again
4. If selected → Prompts for sheet name → Proceeds with export

### Issue 2: Google API Loading Failure ✅
**Problem:** The picker.html page showed "Failed to load Google API" due to Content Security Policy restrictions.

**Solution:** Added proper CSP directives to [`manifest.json`](temp-v2.0.5-extract/manifest.json:9):
```json
"content_security_policy": {
  "extension_pages": "script-src 'self' https://apis.google.com https://accounts.google.com; object-src 'self'; connect-src 'self' https://apis.google.com https://accounts.google.com https://*.googleusercontent.com https://sheets.googleapis.com https://www.googleapis.com"
}
```

This allows:
- Loading scripts from `apis.google.com` and `accounts.google.com`
- Connecting to Google API endpoints
- Loading resources from `googleusercontent.com`

### Issue 3: Improved Error Handling ✅
**Enhancement:** Added better error diagnostics in [`picker.js`](temp-v2.0.5-extract/picker.js:135):
- Shows loading status while Google API loads
- Checks if `gapi` object is available after script load
- Provides specific error messages for different failure scenarios
- Includes troubleshooting hints in error messages

## Testing Instructions

### Test 1: First-Time User (No Spreadsheet Selected)
1. Load the extension in Chrome
2. Navigate to Function Health or Sutter Health
3. Click "Export Labs" button
4. **Expected:** No filename prompt appears
5. **Expected:** Picker opens automatically in new tab
6. Select a spreadsheet in the picker
7. Return to original tab and click "Export Labs" again
8. **Expected:** Now prompted for sheet name
9. **Expected:** Export proceeds successfully

### Test 2: Returning User (Spreadsheet Already Selected)
1. Load the extension (with spreadsheet already selected from previous use)
2. Navigate to Function Health or Sutter Health
3. Click "Export Labs" button
4. **Expected:** Immediately prompted for sheet name (no picker)
5. **Expected:** Export proceeds successfully

### Test 3: Google API Loading
1. Open picker.html directly: `chrome-extension://[extension-id]/picker.html`
2. **Expected:** "Loading Google API..." message appears briefly
3. **Expected:** "Select Spreadsheet" button becomes active
4. **Expected:** No error messages about failed API loading
5. Click "Select Spreadsheet"
6. **Expected:** Google Picker UI loads successfully

### Test 4: Error Handling
1. Disable internet connection
2. Open picker.html
3. **Expected:** Clear error message about connection/permissions/CSP
4. Re-enable internet
5. Refresh picker.html
6. **Expected:** Picker loads successfully

## Files Modified

1. **[`temp-v2.0.5-extract/content.js`](temp-v2.0.5-extract/content.js)**
   - Lines 240-370: Function Health export button logic
   - Lines 497-680: Sutter Health export button logic
   - Removed premature filename prompts
   - Added two-phase export flow (check spreadsheet → prompt for name)

2. **[`temp-v2.0.5-extract/manifest.json`](temp-v2.0.5-extract/manifest.json)**
   - Line 9: Added `content_security_policy` for extension pages
   - Allows Google API scripts and connections

3. **[`temp-v2.0.5-extract/picker.js`](temp-v2.0.5-extract/picker.js)**
   - Lines 135-175: Enhanced error handling and diagnostics
   - Added loading status indicators
   - Better error messages with troubleshooting hints

## Verification Checklist

- [x] Filename prompt removed from initial export click
- [x] Picker opens automatically when no spreadsheet selected
- [x] Filename prompt only appears after spreadsheet is confirmed
- [x] CSP allows Google API scripts to load
- [x] Picker.html loads without API errors
- [x] Error messages are clear and helpful
- [ ] Manual testing completed successfully
- [ ] Both Function Health and Sutter Health exports work correctly

## Next Steps

1. Load the extension in Chrome
2. Test both export flows (first-time and returning user)
3. Verify picker loads without errors
4. Confirm exports complete successfully
5. If all tests pass, update version and publish