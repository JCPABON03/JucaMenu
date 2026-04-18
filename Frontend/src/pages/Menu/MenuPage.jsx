// src/pages/Menu/MenuPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../../api';
import { applyTheme, themeFromRestaurant } from '../../../hooks/UserTheme';
import "../../styles/menu.css";

const API = 'http://localhost:8000';

export default function MenuPage() {
  const { slug } = useParams();
  const [menu,        setMenu]        = useState(null);
  const [error,       setError]       = useState('');
  const [activeTab,   setActiveTab]   = useState(null);
  const [search,      setSearch]      = useState('');
  const [drawerOpen,  setDrawerOpen]  = useState(false);
  const drawerRef = useRef();

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await axios.get(`/api/menu/${slug}`);
        setMenu(resp.data);
        applyTheme(themeFromRestaurant(resp.data.restaurant));
        if (resp.data.categories?.length > 0) {
          setActiveTab(resp.data.categories[0].id);
        }
      } catch {
        setError('No se pudo cargar el menú.');
      }
    };
    load();
  }, [slug]);

  // Cerrar drawer al click fuera
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

  // Filtrar productos por búsqueda
  const allProducts = menu.categories.flatMap((c) =>
    c.products.map((p) => ({ ...p, categoryName: c.name }))
  );
  const isSearching   = search.trim().length > 0;
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

      {/* ── Header con banner ── */}
      <header
        className="menu-header"
        style={r.banner ? {
          backgroundImage: `url(${API}/${r.banner.replace(/\\/g, '/')})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : {}}
      >
        <div className="menu-header__overlay" />
        <div className="menu-header__inner">
          {r.logo && (
            <img
              className="menu-header__logo"
              src={`${API}/${r.logo.replace(/\\/g, '/')}`}
              alt={r.name}
            />
          )}
          <h1 className="menu-header__name">{r.name}</h1>
          {r.description && <p className="menu-header__desc">{r.description}</p>}
          <div className="menu-header__socials">
            {r.instagram && <a href={`https://instagram.com/${r.instagram}`} target="_blank" rel="noopener noreferrer">Instagram</a>}
            {r.facebook  && <a href={r.facebook}  target="_blank" rel="noopener noreferrer">Facebook</a>}
            {r.tiktok    && <a href={r.tiktok}    target="_blank" rel="noopener noreferrer">TikTok</a>}
            {r.maps_url  && <a href={r.maps_url}  target="_blank" rel="noopener noreferrer">📍 Ubicación</a>}
          </div>
          {r.schedule && <p className="menu-header__schedule">🕐 {r.schedule}</p>}
        </div>
      </header>

      {/* ── Navbar: búsqueda + hamburger ── */}
      <div className="menu-navbar">
        <div className="menu-navbar__inner">
          {/* Búsqueda */}
          <div className="menu-search">
            <span className="menu-search__icon">🔍</span>
            <input
              className="menu-search__input"
              type="text"
              placeholder="Buscar platillo…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="menu-search__clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>

          {/* Hamburger */}
          <button
            className={`menu-hamburger${drawerOpen ? ' menu-hamburger--open' : ''}`}
            onClick={() => setDrawerOpen((v) => !v)}
            aria-label="Categorías"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* ── Tabs de categorías ── */}
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

      {/* ── Drawer lateral ── */}
      <>
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
      </>

      {/* ── Contenido ── */}
      <main className="menu-main">

        {/* Resultados de búsqueda */}
        {isSearching && (
          <>
            <p className="menu-search-label">
              {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} para "<strong>{search}</strong>"
            </p>
            <div className="menu-grid">
              {searchResults.length === 0 && (
                <p className="menu-empty">No se encontraron productos.</p>
              )}
              {searchResults.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          </>
        )}

        {/* Categoría activa */}
        {!isSearching && activeCategory && (
          <div className="menu-grid">
            {activeCategory.products.filter((p) => p.available !== false).length === 0 && (
              <p className="menu-empty">No hay productos en esta categoría aún.</p>
            )}
            {activeCategory.products
              .filter((p) => p.available !== false)
              .map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </main>

      <footer className="menu-footer">
        Menú digital por <strong>JucaMenu</strong>
      </footer>
    </div>
  );
}

function ProductCard({ p }) {
  return (
    <div className="menu-card">
      {p.images?.length > 0 ? (
        <img
          className="menu-card__img"
          src={`http://localhost:8000/${p.images[0].replace(/\\/g, '/')}`}
          alt={p.name}
        />
      ) : (
        <div className="menu-card__img menu-card__img--placeholder">🍽</div>
      )}
      <div className="menu-card__body">
        <h3 className="menu-card__name">{p.name}</h3>
        {p.description && <p className="menu-card__desc">{p.description}</p>}
        <span className="menu-card__price">${Number(p.price).toLocaleString()}</span>
      </div>
    </div>
  );
}