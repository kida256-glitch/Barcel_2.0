/**
 * Theme management utilities
 */

const THEME_STORAGE_KEY = 'celobargain_theme';

export type Theme = 'light' | 'dark';

/**
 * Get the current theme from localStorage or default to 'dark'
 */
export function getTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch (error) {
    console.error('Error reading theme:', error);
  }
  
  return 'dark';
}

/**
 * Set the theme and save to localStorage
 */
export function setTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    applyTheme(theme);
  } catch (error) {
    console.error('Error saving theme:', error);
  }
}

/**
 * Apply the theme to the document
 */
export function applyTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

/**
 * Toggle between light and dark mode
 */
export function toggleTheme(): Theme {
  const currentTheme = getTheme();
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
  return newTheme;
}

/**
 * Initialize theme on page load
 */
export function initTheme(): void {
  if (typeof window === 'undefined') return;
  
  const theme = getTheme();
  applyTheme(theme);
}

