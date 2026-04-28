// src/game/config/PlayerSkills.js

// === 🚀 升級版：非同步飛行物實體 (AsyncProjectile) ===
// 完美支援純 JS 的 await，讓飛行物能「真的」一格一格移動
class AsyncProjectile {
  constructor(scene, startX, startY, config = {}) {
    this.scene = scene;
    this.gx = startX;
    this.gy = startY;
    
    // 飛行物的基礎設定
    this.emoji = config.emoji || '🏹';
    this.isSpinning = config.isSpinning || false; // 是否像迴旋鏢一樣旋轉
    this.duration = config.duration || 150;       // 飛一格的動畫時間
    this.leaveTrail = config.leaveTrail || false; // 是否留下雷射軌跡
    
    // 建立真正的 Sprite 實體
    const px = scene.startX + this.gx * scene.tileSize;
    const py = scene.startY + this.gy * scene.tileSize;
    this.sprite = scene.add.text(px, py, this.emoji, { fontSize: scene.tileSize * 0.8 + 'px' }).setOrigin(0.5);
  }

  // 🌟 現在是偵測「飛行物 (p)」的座標，而不是機甲了！
  isWall(offsetX = 0, offsetY = 0) {
    const tx = this.gx + offsetX;
    const ty = this.gy + offsetY;

    // 🌟邊界偵測：如果目標座標小於 0 或大於地圖寬高，就直接視為「牆壁」
    if (tx < 0 || tx >= this.scene.cols || ty < 0 || ty >= this.scene.rows) {
      return true; // 撞到地圖外線了！
    }
    
    // 檢查牆壁陣列中，是否有任何一面的座標與目標座標重疊
    return this.scene.walls.some(w => w.gx === tx && w.gy === ty);
  }

  isEnemy(offsetX = 0, offsetY = 0) {
    const tx = this.gx + offsetX;
    const ty = this.gy + offsetY;
    
    // 遍歷場景中的敵人，檢查是否有存活的敵人在此座標上
    // (假設在 EndlessScene 中，你的敵人存在 this.scene.enemies)
    return this.scene.enemies.some(enemy => 
      enemy.active && enemy.gridX === tx && enemy.gridY === ty
    );
  }

  // 開放給玩家與直譯器使用的移動指令 (全加上 async/await)
  async moveUp() { await this.executeMove(0, -1, 'up'); }
  async moveDown() { await this.executeMove(0, 1, 'down'); }
  async moveLeft() { await this.executeMove(-1, 0, 'left'); }
  async moveRight() { await this.executeMove(1, 0, 'right'); }

  // 核心移動邏輯 (回傳 Promise，讓迴圈卡住等動畫播完)
  executeMove(dx, dy, dir) {
    return new Promise((resolve) => {
      this.gx += dx;
      this.gy += dy;
      const targetPx = this.scene.startX + this.gx * this.scene.tileSize;
      const targetPy = this.scene.startY + this.gy * this.scene.tileSize;

      // 如果是雷射，留下發光的軌跡
      if (this.leaveTrail) {
        const beam = this.scene.add.rectangle(targetPx, targetPy, this.scene.tileSize, this.scene.tileSize, 0x00ffff, 0.6);
        this.scene.tweens.add({ targets: beam, alpha: 0, duration: 300, onComplete: () => beam.destroy() });
      }

      // 計算旋轉角度
      let targetAngle = this.sprite.angle;
      if (this.isSpinning) {
        targetAngle += 180;
      } else {
        if (dir === 'up') targetAngle = -45;
        else if (dir === 'down') targetAngle = 135;
        else if (dir === 'left') targetAngle = -135;
        else if (dir === 'right') targetAngle = 45;
      }

      // 執行 Phaser 動畫
      this.scene.tweens.add({
        targets: this.sprite,
        x: targetPx,
        y: targetPy,
        angle: targetAngle,
        duration: this.duration,
        onComplete: () => {
          this.scene.damageEnemyAt(this.gx, this.gy); // 飛到哪、傷害到哪
          resolve(); // 🌟 動畫結束，告訴外面的迴圈可以繼續下一步了
        }
      });
    });
  }
  
  // 自動飛回機甲身邊 (迴旋鏢專用)
  async returnToPlayer() {
    return new Promise(resolve => {
      this.scene.tweens.add({
        targets: this.sprite,
        x: this.scene.player.x,
        y: this.scene.player.y,
        angle: this.sprite.angle + 720,
        duration: 400,
        onComplete: () => {
          this.destroy();
          resolve();
        }
      });
    });
  }

  destroy() {
    if (this.sprite) this.sprite.destroy();
  }
}

// === 🌟 內部輔助：強化的參數解析器 (支援精確座標與角度計算) ===
const parseArgs = (scene, args = {}) => {
  let dx = scene.playerFacing.dx;
  let dy = scene.playerFacing.dy;
  
  if (args.dx !== undefined && args.dy !== undefined) {
    dx = args.dx; dy = args.dy;
  } else if (args.dir === 'up') { dx = 0; dy = -1; }
  else if (args.dir === 'down') { dx = 0; dy = 1; }
  else if (args.dir === 'left') { dx = -1; dy = 0; }
  else if (args.dir === 'right') { dx = 1; dy = 0; }

  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  const stepDx = dx === 0 ? 0 : Math.sign(dx);
  const stepDy = dy === 0 ? 0 : Math.sign(dy);

  return { dx, dy, stepDx, stepDy, angle, range: args.range || 1, custom: args };
};

export const SKILL_DICT = {
  // === 1. 揮劍 ===
  'attack': async (scene, args) => {
    return new Promise((resolve) => {
      const { dx, dy, angle } = parseArgs(scene, args);
      const tx = scene.playerGridX + Math.sign(dx);
      const ty = scene.playerGridY + Math.sign(dy);
      
      const px = scene.startX + tx * scene.tileSize;
      const py = scene.startY + ty * scene.tileSize;
      const slash = scene.add.text(px, py, '⚔️', { fontSize: scene.tileSize + 'px' }).setOrigin(0.5);
      
      slash.setAngle(angle + 45); 

      scene.tweens.add({
        targets: slash, scale: 1.5, alpha: 0, duration: 250,
        onComplete: () => { slash.destroy(); scene.damageEnemyAt(tx, ty); resolve(); }
      });
    });
  },

  // === 2. 射擊 (支援 Async 實體) ===
  'shoot': async (scene, args) => {
    if (args && typeof args.behavior === 'function') {
      // 🌟 使用新的 AsyncProjectile
      const p = new AsyncProjectile(scene, scene.playerGridX, scene.playerGridY, { emoji: '🏹', isSpinning: false });
      await args.behavior(p); // 這裡會完美地等待玩家的 await for 迴圈跑完
      p.destroy();
    } else {
      return new Promise((resolve) => {
        const { dx, dy, angle } = parseArgs(scene, args);
        const tx = scene.playerGridX + dx;
        const ty = scene.playerGridY + dy;
        const endPx = scene.startX + tx * scene.tileSize;
        const endPy = scene.startY + ty * scene.tileSize;
        
        const arrow = scene.add.text(scene.player.x, scene.player.y, '🏹', { fontSize: scene.tileSize*0.7 + 'px' }).setOrigin(0.5);
        arrow.setAngle(angle + 45);

        scene.tweens.add({
          targets: arrow, x: endPx, y: endPy, duration: 250,
          onComplete: () => { arrow.destroy(); scene.damageEnemyAt(tx, ty); resolve(); }
        });
      });
    }
  },

  // === 3. 炸彈 ===
  'bomb': async (scene, args) => {
    return new Promise((resolve) => {
      const { dx, dy } = parseArgs(scene, args);
      const tx = scene.playerGridX + dx;
      const ty = scene.playerGridY + dy;
      const px = scene.startX + tx * scene.tileSize;
      const py = scene.startY + ty * scene.tileSize;

      const bomb = scene.add.text(scene.player.x, scene.player.y, '💣', { fontSize: scene.tileSize + 'px' }).setOrigin(0.5);
      
      scene.tweens.add({
        targets: bomb, x: px, y: py, angle: 360, duration: 300, ease: 'Quad.easeOut',
        onComplete: () => {
          bomb.text = '💥'; bomb.setScale(2.5); scene.cameras.main.shake(300, 0.02);
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) { scene.damageEnemyAt(tx + i, ty + j); }
          }
          scene.tweens.add({ targets: bomb, alpha: 0, duration: 200, onComplete: () => { bomb.destroy(); resolve(); } });
        }
      });
    });
  },

  // === 4. 雷射 (支援 Async 實體) ===
  'laser': async (scene, args) => {
    if (args && typeof args.behavior === 'function') {
      const p = new AsyncProjectile(scene, scene.playerGridX, scene.playerGridY, { emoji: '⚡', duration: 80, leaveTrail: true });
      await args.behavior(p);
      p.destroy();
    } else {
      return new Promise((resolve) => {
        const { stepDx, stepDy } = parseArgs(scene, args);
        scene.cameras.main.shake(150, 0.01);
        
        let tx = scene.playerGridX;
        let ty = scene.playerGridY;

        for (let i = 1; i <= 15; i++) {
          tx += stepDx; ty += stepDy;
          if (tx < 0 || tx >= scene.cols || ty < 0 || ty >= scene.rows) break;
          if (scene.walls.some(w => w.gx === tx && w.gy === ty)) break;
          
          scene.damageEnemyAt(tx, ty); 
          const beam = scene.add.rectangle(scene.startX + tx * scene.tileSize, scene.startY + ty * scene.tileSize, scene.tileSize, scene.tileSize, 0x00ffff, 0.5);
          scene.tweens.add({ targets: beam, alpha: 0, duration: 300, onComplete: () => beam.destroy() });
        }
        scene.time.delayedCall(300, resolve);
      });
    }
  },

  // === 5. 衝刺 ===
  'dash': async (scene, args) => {
    return new Promise((resolve) => {
      const { dx, dy } = parseArgs(scene, args);
      let tx = scene.playerGridX + dx;
      let ty = scene.playerGridY + dy;

      if (tx < 0 || tx >= scene.cols || ty < 0 || ty >= scene.rows || scene.walls.some(w => w.gx===tx && w.gy===ty)) {
        scene.cameras.main.shake(100, 0.01);
        resolve(); return;
      }
      scene.playerGridX = tx; scene.playerGridY = ty;
      const px = scene.startX + tx * scene.tileSize;
      const py = scene.startY + ty * scene.tileSize;
      scene.tweens.add({ targets: scene.player, x: px, y: py, duration: 100, ease: 'Expo.easeOut', onComplete: resolve });
    });
  },

  // === 6. 破壞牆壁 ===
  'hack_wall': async (scene, args) => {
    return new Promise((resolve) => {
      const { dx, dy } = parseArgs(scene, args);
      const tx = scene.playerGridX + dx;
      const ty = scene.playerGridY + dy;
      
      const wallIndex = scene.walls.findIndex(w => w.gx === tx && w.gy === ty);
      if (wallIndex !== -1) {
        scene.walls[wallIndex].sprite.destroy();
        scene.walls.splice(wallIndex, 1);
        const fx = scene.add.text(scene.startX + tx*scene.tileSize, scene.startY + ty*scene.tileSize, '🗑️', { fontSize: '40px' }).setOrigin(0.5);
        scene.tweens.add({ targets: fx, y: '-=30', alpha: 0, duration: 500, onComplete: () => { fx.destroy(); resolve(); }});
      } else resolve();
    });
  },

  // === 7. 散彈 ===
  'spread_shot': async (scene, args) => {
    const { stepDx, stepDy } = parseArgs(scene, args);
    const dirs = [
      { dx: stepDx, dy: stepDy },
      { dx: stepDx === 0 ? -1 : stepDx, dy: stepDy === 0 ? -1 : stepDy },
      { dx: stepDx === 0 ? 1 : stepDx, dy: stepDy === 0 ? 1 : stepDy }
    ];
    await Promise.all(dirs.map(d => SKILL_DICT['shoot'](scene, { dx: d.dx, dy: d.dy })));
  },

  // === 8. 資料抓取 ===
  'pull': async (scene, args) => {
    return new Promise((resolve) => {
      const { dx, dy, stepDx, stepDy } = parseArgs(scene, args);
      const targetEnemy = scene.enemies.find(e => e.gx === scene.playerGridX + dx && e.gy === scene.playerGridY + dy);

      if (targetEnemy) {
        targetEnemy.gx = scene.playerGridX + stepDx;
        targetEnemy.gy = scene.playerGridY + stepDy;
        const px = scene.startX + targetEnemy.gx * scene.tileSize;
        const py = scene.startY + targetEnemy.gy * scene.tileSize;
        scene.tweens.add({ targets: targetEnemy.sprite, x: px, y: py, duration: 150, onComplete: resolve });
      } else resolve();
    });
  },

  // === 9. 迴旋鏢 (支援 Async 實體與自動返回) ===
  'boomerang': async (scene, args) => {
    if (args && typeof args.behavior === 'function') {
      const p = new AsyncProjectile(scene, scene.playerGridX, scene.playerGridY, { emoji: '🪃', isSpinning: true });
      await args.behavior(p);
      await p.returnToPlayer(); // 迴旋鏢的特徵：飛完會自動飛回來！
    } else {
      return new Promise((resolve) => {
        const { dx, dy } = parseArgs(scene, args);
        const tx = scene.playerGridX + dx;
        const ty = scene.playerGridY + dy;
        const px = scene.startX + tx * scene.tileSize;
        const py = scene.startY + ty * scene.tileSize;
        const rang = scene.add.text(scene.player.x, scene.player.y, '🪃', { fontSize: scene.tileSize + 'px' }).setOrigin(0.5);
        
        scene.tweens.add({
          targets: rang, x: px, y: py, angle: 360, duration: 300,
          onComplete: () => {
            scene.damageEnemyAt(tx, ty); 
            scene.tweens.add({
              targets: rang, x: scene.player.x, y: scene.player.y, angle: 720, duration: 300,
              onComplete: () => { rang.destroy(); resolve(); }
            });
          }
        });
      });
    }
  },

  // === 10. 旋風斬 ===
  'whirlwind': async (scene) => {
    return new Promise((resolve) => {
      scene.player.fillColor = 0xffaa00; 
      const spin = scene.add.text(scene.player.x, scene.player.y, '🌪️', { fontSize: scene.tileSize*2 + 'px' }).setOrigin(0.5);
      
      scene.tweens.add({
        targets: spin, angle: 360, scale: 1.5, alpha: 0, duration: 400,
        onComplete: () => {
          scene.player.fillColor = 0x6366f1;
          spin.destroy();
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              if (i !== 0 || j !== 0) scene.damageEnemyAt(scene.playerGridX + i, scene.playerGridY + j);
            }
          }
          resolve();
        }
      });
    });
  },

  // === 11. 補血 ===
  'heal': async (scene) => {
    return new Promise((resolve) => {
      const heart = scene.add.text(scene.player.x, scene.player.y, '💖', { fontSize: scene.tileSize + 'px' }).setOrigin(0.5);
      scene.tweens.add({ targets: heart, y: '-=50', alpha: 0, scale: 1.5, duration: 600, onComplete: () => { heart.destroy(); window.dispatchEvent(new CustomEvent('tower-player-heal', { detail: { amount: 20 } })); resolve(); }});
    });
  }
};

// === 🧠 微型直譯器：全面支援 Async/Await ===
export const compileToBehavior = (uiQueue) => {
  return async (p) => { // 🌟 改為 async function，支援 p 物件的 await
    let loopTimes = 1;
    let startIndex = 0;

    if (uiQueue[0] === 'for') {
      loopTimes = 5;
      startIndex = 1;
    }

    for (let step = 0; step < loopTimes; step++) {
      let i = startIndex; 
      
      while (i < uiQueue.length) {
        const cmd = uiQueue[i];

        if (cmd === 'if') {
          const condition = uiQueue[i + 1];  
          const trueAction = uiQueue[i + 2]; 
          const elseCmd = uiQueue[i + 3];    
          const falseAction = uiQueue[i + 4];

          let isMet = false;
          if (condition === 'isWall') {
            isMet = p.isWall(p.dx, p.dy); 
          }
          else if (condition === 'isEnemy') {
            isMet = p.isEnemy(p.dx, p.dy);
          }

          const actionToRun = isMet ? trueAction : (elseCmd === 'else' ? falseAction : null);

          // 🌟 加上 await，確保積木編譯模式下動畫也能同步
          if (actionToRun === 'moveUp') await p.moveUp();
          else if (actionToRun === 'moveDown') await p.moveDown();
          else if (actionToRun === 'moveLeft') await p.moveLeft();
          else if (actionToRun === 'moveRight') await p.moveRight();

          i += 5; 
        } 
        else if (['moveUp', 'moveDown', 'moveLeft', 'moveRight'].includes(cmd)) {
          if (cmd === 'moveUp') await p.moveUp();
          if (cmd === 'moveDown') await p.moveDown();
          if (cmd === 'moveLeft') await p.moveLeft();
          if (cmd === 'moveRight') await p.moveRight();
          i++;
        } else {
          i++; 
        }
      }
    }
  };
};