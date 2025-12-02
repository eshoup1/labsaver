# LabSaver Architecture

## 1. Table of Contents
- [Project Overview](#2-project-overview)
- [Historical Context: The Dual-Directory Problem](#3-historical-context-the-dual-directory-problem)
- [Directory Structure](#4-directory-structure)
- [Build System Architecture](#5-build-system-architecture)
- [OAuth Credential Management](#6-oauth-credential-management)
- [Configuration System](#7-configuration-system)
- [Design Decisions](#8-design-decisions)
- [Security Model](#9-security-model)

## 2. Project Overview

LabSaver is a Chrome extension that empowers users to export their lab results from multiple health providers into a consolidated Google Sheet. It is designed with a strong focus on privacy, processing all data locally in the browser and ensuring users retain full control over their health information.

### Core Functionality:
- **Data Export**: Extracts lab results from supported health portals (currently Function Health and Sutter Health).
- **Google Sheets Integration**: Writes the extracted data into a user-owned Google Sheet.
- **LOINC Derivation**: Standardizes lab results by mapping provider-specific test codes to universal LOINC codes, enabling cross-provider data comparison.

The extension operates as a Manifest V3 extension, utilizing a content script to interact with health portal websites and a background service worker to handle data processing and API interactions with Google Sheets.

## 3. Historical Context: The Dual-Directory Problem

Prior to the version 2.0.4 refactor, the LabSaver codebase was split across two separate directories:

1.  **`lab-result-exporter/`**: Contained the core extension source code.
2.  **`function-health-exporter/`**: Housed scripts, test files, and LOINC mapping data.

This dual-directory structure created several significant challenges:
- **Build Complexity**: The build process was manual and error-prone, requiring developers to copy files between directories. The `package-extension.sh` script was a workaround, not a robust solution.
- **Dependency Management**: `package.json` was in the root, but related scripts and data were in a subdirectory, leading to confusing relative paths (`../`).
- **Developer Confusion**: The separation of concerns was unclear, making it difficult for new developers (and AI assistants) to understand the project structure and locate relevant files.
- **Risk of Regression**: The manual nature of the build process led to regressions, most notably the version 2.0.3 issue where critical files were not included in the production build, causing the extension to fail.

The codebase consolidation effort addressed these problems by merging the two directories into a single, unified project structure with an automated, environment-aware build system.

## 4. Directory Structure

The consolidated directory structure is organized to provide a clear separation of concerns, making the codebase easier to navigate, maintain, and build.

```
.
├── config/
│   ├── common.json
│   └── development.json
├── data/
│   ├── quest_loinc_map.json
│   └── sh_loinc_map.json
├── frontend/
│   └── (React frontend application)
├── scripts/
│   ├── build.js
│   └── buildQuestLoincMap.js
├── src/
│   ├── background.js
│   ├── content.js
│   └── icons/
└── tests/
    └── loinc-derivation.test.js
```

- **`src/`**: This is the heart of the Chrome extension. It contains all the source code that is packaged into the final `dist/` directory.
  - `background.js`: The service worker that manages Google Sheets API calls, data processing, and OAuth authentication.
    - `content.js`: The content script injected into health provider websites to add the "Export" button and fetch lab data.
    - `icons/`: Extension icons in various required sizes.
    - `data/`: LOINC mapping files that are bundled with the extension for runtime use.

- **`config/`**: This directory contains the environment-specific configurations for the extension.
    - `common.json`: Base `manifest.json` settings that apply to all environments (e.g., name, description, content script definitions).
    - `development.json`: Settings specific to the development environment, including the development OAuth client ID and a more permissive content security policy.

- **`scripts/`**: Contains Node.js scripts used for building the extension and managing data. These scripts are for development purposes and are not included in the final extension package.
    - `build.js`: The core build script that generates the `manifest.json`, copies source files, and packages the extension into a `.zip` file.
    - `buildQuestLoincMap.js`: A utility script to fetch LOINC codes from the Quest Diagnostics API and update the `quest_loinc_map.json` file.

- **`data/`**: This directory is now a legacy directory. The LOINC mapping data has been moved into `src/data/` so it can be bundled with the extension. This directory may be used for temporary data files or other data-related scripts in the future.

- **`tests/`**: Contains test files for verifying the extension's functionality.
    - `loinc-derivation.test.js`: Unit tests for the LOINC code derivation logic.

- **`frontend/`**: A separate React application that can be used for user interface components, options pages, or other frontend needs. It has its own build system and is not directly bundled with the extension unless specified in the build process.

## 5. Build System Architecture

The build system is a Node.js-based process designed to be simple, reliable, and environment-aware. It is managed by the [`scripts/build.js`](scripts/build.js) file and orchestrated via npm scripts in [`package.json`](package.json).

### Key Features:
- **Environment-Based Builds**: The build script uses the `NODE_ENV` environment variable (`development` or `production`) to determine which configuration to use.
- **Automated Manifest Generation**: It merges the base `config/common.json` with an environment-specific config file (e.g., `config/development.json`) to create the final `manifest.json`. This ensures the correct permissions and OAuth credentials are used for each environment.
- **Source Code Consolidation**: The script copies all files from the `src/` directory into a `dist/` directory, which becomes the root of the packaged extension.
- **Automated Packaging**: After building the `dist/` directory, the script automatically creates a versioned `.zip` file (e.g., `labsaver-v2.0.4-development.zip`), ready for upload or local installation.

### How it Works:
1.  **Initiation**: A developer runs `npm run build:dev` or `npm run build:prod`.
2.  **Environment Detection**: `scripts/build.js` checks `process.env.NODE_ENV`.
3.  **Configuration Merge**: It reads `config/common.json` and the corresponding environment config file. The two JSON objects are merged, with environment-specific values overwriting common values.
4.  **Directory Preparation**: The `dist/` directory is cleaned and recreated.
5.  **File Operations**:
    - The merged configuration is written to `dist/manifest.json`.
    - All files from `src/` are copied into `dist/`.
6.  **Packaging**: The contents of `dist/` are compressed into a `.zip` archive.

This architecture solves the historical problems by creating a single source of truth (`src/`) and automating the entire build and packaging process, eliminating the risk of manual error.

## 6. OAuth Credential Management

The extension requires two separate Google OAuth 2.0 client IDs to ensure a secure and compliant workflow:

1.  **Development Client ID**: Used for local development and testing. This ID is associated with an unpublished, unlisted Chrome Web Store item. It has a relaxed security posture, allowing developers to test the extension without going through the full verification process. This client ID is stored in [`config/development.json`](config/development.json) and is safe to commit to the repository.
2.  **Production Client ID**: Used exclusively for the official version of the extension published on the Chrome Web Store. This ID is linked to the public store listing and has undergone Google's security review. It is subject to stricter security policies. This ID is stored in `config/production.json`, which is **never committed to the repository**.

### Why Two Client IDs?
- **Security**: It prevents the production client ID and its associated permissions from being exposed in the public source code.
- **Compliance**: Google's OAuth policies require different client IDs for development and production environments.
- **Developer Experience**: It allows developers to work on the extension without needing access to production secrets.

The build system automatically injects the correct client ID into the `manifest.json` based on the `NODE_ENV`, ensuring the right credentials are used for each build.

## 7. Configuration System

The configuration system is centered around the JSON files in the `config/` directory. This system is designed to create a valid `manifest.json` file tailored to the target environment.

### Merging Logic:
The `manifest.json` is generated by merging `config/common.json` with an environment-specific file. The merging is a simple key-value overwrite:

`manifest = { ...commonConfig, ...envConfig };`

For example:
- `config/common.json` might define: `{"version": "2.0.4", "name": "LabSaver"}`
- `config/development.json` might define: `{"name": "LabSaver (Dev)"}`

The resulting `manifest.json` for a development build would be: `{"version": "2.0.4", "name": "LabSaver (Dev)"}`

This approach allows for a clean separation of base configuration from environment-specific overrides, such as the extension name, OAuth client ID, and Content Security Policy.

## 8. Design Decisions

The current architecture was chosen to prioritize simplicity, security, and developer experience.

- **Why a Node.js Build Script over Webpack/Vite?**: While bundlers like Webpack are powerful, they add a layer of complexity that is unnecessary for this extension. A simple Node.js script provides a transparent, easy-to-understand build process without complex configuration or dependencies.
- **Why JSON for Configuration?**: JSON is the native format for `manifest.json` and is easily readable by both humans and machines. It requires no special parsers and integrates seamlessly with the Node.js build script.
- **Why a Single `src` Directory?**: Consolidating all source code into a single `src` directory creates a single source of truth. It simplifies the build process, eliminates confusing relative paths, and makes the project structure intuitive.
- **Why Environment-Specific OAuth Credentials?**: This is a security best practice and a requirement for publishing on the Chrome Web Store. It protects production credentials and provides a safe sandbox for developers.

## 9. Security Model

The security model is designed to protect both the user's data and the extension's production credentials.

- **User Data Privacy**: All user data is processed locally in the browser. The extension does not send any personal health information to any server other than the Google Sheets API, which the user explicitly authorizes.
- **Protection of Production Credentials**:
  - The production OAuth client ID is stored in `config/production.json`.
  - This file is listed in the `.gitignore` file and is **never committed to the source repository**.
  - The build process for production releases must be run in a secure environment where the `config/production.json` file is present.
- **Content Security Policy (CSP)**: The `manifest.json` defines a strict CSP to prevent cross-site scripting (XSS) attacks. The CSP is configured differently for development and production to allow for more flexibility during development while maintaining strict security for the published extension.
- **Scoped Permissions**: The extension requests the minimum permissions necessary for its functionality, in compliance with Chrome Web Store policies. It uses the `identity` permission for OAuth and `storage` for local settings, without requesting broader permissions like access to all browser tabs or history.