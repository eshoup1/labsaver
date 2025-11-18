# Build Scripts

## Quest LOINC Mapping Builder

### Overview
The `buildQuestLoincMap.js` script automatically generates Quest biomarker code to LOINC code mappings by fetching data from Quest Diagnostics' public test directory.

### Data Source
- **Quest Diagnostics Test Directory**: https://testdirectory.questdiagnostics.com
- The API provides test metadata including LOINC codes, test names, units, and specimen information

### Mapping Rules (Strict - No Fuzzy Matching)
The script applies strict validation rules to ensure mapping accuracy:

1. **Single LOINC Code**: Quest must return exactly ONE LOINC code for the test
2. **Name Match**: Quest's official test name must match FH's biomarker name (after normalization)
3. **Unit Match**: If both sources have units, they must match after normalization
4. **Rejection**: If any rule fails, the mapping is discarded

### Normalization Process
All text fields are normalized before comparison:
- Convert to lowercase
- Trim whitespace
- Collapse multiple spaces to single space
- Remove leading/trailing punctuation (except %, /)

### Usage

#### Basic Usage (uses default sample data)
```bash
npm run build:quest-map
```

#### With Custom Input File (JSON)
```bash
npm run build:quest-map -- --input data/my_quest_codes.json
```

#### With Custom Input File (CSV)
```bash
npm run build:quest-map -- --input exports/fh_export.csv
```

### Input File Formats

#### JSON Format
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

#### CSV Format
```csv
questBiomarkerCode,biomarkerName,units
30000000,White Blood Cell Count,x10E3/uL
86031867,Apolipoprotein B,mg/dL
```

**Required Fields:**
- `questBiomarkerCode`: Quest's test code
- `biomarkerName`: Name of the biomarker/test

**Optional Fields:**
- `units`: Measurement units (used for validation if present)

### Output

The script generates/updates: `labsaver/data/quest_loinc_map.json`

**Output Format:**
```json
{
  "30000000": {
    "loinc": "6690-2",
    "biomarkerName": "White Blood Cell Count",
    "units": "x10E3/uL",
    "source": "quest_auto"
  },
  "86031867": {
    "loinc": "98979-8",
    "biomarkerName": "Apolipoprotein B",
    "units": "mg/dL",
    "source": "quest_auto"
  }
}
```

### Features

#### Preserves Existing Mappings
- The script reads existing mappings before processing
- Only adds new mappings for codes not already present
- Existing mappings are never overwritten

#### Rate Limiting
- 1 second delay between API requests
- Prevents overwhelming Quest's servers
- Configurable in script if needed

#### Error Handling
- Automatic retry (up to 3 attempts) for failed requests
- Graceful handling of network errors
- Detailed logging of all operations

#### Progress Logging
The script provides detailed console output:
- Each code being processed
- Quest metadata retrieved
- Validation results (pass/fail with reasons)
- Final statistics summary

### Example Output

```
🔬 Quest LOINC Mapping Builder

════════════════════════════════════════════════════════════
📁 Input file: /path/to/sample_quest_codes.json
📁 Output file: /path/to/quest_loinc_map.json

✅ Loaded 7 biomarker codes

📋 Existing mappings: 14

════════════════════════════════════════════════════════════
Processing biomarker codes...

🔍 Processing: 30000000 (White Blood Cell Count)
  ⏭️  Already mapped: 6690-2

🔍 Processing: 86031867 (Apolipoprotein B)
  Fetching: https://testdirectory.questdiagnostics.com/test/test-detail/86031867
  📊 Quest data:
     Name: Apolipoprotein B
     LOINC codes: 98979-8
     Units: mg/dL
  ✅ Mapped: 86031867 → 98979-8

════════════════════════════════════════════════════════════
📊 Summary:
   Total codes processed: 7
   Already mapped (skipped): 6
   Metadata fetched: 1
   New mappings created: 1
   Failed/rejected: 0
   Final mapping count: 15
════════════════════════════════════════════════════════════

✅ Mappings saved to: /path/to/quest_loinc_map.json
```

### Troubleshooting

#### No mappings created
- Check that Quest test names exactly match FH biomarker names
- Verify units match if both sources provide them
- Review console output for specific rejection reasons

#### Network errors
- The script automatically retries failed requests
- Check internet connection
- Quest's API may be temporarily unavailable

#### Rate limiting
- Default delay is 1 second between requests
- Increase `REQUEST_DELAY_MS` in script if needed

### Configuration

Edit these constants in `buildQuestLoincMap.js` to customize behavior:

```javascript
const CONFIG = {
  OUTPUT_FILE: path.join(__dirname, '../data/quest_loinc_map.json'),
  DEFAULT_INPUT: path.join(__dirname, '../data/sample_quest_codes.json'),
  QUEST_API_BASE: 'https://testdirectory.questdiagnostics.com',
  REQUEST_DELAY_MS: 1000,      // Delay between requests
  MAX_RETRIES: 3,              // Number of retry attempts
  RETRY_DELAY_MS: 2000,        // Delay before retry
};
```

### Notes

- This script runs at **build-time only** (not in the browser)
- No fuzzy matching is performed - all matches must be exact
- The script is fully automated with no human curation required
- Quest's API structure may change over time, requiring script updates

## Quest LOINC Map Validator

### Overview
The `validateQuestLoincMap.js` script validates the structure and content of the Quest LOINC mapping file to ensure data integrity.

### Usage

```bash
npm run validate:quest-map
```

Or directly:

```bash
node scripts/validateQuestLoincMap.js
```

### What it validates

1. **File existence and parsing**: Ensures `data/quest_loinc_map.json` exists and is valid JSON
2. **Structure validation**: Confirms the file is a JSON object (not array or null)
3. **Quest code validation**: Checks that all keys are valid Quest codes (numeric strings)
4. **LOINC code format**: Validates all LOINC codes match the pattern `"1234-5"` (digits-digit)
5. **Duplicate detection**: Warns if the same LOINC code is mapped to multiple Quest codes
6. **Empty value detection**: Ensures no empty or null values exist

### Output

**Success output:**
```
======================================================================
Quest LOINC Map Validation
======================================================================
✓ File found: quest_loinc_map.json
✓ File successfully parsed as JSON
✓ File contains a valid JSON object
ℹ Total entries: 13

Validating entries...

======================================================================
Validation Summary
======================================================================
Total entries validated: 13
Unique LOINC codes: 13

✓ All validations passed! No errors or warnings.
```

**Error output (example):**
```
✗ ERROR: Invalid LOINC format for Quest code "30000000": "invalid" (expected format: "1234-5")
⚠ WARNING: Duplicate LOINC code "6690-2" found for Quest codes "30000000" and "30000001"

======================================================================
Validation Summary
======================================================================
Total entries validated: 13
Unique LOINC codes: 12

✗ 1 error(s) found
⚠ 1 warning(s) found
```

### Exit codes

- `0`: All validations passed (or only warnings)
- `1`: One or more errors found

### When to use

- After building or updating the Quest LOINC mapping file
- Before committing changes to the mapping file
- As part of CI/CD validation
- When troubleshooting mapping issues

## Running All Validations and Tests

To run both the validation script and all tests:

```bash
npm run test:all
```

This will:
1. Validate the Quest LOINC mapping file structure
2. Run all LOINC derivation tests (59 tests)

Both must pass for the command to succeed.