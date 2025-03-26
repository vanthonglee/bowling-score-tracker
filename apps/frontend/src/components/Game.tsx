import { useState, useEffect } from 'react';
import { useGameStore } from '../store';
// import { Input, Button, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@shadcn/ui';
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
import { Input } from './ui/input';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ScoreboardEntry {
  name: string;
  frames: { rolls: number[]; display: string; cumulativeTotal: number | null }[];
  total: number;
}

const Game = () => {
  const { gameId, players, currentFrame, setCurrentFrame } = useGameStore();
  const [scores, setScores] = useState<Record<string, string[]>>({});
  const [scoreboard, setScoreboard] = useState<ScoreboardEntry[]>([]);

  useEffect(() => {
    fetchScoreboard();
  }, [currentFrame]);

  const fetchScoreboard = async () => {
    const res = await fetch(`http://localhost:8080/api/game/${gameId}/scoreboard`);
    const { scoreboard } = await res.json();
    setScoreboard(scoreboard);
  };

  const getRoll2Options = (roll1: string) => {
    if (roll1 === 'X' || roll1 === '10') return []; // Strike, no Roll 2
    const roll1Value = parseInt(roll1);
    if (isNaN(roll1Value)) return [];
    const remainingPins = 10 - roll1Value;
    const options = Array.from({ length: remainingPins + 1 }, (_, i) => i.toString());
    if (remainingPins > 0) options.push('/'); // Spare option
    return options;
  };

  const getRoll3Options = (roll1: string, roll2: string) => {
    if (roll1 === 'X' || roll1 === '10') {
      if (roll2 === 'X') return ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'X'];
      const roll2Value = parseInt(roll2);
      if (isNaN(roll2Value)) return [];
      const remainingPins = 10 - roll2Value;
      const options = Array.from({ length: remainingPins + 1 }, (_, i) => i.toString());
      if (remainingPins > 0) options.push('/'); // Spare option
      return options;
    }
    if (roll2 === '/') {
      return ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'X'];
    }
    return []; // No third roll
  };

  // Validate if all required fields are filled
  const isSubmitDisabled = () => {
    for (const player of players) {
      const roll1 = scores[player]?.[0] || '';
      const roll2 = scores[player]?.[1] || '';
      const roll3 = scores[player]?.[2] || '';

      // Roll 1 is mandatory
      if (!roll1) return true;

      // If Roll 1 is a strike (X or 10), Roll 2 should not be required in frames 1-9
      if (currentFrame < 10 && (roll1 === 'X' || roll1 === '10')) {
        continue; // No need to check Roll 2
      }

      // If Roll 1 is not a strike, Roll 2 is mandatory
      if (roll1 !== 'X' && roll1 !== '10' && !roll2) return true;

      // 10th frame: If Roll 1 is a strike or Roll 1 + Roll 2 is a spare, Roll 3 is mandatory
      if (currentFrame === 10) {
        const roll3Options = getRoll3Options(roll1, roll2);
        if (roll3Options.length > 0 && !roll3) return true;
      }
    }
    return false;
  };

  const handleSubmit = async () => {
    try {
      for (const player of players) {
        let rolls = scores[player] || ['', '', ''];
        // If Roll 1 is a strike in frames 1-9, ignore Roll 2
        if (currentFrame < 10 && (rolls[0] === 'X' || rolls[0] === '10')) {
          rolls = [rolls[0]]; // Only send Roll 1
        }
        const res = await fetch(`http://localhost:8080/api/game/${gameId}/frame/${currentFrame}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ player, rolls }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to submit scores');
        }
      }
      // Clear scores after successful submission
      setScores({});
      setCurrentFrame(currentFrame + 1);
    } catch (error) {
      console.error('Submission error:', error);
      alert(error.message || 'Failed to submit scores');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">Frame {currentFrame}</h1>
      {players.map(player => {
        const roll1 = scores[player]?.[0] || '';
        const roll2 = scores[player]?.[1] || '';
        const roll2Options = getRoll2Options(roll1);
        const roll3Options = currentFrame === 10 ? getRoll3Options(roll1, roll2) : [];

        return (
          <div key={player} className="mb-4">
            <h3>{player}</h3>
            <div className="flex space-x-2">
              {/* Roll 1 Dropdown */}
              <Select
                onValueChange={value =>
                  setScores({
                    ...scores,
                    [player]: [value, scores[player]?.[1] || '', scores[player]?.[2] || ''],
                  })
                }
                value={roll1}
              >
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Roll 1" />
                </SelectTrigger>
                <SelectContent>
                  {['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'X'].map(option => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Roll 2 Dropdown */}
              <Select
                onValueChange={value =>
                  setScores({
                    ...scores,
                    [player]: [scores[player]?.[0] || '', value, scores[player]?.[2] || ''],
                  })
                }
                value={roll2}
                disabled={roll1 === 'X' || roll1 === '10' || !roll1}
              >
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Roll 2" />
                </SelectTrigger>
                <SelectContent>
                  {roll2Options.map(option => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Roll 3 Dropdown (10th Frame Only) */}
              {currentFrame === 10 && roll3Options.length > 0 && (
                <Select
                  onValueChange={value =>
                    setScores({
                      ...scores,
                      [player]: [scores[player]?.[0] || '', scores[player]?.[1] || '', value],
                    })
                  }
                  value={scores[player]?.[2] || ''}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="Roll 3" />
                  </SelectTrigger>
                  <SelectContent>
                    {roll3Options.map(option => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        );
      })}
      <Button onClick={handleSubmit} disabled={isSubmitDisabled()}>
        Submit Scores
      </Button>

      <h2 className="mt-4 text-xl">Scoreboard</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Frame</TableHead>
            {players.map(player => (
              <TableHead key={player}>{player}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 10 }, (_, i) => i + 1).map(frame => (
            <TableRow
              key={frame}
              className={frame === currentFrame ? 'bg-blue-100' : ''}
            >
              <TableCell>{frame}</TableCell>
              {scoreboard.map(player => {
                const frameData = player.frames[frame - 1];
                return (
                  <TableCell key={player.name}>
                    {frameData?.display || '-'} {frameData?.cumulativeTotal !== null ? frameData.cumulativeTotal : ''}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
          <TableRow>
            <TableCell>Total</TableCell>
            {scoreboard.map(player => (
              <TableCell key={player.name}>{player.total}</TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default Game;