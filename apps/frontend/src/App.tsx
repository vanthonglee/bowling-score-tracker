import Home from './components/Home';
import Game from './components/game/Game';
import Results from './components/Results';
import ErrorBoundary from './components/ErrorBoundary';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<Game />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </Router>
  );
};

// Wrap the App in an ErrorBoundary to catch and display errors
const AppWithErrorBoundary = () => (
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

export default AppWithErrorBoundary;