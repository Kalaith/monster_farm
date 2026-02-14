import React from 'react';
import { motion } from 'framer-motion';
import type { Monster } from '../../types/game';
import { elementData } from '../../data/gameData';
import { useGameStore } from '../../stores/gameStore';

interface MonsterCardProps {
  monster: Monster;
}

const MonsterCard: React.FC<MonsterCardProps> = ({ monster }) => {
  const { feedMonster, cleanMonster, playWithMonster } = useGameStore();
  const elementInfo = elementData[monster.element];

  const getStatusColor = (value: number) => {
    if (value >= 70) return 'text-green-400';
    if (value >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStatusBar = (value: number) => {
    return `${Math.max(0, Math.min(100, value))}%`;
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="bg-green-800 rounded-lg p-6 shadow-lg border border-green-700"
    >
      <div className="text-center mb-4">
        <div className="text-4xl mb-2">{monster.species.emoji}</div>
        <h3 className="text-xl font-bold text-white">{monster.name}</h3>
        <div className="flex items-center justify-center space-x-2 text-sm text-green-200">
          <span
            className="px-2 py-1 rounded"
            style={{
              backgroundColor: elementInfo.color + '40',
              color: elementInfo.color,
            }}
          >
            {elementInfo.name}
          </span>
          <span>Level {monster.level}</span>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div>
          <div className="flex justify-between text-sm text-green-200 mb-1">
            <span>Hunger</span>
            <span className={getStatusColor(monster.hunger)}>{Math.round(monster.hunger)}%</span>
          </div>
          <div className="w-full bg-green-900 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: getStatusBar(monster.hunger) }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm text-green-200 mb-1">
            <span>Happiness</span>
            <span className={getStatusColor(monster.happiness)}>
              {Math.round(monster.happiness)}%
            </span>
          </div>
          <div className="w-full bg-green-900 rounded-full h-2">
            <div
              className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
              style={{ width: getStatusBar(monster.happiness) }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm text-green-200 mb-1">
            <span>Cleanliness</span>
            <span className={getStatusColor(monster.cleanliness)}>
              {Math.round(monster.cleanliness)}%
            </span>
          </div>
          <div className="w-full bg-green-900 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: getStatusBar(monster.cleanliness) }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm text-green-200 mb-1">
            <span>Energy</span>
            <span className={getStatusColor(monster.energy)}>{Math.round(monster.energy)}%</span>
          </div>
          <div className="w-full bg-green-900 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: getStatusBar(monster.energy) }}
            />
          </div>
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => feedMonster(monster.id, 'berries')}
          className="flex-1 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded transition-colors duration-200"
          disabled={monster.hunger >= 90}
        >
          Feed
        </button>

        <button
          onClick={() => cleanMonster(monster.id)}
          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors duration-200"
          disabled={monster.cleanliness >= 90}
        >
          Clean
        </button>

        <button
          onClick={() => playWithMonster(monster.id)}
          className="flex-1 px-3 py-2 bg-pink-600 hover:bg-pink-700 text-white text-sm font-medium rounded transition-colors duration-200"
          disabled={monster.energy < 20}
        >
          Play
        </button>
      </div>

      {monster.isTraining && (
        <div className="mt-3 text-center">
          <div className="text-sm text-yellow-400 font-medium">Training in progress...</div>
          <div className="text-xs text-green-200">
            {monster.trainingEnd
              ? Math.max(0, Math.ceil((monster.trainingEnd - Date.now()) / 1000))
              : 0}
            s remaining
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default MonsterCard;
