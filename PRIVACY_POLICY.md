# Privacy Policy for LabSaver - Health Data Exporter

**Last Updated:** December 2, 2025

## Overview

LabSaver is committed to protecting your privacy. This privacy policy explains how our Chrome extension handles your health data.

## Data Collection

**We do not collect, store, or transmit any of your personal health information to our servers.**

### What Data the Extension Accesses

The extension accesses:
- Lab results from Function Health and Sutter Health portals (only when you're logged in)
- Your Google account information (email) for authentication
- Your Google Sheets for data export

### How Data is Processed

All data processing happens **locally in your browser**:
1. The extension reads lab results from health portals using your existing browser session
2. Data is processed and formatted entirely within your browser
3. Formatted data is written directly to your personal Google Sheet

**No intermediate servers are involved.** Data flows directly from the health portal to your Google Sheet.

## Data Storage

### Local Storage
The extension stores minimal data locally in your browser:
- `masterSheetId`: The ID of your Google Sheet (to remember which sheet to use)
- `lastSheetName`: The last sheet name you used (for convenience)

This data is stored using Chrome's `chrome.storage.local` API and never leaves your device.

### Google Sheets
Your health data is stored in your personal Google Sheet, which you own and control. We have no access to this data.

## Third-Party Services

### Google Sheets API
- Used to write data to your personal Google Sheet
- Requires OAuth 2.0 authentication
- We only request the minimum necessary permissions:
  - `https://www.googleapis.com/auth/drive.file` - Limited access to only files the extension creates or you explicitly select
  - `https://www.googleapis.com/auth/userinfo.email` - To identify your Google account

**Privacy Enhancement (v2.3.0):** We use the restricted `drive.file` scope instead of the broader `spreadsheets` scope. This means the extension can **only** access Google Sheets files that:
- The extension creates for you, OR
- You explicitly select through the file picker

The extension **cannot** access any of your other Google Drive files or spreadsheets. This limited scope ensures maximum privacy and security for your data.

### Health Portals
- Function Health (my.functionhealth.com)
- Sutter Health (myhealthonline.sutterhealth.org)
- The extension uses your existing browser session cookies
- No additional authentication is required

## What We Do NOT Do

- ❌ We do not collect or store your health data
- ❌ We do not send data to any external servers (except Google Sheets, which you control)
- ❌ We do not track your usage or behavior
- ❌ We do not use analytics or telemetry
- ❌ We do not share data with third parties
- ❌ We do not sell your data

## Permissions Explained

The extension requires the following Chrome permissions:

### Required Permissions
- **identity**: To authenticate with Google for Sheets access
- **storage**: To remember your sheet ID and preferences locally
- **scripting**: To inject the export button into health portal pages

### Host Permissions
- **my.functionhealth.com**: To read lab results from Function Health
- **production-member-app-mid-lhuqotpy2a-ue.a.run.app**: Function Health API endpoint
- **myhealthonline.sutterhealth.org**: To read lab results from Sutter Health
- **sheets.googleapis.com**: To write data to your Google Sheet

## Open Source

This extension is open source. You can review the complete source code to verify our privacy claims:
- GitHub Repository: [Link to your repository]

## Data Security

- All data transmission uses HTTPS encryption
- OAuth tokens are managed securely by Chrome
- No data is stored on external servers
- Your health data remains under your control

## Children's Privacy

This extension is not intended for use by children under 13 years of age. We do not knowingly collect information from children.

## Changes to This Policy

We may update this privacy policy from time to time. We will notify users of any material changes by updating the "Last Updated" date.

## Contact

For questions about this privacy policy or the extension's data practices, please:
- Open an issue on our GitHub repository
- Email: [Your contact email]

## Your Rights

You have the right to:
- Access your data (it's in your Google Sheet)
- Delete your data (delete your Google Sheet or uninstall the extension)
- Export your data (it's already in Google Sheets format)
- Revoke permissions (uninstall the extension or revoke Google OAuth access)

## Compliance

This extension complies with:
- Chrome Web Store Developer Program Policies
- Google API Services User Data Policy
- General Data Protection Regulation (GDPR) principles
- California Consumer Privacy Act (CCPA) principles

## Legal Basis for Processing (GDPR)

We process your data based on:
- **Consent**: You explicitly choose to use the extension and export your data
- **Legitimate Interest**: Processing is necessary to provide the service you requested

## Data Retention

- Local storage data: Retained until you uninstall the extension or clear browser data
- Google Sheets data: Retained until you delete your sheet
- We do not retain any data on our servers

---

**Summary**: LabSaver is a privacy-first extension. Your health data stays between you, your health portals, and your Google Sheet. We never see, store, or transmit your data through our servers.