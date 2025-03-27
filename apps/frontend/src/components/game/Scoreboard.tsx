// components/Scoreboard.tsx
import React, { memo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScoreboardEntry, ScoreboardProps } from './types';

// Scoreboard component to display the scores for all players
const Scoreboard = ({ scoreboard, currentFrame, winners }: ScoreboardProps & { winners?: string[] }) => {
  // Guard against undefined scoreboard
  if (!scoreboard) {
    return <div>No scores available yet.</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {/* Player column with compact width */}
          <TableHead className="w-[100px] text-center">Player</TableHead>
          {/* Frame columns */}
          {Array.from({ length: 10 }, (_, i) => i + 1).map(frame => (
            <TableHead
              key={frame}
              className={`text-center ${currentFrame && frame === currentFrame ? 'bg-blue-100' : ''}`}
            >
              {frame}
            </TableHead>
          ))}
          {/* Total column at the right end */}
          <TableHead className="text-center">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {scoreboard.map(player => (
          <TableRow key={player.name}>
            {/* Player name with compact width */}
            <TableCell className="w-[100px]">{player.name}</TableCell>
            {/* Frame cells with rolls and cumulative totals */}
            {Array.from({ length: 10 }, (_, i) => i + 1).map(frame => {
              const frameData = player.frames[frame - 1];
              return (
                <TableCell
                  key={frame}
                  className={`p-0 ${currentFrame && frame === currentFrame ? 'bg-blue-100' : ''}`}
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
            {/* Total score for the player, highlighted if winner */}
            <TableCell
              className={`text-center ${winners && winners.includes(player.name) ? 'font-bold text-green-600' : ''}`}
            >
              {player.total} {winners && winners.includes(player.name) ? '(Winner)' : ''}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default Scoreboard;