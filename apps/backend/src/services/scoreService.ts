import { Frame, CalculatedFrame, CalculatedPlayerScore } from '../types';

// Service to handle score calculation logic

// Calculate the score for a player based on their frames
export const calculatePlayerScore = (frames: Frame[]): CalculatedPlayerScore => {
  const resultFrames: CalculatedFrame[] = [];
  let total = 0;
  const flatRolls = frames.flatMap(f => f?.rolls || []);

  for (let i = 0; i < 10; i++) {
    const frame = frames[i] || { rolls: [] };
    let frameScore: number | null = null;
    let display = frame.rolls.length > 0 ? frame.rolls.join(' ') : '-';
    const rollIndex = frames.slice(0, i).reduce((sum, f) => sum + (f?.rolls?.length || 0), 0);

    if (frame.rolls.length > 0) {
      if (i < 9) {
        if (frame.rolls.length === 1 && frame.rolls[0] === 10) {
          display = 'X'; // Strike
        } else if (frame.rolls.length === 2) {
          if (frame.rolls[0] + frame.rolls[1] === 10) {
            display = `${frame.rolls[0]} /`; // Spare
          }
        }
      } else {
        const displayRolls: string[] = [];
        for (let j = 0; j < frame.rolls.length; j++) {
          if (frame.rolls[j] === 10) {
            displayRolls.push('X');
          } else if (j > 0 && frame.rolls[j] === 10 - frame.rolls[j - 1]) {
            displayRolls.push('/');
          } else {
            displayRolls.push(frame.rolls[j].toString());
          }
        }
        display = displayRolls.join(' ');
      }
    }

    if (i < 9) {
      if (frame.rolls.length === 1 && frame.rolls[0] === 10) { // Strike
        if (rollIndex + 2 < flatRolls.length) {
          frameScore = 10 + flatRolls[rollIndex + 1] + flatRolls[rollIndex + 2];
          total += frameScore;
        } else {
          display = 'X';
        }
      } else if (frame.rolls.length === 2) {
        const [r1, r2] = frame.rolls;
        if (r1 + r2 === 10) { // Spare
          if (rollIndex + 2 < flatRolls.length) {
            frameScore = 10 + flatRolls[rollIndex + 2];
            total += frameScore;
          } else {
            display = `${r1} /`;
          }
        } else { // Open
          frameScore = r1 + r2;
          total += frameScore;
        }
      }
    } else if (frame.rolls.length > 0) { // 10th frame
      frameScore = frame.rolls.reduce((a, b) => a + b, 0);
      total += frameScore;
    }

    resultFrames.push({
      rolls: frame.rolls,
      display,
      cumulativeTotal: frameScore !== null ? total : null,
    });
  }

  return { frames: resultFrames, total };
};