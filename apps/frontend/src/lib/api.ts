import { ScoreboardEntry } from "@/components/game/types";

// Define API response types
interface StartGameResponse {
  gameId: string;
}

interface SubmitScoresResponse {
  success: boolean;
  error?: string;
}

interface FetchScoreboardResponse {
  scoreboard: ScoreboardEntry[];
}

// Define API request types
interface StartGameRequest {
  players: string[];
}

interface SubmitScoresRequest {
  rolls: { player: string; rolls: string[] }[];
}

// Base URL for the API, ensuring it's defined at build time
const API_URL = process.env.REACT_APP_API_URL;
if (!API_URL) {
  throw new Error('REACT_APP_API_URL environment variable is not defined. Please set it in your environment.');
}

// Helper function to handle API errors
const handleApiError = async (response: Response): Promise<void> => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `API request failed with status ${response.status}: ${response.statusText}`);
  }
};

/**
 * Starts a new game by sending a POST request to the /api/game/start endpoint.
 * @param request - The request payload containing the list of players.
 * @returns A promise that resolves to the game ID.
 * @throws Error if the API request fails.
 */
export const startGame = async (request: StartGameRequest): Promise<StartGameResponse> => {
  const response = await fetch(`${API_URL}/api/game/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  await handleApiError(response);
  return response.json();
};

/**
 * Submits scores for a frame by sending a POST request to the /api/game/{gameId}/frame/{frameNumber}/scores endpoint.
 * @param gameId - The ID of the game.
 * @param frameNumber - The frame number for which scores are being submitted.
 * @param request - The request payload containing the rolls for each player.
 * @returns A promise that resolves to the submission result.
 * @throws Error if the API request fails or the submission is unsuccessful.
 */
export const submitScores = async (
  gameId: string,
  frameNumber: number,
  request: SubmitScoresRequest
): Promise<SubmitScoresResponse> => {
  const response = await fetch(`${API_URL}/api/game/${gameId}/frame/${frameNumber}/scores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  await handleApiError(response);
  const data: SubmitScoresResponse = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to submit scores');
  }
  return data;
};

/**
 * Fetches the scoreboard for a game by sending a GET request to the /api/game/{gameId}/scoreboard endpoint.
 * @param gameId - The ID of the game.
 * @returns A promise that resolves to the scoreboard data.
 * @throws Error if the API request fails.
 */
export const fetchScoreboard = async (gameId: string): Promise<FetchScoreboardResponse> => {
  const response = await fetch(`${API_URL}/api/game/${gameId}/scoreboard`);
  await handleApiError(response);
  return response.json();
};