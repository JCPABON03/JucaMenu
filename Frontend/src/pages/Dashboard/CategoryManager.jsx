// src/pages/Dashboard/CategoryManager.jsx
import React, { useState, useEffect } from 'react';
import axios from '../../api';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import "../../styles/DashboardPage.css";

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [name,       setName]       = useState('');
  const [search,     setSearch]     = useState('');
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(false);

  const load = async () => {
    try {
      const resp = await axios.get('/api/categories');
      setCategories(resp.data);
    } catch {
      setError('No se pudieron cargar las categorías.');
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const add = async () => {
    if (!name.trim()) { setError('El nombre no puede estar vacío.'); return; }
    setError('');
    setLoading(true);
    try {
      await axios.post('/api/categories', { name: name.trim() });
      setName('');
      load();
    } catch {
      setError('Error al agregar la categoría.');
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id, categoryName) => {
    if (!window.confirm(`¿Eliminar la categoría "${categoryName}"?`)) return;
    try {
      await axios.delete(`/api/categories/${id}`);
      load();
    } catch {
      setError('Error al eliminar la categoría.');
    }
  };

  return (
    <div className="dash-section">
      <h2 className="dash-section__title">Categorías</h2>

      {error && <p className="dash-error">{error}</p>}

      {/* ── Agregar ── */}
      <div className="dash-card">
        <div className="dash-add-row">
          <FormField label="Nueva categoría" value={name} onChange={(e) => setName(e.target.value)} />
          <Button variant="primary" onClick={add} disabled={loading}>
            {loading ? 'Agregando…' : 'Agregar'}
          </Button>
        </div>
      </div>

      {/* ── Búsqueda ── */}
      {categories.length > 0 && (
        <div className="dash-search">
          <span className="dash-search__icon">🔍</span>
          <input
            className="dash-search__input"
            type="text"
            placeholder="Buscar categoría…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="dash-search__clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>
      )}

      {/* ── Lista ── */}
      <ul className="dash-list">
        {filtered.length === 0 && (
          <li className="dash-list__empty">
            {search ? `No se encontró "${search}"` : 'No hay categorías aún.'}
          </li>
        )}
        {filtered.map((c) => (
          <li key={c.id} className="dash-list__item">
            <div className="dash-list__info">
              <span className="dash-list__name">{c.name}</span>
              <span className="dash-list__meta">{c.products?.length ?? 0} productos</span>
            </div>
            <Button variant="danger" onClick={() => remove(c.id, c.name)}>Eliminar</Button>
          </li>
        ))}
      </ul>
    </div>
  );
}