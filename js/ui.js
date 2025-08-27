// Monster Farm Legacy - UI Management System

class UIManager {
    constructor(game) {
        this.game = game;
        this.currentScreen = 'loading';
        this.currentView = 'farm';
        this.selectedMonster = null;
        this.notifications = [];
        this.modals = new Map();
        
        this.initializeUI();
    }
    
    initializeUI() {
        this.setupScreens();
        this.setupNavigation();
        this.setupModals();
        this.setupEventListeners();
    }
    
    // Screen Management
    setupScreens() {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => {
            if (screen.id !== 'loading-screen') {
                screen.classList.remove('active');
            }
        });
    }
    
    showScreen(screenName) {
        // Hide all screens
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => screen.classList.remove('active'));
        
        // Show target screen
        const targetScreen = document.getElementById(screenName);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenName;
        }
        
        // Update save status if showing main menu
        if (screenName === 'main-menu') {
            this.updateSaveStatus();
        }
    }
    
    // Navigation
    setupNavigation() {
        const navTabs = document.querySelectorAll('.nav-tab');
        navTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const viewName = e.target.dataset.screen;
                this.switchView(viewName);
            });
        });
    }
    
    switchView(viewName) {
        // Update nav tabs
        const navTabs = document.querySelectorAll('.nav-tab');
        navTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.screen === viewName);
        });
        
        // Update content views
        const gameViews = document.querySelectorAll('.game-view');
        gameViews.forEach(view => {
            view.classList.remove('active');
        });
        
        const targetView = document.getElementById(`${viewName}-view`);
        if (targetView) {
            targetView.classList.add('active');
            this.currentView = viewName;
            
            // Refresh view content
            this.refreshView(viewName);
        }
    }
    
    refreshView(viewName) {
        switch (viewName) {
            case 'farm':
                this.updateFarmView();
                break;
            case 'monsters':
                this.updateMonstersView();
                break;
            case 'training':
                this.updateTrainingView();
                break;
            case 'contests':
                this.updateContestsView();
                break;
            case 'shop':
                this.updateShopView();
                break;
        }
    }
    
    // Farm View
    updateFarmView() {
        this.updateMonsterSlots();
        this.updateFarmStats();
    }
    
    updateFarmStats() {
        // Update farm-related UI elements
        this.updateTopBar();
    }
    
    updateMonsterSlots() {
        const container = document.getElementById('monster-slots');
        if (!container) return;
        
        container.innerHTML = '';
        const farm = this.game.farm;
        
        // Create slots for current capacity
        for (let i = 0; i < farm.maxMonsters; i++) {
            const monster = farm.monsters[i];
            const slot = this.createMonsterSlot(monster, i);
            container.appendChild(slot);
        }
        
        // Add expansion slot if applicable
        const expansion = farm.canExpandFarm();
        if (expansion.canExpand || farm.maxMonsters < 50) {
            const expansionSlot = this.createExpansionSlot(expansion);
            container.appendChild(expansionSlot);
        }
    }
    
    createMonsterSlot(monster, index) {
        const slot = document.createElement('div');
        slot.className = 'monster-slot';
        
        if (monster) {
            slot.classList.add('occupied');
            
            const healthStatus = monster.getHealthStatus();
            const needsAttention = healthStatus === 'poor' || healthStatus === 'critical' || monster.care.sick;
            
            slot.innerHTML = `
                <div class="monster-slot-content">
                    <div class="monster-emoji">${monster.emoji}</div>
                    <div class="monster-slot-text">${monster.name}</div>
                    <div class="monster-slot-level">Lv.${monster.level}</div>
                    ${monster.isTraining ? '<div class="training-indicator">🏋️</div>' : ''}
                    ${needsAttention ? '<div class="attention-indicator">⚠️</div>' : ''}
                </div>
            `;
            
            slot.addEventListener('click', () => this.showMonsterDetail(monster));
        } else {
            slot.classList.add('empty');
            slot.innerHTML = `
                <div class="monster-slot-content">
                    <div class="monster-emoji">➕</div>
                    <div class="monster-slot-text">Empty Slot</div>
                </div>
            `;
            
            slot.addEventListener('click', () => this.showAddMonsterDialog());
        }
        
        return slot;
    }
    
    createExpansionSlot(expansion) {
        const slot = document.createElement('div');
        slot.className = 'monster-slot expansion-slot';
        
        if (expansion.canExpand) {
            // Create a button instead of relying on div click
            slot.innerHTML = `
                <button class="monster-slot-content expansion-button" 
                        onclick="window.ui.expandFarm()" 
                        style="width: 100%; height: 100%; border: none; background: transparent; cursor: pointer; font-family: inherit;">
                    <div class="monster-emoji">🏗️</div>
                    <div class="monster-slot-text">Expand Farm</div>
                    <div class="expansion-cost">💰 ${expansion.cost}</div>
                </button>
            `;
            
            slot.title = `Click to expand farm for ${expansion.cost} gold`;
        } else {
            slot.classList.add('locked');
            slot.innerHTML = `
                <div class="monster-slot-content">
                    <div class="monster-emoji">🔒</div>
                    <div class="monster-slot-text">Locked</div>
                    <div class="expansion-requirement">Need 💰 ${expansion.cost}</div>
                </div>
            `;
            
            slot.title = `Need ${expansion.cost} gold to expand`;
        }
        
        return slot;
    }
    
    // Monsters View
    updateMonstersView() {
        const container = document.getElementById('monsters-list');
        const countContainer = document.getElementById('current-monsters');
        const maxContainer = document.getElementById('max-monsters');
        
        if (!container) return;
        
        const farm = this.game.farm;
        container.innerHTML = '';
        
        // Update counter
        if (countContainer) countContainer.textContent = farm.monsters.length;
        if (maxContainer) maxContainer.textContent = farm.maxMonsters;
        
        // Create monster cards
        farm.monsters.forEach(monster => {
            const card = this.createMonsterCard(monster);
            container.appendChild(card);
        });
        
        if (farm.monsters.length === 0) {
            container.innerHTML = '<div class="empty-state">No monsters yet. Visit the shop to get your first egg!</div>';
        }
    }
    
    createMonsterCard(monster) {
        const card = document.createElement('div');
        card.className = 'monster-card';
        
        const stats = monster.getTotalStats();
        const healthStatus = monster.getHealthStatus();
        
        card.innerHTML = `
            <div class="monster-element element-${monster.element}">${monster.element.toUpperCase()}</div>
            <div class="monster-header">
                <div class="monster-name">${monster.name}</div>
                <div class="monster-level">Lv.${monster.level}</div>
            </div>
            <div class="monster-avatar">${monster.emoji}</div>
            <div class="personality-trait">${monster.personality.emoji} ${monster.personality.name}</div>
            
            <div class="monster-stats">
                ${Object.entries(stats).map(([stat, value]) => `
                    <div class="stat-bar">
                        <div class="stat-name">${stat.toUpperCase()}</div>
                        <div class="stat-progress">
                            <div class="stat-fill" style="width: ${Math.min(100, (value / 100) * 100)}%"></div>
                        </div>
                        <div class="stat-value">${value}</div>
                    </div>
                `).join('')}
            </div>
            
            <div class="care-meters">
                ${this.createCareMeter('hunger', monster.care.hunger, '🍎')}
                ${this.createCareMeter('happiness', monster.care.happiness, '😊')}
                ${this.createCareMeter('cleanliness', monster.care.cleanliness, '🧼')}
                ${this.createCareMeter('energy', monster.care.energy, '⚡')}
            </div>
            
            <div class="monster-actions">
                <button class="btn primary" onclick="ui.selectMonster('${monster.id}')">Select</button>
                <button class="btn secondary" onclick="ui.showMonsterDetail('${monster.id}')">Details</button>
                ${monster.isTraining ? 
                    '<span class="training-status">Training...</span>' : 
                    '<button class="btn secondary" onclick="ui.startTrainingFor(\'${monster.id}\')">Train</button>'
                }
            </div>
        `;
        
        // Add status indicators
        if (monster.care.sick) {
            card.classList.add('sick');
        } else if (healthStatus === 'critical' || healthStatus === 'poor') {
            card.classList.add('needs-care');
        }
        
        if (monster.canEvolve) {
            card.classList.add('can-evolve');
            const evolveIndicator = document.createElement('div');
            evolveIndicator.className = 'evolve-indicator';
            evolveIndicator.innerHTML = '✨ Ready to Evolve!';
            card.appendChild(evolveIndicator);
        }
        
        return card;
    }
    
    createCareMeter(type, value, icon) {
        let fillClass = `care-fill ${type}`;
        if (value < 30) fillClass += ' critical';
        else if (value < 60) fillClass += ' low';
        
        return `
            <div class="care-meter">
                <div class="care-icon">${icon}</div>
                <div class="care-progress">
                    <div class="${fillClass}" style="width: ${value}%"></div>
                </div>
            </div>
        `;
    }
    
    // Training View
    updateTrainingView() {
        const selectedContainer = document.getElementById('selected-monster-training');
        const optionsContainer = document.getElementById('training-options');
        
        if (!selectedContainer || !optionsContainer) {
            console.warn('Training view containers not found');
            return;
        }
        
        console.log('Updating training view. Selected monster:', this.selectedMonster);
        console.log('Available monsters:', this.game.farm.monsters.length);
        
        if (this.selectedMonster) {
            const monster = this.game.farm.getMonster(this.selectedMonster);
            if (monster) {
                this.showTrainingForMonster(monster, selectedContainer, optionsContainer);
            } else {
                console.warn('Selected monster not found:', this.selectedMonster);
                this.selectedMonster = null;
                this.updateTrainingView();
            }
        } else {
            selectedContainer.innerHTML = '<p>Select a monster to begin training</p>';
            
            // Check if we have monsters
            if (this.game.farm.monsters.length === 0) {
                optionsContainer.innerHTML = '<p>No monsters available. Visit the shop to get eggs or use debugCommands.giveStarter() in console!</p>';
            } else {
                optionsContainer.innerHTML = this.createMonsterSelector('training');
            }
        }
    }
    
    showTrainingForMonster(monster, selectedContainer, optionsContainer) {
        selectedContainer.innerHTML = `
            <div class="training-monster-info">
                <div class="monster-info-header">
                    <span class="monster-avatar">${monster.emoji}</span>
                    <div>
                        <h3>${monster.name} (Level ${monster.level})</h3>
                        <p>Energy: ${monster.care.energy}/100</p>
                    </div>
                    <button class="btn secondary" onclick="ui.clearSelectedMonster()">Change</button>
                </div>
                ${monster.isTraining ? this.createTrainingProgress(monster) : ''}
            </div>
        `;
        
        if (monster.isTraining) {
            optionsContainer.innerHTML = '<p>Monster is currently training...</p>';
        } else {
            const trainingManager = this.game.trainingManager;
            const availableTraining = trainingManager.getAvailableTraining(monster);
            
            optionsContainer.innerHTML = availableTraining.map(training => `
                <div class="training-option ${training.affordable ? '' : 'locked'}">
                    <div class="training-icon">${training.icon}</div>
                    <div class="training-name">${training.name}</div>
                    <div class="training-description">${training.description}</div>
                    <div class="training-cost">
                        <span class="cost-icon">💰</span>
                        <span>${training.cost}</span>
                    </div>
                    <button class="btn primary" 
                            onclick="ui.startTraining('${monster.id}', '${training.id}')"
                            ${training.affordable ? '' : 'disabled'}>
                        Start Training
                    </button>
                </div>
            `).join('');
        }
    }
    
    createTrainingProgress(monster) {
        const progress = this.game.trainingManager.getTrainingProgress(monster.id);
        if (!progress) return '';
        
        return `
            <div class="training-progress">
                <h4>Training: ${progress.trainingType.name}</h4>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress.progressPercent}%"></div>
                    <div class="progress-text">${progress.progressPercent}%</div>
                </div>
                <p>Time remaining: ${progress.timeRemainingFormatted}</p>
                <button class="btn danger" onclick="ui.cancelTraining('${monster.id}')">Cancel Training</button>
            </div>
        `;
    }
    
    // Contests View
    updateContestsView() {
        const container = document.getElementById('available-contests');
        if (!container) return;
        
        const contestManager = this.game.contestManager;
        const contests = contestManager.getAvailableContests();
        
        container.innerHTML = contests.map(contest => `
            <div class="contest-card">
                <div class="contest-header">
                    <div class="contest-title">${contest.name}</div>
                    <div class="contest-type ${contest.type}">${contest.type.toUpperCase()}</div>
                </div>
                <div class="contest-description">${contest.description}</div>
                <div class="contest-requirements">
                    <p><strong>Requirements:</strong> Level ${contest.requirements.level}</p>
                    <p><strong>Entry Fee:</strong> 💰 ${contest.entryFee}</p>
                </div>
                <div class="contest-rewards">
                    <div class="contest-reward">💰 ${contest.rewards.gold}</div>
                    <div class="contest-reward">⭐ ${contest.rewards.prestige}</div>
                </div>
                <button class="btn primary" onclick="ui.enterContest('${contest.id}')">
                    Enter Contest
                </button>
            </div>
        `).join('');
        
        if (contests.length === 0) {
            container.innerHTML = '<div class="empty-state">No contests available. Check back later!</div>';
        }
    }
    
    // Shop View
    updateShopView() {
        this.setupShopTabs();
        this.updateShopItems('food');
    }
    
    setupShopTabs() {
        const tabs = document.querySelectorAll('.shop-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.updateShopItems(category);
                
                // Update tab appearance
                tabs.forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }
    
    updateShopItems(category) {
        const container = document.getElementById('shop-items');
        if (!container) return;
        
        const shopItems = window.SHOP_ITEMS || {};
        const categoryItems = shopItems[category.toUpperCase()] || [];
        
        container.innerHTML = categoryItems.map(item => `
            <div class="shop-item">
                <div class="shop-item-icon">${item.icon}</div>
                <div class="shop-item-name">${item.name}</div>
                <div class="shop-item-description">${item.description}</div>
                <div class="shop-item-price">
                    <span class="price-icon">💰</span>
                    <span>${item.price}</span>
                </div>
                <button class="btn primary" onclick="ui.buyItem('${item.id}', '${category}')"
                        ${this.game.farm.gold >= item.price ? '' : 'disabled'}>
                    Buy
                </button>
            </div>
        `).join('');
    }
    
    // Event Handlers
    setupEventListeners() {
        // Menu buttons
        document.getElementById('new-game-btn')?.addEventListener('click', () => this.handleNewGameClick());
        document.getElementById('continue-game-btn')?.addEventListener('click', () => this.continueGame());
        
        // Confirmation modal handlers
        document.getElementById('confirm-yes')?.addEventListener('click', () => this.handleConfirmYes());
        document.getElementById('confirm-no')?.addEventListener('click', () => this.hideConfirmModal());
        
        // Monster care actions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('feed-monster')) {
                this.feedMonster(e.target.dataset.monsterId);
            } else if (e.target.classList.contains('clean-monster')) {
                this.cleanMonster(e.target.dataset.monsterId);
            } else if (e.target.classList.contains('play-with-monster')) {
                this.playWithMonster(e.target.dataset.monsterId);
            }
        });
        
        // Modal close buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close-btn')) {
                this.closeModal();
            } else if (e.target.classList.contains('modal')) {
                this.closeModal();
            }
        });
    }
    
    // Game Actions
    startNewGame() {
        this.game.startNewGame();
        this.showScreen('game-screen');
        this.showNotification('Welcome to Monster Farm Legacy!', 'success');
    }
    
    continueGame() {
        if (this.game.loadGame()) {
            this.showScreen('game-screen');
            this.showNotification('Game loaded successfully!', 'success');
        } else {
            this.showNotification('No saved game found. Starting new game...', 'warning');
            this.startNewGame();
        }
    }
    
    // UI Actions
    expandFarm() {
        console.log('expandFarm() called');
        
        const farm = this.game.farm;
        const expansionInfo = farm.canExpandFarm();
        
        console.log('Expansion info:', expansionInfo);
        console.log('Current gold:', farm.gold);
        console.log('Current max monsters:', farm.maxMonsters);
        
        if (!expansionInfo.canExpand) {
            console.log('Cannot expand:', expansionInfo);
            this.showNotification(`Cannot expand farm. Need 💰${expansionInfo.cost} gold.`, 'error');
            return;
        }
        
        const result = farm.expandFarm();
        console.log('Expansion result:', result);
        
        if (result.success) {
            this.showNotification(`Farm expanded! New capacity: ${result.newCapacity}`, 'success');
            this.updateFarmView();
            this.updateTopBar();
        } else {
            this.showNotification(result.error, 'error');
        }
    }
    
    startTraining(monsterId, trainingId) {
        console.log('Starting training:', monsterId, trainingId);
        
        // Check monster and training details first
        const monster = this.game.farm.getMonster(monsterId);
        const trainingTypes = window.TRAINING_TYPES || {};
        const trainingType = trainingTypes[trainingId.toUpperCase()];
        
        console.log('Monster:', monster ? monster.name : 'not found');
        console.log('Training type:', trainingType ? trainingType.name : 'not found');
        console.log('Farm gold:', this.game.farm.gold);
        
        if (monster) {
            console.log('Monster energy:', monster.care.energy);
            console.log('Monster sick:', monster.care.sick);
            console.log('Monster training:', monster.isTraining);
        }
        
        if (trainingType) {
            console.log('Training cost:', trainingType.cost);
            console.log('Training unlocked:', trainingType.unlocked);
        }
        
        const result = this.game.trainingManager.startTraining(monsterId, trainingId);
        console.log('Training result:', result);
        
        if (result.success) {
            this.showNotification(`Training started: ${result.trainingType.name}`, 'success');
            this.updateTrainingView();
            this.updateTopBar();
        } else {
            // More specific error messages
            let errorMessage = result.error;
            
            if (result.error === 'Cannot start training') {
                if (!monster) {
                    errorMessage = 'Monster not found!';
                } else if (!trainingType) {
                    errorMessage = 'Training type not available!';
                } else if (!trainingType.unlocked) {
                    errorMessage = 'Training type not unlocked yet!';
                } else if (monster.isTraining) {
                    errorMessage = 'Monster is already training!';
                } else if (monster.care.energy < 30) {
                    errorMessage = `Not enough energy! Need 30, have ${monster.care.energy}`;
                } else if (monster.care.sick) {
                    errorMessage = 'Monster is sick! Heal first.';
                } else if (this.game.farm.gold < trainingType.cost) {
                    errorMessage = `Not enough gold! Need ${trainingType.cost}, have ${this.game.farm.gold}`;
                } else {
                    errorMessage = 'Unknown training issue - check console for details';
                }
            }
            
            this.showNotification(errorMessage, 'error');
        }
    }
    
    startTrainingFor(monsterId) {
        // Set the selected monster and switch to training view
        this.selectedMonster = monsterId;
        this.switchView('training');
    }
    
    cancelTraining(monsterId) {
        const result = this.game.trainingManager.cancelTraining(monsterId);
        
        if (result.success) {
            this.showNotification(`Training cancelled. Refunded: 💰${result.refund}`, 'warning');
            this.updateTrainingView();
            this.updateTopBar();
        } else {
            this.showNotification(result.error, 'error');
        }
    }
    
    enterContest(contestId) {
        if (!this.selectedMonster) {
            // Show a notification asking to select a monster first
            this.showNotification('Please select a monster first by clicking on one in the Monsters tab.', 'info');
            // Switch to monsters view to help user select
            this.switchView('monsters');
            return;
        }
        
        const result = this.game.contestManager.enterContest(this.selectedMonster, contestId);
        
        if (result.success) {
            this.showContestResults(result);
            this.updateContestsView();
            this.updateTopBar();
        } else {
            this.showNotification(result.error, 'error');
        }
    }
    
    buyItem(itemId, category) {
        const result = this.game.farm.buyItem(itemId, category);
        
        if (result.success) {
            let message = `Bought ${result.item.name}`;
            
            if (result.type === 'monster_hatched') {
                message += `! Welcome ${result.monster.name}!`;
                this.updateFarmView();
            } else if (result.type === 'upgrade_applied') {
                message += '! Upgrade applied.';
            }
            
            this.showNotification(message, 'success');
            this.updateShopItems(category);
            this.updateTopBar();
        } else {
            this.showNotification(result.error, 'error');
        }
    }
    
    // UI Helpers
    updateTopBar() {
        const goldElement = document.getElementById('gold-amount');
        const prestigeElement = document.getElementById('prestige-amount');
        const farmLevelElement = document.getElementById('farm-level');
        
        if (goldElement) goldElement.textContent = this.game.farm.gold.toLocaleString();
        if (prestigeElement) prestigeElement.textContent = this.game.farm.prestige.toLocaleString();
        if (farmLevelElement) farmLevelElement.textContent = `Level ${this.game.farm.level}`;
    }
    
    showNotification(message, type = 'info') {
        const container = document.getElementById('notifications');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${this.getNotificationIcon(type)}</div>
                <div class="notification-text">
                    <div class="notification-message">${message}</div>
                </div>
            </div>
            <button class="notification-close">×</button>
        `;
        
        container.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
        
        // Add click to remove
        notification.addEventListener('click', () => notification.remove());
    }
    
    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }
    
    showMonsterDetail(monsterId) {
        const monster = this.game.farm.getMonster(monsterId);
        if (!monster) return;
        
        // Implementation would show detailed monster modal
        this.showNotification(`${monster.name} details (coming soon!)`, 'info');
    }
    
    showAddMonsterDialog() {
        this.showNotification('Visit the Shop to buy eggs and get new monsters!', 'info');
        // Switch to shop view
        this.switchView('shop');
    }
    
    createMonsterSelector(purpose, additionalData = null) {
        const monsters = this.game.farm.monsters;
        if (monsters.length === 0) {
            return '<p>No monsters available.</p>';
        }
        
        return `
            <div class="monster-selector">
                <h4>Select a Monster:</h4>
                <div class="monster-selector-grid">
                    ${monsters.map(monster => `
                        <div class="monster-selector-item" onclick="ui.selectMonsterFor('${purpose}', '${monster.id}', '${additionalData || ''}')">
                            <div class="monster-emoji">${monster.emoji}</div>
                            <div class="monster-name">${monster.name}</div>
                            <div class="monster-level">Lv.${monster.level}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    selectMonsterFor(purpose, monsterId, additionalData) {
        this.selectedMonster = monsterId;
        
        switch (purpose) {
            case 'training':
                this.updateTrainingView();
                break;
            case 'contest':
                this.enterContest(additionalData);
                break;
        }
    }
    
    clearSelectedMonster() {
        this.selectedMonster = null;
        this.updateTrainingView();
    }
    
    // Monster Selection
    selectMonster(monsterId) {
        this.selectedMonster = monsterId;
        const monster = this.game.farm.getMonster(monsterId);
        
        if (monster) {
            this.showNotification(`Selected ${monster.name} for training and contests!`, 'success');
            
            // Refresh current view to show selection
            this.refreshView(this.currentView);
        }
    }
    
    // Contest Results
    showContestResults(result) {
        // Simple notification for now - could be enhanced with a modal later
        const monster = result.monster;
        const contest = result.contest;
        
        let message = '';
        let notificationType = 'info';
        
        if (result.placement === 1) {
            message = `🥇 ${monster.name} won the ${contest.name}! Earned 💰${result.rewards.gold} and ⭐${result.rewards.prestige}`;
            notificationType = 'success';
        } else if (result.placement === 2) {
            message = `🥈 ${monster.name} placed 2nd in ${contest.name}! Earned 💰${result.rewards.gold} and ⭐${result.rewards.prestige}`;
            notificationType = 'success';
        } else if (result.placement === 3) {
            message = `🥉 ${monster.name} placed 3rd in ${contest.name}! Earned 💰${result.rewards.gold} and ⭐${result.rewards.prestige}`;
            notificationType = 'success';
        } else {
            message = `${monster.name} participated in ${contest.name} but didn't place in top 3. Better luck next time!`;
            notificationType = 'info';
        }
        
        this.showNotification(message, notificationType);
    }
    
    // Modal Management
    setupModals() {
        const modal = document.getElementById('monster-detail-modal');
        if (modal) {
            this.modals.set('monster-detail', modal);
        }
    }
    
    showModal(modalName, content) {
        const modal = this.modals.get(modalName);
        if (modal) {
            const contentContainer = modal.querySelector('#monster-detail-content');
            if (contentContainer) {
                contentContainer.innerHTML = content;
            }
            modal.classList.add('active');
        }
    }
    
    closeModal() {
        this.modals.forEach(modal => {
            modal.classList.remove('active');
        });
    }
    
    // Save Status Management
    updateSaveStatus() {
        const saveStatusElement = document.getElementById('save-status');
        const continueButton = document.getElementById('continue-game-btn');
        
        if (!saveStatusElement) return;
        
        // Check if save data exists
        const savedData = this.game.storage.loadGame();
        
        if (savedData) {
            saveStatusElement.className = 'save-status has-save';
            
            // Format the save date
            const saveDate = new Date(savedData.lastSaved);
            const formattedDate = this.formatDate(saveDate);
            const timeSinceFormat = this.getTimeSince(savedData.lastSaved);
            
            // Get basic game info from save
            const farmLevel = savedData.farm?.level || 1;
            const monsterCount = savedData.farm?.monsters?.length || 0;
            const gold = savedData.farm?.gold || 0;
            
            saveStatusElement.innerHTML = `
                <div class="save-info">
                    <div class="save-main">💾 Saved Farm Found</div>
                    <div class="save-details">
                        <span>Level ${farmLevel} • ${monsterCount} monsters • ${gold.toLocaleString()} gold</span>
                    </div>
                </div>
                <div class="save-date">Last saved: ${formattedDate} (${timeSinceFormat})</div>
            `;
            
            // Enable continue button
            if (continueButton) {
                continueButton.disabled = false;
                continueButton.textContent = 'Continue';
            }
        } else {
            saveStatusElement.className = 'save-status no-save';
            saveStatusElement.innerHTML = `
                <div class="save-info">
                    <div class="save-main">🆕 No Saved Game Found</div>
                    <div class="save-details">Start a new farm to begin your monster raising adventure!</div>
                </div>
            `;
            
            // Disable continue button or change its appearance
            if (continueButton) {
                continueButton.disabled = true;
                continueButton.textContent = 'No Save Data';
            }
        }
    }
    
    formatDate(date) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const saveDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        if (saveDay.getTime() === today.getTime()) {
            // Today - show time
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            // Other day - show date
            return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
        }
    }
    
    getTimeSince(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 5) return `${minutes} minutes ago`;
        return 'just now';
    }
    
    // Confirmation Modal Management
    showConfirmModal(title, message, onConfirm) {
        const modal = document.getElementById('confirm-modal');
        const titleElement = document.getElementById('confirm-title');
        const messageElement = document.getElementById('confirm-message');
        
        if (modal && titleElement && messageElement) {
            titleElement.textContent = title;
            messageElement.textContent = message;
            modal.classList.add('active');
            
            // Store the callback for when user confirms
            this.confirmCallback = onConfirm;
        }
    }
    
    hideConfirmModal() {
        const modal = document.getElementById('confirm-modal');
        if (modal) {
            modal.classList.remove('active');
            this.confirmCallback = null;
        }
    }
    
    handleConfirmYes() {
        if (this.confirmCallback) {
            this.confirmCallback();
        }
        this.hideConfirmModal();
    }
    
    // Enhanced Menu Actions
    handleNewGameClick() {
        // Check if there's existing save data
        const savedData = this.game.storage.loadGame();
        
        if (savedData) {
            // Show confirmation dialog
            this.showConfirmModal(
                '🗑️ Start New Farm?',
                'This will permanently delete your current saved game. Are you sure you want to continue?',
                () => this.startNewGame()
            );
        } else {
            // No save data, start new game directly
            this.startNewGame();
        }
    }
    
    // Game Loop Updates
    update() {
        // Update dynamic elements
        this.updateTopBar();
        
        // Update current view if needed (but only occasionally to prevent constant refresh)
        if (this.currentScreen === 'game-screen') {
            const now = Date.now();
            
            // Training view needs more frequent updates to show progress
            if (this.currentView === 'training') {
                // Update training progress every second
                if (!this.lastTrainingRefresh || now - this.lastTrainingRefresh > 1000) {
                    this.lastTrainingRefresh = now;
                    if (this.selectedMonster) {
                        const monster = this.game.farm.getMonster(this.selectedMonster);
                        if (monster && monster.isTraining) {
                            const progressElement = document.querySelector('.training-progress');
                            if (progressElement) {
                                const progress = this.game.trainingManager.getTrainingProgress(monster.id);
                                if (progress) {
                                    const progressBar = progressElement.querySelector('.progress-fill');
                                    const progressText = progressElement.querySelector('.progress-text');
                                    const timeRemaining = progressElement.querySelector('.training-progress p');
                                    
                                    if (progressBar) progressBar.style.width = `${progress.progressPercent}%`;
                                    if (progressText) progressText.textContent = `${progress.progressPercent}%`;
                                    if (timeRemaining) timeRemaining.textContent = `Time remaining: ${progress.timeRemainingFormatted}`;
                                }
                            }
                        }
                    }
                }
            } else {
                // Other views refresh less frequently
                if (!this.lastViewRefresh || now - this.lastViewRefresh > 5000) { // Only refresh every 5 seconds
                    this.lastViewRefresh = now;
                    // Only refresh specific parts that need updating, not the entire view
                    if (this.currentView === 'farm') {
                        // Don't refresh the entire farm view constantly, just update dynamic parts
                        this.updateFarmStats();
                    }
                }
            }
        }
    }
}

// Global UI instance will be created by main.js
window.UIManager = UIManager;
