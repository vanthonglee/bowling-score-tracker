// frontend/components/ScoreboardLayout.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Scoreboard from './Scoreboard';
import { useGameStore } from '@/store';
import useFetchScoreboard from '@/hooks/useFetchScoreboard';
import { ScoreboardEntry } from './types';

// Props for the ScoreboardLayout component
interface ScoreboardLayoutProps {
  title: string; // Title to display (e.g., "Frame X" or "Game Results")
  currentFrame?: number; // Current frame for highlighting (optional, used in Game screen)
  winners?: string[]; // List of winner names for highlighting (optional, used in Results screen)
  children?: (props: { scoreboard: ScoreboardEntry[] | undefined }) => React.ReactNode; // Render prop to pass scoreboard data to children
}

// Shared layout component for displaying the scoreboard with loading and error states
const ScoreboardLayout = ({ title, currentFrame, winners, children }: ScoreboardLayoutProps) => {
  // State management using Zustand store
  const { gameId, setError, setScoreboard } = useGameStore();
  const navigate = useNavigate();

  // Redirect to Home if gameId is not set (game hasn't started)
  if (!gameId) {
    navigate('/');
    return null;
  }

  // Use the custom hook to fetch the scoreboard
  const { data, isLoading, error } = useFetchScoreboard(gameId);

  // Update the scoreboard in the store when data is fetched, using useEffect to avoid render-phase updates
  useEffect(() => {
    if (data) {
      setScoreboard(data.scoreboard);
    }
  }, [data, setScoreboard]);

  if (isLoading) {
    return <div>Loading scoreboard...</div>;
  }

  if (error) {
    setError('Failed to load scoreboard. Please try again.');
    return <div>Error loading scoreboard: {error.message}</div>;
  }

  // Ensure scoreboard is defined before rendering
  const scoreboard = data?.scoreboard;
  if (!scoreboard) {
    return <div>No scores available yet.</div>;
  }

  return (
    <div className="p-4">
      {/* Display the title */}
      <h1 className="text-xl mb-4">{title}</h1>

      {/* Additional content (e.g., roll selectors, buttons) */}
      {children && children({ scoreboard })}

      {/* Scoreboard Section */}
      <h2 className="mt-4 text-xl">Scoreboard</h2>
      <Scoreboard scoreboard={scoreboard} currentFrame={currentFrame} winners={winners} />
    </div>
  );
};

export default ScoreboardLayout;