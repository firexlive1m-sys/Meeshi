import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import Download from './pages/Download';

function PixelTracker() {
  const location = useLocation();

  useEffect(() => {
    const pixelId = import.meta.env.VITE_META_PIXEL_ID;
    if (pixelId && window.fbq) {
      // Initialize pixel if not already done
      window.fbq('init', pixelId);
      // Track PageView on route change
      window.fbq('track', 'PageView');
    }
  }, [location]);

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
