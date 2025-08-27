import React from 'react';
import { motion } from 'framer-motion';
import MonsterCard from '../ui/MonsterCard';
import { useGameStore } from '../../stores/gameStore';

const FarmView: React.FC = () => {
  const { farm } = useGameStore();

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-white mb-6">Your Farm</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farm.monsters.map((monster) => (
            <MonsterCard key={monster.id} monster={monster} />
          ))}

          {farm.monsters.length === 0 && (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="col-span-full text-center py-12"
            >
              <div className="text-6xl mb-4">🏡</div>
              <h3 className="text-xl font-semibold text-white mb-2">No Monsters Yet</h3>
              <p className="text-green-200">Your farm is waiting for its first monster!</p>
            </motion.div>
          )}
        </div>

        {farm.monsters.length < farm.maxMonsters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-center"
          >
            <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors duration-200">
              Add Monster ({farm.monsters.length}/{farm.maxMonsters})
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default FarmView;
