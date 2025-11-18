// Import the functions to test
import { deriveLoincFromFH, deriveLoincFromSH } from '../loinc-derivation.js';

// Test helper functions
let testsPassed = 0;
let testsFailed = 0;
const failedTests = [];

function assert(condition, testName, expected, actual) {
  if (!condition) {
    testsFailed++;
    const message = `Expected "${expected}", got "${actual}"`;
    failedTests.push({ testName, message });
    console.log(`✗ ${testName}`);
    console.log(`  ${message}`);
  } else {
    testsPassed++;
    console.log(`✓ ${testName}`);
  }
}

function testSuite(suiteName, tests) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${suiteName}`);
  console.log('='.repeat(60));
  tests();
}

function printSummary() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${testsPassed + testsFailed}`);
  console.log(`Passed: ${testsPassed}`);
  console.log(`Failed: ${testsFailed}`);
  
  if (testsFailed > 0) {
    console.log(`\nFailed Tests:`);
    failedTests.forEach(({ testName, message }) => {
      console.log(`  - ${testName}`);
      console.log(`    ${message}`);
    });
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  }
}

// ============================================================================
// FUNCTION HEALTH (FH) MAPPING TESTS
// ============================================================================

testSuite('Function Health (FH) LOINC Derivation Tests', () => {
  
  // ============================================================================
  // COMPLETE QUEST LOINC MAPPING TESTS - All 13 mappings from quest_loinc_map.json
  // ============================================================================
  
  // Test 1: White Blood Cells (WBC)
  const fhRow1 = { questBiomarkerCode: "30000000" };
  const result1 = deriveLoincFromFH(fhRow1);
  assert(
    result1 === "6690-2",
    "FH: Quest code '30000000' maps to '6690-2' (White Blood Cells)",
    "6690-2",
    result1
  );

  // Test 2: Neutrophils
  const fhRow2 = { questBiomarkerCode: "30000100" };
  const result2 = deriveLoincFromFH(fhRow2);
  assert(
    result2 === "789-8",
    "FH: Quest code '30000100' maps to '789-8' (Neutrophils)",
    "789-8",
    result2
  );

  // Test 3: Lymphocytes
  const fhRow3 = { questBiomarkerCode: "30000200" };
  const result3 = deriveLoincFromFH(fhRow3);
  assert(
    result3 === "718-7",
    "FH: Quest code '30000200' maps to '718-7' (Lymphocytes)",
    "718-7",
    result3
  );

  // Test 4: Monocytes
  const fhRow4 = { questBiomarkerCode: "30000300" };
  const result4 = deriveLoincFromFH(fhRow4);
  assert(
    result4 === "4544-3",
    "FH: Quest code '30000300' maps to '4544-3' (Monocytes)",
    "4544-3",
    result4
  );

  // Test 5: Eosinophils
  const fhRow5 = { questBiomarkerCode: "30000400" };
  const result5 = deriveLoincFromFH(fhRow5);
  assert(
    result5 === "787-2",
    "FH: Quest code '30000400' maps to '787-2' (Eosinophils)",
    "787-2",
    result5
  );

  // Test 6: Basophils
  const fhRow6 = { questBiomarkerCode: "30000500" };
  const result6 = deriveLoincFromFH(fhRow6);
  assert(
    result6 === "785-6",
    "FH: Quest code '30000500' maps to '785-6' (Basophils)",
    "785-6",
    result6
  );

  // Test 7: Neutrophils (Absolute)
  const fhRow7 = { questBiomarkerCode: "30000600" };
  const result7 = deriveLoincFromFH(fhRow7);
  assert(
    result7 === "786-4",
    "FH: Quest code '30000600' maps to '786-4' (Neutrophils Absolute)",
    "786-4",
    result7
  );

  // Test 8: Lymphocytes (Absolute)
  const fhRow8 = { questBiomarkerCode: "30000700" };
  const result8 = deriveLoincFromFH(fhRow8);
  assert(
    result8 === "788-0",
    "FH: Quest code '30000700' maps to '788-0' (Lymphocytes Absolute)",
    "788-0",
    result8
  );

  // Test 9: Monocytes (Absolute)
  const fhRow9 = { questBiomarkerCode: "30000800" };
  const result9 = deriveLoincFromFH(fhRow9);
  assert(
    result9 === "777-3",
    "FH: Quest code '30000800' maps to '777-3' (Monocytes Absolute)",
    "777-3",
    result9
  );

  // Test 10: Eosinophils (Absolute)
  const fhRow10 = { questBiomarkerCode: "30000900" };
  const result10 = deriveLoincFromFH(fhRow10);
  assert(
    result10 === "770-8",
    "FH: Quest code '30000900' maps to '770-8' (Eosinophils Absolute)",
    "770-8",
    result10
  );

  // Test 11: Apolipoprotein B (ApoB)
  const fhRow11 = { questBiomarkerCode: "86031867" };
  const result11 = deriveLoincFromFH(fhRow11);
  assert(
    result11 === "98979-8",
    "FH: Quest code '86031867' maps to '98979-8' (Apolipoprotein B)",
    "98979-8",
    result11
  );

  // Test 12: Alkaline Phosphatase (ALP)
  const fhRow12 = { questBiomarkerCode: "35008200" };
  const result12 = deriveLoincFromFH(fhRow12);
  assert(
    result12 === "883-9",
    "FH: Quest code '35008200' maps to '883-9' (Alkaline Phosphatase)",
    "883-9",
    result12
  );

  // Test 13: Bilirubin Direct
  const fhRow13 = { questBiomarkerCode: "35008300" };
  const result13 = deriveLoincFromFH(fhRow13);
  assert(
    result13 === "10331-7",
    "FH: Quest code '35008300' maps to '10331-7' (Bilirubin Direct)",
    "10331-7",
    result13
  );

  // ============================================================================
  // EDGE CASES AND ERROR HANDLING FOR QUEST CODES
  // ============================================================================

  // Test 14: Unknown questBiomarkerCode returns empty string
  const fhRow14 = { questBiomarkerCode: "99999999" };
  const result14 = deriveLoincFromFH(fhRow14);
  assert(
    result14 === "",
    "FH: Unknown Quest code '99999999' returns empty string",
    "",
    result14
  );

  // Test 15: Missing questBiomarkerCode returns empty string
  const fhRow15 = {};
  const result15 = deriveLoincFromFH(fhRow15);
  assert(
    result15 === "",
    "FH: Missing questBiomarkerCode returns empty string",
    "",
    result15
  );

  // Test 16: Null questBiomarkerCode returns empty string
  const fhRow16 = { questBiomarkerCode: null };
  const result16 = deriveLoincFromFH(fhRow16);
  assert(
    result16 === "",
    "FH: Null questBiomarkerCode returns empty string",
    "",
    result16
  );

  // Test 17: Undefined questBiomarkerCode returns empty string
  const fhRow17 = { questBiomarkerCode: undefined };
  const result17 = deriveLoincFromFH(fhRow17);
  assert(
    result17 === "",
    "FH: Undefined questBiomarkerCode returns empty string",
    "",
    result17
  );

  // Test 18: Empty string questBiomarkerCode returns empty string
  const fhRow18 = { questBiomarkerCode: "" };
  const result18 = deriveLoincFromFH(fhRow18);
  assert(
    result18 === "",
    "FH: Empty string questBiomarkerCode returns empty string",
    "",
    result18
  );

  // Test 19: Whitespace-only questBiomarkerCode returns empty string
  const fhRow19 = { questBiomarkerCode: "   " };
  const result19 = deriveLoincFromFH(fhRow19);
  assert(
    result19 === "",
    "FH: Whitespace-only questBiomarkerCode returns empty string",
    "",
    result19
  );

  // Test 20: Numeric questBiomarkerCode is converted to string and mapped
  const fhRow20 = { questBiomarkerCode: 30000000 };
  const result20 = deriveLoincFromFH(fhRow20);
  assert(
    result20 === "6690-2",
    "FH: Numeric Quest code 30000000 is converted to string and mapped",
    "6690-2",
    result20
  );

  // Test 21: questBiomarkerCode with leading/trailing whitespace is trimmed
  const fhRow21 = { questBiomarkerCode: "  30000100  " };
  const result21 = deriveLoincFromFH(fhRow21);
  assert(
    result21 === "789-8",
    "FH: Quest code with whitespace '  30000100  ' is trimmed and mapped",
    "789-8",
    result21
  );

  // Test 22: Case sensitivity - Quest codes are case-sensitive (numeric)
  const fhRow22 = { questBiomarkerCode: "30000200" };
  const result22 = deriveLoincFromFH(fhRow22);
  assert(
    result22 === "718-7",
    "FH: Quest code '30000200' maps correctly (case-sensitive test)",
    "718-7",
    result22
  );

  // Test 23: Partial Quest code doesn't match
  const fhRow23 = { questBiomarkerCode: "3000000" };
  const result23 = deriveLoincFromFH(fhRow23);
  assert(
    result23 === "",
    "FH: Partial Quest code '3000000' (missing digit) returns empty string",
    "",
    result23
  );

  // Test 24: Quest code with extra digits doesn't match
  const fhRow24 = { questBiomarkerCode: "300000000" };
  const result24 = deriveLoincFromFH(fhRow24);
  assert(
    result24 === "",
    "FH: Quest code with extra digit '300000000' returns empty string",
    "",
    result24
  );

  // Test 25: Quest code with non-numeric characters doesn't match
  const fhRow25 = { questBiomarkerCode: "3000000A" };
  const result25 = deriveLoincFromFH(fhRow25);
  assert(
    result25 === "",
    "FH: Quest code with letter '3000000A' returns empty string",
    "",
    result25
  );
});

// ============================================================================
// SUTTER HEALTH (SH) MAPPING TESTS
// ============================================================================

testSuite('Sutter Health (SH) LOINC Derivation Tests', () => {
  
  // Test 1: Known component/units mapping - Cholesterol
  const shRow1 = {
    componentCommonName: "cholesterol",
    units: "mg/dl"
  };
  const result1 = deriveLoincFromSH(shRow1);
  assert(
    result1 === "2093-3",
    "SH: 'cholesterol'/'mg/dl' maps to '2093-3'",
    "2093-3",
    result1
  );

  // Test 2: Normalization with uppercase - Cholesterol
  const shRow2 = {
    componentCommonName: "CHOLESTEROL",
    units: "MG/DL"
  };
  const result2 = deriveLoincFromSH(shRow2);
  assert(
    result2 === "2093-3",
    "SH: 'CHOLESTEROL'/'MG/DL' (uppercase) normalizes and maps to '2093-3'",
    "2093-3",
    result2
  );

  // Test 3: Normalization with extra spaces
  const shRow3 = {
    componentCommonName: "  CHOLESTEROL  ",
    units: "  MG/DL  "
  };
  const result3 = deriveLoincFromSH(shRow3);
  assert(
    result3 === "2093-3",
    "SH: '  CHOLESTEROL  '/'  MG/DL  ' (extra spaces) normalizes and maps",
    "2093-3",
    result3
  );

  // Test 4: Mixed casing normalization
  const shRow4 = {
    componentCommonName: "Cholesterol",
    units: "Mg/Dl"
  };
  const result4 = deriveLoincFromSH(shRow4);
  assert(
    result4 === "2093-3",
    "SH: 'Cholesterol'/'Mg/Dl' (mixed case) normalizes and maps",
    "2093-3",
    result4
  );

  // Test 5: HDL Cholesterol mapping
  const shRow5 = {
    componentCommonName: "hdl cholesterol",
    units: "mg/dl"
  };
  const result5 = deriveLoincFromSH(shRow5);
  assert(
    result5 === "2085-9",
    "SH: 'hdl cholesterol'/'mg/dl' maps to '2085-9'",
    "2085-9",
    result5
  );

  // Test 6: ALT mapping with U/L units
  const shRow6 = {
    componentCommonName: "alt",
    units: "u/l"
  };
  const result6 = deriveLoincFromSH(shRow6);
  assert(
    result6 === "1742-6",
    "SH: 'alt'/'u/l' maps to '1742-6'",
    "1742-6",
    result6
  );

  // Test 7: ALT with uppercase normalization
  const shRow7 = {
    componentCommonName: "ALT",
    units: "U/L"
  };
  const result7 = deriveLoincFromSH(shRow7);
  assert(
    result7 === "1742-6",
    "SH: 'ALT'/'U/L' (uppercase) normalizes and maps to '1742-6'",
    "1742-6",
    result7
  );

  // Test 8: Unknown component/units combination
  const shRow8 = {
    componentCommonName: "unknown test",
    units: "mg/dl"
  };
  const result8 = deriveLoincFromSH(shRow8);
  assert(
    result8 === "",
    "SH: Unknown 'unknown test'/'mg/dl' returns empty string",
    "",
    result8
  );

  // Test 9: Fallback from componentCommonName to componentName
  const shRow9 = {
    componentName: "cholesterol",
    units: "mg/dl"
  };
  const result9 = deriveLoincFromSH(shRow9);
  assert(
    result9 === "2093-3",
    "SH: Falls back to componentName when componentCommonName missing",
    "2093-3",
    result9
  );

  // Test 10: componentCommonName takes precedence over componentName
  const shRow10 = {
    componentCommonName: "cholesterol",
    componentName: "different name",
    units: "mg/dl"
  };
  const result10 = deriveLoincFromSH(shRow10);
  assert(
    result10 === "2093-3",
    "SH: componentCommonName takes precedence over componentName",
    "2093-3",
    result10
  );

  // Test 11: Missing units returns empty string
  const shRow11 = {
    componentCommonName: "cholesterol"
  };
  const result11 = deriveLoincFromSH(shRow11);
  assert(
    result11 === "",
    "SH: Missing units returns empty string",
    "",
    result11
  );

  // Test 12: Missing componentCommonName AND componentName returns empty string
  const shRow12 = {
    units: "mg/dl"
  };
  const result12 = deriveLoincFromSH(shRow12);
  assert(
    result12 === "",
    "SH: Missing both componentCommonName and componentName returns empty string",
    "",
    result12
  );

  // Test 13: Null componentCommonName returns empty string
  const shRow13 = {
    componentCommonName: null,
    units: "mg/dl"
  };
  const result13 = deriveLoincFromSH(shRow13);
  assert(
    result13 === "",
    "SH: Null componentCommonName returns empty string",
    "",
    result13
  );

  // Test 14: Empty string componentCommonName returns empty string
  const shRow14 = {
    componentCommonName: "",
    units: "mg/dl"
  };
  const result14 = deriveLoincFromSH(shRow14);
  assert(
    result14 === "",
    "SH: Empty string componentCommonName returns empty string",
    "",
    result14
  );

  // Test 15: Glucose mapping
  const shRow15 = {
    componentCommonName: "glucose",
    units: "mg/dl"
  };
  const result15 = deriveLoincFromSH(shRow15);
  assert(
    result15 === "2345-7",
    "SH: 'glucose'/'mg/dl' maps to '2345-7'",
    "2345-7",
    result15
  );

  // Test 16: Triglycerides mapping
  const shRow16 = {
    componentCommonName: "triglycerides",
    units: "mg/dl"
  };
  const result16 = deriveLoincFromSH(shRow16);
  assert(
    result16 === "2571-8",
    "SH: 'triglycerides'/'mg/dl' maps to '2571-8'",
    "2571-8",
    result16
  );

  // Test 17: Sodium with mmol/L units
  const shRow17 = {
    componentCommonName: "sodium",
    units: "mmol/l"
  };
  const result17 = deriveLoincFromSH(shRow17);
  assert(
    result17 === "2951-2",
    "SH: 'sodium'/'mmol/l' maps to '2951-2'",
    "2951-2",
    result17
  );

  // Test 18: Potassium with mmol/L units
  const shRow18 = {
    componentCommonName: "potassium",
    units: "mmol/l"
  };
  const result18 = deriveLoincFromSH(shRow18);
  assert(
    result18 === "2823-3",
    "SH: 'potassium'/'mmol/l' maps to '2823-3'",
    "2823-3",
    result18
  );
});

// ============================================================================
// EDGE CASES AND ERROR HANDLING TESTS
// ============================================================================

testSuite('Edge Cases and Error Handling Tests', () => {
  
  // Test 1: Special characters in component name - Hemoglobin A1C %
  const shRow1 = {
    componentCommonName: "hemoglobin a1c %",
    units: "% of total hgb"
  };
  const result1 = deriveLoincFromSH(shRow1);
  assert(
    result1 === "4548-4",
    "SH: Special character % in 'hemoglobin a1c %' is handled correctly",
    "4548-4",
    result1
  );

  // Test 2: Special characters with uppercase
  const shRow2 = {
    componentCommonName: "HEMOGLOBIN A1C %",
    units: "% OF TOTAL HGB"
  };
  const result2 = deriveLoincFromSH(shRow2);
  assert(
    result2 === "4548-4",
    "SH: Special character % with uppercase normalizes correctly",
    "4548-4",
    result2
  );

  // Test 3: Various unit formats - U/L
  const shRow3 = {
    componentCommonName: "ast",
    units: "u/l"
  };
  const result3 = deriveLoincFromSH(shRow3);
  assert(
    result3 === "1920-8",
    "SH: Unit format 'u/l' works correctly for AST",
    "1920-8",
    result3
  );

  // Test 4: Various unit formats - mmol/L
  const shRow4 = {
    componentCommonName: "chloride",
    units: "mmol/l"
  };
  const result4 = deriveLoincFromSH(shRow4);
  assert(
    result4 === "2075-0",
    "SH: Unit format 'mmol/l' works correctly for Chloride",
    "2075-0",
    result4
  );

  // Test 5: Various unit formats - g/dL
  const shRow5 = {
    componentCommonName: "protein",
    units: "g/dl"
  };
  const result5 = deriveLoincFromSH(shRow5);
  assert(
    result5 === "2885-2",
    "SH: Unit format 'g/dl' works correctly for Protein",
    "2885-2",
    result5
  );

  // Test 6: FH with malformed row object (no error thrown)
  const fhRow6 = { someOtherField: "value" };
  const result6 = deriveLoincFromFH(fhRow6);
  assert(
    result6 === "",
    "FH: Malformed row object returns empty string without error",
    "",
    result6
  );

  // Test 7: SH with malformed row object (no error thrown)
  const shRow7 = { someOtherField: "value" };
  const result7 = deriveLoincFromSH(shRow7);
  assert(
    result7 === "",
    "SH: Malformed row object returns empty string without error",
    "",
    result7
  );

  // Test 8: FH with empty object
  const fhRow8 = {};
  const result8 = deriveLoincFromFH(fhRow8);
  assert(
    result8 === "",
    "FH: Empty object returns empty string",
    "",
    result8
  );

  // Test 9: SH with empty object
  const shRow9 = {};
  const result9 = deriveLoincFromSH(shRow9);
  assert(
    result9 === "",
    "SH: Empty object returns empty string",
    "",
    result9
  );

  // Test 10: Multiple spaces in component name are collapsed
  const shRow10 = {
    componentCommonName: "hdl    cholesterol",
    units: "mg/dl"
  };
  const result10 = deriveLoincFromSH(shRow10);
  assert(
    result10 === "2085-9",
    "SH: Multiple spaces in component name are collapsed to single space",
    "2085-9",
    result10
  );

  // Test 11: LDL Cholesterol mapping
  const shRow11 = {
    componentCommonName: "ldl cholesterol",
    units: "mg/dl"
  };
  const result11 = deriveLoincFromSH(shRow11);
  assert(
    result11 === "13457-7",
    "SH: 'ldl cholesterol'/'mg/dl' maps to '13457-7'",
    "13457-7",
    result11
  );

  // Test 12: Calcium mapping
  const shRow12 = {
    componentCommonName: "calcium",
    units: "mg/dl"
  };
  const result12 = deriveLoincFromSH(shRow12);
  assert(
    result12 === "17861-6",
    "SH: 'calcium'/'mg/dl' maps to '17861-6'",
    "17861-6",
    result12
  );

  // Test 13: Albumin mapping
  const shRow13 = {
    componentCommonName: "albumin",
    units: "g/dl"
  };
  const result13 = deriveLoincFromSH(shRow13);
  assert(
    result13 === "1751-7",
    "SH: 'albumin'/'g/dl' maps to '1751-7'",
    "1751-7",
    result13
  );

  // Test 14: Bilirubin Total mapping
  const shRow14 = {
    componentCommonName: "bilirubin total",
    units: "mg/dl"
  };
  const result14 = deriveLoincFromSH(shRow14);
  assert(
    result14 === "1975-2",
    "SH: 'bilirubin total'/'mg/dl' maps to '1975-2'",
    "1975-2",
    result14
  );

  // Test 15: Alkaline Phosphatase mapping
  const shRow15 = {
    componentCommonName: "alkaline phosphatase",
    units: "u/l"
  };
  const result15 = deriveLoincFromSH(shRow15);
  assert(
    result15 === "6768-6",
    "SH: 'alkaline phosphatase'/'u/l' maps to '6768-6'",
    "6768-6",
    result15
  );

  // Test 16: CO2 mapping
  const shRow16 = {
    componentCommonName: "co2",
    units: "mmol/l"
  };
  const result16 = deriveLoincFromSH(shRow16);
  assert(
    result16 === "2028-9",
    "SH: 'co2'/'mmol/l' maps to '2028-9'",
    "2028-9",
    result16
  );
});

// ============================================================================
// RUN ALL TESTS AND PRINT SUMMARY
// ============================================================================

printSummary();