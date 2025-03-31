// apps/frontend/src/components/game/Scoreboard.tsx
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScoreboardEntry, ScoreboardProps } from './types';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

/**
 * Displays the scoreboard for a bowling game, showing each player's rolls and cumulative scores per frame.
 * @param scoreboard - Array of scoreboard entries for all players.
 * @param currentFrame - The current frame number (optional, for highlighting).
 * @param winners - Array of playerIds of the winners (optional, for highlighting).
 */
const Scoreboard: React.FC<ScoreboardProps> = ({ scoreboard, currentFrame, winners }) => {
  // Handle empty or undefined scoreboard
  if (!scoreboard || scoreboard.length === 0) {
    return <div className="text-center text-muted-foreground">No scores available yet.</div>;
  }

  return (
    <div className="space-y-4">
      {/* Progress Indicator: Shows which frames have been completed */}
      <TooltipProvider>
        <div className="flex justify-center gap-2 mb-4">
          {Array.from({ length: 10 }, (_, i) => i + 1).map(frame => (
            <Tooltip key={frame}>
              <TooltipTrigger asChild>
                <div
                  className={`w-5 h-5 rounded-full transition-all duration-300 ${
                    frame < (currentFrame || 0)
                      ? 'bg-bowling-blue' // Completed frames
                      : frame === (currentFrame || 0)
                      ? 'bg-bowling-blue scale-125 border-2 border-bowling-blue-700' // Current frame
                      : 'bg-muted' // Upcoming frames
                  }`}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>Frame {frame}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>

      {/* Scoreboard Table */}
      <div className="overflow-x-auto rounded-lg shadow-lg border border-border">
        <Table className="min-w-full">
          {/* Table Header */}
          <TableHeader>
            <TableRow className="bg-bowling-blue-50 dark:bg-bowling-blue-900/50 sticky top-0 z-10">
              <TableHead className="w-[150px] text-left font-semibold text-foreground px-4 py-3 border-r border-border">
                Player
              </TableHead>
              {Array.from({ length: 10 }, (_, i) => i + 1).map(frame => (
                <TableHead
                  key={frame}
                  className={`text-center font-semibold text-foreground px-4 py-3 border-r border-border ${
                    currentFrame && frame === currentFrame ? 'bg-bowling-blue-200 dark:bg-bowling-blue-800' : ''
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    {frame}
                    {currentFrame && frame === currentFrame && (
                      <span className="text-bowling-blue dark:text-bowling-blue-400 text-xs font-bold">
                        ⬤
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
              <TableHead className="text-center font-semibold text-foreground px-4 py-3">
                Total
              </TableHead>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody>
            {scoreboard.map(player => {
              // Determine if the player has the highest score in a given frame
              const isHighestInFrame = (frame: number) =>
                player.frames[frame - 1]?.cumulativeTotal !== null &&
                player.frames[frame - 1]?.cumulativeTotal === Math.max(
                  ...scoreboard
                    .map(p => p.frames[frame - 1]?.cumulativeTotal)
                    .filter(score => score !== null && score !== undefined)
                );

              return (
                <TableRow
                  key={player.playerId}
                  className="border-t border-border hover:bg-muted/50 transition-colors"
                >
                  {/* Player Name */}
                  <TableCell className="w-[150px] font-medium text-foreground px-4 py-3 border-r border-border">
                    {player.name}
                  </TableCell>

                  {/* Frame Cells */}
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(frame => {
                    const frameData = player.frames[frame - 1];
                    const isCurrentFrame = currentFrame && frame === currentFrame;

                    return (
                      <TableCell
                        key={frame}
                        className={`px-2 py-0 border-r border-border ${
                          isCurrentFrame
                            ? 'bg-bowling-blue-200 dark:bg-bowling-blue-800'
                            : isHighestInFrame(frame)
                            ? 'bg-bowling-green-50 dark:bg-bowling-green-900/50'
                            : ''
                        }`}
                      >
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          className="flex flex-col items-center justify-center h-20"
                        >
                          {/* Frame Display (e.g., 'X', '7 /', '7 3') */}
                          <div
                            className={`text-sm font-medium rounded-full px-2 py-1 ${
                              frameData?.display === 'X'
                                ? 'bg-bowling-blue-100 dark:bg-bowling-blue-900 text-bowling-blue dark:text-bowling-blue-400'
                                : frameData?.display?.includes('/')
                                ? 'bg-bowling-green-100 dark:bg-bowling-green-900 text-bowling-green dark:text-bowling-green-400'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {frameData?.display || '-'}
                          </div>
                          {/* Cumulative Total */}
                          <div className="text-lg font-semibold text-foreground mt-1">
                            {frameData?.cumulativeTotal !== null ? frameData.cumulativeTotal : '-'}
                          </div>
                        </motion.div>
                      </TableCell>
                    );
                  })}

                  {/* Total Score */}
                  <TableCell
                    className={`text-center px-4 py-3 font-bold ${
                      winners && winners.includes(player.playerId)
                        ? 'text-bowling-green dark:text-bowling-green-400'
                        : 'text-foreground'
                    }`}
                  >
                    {player.total}
                    {winners && winners.includes(player.playerId) && (
                      <span className="ml-2 text-sm text-bowling-green dark:text-bowling-green-400">
                        (Winner)
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Scoreboard;