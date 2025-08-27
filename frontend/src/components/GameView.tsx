import React from 'react';
import { motion } from 'framer-motion';
import TopBar from './ui/TopBar';
import FarmView from './game/FarmView';
import MonsterList from './game/MonsterList';
import TrainingCenter from './game/TrainingCenter';
import Shop from './game/Shop';
import { useGameStore } from '../stores/gameStore';

const GameView: React.FC = () => {
  const { currentView } = useGameStore();

  const renderCurrentView = () => {
    switch (currentView) {
      case 'farm':
        return <FarmView />;
      case 'monsters':
        return <MonsterList />;
      case 'training':
        return <TrainingCenter />;
      case 'shop':
        return <Shop />;
      default:
        return <FarmView />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900">
      <TopBar />

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-6"
      >
        {renderCurrentView()}
      </motion.main>
    </div>
  );
};

export default GameView;
