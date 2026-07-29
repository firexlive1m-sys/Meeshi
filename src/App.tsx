import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import Download from './pages/Download';
import { initPixel, trackPageView } from './pixel';

function PixelTracker() {
  const location = useLocation();

  useEffect(() => {
    initPixel();
  }, []);

  useEffect(() => {
    trackPageView();
  }, [location.pathname]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <PixelTracker />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/download" element={<Download />} />
      </Routes>
    </BrowserRouter>
  );
}
