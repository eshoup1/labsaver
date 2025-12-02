# Pre-Publication Checklist for LabSaver

Use this checklist before submitting to the Chrome Web Store.

## 📋 Documentation

- [x] PRIVACY_POLICY.md created and reviewed
- [x] OAUTH_SETUP.md created with setup instructions
- [x] PUBLICATION_GUIDE.md created with submission steps
- [x] STORE_LISTING.md created with all listing content
- [x] README.md updated with installation options
- [x] CONTRIBUTING.md exists and is up to date
- [x] LICENSE file exists (MIT)
- [x] CHANGELOG.md is current

## 🔐 Security & Privacy

- [x] Privacy policy hosted at a publicly accessible URL
- [x] Privacy policy URL added to manifest.json (if required)
- [x] OAuth client ID configured for production
- [x] No hardcoded credentials in public code
- [x] All API keys and secrets removed
- [x] Security audit completed
- [x] No console.log statements with sensitive data

## 📦 Code Quality

- [x] All features tested and working
- [x] Function Health export tested
- [x] Sutter Health export tested
- [x] OAuth flow tested
- [x] Error handling verified
- [x] No console errors in production
- [x] Code is minified (if applicable)
- [x] All dependencies are up to date

## 🎨 Assets

### Icons (Required)
- [x] icon16.png (16x16) created
- [x] icon48.png (48x48) created
- [x] icon128.png (128x128) created
- [x] All icons are PNG format
- [x] Icons are clear and recognizable
- [x] Icons follow Chrome Web Store guidelines

### Screenshots (Required - 3-5 recommended)
- [x] Screenshot 1: Function Health export button (1280x800 or 640x400)
- [x] Screenshot 2: Google Sheets with exported data (1280x800 or 640x400)
- [x] Screenshot 3: LOINC codes in action (1280x800 or 640x400)
- [x] Screenshot 4: Sutter Health export (1280x800 or 640x400)
- [x] Screenshot 5: Privacy features (1280x800 or 640x400)
- [x] All screenshots are high quality
- [x] Screenshots show actual functionality
- [x] No placeholder or fake data in screenshots

### Promotional Images (Optional but Recommended)
- [ ] Small tile (440x280) created
- [ ] Large tile (920x680) created
- [ ] Marquee (1400x560) created
- [ ] All promotional images are professional quality

## 📝 Manifest.json

- [x] Version number is correct (semantic versioning)
- [x] Name is correct: "LabSaver - Health Data Exporter"
- [x] Description is clear and under 132 characters
- [x] All required permissions listed
- [x] All host permissions listed
- [x] OAuth client ID configured
- [x] OAuth scopes are correct
- [x] Icons paths are correct
- [x] Content scripts configured correctly
- [x] Background service worker configured
- [x] Manifest version is 3

## 🔑 OAuth Configuration

- [x] Google Cloud Project created
- [x] Google Sheets API enabled
- [x] OAuth consent screen configured
- [x] OAuth client ID created for Chrome extension
- [ ] Extension ID added to OAuth client (for production)
- [x] Scopes configured correctly:
  - [x] https://www.googleapis.com/auth/spreadsheets
  - [x] https://www.googleapis.com/auth/userinfo.email
- [x] Test users added (if needed)
- [ ] OAuth verification submitted (if required)

## 📊 Store Listing

### Product Details
- [ ] Extension name: "LabSaver - Health Data Exporter"
- [ ] Short description (132 chars max) prepared
- [ ] Detailed description prepared (from STORE_LISTING.md)
- [ ] Category selected: Productivity
- [ ] Language: English

### Privacy Practices
- [ ] Privacy practices questionnaire completed
- [ ] Data handling disclosed accurately
- [ ] Privacy policy URL provided
- [ ] Single purpose description provided
- [ ] Permission justifications written for all permissions
- [ ] Host permission justifications written
- [ ] Remote code usage disclosed (NO for this extension)

### Distribution
- [ ] Visibility setting chosen (Public/Unlisted/Private)
- [ ] Regions selected
- [ ] Pricing set to Free

## 🧪 Testing

### Functional Testing
- [x] Extension loads without errors
- [x] Function Health export works end-to-end
- [x] Sutter Health export works end-to-end
- [x] OAuth authentication flow works
- [x] Google Sheets creation works
- [x] Data is exported correctly
- [x] LOINC codes are derived correctly
- [x] Error messages are user-friendly
- [x] Extension works on different screen sizes

### Browser Testing
- [x] Tested on Chrome (latest version)
- [x] Tested on Chrome (previous version)
- [x] No console errors
- [x] No network errors
- [x] Performance is acceptable

### User Experience
- [x] Export buttons appear correctly
- [x] Loading states are clear
- [x] Success messages are shown
- [x] Error messages are helpful
- [x] Extension is intuitive to use

## 📦 Package Creation

- [x] Run `./package-extension.sh` to create distribution ZIP
- [x] Verify ZIP contains only necessary files:
  - [x] manifest.json
  - [x] background.js
  - [x] content.js
  - [x] loinc-derivation.js
  - [x] icons/ directory
  - [x] data/quest_loinc_map.json
  - [x] data/sh_loinc_map.json
- [x] Verify ZIP does NOT contain:
  - [x] Documentation files (*.md)
  - [x] Test files
  - [x] Build scripts
  - [x] Git files
  - [x] node_modules
  - [x] Development files
- [x] ZIP file size is reasonable (< 10MB)

## 🚀 Chrome Web Store Account

- [ ] Developer account created
- [ ] $5 registration fee paid
- [ ] Developer profile completed
- [ ] Payment information added (if selling)

## 📤 Submission

- [ ] All items above are checked
- [ ] ZIP file uploaded to Chrome Web Store
- [ ] Store listing completed
- [ ] Screenshots uploaded
- [ ] Privacy practices completed
- [ ] Distribution settings configured
- [ ] Submitted for review

## 📋 Post-Submission

- [ ] Review status monitored
- [ ] Extension ID noted
- [ ] OAuth credentials updated with store extension ID
- [ ] Published extension tested
- [ ] Store listing URL saved
- [ ] Announcement prepared for social media
- [ ] Support channels set up
- [ ] Monitoring plan in place

## 🔄 Common Issues to Check

### Before Submission
- [ ] No "TODO" comments in code
- [ ] No debug logging in production
- [ ] No hardcoded test data
- [ ] No placeholder text in UI
- [ ] All URLs are correct (no localhost)
- [ ] Version number matches across all files

### Potential Review Issues
- [ ] Permission justifications are detailed
- [ ] Privacy policy is accessible without login
- [ ] Screenshots match actual functionality
- [ ] Description is accurate and not misleading
- [ ] No trademark violations
- [ ] No copyright violations
- [ ] Complies with Chrome Web Store policies

## 📞 Support Preparation

- [ ] Support email configured
- [ ] GitHub issues enabled
- [ ] FAQ prepared
- [ ] Common troubleshooting documented
- [ ] Response templates created

## 📈 Analytics (Optional)

- [ ] Analytics plan created (privacy-respecting)
- [ ] Error tracking configured
- [ ] Usage metrics defined
- [ ] Privacy policy updated for analytics

## ✅ Final Verification

Before clicking "Submit for Review":

1. [ ] I have tested the extension thoroughly
2. [ ] All documentation is complete and accurate
3. [ ] Privacy policy is accessible and accurate
4. [ ] OAuth is configured correctly
5. [ ] All assets are high quality
6. [ ] Store listing is complete
7. [ ] I have reviewed Chrome Web Store policies
8. [ ] I am ready to respond to review feedback
9. [ ] I have a plan for post-launch support
10. [ ] I understand the review process may take 1-3 business days

---

## 🎉 Ready to Submit!

Once all items are checked, you're ready to submit to the Chrome Web Store!

**Good luck! 🚀**

---

## 📚 Resources

- [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Chrome Web Store Program Policies](https://developer.chrome.com/docs/webstore/program-policies/)
- [Publication Guide](./PUBLICATION_GUIDE.md)
- [OAuth Setup Guide](./OAUTH_SETUP.md)
- [Store Listing Details](./STORE_LISTING.md)