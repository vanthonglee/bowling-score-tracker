// routes/gameRoutes.ts
import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { parseRolls } from '../services/gameService';
import { calculatePlayerScore } from '../services/scoreService';

// In-memory store for games (temporary until a database is added)
const games: Record<string, any> = {};

// Define the structure of a frame
interface Frame {
  rolls: number[];
}

// Define the structure of a player
interface Player {
  name: string;
  frames: Frame[];
}

// Define the structure of a game
interface Game {
  gameId: string;
  players: Player[];
}

const router = Router();

// Start a new game
router.post('/start', (req: Request, res: Response) => {
  const { players } = req.body;
  if (!players || players.length < 1 || players.length > 5) {
    return res.status(400).json({ error: 'Invalid number of players' });
  }

  try {
    const game: Game = {
      gameId: uuidv4(),
      players: players.map((name: string) => ({ name, frames: [] })),
    };
    games[game.gameId] = game;
    res.json({ gameId: game.gameId });
  } catch (error) {
    console.error('Error starting game:', error);
    res.status(500).json({ error: 'Failed to start game' });
  }
});

// Submit scores for a frame
router.post('/:gameId/frame/:frameNumber', (req: Request, res: Response) => {
  const { gameId, frameNumber } = req.params;
  const { player, rolls } = req.body;

  if (!player || !rolls || !Array.isArray(rolls)) {
    return res.status(400).json({ error: 'Invalid request: player and rolls are required' });
  }

  const frameNum = parseInt(frameNumber);
  if (isNaN(frameNum) || frameNum < 1 || frameNum > 10) {
    return res.status(400).json({ error: 'Invalid frame number' });
  }

  try {
    const game = games[gameId];
    if (!game) return res.status(404).json({ error: 'Game not found' });

    const playerObj = game.players.find((p: Player) => p.name === player);
    if (!playerObj) return res.status(404).json({ error: 'Player not found' });

    const parsedRolls = parseRolls(rolls, frameNum);
    playerObj.frames[frameNum - 1] = { rolls: parsedRolls };
    res.json({ success: true });
  } catch (error) {
    console.error('Error submitting scores:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get the scoreboard for a game
router.get('/:gameId/scoreboard', (req: Request, res: Response) => {
  const { gameId } = req.params;

  try {
    const game = games[gameId];
    if (!game) return res.status(404).json({ error: 'Game not found' });

    const scoreboard = game.players.map((player: Player) => {
      const { frames, total } = calculatePlayerScore(player.frames);
      return { name: player.name, frames, total };
    });
    res.json({ scoreboard });
  } catch (error) {
    console.error('Error fetching scoreboard:', error);
    res.status(500).json({ error: 'Failed to fetch scoreboard' });
  }
});

export default router;