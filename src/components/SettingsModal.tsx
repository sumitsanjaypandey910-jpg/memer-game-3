import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sliders, Volume2, Music, Grid3X3, Timer, Heart } from 'lucide-react';
import { GameSettings } from '../types/game';

interface SettingsModalProps {
  isOpen: boolean;
  settings: GameSettings;
  onClose: () => void;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onClose,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Sliders className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-white">Game Settings</h2>
            </div>
            <button
              id="modal-close-settings"
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {/* Grid Size Selector */}
            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Grid3X3 className="w-4 h-4 text-amber-400" />
                  <span>Grid Size</span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400">
                  {settings.gridRows} × {settings.gridCols} ({settings.gridRows * settings.gridCols} Bulbs)
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { rows: 3, cols: 3, label: '3×3 (9)' },
                  { rows: 3, cols: 4, label: '3×4 (12)' },
                  { rows: 4, cols: 4, label: '4×4 (16)' },
                  { rows: 4, cols: 5, label: '4×5 (20)' },
                ].map((preset) => (
                  <button
                    key={`${preset.rows}-${preset.cols}`}
                    type="button"
                    onClick={() =>
                      onUpdateSettings({ gridRows: preset.rows, gridCols: preset.cols })
                    }
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-colors ${
                      settings.gridRows === preset.rows && settings.gridCols === preset.cols
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Bulbs Count */}
            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <span className="text-amber-400 text-base">💡</span>
                  <span>Lit Bulbs to Remember</span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400">
                  {settings.targetsCount} Bulbs
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[3, 4, 5, 6].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => onUpdateSettings({ targetsCount: count })}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-colors ${
                      settings.targetsCount === count
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {count} Bulbs
                  </button>
                ))}
              </div>
            </div>

            {/* Memorize Duration */}
            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Timer className="w-4 h-4 text-sky-400" />
                  <span>Memorization Time</span>
                </div>
                <span className="text-xs font-mono font-bold text-sky-400">
                  {settings.memorizeDurationSeconds}s
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 5].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => onUpdateSettings({ memorizeDurationSeconds: sec })}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-colors ${
                      settings.memorizeDurationSeconds === sec
                        ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-md shadow-sky-500/20'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {sec} Sec
                  </button>
                ))}
              </div>
            </div>

            {/* Lives / Mistakes */}
            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>Lives / Allowed Mistakes</span>
                </div>
                <span className="text-xs font-mono font-bold text-rose-400">
                  {settings.allowMistakes === 99 ? 'Unlimited' : `${settings.allowMistakes} Lives`}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 1, label: '1 (Hardcore)' },
                  { value: 3, label: '3 (Standard)' },
                  { value: 99, label: 'Unlimited' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => onUpdateSettings({ allowMistakes: item.value })}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-colors ${
                      settings.allowMistakes === item.value
                        ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/20'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Audio Controls */}
            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 space-y-3">
              {/* SFX Volume */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-white">
                    <Volume2 className="w-4 h-4 text-amber-400" />
                    <span>Sound Effects</span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {Math.round(settings.soundVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.soundVolume}
                  onChange={(e) => onUpdateSettings({ soundVolume: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* Music Volume */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-white">
                    <Music className="w-4 h-4 text-amber-400" />
                    <span>Background Ambient Music</span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {Math.round(settings.musicVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.musicVolume}
                  onChange={(e) => onUpdateSettings({ musicVolume: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
            <button
              id="modal-btn-save-settings"
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-colors shadow-lg shadow-amber-500/20"
            >
              Apply Settings
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
