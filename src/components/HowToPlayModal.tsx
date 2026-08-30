import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lightbulb, Eye, MousePointerClick, Trophy, Sparkles } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Lightbulb className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-white">How to Play</h2>
            </div>
            <button
              id="modal-close-howtoplay"
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Steps */}
          <div className="py-5 space-y-4">
            <div className="flex items-start gap-3.5 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-sm shrink-0 border border-amber-500/20">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">1. Watch the Glowing Bulbs</h3>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  At the start of each round, 3 light bulbs will light up for 3 seconds. Focus and memorize their exact positions on the grid.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-sm shrink-0 border border-sky-500/20">
                <MousePointerClick className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">2. Recall & Tap</h3>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Once the bulbs turn dark, click or tap the exact positions of the 3 bulbs that were lit. Correct clicks illuminate the bulb again.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-500/20">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">3. Build Streaks & High Scores</h3>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Find all 3 bulbs without making mistakes to keep your combo streak alive and multiply your points.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Tip */}
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 flex items-center gap-2 text-xs text-amber-200">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Turn on ambient music with the music button for an immersive focus experience!</span>
          </div>

          {/* Got it Button */}
          <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
            <button
              id="modal-btn-got-it"
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-colors shadow-lg shadow-amber-500/20"
            >
              Got It, Let's Play!
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
