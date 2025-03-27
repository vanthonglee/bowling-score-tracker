import { startGame } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';

// Define the return type of the custom hook
interface UseStartGame {
  startGame: (players: string[]) => void;
  isPending: boolean;
  error: Error | null;
}

// Custom hook to handle starting a new game with React Query
const useStartGame = (onSuccess?: (gameId: string) => void): UseStartGame => {
  const mutation = useMutation({
    mutationFn: (players: string[]) => startGame(players),
    onSuccess: (data) => {
      if (onSuccess) {
        onSuccess(data.gameId);
      }
    },
  });

  return {
    startGame: (players: string[]) => mutation.mutate(players),
    isPending: mutation.isPending,
    error: mutation.error,
  };
};

export default useStartGame;