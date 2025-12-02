# Testing Guide for Google OAuth Changes (v2.0.5)

This document provides a comprehensive guide for testing the implementation of Google's required OAuth changes, specifically the use of the `drive.file` scope with the Google Picker API.

## 1. Local Testing Setup

To begin testing, follow these steps to set up the extension locally:

1.  **Load the extension in Chrome:**
    *   Navigate to `chrome://extensions`.
    *   Enable "Developer mode".
    *   Click "Load unpacked" and select the `temp-v2.0.5-extract/` directory.

2.  **Configure the API Key:**
    *   Open `temp-v2.0.5-extract/manifest.json`.
    *   Ensure the `key` field is set to the development API key: `AIzaSyBQM5X5npgqXYPISCF1oW4P1UpDAr9Ce38`.

3.  **Verify Google Cloud Console Configuration:**
    *   Ensure the development project in the Google Cloud Console is correctly configured with the OAuth consent screen and credentials.

## 2. Test Scenarios

### 2.1. First-Time File Selection

**Objective:** Verify that a first-time user can successfully authenticate and select a file using the Google Picker.

*   **Steps:**
    1.  Open the extension and initiate an export.
    2.  When prompted, grant the necessary permissions.
    3.  Select a file from the Google Picker.
*   **Verification:**
    *   Confirm that the file is successfully selected and the data is exported without errors.

### 2.2. Subsequent Exports

**Objective:** Ensure that after the initial authentication, subsequent exports do not require re-authentication.

*   **Steps:**
    1.  After the first successful export, initiate another export.
*   **Verification:**
    *   The Google Picker should open without requiring the user to log in or grant permissions again.

### 2.3. Multi-Provider Workflow (FH + SH)

**Objective:** Test the workflow when dealing with multiple health providers (e.g., FH and SH).

*   **Steps:**
    1.  Perform an export from one provider.
    2.  Switch to another provider and perform another export.
*   **Verification:**
    *   The extension should handle the context switch gracefully, without authentication issues.

### 2.4. Error Handling

**Objective:** Verify that the extension properly handles various error conditions.

*   **Test Cases:**
    *   **User denies permission:** The extension should display a user-friendly error message.
    *   **Invalid API key:** The extension should fail gracefully and log a relevant error.
    *   **Network issues:** Test how the extension behaves during network interruptions.

## 3. Common Issues and Troubleshooting

*   **Issue:** The Google Picker does not open.
    *   **Solution:** Verify that the API key is correct and that the Google Picker API is enabled in the Google Cloud Console.
*   **Issue:** Authentication errors.
    *   **Solution:** Clear your browser's cache and cookies, and try again. Ensure the OAuth consent screen is configured correctly.