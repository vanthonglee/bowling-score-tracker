import { useEffect, useState } from 'react';
import { useGameStore } from '../store';
import { Button } from './ui/button';

interface ScoreboardEntry {
  name: string;
  total: number;
}

const Results = () => {
  const { gameId, setGameId } = useGameStore();
  const [scores, setScores] = useState<ScoreboardEntry[]>([]);

  useEffect(() => {
    const fetchScores = async () => {
      const res = await fetch(`http://localhost:8080/api/game/${gameId}/scoreboard`);
      const { scoreboard } = await res.json();
      setScores(scoreboard);
    };
    fetchScores();
  }, [gameId]);

  const winner = scores.reduce((prev, curr) => (curr.total > prev.total ? curr : prev), scores[0] || { total: 0 });

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Final Scores</h1>
      {scores.map(player => (
        <div key={player.name} className={player.name === winner?.name ? 'font-bold' : ''}>
          {player.name}: {player.total} {player.name === winner?.name ? '(Winner)' : ''}
        </div>
      ))}
      <Button className="mt-4" onClick={() => setGameId(null)}>New Game</Button>
    </div>
  );
};

export default Results;