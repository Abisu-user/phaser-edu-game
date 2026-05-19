const tryMoveOrAttack = async (scene, enemy, tx, ty, damage) => {
  // 1. 判斷目標格子是不是玩家
  if (scene.playerGridX === tx && scene.playerGridY === ty) {
    const px = scene.startX + tx * scene.tileSize;
    const py = scene.startY + ty * scene.tileSize;
    
    await new Promise(resolve => {
      scene.tweens.add({
        targets: enemy.sprite, x: px, y: py,
        duration: 100, yoyo: true, 
        onComplete: resolve
      });
    });

    scene.cameras.main.shake(200, 0.015);
    window.dispatchEvent(new CustomEvent('tower-player-hurt', { detail: { damage: damage } }));
    
    const fx = scene.add.text(px, py, '💥', { fontSize: '40px' }).setOrigin(0.5);
    scene.tweens.add({ targets: fx, scale: 1.5, alpha: 0, duration: 300, onComplete: () => fx.destroy() });
    
    return true; 
  }

  // 2. 🛡️ 實體碰撞判定 (不阻擋陷阱，陷阱是可以踩的)
  const isOutOfBounds = tx < 0 || tx >= scene.cols || ty < 0 || ty >= scene.rows;
  const isWall = scene.walls.some(w => w.gx === tx && w.gy === ty);
  const isTerminal = scene.terminal && scene.terminal.gx === tx && scene.terminal.gy === ty;
  const isOtherEnemy = scene.enemies.some(e => e.gx === tx && e.gy === ty && e !== enemy);

  if (isOutOfBounds || isWall || isTerminal || isOtherEnemy) {
    return false; 
  }

  // 3. 正常移動動畫
  enemy.gx = tx;
  enemy.gy = ty;
  const px = scene.startX + tx * scene.tileSize;
  const py = scene.startY + ty * scene.tileSize;

  await new Promise(resolve => {
    scene.tweens.add({
      targets: enemy.sprite, x: px, y: py,
      duration: 200, onComplete: resolve
    });
  });

  // 🌟 4. 新增：踩到陷阱的傷害結算
  const hazard = scene.hazards.find(h => h.gx === tx && h.gy === ty);
  if (hazard) {
    // 呼叫場景的扣血機制 (假設陷阱傷害為 15)
    const isDead = scene.damageEnemyAt(tx, ty, 15);
    
    // 跳出一個小小的警告圖示增加打擊感
    if (!isDead) {
      const fx = scene.add.text(px, py, '⚠️', { fontSize: '20px' }).setOrigin(0.5).setDepth(40);
      scene.tweens.add({ targets: fx, y: py - 30, alpha: 0, duration: 800, onComplete: () => fx.destroy() });
    }
  }

  return true;
};

// === 👾 怪物字典 ===
export const ENEMY_DICT = {
  // 1. 基礎怪：巡邏蟲 (現在會盡量避開陷阱)
  'patrol_bug': {
    id: 'patrol_bug',
    name: '巡邏蟲',
    hp: 30,
    damage: 10,
    coinReward: 5,
    symbol: '🐛', 
    description: '基礎的除錯蟲。平時隨機遊走，但只要機甲進入周圍 2 格警戒範圍，就會發動追擊。',
    
    takeTurn: async (scene, enemy) => {
      // 🌟 1. 警戒範圍偵測：計算與玩家的 X, Y 距離
      const distX = Math.abs(scene.playerGridX - enemy.gx);
      const distY = Math.abs(scene.playerGridY - enemy.gy);

      // 如果玩家在周圍 2 格的九宮格範圍內
      if (distX <= 2 && distY <= 2) {
        // 💡 視覺優化：頭上冒出驚嘆號！
        const px = scene.startX + enemy.gx * scene.tileSize;
        const py = scene.startY + enemy.gy * scene.tileSize;
        const alert = scene.add.text(px, py - 30, '❗', { fontSize: '24px' }).setOrigin(0.5).setDepth(50);
        scene.tweens.add({ targets: alert, y: '-=15', alpha: 0, duration: 600, onComplete: () => alert.destroy() });

        // 🎯 呼叫尋路演算法追殺玩家 (true 代表牠還是會盡量避開陷阱)
        const chasePath = scene.findPath(enemy.gx, enemy.gy, scene.playerGridX, scene.playerGridY, true);
        if (chasePath && chasePath.length > 0) {
          const tx = chasePath[0].x;
          const ty = chasePath[0].y;
          await tryMoveOrAttack(scene, enemy, tx, ty, ENEMY_DICT['patrol_bug'].damage);
          return; // 追擊完畢，結束這回合！
        }
      }

      // ==========================================
      // 💤 2. 如果玩家不在範圍內 (或找不到路)，執行原本的隨機巡邏
      // ==========================================
      const moves = [ { dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 } ];
      
      let safeMoves = moves.filter(m => {
        const tx = enemy.gx + m.dx;
        const ty = enemy.gy + m.dy;
        const outOfBounds = tx < 0 || tx >= scene.cols || ty < 0 || ty >= scene.rows;
        const wallOrEnemy = scene.walls.some(w => w.gx===tx && w.gy===ty) || scene.enemies.some(e => e.gx===tx && e.gy===ty && e!==enemy) || (scene.terminal && scene.terminal.gx===tx && scene.terminal.gy===ty);
        const hasHazard = scene.hazards.some(h => h.gx===tx && h.gy===ty);
        return !outOfBounds && !wallOrEnemy && !hasHazard;
      });

      if (safeMoves.length === 0) {
        safeMoves = moves.filter(m => {
          const tx = enemy.gx + m.dx;
          const ty = enemy.gy + m.dy;
          const outOfBounds = tx < 0 || tx >= scene.cols || ty < 0 || ty >= scene.rows;
          const wallOrEnemy = scene.walls.some(w => w.gx===tx && w.gy===ty) || scene.enemies.some(e => e.gx===tx && e.gy===ty && e!==enemy) || (scene.terminal && scene.terminal.gx===tx && scene.terminal.gy===ty);
          return !outOfBounds && !wallOrEnemy;
        });
      }

      if (safeMoves.length > 0) {
        const randomMove = safeMoves[Math.floor(Math.random() * safeMoves.length)];
        const tx = enemy.gx + randomMove.dx;
        const ty = enemy.gy + randomMove.dy;
        await tryMoveOrAttack(scene, enemy, tx, ty, ENEMY_DICT['patrol_bug'].damage);
      }
    }
  },

  // 2. 進階怪：追跡病毒 (現在具備兩段式智慧尋路)
  'tracker_virus': {
    id: 'tracker_virus',
    name: '追跡病毒',
    hp: 50,
    damage: 15,
    coinReward: 15,
    symbol: '🦠',
    description: '會繞過障礙物與危險，不斷朝著玩家逼近的危險程式。',
    
    takeTurn: async (scene, enemy) => {
      // 🌟 策略 1：要求演算法「避開陷阱 (true)」尋找玩家
      const safePath = scene.findPath(enemy.gx, enemy.gy, scene.playerGridX, scene.playerGridY, true);

      if (safePath && safePath.length > 0) {
        const tx = safePath[0].x;
        const ty = safePath[0].y;
        const success = await tryMoveOrAttack(scene, enemy, tx, ty, ENEMY_DICT['tracker_virus'].damage);
        if (!success) {
          enemy.sprite.setAlpha(0.5); 
          setTimeout(() => enemy.sprite.setAlpha(1), 200);
        }
      } else {
        // 🌟 策略 2：如果安全的路走不通 (玩家躲在陷阱區後面)，病毒會「無視陷阱 (false)」硬著頭皮追殺過來！
        const dangerPath = scene.findPath(enemy.gx, enemy.gy, scene.playerGridX, scene.playerGridY, false);
        
        if (dangerPath && dangerPath.length > 0) {
          const tx = dangerPath[0].x;
          const ty = dangerPath[0].y;
          await tryMoveOrAttack(scene, enemy, tx, ty, ENEMY_DICT['tracker_virus'].damage);
        } else {
          // 如果連硬踩陷阱都找不到路，那就在原地發呆
          enemy.sprite.setAlpha(0.5); 
          setTimeout(() => enemy.sprite.setAlpha(1), 200);
        }
      }
    }
  }
};