import Phaser from 'phaser';

export default class TeachingScene extends Phaser.Scene {

  constructor() {
    super({ key: 'TeachingScene' });
    this.cellSize = 80;
    this.levelConfig = null;
    this.lastFacing = 'moveRight'; 
    this.isFailed = false;         
    this.stepCount = 0;            
    this.labelOffsetY = 28;        
    this.playerData = { hasKey: false }; 
    
    this.usedCommands = new Set();
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

    const cols = cfg.grid_size?.cols || 10;
    const rows = cfg.grid_size?.rows || 10;
    const maxGrid = Math.max(cols, rows);
    this.cellSize = 800 / maxGrid;

    const mapWidth  = cols * this.cellSize;
    const mapHeight = rows * this.cellSize;

    const emojiFontSize = Math.floor(this.cellSize * 0.7) + 'px';
    const labelFontSize = Math.max(10, Math.floor(this.cellSize * 0.22)) + 'px';
    this.labelOffsetY = this.cellSize * 0.35;

    const emojiStyle = { fontSize: emojiFontSize, fontFamily: '"Segoe UI Emoji", "Apple Color Emoji", sans-serif' };
    const labelStyle = { fontSize: labelFontSize, fill: '#f0f0f0', fontFamily: 'sans-serif' };

    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0x00d4aa, 0.2);
    for (let i = 0; i <= mapWidth; i += this.cellSize) {
      graphics.moveTo(i, 0); graphics.lineTo(i, mapHeight);
    }
    for (let j = 0; j <= mapHeight; j += this.cellSize) {
      graphics.moveTo(0, j); graphics.lineTo(mapWidth, j);
    }
    graphics.strokePath();

    if (cfg.obstacles) {
      cfg.obstacles.forEach(obs => {
        const icon = obs.type === 'lava' ? '🔥' : (obs.type === 'wall' ? '🧱' : '🪨');
        const ox = obs.x * this.cellSize + this.cellSize / 2;
        const oy = obs.y * this.cellSize + this.cellSize / 2;
        this.add.text(ox, oy, icon, emojiStyle).setOrigin(0.5);
      });
    }

    if (cfg.key) {
      this.keyGridX = cfg.key.gridX;
      this.keyGridY = cfg.key.gridY;
      const kx = this.keyGridX * this.cellSize + this.cellSize / 2;
      const ky = this.keyGridY * this.cellSize + this.cellSize / 2;
      this.keyIcon = this.add.text(kx, ky, cfg.key.emoji, emojiStyle).setOrigin(0.5);
    }

    if (cfg.goal) {
      this.goalGridX = cfg.goal.gridX;
      this.goalGridY = cfg.goal.gridY;
      const gx = this.goalGridX * this.cellSize + this.cellSize / 2;
      const gy = this.goalGridY * this.cellSize + this.cellSize / 2;
      this.goalIcon = this.add.text(gx, gy, cfg.goal.emoji, emojiStyle).setOrigin(0.5);
    }

    this.playerGridX = cfg.player.gridX;
    this.playerGridY = cfg.player.gridY;
    this.startX = this.playerGridX * this.cellSize + this.cellSize / 2;
    this.startY = this.playerGridY * this.cellSize + this.cellSize / 2;

    this.player = this.add.text(this.startX, this.startY, cfg.player.emoji, emojiStyle).setOrigin(0.5).setDepth(10);
    this.playerLabel = this.add.text(this.startX, this.startY + this.labelOffsetY, cfg.player.label, labelStyle).setOrigin(0.5).setDepth(10);

    this.enemyGridX = cfg.enemy.gridX;
    this.enemyGridY = cfg.enemy.gridY;
    this.enemyX = this.enemyGridX * this.cellSize + this.cellSize / 2;
    this.enemyY = this.enemyGridY * this.cellSize + this.cellSize / 2;

    this.enemy = this.add.text(this.enemyX, this.enemyY, cfg.enemy.emoji, emojiStyle).setOrigin(0.5);
    this.enemyLabel = this.add.text(this.enemyX, this.enemyY + this.labelOffsetY, cfg.enemy.label, { ...labelStyle, fill: '#ff6b6b' }).setOrigin(0.5);

    // 🌟 修正：將訊息框放在正中央 (400, 400)，並將層級 Depth 設為超高，確保不會被遮擋！
    this.messageBox = this.add.text(400, 400, '', {
      fontSize: '22px', fill: '#ffffff', backgroundColor: '#1a1a2e',
      padding: { x: 30, y: 20 }, stroke: '#ff6b6b', strokeThickness: 3, wordWrap: { width: 600 }, align: 'center',
      shadow: { offsetX: 0, offsetY: 5, color: '#000000', blur: 10, fill: true }
    }).setOrigin(0.5).setVisible(false).setDepth(1000);
  }

  resetLevel() {
    this.tweens.killAll();
    this.time.removeAllEvents();
    
    this.playerData.hasKey = false;
    this.usedCommands.clear(); 
    if (this.keyIcon) this.keyIcon.setAlpha(1); 

    this.playerGridX = this.levelConfig.player.gridX;
    this.playerGridY = this.levelConfig.player.gridY;
    this.lastFacing = 'moveRight';
    this.isFailed = false;
    this.stepCount = 0; 

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
    const dist = Math.abs(this.playerGridX - this.enemyGridX) + Math.abs(this.playerGridY - this.enemyGridY);
    return dist <= 1;
  }

  _checkMaxSteps() {
    const maxSteps = this.levelConfig?.restrictions?.maxSteps;
    if (maxSteps && this.stepCount > maxSteps) {
      this.showResult(false, this.levelConfig.failMessages?.maxStepsExceeded || `👣 步數超過 ${maxSteps} 步！請找出更短的路線。`);
      this.isFailed = true;
      return true;
    }
    return false;
  }

  async addCommand(action) {
    this.usedCommands.add(action);
    if (this.isFailed || !this.player) return;

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
            this.showResult(false, '💥 衝刺途中撞到障礙物！');
            this.isFailed = true;
            resolve(); return;
          }
        }

        if (nextX < 0 || nextX >= cols || nextY < 0 || nextY >= rows || this.isObstacle(nextX, nextY)) {
          this.showResult(false, this.levelConfig.failMessages?.hitObstacle || '💥 碰！撞到障礙物或牆壁了！');
          this.isFailed = true;
          resolve(); return;
        }

        this.playerGridX = nextX;
        this.playerGridY = nextY;
        this.stepCount++; 

        if (this.keyIcon && this.keyIcon.alpha > 0 && this.playerGridX === this.keyGridX && this.playerGridY === this.keyGridY) {
          this.playerData.hasKey = true;
          this.keyIcon.setAlpha(0); 
        }

        if (this._checkMaxSteps()) { resolve(); return; }

        const targetX = nextX * this.cellSize + this.cellSize / 2;
        const targetY = nextY * this.cellSize + this.cellSize / 2;
        const duration = action === 'dash' ? 150 : 300;

        this.tweens.add({ targets: this.player, x: targetX, y: targetY, duration, ease: 'Power2' });
        this.tweens.add({
          targets: this.playerLabel, x: targetX, y: targetY + this.labelOffsetY, duration, ease: 'Power2',
          onComplete: () => this.time.delayedCall(50, () => resolve())
        });
      }
      else if (action === 'attack') {
        const distance = Math.abs(this.playerGridX - this.enemyGridX) + Math.abs(this.playerGridY - this.enemyGridY);
        if (distance <= 1 && this.enemy.alpha > 0) {
          const slash = this.add.text(this.enemy.x, this.enemy.y, '⚔️', { fontSize: '64px' }).setOrigin(0.5);
          this.tweens.add({
            targets: slash, scale: 1.5, alpha: 0, duration: 200,
            onComplete: () => {
              slash.destroy();
              this.enemy.setTint(0xff0000);
              this.tweens.add({
                targets: [this.enemy, this.enemyLabel], x: '+=8', yoyo: true, for: 2, duration: 50,
                onComplete: () => {
                  this.enemy.setAlpha(0);
                  this.enemyLabel.setAlpha(0);
                  this.time.delayedCall(200, () => resolve());
                }
              });
            }
          });
        } else {
          this.showResult(false, this.levelConfig.failMessages?.tooFar || '❌ 攻擊失敗！距離太遠或目標不存在。');
          this.isFailed = true; 
          resolve();
        }
      }
      else if (action === 'wait') {
        this.time.delayedCall(300, () => resolve());
      }
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

  // ==========================================
  // 🌟 智慧勝利判定
  // ==========================================
  checkVictory(rawCode = '') {
    if (this.isFailed) return false;

    let isSuccess = true;
    let failMsgs = []; 

    let vcs = this.levelConfig?.victoryCondition || ['kill_enemy'];
    if (typeof vcs === 'string') { try { vcs = JSON.parse(vcs); } catch(e){} }
    if (!Array.isArray(vcs)) {
      if (vcs === 'key_and_goal') vcs = ['get_key', 'reach_goal'];
      else vcs = [vcs];
    }

    let reqCmds = this.levelConfig?.requiredCommand || [];
    if (typeof reqCmds === 'string') { try { reqCmds = JSON.parse(reqCmds); } catch(e){} }
    if (!Array.isArray(reqCmds)) reqCmds = [reqCmds];

    if (vcs.includes('kill_enemy')) {
      if (this.enemy && this.enemy.alpha > 0) { isSuccess = false; failMsgs.push('怪物還活著 (需進行攻擊)'); }
    }
    if (vcs.includes('reach_goal')) {
      if (!this.checkIsOnGoal()) { isSuccess = false; failMsgs.push('未抵達終點之門'); }
    }
    if (vcs.includes('get_key')) {
      if (!this.playerData.hasKey) { isSuccess = false; failMsgs.push('必須取得地圖上的鑰匙'); }
    }

    if (reqCmds.length > 0) {
      // 🌟 給予好讀的中文提示
      const cmdLabels = { 'for': '迴圈 (for)', 'while': '條件迴圈 (while)', 'if': '判斷式 (if)' };
      reqCmds.forEach(cmd => {
        if (!cmd || cmd.trim() === '') return;
        const codeHasCommand = rawCode.includes(cmd) || this.usedCommands.has(cmd);
        if (!codeHasCommand) {
          isSuccess = false;
          failMsgs.push(`未使用「${cmdLabels[cmd] || cmd}」相關積木`);
        }
      });
    }

    if (!isSuccess) {
      this.isFailed = true; 
      const errorText = '❌ 任務未達成：\n' + failMsgs.map(m => ' 🔸 ' + m).join('\n');
      this.showResult(false, errorText);
      return false; 
    } else {
      this.showResult(true, this.levelConfig?.successMessage || '✨ 所有條件達成，任務完成！');
      window.dispatchEvent(new Event('level-win'));
      return true; 
    }
  }

  showResult(isSuccess, text) {
    if (!this.messageBox) return;
    this.messageBox.setText(text);
    
    // 🌟 改變背景色與邊框來增強警示效果
    this.messageBox.setStyle({ 
      stroke: isSuccess ? '#00d4aa' : '#ff6b6b',
      backgroundColor: isSuccess ? 'rgba(0, 50, 30, 0.95)' : 'rgba(50, 10, 20, 0.95)'
    });
    this.messageBox.setVisible(true);

    // 🌟 彈跳動畫，保證玩家一定會看到
    this.messageBox.setScale(0.8);
    this.tweens.add({
      targets: this.messageBox,
      scale: 1,
      duration: 300,
      ease: 'Back.out'
    });
  }

  async checkSensor(sensorId) {
    await new Promise(resolve => this.time.delayedCall(200, resolve));
    switch (sensorId) {
      case 'isWall':
      case 'isObstacleAhead': return this.checkObstacleAhead();
      case 'isEnemy':
      case 'isEnemyNear':     return this.checkEnemyNear();
      case 'isGoal':          return this.checkIsOnGoal();
      case 'hasKey':          return !!this.playerData?.hasKey;
      case 'lowHp':           return false; 
      default:
        console.warn('未知的感知指令:', sensorId);
        return false;
    }
  }

  checkIsOnGoal() {
    if (!this.goalGridX && this.goalGridX !== 0) return false;
    return this.playerGridX === this.goalGridX && this.playerGridY === this.goalGridY;
  }
}