// Monster Farm Legacy - Monster System

class Monster {
    constructor(species, options = {}) {
        this.id = this.generateId();
        this.species = species;
        this.name = options.name || this.generateName();
        
        // Core Properties
        this.level = options.level || 1;
        this.element = species.element;
        this.emoji = species.emoji;
        this.rarity = species.rarity;
        
        // Stats (can be trained)
        this.stats = {
            hp: this.calculateBaseStat('hp'),
            attack: this.calculateBaseStat('attack'),
            defense: this.calculateBaseStat('defense'),
            speed: this.calculateBaseStat('speed'),
            special: this.calculateBaseStat('special')
        };
        
        // Training bonuses (applied on top of base stats)
        this.training = {
            hp: 0,
            attack: 0,
            defense: 0,
            speed: 0,
            special: 0,
            resistanceBonus: 0
        };
        
        // Care/Tamagotchi system
        this.care = {
            hunger: options.hunger || 80,
            happiness: options.happiness || 80,
            cleanliness: options.cleanliness || 80,
            energy: options.energy || 80,
            sick: false,
            lastFed: Date.now(),
            lastCleaned: Date.now(),
            lastPlayed: Date.now()
        };
        
        // Personality affects behavior and training
        this.personality = this.assignPersonality();
        
        // Experience and growth
        this.experience = options.experience || 0;
        this.experienceToNext = this.calculateExpToNext();
        
        // Evolution tracking
        this.canEvolve = false;
        this.evolutionReadyAt = null;
        
        // Contest/battle tracking
        this.victories = 0;
        this.defeats = 0;
        this.contestsEntered = 0;
        
        // Timestamps
        this.bornAt = Date.now();
        this.lastUpdated = Date.now();
        
        // Training state
        this.isTraining = false;
        this.trainingEnd = null;
        this.trainingType = null;
    }
    
    generateId() {
        return 'monster_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    generateName() {
        const prefixes = ['Star', 'Swift', 'Brave', 'Mystic', 'Noble', 'Bright', 'Shadow', 'Fire', 'Storm', 'Crystal'];
        const suffixes = ['heart', 'wing', 'claw', 'flame', 'storm', 'shine', 'dash', 'spark', 'glow', 'strike'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        return prefix + suffix;
    }
    
    assignPersonality() {
        const personalities = window.PERSONALITIES || [
            {
                name: 'Friendly',
                effects: { happinessGain: 1.2, hungerGain: 0.9 }
            },
            {
                name: 'Energetic', 
                effects: { energyLoss: 1.3, trainingBonus: 0.1 }
            },
            {
                name: 'Calm',
                effects: { energyLoss: 0.8, trainingResistance: -0.1 }
            }
        ];
        
        if (!personalities || personalities.length === 0) {
            return {
                name: 'Neutral',
                effects: {}
            };
        }
        
        const randomIndex = Math.floor(Math.random() * personalities.length);
        return personalities[randomIndex];
    }
    
    calculateBaseStat(statName) {
        const baseValue = this.species.baseStats[statName];
        const levelMultiplier = 1 + (this.level - 1) * 0.1; // 10% per level
        
        // Apply element bonuses
        const elementData = window.ELEMENT_DATA[this.element] || {};
        const elementBonus = elementData.statBonuses?.[statName] || 1;
        
        return Math.floor(baseValue * levelMultiplier * elementBonus);
    }
    
    calculateExpToNext() {
        return Math.floor(100 + (this.level - 1) * 50 + Math.pow(this.level - 1, 1.5) * 25);
    }
    
    // Get total stat including training bonuses
    getTotalStat(statName) {
        const baseStat = this.calculateBaseStat(statName);
        const trainingBonus = this.training[statName] || 0;
        
        // Apply personality effects
        let personalityMultiplier = 1;
        if (this.personality) {
            if (statName === 'speed' && this.personality.effects.speedBonus) {
                personalityMultiplier *= this.personality.effects.speedBonus;
            }
            if (statName === 'special' && this.personality.effects.specialBonus) {
                personalityMultiplier *= this.personality.effects.specialBonus;
            }
        }
        
        return Math.floor((baseStat + trainingBonus) * personalityMultiplier);
    }
    
    // Get all total stats
    getTotalStats() {
        return {
            hp: this.getTotalStat('hp'),
            attack: this.getTotalStat('attack'),
            defense: this.getTotalStat('defense'),
            speed: this.getTotalStat('speed'),
            special: this.getTotalStat('special')
        };
    }
    
    // Care system methods
    updateCare(deltaTime) {
        const minutesPassed = deltaTime / 60000; // Convert to minutes
        const decayRates = window.CARE_DECAY_RATES || {};
        
        // Apply personality effects to decay
        let hungerMultiplier = 1;
        let energyMultiplier = 1;
        let happinessMultiplier = 1;
        
        if (this.personality?.effects) {
            hungerMultiplier = this.personality.effects.hungerGain || 1;
            energyMultiplier = this.personality.effects.energyLoss || 1;
            happinessMultiplier = 1 / (this.personality.effects.happinessGain || 1);
        }
        
        // Decay care stats
        this.care.hunger = Math.max(0, this.care.hunger - (decayRates.hunger || 1) * minutesPassed * hungerMultiplier);
        this.care.happiness = Math.max(0, this.care.happiness - (decayRates.happiness || 0.5) * minutesPassed * happinessMultiplier);
        this.care.cleanliness = Math.max(0, this.care.cleanliness - (decayRates.cleanliness || 0.3) * minutesPassed);
        this.care.energy = Math.max(0, this.care.energy - (decayRates.energy || 2) * minutesPassed * energyMultiplier);
        
        // Check for sickness
        this.checkSickness();
        
        this.lastUpdated = Date.now();
    }
    
    checkSickness() {
        const thresholds = window.CARE_THRESHOLDS || {};
        const critical = thresholds.critical || 20;
        
        // Get sick if multiple care stats are critically low
        let criticalCount = 0;
        if (this.care.hunger < critical) criticalCount++;
        if (this.care.happiness < critical) criticalCount++;
        if (this.care.cleanliness < critical) criticalCount++;
        
        // Apply personality resistance
        const sickResistance = this.personality?.effects?.sickResistance || 0;
        const sickChance = Math.max(0, criticalCount * 0.1 - sickResistance);
        
        if (!this.care.sick && Math.random() < sickChance) {
            this.care.sick = true;
        }
        
        // Recover from sickness if care is good
        if (this.care.sick && criticalCount === 0 && this.care.happiness > 70) {
            this.care.sick = false;
        }
    }
    
    // Feed the monster
    feed(foodItem) {
        if (!foodItem?.effects) return false;
        
        const effects = foodItem.effects;
        this.care.hunger = Math.min(100, this.care.hunger + (effects.hunger || 0));
        this.care.happiness = Math.min(100, this.care.happiness + (effects.happiness || 0));
        this.care.energy = Math.min(100, this.care.energy + (effects.energy || 0));
        
        this.care.lastFed = Date.now();
        
        // Apply personality bonus to happiness from feeding
        if (this.personality?.effects?.happinessGain) {
            const bonusHappiness = (effects.happiness || 0) * (this.personality.effects.happinessGain - 1);
            this.care.happiness = Math.min(100, this.care.happiness + bonusHappiness);
        }
        
        return true;
    }
    
    // Clean the monster
    clean(cleaningItem) {
        if (!cleaningItem?.effects) return false;
        
        const effects = cleaningItem.effects;
        this.care.cleanliness = Math.min(100, this.care.cleanliness + (effects.cleanliness || 0));
        this.care.happiness = Math.min(100, this.care.happiness + (effects.happiness || 0));
        
        this.care.lastCleaned = Date.now();
        return true;
    }
    
    // Play with the monster
    play() {
        const happinessGain = 20;
        const energyCost = 15;
        
        if (this.care.energy < energyCost) {
            return false; // Too tired to play
        }
        
        this.care.happiness = Math.min(100, this.care.happiness + happinessGain);
        this.care.energy = Math.max(0, this.care.energy - energyCost);
        this.care.lastPlayed = Date.now();
        
        // Apply personality effects
        if (this.personality?.effects?.happinessGain) {
            const bonusHappiness = happinessGain * (this.personality.effects.happinessGain - 1);
            this.care.happiness = Math.min(100, this.care.happiness + bonusHappiness);
        }
        
        return true;
    }
    
    // Training system
    startTraining(trainingType) {
        if (this.isTraining) return false;
        
        const training = window.TRAINING_TYPES?.[trainingType.toUpperCase()];
        if (!training || !training.unlocked) return false;
        
        // Check energy requirement
        const energyRequired = 30;
        if (this.care.energy < energyRequired) return false;
        
        this.isTraining = true;
        this.trainingType = training;
        
        // Apply personality effects to training duration
        let durationMultiplier = 1;
        if (this.personality?.effects?.trainingResistance) {
            durationMultiplier += this.personality.effects.trainingResistance;
        }
        
        this.trainingEnd = Date.now() + (training.duration * durationMultiplier);
        this.care.energy = Math.max(0, this.care.energy - energyRequired);
        
        return true;
    }
    
    checkTrainingComplete() {
        if (!this.isTraining || Date.now() < this.trainingEnd) {
            return false;
        }
        
        // Apply training effects
        const effects = this.trainingType.effects;
        for (const [stat, bonus] of Object.entries(effects)) {
            if (this.training.hasOwnProperty(stat)) {
                let finalBonus = bonus;
                
                // Apply personality bonuses/penalties
                if (this.personality?.effects?.trainingBonus && stat !== 'resistanceBonus') {
                    finalBonus *= (1 + this.personality.effects.trainingBonus);
                } else if (this.personality?.effects?.trainingPenalty && stat !== 'resistanceBonus') {
                    finalBonus *= (1 - this.personality.effects.trainingPenalty);
                }
                
                this.training[stat] += finalBonus;
            }
        }
        
        // Gain experience from training
        this.gainExperience(10);
        
        // Reset training state
        this.isTraining = false;
        this.trainingEnd = null;
        this.trainingType = null;
        
        return true;
    }
    
    // Experience and leveling
    gainExperience(amount) {
        this.experience += amount;
        
        while (this.experience >= this.experienceToNext && this.level < 100) {
            this.experience -= this.experienceToNext;
            this.levelUp();
        }
        
        this.checkEvolutionRequirements();
    }
    
    levelUp() {
        this.level++;
        this.experienceToNext = this.calculateExpToNext();
        
        // Recalculate base stats
        for (const stat in this.stats) {
            this.stats[stat] = this.calculateBaseStat(stat);
        }
        
        // Restore some energy and happiness on level up
        this.care.energy = Math.min(100, this.care.energy + 25);
        this.care.happiness = Math.min(100, this.care.happiness + 15);
    }
    
    checkEvolutionRequirements() {
        if (this.canEvolve) return;
        
        const requirements = window.EVOLUTION_REQUIREMENTS || {};
        const levelReq = requirements.level?.first || 15;
        const happinessReq = requirements.care?.happiness || 80;
        const cleanlinessReq = requirements.care?.cleanliness || 70;
        const minTotalStats = requirements.stats?.minTotal || 300;
        
        const totalStats = Object.values(this.getTotalStats()).reduce((sum, stat) => sum + stat, 0);
        
        if (this.level >= levelReq && 
            this.care.happiness >= happinessReq && 
            this.care.cleanliness >= cleanlinessReq && 
            totalStats >= minTotalStats &&
            this.species.evolvesTo && this.species.evolvesTo.length > 0) {
            
            this.canEvolve = true;
            this.evolutionReadyAt = Date.now();
        }
    }
    
    // Battle/Contest methods
    getContestScore(contestType) {
        const stats = this.getTotalStats();
        const contestData = window.CONTEST_TYPES?.[contestType.toUpperCase()];
        
        if (!contestData) return 0;
        
        let score = 0;
        
        // Calculate score based on required stats
        for (const statName of contestData.statRequirements) {
            if (statName === 'happiness' || statName === 'cleanliness') {
                score += this.care[statName] || 0;
            } else {
                score += stats[statName] || 0;
            }
        }
        
        // Apply care bonuses/penalties
        const careMultiplier = this.getOverallCareMultiplier();
        score *= careMultiplier;
        
        // Add randomness (10% variance)
        score *= (0.9 + Math.random() * 0.2);
        
        return Math.floor(score);
    }
    
    getOverallCareMultiplier() {
        const avgCare = (this.care.hunger + this.care.happiness + this.care.cleanliness + this.care.energy) / 4;
        
        if (this.care.sick) return 0.5;
        if (avgCare >= 90) return 1.2;
        if (avgCare >= 70) return 1.0;
        if (avgCare >= 50) return 0.8;
        if (avgCare >= 30) return 0.6;
        return 0.4;
    }
    
    // Contest results
    winContest(contestType, reward) {
        this.victories++;
        this.contestsEntered++;
        
        // Gain experience and happiness from winning
        this.gainExperience(25);
        this.care.happiness = Math.min(100, this.care.happiness + 20);
        
        return reward;
    }
    
    loseContest(contestType) {
        this.defeats++;
        this.contestsEntered++;
        
        // Small experience gain and happiness loss
        this.gainExperience(5);
        this.care.happiness = Math.max(0, this.care.happiness - 10);
    }
    
    // Utility methods
    getAge() {
        const ageInMs = Date.now() - this.bornAt;
        const ageInDays = Math.floor(ageInMs / (1000 * 60 * 60 * 24));
        return ageInDays;
    }
    
    getHealthStatus() {
        if (this.care.sick) return 'sick';
        
        const avgCare = (this.care.hunger + this.care.happiness + this.care.cleanliness + this.care.energy) / 4;
        
        if (avgCare >= 90) return 'excellent';
        if (avgCare >= 70) return 'good';
        if (avgCare >= 50) return 'fair';
        if (avgCare >= 30) return 'poor';
        return 'critical';
    }
    
    // Serialization for saving
    toJSON() {
        return {
            id: this.id,
            species: this.species,
            name: this.name,
            level: this.level,
            element: this.element,
            emoji: this.emoji,
            rarity: this.rarity,
            stats: this.stats,
            training: this.training,
            care: this.care,
            personality: this.personality,
            experience: this.experience,
            experienceToNext: this.experienceToNext,
            canEvolve: this.canEvolve,
            evolutionReadyAt: this.evolutionReadyAt,
            victories: this.victories,
            defeats: this.defeats,
            contestsEntered: this.contestsEntered,
            bornAt: this.bornAt,
            lastUpdated: this.lastUpdated,
            isTraining: this.isTraining,
            trainingEnd: this.trainingEnd,
            trainingType: this.trainingType
        };
    }
    
    // Create monster from saved data
    static fromJSON(data) {
        const monster = new Monster(data.species, {
            name: data.name,
            level: data.level,
            hunger: data.care?.hunger,
            happiness: data.care?.happiness,
            cleanliness: data.care?.cleanliness,
            energy: data.care?.energy,
            experience: data.experience
        });
        
        // Restore all saved properties
        Object.assign(monster, data);
        
        return monster;
    }
}

// Monster Factory for creating new monsters
class MonsterFactory {
    static createRandomMonster(element = null, rarity = null) {
        const species = this.getRandomSpecies(element, rarity);
        return new Monster(species);
    }
    
    static createFromSpecies(speciesId) {
        let species = null;
        
        // Check if MONSTER_SPECIES is an object or array
        const speciesData = window.MONSTER_SPECIES || {};
        
        if (Array.isArray(speciesData)) {
            species = speciesData.find(s => s.id === speciesId);
        } else {
            species = speciesData[speciesId];
        }
        
        if (!species) {
            console.error(`Species not found: ${speciesId}. Creating fallback species.`);
            console.log('Available species:', Object.keys(speciesData));
            
            // Create a fallback species
            species = {
                id: speciesId,
                name: speciesId.charAt(0).toUpperCase() + speciesId.slice(1),
                element: 'NORMAL',
                rarity: 'COMMON',
                emoji: '🔮',
                baseStats: { hp: 50, attack: 30, defense: 25, speed: 20, special: 15 },
                evolutions: [],
                description: 'A mysterious monster'
            };
        }
        
        return new Monster(species);
    }
    
    static getRandomSpecies(element = null, rarity = null) {
        const speciesData = window.MONSTER_SPECIES || {};
        
        // Convert object to array if needed
        let availableSpecies;
        if (Array.isArray(speciesData)) {
            availableSpecies = [...speciesData];
        } else {
            availableSpecies = Object.values(speciesData);
        }
        
        if (availableSpecies.length === 0) {
            // Create fallback species if no species data available
            console.warn('No monster species data available, creating fallback');
            return {
                id: 'unknown',
                name: 'Unknown',
                element: 'NORMAL',
                rarity: 'COMMON',
                emoji: '🔮',
                baseStats: { hp: 50, attack: 30, defense: 25, speed: 20, special: 15 },
                evolutions: [],
                description: 'A mysterious monster'
            };
        }
        
        if (element) {
            availableSpecies = availableSpecies.filter(s => s.element === element);
        }
        
        if (rarity) {
            availableSpecies = availableSpecies.filter(s => s.rarity === rarity);
        } else {
            // Use rarity chances to select
            const rarityRoll = Math.random();
            const rarityChances = window.RARITY_CHANCES || { common: 0.6, uncommon: 0.25, rare: 0.1, legendary: 0.05 };
            
            let targetRarity = 'common';
            let cumulative = 0;
            
            for (const [rarityKey, chance] of Object.entries(rarityChances)) {
                cumulative += chance;
                if (rarityRoll <= cumulative) {
                    targetRarity = rarityKey;
                    break;
                }
            }
            
            availableSpecies = availableSpecies.filter(s => s.rarity === targetRarity);
        }
        
        if (availableSpecies.length === 0) {
            // Fallback to any species
            availableSpecies = Array.isArray(speciesData) ? speciesData : Object.values(speciesData);
        }
        
        if (availableSpecies.length === 0) {
            // Final fallback
            return {
                id: 'fallback',
                name: 'Fallback',
                element: 'NORMAL',
                rarity: 'COMMON',
                emoji: '🔮',
                baseStats: { hp: 50, attack: 30, defense: 25, speed: 20, special: 15 },
                evolutions: [],
                description: 'A fallback monster'
            };
        }
        
        const randomIndex = Math.floor(Math.random() * availableSpecies.length);
        return availableSpecies[randomIndex];
    }
    
    static createStarterMonster() {
        // Player chooses from water, fire, or earth starter
        const starters = ['blobling', 'flamepup', 'rocksprout'];
        const randomStarter = starters[Math.floor(Math.random() * starters.length)];
        return this.createFromSpecies(randomStarter);
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Monster, MonsterFactory };
}
