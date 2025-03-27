import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { parseRolls } from '../services/gameService';
import { calculatePlayerScore } from '../services/scoreService';
import { Game, Player, ApiError } from '../types';

// In-memory store for games (temporary until a database is added)
const games: Record<string, Game> = {};

interface SubmitScoreRequest extends Request {
  body: {
    player: string;
    rolls: string[];
  };
}

interface StartGameRequest extends Request {
  body: {
    players: string[];
  };
}

const router = Router();

// Start a new game
router.post('/start', (req: StartGameRequest, res: Response) => {
  const { players } = req.body;
  if (!players || players.length < 1 || players.length > 5) {
    throw new ApiError(400, 'Invalid number of players');
  }

  try {
    const game: Game = {
      gameId: uuidv4(),
      players: players.map((name: string) => ({ name, frames: [] })),
    };
    games[game.gameId] = game;
    res.json({ gameId: game.gameId });
  } catch (error) {
    throw new ApiError(500, 'Failed to start game');
  }
});

// Submit scores for a frame
router.post('/:gameId/frame/:frameNumber', (req: SubmitScoreRequest, res: Response) => {
  const { gameId, frameNumber } = req.params;
  const { player, rolls } = req.body;

  if (!player || !rolls || !Array.isArray(rolls)) {
    throw new ApiError(400, 'Invalid request: player and rolls are required');
  }

  const frameNum = parseInt(frameNumber);
  if (isNaN(frameNum) || frameNum < 1 || frameNum > 10) {
    throw new ApiError(400, 'Invalid frame number');
  }

  const game = games[gameId];
  if (!game) throw new ApiError(404, 'Game not found');

  const playerObj = game.players.find((p: Player) => p.name === player);
  if (!playerObj) throw new ApiError(404, 'Player not found');

  const parsedRolls = parseRolls(rolls, frameNum);
  playerObj.frames[frameNum - 1] = { rolls: parsedRolls };
  res.json({ success: true });
});

// Get the scoreboard for a game
router.get('/:gameId/scoreboard', (req: Request, res: Response) => {
  const { gameId } = req.params;

  const game = games[gameId];
  if (!game) throw new ApiError(404, 'Game not found');

  const scoreboard = game.players.map((player: Player) => {
    const { frames, total } = calculatePlayerScore(player.frames);
    return { name: player.name, frames, total };
  });
  res.json({ scoreboard });
});

export default router;