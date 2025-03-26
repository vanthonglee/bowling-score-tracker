import { create } from 'zustand';

interface GameState {
  gameId: string | null;
  players: string[];
  currentFrame: number;
  setGameId: (gameId: string) => void;
  setPlayers: (players: string[]) => void;
  setCurrentFrame: (frame: number) => void;
}

export const useGameStore = create<GameState>(set => ({
  gameId: null,
  players: [],
  currentFrame: 1,
  setGameId: gameId => set({ gameId }),
  setPlayers: players => set({ players }),
  setCurrentFrame: currentFrame => set({ currentFrame }),
}));