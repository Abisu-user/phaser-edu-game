import Phaser from 'phaser';

export default class TeachingScene extends Phaser.Scene {
    
    constructor() {
        super({ key: 'TeachingScene' });
        this.cellSize = 80;
        this.levelConfig = null;
        this.lastFacing = 'moveRight'; // 記錄玩家最後朝向，供感應器使用
        this.isFailed = false; // 紀錄是否已經撞牆失敗
    }

    init(data) {
        if (data && Object.keys(data).length > 0) {
            this.levelConfig = data;
        }
    }

    create() {
        if (!this.levelConfig || !this.levelConfig.player) {
            console.log('TeachingScene: 等待關卡資料中...');
            return; 
        }

        const cfg = this.levelConfig;

        // 🌟 1. 動態計算網格與格子大小 (Cell Size)
        const cols = cfg.grid_size?.cols || 10;
        const rows = cfg.grid_size?.rows || 10;
        
        // 遊戲畫布固定 800x800，取最長的一邊來平分，確保畫面裝得下
        const maxGrid = Math.max(cols, rows);
        this.cellSize = 800 / maxGrid; 
        
        const mapWidth = cols * this.cellSize;
        const mapHeight = rows * this.cellSize;

        // 🌟 2. 根據格子大小，動態縮放 Emoji 與文字比例
        const emojiFontSize = Math.floor(this.cellSize * 0.7) + 'px';
        const labelFontSize = Math.max(10, Math.floor(this.cellSize * 0.22)) + 'px'; // 最小不低於 10px
        const labelOffsetY = this.cellSize * 0.35; // 文字向下偏移量

        const emojiStyle = {
            fontSize: emojiFontSize,
            fontFamily: '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif'
        };

        const labelStyle = {
            fontSize: labelFontSize, 
            fill: '#f0f0f0', 
            fontFamily: 'sans-serif'
        };

        // --- 畫網格 ---
        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0x00d4aa, 0.2);
        
        // 畫垂直線
        for (let i = 0; i <= mapWidth; i += this.cellSize) {
            graphics.moveTo(i, 0); graphics.lineTo(i, mapHeight);
        }
        // 畫水平線
        for (let j = 0; j <= mapHeight; j += this.cellSize) {
            graphics.moveTo(0, j); graphics.lineTo(mapWidth, j);
        }
        graphics.strokePath();

        // --- 繪製障礙物 ---
        if (cfg.obstacles) {
            cfg.obstacles.forEach(obs => {
                const icon = obs.type === 'lava' ? '🔥' : (obs.type === 'wall' ? '🧱' : '🪨');
                let ox = obs.x * this.cellSize + this.cellSize / 2;
                let oy = obs.y * this.cellSize + this.cellSize / 2;
                this.add.text(ox, oy, icon, emojiStyle).setOrigin(0.5);
            });
        }

        // --- 設定玩家 ---
        this.playerGridX = cfg.player.gridX;
        this.playerGridY = cfg.player.gridY;
        
        this.startX = this.playerGridX * this.cellSize + this.cellSize / 2;
        this.startY = this.playerGridY * this.cellSize + this.cellSize / 2;
        
        this.player = this.add.text(this.startX, this.startY, cfg.player.emoji, emojiStyle).setOrigin(0.5);
        this.playerLabel = this.add.text(this.startX, this.startY + labelOffsetY, cfg.player.label, labelStyle).setOrigin(0.5);
        
        // 讓玩家顯示在最上層
        this.player.setDepth(10);
        this.playerLabel.setDepth(10);

        // --- 設定敵人 ---
        this.enemyGridX = cfg.enemy.gridX;
        this.enemyGridY = cfg.enemy.gridY;
        this.enemyX = this.enemyGridX * this.cellSize + this.cellSize / 2;
        this.enemyY = this.enemyGridY * this.cellSize + this.cellSize / 2;
        
        this.enemy = this.add.text(this.enemyX, this.enemyY, cfg.enemy.emoji, emojiStyle).setOrigin(0.5);
        this.enemyLabel = this.add.text(this.enemyX, this.enemyY + labelOffsetY, cfg.enemy.label, { ...labelStyle, fill: '#ff6b6b' }).setOrigin(0.5);

        // --- 訊息框 ---
        this.messageBox = this.add.text(400, 720, '', { 
            fontSize: '22px', 
            fill: '#fff', 
            backgroundColor: 'rgba(20, 20, 40, 0.95)',
            padding: { x: 20, y: 15 },
            stroke: '#ff6b6b',
            strokeThickness: 2,
            wordWrap: { width: 700 }
        }).setOrigin(0.5).setVisible(false);
        this.messageBox.setDepth(20);
    }

    resetLevel() {
        this.tweens.killAll();
        this.time.removeAllEvents();

        this.playerGridX = this.levelConfig.player.gridX;
        this.playerGridY = this.levelConfig.player.gridY;
        this.lastFacing = 'moveRight';
        this.isFailed = false;
        
        if (this.player) {
            this.player.setPosition(this.startX, this.startY);
            this.playerLabel.setPosition(this.startX, this.startY + 40);
        }
        
        if (this.messageBox) this.messageBox.setVisible(false);
        
        if (this.enemy) {
            this.enemy.setAlpha(1);
            this.enemy.clearTint();
            this.enemy.setPosition(this.enemyX, this.enemyY);
            this.enemy.scale = 1;
        }
    }

    // ==========================================
    // 遊戲核心邏輯 (支援 Async / Await 與 感知器)
    // ==========================================

    // 判斷某座標是否有障礙物
    isObstacle(x, y) {
        if (!this.levelConfig || !this.levelConfig.obstacles) return false;
        return this.levelConfig.obstacles.some(ob => ob.x === x && ob.y === y);
    }

    // 感知指令：檢查前方是否有障礙物
    checkObstacleAhead() {
        let nx = this.playerGridX;
        let ny = this.playerGridY;
        if (this.lastFacing === 'moveRight') nx += 1;
        if (this.lastFacing === 'moveLeft') nx -= 1;
        if (this.lastFacing === 'moveUp') ny -= 1;
        if (this.lastFacing === 'moveDown') ny += 1;
        
        // 從關卡設定讀取真實的長寬，若無則預設 10
        const cols = this.levelConfig?.grid_size?.cols || 10;
        const rows = this.levelConfig?.grid_size?.rows || 10;

        // 檢查是否超出地圖邊界
        if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) return true;
        return this.isObstacle(nx, ny);
    }

    // 感知指令：檢查敵人是否在周圍一格內
    async checkEnemyNear() {
        if (!this.enemy || this.enemy.alpha === 0) return false; // 敵人已死
        const dist = Math.abs(this.playerGridX - this.enemyGridX) + Math.abs(this.playerGridY - this.enemyGridY);
        return dist <= 1;
    }

    // 執行單一指令，回傳 Promise 讓 Blockly 等待動畫
    async addCommand(action) {
        if (this.isFailed || !this.player || this.enemy.alpha === 0) return Promise.resolve(); 

        return new Promise((resolve) => {
            let dx = 0, dy = 0;
            
            // 讀取動態網格大小
            const cols = this.levelConfig?.grid_size?.cols || 10;
            const rows = this.levelConfig?.grid_size?.rows || 10;
            
            // 處理基本移動
            if (['moveRight', 'moveLeft', 'moveUp', 'moveDown', 'dash'].includes(action)) {
                if (action === 'moveRight') dx = 1;
                else if (action === 'moveLeft') dx = -1;
                else if (action === 'moveUp') dy = -1;
                else if (action === 'moveDown') dy = 1;

                this.lastFacing = action === 'dash' ? this.lastFacing : action;

                // 如果是 dash，移動距離變 2
                let step = action === 'dash' ? 2 : 1;
                if (action === 'dash') {
                    if (this.lastFacing === 'moveRight') dx = step;
                    else if (this.lastFacing === 'moveLeft') dx = -step;
                    else if (this.lastFacing === 'moveUp') dy = -step;
                    else if (this.lastFacing === 'moveDown') dy = step;
                }
                
                const nextX = this.playerGridX + dx;
                const nextY = this.playerGridY + dy;

                // 檢查撞牆判定
                if (nextX < 0 || nextX >= cols || nextY < 0 || nextY >= rows || this.isObstacle(nextX, nextY)) {
                    this.showResult(false, '💥 碰！撞到障礙物或牆壁了！');
                    this.isFailed = true; 
                    resolve(); 
                    return;
                }

                this.playerGridX = nextX;
                this.playerGridY = nextY;
                
                let targetX = nextX * this.cellSize + this.cellSize / 2;
                let targetY = nextY * this.cellSize + this.cellSize / 2;

                // 動畫：衝刺會快一點，走路正常
                const duration = action === 'dash' ? 150 : 300;

                this.tweens.add({
                    targets: this.player,
                    x: targetX, y: targetY,
                    duration: duration, ease: 'Power2'
                });
                
                this.tweens.add({
                    targets: this.playerLabel,
                    x: targetX, y: targetY + 40,
                    duration: duration, ease: 'Power2',
                    onComplete: () => this.time.delayedCall(50, () => resolve())
                });
            } 
            // 處理近戰攻擊
            else if (action === 'attack') {
                let distance = Math.abs(this.playerGridX - this.enemyGridX) + Math.abs(this.playerGridY - this.enemyGridY);
                if (distance <= 1) {
                    const slash = this.add.text(this.enemy.x, this.enemy.y, '⚔️', { fontSize: '64px' }).setOrigin(0.5);
                    this.tweens.add({
                        targets: slash, scale: 1.5, alpha: 0, duration: 200,
                        onComplete: () => {
                            slash.destroy();
                            this.enemy.setTint(0xff0000);
                            this.tweens.add({
                                targets: [this.enemy, this.enemyLabel], 
                                x: '+=8', yoyo: true, repeat: 2, duration: 50,
                                onComplete: () => {
                                    this.enemy.setAlpha(0); 
                                    this.enemyLabel.setAlpha(0);
                                    this.time.delayedCall(200, () => resolve());
                                }
                            });
                        }
                    });
                } else {
                    this.showResult(false, `❌ 攻擊失敗！距離太遠了。`);
                    this.isFailed = true;
                    resolve();
                }
            } 
            // 處理等待
            else if (action === 'wait') {
                this.time.delayedCall(300, () => resolve());
            }
            // 處理特效類 (補血、魔法、射擊等，這邊先給基礎特效防止卡死)
            else if (['heal', 'magic', 'shoot', 'bomb', 'take', 'open'].includes(action)) {
                let icon = action === 'heal' ? '💖' : (action === 'magic' ? '🔥' : '✨');
                const effect = this.add.text(this.player.x, this.player.y - 40, icon, { fontSize: '40px' }).setOrigin(0.5);
                
                this.tweens.add({
                    targets: effect, y: '-=30', alpha: 0, duration: 500,
                    onComplete: () => {
                        effect.destroy();
                        resolve();
                    }
                });
            }
            else {
                // 防呆：如果遇到真的沒寫過的指令，直接跳過以免死機
                console.warn('執行了未實作的指令:', action);
                resolve(); 
            }
        });
    }

    checkVictory() {
        if (this.isFailed) return; // 如果已經撞牆失敗，就不顯示任務完成訊息

        const isSuccess = (this.enemy.alpha === 0);
        const msg = isSuccess
            ? (this.levelConfig?.successMessage || '✨ 任務完成！')
            : '❌ 喔不，怪物還活著！請確認是否走到怪物旁邊並使用 attack()。';
        
        this.showResult(isSuccess, msg);

        if (isSuccess) {
            // 發送事件給 Vue 組件，顯示勝利 Modal
            window.dispatchEvent(new Event('level-win'));
        }
    }

    showResult(isSuccess, text) {
        if(!this.messageBox) return;
        this.messageBox.setText(text);
        this.messageBox.setStyle({ stroke: isSuccess ? '#00d4aa' : '#ff6b6b' });
        this.messageBox.setVisible(true);
    }

    async checkSensor(sensorId) {
        // 加入一點點延遲，讓遊戲看起來有在「思考/偵測」的停頓感
        await new Promise(resolve => this.time.delayedCall(200, resolve));

        switch(sensorId) {
            case 'isWall':
                return this.checkObstacleAhead();
            case 'isEnemy':
                return this.checkEnemyNear();
            case 'isGoal':
                return this.checkIsOnGoal();
            case 'hasKey':
                return !!this.playerData?.hasKey; // 假設你有存 playerData
            case 'lowHp':
                return (this.levelConfig?.player_hp || 100) <= 30;
            default:
                console.warn('未知的感知指令:', sensorId);
                return false;
        }
    }

    // 判斷是否抵達終點 (範例擴充)
    checkIsOnGoal() {
        if (!this.levelConfig || !this.levelConfig.goal) return false;
        return this.playerGridX === this.levelConfig.goal.x && this.playerGridY === this.levelConfig.goal.y;
    }
}