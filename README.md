# LabSaver - Health Data Exporter

A Chrome extension that exports lab results from multiple health providers to Google Sheets.

## Quick Start (for Developers)

1.  **Clone the repository and install dependencies:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/labsaver.git
    cd labsaver
    npm install
    ```
2.  **Set up your development OAuth credentials** by following the [`OAUTH_SETUP.md`](./OAUTH_SETUP.md) guide.
3.  **Build the development version:**
    ```bash
    npm run build:dev
    ```
4.  **Load the extension in Chrome** from the `dist/` directory.

For a complete guide, see the [`DEVELOPMENT.md`](./DEVELOPMENT.md) documentation.

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

## Installation (for Users)

**Coming Soon!** Once published, you will be able to install LabSaver directly from the Chrome Web Store.

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

## Architecture and Build System

The extension uses a consolidated codebase and a Node.js-based build system that handles environment-specific configurations (development vs. production). It automatically generates the `manifest.json` and packages the extension for distribution.

For a complete explanation of the project structure, build process, and design decisions, please see the full [`ARCHITECTURE.md`](./ARCHITECTURE.md) document.

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

## Documentation Index

- **[`ARCHITECTURE.md`](./ARCHITECTURE.md)**: A deep dive into the project structure, build system, and design decisions.
- **[`DEVELOPMENT.md`](./DEVELOPMENT.md)**: A complete guide for setting up a local environment and contributing to the project.
- **[`RELEASE_PROCESS.md`](./RELEASE_PROCESS.md)**: Step-by-step instructions for publishing new versions to the Chrome Web Store.
- **[`AI_CONTEXT.md`](./AI_CONTEXT.md)**: Essential rules and context for AI assistants working on this codebase.
- **[`CONTRIBUTING.md`](./CONTRIBUTING.md)**: Guidelines for contributing to the project.
- **[`CHANGELOG.md`](./CHANGELOG.md)**: A complete history of changes for each version.
- **[`OAUTH_SETUP.md`](./OAUTH_SETUP.md)**: Instructions for creating and configuring Google OAuth credentials.

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