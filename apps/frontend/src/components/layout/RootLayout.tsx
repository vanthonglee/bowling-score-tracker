// frontend/src/components/RootLayout.tsx
import { Outlet } from 'react-router-dom';

// Root layout component to wrap the entire app
const RootLayout = () => {
  return <Outlet />; // Render the child routes
};

export default RootLayout;