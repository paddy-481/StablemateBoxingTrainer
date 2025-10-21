#!/usr/bin/env node

/**
 * ElevenLabs Audio Generation Script
 * 
 * Automatically generates all 51 audio files for the boxing trainer app.
 * 
 * Requirements:
 * - ElevenLabs Starter account ($5/month) or higher for API access
 * - Node.js installed
 * 
 * Usage:
 *   node scripts/generate-audio.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
let ELEVENLABS_API_KEY = '';
let VOICE_ID = '';

// Audio phrases to generate
const AUDIO_FILES = {
  system: {
    'round-1-box': 'Round 1. Box!',
    'round-2-box': 'Round 2. Box!',
    'round-3-box': 'Round 3. Box!',
    'round-4-box': 'Round 4. Box!',
    'round-5-box': 'Round 5. Box!',
    'round-6-box': 'Round 6. Box!',
    'round-7-box': 'Round 7. Box!',
    'round-8-box': 'Round 8. Box!',
    'round-9-box': 'Round 9. Box!',
    'round-10-box': 'Round 10. Box!',
    'round-11-box': 'Round 11. Box!',
    'round-12-box': 'Round 12. Box!',
    'rest-good-work': 'Rest. Good work!',
    'times-up': "Time's up!",
  },
  
  combos: {
    'combo-1-1': '1, 1',
    'combo-1-1-2': '1, 1, 2',
    'combo-1-1-1': '1, 1, 1',
    'combo-1-1-2-3': '1, 1, 2, 3',
    'combo-1-1-6': '1, 1, 6',
    'combo-1-1-2-6': '1, 1, 2, 6',
    'combo-1-2-3': '1, 2, 3',
    'combo-1-2-6': '1, 2, 6',
    'combo-1-3-2': '1, 3, 2',
    'combo-2-3-2': '2, 3, 2',
    'combo-3-2-3': '3, 2, 3',
    'combo-1-5-2': '1, 5, 2',
    'combo-1-6-3': '1, 6, 3',
    'combo-1-2-3-6': '1, 2, 3, 6',
    'combo-1-1-3-2': '1, 1, 3, 2',
    'combo-1-1-3-6': '1, 1, 3, 6',
    'combo-1-2-3-2': '1, 2, 3, 2',
    'combo-2-3-6-3': '2, 3, 6, 3',
    'combo-1-2-5-2': '1, 2, 5, 2',
    'combo-1-2-body-3': '1, 2 body, 3',
    'combo-1-3-body-2': '1, 3 body, 2',
    'combo-3-body-3': '3 body, 3',
    'combo-1-2-3-body': '1, 2, 3 body',
    'combo-1-2-body-6': '1, 2 body, 6',
    'combo-1-2': '1, 2',
    'combo-2-3': '2, 3',
    'combo-3-2': '3, 2',
  },
  
  movements: {
    'move-slip-left': 'Slip left',
    'move-slip-right': 'Slip right',
    'move-roll-under': 'Roll under',
    'move-pivot-left': 'Pivot left',
    'move-pivot-right': 'Pivot right',
    'move-step-back': 'Step back',
    'move-step-forward': 'Step forward',
    'move-circle-left': 'Circle left',
    'move-circle-right': 'Circle right',
    'move-duck': 'Duck',
  },
};

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Generate audio using ElevenLabs API
async function generateAudio(text, filename, category) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': ELEVENLABS_API_KEY,
    },
    body: JSON.stringify({
      text: text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error: ${response.status} - ${error}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // Save to file
  const outputDir = path.join(__dirname, '..', 'public', 'audio', category);
  fs.mkdirSync(outputDir, { recursive: true });
  
  const outputPath = path.join(outputDir, `${filename}.mp3`);
  fs.writeFileSync(outputPath, buffer);
  
  return outputPath;
}

// Main function
async function main() {
  console.log('\n🎤 ElevenLabs Audio Generation Script');
  console.log('=====================================\n');
  
  // Get API key
  console.log('You need:');
  console.log('  1. ElevenLabs Starter account ($5/month) or higher');
  console.log('  2. Your API key from: https://elevenlabs.io/app/settings/api-keys');
  console.log('  3. Your Voice ID from: https://elevenlabs.io/app/voice-library\n');
  
  ELEVENLABS_API_KEY = await question('Enter your ElevenLabs API key: ');
  VOICE_ID = await question('Enter your Voice ID (your custom cockney voice): ');
  
  console.log('\n📋 Configuration:');
  console.log(`  API Key: ${ELEVENLABS_API_KEY.substring(0, 10)}...`);
  console.log(`  Voice ID: ${VOICE_ID}`);
  console.log(`  Files to generate: 51 (14 system + 27 combos + 10 movements)`);
  
  const confirm = await question('\n🚀 Start generation? (y/n): ');
  if (confirm.toLowerCase() !== 'y') {
    console.log('❌ Cancelled');
    rl.close();
    return;
  }
  
  console.log('\n⏳ Generating audio files...\n');
  
  let totalGenerated = 0;
  let totalFailed = 0;
  const startTime = Date.now();
  
  // Generate system files
  console.log('📢 Generating system messages...');
  for (const [filename, text] of Object.entries(AUDIO_FILES.system)) {
    try {
      await generateAudio(text, filename, 'system');
      totalGenerated++;
      console.log(`  ✅ ${filename}.mp3 - "${text}"`);
    } catch (error) {
      totalFailed++;
      console.log(`  ❌ ${filename}.mp3 - ERROR: ${error.message}`);
    }
  }
  
  // Generate combo files
  console.log('\n🥊 Generating punch combinations...');
  for (const [filename, text] of Object.entries(AUDIO_FILES.combos)) {
    try {
      await generateAudio(text, filename, 'combos');
      totalGenerated++;
      console.log(`  ✅ ${filename}.mp3 - "${text}"`);
    } catch (error) {
      totalFailed++;
      console.log(`  ❌ ${filename}.mp3 - ERROR: ${error.message}`);
    }
  }
  
  // Generate movement files
  console.log('\n🏃 Generating movement commands...');
  for (const [filename, text] of Object.entries(AUDIO_FILES.movements)) {
    try {
      await generateAudio(text, filename, 'movements');
      totalGenerated++;
      console.log(`  ✅ ${filename}.mp3 - "${text}"`);
    } catch (error) {
      totalFailed++;
      console.log(`  ❌ ${filename}.mp3 - ERROR: ${error.message}`);
    }
  }
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(1);
  
  console.log('\n=====================================');
  console.log('✨ Generation Complete!');
  console.log('=====================================');
  console.log(`✅ Successfully generated: ${totalGenerated} files`);
  console.log(`❌ Failed: ${totalFailed} files`);
  console.log(`⏱️  Time taken: ${duration} seconds`);
  console.log(`📁 Files saved to: /public/audio/`);
  
  if (totalGenerated > 0) {
    console.log('\n🎯 Next steps:');
    console.log('  1. Check the /public/audio/ folder');
    console.log('  2. Test a few files to verify quality');
    console.log('  3. Tell me "Audio files are ready!"');
    console.log("  4. I'll update the app to use them!\n");
  }
  
  rl.close();
}

// Run the script
main().catch((error) => {
  console.error('❌ Fatal error:', error);
  rl.close();
  process.exit(1);
});
