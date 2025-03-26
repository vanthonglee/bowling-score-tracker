import { useState, useEffect } from 'react';
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
import { Badge } from "@/components/ui/badge"

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
    if (!roll1) return [];
    if (currentFrame < 10) {
      if (roll1 === 'X' || roll1 === '10') return []; // Strike, no Roll 2 in frames 1-9
      const roll1Value = parseInt(roll1);
      if (isNaN(roll1Value)) return [];
      const remainingPins = 10 - roll1Value;
      const options = Array.from({ length: remainingPins + 1 }, (_, i) => i.toString());
      if (remainingPins > 0) options.push('/'); // Spare option
      return options;
    } else {
      // 10th frame: Roll 2 is always allowed
      if (roll1 === 'X' || roll1 === '10') {
        return ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'X'];
      }
      const roll1Value = parseInt(roll1);
      if (isNaN(roll1Value)) return [];
      const remainingPins = 10 - roll1Value;
      const options = Array.from({ length: remainingPins + 1 }, (_, i) => i.toString());
      if (remainingPins > 0) options.push('/'); // Spare option
      return options;
    }
  };

  const getRoll3Options = (roll1: string, roll2: string) => {
    if (currentFrame !== 10) return []; // Only for 10th frame
    if (!roll1 || !roll2) return [];

    if (roll1 === 'X' || roll1 === '10') {
      // After a strike, Roll 2 can be anything, and Roll 3 is always required
      if (roll2 === 'X' || roll2 === '10') {
        return ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'X'];
      }
      const roll2Value = parseInt(roll2);
      if (isNaN(roll2Value)) return [];
      const remainingPins = 10 - roll2Value;
      const options = Array.from({ length: remainingPins + 1 }, (_, i) => i.toString());
      if (remainingPins > 0) options.push('/'); // Spare option
      return options;
    }

    const roll1Value = parseInt(roll1);
    const roll2Value = roll2 === '/' ? 10 - roll1Value : parseInt(roll2);
    if (roll1Value + roll2Value === 10 && roll2Value !== 0) {
      // After a spare (e.g., 3 and 7), Roll 3 is required and can be anything
      return ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'X'];
    }

    return []; // No third roll for open frame
  };

  // Validate if all required fields are filled
  const isSubmitDisabled = () => {
    for (const player of players) {
      const roll1 = scores[player]?.[0] || '';
      const roll2 = scores[player]?.[1] || '';
      const roll3 = scores[player]?.[2] || '';

      // Roll 1 is mandatory
      if (!roll1) return true;

      if (currentFrame < 10) {
        // Frames 1-9: If Roll 1 is a strike, no Roll 2 is needed
        if (roll1 === 'X' || roll1 === '10') continue;
        // Otherwise, Roll 2 is mandatory
        if (!roll2) return true;
      } else {
        // 10th frame: Roll 2 is always required
        if (!roll2) return true;

        const roll1Value = roll1 === 'X' || roll1 === '10' ? 10 : parseInt(roll1);
        const roll2Value = roll2 === 'X' || roll2 === '10' ? 10 : roll2 === '/' ? 10 - roll1Value : parseInt(roll2);

        // Validate that the first two rolls are valid (sum ≤ 10 unless a spare)
        if (roll1 !== 'X' && roll1 !== '10' && roll2 !== '/' && roll1Value + roll2Value > 10) {
          return true; // Invalid combination (e.g., 2 and 9)
        }

        // If Roll 1 is a strike or Roll 1 + Roll 2 is a spare, Roll 3 is mandatory
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
        if (currentFrame < 10 && (rolls[0] === 'X' || rolls[0] === '10')) {
          rolls = [rolls[0]]; // Only send Roll 1 for strikes in frames 1-9
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
      setScores({});
      setCurrentFrame(currentFrame + 1);
    } catch (error) {
      console.error('Submission error:', error);
      alert(error.message || 'Failed to submit scores');
    }
  };

  const roll1Options = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'X'];

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">Frame {currentFrame}</h1>
      {players.map(player => {
        const roll1 = scores[player]?.[0] || '';
        const roll2 = scores[player]?.[1] || '';
        const roll3 = scores[player]?.[2] || '';
        const roll2Options = getRoll2Options(roll1);
        const roll3Options = getRoll3Options(roll1, roll2);

        return (
          <div key={player} className="mb-4">
            <h3>{player}</h3>

            {/* Roll 1 Badges */}
            <div className="mb-2">
              <label className="block mb-1">Roll 1</label>
              <div className="w-full flex overflow-x-auto space-x-2 pb-2">
                {roll1Options.map(option => (
                  <Badge
                    key={option}
                    variant={roll1 === option ? 'default' : 'secondary'}
                    className="cursor-pointer px-3 py-1 whitespace-nowrap"
                    onClick={() =>
                      setScores({
                        ...scores,
                        [player]: [option, scores[player]?.[1] || '', scores[player]?.[2] || ''],
                      })
                    }
                  >
                    {option}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Roll 2 Badges */}
            {(currentFrame < 10 ? roll1 !== 'X' && roll1 !== '10' : true) && roll1 && (
              <div className="mb-2">
                <label className="block mb-1">Roll 2</label>
                <div className="w-full flex overflow-x-auto space-x-2 pb-2">
                  {roll2Options.map(option => (
                    <Badge
                      key={option}
                      variant={roll2 === option ? 'default' : 'secondary'}
                      className="cursor-pointer px-3 py-1 whitespace-nowrap"
                      onClick={() =>
                        setScores({
                          ...scores,
                          [player]: [scores[player]?.[0] || '', option, scores[player]?.[2] || ''],
                        })
                      }
                    >
                      {option}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Roll 3 Badges (10th Frame Only) */}
            {currentFrame === 10 && roll3Options.length > 0 && (
              <div className="mb-2">
                <label className="block mb-1">Roll 3</label>
                <div className="w-full flex overflow-x-auto space-x-2 pb-2">
                  {roll3Options.map(option => (
                    <Badge
                      key={option}
                      variant={roll3 === option ? 'default' : 'secondary'}
                      className="cursor-pointer px-3 py-1 whitespace-nowrap"
                      onClick={() =>
                        setScores({
                          ...scores,
                          [player]: [scores[player]?.[0] || '', scores[player]?.[1] || '', option],
                        })
                      }
                    >
                      {option}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
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