// App.tsx
import { useGameStore } from './store';
import Home from './components/Home';
import Game from './components/game/Game';
import Results from './components/Results';
import ErrorBoundary from './components/ErrorBoundary';

const App = () => {
  const gameId = useGameStore(state => state.gameId);
  const currentFrame = useGameStore(state => state.currentFrame);

  // Navigation logic based on game state
  if (!gameId) return <Home />;
  if (currentFrame <= 10) return <Game />;
  return <Results />;
};

// Wrap the App in an ErrorBoundary to catch and display errors
const AppWithErrorBoundary = () => (
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

export default AppWithErrorBoundary;