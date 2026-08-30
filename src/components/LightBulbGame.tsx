import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Play, Sparkles, Sliders, RefreshCw, Zap } from 'lucide-react';
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

const HIGH_SCORE_KEY = 'bulb_memory_highscore_v1';

export const LightBulbGame: React.FC<LightBulbGameProps> = ({
  initialMode = 'classic',
  targetCount = 3,
  gridSize = { rows: 3, cols: 3 },
  memorizeSeconds = 3,
  onGameOver,
  onScoreChange,
  onLevelComplete,
  className = '',
  standalone = true,
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
  const [gridItems, setGridItems] = useState<BulbItem[]>([]);
  const [foundTargetIds, setFoundTargetIds] = useState<number[]>([]);
  const [wrongTargetIds, setWrongTargetIds] = useState<number[]>([]);

  // Scores and Progress
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
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);

  // Statistics
  const [roundsCompleted, setRoundsCompleted] = useState<number>(0);
  const [totalCorrectClicks, setTotalCorrectClicks] = useState<number>(0);
  const [totalMistakeClicks, setTotalMistakeClicks] = useState<number>(0);

  // Timer & Countdown
  const [countdownLeft, setCountdownLeft] = useState<number>(settings.memorizeDurationSeconds);
  const [rushTimeLeft, setRushTimeLeft] = useState<number>(60);

  // Audio UI states
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [musicPlaying, setMusicPlaying] = useState<boolean>(false);

  // Modals
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isGameOverOpen, setIsGameOverOpen] = useState<boolean>(false);

  // Refs for intervals & timeouts
  const countdownIntervalRef = useRef<number | null>(null);
  const rushTimerRef = useRef<number | null>(null);
  const nextRoundTimeoutRef = useRef<number | null>(null);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (rushTimerRef.current) clearInterval(rushTimerRef.current);
      if (nextRoundTimeoutRef.current) clearTimeout(nextRoundTimeoutRef.current);
    };
  }, []);

  // Update High Score helper
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

  // Generate grid and choose random target bulbs
  const createNewRoundGrid = useCallback(
    (rows: number, cols: number, count: number) => {
      const totalBulbs = rows * cols;
      const targetCountClamped = Math.min(Math.max(1, count), totalBulbs);

      // Pick random unique indices
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
    },
    []
  );

  // Start a fresh round
  const startRound = useCallback(
    (currentLevel = level, currentMode = gameMode) => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (nextRoundTimeoutRef.current) clearTimeout(nextRoundTimeoutRef.current);

      let rows = settings.gridRows;
      let cols = settings.gridCols;
      let targets = settings.targetsCount;
      let memorizeSec = settings.memorizeDurationSeconds;

      // Progressive Mode scaling
      if (currentMode === 'progressive') {
        if (currentLevel === 1) {
          rows = 3;
          cols = 3;
          targets = 3;
          memorizeSec = 3.0;
        } else if (currentLevel === 2) {
          rows = 3;
          cols = 3;
          targets = 3;
          memorizeSec = 2.5;
        } else if (currentLevel === 3) {
          rows = 3;
          cols = 4;
          targets = 3;
          memorizeSec = 2.5;
        } else if (currentLevel === 4) {
          rows = 3;
          cols = 4;
          targets = 4;
          memorizeSec = 2.5;
        } else if (currentLevel >= 5 && currentLevel <= 7) {
          rows = 4;
          cols = 4;
          targets = 4;
          memorizeSec = 2.0;
        } else if (currentLevel >= 8) {
          rows = 4;
          cols = 4;
          targets = 5;
          memorizeSec = 2.0;
        }
      } else if (currentMode === 'rush') {
        rows = 3;
        cols = 3;
        targets = 3;
        memorizeSec = 2.0;
      }

      const items = createNewRoundGrid(rows, cols, targets);
      setGridItems(items);
      setFoundTargetIds([]);
      setWrongTargetIds([]);
      setCountdownLeft(memorizeSec);
      setGameState('memorizing');

      // Play bulb light up chime
      sound.playBulbLightUp();

      // Countdown loop
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

  // Start Full Game
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

  // Trigger Victory Confetti
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f59e0b', '#fb7185', '#38bdf8', '#34d399'],
      });
    } catch {
      // ignore in environments without canvas
    }
  };

  // Handle Game Over
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
    if (gameState !== 'recalling' || item.isFound || item.isWrongGuess) return;

    if (item.isTarget) {
      // Correct Match!
      const newFound = [...foundTargetIds, item.id];
      setFoundTargetIds(newFound);
      setTotalCorrectClicks((prev) => prev + 1);

      // Audio feedback with ascending tone
      sound.playCorrectBulb(newFound.length);

      // Points calculation
      const currentStreakBonus = streak * 20;
      const pointsEarned = 100 + currentStreakBonus;
      const newScore = score + pointsEarned;
      setScore(newScore);
      updateHighScore(newScore);
      if (onScoreChange) onScoreChange(newScore);

      // Update grid item state
      setGridItems((prev) =>
        prev.map((b) => (b.id === item.id ? { ...b, isFound: true } : b))
      );

      // Check if all targets are found in this round
      const totalTargets = gridItems.filter((b) => b.isTarget).length;
      if (newFound.length >= totalTargets) {
        // Round Clear!
        const nextStreak = streak + 1;
        setStreak(nextStreak);
        setBestStreak((prev) => Math.max(prev, nextStreak));
        setRoundsCompleted((prev) => prev + 1);
        setGameState('round-success');

        sound.playRoundSuccess();
        triggerConfetti();

        if (nextStreak > 0 && nextStreak % 3 === 0) {
          sound.playStreakBonus();
        }

        const nextLevel = level + 1;
        setLevel(nextLevel);
        if (onLevelComplete) onLevelComplete(nextLevel, newScore);

        // Next round after brief celebration
        nextRoundTimeoutRef.current = window.setTimeout(() => {
          startRound(nextLevel, gameMode);
        }, 1300);
      }
    } else {
      // Wrong Guess!
      setWrongTargetIds((prev) => [...prev, item.id]);
      setTotalMistakeClicks((prev) => prev + 1);
      sound.playWrongBulb();
      setStreak(0); // reset streak

      // Mark bulb as wrong
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

  // Toggle Sound FX
  const handleToggleSound = () => {
    const nextMuted = !soundMuted;
    setSoundMuted(nextMuted);
    sound.setMuted(nextMuted);
  };

  // Toggle Ambient Music
  const handleToggleMusic = () => {
    const isNowPlaying = sound.toggleAmbientMusic();
    setMusicPlaying(isNowPlaying);
  };

  // Update Settings
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

  // Total targets in active grid
  const currentTotalTargets = gridItems.filter((b) => b.isTarget).length || settings.targetsCount;

  // Grid columns styling helper
  const getGridColsClass = () => {
    const cols = gridItems.length > 0 ? Math.max(...gridItems.map((b) => b.col)) + 1 : settings.gridCols;
    if (cols === 3) return 'grid-cols-3';
    if (cols === 4) return 'grid-cols-4';
    if (cols === 5) return 'grid-cols-5';
    return 'grid-cols-3';
  };

  return (
    <div
      className={`w-full max-w-2xl mx-auto flex flex-col items-center select-none ${className}`}
    >
      {/* Game HUD (Score, Level, Lives, Targets, Sound controls) */}
      <GameHUD
        score={score}
        highScore={highScore}
        level={level}
        streak={streak}
        lives={lives}
        maxLives={settings.allowMistakes === 99 ? 3 : settings.allowMistakes}
        targetsFound={foundTargetIds.length}
        totalTargets={currentTotalTargets}
        gameState={gameState}
        gameMode={gameMode}
        timeLeft={gameMode === 'rush' ? rushTimeLeft : undefined}
        soundMuted={soundMuted}
        musicPlaying={musicPlaying}
        onToggleSound={handleToggleSound}
        onToggleMusic={handleToggleMusic}
        onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
        onRestartRound={() => startRound(level, gameMode)}
      />

      {/* Main Board Stage Card */}
      <main className="w-full mt-4 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-4 sm:p-7 shadow-2xl relative overflow-hidden flex flex-col items-center">
        {/* Atmospheric ambient top light bar */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

        {/* Phase Notification Banner */}
        <div className="w-full flex items-center justify-between min-h-[44px] mb-4 px-2">
          {gameState === 'memorizing' ? (
            <div className="w-full flex flex-col items-center">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm tracking-wide animate-pulse">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Memorize the 3 Lit Light Bulbs! ({countdownLeft.toFixed(1)}s)</span>
              </div>
              {/* Progress countdown bar */}
              <div className="w-full max-w-xs h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden border border-slate-700/50">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500"
                  style={{
                    width: `${Math.max(
                      0,
                      (countdownLeft / settings.memorizeDurationSeconds) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          ) : gameState === 'recalling' ? (
            <div className="w-full flex items-center justify-between">
              <span className="text-xs sm:text-sm font-semibold text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                Tap the {currentTotalTargets} bulbs that were glowing:
              </span>
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                {foundTargetIds.length} / {currentTotalTargets} Found
              </span>
            </div>
          ) : gameState === 'round-success' ? (
            <div className="w-full text-center">
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-emerald-400 font-bold text-sm sm:text-base flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
                Round Cleared! Perfect Recall!
              </motion.span>
            </div>
          ) : (
            <div className="w-full text-center text-xs sm:text-sm text-slate-400">
              Select your mode and press <strong className="text-amber-400">Start Game</strong> to test your memory.
            </div>
          )}
        </div>

        {/* Light Bulbs Grid */}
        {gameState !== 'idle' ? (
          <div
            className={`grid ${getGridColsClass()} gap-3 sm:gap-4 p-2 sm:p-4 w-full max-w-lg justify-items-center`}
          >
            {gridItems.map((item) => {
              const order =
                item.isFound ? foundTargetIds.indexOf(item.id) + 1 : undefined;

              return (
                <LightBulb
                  key={item.id}
                  item={item}
                  isMemorizing={gameState === 'memorizing'}
                  isRecalling={gameState === 'recalling'}
                  disabled={gameState !== 'recalling'}
                  orderNumber={order}
                  showSolution={gameState === 'game-over'}
                  onClick={handleBulbClick}
                />
              );
            })}
          </div>
        ) : (
          /* Start Screen Hero / Teaser Preview */
          <div className="py-8 px-4 flex flex-col items-center text-center max-w-md">
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-3xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.25)]">
                <svg viewBox="0 0 100 130" className="w-16 h-16 drop-shadow-lg">
                  <path
                    d="M 50 10 C 26 10, 15 28, 15 48 C 15 62, 28 74, 34 88 L 66 88 C 72 74, 85 62, 85 48 C 85 28, 74 10, 50 10 Z"
                    fill="#fef08a"
                    stroke="#f59e0b"
                    strokeWidth="3"
                  />
                  <path
                    d="M 42 48 Q 46 34, 50 48 Q 54 34, 58 48"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <rect x="34" y="88" width="32" height="6" rx="2" fill="#64748b" />
                  <rect x="36" y="94" width="28" height="6" rx="2" fill="#475569" />
                  <rect x="38" y="100" width="24" height="6" rx="2" fill="#334155" />
                </svg>
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.9, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 bg-amber-400/20 rounded-3xl blur-xl -z-10"
              />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Remember the Bulbs
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              3 light bulbs will illuminate for a few seconds and disappear. Can you remember exactly where they were?
            </p>

            {/* Mode selection pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full mt-6 mb-6">
              {[
                { id: 'classic', label: 'Classic', desc: '3 Bulbs, 3x3' },
                { id: 'progressive', label: 'Journey', desc: 'Level by Level' },
                { id: 'rush', label: 'Rush', desc: '60s Speedrun' },
                { id: 'practice', label: 'Practice', desc: 'Customizable' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setGameMode(m.id as GameMode)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    gameMode === m.id
                      ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold">{m.label}</div>
                  <div className="text-[10px] text-slate-500">{m.desc}</div>
                </button>
              ))}
            </div>

            {/* Big Start Game Button */}
            <button
              id="btn-start-game-main"
              type="button"
              onClick={() => startFullGame(gameMode)}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-lg transition-all shadow-xl shadow-amber-500/25 flex items-center justify-center gap-3 cursor-pointer group"
            >
              <Play className="w-5 h-5 fill-slate-950 text-slate-950 transition-transform group-hover:scale-110" />
              Start Game
            </button>
          </div>
        )}

        {/* Bottom Game Toolbar (Settings & Mode change when in game) */}
        {gameState !== 'idle' && (
          <div className="w-full flex items-center justify-between pt-4 mt-3 border-t border-slate-800/60 text-xs">
            <div className="flex items-center gap-2">
              <button
                id="btn-settings-open"
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Settings</span>
              </button>
              <button
                id="btn-howto-open"
                type="button"
                onClick={() => setIsHowToPlayOpen(true)}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <span>Rules</span>
              </button>
            </div>

            <button
              id="btn-reset-new-game"
              type="button"
              onClick={() => setGameState('idle')}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Main Menu</span>
            </button>
          </div>
        )}
      </main>

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
