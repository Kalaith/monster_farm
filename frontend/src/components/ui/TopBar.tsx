import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';
import type { GameState } from '../../types/game';

const TopBar: React.FC = () => {
  const { farm, setCurrentView, currentView } = useGameStore();

  const navigation: Array<{
    id: GameState['currentView'];
    label: string;
    icon: string;
  }> = [
    { id: 'farm', label: 'Farm', icon: '🏡' },
    { id: 'monsters', label: 'Monsters', icon: '🐾' },
    { id: 'training', label: 'Training', icon: '💪' },
    { id: 'shop', label: 'Shop', icon: '🛒' },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-green-800 shadow-lg"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="text-2xl font-bold text-white">Monster Farm</h1>

            <div className="flex items-center space-x-4 text-green-100">
              <div className="flex items-center space-x-2">
                <span className="text-yellow-400">🪙</span>
                <span className="font-semibold">{farm.gold}</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-purple-400">⭐</span>
                <span className="font-semibold">{farm.prestige}</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-blue-400">🏆</span>
                <span className="font-semibold">Level {farm.level}</span>
              </div>
            </div>
          </div>

          <nav className="flex space-x-2">
            {navigation.map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  currentView === item.id
                    ? 'bg-green-600 text-white'
                    : 'bg-green-700 text-green-100 hover:bg-green-600'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </motion.header>
  );
};

export default TopBar;
