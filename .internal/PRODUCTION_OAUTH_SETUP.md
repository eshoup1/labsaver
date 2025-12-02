# Production OAuth Setup for LabSaver

## Production Project Information

**Project Name:** LabSaver Production  
**Project ID:** function-health-exporter  
**OAuth Client ID:** 609855124330-qhqklvllcvmft7v8f9k42csfqupu1p6d.apps.googleusercontent.com

## Configuration Status

The production OAuth client ID is correctly configured in [`config/production.json`](config/production.json).

### Current Configuration

```json
{
  "oauth2": {
    "client_id": "609855124330-qhqklvllcvmft7v8f9k42csfqupu1p6d.apps.googleusercontent.com",
    "scopes": [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/userinfo.email"
    ]
  }
}
```

## Chrome Web Store Submission

When building for Chrome Web Store submission, use:

```bash
npm run build:prod
```

This will generate a production build in the `dist/` directory with the correct production OAuth client ID.

## Verification

The production OAuth client ID (`609855124330-qhqklvllcvmft7v8f9k42csfqupu1p6d.apps.googleusercontent.com`) is associated with the "function-health-exporter" Google Cloud project and is properly configured for Chrome Web Store distribution.

## Important Notes

- The production configuration file ([`config/production.json`](config/production.json)) is tracked in Git but contains the production OAuth credentials
- For security best practices, ensure the OAuth client is properly configured in Google Cloud Console with the Chrome Web Store extension ID
- The production build should only be used for Chrome Web Store submissions, not for local development

## Build Process

The build system ([`scripts/build.js`](scripts/build.js)) automatically merges [`config/common.json`](config/common.json) with [`config/production.json`](config/production.json) when `NODE_ENV=production` to create the final manifest.json in the dist/ directory.