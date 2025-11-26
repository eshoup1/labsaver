# Testing Checklist for v2.0.4 Architecture Refactor

## Phase 1: Pre-Implementation ✅
- [ ] Backup created
- [ ] Current state documented
- [ ] Implementation log created

## Phase 2.1: Codebase Consolidation
- [ ] Git history preserved (verify with `git log --follow`)
- [ ] All source files in correct locations
- [ ] No duplicate files remain
- [ ] Critical docs preserved (FAQ.md, etc.)

## Phase 2.2: Build System
- [ ] Development build completes (`npm run build:dev`)
- [ ] Production build completes (`npm run build:prod`)
- [ ] Correct OAuth client IDs in each build
- [ ] Production config NOT in Git
- [ ] ZIP files created with correct naming

## Phase 3: Functional Testing
### Function Health
- [ ] Export completes successfully
- [ ] Button turns green
- [ ] Button text: "✓ Exported X results! Click to view →"
- [ ] Button remains green (no 3-second reset)
- [ ] Button is clickable
- [ ] Opens Google Sheet with correct data

### Sutter Health
- [ ] Export button appears
- [ ] Button is RIGHT-ALIGNED
- [ ] Button stays right-aligned
- [ ] Export completes successfully
- [ ] Button turns green and stays green
- [ ] Button is clickable
- [ ] Opens Google Sheet with correct data

### Contents Tab
- [ ] Tab order: Export, Definitions, Latest, Table

### OAuth
- [ ] Dev build shows "Lab Saver" consent screen
- [ ] Prod build shows "LabSaver Production" consent screen

## Phase 4: Regression Testing
- [ ] LOINC codes mapped correctly
- [ ] Multiple exports work
- [ ] Error handling works
- [ ] No console errors

## Phase 5: Pre-Submission
- [ ] Version 2.0.4 in config/common.json
- [ ] CHANGELOG.md updated
- [ ] ZIP contains correct files
- [ ] No secrets in ZIP
- [ ] Documentation complete

## Sign-off
- [ ] All critical tests passed
- [ ] User approval for Chrome Web Store submission