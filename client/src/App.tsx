import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore"; // Adjust the path if needed
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';
import LandingPage from './pages/LandingPage';
import ScrappedProfilePage from './pages/ScrappedProfilePage';
import { useEffect } from "react";

function App() {
  // 1. Get user and checkAuth function from your store
  const { user, checkAuth } = useAuthStore();

  // 2. Check for an existing session when the app loads
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={user ? <Navigate to="/profile" /> : <AuthPage />} />

        {/* These routes are now correctly protected */}
        <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/auth" />} />
        <Route path="/scraped-profiles" element={user ? <ScrappedProfilePage /> : <Navigate to="/auth" />} />
      </Routes>
    </Router>
  );
}

export default App;