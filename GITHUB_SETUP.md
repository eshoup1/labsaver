# GitHub Setup Instructions

Follow these steps to push this repository to GitHub.

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and log in
2. Click the "+" icon in the top right → "New repository"
3. Repository settings:
   - **Name**: `function-health-exporter` (or your preferred name)
   - **Description**: "Chrome extension to export Function Health biomarker data to Google Sheets"
   - **Visibility**: Public (recommended) or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. Click "Create repository"

## Step 2: Push to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
# Navigate to the extension directory
cd function-health-exporter

# Add the remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/function-health-exporter.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Configure Repository Settings (Optional)

1. Go to your repository on GitHub
2. Click "Settings"
3. Recommended settings:
   - **About**: Add description and topics (chrome-extension, function-health, google-sheets, health-data)
   - **Issues**: Enable for bug reports and feature requests
   - **Discussions**: Enable for community questions
   - **Releases**: Create a v1.0.0 release after testing

## Step 4: Add Repository URL to README

Update the README.md to include:
- Link to the GitHub repository
- Installation instructions using `git clone`
- Link to Issues for bug reports

## Alternative: Using GitHub CLI

If you have GitHub CLI installed:

```bash
cd function-health-exporter
gh repo create function-health-exporter --public --source=. --remote=origin --push
```

## Troubleshooting

**Authentication Issues:**
- Use a Personal Access Token (PAT) instead of password
- Or set up SSH keys for GitHub

**Remote Already Exists:**
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/function-health-exporter.git
```

**Need to Change Remote URL:**
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/function-health-exporter.git