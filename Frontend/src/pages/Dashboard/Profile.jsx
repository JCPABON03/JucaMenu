 // src/pages/Dashboard/Profile.jsx
import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import axios from '../../api';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import "../../styles/DashboardPage.css";

const EMPTY = {
  name: '', description: '', instagram: '', facebook: '',
  tiktok: '', schedule: '', maps_url: '', phone: '', address: '',
};

// Base URL para imágenes del servidor
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://jucamenu-production.up.railway.app';

export default function Profile() {
  const [restaurant,    setRestaurant]    = useState(EMPTY);
  const [exists,        setExists]        = useState(false);
  const [error,         setError]         = useState('');
  const [saved,         setSaved]         = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [logoFile,      setLogoFile]      = useState(null);
  const [bannerFile,    setBannerFile]    = useState(null);
  const [logoPreview,   setLogoPreview]   = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  const logoRef   = useRef();
  const bannerRef = useRef();

  // Helper para mostrar imágenes locales o de Cloudinary
  const getFullUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}/${path.replace(/\\/g, '/')}`;
  };

  const set = (field) => (e) => setRestaurant((r) => ({ ...r, [field]: e.target.value }));

  const load = async () => {
    try {
      // CORRECCIÓN: Barra final / para evitar 307 Redirect
      const resp = await axios.get('/api/restaurants/me/');
      if (resp.data) {
        setRestaurant(resp.data);
        setExists(true);
        localStorage.setItem('jucamenu_restaurant', JSON.stringify(resp.data));
      }
    } catch (err) {
      if (err.response?.status === 404) setExists(false);
      else console.error('Error cargando perfil:', err);
    }
  };

  useEffect(() => { load(); }, []);

  const handleImageChange = (setter, previewSetter) => (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setter(file);
    previewSetter(URL.createObjectURL(file));
  };

  const save = async () => {
    if (!restaurant.name?.trim()) { 
      setError('El nombre del restaurante es obligatorio.'); 
      return; 
    }
    setError('');
    setLoading(true);
    try {
      if (exists) {
        const data = new FormData();
        data.append('name',        restaurant.name);
        data.append('description', restaurant.description || '');
        data.append('instagram',   restaurant.instagram   || '');
        data.append('facebook',    restaurant.facebook    || '');
        data.append('tiktok',      restaurant.tiktok      || '');
        data.append('schedule',    restaurant.schedule    || '');
        data.append('maps_url',    restaurant.maps_url    || '');
        data.append('phone',       restaurant.phone       || '');
        data.append('address',     restaurant.address     || '');
        
        if (logoFile)   data.append('logo',   logoFile);
        if (bannerFile) data.append('banner', bannerFile);

        // CORRECCIÓN: Usamos PUT con barra final /
        await axios.put('/api/restaurants/me/', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        // CORRECCIÓN: Usamos POST con barra final /
        await axios.post('/api/restaurants/', {
          name:        restaurant.name,
          description: restaurant.description || null,
          instagram:   restaurant.instagram   || null,
          facebook:    restaurant.facebook    || null,
          tiktok:      restaurant.tiktok      || null,
          schedule:    restaurant.schedule    || null,
          maps_url:    restaurant.maps_url    || null,
          phone:       restaurant.phone       || null,
          address:     restaurant.address     || null,
        });
      }
      setLogoFile(null);
      setBannerFile(null);
      setLogoPreview(null);
      setBannerPreview(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      await load();
    } catch (err) {
      console.error('Error en save:', err.response?.data || err.message);
      setError(err.response?.data?.detail || 'Error al guardar el perfil.');
    } finally {
      setLoading(false);
    }
  };

  // Generamos la URL del menú usando el origen actual (Vercel o localhost)
  const menuUrl = restaurant?.slug 
    ? `${window.location.origin}/menu/${restaurant.slug}` 
    : null;

  return (
    <div className="dash-section">
      <h2 className="dash-section__title">{exists ? 'Perfil' : 'Crear Restaurante'}</h2>

      {error && <p className="dash-error">{error}</p>}
      {saved && <p className="dash-success">¡Guardado correctamente!</p>}

      {exists && (
        <div className="dash-card">
          <p className="theme-section-label">Imágenes</p>
          <div className="profile-images">
            <div className="profile-img-field">
              <p className="profile-img-label">Logo</p>
              <div className="profile-img-preview" onClick={() => logoRef.current.click()}>
                {logoPreview || restaurant.logo ? (
                  <img src={logoPreview || getFullUrl(restaurant.logo)} alt="Logo" />
                ) : (
                  <span className="profile-img-placeholder">＋ Logo</span>
                )}
              </div>
              <input ref={logoRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={handleImageChange(setLogoFile, setLogoPreview)} />
            </div>

            <div className="profile-img-field profile-img-field--wide">
              <p className="profile-img-label">Banner (fondo del header)</p>
              <div className="profile-img-preview profile-img-preview--banner" onClick={() => bannerRef.current.click()}>
                {bannerPreview || restaurant.banner ? (
                  <img src={bannerPreview || getFullUrl(restaurant.banner)} alt="Banner" />
                ) : (
                  <span className="profile-img-placeholder">＋ Banner</span>
                )}
              </div>
              <input ref={bannerRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={handleImageChange(setBannerFile, setBannerPreview)} />
            </div>
          </div>
        </div>
      )}

      <div className="dash-card">
        <p className="theme-section-label">Información general</p>
        <div className="dash-grid-2">
          <FormField label="Nombre"      value={restaurant.name        || ''} onChange={set('name')}        required />
          <FormField label="Teléfono"    value={restaurant.phone       || ''} onChange={set('phone')} />
          <FormField label="Horario"     value={restaurant.schedule    || ''} onChange={set('schedule')} />
          <FormField label="Google Maps" value={restaurant.maps_url    || ''} onChange={set('maps_url')} />
          <FormField label="Instagram"   value={restaurant.instagram   || ''} onChange={set('instagram')} />
          <FormField label="Facebook"    value={restaurant.facebook    || ''} onChange={set('facebook')} />
          <FormField label="TikTok"      value={restaurant.tiktok      || ''} onChange={set('tiktok')} />
          <FormField label="Descripción" value={restaurant.description || ''} onChange={set('description')} />
        </div>
        <div style={{ marginTop: '1.25rem' }}>
          <Button variant="primary" onClick={save} disabled={loading}>
            {loading ? 'Guardando…' : exists ? 'Guardar cambios' : 'Crear restaurante'}
          </Button>
        </div>
      </div>

      {menuUrl && (
        <div className="dash-card dash-qr">
          <div>
            <p className="dash-qr__label">URL del menú público</p>
            <a className="dash-qr__url" href={menuUrl} target="_blank" rel="noopener noreferrer">
              {menuUrl}
            </a>
          </div>
          <QRCodeSVG value={menuUrl} size={120} className="dash-qr__img" />
        </div>
      )}
    </div>
  );
}
