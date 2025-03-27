import { ScoreboardEntry } from "@/components/game/types";

// Ensure REACT_APP_API_URL is defined at build time
if (!process.env.REACT_APP_API_URL) {
  throw new Error('REACT_APP_API_URL environment variable is not defined. Please set it in your environment.');
}
const apiUrl = process.env.REACT_APP_API_URL;

// Start a new game
export const startGame = async (players: string[]): Promise<{ gameId: string }> => {
  const res = await fetch(`${apiUrl}/api/game/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ players }),
  });
  if (!res.ok) {
    throw new Error(`Failed to start game: ${res.status}`);
  }
  return res.json();
};

// Submit scores for all players in a frame
export const submitScores = async (
  gameId: string,
  frameNumber: number,
  rolls: { player: string; rolls: string[] }[]
): Promise<{ success: boolean }> => {
  const res = await fetch(`${apiUrl}/api/game/${gameId}/frame/${frameNumber}/scores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rolls }),
  });
  if (!res.ok) {
    throw new Error(`Failed to submit scores: ${res.status}`);
  }
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to submit scores');
  }
  return data;
};

// Fetch the scoreboard for a game
export const fetchScoreboard = async (gameId: string): Promise<{ scoreboard: ScoreboardEntry[] }> => {
  const res = await fetch(`${apiUrl}/api/game/${gameId}/scoreboard`);
  if (!res.ok) {
    throw new Error(`Failed to fetch scoreboard: ${res.status}`);
  }
  return res.json();
};