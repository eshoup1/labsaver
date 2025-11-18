# LabSaver - Health Data Exporter

A Chrome extension that exports lab results from multiple health providers to Google Sheets. Currently supports **Function Health** and **Sutter Health**.

## Features

### Function Health Export
- Exports all biomarker results from Function Health
- Creates multiple sheets:
  - `FH_Values` - All lab results with full history
  - `FH_Definitions` - Biomarker definitions and reference ranges
  - `FH_Latest` - Most recent value for each biomarker
  - `FH_Table` - Pivot table view (biomarkers × dates)
  - `FH_Grouped` - Results grouped by category
- **NEW:** Automatic LOINC code derivation for standardized lab identification

### Sutter Health Export
- Exports all lab results from Sutter Health MyChart
- Creates sheet:
  - `SH_Export` - All component-level lab results
- **NEW:** Automatic LOINC code derivation for standardized lab identification

### LOINC Derivation (NEW)
- Automatically adds standardized LOINC codes to exported lab results
- Enables cross-system comparison between Function Health and Sutter Health data
- Uses exact mapping (no guessing) - returns empty string when no mapping exists
- Adds `Derived_LOINC` column as the last column (position 22) in both sheets
- **Automated Quest LOINC Mapping**: Build-time script generates mappings from Quest Diagnostics API
- Customizable mapping files for each health system
- See [QUEST_LOINC_MAPPING.md](./QUEST_LOINC_MAPPING.md) for Quest mapping documentation
- See [LOINC_VERIFICATION.md](./LOINC_VERIFICATION.md) for verification guide
- See [LOINC_MAPPINGS.md](./LOINC_MAPPINGS.md) for complete mapping reference

### Shared Features
- Both exporters write to the same Google Sheet (stored as `masterSheetId`)
- Data is kept separate using tab prefixes (`FH_` and `SH_`)
- One-click export with automatic authentication
- No data merging (yet) - each system maintains its own tabs

## Installation

### Option 1: Chrome Web Store (Recommended)

**Coming Soon!** Once published, you'll be able to install directly from the Chrome Web Store:

1. Visit the [LabSaver Chrome Web Store page](#) (link will be added after publication)
2. Click "Add to Chrome"
3. Click "Add extension" to confirm
4. The extension icon will appear in your Chrome toolbar

### Option 2: Developer Mode (For Development)

If you want to use the development version or contribute to the project:

1. Clone this repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/labsaver.git
   cd labsaver/lab-result-exporter
   ```

2. Set up OAuth credentials (required):
   - Follow the instructions in [OAUTH_SETUP.md](./OAUTH_SETUP.md)
   - Update `manifest.json` with your OAuth client ID

3. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked"
   - Select the `lab-result-exporter` directory
   - The extension will appear in your extensions list

**Note:** For development installation, you must configure your own OAuth credentials. See [OAUTH_SETUP.md](./OAUTH_SETUP.md) for detailed instructions.

## Usage

### Function Health
1. Log in to [Function Health](https://my.functionhealth.com/)
2. Click the "Export Labs" button that appears in the top-right corner
3. Enter a name for your Google Sheet (or use the default)
4. Authorize Google Sheets access if prompted
5. Wait for the export to complete

### Sutter Health
1. Log in to [Sutter Health MyHealthOnline](https://myhealthonline.sutterhealth.org/)
2. Navigate to the Test Results section
3. Click the "Export Sutter Labs" button that appears in the top-right corner
4. The extension will use the same Google Sheet as Function Health exports
5. Wait for the export to complete

## Data Structure

### Function Health Columns (FH_Values)
- biomarkerId, biomarkerName, primaryCategory
- questBiomarkerCode, questBiomarkerId
- dateOfService, testResultRaw, testResultNumeric
- measurementUnits, statusLabel, testResultOutOfRange
- rangeString, rangeMinDisplay, rangeMaxDisplay
- questReferenceRange, improving, neutral
- hasNewResults, type, requisitionId, createdAt
- **Derived_LOINC** - Standardized LOINC code (when mapping exists)

### Sutter Health Columns (SH_Export)
- orderKey, orderName, orderDisplayDate, resultStatus
- componentID, componentName, componentCommonName, loincCode
- value, numericValue, units
- referenceRangeFormatted, referenceRangeLowDisplay, referenceRangeHighDisplay
- abnormalFlagCategory, authorizingProviderName
- resultTimestampDisplay, prioritizedInstantISO, prioritizedInstantDisplay
- collectionTimestampsDisplay, resultingLabName
- **Derived_LOINC** - Standardized LOINC code (when mapping exists)

## Technical Details

### Architecture
- **Manifest V3** Chrome Extension
- **Content Script** (`content.js`) - Injects export buttons and handles data fetching
- **Background Service Worker** (`background.js`) - Processes data and writes to Google Sheets
- **Google Sheets API** - For data storage and sharing

### Storage
- `masterSheetId` - The shared Google Sheet ID for both FH and SH exports
- `spreadsheetId` - Temporary storage during FH export process
- `lastSheetName` - Remembers the last sheet name used

### API Endpoints

**Function Health:**
- `https://production-member-app-mid-lhuqotpy2a-ue.a.run.app/api/v1/results-report`

**Sutter Health:**
- `POST /MHO/api/test-results/GetList` - Get list of lab orders
- `POST /MHO/api/test-results/GetDetails` - Get details for each order

## Privacy & Security

**Your privacy is our top priority.** This extension is designed with privacy-first principles:

### Data Processing
- ✅ **All data processing happens locally** in your browser
- ✅ **No data is sent to external servers** (except Google Sheets, which you control)
- ✅ **No tracking or analytics** - we don't collect any usage data
- ✅ **No user data storage** - the extension doesn't store your health data

### What the Extension Does
- Reads lab results from health portals using your existing browser session
- Processes and formats the data entirely in your browser
- Writes data only to your personal Google Sheet (which you own and control)

### What the Extension Does NOT Do
- ❌ Does not send data to any third-party servers
- ❌ Does not track which tests you have or their values
- ❌ Does not store your health information
- ❌ Does not share data with anyone

### Authentication
- Uses your existing browser session cookies for health portal access
- Uses OAuth 2.0 for Google Sheets access (standard Google security)
- All credentials stay in your browser

### Open Source
- All code is open source and available for review
- You can verify exactly what the extension does
- No hidden functionality or data collection

## Quest LOINC Mapping - Manual Workflow

The extension uses a **manual, privacy-focused workflow** to generate Quest biomarker code to LOINC code mappings:

### How It Works

1. **Export your data**: Use the extension to export Function Health data to Google Sheets
2. **Review the export**: Check the `Derived_LOINC` column - empty cells indicate unmapped Quest codes
3. **Identify codes to map**: Note which Quest codes you want to add LOINC mappings for
4. **Create input file**: Make a JSON or CSV file with those Quest codes
5. **Run mapping script**: Use the build script to fetch Quest metadata and create mappings

### Manual Mapping Process

Create a JSON file with the Quest codes you want to map:

**Example `my_quest_codes.json`:**
```json
[
  {
    "questBiomarkerCode": "12345678",
    "biomarkerName": "Test Name",
    "units": "mg/dL"
  }
]
```

Then run the mapping builder:

```bash
cd labsaver
npm run build:quest-map -- --input data/my_quest_codes.json
```

This will:
1. Fetch test metadata from Quest Diagnostics public API
2. Apply strict validation rules (exact name/unit matching)
3. Update [`data/quest_loinc_map.json`](data/quest_loinc_map.json) with new mappings
4. Preserve all existing mappings

### Why Manual?

We chose a manual workflow to protect your privacy:
- **No automatic tracking** of which tests you have
- **You control** which codes to map
- **No data collection** about your health conditions
- **Privacy-first** design

### Validation

Validate the mapping file structure:

```bash
npm run validate:quest-map
```

For complete documentation, see [QUEST_LOINC_MAPPING.md](./QUEST_LOINC_MAPPING.md).

## Future Enhancements

- Data merging and normalization across systems using LOINC codes
- Trend analysis and visualization
- Additional health system support
- Expanded LOINC mapping coverage
- Automatic LOINC code suggestions for unmapped tests

## Documentation

- [Privacy Policy](./PRIVACY_POLICY.md) - How we handle your data
- [OAuth Setup Guide](./OAUTH_SETUP.md) - Configure Google OAuth credentials
- [Publication Guide](./PUBLICATION_GUIDE.md) - How to publish to Chrome Web Store
- [Store Listing](./STORE_LISTING.md) - Chrome Web Store listing details
- [Quest LOINC Mapping](./QUEST_LOINC_MAPPING.md) - Quest code mapping documentation
- [LOINC Verification](./LOINC_VERIFICATION.md) - How to verify LOINC codes
- [LOINC Mappings](./LOINC_MAPPINGS.md) - Complete mapping reference
- [Contributing](./CONTRIBUTING.md) - Contribution guidelines
- [Changelog](./CHANGELOG.md) - Version history

## License

MIT License - See [LICENSE](./LICENSE) file for details

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## Support

- **Issues:** [Open an issue on GitHub](https://github.com/YOUR_USERNAME/labsaver/issues)
- **Discussions:** [GitHub Discussions](https://github.com/YOUR_USERNAME/labsaver/discussions)
- **Email:** [Your support email]

## Acknowledgments

- Function Health for providing comprehensive biomarker testing
- Sutter Health for their patient portal
- Quest Diagnostics for their public LOINC API
- The LOINC community for standardized lab codes