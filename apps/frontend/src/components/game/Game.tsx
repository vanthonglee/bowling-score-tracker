import { useState, useEffect, useTransition, useDeferredValue } from 'react';

import { useGameStore } from '../../store';
import { Button } from '../ui/button';

import Scoreboard from './Scoreboard';
import PlayerRollSelector from './PlayerRollSelector';
import useBowlingLogic from '@/hooks/useBowlingLogic';

// Main Game component to handle roll selection and score submission
const Game = () => {
  // State management using Zustand store
  const { gameId, players, currentFrame, setError, setScoreboard, scoreboard } = useGameStore();
  const deferredScoreboard = useDeferredValue(scoreboard); // Defer rendering of scoreboard for performance

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

  // Fetch scoreboard data when the component mounts (initial load)
  useEffect(() => {
    const fetchScoreboard = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/game/${gameId}/scoreboard`);
        if (!res.ok) {
          throw new Error(`Failed to fetch scoreboard: ${res.status}`);
        }
        const { scoreboard } = await res.json();
        setScoreboard(scoreboard);
        setError(null); // Clear any previous errors
      } catch (error) {
        console.error('Error fetching scoreboard:', error);
        setError('Failed to load scoreboard. Please try again.');
      }
    };

    fetchScoreboard();
  }, [gameId, setScoreboard, setError]);

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
        onClick={() => handleSubmit(gameId!, currentFrame, players)}
        disabled={isSubmitDisabled(players, currentFrame) || isPending}
        aria-label="Submit scores"
      >
        {isPending ? 'Submitting...' : 'Submit Scores'}
      </Button>

      {/* Scoreboard Section */}
      <h2 className="mt-4 text-xl">Scoreboard</h2>
      <Scoreboard scoreboard={deferredScoreboard} currentFrame={currentFrame} />
    </div>
  );
};

export default Game;