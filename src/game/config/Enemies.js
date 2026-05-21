// ==========================================
// 1. 核心共用模組 (保留你原有的動畫與傷害機制)
// ==========================================
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

  // 🌟 4. 踩到陷阱的傷害結算
  const hazard = scene.hazards.find(h => h.gx === tx && h.gy === ty);
  if (hazard) {
    const isDead = scene.damageEnemyAt(tx, ty, 15);
    if (!isDead) {
      const fx = scene.add.text(px, py, '⚠️', { fontSize: '20px' }).setOrigin(0.5).setDepth(40);
      scene.tweens.add({ targets: fx, y: py - 30, alpha: 0, duration: 800, onComplete: () => fx.destroy() });
    }
  }

  return true;
};

// ==========================================
// 2. 怪物行動智慧 (封裝你原本的追蹤邏輯)
// ==========================================

// 🎯 全圖智慧追擊 (先躲陷阱，沒路就硬踩陷阱) - 適用於高階怪與 Boss
const executeSmartChase = async (scene, enemy, damage) => {
  const safePath = scene.findPath(enemy.gx, enemy.gy, scene.playerGridX, scene.playerGridY, true);
  if (safePath && safePath.length > 0) {
    const tx = safePath[0].x;
    const ty = safePath[0].y;
    const success = await tryMoveOrAttack(scene, enemy, tx, ty, damage);
    if (!success) {
      enemy.sprite.setAlpha(0.5); 
      setTimeout(() => enemy.sprite.setAlpha(1), 200);
    }
  } else {
    const dangerPath = scene.findPath(enemy.gx, enemy.gy, scene.playerGridX, scene.playerGridY, false);
    if (dangerPath && dangerPath.length > 0) {
      const tx = dangerPath[0].x;
      const ty = dangerPath[0].y;
      await tryMoveOrAttack(scene, enemy, tx, ty, damage);
    } else {
      enemy.sprite.setAlpha(0.5); 
      setTimeout(() => enemy.sprite.setAlpha(1), 200);
    }
  }
};

// 💤 警戒巡邏 (靠近才追，否則隨機走) - 適用於低階怪
const executePatrol = async (scene, enemy, damage, alertRange) => {
  const distX = Math.abs(scene.playerGridX - enemy.gx);
  const distY = Math.abs(scene.playerGridY - enemy.gy);

  if (distX <= alertRange && distY <= alertRange) {
    const px = scene.startX + enemy.gx * scene.tileSize;
    const py = scene.startY + enemy.gy * scene.tileSize;
    const alert = scene.add.text(px, py - 30, '❗', { fontSize: '24px' }).setOrigin(0.5).setDepth(50);
    scene.tweens.add({ targets: alert, y: '-=15', alpha: 0, duration: 600, onComplete: () => alert.destroy() });

    // 警戒範圍內，啟動智慧追殺
    const chasePath = scene.findPath(enemy.gx, enemy.gy, scene.playerGridX, scene.playerGridY, true);
    if (chasePath && chasePath.length > 0) {
      await tryMoveOrAttack(scene, enemy, chasePath[0].x, chasePath[0].y, damage);
      return; 
    }
  }

  // 隨機移動邏輯
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
    await tryMoveOrAttack(scene, enemy, tx, ty, damage);
  }
};


// ==========================================
// 👾 3. 怪物與 Boss 字典
// ==========================================
export const ENEMY_DICT = {
  
  // --- 舊有保留怪 ---
  'patrol_bug': {
    id: 'patrol_bug', name: '巡邏蟲', hp: 30, damage: 10, coinReward: 5, xpReward: 15, symbol: '🐛', 
    takeTurn: async (scene, enemy) => { await executePatrol(scene, enemy, 10, 2); }
  },
  'tracker_virus': {
    id: 'tracker_virus', name: '追跡病毒', hp: 50, damage: 15, coinReward: 15, xpReward: 30, symbol: '🦠',
    takeTurn: async (scene, enemy) => { await executeSmartChase(scene, enemy, 15); }
  },

  // --- 🟢 奇幻基礎怪 ---
  'slime': {
    id: 'slime', name: '史萊姆', hp: 25, damage: 8, coinReward: 4, xpReward: 10, symbol: '🟢',
    takeTurn: async (scene, enemy) => { await executePatrol(scene, enemy, 8, 3); } // 3 格內才會追
  },
  'goblin': {
    id: 'goblin', name: '地痞哥布林', hp: 45, damage: 14, coinReward: 10, xpReward: 20, symbol: '👺',
    takeTurn: async (scene, enemy) => { await executePatrol(scene, enemy, 14, 5); } // 視野大一點
  },
  'skeleton': {
    id: 'skeleton', name: '不死骷髏兵', hp: 60, damage: 18, coinReward: 12, xpReward: 25, symbol: '💀',
    takeTurn: async (scene, enemy) => { await executeSmartChase(scene, enemy, 18); } // 骷髏兵死纏爛打
  },
  'ghost': {
    id: 'ghost', name: '怨靈惡鬼', hp: 50, damage: 22, coinReward: 15, xpReward: 35, symbol: '👻',
    takeTurn: async (scene, enemy) => { await executeSmartChase(scene, enemy, 22); }
  },
  'golem': {
    id: 'golem', name: '遺跡岩石傀儡', hp: 120, damage: 25, coinReward: 20, xpReward: 40, symbol: '🗿',
    takeTurn: async (scene, enemy) => { 
      if (scene.turnCounter % 2 === 0) { // 巨像很笨重，兩回合才動一次
        await executeSmartChase(scene, enemy, 25); 
      }
    }
  },
  'void_creeper': {
    id: 'void_creeper', name: '虛空爬行者', hp: 90, damage: 30, coinReward: 25, xpReward: 50, symbol: '👾',
    takeTurn: async (scene, enemy) => { await executeSmartChase(scene, enemy, 30); }
  },


  // ==========================================
  // 👑 史詩級關卡 BOSS (全圖智慧追蹤)
  // ==========================================
  
  'boss_bat': {
    id: 'boss_bat', isBoss: true, symbol: '🦇', name: '第10層：吸血蝙蝠王', hp: 250, damage: 25, coinReward: 100, xpReward: 150,
    takeTurn: async (scene, enemy) => { await executeSmartChase(scene, enemy, 25); }
  },
  'boss_skeleton_king': {
    id: 'boss_skeleton_king', isBoss: true, symbol: '👑', name: '第20層：骷髏暴君', hp: 500, damage: 40, coinReward: 200, xpReward: 300,
    takeTurn: async (scene, enemy) => { await executeSmartChase(scene, enemy, 40); }
  },
  'boss_demon_lord': {
    id: 'boss_demon_lord', isBoss: true, symbol: '👿', name: '第30層：恐懼惡魔領主', hp: 800, damage: 60, coinReward: 350, xpReward: 500,
    takeTurn: async (scene, enemy) => { await executeSmartChase(scene, enemy, 60); }
  },
  'boss_shadow_stalker': {
    id: 'boss_shadow_stalker', isBoss: true, symbol: '🌑', name: '第40層：暗影狂煞', hp: 1200, damage: 85, coinReward: 500, xpReward: 750,
    takeTurn: async (scene, enemy) => { await executeSmartChase(scene, enemy, 85); }
  },
  'boss_dragon': {
    id: 'boss_dragon', isBoss: true, symbol: '🐉', name: '第50層：滅世紅龍', hp: 2000, damage: 120, coinReward: 1000, xpReward: 1200,
    takeTurn: async (scene, enemy) => { 
      const currentDamage = Math.random() > 0.7 ? 240 : 120;
      await executeSmartChase(scene, enemy, currentDamage); 
    }
  },
  'boss_reaper': {
    id: 'boss_reaper', isBoss: true, symbol: '☠️', name: '第60層：冥界收割者', hp: 3000, damage: 160, coinReward: 1500, xpReward: 1800,
    takeTurn: async (scene, enemy) => { await executeSmartChase(scene, enemy, 160); }
  },
  'boss_titan': {
    id: 'boss_titan', isBoss: true, symbol: '🧱', name: '第70層：遠古鋼鐵泰坦', hp: 4500, damage: 210, coinReward: 2200, xpReward: 2500,
    takeTurn: async (scene, enemy) => { await executeSmartChase(scene, enemy, 210); }
  },
  'boss_hydra': {
    id: 'boss_hydra', isBoss: true, symbol: '🐍', name: '第80層：遠古九頭蛇皇', hp: 6000, damage: 280, coinReward: 3200, xpReward: 3500,
    takeTurn: async (scene, enemy) => { await executeSmartChase(scene, enemy, 280); }
  },
  'boss_lich': {
    id: 'boss_lich', isBoss: true, symbol: '🔮', name: '第90層：不朽巫妖至尊', hp: 8500, damage: 360, coinReward: 5000, xpReward: 5000,
    takeTurn: async (scene, enemy) => { await executeSmartChase(scene, enemy, 360); }
  },
  'boss_abyss_god': {
    id: 'boss_abyss_god', isBoss: true, symbol: '🔱', name: '第100層：終焉深淵主宰', hp: 15000, damage: 500, coinReward: 9999, xpReward: 9999,
    takeTurn: async (scene, enemy) => { await executeSmartChase(scene, enemy, 500); }
  }
};