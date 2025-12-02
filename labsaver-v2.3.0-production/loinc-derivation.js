// Load JSON mappings dynamically
let questLoincMap = null;
let shLoincMap = null;

async function loadMappings() {
  if (!questLoincMap) {
    const questUrl = chrome.runtime.getURL('data/quest_loinc_map.json');
    const questResponse = await fetch(questUrl);
    questLoincMap = await questResponse.json();
  }
  if (!shLoincMap) {
    const shUrl = chrome.runtime.getURL('data/sh_loinc_map.json');
    const shResponse = await fetch(shUrl);
    shLoincMap = await shResponse.json();
  }
}

/**
 * Normalizes a field value for consistent matching
 * - Converts to lowercase
 * - Trims whitespace
 * - Collapses multiple spaces to single space
 * - Removes leading/trailing punctuation (except %, /)
 * @param {string|null|undefined} value - The value to normalize
 * @returns {string} Normalized value
 */
function normalizeField(value) {
  if (!value) return "";
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^[^a-z0-9]+/, "")
    .replace(/[^a-z0-9%/ ]+$/, "");
}

/**
 * Builds a normalized signature for Sutter Health data
 * Format: <normalizedComponentCommonName>|<normalizedUnits>
 * @param {Object} row - SH row object with componentCommonName/componentName and units
 * @returns {string} Normalized signature or empty string
 */
function buildSHSignature(row) {
  const common = normalizeField(row.componentCommonName || row.componentName || "");
  const units = normalizeField(row.units || "");
  if (!common || !units) return "";
  return `${common}|${units}`;
}

/**
 * Derives LOINC code from Function Health data
 * Uses exact mapping from questBiomarkerCode
 * @param {Object} row - FH row object with questBiomarkerCode
 * @returns {string} LOINC code or empty string
 */
export async function deriveLoincFromFH(row) {
  await loadMappings();
  try {
    const code = (row.questBiomarkerCode || "").toString().trim();
    if (!code) return "";
    
    const loinc = questLoincMap[code];
    return loinc ? loinc : "";
  } catch (error) {
    console.warn("Error deriving LOINC from FH data:", error, "Row:", row);
    return "";
  }
}

/**
 * Derives LOINC code from Sutter Health data
 * Uses normalized signature (componentCommonName|units)
 * @param {Object} row - SH row object with componentCommonName/componentName and units
 * @returns {string} LOINC code or empty string
 */
export async function deriveLoincFromSH(row) {
  await loadMappings();
  try {
    const signature = buildSHSignature(row);
    if (!signature) return "";

    const loinc = shLoincMap[signature];
    return loinc ? loinc : "";
  } catch (error) {
    console.warn("Error deriving LOINC from SH data:", error, "Row:", row);
    return "";
  }
}