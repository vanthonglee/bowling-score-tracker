import { submitScores } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// Define the return type of the custom hook
interface UseSubmitScores {
  submitScores: (gameId: string, frameNumber: number, rolls: { player: string; rolls: string[] }[]) => void;
  isPending: boolean;
  error: Error | null;
}

// Custom hook to handle submitting scores with React Query
const useSubmitScores = (onSuccess?: (frameNumber: number) => void): UseSubmitScores => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ gameId, frameNumber, rolls }: { gameId: string; frameNumber: number; rolls: { player: string; rolls: string[] }[] }) =>
      submitScores(gameId, frameNumber, rolls),
    onSuccess: (_, variables) => {
      // Invalidate the scoreboard query to refetch the updated data
      queryClient.invalidateQueries({ queryKey: ['scoreboard', variables.gameId] });
      if (onSuccess) {
        onSuccess(variables.frameNumber);
      }
    },
  });

  return {
    submitScores: (gameId: string, frameNumber: number, rolls: { player: string; rolls: string[] }[]) =>
      mutation.mutate({ gameId, frameNumber, rolls }),
    isPending: mutation.isPending,
    error: mutation.error,
  };
};

export default useSubmitScores;