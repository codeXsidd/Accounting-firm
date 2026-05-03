import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import { Dashboard } from './pages/Dashboard';
import { Onboarding } from './pages/Onboarding';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/onboarding/:clientId" element={<Onboarding />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
