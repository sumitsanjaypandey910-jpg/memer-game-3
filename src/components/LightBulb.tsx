import React from 'react';
import { motion } from 'motion/react';
import { Check, X } from 'lucide-react';
import { BulbItem } from '../types/game';

interface LightBulbProps {
  item: BulbItem;
  isMemorizing: boolean;
  isRecalling: boolean;
  disabled: boolean;
  orderNumber?: number;
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
      whileHover={isRecalling && !item.isFound && !item.isWrongGuess ? { scale: 1.03 } : {}}
      whileTap={isRecalling && !item.isFound && !item.isWrongGuess ? { scale: 0.96 } : {}}
      animate={
        isWrong
          ? { x: [-6, 6, -4, 4, -2, 2, 0], transition: { duration: 0.35 } }
          : isLit && isMemorizing
          ? { scale: [1, 1.04, 1], transition: { repeat: Infinity, duration: 1.4 } }
          : {}
      }
      className={`relative group flex flex-col items-center justify-center w-full h-full min-h-[140px] sm:min-h-[170px] p-4 transition-all duration-300 select-none outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
        isRecalling && !item.isFound && !item.isWrongGuess
          ? 'cursor-pointer hover:bg-[#0f4559]/80 active:bg-[#0d3d4f] bg-[#0c3647]/90'
          : item.isFound
          ? 'bg-[#0f4153]'
          : isWrong
          ? 'bg-[#351928]/90'
          : isMissed
          ? 'bg-[#0b3343]/80'
          : 'bg-[#0b3546]'
      }`}
      aria-label={`Light bulb at row ${item.row + 1}, column ${item.col + 1}${
        item.isFound ? ' (Found)' : isWrong ? ' (Wrong guess)' : ''
      }`}
    >
      {/* Ambient background glow aura when lit */}
      {isLit && (
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 pointer-events-none blur-2xl bg-amber-400/35 rounded-xl transition-opacity duration-300"
        />
      )}

      {/* Wrong guess red aura */}
      {isWrong && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 pointer-events-none blur-xl bg-rose-500/30 rounded-xl"
        />
      )}

      {/* Teardrop Christmas / Candle Light Bulb Graphic matching reference image */}
      <div className="relative w-20 h-28 sm:w-24 sm:h-32 flex items-center justify-center">
        <svg
          viewBox="0 0 100 140"
          className="w-full h-full drop-shadow-lg overflow-visible transition-all duration-300"
        >
          <defs>
            {/* Glowing yellow gradient when turned ON */}
            <radialGradient id={`glow-bulb-${item.id}`} cx="45%" cy="50%" r="55%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="25%" stopColor="#fef08a" stopOpacity="0.95" />
              <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.85" />
            </radialGradient>

            {/* Matte Teal/Slate Glass Gradient matching reference image when turned OFF */}
            <radialGradient id={`dark-teal-bulb-${item.id}`} cx="40%" cy="40%" r="65%">
              <stop offset="0%" stopColor="#557989" stopOpacity="1" />
              <stop offset="40%" stopColor="#3d606f" stopOpacity="1" />
              <stop offset="85%" stopColor="#24424e" stopOpacity="1" />
              <stop offset="100%" stopColor="#18313b" stopOpacity="1" />
            </radialGradient>

            {/* Wrong guess red glass */}
            <radialGradient id={`wrong-bulb-${item.id}`} cx="40%" cy="40%" r="65%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#9f1239" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#4c0519" stopOpacity="1" />
            </radialGradient>

            {/* Socket Collar Gradient */}
            <linearGradient id={`socket-grad-${item.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#597d8b" />
              <stop offset="50%" stopColor="#7a9ea9" />
              <stop offset="100%" stopColor="#4a6975" />
            </linearGradient>

            {/* Bloom filter for glowing light */}
            <filter id={`bloom-${item.id}`} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Glowing Aura Outer Bloom when Lit */}
          {isLit && (
            <ellipse
              cx="50"
              cy="75"
              rx="38"
              ry="45"
              fill="#fbbf24"
              opacity="0.6"
              filter={`url(#bloom-${item.id})`}
              className="animate-pulse"
            />
          )}

          {/* Stepped Top Socket Collar */}
          <g transform="translate(0, 0)">
            {/* Upper Socket Layer */}
            <path
              d="M 36 10 L 64 10 C 67 10, 68 13, 67 17 L 64 26 L 36 26 L 33 17 C 32 13, 33 10, 36 10 Z"
              fill={`url(#socket-grad-${item.id})`}
              stroke="#2d4954"
              strokeWidth="1.5"
            />
            {/* Lower Socket Rim Collar */}
            <path
              d="M 33 26 L 67 26 C 69 26, 70 28, 69 32 L 67 38 L 33 38 L 31 32 C 30 28, 31 26, 33 26 Z"
              fill={`url(#socket-grad-${item.id})`}
              stroke="#2d4954"
              strokeWidth="1.5"
            />
            {/* Socket highlight divider */}
            <line x1="33" y1="26" x2="67" y2="26" stroke="#8cb2be" strokeWidth="1" opacity="0.8" />
          </g>

          {/* Main Teardrop / Candle Flame Bulb Body (exact shape from reference) */}
          <path
            d="M 33 38 
               C 22 55, 14 75, 18 95 
               C 22 114, 38 128, 50 134 
               C 62 128, 78 114, 82 95 
               C 86 75, 78 55, 67 38 
               Z"
            fill={
              isLit
                ? `url(#glow-bulb-${item.id})`
                : isWrong
                ? `url(#wrong-bulb-${item.id})`
                : `url(#dark-teal-bulb-${item.id})`
            }
            stroke={
              isLit
                ? '#fde047'
                : isWrong
                ? '#e11d48'
                : '#1f3c47'
            }
            strokeWidth="2"
            className="transition-colors duration-300"
          />

          {/* Left Glass Specular Light Curve / Reflection Highlight */}
          <path
            d="M 28 55 C 22 70, 24 90, 34 110"
            fill="none"
            stroke={isLit ? '#ffffff' : '#88acbc'}
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity={isLit ? '0.9' : '0.45'}
          />

          {/* Soft inner filament glow when lit */}
          {isLit && (
            <>
              <path
                d="M 45 60 Q 50 78, 48 95 Q 50 110, 52 95 Q 50 78, 55 60"
                fill="none"
                stroke="#ffffff"
                strokeWidth="3.5"
                strokeLinecap="round"
                filter={`url(#bloom-${item.id})`}
              />
              <circle cx="50" cy="85" r="8" fill="#ffffff" opacity="0.9" filter={`url(#bloom-${item.id})`} />
            </>
          )}

          {/* Soft specular dot at bottom */}
          <circle
            cx="48"
            cy="124"
            r="3"
            fill={isLit ? '#ffffff' : '#7198a7'}
            opacity={isLit ? '0.85' : '0.3'}
          />
        </svg>

        {/* Found badge check */}
        {item.isFound && (
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center shadow-lg border-2 border-[#092b3a]"
          >
            {orderNumber ? <span>{orderNumber}</span> : <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </motion.div>
        )}

        {/* Wrong guess indicator */}
        {isWrong && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-rose-500 text-white font-bold text-xs flex items-center justify-center shadow-lg border-2 border-[#092b3a]"
          >
            <X className="w-3.5 h-3.5 stroke-[3]" />
          </motion.div>
        )}

        {/* Missed tag */}
        {isMissed && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-bold text-[10px] uppercase tracking-wider"
          >
            Missed
          </motion.div>
        )}
      </div>
    </motion.button>
  );
};
