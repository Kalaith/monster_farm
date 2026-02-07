# 🐉 Monster Farm Legacy

A browser-based monster raising simulation game inspired by Pokémon, Digimon, and Tamagotchi. Raise, train, and compete with your monsters in a charming farming environment!

## 🎮 Game Features

### Core Gameplay
- **Monster Raising**: Care for your monsters with Tamagotchi-style mechanics (feeding, cleaning, playing)
- **Freeform Training**: Customize your monsters' abilities without rigid limitations
- **Farm Management**: Expand your farm, upgrade facilities, and manage resources
- **Contest System**: Compete in battles, agility trials, and beauty pageants
- **Progression**: Level up your farm, unlock new features, and discover monster evolution paths

### Monster System
- **7 Elements**: Fire, Water, Earth, Air, Electric, Dark, Light
- **Unique Personalities**: Each monster has traits that affect behavior and training
- **Dynamic Stats**: HP, Attack, Defense, Speed, and Special abilities
- **Care Mechanics**: Hunger, Happiness, Cleanliness, and Energy meters
- **Evolution Paths**: Multiple evolution routes based on care and training

### Farm Features
- **Expandable Capacity**: Start with 1 slot, expand up to 50+ monsters
- **Facility Upgrades**: Breeding Lab, Training Dojo, Contest Hall
- **Resource Management**: Gold and Prestige currencies
- **Shop System**: Buy food, items, eggs, and permanent upgrades

## 🚀 Getting Started

### Option 1: Simple Setup
1. Download or clone the project files
2. Open `index.html` in any modern web browser
3. Start your monster farming journey!

### Option 2: Local Server (Recommended)
For the best experience, serve the files through a local web server:

**Using Python:**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**Using Node.js:**
```bash
npx http-server
```

**Using PHP:**
```bash
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## 🎯 How to Play

### Starting Out
1. Click "New Farm" to begin your adventure
2. You'll receive a starter monster (Blobling, Flamepup, or Rocksprout)
3. Begin caring for your monster and training them

### Monster Care
- **Feed**: Purchase food items to restore hunger and happiness
- **Clean**: Use soap to keep your monster clean and healthy
- **Play**: Interact with your monster to boost happiness (costs energy)
- **Monitor**: Keep an eye on the four care meters to prevent sickness

### Training System
1. Go to the Training tab
2. Select a monster to train
3. Choose from available training options:
   - **Strength Training**: Increases Attack and HP
   - **Defense Drill**: Boosts Defense and HP  
   - **Agility Course**: Enhances Speed and Special (unlocked later)
   - **Meditation**: Focuses Special abilities (unlocked later)
   - **Resistance Training**: Reduces elemental weaknesses (advanced)

### Contests
1. Visit the Contests tab when unlocked (Farm Level 2)
2. Choose from available contests:
   - **Beauty Pageant**: Judges care and grooming
   - **Agility Trial**: Tests speed and reflexes
   - **Battle Contest**: Pure combat competition
3. Select a monster and pay the entry fee
4. Win rewards based on performance!

### Farm Expansion
- Earn Prestige points from contests to level up your farm
- Spend Gold to expand monster capacity
- Upgrade facilities for better training options
- Unlock new features as you progress

## 🎮 Controls & Tips

### Keyboard Shortcuts (Development Mode)
- `Ctrl+G`: Add 1000 gold
- `Ctrl+P`: Add 100 prestige  
- `Ctrl+M`: Spawn a monster
- `Ctrl+T`: Complete all training
- `Ctrl+S`: Save game

### Debug Console Commands
Open browser console and type:
- `debugCommands.help()` - Show all available commands
- `debugCommands.addGold(amount)` - Add gold
- `debugCommands.spawnMonster('species')` - Add specific monster
- `debugCommands.getStats()` - View game statistics

### Pro Tips
- Higher care stats improve contest performance
- Different personalities affect training efficiency
- Some training types can mitigate elemental weaknesses
- Contest rewards scale with difficulty level
- Auto-save happens every 30 seconds

## 🏗️ Project Structure

```
MonsterFarmLegacy/
├── index.html          # Main game page
├── css/
│   ├── styles.css      # Core game styles
│   └── ui.css          # UI component styles
├── js/
│   ├── constants.js    # Game data and configuration
│   ├── monster.js      # Monster class and factory
│   ├── farm.js         # Farm management system
│   ├── training.js     # Training and customization
│   ├── contests.js     # Contest and battle system
│   ├── ui.js           # User interface management
│   ├── game.js         # Main game controller
│   ├── storage.js      # Save/load functionality
│   └── main.js         # Entry point and utilities
├── assets/
│   ├── monsters/       # Monster images (placeholder)
│   └── sounds/         # Audio files (placeholder)
└── README.md          # This file
```

## 🎨 Customization

### Adding New Monsters
Edit `js/constants.js` and add to `MONSTER_SPECIES` array:
```javascript
{
    id: 'new_monster',
    name: 'New Monster',
    element: ELEMENTS.FIRE,
    emoji: '🔥',
    rarity: 'common',
    baseStats: { hp: 50, attack: 45, defense: 40, speed: 35, special: 50 },
    evolvesTo: ['evolved_form']
}
```

### Adding New Training Types
Add to `TRAINING_TYPES` in `js/constants.js`:
```javascript
NEW_TRAINING: {
    id: 'new_training',
    name: 'New Training',
    icon: '💪',
    description: 'Description here',
    cost: 100,
    duration: 60000, // 60 seconds
    effects: { attack: 3, defense: 1 },
    unlocked: false
}
```

### Styling
- Modify `css/styles.css` for core game appearance
- Edit `css/ui.css` for interface components
- CSS custom properties (variables) make theming easy

## 🔧 Technical Details

- **No Dependencies**: Pure HTML5, CSS3, and JavaScript
- **Local Storage**: Game progress saved automatically
- **Responsive Design**: Works on desktop and mobile
- **Modern Browser Support**: ES6+ features used
- **Modular Architecture**: Clean separation of game systems

## 🐛 Known Issues & Limitations

- Monster images are emoji placeholders
- No sound effects or music yet
- Evolution system shows readiness but doesn't execute
- Contest battles could use more visual feedback
- Mobile touch controls could be improved

## 🚧 Future Enhancements

- [ ] Monster evolution implementation
- [ ] Breeding system for hybrid monsters  
- [ ] Sound effects and background music
- [ ] Monster sprite graphics
- [ ] Multiplayer contests
- [ ] Achievement system
- [ ] More monster species and elements
- [ ] Seasonal events

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Credits

Inspired by classic monster-raising games:
- **Pokémon** - Elemental system and battles
- **Digimon** - Digital evolution concepts  
- **Tamagotchi** - Care and nurturing mechanics

Built with love for the monster-raising genre! 🐾

---

**Happy Monster Farming!** 🌟

## License

This project is licensed under the MIT License - see the individual component README files for details.

Part of the WebHatchery game collection.
