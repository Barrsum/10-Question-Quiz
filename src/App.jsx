// src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import StartScreen from './components/StartScreen';
import QuizScreen from './components/QuizScreen';
import ResultScreen from './components/ResultScreen';
import { FaPause, FaExclamationTriangle } from 'react-icons/fa'; // Import icon for warning modal
import allQuestions from './data/questions.json';
import './index.css'; // Global styles
import './App.css'; // App-specific styles

// Constants
const TOTAL_QUESTIONS = 10;
const CATEGORIES = ["Math", "Science", "History", "Grammar", "Logical Reasoning"];
const QUESTIONS_PER_CATEGORY = 2;
const INITIAL_LIVES = 3; // Defined here
const NEXT_QUESTION_DELAY = 1000; // Milliseconds after feedback

function App() {
  // State variables
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('quizTheme');
    return savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'dark';
  });
  const [gameState, setGameState] = useState('start'); // 'start', 'playing', 'paused', 'finished', 'gameOver'
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [isModalOpen, setIsModalOpen] = useState(false); // Format modal
  const [hasSwitchedTab, setHasSwitchedTab] = useState(false);
  // State for Warning Modal
  const [showTabSwitchWarningModal, setShowTabSwitchWarningModal] = useState(false);
  const [warningModalShownThisSession, setWarningModalShownThisSession] = useState(false);

  // --- Theme Logic ---
  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('quizTheme', newTheme);
      return newTheme;
    });
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // --- Game Logic Functions ---

  // Shuffle Array (Fisher-Yates)
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

  // Select Questions
  const selectQuizQuestions = () => {
    let selected = [];
    const availableQuestions = JSON.parse(JSON.stringify(allQuestions));

    CATEGORIES.forEach(category => {
      const categoryQuestions = availableQuestions.filter(q => q.category === category);
      const shuffledCategoryQuestions = shuffleArray(categoryQuestions);
      selected = selected.concat(shuffledCategoryQuestions.slice(0, QUESTIONS_PER_CATEGORY));
    });

    if (selected.length < TOTAL_QUESTIONS) {
      const remainingAvailable = availableQuestions.filter(q =>
        !selected.some(selectedQ => selectedQ.question === q.question)
      );
      if (remainingAvailable.length > 0) {
        const remainingShuffled = shuffleArray(remainingAvailable);
        const needed = TOTAL_QUESTIONS - selected.length;
        selected = selected.concat(remainingShuffled.slice(0, needed));
      }
    }
    return shuffleArray(selected.slice(0, TOTAL_QUESTIONS));
  };

  // Start Game (Reset warning flags)
  const startGame = () => {
    setHasSwitchedTab(false);
    setWarningModalShownThisSession(false); // Reset warning shown flag
    setShowTabSwitchWarningModal(false); // Ensure warning modal is closed
    setScore(0);
    setLives(INITIAL_LIVES);
    setCurrentQuestionIndex(0);
    const selectedQs = selectQuizQuestions();
    if (selectedQs.length < TOTAL_QUESTIONS) {
        console.error("Error: Could not select enough unique questions!");
        alert("Sorry, there was an issue starting the quiz.");
        setGameState('start');
        return;
    }
    setQuestions(selectedQs);
    setGameState('playing');
    setIsModalOpen(false);
  };

  // Format Modal
  const openFormatModal = () => setIsModalOpen(true);
  const closeFormatModal = () => setIsModalOpen(false);

  // Handle Answer Submission
  const handleAnswer = useCallback((isCorrect) => {
    let currentLives = lives;
    if (isCorrect) {
      setScore((prevScore) => prevScore + 10);
    } else {
      currentLives = lives - 1;
      setLives(currentLives);
    }

    // Decide next step AFTER the feedback delay
    setTimeout(() => {
      if (currentLives <= 0) {
        setGameState('gameOver');
      } else if (currentQuestionIndex >= questions.length - 1) {
        setGameState('finished');
      } else {
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      }
    }, NEXT_QUESTION_DELAY);
  }, [lives, currentQuestionIndex, questions.length]); // Dependencies for useCallback

  // Pause/Resume
  const pauseGame = () => {
    if (gameState === 'playing') setGameState('paused');
  };
  const resumeGame = () => {
      // Ensure warning modal is closed when resuming manually
      setShowTabSwitchWarningModal(false);
      if (gameState === 'paused') setGameState('playing');
  };
  // Restart Game (Reset warning flags)
  const restartGame = () => {
    setHasSwitchedTab(false);
    setWarningModalShownThisSession(false); // Reset warning shown flag
    setShowTabSwitchWarningModal(false); // Ensure warning modal is closed
    setScore(0);
    setLives(INITIAL_LIVES);
    setCurrentQuestionIndex(0);
    setQuestions([]);
    setGameState('start');
  };

  // --- Tab Visibility Detection ---
  useEffect(() => {
    const handleVisibilityChange = () => {
      // When tab becomes hidden while playing
      if (document.hidden && gameState === 'playing') {
        console.warn("User switched tab/minimized during quiz!");
        setHasSwitchedTab(true); // Mark that it happened
        // Optional: Auto-pause
        // if (gameState === 'playing') { pauseGame(); }
      }
      // When tab becomes visible again
      else if (!document.hidden && (gameState === 'playing' || gameState === 'paused')) {
         // Check if they had previously switched tab AND warning hasn't been shown yet this session
        if (hasSwitchedTab && !warningModalShownThisSession) {
            console.log("Showing tab switch warning modal.");
            setShowTabSwitchWarningModal(true);
            setWarningModalShownThisSession(true); // Mark warning as shown for this game session
            // Optional: Ensure game remains paused if auto-pause was used
            // if (gameState === 'playing') { pauseGame(); }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    console.log("Visibility listener added.");

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      console.log("Visibility listener removed.");
    };
    // Update dependencies if pauseGame is uncommented
  }, [gameState, hasSwitchedTab, warningModalShownThisSession]);


  // --- Function to close the warning modal ---
  const closeWarningModal = () => {
      setShowTabSwitchWarningModal(false);
      // Optional: Auto-resume if needed
      // if (gameState === 'paused' && hasSwitchedTab) { resumeGame(); }
  };

  // --- Render Logic ---
  const renderContent = () => {
    switch (gameState) {
      case 'playing':
        return questions.length > 0 && currentQuestionIndex < questions.length ? (
          <QuizScreen
            question={questions[currentQuestionIndex]}
            onAnswer={handleAnswer}
            onPause={pauseGame}
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={TOTAL_QUESTIONS}
            lives={lives}
            score={score}
            initialLives={INITIAL_LIVES} // <-- Pass INITIAL_LIVES prop
          />
        ) : (<div className="loading-state">Loading Questions...</div>);

      case 'paused':
        return (
          <div className="pause-overlay overlay-screen">
            <h2>Game Paused</h2>
            <div className="button-group">
              <button onClick={resumeGame} className="resume-button action-button">Resume</button>
              <button onClick={restartGame} className="restart-button secondary-button">Return To Home</button>
            </div>
          </div>
        );

      case 'finished':
        return (
          <ResultScreen
            score={score}
            lives={lives}
            onRestart={restartGame}
            hasSwitchedTab={hasSwitchedTab}
            initialLives={INITIAL_LIVES} // <-- Pass INITIAL_LIVES prop
          />
        );

      case 'gameOver':
        return (
          <div className="gameover-screen overlay-screen">
            <h2>Game Over!</h2>
            <div className="gameover-icon" style={{ fontSize: '4rem', margin: '1rem 0', color: 'var(--incorrect-text)' }}>💔</div>
            <p>You ran out of lives.</p>
            {hasSwitchedTab && <p className="switched-tab-warning"><FaExclamationTriangle style={{ marginRight: '5px' }}/> Tab switching detected.</p>}
            <p className="final-score">Final Score: <strong>{score}</strong></p>
            <button onClick={restartGame} className="action-button">Try Again?</button>
          </div>
        );

      case 'start':
      default:
        return (
          <StartScreen
            onStartGame={startGame}
            onOpenFormatModal={openFormatModal}
          />
        );
    }
  };

  // --- Main JSX Structure ---
  return (
    <div className="App">
      <Header theme={theme} toggleTheme={toggleTheme} />
      <main className="main-content">
        {renderContent()}
      </main>

      {/* Format Modal */}
      {isModalOpen && (
         <div className="modal-backdrop" onClick={closeFormatModal}>
           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
             <h2>Quiz Format Explained</h2>
             <p>Welcome to the 10 Question Quiz!</p>
             <ul>
               <li>Answer <strong>{TOTAL_QUESTIONS} questions</strong> selected randomly from categories like Math, Science, History, etc.</li>
               <li>You start with <strong>{INITIAL_LIVES} lives</strong> (❤️).</li>
               <li>Answering incorrectly costs 1 life.</li>
               <li>Finish with {INITIAL_LIVES} lives: <strong style={{ color: 'var(--trophy-gold)' }}>Gold Trophy</strong> 🥇</li>
               <li>Finish with {INITIAL_LIVES - 1} {INITIAL_LIVES - 1 === 1 ? 'life' : 'lives'}: <strong style={{ color: 'var(--trophy-silver)' }}>Silver Trophy</strong> 🥈</li>
               <li>Finish with {INITIAL_LIVES - 2} {INITIAL_LIVES - 2 === 1 ? 'life' : 'lives'}: <strong style={{ color: 'var(--trophy-bronze)' }}>Bronze Trophy</strong> 🥉</li>
               <li>Losing all lives means Game Over.</li>
               <li>You can <strong style={{ color: 'var(--accent-color)' }}>Pause</strong> the game anytime using the pause button (<FaPause style={{ verticalAlign: 'middle' }}/>).</li>
               <li>Heads up! Switching tabs or minimizing the window during the quiz is detected.</li>
             </ul>
             <button onClick={closeFormatModal} className="action-button">Got it!</button>
           </div>
         </div>
      )}

      {/* Tab Switch Warning Modal */}
      {showTabSwitchWarningModal && (
         <div className="modal-backdrop" onClick={closeWarningModal}> {/* Close on backdrop click */}
           <div className="warning-modal-content" onClick={(e) => e.stopPropagation()}>
             <FaExclamationTriangle className="warning-icon" />
             <h3>Heads Up!</h3>
             <p>Switching tabs or minimizing the browser during the quiz isn't recommended. Please stay focused to ensure fair play!</p>
             <button onClick={closeWarningModal} className="action-button">Okay, Got It</button>
           </div>
         </div>
      )}

      <Footer />
    </div>
  );
}

export default App;