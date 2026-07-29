import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import Download from './pages/Download';
import { initMetaPixel, trackPageView } from './services/analytics';

function AnalyticsWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  useEffect(() => {
    initMetaPixel();
  }, []);

  useEffect(() => {
    trackPageView();
  }, [location.pathname]);

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AnalyticsWrapper>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/download" element={<Download />} />
        </Routes>
      </AnalyticsWrapper>
    </BrowserRouter>
  );
}

