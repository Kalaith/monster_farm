// Monster Farm Game Types

export interface GameConfig {
  version: string;
  tickInterval: number;
  saveInterval: number;
  maxMonsters: number;
  baseFarmSlots: number;
  maxLevel: number;
}

export type ElementType =
  | 'fire'
  | 'water'
  | 'earth'
  | 'air'
  | 'electric'
  | 'dark'
  | 'light';

export interface ElementData {
  name: string;
  emoji: string;
  color: string;
  strengths: ElementType[];
  weaknesses: ElementType[];
  statBonuses: {
    hp?: number;
    attack?: number;
    defense?: number;
    speed?: number;
    special?: number;
  };
}

export interface BaseStats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  special: number;
}

export interface MonsterSpecies {
  id: string;
  name: string;
  element: ElementType;
  emoji: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  baseStats: BaseStats;
  evolvesTo?: string[];
}

export interface TrainingType {
  id: string;
  name: string;
  icon: string;
  description: string;
  cost: number;
  duration: number;
  effects: {
    hp?: number;
    attack?: number;
    defense?: number;
    speed?: number;
    special?: number;
    resistanceBonus?: number;
  };
  unlocked: boolean;
}

export interface ContestType {
  id: string;
  name: string;
  type: 'battle' | 'agility' | 'beauty';
  description: string;
  requirements: {
    level?: number;
    happiness?: number;
  };
  rewards: {
    gold: number;
    prestige: number;
  };
  statRequirements: string[];
}

export interface ShopItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  price: number;
  effects: Record<string, any>;
  category: 'food' | 'items' | 'eggs' | 'upgrades';
}

export interface Personality {
  id: string;
  name: string;
  emoji: string;
  effects: Record<string, number>;
}

export interface CareDecayRates {
  hunger: number;
  happiness: number;
  cleanliness: number;
  energy: number;
}

export interface CareThresholds {
  critical: number;
  low: number;
  good: number;
  excellent: number;
}

export interface EvolutionRequirements {
  level: {
    first: number;
    second: number;
  };
  care: {
    happiness: number;
    cleanliness: number;
  };
  stats: {
    minTotal: number;
  };
}

export interface FarmLevel {
  level: number;
  requiredPrestige: number;
  maxMonsters: number;
  unlockedFeatures: string[];
}

export interface RarityChances {
  common: number;
  uncommon: number;
  rare: number;
  legendary: number;
}

export interface Monster {
  id: string;
  species: MonsterSpecies;
  name: string;
  level: number;
  experience: number;
  stats: BaseStats;
  element: ElementType;
  personality: Personality;
  bornAt: number;
  lastFed: number;
  lastCleaned: number;
  lastPlayed: number;
  hunger: number;
  happiness: number;
  cleanliness: number;
  energy: number;
  isTraining: boolean;
  trainingEnd?: number | undefined;
  trainingType?: TrainingType | undefined;
  evolutionStage: number;
  prestige: number;
}

export interface Farm {
  gold: number;
  prestige: number;
  level: number;
  maxMonsters: number;
  monsters: Monster[];
  lastSaved: number;
  upgrades: string[];
}

export interface GameState {
  farm: Farm;
  isLoading: boolean;
  error: string | null;
  currentView: 'farm' | 'monsters' | 'training' | 'contests' | 'shop';
}

export interface TrainingSession {
  monster: Monster;
  trainingType: TrainingType;
  startTime: number;
  endTime: number;
}

export interface ContestResult {
  contest: ContestType;
  monster: Monster;
  placement: number;
  rewards: {
    gold: number;
    prestige: number;
  };
}
