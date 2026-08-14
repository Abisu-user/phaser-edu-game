import Phaser from 'phaser';

// === 🌟 隱藏的非同步飛行物實體類別 ===
class AsyncProjectile {
  constructor(scene, startX, startY, options = {}) {
    this.scene = scene;
    this.gx = startX;
    this.gy = startY;
    this.active = true;
    
    // 視覺外觀設定
    this.visual = options.visual || 'arcane';
    this.duration = options.duration || 150;
    this.isSpinning = options.isSpinning || false;
    this.leaveTrail = options.leaveTrail || false;
    this.scale = options.scale || 1;

    // 建立 Phaser 遊戲物件
    const px = this.scene.startX + this.gx * this.scene.tileSize;
    const py = this.scene.startY + this.gy * this.scene.tileSize;
    
    this.sprite = this.createVisual(px, py);

    if (this.isSpinning) {
      this.spinTween = this.scene.tweens.add({
        targets: this.sprite, angle: 360, duration: 300, repeat: -1
      });
    }
  }

  // 共用的移動邏輯
  createVisual(px, py) {
    const size = this.scene.tileSize * this.scale;
    const visual = this.scene.add.container(px, py).setDepth(56);
    const glowColor = this.visual === 'arrow' ? 0xfbbf24 : this.visual === 'bomb' ? 0xfb7185 : this.visual === 'boomerang' ? 0xc4b5fd : 0x67e8f9;
    const glow = this.scene.add.circle(0, 0, size * 0.22, glowColor, 0.24).setBlendMode(Phaser.BlendModes.ADD);
    const parts = [glow];

    if (this.visual === 'arrow') {
      const shaft = this.scene.add.rectangle(0, 0, size * 0.55, Math.max(3, size * 0.07), 0xfde68a).setStrokeStyle(1, 0x92400e);
      const tip = this.scene.add.triangle(size * 0.31, 0, -size * 0.11, -size * 0.16, -size * 0.11, size * 0.16, size * 0.19, 0, 0xffffff).setStrokeStyle(1, 0x7c2d12);
      const fletching = this.scene.add.triangle(-size * 0.27, 0, size * 0.13, -size * 0.16, size * 0.13, size * 0.16, -size * 0.13, 0, 0x38bdf8);
      parts.push(shaft, tip, fletching);
    } else if (this.visual === 'bomb') {
      parts.push(this.scene.add.circle(0, 0, size * 0.19, 0xfb7185).setStrokeStyle(2, 0xfef2f2), this.scene.add.circle(size * 0.1, -size * 0.12, size * 0.06, 0xfde68a));
    } else if (this.visual === 'boomerang') {
      const arc = this.scene.add.graphics();
      arc.lineStyle(Math.max(3, size * 0.08), 0xc4b5fd, 1);
      arc.beginPath();
      arc.arc(0, 0, size * 0.23, Phaser.Math.DegToRad(35), Phaser.Math.DegToRad(285), false);
      arc.strokePath();
      parts.push(arc);
    } else {
      parts.push(this.scene.add.circle(0, 0, size * 0.14, 0xe0f2fe), this.scene.add.circle(0, 0, size * 0.09, 0x22d3ee).setBlendMode(Phaser.BlendModes.ADD));
      for (let index = 0; index < 4; index++) {
        const angle = (Math.PI * 2 * index) / 4;
        parts.push(this.scene.add.circle(Math.cos(angle) * size * 0.22, Math.sin(angle) * size * 0.22, size * 0.035, 0xa5f3fc));
      }
    }
    visual.add(parts);
    return visual;
  }

  spawnTrail() {
    const px = this.scene.startX + this.gx * this.scene.tileSize;
    const py = this.scene.startY + this.gy * this.scene.tileSize;
    const color = this.visual === 'arrow' ? 0xfbbf24 : 0x67e8f9;
    const trail = this.scene.add.circle(px, py, this.scene.tileSize * 0.12, color, 0.45).setDepth(54).setBlendMode(Phaser.BlendModes.ADD);
    this.scene.tweens.add({ targets: trail, scale: 2.3, alpha: 0, duration: 260, onComplete: () => trail.destroy() });
  }

  explode() {
    if (!this.sprite?.active) return;
    this.sprite.removeAll(true);
    const size = this.scene.tileSize * this.scale;
    const core = this.scene.add.circle(0, 0, size * 0.22, 0xfef3c7).setBlendMode(Phaser.BlendModes.ADD);
    this.sprite.add(core);
    for (let index = 0; index < 8; index++) {
      const angle = (Math.PI * 2 * index) / 8;
      const ray = this.scene.add.rectangle(0, 0, Math.max(3, size * 0.06), size * 0.34, 0xfb7185).setRotation(angle);
      this.sprite.add(ray);
      this.scene.tweens.add({ targets: ray, x: Math.cos(angle) * size * 0.5, y: Math.sin(angle) * size * 0.5, alpha: 0, duration: 220 });
    }
  }

  async move(dx, dy) {
    if (!this.active) return false;

    // 更新方向視覺
    if (!this.isSpinning) {
      this.sprite.setRotation(Phaser.Math.Angle.Between(0, 0, dx, dy) + Math.PI / 4); // +45度校正 emoji
    }

    const tx = this.gx + dx;
    const ty = this.gy + dy;
    
    // 檢查邊界與牆壁
    const isOutOfBounds = tx < 0 || tx >= this.scene.cols || ty < 0 || ty >= this.scene.rows;
    const isWall = this.scene.walls.some(w => w.gx === tx && w.gy === ty);

    if (isOutOfBounds || isWall) {
      this.destroy();
      return false; // 撞牆，停止移動
    }

    // 實際移動內部座標
    this.gx = tx;
    this.gy = ty;

    // 留下軌跡 (例如雷射)
    if (this.leaveTrail) {
      this.spawnTrail();
    }

    // 動畫等待
    const targetPx = this.scene.startX + this.gx * this.scene.tileSize;
    const targetPy = this.scene.startY + this.gy * this.scene.tileSize;

    await new Promise(resolve => {
      this.scene.tweens.add({ 
        targets: this.sprite, x: targetPx, y: targetPy, duration: this.duration, onComplete: resolve 
      });
    });

    // 檢查是否撞到敵人
    if (this.scene.damageEnemyAt(this.gx, this.gy)) {
      this.destroy();
      return false; // 撞到怪，觸發傷害並銷毀
    }

    return true; // 成功移動到下一格
  }

  // 產生暴露給使用者的 `p` API 介面
  createAPI() {
    // 🌟 幫 p 物件也加上跟全域一樣聰明的參數解析器
    const createSubSkill = (skillName) => async (arg1, arg2, arg3) => {
      let dx = 0;
      let dy = -1; // 預設朝上
      let behavior = null;

      if (typeof arg1 === 'function') {
        behavior = arg1; // 支援玩家寫 p.shoot(arror2)
      } else if (typeof arg1 === 'number' && typeof arg2 === 'number') {
        dx = Math.sign(arg1);
        dy = Math.sign(arg2);
        if (typeof arg3 === 'function') behavior = arg3; // 支援 p.shoot(0, -1, arror2)
      }

      if (dx === 0 && dy === 0) dy = -1; // 防呆
      
      await this.scene.executeCombatSkill(skillName, dx, dy, behavior, this.gx, this.gy);
    };

    return {
      // 狀態感知
      isWall: (relX, relY) => {
        const tx = this.gx + relX;
        const ty = this.gy + relY;
        const isOutOfBounds = tx < 0 || tx >= this.scene.cols || ty < 0 || ty >= this.scene.rows;
        return isOutOfBounds || this.scene.walls.some(w => w.gx === tx && w.gy === ty);
      },
      isEnemy: (relX, relY) => {
        const tx = this.gx + relX;
        const ty = this.gy + relY;
        return this.scene.enemies.some(e => e.gx === tx && e.gy === ty);
      },
      
      // 基礎移動
      moveLeft: async () => await this.move(-1, 0),
      moveRight: async () => await this.move(1, 0),
      moveUp: async () => await this.move(0, -1),
      moveDown: async () => await this.move(0, 1),
      
      // 🌟 換成聰明的發射器
      shoot: createSubSkill('shoot'),
      bomb: createSubSkill('bomb'),
      laser: createSubSkill('laser'),
      boomerang: createSubSkill('boomerang'),
    };
  }

  destroy() {
    if (!this.active) return;
    this.active = false;
    if (this.spinTween) this.spinTween.stop();
    this.sprite.destroy();
  }
}

// === ⚙️ 輔助函式：解析參數 ===
const parseArgs = (scene, args) => {
  let dx = scene.playerFacing ? scene.playerFacing.dx : 0;
  let dy = scene.playerFacing ? scene.playerFacing.dy : -1;
  let originX = scene.playerGridX;
  let originY = scene.playerGridY;

  if (args) {
    if (args.dx !== undefined) dx = Math.sign(args.dx);
    if (args.dy !== undefined) dy = Math.sign(args.dy);
    if (args.originX !== undefined) originX = args.originX;
    if (args.originY !== undefined) originY = args.originY;
  }
  
  if (dx === 0 && dy === 0) dy = -1; // 防呆
  const angle = Phaser.Math.RadToDeg(Phaser.Math.Angle.Between(0, 0, dx, dy));
  
  return { dx, dy, angle, originX, originY, stepDx: dx, stepDy: dy };
};

// === 🚀 技能字典 ===
export const SKILL_DICT = {
  // === 1. 揮劍 (近戰，無實體) ===
  'attack': async (scene, args) => {
    return new Promise((resolve) => {
      const { dx, dy, angle, originX, originY } = parseArgs(scene, args);
      const tx = originX + dx;
      const ty = originY + dy;
      
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

  // === 2. 射擊 (箭矢) ===
  'shoot': async (scene, args) => {
    const { dx, dy, originX, originY } = parseArgs(scene, args);
    const p = new AsyncProjectile(scene, originX, originY, { visual: 'arrow', duration: 150 });
    
    if (args && typeof args.behavior === 'function') {
      try { await args.behavior(p.createAPI()); } catch(e) {}
    } else {
      // 🌟 修改：預設只飛 1 格
      await p.move(dx, dy);
    }
    p.destroy();
  },

  // === 3. 炸彈 (可飛行拋擲，然後爆炸) ===
  'bomb': async (scene, args) => {
    const { dx, dy, originX, originY } = parseArgs(scene, args);
    const p = new AsyncProjectile(scene, originX, originY, { visual: 'bomb', duration: 200, isSpinning: true, scale: 1.2 });
    
    if (args && typeof args.behavior === 'function') {
      try { await args.behavior(p.createAPI()); } catch(e) {}
    } else {
      // 🌟 修改：預設只往前拋 1 格就準備爆炸
      await p.move(dx, dy);
    }

    // 引爆邏輯 (不管有沒有跑完，最終一定會爆炸)
    if (p.active) {
      p.explode();
      p.sprite.setScale(2.5);
      p.sprite.setRotation(0);
      if (p.spinTween) p.spinTween.stop();
      scene.cameras.main.shake(300, 0.02);
      
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) { scene.damageEnemyAt(p.gx + i, p.gy + j); }
      }
      
      await new Promise(resolve => {
        scene.tweens.add({ targets: p.sprite, alpha: 0, duration: 200, onComplete: resolve });
      });
      p.destroy();
    }
  },

  // === 4. 雷射 (瞬間留下軌跡) ===
  'laser': async (scene, args) => {
    const { dx, dy, originX, originY } = parseArgs(scene, args);
    const p = new AsyncProjectile(scene, originX, originY, { visual: 'arcane', duration: 50, leaveTrail: true });
    
    if (args && typeof args.behavior === 'function') {
      try { await args.behavior(p.createAPI()); } catch(e) {}
    } else {
      // 🌟 修改：預設雷射只貫穿 1 格
      const tx = p.gx + dx;
      const ty = p.gy + dy;
      const isOutOfBounds = tx < 0 || tx >= scene.cols || ty < 0 || ty >= scene.rows;
      const isWall = scene.walls.some(w => w.gx === tx && w.gy === ty);
      
      if (!isOutOfBounds && !isWall) {
         p.gx = tx; p.gy = ty;
         scene.damageEnemyAt(p.gx, p.gy); // 直接造成傷害

         // 畫軌跡
         const trail = scene.add.rectangle(
            scene.startX + p.gx * scene.tileSize, scene.startY + p.gy * scene.tileSize, 
            scene.tileSize, scene.tileSize, 0x00ffff, 0.5
         );
         scene.tweens.add({ targets: trail, alpha: 0, duration: 300, onComplete: () => trail.destroy() });
         
         const targetPx = scene.startX + p.gx * scene.tileSize;
         const targetPy = scene.startY + p.gy * scene.tileSize;
         await new Promise(res => scene.tweens.add({ targets: p.sprite, x: targetPx, y: targetPy, duration: 50, onComplete: res }));
      }
    }
    p.destroy();
  },

  // === 9. 迴旋鏢 (飛出去再飛回來) ===
  'boomerang': async (scene, args) => {
    const { dx, dy, originX, originY } = parseArgs(scene, args);
    const p = new AsyncProjectile(scene, originX, originY, { visual: 'boomerang', duration: 150, isSpinning: true });

    if (args && typeof args.behavior === 'function') {
      try { await args.behavior(p.createAPI()); } catch(e) {}
    } else {
      // 🌟 修改：預設往前 1 格，再飛回來
      if (await p.move(dx, dy)) {
        await p.move(-dx, -dy);
      }
    }
    p.destroy();
  },

  // === 其他非實體技能保留 ===
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

  'hack_wall': async (scene, args) => {
    return new Promise((resolve) => {
      const { dx, dy, originX, originY } = parseArgs(scene, args);
      const tx = originX + dx;
      const ty = originY + dy;
      
      const wallIndex = scene.walls.findIndex(w => w.gx === tx && w.gy === ty);
      if (wallIndex !== -1) {
        scene.walls[wallIndex].sprite.destroy();
        scene.walls.splice(wallIndex, 1);
        const fx = scene.add.text(scene.startX + tx*scene.tileSize, scene.startY + ty*scene.tileSize, '🗑️', { fontSize: '40px' }).setOrigin(0.5);
        scene.tweens.add({ targets: fx, y: '-=30', alpha: 0, duration: 500, onComplete: () => { fx.destroy(); resolve(); }});
      } else resolve();
    });
  },

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

  'heal': async (scene) => {
    return new Promise((resolve) => {
      const heart = scene.add.text(scene.player.x, scene.player.y, '💖', { fontSize: scene.tileSize + 'px' }).setOrigin(0.5);
      scene.tweens.add({ targets: heart, y: '-=50', alpha: 0, scale: 1.5, duration: 600, onComplete: () => { heart.destroy(); window.dispatchEvent(new CustomEvent('tower-player-heal', { detail: { amount: 20 } })); resolve(); }});
    });
  }
};

// === 🧠 微型直譯器：全面支援 Async/Await ===
export const compileToBehavior = (uiQueue) => {
  return async (p) => { 
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
            isMet = p.isWall(p.dx || 0, p.dy || -1); 
          }
          else if (condition === 'isEnemy') {
            isMet = p.isEnemy(p.dx || 0, p.dy || -1);
          }

          const actionToRun = isMet ? trueAction : (elseCmd === 'else' ? falseAction : null);

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
