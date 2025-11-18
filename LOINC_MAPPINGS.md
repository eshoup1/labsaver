# LOINC Mappings Reference

## Overview

This document provides a complete reference of all LOINC code mappings used by the LabSaver extension, along with instructions for adding new mappings.

## What is LOINC?

LOINC (Logical Observation Identifiers Names and Codes) is a universal standard for identifying medical laboratory observations. Each LOINC code uniquely identifies:
- What was measured (e.g., Cholesterol)
- The specimen type (e.g., Blood)
- The measurement method (e.g., Enzymatic)
- The units (e.g., mg/dL)

**Format:** LOINC codes follow the pattern `####-#` (e.g., `2093-3`, `6690-2`)

**Learn More:** [https://loinc.org/](https://loinc.org/)

## Current Mappings

### Function Health Mappings

**File:** [`data/quest_loinc_map.json`](./data/quest_loinc_map.json)

**Mapping Strategy:** Direct mapping from `questBiomarkerCode` to LOINC code

| questBiomarkerCode | LOINC Code | Test Name | Description |
|-------------------|------------|-----------|-------------|
| `30000000` | `6690-2` | WBC | Leukocytes [#/volume] in Blood by Automated count |
| `30000100` | `789-8` | RBC | Erythrocytes [#/volume] in Blood by Automated count |
| `30000200` | `718-7` | Hemoglobin | Hemoglobin [Mass/volume] in Blood |
| `30000300` | `4544-3` | Hematocrit | Hematocrit [Volume Fraction] of Blood by Automated count |
| `30000400` | `787-2` | MCV | Erythrocyte mean corpuscular volume [Entitic volume] by Automated count |
| `30000500` | `785-6` | MCH | Erythrocyte mean corpuscular hemoglobin [Entitic mass] by Automated count |
| `30000600` | `786-4` | MCHC | Erythrocyte mean corpuscular hemoglobin concentration [Mass/volume] by Automated count |
| `30000700` | `788-0` | RDW | Erythrocyte distribution width [Entitic volume] by Automated count |
| `30000800` | `777-3` | Platelets | Platelets [#/volume] in Blood by Automated count |
| `30000900` | `770-8` | MPV | Platelet mean volume [Entitic volume] in Blood by Automated count |
| `86031867` | `98979-8` | Apolipoprotein B | Apolipoprotein B [Mass/volume] in Serum or Plasma |
| `35008200` | `883-9` | ALP | Alkaline phosphatase [Enzymatic activity/volume] in Serum or Plasma |
| `35008300` | `10331-7` | GGT | Gamma glutamyl transferase [Enzymatic activity/volume] in Serum or Plasma |

**Total Mappings:** 13

### Sutter Health Mappings

**File:** [`data/sh_loinc_map.json`](./data/sh_loinc_map.json)

**Mapping Strategy:** Normalized signature from `componentCommonName|units`

**Normalization Rules:**
- Convert to lowercase
- Trim whitespace
- Collapse multiple spaces to single space
- Remove leading/trailing punctuation (except %, /)

| Component Common Name | Units | LOINC Code | Description |
|----------------------|-------|------------|-------------|
| `Cholesterol` | `mg/dL` | `2093-3` | Cholesterol [Mass/volume] in Serum or Plasma |
| `HDL Cholesterol` | `mg/dL` | `2085-9` | Cholesterol in HDL [Mass/volume] in Serum or Plasma |
| `Triglycerides` | `mg/dL` | `2571-8` | Triglyceride [Mass/volume] in Serum or Plasma |
| `LDL Cholesterol` | `mg/dL` | `13457-7` | Cholesterol in LDL [Mass/volume] in Serum or Plasma by calculation |
| `Hemoglobin A1c %` | `% of total Hgb` | `4548-4` | Hemoglobin A1c/Hemoglobin.total in Blood |
| `Hemoglobin A1c %` | `of total Hgb` | `4548-4` | Hemoglobin A1c/Hemoglobin.total in Blood (alternate format) |
| `Glucose` | `mg/dL` | `2345-7` | Glucose [Mass/volume] in Serum or Plasma |
| `ALT` | `U/L` | `1742-6` | Alanine aminotransferase [Enzymatic activity/volume] in Serum or Plasma |
| `AST` | `U/L` | `1920-8` | Aspartate aminotransferase [Enzymatic activity/volume] in Serum or Plasma |
| `Sodium` | `mmol/L` | `2951-2` | Sodium [Moles/volume] in Serum or Plasma |
| `Potassium` | `mmol/L` | `2823-3` | Potassium [Moles/volume] in Serum or Plasma |
| `Chloride` | `mmol/L` | `2075-0` | Chloride [Moles/volume] in Serum or Plasma |
| `CO2` | `mmol/L` | `2028-9` | Carbon dioxide, total [Moles/volume] in Serum or Plasma |
| `Calcium` | `mg/dL` | `17861-6` | Calcium [Mass/volume] in Serum or Plasma |
| `Protein` | `g/dL` | `2885-2` | Protein [Mass/volume] in Serum or Plasma |
| `Albumin` | `g/dL` | `1751-7` | Albumin [Mass/volume] in Serum or Plasma |
| `Bilirubin Total` | `mg/dL` | `1975-2` | Bilirubin.total [Mass/volume] in Serum or Plasma |
| `Alkaline Phosphatase` | `U/L` | `6768-6` | Alkaline phosphatase [Enzymatic activity/volume] in Serum or Plasma |

**Total Mappings:** 18 (17 unique, 1 duplicate for format variation)

## How to Add New Mappings

### Prerequisites

1. Identify the LOINC code for the test you want to map
   - Search at [https://loinc.org/](https://loinc.org/)
   - Or use [https://search.loinc.org/](https://search.loinc.org/)
2. Verify the LOINC code matches:
   - The component being measured
   - The specimen type (usually Blood, Serum, or Plasma)
   - The units of measurement
   - The method (if applicable)

### Adding Function Health Mappings

**File to Edit:** [`data/quest_loinc_map.json`](./data/quest_loinc_map.json)

**Format:**
```json
{
  "questBiomarkerCode": "LOINC-CODE"
}
```

**Steps:**

1. Open `labsaver/data/quest_loinc_map.json`
2. Find the `questBiomarkerCode` from your Function Health export
3. Look up the corresponding LOINC code
4. Add a new entry to the JSON file:
   ```json
   {
     "30000000": "6690-2",
     "30000100": "789-8",
     "YOUR_NEW_CODE": "LOINC-CODE"
   }
   ```
5. Save the file
6. Reload the extension in Chrome
7. Test the mapping (see [Testing New Mappings](#testing-new-mappings))

**Example:**

To add a mapping for Vitamin D:
```json
{
  "30000000": "6690-2",
  "30000100": "789-8",
  "35008400": "1989-3"
}
```

### Adding Sutter Health Mappings

**File to Edit:** [`data/sh_loinc_map.json`](./data/sh_loinc_map.json)

**Format:**
```json
{
  "normalized_component|normalized_units": "LOINC-CODE"
}
```

**Normalization Rules:**
- Convert to lowercase
- Trim whitespace
- Collapse multiple spaces to single space
- Remove leading/trailing punctuation (except %, /)

**Steps:**

1. Open `labsaver/data/sh_loinc_map.json`
2. Find the `componentCommonName` and `units` from your Sutter Health export
3. Normalize them according to the rules above
4. Look up the corresponding LOINC code
5. Add a new entry to the JSON file:
   ```json
   {
     "cholesterol|mg/dl": "2093-3",
     "hdl cholesterol|mg/dl": "2085-9",
     "your_normalized_component|your_normalized_units": "LOINC-CODE"
   }
   ```
6. Save the file
7. Reload the extension in Chrome
8. Test the mapping (see [Testing New Mappings](#testing-new-mappings))

**Example:**

To add a mapping for Vitamin D:

**Original Data:**
- Component: `"Vitamin D, 25-Hydroxy"`
- Units: `"ng/mL"`

**Normalized:**
- Component: `"vitamin d, 25-hydroxy"` → `"vitamin d 25-hydroxy"` (punctuation removed)
- Units: `"ng/ml"`
- Key: `"vitamin d 25-hydroxy|ng/ml"`

**Mapping Entry:**
```json
{
  "cholesterol|mg/dl": "2093-3",
  "vitamin d 25-hydroxy|ng/ml": "1989-3"
}
```

### Testing New Mappings

After adding new mappings:

1. **Reload the Extension:**
   - Go to `chrome://extensions/`
   - Find "LabSaver - Health Data Exporter"
   - Click the reload icon (circular arrow)

2. **Test the Export:**
   - Navigate to the appropriate health portal
   - Click the export button
   - Wait for export to complete

3. **Verify in Google Sheets:**
   - Open the exported sheet
   - Find the row with your new test
   - Check the `Derived_LOINC` column (last column)
   - Verify it contains the expected LOINC code

4. **Check Browser Console:**
   - Press F12 to open DevTools
   - Click the Console tab
   - Look for any warnings or errors
   - Successful mapping should show no errors

### Validation Checklist

Before committing new mappings, verify:

- [ ] LOINC code is valid (format: `####-#`)
- [ ] LOINC code matches the test being measured
- [ ] Units match between the test and LOINC definition
- [ ] JSON syntax is valid (no trailing commas, proper quotes)
- [ ] Normalization is correct (for Sutter Health)
- [ ] Mapping has been tested with real data
- [ ] No duplicate keys in the JSON file
- [ ] File is properly formatted (use a JSON formatter)

## Common LOINC Codes Reference

### Complete Blood Count (CBC)

| Test | LOINC | Units | Description |
|------|-------|-------|-------------|
| WBC | `6690-2` | 10*3/uL | White Blood Cell Count |
| RBC | `789-8` | 10*6/uL | Red Blood Cell Count |
| Hemoglobin | `718-7` | g/dL | Hemoglobin |
| Hematocrit | `4544-3` | % | Hematocrit |
| MCV | `787-2` | fL | Mean Corpuscular Volume |
| MCH | `785-6` | pg | Mean Corpuscular Hemoglobin |
| MCHC | `786-4` | g/dL | Mean Corpuscular Hemoglobin Concentration |
| RDW | `788-0` | % | Red Cell Distribution Width |
| Platelets | `777-3` | 10*3/uL | Platelet Count |
| MPV | `770-8` | fL | Mean Platelet Volume |

### Lipid Panel

| Test | LOINC | Units | Description |
|------|-------|-------|-------------|
| Total Cholesterol | `2093-3` | mg/dL | Total Cholesterol |
| HDL Cholesterol | `2085-9` | mg/dL | HDL Cholesterol |
| LDL Cholesterol | `13457-7` | mg/dL | LDL Cholesterol (calculated) |
| Triglycerides | `2571-8` | mg/dL | Triglycerides |
| VLDL Cholesterol | `13458-5` | mg/dL | VLDL Cholesterol (calculated) |

### Metabolic Panel

| Test | LOINC | Units | Description |
|------|-------|-------|-------------|
| Glucose | `2345-7` | mg/dL | Glucose |
| Sodium | `2951-2` | mmol/L | Sodium |
| Potassium | `2823-3` | mmol/L | Potassium |
| Chloride | `2075-0` | mmol/L | Chloride |
| CO2 | `2028-9` | mmol/L | Carbon Dioxide |
| BUN | `3094-0` | mg/dL | Blood Urea Nitrogen |
| Creatinine | `2160-0` | mg/dL | Creatinine |
| Calcium | `17861-6` | mg/dL | Calcium |

### Liver Function

| Test | LOINC | Units | Description |
|------|-------|-------|-------------|
| ALT | `1742-6` | U/L | Alanine Aminotransferase |
| AST | `1920-8` | U/L | Aspartate Aminotransferase |
| ALP | `6768-6` | U/L | Alkaline Phosphatase |
| Total Bilirubin | `1975-2` | mg/dL | Total Bilirubin |
| Total Protein | `2885-2` | g/dL | Total Protein |
| Albumin | `1751-7` | g/dL | Albumin |
| GGT | `2324-2` | U/L | Gamma Glutamyl Transferase |

### Diabetes Markers

| Test | LOINC | Units | Description |
|------|-------|-------|-------------|
| Hemoglobin A1c | `4548-4` | % | Hemoglobin A1c |
| Fasting Glucose | `1558-6` | mg/dL | Fasting Glucose |
| Insulin | `20448-7` | uU/mL | Insulin |

## Troubleshooting Mappings

### Issue: Mapping Not Working

**Check:**
1. JSON syntax is valid (use [jsonlint.com](https://jsonlint.com/))
2. Key format matches exactly (case-sensitive for FH, normalized for SH)
3. Extension has been reloaded after changes
4. Browser console shows no errors

### Issue: Wrong LOINC Code Appearing

**Check:**
1. LOINC code matches the test definition
2. Units match between test and LOINC
3. No duplicate keys in mapping file
4. Normalization is correct (for Sutter Health)

### Issue: Some Tests Map, Others Don't

**Check:**
1. Data format variations (case, whitespace, punctuation)
2. Units format differences (e.g., "mg/dL" vs "mg/dl")
3. Component name variations (e.g., "Cholesterol" vs "Total Cholesterol")
4. Add multiple mapping entries for variations if needed

## Best Practices

### Mapping Selection

1. **Use the most specific LOINC code** that matches:
   - The exact component measured
   - The specimen type (Blood, Serum, Plasma)
   - The measurement method (if specified)
   - The units

2. **Prefer common LOINC codes** over rare ones when multiple options exist

3. **Document your choices** in comments or a separate file if the mapping is non-obvious

### File Maintenance

1. **Keep mappings sorted** alphabetically by key for easy reference
2. **Use consistent formatting** (2-space indentation)
3. **Validate JSON** before committing changes
4. **Test thoroughly** with real data before deploying
5. **Document any special cases** or unusual mappings

### Version Control

1. **Commit mapping changes separately** from code changes
2. **Include test results** in commit messages
3. **Document the source** of LOINC codes (e.g., "From LOINC.org search")
4. **Note any assumptions** made during mapping

## Resources

### LOINC Resources

- **Official LOINC Site:** [https://loinc.org/](https://loinc.org/)
- **LOINC Search:** [https://search.loinc.org/](https://search.loinc.org/)
- **LOINC Documentation:** [https://loinc.org/get-started/](https://loinc.org/get-started/)
- **RELMA (LOINC Mapping Tool):** [https://loinc.org/relma/](https://loinc.org/relma/)

### JSON Tools

- **JSON Validator:** [https://jsonlint.com/](https://jsonlint.com/)
- **JSON Formatter:** [https://jsonformatter.org/](https://jsonformatter.org/)
- **JSON Diff Tool:** [https://jsondiff.com/](https://jsondiff.com/)

### Related Documentation

- [LOINC_VERIFICATION.md](./LOINC_VERIFICATION.md) - How to verify mappings work correctly
- [README.md](./README.md) - Main extension documentation
- [IMPLEMENTATION_NOTES.md](./IMPLEMENTATION_NOTES.md) - Technical implementation details

## Contributing

When contributing new mappings:

1. Follow the format guidelines above
2. Test thoroughly with real data
3. Document your sources for LOINC codes
4. Submit a pull request with:
   - Description of tests added
   - Verification that mappings work
   - Any special considerations

## Questions?

If you have questions about LOINC mappings:

1. Check the [LOINC_VERIFICATION.md](./LOINC_VERIFICATION.md) troubleshooting section
2. Search the LOINC documentation
3. Open an issue on GitHub with:
   - The test you're trying to map
   - The data format from the health portal
   - Any LOINC codes you've considered