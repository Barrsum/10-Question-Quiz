// src/components/StartScreen.jsx
import React from 'react';
import './StartScreen.css'; // We will modify this CSS file

// Props: onStartGame (function), onOpenFormatModal (function)
function StartScreen({ onStartGame, onOpenFormatModal }) {
  return (
    <div className="start-screen">
      <h2 className="quiz-title">Welcome to the 10 Question Quiz!</h2>
      <p className="quiz-description">Test your knowledge across various categories. Ready to challenge yourself?</p>
      {/* We'll use the classes "action-button" and "secondary-button" for consistency */}
      <div className="start-buttons button-group"> {/* Added button-group class */}
        <button className="start-button action-button" onClick={onStartGame}>
          Start Quiz
        </button>
        <button className="format-button secondary-button" onClick={onOpenFormatModal}>
          Understand Format
        </button>
      </div>
    </div>
  );
}

export default StartScreen;