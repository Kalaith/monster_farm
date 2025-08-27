// Monster Farm Legacy - Game Constants

const GAME_CONFIG = {
    version: '1.0.0',
    tickInterval: 1000, // 1 second
    saveInterval: 10000, // 10 seconds
    maxMonsters: 50,
    baseFarmSlots: 1,
    maxLevel: 100
};

const ELEMENTS = {
    FIRE: 'fire',
    WATER: 'water',
    EARTH: 'earth',
    AIR: 'air',
    ELECTRIC: 'electric',
    DARK: 'dark',
    LIGHT: 'light'
};

const ELEMENT_DATA = {
    [ELEMENTS.FIRE]: {
        name: 'Fire',
        emoji: '🔥',
        color: '#ff6b47',
        strengths: [ELEMENTS.EARTH, ELEMENTS.AIR],
        weaknesses: [ELEMENTS.WATER, ELEMENTS.ELECTRIC],
        statBonuses: { attack: 1.2, special: 1.1, defense: 0.9 }
    },
    [ELEMENTS.WATER]: {
        name: 'Water',
        emoji: '💧',
        color: '#4ecdc4',
        strengths: [ELEMENTS.FIRE, ELEMENTS.EARTH],
        weaknesses: [ELEMENTS.ELECTRIC, ELEMENTS.AIR],
        statBonuses: { special: 1.2, hp: 1.1, speed: 0.9 }
    },
    [ELEMENTS.EARTH]: {
        name: 'Earth',
        emoji: '🌍',
        color: '#8b5cf6',
        strengths: [ELEMENTS.ELECTRIC, ELEMENTS.FIRE],
        weaknesses: [ELEMENTS.WATER, ELEMENTS.AIR],
        statBonuses: { defense: 1.3, hp: 1.2, speed: 0.8 }
    },
    [ELEMENTS.AIR]: {
        name: 'Air',
        emoji: '💨',
        color: '#06d6a0',
        strengths: [ELEMENTS.EARTH, ELEMENTS.WATER],
        weaknesses: [ELEMENTS.ELECTRIC, ELEMENTS.FIRE],
        statBonuses: { speed: 1.3, special: 1.1, defense: 0.8 }
    },
    [ELEMENTS.ELECTRIC]: {
        name: 'Electric',
        emoji: '⚡',
        color: '#ffd23f',
        strengths: [ELEMENTS.WATER, ELEMENTS.AIR],
        weaknesses: [ELEMENTS.EARTH, ELEMENTS.DARK],
        statBonuses: { speed: 1.2, attack: 1.1, hp: 0.9 }
    },
    [ELEMENTS.DARK]: {
        name: 'Dark',
        emoji: '🌑',
        color: '#6c5ce7',
        strengths: [ELEMENTS.LIGHT, ELEMENTS.ELECTRIC],
        weaknesses: [ELEMENTS.LIGHT, ELEMENTS.FIRE],
        statBonuses: { special: 1.2, attack: 1.1, defense: 0.9 }
    },
    [ELEMENTS.LIGHT]: {
        name: 'Light',
        emoji: '✨',
        color: '#fdcb6e',
        strengths: [ELEMENTS.DARK, ELEMENTS.FIRE],
        weaknesses: [ELEMENTS.DARK, ELEMENTS.WATER],
        statBonuses: { hp: 1.2, special: 1.1, attack: 0.9 }
    }
};

const MONSTER_SPECIES = [
    {
        id: 'blobling',
        name: 'Blobling',
        element: ELEMENTS.WATER,
        emoji: '🫧',
        rarity: 'common',
        baseStats: { hp: 50, attack: 35, defense: 40, speed: 45, special: 50 },
        evolvesTo: ['aquaserpent', 'frostguard']
    },
    {
        id: 'flamepup',
        name: 'Flamepup',
        element: ELEMENTS.FIRE,
        emoji: '🔥',
        rarity: 'common',
        baseStats: { hp: 45, attack: 55, defense: 30, speed: 50, special: 40 },
        evolvesTo: ['blazehound', 'infernodrake']
    },
    {
        id: 'rocksprout',
        name: 'Rocksprout',
        element: ELEMENTS.EARTH,
        emoji: '🌱',
        rarity: 'common',
        baseStats: { hp: 60, attack: 40, defense: 55, speed: 25, special: 35 },
        evolvesTo: ['stonebreaker', 'crystalking']
    },
    {
        id: 'windwhisper',
        name: 'Windwhisper',
        element: ELEMENTS.AIR,
        emoji: '🪶',
        rarity: 'common',
        baseStats: { hp: 40, attack: 45, defense: 30, speed: 65, special: 45 },
        evolvesTo: ['stormrider', 'skyguardian']
    },
    {
        id: 'sparkbug',
        name: 'Sparkbug',
        element: ELEMENTS.ELECTRIC,
        emoji: '🐛',
        rarity: 'common',
        baseStats: { hp: 35, attack: 50, defense: 35, speed: 60, special: 45 },
        evolvesTo: ['voltwasp', 'thunderbeast']
    },
    {
        id: 'shadowmite',
        name: 'Shadowmite',
        element: ELEMENTS.DARK,
        emoji: '🕷️',
        rarity: 'uncommon',
        baseStats: { hp: 40, attack: 50, defense: 35, speed: 45, special: 55 },
        evolvesTo: ['nightcrawler', 'voidlord']
    },
    {
        id: 'lumisprite',
        name: 'Lumisprite',
        element: ELEMENTS.LIGHT,
        emoji: '✨',
        rarity: 'uncommon',
        baseStats: { hp: 55, attack: 35, defense: 40, speed: 40, special: 55 },
        evolvesTo: ['angelwing', 'prismheart']
    }
];

const TRAINING_TYPES = {
    STRENGTH: {
        id: 'strength',
        name: 'Strength Training',
        icon: '💪',
        description: 'Increases Attack and HP',
        cost: 50,
        duration: 30000, // 30 seconds
        effects: { attack: 2, hp: 1 },
        unlocked: true
    },
    DEFENSE: {
        id: 'defense',
        name: 'Defense Drill',
        icon: '🛡️',
        description: 'Boosts Defense and HP',
        cost: 50,
        duration: 30000,
        effects: { defense: 2, hp: 1 },
        unlocked: true
    },
    SPEED: {
        id: 'speed',
        name: 'Agility Course',
        icon: '🏃',
        description: 'Enhances Speed and Special',
        cost: 75,
        duration: 45000, // 45 seconds
        effects: { speed: 2, special: 1 },
        unlocked: false
    },
    SPECIAL: {
        id: 'special',
        name: 'Meditation',
        icon: '🧘',
        description: 'Focuses Special abilities',
        cost: 75,
        duration: 45000,
        effects: { special: 3 },
        unlocked: false
    },
    RESISTANCE: {
        id: 'resistance',
        name: 'Resistance Training',
        icon: '⚖️',
        description: 'Reduces elemental weaknesses',
        cost: 150,
        duration: 60000, // 60 seconds
        effects: { resistanceBonus: 0.1 },
        unlocked: false
    },
    BALANCED: {
        id: 'balanced',
        name: 'Balanced Regimen',
        icon: '⚡',
        description: 'Small boost to all stats',
        cost: 100,
        duration: 90000, // 90 seconds
        effects: { hp: 1, attack: 1, defense: 1, speed: 1, special: 1 },
        unlocked: false
    }
};

const CONTEST_TYPES = {
    BATTLE: {
        id: 'battle',
        name: 'Battle Contest',
        type: 'battle',
        description: 'Pure combat competition',
        requirements: { level: 5 },
        rewards: { gold: 200, prestige: 10 },
        statRequirements: ['attack', 'defense', 'hp']
    },
    AGILITY: {
        id: 'agility',
        name: 'Agility Trial',
        type: 'agility',
        description: 'Speed and reflexes challenge',
        requirements: { level: 3 },
        rewards: { gold: 150, prestige: 8 },
        statRequirements: ['speed', 'special']
    },
    BEAUTY: {
        id: 'beauty',
        name: 'Beauty Pageant',
        type: 'beauty',
        description: 'Care and grooming showcase',
        requirements: { level: 1, happiness: 80 },
        rewards: { gold: 100, prestige: 5 },
        statRequirements: ['happiness', 'cleanliness']
    }
};

const SHOP_ITEMS = {
    FOOD: [
        {
            id: 'berries',
            name: 'Wild Berries',
            icon: '🫐',
            description: 'Restores hunger and adds happiness',
            price: 20,
            effects: { hunger: 30, happiness: 10 },
            category: 'food'
        },
        {
            id: 'premium_food',
            name: 'Premium Feed',
            icon: '🥘',
            description: 'High-quality nutrition boosts stats',
            price: 75,
            effects: { hunger: 50, happiness: 15, tempStatBonus: 0.1 },
            category: 'food'
        },
        {
            id: 'energy_drink',
            name: 'Energy Elixir',
            icon: '🧪',
            description: 'Instantly restores energy',
            price: 50,
            effects: { energy: 100 },
            category: 'food'
        }
    ],
    ITEMS: [
        {
            id: 'soap',
            name: 'Monster Soap',
            icon: '🧼',
            description: 'Cleans your monster thoroughly',
            price: 30,
            effects: { cleanliness: 100, happiness: 5 },
            category: 'items'
        },
        {
            id: 'toy',
            name: 'Squeaky Toy',
            icon: '🎾',
            description: 'Increases happiness significantly',
            price: 100,
            effects: { happiness: 50, energy: -10 },
            category: 'items'
        },
        {
            id: 'medicine',
            name: 'Healing Potion',
            icon: '💊',
            description: 'Cures sickness and restores health',
            price: 150,
            effects: { health: 100, sick: false },
            category: 'items'
        }
    ],
    EGGS: [
        {
            id: 'fire_egg',
            name: 'Fire Egg',
            icon: '🥚',
            description: 'Contains a Fire-type monster',
            price: 500,
            element: ELEMENTS.FIRE,
            category: 'eggs'
        },
        {
            id: 'water_egg',
            name: 'Water Egg',
            icon: '🥚',
            description: 'Contains a Water-type monster',
            price: 500,
            element: ELEMENTS.WATER,
            category: 'eggs'
        },
        {
            id: 'mystery_egg',
            name: 'Mystery Egg',
            icon: '🥚',
            description: 'Contains a random monster!',
            price: 750,
            element: 'random',
            category: 'eggs'
        }
    ],
    UPGRADES: [
        {
            id: 'farm_slot',
            name: 'Farm Expansion',
            icon: '🏡',
            description: 'Adds +1 monster slot to your farm',
            price: 1000,
            effects: { farmSlots: 1 },
            category: 'upgrades'
        },
        {
            id: 'training_boost',
            name: 'Training Accelerator',
            icon: '⚡',
            description: 'Reduces training time by 25%',
            price: 2000,
            effects: { trainingSpeedBonus: 0.25 },
            category: 'upgrades'
        },
        {
            id: 'auto_feeder',
            name: 'Auto Feeder',
            icon: '🤖',
            description: 'Automatically feeds hungry monsters',
            price: 3000,
            effects: { autoFeed: true },
            category: 'upgrades'
        }
    ]
};

const PERSONALITIES = [
    {
        id: 'playful',
        name: 'Playful',
        emoji: '😄',
        effects: {
            happinessGain: 1.5,
            energyLoss: 1.2,
            trainingBonus: 0.1
        }
    },
    {
        id: 'lazy',
        name: 'Lazy',
        emoji: '😴',
        effects: {
            energyLoss: 0.7,
            trainingPenalty: 0.1,
            hungerGain: 1.3
        }
    },
    {
        id: 'stubborn',
        name: 'Stubborn',
        emoji: '😤',
        effects: {
            trainingResistance: 0.2,
            statPotential: 1.2,
            careResistance: 0.1
        }
    },
    {
        id: 'gentle',
        name: 'Gentle',
        emoji: '😊',
        effects: {
            happinessGain: 1.2,
            trainingBonus: 0.05,
            sickResistance: 0.15
        }
    },
    {
        id: 'energetic',
        name: 'Energetic',
        emoji: '⚡',
        effects: {
            speedBonus: 1.15,
            energyLoss: 1.4,
            activityBonus: 0.2
        }
    },
    {
        id: 'calm',
        name: 'Calm',
        emoji: '😌',
        effects: {
            specialBonus: 1.1,
            stressResistance: 0.2,
            meditationBonus: 0.3
        }
    }
];

const CARE_DECAY_RATES = {
    hunger: 1, // points per minute
    happiness: 0.5,
    cleanliness: 0.3,
    energy: 2
};

const CARE_THRESHOLDS = {
    critical: 20,
    low: 40,
    good: 70,
    excellent: 90
};

const EVOLUTION_REQUIREMENTS = {
    level: {
        first: 15,
        second: 30
    },
    care: {
        happiness: 80,
        cleanliness: 70
    },
    stats: {
        minTotal: 300
    }
};

const FARM_LEVELS = [
    { level: 1, requiredPrestige: 0, maxMonsters: 1, unlockedFeatures: ['basic_training'] },
    { level: 2, requiredPrestige: 50, maxMonsters: 2, unlockedFeatures: ['contests'] },
    { level: 3, requiredPrestige: 150, maxMonsters: 3, unlockedFeatures: ['breeding'] },
    { level: 4, requiredPrestige: 300, maxMonsters: 4, unlockedFeatures: ['advanced_training'] },
    { level: 5, requiredPrestige: 500, maxMonsters: 5, unlockedFeatures: ['rare_monsters'] },
    { level: 10, requiredPrestige: 2000, maxMonsters: 10, unlockedFeatures: ['legendary_contests'] }
];

const RARITY_CHANCES = {
    common: 0.7,
    uncommon: 0.25,
    rare: 0.04,
    legendary: 0.01
};

// Make constants globally available
if (typeof window !== 'undefined') {
    window.GAME_CONFIG = GAME_CONFIG;
    window.ELEMENTS = ELEMENTS;
    window.ELEMENT_DATA = ELEMENT_DATA;
    window.MONSTER_SPECIES = MONSTER_SPECIES;
    window.TRAINING_TYPES = TRAINING_TYPES;
    window.CONTEST_TYPES = CONTEST_TYPES;
    window.SHOP_ITEMS = SHOP_ITEMS;
    window.PERSONALITIES = PERSONALITIES;
    window.CARE_DECAY_RATES = CARE_DECAY_RATES;
    window.CARE_THRESHOLDS = CARE_THRESHOLDS;
    window.EVOLUTION_REQUIREMENTS = EVOLUTION_REQUIREMENTS;
    window.FARM_LEVELS = FARM_LEVELS;
    window.RARITY_CHANCES = RARITY_CHANCES;
}
