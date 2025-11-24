# Frequently Asked Questions (FAQ)

## Q: Why does the extension ask for permission to access `production-member-app-mid-lhuqotpy2a-ue.a.run.app`?

**A:** That URL is the official backend API for the Function Health website. Your lab result data is securely stored there.

When you click the "Export Labs" button on the Function Health site, the LabSaver extension needs to send a secure request to this specific API endpoint to fetch your lab data. This is the same way the Function Health website itself retrieves your results to display them to you.

**Key Points:**
*   **It's the official Function Health API:** This is not a third-party server.
*   **Secure access:** The extension uses your active login session to make the request, just like your browser does. It does not see or store your password.
*   **Data privacy:** The extension only *reads* this data temporarily to format it for export. It is never stored or sent anywhere other than the Google Sheet you authorize.

This permission is essential for the core functionality of exporting your Function Health labs.