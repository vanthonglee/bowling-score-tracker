import { useDeferredValue, useEffect } from 'react';
import { useGameStore } from '../../store';
import { Button } from '../ui/button';
import Scoreboard from './Scoreboard';
import PlayerRollSelector from './PlayerRollSelector';
import useBowlingLogic from '@/hooks/useBowlingLogic';
import useFetchScoreboard from '@/hooks/useFetchScoreboard';
import { useNavigate } from 'react-router-dom';
import ScoreboardLayout from './ScoreboardLayout';

// Main Game component to handle roll selection and score submission
const Game = () => {
  // State management using Zustand store
  const { gameId, players, currentFrame } = useGameStore();

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

  return (
    <ScoreboardLayout title={`Frame ${currentFrame}`} currentFrame={currentFrame}>
      {() => (
        <>
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
        </>
      )}
    </ScoreboardLayout>
  );
};

export default Game;