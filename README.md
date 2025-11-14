# Function Health Lab Exporter

Chrome extension to export your complete Function Health biomarker history to Google Sheets.

## Features

- ✅ One-click export of all biomarker data
- ✅ Complete historical results with dates
- ✅ Numeric values, units, and reference ranges
- ✅ Status indicators (in/out/above/below range)
- ✅ Auto-refresh (replaces sheet data on each export)
- ✅ 100% local processing (no external servers)
- ✅ Direct Google Sheets integration via OAuth

## Installation

### Step 1: Load Extension in Chrome

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `function-health-exporter` folder
6. Note the Extension ID (you'll need this for OAuth setup)

### Step 2: Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Google Sheets API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: **Chrome Extension**
   - Name: "Function Health Exporter"
   - Extension ID: Paste the ID from Step 1
   - Click "Create"

5. Copy the Client ID (format: `xxxxx.apps.googleusercontent.com`)

6. Update `manifest.json`:
   - Open `manifest.json` in the extension folder
   - Replace `YOUR_GOOGLE_OAUTH_CLIENT_ID.apps.googleusercontent.com` with your actual Client ID
   - Save the file

7. Reload the extension in Chrome:
   - Go back to `chrome://extensions/`
   - Click the reload icon on your extension

### Step 3: First Export (Auto-creates Sheet)

1. Log in to [Function Health](https://my.functionhealth.com/)
2. Navigate to any page on the Function Health site
3. Click the blue "Export Function Labs" button
4. On first use, you'll be prompted to authorize Google Sheets access
5. The extension will automatically create a new Google Sheet named "Function Health Data"
6. Wait for "Exported!" confirmation
7. The console will log the Sheet URL, or find it in your Google Drive

**Note:** The extension automatically creates and manages the Google Sheet. You don't need to create one manually. The Sheet ID is stored in Chrome storage and reused for all future exports.

## Usage

1. Log in to [Function Health](https://my.functionhealth.com/)
2. Navigate to any page on the Function Health site
3. Look for the blue "Export Function Labs" button in the bottom-right corner
4. Click the button
5. On first use, you'll be prompted to authorize Google Sheets access
6. The extension will automatically create a new Google Sheet (first time only)
7. Wait for "Exported!" confirmation (usually 2-3 seconds)
8. Open your Google Sheet to view the data

**Subsequent Exports:** Each time you click Export, the sheet is completely cleared and rewritten with the latest data from Function Health. This ensures your sheet always matches your current Function Health data exactly.

**Finding Your Sheet:**
- Check your Google Drive for "Function Health Data"
- Or look in the browser console for the Sheet URL (logged on first export)

## How Exports Work

### Full Refresh Strategy

The extension uses a "full refresh" approach on every export:

1. **Fetches latest data** from Function Health API
2. **Clears the entire sheet** (removes all existing data)
3. **Writes complete dataset** fresh from the API

### Behavior on Subsequent Exports

**Case 1: Data Unchanged**
- If you export multiple times without new lab results, the sheet will contain identical data
- The extension still clears and rewrites everything to ensure data integrity
- No duplicates are created because the sheet is cleared first

**Case 2: Data Changed**
- When you have new lab results from Function Health, the next export will include them
- The sheet is cleared and rewritten with the complete updated dataset
- All historical results are preserved (Function Health API returns full history)

### Why Full Refresh?

This approach ensures:
- ✅ **No duplicates** - Sheet is always cleared before writing
- ✅ **Data integrity** - Sheet always matches Function Health exactly
- ✅ **Simplicity** - No complex change detection or merge logic
- ✅ **Reliability** - Works consistently regardless of sheet state

### Export Frequency

You can export as often as you like:
- **After new lab results** - To capture your latest biomarker data
- **Before appointments** - To share current data with practitioners
- **For analysis** - To refresh your dataset for charts/dashboards
- **Anytime** - The extension handles all data management automatically

**Note:** Each export completely replaces the sheet contents. If you've made manual edits to the sheet (formulas, formatting, notes), they will be lost on the next export. For custom analysis, consider copying the data to a separate sheet.

## Data Schema

The exported sheet contains these columns:

| Column | Description |
|--------|-------------|
| biomarkerId | Unique biomarker identifier |
| biomarkerName | Name (e.g., "Hematocrit") |
| primaryCategory | Category (e.g., "Blood Health") |
| questBiomarkerCode | Quest Diagnostics code |
| questBiomarkerId | Quest biomarker ID |
| dateOfService | Test date (YYYY-MM-DD) |
| testResultRaw | Raw result value |
| testResultNumeric | Extracted numeric value |
| measurementUnits | Units (e.g., "mg/dL") |
| statusLabel | IN_RANGE, OUT_OF_RANGE, BELOW_RANGE, ABOVE_RANGE |
| testResultOutOfRange | Boolean flag |
| rangeString | Reference range text |
| rangeMinDisplay | Display minimum |
| rangeMaxDisplay | Display maximum |
| questReferenceRange | Quest reference range |
| improving | Trend indicator |
| neutral | No change indicator |
| hasNewResults | Recent updates flag |
| type | Category type code |
| requisitionId | Test panel ID |
| createdAt | Record creation timestamp |

## Troubleshooting

### "Export Failed" Error

- Check that you're logged into Function Health
- Ensure you've authorized Google Sheets access
- Verify the Sheet has a tab named "Sheet1" (auto-created sheets have this by default)
- Check Chrome DevTools console for detailed errors
- If the sheet was deleted, clear Chrome storage and export again to create a new one:
  ```javascript
  chrome.storage.sync.remove('spreadsheetId')
  ```

### OAuth Issues

- Verify Client ID in `manifest.json` matches Google Cloud Console
- Ensure Extension ID is whitelisted in OAuth settings
- Try removing and re-adding OAuth consent

### No Button Appears

- Refresh the Function Health page
- Check that you're on `my.functionhealth.com`
- Verify extension is enabled in `chrome://extensions/`

### API Rate Limits

- Google Sheets API has quotas (100 requests per 100 seconds per user)
- Wait a minute between exports if you hit limits

## Privacy & Security

- All data processing happens locally in your browser
- No external servers involved (except Google Sheets API)
- Your health data is never transmitted to third parties
- OAuth tokens are managed securely by Chrome
- Extension only accesses Function Health when you click Export

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Chrome DevTools console for errors
3. Verify all setup steps were completed correctly

## License

MIT License - Use freely for personal health data management