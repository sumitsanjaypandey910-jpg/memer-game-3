import React from 'react';
import { Pause, Play, HelpCircle, Volume2, VolumeX, Music, RotateCcw, Sliders } from 'lucide-react';
import { GameMode, GameState } from '../types/game';

interface GameHUDProps {
  score: number;
  highScore: number;
  level: number;
  totalLevelsInSet?: number;
  streak: number;
  lives: number;
  maxLives: number;
  targetsFound: number;
  totalTargets: number;
  gameState: GameState;
  gameMode: GameMode;
  isPaused: boolean;
  timeLeft?: number;
  soundMuted: boolean;
  musicPlaying: boolean;
  onTogglePause: () => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onOpenHowToPlay: () => void;
  onOpenSettings: () => void;
  onRestartRound: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  score,
  level,
  totalLevelsInSet = 5,
  targetsFound,
  totalTargets,
  gameState,
  isPaused,
  soundMuted,
  musicPlaying,
  onTogglePause,
  onToggleSound,
  onToggleMusic,
  onOpenHowToPlay,
  onOpenSettings,
  onRestartRound,
}) => {
  return (
    <header className="w-full flex flex-col items-center">
      {/* Top Mobile Bar matching screenshot: [ || ] [  1/5       0  ] [ ? ] */}
      <div className="w-full flex items-center justify-between gap-2 sm:gap-3">
        {/* Left: Pause / Play Button */}
        <button
          id="hud-btn-pause"
          type="button"
          onClick={onTogglePause}
          title={isPaused ? 'Resume' : 'Pause'}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#05212c]/90 hover:bg-[#093242] border border-[#14495c]/60 flex items-center justify-center text-[#8ec8d8] hover:text-white transition-all shadow-md active:scale-95"
        >
          {isPaused ? (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          ) : (
            <Pause className="w-5 h-5 fill-current" />
          )}
        </button>

        {/* Center Pill: Round / Level on Left, Score on Right */}
        <div className="flex-1 max-w-sm h-11 sm:h-12 rounded-full bg-[#05212c]/95 border border-[#14495c]/60 px-5 flex items-center justify-between text-[#8ec8d8] shadow-inner">
          {/* Round Indicator e.g. 1/5 */}
          <div className="flex items-center gap-1.5 font-bold text-sm sm:text-base tracking-wide text-[#b4e0ec]">
            <span className="font-mono text-white">{level}</span>
            <span className="text-[#598492]">/</span>
            <span className="text-[#598492] font-mono">{totalLevelsInSet}</span>
          </div>

          {/* Target Progress Dots */}
          <div className="flex items-center gap-1">
            {Array.from({ length: totalTargets }).map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i < targetsFound
                    ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                    : 'bg-[#184656]'
                }`}
              />
            ))}
          </div>

          {/* Score */}
          <div className="font-extrabold text-base sm:text-lg text-white font-mono tracking-tight">
            {score}
          </div>
        </div>

        {/* Right: Quick Action Group (Help, Sound, Settings) */}
        <div className="flex items-center gap-1.5">
          {/* Sound FX Toggle */}
          <button
            id="hud-btn-sound"
            type="button"
            onClick={onToggleSound}
            title={soundMuted ? 'Unmute SFX' : 'Mute SFX'}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#05212c]/90 hover:bg-[#093242] border border-[#14495c]/60 flex items-center justify-center text-[#8ec8d8] hover:text-white transition-all shadow-md active:scale-95"
          >
            {soundMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          {/* Ambient Music Toggle */}
          <button
            id="hud-btn-music"
            type="button"
            onClick={onToggleMusic}
            title={musicPlaying ? 'Pause Ambient Synth' : 'Play Ambient Synth'}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full border flex items-center justify-center transition-all shadow-md active:scale-95 ${
              musicPlaying
                ? 'bg-amber-500/20 border-amber-400/50 text-amber-300 animate-pulse'
                : 'bg-[#05212c]/90 hover:bg-[#093242] border-[#14495c]/60 text-[#8ec8d8] hover:text-white'
            }`}
          >
            <Music className="w-4 h-4" />
          </button>

          {/* Help Button ? */}
          <button
            id="hud-btn-help"
            type="button"
            onClick={onOpenHowToPlay}
            title="Help / Rules"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#05212c]/90 hover:bg-[#093242] border border-[#14495c]/60 flex items-center justify-center text-[#8ec8d8] hover:text-white transition-all shadow-md active:scale-95"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
