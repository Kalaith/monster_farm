import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import GameView from './components/GameView';
import MainMenu from './components/MainMenu';
import { useGameStore } from './stores/gameStore';

const App: React.FC = () => {
  const { currentView, initializeGame, loadGame, updateGame } = useGameStore();
  const gameLoopRef = useRef<number | null>(null);

  useEffect(() => {
    // Try to load saved game, otherwise initialize new game
    const loaded = loadGame();
    if (!loaded) {
      initializeGame();
    }
  }, [initializeGame, loadGame]);

  useEffect(() => {
    // Start game loop
    const loop = () => {
      updateGame(1000); // Update every second
      gameLoopRef.current = setTimeout(loop, 1000);
    };

    loop();

    return () => {
      if (gameLoopRef.current) {
        clearTimeout(gameLoopRef.current);
      }
    };
  }, [updateGame]);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {currentView === 'farm' ? <GameView /> : <MainMenu />}
              </motion.div>
            } />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
};

export default App;
