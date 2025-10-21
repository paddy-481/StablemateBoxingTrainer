# STABLEMATE Boxing Trainer

A minimalist boxing training web app for beginners with AI-powered voice coaching.

## Features

- Random boxing combinations and movement instructions
- Customizable workrate (slow, medium, fast)
- Adjustable round duration (2:00, 2:30, 3:00)
- Configurable rounds and rest periods
- Voice options: Geezer or Robot
- Mobile-optimized PWA

## Tech Stack

- React + TypeScript
- Tailwind CSS v4
- Vite
- Pre-generated audio files (no API calls)

## Development

```bash
npm install
npm run dev
```

## Deployment

Designed for Netlify deployment. The app uses pre-generated audio files hosted on GitHub.

## Audio Files

All audio files (139 MP3s) must be uploaded to the GitHub repository in the `/audio/` directory at the root level.

**Structure:**
```
/audio/
  /combos/        (48 combo files)
  /movements/     (80 movement files)
  /system/        (11 system files)
```

## Styling

- Background: `#EBEBEB`
- Foreground: `#222222`
- Font: Anton (Google Fonts)
