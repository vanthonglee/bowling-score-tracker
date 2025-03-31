// apps/frontend/src/store.ts
import { create } from 'zustand';
import { ScoreboardEntry } from './components/game/types';

// Define the player interface with a unique ID
interface Player {
  playerId: string;
  name: string;
}

// Define the game state interface
interface GameState {
  gameId: string | null;
  players: Player[]; // Updated to include playerId
  currentFrame: number;
  scoreboard: ScoreboardEntry[];
  error: string | null;
  setGameId: (gameId: string | null) => void;
  setPlayers: (players: Player[]) => void;
  setCurrentFrame: (frame: number) => void;
  setScoreboard: (scoreboard: ScoreboardEntry[]) => void;
  setError: (error: string | null) => void;
  resetGame: () => void;
}

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