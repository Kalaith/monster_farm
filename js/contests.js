// Monster Farm Legacy - Contest and Battle System

class ContestManager {
    constructor(farm) {
        this.farm = farm;
        this.availableContests = [];
        this.contestHistory = [];
        this.lastContestUpdate = Date.now();
        
        this.generateContests();
    }
    
    generateContests() {
        this.availableContests = [];
        const contestTypes = window.CONTEST_TYPES || {};
        
        for (const [key, contestData] of Object.entries(contestTypes)) {
            // Generate multiple difficulty levels for each contest type
            const difficulties = ['Rookie', 'Amateur', 'Professional', 'Elite'];
            
            for (let i = 0; i < difficulties.length; i++) {
                const difficulty = difficulties[i];
                const contestLevel = i + 1;
                
                // Check if player has access to this difficulty level
                if (this.canAccessContest(contestData, contestLevel)) {
                    this.availableContests.push({
                        id: `${key.toLowerCase()}_${difficulty.toLowerCase()}`,
                        name: `${difficulty} ${contestData.name}`,
                        type: contestData.type,
                        description: contestData.description,
                        difficulty: difficulty,
                        level: contestLevel,
                        requirements: {
                            ...contestData.requirements,
                            level: (contestData.requirements.level || 1) + (contestLevel - 1) * 3
                        },
                        rewards: {
                            gold: contestData.rewards.gold * contestLevel,
                            prestige: contestData.rewards.prestige * contestLevel
                        },
                        statRequirements: contestData.statRequirements,
                        entryFee: Math.floor((contestData.rewards.gold * contestLevel) * 0.2),
                        opponents: this.generateOpponents(contestLevel),
                        timeLimit: Date.now() + (24 * 60 * 60 * 1000) // Available for 24 hours
                    });
                }
            }
        }
        
        this.lastContestUpdate = Date.now();
    }
    
    canAccessContest(contestData, level) {
        // Check farm level requirements
        const minFarmLevel = Math.ceil(level / 2);
        if (this.farm.level < minFarmLevel) {
            return false;
        }
        
        // Check if contest type is unlocked
        if (contestData.type === 'battle' && !this.farm.facilities.contestHall.unlocked) {
            return false;
        }
        
        return true;
    }
    
    generateOpponents(level) {
        const opponents = [];
        const opponentCount = 3 + level; // More opponents at higher levels
        
        for (let i = 0; i < opponentCount; i++) {
            const opponent = this.createOpponent(level);
            opponents.push(opponent);
        }
        
        return opponents;
    }
    
    createOpponent(level) {
        const names = [
            'Trainer Alex', 'Breeder Sarah', 'Master Chen', 'Champion Riley',
            'Expert Maya', 'Veteran Jack', 'Prodigy Luna', 'Legend Storm'
        ];
        
        const name = names[Math.floor(Math.random() * names.length)];
        
        // Create opponent monster with stats appropriate for the level
        const species = MonsterFactory.getRandomSpecies();
        const opponentMonster = new Monster(species, {
            level: Math.max(1, level * 3 + Math.floor(Math.random() * 5) - 2)
        });
        
        // Boost opponent stats for higher difficulties
        const statMultiplier = 1 + (level - 1) * 0.3;
        for (const stat in opponentMonster.training) {
            if (stat !== 'resistanceBonus') {
                opponentMonster.training[stat] = Math.floor(Math.random() * 10 * statMultiplier);
            }
        }
        
        // Set good care stats for opponents
        opponentMonster.care = {
            hunger: 80 + Math.random() * 20,
            happiness: 80 + Math.random() * 20,
            cleanliness: 80 + Math.random() * 20,
            energy: 80 + Math.random() * 20,
            sick: false
        };
        
        return {
            name: name,
            monster: opponentMonster,
            difficulty: level,
            winRate: Math.min(95, 50 + level * 10) // Higher level opponents have better win rates
        };
    }
    
    getAvailableContests(monster = null) {
        // Filter contests based on monster eligibility if provided
        let contests = [...this.availableContests];
        
        if (monster) {
            contests = contests.filter(contest => this.canEnterContest(monster, contest));
        }
        
        // Sort by difficulty and type
        contests.sort((a, b) => {
            if (a.level !== b.level) return a.level - b.level;
            return a.type.localeCompare(b.type);
        });
        
        return contests;
    }
    
    canEnterContest(monster, contest) {
        // Check level requirement
        if (monster.level < contest.requirements.level) {
            return false;
        }
        
        // Check specific requirements
        if (contest.requirements.happiness && monster.care.happiness < contest.requirements.happiness) {
            return false;
        }
        
        // Check entry fee
        if (this.farm.gold < contest.entryFee) {
            return false;
        }
        
        // Check if monster is healthy enough
        if (monster.care.sick) {
            return false;
        }
        
        const avgCare = (monster.care.hunger + monster.care.happiness + monster.care.cleanliness + monster.care.energy) / 4;
        if (avgCare < 30) {
            return false;
        }
        
        return true;
    }
    
    enterContest(monsterId, contestId) {
        const monster = this.farm.getMonster(monsterId);
        if (!monster) {
            return { success: false, error: 'Monster not found' };
        }
        
        const contest = this.availableContests.find(c => c.id === contestId);
        if (!contest) {
            return { success: false, error: 'Contest not found' };
        }
        
        if (!this.canEnterContest(monster, contest)) {
            return { success: false, error: 'Cannot enter contest' };
        }
        
        // Pay entry fee
        const feeResult = this.farm.spendGold(contest.entryFee);
        if (!feeResult.success) {
            return feeResult;
        }
        
        // Run the contest
        const result = this.runContest(monster, contest);
        
        // Record in history
        this.contestHistory.unshift({
            contestName: contest.name,
            monster: { name: monster.name, level: monster.level },
            result: result.result,
            rewards: result.rewards,
            timestamp: Date.now()
        });
        
        // Keep history limited
        if (this.contestHistory.length > 50) {
            this.contestHistory = this.contestHistory.slice(0, 50);
        }
        
        return {
            success: true,
            contest: contest,
            monster: monster,
            ...result
        };
    }
    
    runContest(monster, contest) {
        const results = {
            rounds: [],
            finalPosition: 0,
            result: 'loss',
            rewards: { gold: 0, prestige: 0 },
            experience: 5 // Base experience for participation
        };
        
        // Get monster's score for this contest type
        const monsterScore = monster.getContestScore(contest.type);
        const opponents = contest.opponents;
        
        // Calculate opponent scores
        const allCompetitors = [
            { name: monster.name, score: monsterScore, isPlayer: true },
            ...opponents.map(opp => ({
                name: opp.name,
                score: opp.monster.getContestScore(contest.type) * (0.9 + Math.random() * 0.2), // Add some variance
                isPlayer: false
            }))
        ];
        
        // Sort by score (highest first)
        allCompetitors.sort((a, b) => b.score - a.score);
        
        // Find player's position
        const playerPosition = allCompetitors.findIndex(c => c.isPlayer) + 1;
        results.finalPosition = playerPosition;
        
        // Determine result and rewards
        const totalCompetitors = allCompetitors.length;
        
        if (playerPosition === 1) {
            results.result = 'victory';
            results.rewards.gold = contest.rewards.gold;
            results.rewards.prestige = contest.rewards.prestige;
            results.experience = 25;
            monster.winContest(contest.type, results.rewards);
        } else if (playerPosition <= Math.ceil(totalCompetitors * 0.3)) {
            results.result = 'podium';
            results.rewards.gold = Math.floor(contest.rewards.gold * 0.6);
            results.rewards.prestige = Math.floor(contest.rewards.prestige * 0.6);
            results.experience = 15;
            monster.winContest(contest.type, results.rewards);
        } else if (playerPosition <= Math.ceil(totalCompetitors * 0.6)) {
            results.result = 'decent';
            results.rewards.gold = Math.floor(contest.rewards.gold * 0.3);
            results.rewards.prestige = Math.floor(contest.rewards.prestige * 0.3);
            results.experience = 10;
        } else {
            results.result = 'loss';
            results.experience = 5;
            monster.loseContest(contest.type);
        }
        
        // Apply rewards
        this.farm.addGold(results.rewards.gold);
        const prestigeResult = this.farm.addPrestige(results.rewards.prestige);
        monster.gainExperience(results.experience);
        
        // Generate detailed round results for UI
        results.rounds = this.generateRoundDetails(contest, allCompetitors, playerPosition);
        
        // Check for farm level up
        if (prestigeResult.leveledUp) {
            results.farmLevelUp = {
                oldLevel: prestigeResult.newLevel - 1,
                newLevel: prestigeResult.newLevel
            };
        }
        
        return results;
    }
    
    generateRoundDetails(contest, competitors, playerPosition) {
        const rounds = [];
        
        // Create narrative for the contest based on type
        switch (contest.type) {
            case 'battle':
                rounds.push({
                    title: 'Opening Ceremony',
                    description: 'All competitors gather in the battle arena.',
                    playerAction: 'Your monster looks determined and ready to fight!'
                });
                
                if (playerPosition <= 3) {
                    rounds.push({
                        title: 'Qualifying Rounds',
                        description: 'Your monster performs well in the early battles.',
                        playerAction: 'Strong attacks and good defense carry you forward!'
                    });
                }
                
                rounds.push({
                    title: 'Final Results',
                    description: `Competition ends with you placing ${this.getPositionText(playerPosition)}.`,
                    playerAction: this.getResultDescription(playerPosition, competitors.length)
                });
                break;
                
            case 'agility':
                rounds.push({
                    title: 'Speed Trials',
                    description: 'Monsters race through obstacle courses.',
                    playerAction: 'Your monster navigates the course with grace!'
                });
                
                rounds.push({
                    title: 'Final Sprint',
                    description: `The final results are in - ${this.getPositionText(playerPosition)}!`,
                    playerAction: this.getResultDescription(playerPosition, competitors.length)
                });
                break;
                
            case 'beauty':
                rounds.push({
                    title: 'Presentation Round',
                    description: 'Judges evaluate grooming and presentation.',
                    playerAction: 'Your monster\'s care and cleanliness shine through!'
                });
                
                rounds.push({
                    title: 'Talent Display',
                    description: `Final judging complete - ${this.getPositionText(playerPosition)}!`,
                    playerAction: this.getResultDescription(playerPosition, competitors.length)
                });
                break;
        }
        
        return rounds;
    }
    
    getPositionText(position) {
        if (position === 1) return '1st place';
        if (position === 2) return '2nd place';
        if (position === 3) return '3rd place';
        return `${position}th place`;
    }
    
    getResultDescription(position, total) {
        if (position === 1) {
            return 'Outstanding performance! Your training has paid off magnificently!';
        } else if (position <= Math.ceil(total * 0.3)) {
            return 'Excellent work! A podium finish shows real promise.';
        } else if (position <= Math.ceil(total * 0.6)) {
            return 'Good effort! There\'s room for improvement, but you\'re on the right track.';
        } else {
            return 'This was a learning experience. More training will help next time.';
        }
    }
    
    // Battle-specific methods for detailed combat
    runDetailedBattle(playerMonster, opponentMonster) {
        const battle = {
            rounds: [],
            winner: null,
            playerHealth: 100,
            opponentHealth: 100
        };
        
        const playerStats = playerMonster.getTotalStats();
        const opponentStats = opponentMonster.getTotalStats();
        
        let round = 1;
        
        while (battle.playerHealth > 0 && battle.opponentHealth > 0 && round <= 10) {
            const roundResult = this.runBattleRound(
                playerMonster, opponentMonster,
                playerStats, opponentStats,
                battle.playerHealth, battle.opponentHealth
            );
            
            battle.rounds.push({
                round: round,
                ...roundResult
            });
            
            battle.playerHealth = roundResult.playerHealthAfter;
            battle.opponentHealth = roundResult.opponentHealthAfter;
            
            round++;
        }
        
        battle.winner = battle.playerHealth > battle.opponentHealth ? 'player' : 'opponent';
        return battle;
    }
    
    runBattleRound(playerMonster, opponentMonster, playerStats, opponentStats, playerHealth, opponentHealth) {
        // Determine who goes first based on speed
        const playerSpeed = playerStats.speed;
        const opponentSpeed = opponentStats.speed;
        
        let firstAttacker, secondAttacker;
        let firstStats, secondStats;
        let firstHealth, secondHealth;
        
        if (playerSpeed >= opponentSpeed) {
            firstAttacker = 'player';
            secondAttacker = 'opponent';
            firstStats = playerStats;
            secondStats = opponentStats;
            firstHealth = playerHealth;
            secondHealth = opponentHealth;
        } else {
            firstAttacker = 'opponent';
            secondAttacker = 'player';
            firstStats = opponentStats;
            secondStats = playerStats;
            firstHealth = opponentHealth;
            secondHealth = playerHealth;
        }
        
        // Calculate damage
        const firstDamage = this.calculateDamage(firstStats, secondStats, firstAttacker === 'player' ? playerMonster : opponentMonster);
        secondHealth -= firstDamage;
        
        let secondDamage = 0;
        if (secondHealth > 0) {
            secondDamage = this.calculateDamage(secondStats, firstStats, secondAttacker === 'player' ? playerMonster : opponentMonster);
            firstHealth -= secondDamage;
        }
        
        // Return results in player perspective
        if (firstAttacker === 'player') {
            return {
                playerAttackDamage: firstDamage,
                opponentAttackDamage: secondDamage,
                playerHealthAfter: Math.max(0, firstHealth),
                opponentHealthAfter: Math.max(0, secondHealth),
                playerAction: this.getAttackDescription(playerMonster.element, firstDamage),
                opponentAction: secondHealth > 0 ? this.getAttackDescription(opponentMonster.element, secondDamage) : 'Opponent is defeated!'
            };
        } else {
            return {
                playerAttackDamage: secondDamage,
                opponentAttackDamage: firstDamage,
                playerHealthAfter: Math.max(0, secondHealth),
                opponentHealthAfter: Math.max(0, firstHealth),
                playerAction: secondHealth > 0 ? this.getAttackDescription(playerMonster.element, secondDamage) : 'Your monster is defeated!',
                opponentAction: this.getAttackDescription(opponentMonster.element, firstDamage)
            };
        }
    }
    
    calculateDamage(attackerStats, defenderStats, attackerMonster) {
        let baseDamage = attackerStats.attack + attackerStats.special * 0.7;
        const defense = defenderStats.defense + defenderStats.hp * 0.1;
        
        // Apply elemental advantages/disadvantages
        // This would need to be implemented based on the specific matchup
        
        // Add randomness
        baseDamage *= (0.8 + Math.random() * 0.4); // 80-120% of base damage
        
        // Apply defense
        const finalDamage = Math.max(1, baseDamage - defense * 0.5);
        
        return Math.floor(finalDamage);
    }
    
    getAttackDescription(element, damage) {
        const elementData = window.ELEMENT_DATA?.[element];
        const emoji = elementData?.emoji || '⚔️';
        
        if (damage > 15) return `${emoji} Devastating attack! (${damage} damage)`;
        if (damage > 10) return `${emoji} Powerful strike! (${damage} damage)`;
        if (damage > 5) return `${emoji} Solid hit! (${damage} damage)`;
        return `${emoji} Glancing blow (${damage} damage)`;
    }
    
    // Contest scheduling and management
    refreshContests() {
        const timeSinceUpdate = Date.now() - this.lastContestUpdate;
        const refreshInterval = 24 * 60 * 60 * 1000; // 24 hours
        
        if (timeSinceUpdate >= refreshInterval) {
            this.generateContests();
            return true;
        }
        
        return false;
    }
    
    getContestHistory(limit = 10) {
        return this.contestHistory.slice(0, limit);
    }
    
    getContestStats() {
        const stats = {
            totalContests: this.contestHistory.length,
            victories: 0,
            podiumFinishes: 0,
            totalRewards: { gold: 0, prestige: 0 }
        };
        
        for (const contest of this.contestHistory) {
            if (contest.result === 'victory') {
                stats.victories++;
                stats.podiumFinishes++;
            } else if (contest.result === 'podium') {
                stats.podiumFinishes++;
            }
            
            stats.totalRewards.gold += contest.rewards?.gold || 0;
            stats.totalRewards.prestige += contest.rewards?.prestige || 0;
        }
        
        stats.winRate = stats.totalContests > 0 ? Math.round((stats.victories / stats.totalContests) * 100) : 0;
        stats.podiumRate = stats.totalContests > 0 ? Math.round((stats.podiumFinishes / stats.totalContests) * 100) : 0;
        
        return stats;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ContestManager };
}
