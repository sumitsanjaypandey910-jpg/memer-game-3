import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Play, Sparkles, Sliders, RotateCcw, Volume2, VolumeX, Music, Award } from 'lucide-react';
import {
  GameState,
  GameMode,
  GameSettings,
  BulbItem,
  GameStats,
  LightBulbGameProps,
} from '../types/game';
import { sound } from '../utils/soundEngine';
import { LightBulb } from './LightBulb';
import { GameHUD } from './GameHUD';
import { HowToPlayModal } from './HowToPlayModal';
import { GameOverModal } from './GameOverModal';
import { SettingsModal } from './SettingsModal';

const HIGH_SCORE_KEY = 'bulb_memory_highscore_v2';

export const LightBulbGame: React.FC<LightBulbGameProps> = ({
  initialMode = 'classic',
  targetCount = 3,
  gridSize = { rows: 3, cols: 2 }, // 2 columns x 3 rows matching user screenshot
  memorizeSeconds = 3,
  onGameOver,
  onScoreChange,
  onLevelComplete,
  className = '',
}) => {
  // Settings
  const [settings, setSettings] = useState<GameSettings>({
    gridRows: gridSize.rows,
    gridCols: gridSize.cols,
    targetsCount: targetCount,
    memorizeDurationSeconds: memorizeSeconds,
    allowMistakes: 3,
    soundEnabled: true,
    musicEnabled: false,
    soundVolume: 0.7,
    musicVolume: 0.35,
  });

  // Game State
  const [gameMode, setGameMode] = useState<GameMode>(initialMode);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [gridItems, setGridItems] = useState<BulbItem[]>([]);
  const [foundTargetIds, setFoundTargetIds] = useState<number[]>([]);
  const [wrongTargetIds, setWrongTargetIds] = useState<number[]>([]);

  // Scoring & Progression
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(HIGH_SCORE_KEY);
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });
  const [level, setLevel] = useState<number>(1);
  const totalLevelsInSet = 5;
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);

  // Stats
  const [roundsCompleted, setRoundsCompleted] = useState<number>(0);
  const [totalCorrectClicks, setTotalCorrectClicks] = useState<number>(0);
  const [totalMistakeClicks, setTotalMistakeClicks] = useState<number>(0);

  // Timers
  const [countdownLeft, setCountdownLeft] = useState<number>(settings.memorizeDurationSeconds);
  const [rushTimeLeft, setRushTimeLeft] = useState<number>(60);

  // Audio state
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [musicPlaying, setMusicPlaying] = useState<boolean>(false);

  // Modals
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isGameOverOpen, setIsGameOverOpen] = useState<boolean>(false);

  // Refs
  const countdownIntervalRef = useRef<number | null>(null);
  const rushTimerRef = useRef<number | null>(null);
  const nextRoundTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (rushTimerRef.current) clearInterval(rushTimerRef.current);
      if (nextRoundTimeoutRef.current) clearTimeout(nextRoundTimeoutRef.current);
    };
  }, []);

  const updateHighScore = useCallback((newScore: number) => {
    setHighScore((prev) => {
      if (newScore > prev) {
        try {
          localStorage.setItem(HIGH_SCORE_KEY, newScore.toString());
        } catch {
          // ignore
        }
        return newScore;
      }
      return prev;
    });
  }, []);

  // Generate random target indices
  const createNewRoundGrid = useCallback((rows: number, cols: number, count: number) => {
    const totalBulbs = rows * cols;
    const targetCountClamped = Math.min(Math.max(1, count), totalBulbs);

    const indices = Array.from({ length: totalBulbs }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    const targetIndices = new Set(indices.slice(0, targetCountClamped));

    const items: BulbItem[] = [];
    let idCounter = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isTarget = targetIndices.has(idCounter);
        items.push({
          id: idCounter,
          row: r,
          col: c,
          isTarget,
          isRevealed: false,
          isFound: false,
          isWrongGuess: false,
        });
        idCounter++;
      }
    }
    return items;
  }, []);

  // Start fresh round
  const startRound = useCallback(
    (currentLevel = level, currentMode = gameMode) => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (nextRoundTimeoutRef.current) clearTimeout(nextRoundTimeoutRef.current);

      let rows = settings.gridRows;
      let cols = settings.gridCols;
      let targets = settings.targetsCount;
      let memorizeSec = settings.memorizeDurationSeconds;

      if (currentMode === 'progressive') {
        if (currentLevel === 1) {
          rows = 3;
          cols = 2;
          targets = 3;
          memorizeSec = 3.0;
        } else if (currentLevel === 2) {
          rows = 3;
          cols = 2;
          targets = 3;
          memorizeSec = 2.5;
        } else if (currentLevel === 3) {
          rows = 3;
          cols = 2;
          targets = 3;
          memorizeSec = 2.0;
        } else if (currentLevel === 4) {
          rows = 4;
          cols = 2;
          targets = 4;
          memorizeSec = 2.5;
        } else if (currentLevel >= 5) {
          rows = 3;
          cols = 3;
          targets = 4;
          memorizeSec = 2.0;
        }
      } else if (currentMode === 'rush') {
        rows = 3;
        cols = 2;
        targets = 3;
        memorizeSec = 2.0;
      }

      const items = createNewRoundGrid(rows, cols, targets);
      setGridItems(items);
      setFoundTargetIds([]);
      setWrongTargetIds([]);
      setCountdownLeft(memorizeSec);
      setGameState('memorizing');
      setIsPaused(false);

      sound.playBulbLightUp();

      const startTime = Date.now();
      const durationMs = memorizeSec * 1000;
      let lastTickSecond = Math.ceil(memorizeSec);

      countdownIntervalRef.current = window.setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, (durationMs - elapsed) / 1000);
        setCountdownLeft(remaining);

        const currentSecond = Math.ceil(remaining);
        if (currentSecond < lastTickSecond && currentSecond > 0) {
          sound.playCountdownTick(currentSecond === 1);
          lastTickSecond = currentSecond;
        }

        if (remaining <= 0) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          sound.playBulbTurnOff();
          setGameState('recalling');
        }
      }, 50);
    },
    [level, gameMode, settings, createNewRoundGrid]
  );

  // Full Game Launch
  const startFullGame = (mode: GameMode = gameMode) => {
    setGameMode(mode);
    setScore(0);
    setLevel(1);
    setStreak(0);
    setBestStreak(0);
    setLives(settings.allowMistakes);
    setRoundsCompleted(0);
    setTotalCorrectClicks(0);
    setTotalMistakeClicks(0);
    setIsGameOverOpen(false);
    setIsPaused(false);

    if (mode === 'rush') {
      setRushTimeLeft(60);
      if (rushTimerRef.current) clearInterval(rushTimerRef.current);
      rushTimerRef.current = window.setInterval(() => {
        setRushTimeLeft((prev) => {
          if (prev <= 1) {
            if (rushTimerRef.current) clearInterval(rushTimerRef.current);
            handleGameOver();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    startRound(1, mode);
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.55 },
        colors: ['#facc15', '#f59e0b', '#38bdf8', '#34d399'],
      });
    } catch {
      // ignore
    }
  };

  const handleGameOver = useCallback(() => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (rushTimerRef.current) clearInterval(rushTimerRef.current);
    if (nextRoundTimeoutRef.current) clearTimeout(nextRoundTimeoutRef.current);

    setGameState('game-over');
    sound.playGameOver();

    const totalClicks = totalCorrectClicks + totalMistakeClicks;
    const accuracy = totalClicks > 0 ? (totalCorrectClicks / totalClicks) * 100 : 100;

    const finalStats: GameStats = {
      score,
      highScore: Math.max(score, highScore),
      level,
      streak,
      bestStreak: Math.max(streak, bestStreak),
      roundsCompleted,
      totalCorrect: totalCorrectClicks,
      totalMistakes: totalMistakeClicks,
      accuracy,
      timeLeft: gameMode === 'rush' ? rushTimeLeft : undefined,
    };

    updateHighScore(score);
    setIsGameOverOpen(true);
    if (onGameOver) onGameOver(finalStats);
  }, [
    totalCorrectClicks,
    totalMistakeClicks,
    score,
    highScore,
    level,
    streak,
    bestStreak,
    roundsCompleted,
    gameMode,
    rushTimeLeft,
    onGameOver,
    updateHighScore,
  ]);

  // Handle Bulb Click
  const handleBulbClick = (item: BulbItem) => {
    if (gameState !== 'recalling' || isPaused || item.isFound || item.isWrongGuess) return;

    if (item.isTarget) {
      const newFound = [...foundTargetIds, item.id];
      setFoundTargetIds(newFound);
      setTotalCorrectClicks((prev) => prev + 1);

      sound.playCorrectBulb(newFound.length);

      const streakBonus = streak * 25;
      const points = 100 + streakBonus;
      const newScore = score + points;
      setScore(newScore);
      updateHighScore(newScore);
      if (onScoreChange) onScoreChange(newScore);

      setGridItems((prev) =>
        prev.map((b) => (b.id === item.id ? { ...b, isFound: true } : b))
      );

      const totalTargets = gridItems.filter((b) => b.isTarget).length;
      if (newFound.length >= totalTargets) {
        const nextStreak = streak + 1;
        setStreak(nextStreak);
        setBestStreak((prev) => Math.max(prev, nextStreak));
        setRoundsCompleted((prev) => prev + 1);
        setGameState('round-success');

        sound.playRoundSuccess();
        triggerConfetti();

        const nextLevel = level >= totalLevelsInSet ? 1 : level + 1;
        setLevel(nextLevel);
        if (onLevelComplete) onLevelComplete(nextLevel, newScore);

        nextRoundTimeoutRef.current = window.setTimeout(() => {
          startRound(nextLevel, gameMode);
        }, 1200);
      }
    } else {
      setWrongTargetIds((prev) => [...prev, item.id]);
      setTotalMistakeClicks((prev) => prev + 1);
      sound.playWrongBulb();
      setStreak(0);

      setGridItems((prev) =>
        prev.map((b) => (b.id === item.id ? { ...b, isWrongGuess: true } : b))
      );

      if (settings.allowMistakes < 99) {
        const newLives = lives - 1;
        setLives(newLives);
        if (newLives <= 0) {
          handleGameOver();
        }
      }
    }
  };

  const handleToggleSound = () => {
    const nextMuted = !soundMuted;
    setSoundMuted(nextMuted);
    sound.setMuted(nextMuted);
  };

  const handleToggleMusic = () => {
    const isNowPlaying = sound.toggleAmbientMusic();
    setMusicPlaying(isNowPlaying);
  };

  const handleTogglePause = () => {
    setIsPaused((prev) => !prev);
  };

  const handleUpdateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      if (newSettings.soundVolume !== undefined) {
        sound.setSfxVolume(newSettings.soundVolume);
      }
      if (newSettings.musicVolume !== undefined) {
        sound.setMusicVolume(newSettings.musicVolume);
      }
      return updated;
    });
  };

  const currentTotalTargets = gridItems.filter((b) => b.isTarget).length || settings.targetsCount;

  const getGridColsClass = () => {
    const cols = gridItems.length > 0 ? Math.max(...gridItems.map((b) => b.col)) + 1 : settings.gridCols;
    if (cols === 2) return 'grid-cols-2';
    if (cols === 3) return 'grid-cols-3';
    if (cols === 4) return 'grid-cols-4';
    return 'grid-cols-2';
  };

  return (
    <div className={`w-full max-w-md mx-auto flex flex-col items-center select-none ${className}`}>
      {/* Mobile Screen Shell matching reference screenshot design */}
      <div className="w-full rounded-[36px] bg-gradient-to-b from-[#104e63] via-[#0a3546] to-[#062431] border-2 border-[#185d75]/60 shadow-[0_20px_60px_rgba(3,18,26,0.8)] p-4 sm:p-6 relative overflow-hidden flex flex-col items-center">
        
        {/* Subtle Ambient Background Bokeh & Floating Dots (from reference) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 -left-8 w-24 h-24 rounded-full bg-[#1b7392]/20 blur-2xl" />
          <div className="absolute top-1/2 -right-8 w-32 h-32 rounded-full bg-[#175f78]/25 blur-3xl" />
          <div className="absolute bottom-10 left-10 w-20 h-20 rounded-full bg-[#114b60]/30 blur-xl" />
          
          {/* Subtle decorative floating dots */}
          <div className="absolute top-28 left-8 w-2 h-2 rounded-full bg-[#4188a0]/40" />
          <div className="absolute top-36 right-6 w-3 h-3 rounded-full bg-[#4188a0]/30" />
          <div className="absolute top-24 right-16 w-1.5 h-1.5 rounded-full bg-[#4188a0]/50" />
          <div className="absolute bottom-32 left-6 w-2.5 h-2.5 rounded-full bg-[#4188a0]/35" />
          <div className="absolute bottom-20 right-10 w-2 h-2 rounded-full bg-[#4188a0]/40" />
        </div>

        {/* Top HUD: [ || ] [ 1/5     0 ] [ SFX/Help ] */}
        <div className="w-full relative z-20 mb-4">
          <GameHUD
            score={score}
            highScore={highScore}
            level={level}
            totalLevelsInSet={totalLevelsInSet}
            streak={streak}
            lives={lives}
            maxLives={settings.allowMistakes === 99 ? 3 : settings.allowMistakes}
            targetsFound={foundTargetIds.length}
            totalTargets={currentTotalTargets}
            gameState={gameState}
            gameMode={gameMode}
            isPaused={isPaused}
            timeLeft={gameMode === 'rush' ? rushTimeLeft : undefined}
            soundMuted={soundMuted}
            musicPlaying={musicPlaying}
            onTogglePause={handleTogglePause}
            onToggleSound={handleToggleSound}
            onToggleMusic={handleToggleMusic}
            onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onRestartRound={() => startRound(level, gameMode)}
          />
        </div>

        {/* Instructional Header matching screenshot: "Replicate the memorized sequence" */}
        <div className="w-full flex flex-col items-center justify-center my-3 relative z-10 min-h-[46px]">
          {gameState === 'memorizing' ? (
            <div className="flex flex-col items-center">
              {/* Row of decorative cyan dots */}
              <div className="flex items-center gap-2 mb-1.5 opacity-60">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6db3c7]" />
                <span className="w-2 h-2 rounded-full bg-[#8ec8d8]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#b4e0ec] animate-ping" />
                <span className="w-2 h-2 rounded-full bg-[#8ec8d8]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#6db3c7]" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight drop-shadow text-center">
                Memorize the {currentTotalTargets} lit bulbs ({countdownLeft.toFixed(1)}s)
              </h2>
            </div>
          ) : gameState === 'recalling' ? (
            <div className="flex flex-col items-center">
              {/* Row of decorative cyan dots */}
              <div className="flex items-center gap-2 mb-1.5 opacity-60">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6db3c7]" />
                <span className="w-2 h-2 rounded-full bg-[#8ec8d8]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#b4e0ec]" />
                <span className="w-2 h-2 rounded-full bg-[#8ec8d8]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#6db3c7]" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight drop-shadow text-center">
                Replicate the memorized sequence
              </h2>
            </div>
          ) : gameState === 'round-success' ? (
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-base sm:text-lg drop-shadow">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>Perfect Recall!</span>
            </div>
          ) : (
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight drop-shadow text-center">
              Remember the Bulbs
            </h2>
          )}
        </div>

        {/* Main Interactive Grid Stage */}
        <div className="w-full relative z-10 flex flex-col items-center justify-center my-1">
          {gameState !== 'idle' ? (
            <div
              className={`w-full max-w-sm grid ${getGridColsClass()} gap-2.5 sm:gap-3 bg-[#082937]/90 p-2.5 sm:p-3 rounded-2xl border-2 border-[#134d61]/70 shadow-2xl relative overflow-hidden`}
            >
              {/* Subtle inner grid glow */}
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_40%,rgba(20,95,120,0.15),transparent_70%)]" />

              {gridItems.map((item) => {
                const order =
                  item.isFound ? foundTargetIds.indexOf(item.id) + 1 : undefined;

                return (
                  <div
                    key={item.id}
                    className="aspect-[4/5] rounded-xl overflow-hidden border border-[#144f64]/50 shadow-inner"
                  >
                    <LightBulb
                      item={item}
                      isMemorizing={gameState === 'memorizing'}
                      isRecalling={gameState === 'recalling' && !isPaused}
                      disabled={gameState !== 'recalling' || isPaused}
                      orderNumber={order}
                      showSolution={gameState === 'game-over'}
                      onClick={handleBulbClick}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            /* Start Menu Hero Screen */
            <div className="w-full max-w-sm flex flex-col items-center text-center py-6 px-4 bg-[#082937]/80 rounded-2xl border border-[#134d61]/70 shadow-2xl">
              {/* Big Teardrop Bulb Graphic Preview */}
              <div className="relative w-24 h-32 mb-4 flex items-center justify-center">
                <svg viewBox="0 0 100 140" className="w-full h-full drop-shadow-xl">
                  <defs>
                    <radialGradient id="hero-bulb-glow" cx="45%" cy="50%" r="55%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="25%" stopColor="#fef08a" />
                      <stop offset="60%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#d97706" />
                    </radialGradient>
                    <linearGradient id="hero-socket" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#597d8b" />
                      <stop offset="50%" stopColor="#7a9ea9" />
                      <stop offset="100%" stopColor="#4a6975" />
                    </linearGradient>
                  </defs>
                  {/* Socket */}
                  <path d="M 36 10 L 64 10 L 64 26 L 36 26 Z" fill="url(#hero-socket)" stroke="#2d4954" strokeWidth="1.5" />
                  <path d="M 33 26 L 67 26 L 67 38 L 33 38 Z" fill="url(#hero-socket)" stroke="#2d4954" strokeWidth="1.5" />
                  {/* Glass */}
                  <path
                    d="M 33 38 C 22 55, 14 75, 18 95 C 22 114, 38 128, 50 134 C 62 128, 78 114, 82 95 C 86 75, 78 55, 67 38 Z"
                    fill="url(#hero-bulb-glow)"
                    stroke="#fde047"
                    strokeWidth="2"
                  />
                  {/* Highlight */}
                  <path d="M 28 55 C 22 70, 24 90, 34 110" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" opacity="0.9" />
                  {/* Filament */}
                  <circle cx="50" cy="85" r="8" fill="#ffffff" opacity="0.9" />
                </svg>
                <div className="absolute inset-0 bg-amber-400/25 blur-xl -z-10 rounded-full animate-pulse" />
              </div>

              <p className="text-xs sm:text-sm text-[#8ec8d8] mb-5 leading-relaxed">
                Watch the 3 lit bulbs, memorize their locations, and replicate the sequence once they go dark.
              </p>

              {/* Game Mode Picker */}
              <div className="grid grid-cols-2 gap-2 w-full mb-5">
                {[
                  { id: 'classic', label: 'Classic (2×3)', desc: '3 Bulbs, 6 Tiles' },
                  { id: 'progressive', label: 'Progressive', desc: '5 Round Journey' },
                  { id: 'rush', label: 'Rush Mode', desc: '60s Time Trial' },
                  { id: 'practice', label: 'Custom Grid', desc: 'Adjust Settings' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setGameMode(m.id as GameMode)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      gameMode === m.id
                        ? 'bg-amber-400/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/10'
                        : 'bg-[#05202b] border-[#103d4e] text-[#8ec8d8] hover:bg-[#0c394a]'
                    }`}
                  >
                    <div className="text-xs font-bold">{m.label}</div>
                    <div className="text-[10px] text-[#5e8b99]">{m.desc}</div>
                  </button>
                ))}
              </div>

              {/* Start Button */}
              <button
                id="btn-start-game-main"
                type="button"
                onClick={() => startFullGame(gameMode)}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-[#062330] font-black text-base transition-all shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Play className="w-5 h-5 fill-[#062330] text-[#062330]" />
                Start Game
              </button>
            </div>
          )}
        </div>

        {/* Bottom Game Toolbar (Settings, Rules, Restart) */}
        {gameState !== 'idle' && (
          <div className="w-full flex items-center justify-between pt-3 mt-2 border-t border-[#124254] text-xs text-[#8ec8d8] relative z-10">
            <div className="flex items-center gap-2">
              <button
                id="btn-settings-open"
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-[#0c394a] hover:text-white transition-colors"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Settings</span>
              </button>
              <button
                id="btn-howto-open"
                type="button"
                onClick={() => setIsHowToPlayOpen(true)}
                className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-[#0c394a] hover:text-white transition-colors"
              >
                <span>Rules</span>
              </button>
            </div>

            <button
              id="btn-reset-new-game"
              type="button"
              onClick={() => setGameState('idle')}
              className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-[#0c394a] hover:text-amber-300 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Menu</span>
            </button>
          </div>
        )}

        {/* In-Game Pause Overlay */}
        {isPaused && gameState !== 'idle' && (
          <div className="absolute inset-0 z-30 bg-[#041a24]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-[#e2f1f8]">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center mb-3 border border-amber-400/30 shadow-lg shadow-amber-500/15">
              <Play className="w-6 h-6 fill-current ml-0.5" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Game Paused</h3>
            <p className="text-xs text-[#8ec8d8] mb-6">Take a breather and resume when ready.</p>

            <div className="w-full max-w-xs space-y-2.5">
              <button
                type="button"
                onClick={() => setIsPaused(false)}
                className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#062330] font-bold text-sm shadow-lg shadow-amber-500/20 transition-all"
              >
                Resume Game
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPaused(false);
                  startRound(level, gameMode);
                }}
                className="w-full py-2.5 rounded-xl bg-[#093242] hover:bg-[#0d4054] text-[#8ec8d8] hover:text-white border border-[#144d62] text-xs font-semibold transition-all"
              >
                Restart Round
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPaused(false);
                  setGameState('idle');
                }}
                className="w-full py-2.5 rounded-xl bg-[#05202b] hover:bg-[#082b39] text-[#5e8b99] hover:text-[#8ec8d8] text-xs transition-all"
              >
                Exit to Main Menu
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <HowToPlayModal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateSettings={handleUpdateSettings}
      />

      <GameOverModal
        isOpen={isGameOverOpen}
        stats={{
          score,
          highScore: Math.max(score, highScore),
          level,
          streak,
          bestStreak,
          roundsCompleted,
          totalCorrect: totalCorrectClicks,
          totalMistakes: totalMistakeClicks,
          accuracy:
            totalCorrectClicks + totalMistakeClicks > 0
              ? (totalCorrectClicks / (totalCorrectClicks + totalMistakeClicks)) * 100
              : 100,
          timeLeft: gameMode === 'rush' ? rushTimeLeft : undefined,
        }}
        gameMode={gameMode}
        onRestart={() => startFullGame(gameMode)}
        onChangeMode={(m) => {
          setGameMode(m);
          startFullGame(m);
        }}
      />
    </div>
  );
};
