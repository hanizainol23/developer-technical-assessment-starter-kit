import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { DetailPage } from './pages/DetailPage';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/:type/:id" element={<DetailPage />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
