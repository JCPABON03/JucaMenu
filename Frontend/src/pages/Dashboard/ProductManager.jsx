// src/pages/Dashboard/ProductManager.jsx
import React, { useState, useEffect } from 'react';
import axios from '../../api';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import "../../styles/DashboardPage.css";

const EMPTY = { name: '', price: '', description: '', categoryId: '', files: [] };

export default function ProductManager() {
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab,  setActiveTab]  = useState(null);
  const [search,     setSearch]     = useState('');
  const [form,       setForm]       = useState(EMPTY);
  const [showForm,   setShowForm]   = useState(false);
  const [editing,    setEditing]    = useState(null);
  const [editForm,   setEditForm]   = useState({});
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(false);

  const set     = (field) => (e) => setForm((f)     => ({ ...f, [field]: e.target.value }));
  const setEdit = (field) => (e) => setEditForm((f) => ({ ...f, [field]: e.target.value }));

  const load = async () => {
    try {
      const [prodResp, catResp] = await Promise.all([
        axios.get('/api/products/'),
        axios.get('/api/categories/'),
      ]);
      setProducts(prodResp.data);
      setCategories(catResp.data);
      if (!activeTab && catResp.data.length > 0) setActiveTab(catResp.data[0].id);
    } catch {
      setError('No se pudieron cargar los datos.');
    }
  };

  useEffect(() => { load(); }, []);

  const isSearching    = search.trim().length > 0;
  const visibleProducts = isSearching
    ? products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase())
      )
    : products.filter((p) => p.category_id === activeTab);

  // ── Crear ──────────────────────────────────────────────
  const submit = async () => {
    if (!form.name.trim() || !form.price) { setError('Nombre y precio son requeridos.'); return; }
    setError('');
    setLoading(true);
    try {
      const data = new FormData();
      data.append('name',        form.name.trim());
      data.append('price',       form.price);
      data.append('description', form.description);
      data.append('category_id', form.categoryId || activeTab);
      form.files.forEach((f) => data.append('files', f));
      await axios.post('/api/products/', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(EMPTY);
      setShowForm(false);
      load();
    } catch {
      setError('Error al agregar el producto.');
    } finally {
      setLoading(false);
    }
  };

  // ── Editar ─────────────────────────────────────────────
  const startEdit = (p) => {
    setEditing(p.id);
    setEditForm({ name: p.name, price: p.price, description: p.description || '', categoryId: p.category_id || '' });
    setError('');
  };

  const cancelEdit = () => { setEditing(null); setEditForm({}); };

  const saveEdit = async (id) => {
    if (!editForm.name?.trim() || !editForm.price) { setError('Nombre y precio son requeridos.'); return; }
    setError('');
    setLoading(true);
    try {
      const data = new FormData();
      data.append('name',        editForm.name.trim());
      data.append('price',       editForm.price);
      data.append('description', editForm.description || '');
      if (editForm.categoryId) data.append('category_id', editForm.categoryId);
      await axios.put(`/api/products/${id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setEditing(null);
      setEditForm({});
      load();
    } catch {
      setError('Error al actualizar el producto.');
    } finally {
      setLoading(false);
    }
  };

  // ── Eliminar ───────────────────────────────────────────
  const remove = async (id, productName) => {
    if (!window.confirm(`¿Eliminar "${productName}"?`)) return;
    try {
      await axios.delete(`/api/products/${id}/`);
      if (editing === id) cancelEdit();
      load();
    } catch {
      setError('Error al eliminar el producto.');
    }
  };

  return (
    <div className="dash-section">
      <div className="dash-section__header">
        <h2 className="dash-section__title">Productos</h2>
        <Button variant="primary" onClick={() => { setShowForm((v) => !v); setError(''); }}>
          {showForm ? 'Cancelar' : '+ Nuevo producto'}
        </Button>
      </div>

      {error && <p className="dash-error">{error}</p>}

      {/* ── Formulario agregar ── */}
      {showForm && (
        <div className="dash-card">
          <p className="theme-section-label">Nuevo producto</p>
          <div className="dash-grid-2">
            <FormField label="Nombre"      value={form.name}        onChange={set('name')}        required />
            <FormField label="Precio"      value={form.price}       onChange={set('price')}       type="number" required />
            <FormField label="Descripción" value={form.description} onChange={set('description')} />
            <div className="ui-field">
              <label className="ui-field__label">Categoría</label>
              <select className="ui-field__input" value={form.categoryId || activeTab} onChange={set('categoryId')}>
                <option value="">Seleccionar…</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="ui-field" style={{ marginTop: '0.75rem' }}>
            <label className="ui-field__label">Imágenes</label>
            <input
              className="ui-field__input dash-file-input"
              type="file"
              multiple
              onChange={(e) => setForm((f) => ({ ...f, files: Array.from(e.target.files) }))}
            />
          </div>
          <div style={{ marginTop: '1.25rem' }}>
            <Button variant="primary" onClick={submit} disabled={loading}>
              {loading ? 'Agregando…' : 'Agregar producto'}
            </Button>
          </div>
        </div>
      )}

      {categories.length === 0 ? (
        <p className="dash-list__empty">Crea una categoría primero.</p>
      ) : (
        <>
          {/* ── Búsqueda ── */}
          <div className="dash-search">
            <span className="dash-search__icon">🔍</span>
            <input
              className="dash-search__input"
              type="text"
              placeholder="Buscar en todos los productos…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); cancelEdit(); }}
            />
            {search && (
              <button className="dash-search__clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>

          {/* ── Tabs (solo si no está buscando) ── */}
          {!isSearching && (
            <div className="pm-tabs">
              {categories.map((c) => (
                <button
                  key={c.id}
                  className={`pm-tab${activeTab === c.id ? ' pm-tab--active' : ''}`}
                  onClick={() => { setActiveTab(c.id); cancelEdit(); }}
                >
                  {c.name}
                  <span className="pm-tab__count">{products.filter((p) => p.category_id === c.id).length}</span>
                </button>
              ))}
            </div>
          )}

          {/* ── Label resultados búsqueda ── */}
          {isSearching && (
            <p className="dash-search-label">
              {visibleProducts.length} resultado{visibleProducts.length !== 1 ? 's' : ''} para "<strong>{search}</strong>"
            </p>
          )}

          {/* ── Lista ── */}
          <ul className="dash-list">
            {visibleProducts.length === 0 && (
              <li className="dash-list__empty">
                {isSearching ? `No se encontró "${search}"` : 'No hay productos en esta categoría.'}
              </li>
            )}
            {visibleProducts.map((p) => (
              <li key={p.id} className="dash-list__item dash-list__item--col">
                {editing === p.id ? (
                  <div className="dash-edit-form">
                    <div className="dash-grid-2">
                      <FormField label="Nombre"      value={editForm.name}        onChange={setEdit('name')}        required />
                      <FormField label="Precio"      value={editForm.price}       onChange={setEdit('price')}       type="number" required />
                      <FormField label="Descripción" value={editForm.description} onChange={setEdit('description')} />
                      <div className="ui-field">
                        <label className="ui-field__label">Categoría</label>
                        <select className="ui-field__input" value={editForm.categoryId} onChange={setEdit('categoryId')}>
                          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="dash-edit-actions">
                      <Button variant="primary" onClick={() => saveEdit(p.id)} disabled={loading}>
                        {loading ? 'Guardando…' : 'Guardar'}
                      </Button>
                      <Button variant="outline" onClick={cancelEdit}>Cancelar</Button>
                    </div>
                  </div>
                ) : (
                  <div className="dash-list__row">
                    {p.images?.length > 0 && (
                      <img
                        className="pm-product__img"
                        src={`http://localhost:8000/${p.images[0].image_url?.replace(/\\/g, '/') ?? p.images[0]}`}
                        alt={p.name}
                      />
                    )}
                    <div className="dash-list__info">
                      <span className="dash-list__name">{p.name}</span>
                      <span className="dash-list__meta">
                        ${Number(p.price).toLocaleString()}
                        {isSearching && categories.find(c => c.id === p.category_id) && (
                          <> · {categories.find(c => c.id === p.category_id).name}</>
                        )}
                      </span>
                      {p.description && <span className="dash-list__desc">{p.description}</span>}
                    </div>
                    <div className="dash-list__actions">
                      <Button variant="outline" onClick={() => startEdit(p)}>Editar</Button>
                      <Button variant="danger"  onClick={() => remove(p.id, p.name)}>Eliminar</Button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
