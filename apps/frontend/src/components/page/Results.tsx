import { useEffect } from 'react';
import { useGameStore } from '../../store';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import Scoreboard from '../game/Scoreboard';
import useFetchScoreboard from '@/hooks/useFetchScoreboard';

// Results component to display the final scoreboard and winner
const Results = () => {
  // State management using Zustand store
  const { gameId, scoreboard, setGameId, setPlayers, setCurrentFrame, setScoreboard, setError } = useGameStore();
  const navigate = useNavigate();

  // Redirect to Home if gameId is not set (game hasn't started or was reset)
  useEffect(() => {
    if (!gameId) {
      console.log('gameId is null, redirecting to Home from Results');
      navigate('/', { replace: true }); // Use replace to avoid adding to history
    }
  }, [gameId, navigate]);

  // Fetch the latest scoreboard as a fallback if the store data is stale
  const { data, isLoading, error } = useFetchScoreboard(gameId || '');

  // Update the scoreboard in the store if the fetched data is different
  useEffect(() => {
    if (data && data.scoreboard) {
      setScoreboard(data.scoreboard);
    }
  }, [data, setScoreboard]);

  // Handle error from API call
  useEffect(() => {
    if (error) {
      setError('Failed to load game results. Please try again.');
    }
  }, [error, setError]);

  // Handle "New Game" button click to reset the game state
  const handleNewGame = () => {
    setGameId(null); // Reset gameId
    setPlayers([]); // Reset players
    setCurrentFrame(1); // Reset currentFrame to 1 for a new game
    setScoreboard([]); // Reset scoreboard
    setError(null); // Clear any previous errors
    navigate('/'); // Navigate back to Home
  };

  // Return null while redirecting to avoid rendering a blank page
  if (!gameId) {
    return null;
  }

  // Use the scoreboard from the store, which should be updated by the useEffect
  const displayScoreboard = scoreboard && scoreboard.length > 0 ? scoreboard : data?.scoreboard;

  // Redirect to Home if no scoreboard data is available
  if (!displayScoreboard || displayScoreboard.length === 0) {
    navigate('/', { replace: true });
    return null;
  }

  // Determine the highest score and all winners
  const highestScore = Math.max(...displayScoreboard.map(player => player.total));
  const winners = displayScoreboard
    .filter(player => player.total === highestScore)
    .map(player => player.name);

  if (isLoading) {
    return <div>Loading results...</div>;
  }

  if (error) {
    return <div>Error loading results: {error.message}</div>;
  }

  return (
    <div className="p-4">
      {/* Page title */}
      <h1 className="text-2xl mb-4">Game Results</h1>

      {/* Highlight winners */}
      {winners.length > 0 && (
        <p className="text-lg mb-4">
          Winner{winners.length > 1 ? 's' : ''}: {winners.join(', ')}
        </p>
      )}

      {/* Scoreboard Section */}
      <h2 className="mt-4 text-xl">Scoreboard</h2>
      <Scoreboard scoreboard={displayScoreboard} winners={winners} />

      {/* New Game Button */}
      <Button className="mt-4" onClick={handleNewGame} aria-label="Start a new game">
        New Game
      </Button>
    </div>
  );
};

export default Results;