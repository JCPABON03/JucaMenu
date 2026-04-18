// src/pages/Dashboard/DashboardPage.jsx
import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import CategoryManager from './CategoryManager';
import ProductManager from './ProductManager';
import Profile from './Profile';
import ThemeManager from './Thememanager';
import "../../styles/DashboardPage.css";

const NAV_ITEMS = [
  { to: 'categories', label: 'Categorias', icon: '▤' },
  { to: 'products',   label: 'Productos',   icon: '◈' },
  { to: 'theme',      label: 'Tema',       icon: '◑' },
  { to: 'profile',    label: 'Perfil',    icon: '◉' },
];

export default function DashboardPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) navigate('/login');
    else setReady(true);
  }, []);

  const logout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  if (!ready) return null;

  return (
    <div className="dash">
      <aside className="dash__sidebar">
        <div className="dash__brand">
          <span className="dash__brand-icon">🍽</span>
          <span className="dash__brand-name">JucaMenu</span>
        </div>

        <nav className="dash__nav">
          {NAV_ITEMS.map(({ to, label, icon }) => {
            const active = location.pathname.includes(to);
            return (
              <Link
                key={to}
                to={to}
                className={`dash__nav-item${active ? ' dash__nav-item--active' : ''}`}
              >
                <span className="dash__nav-icon">{icon}</span>
                <span className="dash__nav-label">{label}</span>
                {active && <span className="dash__nav-indicator" />}
              </Link>
            );
          })}
        </nav>

        <button className="dash__logout" onClick={logout}>
          <span>↩</span>
          <span>Logout</span>
        </button>
      </aside>

      <main className="dash__main">
        <Routes>
          <Route path=""           element={<Navigate to="categories" />} />
          <Route path="categories" element={<CategoryManager />} />
          <Route path="products"   element={<ProductManager />} />
          <Route path="theme"      element={<ThemeManager />} />
          <Route path="profile"    element={<Profile />} />
        </Routes>
      </main>
    </div>
  );
}