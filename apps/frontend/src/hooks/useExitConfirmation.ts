// frontend/hooks/useExitConfirmation.ts
import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Location } from 'react-router-dom';
import { useGameStore } from '../store';

// Custom hook to handle exit confirmation for specific routes
const useExitConfirmation = (shouldPrompt: boolean) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setGameId, setPlayers, setCurrentFrame, setScoreboard, setError } = useGameStore();
  const [showModal, setShowModal] = useState(false);
  const [nextLocation, setNextLocation] = useState<Location | null>(null);
  const [confirmedNavigation, setConfirmedNavigation] = useState(false);

  // Reset the game state
  const resetGameState = () => {
    setGameId(null);
    setPlayers([]);
    setCurrentFrame(1);
    setScoreboard([]);
    setError(null);
  };

  // Handle the beforeunload event (refresh/close tab)
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (shouldPrompt) {
        event.preventDefault();
        event.returnValue = ''; // This triggers the browser's default confirmation prompt
      }
    };

    if (shouldPrompt) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [shouldPrompt]);

  // Handle route changes
  useEffect(() => {
    if (confirmedNavigation && nextLocation) {
      // Navigate to the next location and reset the game state
      resetGameState();
      navigate(nextLocation.pathname);
    }
  }, [confirmedNavigation, nextLocation, navigate]);

  // Function to handle navigation attempts
  const handleNavigationAttempt = (location: Location) => {
    if (!shouldPrompt) return true;

    // Allow navigation if the user has confirmed
    if (confirmedNavigation) return true;

    // Show the modal if the user tries to navigate away
    setShowModal(true);
    setNextLocation(location);
    return false;
  };

  // Function to confirm navigation
  const confirmNavigation = () => {
    setShowModal(false);
    setConfirmedNavigation(true);
  };

  // Function to cancel navigation
  const cancelNavigation = () => {
    setShowModal(false);
    setNextLocation(null);
  };

  return {
    showModal,
    handleNavigationAttempt,
    confirmNavigation,
    cancelNavigation,
    resetGameState,
  };
};

export default useExitConfirmation;