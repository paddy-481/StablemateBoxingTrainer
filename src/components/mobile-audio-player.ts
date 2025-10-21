/**
 * Mobile-Compatible Audio Player
 * 
 * Fixes iOS/Android autoplay restrictions by:
 * 1. Using AudioContext (unlocked on user interaction)
 * 2. Pre-loading audio buffers instead of Audio elements
 * 3. Playing from memory (no new network requests)
 */

// Audio context (shared, unlocked on first user interaction)
let audioContext: AudioContext | null = null;
let isUnlocked = false;

// Audio buffer cache
const audioBuffers = new Map<string, AudioBuffer>();
const loadingPromises = new Map<string, Promise<AudioBuffer>>();

// 🌐 Audio files hosted on GitHub CDN
const AUDIO_BASE_URL = 'https://raw.githubusercontent.com/paddy-481/StablemateBoxingTrainer2/main/';

// Audio file mappings (same as before)
const AUDIO_FILES = {
  system: {
    'round-1': `${AUDIO_BASE_URL}audio/system/round-1-box.mp3`,
    'round-2': `${AUDIO_BASE_URL}audio/system/round-2-box.mp3`,
    'round-3': `${AUDIO_BASE_URL}audio/system/round-3-box.mp3`,
    'round-4': `${AUDIO_BASE_URL}audio/system/round-4-box.mp3`,
    'round-5': `${AUDIO_BASE_URL}audio/system/round-5-box.mp3`,
    'round-6': `${AUDIO_BASE_URL}audio/system/round-6-box.mp3`,
    'round-7': `${AUDIO_BASE_URL}audio/system/round-7-box.mp3`,
    'round-8': `${AUDIO_BASE_URL}audio/system/round-8-box.mp3`,
    'round-9': `${AUDIO_BASE_URL}audio/system/round-9-box.mp3`,
    'round-10': `${AUDIO_BASE_URL}audio/system/round-10-box.mp3`,
    'round-11': `${AUDIO_BASE_URL}audio/system/round-11-box.mp3`,
    'round-12': `${AUDIO_BASE_URL}audio/system/round-12-box.mp3`,
    'rest': `${AUDIO_BASE_URL}audio/system/rest-good-work.mp3`,
    'complete': `${AUDIO_BASE_URL}audio/system/training-complete.mp3`,
  },
  combos: {
    '1, 1': `${AUDIO_BASE_URL}audio/combos/combo-1-1.mp3`,
    '1, 1, 2': `${AUDIO_BASE_URL}audio/combos/combo-1-1-2.mp3`,
    '1, 1, 1': `${AUDIO_BASE_URL}audio/combos/combo-1-1-1.mp3`,
    '1, 1, 2, 3': `${AUDIO_BASE_URL}audio/combos/combo-1-1-2-3.mp3`,
    '1, 1, 6': `${AUDIO_BASE_URL}audio/combos/combo-1-1-6.mp3`,
    '1, 1, 2, 6': `${AUDIO_BASE_URL}audio/combos/combo-1-1-2-6.mp3`,
    '1, 2, 3': `${AUDIO_BASE_URL}audio/combos/combo-1-2-3.mp3`,
    '1, 2, 6': `${AUDIO_BASE_URL}audio/combos/combo-1-2-6.mp3`,
    '1, 3, 2': `${AUDIO_BASE_URL}audio/combos/combo-1-3-2.mp3`,
    '2, 3, 2': `${AUDIO_BASE_URL}audio/combos/combo-2-3-2.mp3`,
    '3, 2, 3': `${AUDIO_BASE_URL}audio/combos/combo-3-2-3.mp3`,
    '1, 5, 2': `${AUDIO_BASE_URL}audio/combos/combo-1-5-2.mp3`,
    '1, 6, 3': `${AUDIO_BASE_URL}audio/combos/combo-1-6-3.mp3`,
    '1, 2, 3, 6': `${AUDIO_BASE_URL}audio/combos/combo-1-2-3-6.mp3`,
    '1, 1, 3, 2': `${AUDIO_BASE_URL}audio/combos/combo-1-1-3-2.mp3`,
    '1, 1, 3, 6': `${AUDIO_BASE_URL}audio/combos/combo-1-1-3-6.mp3`,
    '1, 2, 3, 2': `${AUDIO_BASE_URL}audio/combos/combo-1-2-3-2.mp3`,
    '2, 3, 6, 3': `${AUDIO_BASE_URL}audio/combos/combo-2-3-6-3.mp3`,
    '1, 2, 5, 2': `${AUDIO_BASE_URL}audio/combos/combo-1-2-5-2.mp3`,
    '1, 2 body, 3': `${AUDIO_BASE_URL}audio/combos/combo-1-2-body-3.mp3`,
    '1, 3 body, 2': `${AUDIO_BASE_URL}audio/combos/combo-1-3-body-2.mp3`,
    '3 body, 3': `${AUDIO_BASE_URL}audio/combos/combo-3-body-3.mp3`,
    '1, 2, 3 body': `${AUDIO_BASE_URL}audio/combos/combo-1-2-3-body.mp3`,
    '1, 2 body, 6': `${AUDIO_BASE_URL}audio/combos/combo-1-2-body-6.mp3`,
    '1, 2': `${AUDIO_BASE_URL}audio/combos/combo-1-2.mp3`,
    '2, 3': `${AUDIO_BASE_URL}audio/combos/combo-2-3.mp3`,
    '3, 2': `${AUDIO_BASE_URL}audio/combos/combo-3-2.mp3`,
    
    // Five-shot combinations (20)
    '1, 2, 4, 2, 3': `${AUDIO_BASE_URL}audio/combos/combo-1-2-4-2-3.mp3`,
    '1, 4, 2, 3, 2': `${AUDIO_BASE_URL}audio/combos/combo-1-4-2-3-2.mp3`,
    '2, 1, 2, 3, 2': `${AUDIO_BASE_URL}audio/combos/combo-2-1-2-3-2.mp3`,
    '2, 3, 4, 2, 3': `${AUDIO_BASE_URL}audio/combos/combo-2-3-4-2-3.mp3`,
    '3, 2, 1, 2, 3': `${AUDIO_BASE_URL}audio/combos/combo-3-2-1-2-3.mp3`,
    '3, 4, 2, 3, 2': `${AUDIO_BASE_URL}audio/combos/combo-3-4-2-3-2.mp3`,
    '4, 2, 3, 2, 4': `${AUDIO_BASE_URL}audio/combos/combo-4-2-3-2-4.mp3`,
    '1, 5, 2, 3, 2': `${AUDIO_BASE_URL}audio/combos/combo-1-5-2-3-2.mp3`,
    '1, 6, 2, 3, 2': `${AUDIO_BASE_URL}audio/combos/combo-1-6-2-3-2.mp3`,
    '2, 5, 2, 3, 2': `${AUDIO_BASE_URL}audio/combos/combo-2-5-2-3-2.mp3`,
    '2, 6, 3, 2, 3': `${AUDIO_BASE_URL}audio/combos/combo-2-6-3-2-3.mp3`,
    '3, 5, 2, 3, 2': `${AUDIO_BASE_URL}audio/combos/combo-3-5-2-3-2.mp3`,
    '1, 2 body, 3, 2, 3': `${AUDIO_BASE_URL}audio/combos/combo-1-2-body-3-2-3.mp3`,
    '2 body, 3, 2, 3, 2': `${AUDIO_BASE_URL}audio/combos/combo-2-body-3-2-3-2.mp3`,
    '3 body, 2, 3, 2, 3': `${AUDIO_BASE_URL}audio/combos/combo-3-body-2-3-2-3.mp3`,
    '1, 4, 6, 3, 2': `${AUDIO_BASE_URL}audio/combos/combo-1-4-6-3-2.mp3`,
    '4, 6, 3, 2, 3': `${AUDIO_BASE_URL}audio/combos/combo-4-6-3-2-3.mp3`,
    '2, 1, 4, 2, 3': `${AUDIO_BASE_URL}audio/combos/combo-2-1-4-2-3.mp3`,
    '1, 4, 5, 2, 3': `${AUDIO_BASE_URL}audio/combos/combo-1-4-5-2-3.mp3`,
    '5, 2, 3, 2, 3': `${AUDIO_BASE_URL}audio/combos/combo-5-2-3-2-3.mp3`,
    
    // Four-shot combinations (25)
    '1, 2, 4, 2': `${AUDIO_BASE_URL}audio/combos/combo-1-2-4-2.mp3`,
    '1, 2, 4, 5': `${AUDIO_BASE_URL}audio/combos/combo-1-2-4-5.mp3`,
    '1, 4, 2, 3': `${AUDIO_BASE_URL}audio/combos/combo-1-4-2-3.mp3`,
    '2, 1, 2, 3': `${AUDIO_BASE_URL}audio/combos/combo-2-1-2-3.mp3`,
    '2, 3, 4, 2': `${AUDIO_BASE_URL}audio/combos/combo-2-3-4-2.mp3`,
    '3, 2, 1, 2': `${AUDIO_BASE_URL}audio/combos/combo-3-2-1-2.mp3`,
    '3, 4, 2, 3': `${AUDIO_BASE_URL}audio/combos/combo-3-4-2-3.mp3`,
    '4, 2, 3, 2': `${AUDIO_BASE_URL}audio/combos/combo-4-2-3-2.mp3`,
    '1, 5, 2, 3': `${AUDIO_BASE_URL}audio/combos/combo-1-5-2-3.mp3`,
    '1, 6, 2, 3': `${AUDIO_BASE_URL}audio/combos/combo-1-6-2-3.mp3`,
    '2, 5, 2, 3': `${AUDIO_BASE_URL}audio/combos/combo-2-5-2-3.mp3`,
    '2, 6, 3, 2': `${AUDIO_BASE_URL}audio/combos/combo-2-6-3-2.mp3`,
    '3, 5, 2, 3': `${AUDIO_BASE_URL}audio/combos/combo-3-5-2-3.mp3`,
    '2, 3, 2, 4': `${AUDIO_BASE_URL}audio/combos/combo-2-3-2-4.mp3`,
    '4, 3, 2, 3': `${AUDIO_BASE_URL}audio/combos/combo-4-3-2-3.mp3`,
    '1, 2 body, 3, 2': `${AUDIO_BASE_URL}audio/combos/combo-1-2-body-3-2.mp3`,
    '1, 2, 3 body, 2': `${AUDIO_BASE_URL}audio/combos/combo-1-2-3-body-2.mp3`,
    '2 body, 3, 2, 3': `${AUDIO_BASE_URL}audio/combos/combo-2-body-3-2-3.mp3`,
    '3 body, 2, 3, 2': `${AUDIO_BASE_URL}audio/combos/combo-3-body-2-3-2.mp3`,
    '1, 4, 6, 3': `${AUDIO_BASE_URL}audio/combos/combo-1-4-6-3.mp3`,
    '4, 6, 3, 2': `${AUDIO_BASE_URL}audio/combos/combo-4-6-3-2.mp3`,
    '2, 1, 4, 2': `${AUDIO_BASE_URL}audio/combos/combo-2-1-4-2.mp3`,
    '1, 4, 5, 2': `${AUDIO_BASE_URL}audio/combos/combo-1-4-5-2.mp3`,
    '5, 2, 3, 2': `${AUDIO_BASE_URL}audio/combos/combo-5-2-3-2.mp3`,
    '2, 4, 2, 3': `${AUDIO_BASE_URL}audio/combos/combo-2-4-2-3.mp3`,
    
    // Three-shot combinations (35)
    '1, 2, 4': `${AUDIO_BASE_URL}audio/combos/combo-1-2-4.mp3`,
    '1, 4, 2': `${AUDIO_BASE_URL}audio/combos/combo-1-4-2.mp3`,
    '2, 1, 2': `${AUDIO_BASE_URL}audio/combos/combo-2-1-2.mp3`,
    '2, 3, 4': `${AUDIO_BASE_URL}audio/combos/combo-2-3-4.mp3`,
    '3, 2, 1': `${AUDIO_BASE_URL}audio/combos/combo-3-2-1.mp3`,
    '3, 4, 2': `${AUDIO_BASE_URL}audio/combos/combo-3-4-2.mp3`,
    '4, 2, 3': `${AUDIO_BASE_URL}audio/combos/combo-4-2-3.mp3`,
    '4, 3, 2': `${AUDIO_BASE_URL}audio/combos/combo-4-3-2.mp3`,
    '1, 5, 3': `${AUDIO_BASE_URL}audio/combos/combo-1-5-3.mp3`,
    '1, 6, 2': `${AUDIO_BASE_URL}audio/combos/combo-1-6-2.mp3`,
    '2, 5, 2': `${AUDIO_BASE_URL}audio/combos/combo-2-5-2.mp3`,
    '2, 6, 3': `${AUDIO_BASE_URL}audio/combos/combo-2-6-3.mp3`,
    '3, 5, 2': `${AUDIO_BASE_URL}audio/combos/combo-3-5-2.mp3`,
    '3, 2, 5': `${AUDIO_BASE_URL}audio/combos/combo-3-2-5.mp3`,
    '4, 2, 6': `${AUDIO_BASE_URL}audio/combos/combo-4-2-6.mp3`,
    '2, 4, 2': `${AUDIO_BASE_URL}audio/combos/combo-2-4-2.mp3`,
    '1, 2 body, 5': `${AUDIO_BASE_URL}audio/combos/combo-1-2-body-5.mp3`,
    '1, 3 body, 5': `${AUDIO_BASE_URL}audio/combos/combo-1-3-body-5.mp3`,
    '2 body, 3, 2': `${AUDIO_BASE_URL}audio/combos/combo-2-body-3-2.mp3`,
    '3 body, 2, 3': `${AUDIO_BASE_URL}audio/combos/combo-3-body-2-3.mp3`,
    '2, 1, 4': `${AUDIO_BASE_URL}audio/combos/combo-2-1-4.mp3`,
    '1, 4, 5': `${AUDIO_BASE_URL}audio/combos/combo-1-4-5.mp3`,
    '4, 5, 2': `${AUDIO_BASE_URL}audio/combos/combo-4-5-2.mp3`,
    '5, 2, 3': `${AUDIO_BASE_URL}audio/combos/combo-5-2-3.mp3`,
    '6, 2, 3': `${AUDIO_BASE_URL}audio/combos/combo-6-2-3.mp3`,
    '2, 3 body, 2': `${AUDIO_BASE_URL}audio/combos/combo-2-3-body-2.mp3`,
    '3, 1, 2': `${AUDIO_BASE_URL}audio/combos/combo-3-1-2.mp3`,
    '1, 4, 6': `${AUDIO_BASE_URL}audio/combos/combo-1-4-6.mp3`,
    '4, 6, 3': `${AUDIO_BASE_URL}audio/combos/combo-4-6-3.mp3`,
    '6, 3, 2': `${AUDIO_BASE_URL}audio/combos/combo-6-3-2.mp3`,
    '2, 1, 6': `${AUDIO_BASE_URL}audio/combos/combo-2-1-6.mp3`,
    '1, 2, 5': `${AUDIO_BASE_URL}audio/combos/combo-1-2-5.mp3`,
    '5, 2, 5': `${AUDIO_BASE_URL}audio/combos/combo-5-2-5.mp3`,
    '2, 5, 3': `${AUDIO_BASE_URL}audio/combos/combo-2-5-3.mp3`,
    '3, 2 body, 3': `${AUDIO_BASE_URL}audio/combos/combo-3-2-body-3.mp3`,
  },
  movements: {
    'Slip left': `${AUDIO_BASE_URL}audio/movements/move-slip-left.mp3`,
    'Slip right': `${AUDIO_BASE_URL}audio/movements/move-slip-right.mp3`,
    'Roll under': `${AUDIO_BASE_URL}audio/movements/move-roll-under.mp3`,
    'Pivot left': `${AUDIO_BASE_URL}audio/movements/move-pivot-left.mp3`,
    'Pivot right': `${AUDIO_BASE_URL}audio/movements/move-pivot-right.mp3`,
    'Step back': `${AUDIO_BASE_URL}audio/movements/move-step-back.mp3`,
    'Step forward': `${AUDIO_BASE_URL}audio/movements/move-step-forward.mp3`,
    'Circle left': `${AUDIO_BASE_URL}audio/movements/move-circle-left.mp3`,
    'Circle right': `${AUDIO_BASE_URL}audio/movements/move-circle-right.mp3`,
    'Duck': `${AUDIO_BASE_URL}audio/movements/move-duck.mp3`,
  }
};

/**
 * Get URL for a specific audio file
 */
function getAudioUrl(key: string): string | undefined {
  if (AUDIO_FILES.system[key]) return AUDIO_FILES.system[key];
  if (AUDIO_FILES.combos[key]) return AUDIO_FILES.combos[key];
  if (AUDIO_FILES.movements[key]) return AUDIO_FILES.movements[key];
  return undefined;
}

/**
 * Unlock audio context (must be called from user interaction)
 */
async function unlockAudioContext(): Promise<void> {
  if (isUnlocked) return;
  
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  
  // Resume context (required on iOS)
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }
  
  // Play silent buffer to unlock (iOS workaround)
  const buffer = audioContext.createBuffer(1, 1, 22050);
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start(0);
  
  isUnlocked = true;
  console.log('✅ Audio context unlocked!');
}

/**
 * Load an audio file and decode to buffer
 */
async function loadAudioBuffer(key: string): Promise<AudioBuffer | null> {
  // Return cached buffer
  if (audioBuffers.has(key)) {
    return audioBuffers.get(key)!;
  }
  
  // Return existing loading promise
  if (loadingPromises.has(key)) {
    return loadingPromises.get(key)!;
  }
  
  // Get URL
  const url = getAudioUrl(key);
  if (!url) {
    console.warn(`⚠️ No audio URL for: ${key}`);
    return null;
  }
  
  // Create loading promise
  const promise = (async () => {
    try {
      console.log(`📥 Loading buffer: "${key}"`);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      
      if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      audioBuffers.set(key, audioBuffer);
      loadingPromises.delete(key);
      
      console.log(`✅ Loaded buffer: "${key}" (${audioBuffer.duration.toFixed(1)}s)`);
      return audioBuffer;
      
    } catch (error) {
      console.error(`❌ Failed to load "${key}":`, error);
      loadingPromises.delete(key);
      return null;
    }
  })();
  
  loadingPromises.set(key, promise);
  return promise;
}

/**
 * Play an audio buffer
 */
function playBuffer(buffer: AudioBuffer): AudioBufferSourceNode {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start(0);
  
  return source;
}

/**
 * Initialize mobile audio (call this on first user interaction)
 */
export async function initMobileAudio(): Promise<void> {
  console.log('🎤 Initializing mobile audio...');
  
  // Unlock audio context
  await unlockAudioContext();
  
  // Pre-load critical files (system messages + first few combos)
  const criticalFiles = [
    'round-1', 'round-2', 'round-3',
    'rest', 'complete',
    '1, 2', '1, 2, 3', '1, 1, 2',
    'Slip left', 'Slip right', 'Step back',
  ];
  
  // Load in parallel
  await Promise.all(criticalFiles.map(key => loadAudioBuffer(key)));
  
  console.log(`✅ Mobile audio ready! ${audioBuffers.size} files loaded.`);
}

/**
 * Play a single audio file by key
 */
export async function playAudio(key: string): Promise<boolean> {
  const startTime = performance.now();
  
  // Ensure context is unlocked
  if (!isUnlocked) {
    await unlockAudioContext();
  }
  
  // Load buffer if not cached
  const buffer = await loadAudioBuffer(key);
  
  if (!buffer) {
    console.warn(`⚠️ Cannot play "${key}" - buffer failed to load`);
    return false;
  }
  
  // Play buffer
  playBuffer(buffer);
  
  const loadTime = performance.now() - startTime;
  console.log(`▶️ Playing "${key}" (${loadTime.toFixed(0)}ms)`);
  
  return true;
}

/**
 * Play round start message
 */
export async function playRoundStart(roundNumber: number): Promise<void> {
  await playAudio(`round-${roundNumber}`);
}

/**
 * Play rest message
 */
export async function playRest(): Promise<void> {
  await playAudio('rest');
}

/**
 * Play complete message
 */
export async function playComplete(): Promise<void> {
  await playAudio('complete');
}

/**
 * Play a combo with movement
 * Parses the text and plays files in sequence
 */
export async function playComboWithMovement(text: string): Promise<void> {
  console.log(`🎯 Parsing combo: "${text}"`);
  
  const parts = text.split(',').map(p => p.trim());
  console.log(`   Parts:`, parts);
  
  // Check if first part is a movement
  const firstIsMovement = AUDIO_FILES.movements.hasOwnProperty(parts[0]);
  
  if (firstIsMovement) {
    // Movement first: "Slip left, 1, 2, 3"
    const movement = parts[0];
    const combo = parts.slice(1).join(', ');
    console.log(`   ➡️ Movement="${movement}", Combo="${combo}"`);
    
    // Load both files
    const [movementBuffer, comboBuffer] = await Promise.all([
      loadAudioBuffer(movement),
      loadAudioBuffer(combo),
    ]);
    
    // Play movement
    if (movementBuffer) {
      const source = playBuffer(movementBuffer);
      console.log(`▶️ Playing movement: "${movement}"`);
      
      // Play combo after movement finishes
      if (comboBuffer) {
        source.onended = () => {
          playBuffer(comboBuffer);
          console.log(`▶️ Playing combo: "${combo}"`);
        };
      }
    }
    
  } else {
    // Combo first: "1, 2, 3, Step back"
    let comboEnd = parts.length - 1;
    for (let i = parts.length - 1; i >= 0; i--) {
      if (AUDIO_FILES.movements.hasOwnProperty(parts[i])) {
        comboEnd = i;
        break;
      }
    }
    
    const combo = parts.slice(0, comboEnd).join(', ');
    const movement = parts[comboEnd];
    console.log(`   ➡️ Combo="${combo}", Movement="${movement}"`);
    
    // Load both files
    const [comboBuffer, movementBuffer] = await Promise.all([
      loadAudioBuffer(combo),
      loadAudioBuffer(movement),
    ]);
    
    // Play combo
    if (comboBuffer) {
      const source = playBuffer(comboBuffer);
      console.log(`▶️ Playing combo: "${combo}"`);
      
      // Play movement after combo finishes
      if (movementBuffer) {
        source.onended = () => {
          playBuffer(movementBuffer);
          console.log(`▶️ Playing movement: "${movement}"`);
        };
      }
    }
  }
}

/**
 * Get stats about loaded audio
 */
export function getAudioStats() {
  return {
    isUnlocked,
    contextState: audioContext?.state || 'not created',
    buffersLoaded: audioBuffers.size,
    totalFiles: Object.keys(AUDIO_FILES.system).length + 
                Object.keys(AUDIO_FILES.combos).length + 
                Object.keys(AUDIO_FILES.movements).length,
  };
}
