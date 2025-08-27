// Monster Farm Legacy - Game Storage System

class GameStorage {
    constructor() {
        this.storageKey = 'monsterFarmLegacy';
        this.settingsKey = 'monsterFarmLegacySettings';
        
        // Check if localStorage is available
        this.storageAvailable = this.testLocalStorage();
        
        if (!this.storageAvailable) {
            console.warn('localStorage not available. Game progress will not be saved.');
        }
    }
    
    testLocalStorage() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    // Game Data Management
    saveGame(gameData) {
        if (!this.storageAvailable) {
            return false;
        }
        
        try {
            const dataToSave = {
                ...gameData,
                timestamp: Date.now(),
                version: gameData.gameVersion || '1.0.0'
            };
            
            const serialized = JSON.stringify(dataToSave);
            localStorage.setItem(this.storageKey, serialized);
            
            return true;
        } catch (error) {
            console.error('Failed to save game data:', error);
            
            // If storage is full, try to free up space
            if (error.name === 'QuotaExceededError') {
                this.cleanupOldData();
                try {
                    const serialized = JSON.stringify(gameData);
                    localStorage.setItem(this.storageKey, serialized);
                    return true;
                } catch (retryError) {
                    console.error('Failed to save even after cleanup:', retryError);
                }
            }
            
            return false;
        }
    }
    
    loadGame() {
        if (!this.storageAvailable) {
            return null;
        }
        
        try {
            const saved = localStorage.getItem(this.storageKey);
            
            if (!saved) {
                return null;
            }
            
            const gameData = JSON.parse(saved);
            
            // Validate the saved data
            if (!this.validateGameData(gameData)) {
                console.warn('Saved game data is invalid or corrupted');
                return null;
            }
            
            // Check version compatibility
            if (gameData.version && !this.isVersionCompatible(gameData.version)) {
                console.warn('Saved game version is not compatible');
                // Could implement migration logic here
                return null;
            }
            
            return gameData;
        } catch (error) {
            console.error('Failed to load game data:', error);
            return null;
        }
    }
    
    validateGameData(data) {
        // Basic validation checks
        if (!data || typeof data !== 'object') {
            return false;
        }
        
        // Check for required fields
        if (!data.farm || !data.timestamp) {
            return false;
        }
        
        // Validate farm data structure
        const farm = data.farm;
        if (!farm.level || !Array.isArray(farm.monsters) || typeof farm.gold !== 'number') {
            return false;
        }
        
        return true;
    }
    
    isVersionCompatible(savedVersion) {
        // Simple version compatibility check
        const currentVersion = '1.0.0';
        const saved = savedVersion.split('.').map(Number);
        const current = currentVersion.split('.').map(Number);
        
        // Major version must match
        return saved[0] === current[0];
    }
    
    deleteGame() {
        if (!this.storageAvailable) {
            return false;
        }
        
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('Failed to delete game data:', error);
            return false;
        }
    }
    
    // Settings Management
    saveSettings(settings) {
        if (!this.storageAvailable) {
            return false;
        }
        
        try {
            const settingsData = {
                ...settings,
                timestamp: Date.now()
            };
            
            localStorage.setItem(this.settingsKey, JSON.stringify(settingsData));
            return true;
        } catch (error) {
            console.error('Failed to save settings:', error);
            return false;
        }
    }
    
    loadSettings() {
        if (!this.storageAvailable) {
            return this.getDefaultSettings();
        }
        
        try {
            const saved = localStorage.getItem(this.settingsKey);
            
            if (!saved) {
                return this.getDefaultSettings();
            }
            
            const settings = JSON.parse(saved);
            
            // Merge with defaults to ensure all settings exist
            return {
                ...this.getDefaultSettings(),
                ...settings
            };
        } catch (error) {
            console.error('Failed to load settings:', error);
            return this.getDefaultSettings();
        }
    }
    
    getDefaultSettings() {
        return {
            sound: true,
            music: true,
            notifications: true,
            autoSave: true,
            theme: 'light',
            language: 'en'
        };
    }
    
    // Storage Management
    getStorageInfo() {
        if (!this.storageAvailable) {
            return {
                available: false,
                used: 0,
                total: 0,
                gameSize: 0
            };
        }
        
        try {
            // Calculate storage usage
            let total = 0;
            let gameSize = 0;
            
            for (const key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    const size = localStorage[key].length;
                    total += size;
                    
                    if (key === this.storageKey) {
                        gameSize = size;
                    }
                }
            }
            
            // Estimate total available storage (usually ~5-10MB)
            const estimatedTotal = 5 * 1024 * 1024; // 5MB
            
            return {
                available: true,
                used: total,
                total: estimatedTotal,
                gameSize: gameSize,
                usedPercentage: Math.round((total / estimatedTotal) * 100)
            };
        } catch (error) {
            console.error('Failed to get storage info:', error);
            return {
                available: false,
                used: 0,
                total: 0,
                gameSize: 0
            };
        }
    }
    
    cleanupOldData() {
        if (!this.storageAvailable) {
            return;
        }
        
        try {
            // Remove any old or temporary data
            const keysToRemove = [];
            
            for (const key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    // Remove old backup saves (if they exist)
                    if (key.startsWith(this.storageKey + '_backup_')) {
                        keysToRemove.push(key);
                    }
                    
                    // Remove other game data that might be old
                    if (key.includes('temp') || key.includes('cache')) {
                        keysToRemove.push(key);
                    }
                }
            }
            
            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
            });
            
            console.log(`Cleaned up ${keysToRemove.length} old storage items`);
        } catch (error) {
            console.error('Failed to cleanup old data:', error);
        }
    }
    
    // Backup and Export
    createBackup() {
        if (!this.storageAvailable) {
            return null;
        }
        
        try {
            const gameData = this.loadGame();
            if (!gameData) {
                return null;
            }
            
            const backupData = {
                ...gameData,
                backupTimestamp: Date.now(),
                backupVersion: '1.0.0'
            };
            
            return JSON.stringify(backupData, null, 2);
        } catch (error) {
            console.error('Failed to create backup:', error);
            return null;
        }
    }
    
    restoreFromBackup(backupString) {
        if (!this.storageAvailable) {
            return false;
        }
        
        try {
            const backupData = JSON.parse(backupString);
            
            // Validate backup data
            if (!this.validateGameData(backupData)) {
                throw new Error('Invalid backup data');
            }
            
            // Remove backup-specific fields
            delete backupData.backupTimestamp;
            delete backupData.backupVersion;
            
            // Save as current game
            return this.saveGame(backupData);
        } catch (error) {
            console.error('Failed to restore from backup:', error);
            return false;
        }
    }
    
    // Import/Export for sharing save files
    exportSave() {
        const backup = this.createBackup();
        if (!backup) {
            return null;
        }
        
        // Encode as base64 for easy sharing
        try {
            return btoa(backup);
        } catch (error) {
            console.error('Failed to encode save data:', error);
            return backup; // Return plain text as fallback
        }
    }
    
    importSave(saveData) {
        try {
            // Try to decode from base64 first
            let decoded;
            try {
                decoded = atob(saveData);
            } catch (e) {
                // If not base64, treat as plain text
                decoded = saveData;
            }
            
            return this.restoreFromBackup(decoded);
        } catch (error) {
            console.error('Failed to import save data:', error);
            return false;
        }
    }
    
    // Statistics
    getGameHistory() {
        // This could track multiple save slots, play sessions, etc.
        // For now, just return basic info
        const gameData = this.loadGame();
        if (!gameData) {
            return null;
        }
        
        return {
            firstPlayed: gameData.farm?.monsters?.[0]?.bornAt || null,
            lastSaved: gameData.lastSaved || null,
            totalSessions: gameData.totalSessions || 1,
            version: gameData.version || '1.0.0'
        };
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameStorage };
}
