// apps/backend/src/types.ts

// Represents a single frame in a bowling game, containing the rolls made by a player.
export interface Frame {
  rolls: number[]; // Array of roll values (e.g., [10] for a strike, [7, 3] for a spare, [7, 2] for an open frame)
}

// Represents a player in the game, including their unique identifier, name, and frames.
export interface Player {
  playerId: string; // Unique identifier for the player
  name: string; // Player name (can be duplicated across players)
  frames: Frame[]; // Array of frames for the player, one per frame played
}

// Represents a bowling game, containing a unique game ID and the list of players.
export interface Game {
  gameId: string; // Unique identifier for the game
  players: Player[]; // Array of players participating in the game
}

// Represents a calculated frame result, including the rolls, display string, and cumulative score.
export interface CalculatedFrame {
  rolls: number[]; // Array of roll values for the frame
  display: string; // Display string for the frame (e.g., "X" for strike, "7 /" for spare, "7 3" for open)
  cumulativeTotal: number | null; // Cumulative total score up to this frame (null if not yet calculable)
}

// Represents a player's calculated score, including their frames and total score.
export interface CalculatedPlayerScore {
  frames: CalculatedFrame[]; // Array of calculated frames for the player
  total: number; // Total score for the player across all frames
}

// Custom error class for API errors, including a status code and message.
export class ApiError extends Error {
  status: number; // HTTP status code for the error (e.g., 400, 404, 500)

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}