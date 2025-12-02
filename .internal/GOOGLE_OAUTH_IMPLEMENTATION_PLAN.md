# Google OAuth Scope Migration: Implementation Plan

## 1. Executive Summary

**Problem:** Our application's use of the `https://www.googleapis.com/auth/spreadsheets` scope has been rejected by Google's OAuth Verification team. This scope is overly broad and requires a burdensome annual security assessment.

**Solution:** We will migrate to the `https://www.googleapis.com/auth/drive.file` scope and integrate the Google Picker API. This approach is recommended by Google, enhances user privacy, and removes the need for annual security reviews.

**Impact:** This change will require existing users to re-authorize the application and select their spreadsheet again. However, it will not result in any data loss.

## 2. Current State Analysis

- **Application Version:** 2.2.4
- **OAuth Scope:** `https://www.googleapis.com/auth/spreadsheets`
- **Functionality:** The application creates, reads, and writes to a single Google Sheet. It does not require access to any other spreadsheets in the user's Drive.
- **Compliance Issue:** The current scope grants broad access to all of the user's spreadsheets, which violates Google's policy of least privilege.

## 3. Proposed Solutions

### Option A: Migrate to `spreadsheets.currentonly`

- **Description:** This scope grants access only to the spreadsheet that is currently open in the user's browser.
- **Pros:**
    - More secure than the broad `spreadsheets` scope.
- **Cons:**
    - **Poor User Experience:** Requires the user to have the target spreadsheet open every time the application needs to access it. This is not practical for our use case, as the application runs in the background.
    - **Limited Functionality:** Does not allow for the creation of new spreadsheets.

### Option B: Migrate to `drive.file` with Google Picker

- **Description:** This scope allows the application to access only the specific file(s) that the user selects through the Google Picker API.
- **Pros:**
    - **Recommended by Google:** This is the approach Google has explicitly recommended.
    - **Enhanced Security and Privacy:** The application only has access to the files the user has explicitly granted permission for.
    - **No Verification or CASA Assessment:** The `drive.file` scope is non-sensitive and does not require a formal verification process or an annual CASA security assessment.
    - **Improved User Experience:** The Google Picker provides a familiar and intuitive file selection interface. The new `setFileIds()` method allows us to pre-select the user's previously chosen file, streamlining the experience for returning users.
- **Cons:**
    - **One-Time User Action Required:** Existing users will need to re-authenticate and select their spreadsheet using the Google Picker.

## 4. Recommendation

We strongly recommend **Option B: Migrate to `drive.file` with Google Picker**.

This approach directly addresses Google's feedback, significantly improves the security and privacy of our application, and removes a significant compliance burden. While it does require a one-time action from our existing users, the long-term benefits are substantial.

## 5. Risk Assessment and Mitigation

| Risk | Likelihood | Impact | Mitigation Strategy |
| --- | --- | --- | --- |
| **User Drop-off** | Medium | Medium | We will provide clear in-app instructions and a one-time notification to guide users through the re-authentication process. |
| **Bugs in Picker Integration** | Low | High | We will conduct thorough testing across multiple browsers and scenarios to ensure a smooth user experience. |
| **Loss of Stored Spreadsheet ID** | Low | Medium | The migration logic will be designed to gracefully handle cases where the previously stored spreadsheet ID is not accessible. The user will simply be prompted to select a file. |

## 6. High-Level Implementation Steps

1.  **Update Google Cloud Console:**
    -   Remove the `https://www.googleapis.com/auth/spreadsheets` scope.
    -   Add the `https://www.googleapis.com/auth/drive.file` scope.
2.  **Modify `manifest.json`:**
    -   Update the `oauth2.scopes` to reflect the change.
3.  **Integrate Google Picker API:**
    -   Create a new HTML file for the Picker UI.
    -   Implement the Picker logic, including the use of `setFileIds()` for returning users.
4.  **Update Background Script:**
    -   Modify the API calls to use the `drive.file` scope.
    -   Store and retrieve the selected `fileId`.
5.  **Develop User Communication:**
    -   Create a clear and concise in-app message explaining the change and guiding the user through the re-authentication process.
