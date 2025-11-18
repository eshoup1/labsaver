#!/bin/bash

# LabSaver Extension Packaging Script
# This script creates a distribution-ready ZIP file for Chrome Web Store submission

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}LabSaver Extension Packaging Script${NC}"
echo "======================================"
echo ""

# Get version from manifest.json
VERSION=$(grep -o '"version": "[^"]*' manifest.json | cut -d'"' -f4)
echo -e "Extension version: ${GREEN}${VERSION}${NC}"
echo ""

# Output filename
OUTPUT_FILE="labsaver-v${VERSION}.zip"

# Check if output file already exists
if [ -f "$OUTPUT_FILE" ]; then
    echo -e "${YELLOW}Warning: ${OUTPUT_FILE} already exists${NC}"
    read -p "Overwrite? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Packaging cancelled."
        exit 1
    fi
    rm "$OUTPUT_FILE"
fi

echo "Creating distribution package..."
echo ""

# Files to include
echo "Including files:"
echo "  ✓ manifest.json"
echo "  ✓ background.js"
echo "  ✓ content.js"
echo "  ✓ loinc-derivation.js"
echo "  ✓ icons/"
echo "  ✓ data/quest_loinc_map.json"
echo "  ✓ data/sh_loinc_map.json"
echo ""

# Create the ZIP file
zip -r "$OUTPUT_FILE" \
    manifest.json \
    background.js \
    content.js \
    loinc-derivation.js \
    icons/ \
    data/quest_loinc_map.json \
    data/sh_loinc_map.json \
    -x "*.DS_Store" \
    -x "__MACOSX/*" \
    > /dev/null

# Check if ZIP was created successfully
if [ -f "$OUTPUT_FILE" ]; then
    FILE_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
    echo -e "${GREEN}✓ Package created successfully!${NC}"
    echo ""
    echo "Output file: ${OUTPUT_FILE}"
    echo "File size: ${FILE_SIZE}"
    echo ""
    
    # List contents
    echo "Package contents:"
    unzip -l "$OUTPUT_FILE" | tail -n +4 | head -n -2
    echo ""
    
    # Pre-submission checklist
    echo -e "${YELLOW}Pre-Submission Checklist:${NC}"
    echo "  [ ] OAuth client ID configured in manifest.json"
    echo "  [ ] Version number is correct"
    echo "  [ ] All features tested"
    echo "  [ ] Privacy policy URL is accessible"
    echo "  [ ] Screenshots prepared"
    echo "  [ ] Store listing text ready"
    echo ""
    echo -e "${GREEN}Ready to upload to Chrome Web Store!${NC}"
    echo "Visit: https://chrome.google.com/webstore/devconsole"
else
    echo -e "${RED}✗ Failed to create package${NC}"
    exit 1
fi