# LabSaver Implementation Notes

## Project Overview
LabSaver is a Chrome Extension (Manifest V3) that exports lab results from Function Health and Sutter Health to Google Sheets. Both systems write to the same spreadsheet with separate tab prefixes to keep data organized.

## Current Status (as of 2025-11-16)

### ✅ Function Health Export - FULLY WORKING
- All features implemented and tested successfully
- Creates/updates Google Sheets
- Exports to multiple tabs with FH_ prefix
- **NEW**: Quest LOINC mapping with manual, privacy-focused workflow

### ✅ Sutter Health Export - REFACTORED AND FIXED
- **FIXED**: API calls now made from content script (same-origin context)
- PageNonce extracted from page and used in same-origin requests
- All data fetching and flattening done in content script
- Background script only handles Google Sheets writing
- Proper error detection for non-JSON responses

### ✅ Quest LOINC Mapping System - FULLY IMPLEMENTED
- **Build-time mapping generation** from Quest Diagnostics API
- **Strict validation rules** (exact matching only, no fuzzy logic)
- **Manual, privacy-focused workflow** - user controls which codes to map
- **13 Quest codes mapped** to LOINC codes
- **59 comprehensive tests** covering all mappings and edge cases

## Architecture

### Files Structure
```
labsaver/
├── manifest.json          # Extension configuration
├── content.js            # Injects buttons, handles data fetching
├── background.js         # Processes data, writes to Google Sheets
├── loinc-derivation.js   # LOINC code derivation logic
├── data/
│   ├── quest_loinc_map.json  # Quest → LOINC mappings (build-time generated)
│   ├── sh_loinc_map.json     # Sutter Health → LOINC mappings
│   └── sample_quest_codes.json  # Sample input for mapping builder
├── scripts/
│   ├── buildQuestLoincMap.js    # Automated Quest mapping builder
│   └── validateQuestLoincMap.js # Mapping file validator
├── tests/
│   └── loinc-derivation.test.js # LOINC derivation tests (59 tests)
├── icons/               # Extension icons
├── README.md            # User documentation
├── QUEST_LOINC_MAPPING.md  # Quest mapping system documentation
├── LOINC_MAPPINGS.md    # Complete LOINC mapping reference
└── IMPLEMENTATION_NOTES.md  # This file
```

### Key Components

#### 1. manifest.json
- **Name**: "LabSaver - Health Data Exporter"
- **Version**: 2.0.0
- **Permissions**: 
  - `identity` - OAuth for Google Sheets
  - `storage` - Store sheet mappings
  - `scripting` - Inject content scripts
- **Host Permissions**:
  - `https://my.functionhealth.com/*`
  - `https://production-member-app-mid-lhuqotpy2a-ue.a.run.app/*`
  - `https://myhealthonline.sutterhealth.org/*`
  - `https://sheets.googleapis.com/*`
- **OAuth Scopes**:
  - `https://www.googleapis.com/auth/spreadsheets`
  - `https://www.googleapis.com/auth/userinfo.email`
  - **NOTE**: NO Drive API permissions (privacy-friendly)

#### 2. content.js
**Purpose**: Injects export buttons and handles data fetching

**Function Health Button**:
- Appears on all Function Health pages
- Fetches data from Firebase-authenticated API
- Sends data to background script

**Sutter Health Button**:
- Only appears on Test Results pages (`/test-results` in URL)
- Extracts PageNonce using multiple detection methods
- Calls GetList API with PageNonce (same-origin request)
- Fetches details for each order via GetDetails API
- Flattens component-level results into rows
- Sends pre-flattened rows to background script

**PageNonce Detection Methods** (in order):
1. `window.PageNonce` global variable
2. `<input name="PageNonce">` hidden field
3. `<meta name="PageNonce">` tag
4. Script tag content matching `/PageNonce\s*=\s*["']([^"']+)["']/`
5. `[data-page-nonce]` attribute

#### 3. background.js
**Purpose**: Processes data and writes to Google Sheets

**Key Functions**:

**Function Health**:
- `parseFunctionHealthData()` - Parses FH JSON into rows
- `buildDefinitionsRows()` - Creates biomarker definitions
- `buildLatestValuesRows()` - Latest value per biomarker
- `createTableSheet()` - Pivot table (biomarkers × dates)
- `createGroupedSheet()` - Grouped by category
- `syncSheetWithData()` - Main orchestration function

**Sutter Health**:
- `processSutterHealthExport()` - Writes pre-flattened rows to Google Sheets
- **NOTE**: All API calls and data flattening moved to content.js

**Shared Functions**:
- `getOrCreateSpreadsheet()` - Privacy-friendly sheet management
- `ensureSheetExists()` - Creates sheets if needed
- `writeSheetData()` - Writes data to sheets
- `createSpreadsheet()` - Creates new spreadsheet

## Data Flow

### Function Health Export
1. User clicks "Export Labs" button
2. Content script fetches data from FH API with Firebase token
3. Sends data to background script via `FH_EXPORT_DATA` message
4. Background script:
   - Parses data into rows
   - Gets/creates spreadsheet (stores name→ID mapping)
   - Creates/updates FH_Export sheet
   - Creates FH_Definitions, FH_Latest, FH_Table, FH_Grouped sheets
   - Stores `masterSheetId` for SH to use

### Sutter Health Export (Current Flow)
1. User navigates to Test Results page
2. Button appears in top-right corner
3. User clicks "Export Sutter Labs" button
4. Content script:
   - Extracts PageNonce from page
   - Calls `/MHO/api/test-results/GetList` with PageNonce (same-origin)
   - Extracts order keys from response
   - Fetches details for each order via `/MHO/api/test-results/GetDetails` (same-origin)
   - Flattens component-level results into rows
   - Sends pre-flattened rows to background script via `SH_EXPORT_ROWS` message
5. Background script:
   - Receives flattened rows
   - Uses `masterSheetId` from FH export (or creates new sheet)
   - Creates/updates SH_Export sheet
   - Writes rows to Google Sheets

## Google Sheets Structure

### Tab Naming Convention
- **Function Health**: `FH_` prefix
  - `FH_Export` - All lab results
  - `FH_Definitions` - Biomarker definitions
  - `FH_Latest` - Latest value per biomarker
  - `FH_Table` - Pivot table view
  - `FH_Grouped` - Grouped by category

- **Sutter Health**: `SH_` prefix
  - `SH_Export` - All component-level results

### Sheet Management (Privacy-Friendly)
**Storage**: `chrome.storage.sync`
- `sheetNameToId` - Maps sheet names to spreadsheet IDs
- `masterSheetId` - Shared spreadsheet ID for both FH and SH
- `spreadsheetId` - Temporary storage during FH export
- `lastSheetName` - Remembers last used sheet name

**How It Works**:
1. User enters sheet name (e.g., "Lab Results")
2. Extension checks `sheetNameToId` for existing mapping
3. If found, uses existing spreadsheet ID
4. If not found, creates new spreadsheet and stores mapping
5. Verifies spreadsheet still exists before using
6. **NO Drive API permissions needed** - only Google Sheets API

## Column Schemas

### Function Health (FH_Export)
```
biomarkerId, biomarkerName, primaryCategory, questBiomarkerCode, 
questBiomarkerId, dateOfService, testResultRaw, testResultNumeric, 
measurementUnits, statusLabel, testResultOutOfRange, rangeString, 
rangeMinDisplay, rangeMaxDisplay, questReferenceRange, improving, 
neutral, hasNewResults, type, requisitionId, createdAt
```

### Sutter Health (SH_Export)
```
orderKey, orderName, orderDisplayDate, resultStatus, componentID, 
componentName, componentCommonName, loincCode, value, numericValue, 
units, referenceRangeFormatted, referenceRangeLowDisplay, 
referenceRangeHighDisplay, abnormalFlagCategory, authorizingProviderName, 
resultTimestampDisplay, prioritizedInstantISO, prioritizedInstantDisplay, 
collectionTimestampsDisplay, resultingLabName
```

## Known Issues & Solutions

### Issue 1: Blank "Export" Tab
**Problem**: Google Sheets creates default "Sheet1" which appeared as blank "Export" tab
**Solution**: Delete Sheet1 after creating first real sheet in `ensureSheetExists()`

### Issue 2: Duplicate Sheets with Same Name
**Problem**: Creating new spreadsheet every time instead of updating existing
**Solution**: Implemented `sheetNameToId` mapping in local storage

### Issue 3: Sutter Health Button Width
**Problem**: Button taking full width of page
**Solution**: Used `setAttribute('style', ...)` with `!important` flags and `max-width: 200px`

### Issue 4: Sutter Health Button Position
**Problem**: Button appearing in top-left instead of top-right
**Solution**: Applied `!important` flags to container positioning with `z-index: 99999`

### Issue 5: PageNonce and Same-Origin API Calls (FIXED)
**Problem**: Background script was calling Sutter Health APIs without same-origin context
**Symptoms**:
- API returns HTML "Oops!" error page instead of JSON
- Missing cookies and session context
- PageNonce not being sent correctly

**Solution**:
1. ✅ Moved all API calls to content script (same-origin context)
2. ✅ Extract PageNonce from page before making API calls
3. ✅ Make GetList and GetDetails calls from content script with credentials
4. ✅ Flatten data in content script before sending to background
5. ✅ Background script only handles Google Sheets writing
6. ✅ Added proper error detection for non-JSON responses

**Key Architectural Change**:
- Content script now handles: PageNonce extraction, API calls, data flattening
- Background script now handles: Google Sheets API operations only
- This ensures all Sutter Health API calls have proper same-origin context with cookies

## API Endpoints

### Function Health
**Endpoint**: `https://production-member-app-mid-lhuqotpy2a-ue.a.run.app/api/v1/results-report`
**Method**: GET
**Authentication**: Firebase ID token in Authorization header
**Headers**:
```javascript
{
  "Accept": "application/json",
  "Authorization": "Bearer ${idToken}",
  "fe-app-version": "0.84.70",
  "origin": "https://my.functionhealth.com",
  "referer": "https://my.functionhealth.com/",
  "x-backend-skip-cache": "true"
}
```

### Sutter Health
**GetList Endpoint**: `/MHO/api/test-results/GetList`
**Method**: POST
**Body**:
```javascript
{
  "groupBy": 1,
  "PageNonce": "<page-nonce>"  // REQUIRED but not available
}
```

**GetDetails Endpoint**: `/MHO/api/test-results/GetDetails`
**Method**: POST
**Body**:
```javascript
{
  "orderKey": "<from GetList>",
  "organizationID": "",
  "PageNonce": "<same page nonce>"
}
```

## Testing Checklist

## Quest LOINC Mapping Implementation

### Overview

The Quest LOINC mapping system is a **build-time tool** that generates mappings between Quest Diagnostics biomarker codes and LOINC codes using a **manual, privacy-focused workflow**. This enables Function Health exports to include standardized LOINC codes for cross-system comparison.

### Architecture

**Manual Workflow**:
1. User exports Function Health data and reviews which Quest codes lack LOINC mappings
2. User creates a JSON/CSV file with the Quest codes they want to map
3. User runs `npm run build:quest-map -- --input their-file.json`
4. [`buildQuestLoincMap.js`](scripts/buildQuestLoincMap.js) reads Quest codes from input file
5. For each code, fetches metadata from Quest Diagnostics API
6. Applies strict validation rules (exact name/unit matching)
7. Generates/updates [`quest_loinc_map.json`](data/quest_loinc_map.json)

**Runtime Process**:
1. Extension loads [`quest_loinc_map.json`](data/quest_loinc_map.json) at startup
2. During export, [`deriveLoincFromFH()`](loinc-derivation.js:43) looks up Quest code
3. Returns LOINC code or empty string (no tracking of unmapped codes)
4. LOINC code added to `Derived_LOINC` column in Google Sheets

### Key Functions

#### Build Script: `buildQuestLoincMap.js`

**Location**: [`scripts/buildQuestLoincMap.js`](scripts/buildQuestLoincMap.js)

**Key Functions**:
- `fetchQuestMetadata(questCode)` - Fetches test data from Quest API
- `isValidMapping(questData, fhData)` - Validates mapping rules
- `normalizeField(value)` - Normalizes text for comparison
- `loadExistingMappings()` - Loads current mappings
- `saveMappings(mappings)` - Saves updated mappings

**Validation Rules**:
1. Quest must return exactly ONE LOINC code
2. Test names must match after normalization
3. Units must match if both sources provide them

**Configuration**:
```javascript
const CONFIG = {
  OUTPUT_FILE: '../data/quest_loinc_map.json',
  DEFAULT_INPUT: '../data/sample_quest_codes.json',
  QUEST_API_BASE: 'https://testdirectory.questdiagnostics.com',
  REQUEST_DELAY_MS: 1000,  // Rate limiting
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 2000,
};
```

#### Derivation Module: `loinc-derivation.js`

**Location**: [`loinc-derivation.js`](loinc-derivation.js)

**Key Functions**:
- `deriveLoincFromFH(row)` - Derives LOINC from Function Health data
- `deriveLoincFromSH(row)` - Derives LOINC from Sutter Health data
- `normalizeField(value)` - Normalizes text for matching
- `buildSHSignature(row)` - Builds Sutter Health lookup key

**Function Health Derivation**:
```javascript
export function deriveLoincFromFH(row) {
  const code = (row.questBiomarkerCode || "").toString().trim();
  if (!code) return "";
  
  const loinc = questLoincMap[code];
  return loinc ? loinc : "";
}
```

**Usage in Extension**:
- Imported by content script and background script
- Called for each row during Function Health export
- Returns LOINC code or empty string (never throws errors)

#### Validation Script: `validateQuestLoincMap.js`

**Location**: [`scripts/validateQuestLoincMap.js`](scripts/validateQuestLoincMap.js)

**Validates**:
- File exists and is valid JSON
- All keys are Quest codes (numeric strings)
- All values are LOINC codes (`"####-#"` format)
- No duplicate LOINC codes
- No empty/null values

**Usage**: `npm run validate:quest-map`

### Data Files

#### Quest LOINC Map: `quest_loinc_map.json`

**Location**: [`data/quest_loinc_map.json`](data/quest_loinc_map.json)

**Format**:
```json
{
  "questBiomarkerCode": "loinc-code"
}
```

**Example**:
```json
{
  "30000000": "6690-2",
  "30000100": "789-8",
  "86031867": "98979-8"
}
```

**Properties**:
- Keys: Quest biomarker codes (strings)
- Values: LOINC codes (format: `"####-#"`)
- Sorted alphabetically for consistency
- Existing mappings preserved during regeneration

**Current Mappings**: 13 Quest codes mapped to LOINC codes

#### Sample Quest Codes: `sample_quest_codes.json`

**Location**: [`data/sample_quest_codes.json`](data/sample_quest_codes.json)

**Purpose**: Default input file for mapping builder

**Format**:
```json
[
  {
    "questBiomarkerCode": "30000000",
    "biomarkerName": "White Blood Cell Count",
    "units": "x10E3/uL"
  }
]
```

### Integration Points

#### 1. Content Script Integration

**File**: [`content.js`](content.js)

The content script imports and uses `deriveLoincFromFH()` when processing Function Health data:

```javascript
import { deriveLoincFromFH } from './loinc-derivation.js';

// During export
const loincCode = deriveLoincFromFH(row);
row.Derived_LOINC = loincCode;
```

#### 2. Background Script Integration

**File**: [`background.js`](background.js)

The background script adds the `Derived_LOINC` column to Google Sheets:

```javascript
// Column headers include Derived_LOINC as last column
const FH_HEADER_ROW = [
  'biomarkerId', 'biomarkerName', /* ... */,
  'Derived_LOINC'  // Position 22
];
```

#### 3. Module Loading

**File**: [`loinc-derivation.js`](loinc-derivation.js:2)

The mapping file is loaded as a JSON module:

```javascript
import questLoincMap from './data/quest_loinc_map.json' with { type: 'json' };
```

### Testing

#### Test Suite: `loinc-derivation.test.js`

**Location**: [`tests/loinc-derivation.test.js`](tests/loinc-derivation.test.js)

**Coverage**: 59 comprehensive tests
- 25 Function Health tests (13 Quest mappings + 12 edge cases)
- 18 Sutter Health tests
- 16 Edge case and error handling tests

**Run Tests**: `npm test`

**Test Categories**:
1. **Complete Quest Mapping Coverage**: Tests all 13 Quest codes
2. **Edge Cases**: Unknown codes, null values, whitespace, etc.
3. **Error Handling**: Malformed data, missing fields, etc.

### Maintenance Workflow

#### Adding New Mappings

1. **Export Function Health data** and review the `Derived_LOINC` column
2. **Identify unmapped codes** (empty `Derived_LOINC` cells)
3. **Create input file** with codes you want to map (JSON or CSV)
4. **Run builder**: `npm run build:quest-map -- --input data/new_codes.json`
5. **Review console output** for validation results
6. **Validate**: `npm run validate:quest-map`
7. **Test**: `npm test`
8. **Commit changes** to [`quest_loinc_map.json`](data/quest_loinc_map.json)

#### Troubleshooting

**No mappings created**:
- Check console for rejection reasons
- Verify test names match exactly
- Verify units match if both sources provide them

**Network errors**:
- Script automatically retries (3 attempts)
- Check internet connection
- Quest API may be temporarily unavailable

**Invalid JSON**:
- Run validation script
- Check for trailing commas, proper quotes
- Use JSON validator (jsonlint.com)

### Performance Considerations

**Build-Time**:
- Rate limited to 1 request/second to Quest API
- Typical run time: ~15 seconds for 13 codes
- Retries add 2 seconds per failure

**Runtime**:
- Mapping file loaded once at extension startup
- Lookup is O(1) hash table operation
- No network requests during export
- Minimal performance impact

### Security Considerations

**Build-Time**:
- Fetches data from public Quest API (no authentication)
- No sensitive data in mapping file
- All data is publicly available test metadata

**Runtime**:
- Mapping file is static JSON (no code execution)
- No external API calls during export
- No user data sent to Quest
- No tracking of which tests user has or their values

### Future Enhancements

**Planned**:
- [ ] Expand Quest code coverage (currently 13 codes)
- [ ] Add support for Quest test variations
- [ ] Implement mapping confidence scores
- [ ] Add manual override mechanism

**Ideas**:
- Automatic mapping updates via CI/CD
- Mapping quality metrics and reporting
- Integration with LOINC API for validation
- Support for other lab vendors (LabCorp, etc.)


### Function Health
- [x] Button appears on FH pages
- [x] Button positioned correctly (top-right)
- [x] Export creates new spreadsheet
- [x] Export updates existing spreadsheet (same name)
- [x] All 5 tabs created (FH_Export, FH_Definitions, FH_Latest, FH_Table, FH_Grouped)
- [x] No blank "Export" tab
- [x] Data correctly formatted
- [x] masterSheetId stored for SH to use

### Sutter Health
- [x] Button only appears on Test Results pages
- [x] Button positioned correctly (top-right)
- [x] Button sized correctly (not full width)
- [x] PageNonce found on page
- [x] GetList API call succeeds (same-origin from content script)
- [x] GetDetails API calls succeed (same-origin from content script)
- [x] Data flattening in content script
- [x] SH_Export tab created
- [x] Data correctly formatted

## Recent Changes (2025-11-16)

### Session 1: Initial Implementation
1. Updated manifest.json to support both FH and SH domains
2. Updated content.js to detect site and inject appropriate button
3. Added SH export logic to background.js
4. Renamed tabs: FH_Values → FH_Export, SH_Export → SH_Export

### Session 2: Bug Fixes
1. Fixed blank "Export" tab issue
2. Implemented privacy-friendly sheet management (no Drive API)
3. Fixed spreadsheet creation issues
4. Added proper error handling

### Session 3: Sutter Health Debugging & Fix
1. Enhanced PageNonce detection with 5 different methods
2. Made PageNonce optional in API call
3. Fixed button width issues (multiple attempts)
4. Fixed button positioning issues
5. Added detailed error messages
6. Discovered PageNonce is required but not available

### Session 4: Architectural Refactor (2025-11-16)
1. **Root Cause Identified**: Background script lacks same-origin context for API calls
2. Moved all Sutter Health API calls from background.js to content.js
3. Content script now handles: PageNonce extraction, GetList, GetDetails, data flattening
4. Background script simplified to only handle Google Sheets writing
5. Added proper error detection for non-JSON responses (HTML "Oops!" pages)
6. Updated message passing: `SH_EXPORT_LIST` → `SH_EXPORT_ROWS` (sends flattened data)
7. Fixed same-origin issue - API calls now work with proper cookies/session

## Code Patterns

### Adding New Export System
To add support for a new health system:

1. **Update manifest.json**:
   - Add host permissions
   - Add to content_scripts matches

2. **Update content.js**:
   - Add detection: `const isNewSystem = window.location.hostname === "..."`
   - Create inject function: `injectNewSystemButton()`
   - Add to page load logic

3. **Update background.js**:
   - Add column headers: `const NS_HEADER_ROW = [...]`
   - Add data extraction functions
   - Add message handler for new system
   - Use `masterSheetId` for shared spreadsheet

4. **Update README.md**:
   - Document new system
   - Add usage instructions
   - Update data structure section

## Debugging Tips

### Check Extension Console
1. Open extension page: `chrome://extensions/`
2. Find LabSaver
3. Click "service worker" link
4. View console logs

### Check Page Console
1. Open page with button
2. Press F12
3. Check Console tab for:
   - "Searching for PageNonce..."
   - "PageNonce found: ..." or "PageNonce not found..."
   - Any error messages

### Check Network Tab
1. Open page
2. Press F12 → Network tab
3. Filter by "Fetch/XHR"
4. Look for API calls
5. Check request headers, body, response

### Check Storage
1. Open extension page: `chrome://extensions/`
2. Find LabSaver
3. Click "service worker" link
4. In console, run:
```javascript
chrome.storage.sync.get(null, (data) => console.log(data))
```

## Future Enhancements

### Planned
- [ ] Fix Sutter Health PageNonce issue
- [ ] Data merging across systems (FH + SH)
- [ ] LOINC code matching for cross-system comparison
- [ ] Trend analysis and visualization
- [ ] Additional health system support

### Ideas
- Export to CSV option
- Automatic periodic exports
- Data validation and quality checks
- Integration with health tracking apps
- AI-powered insights

## Support & Troubleshooting

### Common Issues

**"PageNonce not found"**
- Ensure you're on the Test Results page
- Try logging out and back in
- Navigate through menu (not direct URL)
- Check if Sutter Health changed their site

**"Extension context invalidated"**
- Reload the page
- Reinstall the extension

**"Failed to create spreadsheet"**
- Check Google account permissions
- Ensure you're logged into Google
- Try revoking and re-granting permissions

**Button not appearing**
- Check if you're on the correct page
- Wait 2 seconds after page load
- Check browser console for errors
- Verify extension is enabled

## Contact & Resources

- **GitHub**: (Add repository URL)
- **Issues**: (Add issues URL)
- **Documentation**: See README.md
- **Contributing**: See CONTRIBUTING.md

---

Last Updated: 2025-11-16
Version: 2.0.1
Status: Function Health ✅ | Sutter Health ✅ (Fixed - same-origin API calls)