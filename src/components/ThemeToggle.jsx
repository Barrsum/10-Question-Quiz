// src/components/ThemeToggle.jsx
import React from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';
import './ThemeToggle.css';

// Props: theme ('light' or 'dark'), toggleTheme (function)
function ThemeToggle({ theme, toggleTheme }) {
  return (
    <button
      className="theme-toggle-button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? <FaSun /> : <FaMoon />}
    </button>
  );
}

export default ThemeToggle;