// frontend/hooks/useBowlingLogic.ts
import { useState, useTransition } from 'react';
import { useGameStore } from '../store';
import useSubmitScores from '../hooks/useSubmitScores';
import { useNavigate } from 'react-router-dom';

// Define the structure of the scores state
type Scores = Record<string, string[]>;

// Define the return type of the custom hook
interface BowlingLogic {
  scores: Scores; // Current scores for all players
  setScores: (scores: Scores) => void; // Function to update scores
  getRoll2Options: (roll1: string, currentFrame: number) => string[]; // Function to get Roll 2 options
  getRoll3Options: (roll1: string, roll2: string, currentFrame: number) => string[]; // Function to get Roll 3 options
  isSubmitDisabled: (players: string[], currentFrame: number) => boolean; // Function to validate if submission is disabled
  handleSubmit: (gameId: string, currentFrame: number, players: string[]) => Promise<void>; // Function to handle score submission
  isPending: boolean; // Flag to indicate if submission is in progress
}

// Custom hook to handle bowling game logic
const useBowlingLogic = (): BowlingLogic => {
  // State management using Zustand store
  const { setCurrentFrame, setError } = useGameStore();
  const navigate = useNavigate();
  const [scores, setScores] = useState<Scores>({}); // Scores for each player (Roll 1, Roll 2, Roll 3)
  const [isPending, startTransition] = useTransition(); // For handling non-urgent state updates

  // Use the custom hook for submitting scores
  const { submitScores, isPending: isSubmitting, error } = useSubmitScores((frameNumber) => {
    setScores({});
    setCurrentFrame(frameNumber + 1);
    setError(null);
    // Navigate to Results screen after the 10th frame
    if (frameNumber === 10) {
      navigate('/results');
    }
  });

  // Handle error from API call
  if (error) {
    setError('Failed to submit scores. Please try again.');
  }

  // Determine valid options for Roll 2 based on Roll 1
  const getRoll2Options = (roll1: string, currentFrame: number): string[] => {
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
  const getRoll3Options = (roll1: string, roll2: string, currentFrame: number): string[] => {
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
  const isSubmitDisabled = (players: string[], currentFrame: number): boolean => {
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
        const roll3Options = getRoll3Options(roll1, roll2, currentFrame);
        if (roll3Options.length > 0 && !roll3) return true;
      }
    }
    return false;
  };

  // Handle score submission with useTransition for better UI responsiveness
  const handleSubmit = async (gameId: string, currentFrame: number, players: string[]) => {
    startTransition(() => {
      // Prepare the rolls for all players in a single request
      const rolls = players.map(player => {
        let playerRolls = scores[player] || ['', '', ''];
        if (currentFrame < 10 && (playerRolls[0] === 'X' || playerRolls[0] === '10')) {
          playerRolls = [playerRolls[0]]; // Only send Roll 1 for strikes in frames 1-9
        } else if (currentFrame === 10) {
          // 10th frame: Only send Roll 3 if it's a strike or spare
          const roll1Value = playerRolls[0] === 'X' || playerRolls[0] === '10' ? 10 : parseInt(playerRolls[0]);
          const roll2Value = playerRolls[1] === 'X' || playerRolls[1] === '10' ? 10 : playerRolls[1] === '/' ? 10 - roll1Value : parseInt(playerRolls[1]);
          const roll3Options = getRoll3Options(playerRolls[0], playerRolls[1], currentFrame);
          if (roll3Options.length === 0) {
            // Open frame: Only send two rolls
            playerRolls = [playerRolls[0], playerRolls[1]];
          }
        }
        return { player, rolls: playerRolls };
      });

      submitScores(gameId, currentFrame, rolls);
    });
  };

  return {
    scores,
    setScores,
    getRoll2Options,
    getRoll3Options,
    isSubmitDisabled,
    handleSubmit,
    isPending: isSubmitting,
  };
};

export default useBowlingLogic;