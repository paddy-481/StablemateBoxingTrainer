# PWA Icon Instructions

Your app needs two icon files for the PWA to work properly:

## Required Icons

1. **icon-192.png** (192x192 pixels)
2. **icon-512.png** (512x512 pixels)

## Design Specifications

- **Background**: #EBEBEB (light gray)
- **Logo/Text**: #222222 (dark gray/black)
- **Font**: Anton (same as your app)
- **Content**: "STABLEMATE" text or a boxing glove icon with STABLEMATE text

## How to Create

### Option 1: Use Canva (Free)
1. Go to https://www.canva.com/
2. Create custom size: 512x512 pixels
3. Set background to #EBEBEB
4. Add "STABLEMATE" text in Anton font, color #222222
5. Optional: Add a simple boxing glove icon
6. Download as PNG
7. Resize to 192x192 for the smaller version

### Option 2: Use Figma (Free)
1. Create a 512x512 frame
2. Add rectangle background (#EBEBEB)
3. Add "STABLEMATE" text (Anton, #222222)
4. Export as PNG at 1x and name it icon-512.png
5. Export at 0.375x (or resize after) and name it icon-192.png

### Option 3: Quick Text-Based Icon
If you just want to test, you can use a simple text-based design:
- 512x512 canvas with #EBEBEB background
- Large "S" or "SM" in Anton font, centered, #222222 color
- Clean and minimal

## Where to Put Them

Save both files in the `/public` folder:
```
/public/icon-192.png
/public/icon-512.png
```

## Current Status

- ⏳ **icon-192.png**: Not yet created (REQUIRED)
- ⏳ **icon-512.png**: Not yet created (REQUIRED)

Once you add these two files, your PWA will be complete and ready to install!

## Testing Without Icons (Temporary)

The app will still work as a PWA without icons, but you'll see a default/broken image icon. For a professional look, create the icons before sharing with users.
