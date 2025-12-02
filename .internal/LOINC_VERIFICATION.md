# LOINC Derivation Feature - Verification Guide

## Overview

The LOINC derivation feature automatically adds standardized LOINC (Logical Observation Identifiers Names and Codes) codes to exported lab results. This enables cross-system comparison and data normalization between Function Health and Sutter Health lab results.

**Key Features:**
- Automatically derives LOINC codes based on exact mappings
- Adds a `Derived_LOINC` column to both `SH_Export` and `FH_Export` sheets
- Uses customizable mapping files for each health system
- Returns empty string when no exact mapping exists (no guessing)

## Expected Spreadsheet Output

### Column Position
The `Derived_LOINC` column is added as the **22nd column (last column)** in both sheets:
- **FH_Export sheet**: After the `createdAt` column
- **SH_Export sheet**: After the `resultingLabName` column

### Column Behavior
- **When mapping exists**: Contains the LOINC code (e.g., `"6690-2"`, `"2093-3"`)
- **When no mapping exists**: Contains an empty string `""`
- **Never contains**: Null values, "N/A", or guessed codes

### Example Output

**Function Health (FH_Export):**
```
| biomarkerName | questBiomarkerCode | ... | createdAt | Derived_LOINC |
|---------------|-------------------|-----|-----------|---------------|
| WBC           | 30000000          | ... | 2024-...  | 6690-2        |
| RBC           | 30000100          | ... | 2024-...  | 789-8         |
| Custom Test   | 99999999          | ... | 2024-...  |               |
```

**Sutter Health (SH_Export):**
```
| componentCommonName | units  | ... | resultingLabName | Derived_LOINC |
|--------------------|--------|-----|------------------|---------------|
| Cholesterol        | mg/dL  | ... | Quest Lab        | 2093-3        |
| HDL Cholesterol    | mg/dL  | ... | Quest Lab        | 2085-9        |
| Rare Test          | custom | ... | Quest Lab        |               |
```

## Verification Steps

### 1. Load the Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select the `labsaver` directory
5. Verify the extension appears in your extensions list
6. Check the browser console for any loading errors

### 2. Test with Function Health Data

#### Setup
1. Navigate to [Function Health](https://my.functionhealth.com/)
2. Log in to your account
3. Wait for the page to fully load
4. Look for the "Export Labs" button in the top-right corner

#### Export Process
1. Click the "Export Labs" button
2. Enter a sheet name (or use default)
3. Authorize Google Sheets access if prompted
4. Wait for export to complete (button will show "✓ Exported X results!")

#### Verification
1. Open the created Google Sheet
2. Navigate to the `FH_Export` tab
3. Scroll to the rightmost column (column 22)
4. Verify the header is `Derived_LOINC`
5. Check that rows with known `questBiomarkerCode` values have LOINC codes
6. Check that rows with unknown codes have empty strings (not null or "N/A")

### 3. Test with Sutter Health Data

#### Setup
1. Navigate to [Sutter Health MyHealthOnline](https://myhealthonline.sutterhealth.org/)
2. Log in to your account
3. Navigate to the Test Results section
4. Look for the "Export Sutter Labs" button in the top-right corner

#### Export Process
1. Click the "Export Sutter Labs" button
2. The extension will use the same Google Sheet as Function Health
3. Wait for export to complete (button will show "✓ Exported X results!")

#### Verification
1. Open the Google Sheet (same as Function Health)
2. Navigate to the `SH_Export` tab
3. Scroll to the rightmost column (column 22)
4. Verify the header is `Derived_LOINC`
5. Check that rows with known component/unit combinations have LOINC codes
6. Check that rows with unknown combinations have empty strings

### 4. What to Look For

#### ✅ Success Indicators
- `Derived_LOINC` column exists as the last column (position 22)
- Column header is exactly `Derived_LOINC` (case-sensitive)
- Known biomarkers/components have valid LOINC codes (format: `####-#`)
- Unknown biomarkers/components have empty strings (not null)
- No error messages in browser console
- Export completes successfully with row count displayed

#### ❌ Failure Indicators
- `Derived_LOINC` column is missing
- Column is in wrong position (not last column)
- LOINC codes appear in wrong format
- Null values or "N/A" instead of empty strings
- Console errors mentioning "loinc-derivation" or mapping files
- Export fails or hangs

## Example Test Cases

### Function Health Test Cases

#### Should Map (questBiomarkerCode → LOINC)
| questBiomarkerCode | Biomarker Name | Expected LOINC | Description |
|-------------------|----------------|----------------|-------------|
| `30000000` | WBC | `6690-2` | White Blood Cell Count |
| `30000100` | RBC | `789-8` | Red Blood Cell Count |
| `30000200` | Hemoglobin | `718-7` | Hemoglobin |
| `30000300` | Hematocrit | `4544-3` | Hematocrit |
| `30000400` | MCV | `787-2` | Mean Corpuscular Volume |
| `30000500` | MCH | `785-6` | Mean Corpuscular Hemoglobin |
| `30000600` | MCHC | `786-4` | Mean Corpuscular Hemoglobin Concentration |
| `30000700` | RDW | `788-0` | Red Cell Distribution Width |
| `30000800` | Platelets | `777-3` | Platelet Count |
| `30000900` | MPV | `770-8` | Mean Platelet Volume |
| `86031867` | Apolipoprotein B | `98979-8` | Apolipoprotein B |
| `35008200` | ALP | `883-9` | Alkaline Phosphatase |
| `35008300` | GGT | `10331-7` | Gamma Glutamyl Transferase |

#### Should NOT Map (Empty String Expected)
- Any `questBiomarkerCode` not in the list above
- Null or empty `questBiomarkerCode` values
- Custom or proprietary biomarker codes

### Sutter Health Test Cases

#### Should Map (Component|Units → LOINC)
| Component Common Name | Units | Expected LOINC | Description |
|----------------------|-------|----------------|-------------|
| `Cholesterol` | `mg/dL` | `2093-3` | Total Cholesterol |
| `HDL Cholesterol` | `mg/dL` | `2085-9` | HDL Cholesterol |
| `Triglycerides` | `mg/dL` | `2571-8` | Triglycerides |
| `LDL Cholesterol` | `mg/dL` | `13457-7` | LDL Cholesterol (calculated) |
| `Hemoglobin A1c %` | `% of total Hgb` | `4548-4` | Hemoglobin A1c |
| `Glucose` | `mg/dL` | `2345-7` | Glucose |
| `ALT` | `U/L` | `1742-6` | Alanine Aminotransferase |
| `AST` | `U/L` | `1920-8` | Aspartate Aminotransferase |
| `Sodium` | `mmol/L` | `2951-2` | Sodium |
| `Potassium` | `mmol/L` | `2823-3` | Potassium |
| `Chloride` | `mmol/L` | `2075-0` | Chloride |
| `CO2` | `mmol/L` | `2028-9` | Carbon Dioxide |
| `Calcium` | `mg/dL` | `17861-6` | Calcium |
| `Protein` | `g/dL` | `2885-2` | Total Protein |
| `Albumin` | `g/dL` | `1751-7` | Albumin |
| `Bilirubin Total` | `mg/dL` | `1975-2` | Total Bilirubin |
| `Alkaline Phosphatase` | `U/L` | `6768-6` | Alkaline Phosphatase |

**Note:** Sutter Health matching is case-insensitive and normalizes whitespace. For example:
- `"CHOLESTEROL"` matches `"cholesterol"`
- `"HDL  Cholesterol"` (extra space) matches `"hdl cholesterol"`
- `"Hemoglobin A1c %"` with `"of total Hgb"` matches `"% of total hgb"`

#### Should NOT Map (Empty String Expected)
- Components with different units than mapped (e.g., `Glucose` in `mmol/L`)
- Components not in the mapping file
- Null or empty component names or units
- Custom or proprietary test names

## Troubleshooting

### Issue: `Derived_LOINC` Column is Missing

**Possible Causes:**
- Extension not loaded properly
- Mapping files not loaded
- JavaScript error during export

**Solutions:**
1. Check browser console for errors (F12 → Console tab)
2. Look for errors mentioning "loinc-derivation.js" or mapping files
3. Reload the extension: `chrome://extensions/` → Click reload icon
4. Verify mapping files exist:
   - `labsaver/data/quest_loinc_map.json`
   - `labsaver/data/sh_loinc_map.json`

### Issue: All LOINC Values are Empty

**Possible Causes:**
- Mapping files are empty or corrupted
- Data format doesn't match expected structure
- Normalization logic issue

**Solutions:**
1. Verify mapping files contain valid JSON:
   ```bash
   cat labsaver/data/quest_loinc_map.json
   cat labsaver/data/sh_loinc_map.json
   ```
2. Check browser console for warnings about mapping failures
3. Verify your data contains the expected fields:
   - Function Health: `questBiomarkerCode`
   - Sutter Health: `componentCommonName` or `componentName`, and `units`

### Issue: Some Expected Mappings are Missing

**Possible Causes:**
- Data format variations (case, whitespace, punctuation)
- Units format differences
- Mapping file doesn't include that specific combination

**Solutions:**
1. Check the actual values in your exported data
2. Compare with the mapping file format
3. For Sutter Health, remember normalization rules:
   - Case-insensitive
   - Whitespace collapsed
   - Leading/trailing punctuation removed
4. Add new mappings if needed (see [LOINC_MAPPINGS.md](./LOINC_MAPPINGS.md))

### Issue: Console Errors During Export

**Common Errors:**

**Error:** `Cannot read property 'questBiomarkerCode' of undefined`
- **Cause:** Data structure changed or row is malformed
- **Solution:** Check that Function Health API response structure matches expected format

**Error:** `Failed to fetch mapping file`
- **Cause:** Mapping files not accessible or path incorrect
- **Solution:** Verify files exist and extension has permission to read them

**Error:** `JSON.parse error in mapping file`
- **Cause:** Mapping file contains invalid JSON
- **Solution:** Validate JSON syntax in mapping files

### How to Check Browser Console

1. Open Chrome DevTools: Press `F12` or `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac)
2. Click the "Console" tab
3. Look for messages with:
   - Red text (errors)
   - Yellow text (warnings)
   - Messages mentioning "loinc", "derivation", or "mapping"
4. Take note of any error messages and line numbers

### How to Verify Mapping Files are Loaded

1. Open Chrome DevTools Console
2. During export, look for console messages like:
   - `"Loading LOINC mapping files..."`
   - `"LOINC mappings loaded successfully"`
3. If you see errors, check:
   - File paths are correct in `manifest.json`
   - Files are valid JSON (no syntax errors)
   - Extension has permission to access the files

## Advanced Verification

### Verify Mapping Logic

You can test the mapping logic directly in the browser console:

```javascript
// For Function Health
const testRow = { questBiomarkerCode: "30000000" };
console.log("Expected: 6690-2, Got:", deriveLoincFromFH(testRow));

// For Sutter Health
const testRow = { componentCommonName: "Cholesterol", units: "mg/dL" };
console.log("Expected: 2093-3, Got:", deriveLoincFromSH(testRow));
```

### Verify Normalization

Test the normalization logic:

```javascript
// Should normalize to "cholesterol|mg/dl"
const testRow = { 
  componentCommonName: "  CHOLESTEROL  ", 
  units: "MG/DL" 
};
// Check if this matches the mapping
```

## Getting Help

If you encounter issues not covered in this guide:

1. Check the [LOINC_MAPPINGS.md](./LOINC_MAPPINGS.md) for mapping details
2. Review [IMPLEMENTATION_NOTES.md](./IMPLEMENTATION_NOTES.md) for technical details
3. Open an issue on GitHub with:
   - Browser console errors (if any)
   - Sample data that's not mapping correctly
   - Steps to reproduce the issue
   - Screenshots of the exported spreadsheet

## Related Documentation

- [LOINC_MAPPINGS.md](./LOINC_MAPPINGS.md) - Complete mapping reference and how to add new mappings
- [README.md](./README.md) - Main extension documentation
- [IMPLEMENTATION_NOTES.md](./IMPLEMENTATION_NOTES.md) - Technical implementation details
- [LOINC Official Site](https://loinc.org/) - Learn more about LOINC codes