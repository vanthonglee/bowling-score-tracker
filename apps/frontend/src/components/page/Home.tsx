import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGameStore } from '@/store';
import useStartGame from '../../hooks/useStartGame';
import { useNavigate } from 'react-router-dom';

// Home component for starting a new game
const Home = () => {
  // State for player names input
  const [names, setNames] = useState(['', '', '', '', '']);
  // State management using Zustand store
  const { setGameId, setPlayers, setCurrentFrame, setError } = useGameStore();
  const navigate = useNavigate();

  // Check if at least two players have entered their names to enable the Start Game button
  const nonEmptyNames = names.filter(name => name.trim() !== '');
  const isStartDisabled = nonEmptyNames.length < 2;

  // Use the custom hook for starting a game
  const { startGame, isPending, error } = useStartGame((gameId) => {
    setGameId(gameId);
    setPlayers(names.filter(name => name.trim()));
    setCurrentFrame(1);
    setError(null);
    // Navigate to the Game screen after the mutation succeeds
    navigate('/game');
  });

  // Handle starting a new game
  const handleStartGame = () => {
    const players = names.filter(name => name.trim());
    if (players.length < 2) {
      setError('Please enter at least two player names');
      return;
    }
    startGame(players);
  };

  // Handle error from API call
  if (error) {
    setError('Couldn’t start the game. Please try again.');
  }

  return (
    <div className="p-4">
      {/* Page title */}
      <h1 className="text-2xl mb-4">Bowling Score Tracker</h1>
      {/* Input fields for player names */}
      {names.map((name, i) => (
        <Input
          key={i}
          className="mb-2"
          placeholder={`Player ${i + 1}`}
          value={name}
          onChange={e => {
            const newNames = [...names];
            newNames[i] = e.target.value;
            setNames(newNames);
          }}
          aria-label={`Player ${i + 1} name`} // Accessibility: ARIA label for screen readers
        />
      ))}
      {/* Notification: Show if fewer than two players have entered their names */}
      {isStartDisabled && (
        <p
          className="text-sm text-red-600 mb-2"
          aria-live="polite" // Accessibility: Announce changes to screen readers
        >
          There should be at least 2 players.
        </p>
      )}
      {/* Start Game button: Disabled if fewer than two players have entered their names or during mutation */}
      <Button
        onClick={handleStartGame}
        disabled={isStartDisabled || isPending}
        aria-label="Start a new game"
      >
        {isPending ? 'Starting...' : 'Start Game'}
      </Button>
    </div>
  );
};

export default Home;