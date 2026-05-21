import Phaser from 'phaser';

export default class TeachingScene extends Phaser.Scene {

  constructor() {
    super({ key: 'TeachingScene' });
    this.cellSize = 80;
    this.levelConfig = null;
    this.lastFacing = 'moveRight'; // 記錄玩家最後朝向，供感應器使用
    this.isFailed = false;         // 紀錄是否已經撞牆失敗
    this.stepCount = 0;            // [新增] 記錄目前已走步數
    this.labelOffsetY = 28;        // [修正] 統一管理標籤偏移，不再寫死
    this.playerData = { hasKey: false }; // [修正] 初始化玩家資料，避免 hasKey 感知器崩潰
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

    // [修正] 將 labelOffsetY 存為實例變數，resetLevel 共用
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
    // [修正] y 座標改為動態：地圖底部再往下一點，避免覆蓋格子
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
    this.playerData.hasKey = false;
    this.usedCommands.clear(); 
    if (this.keyIcon) {
      this.keyIcon.setAlpha(1); 
    }

    this.playerGridX = this.levelConfig.player.gridX;
    this.playerGridY = this.levelConfig.player.gridY;
    this.lastFacing = 'moveRight';
    this.isFailed = false;
    this.stepCount = 0; // [新增] 重置步數計數器

    if (this.player) {
      this.player.setPosition(this.startX, this.startY);
      // [修正] 使用 this.labelOffsetY 取代寫死的 40
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

  // 判斷某座標是否有障礙物
  isObstacle(x, y) {
    if (!this.levelConfig?.obstacles) return false;
    return this.levelConfig.obstacles.some(ob => ob.x === x && ob.y === y);
  }

  // 感知指令：檢查前方是否有障礙物或超出邊界
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

  // 感知指令：檢查敵人是否在周圍一格內
  checkEnemyNear() {
    if (!this.enemy || this.enemy.alpha === 0) return false; // 敵人已死
    const dist = Math.abs(this.playerGridX - this.enemyGridX)
               + Math.abs(this.playerGridY - this.enemyGridY);
    return dist <= 1;
  }

  // [新增] 檢查是否超出步數限制，超出時觸發失敗
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

  // 執行單一指令，回傳 Promise 讓 Blockly 等待動畫
  async addCommand(action) {
    this.usedCommands.add(action);
    if (this.isFailed || !this.player || this.enemy.alpha === 0) return;

    // [新增] forbidden 指令防呆（對應 restrictions.forbidden 陣列）
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
        // 更新朝向（dash 維持上一個方向）
        if (action !== 'dash') this.lastFacing = action;

        // 計算位移
        const step = action === 'dash' ? 2 : 1;
        if (this.lastFacing === 'moveRight') dx =  step;
        else if (this.lastFacing === 'moveLeft')  dx = -step;
        else if (this.lastFacing === 'moveUp')    dy = -step;
        else if (this.lastFacing === 'moveDown')  dy =  step;

        const nextX = this.playerGridX + dx;
        const nextY = this.playerGridY + dy;

        // dash 時中途格也要檢查（移動 2 格時先驗中間格）
        if (action === 'dash') {
          const midX = this.playerGridX + dx / 2;
          const midY = this.playerGridY + dy / 2;
          if (this.isObstacle(midX, midY)) {
            this.showResult(false, '💥 衝刺途中撞到障礙物！');
            this.isFailed = true;
            resolve();
            return;
          }
        }

        // 撞牆判定
        if (nextX < 0 || nextX >= cols || nextY < 0 || nextY >= rows || this.isObstacle(nextX, nextY)) {
          const msg = this.levelConfig.failMessages?.hitObstacle || '💥 碰！撞到障礙物或牆壁了！';
          this.showResult(false, msg);
          this.isFailed = true;
          resolve();
          return;
        }

        this.playerGridX = nextX;
        this.playerGridY = nextY;
        this.stepCount++; // [新增] 移動才算步數

        // 步數限制檢查
        if (this._checkMaxSteps()) { resolve(); return; }

        const targetX = nextX * this.cellSize + this.cellSize / 2;
        const targetY = nextY * this.cellSize + this.cellSize / 2;
        const duration = action === 'dash' ? 150 : 300;

        this.tweens.add({ targets: this.player, x: targetX, y: targetY, duration, ease: 'Power2' });
        this.tweens.add({
          targets: this.playerLabel,
          x: targetX,
          y: targetY + this.labelOffsetY, // [修正] 使用 this.labelOffsetY
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
    // 短暫延遲，讓玩家感受到「偵測」的停頓感
    await new Promise(resolve => this.time.delayedCall(200, resolve));

    switch (sensorId) {
      // [修正] isWall 是標準名稱，isObstacleAhead 保留為相容別名
      case 'isWall':
      case 'isObstacleAhead':
        return this.checkObstacleAhead();

      // [修正] isEnemy 是標準名稱，isEnemyNear 保留為相容別名
      case 'isEnemy':
      case 'isEnemyNear':
        return this.checkEnemyNear();

      case 'isGoal':
        return this.checkIsOnGoal();

      case 'hasKey':
        return !!this.playerData?.hasKey; // [修正] playerData 現在已正確初始化

      case 'lowHp':
        return (this.levelConfig?.player_hp ?? 100) <= 30;

      default:
        console.warn('未知的感知指令:', sensorId);
        return false;
    }
  }

  // 判斷是否抵達終點（需要關卡設定 goalPosition: { x, y }）
  checkIsOnGoal() {
    // [修正] 使用 goalPosition（明確的座標欄位），不與 goals（字串陣列）混淆
    const goal = this.levelConfig?.goalPosition;
    if (!goal) return false;
    return this.playerGridX === goal.x && this.playerGridY === goal.y;
  }
}

// --- 繪製鑰匙 ---
    if (cfg.key) {
      this.keyGridX = cfg.key.gridX;
      this.keyGridY = cfg.key.gridY;
      const kx = this.keyGridX * this.cellSize + this.cellSize / 2;
      const ky = this.keyGridY * this.cellSize + this.cellSize / 2;
      this.keyIcon = this.add.text(kx, ky, cfg.key.emoji, emojiStyle).setOrigin(0.5);
    }

    // --- 繪製終點門 ---
    if (cfg.goal) {
      this.goalGridX = cfg.goal.gridX;
      this.goalGridY = cfg.goal.gridY;
      const gx = this.goalGridX * this.cellSize + this.cellSize / 2;
      const gy = this.goalGridY * this.cellSize + this.cellSize / 2;
      this.goalIcon = this.add.text(gx, gy, cfg.goal.emoji, emojiStyle).setOrigin(0.5);
    }

    this.usedCommands = new Set();