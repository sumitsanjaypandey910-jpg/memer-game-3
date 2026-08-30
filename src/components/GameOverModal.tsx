import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Award, Flame, Target, CheckCircle2, Play } from 'lucide-react';
import { GameStats, GameMode } from '../types/game';

interface GameOverModalProps {
  isOpen: boolean;
  stats: GameStats;
  gameMode: GameMode;
  onRestart: () => void;
  onChangeMode: (mode: GameMode) => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  stats,
  gameMode,
  onRestart,
  onChangeMode,
}) => {
  if (!isOpen) return null;

  const isNewHighScore = stats.score > 0 && stats.score >= stats.highScore;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden relative text-center"
        >
          {/* Top Graphic */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-lg shadow-amber-500/10">
            {isNewHighScore ? (
              <Award className="w-8 h-8 text-amber-400 animate-bounce" />
            ) : (
              <RotateCcw className="w-8 h-8 text-slate-300" />
            )}
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight">
            {isNewHighScore ? 'New High Score!' : 'Game Over'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isNewHighScore
              ? 'Outstanding focus and memory!'
              : 'Good effort! Practice makes your memory razor sharp.'}
          </p>

          {/* Big Score Box */}
          <div className="my-5 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Final Score</span>
            <div className="text-4xl sm:text-5xl font-black text-amber-400 font-mono mt-1">
              {stats.score}
            </div>
            <div className="text-xs text-slate-500 font-mono mt-1">
              Best Score: {Math.max(stats.score, stats.highScore)}
            </div>
          </div>

          {/* Stats Breakdown */}
          <div className="grid grid-cols-3 gap-2.5 mb-6 text-left">
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
              <div className="flex items-center gap-1 text-slate-400 text-[10px] uppercase font-bold">
                <Target className="w-3 h-3 text-sky-400" />
                <span>Rounds</span>
              </div>
              <div className="text-base font-bold text-white font-mono mt-1">{stats.roundsCompleted}</div>
            </div>

            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
              <div className="flex items-center gap-1 text-slate-400 text-[10px] uppercase font-bold">
                <Flame className="w-3 h-3 text-amber-400" />
                <span>Max Streak</span>
              </div>
              <div className="text-base font-bold text-white font-mono mt-1">{stats.bestStreak}x</div>
            </div>

            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
              <div className="flex items-center gap-1 text-slate-400 text-[10px] uppercase font-bold">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Accuracy</span>
              </div>
              <div className="text-base font-bold text-white font-mono mt-1">
                {stats.accuracy.toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            <button
              id="gameover-btn-play-again"
              type="button"
              onClick={onRestart}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-base transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-slate-950 text-slate-950" />
              Play Again
            </button>

            {/* Change Mode Buttons */}
            <div className="flex items-center justify-center gap-2 pt-2">
              {(['classic', 'progressive', 'rush', 'practice'] as GameMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onChangeMode(mode)}
                  className={`text-xs font-semibold capitalize px-3 py-1.5 rounded-lg border transition-colors ${
                    gameMode === mode
                      ? 'bg-slate-800 text-amber-300 border-amber-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
