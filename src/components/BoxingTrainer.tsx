import { useState, useEffect, useRef } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import svgPaths from "../imports/svg-ih4f7sjo7i";
import logoSvgPaths from "../imports/svg-a90evb0z0g";
import { 
  initMobileAudio,
  playRoundStart,
  playRest,
  playComboWithMovement,
  playComplete,
  stopAudio,
  stopSpeech,
  speakFast
} from './mobile-audio-player';

function PlayButton({ onClick, isPlaying }: { onClick: () => void; isPlaying: boolean }) {
  return (
    <button onClick={onClick} className="relative shrink-0 w-[clamp(45px,12vw,62px)] h-[clamp(45px,12vw,62px)] transition-transform hover:scale-105 active:scale-95">
      {isPlaying ? (
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 62 62">
          <rect x="18" y="16" width="8" height="30" fill="#EBEBEB" rx="1" />
          <rect x="36" y="16" width="8" height="30" fill="#EBEBEB" rx="1" />
        </svg>
      ) : (
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 45 45">
          <path d={logoSvgPaths.p32a44c00} fill="#EBEBEB" />
        </svg>
      )}
    </button>
  );
}

function ResetButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className="relative shrink-0 w-[clamp(45px,12vw,62px)] h-[clamp(45px,12vw,62px)] transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 62 62">
        <path d={logoSvgPaths.p39f1a680} fill="#EBEBEB" />
      </svg>
    </button>
  );
}

export function BoxingTrainer() {
  const [hasStarted, setHasStarted] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(180); // 3 minutes default
  const [isResting, setIsResting] = useState(false);
  const [totalRounds, setTotalRounds] = useState(8);
  const [restPeriod, setRestPeriod] = useState(60); // seconds
  const [roundDuration, setRoundDuration] = useState(180); // 3 minutes per round
  const [workrate, setWorkrate] = useState<'slow' | 'medium' | 'fast'>('medium');
  const [isFlashing, setIsFlashing] = useState(false);
  const [voiceMode, setVoiceModeState] = useState<'fast' | 'custom'>('custom');
  const [audioLoaded, setAudioLoaded] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const commandIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const lastCommandWasPunchRef = useRef<boolean>(false);

  // Workrate intervals (in milliseconds) - adjusted for realistic boxing pace
  const workrateIntervals = {
    slow: { min: 8000, max: 12000 },   // 8-12 seconds (beginner pace)
    medium: { min: 5000, max: 8000 },  // 5-8 seconds (intermediate pace)
    fast: { min: 3000, max: 5000 },    // 3-5 seconds (advanced pace)
  };

  // Load available voices and pre-generated audio on mount
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      // Try to find a British English voice (closest to cockney)
      const britishVoice = voices.find(voice => 
        voice.lang === 'en-GB' || voice.name.includes('British') || voice.name.includes('UK')
      );
      // Fallback to any English voice
      const englishVoice = voices.find(voice => voice.lang.startsWith('en'));
      selectedVoiceRef.current = britishVoice || englishVoice || voices[0];
    };

    loadVoices();
    // Chrome loads voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Initialize mobile audio system
    // Note: Will be fully unlocked on first user interaction (play button)
    setAudioLoaded(true);
  }, []);

  // Punch combinations using boxing number system
  // Numbers are universal across stances:
  // 1=Jab, 2=Cross, 3=Lead Hook, 4=Rear Hook, 5=Lead Uppercut, 6=Rear Uppercut
  const getPunchCombinations = () => {
    return [
      // Jab-heavy combinations
      '1, 1',
      '1, 1, 2',
      '1, 1, 1',
      '1, 1, 2, 3',
      '1, 1, 2, 3',
      '1, 1, 6',
      '1, 1, 2, 6',
      
      // Three-shot combinations
      '1, 2, 3',
      '1, 2, 3',
      '1, 2, 6',
      '1, 3, 2',
      '2, 3, 2',
      '3, 2, 3',
      '1, 5, 2',
      '1, 6, 3',
      
      // Four-shot combinations
      '1, 2, 3, 6',
      '1, 1, 3, 2',
      '1, 1, 3, 6',
      '1, 2, 3, 2',
      '2, 3, 6, 3',
      '1, 2, 5, 2',
      
      // Body work combinations
      '1, 2 body, 3',
      '1, 3 body, 2',
      '3 body, 3',
      '1, 2, 3 body',
      '1, 2 body, 6',
      
      // Five-shot combinations
      '1, 2, 4, 2, 3',
      '1, 4, 2, 3, 2',
      '2, 1, 2, 3, 2',
      '2, 3, 4, 2, 3',
      '3, 2, 1, 2, 3',
      '3, 4, 2, 3, 2',
      '4, 2, 3, 2, 4',
      '1, 5, 2, 3, 2',
      '1, 6, 2, 3, 2',
      '2, 5, 2, 3, 2',
      '2, 6, 3, 2, 3',
      '3, 5, 2, 3, 2',
      '1, 2 body, 3, 2, 3',
      '2 body, 3, 2, 3, 2',
      '3 body, 2, 3, 2, 3',
      '1, 4, 6, 3, 2',
      '4, 6, 3, 2, 3',
      '2, 1, 4, 2, 3',
      '1, 4, 5, 2, 3',
      '5, 2, 3, 2, 3',
      
      // Occasional two-shot combos
      '1, 2',
      '2, 3',
      '3, 2',
    ];
  };

  const movements = [
    'Slip left',
    'Slip right',
    'Roll under',
    'Pivot left',
    'Pivot right',
    'Step back',
    'Step forward',
    'Circle left',
    'Circle right',
    'Duck',
  ];

  const playBellSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = audioContext.currentTime;
    
    // Create oscillators for bell-like sound
    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Bell frequencies
    oscillator1.frequency.value = 800;
    oscillator2.frequency.value = 1200;
    
    // Bell envelope
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
    
    oscillator1.start(now);
    oscillator2.start(now);
    oscillator1.stop(now + 1.5);
    oscillator2.stop(now + 1.5);
  };

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
  };

  const speak = (text: string, isRoundStart = false, isRestStart = false, isComplete = false) => {
    const timestamp = new Date().toLocaleTimeString();
    
    // Use selected voice mode
    if (voiceMode === 'custom' && audioLoaded) {
      addDebugLog(`🥊 GEEZER: "${text}"`);
      // Use pre-generated audio for custom voice
      if (isRoundStart) {
        const roundNum = parseInt(text.match(/\d+/)?.[0] || '1');
        playRoundStart(roundNum);
      } else if (isRestStart) {
        playRest();
      } else if (isComplete) {
        playComplete();
      } else {
        // It's a combo with movement
        playComboWithMovement(text);
      }
    } else {
      addDebugLog(`⚡ BROWSER: "${text}"`);
      speakFast(text);
    }
  };

  const getRandomCommand = () => {
    // Get a random punch combination
    const punches = getPunchCombinations();
    const punchCombo = punches[Math.floor(Math.random() * punches.length)];
    
    // Get a random movement
    const movement = movements[Math.floor(Math.random() * movements.length)];
    
    // Randomly decide whether movement comes before or after the combo
    const movementFirst = Math.random() < 0.5;
    
    if (movementFirst) {
      return `${movement}, ${punchCombo}`;
    } else {
      return `${punchCombo}, ${movement}`;
    }
  };

  const callOutCommand = () => {
    const command = getRandomCommand();
    console.log(`🥊 [${new Date().toLocaleTimeString()}] ${command}`);
    speak(command);
  };

  const getRandomInterval = () => {
    const interval = workrateIntervals[workrate];
    return Math.random() * (interval.max - interval.min) + interval.min;
  };

  const scheduleNextCommand = () => {
    const nextInterval = getRandomInterval();
    addDebugLog(`⏱️ Next combo in ${(nextInterval / 1000).toFixed(1)}s`);
    commandIntervalRef.current = setTimeout(() => {
      callOutCommand();
      scheduleNextCommand(); // Schedule the next command
    }, nextInterval);
  };

  const startRound = () => {
    setIsResting(false);
    setTimeRemaining(roundDuration);
    setIsFlashing(false);
    lastCommandWasPunchRef.current = false; // Reset at start of round
    playBellSound();
    addDebugLog(`🔔 Round ${currentRound + 1} - Workrate: ${workrate.toUpperCase()}`);
    speak(`Round ${currentRound + 1}. Box!`, true, false);
    
    // Start calling out commands based on workrate
    scheduleNextCommand();
  };

  const startRest = () => {
    if (commandIntervalRef.current) {
      clearTimeout(commandIntervalRef.current);
    }
    setIsResting(true);
    setTimeRemaining(restPeriod);
    speak('Rest. Good work!', false, true);
  };

  const handlePlayPause = async () => {
    if (isTraining) {
      // Pause
      setIsTraining(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (commandIntervalRef.current) clearTimeout(commandIntervalRef.current);
      stopSpeech();
      stopAudio();
    } else {
      // Start/Resume
      // Unlock audio on first user interaction (mobile fix)
      if (voiceMode === 'custom') {
        addDebugLog('🔓 Unlocking mobile audio...');
        await initMobileAudio();
        addDebugLog('✅ Audio unlocked!');
      }
      
      setIsTraining(true);
      if (currentRound === 0 && timeRemaining === roundDuration) {
        // Starting fresh
        setCurrentRound(1);
        startRound();
      } else if (!isResting) {
        // Resuming from pause - restart command scheduling
        addDebugLog('▶️ Resuming command scheduling...');
        scheduleNextCommand();
      }
    }
  };

  const handleReset = () => {
    setIsTraining(false);
    setCurrentRound(0);
    setTimeRemaining(roundDuration);
    setIsResting(false);
    setIsFlashing(false);
    lastCommandWasPunchRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
    if (commandIntervalRef.current) clearTimeout(commandIntervalRef.current);
    stopSpeech();
    stopAudio();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
      stopAudio();
    };
  }, []);

  useEffect(() => {
    if (isTraining) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          // Flash in last 10 seconds of round (not rest)
          if (!isResting && prev <= 10 && prev > 0) {
            setIsFlashing(true);
          } else {
            setIsFlashing(false);
          }

          if (prev <= 1) {
            if (isResting) {
              // Rest period ended
              if (currentRound < totalRounds) {
                // Start next round
                setCurrentRound((r) => r + 1);
                startRound();
                return roundDuration;
              } else {
                // Training complete
                setIsTraining(false);
                setIsFlashing(false);
                speak('Training complete! Great work!', false, false, true);
                if (commandIntervalRef.current) clearTimeout(commandIntervalRef.current);
                return 0;
              }
            } else {
              // Round ended
              setIsFlashing(false);
              startRest();
              return restPeriod;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTraining, isResting, currentRound, totalRounds, restPeriod, roundDuration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Welcome Screen
  if (!hasStarted) {
    return (
      <div className="bg-[#EBEBEB] fixed inset-0 w-full h-full flex items-center justify-center p-0 overflow-x-hidden overflow-y-hidden">
        <div className="relative w-full max-w-[430px] h-full flex flex-col">
          {/* STABLEMATE Logo */}
          <div className="relative w-full px-6 pt-6 sm:pt-7 pb-3 sm:pb-4">
            <div className="w-full max-w-[384px] h-auto aspect-[384/124] mx-auto">
              <svg className="block w-full h-full" fill="none" preserveAspectRatio="xMidYMid meet" viewBox="0 0 384 124">
                <g>
                  <path d={logoSvgPaths.p38f66200} fill="#222222" />
                  <path d={logoSvgPaths.p11fc0780} fill="#222222" />
                  <path d={logoSvgPaths.p136b8680} fill="#222222" />
                  <path d={logoSvgPaths.pb5780c0} fill="#222222" />
                  <path d={logoSvgPaths.pbc29300} fill="#222222" />
                  <path d={logoSvgPaths.p3b22c400} fill="#222222" />
                  <path d={logoSvgPaths.pbb9c980} fill="#222222" />
                  <path d={logoSvgPaths.p3e21d580} fill="#222222" />
                  <path d={logoSvgPaths.p3b7e8b00} fill="#222222" />
                  <path d={logoSvgPaths.p2e7afc00} fill="#222222" />
                </g>
              </svg>
            </div>
          </div>

          {/* Welcome Content */}
          <div className="relative w-full flex-1 flex flex-col justify-between px-6 pb-0">
            {/* Welcome Text */}
            <div className="flex flex-col gap-6 mt-8">
              <p className="font-['DM_Mono',_sans-serif] font-medium text-[#222222] text-[11px] sm:text-[14px] tracking-[1.1px] sm:tracking-[1.4px] uppercase leading-relaxed">
                Welcome to Stablemate, a boxing training app designed for solo shadowboxing and bag workouts
              </p>
              <p className="font-['DM_Mono',_sans-serif] font-medium text-[#222222] text-[11px] sm:text-[14px] tracking-[1.1px] sm:tracking-[1.4px] uppercase leading-relaxed">
                Please ensure that your phone is not set to silent. If using an iPhone, please ensure that the toggle on the left of the phone is in the up position to allow web sound.
              </p>
              <p className="font-['DM_Mono',_sans-serif] font-medium text-[#222222] text-[11px] sm:text-[14px] tracking-[1.1px] sm:tracking-[1.4px] uppercase leading-relaxed">
                Please also ensure auto screen locking is turned off.
              </p>
            </div>

            {/* Start Button */}
            <button
              onClick={() => setHasStarted(true)}
              className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-[#222222] py-6 transition-opacity hover:opacity-90 active:opacity-80 flex-shrink-0 flex items-center justify-center"
            >
              <span className="font-['DM_Mono',_sans-serif] font-medium text-[#EBEBEB] text-[14px] sm:text-[16px] tracking-[1.4px] sm:tracking-[1.6px] uppercase">
                Start Training
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Training Interface
  return (
    <div className="bg-[#EBEBEB] relative w-full min-h-screen flex items-center justify-center p-0 overflow-x-hidden">
      <div className="relative w-full max-w-[430px] min-h-screen sm:h-auto sm:min-h-[932px] flex flex-col">
        {/* STABLEMATE Logo */}
        <div className="relative w-full px-6 pt-6 sm:pt-7 pb-3 sm:pb-4">
          <div className="w-full max-w-[384px] h-auto aspect-[384/124] mx-auto">
            <svg className="block w-full h-full" fill="none" preserveAspectRatio="xMidYMid meet" viewBox="0 0 384 124">
              <g>
                <path d={logoSvgPaths.p38f66200} fill="#222222" />
                <path d={logoSvgPaths.p11fc0780} fill="#222222" />
                <path d={logoSvgPaths.p136b8680} fill="#222222" />
                <path d={logoSvgPaths.pb5780c0} fill="#222222" />
                <path d={logoSvgPaths.pbc29300} fill="#222222" />
                <path d={logoSvgPaths.p3b22c400} fill="#222222" />
                <path d={logoSvgPaths.pbb9c980} fill="#222222" />
                <path d={logoSvgPaths.p3e21d580} fill="#222222" />
                <path d={logoSvgPaths.p3b7e8b00} fill="#222222" />
                <path d={logoSvgPaths.p2e7afc00} fill="#222222" />
              </g>
            </svg>
          </div>
        </div>
        
        {/* Main container section - Timer display */}
        <div 
          className={`relative w-full flex-1 flex items-center justify-center transition-colors duration-300 px-4 py-8 sm:py-10 min-h-[450px] ${
            isFlashing ? 'bg-[#FF0000] animate-pulse' : 'bg-[#222222]'
          }`} 
        >
          {/* Timer and Controls Section */}
          <div className="flex flex-col items-center justify-center gap-5 sm:gap-6 w-full max-w-[400px]">
            {/* Status Text */}
            <p className="font-['DM_Mono',_sans-serif] font-medium text-[14px] sm:text-[16px] md:text-[18px] tracking-[1.4px] sm:tracking-[1.6px] md:tracking-[1.8px] uppercase text-[#EBEBEB] text-center">
              {currentRound === 0 && !isTraining ? 'Ready to Train' : 
               isResting ? 'Rest Period' : `Round ${currentRound} of ${totalRounds}`}
            </p>
            
            {/* Timer - centered and responsive using Anton */}
            <p className="text-[clamp(100px,32vw,240px)] leading-[0.9] text-[#EBEBEB] text-center" style={{ fontFamily: "'Anton', sans-serif", letterSpacing: '0px' }}>
              {formatTime(timeRemaining)}
            </p>
            
            {/* Play and Reset Buttons */}
            <div className="flex gap-7 sm:gap-8 items-center mt-2">
              <PlayButton onClick={handlePlayPause} isPlaying={isTraining} />
              <ResetButton onClick={handleReset} disabled={currentRound === 0 && !isTraining} />
            </div>
          </div>
        </div>
        
        {/* Settings Section - Row 1: ROUNDS, REST, ROUND TIME */}
        <div className="relative w-full bg-[#EBEBEB]">
          <div className="grid grid-cols-3 divide-x divide-[#222222] border-t border-[#222222]">
            {/* ROUNDS */}
            <div className="flex flex-col gap-2 sm:gap-3 items-start px-3 sm:px-4 py-5 sm:py-6">
              <p className="font-['DM_Mono',_sans-serif] font-medium text-[#222222] text-[11px] sm:text-[14px] tracking-[1.1px] sm:tracking-[1.4px] uppercase">Rounds</p>
              <Select
                value={totalRounds.toString()}
                onValueChange={(value) => setTotalRounds(parseInt(value))}
                disabled={isTraining}
              >
                <SelectTrigger className="!bg-transparent !border-none !p-0 !m-0 !h-auto !min-h-0 !w-fit text-[#222222] text-[clamp(32px,10vw,48px)] hover:text-[#222222]/80 !rounded-none focus:ring-0 focus-visible:ring-0 [&>svg]:hidden !gap-0" style={{ fontFamily: "'Anton', sans-serif", letterSpacing: '0px' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#EBEBEB] border-[#222222]">
                  {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((num) => (
                    <SelectItem key={num} value={num.toString()} className="text-[#222222] hover:bg-[#222222]/20 text-[24px] sm:text-[32px]" style={{ fontFamily: "'Anton', sans-serif" }}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* REST */}
            <div className="flex flex-col gap-2 sm:gap-3 items-start px-3 sm:px-4 py-5 sm:py-6">
              <p className="font-['DM_Mono',_sans-serif] font-medium text-[#222222] text-[11px] sm:text-[14px] tracking-[1.1px] sm:tracking-[1.4px] uppercase">Rest</p>
              <Select
                value={restPeriod.toString()}
                onValueChange={(value) => setRestPeriod(parseInt(value))}
                disabled={isTraining}
              >
                <SelectTrigger className="!bg-transparent !border-none !p-0 !m-0 !h-auto !min-h-0 !w-fit text-[#222222] hover:text-[#222222]/80 !rounded-none focus:ring-0 focus-visible:ring-0 [&>svg]:hidden !gap-0" style={{ fontFamily: "'Anton', sans-serif", letterSpacing: '0px' }}>
                  <SelectValue>
                    <span className="text-[clamp(32px,10vw,48px)] leading-tight" style={{ verticalAlign: 'baseline' }}>{restPeriod}</span>
                    <span className="text-[clamp(18px,6vw,28px)] leading-tight" style={{ verticalAlign: 'baseline' }}>S</span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-[#EBEBEB] border-[#222222]">
                  {[30, 45, 60, 90, 120].map((secs) => (
                    <SelectItem key={secs} value={secs.toString()} className="text-[#222222] hover:bg-[#222222]/20 text-[24px] sm:text-[32px]" style={{ fontFamily: "'Anton', sans-serif" }}>
                      {secs}s
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ROUND TIME */}
            <div className="flex flex-col gap-2 sm:gap-3 items-start px-3 sm:px-4 py-5 sm:py-6">
              <p className="font-['DM_Mono',_sans-serif] font-medium text-[#222222] text-[11px] sm:text-[14px] tracking-[1.1px] sm:tracking-[1.4px] uppercase">Round Time</p>
              <Select
                value={roundDuration.toString()}
                onValueChange={(value) => setRoundDuration(parseInt(value))}
                disabled={isTraining}
              >
                <SelectTrigger className="!bg-transparent !border-none !p-0 !m-0 !h-auto !min-h-0 !w-fit text-[#222222] hover:text-[#222222]/80 !rounded-none focus:ring-0 focus-visible:ring-0 [&>svg]:hidden !gap-0" style={{ fontFamily: "'Anton', sans-serif", letterSpacing: '0px' }}>
                  <SelectValue>
                    <span className="text-[clamp(32px,10vw,48px)] leading-tight" style={{ verticalAlign: 'baseline' }}>{roundDuration === 60 ? '1' : roundDuration === 120 ? '2' : roundDuration === 150 ? '2.5' : '3'}</span>
                    <span className="text-[clamp(18px,6vw,28px)] leading-tight" style={{ verticalAlign: 'baseline' }}>MIN</span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-[#EBEBEB] border-[#222222]">
                  <SelectItem value="60" className="text-[#222222] hover:bg-[#222222]/20 text-[24px] sm:text-[32px]" style={{ fontFamily: "'Anton', sans-serif" }}>
                    1 min
                  </SelectItem>
                  <SelectItem value="120" className="text-[#222222] hover:bg-[#222222]/20 text-[24px] sm:text-[32px]" style={{ fontFamily: "'Anton', sans-serif" }}>
                    2 min
                  </SelectItem>
                  <SelectItem value="150" className="text-[#222222] hover:bg-[#222222]/20 text-[24px] sm:text-[32px]" style={{ fontFamily: "'Anton', sans-serif" }}>
                    2.5 min
                  </SelectItem>
                  <SelectItem value="180" className="text-[#222222] hover:bg-[#222222]/20 text-[24px] sm:text-[32px]" style={{ fontFamily: "'Anton', sans-serif" }}>
                    3 min
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Settings Section - Row 2: VOICE, WORKRATE */}
          <div className="grid grid-cols-2 divide-x divide-[#222222] border-t border-[#222222]">
            {/* VOICE */}
            <div className="flex flex-col gap-2 sm:gap-3 items-start px-3 sm:px-4 py-5 sm:py-6">
              <p className="font-['DM_Mono',_sans-serif] font-medium text-[#222222] text-[11px] sm:text-[14px] tracking-[1.1px] sm:tracking-[1.4px] uppercase">Voice</p>
              <Select
                value={voiceMode}
                onValueChange={(value: 'fast' | 'custom') => setVoiceModeState(value)}
                disabled={isTraining}
              >
                <SelectTrigger className="!bg-transparent !border-none !p-0 !m-0 !h-auto !min-h-0 !w-fit text-[#222222] text-[clamp(28px,9vw,44px)] hover:text-[#222222]/80 !rounded-none focus:ring-0 focus-visible:ring-0 uppercase [&>svg]:hidden !gap-0" style={{ fontFamily: "'Anton', sans-serif", letterSpacing: '0px' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#EBEBEB] border-[#222222]">
                  <SelectItem value="custom" className="text-[#222222] hover:bg-[#222222]/20 text-[20px] sm:text-[28px] uppercase" style={{ fontFamily: "'Anton', sans-serif" }}>
                    Human
                  </SelectItem>
                  <SelectItem value="fast" className="text-[#222222] hover:bg-[#222222]/20 text-[20px] sm:text-[28px] uppercase" style={{ fontFamily: "'Anton', sans-serif" }}>
                    Robot
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* WORKRATE */}
            <div className="flex flex-col gap-2 sm:gap-3 items-start px-3 sm:px-4 py-5 sm:py-6">
              <p className="font-['DM_Mono',_sans-serif] font-medium text-[#222222] text-[11px] sm:text-[14px] tracking-[1.1px] sm:tracking-[1.4px] uppercase">Workrate</p>
              <Select
                value={workrate}
                onValueChange={(value: 'slow' | 'medium' | 'fast') => setWorkrate(value)}
                disabled={isTraining}
              >
                <SelectTrigger className="!bg-transparent !border-none !p-0 !m-0 !h-auto !min-h-0 !w-fit text-[#222222] text-[clamp(28px,9vw,44px)] hover:text-[#222222]/80 !rounded-none focus:ring-0 focus-visible:ring-0 uppercase [&>svg]:hidden !gap-0" style={{ fontFamily: "'Anton', sans-serif", letterSpacing: '0px' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#EBEBEB] border-[#222222]">
                  <SelectItem value="slow" className="text-[#222222] hover:bg-[#222222]/20 text-[20px] sm:text-[28px] uppercase" style={{ fontFamily: "'Anton', sans-serif" }}>
                    Slow
                  </SelectItem>
                  <SelectItem value="medium" className="text-[#222222] hover:bg-[#222222]/20 text-[20px] sm:text-[28px] uppercase" style={{ fontFamily: "'Anton', sans-serif" }}>
                    Medium
                  </SelectItem>
                  <SelectItem value="fast" className="text-[#222222] hover:bg-[#222222]/20 text-[20px] sm:text-[28px] uppercase" style={{ fontFamily: "'Anton', sans-serif" }}>
                    Fast
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
