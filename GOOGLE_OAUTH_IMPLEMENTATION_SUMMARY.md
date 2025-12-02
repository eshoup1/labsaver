# Summary: Google OAuth Scope Migration

To comply with Google's updated API policies and enhance user privacy, we are migrating our application's permissions for Google Sheets.

## What's Changing?

- **From:** Broad access to all of a user's spreadsheets (`spreadsheets` scope).
- **To:** Restricted access to only the single file selected by the user (`drive.file` scope).

## Why Are We Making This Change?

- **Google Requirement:** Google has rejected our use of the broad `spreadsheets` scope.
- **Enhanced Security:** This change follows the principle of least privilege, meaning our application will only have access to the data it absolutely needs.
- **Improved User Trust:** Users will have explicit control over which file the application can access.
- **Compliance:** This change removes the need for an annual, costly security assessment.

## What to Expect

- **One-Time Action:** When you next use the application, you will be asked to re-authorize it and select your spreadsheet using the standard Google file picker.
- **No Data Loss:** All your existing data will remain safe and untouched in your Google Drive.

We believe this is a positive and necessary change that strengthens our commitment to user privacy and security.