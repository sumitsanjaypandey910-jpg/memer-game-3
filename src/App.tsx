import React, { useState } from 'react';
import { LightBulbGame } from './components/LightBulbGame';
import { Code2, Sparkles, Copy, Check, Info } from 'lucide-react';
import { GameStats } from './types/game';

export default function App() {
  const [showEmbedCode, setShowEmbedCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGameOver = (stats: GameStats) => {
    console.log('Game finished with stats:', stats);
  };

  const handleScoreChange = (score: number) => {
    // Parent game handler if needed
  };

  const sampleIntegrationCode = `import React from 'react';
import { LightBulbGame } from './components/LightBulbGame';

export function MyGameHub() {
  return (
    <div className="min-h-screen bg-slate-950 p-4">
      {/* Light Bulb Memory Mini-Game */}
      <LightBulbGame
        initialMode="classic"        // 'classic' | 'progressive' | 'rush' | 'practice'
        targetCount={3}              // Number of lit bulbs to memorize (default: 3)
        memorizeSeconds={3}          // Duration in seconds before bulbs disappear
        gridSize={{ rows: 3, cols: 3 }} // 3x3 (9 bulbs), 3x4 (12), 4x4 (16), etc.
        onScoreChange={(score) => console.log('Score:', score)}
        onGameOver={(stats) => console.log('Game Over Stats:', stats)}
      />
    </div>
  );
}`;

  const copyCode = () => {
    navigator.clipboard.writeText(sampleIntegrationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-3 sm:p-6 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Background Subtle Radial Gradient */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.08),transparent_50%)]" />

      {/* Main Game Stage */}
      <div className="w-full flex-1 flex flex-col items-center justify-center relative z-10 py-2">
        <LightBulbGame
          initialMode="classic"
          targetCount={3}
          memorizeSeconds={3}
          onGameOver={handleGameOver}
          onScoreChange={handleScoreChange}
        />
      </div>

      {/* Clean Developer Integration Toggle Bar */}
      <footer className="w-full max-w-2xl mx-auto mt-6 pt-4 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 relative z-10">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
          <span className="font-medium text-slate-400">React Light Bulb Memory Component</span>
        </div>

        <button
          id="btn-toggle-embed-code"
          type="button"
          onClick={() => setShowEmbedCode(!showEmbedCode)}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-300 border border-slate-800 transition-colors cursor-pointer"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>{showEmbedCode ? 'Hide Source Integration' : 'Source Code & Embed Guide'}</span>
        </button>
      </footer>

      {/* Embed Code Snippet Drawer */}
      {showEmbedCode && (
        <div className="w-full max-w-2xl mx-auto mt-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 relative z-10 shadow-2xl">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-slate-200 font-semibold text-xs">
              <Info className="w-4 h-4 text-amber-400" />
              <span>Embedding into your React Game</span>
            </div>
            <button
              id="btn-copy-embed-code"
              type="button"
              onClick={copyCode}
              className="flex items-center gap-1 py-1 px-2.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-mono transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy React Code'}</span>
            </button>
          </div>

          <pre className="p-3 rounded-xl bg-slate-950 text-slate-300 font-mono text-[11px] overflow-x-auto border border-slate-800/80 leading-relaxed">
            <code>{sampleIntegrationCode}</code>
          </pre>

          <p className="text-[11px] text-slate-400 mt-2">
            The component is 100% modular and self-contained with built-in Web Audio API synthesis.
          </p>
        </div>
      )}
    </div>
  );
}
