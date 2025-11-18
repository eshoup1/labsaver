# LOINC Derivation Tests

This directory contains comprehensive tests for the LOINC code derivation functionality used in the Function Health Exporter extension.

## Overview

The tests verify that LOINC codes are correctly derived from:
- **Function Health (FH)** data using `questBiomarkerCode` mappings from Quest Diagnostics
- **Sutter Health (SH)** data using normalized component name and units combinations

## Test Coverage

### Function Health (FH) Tests (25 tests)
Tests for [`deriveLoincFromFH()`](../loinc-derivation.js:43) function:

#### Complete Quest LOINC Mapping Coverage (13 tests)
All 13 Quest codes from [`quest_loinc_map.json`](../data/quest_loinc_map.json:1) are tested:

- ✓ `"30000000"` → `"6690-2"` (White Blood Cells)
- ✓ `"30000100"` → `"789-8"` (Neutrophils)
- ✓ `"30000200"` → `"718-7"` (Lymphocytes)
- ✓ `"30000300"` → `"4544-3"` (Monocytes)
- ✓ `"30000400"` → `"787-2"` (Eosinophils)
- ✓ `"30000500"` → `"785-6"` (Basophils)
- ✓ `"30000600"` → `"786-4"` (Neutrophils Absolute)
- ✓ `"30000700"` → `"788-0"` (Lymphocytes Absolute)
- ✓ `"30000800"` → `"777-3"` (Monocytes Absolute)
- ✓ `"30000900"` → `"770-8"` (Eosinophils Absolute)
- ✓ `"86031867"` → `"98979-8"` (Apolipoprotein B)
- ✓ `"35008200"` → `"883-9"` (Alkaline Phosphatase)
- ✓ `"35008300"` → `"10331-7"` (Bilirubin Direct)

#### Edge Cases and Error Handling (12 tests)
- ✓ Unknown Quest codes return empty string
- ✓ Missing/null/undefined codes return empty string
- ✓ Empty string codes return empty string
- ✓ Whitespace-only codes return empty string
- ✓ Numeric codes are converted to strings and mapped
- ✓ Codes with leading/trailing whitespace are trimmed
- ✓ Case sensitivity is maintained (Quest codes are numeric)
- ✓ Partial Quest codes don't match
- ✓ Quest codes with extra digits don't match
- ✓ Quest codes with non-numeric characters don't match

### Sutter Health (SH) Tests (18 tests)
Tests for [`deriveLoincFromSH()`](../loinc-derivation.js:62) function:

- ✓ Known component/units combinations map correctly
- ✓ Case-insensitive normalization (uppercase, lowercase, mixed)
- ✓ Whitespace trimming and normalization
- ✓ Multiple spaces collapsed to single space
- ✓ Fallback from `componentCommonName` to `componentName`
- ✓ `componentCommonName` takes precedence when both present
- ✓ Missing units returns empty string
- ✓ Missing component names return empty string
- ✓ Null/empty component names return empty string
- ✓ Specific mappings:
  - `"cholesterol"/"mg/dl"` → `"2093-3"`
  - `"hdl cholesterol"/"mg/dl"` → `"2085-9"`
  - `"ldl cholesterol"/"mg/dl"` → `"13457-7"`
  - `"alt"/"u/l"` → `"1742-6"`
  - `"ast"/"u/l"` → `"1920-8"`
  - `"glucose"/"mg/dl"` → `"2345-7"`
  - `"triglycerides"/"mg/dl"` → `"2571-8"`
  - `"sodium"/"mmol/l"` → `"2951-2"`
  - `"potassium"/"mmol/l"` → `"2823-3"`

### Edge Cases and Error Handling Tests (16 tests)
Tests for robustness and error handling:

- ✓ Special characters in component names (e.g., `%` in "hemoglobin a1c %")
- ✓ Various unit formats (`u/l`, `mmol/l`, `g/dl`, `mg/dl`)
- ✓ Malformed row objects don't throw errors
- ✓ Empty objects return empty string
- ✓ Multiple spaces are collapsed correctly
- ✓ Additional mappings:
  - `"hemoglobin a1c %"/"% of total hgb"` → `"4548-4"`
  - `"chloride"/"mmol/l"` → `"2075-0"`
  - `"protein"/"g/dl"` → `"2885-2"`
  - `"calcium"/"mg/dl"` → `"17861-6"`
  - `"albumin"/"g/dl"` → `"1751-7"`
  - `"bilirubin total"/"mg/dl"` → `"1975-2"`
  - `"alkaline phosphatase"/"u/l"` → `"6768-6"`
  - `"co2"/"mmol/l"` → `"2028-9"`

## Running the Tests

### Prerequisites
- Node.js (version 14 or higher recommended)
- The test file uses ES6 modules, so ensure your Node.js version supports them

### Run All Tests
From the `labsaver` directory:

```bash
node tests/loinc-derivation.test.js
```

Or from the project root:

```bash
node labsaver/tests/loinc-derivation.test.js
```

### Expected Output

When all tests pass:
```
============================================================
Function Health (FH) LOINC Derivation Tests
============================================================
✓ FH: Known code '30000000' maps to '6690-2' (White Blood Cells)
✓ FH: Known code '30000100' maps to '789-8' (Neutrophils)
...
✓ FH: Known code '35008200' maps to '883-9' (ALP)

============================================================
Sutter Health (SH) LOINC Derivation Tests
============================================================
✓ SH: 'cholesterol'/'mg/dl' maps to '2093-3'
✓ SH: 'CHOLESTEROL'/'MG/DL' (uppercase) normalizes and maps to '2093-3'
...
✓ SH: 'potassium'/'mmol/l' maps to '2823-3'

============================================================
Edge Cases and Error Handling Tests
============================================================
✓ SH: Special character % in 'hemoglobin a1c %' is handled correctly
✓ SH: Special character % with uppercase normalizes correctly
...
✓ SH: 'co2'/'mmol/l' maps to '2028-9'

============================================================
TEST SUMMARY
============================================================
Total Tests: 46
Passed: 46
Failed: 0

🎉 All tests passed!
```

When tests fail, you'll see detailed error messages:
```
✗ FH: Known code '30000000' maps to '6690-2' (White Blood Cells)
  Expected "6690-2", got ""

============================================================
TEST SUMMARY
============================================================
Total Tests: 46
Passed: 45
Failed: 1

Failed Tests:
  - FH: Known code '30000000' maps to '6690-2' (White Blood Cells)
    Expected "6690-2", got ""
```

## Test Structure

The test file uses a simple, lightweight testing approach:

```javascript
// Test helper function
function assert(condition, testName, expected, actual) {
  if (!condition) {
    // Record failure
  } else {
    // Record success
  }
}

// Test suite wrapper
testSuite('Suite Name', () => {
  // Individual tests
  const row = { questBiomarkerCode: "30000000" };
  const result = deriveLoincFromFH(row);
  assert(result === "6690-2", "Test description", "6690-2", result);
});
```

## Adding New Tests

To add new tests:

1. **Identify the test category**: FH mapping, SH mapping, or edge cases
2. **Add to the appropriate test suite**:
   ```javascript
   testSuite('Function Health (FH) LOINC Derivation Tests', () => {
     // Add your test here
     const newRow = { questBiomarkerCode: "12345678" };
     const result = deriveLoincFromFH(newRow);
     assert(
       result === "expected-loinc",
       "Test description",
       "expected-loinc",
       result
     );
   });
   ```

3. **Follow the naming convention**:
   - Start with the data source (FH/SH)
   - Describe what's being tested
   - Include expected behavior

4. **Test both success and failure cases**:
   - Valid inputs that should map correctly
   - Invalid inputs that should return empty string
   - Edge cases that might cause errors

## Test Philosophy

These tests follow these principles:

1. **Comprehensive Coverage**: Test all code paths and edge cases
2. **Clear Descriptions**: Each test name clearly states what it tests
3. **Isolated Tests**: Each test is independent and doesn't rely on others
4. **Predictable Results**: Tests use known mappings from the JSON files
5. **Error Resilience**: Verify that errors are caught and handled gracefully

## Maintenance

When updating the LOINC mapping files:

1. **Add corresponding tests** for new mappings in [`quest_loinc_map.json`](../data/quest_loinc_map.json) or [`sh_loinc_map.json`](../data/sh_loinc_map.json)
2. **Update existing tests** if mapping logic changes
3. **Run tests** to verify all mappings still work correctly
4. **Document** any new edge cases discovered

## Troubleshooting

### "Cannot find module" error
Make sure you're running the tests from the correct directory and that the import paths are correct.

### "SyntaxError: Cannot use import statement outside a module"
Ensure your Node.js version supports ES6 modules (v14+) and that the file uses `.js` extension with proper import syntax.

### Tests pass but extension doesn't work
The tests verify the derivation logic in isolation. If the extension isn't working:
1. Check that the mapping JSON files are loaded correctly in the extension
2. Verify the content script is properly extracting data
3. Check browser console for errors

## Related Files

- [`loinc-derivation.js`](../loinc-derivation.js) - Main implementation
- [`quest_loinc_map.json`](../data/quest_loinc_map.json) - Function Health mappings
- [`sh_loinc_map.json`](../data/sh_loinc_map.json) - Sutter Health mappings
- [`content.js`](../content.js) - Extension content script that uses these functions

## Total Test Count

**59 comprehensive tests** covering:
- 25 Function Health (Quest LOINC mapping) tests
  - 13 complete Quest code mappings
  - 12 edge cases and error handling
- 18 Sutter Health tests
- 16 Edge case and error handling tests

## Quest LOINC Mapping Validation

A validation script is available to verify the structure of [`quest_loinc_map.json`](../data/quest_loinc_map.json:1):

```bash
node scripts/validateQuestLoincMap.js
```

This script validates:
- File can be loaded and parsed as JSON
- All Quest codes (keys) are present and valid
- All LOINC codes (values) match the expected format (e.g., "1234-5")
- No duplicate LOINC codes exist
- No empty or null values

### Running the Validation Script

From the `labsaver` directory:

```bash
node scripts/validateQuestLoincMap.js
```

Expected output when validation passes:
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