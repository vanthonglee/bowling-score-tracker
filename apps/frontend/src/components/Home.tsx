import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGameStore } from '@/store';
const Home = () => {
  const [names, setNames] = useState(['', '', '', '', '']);
  const { setGameId, setPlayers } = useGameStore();

  const startGame = async () => {
    const players = names.filter(name => name.trim());
    if (players.length === 0) return;
    const res = await fetch('http://localhost:8080/api/game/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ players }),
    });
    const { gameId } = await res.json();
    setGameId(gameId);
    setPlayers(players);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Bowling Score Tracker</h1>
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
        />
      ))}
      <Button onClick={startGame}>Start Game</Button>
    </div>
  );
};

export default Home;