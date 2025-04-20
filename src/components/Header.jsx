// src/components/Header.jsx
import React from 'react';
import ThemeToggle from './ThemeToggle';
import './Header.css'; // We will modify this CSS file

function Header({ theme, toggleTheme }) {
  return (
    <header className="app-header">
      {/* Add a container for better flex control if needed, but direct flex might be fine */}
      <h1 className="header-title">10 Question Quiz</h1>
      <p className="creator-credit">Created by - Ram Bapat</p>
      <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
    </header>
  );
}

export default Header;