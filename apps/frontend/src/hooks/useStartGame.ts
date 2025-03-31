// apps/frontend/src/hooks/useStartGame.ts
import { startGame } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';

interface UseStartGameResult {
  startGame: (players: string[]) => void;
  isPending: boolean;
  error: Error | null;
}

/**
 * Custom hook to start a new game.
 * @param onSuccess - Callback to run when the game starts successfully, receiving the gameId.
 * @returns An object containing the startGame function, loading state, and error state.
 */
const useStartGame = (onSuccess?: (gameId: string) => void): UseStartGameResult => {
  const mutation = useMutation({
    mutationFn: (players: string[]) => startGame({ players }),
    onSuccess: (data) => {
      if (onSuccess) {
        onSuccess(data.gameId);
      }
    },
    onError: (error: Error) => {
      console.error('Failed to start game:', error.message);
      // The error is now caught and set in the mutation state, preventing it from being thrown
    },
  });

  return {
    startGame: (players: string[]) => mutation.mutate(players),
    isPending: mutation.isPending,
    error: mutation.error,
  };
};

export default useStartGame;