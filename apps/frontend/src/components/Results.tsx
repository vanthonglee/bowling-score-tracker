import { useDeferredValue } from 'react';
import { useGameStore } from '../store';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from './ui/button';
import useFetchScoreboard from '../hooks/useFetchScoreboard';
import { useNavigate } from 'react-router-dom';
import ScoreboardLayout from './game/ScoreboardLayout';

// Results component to display the final scoreboard and winner
const Results = () => {
  // State management using Zustand store
  const { setGameId, setPlayers, setCurrentFrame, setScoreboard, setError } = useGameStore();
  const navigate = useNavigate();

  // Handle "New Game" button click to reset the game state
  const handleNewGame = () => {
    setGameId(null); // Reset gameId
    setPlayers([]); // Reset players
    setCurrentFrame(1); // Reset currentFrame to 1 for a new game
    setScoreboard([]); // Reset scoreboard
    setError(null); // Clear any previous errors
    navigate('/'); // Navigate back to Home
  };

  return (
    <ScoreboardLayout title="Game Results">
      {({ scoreboard }) => {
        // Guard against undefined scoreboard
        if (!scoreboard) {
          return null;
        }

        // Determine the highest score and all winners
        const highestScore = Math.max(...scoreboard.map(player => player.total));
        const winners = scoreboard
          .filter(player => player.total === highestScore)
          .map(player => player.name);

        return (
          <>
            {/* Highlight winners */}
            {winners.length > 0 && (
              <p className="text-lg mb-4">
                Winner{winners.length > 1 ? 's' : ''}: {winners.join(', ')}
              </p>
            )}

            {/* New Game Button */}
            <Button className="mt-4" onClick={handleNewGame} aria-label="Start a new game">
              New Game
            </Button>
          </>
        );
      }}
    </ScoreboardLayout>
  );
};

export default Results;