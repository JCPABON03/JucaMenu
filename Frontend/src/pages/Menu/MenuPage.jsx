// src/pages/Menu/MenuPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../../api';
import { applyTheme, themeFromRestaurant } from '../../../hooks/UserTheme';
import "../../styles/menu.css";

// Priorizamos la variable de entorno, si no, usamos la de Railway fija
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://jucamenu-production.up.railway.app';

export default function MenuPage() {
  const { slug } = useParams();
  const [menu, setMenu] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(null);
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef();

  // Función para construir URLs de imágenes (Cloudinary vs Local)
  const getFullUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path; 
    // Limpiamos barras invertidas (Windows) por barras normales
    const cleanPath = path.replace(/\\/g, '/');
    return `${API_BASE_URL}/${cleanPath}`;
  };

  useEffect(() => {
    const load = async () => {
      try {
        // La barra final / es CRUCIAL para evitar el 307
        const resp = await axios.get(`/api/menu/${slug}/`);
        setMenu(resp.data);
        
        if (resp.data.restaurant) {
          applyTheme(themeFromRestaurant(resp.data.restaurant));
        }

        if (resp.data.categories?.length > 0) {
          setActiveTab(resp.data.categories[0].id);
        }
      } catch (err) {
        console.error("Error al cargar menú:", err);
        setError('No se pudo cargar el menú.');
      }
    };
    load();
  }, [slug]);

  // Cerrar drawer al hacer click fuera
  useEffect(() => {
    const handler = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setDrawerOpen(false);
      }
    };
    if (drawerOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [drawerOpen]);

  if (error) return (
    <div className="menu-error">
      <span>🍽</span><p>{error}</p>
    </div>
  );

  if (!menu) return (
    <div className="menu-loading">
      <div className="menu-loading__spinner" />
    </div>
  );

  const r = menu.restaurant;

  const allProducts = menu.categories.flatMap((c) =>
    c.products.map((p) => ({ ...p, categoryName: c.name }))
  );
  
  const isSearching = search.trim().length > 0;
  const searchResults = isSearching
    ? allProducts.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const activeCategory = !isSearching
    ? menu.categories.find((c) => c.id === activeTab)
    : null;

  const selectCategory = (id) => {
    setActiveTab(id);
    setSearch('');
    setDrawerOpen(false);
  };

  return (
    <div className="menu-page">
      <header
        className="menu-header"
        style={r.banner ? {
          backgroundImage: `url(${getFullUrl(r.banner)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : {}}
      >
        <div className="menu-header__overlay" />
        <div className="menu-header__inner">
          {r.logo && (
            <img className="menu-header__logo" src={getFullUrl(r.logo)} alt={r.name} />
          )}
          <h1 className="menu-header__name">{r.name}</h1>
          {r.description && <p className="menu-header__desc">{r.description}</p>}
          <div className="menu-header__socials">
            {r.instagram && <a href={`https://instagram.com/${r.instagram}`} target="_blank" rel="noreferrer">Instagram</a>}
            {r.facebook && <a href={r.facebook} target="_blank" rel="noreferrer">Facebook</a>}
            {r.tiktok && <a href={r.tiktok} target="_blank" rel="noreferrer">TikTok</a>}
            {r.maps_url && <a href={r.maps_url} target="_blank" rel="noreferrer">📍 Ubicación</a>}
          </div>
          {r.schedule && <p className="menu-header__schedule">🕐 {r.schedule}</p>}
        </div>
      </header>

      <div className="menu-navbar">
        <div className="menu-navbar__inner">
          <div className="menu-search">
            <span className="menu-search__icon">🔍</span>
            <input
              className="menu-search__input"
              type="text"
              placeholder="Buscar platillo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && <button className="menu-search__clear" onClick={() => setSearch('')}>✕</button>}
          </div>
          <button className={`menu-hamburger${drawerOpen ? ' menu-hamburger--open' : ''}`} onClick={() => setDrawerOpen((v) => !v)}>
            <span /><span /><span />
          </button>
        </div>
      </div>

      {!isSearching && (
        <nav className="menu-tabs">
          <div className="menu-tabs__inner">
            {menu.categories.map((cat) => (
              <button
                key={cat.id}
                className={`menu-tab${activeTab === cat.id ? ' menu-tab--active' : ''}`}
                onClick={() => selectCategory(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </nav>
      )}

      <div className={`menu-drawer-backdrop${drawerOpen ? ' menu-drawer-backdrop--open' : ''}`} onClick={() => setDrawerOpen(false)} />
      <aside ref={drawerRef} className={`menu-drawer${drawerOpen ? ' menu-drawer--open' : ''}`}>
        <div className="menu-drawer__header">
          <span className="menu-drawer__title">Categorías</span>
          <button className="menu-drawer__close" onClick={() => setDrawerOpen(false)}>✕</button>
        </div>
        <ul className="menu-drawer__list">
          {menu.categories.map((cat) => (
            <li key={cat.id}>
              <button
                className={`menu-drawer__item${activeTab === cat.id && !isSearching ? ' menu-drawer__item--active' : ''}`}
                onClick={() => selectCategory(cat.id)}
              >
                <span>{cat.name}</span>
                <span className="menu-drawer__count">{cat.products.length}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <main className="menu-main">
        <div className="menu-grid">
          {isSearching ? (
            searchResults.length === 0 ? <p className="menu-empty">No se encontró "{search}"</p> : 
            searchResults.map((p) => <ProductCard key={p.id} p={p} getUrl={getFullUrl} />)
          ) : (
            activeCategory?.products.filter(p => p.available !== false).map(p => <ProductCard key={p.id} p={p} getUrl={getFullUrl} />)
          )}
        </div>
      </main>

      <footer className="menu-footer">Powered by <strong>JucaMenu</strong></footer>
    </div>
  );
}

function ProductCard({ p, getUrl }) {
  const imagePath = p.images?.length > 0 
    ? (typeof p.images[0] === 'object' ? p.images[0].image_url : p.images[0])
    : null;

  return (
    <div className="menu-card">
      {imagePath ? <img className="menu-card__img" src={getUrl(imagePath)} alt={p.name} loading="lazy" /> : 
      <div className="menu-card__img menu-card__img--placeholder">🍽</div>}
      <div className="menu-card__body">
        <h3 className="menu-card__name">{p.name}</h3>
        {p.description && <p className="menu-card__desc">{p.description}</p>}
        <span className="menu-card__price">${Number(p.price).toLocaleString()}</span>
      </div>
    </div>
  );
}
