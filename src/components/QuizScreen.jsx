// src/components/QuizScreen.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FaPause, FaHeart, FaStar } from 'react-icons/fa';
import './QuizScreen.css';

// Helper function to shuffle array
const shuffleArray = (array) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}

// Props: question, onAnswer, onPause, currentQuestionIndex, totalQuestions, lives, score, initialLives
function QuizScreen({ question, onAnswer, onPause, currentQuestionIndex, totalQuestions, lives, score, initialLives }) {
  const [selectedOption, setSelectedOption] = useState(null); // Stores the *value* (string) of the selected option
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null); // Stores the *index* clicked in the shuffled array
  const [isAnswered, setIsAnswered] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const optionsRef = useRef([]);

  // Shuffle options using useMemo to only re-shuffle when the question prop changes
  const shuffledOptions = useMemo(() => {
    if (!question || !question.options) return [];
    const optionsCopy = [...question.options];
    return shuffleArray(optionsCopy);
  }, [question]);

  // Effect to reset state when the question changes
  useEffect(() => {
    setSelectedOption(null);
    setSelectedOptionIndex(null);
    setIsAnswered(false);
    setShowFeedback(false);
    setFeedback('');
    // Ensure refs array is ready for the new set of options
    optionsRef.current = optionsRef.current.slice(0, shuffledOptions.length);
    // Re-enable buttons after state reset
    optionsRef.current.forEach(button => {
      if (button) button.disabled = false;
    });
  }, [question, shuffledOptions]); // Rerun if question or the shuffled list changes

  // Handle clicking an option button
  const handleOptionClick = (optionValue, indexInShuffledArray) => {
    if (isAnswered) return;

    setSelectedOption(optionValue); // Store the actual answer text
    setSelectedOptionIndex(indexInShuffledArray); // Store the index that was clicked
    setIsAnswered(true);
    setShowFeedback(true); // Start yellow highlight phase

    // Disable all options immediately
    optionsRef.current.forEach(button => {
        if (button) button.disabled = true;
    });

    // Suspense timer before showing correct/incorrect
    setTimeout(() => {
      const isCorrect = optionValue === question.correctAnswer;
      setFeedback(isCorrect ? 'correct' : 'incorrect');

      // Delay before calling the parent onAnswer (to allow feedback visuals)
      setTimeout(() => {
        onAnswer(isCorrect);
      }, 1000); // Show red/green for 1 second

    }, 2000); // Yellow highlight duration (2 seconds)
  };

  // Determine the CSS class for each option button based on state
  const getOptionClass = (optionValue, indexInShuffledArray) => {
    if (!showFeedback) {
      return 'option-button'; // Default state
    }
    // Was this specific button (by index) selected?
    if (indexInShuffledArray === selectedOptionIndex) {
      if (feedback === 'correct') return 'option-button selected correct';
      if (feedback === 'incorrect') return 'option-button selected incorrect';
      return 'option-button selected'; // Yellow highlight
    }
    // Is this option the correct answer (highlight green even if not selected)?
    if (feedback && optionValue === question.correctAnswer) {
       return 'option-button correct';
    }
    // Is this a wrong option that wasn't selected (fade it out)?
    if (feedback && optionValue !== question.correctAnswer) {
        return 'option-button disabled-feedback';
    }
    return 'option-button'; // Fallback
  };

  // Render heart icons for lives
  const renderLives = () => {
    let hearts = [];
    // Render current lives
    for (let i = 0; i < lives; i++) {
      hearts.push(<FaHeart key={`life-${i}`} className="life-icon" />);
    }
    // Render lost hearts using the initialLives prop
    const totalLives = typeof initialLives === 'number' ? initialLives : 3; // Default to 3 if prop not passed correctly
    for (let i = 0; i < totalLives - lives; i++) {
         hearts.push(<FaHeart key={`lost-life-${i}`} className="life-icon lost" />);
    }
    return hearts;
  };

  return (
    // Added modern-look class for enhanced styling
    <div className="quiz-screen modern-look">
      <div className="quiz-header">
        <div className="progress-info">
          Question {currentQuestionIndex + 1} / {totalQuestions}
        </div>
        <div className="game-stats">
           <span className="score"> <FaStar className="score-icon"/> {score}</span>
           <span className="lives">{renderLives()}</span> {/* Call the corrected function */}
        </div>
        <button onClick={onPause} className="pause-button" aria-label="Pause Quiz" title="Pause Quiz">
          <FaPause />
        </button>
      </div>

       {/* Progress Bar */}
       <div className="progress-bar-container">
            <div
                className="progress-bar"
                style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            ></div>
        </div>

      {/* Question Area with Highlighted Category */}
      <div className="question-container">
        {/* Add optional chaining for safety during initial render/state changes */}
        <p className="question-category highlighted-category">{question?.category}</p>
        <h2 className="question-text">{question?.question}</h2>
      </div>

      {/* Options Container - Mapping over SHUFFLED options */}
      <div className="options-container">
        {shuffledOptions.map((optionValue, index) => (
          <button
            key={`${optionValue}-${index}`} // Key needs to be stable for the element
            ref={el => optionsRef.current[index] = el} // Assign ref based on index in map
            className={getOptionClass(optionValue, index)}
            onClick={() => handleOptionClick(optionValue, index)}
            disabled={isAnswered}
          >
            {optionValue}
          </button>
        ))}
      </div>
    </div>
  );
}

export default QuizScreen;