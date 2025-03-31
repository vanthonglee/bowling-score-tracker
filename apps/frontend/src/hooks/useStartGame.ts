// apps/frontend/src/hooks/useStartGame.ts
import { startGame } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';

interface UseStartGameResult {
  startGame: (players: { playerId: string; name: string }[]) => void;
  isPending: boolean;
  error: Error | null;
}

/**
 * Custom hook to start a new game.
 * @param onSuccess - Callback to run when the game starts successfully, receiving the gameId and players.
 * @returns An object containing the startGame function, loading state, and error state.
 */
const useStartGame = (onSuccess?: (gameId: string, players: { playerId: string; name: string }[]) => void): UseStartGameResult => {
  const mutation = useMutation({
    mutationFn: (players: { playerId: string; name: string }[]) => startGame({ players }),
    onSuccess: (data) => {
      if (onSuccess) {
        onSuccess(data.gameId, data.players);
      }
    },
    onError: (error: Error) => {
      console.error('Failed to start game:', error.message);
    },
  });

  return {
    startGame: (players: { playerId: string; name: string }[]) => mutation.mutate(players),
    isPending: mutation.isPending,
    error: mutation.error,
  };
};

export default useStartGame;