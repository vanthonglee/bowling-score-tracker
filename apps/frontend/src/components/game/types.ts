// Define the structure of a scoreboard entry for type safety
export interface ScoreboardEntry {
  name: string; // Player name
  frames: { rolls: number[]; display: string; cumulativeTotal: number | null }[]; // Frame data with rolls, display string, and cumulative total
  total: number; // Total score for the player
}

// Props for the RollSelector component to ensure type safety
export interface RollSelectorProps {
  player: string; // Player name for identifying the score entry
  rollIndex: number; // Index of the roll (0 for Roll 1, 1 for Roll 2, 2 for Roll 3)
  value: string; // Current selected value for the roll
  options: string[]; // Valid options for the roll
  onSelect: (value: string) => void; // Callback to handle selection
}

// Props for the PlayerRollSelector component
export interface PlayerRollSelectorProps {
  player: string; // Player name
  scores: Record<string, string[]>; // Current scores for all players
  setScores: (scores: Record<string, string[]>) => void; // Function to update scores
  getRoll2Options: (roll1: string, currentFrame: number) => string[]; // Function to get Roll 2 options
  getRoll3Options: (roll1: string, roll2: string, currentFrame: number) => string[]; // Function to get Roll 3 options
  currentFrame: number; // Current frame number
}

// Props for the Scoreboard component
export interface ScoreboardProps {
  scoreboard: ScoreboardEntry[] | undefined; // Scoreboard data for all players
  currentFrame?: number; // Current frame number for highlighting (optional)
  winners?: string[]; // List of winner names for highlighting (optional)
}