/**
 * theme.js — Light/Dark mode toggle for portfolio
 * Applies .light-theme to <html>, stores preference in localStorage,
 * respects system preference on first visit.
 */
(function () {
  const STORAGE_KEY = 'portfolioTheme';
  const LIGHT_CLASS = 'light-theme';

  // Resolve the initial theme: saved pref > system pref > dark (default)
  function getInitialTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  }

  function applyTheme(theme) {
    if (theme === 'light') {
      document.documentElement.classList.add(LIGHT_CLASS);
    } else {
      document.documentElement.classList.remove(LIGHT_CLASS);
    }
    // Update toggle button icon if it exists
    const btn = document.getElementById('themeToggleBtn');
    if (btn) {
      btn.setAttribute('aria-label', theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
      btn.setAttribute('title', theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
      const icon = btn.querySelector('.theme-icon');
      if (icon) icon.textContent = theme === 'light' ? '🌙' : '☀️';
    }
  }

  function toggleTheme() {
    const isLight = document.documentElement.classList.contains(LIGHT_CLASS);
    const next = isLight ? 'dark' : 'light';
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  // Apply theme immediately to avoid flash
  applyTheme(getInitialTheme());

  // Wire up the toggle button once DOM is ready
  document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('themeToggleBtn');
    if (btn) {
      btn.addEventListener('click', toggleTheme);
      // Sync icon on load
      const theme = document.documentElement.classList.contains(LIGHT_CLASS) ? 'light' : 'dark';
      applyTheme(theme);
    }
  });
})();
