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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03151e]/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg bg-[#082b39] border border-[#144d62] rounded-3xl p-6 shadow-2xl overflow-hidden relative text-[#e2f1f8]"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#124254]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
                <Sliders className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-white">Game Settings</h2>
            </div>
            <button
              id="modal-close-settings"
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#8ec8d8] hover:text-white rounded-lg hover:bg-[#0e3b4d] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {/* Grid Layout Selector */}
            <div className="bg-[#05202b] p-3.5 rounded-2xl border border-[#103d4e]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Grid3X3 className="w-4 h-4 text-amber-400" />
                  <span>Grid Dimensions</span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-300">
                  {settings.gridRows} × {settings.gridCols} ({settings.gridRows * settings.gridCols} Bulbs)
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { rows: 3, cols: 2, label: '3×2 (6)' },
                  { rows: 3, cols: 3, label: '3×3 (9)' },
                  { rows: 4, cols: 3, label: '4×3 (12)' },
                  { rows: 4, cols: 4, label: '4×4 (16)' },
                ].map((preset) => (
                  <button
                    key={`${preset.rows}-${preset.cols}`}
                    type="button"
                    onClick={() =>
                      onUpdateSettings({ gridRows: preset.rows, gridCols: preset.cols })
                    }
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-colors ${
                      settings.gridRows === preset.rows && settings.gridCols === preset.cols
                        ? 'bg-amber-400 text-[#062330] border-amber-300 shadow-md shadow-amber-500/20'
                        : 'bg-[#082b39] text-[#8ec8d8] border-[#103d4e] hover:bg-[#0d3d4f]'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Lit Bulbs Count */}
            <div className="bg-[#05202b] p-3.5 rounded-2xl border border-[#103d4e]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <span className="text-amber-300 text-base">💡</span>
                  <span>Lit Bulbs to Remember</span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-300">
                  {settings.targetsCount} Bulbs
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[2, 3, 4, 5].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => onUpdateSettings({ targetsCount: count })}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-colors ${
                      settings.targetsCount === count
                        ? 'bg-amber-400 text-[#062330] border-amber-300 shadow-md shadow-amber-500/20'
                        : 'bg-[#082b39] text-[#8ec8d8] border-[#103d4e] hover:bg-[#0d3d4f]'
                    }`}
                  >
                    {count} Bulbs
                  </button>
                ))}
              </div>
            </div>

            {/* Memorization Duration */}
            <div className="bg-[#05202b] p-3.5 rounded-2xl border border-[#103d4e]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Timer className="w-4 h-4 text-sky-400" />
                  <span>Memorization Duration</span>
                </div>
                <span className="text-xs font-mono font-bold text-sky-300">
                  {settings.memorizeDurationSeconds}s
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[1.0, 1.5, 2.0, 3.0].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => onUpdateSettings({ memorizeDurationSeconds: sec })}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-colors ${
                      settings.memorizeDurationSeconds === sec
                        ? 'bg-sky-400 text-[#062330] border-sky-300 shadow-md shadow-sky-500/20'
                        : 'bg-[#082b39] text-[#8ec8d8] border-[#103d4e] hover:bg-[#0d3d4f]'
                    }`}
                  >
                    {sec.toFixed(1)}s
                  </button>
                ))}
              </div>
            </div>

            {/* Lives */}
            <div className="bg-[#05202b] p-3.5 rounded-2xl border border-[#103d4e]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Heart className="w-4 h-4 text-rose-400" />
                  <span>Lives / Mistakes Allowed</span>
                </div>
                <span className="text-xs font-mono font-bold text-rose-300">
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
                        : 'bg-[#082b39] text-[#8ec8d8] border-[#103d4e] hover:bg-[#0d3d4f]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Audio volume sliders */}
            <div className="bg-[#05202b] p-3.5 rounded-2xl border border-[#103d4e] space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-white">
                    <Volume2 className="w-4 h-4 text-amber-300" />
                    <span>Sound Effects</span>
                  </div>
                  <span className="text-xs font-mono text-[#8ec8d8]">
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
                  className="w-full h-1.5 bg-[#0e3b4d] rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-white">
                    <Music className="w-4 h-4 text-amber-300" />
                    <span>Background Ambient Chords</span>
                  </div>
                  <span className="text-xs font-mono text-[#8ec8d8]">
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
                  className="w-full h-1.5 bg-[#0e3b4d] rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="mt-4 pt-3 border-t border-[#124254] flex justify-end">
            <button
              id="modal-btn-save-settings"
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#062330] font-bold text-sm transition-colors shadow-lg shadow-amber-500/20"
            >
              Apply Settings
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
