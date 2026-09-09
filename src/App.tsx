import React from 'react';
import { LightBulbGame } from './components/LightBulbGame';
import { GameStats } from './types/game';

export default function App() {
  const handleGameOver = (stats: GameStats) => {
    console.log('Game finished with stats:', stats);
  };

  const handleScoreChange = (score: number) => {
    // Parent game handler
  };

  return (
    <div className="min-h-screen bg-[#041a24] text-[#e2f1f8] flex flex-col items-center justify-center p-3 sm:p-6 selection:bg-amber-400/30 selection:text-amber-200">
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
    </div>
  );
}
