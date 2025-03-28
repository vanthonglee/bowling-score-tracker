import { submitScores } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface SubmitScoresVariables {
  gameId: string;
  frameNumber: number;
  rolls: { player: string; rolls: string[] }[];
}

// Define the return type of the hook
interface UseSubmitScoresResult {
  submitScores: (gameId: string, frameNumber: number, rolls: { player: string; rolls: string[] }[]) => void; // Function to submit scores
  isPending: boolean; // Loading state
  error: Error | null; // Error state
}

/**
 * Custom hook to submit scores for a frame.
 * @param onSuccess - Optional callback to run when scores are submitted successfully, receiving the frameNumber.
 * @returns An object containing the submitScores function, loading state, and error state.
 */
const useSubmitScores = (onSuccess?: (frameNumber: number) => Promise<void>): UseSubmitScoresResult => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ gameId, frameNumber, rolls }: SubmitScoresVariables) =>
      submitScores(gameId, frameNumber, { rolls }), // Function to submit scores
    onSuccess: async (_, variables) => {
      // Invalidate the scoreboard query to refetch the updated data
      await queryClient.invalidateQueries({ queryKey: ['scoreboard', variables.gameId] });
      if (onSuccess) {
        await onSuccess(variables.frameNumber);
      }
    },
    onError: (error: Error) => {
      console.error('Failed to submit scores:', error.message);
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