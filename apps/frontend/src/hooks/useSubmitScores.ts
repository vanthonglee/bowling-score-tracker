// apps/frontend/src/hooks/useSubmitScores.ts
import { submitScores } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface SubmitScoresVariables {
  gameId: string;
  frameNumber: number;
  rolls: { playerId: string; rolls: string[] }[];
}

interface UseSubmitScoresResult {
  submitScores: (gameId: string, frameNumber: number, rolls: { playerId: string; rolls: string[] }[]) => void;
  isPending: boolean;
  error: Error | null;
}

const useSubmitScores = (onSuccess?: (frameNumber: number) => Promise<void>): UseSubmitScoresResult => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ gameId, frameNumber, rolls }: SubmitScoresVariables) =>
      submitScores(gameId, frameNumber, { rolls }),
    onSuccess: async (_, variables) => {
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
    submitScores: (gameId: string, frameNumber: number, rolls: { playerId: string; rolls: string[] }[]) =>
      mutation.mutate({ gameId, frameNumber, rolls }),
    isPending: mutation.isPending,
    error: mutation.error,
  };
};

export default useSubmitScores;