// backend/types.ts
// Define the structure of a frame
export interface Frame {
  rolls: number[]; // Array of roll values (e.g., [10], [7, 3], [7, 3, 5])
}

// Define the structure of a player
export interface Player {
  name: string; // Player name
  frames: Frame[]; // Array of frames for the player
}

// Define the structure of a game
export interface Game {
  gameId: string; // Unique game ID
  players: Player[]; // Array of players in the game
}

// Define the structure of a calculated frame result
export interface CalculatedFrame {
  rolls: number[]; // Array of roll values
  display: string; // Display string for the frame (e.g., "X", "7 /", "7 3")
  cumulativeTotal: number | null; // Cumulative total score up to this frame
}

// Define the structure of a calculated player score
export interface CalculatedPlayerScore {
  frames: CalculatedFrame[]; // Array of calculated frames
  total: number; // Total score for the player
}

// Define a custom error class for API errors
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}