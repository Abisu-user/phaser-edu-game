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

    // 🌟 智慧型多功能射擊指令
    window.shoot = async (arg1, arg2) => {
      this.usedCommands.add('shoot'); 

      if (typeof arg1 === 'function') {
        await this.executeProgrammableShoot(arg1); 
      } 
      else if (typeof arg1 === 'number') {
        const dx = arg1;
        const dy = typeof arg2 === 'number' ? arg2 : 0; 
        await this.executeProgrammableShoot(dx, dy);
      }
      else {
        let defDx = 1, defDy = 0;
        if (this.lastFacing === 'moveLeft') { defDx = -1; defDy = 0; }
        else if (this.lastFacing === 'moveUp') { defDx = 0; defDy = -1; }
        else if (this.lastFacing === 'moveDown') { defDx = 0; defDy = 1; }
        await this.executeProgrammableShoot(defDx, defDy);
      }
    };

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

    this.messageBox = this.add.text(400, 780, '', {
      fontSize: '20px', fill: '#ffffff', backgroundColor: 'rgba(50, 10, 20, 0.95)',
      padding: { x: 30, y: 15 }, stroke: '#ff6b6b', strokeThickness: 2, 
      wordWrap: { width: 600 }, align: 'center', shadow: { offsetX: 0, offsetY: 4, color: '#000000', blur: 8, fill: true }
    }).setOrigin(0.5, 1).setVisible(false).setDepth(1000);
  }

  async executeProgrammableShoot(arg1, arg2) {
    if (this.isFailed || !this.player) return;

    const startX = this.playerGridX;
    const startY = this.playerGridY;
    const targetX = startX * this.cellSize + this.cellSize / 2;
    const targetY = startY * this.cellSize + this.cellSize / 2;
    const arrow = this.add.text(targetX, targetY, '🏹', { fontSize: this.cellSize * 0.5 + 'px' }).setOrigin(0.5).setDepth(15);
    
    if (this.lastFacing === 'moveUp') arrow.angle = -90;
    else if (this.lastFacing === 'moveDown') arrow.angle = 90;
    else if (this.lastFacing === 'moveLeft') { arrow.angle = 0; arrow.setFlipX(true); }
    else { arrow.angle = 0; arrow.setFlipX(false); }

    const scene = this;
    let path = []; 

    if (typeof arg1 === 'function') {
      class ProgrammableProjectile {
        constructor(sx, sy, facing) {
          this.gridX = sx;
          this.gridY = sy;
          this.facing = facing;
          this.path = []; 
          this.isDestroyed = false;
          this.safetyCount = 0;
        }

        // 🌟 終極安全機制：只要箭矢死亡，強制拋出錯誤來中斷玩家的 while 迴圈！
        checkSafety() {
          this.safetyCount++;
          if (this.safetyCount > 200) { 
            throw new Error('INFINITE_LOOP_DETECTED'); 
          }
          if (this.isDestroyed) {
            throw new Error('PROJECTILE_DESTROYED'); // 安靜地打斷迴圈
          }
        }

        isWall() {
          this.checkSafety();
          let nx = this.gridX, ny = this.gridY;
          if (this.facing === 'moveRight') nx++;
          else if (this.facing === 'moveLeft') nx--;
          else if (this.facing === 'moveUp') ny--;
          else if (this.facing === 'moveDown') ny++;

          const cols = scene.levelConfig?.grid_size?.cols || 10;
          const rows = scene.levelConfig?.grid_size?.rows || 10;
          if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) return true;
          return scene.isObstacle(nx, ny);
        }

        isEnemy() {
          this.checkSafety();
          let nx = this.gridX, ny = this.gridY;
          if (this.facing === 'moveRight') nx++;
          else if (this.facing === 'moveLeft') nx--;
          else if (this.facing === 'moveUp') ny--;
          else if (this.facing === 'moveDown') ny++;
          return scene.enemyGridX === nx && scene.enemyGridY === ny;
        }

        _move(action, dx, dy) {
          this.checkSafety();
          this.facing = action;
          let nx = this.gridX + dx;
          let ny = this.gridY + dy;

          const cols = scene.levelConfig?.grid_size?.cols || 10;
          const rows = scene.levelConfig?.grid_size?.rows || 10;
          
          if (nx < 0 || nx >= cols || ny < 0 || ny >= rows || scene.isObstacle(nx, ny)) {
            this.path.push({ action: 'explode', x: nx, y: ny });
            this.isDestroyed = true;
            throw new Error('PROJECTILE_DESTROYED'); // 撞牆瞬間中斷腳本！
          }

          this.gridX = nx;
          this.gridY = ny;
          this.path.push({ action, x: nx, y: ny });

          if (scene.enemyGridX === nx && scene.enemyGridY === ny) {
            this.path.push({ action: 'hitEnemy', x: nx, y: ny });
            this.isDestroyed = true;
            throw new Error('PROJECTILE_DESTROYED'); // 打中瞬間中斷腳本！
          }
        }

        moveUp() { this._move('moveUp', 0, -1); }
        moveDown() { this._move('moveDown', 0, 1); }
        moveLeft() { this._move('moveLeft', -1, 0); }
        moveRight() { this._move('moveRight', 1, 0); }
      }

      const p = new ProgrammableProjectile(startX, startY, this.lastFacing);
      try {
        await arg1(p); 
      } catch (e) {
        // 🌟 如果是我們設計的強制中斷，就不印出紅字錯誤，讓一切看起來很自然！
        if (e.message !== 'PROJECTILE_DESTROYED') {
          console.error("箭矢魔法執行錯誤:", e);
        }
      }
      path = p.path; 

      // 🌟 貼心補刀設計：如果學生的迴圈寫得太準確，讓箭矢停在怪物「面前一格」
      // 引擎會自動幫他衝過去完成擊殺！
      if (!p.isDestroyed) {
        let nx = p.gridX, ny = p.gridY;
        if (p.facing === 'moveRight') nx++;
        else if (p.facing === 'moveLeft') nx--;
        else if (p.facing === 'moveUp') ny--;
        else if (p.facing === 'moveDown') ny++;
        
        if (scene.enemyGridX === nx && scene.enemyGridY === ny) {
          path.push({ action: 'hitEnemy', x: nx, y: ny });
        }
      }
    } 
    else if (typeof arg1 === 'number') {
      const dx = arg1;
      const dy = typeof arg2 === 'number' ? arg2 : 0;
      let curX = startX;
      let curY = startY;
      const maxRange = 5; 
      const cols = this.levelConfig?.grid_size?.cols || 10;
      const rows = this.levelConfig?.grid_size?.rows || 10;

      for (let i = 0; i < maxRange; i++) {
        curX += dx;
        curY += dy;

        if (curX < 0 || curX >= cols || curY < 0 || curY >= rows) {
          path.push({ action: 'explode', x: curX, y: curY });
          break;
        }
        if (this.isObstacle(curX, curY)) {
          path.push({ action: 'explode', x: curX, y: curY });
          break;
        }
        if (this.enemyGridX === curX && this.enemyGridY === curY) {
          path.push({ action: 'hitEnemy', x: curX, y: curY });
          break;
        }
        path.push({ action: 'fly', x: curX, y: curY, dx: dx, dy: dy });
      }
    }

    return new Promise(async (resolve) => {
      if (path.length === 0) {
        arrow.destroy();
        resolve();
        return;
      }

      for (const step of path) {
        const tx = step.x * this.cellSize + this.cellSize / 2;
        const ty = step.y * this.cellSize + this.cellSize / 2;

        await new Promise((stepResolve) => {
          if (step.action === 'explode') {
            arrow.setAlpha(0); 
            const boom = this.add.text(arrow.x, arrow.y, '💥', { fontSize: '40px' }).setOrigin(0.5).setDepth(20);
            this.tweens.add({
              targets: boom, alpha: 0, duration: 300,
              onComplete: () => { boom.destroy(); stepResolve(); }
            });
          } 
          else if (step.action === 'hitEnemy') {
            this.tweens.add({
              targets: arrow, x: tx, y: ty, duration: 150,
              onComplete: () => {
                arrow.destroy();
                if (this.enemy && this.enemy.alpha > 0) {
                  const emitter = this.add.particles(this.enemy.x, this.enemy.y, 'magic_particle', {
                    speed: { min: -200, max: 200 }, angle: { min: 0, max: 360 }, scale: { start: 0.5, end: 0 },
                    blendMode: 'ADD', lifespan: 500, quantity: 30
                  });
                  emitter.explode();
                  this.enemy.setTint(0xff0000);
                  
                  this.tweens.add({
                    targets: [this.enemy, this.enemyLabel], x: '+=8', yoyo: true, repeat: 1, duration: 50,
                    onComplete: () => { 
                      this.enemy.setAlpha(0); 
                      this.enemyLabel.setAlpha(0); 
                      stepResolve(); 
                    }
                  });
                } else {
                  stepResolve();
                }
              }
            });
          } 
          else {
            arrow.setFlipX(false);
            let finalDx = step.dx !== undefined ? step.dx : 1;
            let finalDy = step.dy !== undefined ? step.dy : 0;

            if (step.action === 'moveUp') { finalDx = 0; finalDy = -1; }
            else if (step.action === 'moveDown') { finalDx = 0; finalDy = 1; }
            else if (step.action === 'moveLeft') { finalDx = -1; finalDy = 0; }
            else if (step.action === 'moveRight') { finalDx = 1; finalDy = 0; }
            
            arrow.angle = Phaser.Math.RadToDeg(Math.atan2(finalDy, finalDx));
            
            this.tweens.add({
              targets: arrow, x: tx, y: ty, duration: 150, ease: 'Linear',
              onComplete: () => stepResolve()
            });
          }
        });
      }

      if (arrow && arrow.active) arrow.destroy();
      resolve(); 
    });
  }

  resetLevel(hideMessage = true) {
    this.tweens.killAll();
    this.time.removeAllEvents();
    if (this.player) {
      if (typeof this.player.play === 'function') {
        this.player.play('hero-idle');
      }
      if (typeof this.player.setFlipX === 'function') {
        this.player.setFlipX(false);
      }
    }
    
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

    if (hideMessage && this.messageBox) {
      this.messageBox.setVisible(false);
    }

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
    
    if (this.isFailed) {
      throw new Error('LEVEL_FAILED');
    }
    if (!this.player) return;

    const forbidden = this.levelConfig?.restrictions?.forbidden || [];
    if (forbidden.includes(action)) {
      this.showResult(false, `🚫 這個指令在本關被禁用！`);
      this.isFailed = true;
      throw new Error('LEVEL_FAILED');
    }

    return new Promise((resolve, reject) => {
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
            reject(new Error('LEVEL_FAILED')); return;
          }
        }

        if (nextX < 0 || nextX >= cols || nextY < 0 || nextY >= rows || this.isObstacle(nextX, nextY)) {
          this.showResult(false, this.levelConfig.failMessages?.hitObstacle || '💥 碰！撞到障礙物或牆壁了！');
          this.isFailed = true;
          reject(new Error('LEVEL_FAILED')); return; 
        }

        this.playerGridX = nextX;
        this.playerGridY = nextY;
        this.stepCount++; 

        if (this.keyIcon && this.keyIcon.alpha > 0 && this.playerGridX === this.keyGridX && this.playerGridY === this.keyGridY) {
          this.playerData.hasKey = true;
          this.keyIcon.setAlpha(0); 
        }

        if (this._checkMaxSteps()) { reject(new Error('LEVEL_FAILED')); return; }

        const targetX = nextX * this.cellSize + this.cellSize / 2;
        const targetY = nextY * this.cellSize + this.cellSize / 2;
        const duration = action === 'dash' ? 150 : 300;

        if (typeof this.player.play === 'function') {
          this.player.play('hero-walk', true);
        }
        if (typeof this.player.setFlipX === 'function') {
          if (action === 'moveLeft') {
            this.player.setFlipX(true);
          } else if (action === 'moveRight') {
            this.player.setFlipX(false);
          }
        }

        this.tweens.add({ targets: this.player, x: targetX, y: targetY, duration, ease: 'Power2' });
        this.tweens.add({
          targets: this.playerLabel, x: targetX, y: targetY + this.labelOffsetY, duration, ease: 'Power2',
          onComplete: () => {
            if (typeof this.player.play === 'function') {
              this.player.play('hero-idle');
            }
            this.time.delayedCall(50, () => resolve());
          }
        });
      }
      else if (action === 'attack') {
        const distance = Math.abs(this.playerGridX - this.enemyGridX) + Math.abs(this.playerGridY - this.enemyGridY);
        if (distance <= 1 && this.enemy.alpha > 0) {
          const emitter = this.add.particles(this.enemy.x, this.enemy.y, 'magic_particle', {
              speed: { min: -200, max: 200 }, angle: { min: 0, max: 360 }, scale: { start: 0.5, end: 0 },
              blendMode: 'ADD', lifespan: 500, quantity: 30
          });
          emitter.explode();
          this.enemy.setTint(0xff0000);
          this.tweens.add({
            targets: [this.enemy, this.enemyLabel], x: '+=8', yoyo: true, for: 2, duration: 50,
            onComplete: () => {
              this.enemy.setAlpha(0);
              this.enemyLabel.setAlpha(0);
              this.time.delayedCall(200, () => resolve());
            }
          });
        } else {
          this.showResult(false, this.levelConfig.failMessages?.tooFar || '❌ 攻擊失敗！距離太遠或目標不存在。');
          this.isFailed = true; 
          reject(new Error('LEVEL_FAILED')); return; 
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
        resolve();
      }
    });
  }

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
      const cmdLabels = { 
        'for_loop': '迴圈 (for)', 'while_loop': '條件迴圈 (while)', 
        'if_else': '判斷式 (if)', 'function': '自訂函式 (function)'
      };

      reqCmds.forEach(cmd => {
        if (!cmd || cmd.trim() === '') return;
        let codeHasCommand = false;
        
        if (cmd === 'for_loop') codeHasCommand = /\bfor\b/.test(rawCode);
        else if (cmd === 'while_loop') codeHasCommand = /\bwhile\b/.test(rawCode);
        else if (cmd === 'if_else') codeHasCommand = /\bif\b/.test(rawCode);
        else if (cmd === 'function') codeHasCommand = /\bfunction\b/.test(rawCode);
        else codeHasCommand = rawCode.includes(cmd) || this.usedCommands.has(cmd);

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
    
    this.messageBox.setStyle({ 
      stroke: isSuccess ? '#00d4aa' : '#ff6b6b',
      backgroundColor: isSuccess ? 'rgba(0, 50, 30, 0.95)' : 'rgba(50, 10, 20, 0.95)'
    });
    this.messageBox.setVisible(true);

    this.messageBox.setScale(0.8);
    this.tweens.add({ targets: this.messageBox, scale: 1, duration: 300, ease: 'Back.out' });
  }

  async checkSensor(sensorId) {
    if (this.isFailed) { throw new Error('LEVEL_FAILED'); }
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