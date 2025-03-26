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
  const { gameId, setGameId } = useGameStore();
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

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Game Results</h1>

      {/* Game History Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Frame</TableHead>
            {scores.map(player => (
              <TableHead key={player.name}>{player.name}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Frame Rows (1-10) */}
          {Array.from({ length: 10 }, (_, i) => i + 1).map(frame => (
            <TableRow key={frame}>
              <TableCell>{frame}</TableCell>
              {scores.map(player => {
                const frameData = player.frames[frame - 1];
                return (
                  <TableCell key={player.name}>
                    {frameData?.display || '-'}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
          {/* Total Row */}
          <TableRow>
            <TableCell>Total</TableCell>
            {scores.map(player => (
              <TableCell
                key={player.name}
                className={player.name === winner.name ? 'font-bold text-green-600' : ''}
              >
                {player.total} {player.name === winner.name ? '(Winner)' : ''}
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>

      {/* New Game Button */}
      <Button className="mt-4" onClick={() => setGameId(null)}>
        New Game
      </Button>
    </div>
  );
};

export default Results;