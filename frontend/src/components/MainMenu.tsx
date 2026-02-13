import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';

const MainMenu: React.FC = () => {
  const { setCurrentView } = useGameStore();

  const handleStartGame = () => {
    setCurrentView('farm');
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.h1
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-6xl font-bold text-white mb-8"
        >
          Monster Farm
        </motion.h1>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="space-y-4"
        >
          <button
            onClick={handleStartGame}
            className="block w-64 mx-auto px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors duration-200 transform hover:scale-105"
          >
            Start Game
          </button>

          <button className="block w-64 mx-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors duration-200 transform hover:scale-105">
            Load Game
          </button>

          <button className="block w-64 mx-auto px-8 py-4 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors duration-200 transform hover:scale-105">
            Settings
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-12 text-green-200 text-sm"
        >
          Raise and train your monsters!
        </motion.p>
      </motion.div>
    </div>
  );
};

export default MainMenu;
