# Fonts Directory

## Add Your TIMMONS NY Font Files Here

Place your TIMMONS NY font files in this directory with these exact names:

- `TIMMONS-NY.woff2` (recommended - best performance)
- `TIMMONS-NY.woff` (fallback for older browsers)

### How to Add Font Files:

1. **Download this project** to your local computer
2. **Add your font files** to this `/public/fonts/` folder
3. **Make sure the filenames match exactly:**
   - `/public/fonts/TIMMONS-NY.woff2`
   - `/public/fonts/TIMMONS-NY.woff`
4. **Deploy** your updated project to your hosting service

### File Structure Should Look Like:
```
public/
├── favicon.svg
└── fonts/
    ├── README.md (this file)
    ├── TIMMONS-NY.woff2 ← Add this
    └── TIMMONS-NY.woff   ← Add this
```

### Don't Have the Font Files?

If you don't have access to TIMMONS NY font files, you can use **Bebas Neue** as a free alternative:

1. Edit `/styles/globals.css` and add:
   ```css
   @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
   ```

2. In `/components/BoxingTrainer.tsx`, find all instances of `'TIMMONS NY'` and replace with `'Bebas Neue'`

---

**Note:** Make sure you have a valid license for TIMMONS NY if you use it!
