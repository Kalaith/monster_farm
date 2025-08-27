// Monster Farm Legacy - Farm Management System

class Farm {
    constructor() {
        this.level = 1;
        this.prestige = 0;
        this.gold = 1000;
        this.maxMonsters = 1;
        this.monsters = [];
        this.facilities = {
            breedingLab: { level: 1, unlocked: true },
            trainingDojo: { level: 1, unlocked: true },
            contestHall: { level: 0, unlocked: false }
        };
        this.upgrades = {
            trainingSpeedBonus: 0,
            autoFeed: false,
            careReminders: true
        };
        this.unlockedFeatures = ['basic_training'];
        this.lastSaved = Date.now();
    }
    
    // Monster Management
    addMonster(monster) {
        if (this.monsters.length >= this.maxMonsters) {
            return { success: false, error: 'Farm is at maximum capacity' };
        }
        
        if (this.monsters.find(m => m.id === monster.id)) {
            return { success: false, error: 'Monster already on farm' };
        }
        
        this.monsters.push(monster);
        return { success: true };
    }
    
    removeMonster(monsterId) {
        const index = this.monsters.findIndex(m => m.id === monsterId);
        if (index === -1) {
            return { success: false, error: 'Monster not found' };
        }
        
        const monster = this.monsters.splice(index, 1)[0];
        return { success: true, monster };
    }
    
    getMonster(monsterId) {
        return this.monsters.find(m => m.id === monsterId);
    }
    
    getAllMonsters() {
        return [...this.monsters];
    }
    
    getAvailableSlots() {
        return this.maxMonsters - this.monsters.length;
    }
    
    // Farm Expansion
    canExpandFarm() {
        const expansionCost = this.getExpansionCost();
        const canExpand = this.gold >= expansionCost && this.maxMonsters < 50;
        
        return {
            canExpand: canExpand,
            cost: expansionCost,
            currentSlots: this.maxMonsters,
            nextSlots: Math.min(50, this.maxMonsters + 1)
        };
    }
    
    getExpansionCost() {
        // Cost increases exponentially
        return Math.floor(1000 * Math.pow(1.5, this.maxMonsters - 1));
    }
    
    expandFarm() {
        const expansionInfo = this.canExpandFarm();
        
        if (!expansionInfo.canExpand) {
            return { success: false, error: 'Cannot expand farm' };
        }
        
        this.gold -= expansionInfo.cost;
        this.maxMonsters++;
        
        return {
            success: true,
            newCapacity: this.maxMonsters,
            goldSpent: expansionInfo.cost
        };
    }
    
    // Farm Level System
    checkLevelUp() {
        const farmLevels = window.FARM_LEVELS || [];
        const nextLevel = farmLevels.find(level => 
            level.level > this.level && this.prestige >= level.requiredPrestige
        );
        
        if (nextLevel) {
            this.levelUp(nextLevel);
            return { leveledUp: true, newLevel: this.level };
        }
        
        return { leveledUp: false };
    }
    
    levelUp(levelData) {
        this.level = levelData.level;
        this.maxMonsters = Math.max(this.maxMonsters, levelData.maxMonsters);
        
        // Unlock new features
        for (const feature of levelData.unlockedFeatures) {
            if (!this.unlockedFeatures.includes(feature)) {
                this.unlockedFeatures.push(feature);
                this.unlockFeature(feature);
            }
        }
    }
    
    unlockFeature(feature) {
        switch (feature) {
            case 'contests':
                this.facilities.contestHall.unlocked = true;
                break;
            case 'breeding':
                this.facilities.breedingLab.level = Math.max(2, this.facilities.breedingLab.level);
                break;
            case 'advanced_training':
                // Unlock more training types
                if (window.TRAINING_TYPES) {
                    window.TRAINING_TYPES.SPEED.unlocked = true;
                    window.TRAINING_TYPES.SPECIAL.unlocked = true;
                }
                break;
            case 'rare_monsters':
                // Increases chance of rare monster encounters
                break;
        }
    }
    
    // Resource Management
    addGold(amount) {
        this.gold += amount;
        return this.gold;
    }
    
    spendGold(amount) {
        if (this.gold < amount) {
            return { success: false, error: 'Insufficient gold' };
        }
        
        this.gold -= amount;
        return { success: true, remaining: this.gold };
    }
    
    addPrestige(amount) {
        this.prestige += amount;
        const levelResult = this.checkLevelUp();
        return {
            newPrestige: this.prestige,
            ...levelResult
        };
    }
    
    // Facility Management
    getFacilityInfo(facilityName) {
        const facility = this.facilities[facilityName];
        if (!facility) return null;
        
        return {
            ...facility,
            upgradeCost: this.getFacilityUpgradeCost(facilityName),
            canUpgrade: this.canUpgradeFacility(facilityName)
        };
    }
    
    getFacilityUpgradeCost(facilityName) {
        const facility = this.facilities[facilityName];
        if (!facility) return 0;
        
        const baseCosts = {
            breedingLab: 500,
            trainingDojo: 750,
            contestHall: 1000
        };
        
        const baseCost = baseCosts[facilityName] || 500;
        return Math.floor(baseCost * Math.pow(2, facility.level - 1));
    }
    
    canUpgradeFacility(facilityName) {
        const facility = this.facilities[facilityName];
        if (!facility || !facility.unlocked || facility.level >= 5) {
            return false;
        }
        
        const cost = this.getFacilityUpgradeCost(facilityName);
        return this.gold >= cost;
    }
    
    upgradeFacility(facilityName) {
        const facility = this.facilities[facilityName];
        if (!facility) {
            return { success: false, error: 'Facility not found' };
        }
        
        if (!this.canUpgradeFacility(facilityName)) {
            return { success: false, error: 'Cannot upgrade facility' };
        }
        
        const cost = this.getFacilityUpgradeCost(facilityName);
        this.gold -= cost;
        facility.level++;
        
        // Apply facility upgrade effects
        this.applyFacilityUpgrade(facilityName, facility.level);
        
        return {
            success: true,
            newLevel: facility.level,
            goldSpent: cost
        };
    }
    
    applyFacilityUpgrade(facilityName, newLevel) {
        switch (facilityName) {
            case 'trainingDojo':
                // Unlock more training types at higher levels
                if (newLevel >= 3 && window.TRAINING_TYPES) {
                    window.TRAINING_TYPES.RESISTANCE.unlocked = true;
                    window.TRAINING_TYPES.BALANCED.unlocked = true;
                }
                break;
            case 'breedingLab':
                // Better breeding success rates
                break;
            case 'contestHall':
                // Access to higher tier contests
                break;
        }
    }
    
    // Daily/Periodic Updates
    updateFarm(deltaTime) {
        // Update all monsters (with null checks)
        for (const monster of this.monsters) {
            if (monster && typeof monster.updateCare === 'function') {
                monster.updateCare(deltaTime);
            }
            if (monster && typeof monster.checkTrainingComplete === 'function') {
                monster.checkTrainingComplete();
            }
        }
        
        // Auto-feed if enabled
        if (this.upgrades.autoFeed) {
            this.autoFeedMonsters();
        }
        
        // Check for any automated processes
        this.processAutomation(deltaTime);
    }
    
    autoFeedMonsters() {
        const basicFood = {
            effects: { hunger: 30, happiness: 5 }
        };
        
        for (const monster of this.monsters) {
            if (monster.care.hunger < 40) {
                const feedCost = 20; // Cost of basic food
                if (this.gold >= feedCost) {
                    monster.feed(basicFood);
                    this.gold -= feedCost;
                }
            }
        }
    }
    
    processAutomation(deltaTime) {
        // Future: Add passive income, automated breeding, etc.
    }
    
    // Monster Care Helpers
    getMonstersNeedingCare() {
        const needsCare = {
            hungry: [],
            unhappy: [],
            dirty: [],
            tired: [],
            sick: []
        };
        
        for (const monster of this.monsters) {
            if (monster.care.hunger < 40) needsCare.hungry.push(monster);
            if (monster.care.happiness < 40) needsCare.unhappy.push(monster);
            if (monster.care.cleanliness < 40) needsCare.dirty.push(monster);
            if (monster.care.energy < 20) needsCare.tired.push(monster);
            if (monster.care.sick) needsCare.sick.push(monster);
        }
        
        return needsCare;
    }
    
    getTrainingMonsters() {
        return this.monsters.filter(m => m.isTraining);
    }
    
    getReadyToEvolveMonsters() {
        return this.monsters.filter(m => m.canEvolve);
    }
    
    // Shop Integration
    buyItem(itemId, category) {
        const shopItems = window.SHOP_ITEMS || {};
        let item = null;
        
        // Find the item in the appropriate category
        for (const categoryItems of Object.values(shopItems)) {
            if (Array.isArray(categoryItems)) {
                item = categoryItems.find(i => i.id === itemId);
                if (item) break;
            }
        }
        
        if (!item) {
            return { success: false, error: 'Item not found' };
        }
        
        if (this.gold < item.price) {
            return { success: false, error: 'Insufficient gold' };
        }
        
        this.gold -= item.price;
        
        // Handle different item types
        const result = this.processItemPurchase(item);
        
        return {
            success: true,
            item,
            goldSpent: item.price,
            ...result
        };
    }
    
    processItemPurchase(item) {
        switch (item.category) {
            case 'food':
            case 'items':
                // These are consumables - return to inventory
                return { type: 'consumable' };
                
            case 'eggs':
                // Hatch an egg into a monster
                return this.hatchEgg(item);
                
            case 'upgrades':
                // Apply permanent upgrades
                return this.applyUpgrade(item);
                
            default:
                return { type: 'unknown' };
        }
    }
    
    hatchEgg(eggItem) {
        if (this.getAvailableSlots() <= 0) {
            return { 
                success: false, 
                error: 'No space for new monster',
                refund: eggItem.price 
            };
        }
        
        let element = eggItem.element;
        if (element === 'random') {
            const elements = Object.values(window.ELEMENTS || {});
            element = elements[Math.floor(Math.random() * elements.length)];
        }
        
        const monster = MonsterFactory.createRandomMonster(element);
        this.addMonster(monster);
        
        return {
            type: 'monster_hatched',
            monster: monster
        };
    }
    
    applyUpgrade(upgradeItem) {
        const effects = upgradeItem.effects || {};
        
        for (const [effect, value] of Object.entries(effects)) {
            switch (effect) {
                case 'farmSlots':
                    this.maxMonsters += value;
                    break;
                case 'trainingSpeedBonus':
                    this.upgrades.trainingSpeedBonus += value;
                    break;
                case 'autoFeed':
                    this.upgrades.autoFeed = true;
                    break;
            }
        }
        
        return { type: 'upgrade_applied', effects };
    }
    
    // Statistics
    getFarmStats() {
        const totalMonsters = this.monsters.length;
        const totalLevel = this.monsters.reduce((sum, m) => sum + m.level, 0);
        const avgLevel = totalMonsters > 0 ? totalLevel / totalMonsters : 0;
        
        const elementCounts = {};
        const rarityCounts = {};
        
        for (const monster of this.monsters) {
            elementCounts[monster.element] = (elementCounts[monster.element] || 0) + 1;
            rarityCounts[monster.rarity] = (rarityCounts[monster.rarity] || 0) + 1;
        }
        
        const totalVictories = this.monsters.reduce((sum, m) => sum + m.victories, 0);
        const totalContests = this.monsters.reduce((sum, m) => sum + m.contestsEntered, 0);
        
        return {
            farmLevel: this.level,
            prestige: this.prestige,
            gold: this.gold,
            totalMonsters,
            maxMonsters: this.maxMonsters,
            avgLevel: Math.round(avgLevel * 10) / 10,
            elementCounts,
            rarityCounts,
            totalVictories,
            totalContests,
            winRate: totalContests > 0 ? Math.round((totalVictories / totalContests) * 100) : 0
        };
    }
    
    // Serialization
    toJSON() {
        return {
            level: this.level,
            prestige: this.prestige,
            gold: this.gold,
            maxMonsters: this.maxMonsters,
            monsters: this.monsters.map(m => m.toJSON()),
            facilities: this.facilities,
            upgrades: this.upgrades,
            unlockedFeatures: this.unlockedFeatures,
            lastSaved: Date.now()
        };
    }
    
    static fromJSON(data) {
        const farm = new Farm();
        
        // Restore basic properties
        farm.level = data.level || 1;
        farm.prestige = data.prestige || 0;
        farm.gold = data.gold || 1000;
        farm.maxMonsters = data.maxMonsters || 1;
        farm.facilities = data.facilities || farm.facilities;
        farm.upgrades = data.upgrades || farm.upgrades;
        farm.unlockedFeatures = data.unlockedFeatures || ['basic_training'];
        farm.lastSaved = data.lastSaved || Date.now();
        
        // Restore monsters
        if (data.monsters && Array.isArray(data.monsters)) {
            farm.monsters = data.monsters.map(monsterData => 
                Monster.fromJSON(monsterData)
            );
        }
        
        return farm;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Farm };
}
