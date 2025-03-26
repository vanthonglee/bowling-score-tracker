import { useEffect, useState } from 'react';
import { useGameStore } from '../store';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from './ui/button';

interface ScoreboardEntry {
  name: string;
  frames: { rolls: number[]; display: string; cumulativeTotal: number | null }[];
  total: number;
}

const Results = () => {
  const { gameId, setGameId, setCurrentFrame } = useGameStore();
  const [scores, setScores] = useState<ScoreboardEntry[]>([]);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/game/${gameId}/scoreboard`);
        if (!res.ok) {
          throw new Error('Failed to fetch scoreboard');
        }
        const { scoreboard } = await res.json();
        setScores(scoreboard);
      } catch (error) {
        console.error('Error fetching scoreboard:', error);
        alert('Could not load game results. Please try again.');
      }
    };
    fetchScores();
  }, [gameId]);

  // Determine the winner based on the highest total score
  const winner = scores.reduce((prev, curr) => (curr.total > prev.total ? curr : prev), scores[0] || { total: 0, name: '' });

  const handleNewGame = () => {
    setGameId(null); // Reset gameId to navigate to Home
    setCurrentFrame(1); // Reset currentFrame to 1 for a new game
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Game Results</h1>

      {/* Updated Scoreboard */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px] text-center">Player</TableHead>
              {Array.from({ length: 10 }, (_, i) => i + 1).map(frame => (
                <TableHead key={frame} className="text-center">
                  {frame}
                </TableHead>
              ))}
              <TableHead className="text-center">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scores.map(player => (
              <TableRow key={player.name}>
                <TableCell className="w-[100px]">{player.name}</TableCell>
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
                <TableCell className={`text-center ${player.name === winner.name ? 'font-bold text-green-600' : ''}`}>
                  {player.total} {player.name === winner.name ? '(Winner)' : ''}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* New Game Button */}
      <Button className="mt-4" onClick={handleNewGame}>
        New Game
      </Button>
    </div>
  );
};

export default Results;