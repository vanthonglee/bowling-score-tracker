// apps/frontend/src/components/game/types.ts
export interface ScoreboardEntry {
  playerId: string; // Unique identifier for the player
  name: string; // Player name (can be duplicated)
  frames: { rolls: number[]; display: string; cumulativeTotal: number | null }[];
  total: number;
}

export interface RollSelectorProps {
  player: string; // Changed to playerId
  rollIndex: number;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
}

export interface PlayerRollSelectorProps {
  player: string; // Changed to playerId
  scores: Record<string, string[]>; // Keyed by playerId
  setScores: (scores: Record<string, string[]>) => void;
  getRoll2Options: (roll1: string, currentFrame: number) => string[];
  getRoll3Options: (roll1: string, roll2: string, currentFrame: number) => string[];
  currentFrame: number;
}

export interface ScoreboardProps {
  scoreboard: ScoreboardEntry[] | undefined;
  currentFrame?: number;
  winners?: string[]; // Changed to array of playerIds
}