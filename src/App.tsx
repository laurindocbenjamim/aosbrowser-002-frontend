import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import AgenticOSPage from './pages/AgenticOS';
import OffensiveAgentPage from './pages/OffensiveAgent';

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-theme-accent/30 selection:text-white">
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/automation" element={<AgenticOSPage />} />
        <Route path="/pentesting" element={<OffensiveAgentPage />} />
      </Routes>
    </div>
  );
}
