import Phaser from 'phaser';

export default class TeachingScene extends Phaser.Scene {

  constructor() {
    super({ key: 'TeachingScene' });
    this.cellSize = 80;
    this.levelConfig = null;
    this.lastFacing = 'moveRight'; // 記錄玩家最後朝向，供感應器使用
    this.isFailed = false;         // 紀錄是否已經撞牆失敗
    this.stepCount = 0;            // 記錄目前已走步數
    this.labelOffsetY = 28;        // 統一管理標籤偏移，不再寫死
    this.playerData = { hasKey: false }; // 初始化玩家資料
    
    // 🌟 新增：生命值相關變數
    this.maxHearts = 3;
    this.currentHearts = 3;
    this.heartsUI = []; 
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

    // 1. 動態計算網格與格子大小
    const cols = cfg.grid_size?.cols || 10;
    const rows = cfg.grid_size?.rows || 10;
    const maxGrid = Math.max(cols, rows);
    this.cellSize = 800 / maxGrid;

    const mapWidth  = cols * this.cellSize;
    const mapHeight = rows * this.cellSize;

    // 2. 根據格子大小動態縮放 Emoji 與文字比例
    const emojiFontSize = Math.floor(this.cellSize * 0.7) + 'px';
    const labelFontSize = Math.max(10, Math.floor(this.cellSize * 0.22)) + 'px';

    this.labelOffsetY = this.cellSize * 0.35;

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
    for (let i = 0; i <= mapWidth; i += this.cellSize) {
      graphics.moveTo(i, 0); graphics.lineTo(i, mapHeight);
    }
    for (let j = 0; j <= mapHeight; j += this.cellSize) {
      graphics.moveTo(0, j); graphics.lineTo(mapWidth, j);
    }
    graphics.strokePath();

    // --- 繪製障礙物 ---
    if (cfg.obstacles) {
      cfg.obstacles.forEach(obs => {
        const icon = obs.type === 'lava' ? '🔥' : (obs.type === 'wall' ? '🧱' : '🪨');
        const ox = obs.x * this.cellSize + this.cellSize / 2;
        const oy = obs.y * this.cellSize + this.cellSize / 2;
        this.add.text(ox, oy, icon, emojiStyle).setOrigin(0.5);
      });
    }

    // --- 設定玩家 ---
    this.playerGridX = cfg.player.gridX;
    this.playerGridY = cfg.player.gridY;
    this.startX = this.playerGridX * this.cellSize + this.cellSize / 2;
    this.startY = this.playerGridY * this.cellSize + this.cellSize / 2;

    this.player = this.add.text(this.startX, this.startY, cfg.player.emoji, emojiStyle).setOrigin(0.5);
    this.playerLabel = this.add.text(
      this.startX, this.startY + this.labelOffsetY, cfg.player.label, labelStyle
    ).setOrigin(0.5);
    this.player.setDepth(10);
    this.playerLabel.setDepth(10);

    // --- 設定敵人 ---
    this.enemyGridX = cfg.enemy.gridX;
    this.enemyGridY = cfg.enemy.gridY;
    this.enemyX = this.enemyGridX * this.cellSize + this.cellSize / 2;
    this.enemyY = this.enemyGridY * this.cellSize + this.cellSize / 2;

    this.enemy = this.add.text(this.enemyX, this.enemyY, cfg.enemy.emoji, emojiStyle).setOrigin(0.5);
    this.enemyLabel = this.add.text(
      this.enemyX, this.enemyY + this.labelOffsetY,
      cfg.enemy.label,
      { ...labelStyle, fill: '#ff6b6b' }
    ).setOrigin(0.5);

    // --- 訊息框 ---
    const msgY = mapHeight + 40;
    this.messageBox = this.add.text(mapWidth / 2, msgY, '', {
      fontSize: '18px',
      fill: '#fff',
      backgroundColor: 'rgba(20, 20, 40, 0.95)',
      padding: { x: 16, y: 10 },
      stroke: '#ff6b6b',
      strokeThickness: 2,
      wordWrap: { width: mapWidth - 40 }
    }).setOrigin(0.5).setVisible(false);
    this.messageBox.setDepth(20);

  }

  // ==========================================
  // 重置關卡
  // ==========================================
  resetLevel() {
    this.tweens.killAll();
    this.time.removeAllEvents();

    this.playerGridX = this.levelConfig.player.gridX;
    this.playerGridY = this.levelConfig.player.gridY;
    this.lastFacing = 'moveRight';
    this.isFailed = false;
    this.stepCount = 0;

    // 🌟 恢復生命值 UI
    this.currentHearts = this.maxHearts;
    this.heartsUI.forEach(heart => heart.setAlpha(1)); // 把變半透明的愛心恢復

    if (this.player) {
      this.player.setPosition(this.startX, this.startY);
      this.playerLabel.setPosition(this.startX, this.startY + this.labelOffsetY);
    }

    if (this.messageBox) this.messageBox.setVisible(false);

    if (this.enemy) {
      this.enemy.setAlpha(1);
      this.enemy.clearTint();
      this.enemy.setPosition(this.enemyX, this.enemyY);
      this.enemy.setScale(1);
      this.enemyLabel.setAlpha(1);
      this.enemyLabel.setPosition(this.enemyX, this.enemyY + this.labelOffsetY);
    }
  }

  // ==========================================
  // 遊戲核心邏輯
  // ==========================================

  isObstacle(x, y) {
    if (!this.levelConfig?.obstacles) return false;
    return this.levelConfig.obstacles.some(ob => ob.x === x && ob.y === y);
  }

  checkObstacleAhead() {
    const cols = this.levelConfig?.grid_size?.cols || 10;
    const rows = this.levelConfig?.grid_size?.rows || 10;
    let nx = this.playerGridX;
    let ny = this.playerGridY;

    if (this.lastFacing === 'moveRight') nx += 1;
    else if (this.lastFacing === 'moveLeft')  nx -= 1;
    else if (this.lastFacing === 'moveUp')    ny -= 1;
    else if (this.lastFacing === 'moveDown')  ny += 1;

    if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) return true;
    return this.isObstacle(nx, ny);
  }

  checkEnemyNear() {
    if (!this.enemy || this.enemy.alpha === 0) return false; 
    const dist = Math.abs(this.playerGridX - this.enemyGridX)
               + Math.abs(this.playerGridY - this.enemyGridY);
    return dist <= 1;
  }

  _checkMaxSteps() {
    const maxSteps = this.levelConfig?.restrictions?.maxSteps;
    if (maxSteps && this.stepCount > maxSteps) {
      const msg = this.levelConfig.failMessages?.maxStepsExceeded
        || `👣 步數超過 ${maxSteps} 步！請找出更短的路線。`;
      this.showResult(false, msg);
      this.isFailed = true;
      return true;
    }
    return false;
  }

  // 🌟 新增：扣血邏輯
  takeDamage() {
    if (this.currentHearts > 0) {
      this.currentHearts--;
      // 將最後一顆心變為半透明 (或者你可以換成 🖤 emoji)
      this.heartsUI[this.currentHearts].setAlpha(0.2); 
    }
    
    // 檢查是否死亡
    if (this.currentHearts <= 0) {
      this.isFailed = true;
    }
  }

  async addCommand(action) {
    if (this.isFailed || !this.player || this.enemy.alpha === 0) return;

    const forbidden = this.levelConfig?.restrictions?.forbidden || [];
    if (forbidden.includes(action)) {
      this.showResult(false, `🚫 這個指令在本關被禁用！`);
      this.isFailed = true;
      return;
    }

    return new Promise((resolve) => {
      let dx = 0, dy = 0;
      const cols = this.levelConfig?.grid_size?.cols || 10;
      const rows = this.levelConfig?.grid_size?.rows || 10;

      // --- 移動類 ---
      if (['moveRight', 'moveLeft', 'moveUp', 'moveDown', 'dash'].includes(action)) {
        if (action !== 'dash') this.lastFacing = action;

        const step = action === 'dash' ? 2 : 1;
        if (this.lastFacing === 'moveRight') dx =  step;
        else if (this.lastFacing === 'moveLeft')  dx = -step;
        else if (this.lastFacing === 'moveUp')    dy = -step;
        else if (this.lastFacing === 'moveDown')  dy =  step;

        const nextX = this.playerGridX + dx;
        const nextY = this.playerGridY + dy;

        if (action === 'dash') {
          const midX = this.playerGridX + dx / 2;
          const midY = this.playerGridY + dy / 2;
          if (this.isObstacle(midX, midY)) {
            // 🌟 衝刺撞牆：扣血並判斷是否死亡
            this.takeDamage();
            if (this.isFailed) {
               this.showResult(false, '💥 衝刺途中撞到障礙物！生命值歸零。');
            } else {
               // 這裡可以選擇不直接失敗，而是回到原地或中斷這個指令
               this.showResult(false, `💥 撞到了！剩餘生命: ${this.currentHearts}`);
            }
            resolve();
            return;
          }
        }

        if (nextX < 0 || nextX >= cols || nextY < 0 || nextY >= rows || this.isObstacle(nextX, nextY)) {
          // 🌟 一般移動撞牆：扣血並判斷是否死亡
          this.takeDamage();
          if (this.isFailed) {
            const msg = this.levelConfig.failMessages?.hitObstacle || '💥 碰！撞到障礙物，生命值歸零！';
            this.showResult(false, msg);
          } else {
            this.showResult(false, `💥 碰！剩餘生命: ${this.currentHearts}`);
          }
          resolve();
          return;
        }

        this.playerGridX = nextX;
        this.playerGridY = nextY;
        this.stepCount++; 

        if (this._checkMaxSteps()) { resolve(); return; }

        const targetX = nextX * this.cellSize + this.cellSize / 2;
        const targetY = nextY * this.cellSize + this.cellSize / 2;
        const duration = action === 'dash' ? 150 : 300;

        this.tweens.add({ targets: this.player, x: targetX, y: targetY, duration, ease: 'Power2' });
        this.tweens.add({
          targets: this.playerLabel,
          x: targetX,
          y: targetY + this.labelOffsetY,
          duration,
          ease: 'Power2',
          onComplete: () => this.time.delayedCall(50, () => resolve())
        });
      }
      // --- 近戰攻擊 ---
      else if (action === 'attack') {
        const distance = Math.abs(this.playerGridX - this.enemyGridX)
                       + Math.abs(this.playerGridY - this.enemyGridY);
        if (distance <= 1) {
          const slash = this.add.text(this.enemy.x, this.enemy.y, '⚔️', { fontSize: '64px' }).setOrigin(0.5);
          this.tweens.add({
            targets: slash, scale: 1.5, alpha: 0, duration: 200,
            onComplete: () => {
              slash.destroy();
              this.enemy.setTint(0xff0000);
              this.tweens.add({
                targets: [this.enemy, this.enemyLabel],
                x: '+=8', yoyo: true, for: 2, duration: 50,
                onComplete: () => {
                  this.enemy.setAlpha(0);
                  this.enemyLabel.setAlpha(0);
                  this.time.delayedCall(200, () => resolve());
                }
              });
            }
          });
        } else {
          const msg = this.levelConfig.failMessages?.tooFar || '❌ 攻擊失敗！距離太遠了。';
          this.showResult(false, msg);
          // 這裡可以決定揮空要不要扣血，目前維持原本邏輯：直接失敗
          this.isFailed = true; 
          resolve();
        }
      }
      // --- 等待 ---
      else if (action === 'wait') {
        this.time.delayedCall(300, () => resolve());
      }
      // --- 特效類 ---
      else if (['heal', 'magic', 'shoot', 'bomb', 'take', 'open'].includes(action)) {
        const iconMap = { heal: '💖', magic: '🔥', shoot: '🏹', bomb: '💣', take: '🤏', open: '🚪' };
        const icon = iconMap[action] || '✨';
        const effect = this.add.text(this.player.x, this.player.y - 40, icon, { fontSize: '40px' }).setOrigin(0.5);
        this.tweens.add({
          targets: effect, y: '-=30', alpha: 0, duration: 500,
          onComplete: () => { effect.destroy(); resolve(); }
        });
      }
      else {
        console.warn('執行了未實作的指令:', action);
        resolve();
      }
    });
  }

  checkVictory() {
    if (this.isFailed) return;

    const isSuccess = (this.enemy.alpha === 0);
    const msg = isSuccess
      ? (this.levelConfig?.successMessage || '✨ 任務完成！')
      : '❌ 喔不，怪物還活著！請確認是否走到怪物旁邊並使用 attack()。';

    this.showResult(isSuccess, msg);

    if (isSuccess) {
      window.dispatchEvent(new Event('level-win'));
    }
  }

  showResult(isSuccess, text) {
    if (!this.messageBox) return;
    this.messageBox.setText(text);
    this.messageBox.setStyle({ stroke: isSuccess ? '#00d4aa' : '#ff6b6b' });
    this.messageBox.setVisible(true);
  }

  async checkSensor(sensorId) {
    await new Promise(resolve => this.time.delayedCall(200, resolve));

    switch (sensorId) {
      case 'isWall':
      case 'isObstacleAhead':
        return this.checkObstacleAhead();

      case 'isEnemy':
      case 'isEnemyNear':
        return this.checkEnemyNear();

      case 'isGoal':
        return this.checkIsOnGoal();

      case 'hasKey':
        return !!this.playerData?.hasKey;

      case 'lowHp':
        // 🌟 更新 lowHp 的判斷邏輯，改為目前的生命值判斷
        return this.currentHearts <= 1;

      default:
        console.warn('未知的感知指令:', sensorId);
        return false;
    }
  }

  checkIsOnGoal() {
    const goal = this.levelConfig?.goalPosition;
    if (!goal) return false;
    return this.playerGridX === goal.x && this.playerGridY === goal.y;
  }
}