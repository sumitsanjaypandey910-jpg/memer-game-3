import React from 'react';
import { motion } from 'motion/react';
import { Check, X } from 'lucide-react';
import { BulbItem } from '../types/game';

interface LightBulbProps {
  item: BulbItem;
  isMemorizing: boolean;
  isRecalling: boolean;
  disabled: boolean;
  orderNumber?: number; // 1, 2, 3 when found
  onClick: (item: BulbItem) => void;
  showSolution?: boolean;
}

export const LightBulb: React.FC<LightBulbProps> = ({
  item,
  isMemorizing,
  isRecalling,
  disabled,
  orderNumber,
  onClick,
  showSolution = false,
}) => {
  // Determine bulb state
  const isLit = (isMemorizing && item.isTarget) || item.isFound || (showSolution && item.isTarget);
  const isWrong = item.isWrongGuess;
  const isMissed = showSolution && item.isTarget && !item.isFound;

  const handleClick = () => {
    if (disabled || !isRecalling || item.isFound || item.isWrongGuess) return;
    onClick(item);
  };

  return (
    <motion.button
      id={`bulb-${item.id}`}
      type="button"
      onClick={handleClick}
      disabled={disabled || !isRecalling || item.isFound || item.isWrongGuess}
      whileHover={isRecalling && !item.isFound && !item.isWrongGuess ? { scale: 1.05, y: -4 } : {}}
      whileTap={isRecalling && !item.isFound && !item.isWrongGuess ? { scale: 0.95 } : {}}
      animate={
        isWrong
          ? { x: [-6, 6, -4, 4, -2, 2, 0], transition: { duration: 0.4 } }
          : isLit && isMemorizing
          ? { scale: [1, 1.03, 1], transition: { repeat: Infinity, duration: 1.6 } }
          : {}
      }
      className={`relative group flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl transition-all duration-300 select-none outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
        isRecalling && !item.isFound && !item.isWrongGuess
          ? 'cursor-pointer hover:bg-slate-800/60 active:bg-slate-800/80 bg-slate-900/50 border border-slate-700/60 shadow-lg hover:border-amber-500/40 hover:shadow-amber-500/10'
          : item.isFound
          ? 'bg-amber-950/40 border border-amber-500/60 shadow-[0_0_25px_rgba(245,158,11,0.35)]'
          : isWrong
          ? 'bg-rose-950/40 border border-rose-600/60 shadow-[0_0_20px_rgba(225,29,72,0.3)]'
          : isMissed
          ? 'bg-slate-800/60 border border-amber-400/40 border-dashed'
          : 'bg-slate-900/40 border border-slate-800/80'
      }`}
      aria-label={`Light bulb at row ${item.row + 1}, column ${item.col + 1}${
        item.isFound ? ' (Found)' : isWrong ? ' (Wrong guess)' : ''
      }`}
    >
      {/* Ambient background glow aura when lit */}
      {isLit && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className={`absolute inset-0 rounded-2xl pointer-events-none blur-xl transition-opacity duration-300 ${
            item.isFound
              ? 'bg-amber-400/30'
              : isMissed
              ? 'bg-amber-400/15'
              : 'bg-amber-400/35'
          }`}
        />
      )}

      {/* Wrong guess red aura */}
      {isWrong && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 rounded-2xl pointer-events-none blur-lg bg-rose-500/25 transition-opacity"
        />
      )}

      {/* Hanging wire fixture at top */}
      <div className="w-1 h-3 bg-gradient-to-b from-slate-600 to-slate-700 rounded-t-sm mb-0.5" />

      {/* Realistic Vector Light Bulb Graphic */}
      <div className="relative w-14 h-18 sm:w-16 sm:h-20 flex items-center justify-center">
        <svg
          viewBox="0 0 100 130"
          className="w-full h-full drop-shadow-md overflow-visible transition-all duration-300"
        >
          <defs>
            {/* Glass glow filters */}
            <radialGradient id={`glow-grad-${item.id}`} cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#fffbeb" stopOpacity="1" />
              <stop offset="35%" stopColor="#fef08a" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.2" />
            </radialGradient>

            <radialGradient id={`dark-glass-${item.id}`} cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#334155" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#1e293b" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.95" />
            </radialGradient>

            <linearGradient id={`filament-lit-${item.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#fef08a" />
            </linearGradient>

            <filter id={`filament-bloom-${item.id}`} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Glowing Aura Outer Ring when Lit */}
          {isLit && (
            <circle
              cx="50"
              cy="48"
              r="44"
              fill={`url(#glow-grad-${item.id})`}
              className="animate-pulse"
              opacity="0.85"
            />
          )}

          {/* Main Glass Bulb Body */}
          <path
            d="M 50 10 
               C 26 10, 15 28, 15 48 
               C 15 62, 28 74, 34 88 
               L 66 88 
               C 72 74, 85 62, 85 48 
               C 85 28, 74 10, 50 10 Z"
            fill={
              isLit
                ? `url(#glow-grad-${item.id})`
                : isWrong
                ? '#4c0519'
                : `url(#dark-glass-${item.id})`
            }
            stroke={
              isLit
                ? '#f59e0b'
                : isWrong
                ? '#e11d48'
                : '#475569'
            }
            strokeWidth="2.5"
            className="transition-colors duration-300"
          />

          {/* Glass Inner Reflection Highlight */}
          <path
            d="M 26 28 C 22 36, 22 52, 28 62"
            fill="none"
            stroke={isLit ? '#ffffff' : '#64748b'}
            strokeWidth="3"
            strokeLinecap="round"
            opacity={isLit ? '0.75' : '0.35'}
          />

          {/* Tungsten Support Rods */}
          <line
            x1="42"
            y1="85"
            x2="42"
            y2="48"
            stroke={isLit ? '#fed7aa' : '#475569'}
            strokeWidth="1.5"
          />
          <line
            x1="58"
            y1="85"
            x2="58"
            y2="48"
            stroke={isLit ? '#fed7aa' : '#475569'}
            strokeWidth="1.5"
          />

          {/* Tungsten Filament Loops */}
          <path
            d="M 42 48 Q 46 34, 50 48 Q 54 34, 58 48"
            fill="none"
            stroke={
              isLit
                ? `url(#filament-lit-${item.id})`
                : isWrong
                ? '#fb7185'
                : '#64748b'
            }
            strokeWidth={isLit ? '3.5' : '2'}
            strokeLinecap="round"
            filter={isLit ? `url(#filament-bloom-${item.id})` : undefined}
          />

          {/* Golden Spark Center when Lit */}
          {isLit && (
            <circle
              cx="50"
              cy="44"
              r="4"
              fill="#ffffff"
              filter={`url(#filament-bloom-${item.id})`}
            />
          )}

          {/* Screw Base / Metal Socket */}
          <g transform="translate(0, 0)">
            {/* Thread 1 */}
            <rect
              x="34"
              y="88"
              width="32"
              height="6"
              rx="2"
              fill="#64748b"
              stroke="#334155"
              strokeWidth="1"
            />
            {/* Thread 2 */}
            <rect
              x="36"
              y="94"
              width="28"
              height="6"
              rx="2"
              fill="#475569"
              stroke="#334155"
              strokeWidth="1"
            />
            {/* Thread 3 */}
            <rect
              x="38"
              y="100"
              width="24"
              height="6"
              rx="2"
              fill="#334155"
              stroke="#1e293b"
              strokeWidth="1"
            />
            {/* Bottom Contact Tip */}
            <path
              d="M 43 106 C 43 111, 57 111, 57 106 Z"
              fill="#1e293b"
              stroke="#0f172a"
              strokeWidth="1"
            />
          </g>
        </svg>

        {/* Status Badge Overlays */}
        {item.isFound && (
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center shadow-lg border-2 border-slate-900"
          >
            {orderNumber ? (
              <span>{orderNumber}</span>
            ) : (
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            )}
          </motion.div>
        )}

        {isWrong && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-rose-600 text-white font-bold text-xs flex items-center justify-center shadow-lg border-2 border-slate-900"
          >
            <X className="w-3.5 h-3.5 stroke-[3]" />
          </motion.div>
        )}

        {isMissed && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded bg-amber-500/90 text-slate-950 font-bold text-[10px] uppercase tracking-wider"
          >
            Missed
          </motion.div>
        )}
      </div>

      {/* Coordinate or Status Sub-label */}
      <span className="mt-1 text-[11px] font-mono font-medium text-slate-500 transition-colors group-hover:text-slate-400">
        {item.isFound ? (
          <span className="text-amber-400 font-semibold">Matched!</span>
        ) : isWrong ? (
          <span className="text-rose-400 font-semibold">Empty</span>
        ) : (
          `${item.row + 1}, ${item.col + 1}`
        )}
      </span>
    </motion.button>
  );
};
