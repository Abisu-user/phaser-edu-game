import Phaser from 'phaser';
import { ENEMY_DICT } from '../config/Enemies';
import { HAZARD_DICT } from '../config/Hazards';
import { ROOM_TYPES, FLOOR_CONFIG } from '../config/LevelRules';
// 🌟 確保把我們寫好的 compileToBehavior 也 import 進來！
import { SKILL_DICT, compileToBehavior } from '../config/PlayerSkills';

export default class EndlessScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EndlessScene' });
  }

  init(data) {
    this.currentFloor = data.floor || 1;
    console.log(`🎮 [EndlessScene] 初始化樓層: ${this.currentFloor}`);
    
    this.levelConfig = FLOOR_CONFIG ? FLOOR_CONFIG.getDifficulty(this.currentFloor) : { gridSize: 10, enemyCount: 2, allowedEnemies: ['patrol_bug'], winCondition: { type: 'reach_goal' } };
  }

  preload() {
    this.load.image('hero', '../../../public/hero.png');
  }

  create() {
    console.log("🛠️ [EndlessScene] 場景物件生成中...");
    
    // --- 1. 初始化容器與變數 ---
    this.enemies = [];
    this.hazards = [];
    this.walls = [];
    this.coins = [];
    this.keys = [];
    this.terminal = null;
    
    this.enemiesKilled = 0;
    this.keysCollected = 0;
    
    // --- 2. 動態設定地圖大小 ---
    const baseSize = this.levelConfig.gridSize || 10; 
    const extraSize = Math.floor(this.currentFloor / 3);
    this.cols = Math.min(baseSize + extraSize, 20); 
    this.rows = this.cols;
    this.tileSize = 64; 

    // --- 3. 生成世界 ---
    this.setupGrid();
    this.setupPlayer();
    this.generateLevel();

    // --- 4. 建立瞄準系統專用 UI ---
    this.isTargeting = false;
    this.ENABLE_AIMING_UI = false; // 總開關
    
    this.targetingOverlay = this.add.rectangle(
        this.scale.width / 2, this.scale.height / 2, 
        this.scale.width, this.scale.height, 
        0x000000, 0.6
    ).setDepth(40).setVisible(false);

    this.targetHighlight = this.add.rectangle(0, 0, this.tileSize, this.tileSize, 0x00ff00, 0.4)
        .setStrokeStyle(2, 0x00ff00)
        .setDepth(50) 
        .setVisible(false);

    this.aimingLine = this.add.graphics().setDepth(45);

    // --- 5. 啟動滑鼠事件監聽 ---
    this.input.on('pointermove', (pointer) => {
      if (!this.ENABLE_AIMING_UI || !this.isTargeting || !this.targetHighlight || !this.aimingLine) return;
      
      const { gx, gy } = this.getGridFromPointer(pointer);
      this.aimingLine.clear();
      this.targetHighlight.setVisible(false);

      if (gx >= 0 && gx < this.cols && gy >= 0 && gy < this.rows) {
        const path = this.findPath(this.playerGridX, this.playerGridY, gx, gy);

        if (path) {
          const px = this.startX + gx * this.tileSize;
          const py = this.startY + gy * this.tileSize;
          this.targetHighlight.setPosition(px, py).setVisible(true);

          this.aimingLine.lineStyle(4, 0x00ff00, 0.7); 
          this.aimingLine.beginPath();
          
          const playerPx = this.startX + this.playerGridX * this.tileSize;
          const playerPy = this.startY + this.playerGridY * this.tileSize;
          this.aimingLine.moveTo(playerPx, playerPy);

          for (let p of path) {
            const nodePx = this.startX + p.x * this.tileSize;
            const nodePy = this.startY + p.y * this.tileSize;
            this.aimingLine.lineTo(nodePx, nodePy);
          }
          this.aimingLine.strokePath();
        } else {
          const playerPx = this.startX + this.playerGridX * this.tileSize;
          const playerPy = this.startY + this.playerGridY * this.tileSize;
          const px = this.startX + gx * this.tileSize;
          const py = this.startY + gy * this.tileSize;

          this.aimingLine.lineStyle(4, 0xff0000, 0.5); 
          this.aimingLine.beginPath();
          this.aimingLine.moveTo(playerPx, playerPy);
          this.aimingLine.lineTo(px, py);
          this.aimingLine.strokePath();
        }
      }
    });

    this.input.on('pointerdown', (pointer) => {
      if (!this.ENABLE_AIMING_UI || !this.isTargeting) return;
      const { gx, gy } = this.getGridFromPointer(pointer);
      
      if (gx >= 0 && gx < this.cols && gy >= 0 && gy < this.rows) {
        const path = this.findPath(this.playerGridX, this.playerGridY, gx, gy);
        if (!path) {
          console.log("❌ 死路！請點擊綠線可抵達的範圍。");
          this.cameras.main.shake(150, 0.01); 
          return; 
        }
        this.finishTargeting(gx, gy, path);
      }
    });

    // --- 6. 系統事件監聽器 ---
    this.events.off('PLAYER_EXECUTE');
    this.events.on('PLAYER_EXECUTE', (payload) => {
      if (typeof payload === 'string') {
          this.executeRawCode(payload); 
      } else {
          this.executeTurnSequence(payload); 
      }
    }, this);

    const onStartTargeting = () => this.startTargeting();
    const onCancelTargeting = () => this.cancelTargeting();

    window.addEventListener('tower-start-targeting', onStartTargeting);
    window.addEventListener('tower-cancel-targeting', onCancelTargeting);

    this.events.once('shutdown', () => {
      console.log("🧹 [EndlessScene] 場景關閉，正在清理全域監聽器...");
      window.removeEventListener('tower-start-targeting', onStartTargeting);
      window.removeEventListener('tower-cancel-targeting', onCancelTargeting);
    });
    
    // 🌟 進入樓層時提示玩家
    this.showFloorObjective();
    this.updateObjectiveUI();
  }
  
  updateObjectiveUI() {
    const cond = this.levelConfig.winCondition;
    let text = "";

    if (cond.type === 'reach_goal') {
      text = "🎯 目標：抵達終點";
    } else if (cond.type === 'kill_enemies') {
      text = `🎯 目標：\n1. 擊殺怪物 (${this.enemiesKilled}/${cond.targetValue})\n2. 抵達終點`;
    } else if (cond.type === 'collect_keys') {
      text = `🎯 目標：\n1. 收集鑰匙 (${this.keysCollected}/${cond.targetValue})\n2. 抵達終點`;
    } else if (cond.type === 'exterminate') {
      text = `🎯 目標：\n1. 殲滅所有病毒 (剩餘 ${this.enemies.length})\n2. 抵達終點`;
    }

    // 發送到 Vue 介面
    window.dispatchEvent(new CustomEvent('tower-objective-updated', { detail: text }));
  }

  showFloorObjective() {
      const condition = this.levelConfig.winCondition;
      let msg = "";
      if (condition.type === 'kill_enemies') {
          msg = `本層目標：擊殺至少 ${condition.targetValue} 隻病毒！`;
      } else if (condition.type === 'collect_keys') {
          msg = `本層目標：收集 ${condition.targetValue} 把資料金鑰以解鎖終端機！`;
      } else if (condition.type === 'exterminate') {
          msg = `本層目標：殲滅所有病毒！`;
      }
      
      if (msg) {
          this.time.delayedCall(500, () => {
              this.showErrorMessage(msg, '#1d4ed8', '#1e3a8a'); 
          });
      }
  }

  setupGrid() {
    const canvasWidth = this.scale.width;
    const canvasHeight = this.scale.height;
    const padding = 80; 

    const maxTileW = (canvasWidth - padding) / this.cols;
    const maxTileH = (canvasHeight - padding) / this.rows;
    this.tileSize = Math.floor(Math.min(maxTileW, maxTileH));
    this.tileSize = Phaser.Math.Clamp(this.tileSize, 32, 120);

    const mapWidth = this.cols * this.tileSize;
    const mapHeight = this.rows * this.tileSize;
    this.startX = (canvasWidth - mapWidth) / 2 + this.tileSize / 2;
    this.startY = (canvasHeight - mapHeight) / 2 + this.tileSize / 2;

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const px = this.startX + x * this.tileSize;
        const py = this.startY + y * this.tileSize;
        this.add.rectangle(px, py, this.tileSize - 2, this.tileSize - 2, 0x1E1E2E)
            .setStrokeStyle(2, 0x2A2A40);
      }
    }
  }

  // 🌟 修改：讓玩家隨機生成在任意位置
  setupPlayer() {
    this.playerGridX = Phaser.Math.Between(0, this.cols - 1);
    this.playerGridY = Phaser.Math.Between(0, this.rows - 1);
    this.playerFacing = { dx: 0, dy: -1 }; 

    const px = this.startX + this.playerGridX * this.tileSize;
    const py = this.startY + this.playerGridY * this.tileSize;

    this.player = this.add.rectangle(px, py, this.tileSize * 0.7, this.tileSize * 0.7, 0x6366f1)
        .setStrokeStyle(3, 0xffffff)
        .setDepth(10);
  }

  generateLevel() {
    // 🌟 生成終點 (在玩家之後生成，確保不會蓋在玩家身上)
    this.spawnTerminal();

    const wallCount = Math.floor(this.cols * this.rows * 0.20); 
    this.spawnWalls(wallCount);

    for (let i = 0; i < this.levelConfig.enemyCount; i++) {
      const enemyIds = this.levelConfig.allowedEnemies;
      const enemyId = Phaser.Utils.Array.GetRandom(enemyIds) || 'patrol_bug';
      if (ENEMY_DICT && ENEMY_DICT[enemyId]) this.spawnEnemy(enemyId);
    }

    const hazardCount = Math.floor(this.cols / 3);
    for (let i = 0; i < hazardCount; i++) {
      if (!HAZARD_DICT) break;
      const hazardIds = Object.keys(HAZARD_DICT);
      const hazardId = Phaser.Utils.Array.GetRandom(hazardIds);
      this.spawnHazard(hazardId);
    }

    this.spawnCoins(3);
    
    if (this.levelConfig.keyCount > 0) {
        this.spawnKeys(this.levelConfig.keyCount);
    }
  }

  spawnKeys(count) {
    for (let i = 0; i < count; i++) {
      const pos = this.getRandomEmptyGrid();
      if (!pos) break;
      const fontSize = Math.floor(this.tileSize * 0.6) + 'px';
      const sprite = this.add.text(pos.px, pos.py, '🔑', { fontSize }).setOrigin(0.5);
      this.keys.push({ gx: pos.gx, gy: pos.gy, sprite });
    }
  }

  async executeTurnSequence(commands) {
    if (!commands || commands.length === 0) return;
    console.log("🤖 積木序列開始執行...", commands);

    let i = 0;
    while (i < commands.length) {
      const cmd = commands[i];
      const skillName = typeof cmd === 'string' ? cmd : cmd.id;
      
      const isProgrammable = ['shoot', 'laser', 'boomerang'].includes(skillName);
      const nextCmd = commands[i + 1];
      const nextSkillName = nextCmd ? (typeof nextCmd === 'string' ? nextCmd : nextCmd.id) : null;
      const hasLogicNext = nextSkillName && ['if', 'for', 'while'].includes(nextSkillName);

      if (isProgrammable && hasLogicNext) {
        const behaviorArray = commands.slice(i + 1).map(c => typeof c === 'string' ? c : c.id);
        const customBehavior = compileToBehavior(behaviorArray);
        await SKILL_DICT[skillName](this, { behavior: customBehavior });
        break; 
      } else {
        await this.runPlayerCommand(cmd);
      }

      const moveCommands = ['moveUp', 'moveDown', 'moveLeft', 'moveRight'];
      if (moveCommands.includes(skillName)) await this.processEnemyTurns();

      await new Promise(r => setTimeout(r, 150));
      i++;
    }
  }

  async runPlayerCommand(cmd) {
    let tx = this.playerGridX;
    let ty = this.playerGridY;

    const skillName = typeof cmd === 'string' ? cmd : cmd.id;
    const skillArgs = typeof cmd === 'string' ? {} : (cmd.args || {});

    const moveSkills = ['moveUp', 'moveDown', 'moveLeft', 'moveRight'];
    
    if (moveSkills.includes(skillName)) {
      if (skillName === 'moveUp') { ty -= 1; this.playerFacing = { dx: 0, dy: -1 }; }
      else if (skillName === 'moveDown') { ty += 1; this.playerFacing = { dx: 0, dy: 1 }; }
      else if (skillName === 'moveLeft') { tx -= 1; this.playerFacing = { dx: -1, dy: 0 }; }
      else if (skillName === 'moveRight') { tx += 1; this.playerFacing = { dx: 1, dy: 0 }; }
      
      const isOutOfBounds = tx < 0 || tx >= this.cols || ty < 0 || ty >= this.rows;
      const isWall = this.walls.some(w => w.gx === tx && w.gy === ty);
      const isEnemy = this.enemies.some(e => e.gx === tx && e.gy === ty);

      if (!isOutOfBounds && !isWall && !isEnemy) {
        this.playerGridX = tx;
        this.playerGridY = ty;
        const px = this.startX + tx * this.tileSize;
        const py = this.startY + ty * this.tileSize;

        await new Promise(resolve => {
          this.tweens.add({ targets: this.player, x: px, y: py, duration: 200, onComplete: resolve });
        });
        
        // 移動完畢後立即檢查腳底
        this.checkInteractions();
        return;
      } else {
        this.cameras.main.shake(100, 0.005);
        await new Promise(resolve => {
          this.tweens.add({
            targets: this.player,
            x: this.player.x + (tx > this.playerGridX ? 10 : tx < this.playerGridX ? -10 : 0),
            y: this.player.y + (ty > this.playerGridY ? 10 : ty < this.playerGridY ? -10 : 0),
            yoyo: true, duration: 100, onComplete: resolve
          });
        });
        return;
      }
    } 
    else if (SKILL_DICT && SKILL_DICT[skillName]) {
      await SKILL_DICT[skillName](this, skillArgs);
    }
  }

  playerAttackEffect() {
    this.player.fillColor = 0xff0000;
    setTimeout(() => { this.player.fillColor = 0x6366f1; }, 300);

    const targetX = this.playerGridX + this.playerFacing.dx;
    const targetY = this.playerGridY + this.playerFacing.dy;

    const px = this.startX + targetX * this.tileSize;
    const py = this.startY + targetY * this.tileSize;
    const slash = this.add.text(px, py, '💥', { fontSize: Math.floor(this.tileSize*0.8) + 'px' }).setOrigin(0.5);
    
    this.tweens.add({ targets: slash, scale: 1.5, alpha: 0, duration: 300, onComplete: () => slash.destroy() });
    this.damageEnemyAt(targetX, targetY);
  }

  damageEnemyAt(tx, ty) {
    const enemyIndex = this.enemies.findIndex(e => e.gx === tx && e.gy === ty);
    if (enemyIndex !== -1) {
      const enemy = this.enemies[enemyIndex];
      this.cameras.main.shake(150, 0.015); 
      
      const px = this.startX + tx * this.tileSize;
      const py = this.startY + ty * this.tileSize;
      const hitEffect = this.add.text(px, py, '💥', { fontSize: this.tileSize + 'px' }).setOrigin(0.5);
      this.tweens.add({ targets: hitEffect, scale: 1.5, alpha: 0, duration: 200, onComplete: () => hitEffect.destroy() });

      enemy.sprite.destroy();
      this.enemies.splice(enemyIndex, 1);
      
      this.enemiesKilled++;
      this.updateObjectiveUI(); 
      window.dispatchEvent(new CustomEvent('tower-coin-collected', { detail: { amount: 10 } }));
      
      // 如果目標是全殲且正好全滅，且目前站在終點上，直接觸發過關
      if (this.levelConfig.winCondition.type === 'exterminate' && this.enemies.length === 0) {
          if (this.playerGridX === this.terminal.gx && this.playerGridY === this.terminal.gy) {
              window.dispatchEvent(new CustomEvent('tower-floor-cleared'));
          }
      }
      return true;
    }
    return false;
  }

  async processEnemyTurns() {
    const promises = this.enemies.map(enemy => {
      return new Promise(resolve => {
        // 目前預留給 Enemy 邏輯
        resolve();
      });
    });
    await Promise.all(promises);
  }
  
  checkWinCondition() {
      const condition = this.levelConfig.winCondition;
      
      if (condition.type === 'reach_goal') {
        return true; 
      } 
      else if (condition.type === 'kill_enemies') {
        if (this.enemiesKilled >= condition.targetValue) {
          return true;
        } else {
          return false;
        }
      } 
      else if (condition.type === 'collect_keys') {
        if (this.keysCollected >= condition.targetValue) {
          return true;
        } else {
          return false;
        }
      }
      else if (condition.type === 'exterminate') {
         if (this.enemies.length === 0) return true;
         return false;
      }
      
      return false;
  }

  checkInteractions() {
    // 終點互動邏輯
    if (this.playerGridX === this.terminal.gx && this.playerGridY === this.terminal.gy) {
      if (this.checkWinCondition()) {
          console.log("🏁 達成通關條件，準備發送通關事件！");
          window.dispatchEvent(new CustomEvent('tower-floor-cleared'));
      } else {
          console.log("❌ 抵達終點，但未達成通關條件！");
          this.showErrorMessage("尚未達成任務目標，終端機存取被拒！", "#b91c1c", "#7f1d1d");
          this.cameras.main.shake(200, 0.015);
          
          // 往反方向彈開
          this.playerGridX -= this.playerFacing.dx;
          this.playerGridY -= this.playerFacing.dy;
          
          const px = this.startX + this.playerGridX * this.tileSize;
          const py = this.startY + this.playerGridY * this.tileSize;
          this.tweens.add({ targets: this.player, x: px, y: py, duration: 200, ease: 'Bounce.easeOut' });
      }
    }

    // 陷阱
    this.hazards.forEach(hazard => {
      if (this.playerGridX === hazard.gx && this.playerGridY === hazard.gy) {
        if(HAZARD_DICT && HAZARD_DICT[hazard.id]) {
           HAZARD_DICT[hazard.id].effect({ 
             name: '機甲', 
             takeDamage: (dmg) => window.dispatchEvent(new CustomEvent('tower-player-hurt', { detail: { damage: dmg } }))
           });
        }
      }
    });

    // 金幣
    const coinIndex = this.coins.findIndex(c => c.gx === this.playerGridX && c.gy === this.playerGridY);
    if (coinIndex !== -1) {
      this.coins[coinIndex].sprite.destroy(); 
      this.coins.splice(coinIndex, 1);
      window.dispatchEvent(new CustomEvent('tower-coin-collected', { detail: { amount: 20 } }));
    }
    
    // 鑰匙
    const keyIndex = this.keys.findIndex(k => k.gx === this.playerGridX && k.gy === this.playerGridY);
    if (keyIndex !== -1) {
      this.keys[keyIndex].sprite.destroy();
      this.keys.splice(keyIndex, 1);
      this.keysCollected++;
      this.updateObjectiveUI();
      this.showErrorMessage(`🔑 獲得資料金鑰！(${this.keysCollected}/${this.levelConfig.winCondition.targetValue})`, '#047857', '#065f46');
    }
  }

  spawnWalls(count) {
    for (let i = 0; i < count; i++) {
      const pos = this.getRandomEmptyGrid();
      if (!pos) break; 
      
      const sprite = this.add.rectangle(pos.px, pos.py, this.tileSize - 4, this.tileSize - 4, 0x475569)
          .setStrokeStyle(2, 0x1e293b);
      this.walls.push({ gx: pos.gx, gy: pos.gy, sprite });
    }
  }

  spawnCoins(count) {
    for (let i = 0; i < count; i++) {
      const pos = this.getRandomEmptyGrid();
      if (!pos) break;
      const fontSize = Math.floor(this.tileSize * 0.5) + 'px';
      const sprite = this.add.text(pos.px, pos.py, '🪙', { fontSize }).setOrigin(0.5);
      this.coins.push({ gx: pos.gx, gy: pos.gy, sprite });
    }
  }

  spawnEnemy(id) {
    const pos = this.getRandomEmptyGrid();
    if (!pos) return;
    const fontSize = Math.floor(this.tileSize * 0.6) + 'px';
    const sprite = this.add.text(pos.px, pos.py, '👾', { fontSize }).setOrigin(0.5);
    this.enemies.push({ id, gx: pos.gx, gy: pos.gy, sprite });
  }

  spawnHazard(id) {
    const pos = this.getRandomEmptyGrid();
    if (!pos) return;
    const fontSize = Math.floor(this.tileSize * 0.6) + 'px';
    const sprite = this.add.text(pos.px, pos.py, '⚠️', { fontSize }).setOrigin(0.5);
    this.hazards.push({ id, gx: pos.gx, gy: pos.gy, sprite });
  }

  // 🌟 修改：讓終點生成時與玩家保持一定距離
  spawnTerminal() {
    let pos = null;
    let attempts = 0;
    
    // 嘗試找到一個距離玩家夠遠的空格
    do {
      const tempPos = this.getRandomEmptyGrid();
      if (!tempPos) break;
      
      const distance = Math.abs(tempPos.gx - this.playerGridX) + Math.abs(tempPos.gy - this.playerGridY);
      if (distance >= Math.floor(this.cols / 1.5)) { // 確保至少有一半地圖以上的曼哈頓距離
        pos = tempPos;
      }
      attempts++;
    } while (!pos && attempts < 100);

    // 如果找不到夠遠的，就隨便抓個空格
    if (!pos) {
      pos = this.getRandomEmptyGrid();
    }
    
    // 最後的防呆機制
    if (!pos) {
      pos = { gx: this.cols - 1, gy: 0 };
    }

    const px = this.startX + pos.gx * this.tileSize;
    const py = this.startY + pos.gy * this.tileSize;
    
    let terminalColor = 0x00ff00;
    if (this.levelConfig.winCondition.type === 'collect_keys') terminalColor = 0xeab308; 
    if (this.levelConfig.winCondition.type === 'kill_enemies' || this.levelConfig.winCondition.type === 'exterminate') terminalColor = 0xef4444;

    const sprite = this.add.rectangle(px, py, this.tileSize, this.tileSize, terminalColor, 0.3);
    const fontSize = Math.floor(this.tileSize * 0.6) + 'px';
    this.add.text(px, py, '🏁', { fontSize }).setOrigin(0.5);
    
    this.terminal = { gx: pos.gx, gy: pos.gy, sprite };
  }

  isGridEmpty(gx, gy) {
    if (this.playerGridX === gx && this.playerGridY === gy) return false;
    if (this.terminal && this.terminal.gx === gx && this.terminal.gy === gy) return false;
    if (this.walls.some(w => w.gx === gx && w.gy === gy)) return false;
    if (this.enemies.some(e => e.gx === gx && e.gy === gy)) return false;
    if (this.hazards.some(h => h.gx === gx && h.gy === gy)) return false;
    if (this.coins.some(c => c.gx === gx && c.gy === gy)) return false;
    if (this.keys.some(k => k.gx === gx && k.gy === gy)) return false; 
    return true;
  }

  getRandomEmptyGrid() {
    let gx, gy, attempts = 0;
    do {
      gx = Phaser.Math.Between(0, this.cols - 1);
      gy = Phaser.Math.Between(0, this.rows - 1);
      attempts++;
      if (attempts > 200) return null; 
    } while (!this.isGridEmpty(gx, gy));

    return {
      gx, gy,
      px: this.startX + gx * this.tileSize,
      py: this.startY + gy * this.tileSize
    };
  }

  getGridFromPointer(pointer) {
    const gx = Math.round((pointer.x - this.startX) / this.tileSize);
    const gy = Math.round((pointer.y - this.startY) / this.tileSize);
    return { gx, gy };
  }

  findPath(startX, startY, targetX, targetY) {
    if (startX === targetX && startY === targetY) return [];

    const queue = [{ x: startX, y: startY, path: [] }];
    const visited = new Set([`${startX},${startY}`]);
    const dirs = [
      { dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }, 
      { dx: -1, dy: -1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: 1, dy: 1 } 
    ];

    while (queue.length > 0) {
      const { x, y, path } = queue.shift();
      if (x === targetX && y === targetY) return path;

      for (let { dx, dy } of dirs) {
        const nx = x + dx;
        const ny = y + dy;

        if (nx < 0 || nx >= this.cols || ny < 0 || ny >= this.rows) continue;
        if (this.walls.some(w => w.gx === nx && w.gy === ny)) continue;

        if (dx !== 0 && dy !== 0) {
          const hasWallX = this.walls.some(w => w.gx === x + dx && w.gy === y);
          const hasWallY = this.walls.some(w => w.gx === x && w.gy === y + dy);
          if (hasWallX || hasWallY) continue; 
        }

        const key = `${nx},${ny}`;
        if (!visited.has(key)) {
          visited.add(key);
          queue.push({ x: nx, y: ny, path: [...path, { x: nx, y: ny }] });
        }
      }
    }
    return null; 
  }

  // === 🚀 終極進階版：防呆純文字編譯引擎 + 報錯系統 ===
  async executeRawCode(userCodeStr) {
    console.log("📜 原始玩家程式碼:\n", userCodeStr);

    let safeCode = userCodeStr;
    
    safeCode = safeCode.replace(/function\s+(\w+)\s*\(/g, "async function $1(");
    safeCode = safeCode.replace(/const\s+(\w+)\s*=\s*(?:async\s*)?\((.*?)\)\s*=>/g, "const $1 = async ($2) =>");
    safeCode = safeCode.replace(/let\s+(\w+)\s*=\s*(?:async\s*)?\((.*?)\)\s*=>/g, "let $1 = async ($2) =>");

    safeCode = safeCode.replace(/(?:p\.)?(?:moveUp|moveDown|moveLeft|moveRight|returnToPlayer|shoot|laser|bomb|boomerang|attack|dash)\s*\(/g, (match) => {
      return "await " + match;
    });

    safeCode = safeCode.replace(/await\s+await\s+/g, "await ");

    const shoot = async (behaviorFunc) => {
        if (typeof behaviorFunc !== 'function') {
            throw new Error("shoot 指令裡面必須放入「定義好的行為」，例如：shoot(arrow)");
        }
        await SKILL_DICT['shoot'](this, { behavior: behaviorFunc });
    };
    const laser = async (behaviorFunc) => await SKILL_DICT['laser'](this, { behavior: behaviorFunc });
    const boomerang = async (behaviorFunc) => await SKILL_DICT['boomerang'](this, { behavior: behaviorFunc });
    const bomb = async (args) => await SKILL_DICT['bomb'](this, args);
    const attack = async (args) => await SKILL_DICT['attack'](this, args);
    const dash = async (args) => await SKILL_DICT['dash'](this, args);
    
    // 🌟 確保在純文字編譯環境中，移動後也要讓怪物執行動作 (processEnemyTurns)
    const moveWithTurns = async (dir) => {
        await this.runPlayerCommand(dir);
        await this.processEnemyTurns();
    };

    const moveUp = async () => await moveWithTurns('moveUp');
    const moveDown = async () => await moveWithTurns('moveDown');
    const moveLeft = async () => await moveWithTurns('moveLeft');
    const moveRight = async () => await moveWithTurns('moveRight');
    
    const isWall = (dx = this.playerFacing.dx, dy = this.playerFacing.dy) => {
      const tx = this.playerGridX + dx;
      const ty = this.playerGridY + dy;
      return this.walls.some(w => w.gx === tx && w.gy === ty);
    };

    const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;

    try {
      const runUserLogic = new AsyncFunction(
        'shoot', 'laser', 'boomerang', 'bomb', 'attack', 'dash', 
        'moveUp', 'moveDown', 'moveLeft', 'moveRight', 'isWall',
        `"use strict";\n${safeCode}`
      );

      await runUserLogic(shoot, laser, boomerang, bomb, attack, dash, moveUp, moveDown, moveLeft, moveRight, isWall);
      console.log("✅ 玩家程式碼執行完畢！");

    } catch (err) {
      console.error("❌ 程式錯誤：", err.message);
      this.cameras.main.shake(150, 0.01);
      this.showErrorMessage(err.message);
    }
  }

  showErrorMessage(message, bgColor = '#b91c1c', strokeColor = '#7f1d1d') {
    let translatedMsg = message;
    
    if (bgColor === '#b91c1c') {
        if (message.includes("is not defined")) {
          const varName = message.split(" ")[0];
          translatedMsg = `找不到叫做「${varName}」的變數或指令。\n請檢查是不是拼錯字了？`;
        } else if (message.includes("Unexpected token") || message.includes("Unexpected identifier")) {
          translatedMsg = `語法結構錯誤！\n請檢查有沒有少寫括號 ()、大括號 {} 或是分號 ; ？`;
        } else if (message.includes("is not a function")) {
          const match = message.match(/(?:p\.)?(\w+) is not a function/);
          if (match) {
             translatedMsg = `沒有「${match[1]}」這個指令！\n請檢查大小寫或是否拼錯字了。`;
          } else {
             translatedMsg = `這不是一個可執行的指令，\n請確認括號 () 的用法！`;
          }
        } else if (message.includes("Cannot read properties of undefined")) {
          translatedMsg = `發生了未知的錯誤，\n可能是某個變數忘記給值了！`;
        }
    }

    const textStyle = { 
        fontSize: '18px', 
        fontFamily: 'monospace',
        color: '#ffffff', 
        backgroundColor: bgColor, 
        padding: { x: 15, y: 15 },
        stroke: strokeColor,
        strokeThickness: 2,
        align: 'center',
        wordWrap: { width: this.scale.width * 0.8 }
    };
    
    const displayMsg = bgColor === '#b91c1c' ? `🐛 系統回報：\n\n${translatedMsg}` : translatedMsg;

    const errorText = this.add.text(this.scale.width / 2, this.scale.height / 2, displayMsg, textStyle)
        .setOrigin(0.5)
        .setDepth(100)
        .setAlpha(0);

    this.tweens.add({
        targets: errorText,
        alpha: 1,
        y: this.scale.height / 2 - 30,
        duration: 300,
        ease: 'Back.out',
        onComplete: () => {
            this.time.delayedCall(4000, () => {
                this.tweens.add({
                    targets: errorText,
                    alpha: 0,
                    y: errorText.y - 20,
                    duration: 300,
                    onComplete: () => errorText.destroy()
                });
            });
        }
    });
  }

  startTargeting() {
    if (!this.ENABLE_AIMING_UI) {
      const dx = this.playerFacing.dx;
      const dy = this.playerFacing.dy;
      window.dispatchEvent(new CustomEvent('tower-target-selected', {
        detail: { dx: dx, dy: dy, distance: 1, fullPath: [] } 
      }));
      return;
    }
    this.isTargeting = true;
    this.targetingOverlay.setVisible(true);
  }

  cancelTargeting() {
    this.isTargeting = false;
    this.targetHighlight.setVisible(false);
    this.targetingOverlay.setVisible(false); 
    this.aimingLine.clear(); 
    this.cameras.main.clearTint();
  }

  finishTargeting(gx, gy, providedPath = null) {
    this.isTargeting = false;
    this.targetHighlight.setVisible(false);
    this.targetingOverlay.setVisible(false); 
    this.aimingLine.clear(); 
    
    const path = providedPath || this.findPath(this.playerGridX, this.playerGridY, gx, gy);
    if (!path) return;

    let dx = gx - this.playerGridX;
    let dy = gy - this.playerGridY;
    window.dispatchEvent(new CustomEvent('tower-target-selected', {
      detail: { dx: dx, dy: dy, distance: path.length, fullPath: path } 
    }));
  }
}