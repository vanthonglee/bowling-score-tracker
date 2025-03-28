import { startGame } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';

interface UseStartGameResult {
  startGame: (players: string[]) => void; // Function to start a new game
  isPending: boolean; // Loading state
  error: Error | null; // Error state
}

/**
 * Custom hook to start a new game.
 * @param onSuccess - Callback to run when the game starts successfully, receiving the gameId.
 * @returns An object containing the startGame function, loading state, and error state.
 */
const useStartGame = (onSuccess?: (gameId: string) => void): UseStartGameResult => {
  const mutation = useMutation({
    mutationFn: (players: string[]) => startGame({ players }), // Function to start a new game
    onSuccess: (data) => {
      if (onSuccess) {
        onSuccess(data.gameId);
      }
    },
    onError: (error: Error) => {
      console.error('Failed to start game:', error.message);
    },
  });

  return {
    startGame: (players: string[]) => mutation.mutate(players),
    isPending: mutation.isPending,
    error: mutation.error,
  };
};

export default useStartGame;