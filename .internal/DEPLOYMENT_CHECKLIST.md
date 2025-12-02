# Deployment Checklist for Google OAuth Changes (v2.0.5)

This checklist provides a step-by-step guide for deploying the new version with the updated Google OAuth implementation.

## 1. Pre-Deployment Verification

- [ ] Confirm that all test cases in `TESTING_GUIDE.md` have been successfully executed and passed.
- [ ] Ensure that there are no outstanding bugs or issues related to the OAuth changes.
- [ ] Get final approval from the project lead to proceed with the deployment.

## 2. Google Cloud Console Configuration

- [ ] **Switch to the production project** in the Google Cloud Console.
- [ ] Verify that the **OAuth Consent Screen** has been updated with the correct information and scopes.
- [ ] Ensure that the **production API key** is enabled and configured correctly.

## 3. Update API Key

- [ ] Open `temp-v2.0.5-extract/manifest.json`.
- [ ] Replace the development API key (`AIzaSyBQM5X5npgqXYPISCF1oW4P1UpDAr9Ce38`) with the production API key (`AIzaSyDDKLIV9zX_n1pO5kBqHY3au7sKLps37BA`).

## 4. Version Number Update

- [ ] In `temp-v2.0.5-extract/manifest.json`, update the `version` field to `2.0.5`.

## 5. Final Verification

- [ ] Load the extension with the production configuration locally and perform a final smoke test.
- [ ] Create a zip file of the `temp-v2.0.5-extract/` directory for submission to the Chrome Web Store.

## 6. Email Response to Google

Once the new version is submitted, send the following email to Google:

**Subject:** Re: [Your Project Name] OAuth Verification Request

**Body:**

Hello,

We have submitted a new version of our extension ([Your Extension Name], version 2.0.5) that implements the required OAuth changes, using the `drive.file` scope with the Google Picker API.

The updated version is now in review. We kindly request that you proceed with the verification process.

Thank you for your time and consideration.

Best regards,
[Your Name]