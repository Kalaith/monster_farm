// Monster Farm Legacy - Training System

class TrainingManager {
    constructor(farm) {
        this.farm = farm;
        this.activeTrainingSessions = new Map();
    }
    
    // Get available training options for a monster
    getAvailableTraining(monster) {
        const trainingTypes = window.TRAINING_TYPES || {};
        const available = [];
        
        for (const [key, training] of Object.entries(trainingTypes)) {
            if (this.canStartTraining(monster, training)) {
                available.push({
                    ...training,
                    affordable: this.farm.gold >= training.cost,
                    energyRequired: 30
                });
            }
        }
        
        return available;
    }
    
    canStartTraining(monster, trainingType) {
        const checks = {
            unlocked: trainingType.unlocked,
            notTraining: !monster.isTraining,
            hasEnergy: monster.care.energy >= 30,
            notSick: !monster.care.sick
        };
        
        console.log('Training eligibility check:', {
            monster: monster.name,
            trainingType: trainingType.name,
            energy: monster.care.energy,
            checks: checks
        });
        
        // Check if training type is unlocked
        if (!trainingType.unlocked) {
            console.log('Training blocked: not unlocked');
            return false;
        }
        
        // Check if monster is already training
        if (monster.isTraining) {
            console.log('Training blocked: already training');
            return false;
        }
        
        // Check energy requirement
        if (monster.care.energy < 30) {
            console.log('Training blocked: insufficient energy (need 30, have', monster.care.energy, ')');
            return false;
        }
        
        // Check if monster is sick
        if (monster.care.sick) {
            console.log('Training blocked: monster is sick');
            return false;
        }
        
        return true;
    }
    
    startTraining(monsterId, trainingTypeId) {
        const monster = this.farm.getMonster(monsterId);
        if (!monster) {
            return { success: false, error: 'Monster not found' };
        }
        
        const trainingTypes = window.TRAINING_TYPES || {};
        const trainingType = trainingTypes[trainingTypeId.toUpperCase()];
        
        if (!trainingType) {
            return { success: false, error: 'Training type not found' };
        }
        
        if (!this.canStartTraining(monster, trainingType)) {
            return { success: false, error: 'Cannot start training' };
        }
        
        // Check farm resources
        const goldResult = this.farm.spendGold(trainingType.cost);
        if (!goldResult.success) {
            return goldResult;
        }
        
        // Start the training
        const success = monster.startTraining(trainingTypeId);
        
        if (!success) {
            // Refund gold if training failed to start
            this.farm.addGold(trainingType.cost);
            return { success: false, error: 'Failed to start training' };
        }
        
        // Track the training session
        this.activeTrainingSessions.set(monsterId, {
            monster: monster,
            trainingType: trainingType,
            startTime: Date.now(),
            endTime: monster.trainingEnd
        });
        
        return {
            success: true,
            trainingType: trainingType,
            endTime: monster.trainingEnd,
            goldSpent: trainingType.cost
        };
    }
    
    // Check for completed training sessions
    checkTrainingComplete() {
        const completedSessions = [];
        
        for (const [monsterId, session] of this.activeTrainingSessions) {
            const monster = session.monster;
            
            if (monster.checkTrainingComplete()) {
                completedSessions.push({
                    monsterId: monsterId,
                    monster: monster,
                    trainingType: session.trainingType,
                    experienceGained: 10,
                    statsImproved: session.trainingType.effects
                });
                
                this.activeTrainingSessions.delete(monsterId);
            }
        }
        
        return completedSessions;
    }
    
    // Cancel training (with partial refund)
    cancelTraining(monsterId) {
        const session = this.activeTrainingSessions.get(monsterId);
        if (!session) {
            return { success: false, error: 'No active training session' };
        }
        
        const monster = session.monster;
        const trainingType = session.trainingType;
        
        // Calculate partial refund based on progress
        const totalDuration = trainingType.duration;
        const timeElapsed = Date.now() - session.startTime;
        const progress = Math.min(1, timeElapsed / totalDuration);
        const refund = Math.floor(trainingType.cost * (1 - progress) * 0.7); // 70% refund for unused time
        
        // Reset monster training state
        monster.isTraining = false;
        monster.trainingEnd = null;
        monster.trainingType = null;
        
        // Give refund
        this.farm.addGold(refund);
        
        // Remove from active sessions
        this.activeTrainingSessions.delete(monsterId);
        
        return {
            success: true,
            refund: refund,
            progress: Math.floor(progress * 100)
        };
    }
    
    // Get training progress for UI
    getTrainingProgress(monsterId) {
        const session = this.activeTrainingSessions.get(monsterId);
        if (!session) {
            return null;
        }
        
        const totalDuration = session.trainingType.duration;
        const timeElapsed = Date.now() - session.startTime;
        const progress = Math.min(1, timeElapsed / totalDuration);
        const timeRemaining = Math.max(0, session.endTime - Date.now());
        
        return {
            trainingType: session.trainingType,
            progress: progress,
            progressPercent: Math.floor(progress * 100),
            timeRemaining: timeRemaining,
            timeRemainingFormatted: this.formatTime(timeRemaining),
            isComplete: progress >= 1
        };
    }
    
    // Get all active training sessions for UI
    getAllActiveTraining() {
        const sessions = [];
        
        for (const [monsterId, session] of this.activeTrainingSessions) {
            const progress = this.getTrainingProgress(monsterId);
            sessions.push({
                monsterId: monsterId,
                monster: session.monster,
                ...progress
            });
        }
        
        return sessions;
    }
    
    // Training efficiency calculation
    calculateTrainingEfficiency(monster, trainingType) {
        let efficiency = 1.0;
        
        // Personality effects
        if (monster.personality?.effects) {
            const effects = monster.personality.effects;
            
            if (effects.trainingBonus) {
                efficiency *= (1 + effects.trainingBonus);
            }
            
            if (effects.trainingPenalty) {
                efficiency *= (1 - effects.trainingPenalty);
            }
            
            if (effects.trainingResistance) {
                // Resistance makes training take longer but potentially more effective
                efficiency *= (1 + effects.trainingResistance * 0.5);
            }
        }
        
        // Care state effects
        const careMultiplier = monster.getOverallCareMultiplier();
        efficiency *= careMultiplier;
        
        // Farm upgrades
        if (this.farm.upgrades.trainingSpeedBonus) {
            efficiency *= (1 + this.farm.upgrades.trainingSpeedBonus);
        }
        
        // Facility level bonus
        const dojoLevel = this.farm.facilities.trainingDojo?.level || 1;
        efficiency *= (1 + (dojoLevel - 1) * 0.15); // 15% bonus per level above 1
        
        return Math.max(0.1, efficiency); // Minimum 10% efficiency
    }
    
    // Advanced training options (unlocked later)
    getSpecializedTraining(monster) {
        const specialized = [];
        
        // Element-specific resistance training
        if (this.farm.unlockedFeatures.includes('advanced_training')) {
            const elementData = window.ELEMENT_DATA[monster.element];
            if (elementData?.weaknesses) {
                for (const weakness of elementData.weaknesses) {
                    const resistanceTraining = this.createResistanceTraining(monster, weakness);
                    specialized.push(resistanceTraining);
                }
            }
        }
        
        // Stat focus training (hyper-specialized)
        if (this.farm.facilities.trainingDojo?.level >= 4) {
            const focusTraining = this.createFocusTraining(monster);
            specialized.push(...focusTraining);
        }
        
        return specialized;
    }
    
    createResistanceTraining(monster, weaknessElement) {
        const elementData = window.ELEMENT_DATA[weaknessElement];
        
        return {
            id: `resistance_${weaknessElement}`,
            name: `${elementData?.name || weaknessElement} Resistance`,
            icon: `${elementData?.emoji || '⚖️'}`,
            description: `Train resistance against ${elementData?.name || weaknessElement} attacks`,
            cost: 200,
            duration: 90000, // 90 seconds
            effects: { 
                [`${weaknessElement}Resistance`]: 0.15,
                defense: 1
            },
            unlocked: true,
            specialized: true
        };
    }
    
    createFocusTraining(monster) {
        const stats = ['hp', 'attack', 'defense', 'speed', 'special'];
        const focusOptions = [];
        
        for (const stat of stats) {
            focusOptions.push({
                id: `focus_${stat}`,
                name: `${stat.toUpperCase()} Focus`,
                icon: this.getStatIcon(stat),
                description: `Intense ${stat} training with maximum results`,
                cost: 150,
                duration: 120000, // 2 minutes
                effects: { [stat]: 5 },
                unlocked: true,
                specialized: true
            });
        }
        
        return focusOptions;
    }
    
    getStatIcon(stat) {
        const icons = {
            hp: '❤️',
            attack: '⚔️',
            defense: '🛡️',
            speed: '💨',
            special: '✨'
        };
        return icons[stat] || '💪';
    }
    
    // Training recommendations based on monster's current stats
    getRecommendedTraining(monster) {
        const recommendations = [];
        const stats = monster.getTotalStats();
        const totalStats = Object.values(stats).reduce((sum, stat) => sum + stat, 0);
        const avgStat = totalStats / 5;
        
        // Find weak stats
        for (const [statName, value] of Object.entries(stats)) {
            if (value < avgStat * 0.8) { // If stat is 20% below average
                const trainingType = this.findTrainingForStat(statName);
                if (trainingType) {
                    recommendations.push({
                        ...trainingType,
                        reason: `Improve weak ${statName}`,
                        priority: 'high'
                    });
                }
            }
        }
        
        // Element-based recommendations
        const elementData = window.ELEMENT_DATA[monster.element];
        if (elementData?.weaknesses?.length > 0) {
            recommendations.push({
                id: 'resistance',
                reason: `Mitigate ${monster.element} weaknesses`,
                priority: 'medium'
            });
        }
        
        // Contest-based recommendations
        const upcomingContests = this.getUpcomingContests();
        for (const contest of upcomingContests) {
            const contestData = window.CONTEST_TYPES?.[contest.type.toUpperCase()];
            if (contestData?.statRequirements) {
                for (const requiredStat of contestData.statRequirements) {
                    if (stats[requiredStat] && stats[requiredStat] < avgStat) {
                        const trainingType = this.findTrainingForStat(requiredStat);
                        if (trainingType) {
                            recommendations.push({
                                ...trainingType,
                                reason: `Prepare for ${contest.name}`,
                                priority: 'medium'
                            });
                        }
                    }
                }
            }
        }
        
        return recommendations;
    }
    
    findTrainingForStat(statName) {
        const trainingTypes = window.TRAINING_TYPES || {};
        
        for (const training of Object.values(trainingTypes)) {
            if (training.effects && training.effects[statName]) {
                return training;
            }
        }
        
        return null;
    }
    
    getUpcomingContests() {
        // This would integrate with the contest system
        // For now, return empty array
        return [];
    }
    
    // Utility methods
    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        
        if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        }
        return `${seconds}s`;
    }
    
    // Training history and analytics
    getTrainingHistory(monster) {
        // This would track historical training data
        // For now, calculate based on current training bonuses
        const history = [];
        
        for (const [stat, bonus] of Object.entries(monster.training)) {
            if (bonus > 0) {
                const sessionsCount = Math.floor(bonus / 2); // Assuming average 2 points per session
                history.push({
                    stat: stat,
                    totalBonus: bonus,
                    estimatedSessions: sessionsCount,
                    efficiency: 'Good' // Would be calculated from actual data
                });
            }
        }
        
        return history;
    }
    
    // Reset training data (for testing or special items)
    resetMonsterTraining(monsterId) {
        const monster = this.farm.getMonster(monsterId);
        if (!monster) {
            return { success: false, error: 'Monster not found' };
        }
        
        // Cancel any active training
        if (monster.isTraining) {
            this.cancelTraining(monsterId);
        }
        
        // Reset training bonuses
        monster.training = {
            hp: 0,
            attack: 0,
            defense: 0,
            speed: 0,
            special: 0,
            resistanceBonus: 0
        };
        
        return {
            success: true,
            message: 'Training data reset successfully'
        };
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TrainingManager };
}
