# Chrome Web Store Listing - LabSaver

## Extension Name
LabSaver - Health Data Exporter

## Short Description (132 characters max)
Export lab results from Function Health and Sutter Health to Google Sheets. Privacy-first, open source, with LOINC standardization.

## Detailed Description (16,000 characters max)

Take control of your health data with LabSaver, a privacy-first Chrome extension that exports lab results from multiple health providers directly to your personal Google Sheets.

### 🔒 Privacy First
Your health data is precious. LabSaver processes everything locally in your browser - no data is sent to our servers. Your lab results flow directly from your health portal to your Google Sheet, with no intermediaries.

### 🏥 Supported Health Systems
- **Function Health**: Export all biomarker results with full history
- **Sutter Health**: Export lab results from MyHealthOnline

### ✨ Key Features

**Comprehensive Data Export**
- All lab results with complete history
- Reference ranges and normal values
- Test dates and ordering information
- Organized into multiple sheets for easy analysis

**LOINC Standardization**
- Automatic LOINC code derivation for standardized lab identification
- Enables cross-system comparison between different health providers
- Uses exact mapping (no guessing) for accuracy

**Smart Organization**
- Function Health creates 5 sheets: Values, Definitions, Latest, Table view, and Grouped by category
- Sutter Health creates a comprehensive export sheet
- Both systems write to the same Google Sheet for unified tracking

**One-Click Export**
- Simple button appears on health portal pages
- Automatic Google authentication
- Progress tracking during export
- No manual data entry required

### 📊 What You Get

**Function Health Sheets:**
- FH_Values: All lab results with full history
- FH_Definitions: Biomarker definitions and reference ranges
- FH_Latest: Most recent value for each biomarker
- FH_Table: Pivot table view (biomarkers × dates)
- FH_Grouped: Results grouped by category

**Sutter Health Sheet:**
- SH_Export: All component-level lab results with LOINC codes

**Data Includes:**
- Test names and values
- Units of measurement
- Reference ranges
- Out-of-range indicators
- Test dates and timestamps
- LOINC codes for standardization
- Provider information

### 🔐 Security & Privacy

**What We Do:**
✅ Process all data locally in your browser
✅ Write directly to your personal Google Sheet
✅ Use standard OAuth 2.0 for Google authentication
✅ Open source code for full transparency

**What We DON'T Do:**
❌ No data collection or storage on our servers
❌ No tracking or analytics
❌ No third-party data sharing
❌ No selling of your data

### 🚀 How It Works

1. Install the extension
2. Log in to your health portal (Function Health or Sutter Health)
3. Click the "Export Labs" button that appears
4. Authorize Google Sheets access (one-time)
5. Your data is exported to your personal Google Sheet

### 🛠️ Technical Details

- Manifest V3 Chrome Extension
- Uses Google Sheets API for data storage
- Content scripts for data extraction
- Background service worker for processing
- OAuth 2.0 for secure authentication

### 📖 Open Source

LabSaver is fully open source. Review our code, contribute improvements, or verify our privacy claims:
- GitHub: [Your repository URL]
- License: MIT

### 🎯 Use Cases

- Track lab trends over time
- Compare results across providers
- Share data with healthcare providers
- Maintain personal health records
- Analyze biomarker patterns
- Export for second opinions

### 🔄 Future Enhancements

- Additional health system support
- Data merging and normalization
- Trend analysis and visualization
- Expanded LOINC mapping coverage
- Export to other formats

### 💡 Why LabSaver?

Healthcare data should be accessible, portable, and under your control. LabSaver empowers you to:
- Own your health data
- Track your health journey
- Make informed decisions
- Share data easily with providers
- Maintain comprehensive records

### 📋 Requirements

- Google Chrome browser
- Active account with Function Health or Sutter Health
- Google account for Sheets access

### 🆘 Support

- Documentation: See README.md in our GitHub repository
- Issues: Report bugs on GitHub
- Questions: Open a discussion on GitHub

### 📜 Compliance

- Chrome Web Store Developer Program Policies
- Google API Services User Data Policy
- GDPR principles
- CCPA principles

---

**Take control of your health data today with LabSaver!**

## Category
Productivity

## Language
English

## Screenshots Needed (1280x800 or 640x400)

1. **Function Health Export Button**
   - Show the "Export Labs" button on Function Health portal
   - Caption: "One-click export from Function Health"

2. **Google Sheets Result - FH_Values**
   - Show populated FH_Values sheet with lab data
   - Caption: "Complete lab history in Google Sheets"

3. **Google Sheets Result - FH_Table**
   - Show the pivot table view
   - Caption: "Pivot table view for easy trend analysis"

4. **Sutter Health Export Button**
   - Show the "Export Sutter Labs" button
   - Caption: "Export from Sutter Health MyChart"

5. **LOINC Codes**
   - Show Derived_LOINC column with standardized codes
   - Caption: "Automatic LOINC standardization for cross-system comparison"

## Promotional Images

### Small Tile (440x280)
- LabSaver logo/icon
- Text: "Export Your Lab Results"
- Subtitle: "Privacy-First Health Data"

### Large Tile (920x680)
- LabSaver logo/icon
- Text: "Take Control of Your Health Data"
- Features list:
  - ✓ Function Health & Sutter Health
  - ✓ Export to Google Sheets
  - ✓ LOINC Standardization
  - ✓ Privacy-First Design

### Marquee (1400x560)
- Split screen showing:
  - Left: Health portal with export button
  - Right: Google Sheets with organized data
- Text: "LabSaver - Your Health Data, Your Control"

## Keywords (20 max)
- health data
- lab results
- medical records
- Function Health
- Sutter Health
- Google Sheets
- health export
- LOINC
- biomarkers
- lab tests
- health tracking
- medical data
- patient portal
- health records
- lab history
- test results
- health analytics
- medical export
- PHR
- personal health

## Website
[Your website or GitHub repository URL]

## Support Email
[Your support email]

## Privacy Policy URL
[Link to hosted PRIVACY_POLICY.md]

## Permissions Justification

**identity**
- Required to authenticate with Google for Sheets API access
- Used only for OAuth 2.0 flow

**storage**
- Required to remember user's Google Sheet ID
- Stores only sheet preferences locally
- No health data is stored

**scripting**
- Required to inject export buttons into health portal pages
- Enables content script functionality

**Host Permissions:**
- my.functionhealth.com: Access Function Health lab data
- production-member-app-mid-lhuqotpy2a-ue.a.run.app: Function Health API
- myhealthonline.sutterhealth.org: Access Sutter Health lab data
- sheets.googleapis.com: Write data to Google Sheets

All permissions are essential for core functionality and are used only as described.

## Single Purpose Description
LabSaver exports lab results from health portals (Function Health and Sutter Health) to Google Sheets, enabling users to maintain personal health records with standardized LOINC codes.

## Target Audience
- Function Health members
- Sutter Health patients
- Health-conscious individuals
- People tracking biomarkers
- Patients managing chronic conditions
- Healthcare data enthusiasts