// src/components/ResultScreen.jsx
import React from 'react';
import { FaTrophy, FaRedo, FaExclamationTriangle } from 'react-icons/fa';
import './ResultScreen.css'; // Styles for this component

// Props: score, lives, onRestart, hasSwitchedTab, initialLives
function ResultScreen({ score, lives, onRestart, hasSwitchedTab, initialLives }) {

  const getTrophy = () => {
    // Use the passed initialLives prop for accurate comparison
    const totalLives = typeof initialLives === 'number' ? initialLives : 3; // Default to 3 if prop not passed correctly

    if (lives === totalLives) {
      return { icon: <FaTrophy className="trophy-icon gold" />, text: "Perfect! Gold Trophy!", color: 'var(--trophy-gold)' };
    } else if (lives === totalLives - 1) {
      return { icon: <FaTrophy className="trophy-icon silver" />, text: "Great Job! Silver Trophy!", color: 'var(--trophy-silver)' };
    } else if (lives === totalLives - 2 && totalLives >= 3) { // Ensure bronze only applies if there were at least 3 lives initially
      return { icon: <FaTrophy className="trophy-icon bronze" />, text: "Well Done! Bronze Trophy!", color: 'var(--trophy-bronze)' };
    } else {
      // Fallback for lower lives or cases where initialLives < 3
      return { icon: '🏅', text: "Good Effort!", color: 'var(--text-secondary)' };
    }
  };

  const trophy = getTrophy();

  return (
    // Use overlay-screen class from App.css for base layout
    <div className="result-screen overlay-screen">
      <h2>Quiz Finished!</h2>
      <div className="trophy-container" style={{ color: trophy.color }}>
        {trophy.icon}
        <p className="trophy-text">{trophy.text}</p>
      </div>
      {hasSwitchedTab && (
        // Use switched-tab-warning class from App.css
        <p className="switched-tab-warning">
           <FaExclamationTriangle style={{ marginRight: '5px', color: 'orange' }}/>
           Tab switching detected during the quiz.
        </p>
      )}
      <p className="final-score">Final Score: <strong>{score}</strong></p>
      <p className="lives-remaining">Lives Remaining: <strong>{lives}</strong> ❤️</p>
      {/* Use action-button class from App.css */}
      <button onClick={onRestart} className="action-button restart-button">
        <FaRedo style={{ marginRight: '8px' }}/> Play Again?
      </button>
    </div>
  );
}

export default ResultScreen;