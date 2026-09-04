import React, { useState } from 'react';
import { LightBulbGame } from './components/LightBulbGame';
import { Code2, Copy, Check, Info } from 'lucide-react';
import { GameStats } from './types/game';

export default function App() {
  const [showEmbedCode, setShowEmbedCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGameOver = (stats: GameStats) => {
    console.log('Game finished with stats:', stats);
  };

  const handleScoreChange = (score: number) => {
    // Parent game handler
  };

  const sampleIntegrationCode = `import React from 'react';
import { LightBulbGame } from './components/LightBulbGame';

export function MyGameHub() {
  return (
    <div className="min-h-screen bg-[#062330] p-4 flex items-center justify-center">
      {/* Light Bulb Memory Mini-Game */}
      <LightBulbGame
        initialMode="classic"              // 'classic' | 'progressive' | 'rush' | 'practice'
        targetCount={3}                    // Number of lit bulbs to memorize (default: 3)
        memorizeSeconds={2}                // Duration before bulbs disappear (2s)
        gridSize={{ rows: 3, cols: 2 }}   // 2 cols x 3 rows (6 bulbs) or 3x3, 4x3
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
    <div className="min-h-screen bg-[#041a24] text-[#e2f1f8] flex flex-col justify-between p-3 sm:p-6 selection:bg-amber-400/30 selection:text-amber-200">
      {/* Background Teal Radial Gradient */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_15%,#124f64_0%,#092f3d_45%,#041a24_100%)] opacity-80" />

      {/* Main Game Stage */}
      <main className="w-full flex-1 flex flex-col items-center justify-center relative z-10 py-2">
        <LightBulbGame
          initialMode="classic"
          targetCount={3}
          memorizeSeconds={2}
          gridSize={{ rows: 3, cols: 2 }}
          onGameOver={handleGameOver}
          onScoreChange={handleScoreChange}
        />
      </main>

      {/* Developer Integration Drawer Footer */}
      <footer className="w-full max-w-md mx-auto mt-4 pt-3 border-t border-[#0e3b4d] flex items-center justify-between gap-3 text-xs text-[#6e99a8] relative z-10">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
          <span className="font-medium text-[#8ec8d8]">Light Bulb Memory Mini-Game</span>
        </div>

        <button
          id="btn-toggle-embed-code"
          type="button"
          onClick={() => setShowEmbedCode(!showEmbedCode)}
          className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-[#082937] hover:bg-[#0c394a] text-[#8ec8d8] hover:text-amber-300 border border-[#134d61] transition-colors cursor-pointer"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>{showEmbedCode ? 'Hide Code' : 'Embed Guide'}</span>
        </button>
      </footer>

      {/* Embed Code Snippet Drawer */}
      {showEmbedCode && (
        <div className="w-full max-w-md mx-auto mt-2 p-4 rounded-2xl bg-[#082937] border border-[#134d61] relative z-10 shadow-2xl">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#124254]">
            <div className="flex items-center gap-2 text-white font-semibold text-xs">
              <Info className="w-4 h-4 text-amber-400" />
              <span>Integration into existing React App</span>
            </div>
            <button
              id="btn-copy-embed-code"
              type="button"
              onClick={copyCode}
              className="flex items-center gap-1 py-1 px-2 rounded-md bg-[#05202b] hover:bg-[#0e3b4d] text-[#8ec8d8] hover:text-white text-[11px] font-mono transition-colors border border-[#103d4e]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <pre className="p-2.5 rounded-xl bg-[#041a24] text-[#8ec8d8] font-mono text-[11px] overflow-x-auto border border-[#0d3443] leading-relaxed">
            <code>{sampleIntegrationCode}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
