import { ScoreboardEntry } from '@/components/game/types';
import { fetchScoreboard } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

// Define the return type of the hook
interface UseFetchScoreboardResult {
  data: { scoreboard: ScoreboardEntry[] } | undefined; // Scoreboard data
  isLoading: boolean; // Loading state
  error: Error | null; // Error state
}

/**
 * Custom hook to fetch the scoreboard for a given game.
 * @param gameId - The ID of the game to fetch the scoreboard for.
 * @returns An object containing the scoreboard data, loading state, and error state.
 */
const useFetchScoreboard = (gameId: string): UseFetchScoreboardResult => {
  return useQuery({
    queryKey: ['scoreboard', gameId], // Unique key for caching
    queryFn: () => fetchScoreboard(gameId), // Function to fetch the scoreboard
    enabled: !!gameId, // Only fetch if gameId is defined
    retry: false, // Disable retries to prevent infinite loops on failure
    onError: (error: Error) => {
      console.error('Failed to fetch scoreboard:', error.message);
    },
  });
};

export default useFetchScoreboard;