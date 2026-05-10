import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import GameView from './components/GameView';
import MainMenu from './components/MainMenu';
import { useGameStore } from './stores/gameStore';

const App: React.FC = () => {
  const { currentView, initializeGame, updateGame } = useGameStore();
  const gameLoopRef = useRef<number | null>(null);

  useEffect(() => {
    void initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    // Start game loop
    const loop = () => {
      void updateGame(1000);
      gameLoopRef.current = window.setTimeout(loop, 1000);
    };

    loop();

    return () => {
      if (gameLoopRef.current) {
        window.clearTimeout(gameLoopRef.current);
      }
    };
  }, [updateGame]);

  return (
    <Router basename={import.meta.env.BASE_URL}>
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900">
        <AnimatePresence mode="wait">
          <Routes>
            <Route
              path="/"
              element={
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {currentView === 'farm' ? <GameView /> : <MainMenu />}
                </motion.div>
              }
            />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
};

export default App;
