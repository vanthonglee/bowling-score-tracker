import { useDeferredValue, useEffect } from 'react';
import { useGameStore } from '../../store';
import { Button } from '../ui/button';
import Scoreboard from '../game/Scoreboard';
import PlayerRollSelector from '../game/PlayerRollSelector';
import useBowlingLogic from '@/hooks/useBowlingLogic';
import useFetchScoreboard from '@/hooks/useFetchScoreboard';
import { useNavigate } from 'react-router-dom';

// Main Game component to handle roll selection and score submission
const Game = () => {
  // State management using Zustand store
  const { gameId, players, currentFrame, setError, setScoreboard } = useGameStore();
  const navigate = useNavigate();

  // Redirect to Home if gameId is not set (game hasn't started)
  useEffect(() => {
    if (!gameId) {
      console.log('gameId is null, redirecting to Home');
      navigate('/', { replace: true }); // Use replace to avoid adding to history
    }
  }, [gameId, navigate]);

  // Use the custom hook to fetch the scoreboard
  const { data, isLoading, error } = useFetchScoreboard(gameId || '');

  // Update the scoreboard in the store when data is fetched
  useEffect(() => {
    if (data) {
      setScoreboard(data.scoreboard);
    }
  }, [data, setScoreboard]);

  // Use the custom hook to handle bowling logic
  const {
    scores,
    setScores,
    getRoll2Options,
    getRoll3Options,
    isSubmitDisabled,
    handleSubmit,
    isPending,
  } = useBowlingLogic();

  // Handle error from API call
  useEffect(() => {
    if (error) {
      setError('Failed to load scoreboard. Please try again.');
    }
  }, [error, setError]);

  if (!gameId) {
    return null; // Return null while redirecting
  }

  if (isLoading) {
    return <div>Loading scoreboard...</div>;
  }

  if (error) {
    return <div>Error loading scoreboard: {error.message}</div>;
  }

  // Ensure scoreboard is defined before rendering
  const scoreboard = data?.scoreboard;
  if (!scoreboard) {
    return <div>No scores available yet.</div>;
  }

  return (
    <div className="p-4">
      {/* Display the current frame */}
      <h1 className="text-xl mb-4">Frame {currentFrame}</h1>

      {/* Render roll selectors for each player */}
      {players.map(player => (
        <PlayerRollSelector
          key={player}
          player={player}
          scores={scores}
          setScores={setScores}
          getRoll2Options={getRoll2Options}
          getRoll3Options={getRoll3Options}
          currentFrame={currentFrame}
        />
      ))}

      {/* Submit Scores Button: Disabled during submission or if validation fails */}
      <Button
        onClick={() => handleSubmit(gameId, currentFrame, players)}
        disabled={isSubmitDisabled(players, currentFrame) || isPending}
        aria-label="Submit scores"
      >
        {isPending ? 'Submitting...' : 'Submit Scores'}
      </Button>

      {/* Scoreboard Section */}
      <h2 className="mt-4 text-xl">Scoreboard</h2>
      <Scoreboard scoreboard={scoreboard} currentFrame={currentFrame} />
    </div>
  );
};

export default Game;