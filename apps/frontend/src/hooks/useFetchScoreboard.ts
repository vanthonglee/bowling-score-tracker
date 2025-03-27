import { ScoreboardEntry } from '@/components/game/types';
import { fetchScoreboard } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

// Define the return type of the custom hook
interface UseFetchScoreboard {
  data: { scoreboard: ScoreboardEntry[] } | undefined;
  isLoading: boolean;
  error: Error | null;
}

// Custom hook to handle fetching the scoreboard with React Query
const useFetchScoreboard = (gameId: string): UseFetchScoreboard => {
  const query = useQuery({
    queryKey: ['scoreboard', gameId],
    queryFn: () => fetchScoreboard(gameId),
    enabled: !!gameId, // Only fetch if gameId is defined
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
};

export default useFetchScoreboard;