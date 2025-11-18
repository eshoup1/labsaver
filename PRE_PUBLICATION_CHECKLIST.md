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

- [ ] Privacy policy hosted at a publicly accessible URL
- [ ] Privacy policy URL added to manifest.json (if required)
- [ ] OAuth client ID configured for production
- [ ] No hardcoded credentials in public code
- [ ] All API keys and secrets removed
- [ ] Security audit completed
- [ ] No console.log statements with sensitive data

## 📦 Code Quality

- [ ] All features tested and working
- [ ] Function Health export tested
- [ ] Sutter Health export tested
- [ ] OAuth flow tested
- [ ] Error handling verified
- [ ] No console errors in production
- [ ] Code is minified (if applicable)
- [ ] All dependencies are up to date

## 🎨 Assets

### Icons (Required)
- [ ] icon16.png (16x16) created
- [ ] icon48.png (48x48) created
- [ ] icon128.png (128x128) created
- [ ] All icons are PNG format
- [ ] Icons are clear and recognizable
- [ ] Icons follow Chrome Web Store guidelines

### Screenshots (Required - 3-5 recommended)
- [ ] Screenshot 1: Function Health export button (1280x800 or 640x400)
- [ ] Screenshot 2: Google Sheets with exported data (1280x800 or 640x400)
- [ ] Screenshot 3: LOINC codes in action (1280x800 or 640x400)
- [ ] Screenshot 4: Sutter Health export (1280x800 or 640x400)
- [ ] Screenshot 5: Privacy features (1280x800 or 640x400)
- [ ] All screenshots are high quality
- [ ] Screenshots show actual functionality
- [ ] No placeholder or fake data in screenshots

### Promotional Images (Optional but Recommended)
- [ ] Small tile (440x280) created
- [ ] Large tile (920x680) created
- [ ] Marquee (1400x560) created
- [ ] All promotional images are professional quality

## 📝 Manifest.json

- [ ] Version number is correct (semantic versioning)
- [ ] Name is correct: "LabSaver - Health Data Exporter"
- [ ] Description is clear and under 132 characters
- [ ] All required permissions listed
- [ ] All host permissions listed
- [ ] OAuth client ID configured
- [ ] OAuth scopes are correct
- [ ] Icons paths are correct
- [ ] Content scripts configured correctly
- [ ] Background service worker configured
- [ ] Manifest version is 3

## 🔑 OAuth Configuration

- [ ] Google Cloud Project created
- [ ] Google Sheets API enabled
- [ ] OAuth consent screen configured
- [ ] OAuth client ID created for Chrome extension
- [ ] Extension ID added to OAuth client (for production)
- [ ] Scopes configured correctly:
  - [ ] https://www.googleapis.com/auth/spreadsheets
  - [ ] https://www.googleapis.com/auth/userinfo.email
- [ ] Test users added (for development)
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
- [ ] Extension loads without errors
- [ ] Function Health export works end-to-end
- [ ] Sutter Health export works end-to-end
- [ ] OAuth authentication flow works
- [ ] Google Sheets creation works
- [ ] Data is exported correctly
- [ ] LOINC codes are derived correctly
- [ ] Error messages are user-friendly
- [ ] Extension works on different screen sizes

### Browser Testing
- [ ] Tested on Chrome (latest version)
- [ ] Tested on Chrome (previous version)
- [ ] No console errors
- [ ] No network errors
- [ ] Performance is acceptable

### User Experience
- [ ] Export buttons appear correctly
- [ ] Loading states are clear
- [ ] Success messages are shown
- [ ] Error messages are helpful
- [ ] Extension is intuitive to use

## 📦 Package Creation

- [ ] Run `./package-extension.sh` to create distribution ZIP
- [ ] Verify ZIP contains only necessary files:
  - [ ] manifest.json
  - [ ] background.js
  - [ ] content.js
  - [ ] loinc-derivation.js
  - [ ] icons/ directory
  - [ ] data/quest_loinc_map.json
  - [ ] data/sh_loinc_map.json
- [ ] Verify ZIP does NOT contain:
  - [ ] Documentation files (*.md)
  - [ ] Test files
  - [ ] Build scripts
  - [ ] Git files
  - [ ] node_modules
  - [ ] Development files
- [ ] ZIP file size is reasonable (< 10MB)

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