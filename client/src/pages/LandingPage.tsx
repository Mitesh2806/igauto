// src/pages/LandingPage.tsx

import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center font-sans">
      <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to the App</h1>
      <p className="text-lg md:text-xl text-gray-600 mb-8">
        Track your Instagram profile's growth and performance.
      </p>
      <Link
        to="/auth"
        className="px-6 py-3 text-lg font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
      >
        Login or Sign Up
      </Link>
    </div>
  );
}

export default LandingPage;