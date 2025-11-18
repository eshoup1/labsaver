#!/usr/bin/env node

/**
 * Quest LOINC Mapping Builder
 * 
 * This script automatically generates Quest biomarker code to LOINC code mappings
 * by fetching data from Quest Diagnostics' public test directory.
 * 
 * DATA SOURCE:
 * - Quest Diagnostics Test Directory API: https://testdirectory.questdiagnostics.com
 * - The API provides test metadata including LOINC codes, test names, units, and specimen info
 * 
 * MAPPING RULES (Strict - No Fuzzy Matching):
 * 1. Quest must return exactly ONE LOINC code for the test
 * 2. Quest's official test name must match FH's biomarker name (after normalization)
 * 3. If both have units, they must match after normalization
 * 4. Otherwise, the mapping is discarded
 * 
 * NORMALIZATION:
 * - Convert to lowercase
 * - Trim whitespace
 * - Collapse multiple spaces to single space
 * - Remove leading/trailing punctuation (except %, /)
 * 
 * USAGE:
 *   npm run build:quest-map
 *   npm run build:quest-map -- --input data/sample_quest_codes.json
 *   npm run build:quest-map -- --input data/fh_export.csv
 * 
 * INPUT FORMAT:
 * - JSON: Array of objects with { questBiomarkerCode, biomarkerName, units? }
 * - CSV: Headers must include questBiomarkerCode, biomarkerName, units (optional)
 * 
 * OUTPUT:
 * - Writes to: function-health-exporter/data/quest_loinc_map.json
 * - Preserves existing mappings
 * - Format: { "questCode": { "loinc": "1234-5", "biomarkerName": "...", "units": "...", "source": "quest_auto" } }
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  OUTPUT_FILE: path.join(__dirname, '../data/quest_loinc_map.json'),
  DEFAULT_INPUT: path.join(__dirname, '../data/sample_quest_codes.json'),
  QUEST_API_BASE: 'https://testdirectory.questdiagnostics.com',
  REQUEST_DELAY_MS: 1000, // Rate limiting: 1 second between requests
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 2000,
};

/**
 * Normalizes a field value for consistent matching
 * @param {string|null|undefined} value - The value to normalize
 * @returns {string} Normalized value
 */
function normalizeField(value) {
  if (!value) return '';
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^[^a-z0-9]+/, '')
    .replace(/[^a-z0-9%/ ]+$/, '');
}

/**
 * Delays execution for specified milliseconds
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetches Quest test metadata with retry logic
 * @param {string} questCode - Quest biomarker code
 * @returns {Promise<Object|null>} Test metadata or null if failed
 */
async function fetchQuestMetadata(questCode, retryCount = 0) {
  try {
    // Quest Test Directory API endpoint
    const url = `${CONFIG.QUEST_API_BASE}/test/test-detail/${questCode}`;
    
    console.log(`  Fetching: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FH-LOINC-Mapper/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 10000,
    });

    if (response.status !== 200) {
      console.warn(`  ⚠️  Non-200 status: ${response.status}`);
      return null;
    }

    // Parse HTML response
    const $ = cheerio.load(response.data);
    
    // Extract test name
    const testName = $('h1.test-name, .test-title, h1').first().text().trim();
    
    // Extract LOINC codes (look for LOINC in various possible locations)
    const loincCodes = [];
    $('body').find('*').each((i, elem) => {
      const text = $(elem).text();
      // Match LOINC pattern: digits-digit (e.g., 1234-5)
      const matches = text.match(/\b(\d{4,5}-\d)\b/g);
      if (matches) {
        loincCodes.push(...matches);
      }
    });
    
    // Remove duplicates
    const uniqueLoincCodes = [...new Set(loincCodes)];
    
    // Extract units (look for common unit patterns)
    let units = '';
    const unitsMatch = response.data.match(/units?[:\s]+([a-zA-Z0-9\/% ]+)/i);
    if (unitsMatch) {
      units = unitsMatch[1].trim();
    }
    
    // Extract specimen type
    let specimen = '';
    const specimenMatch = response.data.match(/specimen[:\s]+([a-zA-Z ]+)/i);
    if (specimenMatch) {
      specimen = specimenMatch[1].trim();
    }

    return {
      testName,
      loincCodes: uniqueLoincCodes,
      units,
      specimen,
      rawHtml: response.data.substring(0, 500), // Keep snippet for debugging
    };

  } catch (error) {
    if (retryCount < CONFIG.MAX_RETRIES) {
      console.warn(`  ⚠️  Error fetching (retry ${retryCount + 1}/${CONFIG.MAX_RETRIES}):`, error.message);
      await delay(CONFIG.RETRY_DELAY_MS);
      return fetchQuestMetadata(questCode, retryCount + 1);
    }
    
    console.error(`  ❌ Failed after ${CONFIG.MAX_RETRIES} retries:`, error.message);
    return null;
  }
}

/**
 * Validates if Quest metadata matches FH biomarker data
 * @param {Object} questData - Quest metadata
 * @param {Object} fhData - FH biomarker data
 * @returns {boolean} True if valid mapping
 */
function isValidMapping(questData, fhData) {
  // Rule 1: Must have exactly ONE LOINC code
  if (!questData.loincCodes || questData.loincCodes.length !== 1) {
    console.log(`  ❌ Rejected: ${questData.loincCodes?.length || 0} LOINC codes (need exactly 1)`);
    return false;
  }

  // Rule 2: Test names must match (normalized)
  const questName = normalizeField(questData.testName);
  const fhName = normalizeField(fhData.biomarkerName);
  
  if (questName !== fhName) {
    console.log(`  ❌ Rejected: Name mismatch`);
    console.log(`     Quest: "${questName}"`);
    console.log(`     FH:    "${fhName}"`);
    return false;
  }

  // Rule 3: If both have units, they must match
  const questUnits = normalizeField(questData.units);
  const fhUnits = normalizeField(fhData.units);
  
  if (questUnits && fhUnits && questUnits !== fhUnits) {
    console.log(`  ❌ Rejected: Units mismatch`);
    console.log(`     Quest: "${questUnits}"`);
    console.log(`     FH:    "${fhUnits}"`);
    return false;
  }

  return true;
}

/**
 * Loads existing mappings from output file
 * @returns {Promise<Object>} Existing mappings object
 */
async function loadExistingMappings() {
  try {
    const data = await fs.readFile(CONFIG.OUTPUT_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('No existing mappings file found, starting fresh.');
      return {};
    }
    throw error;
  }
}

/**
 * Saves mappings to output file
 * @param {Object} mappings - Mappings object to save
 */
async function saveMappings(mappings) {
  // Ensure directory exists
  await fs.mkdir(path.dirname(CONFIG.OUTPUT_FILE), { recursive: true });
  
  // Sort keys for consistent output
  const sortedMappings = Object.keys(mappings)
    .sort()
    .reduce((acc, key) => {
      acc[key] = mappings[key];
      return acc;
    }, {});
  
  await fs.writeFile(
    CONFIG.OUTPUT_FILE,
    JSON.stringify(sortedMappings, null, 2) + '\n',
    'utf-8'
  );
}

/**
 * Parses input file (JSON or CSV)
 * @param {string} inputPath - Path to input file
 * @returns {Promise<Array>} Array of biomarker objects
 */
async function parseInputFile(inputPath) {
  const content = await fs.readFile(inputPath, 'utf-8');
  const ext = path.extname(inputPath).toLowerCase();

  if (ext === '.json') {
    return JSON.parse(content);
  } else if (ext === '.csv') {
    // Simple CSV parser
    const lines = content.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = values[i] || '';
      });
      return obj;
    });
  } else {
    throw new Error(`Unsupported file format: ${ext}. Use .json or .csv`);
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('🔬 Quest LOINC Mapping Builder\n');
  console.log('═'.repeat(60));

  // Parse command line arguments
  const args = process.argv.slice(2);
  const inputIndex = args.indexOf('--input');
  
  let inputPath;
  if (inputIndex !== -1 && args[inputIndex + 1]) {
    // User specified an input file
    inputPath = path.resolve(args[inputIndex + 1]);
  } else {
    // Use default input file
    inputPath = CONFIG.DEFAULT_INPUT;
  }

  console.log(`📁 Input file: ${inputPath}`);
  console.log(`📁 Output file: ${CONFIG.OUTPUT_FILE}\n`);

  // Load input data
  let inputData;
  try {
    inputData = await parseInputFile(inputPath);
    console.log(`✅ Loaded ${inputData.length} biomarker codes\n`);
  } catch (error) {
    console.error(`❌ Failed to load input file: ${error.message}`);
    process.exit(1);
  }

  // Load existing mappings
  const existingMappings = await loadExistingMappings();
  const existingCount = Object.keys(existingMappings).length;
  console.log(`📋 Existing mappings: ${existingCount}\n`);

  // Process each biomarker code
  const stats = {
    total: inputData.length,
    skipped: 0,
    fetched: 0,
    mapped: 0,
    failed: 0,
  };

  console.log('═'.repeat(60));
  console.log('Processing biomarker codes...\n');

  for (const item of inputData) {
    const questCode = item.questBiomarkerCode?.toString().trim();
    
    if (!questCode) {
      console.log(`⚠️  Skipping item with no questBiomarkerCode`);
      stats.skipped++;
      continue;
    }

    console.log(`\n🔍 Processing: ${questCode} (${item.biomarkerName || 'Unknown'})`);

    // Skip if already mapped
    if (existingMappings[questCode]) {
      console.log(`  ⏭️  Already mapped: ${existingMappings[questCode]}`);
      stats.skipped++;
      continue;
    }

    // Fetch Quest metadata
    const questData = await fetchQuestMetadata(questCode);
    stats.fetched++;

    if (!questData) {
      console.log(`  ❌ Failed to fetch metadata`);
      stats.failed++;
      await delay(CONFIG.REQUEST_DELAY_MS);
      continue;
    }

    console.log(`  📊 Quest data:`);
    console.log(`     Name: ${questData.testName}`);
    console.log(`     LOINC codes: ${questData.loincCodes.join(', ') || 'None'}`);
    console.log(`     Units: ${questData.units || 'N/A'}`);

    // Validate mapping
    if (!isValidMapping(questData, item)) {
      stats.failed++;
      await delay(CONFIG.REQUEST_DELAY_MS);
      continue;
    }

    // Create mapping
    const loincCode = questData.loincCodes[0];
    existingMappings[questCode] = {
      loinc: loincCode,
      biomarkerName: item.biomarkerName,
      units: questData.units || item.units || '',
      source: 'quest_auto',
    };

    console.log(`  ✅ Mapped: ${questCode} → ${loincCode}`);
    stats.mapped++;

    // Rate limiting
    await delay(CONFIG.REQUEST_DELAY_MS);
  }

  // Save updated mappings
  await saveMappings(existingMappings);

  // Print summary
  console.log('\n' + '═'.repeat(60));
  console.log('📊 Summary:');
  console.log(`   Total codes processed: ${stats.total}`);
  console.log(`   Already mapped (skipped): ${stats.skipped}`);
  console.log(`   Metadata fetched: ${stats.fetched}`);
  console.log(`   New mappings created: ${stats.mapped}`);
  console.log(`   Failed/rejected: ${stats.failed}`);
  console.log(`   Final mapping count: ${Object.keys(existingMappings).length}`);
  console.log('═'.repeat(60));
  console.log(`\n✅ Mappings saved to: ${CONFIG.OUTPUT_FILE}\n`);
}

// Run the script
main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});