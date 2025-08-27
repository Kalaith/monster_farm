# Monster Farm - Standards Deviation Report

## ⚠️ Compliance Status: **CRITICAL NON-COMPLIANCE (0%)**

This project requires a **complete architectural rewrite** to meet the mandatory WebHatchery design standards.

## 🚨 Critical Issues (Immediate Action Required)

### 1. Wrong Technology Stack
- **Current**: Vanilla JavaScript with modular file structure
- **Required**: React 18+ with TypeScript
- **Impact**: Complete incompatibility with modern standards

### 2. Missing React/TypeScript Implementation
- **Current**: `/js/` directory with vanilla JavaScript modules
- **Required**: `/frontend/src/` with React components
- **Impact**: No component-based architecture, no type safety

### 3. Empty Frontend Directory
- **Current**: Placeholder empty `/frontend/` directory exists but unused
- **Required**: Fully implemented React/TypeScript project
- **Impact**: Project appears partially migrated but is not functional

### 4. Legacy File Organization
- **Current**: CSS and JS files at root level with custom HTML
- **Required**: Vite-based build system with proper asset management
- **Impact**: No modern build pipeline, difficult maintenance

## 🔧 Required Changes

### Phase 1: Complete Technology Migration

**Current structure (TO BE REMOVED):**
```
monster_farm/
├── index.html
├── test.html
├── css/
│   ├── styles.css
│   └── ui.css
├── js/
│   ├── main.js
│   ├── game.js
│   ├── monster.js
│   ├── farm.js
│   ├── training.js
│   ├── contests.js
│   ├── ui.js
│   ├── storage.js
│   └── constants.js
├── assets/
│   ├── monsters/
│   └── sounds/
├── frontend/ (empty)
└── publish.ps1
```

**Required structure (TO BE CREATED):**
```
monster_farm/
├── README.md
├── publish.ps1 (updated to standard template)
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── eslint.config.js
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   └── ProgressBar.tsx
│   │   │   ├── game/
│   │   │   │   ├── MonsterCard.tsx
│   │   │   │   ├── FarmGrid.tsx
│   │   │   │   ├── TrainingCenter.tsx
│   │   │   │   ├── ContestArena.tsx
│   │   │   │   └── BreedingLab.tsx
│   │   │   └── layout/
│   │   │       ├── Header.tsx
│   │   │       ├── Sidebar.tsx
│   │   │       └── GameBoard.tsx
│   │   ├── stores/
│   │   │   ├── gameStore.ts
│   │   │   ├── monsterStore.ts
│   │   │   └── uiStore.ts
│   │   ├── types/
│   │   │   ├── monster.ts
│   │   │   ├── farm.ts
│   │   │   ├── training.ts
│   │   │   └── contest.ts
│   │   ├── hooks/
│   │   │   ├── useGameLoop.ts
│   │   │   ├── useMonsterActions.ts
│   │   │   └── useTraining.ts
│   │   ├── data/
│   │   │   ├── monsterTemplates.ts
│   │   │   ├── trainingPrograms.ts
│   │   │   └── contestTypes.ts
│   │   ├── utils/
│   │   │   ├── monsterGenetics.ts
│   │   │   ├── calculations.ts
│   │   │   └── gameLogic.ts
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   └── sounds/
│   │   └── styles/
│   │       └── globals.css
│   └── dist/
└── backend/ (recommended for complex breeding algorithms)
```

### Phase 2: Convert JavaScript Modules to React Components

**Current vanilla JS approach:**
```javascript
// ❌ WRONG: js/monster.js - Procedural approach
class Monster {
    constructor(species, stats) {
        this.species = species;
        this.stats = stats;
        this.happiness = 50;
        this.energy = 100;
    }
    
    feed() {
        this.happiness += 10;
        this.energy += 20;
    }
    
    train(skill) {
        if (this.energy >= 20) {
            this.stats[skill] += 5;
            this.energy -= 20;
        }
    }
}

// ❌ WRONG: js/ui.js - Direct DOM manipulation  
function updateMonsterDisplay(monster) {
    document.getElementById('monster-name').textContent = monster.name;
    document.getElementById('happiness').style.width = monster.happiness + '%';
}
```

**Required React/TypeScript approach:**
```typescript
// ✅ CORRECT: Proper type definitions
export interface Monster {
  id: string;
  name: string;
  species: MonsterSpecies;
  stats: MonsterStats;
  happiness: number;
  energy: number;
  age: number;
  generation: number;
  genetics: GeneticTraits;
  birthDate: Date;
  parents?: [Monster['id'], Monster['id']];
}

export interface MonsterStats {
  strength: number;
  speed: number;
  intelligence: number;
  charm: number;
  endurance: number;
}

export interface GeneticTraits {
  dominant: TraitSet;
  recessive: TraitSet;
}

// ✅ CORRECT: React functional component
export const MonsterCard: React.FC<{
  monster: Monster;
  onFeed: (monsterId: string) => void;
  onTrain: (monsterId: string, skill: keyof MonsterStats) => void;
  onSelect: (monsterId: string) => void;
}> = ({ monster, onFeed, onTrain, onSelect }) => {
  const canTrain = monster.energy >= 20;
  const happinessColor = monster.happiness > 70 ? 'bg-green-500' : 
                        monster.happiness > 40 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:border-blue-300 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{monster.name}</h3>
          <p className="text-sm text-gray-600">{monster.species.name}</p>
          <p className="text-xs text-gray-500">Generation {monster.generation}</p>
        </div>
        <div className="text-right text-sm">
          <div>Age: {monster.age} days</div>
          <div>Energy: {monster.energy}/100</div>
        </div>
      </div>

      {/* Stats Display */}
      <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
        {Object.entries(monster.stats).map(([stat, value]) => (
          <div key={stat} className="flex justify-between">
            <span className="capitalize text-gray-600">{stat}:</span>
            <span className="font-semibold">{value}</span>
          </div>
        ))}
      </div>

      {/* Happiness Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Happiness</span>
          <span>{monster.happiness}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${happinessColor}`}
            style={{ width: `${monster.happiness}%` }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => onFeed(monster.id)}
          className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 px-3 rounded text-sm transition-colors"
        >
          Feed
        </button>
        <button
          onClick={() => onSelect(monster.id)}
          disabled={!canTrain}
          className={`flex-1 py-2 px-3 rounded text-sm transition-colors ${
            canTrain 
              ? 'bg-blue-600 hover:bg-blue-500 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Train
        </button>
      </div>
    </div>
  );
};
```

### Phase 3: Zustand State Management

**Required stores implementation:**
```typescript
// Monster Store
interface MonsterState {
  monsters: Monster[];
  selectedMonsterId: string | null;
  breedingPairs: BreedingPair[];
}

interface MonsterActions {
  addMonster: (monster: Omit<Monster, 'id'>) => void;
  feedMonster: (monsterId: string) => void;
  trainMonster: (monsterId: string, skill: keyof MonsterStats) => void;
  breedMonsters: (parent1Id: string, parent2Id: string) => Promise<Monster>;
  retireMonster: (monsterId: string) => void;
}

export const useMonsterStore = create<MonsterState & MonsterActions>()(
  persist(
    (set, get) => ({
      monsters: [],
      selectedMonsterId: null,
      breedingPairs: [],
      
      addMonster: (monsterData) => set(state => ({
        monsters: [...state.monsters, { ...monsterData, id: generateId() }]
      })),
      
      feedMonster: (monsterId) => set(state => ({
        monsters: state.monsters.map(monster =>
          monster.id === monsterId
            ? { ...monster, happiness: Math.min(100, monster.happiness + 10) }
            : monster
        )
      })),
      
      trainMonster: (monsterId, skill) => set(state => ({
        monsters: state.monsters.map(monster =>
          monster.id === monsterId && monster.energy >= 20
            ? {
                ...monster,
                stats: { ...monster.stats, [skill]: monster.stats[skill] + 5 },
                energy: monster.energy - 20
              }
            : monster
        )
      })),
      
      breedMonsters: async (parent1Id, parent2Id) => {
        const { monsters } = get();
        const parent1 = monsters.find(m => m.id === parent1Id);
        const parent2 = monsters.find(m => m.id === parent2Id);
        
        if (!parent1 || !parent2) throw new Error('Parents not found');
        
        const offspring = await generateOffspring(parent1, parent2);
        get().addMonster(offspring);
        return offspring;
      }
    }),
    { name: 'monster-farm-storage' }
  )
);

// Farm/Game Store
interface GameState {
  farmLevel: number;
  money: number;
  farmSize: number;
  unlockedFeatures: string[];
  currentSeason: Season;
  dayCount: number;
}

interface GameActions {
  earnMoney: (amount: number) => void;
  spendMoney: (amount: number) => boolean;
  advanceDay: () => void;
  upgradeFarm: () => void;
  unlockFeature: (feature: string) => void;
}
```

### Phase 4: Game-Specific Features

**Breeding System:**
```typescript
export const generateOffspring = async (
  parent1: Monster, 
  parent2: Monster
): Promise<Omit<Monster, 'id'>> => {
  // Genetic algorithm for trait inheritance
  const dominantTraits = combineDominantTraits(parent1.genetics, parent2.genetics);
  const recessiveTraits = combineRecessiveTraits(parent1.genetics, parent2.genetics);
  
  const baseStats = calculateInheritedStats(parent1.stats, parent2.stats);
  const mutations = applyRandomMutations(baseStats);
  
  return {
    name: generateName(parent1.species),
    species: determineSpecies(parent1.species, parent2.species),
    stats: mutations,
    happiness: 75,
    energy: 100,
    age: 0,
    generation: Math.max(parent1.generation, parent2.generation) + 1,
    genetics: { dominant: dominantTraits, recessive: recessiveTraits },
    birthDate: new Date(),
    parents: [parent1.id, parent2.id]
  };
};
```

**Training System:**
```typescript
export const TrainingCenter: React.FC = () => {
  const { monsters, selectedMonsterId, trainMonster } = useMonsterStore();
  const selectedMonster = monsters.find(m => m.id === selectedMonsterId);
  
  const trainingPrograms: TrainingProgram[] = [
    { name: 'Strength Training', skill: 'strength', energyCost: 20, duration: 60 },
    { name: 'Speed Training', skill: 'speed', energyCost: 25, duration: 45 },
    { name: 'Intelligence Boost', skill: 'intelligence', energyCost: 30, duration: 90 },
    { name: 'Charm School', skill: 'charm', energyCost: 15, duration: 30 },
    { name: 'Endurance Run', skill: 'endurance', energyCost: 35, duration: 120 }
  ];

  if (!selectedMonster) {
    return <div className="p-4">Select a monster to begin training</div>;
  }

  return (
    <div className="training-center p-6">
      <h2 className="text-2xl font-bold mb-6">Training Center</h2>
      
      <div className="selected-monster mb-6">
        <h3 className="text-lg font-semibold mb-2">Training: {selectedMonster.name}</h3>
        <div className="grid grid-cols-5 gap-4 text-sm">
          {Object.entries(selectedMonster.stats).map(([stat, value]) => (
            <div key={stat} className="text-center">
              <div className="text-gray-600 capitalize">{stat}</div>
              <div className="font-bold text-lg">{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="training-programs grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trainingPrograms.map(program => (
          <div key={program.name} className="bg-gray-50 rounded-lg p-4 border">
            <h4 className="font-semibold mb-2">{program.name}</h4>
            <div className="text-sm text-gray-600 mb-3">
              <div>Improves: {program.skill}</div>
              <div>Energy Cost: {program.energyCost}</div>
              <div>Duration: {program.duration}s</div>
            </div>
            <button
              onClick={() => trainMonster(selectedMonster.id, program.skill)}
              disabled={selectedMonster.energy < program.energyCost}
              className={`w-full py-2 rounded transition-colors ${
                selectedMonster.energy >= program.energyCost
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Start Training
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## 📋 Migration Checklist

### Immediate Actions (Week 1)
- [ ] Create React/TypeScript project in `/frontend/`
- [ ] Install required dependencies (React 19+, TypeScript 5+, Zustand, Tailwind)
- [ ] Set up Vite, ESLint, and Tailwind configurations
- [ ] Create basic component structure

### Core Migration (Week 2-4)
- [ ] Convert all vanilla JS modules to TypeScript types and utilities
- [ ] Implement Zustand stores for monster and game state
- [ ] Create React components for all game features
- [ ] Implement monster breeding genetics system
- [ ] Build training and contest systems
- [ ] Add farm management features

### Advanced Features (Week 5-6)
- [ ] Implement complex breeding algorithms
- [ ] Add contest and tournament systems
- [ ] Create progression and achievement systems
- [ ] Add seasonal events and special monsters

### Testing and Polish (Week 7)
- [ ] Remove all legacy JavaScript files
- [ ] Verify TypeScript strict compliance
- [ ] Test all game systems thoroughly
- [ ] Optimize performance and add animations

## 🚫 Files to Remove
- All files in `/js/` directory
- All files in `/css/` directory  
- `index.html` and `test.html`
- Empty `/frontend/` directory (rebuild properly)

## ⚡ Quick Start Commands
```bash
cd monster_farm
rm -rf frontend  # Remove empty directory
mkdir frontend
cd frontend
npm create vite@latest . -- --template react-ts
npm install zustand tailwindcss @tailwindcss/vite
# Follow standard configuration setup from MASTER_DESIGN_STANDARDS.md
```

## 🎯 Success Criteria
- [ ] Complete monster breeding system with genetics
- [ ] Full training and development mechanics
- [ ] Contest and competition systems
- [ ] Farm management and progression
- [ ] 100% TypeScript coverage with strict mode
- [ ] Zero ESLint errors
- [ ] Responsive design with Tailwind CSS

**Estimated Migration Time**: 6-7 weeks full-time development
**Priority Level**: URGENT - Complete rewrite required

**Special Note**: This is one of the more complex games requiring sophisticated breeding algorithms and genetic systems. Consider implementing a PHP backend for complex calculations if performance becomes an issue.