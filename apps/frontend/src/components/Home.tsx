import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGameStore } from '@/store';

const Home = () => {
  // State for player names input
  const [names, setNames] = useState(['', '', '', '', '']);
  // State management using Zustand store
  const { setGameId, setPlayers, setCurrentFrame, setError } = useGameStore();

  // Check if at least two players have entered their names to enable the Start Game button
  const nonEmptyNames = names.filter(name => name.trim() !== '');
  const isStartDisabled = nonEmptyNames.length < 2;

  // Handle starting a new game
  const startGame = async () => {
    const players = names.filter(name => name.trim());
    if (players.length < 2) {
      setError('Please enter at least two player names');
      return;
    }

    try {
      // Use the environment variable for the backend API URL
      const apiUrl = process.env.REACT_APP_API_URL; 
      const res = await fetch(`${apiUrl}/api/game/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ players }),
      });

      if (!res.ok) {
        throw new Error(`Failed to start game: ${res.status}`);
      }

      const { gameId } = await res.json();
      setGameId(gameId);
      setPlayers(players);
      setCurrentFrame(1); // Reset currentFrame to 1 for a new game
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error('Error starting game:', error);
      setError('Couldn’t start the game. Please try again.');
    }
  };

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
      {/* Start Game button: Disabled if fewer than two players have entered their names */}
      <Button
        onClick={startGame}
        disabled={isStartDisabled}
        aria-label="Start a new game"
      >
        Start Game
      </Button>
    </div>
  );
};

export default Home;