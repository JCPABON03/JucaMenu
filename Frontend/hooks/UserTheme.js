// src/hooks/useTheme.js
export const DEFAULT_THEME = {
  primary: '#faf6f0',
  accent:  '#c8860a',
  text:    '#1a1209',
  card:    '#ffffff',
};

// Aplica el tema como CSS variables en el <html>
export function applyTheme(theme) {
  const root = document.documentElement;
  root.style.setProperty('--menu-primary', theme.primary || DEFAULT_THEME.primary);
  root.style.setProperty('--menu-accent',  theme.accent  || DEFAULT_THEME.accent);
  root.style.setProperty('--menu-text',    theme.text    || DEFAULT_THEME.text);
  root.style.setProperty('--menu-card',    theme.card    || DEFAULT_THEME.card);
}

// Lee el tema desde el objeto restaurante (viene del backend)
export function themeFromRestaurant(restaurant) {
  if (!restaurant) return DEFAULT_THEME;
  return {
    primary: restaurant.theme_primary || DEFAULT_THEME.primary,
    accent:  restaurant.theme_accent  || DEFAULT_THEME.accent,
    text:    restaurant.theme_text    || DEFAULT_THEME.text,
    card:    restaurant.theme_card    || DEFAULT_THEME.card,
  };
}

// Helpers para dashboard (localStorage solo para preview en tiempo real)
export function loadTheme(slug = 'default') {
  try {
    const raw = localStorage.getItem(`jucamenu_theme_${slug}`);
    return raw ? { ...DEFAULT_THEME, ...JSON.parse(raw) } : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function saveTheme(slug = 'default', theme) {
  localStorage.setItem(`jucamenu_theme_${slug}`, JSON.stringify(theme));
}