import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Eye, MousePointerClick, Trophy, Sparkles } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03151e]/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-md bg-[#082b39] border border-[#144d62] rounded-3xl p-6 shadow-2xl overflow-hidden relative text-[#e2f1f8]"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#124254]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-white">How to Play</h2>
            </div>
            <button
              id="modal-close-howtoplay"
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#8ec8d8] hover:text-white rounded-lg hover:bg-[#0e3b4d] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Steps */}
          <div className="py-5 space-y-3.5">
            <div className="flex items-start gap-3 bg-[#05202b] p-3.5 rounded-2xl border border-[#103d4e]">
              <div className="w-8 h-8 rounded-xl bg-amber-400/15 text-amber-300 flex items-center justify-center font-bold text-sm shrink-0 border border-amber-400/20">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">1. Memorize the 3 Lit Bulbs</h3>
                <p className="text-xs text-[#8ec8d8] mt-0.5 leading-relaxed">
                  Three light bulbs will illuminate brightly for a few seconds. Focus and memorize their positions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-[#05202b] p-3.5 rounded-2xl border border-[#103d4e]">
              <div className="w-8 h-8 rounded-xl bg-sky-400/15 text-sky-300 flex items-center justify-center font-bold text-sm shrink-0 border border-sky-400/20">
                <MousePointerClick className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">2. Replicate the Sequence</h3>
                <p className="text-xs text-[#8ec8d8] mt-0.5 leading-relaxed">
                  Once the bulbs turn dark, tap the exact 3 positions to illuminate them again.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-[#05202b] p-3.5 rounded-2xl border border-[#103d4e]">
              <div className="w-8 h-8 rounded-xl bg-emerald-400/15 text-emerald-300 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-400/20">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">3. Clear Rounds & Multiply Score</h3>
                <p className="text-xs text-[#8ec8d8] mt-0.5 leading-relaxed">
                  Clear all rounds without errors to build maximum streak bonuses and set the high score.
                </p>
              </div>
            </div>
          </div>

          {/* Got it Button */}
          <div className="mt-4 pt-3 border-t border-[#124254]">
            <button
              id="modal-btn-got-it"
              type="button"
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#062330] font-bold text-sm transition-all shadow-lg shadow-amber-500/20"
            >
              Start Playing
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
