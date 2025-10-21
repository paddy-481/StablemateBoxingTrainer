# Audio Files for STABLEMATE Boxing Trainer

This folder contains pre-generated audio files for the boxing trainer app.

## Folder Structure

```
audio/
├── system/      (14 files) - Round announcements and rest messages
├── combos/      (27 files) - Punch combinations
└── movements/   (10 files) - Movement commands
```

**Total: 51 MP3 files**

## Upload Instructions

1. Generate audio files using your ElevenLabs voice
2. Follow the naming conventions in each subfolder's README
3. Upload files to the correct folders
4. Files must match the exact names listed!

## Generation Guides

See the project root for:
- `/GENERATION-CHECKLIST.md` - Manual generation (free)
- `/scripts/AUTOMATION-GUIDE.md` - Automated generation ($5/mo tier)

## Testing Upload

**Test with one file first!**
1. Generate `round-1-box.mp3` ("Round 1. Box!")
2. Try uploading to `/public/audio/system/`
3. If it works, generate the rest!
4. If it fails, use GitHub hosting (see `/GITHUB-HOSTING-GUIDE.md`)

## File Naming Rules

✅ All lowercase
✅ Use hyphens (not underscores)
✅ Match exact names in READMEs
✅ Must be `.mp3` format

❌ Don't use: `Round-1.mp3` (wrong)
✅ Correct: `round-1-box.mp3`

## After Upload

Once all 51 files are uploaded, notify the developer to update the app to use pre-generated audio mode!

🎤 Your custom voice + instant playback = Perfect training! 🥊
