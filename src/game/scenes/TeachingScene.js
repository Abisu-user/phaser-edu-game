import Phaser from 'phaser';

export default class TeachingScene extends Phaser.Scene {
    
    constructor() {
        super({ key: 'TeachingScene' });
        this.actionQueue = [];
        this.isExecuting = false;
        this.cellSize = 80;
        this.levelConfig = null;
    }

    init(data) {
        // 修正 Bug 1: 防護 data 為 undefined 的情況
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

        // --- 設定玩家 ---
        this.playerGridX = cfg.player.gridX;
        this.playerGridY = cfg.player.gridY;
        this.currentGridX = this.playerGridX;
        this.currentGridY = this.playerGridY;
        
        this.startX = this.playerGridX * this.cellSize + this.cellSize / 2;
        this.startY = this.playerGridY * this.cellSize + this.cellSize / 2;
        
        this.player = this.add.text(this.startX, this.startY, cfg.player.emoji, emojiStyle).setOrigin(0.5);
        this.playerLabel = this.add.text(this.startX, this.startY + 40, cfg.player.label, { fontSize: '18px', fill: '#f0f0f0', fontFamily: 'sans-serif' }).setOrigin(0.5);

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
    }

    addCommand(type, lineIdx) {
        // 現在佇列裡存的是物件：{ type: 'move_right', lineIdx: 1 }
        this.actionQueue.push({ type, lineIdx });
    }

    resetLevel() {
        // 修正 Bug 2: 砍掉所有正在跑的動畫與計時器，避免玩家狂按執行導致角色亂飛
        this.tweens.killAll();
        this.time.removeAllEvents();

        this.currentGridX = this.playerGridX;
        this.currentGridY = this.playerGridY;
        
        if (this.player) {
            this.player.setPosition(this.startX, this.startY);
            this.playerLabel.setPosition(this.startX, this.startY + 40);
        }
        
        this.actionQueue = [];
        this.isExecuting = false;
        if (this.messageBox) this.messageBox.setVisible(false);
        
        if (this.enemy) {
            this.enemy.setAlpha(1);
            this.enemy.clearTint();
            this.enemy.setPosition(this.enemyX, this.enemyY);
            this.enemy.scale = 1;
        }
    }

    runCommands(onLineUpdate, onComplete) {
        if (this.isExecuting) return;
        
        this._onLineUpdate = onLineUpdate;
        this._onComplete = onComplete;

        if (this.actionQueue.length === 0) {
            this.showResult(false, '❌ 喔不，沒有指令！請點擊右側指令拼圖。');
            if (this._onComplete) { this._onComplete(false); this._onComplete = null; }
            return;
        }
        
        this.isExecuting = true;
        this.processNextCommand();
    }

    movePlayerToGrid(targetGridX, targetGridY) {
        if (targetGridX < 0 || targetGridX >= 10 || targetGridY < 0 || targetGridY >= 10) {
            this.showResult(false, '❌ 角色撞到牆壁出界了！');
            this.isExecuting = false;
            this.actionQueue = [];
            if (this._onComplete) { this._onComplete(false); this._onComplete = null; }
            return;
        }

        this.currentGridX = targetGridX;
        this.currentGridY = targetGridY;

        let targetX = targetGridX * this.cellSize + this.cellSize / 2;
        let targetY = targetGridY * this.cellSize + this.cellSize / 2;

        this.tweens.add({
            targets: this.player,
            x: targetX, y: targetY,
            duration: 300, ease: 'Power2',
        });
        this.tweens.add({
            targets: this.playerLabel,
            x: targetX, y: targetY + 40,
            duration: 300, ease: 'Power2',
            onComplete: () => {
                this.time.delayedCall(100, () => this.processNextCommand());
            }
        });
    }

    processNextCommand() {
        if (this.actionQueue.length === 0) {
            this.isExecuting = false;
            this.checkVictory();
            return;
        }

        // 修正 Bug 3: 正確解析物件
        const cmdObj = this.actionQueue.shift();
        
        if (this._onLineUpdate && cmdObj.lineIdx !== -1) {
            this._onLineUpdate(cmdObj.lineIdx); // 觸發 Vue 行號亮起
        }

        const command = cmdObj.type;

        if (command === 'move_right') this.movePlayerToGrid(this.currentGridX + 1, this.currentGridY);
        else if (command === 'move_left') this.movePlayerToGrid(this.currentGridX - 1, this.currentGridY);
        else if (command === 'move_up') this.movePlayerToGrid(this.currentGridX, this.currentGridY - 1);
        else if (command === 'move_down') this.movePlayerToGrid(this.currentGridX, this.currentGridY + 1);
        
        else if (command === 'attack') {
            let distance = Math.abs(this.currentGridX - this.enemyGridX) + Math.abs(this.currentGridY - this.enemyGridY);

            if (distance === 1) {
                const slash = this.add.text(this.enemy.x, this.enemy.y, '⚔️', { fontSize: '64px' }).setOrigin(0.5);
                this.tweens.add({
                    targets: slash, scale: 1.5, alpha: 0, duration: 200,
                    onComplete: () => {
                        slash.destroy();
                        this.enemy.setTint(0xff0000);
                        this.tweens.add({
                            targets: this.enemy, x: this.enemy.x + 8, yoyo: true, repeat: 2, duration: 50,
                            onComplete: () => {
                                this.enemy.setAlpha(0);
                                this.time.delayedCall(200, () => this.processNextCommand());
                            }
                        });
                    }
                });
            } else {
                this.showResult(false, `❌ 攻擊失敗！距離太遠了。目前距離 ${distance} 格，近戰需要移動到相鄰一格。`);
                this.isExecuting = false;
                this.actionQueue = [];
                if (this._onComplete) { this._onComplete(false); this._onComplete = null; }
            }
        }
    }

    checkVictory() {
        const isSuccess = this.enemy.alpha === 0;
        const msg = isSuccess
            ? (this.levelConfig?.successMessage || '✨ 任務完成！')
            : '❌ 喔不，怪物還活著！請確認是否走到怪物旁邊並使用 attack();。';
        
        this.showResult(isSuccess, msg);

        if (isSuccess) {
            window.dispatchEvent(new Event('level-win'));
        }

        if (this._onComplete) { this._onComplete(isSuccess); this._onComplete = null; }
    }

    showResult(isSuccess, text) {
        if(!this.messageBox) return;
        this.messageBox.setText(text);
        this.messageBox.setStyle({ stroke: isSuccess ? '#00d4aa' : '#ff6b6b' });
        this.messageBox.setVisible(true);
    }
}