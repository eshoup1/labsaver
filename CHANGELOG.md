# Changelog

All notable changes to the LabSaver - Health Data Exporter extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.5] - 2024-01-27

### Fixed
- Added automatic button injection after login on Function Health without requiring page refresh
- Implemented SPA navigation detection to handle client-side routing
- Button now appears automatically when navigating from login page to authenticated pages

### Technical
- Added `setupNavigationDetection()` function with URL polling and popstate listener
- Detects URL changes every 500ms and re-runs authentication check
- Prevents duplicate button injection with existing ID check

## [2.0.5] - 2024-11-26

### Fixed (Critical)
- Added authentication check to prevent button showing when user not logged in
- Added export state management so button remembers export and can reopen sheet
- Added sheet URL to export responses for proper button click handling

### Fixed
- Contents tab now uses custom sort order (Export, Definitions, Latest, Table) instead of alphabetical
- Export button now stays green and clickable after successful export, opening the Google Sheet when clicked
- Button no longer resets after 3 seconds
- Sutter Health Export Labs button now correctly right-aligned (matching Function Health)

### Changed
- Improved button UX: successful export button becomes a direct link to the exported spreadsheet
- Tab sorting in Contents now follows logical order: Export → Definitions → Latest → Table
- Simplified Sutter Health button positioning code to match Function Health approach

## [2.0.4] - 2024-11-26

### Added
- **Environment-Based Build System**: Introduced a Node.js-based build system ([`scripts/build.js`](scripts/build.js)) that supports `development` and `production` environments.
- **Separate Dev/Prod OAuth Configurations**: Created `config/` directory to manage separate OAuth credentials for each environment, enhancing security.
- **Automated Manifest Generation**: The build script now automatically generates `manifest.json` by merging a common config with an environment-specific one.
- **Comprehensive Documentation**: Added new documentation for architecture, development, release process, and AI assistant guidance.

### Changed
- **Consolidated Codebase**: Merged the legacy `function-health-exporter` and `lab-result-exporter` directories into a single, unified project structure.
- **Moved Source Files**: All extension source code is now located in the `src/` directory, creating a single source of truth.
- **Replaced Build Script**: Replaced the old `package-extension.sh` script with the more robust `scripts/build.js`.

### Fixed
- **Version 2.0.3 Regression**: The new build system fundamentally fixes the regression issues from v2.0.3, where manual file management led to a broken extension. The automated process ensures all files from `src/` are included in every build.
- **Build System ES Module Compatibility**: The build script is an ES module (`"type": "module"` in `package.json`), ensuring compatibility with modern Node.js features.

### Security
- **Production OAuth Credentials Excluded**: The `config/production.json` file, which holds the production OAuth client ID, is now listed in `.gitignore` and is never committed to the repository, protecting it from exposure.

## [2.0.2] - 2025-11-21

### Fixed
- **Chrome Web Store Compliance**: Removed unused `scripting` permission from manifest
  - Extension was requesting but not using the `scripting` permission
  - Chrome Web Store automated review flagged this as a policy violation
  - Removed permission to comply with "Request access to the narrowest permissions necessary" policy

### Changed
- Updated version from 2.0.1 to 2.0.2
- Repackaged extension for Chrome Web Store submission

### Technical Details
- **Violation Reference ID**: Purple Potassium
- **Permissions**: Now only requests `identity` and `storage` (removed `scripting`)
- **No Breaking Changes**: Extension functionality unchanged - uses declarative content scripts instead of dynamic script injection

## [2.1.1] - 2025-11-17

### Removed - Privacy Enhancement

#### Unmapped Quest Codes Tracking Feature
**Reason**: Privacy concerns - even without storing lab values, tracking which tests a user has could reveal health conditions.

**What was removed**:
- Automatic tracking of unmapped Quest codes during export
- `unmapped_quest_codes.json` download feature
- `downloadUnmappedCodes()` function from [`background.js`](background.js)
- Automatic prioritization of `unmapped_quest_codes.json` in build script
- Auto-clearing of `unmapped_quest_codes.json` after mapping

**What remains**:
- All LOINC derivation functionality (unchanged)
- Quest LOINC mapping build script (unchanged)
- Existing mappings in [`quest_loinc_map.json`](data/quest_loinc_map.json) (unchanged)
- Manual workflow for adding new mappings

### Changed - Privacy-First Workflow

#### Quest LOINC Mapping Workflow
**New Manual Process**:
1. User exports Function Health data
2. User reviews export and identifies Quest codes without LOINC codes
3. User manually creates input file with codes they want to map
4. User runs `npm run build:quest-map -- --input their-file.json`
5. Script fetches Quest metadata and creates mappings

**Benefits**:
- ✅ User controls which codes to map
- ✅ No automatic tracking of user's tests
- ✅ No data collection about health conditions
- ✅ Privacy-first design

### Added - Privacy Documentation

- Comprehensive privacy statement in [`README.md`](README.md)
- Privacy rationale in Quest mapping documentation
- Clear explanation of what the extension does and doesn't do

### Technical Details

**Files Modified**:
- [`background.js`](background.js) - Removed unmapped tracking and download logic
- [`scripts/buildQuestLoincMap.js`](scripts/buildQuestLoincMap.js) - Restored manual workflow
- [`QUEST_LOINC_MAPPING.md`](QUEST_LOINC_MAPPING.md) - Updated to document manual process
- [`README.md`](README.md) - Added privacy statement and manual workflow
- [`IMPLEMENTATION_NOTES.md`](IMPLEMENTATION_NOTES.md) - Updated architecture notes
- [`CHANGELOG.md`](CHANGELOG.md) - This entry

**Files Deleted**:
- `data/unmapped_quest_codes.json` - No longer needed

**No Breaking Changes**:
- All existing functionality works exactly the same
- LOINC codes still derived for mapped Quest codes
- Build script still works with custom input files
- All tests still pass

## [2.1.0] - 2025-11-16

### Added

#### Quest LOINC Mapping System
- **Automated Quest LOINC mapping builder** ([`scripts/buildQuestLoincMap.js`](scripts/buildQuestLoincMap.js))
  - Fetches test metadata from Quest Diagnostics public API
  - Applies strict validation rules (exact name/unit matching)
  - Generates mappings at build-time (not runtime)
  - Preserves existing mappings during regeneration
  - Supports JSON and CSV input formats
  
- **Quest LOINC mapping file** ([`data/quest_loinc_map.json`](data/quest_loinc_map.json))
  - 13 Quest biomarker codes mapped to LOINC codes
  - Simple key-value format: `{ "questCode": "loinc-code" }`
  - Used by extension at runtime for LOINC derivation
  
- **Mapping validation script** ([`scripts/validateQuestLoincMap.js`](scripts/validateQuestLoincMap.js))
  - Validates mapping file structure
  - Checks LOINC code format
  - Detects duplicate mappings
  - Ensures data integrity
  
- **Sample Quest codes file** ([`data/sample_quest_codes.json`](data/sample_quest_codes.json))
  - Default input for mapping builder
  - Example format for custom inputs
  - 7 sample Quest codes included
  
- **Comprehensive documentation**:
  - [`QUEST_LOINC_MAPPING.md`](QUEST_LOINC_MAPPING.md) - Complete system documentation
  - Updated [`README.md`](README.md) with Quick Start guide
  - Updated [`IMPLEMENTATION_NOTES.md`](IMPLEMENTATION_NOTES.md) with technical details
  - Updated [`scripts/README.md`](scripts/README.md) with build script documentation
  - Updated [`tests/README.md`](tests/README.md) with test coverage details
  
- **NPM scripts** in [`package.json`](package.json):
  - `npm run build:quest-map` - Generate/update Quest LOINC mappings
  - `npm run validate:quest-map` - Validate mapping file structure
  - `npm run test:all` - Run validation + all tests

- **Comprehensive test coverage**:
  - 25 Function Health LOINC derivation tests
  - 13 tests covering all Quest code mappings
  - 12 edge case and error handling tests
  - Total: 59 tests across all LOINC derivation functionality

### Changed

- **LOINC derivation module** ([`loinc-derivation.js`](loinc-derivation.js))
  - Now imports Quest LOINC map as JSON module
  - `deriveLoincFromFH()` uses Quest mapping for lookups
  - Maintains backward compatibility with existing code
  
- **Function Health export**:
  - `Derived_LOINC` column now populated using Quest mappings
  - Empty string returned for unmapped Quest codes (no errors)
  - Consistent behavior across all biomarkers

### Technical Details

#### Architecture
- **Build-time generation**: Mappings created before deployment
- **Runtime lookup**: Fast O(1) hash table lookups
- **No external API calls**: All data pre-fetched and validated
- **Strict validation**: Only exact 1:1 mappings (no fuzzy matching)

#### Data Source
- Quest Diagnostics Test Directory: https://testdirectory.questdiagnostics.com
- Public API with test metadata including LOINC codes
- Rate limited to 1 request/second with automatic retries

#### Validation Rules
1. Quest must return exactly ONE LOINC code
2. Test names must match after normalization
3. Units must match if both sources provide them

#### Files Added
- `scripts/buildQuestLoincMap.js` (390 lines)
- `scripts/validateQuestLoincMap.js` (validation script)
- `data/quest_loinc_map.json` (13 mappings)
- `data/sample_quest_codes.json` (7 sample codes)
- `QUEST_LOINC_MAPPING.md` (717 lines of documentation)

#### Files Modified
- `README.md` - Added Quest mapping Quick Start section
- `IMPLEMENTATION_NOTES.md` - Added Quest mapping implementation details
- `LOINC_MAPPINGS.md` - Updated with Quest mapping information
- `loinc-derivation.js` - Imports and uses Quest mapping file
- `scripts/README.md` - Added Quest mapping builder documentation
- `tests/README.md` - Updated test coverage information
- `package.json` - Added new NPM scripts

### Performance Impact
- **Build-time**: ~15 seconds for 13 codes (1 request/second rate limit)
- **Runtime**: Negligible (single JSON file load at startup)
- **Export speed**: No change (O(1) lookups)

### Breaking Changes
None. This is a backward-compatible addition.

### Migration Guide
No migration needed. Existing functionality unchanged.

### Known Limitations
- Only 13 Quest codes currently mapped (expandable)
- Requires exact name/unit matches (no fuzzy matching)
- Quest API structure may change over time

---

## [2.0.1] - 2025-11-16

### Fixed
- Sutter Health API calls now made from content script (same-origin context)
- PageNonce extraction and usage in same-origin requests
- Proper error detection for non-JSON responses

### Changed
- Moved all Sutter Health API calls from background script to content script
- Content script now handles data fetching and flattening
- Background script simplified to only handle Google Sheets writing

---

## [2.0.0] - 2025-11-16

### Added
- Sutter Health export functionality
- Shared spreadsheet support (FH and SH use same sheet)
- Tab prefixes for data organization (FH_ and SH_)
- LOINC derivation for both Function Health and Sutter Health
- `Derived_LOINC` column in exports

### Changed
- Renamed tabs: FH_Values → FH_Export, SH_Export → SH_Export
- Updated manifest to support both health systems
- Privacy-friendly sheet management (no Drive API permissions)

---

## [1.0.0] - Initial Release

### Added
- Function Health export functionality
- Multiple sheet export (Values, Definitions, Latest Values, Table, Grouped)
- Google Sheets integration
- OAuth 2.0 authentication
- Chrome Extension Manifest V3 support

---

## Future Releases

### Planned for 2.2.0
- Expanded Quest LOINC mapping coverage
- Data merging across systems using LOINC codes
- Trend analysis and visualization
- Additional health system support

### Under Consideration
- Automatic mapping updates via CI/CD
- Mapping confidence scores
- Manual override mechanism for mappings
- Support for other lab vendors (LabCorp, etc.)
- Export to CSV option
- Automatic periodic exports

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on contributing to this project.

## Support

For issues or questions:
1. Check the documentation (README.md, QUEST_LOINC_MAPPING.md, etc.)
2. Review this CHANGELOG for recent changes
3. Open an issue on GitHub with details

---

**Legend**:
- `Added` - New features
- `Changed` - Changes to existing functionality
- `Deprecated` - Soon-to-be removed features
- `Removed` - Removed features
- `Fixed` - Bug fixes
- `Security` - Security improvements