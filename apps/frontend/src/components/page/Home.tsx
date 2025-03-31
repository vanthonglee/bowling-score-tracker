// apps/frontend/src/components/page/Home.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGameStore } from '@/store';
import useStartGame from '../../hooks/useStartGame';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';

/**
 * Home page component where users can enter player names and start a new game.
 * Handles name validation, assigns unique player IDs, and resets game state on mount.
 */
const Home = () => {
  const [names, setNames] = useState(['', '', '', '', '']);
  const { setGameId, setPlayers, setCurrentFrame, setError, resetGame } = useGameStore();
  const navigate = useNavigate();

  // Reset game state when the component mounts to ensure a fresh start
  useEffect(() => {
    resetGame();
  }, [resetGame]);

  const nonEmptyNames = names.filter(name => name.trim() !== '');
  const isStartDisabled = nonEmptyNames.length < 2;

  const { startGame, isPending, error } = useStartGame((gameId, players) => {
    setGameId(gameId);
    setPlayers(players); // Use the players returned by the backend
    setCurrentFrame(1);
    setError(null);
    navigate('/game');
  });

  const handleStartGame = () => {
    // Validate and prepare player data
    const players = names
      .map((name, index) => ({
        playerId: uuidv4(),
        name: name.trim(),
      }))
      .filter(player => player.name !== '');

    // Validate player names
    if (players.length < 2) {
      setError('Please enter at least two player names');
      return;
    }

    // Check for invalid characters in names (e.g., only allow letters, numbers, and spaces)
    const invalidName = players.find(player => !/^[a-zA-Z0-9\s]+$/.test(player.name));
    if (invalidName) {
      setError('Player names can only contain letters, numbers, and spaces');
      return;
    }

    // Capitalize the first letter of each name for display
    const playersWithIds = players.map(player => ({
      ...player,
      name: player.name.charAt(0).toUpperCase() + player.name.slice(1).toLowerCase(),
    }));

    startGame(playersWithIds);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bowling-blue-50 to-bowling-green-50 dark:from-bowling-blue-900 dark:to-bowling-green-900 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-card shadow-lg rounded-lg p-6 w-full max-w-md border border-border"
      >
        <h1 className="text-3xl font-bold text-center mb-6 text-bowling-blue dark:text-bowling-blue-400">
          🎳 Bowling Score Tracker
        </h1>

        <div className="space-y-4">
          {names.map((name, i) => (
            <div key={i} className="flex flex-col">
              <Label htmlFor={`player-${i}`} className="mb-1 text-sm font-medium text-muted-foreground">
                Player {i + 1} {i < 2 ? <span className="text-destructive">*</span> : '(Optional)'}
              </Label>
              <Input
                id={`player-${i}`}
                className="border-input focus:ring-bowling-blue dark:focus:ring-bowling-blue-400"
                placeholder={`Enter Player ${i + 1}'s name`}
                value={name}
                onChange={(e) => {
                  const newNames = [...names];
                  newNames[i] = e.target.value;
                  setNames(newNames);
                }}
                aria-label={`Player ${i + 1} name`}
              />
            </div>
          ))}
        </div>

        {isStartDisabled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 flex items-center text-destructive bg-destructive/10 dark:bg-destructive/20 p-2 rounded-md"
            aria-live="polite"
          >
            <AlertCircle className="w-5 h-5 mr-2" />
            <p className="text-sm">Please enter at least two player names to start the game.</p>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 flex items-center text-destructive bg-destructive/10 dark:bg-destructive/20 p-2 rounded-md"
            aria-live="polite"
          >
            <AlertCircle className="w-5 h-5 mr-2" />
            <p className="text-sm">
              {error.message.includes('Failed to fetch')
                ? 'Network error: Could not connect to the server. Please check your connection and try again.'
                : error.message.includes('Invalid number of players')
                ? 'Please enter between 2 and 5 players.'
                : error.message || 'Couldn’t start the game. Please try again.'}
            </p>
          </motion.div>
        )}

        <Button
          onClick={handleStartGame}
          disabled={isStartDisabled || isPending}
          className="mt-6 w-full bg-bowling-blue hover:bg-bowling-blue-700 dark:bg-bowling-blue-600 dark:hover:bg-bowling-blue-500 transition-colors"
          aria-label="Start a new game"
        >
          {isPending ? 'Starting...' : 'Start Game'}
        </Button>
      </motion.div>
    </div>
  );
};

export default Home;