import { useState } from 'react';
import { useGameStore } from './store';
import Home from './components/Home';
import Game from './components/Game';
import Results from './components/Results';

const App = () => {
  const gameId = useGameStore(state => state.gameId);
  const currentFrame = useGameStore(state => state.currentFrame);

  if (!gameId) return <Home />;
  if (currentFrame <= 10) return <Game />;
  return <Results />;
};

export default App;