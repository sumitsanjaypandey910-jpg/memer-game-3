export type GameState = 'idle' | 'memorizing' | 'recalling' | 'round-success' | 'game-over';

export type GameMode = 'classic' | 'progressive' | 'rush' | 'practice';

export interface GameSettings {
  gridRows: number;
  gridCols: number;
  targetsCount: number;
  memorizeDurationSeconds: number;
  allowMistakes: number; // Max mistakes before game over per round (e.g. 1 or 3)
  soundEnabled: boolean;
  musicEnabled: boolean;
  soundVolume: number; // 0.0 to 1.0
  musicVolume: number; // 0.0 to 1.0
}

export interface BulbItem {
  id: number;
  row: number;
  col: number;
  isTarget: boolean;
  isRevealed: boolean;
  isFound: boolean;
  isWrongGuess: boolean;
}

export interface GameStats {
  score: number;
  highScore: number;
  level: number;
  streak: number;
  bestStreak: number;
  roundsCompleted: number;
  totalCorrect: number;
  totalMistakes: number;
  accuracy: number;
  timeLeft?: number;
}

export interface LightBulbGameProps {
  /** Initial game mode */
  initialMode?: GameMode;
  /** Number of targets to remember (default: 3) */
  targetCount?: number;
  /** Grid dimensions (rows, cols) - default: 3x3 */
  gridSize?: { rows: number; cols: number };
  /** Time in seconds to memorize lit bulbs (default: 3) */
  memorizeSeconds?: number;
  /** Callback fired when game finishes */
  onGameOver?: (stats: GameStats) => void;
  /** Callback fired when score increases */
  onScoreChange?: (score: number) => void;
  /** Callback fired when level is completed */
  onLevelComplete?: (level: number, score: number) => void;
  /** Optional custom CSS class */
  className?: string;
  /** Show embedded header/footer wrapper or clean standalone embed */
  standalone?: boolean;
}
