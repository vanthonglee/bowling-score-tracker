// apps/frontend/src/hooks/useBowlingLogic.ts
import { useState, useCallback } from 'react';
import { useGameStore } from '../store';
import useSubmitScores from './useSubmitScores';
import { useNavigate } from 'react-router-dom';

// Define the return type for the useBowlingLogic hook
interface UseBowlingLogicResult {
  scores: Record<string, string[]>; // Scores for each player, keyed by playerId
  setScores: (scores: Record<string, string[]>) => void; // Function to update scores
  getRoll2Options: (roll1: string, currentFrame: number) => string[]; // Function to get options for the second roll
  getRoll3Options: (roll1: string, roll2: string, currentFrame: number) => string[]; // Function to get options for the third roll
  isSubmitDisabled: (playerIds: string[], currentFrame: number) => boolean; // Function to check if the submit button should be disabled
  handleSubmit: (gameId: string, currentFrame: number, playerIds: string[]) => void; // Function to submit scores for a frame
  isPending: boolean; // Indicates if a submission is in progress
}

/**
 * Custom hook to manage bowling game logic, including roll selection and score submission.
 * Handles special cases for the 10th frame, where players get up to three rolls if they score a strike or spare.
 * @returns An object containing functions and state for managing bowling game logic.
 */
const useBowlingLogic = (): UseBowlingLogicResult => {
  const { gameId, players, currentFrame, setCurrentFrame, setError } = useGameStore();
  
  // Initialize scores for each player, using playerId as the key
  const [scores, setScores] = useState<Record<string, string[]>>(players.reduce((acc, p) => ({
    ...acc,
    [p.playerId]: ['', '', ''], // Each player starts with three empty rolls
  }), {}));

  const { submitScores, isPending } = useSubmitScores(async (frameNumber) => {
    if (frameNumber < 10) {
      // If not the last frame, advance to the next frame and reset scores
      setCurrentFrame(frameNumber + 1);
      setScores(players.reduce((acc, p) => ({ ...acc, [p.playerId]: ['', '', ''] }), {}));
    } else {
      // If the last frame, navigate to the results page
      navigate('/results');
    }
  });

  const navigate = useNavigate();

  /**
   * Determines the valid options for the second roll based on the first roll and current frame.
   * - In frames 1-9: If the first roll is a strike ('X' or '10'), no second roll is allowed.
   * - In frame 10: If the first roll is a strike, the second roll can be 0-10 or 'X'.
   * - Otherwise, the second roll can be 0 to (10 - first roll), with '/' for a spare if applicable.
   * @param roll1 - The value of the first roll (e.g., 'X', '7', '10').
   * @param currentFrame - The current frame number (1-10).
   * @returns An array of valid options for the second roll.
   */
  const getRoll2Options = useCallback((roll1: string, currentFrame: number): string[] => {
    if (!roll1) return ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'X'];
    if (currentFrame < 10 && (roll1 === 'X' || roll1 === '10')) return []; // No second roll after a strike in frames 1-9
    if (currentFrame === 10 && (roll1 === 'X' || roll1 === '10')) {
      return ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'X']; // Allow all options after a strike in frame 10
    }
    const r1 = roll1 === 'X' ? 10 : parseInt(roll1);
    const options = Array.from({ length: 11 - r1 }, (_, i) => i.toString());
    if (r1 < 10) options.push('/'); // Add spare option if first roll is less than 10
    return options;
  }, []);

  /**
   * Determines the valid options for the third roll, which is only applicable in the 10th frame.
   * - If the first roll is a strike ('X') or the first two rolls make a spare (e.g., '7 /'), a third roll is allowed.
   * - Options are 0-10 and 'X' for a strike.
   * @param roll1 - The value of the first roll (e.g., 'X', '7', '10').
   * @param roll2 - The value of the second roll (e.g., 'X', '/', '3').
   * @param currentFrame - The current frame number (1-10).
   * @returns An array of valid options for the third roll.
   */
  const getRoll3Options = useCallback((roll1: string, roll2: string, currentFrame: number): string[] => {
    if (currentFrame !== 10 || !roll1 || !roll2) return [];
    const r1 = roll1 === 'X' ? 10 : parseInt(roll1);
    const r2 = roll2 === '/' ? 10 - r1 : (roll2 === 'X' ? 10 : parseInt(roll2 || '0'));
    if (r1 === 10 || (r1 + r2 === 10)) {
      return ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'X'];
    }
    return [];
  }, []);

  /**
   * Checks if the "Submit Scores" button should be disabled.
   * - In frames 1-9: Requires a first roll for all players; if not a strike, a second roll is also required.
   * - In frame 10:
   *   - If a strike on Roll 1 or a spare on Rolls 1+2, requires a third roll.
   *   - If no strike or spare on Rolls 1+2, requires only two rolls.
   * @param playerIds - Array of player IDs to check.
   * @param currentFrame - The current frame number (1-10).
   * @returns True if the submit button should be disabled, false otherwise.
   */
  const isSubmitDisabled = useCallback((playerIds: string[], currentFrame: number): boolean => {
    return playerIds.some(playerId => {
      const [r1, r2, r3] = scores[playerId] || ['', '', ''];
      if (!r1) return true; // First roll is required
      if (currentFrame < 10) {
        return r1 !== 'X' && r1 !== '10' && !r2; // Second roll required if not a strike
      } else {
        if (!r2) return true; // Second roll is always required in frame 10
        const r1Value = r1 === 'X' ? 10 : parseInt(r1);
        const r2Value = r2 === '/' ? 10 - r1Value : (r2 === 'X' ? 10 : parseInt(r2));
        if (r1 === 'X' || (r1Value + r2Value === 10)) {
          return !r3; // Third roll required if strike or spare in frame 10
        }
        return false; // Only two rolls required if no strike or spare
      }
    });
  }, [scores]);

  /**
   * Submits the scores for the current frame for all players.
   * - Maps the scores to a rolls array with playerId and submits them via the submitScores function.
   * @param gameId - The ID of the game.
   * @param currentFrame - The current frame number (1-10).
   * @param playerIds - Array of player IDs to submit scores for.
   */
  const handleSubmit = useCallback((gameId: string, currentFrame: number, playerIds: string[]) => {
    const rolls = playerIds.map(playerId => ({
      playerId,
      rolls: scores[playerId].filter(Boolean).map(r => r === 'X' ? 'X' : r === '/' ? '/' : r),
    }));
    submitScores(gameId, currentFrame, rolls);
  }, [scores, submitScores]);

  return {
    scores,
    setScores,
    getRoll2Options,
    getRoll3Options,
    isSubmitDisabled,
    handleSubmit,
    isPending,
  };
};

export default useBowlingLogic;