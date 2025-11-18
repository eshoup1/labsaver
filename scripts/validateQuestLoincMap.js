#!/usr/bin/env node

/**
 * Validation script for quest_loinc_map.json
 * 
 * This script validates the structure and content of the Quest LOINC mapping file.
 * It checks:
 * - File can be loaded and parsed
 * - All entries have valid Quest codes (keys)
 * - All LOINC codes match the expected format (e.g., "1234-5")
 * - No duplicate LOINC codes (warns if found)
 * - No empty or null values
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// LOINC code format: digits-digit (e.g., "6690-2", "789-8")
const LOINC_PATTERN = /^\d+-\d+$/;

let errors = 0;
let warnings = 0;

function error(message) {
  console.log(`${colors.red}✗ ERROR: ${message}${colors.reset}`);
  errors++;
}

function warn(message) {
  console.log(`${colors.yellow}⚠ WARNING: ${message}${colors.reset}`);
  warnings++;
}

function success(message) {
  console.log(`${colors.green}✓ ${message}${colors.reset}`);
}

function info(message) {
  console.log(`${colors.cyan}ℹ ${message}${colors.reset}`);
}

function validateQuestLoincMap() {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`${colors.blue}Quest LOINC Map Validation${colors.reset}`);
  console.log('='.repeat(70));

  const mapPath = path.join(__dirname, '../data/quest_loinc_map.json');
  
  // Check if file exists
  if (!fs.existsSync(mapPath)) {
    error(`File not found: ${mapPath}`);
    return false;
  }
  success(`File found: quest_loinc_map.json`);

  // Load and parse JSON
  let questLoincMap;
  try {
    const fileContent = fs.readFileSync(mapPath, 'utf8');
    questLoincMap = JSON.parse(fileContent);
    success('File successfully parsed as JSON');
  } catch (err) {
    error(`Failed to parse JSON: ${err.message}`);
    return false;
  }

  // Check if it's an object
  if (typeof questLoincMap !== 'object' || questLoincMap === null || Array.isArray(questLoincMap)) {
    error('quest_loinc_map.json must be a JSON object (not array or null)');
    return false;
  }
  success('File contains a valid JSON object');

  // Get all entries
  const entries = Object.entries(questLoincMap);
  info(`Total entries: ${entries.length}`);

  if (entries.length === 0) {
    warn('No entries found in quest_loinc_map.json');
  }

  // Track LOINC codes to detect duplicates
  const loincCodes = new Map();
  
  // Validate each entry
  console.log(`\n${colors.cyan}Validating entries...${colors.reset}`);
  
  for (const [questCode, loincCode] of entries) {
    // Validate Quest code (key)
    if (!questCode || questCode.trim() === '') {
      error(`Empty Quest code found`);
      continue;
    }

    // Quest codes should be numeric strings
    if (!/^\d+$/.test(questCode)) {
      warn(`Quest code "${questCode}" is not purely numeric`);
    }

    // Validate LOINC code (value)
    if (!loincCode || loincCode.trim() === '') {
      error(`Empty LOINC code for Quest code "${questCode}"`);
      continue;
    }

    if (typeof loincCode !== 'string') {
      error(`LOINC code for Quest code "${questCode}" is not a string: ${typeof loincCode}`);
      continue;
    }

    // Check LOINC format
    if (!LOINC_PATTERN.test(loincCode)) {
      error(`Invalid LOINC format for Quest code "${questCode}": "${loincCode}" (expected format: "1234-5")`);
    }

    // Track for duplicates
    if (loincCodes.has(loincCode)) {
      warn(`Duplicate LOINC code "${loincCode}" found for Quest codes "${loincCodes.get(loincCode)}" and "${questCode}"`);
    } else {
      loincCodes.set(loincCode, questCode);
    }
  }

  // Summary
  console.log(`\n${'='.repeat(70)}`);
  console.log(`${colors.blue}Validation Summary${colors.reset}`);
  console.log('='.repeat(70));
  console.log(`Total entries validated: ${entries.length}`);
  console.log(`Unique LOINC codes: ${loincCodes.size}`);
  
  if (errors === 0 && warnings === 0) {
    console.log(`\n${colors.green}✓ All validations passed! No errors or warnings.${colors.reset}\n`);
    return true;
  } else {
    if (errors > 0) {
      console.log(`\n${colors.red}✗ ${errors} error(s) found${colors.reset}`);
    }
    if (warnings > 0) {
      console.log(`${colors.yellow}⚠ ${warnings} warning(s) found${colors.reset}`);
    }
    console.log();
    return errors === 0; // Return true if only warnings, false if errors
  }
}

// Run validation
const isValid = validateQuestLoincMap();
process.exit(isValid ? 0 : 1);