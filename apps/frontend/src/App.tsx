import Home from './components/page/Home';
import Game from './components/page/Game';
import Results from './components/page/Results';
import ErrorBoundary from './components/ErrorBoundary';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import RootLayout from './components/layout/RootLayout';

// Define the routes using createBrowserRouter
const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/game',
        element: <Game />,
      },
      {
        path: '/results',
        element: <Results />,
      },
    ],
  },
]);

// Main App component
const App = () => {
  return <RouterProvider router={router} />;
};

// Wrap the App in an ErrorBoundary to catch and display errors
const AppWithErrorBoundary = () => (
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

export default AppWithErrorBoundary;