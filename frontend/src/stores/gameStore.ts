// Game Store - Zustand state management for Monster Farm

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameState, Farm, Monster, TrainingType, ContestType } from '../types/game';
import { GAME_CONFIG, MONSTER_SPECIES, PERSONALITIES, CARE_DECAY_RATES } from '../data/gameData';

interface GameActions {
  // Game initialization
  initializeGame: () => void;
  loadGame: () => boolean;
  saveGame: () => void;

  // Farm management
  addGold: (amount: number) => void;
  spendGold: (amount: number) => boolean;
  addPrestige: (amount: number) => { success: boolean; leveledUp: boolean; newLevel: number };
  expandFarm: () => boolean;

  // Monster management
  addMonster: (monster: Monster) => boolean;
  removeMonster: (monsterId: string) => boolean;
  updateMonster: (monsterId: string, updates: Partial<Monster>) => void;
  feedMonster: (monsterId: string, foodType: string) => boolean;
  cleanMonster: (monsterId: string) => boolean;
  playWithMonster: (monsterId: string) => boolean;

  // Training
  startTraining: (monsterId: string, trainingType: TrainingType) => boolean;
  completeTraining: (monsterId: string) => boolean;
  checkTrainingComplete: () => void;

  // Contests
  enterContest: (monsterId: string, contestType: ContestType) => boolean;

  // UI
  setCurrentView: (view: GameState['currentView']) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Game loop
  updateGame: (deltaTime: number) => void;
}

type GameStore = GameState & GameActions;

// Helper functions
const createInitialFarm = (): Farm => ({
  gold: 100,
  prestige: 0,
  level: 1,
  maxMonsters: GAME_CONFIG.baseFarmSlots,
  monsters: [],
  lastSaved: Date.now(),
  upgrades: []
});

const generateMonsterId = (): string => {
  return `monster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const getRandomPersonality = () => {
  return PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)];
};

const calculateMonsterStats = (species: typeof MONSTER_SPECIES[0], level: number) => {
  const baseStats = species.baseStats;
  const levelMultiplier = 1 + (level - 1) * 0.1;

  return {
    hp: Math.floor(baseStats.hp * levelMultiplier),
    attack: Math.floor(baseStats.attack * levelMultiplier),
    defense: Math.floor(baseStats.defense * levelMultiplier),
    speed: Math.floor(baseStats.speed * levelMultiplier),
    special: Math.floor(baseStats.special * levelMultiplier)
  };
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Initial state
      farm: createInitialFarm(),
      isLoading: false,
      error: null,
      currentView: 'farm',

      // Game initialization
      initializeGame: () => {
        set({ isLoading: true, error: null });

        try {
          // Create starter monster
          const starterSpecies = MONSTER_SPECIES.find(s => s.id === 'flamepup');
          if (!starterSpecies) {
            throw new Error('Starter species not found');
          }

          const starterMonster: Monster = {
            id: generateMonsterId(),
            species: starterSpecies,
            name: 'Flamepup',
            level: 1,
            experience: 0,
            stats: calculateMonsterStats(starterSpecies, 1),
            element: starterSpecies.element,
            personality: getRandomPersonality()!,
            bornAt: Date.now(),
            lastFed: Date.now(),
            lastCleaned: Date.now(),
            lastPlayed: Date.now(),
            hunger: 100,
            happiness: 100,
            cleanliness: 100,
            energy: 100,
            isTraining: false,
            evolutionStage: 0,
            prestige: 0
          };

          const newFarm = {
            ...createInitialFarm(),
            monsters: [starterMonster]
          };

          set({
            farm: newFarm,
            isLoading: false
          });

          get().saveGame();
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to initialize game',
            isLoading: false
          });
        }
      },

      loadGame: () => {
        try {
          const savedData = localStorage.getItem('monster-farm-save');
          if (!savedData) return false;

          const gameData = JSON.parse(savedData);
          set({
            farm: gameData.farm,
            currentView: gameData.currentView || 'farm'
          });

          return true;
        } catch (error) {
          console.error('Failed to load game:', error);
          return false;
        }
      },

      saveGame: () => {
        const state = get();
        const saveData = {
          farm: state.farm,
          currentView: state.currentView,
          lastSaved: Date.now()
        };

        localStorage.setItem('monster-farm-save', JSON.stringify(saveData));
        set(state => ({
          farm: { ...state.farm, lastSaved: Date.now() }
        }));
      },

      // Farm management
      addGold: (amount: number) => {
        set(state => ({
          farm: { ...state.farm, gold: state.farm.gold + amount }
        }));
      },

      spendGold: (amount: number) => {
        const state = get();
        if (state.farm.gold >= amount) {
          set(state => ({
            farm: { ...state.farm, gold: state.farm.gold - amount }
          }));
          return true;
        }
        return false;
      },

      addPrestige: (amount: number) => {
        const state = get();
        const newPrestige = state.farm.prestige + amount;
        const newLevel = Math.floor(newPrestige / 100) + 1;
        const leveledUp = newLevel > state.farm.level;

        set(state => ({
          farm: {
            ...state.farm,
            prestige: newPrestige,
            level: newLevel,
            maxMonsters: Math.min(newLevel, GAME_CONFIG.maxMonsters)
          }
        }));

        return { success: true, leveledUp, newLevel };
      },

      expandFarm: () => {
        const state = get();
        const expansionCost = (state.farm.maxMonsters - GAME_CONFIG.baseFarmSlots + 1) * 500;

        if (state.farm.gold >= expansionCost) {
          set(state => ({
            farm: {
              ...state.farm,
              gold: state.farm.gold - expansionCost,
              maxMonsters: state.farm.maxMonsters + 1
            }
          }));
          return true;
        }
        return false;
      },

      // Monster management
      addMonster: (monster: Monster) => {
        const state = get();
        if (state.farm.monsters.length >= state.farm.maxMonsters) {
          return false;
        }

        set(state => ({
          farm: {
            ...state.farm,
            monsters: [...state.farm.monsters, monster]
          }
        }));
        return true;
      },

      removeMonster: (monsterId: string) => {
        set(state => ({
          farm: {
            ...state.farm,
            monsters: state.farm.monsters.filter(m => m.id !== monsterId)
          }
        }));
        return true;
      },

      updateMonster: (monsterId: string, updates: Partial<Monster>) => {
        set(state => ({
          farm: {
            ...state.farm,
            monsters: state.farm.monsters.map(monster =>
              monster.id === monsterId ? { ...monster, ...updates } : monster
            )
          }
        }));
      },

      feedMonster: (monsterId: string, _foodType: string) => {
        const state = get();
        const monster = state.farm.monsters.find(m => m.id === monsterId);
        if (!monster) return false;

        // Simple feeding logic - restore hunger and happiness
        const hungerGain = 30;
        const happinessGain = 10;
        const cost = 20;

        if (!get().spendGold(cost)) return false;

        get().updateMonster(monsterId, {
          hunger: Math.min(100, monster.hunger + hungerGain),
          happiness: Math.min(100, monster.happiness + happinessGain),
          lastFed: Date.now()
        });

        return true;
      },

      cleanMonster: (monsterId: string) => {
        const state = get();
        const monster = state.farm.monsters.find(m => m.id === monsterId);
        if (!monster) return false;

        const cost = 30;
        if (!get().spendGold(cost)) return false;

        get().updateMonster(monsterId, {
          cleanliness: 100,
          happiness: Math.min(100, monster.happiness + 5),
          lastCleaned: Date.now()
        });

        return true;
      },

      playWithMonster: (monsterId: string) => {
        const state = get();
        const monster = state.farm.monsters.find(m => m.id === monsterId);
        if (!monster) return false;

        if (monster.energy < 20) return false;

        get().updateMonster(monsterId, {
          happiness: Math.min(100, monster.happiness + 20),
          energy: Math.max(0, monster.energy - 20),
          lastPlayed: Date.now()
        });

        return true;
      },

      // Training
      startTraining: (monsterId: string, trainingType: TrainingType) => {
        const state = get();
        const monster = state.farm.monsters.find(m => m.id === monsterId);
        if (!monster || monster.isTraining) return false;

        if (!get().spendGold(trainingType.cost)) return false;

        get().updateMonster(monsterId, {
          isTraining: true,
          trainingType,
          trainingEnd: Date.now() + trainingType.duration
        });

        return true;
      },

      completeTraining: (monsterId: string) => {
        const state = get();
        const monster = state.farm.monsters.find(m => m.id === monsterId);
        if (!monster || !monster.isTraining || !monster.trainingType) return false;

        const effects = monster.trainingType.effects;
        const newStats = { ...monster.stats };

        if (effects.hp) newStats.hp += effects.hp;
        if (effects.attack) newStats.attack += effects.attack;
        if (effects.defense) newStats.defense += effects.defense;
        if (effects.speed) newStats.speed += effects.speed;
        if (effects.special) newStats.special += effects.special;

        set(state => ({
          farm: {
            ...state.farm,
            monsters: state.farm.monsters.map(m =>
              m.id === monsterId 
                ? { 
                    ...m, 
                    isTraining: false,
                    trainingType: undefined,
                    trainingEnd: undefined,
                    stats: newStats,
                    experience: m.experience + 10
                  }
                : m
            )
          }
        }));

        return true;
      },

      checkTrainingComplete: () => {
        const state = get();
        const now = Date.now();

        state.farm.monsters.forEach(monster => {
          if (monster.isTraining && monster.trainingEnd && now >= monster.trainingEnd) {
            get().completeTraining(monster.id);
          }
        });
      },

      // Contests
      enterContest: (monsterId: string, contestType: ContestType) => {
        const state = get();
        const monster = state.farm.monsters.find(m => m.id === monsterId);
        if (!monster) return false;

        // Simple contest logic - random placement
        // const placement = Math.floor(Math.random() * 3) + 1; // 1st, 2nd, or 3rd
        const rewards = contestType.rewards;

        get().addGold(rewards.gold);
        get().addPrestige(rewards.prestige);

        return true;
      },

      // UI
      setCurrentView: (view: GameState['currentView']) => {
        set({ currentView: view });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      // Game loop
      updateGame: (deltaTime: number) => {
        const state = get();

        // Update monster care stats
        state.farm.monsters.forEach(monster => {
          const timeSinceFed = (Date.now() - monster.lastFed) / (1000 * 60); // minutes
          const timeSinceCleaned = (Date.now() - monster.lastCleaned) / (1000 * 60);
          const timeSincePlayed = (Date.now() - monster.lastPlayed) / (1000 * 60);

          const newHunger = Math.max(0, monster.hunger - (CARE_DECAY_RATES.hunger * timeSinceFed));
          const newHappiness = Math.max(0, monster.happiness - (CARE_DECAY_RATES.happiness * timeSincePlayed));
          const newCleanliness = Math.max(0, monster.cleanliness - (CARE_DECAY_RATES.cleanliness * timeSinceCleaned));
          const newEnergy = Math.min(100, monster.energy + (CARE_DECAY_RATES.energy * 0.1)); // Slow energy recovery

          if (newHunger !== monster.hunger || newHappiness !== monster.happiness ||
              newCleanliness !== monster.cleanliness || newEnergy !== monster.energy) {
            get().updateMonster(monster.id, {
              hunger: newHunger,
              happiness: newHappiness,
              cleanliness: newCleanliness,
              energy: newEnergy
            });
          }
        });

        // Check training completion
        get().checkTrainingComplete();

        // Auto-save periodically
        if (deltaTime > GAME_CONFIG.saveInterval) {
          get().saveGame();
        }
      }
    }),
    {
      name: 'monster-farm-storage',
      partialize: (state) => ({
        farm: state.farm,
        currentView: state.currentView
      })
    }
  )
);
