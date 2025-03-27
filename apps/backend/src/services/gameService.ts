// services/gameService.ts
// Service to handle game logic and validation

// Parse and validate rolls for a frame
export const parseRolls = (rolls: string[], frame: number): number[] => {
  const cleanedRolls = rolls.map(r => r?.trim()).filter(r => r !== '' && r !== undefined);
  const parsed: number[] = [];

  const maxRolls = frame < 10 ? 2 : 3;
  if (cleanedRolls.length === 0 || cleanedRolls.length > maxRolls) {
    throw new Error(`Invalid number of rolls for frame ${frame}: expected up to ${maxRolls} rolls, got ${cleanedRolls.length}`);
  }

  for (let i = 0; i < cleanedRolls.length; i++) {
    const roll = cleanedRolls[i];
    if (roll === 'X') {
      parsed.push(10);
    } else if (roll === '/' && i > 0) {
      if (parsed[i - 1] === 10) {
        throw new Error('Cannot have a spare after a strike');
      }
      parsed.push(10 - parsed[i - 1]);
    } else {
      const num = parseInt(roll);
      if (isNaN(num) || num < 0 || num > 10) {
        throw new Error(`Invalid roll value: ${roll}`);
      }
      parsed.push(num);
    }
  }

  if (frame < 10) {
    if (parsed.length === 1 && parsed[0] === 10) {
      return parsed; // Strike
    }
    if (parsed.length === 2) {
      if (parsed[0] === 10) {
        throw new Error('A strike in frames 1-9 should only have one roll');
      }
      if (parsed[0] + parsed[1] > 10 && parsed[1] !== (10 - parsed[0])) {
        throw new Error(`Invalid rolls: ${parsed[0]} + ${parsed[1]} exceeds 10 without a spare`);
      }
      return parsed; // Spare or open
    }
    throw new Error('Invalid rolls for frame: expected 1 roll for a strike or 2 rolls for spare/open');
  } else {
    // 10th frame validation
    if (parsed.length === 2) {
      if (parsed[0] === 10 || (parsed[0] + parsed[1] === 10 && parsed[1] !== 0)) {
        throw new Error('10th frame with a strike or spare requires 3 rolls');
      }
      if (parsed[0] + parsed[1] < 10) {
        return parsed; // Open frame, 2 rolls are fine
      }
      throw new Error(`Invalid rolls in 10th frame: ${parsed[0]} + ${parsed[1]} exceeds 10 without a spare`);
    }
    if (parsed.length === 3) {
      if (parsed[0] === 10 || (parsed[0] + parsed[1] === 10 && parsed[1] !== 0)) {
        return parsed; // Strike or spare, 3 rolls are correct
      }
      throw new Error('Third roll in 10th frame is only allowed after a strike or spare');
    }
    throw new Error('Invalid rolls for 10th frame: expected 2 rolls for an open frame or 3 rolls for a strike/spare');
  }
};