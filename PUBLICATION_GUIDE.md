# Chrome Web Store Publication Guide

This guide walks you through publishing LabSaver to the Chrome Web Store.

## Pre-Publication Checklist

### ✅ Code & Documentation
- [ ] All code is tested and working
- [ ] Version number updated in manifest.json
- [ ] CHANGELOG.md updated with latest changes
- [ ] README.md is complete and accurate
- [ ] All documentation files are up to date

### ✅ Privacy & Security
- [ ] PRIVACY_POLICY.md created and reviewed
- [ ] Privacy policy hosted at a public URL
- [ ] OAuth credentials configured (see OAUTH_SETUP.md)
- [ ] No sensitive data in code
- [ ] All permissions justified in STORE_LISTING.md

### ✅ Assets
- [ ] Icons created (16x16, 48x48, 128x128)
- [ ] Screenshots prepared (1280x800 or 640x400)
- [ ] Promotional images created (optional but recommended)
- [ ] All images optimized for web

### ✅ Manifest
- [ ] OAuth client ID updated for production
- [ ] Version number follows semantic versioning
- [ ] All required fields completed
- [ ] Permissions are minimal and justified

### ✅ Testing
- [ ] Extension tested in Chrome
- [ ] OAuth flow works correctly
- [ ] Function Health export tested
- [ ] Sutter Health export tested
- [ ] Error handling verified
- [ ] No console errors

## Step-by-Step Publication

### 1. Prepare Distribution Package

Create a ZIP file of your extension:

```bash
cd lab-result-exporter
zip -r labsaver-v2.0.1.zip . \
  -x "*.git*" \
  -x "node_modules/*" \
  -x "*.md" \
  -x "tests/*" \
  -x "scripts/*" \
  -x ".DS_Store" \
  -x "*.log"
```

**Include in ZIP:**
- manifest.json
- background.js
- content.js
- loinc-derivation.js
- icons/ directory
- data/ directory (quest_loinc_map.json, sh_loinc_map.json)

**Exclude from ZIP:**
- Documentation files (*.md)
- Test files
- Build scripts
- Git files
- Node modules
- Development files

### 2. Create Chrome Web Store Developer Account

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Sign in with your Google account
3. Pay the one-time $5 developer registration fee
4. Complete your developer profile

### 3. Create New Item

1. Click "New Item" in the dashboard
2. Upload your ZIP file
3. Wait for the upload to complete

### 4. Complete Store Listing

#### Store Listing Tab

**Product Details:**
- Extension name: `LabSaver - Health Data Exporter`
- Summary: (Copy from STORE_LISTING.md - Short Description)
- Description: (Copy from STORE_LISTING.md - Detailed Description)
- Category: `Productivity`
- Language: `English`

**Graphic Assets:**
- Icon: Upload 128x128 icon
- Screenshots: Upload 3-5 screenshots (1280x800 or 640x400)
  - Function Health export button
  - Google Sheets with exported data
  - LOINC codes in action
  - Sutter Health export
  - Privacy features
- Promotional images (optional):
  - Small tile: 440x280
  - Large tile: 920x680
  - Marquee: 1400x560

**Additional Fields:**
- Official URL: Your GitHub repository or website
- Support URL: GitHub issues page or support email
- Version: `2.0.1` (must match manifest.json)

#### Privacy Tab

**Privacy Practices:**
1. Click "Privacy practices"
2. Answer the questionnaire:
   - Does your extension handle personal or sensitive user data? **YES**
   - What types of data? **Health information**
   - How is the data used? **Exported to user's Google Sheet**
   - Is data transmitted? **YES - to Google Sheets API only**
   - Is data sold? **NO**
   - Is data used for purposes unrelated to the item's core functionality? **NO**

3. Privacy policy URL: https://github.com/eshoup1/labsaver/blob/main/lab-result-exporter/PRIVACY_POLICY.md

**Single Purpose:**
- Description: (Copy from STORE_LISTING.md - Single Purpose Description)

**Permission Justification:**
- For each permission, provide justification (see STORE_LISTING.md)

**Host Permission Justification:**
- Explain why each host permission is needed

**Remote Code:**
- Are you using remote code? **NO**

#### Distribution Tab

**Visibility:**
- [ ] Public (visible to everyone)
- [ ] Unlisted (only accessible via direct link)
- [ ] Private (only for specific users/groups)

**Regions:**
- Select regions where extension will be available
- Recommended: All regions (unless you have specific restrictions)

**Pricing:**
- Free

### 5. Submit for Review

1. Review all information
2. Click "Submit for review"
3. Wait for Google's review (typically 1-3 business days)

### 6. Post-Submission

**Monitor Review Status:**
- Check dashboard regularly
- Respond to any review feedback promptly
- Address any issues raised by reviewers

**Common Review Issues:**
- Insufficient permission justification
- Privacy policy not accessible
- Screenshots don't match functionality
- OAuth consent screen not configured
- Misleading description

### 7. After Approval

**Once Published:**
1. Note your Chrome Web Store extension ID
2. Update OAuth credentials with store extension ID (see OAUTH_SETUP.md)
3. Test the published version
4. Monitor user reviews and feedback
5. Plan for updates and maintenance

## Updating Your Extension

### For Updates:

1. Update version number in manifest.json
2. Update CHANGELOG.md
3. Create new ZIP file
4. Upload to Chrome Web Store dashboard
5. Update store listing if needed
6. Submit for review

### Version Numbering:

Follow semantic versioning (MAJOR.MINOR.PATCH):
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes

Example: 2.0.1 → 2.0.2 (bug fix) or 2.1.0 (new feature)

## Marketing Your Extension

### After Publication:

1. **Announce on Social Media**
   - Twitter/X
   - LinkedIn
   - Reddit (r/chrome, r/QuantifiedSelf, r/Biohackers)
   - Health tech communities

2. **Create Landing Page**
   - Explain features
   - Show screenshots
   - Link to Chrome Web Store
   - Include privacy information

3. **Reach Out to Users**
   - Function Health community
   - Sutter Health patient forums
   - Health data enthusiast groups

4. **Content Marketing**
   - Blog post about the extension
   - Tutorial videos
   - Use case examples

5. **Gather Feedback**
   - Monitor reviews
   - Create feedback form
   - Engage with users
   - Plan improvements

## Monitoring & Maintenance

### Regular Tasks:

**Weekly:**
- Check user reviews and respond
- Monitor error reports
- Check for security updates

**Monthly:**
- Review analytics (if implemented)
- Plan feature updates
- Update documentation

**Quarterly:**
- Major feature releases
- Security audits
- Dependency updates

### Analytics (Optional)

Consider adding privacy-respecting analytics:
- Number of installs
- Active users
- Error rates
- Feature usage

**Important:** Always respect user privacy and comply with your privacy policy.

## Troubleshooting Publication Issues

### "Manifest file is invalid"
- Validate JSON syntax
- Check all required fields
- Ensure version format is correct

### "Privacy policy not accessible"
- Verify URL is publicly accessible
- Check for HTTPS
- Ensure no authentication required

### "Insufficient permission justification"
- Provide detailed explanation for each permission
- Explain how it's used in the extension
- Reference specific features

### "Screenshots don't match functionality"
- Ensure screenshots show actual extension features
- Update screenshots if UI has changed
- Show key features clearly

### "OAuth consent screen not configured"
- Complete all required fields in Google Cloud Console
- Add privacy policy URL
- Configure scopes correctly

## Support Resources

- [Chrome Web Store Developer Documentation](https://developer.chrome.com/docs/webstore/)
- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Chrome Web Store Program Policies](https://developer.chrome.com/docs/webstore/program-policies/)
- [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy)

## Contact

For questions about publication:
- Open an issue on GitHub
- Email: [Your support email]

---

**Good luck with your publication! 🚀**