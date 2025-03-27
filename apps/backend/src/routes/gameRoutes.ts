import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { parseRolls } from '../services/gameService';
import { calculatePlayerScore } from '../services/scoreService';
import { Game, Player, ApiError } from '../types';

// In-memory store for games (temporary until a database is added)
const games: Record<string, Game> = {};

interface StartGameRequest extends Request {
  body: {
    players: string[];
  };
}

interface SubmitScoresRequest extends Request {
  body: {
    rolls: { player: string; rolls: string[] }[]; // Array of player rolls for the frame
  };
}

const router = Router();

// Start a new game
router.post('/start', (req: StartGameRequest, res: Response) => {
  const { players } = req.body;
  if (!players || players.length < 2 || players.length > 5) {
    throw new ApiError(400, 'Invalid number of players. Must be between 2 and 5.');
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

// Submit scores for all players in a frame
router.post('/:gameId/frame/:frameNumber/scores', (req: SubmitScoresRequest, res: Response) => {
  const { gameId, frameNumber } = req.params;
  const { rolls } = req.body;

  if (!rolls || !Array.isArray(rolls)) {
    throw new ApiError(400, 'Invalid request: rolls array is required');
  }

  const frameNum = parseInt(frameNumber);
  if (isNaN(frameNum) || frameNum < 1 || frameNum > 10) {
    throw new ApiError(400, 'Invalid frame number');
  }

  const game = games[gameId];
  if (!game) throw new ApiError(404, 'Game not found');

  // Validate and store rolls for each player
  try {
    rolls.forEach(({ player, rolls: playerRolls }) => {
      const playerObj = game.players.find((p: Player) => p.name === player);
      if (!playerObj) throw new ApiError(404, `Player ${player} not found`);

      const parsedRolls = parseRolls(playerRolls, frameNum);
      playerObj.frames[frameNum - 1] = { rolls: parsedRolls };
    });
    res.json({ success: true });
  } catch (error) {
    throw error instanceof ApiError ? error : new ApiError(400, 'Failed to submit scores');
  }
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