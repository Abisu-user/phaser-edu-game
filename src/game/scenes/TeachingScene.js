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

        // --- 畫網格 ---
        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0x00d4aa, 0.2);
        for (let i = 0; i <= 800; i += this.cellSize) {
            graphics.moveTo(i, 0); graphics.lineTo(i, 800);
            graphics.moveTo(0, i); graphics.lineTo(800, i);
        }
        graphics.strokePath();

        const emojiStyle = {
            fontSize: '56px',
            fontFamily: '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif'
        };

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
        this.playerLabel = this.add.text(this.startX, this.startY + 40, cfg.player.label, { fontSize: '18px', fill: '#f0f0f0', fontFamily: 'sans-serif' }).setOrigin(0.5);
        
        // 讓玩家顯示在最上層
        this.player.setDepth(10);
        this.playerLabel.setDepth(10);

        // --- 設定敵人 ---
        this.enemyGridX = cfg.enemy.gridX;
        this.enemyGridY = cfg.enemy.gridY;
        this.enemyX = this.enemyGridX * this.cellSize + this.cellSize / 2;
        this.enemyY = this.enemyGridY * this.cellSize + this.cellSize / 2;
        
        this.enemy = this.add.text(this.enemyX, this.enemyY, cfg.enemy.emoji, emojiStyle).setOrigin(0.5);
        this.enemyLabel = this.add.text(this.enemyX, this.enemyY + 40, cfg.enemy.label, { fontSize: '18px', fill: '#ff6b6b', fontFamily: 'sans-serif' }).setOrigin(0.5);

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
    async checkObstacleAhead() {
        let nx = this.playerGridX;
        let ny = this.playerGridY;
        if (this.lastFacing === 'moveRight') nx += 1;
        if (this.lastFacing === 'moveLeft') nx -= 1;
        if (this.lastFacing === 'moveUp') ny -= 1;
        if (this.lastFacing === 'moveDown') ny += 1;
        
        // 如果前方是牆壁邊界 (0-9 網格範圍)，也算作障礙物
        if (nx < 0 || nx >= 10 || ny < 0 || ny >= 10) return true;
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
            
            // 記錄方向
            if (action === 'moveRight') { dx = 1; this.lastFacing = action; }
            else if (action === 'moveLeft') { dx = -1; this.lastFacing = action; }
            else if (action === 'moveUp') { dy = -1; this.lastFacing = action; }
            else if (action === 'moveDown') { dy = 1; this.lastFacing = action; }
            
            if (action.startsWith('move')) {
                const nextX = this.playerGridX + dx;
                const nextY = this.playerGridY + dy;

                // 檢查是否撞牆或撞障礙物
                if (nextX < 0 || nextX >= 10 || nextY < 0 || nextY >= 10 || this.isObstacle(nextX, nextY)) {
                    this.showResult(false, '💥 碰！撞到障礙物或牆壁了！');
                    this.isFailed = true; // 標記失敗，阻斷後續指令
                    resolve(); 
                    return;
                }

                this.playerGridX = nextX;
                this.playerGridY = nextY;
                
                let targetX = nextX * this.cellSize + this.cellSize / 2;
                let targetY = nextY * this.cellSize + this.cellSize / 2;

                // 播放移動動畫
                this.tweens.add({
                    targets: this.player,
                    x: targetX, y: targetY,
                    duration: 300, ease: 'Power2'
                });
                
                this.tweens.add({
                    targets: this.playerLabel,
                    x: targetX, y: targetY + 40,
                    duration: 300, ease: 'Power2',
                    onComplete: () => {
                        this.time.delayedCall(50, () => resolve());
                    }
                });
            } 
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
                                    this.enemy.setAlpha(0); // 擊殺敵人
                                    this.enemyLabel.setAlpha(0);
                                    this.time.delayedCall(200, () => resolve());
                                }
                            });
                        }
                    });
                } else {
                    this.showResult(false, `❌ 攻擊失敗！距離太遠了。目前距離 ${distance} 格，近戰需要移動到相鄰一格。`);
                    this.isFailed = true;
                    resolve();
                }
            } else {
                resolve(); // 若遇到無法解析的指令，直接跳過
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
}