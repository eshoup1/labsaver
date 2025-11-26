# Assets Creation Guide for LabSaver

This guide helps you create all required assets for Chrome Web Store publication.

## 📐 Required Assets

### Icons (Required)
- **icon16.png** - 16x16 pixels
- **icon48.png** - 48x48 pixels
- **icon128.png** - 128x128 pixels

### Screenshots (Required - 3-5 recommended)
- **1280x800** or **640x400** pixels
- PNG or JPEG format
- Show actual extension functionality

### Promotional Images (Optional but Recommended)
- **Small Tile** - 440x280 pixels
- **Large Tile** - 920x680 pixels
- **Marquee** - 1400x560 pixels

---

## 🎨 Icon Design Guidelines

### Design Principles
- **Simple and recognizable** at small sizes
- **Medical/health theme** (e.g., heart, chart, clipboard, medical cross)
- **Professional appearance**
- **Consistent across all sizes**
- **Good contrast** for visibility

### Recommended Icon Concepts
1. **Medical Chart with Arrow** - Represents exporting health data
2. **Heart with Data Lines** - Health + data visualization
3. **Clipboard with Checkmark** - Lab results checklist
4. **Test Tube with Graph** - Lab testing + analytics
5. **Medical Cross with Spreadsheet** - Healthcare + data export

### Color Palette Suggestions
- **Primary:** Medical blue (#0066CC, #4A90E2)
- **Accent:** Health green (#00A86B, #2ECC71)
- **Professional:** Navy (#1A365D) + White
- **Modern:** Teal (#14B8A6) + Gray (#64748B)

### Tools for Creating Icons

#### Online Tools (Free)
1. **Figma** (https://figma.com)
   - Professional design tool
   - Free tier available
   - Export at multiple sizes

2. **Canva** (https://canva.com)
   - Easy to use
   - Templates available
   - Free tier available

3. **Photopea** (https://photopea.com)
   - Free Photoshop alternative
   - Works in browser
   - Supports layers

4. **GIMP** (https://gimp.org)
   - Free desktop application
   - Powerful editing tools
   - Cross-platform

#### Icon Resources
- **Flaticon** (https://flaticon.com) - Free icons (check license)
- **Icons8** (https://icons8.com) - Free icons with attribution
- **Font Awesome** (https://fontawesome.com) - Icon fonts
- **Material Icons** (https://fonts.google.com/icons) - Google's icon set

### Step-by-Step Icon Creation

#### Using Figma (Recommended)

1. **Create New File**
   - Go to Figma.com and create account
   - Create new design file

2. **Set Up Artboards**
   - Create frame: 128x128 (main design)
   - Create frame: 48x48 (medium)
   - Create frame: 16x16 (small)

3. **Design Icon**
   - Start with 128x128 frame
   - Use simple shapes
   - Keep design centered
   - Use 2-3 colors max
   - Test at small sizes

4. **Export Icons**
   - Select each frame
   - Export as PNG
   - 1x scale (no upscaling)
   - Name: icon16.png, icon48.png, icon128.png

#### Using Canva

1. **Create Custom Size**
   - Click "Create a design"
   - Custom size: 128x128 pixels

2. **Design Icon**
   - Use elements from left sidebar
   - Search for medical/health icons
   - Customize colors
   - Keep it simple

3. **Export**
   - Download as PNG
   - Repeat for 48x48 and 16x16

#### Quick Icon Template

If you need a quick solution, use this simple design:

```
Background: Medical blue (#4A90E2)
Icon: White medical cross or chart symbol
Border: Optional rounded corners
```

---

## 📸 Screenshot Guidelines

### What to Capture

#### Screenshot 1: Function Health Export Button
- **Show:** Function Health portal with "Export Labs" button visible
- **Highlight:** The export button (use arrow or circle)
- **Caption:** "One-click export from Function Health"

#### Screenshot 2: Google Sheets Result
- **Show:** Populated Google Sheet with lab data
- **Include:** Multiple columns visible, some data rows
- **Highlight:** Key columns (biomarkerName, testResultNumeric, Derived_LOINC)
- **Caption:** "Complete lab history in Google Sheets"

#### Screenshot 3: Pivot Table View
- **Show:** FH_Table sheet with pivot table layout
- **Include:** Dates across top, biomarkers down side
- **Caption:** "Pivot table view for easy trend analysis"

#### Screenshot 4: Sutter Health Export
- **Show:** Sutter Health portal with "Export Sutter Labs" button
- **Highlight:** The export button
- **Caption:** "Export from Sutter Health MyChart"

#### Screenshot 5: LOINC Codes
- **Show:** Derived_LOINC column with standardized codes
- **Highlight:** The LOINC codes column
- **Caption:** "Automatic LOINC standardization for cross-system comparison"

### Screenshot Best Practices

1. **Use Real Data** (but anonymize if needed)
   - Real lab results look more authentic
   - Blur or replace personal information
   - Use realistic test names and values

2. **High Quality**
   - Use full resolution (1280x800 or 640x400)
   - Clear, crisp text
   - Good contrast
   - No compression artifacts

3. **Annotations**
   - Add arrows or circles to highlight features
   - Use consistent annotation style
   - Keep annotations minimal
   - Use contrasting colors (red or yellow)

4. **Consistency**
   - Same browser/OS appearance across screenshots
   - Consistent zoom level
   - Similar lighting/theme

### Tools for Screenshots

#### Built-in Tools
- **macOS:** Cmd+Shift+4 (select area)
- **Windows:** Windows+Shift+S (Snipping Tool)
- **Chrome:** DevTools > Device Toolbar (for consistent sizing)

#### Screenshot Tools
1. **Cleanshot X** (macOS) - Professional screenshots with annotations
2. **Snagit** (Windows/Mac) - Screenshots with editing
3. **Lightshot** (Cross-platform) - Quick screenshots with annotations
4. **ShareX** (Windows) - Free, powerful screenshot tool

#### Annotation Tools
1. **Skitch** (Free) - Simple annotations
2. **Annotate** (macOS) - Quick markup
3. **Greenshot** (Windows) - Screenshots with annotations
4. **Photopea** (Browser) - Full editing capabilities

### Screenshot Workflow

1. **Prepare Browser**
   - Set zoom to 100%
   - Clear unnecessary tabs
   - Use clean browser profile
   - Disable unnecessary extensions

2. **Capture Screenshots**
   - Take multiple shots of each feature
   - Capture at full resolution
   - Save as PNG (better quality than JPEG)

3. **Edit Screenshots**
   - Crop to required size (1280x800 or 640x400)
   - Add annotations (arrows, circles, text)
   - Blur sensitive information
   - Adjust brightness/contrast if needed

4. **Optimize**
   - Compress without losing quality
   - Use tools like TinyPNG or ImageOptim
   - Keep file size reasonable (< 5MB each)

---

## 🎯 Promotional Images (Optional)

### Small Tile (440x280)

**Content:**
- LabSaver logo/icon (large)
- Text: "Export Your Lab Results"
- Subtitle: "Privacy-First Health Data"
- Background: Gradient or solid color

**Template:**
```
┌─────────────────────────────┐
│                             │
│         [ICON]              │
│                             │
│   Export Your Lab Results   │
│   Privacy-First Health Data │
│                             │
└─────────────────────────────┘
```

### Large Tile (920x680)

**Content:**
- LabSaver logo/icon
- Main headline: "Take Control of Your Health Data"
- Feature bullets:
  - ✓ Function Health & Sutter Health
  - ✓ Export to Google Sheets
  - ✓ LOINC Standardization
  - ✓ Privacy-First Design

**Template:**
```
┌───────────────────────────────────────┐
│                                       │
│  [ICON]  Take Control of Your         │
│          Health Data                  │
│                                       │
│  ✓ Function Health & Sutter Health   │
│  ✓ Export to Google Sheets           │
│  ✓ LOINC Standardization             │
│  ✓ Privacy-First Design              │
│                                       │
└───────────────────────────────────────┘
```

### Marquee (1400x560)

**Content:**
- Split screen design
- Left: Health portal with export button
- Right: Google Sheets with organized data
- Text overlay: "LabSaver - Your Health Data, Your Control"

**Template:**
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  [Health Portal]  │  [Google Sheets]               │
│  with button      │  with data                     │
│                                                     │
│  LabSaver - Your Health Data, Your Control         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## ✅ Asset Checklist

Before submission, verify:

### Icons
- [ ] icon16.png exists and is 16x16 pixels
- [ ] icon48.png exists and is 48x48 pixels
- [ ] icon128.png exists and is 128x128 pixels
- [ ] All icons are PNG format
- [ ] Icons are clear at all sizes
- [ ] Icons use consistent design
- [ ] Icons are professional quality

### Screenshots
- [ ] 3-5 screenshots prepared
- [ ] All screenshots are 1280x800 or 640x400 pixels
- [ ] Screenshots show actual functionality
- [ ] Personal information is anonymized
- [ ] Annotations are clear and helpful
- [ ] Screenshots are high quality (no blur)
- [ ] File sizes are reasonable (< 5MB each)

### Promotional Images (if using)
- [ ] Small tile is 440x280 pixels
- [ ] Large tile is 920x680 pixels
- [ ] Marquee is 1400x560 pixels
- [ ] All images are professional quality
- [ ] Branding is consistent
- [ ] Text is readable

---

## 🎨 Design Tips

1. **Keep It Simple**
   - Less is more for icons
   - Clear focal points in screenshots
   - Minimal text in promotional images

2. **Be Consistent**
   - Use same color palette across all assets
   - Consistent typography
   - Unified visual style

3. **Test at Size**
   - View icons at actual size (16px, 48px, 128px)
   - Check screenshots on different displays
   - Verify promotional images look good in store

4. **Get Feedback**
   - Show assets to others
   - Test with target audience
   - Iterate based on feedback

---

## 📚 Resources

### Design Inspiration
- [Chrome Web Store](https://chrome.google.com/webstore) - Browse successful extensions
- [Dribbble](https://dribbble.com) - Design inspiration
- [Behance](https://behance.net) - Professional portfolios

### Stock Images (if needed)
- [Unsplash](https://unsplash.com) - Free high-quality photos
- [Pexels](https://pexels.com) - Free stock photos
- [Pixabay](https://pixabay.com) - Free images and vectors

### Color Tools
- [Coolors](https://coolors.co) - Color palette generator
- [Adobe Color](https://color.adobe.com) - Color wheel and schemes
- [Paletton](https://paletton.com) - Color scheme designer

---

## 🆘 Need Help?

If you need professional help with assets:
- Hire a designer on Fiverr or Upwork
- Use 99designs for design contests
- Ask in design communities (r/design, r/graphic_design)
- Consider using AI tools (Midjourney, DALL-E) for inspiration

---

**Good luck creating your assets! 🎨**