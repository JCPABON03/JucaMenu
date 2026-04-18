// src/pages/Dashboard/ThemeManager.jsx
import React, { useState, useEffect } from 'react';
import axios from '../../api';
import { applyTheme, themeFromRestaurant, DEFAULT_THEME } from '../../../hooks/UserTheme';
import Button from '../../components/ui/Button';
import "../../styles/DashboardPage.css";
import "../../styles/themeManager.css";

const PRESETS = [
  { label: 'JucaMenu', primary: '#faf6f0', accent: '#c8860a', text: '#1a1209', card: '#ffffff' },
  { label: 'Noche',    primary: '#0f0f0f', accent: '#e9a820', text: '#f0ebe3', card: '#1c1c1c' },
  { label: 'Bosque',   primary: '#f0f4f0', accent: '#4a7c59', text: '#1a2e1a', card: '#ffffff' },
  { label: 'Oceano',   primary: '#f0f6fa', accent: '#1a6fa8', text: '#0d2136', card: '#ffffff' },
  { label: 'Fresa',    primary: '#fff5f7', accent: '#d63a6a', text: '#2d0a17', card: '#ffffff' },
  { label: 'Carbón',   primary: '#1e1e2e', accent: '#a78bfa', text: '#e2e8f0', card: '#2d2d3f' },
];

const COLOR_FIELDS = [
  { key: 'primary', label: 'Fondo principal',  desc: 'Color de fondo de la página del menú' },
  { key: 'accent',  label: 'Color de acento',  desc: 'Títulos, botones y elementos destacados' },
  { key: 'text',    label: 'Color de texto',   desc: 'Texto principal del menú' },
  { key: 'card',    label: 'Color de tarjetas',desc: 'Fondo de las cards de productos' },
];

export default function ThemeManager() {
  const [theme,   setTheme]  = useState(DEFAULT_THEME);
  const [saved,   setSaved]  = useState(false);
  const [error,   setError]  = useState('');
  const [loading, setLoading] = useState(false);

  // Cargar tema actual desde el backend
  useEffect(() => {
    const load = async () => {
      try {
        const resp = await axios.get('/api/restaurants/me/');
        setTheme(themeFromRestaurant(resp.data));
      } catch {
        setError('No se pudo cargar el tema.');
      }
    };
    load();
  }, []);

  useEffect(() => { applyTheme(theme); }, [theme]);

  const update     = (key, value) => setTheme((t) => ({ ...t, [key]: value }));
  const applyPreset = (preset) => { const { label, ...colors } = preset; setTheme(colors); };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      await axios.patch('/api/restaurants/me/theme/', {
        theme_primary: theme.primary,
        theme_accent:  theme.accent,
        theme_text:    theme.text,
        theme_card:    theme.card,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Error al guardar el tema.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => setTheme(DEFAULT_THEME);

  return (
    <div className="dash-section">
      <h2 className="dash-section__title">Tema del Menú</h2>
      <p className="theme-subtitle">Personaliza los colores de tu menú público. Los cambios se guardan en el servidor.</p>

      {error && <p className="dash-error">{error}</p>}
      {saved && <p className="dash-success">¡Tema guardado correctamente!</p>}

      {/* Presets */}
      <div className="dash-card">
        <p className="theme-section-label">Paletas predefinidas</p>
        <div className="theme-presets">
          {PRESETS.map((preset) => (
            <button key={preset.label} className="theme-preset" onClick={() => applyPreset(preset)} title={preset.label}>
              <span className="theme-preset__swatches">
                <span style={{ background: preset.primary }} />
                <span style={{ background: preset.accent  }} />
                <span style={{ background: preset.text    }} />
                <span style={{ background: preset.card    }} />
              </span>
              <span className="theme-preset__label">{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Colores personalizados */}
      <div className="dash-card">
        <p className="theme-section-label">Colores personalizados</p>
        <div className="theme-fields">
          {COLOR_FIELDS.map(({ key, label, desc }) => (
            <div key={key} className="theme-field">
              <div className="theme-field__info">
                <span className="theme-field__label">{label}</span>
                <span className="theme-field__desc">{desc}</span>
              </div>
              <div className="theme-field__controls">
                <input type="color" value={theme[key]} onChange={(e) => update(key, e.target.value)} className="theme-color-input" />
                <input type="text"  value={theme[key]} onChange={(e) => update(key, e.target.value)} className="theme-hex-input ui-field__input" maxLength={7} spellCheck={false} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="dash-card">
        <p className="theme-section-label">Vista previa</p>
        <div className="theme-preview" style={{ background: theme.primary }}>
          <div className="theme-preview__header">
            <span className="theme-preview__restaurant" style={{ color: theme.accent }}>Mi Restaurante</span>
            <span className="theme-preview__desc"      style={{ color: theme.text }}>Descripción del restaurante</span>
          </div>
          <div className="theme-preview__cards">
            {['Pasta', 'Pizza', 'Ensalada'].map((name) => (
              <div key={name} className="theme-preview__card" style={{ background: theme.card }}>
                <div className="theme-preview__img" style={{ background: theme.accent + '22' }} />
                <div className="theme-preview__card-body">
                  <span className="theme-preview__name"  style={{ color: theme.text }}>  {name}</span>
                  <span className="theme-preview__price" style={{ color: theme.accent }}>$12.000</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Button variant="primary" onClick={handleSave} disabled={loading}>
          {loading ? 'Guardando…' : 'Guardar tema'}
        </Button>
        <Button variant="outline" onClick={handleReset}>Restablecer</Button>
      </div>
    </div>
  );
}
