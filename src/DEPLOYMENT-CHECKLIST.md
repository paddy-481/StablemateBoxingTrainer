# 🚀 Deployment Checklist

## ✅ Files Updated (Just Now)
- [x] **CRITICAL FIX:** Changed CSS variables in `styles/globals.css`:
  - `--background: #EBEBEB` (was #ffffff)
  - `--foreground: #222222` (was oklch)
  - All other colors updated to match #EBEBEB/#222222 theme
- [x] Added `font-family: 'Anton'` to body in `styles/globals.css`
- [x] Removed cache-control meta tags from `index.html`
- [x] Created `.gitignore` file
- [x] Cleaned up unnecessary files

## 📋 Next Steps to Deploy:

### 1. **Download This Clean Project from Figma Make**
   - Click menu (top left hamburger icon)
   - Click "Download"
   - Save to Desktop
   - Unzip the folder

### 2. **Upload to GitHub**
   - Go to your repo: https://github.com/paddy-481/StablemateBoxingTrainer
   - Click "Add file" → "Upload files"
   - Drag ALL files from the unzipped folder
   - **IMPORTANT:** Also drag your `/audio/` folder with all 139 MP3 files
   - Commit message: "Fix styling - add Anton font to body"
   - Click "Commit changes"

### 3. **Verify Audio Files Structure**
Make sure your audio files are uploaded to the repo at the **ROOT** level like this:
```
/audio/
  /combos/        (48 MP3 files)
  /movements/     (80 MP3 files)
  /system/        (11 MP3 files)
```

### 4. **Netlify Auto-Deploy**
   - Netlify will automatically detect the new commit
   - Wait 2-3 minutes for build
   - Check: https://lucky-kleicha-4848e1.netlify.app/

### 5. **Test on Live Site**
   - [ ] Styling shows correctly (#EBEBEB background, #222222 text)
   - [ ] Anton font is applied
   - [ ] Play button works
   - [ ] Audio plays (test on mobile too!)

## 🔧 Key Files Changed:
- `styles/globals.css` - Added Anton font to body
- `.gitignore` - Standard ignore patterns
- `components/BoxingTrainer.tsx` - Removed old voice imports

## 📱 Audio Setup Reminder:
The app uses pre-generated audio files from:
```
https://raw.githubusercontent.com/paddy-481/StablemateBoxingTrainer/main/audio/...
```

Make sure all 139 MP3 files are committed to the repo!

## 🎨 Styling Specs:
- Background: `#EBEBEB`
- Foreground: `#222222`  
- Font: Anton (Google Fonts)
