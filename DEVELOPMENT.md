# Developer's Guide to LabSaver

This guide provides everything you need to know to get started with developing the LabSaver Chrome extension. For a deep dive into the "why" behind the structure, see the [`ARCHITECTURE.md`](./ARCHITECTURE.md) document.

## 1. Getting Started: Setup Instructions

Follow these steps to set up your local development environment.

### Prerequisites
- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) (LTS version recommended)
- [Google Chrome](https://www.google.com/chrome/)

### Step 1: Clone the Repository
Clone the project to your local machine:
```bash
git clone https://github.com/YOUR_USERNAME/labsaver.git
cd labsaver
```

### Step 2: Install Dependencies
Install the required Node.js packages using npm:
```bash
npm install
```

### Step 3: Set Up Google OAuth Credentials
For local development, you need your own Google OAuth 2.0 client ID. This is required for the extension to interact with the Google Sheets API.

1.  **Follow the setup guide**: Complete the steps in [`OAUTH_SETUP.md`](./OAUTH_SETUP.md) to create your client ID.
2.  **Update the development config**: Open [`config/development.json`](config/development.json:1) and replace the placeholder value of `client_id` with the client ID you just created.

    ```json
    {
      "name": "LabSaver (Dev)",
      "oauth2": {
        "client_id": "YOUR_DEVELOPMENT_CLIENT_ID.apps.googleusercontent.com",
        "scopes": [
          "https://www.googleapis.com/auth/spreadsheets",
          "https://www.googleapis.com/auth/userinfo.email"
        ]
      }
    }
    ```
    **Note**: This file is tracked by Git, but it should only contain your non-sensitive development client ID.

### Step 4: Perform an Initial Build
Run the development build script to generate the initial `dist/` directory:
```bash
npm run build:dev
```
This command compiles the `manifest.json`, copies all necessary files from `src/` into `dist/`, and prepares the extension for loading into Chrome.

### Step 5: Load the Extension in Chrome
1.  Open Chrome and navigate to `chrome://extensions`.
2.  Enable **"Developer mode"** in the top-right corner.
3.  Click **"Load unpacked"**.
4.  Select the `dist` directory from your local project folder.
5.  The "LabSaver (Dev)" extension will appear in your extensions list.

Your development environment is now ready!

## 2. Development Workflow

This is the typical day-to-day workflow for making changes to the extension.

1.  **Make Code Changes**: Modify the source files located in the `src/` directory. For example, to change the UI button, you would edit [`src/content.js`](src/content.js:1).
2.  **Rebuild the Extension**: After making changes, you must rebuild the extension for them to take effect. Run the development build script again:
    ```bash
    npm run build:dev
    ```
3.  **Reload the Extension**: Navigate back to `chrome://extensions` and click the "reload" icon on the LabSaver (Dev) extension card. This updates the extension with the latest code from your `dist/` directory.
4.  **Test Your Changes**: Go to a supported health portal (like Function Health or Sutter Health) and verify that your changes work as expected.

## 3. Build Commands

All build-related tasks are managed through npm scripts defined in [`package.json`](package.json).

-   **`npm run build:dev`**
    -   **Purpose**: Creates a development build.
    -   **Action**: Sets `NODE_ENV=development`, merges `config/common.json` with `config/development.json`, copies `src/` to `dist/`, and creates a `.zip` file. Use this for all day-to-day development.

-   **`npm run build:prod`**
    -   **Purpose**: Creates a production-ready build.
    -   **Action**: Sets `NODE_ENV=production`, merges `config/common.json` with `config/production.json` (which is not in Git). This is only used for official releases.

-   **`npm run package`**
    -   **Purpose**: An alias for `npm run build:prod`.

-   **`npm run clean`**
    -   **Purpose**: Removes the `dist/` directory and any `.zip` files.
    -   **Action**: Useful for starting a fresh build from scratch.

## 4. Testing Locally

1.  **Automated Tests**: Run the unit tests to check for regressions in the LOINC derivation logic.
    ```bash
    npm test
    ```
2.  **Manual Testing**: This is the most critical part of verification.
    -   Load the unpacked `dist/` directory in Chrome.
    -   Log in to Function Health and perform an export. Verify the Google Sheet is created and populated correctly.
    -   Log in to Sutter Health and perform an export. Verify the data is added to the correct tabs in the same Google Sheet.
    -   Check the browser's developer console for any errors in both the content script and the background service worker context.

## 5. Making Changes: Best Practices

-   **Source Files**: All runtime code, icons, and data files must be placed within the `src/` directory.
-   **Configuration**: To change the `manifest.json` (e.g., add permissions), edit the files in `config/`. Do not edit `dist/manifest.json` directly.
-   **Git Workflow**: Use feature branches for your changes (`git checkout -b feature/my-new-feature`). Use `git mv` when renaming or moving files to preserve their history.

## 6. Common Tasks

### How to Add a New Icon
1.  Add the icon file (e.g., `new-icon.png`) to the [`src/icons/`](src/icons) directory.
2.  If the icon needs to be referenced in the manifest (e.g., as the main extension icon), update [`config/common.json`](config/common.json).
3.  Rebuild the extension with `npm run build:dev`.

### How to Add a New Permission
1.  Open [`config/common.json`](config/common.json).
2.  Add the new permission to the `permissions` array.
    ```json
    "permissions": [
      "identity",
      "storage",
      "newPermission"
    ]
    ```3.  Rebuild and reload the extension.

## 7. Troubleshooting

-   **Issue**: My changes are not showing up in the browser.
    -   **Solution**: You likely forgot to either rebuild (`npm run build:dev`) or reload the extension in `chrome://extensions`. Do both.

-   **Issue**: The extension throws an "OAuth client ID is missing" error.
    -   **Solution**: Make sure you have correctly followed Step 3 of the setup instructions and that your client ID is present in [`config/development.json`](config/development.json).

-   **Issue**: The build fails with a "file not found" error for `config/production.json`.
    -   **Solution**: You are running `npm run build:prod` without the required `config/production.json` file. For development, you should always use `npm run build:dev`. Production builds are only for maintainers performing a release.