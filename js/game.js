// Monster Farm Legacy - Main Game Controller

class Game {
    constructor() {
        this.farm = null;
        this.trainingManager = null;
        this.contestManager = null;
        this.ui = null;
        this.storage = null;
        
        this.gameLoop = null;
        this.lastUpdate = Date.now();
        this.isRunning = false;
        
        this.initialize();
    }
    
    initialize() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        // Initialize storage
        this.storage = new GameStorage();
        
        // Set up UI
        this.ui = new UIManager(this);
        
        // Start loading sequence
        this.showLoadingScreen();
        
        // Simulate loading time and then show menu
        setTimeout(() => {
            this.ui.showScreen('main-menu');
        }, 2000);
    }
    
    showLoadingScreen() {
        // Already shown by default, just ensure it's visible
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('active');
        }
    }
    
    clearSavedData() {
        // Clear all saved game data from local storage
        try {
            this.storage.deleteGame();
            console.log('Saved game data cleared');
            return true;
        } catch (error) {
            console.error('Failed to clear saved data:', error);
            return false;
        }
    }
    
    startNewGame() {
        try {
            // Clear any existing save data first
            this.clearSavedData();
            
            // Initialize new game state
            this.farm = new Farm();
            this.trainingManager = new TrainingManager(this.farm);
            this.contestManager = new ContestManager(this.farm);
            
            console.log('Farm initialized:', this.farm);
            
            // Give player a starter monster
            const starterMonster = MonsterFactory.createStarterMonster();
            console.log('Starter monster created:', starterMonster);
            
            if (starterMonster) {
                const result = this.farm.addMonster(starterMonster);
                console.log('Monster added to farm:', result);
                
                if (result.success) {
                    this.ui.showNotification(`Welcome ${starterMonster.name} to your farm!`, 'success');
                } else {
                    console.error('Failed to add monster to farm:', result.error);
                    // Fallback: create a basic monster manually
                    this.createFallbackMonster();
                }
            } else {
                console.error('Failed to create starter monster');
                this.createFallbackMonster();
            }
            
            // Start the game loop
            this.startGameLoop();
            
            // Save initial state
            this.saveGame();
            
            // Force UI refresh
            if (this.ui) {
                this.ui.updateFarmView();
                this.ui.updateMonstersView();
                this.ui.updateTopBar();
            }
            
            return true;
        } catch (error) {
            console.error('Error starting new game:', error);
            this.createFallbackMonster();
            return false;
        }
    }
    
    loadGame() {
        try {
            const savedData = this.storage.loadGame();
            
            if (!savedData) {
                return false;
            }
            
            // Restore farm
            this.farm = Farm.fromJSON(savedData.farm);
            
            // Restore managers
            this.trainingManager = new TrainingManager(this.farm);
            this.contestManager = new ContestManager(this.farm);
            
            // Restore contest history if available
            if (savedData.contestHistory) {
                this.contestManager.contestHistory = savedData.contestHistory;
            }
            
            // Update for time passed while away
            this.updateOfflineProgress(savedData.lastSaved);
            
            // Start the game loop
            this.startGameLoop();
            
            return true;
        } catch (error) {
            console.error('Failed to load game:', error);
            return false;
        }
    }
    
    updateOfflineProgress(lastSaved) {
        const timePassed = Date.now() - lastSaved;
        const maxOfflineTime = 24 * 60 * 60 * 1000; // Max 24 hours offline progression
        const actualTime = Math.min(timePassed, maxOfflineTime);
        
        if (actualTime > 0) {
            // Update farm and monsters for offline time
            this.farm.updateFarm(actualTime);
            
            // Show offline progress summary
            const offlineMinutes = Math.floor(actualTime / (1000 * 60));
            
            if (offlineMinutes > 5) {
                setTimeout(() => {
                    this.ui.showNotification(
                        `Welcome back! You were away for ${this.formatOfflineTime(actualTime)}`,
                        'info'
                    );
                }, 1000);
            }
        }
    }
    
    formatOfflineTime(ms) {
        const minutes = Math.floor(ms / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days} day${days > 1 ? 's' : ''} and ${hours % 24} hour${hours % 24 !== 1 ? 's' : ''}`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} and ${minutes % 60} minute${minutes % 60 !== 1 ? 's' : ''}`;
        return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    
    startGameLoop() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastUpdate = Date.now();
        
        const loop = () => {
            if (!this.isRunning) return;
            
            this.update();
            this.gameLoop = requestAnimationFrame(loop);
        };
        
        loop();
    }
    
    stopGameLoop() {
        this.isRunning = false;
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }
    }
    
    update() {
        const now = Date.now();
        const deltaTime = now - this.lastUpdate;
        
        // Update game systems
        if (this.farm) {
            // Update farm and monsters
            this.farm.updateFarm(deltaTime);
            
            // Check for training completions
            if (this.trainingManager) {
                const completedSessions = this.trainingManager.checkTrainingComplete();
                for (const session of completedSessions) {
                    console.log(`Training completed: ${session.monster.name} finished ${session.trainingType.name}`);
                    if (this.ui) {
                        this.ui.showNotification(
                            `${session.monster.name} completed ${session.trainingType.name} training!`, 
                            'success'
                        );
                    }
                }
            }
            
            // Refresh contests periodically
            if (this.contestManager) {
                this.contestManager.refreshContests();
            }
        }
        
        // Update UI
        if (this.ui) {
            this.ui.update();
        }
        
        // Auto-save periodically (every 30 seconds)
        if (deltaTime > 30000) {
            this.saveGame();
            this.lastUpdate = now;
        }
    }
    
    saveGame() {
        if (!this.farm) return;
        
        try {
            const gameData = {
                farm: this.farm.toJSON(),
                contestHistory: this.contestManager?.contestHistory || [],
                gameVersion: '1.0.0',
                lastSaved: Date.now()
            };
            
            this.storage.saveGame(gameData);
        } catch (error) {
            console.error('Failed to save game:', error);
        }
    }
    
    // Game state queries
    getGameStats() {
        if (!this.farm) return null;
        
        const farmStats = this.farm.getFarmStats();
        const contestStats = this.contestManager?.getContestStats() || {};
        
        return {
            ...farmStats,
            contests: contestStats,
            playtime: Date.now() - (this.farm.monsters[0]?.bornAt || Date.now())
        };
    }
    
    // Cheat/Debug methods (for development)
    addGold(amount) {
        if (this.farm) {
            this.farm.addGold(amount);
            this.ui?.updateTopBar();
            return true;
        }
        return false;
    }
    
    addPrestige(amount) {
        if (this.farm) {
            const result = this.farm.addPrestige(amount);
            this.ui?.updateTopBar();
            
            if (result.leveledUp) {
                this.ui?.showNotification(
                    `Farm leveled up! Now level ${result.newLevel}`,
                    'success'
                );
            }
            
            return result;
        }
        return false;
    }
    
    spawnMonster(speciesId) {
        if (!this.farm) return false;
        
        const monster = MonsterFactory.createFromSpecies(speciesId);
        if (monster) {
            const result = this.farm.addMonster(monster);
            if (result.success) {
                this.ui?.showNotification(`${monster.name} joined your farm!`, 'success');
                this.ui?.updateFarmView();
                return true;
            }
        }
        return false;
    }
    
    completeAllTraining() {
        if (!this.trainingManager) return false;
        
        const monsters = this.farm.monsters.filter(m => m.isTraining);
        let completed = 0;
        
        for (const monster of monsters) {
            monster.trainingEnd = Date.now() - 1000; // Force completion
            if (monster.checkTrainingComplete()) {
                completed++;
            }
        }
        
        if (completed > 0) {
            this.ui?.showNotification(`Completed training for ${completed} monsters!`, 'success');
            this.ui?.refreshView(this.ui?.currentView);
        }
        
        return completed > 0;
    }
    
    // Event handling
    onVisibilityChange() {
        if (document.hidden) {
            // Game going to background - save state
            this.saveGame();
        } else {
            // Game returning to foreground - check for offline progress
            if (this.farm) {
                const lastSaved = this.farm.lastSaved || Date.now();
                this.updateOfflineProgress(lastSaved);
            }
        }
    }
    
    onBeforeUnload() {
        // Save game before page unload
        this.saveGame();
    }
    
    // Fallback monster creation in case factory fails
    createFallbackMonster() {
        try {
            // Create a basic water monster manually as fallback
            const fallbackSpecies = {
                id: 'blobling',
                name: 'Blobling',
                element: 'water',
                emoji: '🫧',
                rarity: 'common',
                baseStats: { hp: 50, attack: 35, defense: 40, speed: 45, special: 50 },
                evolvesTo: ['aquaserpent']
            };
            
            const fallbackMonster = new Monster(fallbackSpecies, {
                name: 'Starter'
            });
            
            const result = this.farm.addMonster(fallbackMonster);
            if (result.success) {
                this.ui.showNotification(`Welcome ${fallbackMonster.name} to your farm!`, 'success');
                console.log('Fallback monster created successfully');
            } else {
                console.error('Even fallback monster failed:', result.error);
            }
        } catch (error) {
            console.error('Fallback monster creation failed:', error);
        }
    }
    
    // Quick method to give player a monster from shop
    giveStarterMonster() {
        if (!this.farm) {
            console.log('No farm exists. Start a new game first.');
            return;
        }
        
        // Force create a starter monster
        this.createFallbackMonster();
        
        // Refresh UI
        if (this.ui) {
            this.ui.updateFarmView();
            this.ui.updateMonstersView();
            this.ui.updateTopBar();
        }
    }
    
    // Cleanup
    destroy() {
        this.stopGameLoop();
        
        // Remove event listeners
        document.removeEventListener('visibilitychange', this.onVisibilityChange);
        window.removeEventListener('beforeunload', this.onBeforeUnload);
    }
}

// Global game instance
window.Game = Game;
