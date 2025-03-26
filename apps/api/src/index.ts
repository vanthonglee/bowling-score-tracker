import express, { Request, Response } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' }));

interface Game {
  gameId: string;
  players: Player[];
}

interface Player {
  name: string;
  frames: Frame[];
}

interface Frame {
  rolls: number[];
}

const games: Game[] = [];

app.post('/api/game/start', (req: Request, res: Response) => {
  const { players } = req.body;
  if (!players || players.length < 1 || players.length > 5) {
    return res.status(400).json({ error: 'Invalid number of players' });
  }
  const game: Game = {
    gameId: uuidv4(),
    players: players.map((name: string) => ({ name, frames: [] })),
  };
  games.push(game);
  res.json({ gameId: game.gameId });
});

app.post('/api/game/:gameId/frame/:frameNumber', (req: Request, res: Response) => {
  const { gameId, frameNumber } = req.params;
  const { player, rolls } = req.body;

  if (!player || !rolls || !Array.isArray(rolls)) {
    return res.status(400).json({ error: 'Invalid request: player and rolls are required' });
  }

  const game = games.find(g => g.gameId === gameId);
  if (!game) return res.status(404).json({ error: 'Game not found' });
  const playerObj = game.players.find(p => p.name === player);
  if (!playerObj) return res.status(404).json({ error: 'Player not found' });

  const frameNum = parseInt(frameNumber);
  if (isNaN(frameNum) || frameNum < 1 || frameNum > 10) {
    return res.status(400).json({ error: 'Invalid frame number' });
  }

  try {
    const parsedRolls = parseRolls(rolls, frameNum);
    playerObj.frames[frameNum - 1] = { rolls: parsedRolls };
    res.json({ success: true });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.get('/api/game/:gameId/scoreboard', (req: Request, res: Response) => {
  const { gameId } = req.params;
  const game = games.find(g => g.gameId === gameId);
  if (!game) return res.status(404).json({ error: 'Game not found' });

  const scoreboard = game.players.map(player => {
    const { frames, total } = calculatePlayerScore(player.frames);
    return { name: player.name, frames, total };
  });
  res.json({ scoreboard });
});

function parseRolls(rolls: string[], frame: number): number[] {
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
    }
    if (parsed.length === 3) {
      if (parsed[0] === 10 || (parsed[0] + parsed[1] === 10 && parsed[1] !== 0)) {
        return parsed; // Strike or spare, 3 rolls are correct
      }
      throw new Error('Third roll in 10th frame is only allowed after a strike or spare');
    }
    throw new Error('Invalid rolls for 10th frame: expected 2 rolls for an open frame or 3 rolls for a strike/spare');
  }
}

function calculatePlayerScore(frames: Frame[]): {
  frames: { rolls: number[]; display: string; cumulativeTotal: number | null }[];
  total: number;
} {
  const resultFrames: { rolls: number[]; display: string; cumulativeTotal: number | null }[] = [];
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
          display = 'X';
        } else if (frame.rolls.length === 2) {
          if (frame.rolls[0] + frame.rolls[1] === 10) {
            display = `${frame.rolls[0]} /`;
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
}

app.listen(8080, () => console.log('Backend running on http://localhost:8080'));