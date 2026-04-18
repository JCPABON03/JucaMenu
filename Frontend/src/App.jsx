import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import MenuPage from './pages/Menu/MenuPage';

function App() {
  // check for token in query params (returned by Google OAuth)
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tok = params.get('token');
    if (tok) {
      localStorage.setItem('access_token', tok);
      params.delete('token');
      const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
      window.history.replaceState({}, '', newUrl);
      window.location.href = '/dashboard';
    }
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard/*" element={<DashboardPage />} />
      <Route path="/menu/:slug" element={<MenuPage />} />
    </Routes>
  );
}

export default App;