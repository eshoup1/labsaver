# Quest LOINC Mapping System

## Overview

The Quest LOINC Mapping System generates mappings between Quest Diagnostics biomarker codes and standardized LOINC codes. This system enables the LabSaver extension to export Function Health lab results with standardized LOINC codes for cross-system comparison and data interoperability.

### Key Features

- **Manual Workflow**: User identifies codes to map and provides them to the build script
- **Strict Validation**: Only exact 1:1 mappings (no fuzzy matching)
- **Preserves Existing Mappings**: Never overwrites manually curated mappings
- **Quest API Integration**: Fetches authoritative data from Quest Diagnostics
- **Privacy-First**: No automatic tracking of user data

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Extension Export                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Extension Runtime                                           │
│  ┌──────────────────────┐                                   │
│  │ Function Health      │                                   │
│  │ Export               │                                   │
│  └──────────┬───────────┘                                   │
│             │                                                │
│             ▼                                                │
│  ┌──────────────────────┐      ┌─────────────────────┐     │
│  │ background.js        │─────▶│ quest_loinc_map     │     │
│  │ parseFunctionHealth  │      │ .json               │     │
│  │ Data()               │      └─────────────────────┘     │
│  └──────────┬───────────┘                                   │
│             │                                                │
│             │ Derives LOINC codes                           │
│             ▼                                                │
│  ┌──────────────────────┐                                   │
│  │ Google Sheets        │                                   │
│  │ with Derived_LOINC   │                                   │
│  │ column               │                                   │
│  └──────────────────────┘                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Manual Mapping Process                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  User identifies unmapped codes from export                  │
│  ┌──────────────────────┐                                   │
│  │ User creates         │                                   │
│  │ JSON/CSV file        │                                   │
│  │ with Quest codes     │                                   │
│  └──────────┬───────────┘                                   │
│             │                                                │
│             ▼                                                │
│  ┌──────────────────────┐      ┌─────────────────────┐     │
│  │ buildQuestLoincMap   │─────▶│ Quest Diagnostics   │     │
│  │ .js                  │◀─────│ Test Directory API  │     │
│  └──────────┬───────────┘      └─────────────────────┘     │
│             │                                                │
│             │ Validates & Maps                              │
│             ▼                                                │
│  ┌──────────────────────┐                                   │
│  │ quest_loinc_map.json │                                   │
│  │ (updated)            │                                   │
│  └──────────────────────┘                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

#### Extension Export (Runtime)

1. User exports Function Health data via extension
2. [`parseFunctionHealthData()`](background.js:222) processes each biomarker:
   - Looks up Quest code in [`quest_loinc_map.json`](data/quest_loinc_map.json)
   - If found: Adds LOINC code to `Derived_LOINC` column
   - If not found: Returns empty string (no tracking)
3. Export completes with LOINC codes for mapped tests

#### Manual Mapping Process (Build Time)

1. User reviews exported data and identifies Quest codes without LOINC codes
2. User creates a JSON or CSV file with the codes they want to map
3. User runs `npm run build:quest-map -- --input their-file.json`
4. Script fetches metadata from Quest Diagnostics API
5. Script applies strict validation rules
6. Script updates [`quest_loinc_map.json`](data/quest_loinc_map.json) with new mappings

#### Next Export

1. Extension now has mappings for previously unmapped codes
2. LOINC codes appear in `Derived_LOINC` column for newly mapped tests

## Mapping Rules

The system uses **strict validation** to ensure mapping accuracy. All rules must pass for a mapping to be created.

### Rule 1: Single LOINC Code

Quest must return **exactly ONE** LOINC code for the test.

**Rationale**: Multiple LOINC codes indicate ambiguity. We cannot determine which is correct without human review.

**Example**:
- ✅ Quest returns `["6690-2"]` → Valid
- ❌ Quest returns `["6690-2", "6690-3"]` → Rejected (ambiguous)
- ❌ Quest returns `[]` → Rejected (no LOINC code)

### Rule 2: Name Match

Quest's official test name must match Function Health's biomarker name after normalization.

**Normalization Process**:
1. Convert to lowercase
2. Trim whitespace
3. Collapse multiple spaces to single space
4. Remove leading/trailing punctuation (except `%`, `/`)

**Example**:
```javascript
// Quest name: "White Blood Cell Count"
// FH name:    "White Blood Cell Count"
// Normalized: "white blood cell count" === "white blood cell count" ✅

// Quest name: "WBC"
// FH name:    "White Blood Cell Count"
// Normalized: "wbc" !== "white blood cell count" ❌
```

### Rule 3: Unit Match (if present)

If both Quest and Function Health provide units, they must match after normalization.

**Example**:
```javascript
// Quest units: "x10E3/uL"
// FH units:    "x10E3/uL"
// Normalized:  "x10e3/ul" === "x10e3/ul" ✅

// Quest units: "mg/dL"
// FH units:    "g/dL"
// Normalized:  "mg/dl" !== "g/dl" ❌
```

**Note**: If either source lacks units, this rule is skipped.

## Usage Guide

### Running the Mapping Builder

#### Default Usage (Sample Codes)

```bash
npm run build:quest-map
```

**Behavior**:
- Uses `sample_quest_codes.json` as default input
- Good for testing the mapping process

#### Custom JSON Input

```bash
npm run build:quest-map -- --input data/my_quest_codes.json
```

**JSON Format**:
```json
[
  {
    "questBiomarkerCode": "30000000",
    "biomarkerName": "White Blood Cell Count",
    "units": "x10E3/uL"
  },
  {
    "questBiomarkerCode": "86031867",
    "biomarkerName": "Apolipoprotein B",
    "units": "mg/dL"
  }
]
```

**Required Fields**:
- `questBiomarkerCode`: Quest's test code (string or number)
- `biomarkerName`: Name of the biomarker/test

**Optional Fields**:
- `units`: Measurement units (used for validation if present)

#### Custom CSV Input

```bash
npm run build:quest-map -- --input exports/fh_export.csv
```

**CSV Format**:
```csv
questBiomarkerCode,biomarkerName,units
30000000,White Blood Cell Count,x10E3/uL
86031867,Apolipoprotein B,mg/dL
```

### Adding New Quest Codes

#### Manual Workflow

1. **Export Function Health data** using the extension

2. **Review the export** and identify Quest codes without LOINC codes (empty `Derived_LOINC` column)

3. **Create an input file** with the codes you want to map:

   **JSON Format** (`my_quest_codes.json`):
   ```json
   [
     {
       "questBiomarkerCode": "12345678",
       "biomarkerName": "Test Name",
       "units": "mg/dL"
     }
   ]
   ```

4. **Run the builder**:
   ```bash
   cd labsaver
   npm run build:quest-map -- --input data/my_quest_codes.json
   ```

5. **Review console output** for validation results

6. **Verify mappings** in [`quest_loinc_map.json`](data/quest_loinc_map.json)

7. **Reload extension** in Chrome to use new mappings

### Verifying Mappings

#### Validate Mapping File Structure

```bash
npm run validate:quest-map
```

This checks:
- File exists and is valid JSON
- All Quest codes are valid
- All LOINC codes match format `"####-#"`
- No duplicate LOINC codes
- No empty values

#### Test in Extension

1. **Reload extension** in Chrome (`chrome://extensions/`)
2. **Export Function Health data**
3. **Check Google Sheets** for `Derived_LOINC` column
4. **Verify LOINC codes** appear for mapped tests

#### Run Automated Tests

```bash
npm test
```

Runs 59 comprehensive tests including all Quest mappings.

## Maintenance

### When to Regenerate Mappings

Regenerate mappings when:

1. **New biomarkers added** to Function Health
2. **Quest updates test definitions** (rare)
3. **LOINC codes change** (very rare)
4. **Mapping errors discovered**

### How to Troubleshoot Issues

#### Issue: No Mappings Created

**Symptoms**: Script runs but creates 0 new mappings

**Possible Causes**:
1. Test names don't match exactly
2. Units don't match
3. Quest returns multiple LOINC codes
4. Quest API unavailable

**Solution**:
```bash
# Run with verbose output
npm run build:quest-map -- --input data/problem_codes.json

# Check console for rejection reasons:
# "❌ Rejected: Name mismatch"
# "❌ Rejected: Units mismatch"
# "❌ Rejected: 2 LOINC codes (need exactly 1)"
```

#### Issue: Wrong LOINC Code

**Symptoms**: Mapping exists but LOINC code is incorrect

**Possible Causes**:
1. Quest data is incorrect
2. Name normalization issue
3. Multiple tests with similar names

**Solution**:
1. **Verify Quest data** at https://testdirectory.questdiagnostics.com
2. **Check normalization** in console output
3. **Manually review** and update [`quest_loinc_map.json`](data/quest_loinc_map.json) if needed

#### Issue: Network Errors

**Symptoms**: "Failed to fetch metadata" errors

**Possible Causes**:
1. No internet connection
2. Quest API temporarily unavailable
3. Rate limiting

**Solution**:
```bash
# The script automatically retries (3 attempts)
# If persistent, wait and try again later
# Or increase retry delay in buildQuestLoincMap.js:
# RETRY_DELAY_MS: 5000  // 5 seconds
```

### How to Validate the Mapping File

#### Automated Validation

```bash
npm run validate:quest-map
```

**Checks**:
- ✓ File is valid JSON
- ✓ All keys are Quest codes (numeric strings)
- ✓ All values are LOINC codes (`"####-#"` format)
- ✓ No duplicate LOINC codes
- ✓ No empty/null values

#### Manual Validation

1. **Open** [`quest_loinc_map.json`](data/quest_loinc_map.json)
2. **Verify format**:
   ```json
   {
     "questCode": "loinc-code"
   }
   ```
3. **Check LOINC codes** at https://loinc.org
4. **Test in extension** with real data

## Technical Details

### Quest API/Data Source

**Base URL**: `https://testdirectory.questdiagnostics.com`

**Endpoint Pattern**: `/test/test-detail/{questBiomarkerCode}`

**Method**: GET

**Response**: HTML page with test metadata

**Data Extracted**:
- Test name (from `<h1>` tag)
- LOINC codes (regex pattern: `\b(\d{4,5}-\d)\b`)
- Units (from text patterns)
- Specimen type (from text patterns)

**Rate Limiting**: 1 second delay between requests (configurable)

**Retry Logic**: Up to 3 attempts with 2-second delay

### Mapping File Structure

**File**: [`data/quest_loinc_map.json`](data/quest_loinc_map.json)

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
- **Keys**: Quest biomarker codes (strings)
- **Values**: LOINC codes (format: `"####-#"`)
- **Sorted**: Alphabetically by key for consistency
- **Preserved**: Existing mappings never overwritten

### Extension Integration Points

#### 1. Module Import

**File**: [`loinc-derivation.js`](loinc-derivation.js:2)

```javascript
import questLoincMap from './data/quest_loinc_map.json' with { type: 'json' };
```

#### 2. Derivation Function

**File**: [`loinc-derivation.js`](loinc-derivation.js:43)

```javascript
export function deriveLoincFromFH(row) {
  const code = (row.questBiomarkerCode || "").toString().trim();
  if (!code) return "";
  
  const loinc = questLoincMap[code];
  return loinc ? loinc : "";
}
```

#### 3. Content Script Usage

**File**: [`content.js`](content.js)

The content script calls `deriveLoincFromFH()` for each Function Health row during export.

#### 4. Background Script Integration

**File**: [`background.js`](background.js)

The background script adds the `Derived_LOINC` column to Google Sheets with the returned LOINC codes.

## Configuration

### Script Configuration

Edit [`scripts/buildQuestLoincMap.js`](scripts/buildQuestLoincMap.js:50) to customize:

```javascript
const CONFIG = {
  OUTPUT_FILE: path.join(__dirname, '../data/quest_loinc_map.json'),
  DEFAULT_INPUT: path.join(__dirname, '../data/sample_quest_codes.json'),
  QUEST_API_BASE: 'https://testdirectory.questdiagnostics.com',
  REQUEST_DELAY_MS: 1000,      // Delay between API requests
  MAX_RETRIES: 3,              // Number of retry attempts
  RETRY_DELAY_MS: 2000,        // Delay before retry
};
```

### Normalization Configuration

Edit [`loinc-derivation.js`](loinc-derivation.js:14) to customize normalization:

```javascript
function normalizeField(value) {
  if (!value) return "";
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^[^a-z0-9]+/, "")
    .replace(/[^a-z0-9%/ ]+$/, "");
}
```

## Best Practices

### Mapping Generation

1. **Start with sample data** to test the process
2. **Review console output** for validation failures
3. **Verify mappings** before committing
4. **Run validation script** after generation
5. **Test in extension** with real exports

### File Management

1. **Commit mapping file** separately from code changes
2. **Document sources** in commit messages
3. **Keep sorted** for easy diffing
4. **Back up** before regenerating
5. **Version control** all changes

### Quality Assurance

1. **Run automated tests** after changes
2. **Validate file structure** with validation script
3. **Spot-check mappings** against LOINC.org
4. **Test with real data** in extension
5. **Monitor for errors** in browser console

## Troubleshooting Guide

### Common Issues

#### "PageNonce not found" (Wrong Error)

This error is for Sutter Health, not Quest mapping. Quest mapping runs at build-time, not runtime.

#### "Cannot find module 'axios'"

**Solution**:
```bash
npm install
```

#### "ENOENT: no such file or directory"

**Solution**: Ensure you're running from the correct directory:
```bash
cd labsaver
npm run build:quest-map
```

#### "Invalid JSON in quest_loinc_map.json"

**Solution**:
1. Validate JSON at https://jsonlint.com
2. Check for trailing commas
3. Ensure proper quotes
4. Restore from backup if needed

#### "Duplicate LOINC code" Warning

**Cause**: Same LOINC code mapped to multiple Quest codes

**Solution**: This may be valid (same test, different codes). Review and confirm.

### Debug Mode

Add console logging to [`buildQuestLoincMap.js`](scripts/buildQuestLoincMap.js):

```javascript
// After line 142
console.log('DEBUG: Raw HTML snippet:', questData.rawHtml);
console.log('DEBUG: Extracted LOINC codes:', questData.loincCodes);
```

## Related Documentation

- [README.md](./README.md) - Main extension documentation
- [LOINC_MAPPINGS.md](./LOINC_MAPPINGS.md) - Complete mapping reference
- [LOINC_VERIFICATION.md](./LOINC_VERIFICATION.md) - Verification guide
- [IMPLEMENTATION_NOTES.md](./IMPLEMENTATION_NOTES.md) - Technical implementation
- [scripts/README.md](./scripts/README.md) - Build scripts documentation
- [tests/README.md](./tests/README.md) - Test documentation

## Resources

### Quest Diagnostics

- **Test Directory**: https://testdirectory.questdiagnostics.com
- **Test Search**: Use the search feature to find specific tests
- **Test Details**: Each test page shows LOINC codes and metadata

### LOINC

- **Official Site**: https://loinc.org
- **Search Tool**: https://search.loinc.org
- **Documentation**: https://loinc.org/get-started

### Development Tools

- **JSON Validator**: https://jsonlint.com
- **JSON Formatter**: https://jsonformatter.org
- **Regex Tester**: https://regex101.com

## FAQ

### Q: Why not use fuzzy matching?

**A**: Fuzzy matching introduces ambiguity and potential errors. We prioritize accuracy over coverage. Only exact matches ensure data integrity.

### Q: Can I manually add mappings?

**A**: Yes! Edit [`quest_loinc_map.json`](data/quest_loinc_map.json) directly. The build script preserves existing mappings.

### Q: How often should I regenerate mappings?

**A**: Only when new biomarkers are added or errors are discovered. Quest test definitions rarely change.

### Q: What if Quest returns multiple LOINC codes?

**A**: The mapping is rejected. Manual review is required to determine the correct LOINC code.

### Q: Can I use this for other lab systems?

**A**: The architecture is Quest-specific, but the pattern can be adapted. See Sutter Health mapping for an alternative approach.

### Q: Why build-time instead of runtime?

**A**: Build-time generation ensures:
- Faster extension performance
- No API rate limiting issues
- Offline functionality
- Predictable behavior
- Easier debugging

## Contributing

When contributing Quest LOINC mappings:

1. **Follow the process** documented above
2. **Test thoroughly** with real data
3. **Document sources** for LOINC codes
4. **Run validation** before committing
5. **Include test results** in pull request

## Support

For issues or questions:

1. Check this documentation
2. Review [LOINC_MAPPINGS.md](./LOINC_MAPPINGS.md)
3. Run validation script
4. Check browser console for errors
5. Open GitHub issue with details

---

**Last Updated**: 2025-11-16  
**Version**: 1.0.0  
**Status**: Production Ready ✅