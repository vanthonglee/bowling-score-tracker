import { useState, useEffect, useTransition, useDeferredValue } from 'react';

import { useGameStore } from '../store';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from './ui/button';

// Define the structure of a scoreboard entry for type safety
interface ScoreboardEntry {
  name: string;
  frames: { rolls: number[]; display: string; cumulativeTotal: number | null }[];
  total: number;
}

// Props for the RollSelector component to ensure type safety
interface RollSelectorProps {
  player: string; // Player name for identifying the score entry
  rollIndex: number; // Index of the roll (0 for Roll 1, 1 for Roll 2, 2 for Roll 3)
  value: string; // Current selected value for the roll
  options: string[]; // Valid options for the roll
  onSelect: (value: string) => void; // Callback to handle selection
}

// Reusable component to render a scrollable list of badges for roll selection
const RollSelector: React.FC<RollSelectorProps> = ({ player, rollIndex, value, options, onSelect }) => {
  return (
    <div className="mb-2">
      {/* Label indicating which roll is being selected */}
      <label className="block mb-1">Roll {rollIndex + 1}</label>
      {/* Scrollable container for badges */}
      <div className="w-full flex overflow-x-auto space-x-2 pb-2">
        {options.map(option => (
          <Badge
            key={option}
            variant={value === option ? 'default' : 'secondary'} // Highlight selected option
            className="cursor-pointer px-3 py-1 whitespace-nowrap"
            onClick={() => onSelect(option)}
          >
            {option}
          </Badge>
        ))}
      </div>
    </div>
  );
};

const Game = () => {
  // State management using Zustand store
  const { gameId, players, currentFrame, setCurrentFrame } = useGameStore();
  const [scores, setScores] = useState<Record<string, string[]>>({}); // Scores for each player (Roll 1, Roll 2, Roll 3)
  const [scoreboard, setScoreboard] = useState<ScoreboardEntry[]>([]); // Scoreboard data fetched from backend
  const [isPending, startTransition] = useTransition(); // For handling non-urgent state updates
  const deferredScoreboard = useDeferredValue(scoreboard); // Defer rendering of scoreboard for performance

  // Fetch scoreboard data when the current frame changes
  useEffect(() => {
    fetchScoreboard();
  }, [currentFrame]);

  // Fetch scoreboard data from the backend
  const fetchScoreboard = async () => {
    const res = await fetch(`http://localhost:8080/api/game/${gameId}/scoreboard`);
    const { scoreboard } = await res.json();
    setScoreboard(scoreboard);
  };

  // Determine valid options for Roll 2 based on Roll 1
  const getRoll2Options = (roll1: string) => {
    if (!roll1) return []; // No options if Roll 1 is not selected
    if (currentFrame < 10) {
      if (roll1 === 'X' || roll1 === '10') return []; // Strike in frames 1-9 means no Roll 2
      const roll1Value = parseInt(roll1);
      if (isNaN(roll1Value)) return [];
      const remainingPins = 10 - roll1Value;
      const options = Array.from({ length: remainingPins + 1 }, (_, i) => i.toString());
      if (remainingPins > 0) options.push('/'); // Add spare option if applicable
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
      if (remainingPins > 0) options.push('/'); // Add spare option if applicable
      return options;
    }
  };

  // Determine valid options for Roll 3 (10th frame only) based on Roll 1 and Roll 2
  const getRoll3Options = (roll1: string, roll2: string) => {
    if (currentFrame !== 10) return []; // Only for 10th frame
    if (!roll1 || !roll2) return []; // Require Roll 1 and Roll 2 to be selected

    if (roll1 === 'X' || roll1 === '10') {
      // After a strike, Roll 2 can be anything, and Roll 3 is always required
      if (roll2 === 'X' || roll2 === '10') {
        return ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'X'];
      }
      const roll2Value = parseInt(roll2);
      if (isNaN(roll2Value)) return [];
      const remainingPins = 10 - roll2Value;
      const options = Array.from({ length: remainingPins + 1 }, (_, i) => i.toString());
      if (remainingPins > 0) options.push('/'); // Add spare option if applicable
      return options;
    }

    const roll1Value = parseInt(roll1);
    const roll2Value = roll2 === '/' ? 10 - roll1Value : parseInt(roll2);
    if (roll1Value + roll2Value === 10 && roll2Value !== 0) {
      // After a spare (e.g., 3 and 7), Roll 3 is required and can be anything
      return ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'X'];
    }

    return []; // No third roll for open frame (sum < 10)
  };

  // Validate if all required fields are filled to enable/disable the "Submit Scores" button
  const isSubmitDisabled = () => {
    for (const player of players) {
      const roll1 = scores[player]?.[0] || '';
      const roll2 = scores[player]?.[1] || '';
      const roll3 = scores[player]?.[2] || '';

      // Roll 1 is mandatory for all players
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

  // Handle score submission with useTransition for better UI responsiveness
  const handleSubmit = () => {
    startTransition(async () => {
      try {
        for (const player of players) {
          let rolls = scores[player] || ['', '', ''];
          if (currentFrame < 10 && (rolls[0] === 'X' || rolls[0] === '10')) {
            rolls = [rolls[0]]; // Only send Roll 1 for strikes in frames 1-9
          } else if (currentFrame === 10) {
            // 10th frame: Only send Roll 3 if it's a strike or spare
            const roll1Value = rolls[0] === 'X' || rolls[0] === '10' ? 10 : parseInt(rolls[0]);
            const roll2Value = rolls[1] === 'X' || rolls[1] === '10' ? 10 : rolls[1] === '/' ? 10 - roll1Value : parseInt(rolls[1]);
            const roll3Options = getRoll3Options(rolls[0], rolls[1]);
            if (roll3Options.length === 0) {
              // Open frame: Only send two rolls
              rolls = [rolls[0], rolls[1]];
            }
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
        // Reset scores and advance to the next frame
        setScores({});
        setCurrentFrame(currentFrame + 1);
      } catch (error) {
        console.error('Submission error:', error);
        alert(error.message || 'Failed to submit scores');
      }
    });
  };

  const roll1Options = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'X'];

  return (
    <div className="p-4">
      {/* Display the current frame */}
      <h1 className="text-xl mb-4">Frame {currentFrame}</h1>

      {/* Render roll selectors for each player */}
      {players.map(player => {
        const roll1 = scores[player]?.[0] || '';
        const roll2 = scores[player]?.[1] || '';
        const roll3 = scores[player]?.[2] || '';
        const roll2Options = getRoll2Options(roll1);
        const roll3Options = getRoll3Options(roll1, roll2);

        return (
          <div key={player} className="mb-4">
            <h3>{player}</h3>

            {/* Roll 1 Selector */}
            <RollSelector
              player={player}
              rollIndex={0}
              value={roll1}
              options={roll1Options}
              onSelect={value =>
                setScores({
                  ...scores,
                  [player]: [value, scores[player]?.[1] || '', scores[player]?.[2] || ''],
                })
              }
            />

            {/* Roll 2 Selector: Hidden in frames 1-9 if Roll 1 is a strike */}
            {(currentFrame < 10 ? roll1 !== 'X' && roll1 !== '10' : true) && roll1 && (
              <RollSelector
                player={player}
                rollIndex={1}
                value={roll2}
                options={roll2Options}
                onSelect={value =>
                  setScores({
                    ...scores,
                    [player]: [scores[player]?.[0] || '', value, scores[player]?.[2] || ''],
                  })
                }
              />
            )}

            {/* Roll 3 Selector: Only shown in 10th frame for strike or spare */}
            {currentFrame === 10 && roll3Options.length > 0 && (
              <RollSelector
                player={player}
                rollIndex={2}
                value={roll3}
                options={roll3Options}
                onSelect={value =>
                  setScores({
                    ...scores,
                    [player]: [scores[player]?.[0] || '', scores[player]?.[1] || '', value],
                  })
                }
              />
            )}
          </div>
        );
      })}

      {/* Submit Scores Button: Disabled during submission or if validation fails */}
      <Button onClick={handleSubmit} disabled={isSubmitDisabled() || isPending}>
        {isPending ? 'Submitting...' : 'Submit Scores'}
      </Button>

      {/* Scoreboard Section */}
      <h2 className="mt-4 text-xl">Scoreboard</h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {/* Player column with compact width */}
              <TableHead className="w-[100px] text-center">Player</TableHead>
              {/* Frame columns with highlighting for current frame */}
              {Array.from({ length: 10 }, (_, i) => i + 1).map(frame => (
                <TableHead
                  key={frame}
                  className={`text-center ${frame === currentFrame ? 'bg-blue-100' : ''}`}
                >
                  {frame}
                </TableHead>
              ))}
              {/* Total column at the right end */}
              <TableHead className="text-center">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deferredScoreboard.map(player => (
              <TableRow key={player.name}>
                {/* Player name with compact width */}
                <TableCell className="w-[100px]">{player.name}</TableCell>
                {/* Frame cells with rolls and cumulative totals */}
                {Array.from({ length: 10 }, (_, i) => i + 1).map(frame => {
                  const frameData = player.frames[frame - 1];
                  return (
                    <TableCell
                      key={frame}
                      className={`p-0 ${frame === currentFrame ? 'bg-blue-100' : ''}`}
                    >
                      <div className="flex flex-col items-center justify-center h-16 bg-gray-200 border-r border-gray-300">
                        <div className="text-sm">{frameData?.display || '-'}</div>
                        <div className="text-lg font-semibold">
                          {frameData?.cumulativeTotal !== null ? frameData.cumulativeTotal : '-'}
                        </div>
                      </div>
                    </TableCell>
                  );
                })}
                {/* Total score for the player */}
                <TableCell className="text-center">{player.total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Game;