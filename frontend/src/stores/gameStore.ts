import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameState, Farm, Monster, TrainingType, ContestType } from '../types/game';
import { webhatcheryGameApi, type WebHatcheryGameState } from '../api/webhatcheryGameApi';
import { useWebHatcherySessionStore } from './webhatcherySessionStore';

interface GameActions {
  initializeGame: () => Promise<void>;
  loadGame: () => Promise<boolean>;
  saveGame: () => Promise<void>;
  addGold: (amount: number) => Promise<void>;
  spendGold: (amount: number) => Promise<boolean>;
  addPrestige: (amount: number) => Promise<{
    success: boolean;
    leveledUp: boolean;
    newLevel: number;
  }>;
  expandFarm: () => Promise<boolean>;
  addMonster: (monster: Monster) => Promise<boolean>;
  removeMonster: (monsterId: string) => Promise<boolean>;
  updateMonster: (monsterId: string, updates: Partial<Monster>) => Promise<void>;
  feedMonster: (monsterId: string, foodType: string) => Promise<boolean>;
  cleanMonster: (monsterId: string) => Promise<boolean>;
  playWithMonster: (monsterId: string) => Promise<boolean>;
  startTraining: (monsterId: string, trainingType: TrainingType) => Promise<boolean>;
  completeTraining: (monsterId: string) => Promise<boolean>;
  checkTrainingComplete: () => Promise<void>;
  enterContest: (monsterId: string, contestType: ContestType) => Promise<boolean>;
  setCurrentView: (view: GameState['currentView']) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateGame: (deltaTime: number) => Promise<void>;
}

type GameStore = GameState & GameActions;

const emptyFarm: Farm = {
  gold: 0,
  prestige: 0,
  level: 1,
  maxMonsters: 1,
  monsters: [],
  lastSaved: Date.now(),
  upgrades: [],
};

let tickInFlight = false;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const applyBackendGame = (set: (state: Partial<GameStore>) => void, game: WebHatcheryGameState): void => {
  const state = game.save.state;
  if (!isRecord(state) || !isRecord(state.farm)) {
    set({ isLoading: false, error: 'Backend returned an invalid farm state.' });
    return;
  }

  set({
    farm: state.farm as unknown as Farm,
    currentView: typeof state.currentView === 'string' ? (state.currentView as GameState['currentView']) : 'farm',
    isLoading: false,
    error: null,
  });
};

const loadBackendGame = async (): Promise<WebHatcheryGameState> => {
  const session = useWebHatcherySessionStore.getState();
  try {
    return await session.loadGame();
  } catch {
    return await session.continueAsGuest();
  }
};

const runIntent = async (
  set: (state: Partial<GameStore>) => void,
  intent: string,
  payload: Record<string, unknown> = {},
  showLoading = true,
): Promise<WebHatcheryGameState> => {
  if (showLoading) {
    set({ isLoading: true, error: null });
  }
  const game = await webhatcheryGameApi.applyIntent(intent, payload);
  useWebHatcherySessionStore.setState({ gameState: game, user: game.user });
  applyBackendGame(set, game);
  return game;
};

const stateFromGame = (game: WebHatcheryGameState): GameState => {
  const state = game.save.state;
  return {
    farm: isRecord(state.farm) ? (state.farm as unknown as Farm) : emptyFarm,
    currentView: typeof state.currentView === 'string' ? (state.currentView as GameState['currentView']) : 'farm',
    isLoading: false,
    error: null,
  };
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      farm: emptyFarm,
      isLoading: false,
      error: null,
      currentView: 'farm',

      initializeGame: async () => {
        set({ isLoading: true, error: null });
        try {
          applyBackendGame(set, await loadBackendGame());
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to initialize game',
          });
        }
      },

      loadGame: async () => {
        try {
          applyBackendGame(set, await loadBackendGame());
          return true;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to load game' });
          return false;
        }
      },

      saveGame: async () => {
        try {
          await runIntent(set, 'save');
        } catch (error) {
          set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to save game' });
        }
      },

      addGold: async amount => {
        try {
          await runIntent(set, 'add_gold', { amount });
        } catch (error) {
          set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to add gold' });
        }
      },

      spendGold: async amount => {
        try {
          await runIntent(set, 'spend_gold', { amount });
          return true;
        } catch (error) {
          set({ isLoading: false, error: error instanceof Error ? error.message : 'Not enough gold' });
          return false;
        }
      },

      addPrestige: async amount => {
        const previousLevel = get().farm.level;
        try {
          const game = await runIntent(set, 'add_prestige', { amount });
          const nextState = stateFromGame(game);
          return {
            success: true,
            leveledUp: nextState.farm.level > previousLevel,
            newLevel: nextState.farm.level,
          };
        } catch (error) {
          set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to add prestige' });
          return { success: false, leveledUp: false, newLevel: previousLevel };
        }
      },

      expandFarm: async () => {
        try {
          await runIntent(set, 'expand_farm');
          return true;
        } catch (error) {
          set({ isLoading: false, error: error instanceof Error ? error.message : 'Unable to expand farm' });
          return false;
        }
      },

      addMonster: async monster => {
        try {
          await runIntent(set, 'add_monster', { monster });
          return true;
        } catch (error) {
          set({ isLoading: false, error: error instanceof Error ? error.message : 'Unable to add monster' });
          return false;
        }
      },

      removeMonster: async monsterId => {
        try {
          await runIntent(set, 'remove_monster', { monsterId });
          return true;
        } catch (error) {
          set({ isLoading: false, error: error instanceof Error ? error.message : 'Unable to remove monster' });
          return false;
        }
      },

      updateMonster: async (monsterId, updates) => {
        try {
          await runIntent(set, 'update_monster', { monsterId, updates });
        } catch (error) {
          set({ isLoading: false, error: error instanceof Error ? error.message : 'Unable to update monster' });
        }
      },

      feedMonster: async (monsterId, foodType) => {
        try {
          await runIntent(set, 'feed_monster', { monsterId, foodType });
          return true;
        } catch (error) {
          set({ isLoading: false, error: error instanceof Error ? error.message : 'Unable to feed monster' });
          return false;
        }
      },

      cleanMonster: async monsterId => {
        try {
          await runIntent(set, 'clean_monster', { monsterId });
          return true;
        } catch (error) {
          set({ isLoading: false, error: error instanceof Error ? error.message : 'Unable to clean monster' });
          return false;
        }
      },

      playWithMonster: async monsterId => {
        try {
          await runIntent(set, 'play_with_monster', { monsterId });
          return true;
        } catch (error) {
          set({ isLoading: false, error: error instanceof Error ? error.message : 'Unable to play with monster' });
          return false;
        }
      },

      startTraining: async (monsterId, trainingType) => {
        try {
          await runIntent(set, 'start_training', { monsterId, trainingType });
          return true;
        } catch (error) {
          set({ isLoading: false, error: error instanceof Error ? error.message : 'Unable to start training' });
          return false;
        }
      },

      completeTraining: async monsterId => {
        try {
          await runIntent(set, 'complete_training', { monsterId });
          return true;
        } catch (error) {
          set({ isLoading: false, error: error instanceof Error ? error.message : 'Unable to complete training' });
          return false;
        }
      },

      checkTrainingComplete: async () => {
        await get().updateGame(1000);
      },

      enterContest: async (monsterId, contestType) => {
        try {
          await runIntent(set, 'enter_contest', { monsterId, contestType });
          return true;
        } catch (error) {
          set({ isLoading: false, error: error instanceof Error ? error.message : 'Unable to enter contest' });
          return false;
        }
      },

      setCurrentView: view => {
        set({ currentView: view });
      },

      setLoading: loading => {
        set({ isLoading: loading });
      },

      setError: error => {
        set({ error });
      },

      updateGame: async deltaTime => {
        if (tickInFlight) return;
        tickInFlight = true;
        try {
          await runIntent(set, 'tick', { deltaTime }, false);
        } catch (error) {
          set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to update game' });
        } finally {
          tickInFlight = false;
        }
      },
    }),
    {
      name: 'monster-farm-storage',
      partialize: state => ({
        currentView: state.currentView,
      }),
    }
  )
);
