import { useEffect, useState, useDeferredValue } from 'react';
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
import { ScoreboardEntry } from './game/types';

// Results component to display the final scoreboard and winner
const Results = () => {
  // State management using Zustand store
  const { gameId, setGameId, setCurrentFrame, setError } = useGameStore();
  const [scores, setScores] = useState<ScoreboardEntry[]>([]); // Scoreboard data fetched from backend
  const deferredScores = useDeferredValue(scores); // Defer rendering of scores for performance

  // Fetch scoreboard data when the gameId changes
  useEffect(() => {
    const fetchScores = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/game/${gameId}/scoreboard`);
        if (!res.ok) {
          throw new Error(`Failed to fetch scoreboard: ${res.status}`);
        }
        const { scoreboard } = await res.json();
        setScores(scoreboard);
        setError(null); // Clear any previous errors
      } catch (error) {
        console.error('Error fetching scoreboard:', error);
        setError('Could not load game results. Please try again.');
      }
    };
    fetchScores();
  }, [gameId, setError]);

  // Determine the highest score and all winners
  const highestScore = Math.max(...deferredScores.map(player => player.total));
  const winners = deferredScores
    .filter(player => player.total === highestScore)
    .map(player => player.name);

  // Handle "New Game" button click to reset the game state
  const handleNewGame = () => {
    setGameId(null); // Reset gameId to navigate to Home
    setCurrentFrame(1); // Reset currentFrame to 1 for a new game
    setError(null); // Clear any previous errors
  };

  return (
    <div className="p-4">
      {/* Page title */}
      <h1 className="text-2xl mb-4">Game Results</h1>

      {/* Scoreboard Section */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {/* Player column with compact width */}
              <TableHead className="w-[100px] text-center">Player</TableHead>
              {/* Frame columns */}
              {Array.from({ length: 10 }, (_, i) => i + 1).map(frame => (
                <TableHead key={frame} className="text-center">
                  {frame}
                </TableHead>
              ))}
              {/* Total column at the right end */}
              <TableHead className="text-center">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deferredScores.map(player => (
              <TableRow key={player.name}>
                {/* Player name with compact width */}
                <TableCell className="w-[100px]">{player.name}</TableCell>
                {/* Frame cells with rolls and cumulative totals */}
                {Array.from({ length: 10 }, (_, i) => i + 1).map(frame => {
                  const frameData = player.frames[frame - 1];
                  return (
                    <TableCell key={frame} className="p-0">
                      <div className="flex flex-col items-center justify-center h-16 bg-gray-200 border-r border-gray-300">
                        <div className="text-sm">{frameData?.display || '-'}</div>
                        <div className="text-lg font-semibold">
                          {frameData?.cumulativeTotal !== null ? frameData.cumulativeTotal : '-'}
                        </div>
                      </div>
                    </TableCell>
                  );
                })}
                {/* Total score for the player, highlighted if winner */}
                <TableCell
                  className={`text-center ${winners.includes(player.name) ? 'font-bold text-green-600' : ''}`}
                >
                  {player.total} {winners.includes(player.name) ? '(Winner)' : ''}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* New Game Button */}
      <Button className="mt-4" onClick={handleNewGame} aria-label="Start a new game">
        New Game
      </Button>
    </div>
  );
};

export default Results;