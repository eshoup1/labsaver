# Privacy Policy Setup for Chrome Web Store

## Current Status
The privacy policy has been prepared in `PRIVACY_POLICY.md` and a placeholder has been added to `manifest.json`.

## Required Steps Before Publication

### 1. Host the Privacy Policy Online

The Chrome Web Store requires a publicly accessible privacy policy URL. You have several options:

#### Option A: GitHub Pages (Recommended)
1. Enable GitHub Pages for your repository:
   - Go to your repository settings
   - Navigate to "Pages" section
   - Select source branch (usually `main` or `gh-pages`)
   - Save settings

2. Convert `PRIVACY_POLICY.md` to HTML or use GitHub's automatic rendering:
   - GitHub Pages will automatically render `.md` files
   - URL format: `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/lab-result-exporter/PRIVACY_POLICY`

#### Option B: Host on Your Own Website
- Upload the privacy policy to your website
- Ensure it's publicly accessible via HTTPS

#### Option C: Use a Documentation Platform
- Host on platforms like GitBook, Read the Docs, or similar
- Ensure the URL is stable and publicly accessible

### 2. Update manifest.json

Once you have a hosted URL, update the `homepage_url` field in `manifest.json`:

**Current placeholder:**
```json
"homepage_url": "REPLACE_WITH_HOSTED_PRIVACY_POLICY_URL",
```

**Replace with your actual URL:**
```json
"homepage_url": "https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/lab-result-exporter/PRIVACY_POLICY",
```

### 3. Verify the URL

Before submitting to Chrome Web Store:
- Ensure the URL is publicly accessible
- Test the URL in an incognito/private browser window
- Verify the content matches your `PRIVACY_POLICY.md` file

## Chrome Web Store Requirements

The Chrome Web Store requires:
- A valid, publicly accessible privacy policy URL
- The URL must use HTTPS
- The privacy policy must clearly explain data collection and usage
- The URL should be stable (not change frequently)

## Alternative: Store Listing Privacy Policy

Note: While `homepage_url` is commonly used, you can also:
1. Enter the privacy policy URL directly in the Chrome Web Store Developer Dashboard during submission
2. The store listing has a dedicated field for the privacy policy URL

## Example GitHub Pages Setup

If your repository is at `https://github.com/username/lab-result-exporter`:

1. Enable GitHub Pages pointing to the `main` branch
2. Your privacy policy will be available at:
   `https://username.github.io/lab-result-exporter/PRIVACY_POLICY`
3. Update manifest.json with this URL

## Next Steps

1. ✅ Privacy policy content created (`PRIVACY_POLICY.md`)
2. ✅ Placeholder added to `manifest.json`
3. ⏳ Host privacy policy online
4. ⏳ Update `manifest.json` with actual URL
5. ⏳ Verify URL is publicly accessible
6. ⏳ Submit to Chrome Web Store