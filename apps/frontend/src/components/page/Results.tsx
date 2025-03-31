// apps/frontend/src/components/page/Results.tsx
import { useEffect, useState } from 'react';
import { useGameStore } from '../../store';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import Scoreboard from '../game/Scoreboard';
import useFetchScoreboard from '@/hooks/useFetchScoreboard';
import { Trophy, PartyPopper } from 'lucide-react';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';

const Results = () => {
  const { gameId, scoreboard, setGameId, setPlayers, setCurrentFrame, setScoreboard, setError, resetGame } = useGameStore();
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!gameId) {
      console.log('gameId is null, redirecting to Home from Results');
      navigate('/', { replace: true });
    }
  }, [gameId, navigate]);

  const { data, isLoading, error } = useFetchScoreboard(gameId || '');

  useEffect(() => {
    if (data && data.scoreboard) {
      setScoreboard(data.scoreboard);
    }
  }, [data, setScoreboard]);

  useEffect(() => {
    if (error) {
      setError('Failed to load game results. Please try again.');
    }
  }, [error, setError]);

  const handleNewGame = () => {
    resetGame(); // Reset the game state before navigating
    navigate('/');
  };

  const displayScoreboard = scoreboard && scoreboard.length > 0 ? scoreboard : data?.scoreboard;

  if (!displayScoreboard || displayScoreboard.length === 0) {
    navigate('/', { replace: true });
    return null;
  }

  const highestScore = Math.max(...displayScoreboard.map(player => player.total));
  const winners = displayScoreboard
    .filter(player => player.total === highestScore)
    .map(player => player.playerId);

  useEffect(() => {
    if (winners.length > 0) {
      setShowConfetti(true);
    }
  }, [winners]);

  if (isLoading) {
    return <div className="text-center text-muted-foreground">Loading results...</div>;
  }

  if (error) {
    return <div className="text-center text-destructive">Error loading results: {error.message}</div>;
  }

  // Create a map to track duplicate names and assign suffixes
  const nameCounts: Record<string, number> = {};
  const displayNames: Record<string, string> = {};

  displayScoreboard.forEach(player => {
    const name = player.name;
    nameCounts[name] = (nameCounts[name] || 0) + 1;
    const count = nameCounts[name];
    displayNames[player.playerId] = count > 1 ? `${name} (${count})` : name;
  });

  // Update winner names for display
  const winnerNames = winners.map(playerId => displayNames[playerId] || '');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bowling-blue-50 to-bowling-green-50 dark:from-bowling-blue-900 dark:to-bowling-green-900 p-4 md:p-6">
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
        />
      )}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-card shadow-lg rounded-lg p-6 w-full max-w-4xl border border-border"
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-bowling-blue dark:text-bowling-blue-400 flex items-center justify-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-500 dark:text-yellow-400" />
            Game Results
          </h1>
        </div>

        {winners.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-bowling-green-50 dark:bg-bowling-green-900/50 border border-bowling-green-200 dark:border-bowling-green-800 rounded-lg p-4 mb-6 text-center"
          >
            <div className="flex items-center justify-center gap-2">
              <PartyPopper className="w-6 h-6 text-bowling-green dark:text-bowling-green-400" />
              <p className="text-lg font-semibold text-bowling-green dark:text-bowling-green-400">
                Winner{winners.length > 1 ? 's' : ''}: {winnerNames.join(', ')}
              </p>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {winners.length > 1 ? 'It’s a tie! Amazing game!' : 'Congratulations on an amazing game!'}
            </p>
          </motion.div>
        )}

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Scoreboard</h2>
          <Scoreboard
            scoreboard={displayScoreboard.map(entry => ({
              ...entry,
              name: displayNames[entry.playerId] || entry.name,
            }))}
            winners={winners}
          />
        </div>

        <div className="mt-8 text-center">
          <Button
            onClick={handleNewGame}
            className="w-full md:w-auto bg-bowling-blue hover:bg-bowling-blue-700 dark:bg-bowling-blue-600 dark:hover:bg-bowling-blue-500 transition-colors"
            aria-label="Start a new game"
          >
            New Game
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Results;