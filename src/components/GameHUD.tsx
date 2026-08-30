import React from 'react';
import { motion } from 'motion/react';
import { Volume2, VolumeX, Music, Flame, Heart, HelpCircle, RotateCcw } from 'lucide-react';
import { GameMode, GameState } from '../types/game';

interface GameHUDProps {
  score: number;
  highScore: number;
  level: number;
  streak: number;
  lives: number;
  maxLives: number;
  targetsFound: number;
  totalTargets: number;
  gameState: GameState;
  gameMode: GameMode;
  timeLeft?: number;
  soundMuted: boolean;
  musicPlaying: boolean;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onOpenHowToPlay: () => void;
  onRestartRound: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  score,
  highScore,
  level,
  streak,
  lives,
  maxLives,
  targetsFound,
  totalTargets,
  gameState,
  gameMode,
  timeLeft,
  soundMuted,
  musicPlaying,
  onToggleSound,
  onToggleMusic,
  onOpenHowToPlay,
  onRestartRound,
}) => {
  return (
    <header className="w-full bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xl">
      {/* Top Bar: Game Title, Mode, Controls */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-slate-950 stroke-[2.5]" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.2" />
            </svg>
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Light Bulb Memory
              <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                {gameMode}
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              {gameState === 'memorizing'
                ? 'Memorize the lit bulbs!'
                : gameState === 'recalling'
                ? `Locate the ${totalTargets} lit bulbs`
                : gameState === 'round-success'
                ? 'Great memory!'
                : 'Ready to test your focus?'}
            </p>
          </div>
        </div>

        {/* Quick Audio & Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Restart Round */}
          <button
            id="hud-btn-restart"
            type="button"
            onClick={onRestartRound}
            title="Restart round"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Sound FX Toggle */}
          <button
            id="hud-btn-sound"
            type="button"
            onClick={onToggleSound}
            title={soundMuted ? 'Unmute Sound' : 'Mute Sound'}
            className={`p-2 rounded-xl transition-colors ${
              soundMuted
                ? 'text-rose-400 bg-rose-500/10 hover:bg-rose-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Ambient Music Toggle */}
          <button
            id="hud-btn-music"
            type="button"
            onClick={onToggleMusic}
            title={musicPlaying ? 'Pause Ambient Music' : 'Play Ambient Music'}
            className={`p-2 rounded-xl transition-colors ${
              musicPlaying
                ? 'text-amber-400 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 animate-pulse'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Music className="w-4 h-4" />
          </button>

          {/* How To Play */}
          <button
            id="hud-btn-help"
            type="button"
            onClick={onOpenHowToPlay}
            title="How to play"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-3.5">
        {/* Score & High Score */}
        <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Score</span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-xl sm:text-2xl font-extrabold text-white font-mono">{score}</span>
            <span className="text-[11px] text-slate-500 font-mono">Best {highScore}</span>
          </div>
        </div>

        {/* Level / Round & Rush Timer */}
        <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            {gameMode === 'rush' ? 'Time Remaining' : 'Level'}
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            {gameMode === 'rush' && timeLeft !== undefined ? (
              <span className={`text-xl sm:text-2xl font-extrabold font-mono ${
                timeLeft <= 10 ? 'text-rose-400 animate-pulse' : 'text-amber-300'
              }`}>
                {timeLeft}s
              </span>
            ) : (
              <span className="text-xl sm:text-2xl font-extrabold text-white font-mono">
                {level}
              </span>
            )}
            {streak > 1 && (
              <div className="flex items-center gap-0.5 text-amber-400 text-xs font-bold">
                <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{streak}x</span>
              </div>
            )}
          </div>
        </div>

        {/* Targets Found Status */}
        <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Bulbs ({targetsFound}/{totalTargets})
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            {Array.from({ length: totalTargets }).map((_, i) => (
              <motion.div
                key={i}
                initial={false}
                animate={i < targetsFound ? { scale: [1, 1.25, 1] } : {}}
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  i < targetsFound
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                    : 'bg-slate-800 text-slate-500 border border-slate-700/50'
                }`}
              >
                💡
              </motion.div>
            ))}
          </div>
        </div>

        {/* Lives / Attempts Remaining */}
        <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Lives</span>
          <div className="flex items-center gap-1.5 mt-1">
            {Array.from({ length: maxLives }).map((_, i) => {
              const active = i < lives;
              return (
                <Heart
                  key={i}
                  className={`w-5 h-5 transition-all duration-300 ${
                    active
                      ? 'text-rose-500 fill-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]'
                      : 'text-slate-700 stroke-slate-600'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
