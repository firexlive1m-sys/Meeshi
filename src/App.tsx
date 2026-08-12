import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Lazy load the pages to split code and boost initial load performance
const Landing = lazy(() => import('./pages/Landing'));
const Download = lazy(() => import('./pages/Download'));

// A simple loading screen matching the app's dark theme
const PageLoader = () => (
  <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/download" element={<Download />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
