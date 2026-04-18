import axios from 'axios';

// Forzamos la URL de producción si no estamos en localhost
const getBaseURL = () => {
  const envURL = import.meta.env.VITE_API_URL;
  
  // Si estamos en producción (Vercel), nos aseguramos de usar HTTPS
  if (envURL && envURL.includes('railway.app') && !envURL.startsWith('https')) {
    return envURL.replace('http://', 'https://');
  }
  
  return envURL || 'https://jucamenu-production.up.railway.app';
};

const instance = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true // Importante para que el backend acepte la sesión
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Solo redirigir si no estamos ya en la página de login para evitar bucles
    if (error.response && error.response.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;
