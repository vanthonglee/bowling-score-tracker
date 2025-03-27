import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGameStore } from '@/store';

// Home component for starting a new game
const Home = () => {
  // State for player names input
  const [names, setNames] = useState(['', '', '', '', '']);
  // State management using Zustand store
  const { setGameId, setPlayers, setCurrentFrame, setError } = useGameStore();

  // Handle starting a new game
  const startGame = async () => {
    const players = names.filter(name => name.trim());
    if (players.length === 0) {
      setError('Please enter at least one player name');
      return;
    }

    try {
      const res = await fetch('http://localhost:8080/api/game/start', {
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
      {/* Start Game button */}
      <Button onClick={startGame} aria-label="Start a new game">
        Start Game
      </Button>
    </div>
  );
};

export default Home;