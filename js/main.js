// Monster Farm Legacy - Main Entry Point

// Global game instance
let game = null;
let ui = null;

// Initialize the game when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeGame();
});

function initializeGame() {
    try {
        // Load constants and make them globally available
        if (typeof GAME_CONFIG !== 'undefined') {
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
        
        // Initialize the game
        game = new Game();
        
        // Make game instance globally available for debugging
        window.game = game;
        
        // Set up global UI reference for onclick handlers
        setTimeout(() => {
            ui = game.ui;
            window.ui = ui;
        }, 100);
        
        // Set up event listeners
        setupEventListeners();
        
        console.log('Monster Farm Legacy initialized successfully!');
        
    } catch (error) {
        console.error('Failed to initialize game:', error);
        showErrorMessage('Failed to initialize game. Please refresh the page.');
    }
}

function setupEventListeners() {
    // Handle page visibility changes for offline progress
    document.addEventListener('visibilitychange', function() {
        if (game && typeof game.onVisibilityChange === 'function') {
            game.onVisibilityChange();
        }
    });
    
    // Handle page unload to save game
    window.addEventListener('beforeunload', function() {
        if (game && typeof game.onBeforeUnload === 'function') {
            game.onBeforeUnload();
        }
    });
    
    // Handle orientation changes on mobile
    window.addEventListener('orientationchange', function() {
        setTimeout(() => {
            if (ui && ui.currentScreen === 'game-screen') {
                ui.refreshView(ui.currentView);
            }
        }, 100);
    });
    
    // Handle keyboard shortcuts for debugging (only in development)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        document.addEventListener('keydown', handleDebugKeys);
    }
}

function handleDebugKeys(event) {
    // Only handle shortcuts when not typing in input fields
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
    }
    
    // Check if Ctrl/Cmd is held
    const isModifierPressed = event.ctrlKey || event.metaKey;
    
    if (!isModifierPressed) return;
    
    switch (event.code) {
        case 'KeyG': // Ctrl+G: Add gold
            event.preventDefault();
            if (game) {
                game.addGold(1000);
                console.log('Added 1000 gold');
            }
            break;
            
        case 'KeyP': // Ctrl+P: Add prestige
            event.preventDefault();
            if (game) {
                game.addPrestige(100);
                console.log('Added 100 prestige');
            }
            break;
            
        case 'KeyM': // Ctrl+M: Spawn monster
            event.preventDefault();
            if (game) {
                game.spawnMonster('flamepup');
                console.log('Spawned monster');
            }
            break;
            
        case 'KeyT': // Ctrl+T: Complete all training
            event.preventDefault();
            if (game) {
                game.completeAllTraining();
                console.log('Completed all training');
            }
            break;
            
        case 'KeyS': // Ctrl+S: Save game
            event.preventDefault();
            if (game) {
                game.saveGame();
                console.log('Game saved');
            }
            break;
    }
}

function showErrorMessage(message) {
    // Create a simple error message display
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #e74c3c;
        color: white;
        padding: 2rem;
        border-radius: 10px;
        text-align: center;
        z-index: 10000;
        font-family: Arial, sans-serif;
        max-width: 400px;
    `;
    
    errorDiv.innerHTML = `
        <h3>Error</h3>
        <p>${message}</p>
        <button onclick="this.parentElement.remove()" style="
            margin-top: 1rem;
            padding: 0.5rem 1rem;
            background: white;
            color: #e74c3c;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        ">Close</button>
    `;
    
    document.body.appendChild(errorDiv);
}

// Global utility functions for UI callbacks
window.feedMonster = function(monsterId, foodType = 'berries') {
    if (!game || !game.farm) return;
    
    const monster = game.farm.getMonster(monsterId);
    if (!monster) return;
    
    const shopItems = window.SHOP_ITEMS || {};
    const food = shopItems.FOOD?.find(item => item.id === foodType);
    
    if (!food) return;
    
    const result = game.farm.spendGold(food.price);
    if (result.success) {
        monster.feed(food);
        ui?.showNotification(`Fed ${monster.name}!`, 'success');
        ui?.updateTopBar();
        ui?.refreshView(ui?.currentView);
    } else {
        ui?.showNotification('Not enough gold!', 'error');
    }
};

window.cleanMonster = function(monsterId) {
    if (!game || !game.farm) return;
    
    const monster = game.farm.getMonster(monsterId);
    if (!monster) return;
    
    const soap = { effects: { cleanliness: 100, happiness: 5 } };
    const cost = 30;
    
    const result = game.farm.spendGold(cost);
    if (result.success) {
        monster.clean(soap);
        ui?.showNotification(`${monster.name} is now clean!`, 'success');
        ui?.updateTopBar();
        ui?.refreshView(ui?.currentView);
    } else {
        ui?.showNotification('Not enough gold!', 'error');
    }
};

window.playWithMonster = function(monsterId) {
    if (!game || !game.farm) return;
    
    const monster = game.farm.getMonster(monsterId);
    if (!monster) return;
    
    if (monster.play()) {
        ui?.showNotification(`${monster.name} enjoyed playing!`, 'success');
        ui?.refreshView(ui?.currentView);
    } else {
        ui?.showNotification(`${monster.name} is too tired to play.`, 'warning');
    }
};

// Console commands for debugging
window.debugCommands = {
    addGold: (amount = 1000) => {
        if (game?.farm) {
            game.farm.addGold(amount);
            ui?.updateTopBar();
            ui?.updateFarmView();
            console.log(`Added ${amount} gold. Total: ${game.farm.gold}`);
        }
    },
    addPrestige: (amount = 100) => game?.addPrestige(amount),
    spawnMonster: (species = 'flamepup') => game?.spawnMonster(species),
    giveStarter: () => game?.giveStarterMonster(),
    completeTraining: () => game?.completeAllTraining(),
    saveGame: () => game?.saveGame(),
    getStats: () => game?.getGameStats(),
    listMonsters: () => game?.farm?.monsters?.map(m => ({ name: m.name, level: m.level, element: m.element })),
    testExpansion: () => {
        if (!game?.farm || !ui) {
            console.log('Game not ready');
            return;
        }
        
        console.log('Testing farm expansion...');
        const expansionInfo = game.farm.canExpandFarm();
        console.log('Expansion info:', expansionInfo);
        
        if (!expansionInfo.canExpand) {
            console.log('Adding gold for expansion...');
            game.farm.gold = expansionInfo.cost + 100;
            ui.updateTopBar();
            ui.updateFarmView();
            console.log(`Gold set to ${game.farm.gold}`);
        }
        
        // Try to expand
        console.log('Attempting to expand farm...');
        ui.expandFarm();
    },
    showFarmInfo: () => {
        if (!game?.farm) {
            console.log('Farm not available');
            return;
        }
        
        console.log('Farm Information:', {
            gold: game.farm.gold,
            maxMonsters: game.farm.maxMonsters,
            currentMonsters: game.farm.monsters.length,
            expansionCost: game.farm.getExpansionCost(),
            canExpand: game.farm.canExpandFarm()
        });
    },
    checkTraining: () => {
        if (!game?.trainingManager) {
            console.log('Training manager not available');
            return;
        }
        
        console.log('Training Types:', window.TRAINING_TYPES);
        console.log('Active training sessions:', game.trainingManager.activeTrainingSessions);
        
        if (game.farm.monsters.length > 0) {
            const monster = game.farm.monsters[0];
            console.log('First monster status:', {
                name: monster.name,
                isTraining: monster.isTraining,
                trainingEnd: monster.trainingEnd,
                currentTime: Date.now(),
                timeRemaining: monster.trainingEnd ? monster.trainingEnd - Date.now() : 'N/A'
            });
            console.log('Available training for first monster:', 
                game.trainingManager.getAvailableTraining(monster)
            );
        } else {
            console.log('No monsters available for training');
        }
    },
    help: () => {
        console.log('Available debug commands:');
        console.log('- debugCommands.addGold(amount)');
        console.log('- debugCommands.addPrestige(amount)');
        console.log('- debugCommands.spawnMonster(species)');
        console.log('- debugCommands.giveStarter() - Force give a starter monster');
        console.log('- debugCommands.completeTraining()');
        console.log('- debugCommands.saveGame()');
        console.log('- debugCommands.getStats()');
        console.log('- debugCommands.listMonsters()');
        console.log('- debugCommands.testExpansion() - Test farm expansion');
        console.log('- debugCommands.showFarmInfo() - Show current farm state');
    }
};

// Error handling
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    
    // Only show error to user if it's a critical game error
    if (event.error && event.error.message && event.error.message.includes('game')) {
        showErrorMessage('A game error occurred. Your progress has been saved.');
    }
});

// Performance monitoring (in development)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    let lastFrameTime = performance.now();
    let frameCount = 0;
    
    function monitorPerformance() {
        const now = performance.now();
        frameCount++;
        
        if (now - lastFrameTime >= 1000) { // Every second
            const fps = Math.round(frameCount * 1000 / (now - lastFrameTime));
            
            if (fps < 30) {
                console.warn('Low FPS detected:', fps);
            }
            
            frameCount = 0;
            lastFrameTime = now;
        }
        
        requestAnimationFrame(monitorPerformance);
    }
    
    requestAnimationFrame(monitorPerformance);
}

console.log('Monster Farm Legacy - Ready to play!');
console.log('Type debugCommands.help() for debug commands');
