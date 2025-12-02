# Documentation Audit - Public vs Internal Files

## Analysis Date: December 2, 2025

This document categorizes all .md files in the repository to determine which should be public-facing versus internal-only.

---

## ✅ KEEP PUBLIC - Essential for Users/Contributors

### Core Documentation
- **README.md** - Main project overview (ESSENTIAL)
- **CHANGELOG.md** - Version history and changes (ESSENTIAL)
- **LICENSE** - Legal requirements (ESSENTIAL)
- **CONTRIBUTING.md** - Contributor guidelines (ESSENTIAL)
- **PRIVACY_POLICY.md** - Privacy information (ESSENTIAL)

### User Guides
- **FAQ.md** - Frequently asked questions (USEFUL)
- **OAUTH_SETUP.md** - OAuth setup instructions for users (USEFUL)
- **OAUTH_TROUBLESHOOTING.md** - Help for common OAuth issues (USEFUL)

### Developer Documentation
- **ARCHITECTURE.md** - System architecture overview (USEFUL for contributors)
- **DEVELOPMENT.md** - Development setup guide (USEFUL for contributors)
- **LOINC_MAPPINGS.md** - LOINC code mapping documentation (USEFUL for understanding data)
- **QUEST_LOINC_MAPPING.md** - Quest-specific LOINC mappings (USEFUL for understanding data)

### Subdirectory Documentation
- **scripts/README.md** - Script documentation (USEFUL)
- **tests/README.md** - Testing documentation (USEFUL)
- **frontend/README.md** - Frontend documentation (USEFUL)

---

## ❌ REMOVE/MOVE TO INTERNAL - Development/Internal Use Only

### AI/Development Context (Internal)
- **AI_CONTEXT.md** - AI assistant context (INTERNAL)
- **frontend/AI_RULES.md** - AI rules for frontend (INTERNAL)
- **frontend/PRD-Template.md** - Product requirements template (INTERNAL)
- **frontend/PRD.md** - Product requirements document (INTERNAL)

### Implementation Details (Internal)
- **IMPLEMENTATION_LOG.md** - Development log (INTERNAL)
- **IMPLEMENTATION_NOTES.md** - Implementation notes (INTERNAL)
- **LOINC_VERIFICATION.md** - Verification process notes (INTERNAL)

### Google OAuth Internal Documentation
- **GOOGLE_OAUTH_ANALYSIS.md** - Internal analysis (INTERNAL)
- **GOOGLE_OAUTH_COMPLIANCE_RESPONSE.md** - Internal compliance notes (INTERNAL)
- **GOOGLE_OAUTH_IMPLEMENTATION_PLAN.md** - Internal planning (INTERNAL)
- **GOOGLE_OAUTH_IMPLEMENTATION_SUMMARY.md** - Internal summary (INTERNAL)
- **GOOGLE_OAUTH_RESPONSE.md** - Internal response notes (INTERNAL)
- **OAUTH_ADVANCED_TROUBLESHOOTING.md** - Advanced internal troubleshooting (INTERNAL)
- **OAUTH_SCOPE_MIGRATION_V2.3.0.md** - Internal migration notes (INTERNAL)

### Deployment/Publishing (Internal)
- **API_KEY_CLARIFICATION.md** - Internal API key notes (INTERNAL)
- **API_KEYS_AND_DEPLOYMENT.md** - Internal deployment info (INTERNAL)
- **DEPLOYMENT_CHECKLIST.md** - Internal checklist (INTERNAL)
- **GITHUB_SETUP.md** - Internal GitHub setup (INTERNAL)
- **POST_PUBLISH_CHECKLIST.md** - Internal checklist (INTERNAL)
- **PRE_PUBLICATION_CHECKLIST.md** - Internal checklist (INTERNAL)
- **PRIVACY_POLICY_SETUP.md** - Internal setup notes (INTERNAL)
- **PRODUCTION_OAUTH_SETUP.md** - Internal production setup (INTERNAL)
- **PUBLICATION_GUIDE.md** - Internal publishing guide (INTERNAL)
- **PUBLICATION_SUMMARY.md** - Internal summary (INTERNAL)
- **RELEASE_PROCESS.md** - Internal release process (INTERNAL)
- **STORE_LISTING.md** - Internal store listing draft (INTERNAL)
- **TESTING_CHECKLIST.md** - Internal testing checklist (INTERNAL)
- **TESTING_GUIDE.md** - Internal testing guide (INTERNAL)

### Asset Documentation (Internal)
- **ASSETS_GUIDE.md** - Internal asset management (INTERNAL)

### Temporary Files (Should be deleted)
- **temp-v2.0.5-extract/CSP_FIX_COMPLETE.md** - Temporary fix notes (DELETE)
- **temp-v2.0.5-extract/FIX_SUMMARY.md** - Temporary summary (DELETE)
- **temp-v2.0.5-extract/MANIFEST_FIX.md** - Temporary fix notes (DELETE)

---

## 📊 Summary

**Total Files Analyzed:** 45
- **Keep Public:** 15 files (33%)
- **Move to Internal/Remove:** 27 files (60%)
- **Delete (Temporary):** 3 files (7%)

---

## 🎯 Recommended Actions

### Option 1: Create .internal/ Directory (Recommended)
Move all internal documentation to a `.internal/` directory and add it to `.gitignore`:
```bash
mkdir .internal
git mv AI_CONTEXT.md .internal/
git mv GOOGLE_OAUTH_ANALYSIS.md .internal/
# ... etc for all internal files
echo ".internal/" >> .gitignore
```

### Option 2: Create docs/ Structure
```
docs/
├── public/          # User-facing documentation
├── internal/        # Internal documentation (gitignored)
└── archive/         # Old/deprecated docs
```

### Option 3: Use Private Repository
Keep a separate private repository for internal documentation and planning.

---

## 🔧 Implementation Steps

1. **Backup**: Create a backup branch before making changes
2. **Review**: Review each file to ensure categorization is correct
3. **Move**: Move internal files to `.internal/` directory
4. **Delete**: Remove temporary files from temp-v2.0.5-extract/
5. **Update .gitignore**: Add `.internal/` to gitignore
6. **Commit**: Commit changes with clear message
7. **Clean History** (Optional): Use git filter-branch to remove internal docs from history

---

## ⚠️ Important Notes

- Some files like ARCHITECTURE.md could be either public or internal depending on your preference
- Consider keeping OAUTH_SETUP.md public as it helps users understand the OAuth flow
- LOINC mapping files are useful for transparency but could be internal if you prefer
- Always keep a backup before removing files from git history