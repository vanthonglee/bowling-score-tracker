// store.ts
import { create } from 'zustand';
import { ScoreboardEntry } from './components/game/types';

// Define the game state interface
interface GameState {
  gameId: string | null; // Current game ID
  players: string[]; // List of player names
  currentFrame: number; // Current frame number (1-10)
  scoreboard: ScoreboardEntry[]; // Scoreboard data for all players
  error: string | null; // Error message for global error handling
  setGameId: (gameId: string | null) => void; // Set the game ID
  setPlayers: (players: string[]) => void; // Set the list of players
  setCurrentFrame: (frame: number) => void; // Set the current frame
  setScoreboard: (scoreboard: ScoreboardEntry[]) => void; // Set the scoreboard data
  setError: (error: string | null) => void; // Set an error message
  resetGame: () => void; // Reset the game state
}

// Create the Zustand store with typed state and actions
export const useGameStore = create<GameState>(set => ({
  gameId: null,
  players: [],
  currentFrame: 1,
  scoreboard: [],
  error: null,
  setGameId: gameId => set({ gameId }),
  setPlayers: players => set({ players }),
  setCurrentFrame: currentFrame => set({ currentFrame }),
  setScoreboard: scoreboard => set({ scoreboard }),
  setError: error => set({ error }),
  resetGame: () => set({ gameId: null, players: [], currentFrame: 1, scoreboard: [], error: null }),
}));