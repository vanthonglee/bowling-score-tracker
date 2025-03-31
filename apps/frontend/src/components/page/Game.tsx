// apps/frontend/src/components/page/Game.tsx
import { useDeferredValue, useEffect, useState } from 'react';
import { useGameStore } from '../../store';
import { Button } from '../ui/button';
import Scoreboard from '../game/Scoreboard';
import PlayerRollSelector from '../game/PlayerRollSelector';
import useBowlingLogic from '@/hooks/useBowlingLogic';
import useFetchScoreboard from '@/hooks/useFetchScoreboard';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Game = () => {
  const { gameId, players, currentFrame, setError, setScoreboard } = useGameStore();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<Error | null>(null);

  useEffect(() => {
    if (!gameId) {
      console.log('gameId is null, redirecting to Home');
      navigate('/', { replace: true });
    }
  }, [gameId, navigate]);

  const { data, isLoading, error } = useFetchScoreboard(gameId || '');

  useEffect(() => {
    if (data) {
      setScoreboard(data.scoreboard);
    }
  }, [data, setScoreboard]);

  useEffect(() => {
    if (error) {
      setError('Failed to load scoreboard. Please try again.');
    }
  }, [error, setError]);

  const {
    scores,
    setScores,
    getRoll2Options,
    getRoll3Options,
    isSubmitDisabled,
    handleSubmit,
    isPending,
  } = useBowlingLogic();

  if (!gameId) {
    return null;
  }

  if (isLoading) {
    return <div className="text-center text-muted-foreground">Loading scoreboard...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-destructive">
        Error loading scoreboard: {error.message}
      </div>
    );
  }

  const scoreboard = data?.scoreboard;
  if (!scoreboard) {
    return <div className="text-center text-muted-foreground">No scores available yet.</div>;
  }

  const submitDisabled = isSubmitDisabled(
    players.map(player => player.playerId),
    currentFrame
  ) || isPending;

  // Create a map to track duplicate names and assign suffixes
  const nameCounts: Record<string, number> = {};
  const displayNames: Record<string, string> = {};

  players.forEach(player => {
    const name = player.name;
    nameCounts[name] = (nameCounts[name] || 0) + 1;
    const count = nameCounts[name];
    displayNames[player.playerId] = count > 1 ? `${name} (${count})` : name;
  });

  const handleSubmitWithErrorHandling = async () => {
    try {
      setSubmitError(null);
      await handleSubmit(
        gameId,
        currentFrame,
        players.map(player => player.playerId)
      );
    } catch (err: any) {
      setSubmitError(err);
      console.error('Error submitting scores:', err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bowling-blue-50 to-bowling-green-50 dark:from-bowling-blue-900 dark:to-bowling-green-900 p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto"
      >
        <div className="flex justify-between items-center mb-6 bg-card shadow-md rounded-lg p-4 border border-border">
          <h1 className="text-2xl font-bold text-bowling-blue dark:text-bowling-blue-400">
            🎳 Frame {currentFrame} of 10
          </h1>
          <div className="text-sm text-muted-foreground">
            {players.length} Players
          </div>
        </div>

        <div className="space-y-6">
          {players.map(player => (
            <motion.div
              key={player.playerId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card shadow-md rounded-lg p-4 border-l-4 border-bowling-blue"
            >
              <PlayerRollSelector
                player={player.playerId}
                scores={scores}
                setScores={setScores}
                getRoll2Options={getRoll2Options}
                getRoll3Options={getRoll3Options}
                currentFrame={currentFrame}
              />
            </motion.div>
          ))}
        </div>

        <div className="mt-6">
          <Button
            onClick={handleSubmitWithErrorHandling}
            disabled={submitDisabled}
            className={`w-full md:w-auto transition-colors ${
              submitDisabled
                ? 'opacity-50 cursor-not-allowed'
                : 'bg-bowling-blue hover:bg-bowling-blue-700 dark:bg-bowling-blue-600 dark:hover:bg-bowling-blue-500'
            }`}
            aria-label="Submit scores"
          >
            {isPending ? 'Submitting...' : 'Submit Scores'}
          </Button>
          {submitDisabled && !isPending && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-sm text-muted-foreground flex items-center"
            >
              <AlertCircle className="w-4 h-4 mr-1" />
              Please complete all rolls for this frame to submit.
            </motion.p>
          )}
          {submitError && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-sm text-destructive flex items-center"
            >
              <AlertCircle className="w-4 h-4 mr-1" />
              {submitError.message.includes('Player with ID')
                ? 'Game state mismatch. Please start a new game.'
                : submitError.message || 'Failed to submit scores. Please try again.'}
            </motion.p>
          )}
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Scoreboard</h2>
          <Scoreboard
            scoreboard={scoreboard?.map(entry => ({
              ...entry,
              name: displayNames[entry.playerId] || entry.name,
            }))}
            currentFrame={currentFrame}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default Game;