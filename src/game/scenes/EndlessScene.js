import Phaser from 'phaser';
import { ENEMY_DICT } from '../config/Enemies';
import { HAZARD_DICT } from '../config/Hazards';
import { ROOM_TYPES, FLOOR_CONFIG } from '../config/LevelRules';
import { SKILL_DICT, compileToBehavior } from '../config/PlayerSkills';
import { COMMAND_DICT } from '../config/CommandList';
import arcaneRunnerUrl from '../../assets/dungeon/arcane-runner.png';
import luminousSlimeUrl from '../../assets/dungeon/slime-luminous.png';
import goblinUrl from '../../assets/dungeon/goblin.png';
import skeletonUrl from '../../assets/dungeon/skeleton.png';
import ghostUrl from '../../assets/dungeon/ghost.png';
import golemUrl from '../../assets/dungeon/golem.png';
import voidSpiderUrl from '../../assets/dungeon/void-spider.png';
import demonBossUrl from '../../assets/dungeon/demon-boss.png';

const DUNGEON_TEXTURES = {
  'dungeon-hero': arcaneRunnerUrl,
  'dungeon-slime': luminousSlimeUrl,
  'dungeon-goblin': goblinUrl,
  'dungeon-skeleton': skeletonUrl,
  'dungeon-ghost': ghostUrl,
  'dungeon-golem': golemUrl,
  'dungeon-void-spider': voidSpiderUrl,
  'dungeon-demon-boss': demonBossUrl
};

const ENEMY_TEXTURE_KEYS = {
  patrol_bug: 'dungeon-void-spider',
  tracker_virus: 'dungeon-void-spider',
  slime: 'dungeon-slime',
  goblin: 'dungeon-goblin',
  skeleton: 'dungeon-skeleton',
  ghost: 'dungeon-ghost',
  golem: 'dungeon-golem',
  void_creeper: 'dungeon-void-spider',
  boss_bat: 'dungeon-demon-boss',
  boss_skeleton_king: 'dungeon-skeleton',
  boss_demon_lord: 'dungeon-demon-boss',
  boss_shadow_stalker: 'dungeon-ghost',
  boss_dragon: 'dungeon-demon-boss',
  boss_reaper: 'dungeon-ghost',
  boss_titan: 'dungeon-golem',
  boss_hydra: 'dungeon-void-spider',
  boss_lich: 'dungeon-ghost',
  boss_abyss_god: 'dungeon-demon-boss'
};

const AP_COSTS = COMMAND_DICT.reduce((map, cmd) => {
  map[cmd.id] = cmd.ap !== undefined ? cmd.ap : 1;
  return map;
}, {});

// === 🌟 自訂錯誤類別：斷電中斷 ===
class OutOfAPError extends Error {
  constructor(message) {
    super(message);
    this.name = "OutOfAPError";
  }
}

export default class EndlessScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EndlessScene' });
  }

  preload() {
    Object.entries(DUNGEON_TEXTURES).forEach(([key, url]) => {
      if (!this.textures.exists(key)) this.load.image(key, url);
    });
  }

  // ==========================================
  // 1. 初始化與生命週期 (Init & Lifecycle)
  // ==========================================
  init(data) {
    this.currentFloor = data?.floor;
    this.mapData = data?.mapData;
    this.isGameOverInterrupted = false;

    this.sessionKills = this.sessionKills || 0;
    this.sessionBossKills = this.sessionBossKills || 0;
    this.sessionPassives = this.sessionPassives || 0;

    if (this.currentFloor === 1 || this.currentFloor === undefined) {
       this.sessionKills = 0;
       this.sessionBossKills = 0;
       this.sessionPassives = 0;
    }

    if (this.currentFloor === undefined) {
      const event = new CustomEvent('tower-request-init-data', { detail: { data: {} } });
      window.dispatchEvent(event);
      this.currentFloor = event.detail.data.floor || 1;
      this.mapData = event.detail.data.mapData || null;
    }
    
    console.log(`🎮 [EndlessScene] 初始化樓層: ${this.currentFloor}`);
    this.levelConfig = FLOOR_CONFIG ? FLOOR_CONFIG.getDifficulty(this.currentFloor) : { gridSize: 10, enemyCount: 2, allowedEnemies: ['patrol_bug'], winCondition: { type: 'reach_goal' } };

    this.turnCounter = 1;
    this.isPlayerTurn = true;
  }

  create() {
    console.log("📜 [EndlessScene] 展開地下城地圖卷軸...");
    
    // 🌟 1. 設定畫布背景底色 (深色石板/泥土感)
    this.cameras.main.setBackgroundColor(0x150C08); // 深邃的地下城暗角底色

    // 初始化陣列與狀態
    this.enemies = [];
    this.hazards = [];
    this.walls = [];
    this.coins = [];
    this.keys = [];
    this.relics = [];
    this.terminal = null; // 奇幻化：通往下層的古代石碑/傳送陣
    this.enemiesKilled = 0;
    this.keysCollected = 0;
    this.playerAttack = 10;

    // 回合與 AP(行動耐力) 系統初始化
    this.currentAp = this.maxAp;
    this.turnCounter = 1;
    this.isPlayerTurn = true;
    this.isGameOverInterrupted = false;
    
    // 網格設定
    const baseSize = this.levelConfig.gridSize || 10; 
    const extraSize = Math.floor(this.currentFloor / 3);
    this.cols = Math.min(baseSize + extraSize, 20); 
    this.rows = this.cols;
    this.tileSize = 64; 

    this.setupGrid();

    // 監聽晶片(遺物)安裝
    const onAddRelic = (e) => {
        if (!this.relics.includes(e.detail)) {
            this.relics.push(e.detail);
            this.sessionPassives++; // 🌟 新增這行：累加被動技能獲取數量
        }
        console.log("💎 當前已獲得女神祝福(遺物):", this.relics);
    };
    window.addEventListener('tower-add-relic', onAddRelic);

    // 地圖生成或讀檔
    if (this.mapData) {
      this.restoreMapState(this.mapData);
    } else {
      this.setupPlayer();
      this.generateLevel();
    }

    // 🌟 2. UI 瞄準系統 (魔法軌跡)
    this.isTargeting = false;
    this.ENABLE_AIMING_UI = false; 
    
    // 遮罩：施法時的暗角
    this.targetingOverlay = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0x000000, 0.7).setDepth(40).setVisible(false);
    
    // 目標高光：從螢光綠改成「發光的魔法金框」
    this.targetHighlight = this.add.rectangle(0, 0, this.tileSize, this.tileSize, 0xDAA520, 0.3)
      .setStrokeStyle(3, 0xFFD700, 0.8) // 金色邊框
      .setDepth(50)
      .setVisible(false);
      
    // 瞄準線：魔法流動軌跡
    this.aimingLine = this.add.graphics().setDepth(45);

    // 綁定輸入事件 (滑鼠/觸控描繪法術軌跡)
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

          // ✨ 可行走路徑：魔力流動的金色軌跡
          this.aimingLine.lineStyle(5, 0xDAA520, 0.8); 
          this.aimingLine.beginPath();
          this.aimingLine.moveTo(this.startX + this.playerGridX * this.tileSize, this.startY + this.playerGridY * this.tileSize);
          for (let p of path) {
            this.aimingLine.lineTo(this.startX + p.x * this.tileSize, this.startY + p.y * this.tileSize);
          }
          this.aimingLine.strokePath();
        } else {
          // 🩸 死路/障礙物：魔力斷絕的暗紅色
          this.aimingLine.lineStyle(5, 0x8B0000, 0.6); 
          this.aimingLine.beginPath();
          this.aimingLine.moveTo(this.startX + this.playerGridX * this.tileSize, this.startY + this.playerGridY * this.tileSize);
          this.aimingLine.lineTo(this.startX + gx * this.tileSize, this.startY + gy * this.tileSize);
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
          console.log("❌ 死路！法術軌跡被阻擋。");
          this.cameras.main.shake(200, 0.015); // 增加一點死路的碰撞震動感
          return; 
        }
        this.finishTargeting(gx, gy, path);
      }
    });

    // === 🌟 核心：因果律狀態機接管玩家詠唱 ===
    this.events.off('PLAYER_EXECUTE');
    this.events.on('PLAYER_EXECUTE', async (payload) => {
      if (!this.isPlayerTurn) {
          console.log("⏳ 施法硬直中！魔力尚未平息。");
          return;
      }
      this.isPlayerTurn = false;

      // 1. 執行玩家回合 (法術詠唱)
      if (typeof payload === 'string') {
          await this.executeRawCode(payload); 
      } else {
          await this.executeTurnSequence(payload); 
      }

      // 2. 檢查石碑/下層傳送陣 (如果破關，直接 return 終止後續)
      if (this.checkTerminalState()) return; 

      // 3. 怪物回合 (魔物行動)
      await this.processEnemyTurns();

      // 4. 重置回合 (魔力回充)
      this.resetTurn();
    }, this);

    const onStartTargeting = () => this.startTargeting();
    const onCancelTargeting = () => this.cancelTargeting();
    const onRetryGame = () => {
       console.log("🔄 [Phaser] 時光倒流：重新載入迷宮...");
       
       this.isGameOverInterrupted = false; // 解除死亡鎖定
       
       // 強制傳入 floor: 1 以及空的 mapData，保證地圖重骰！
       this.scene.restart({ floor: 1, mapData: null });
    };
    const onSyncStats = (e) => {
        this.playerAttack = e.detail.attack;
        
        // 如果是滿 AP 的狀態 (通常是剛換層)，就連當前 AP 一起擴充
        if (this.currentAp === this.maxAp) {
            this.maxAp = e.detail.maxAp;
            this.currentAp = this.maxAp;
        } else {
            this.maxAp = e.detail.maxAp;
        }
        this.emitApUpdate(); // 通知 UI 更新行動耐力
    };
    window.addEventListener('tower-retry-game', onRetryGame);
    window.addEventListener('tower-start-targeting', onStartTargeting);
    window.addEventListener('tower-cancel-targeting', onCancelTargeting);
    window.addEventListener('tower-sync-player-stats', onSyncStats);

    this.events.once('shutdown', () => {
      console.log("🧹 [EndlessScene] 地圖卷軸收起，清理法力殘留...");
      window.removeEventListener('tower-start-targeting', onStartTargeting);
      window.removeEventListener('tower-cancel-targeting', onCancelTargeting);
      window.removeEventListener('tower-add-relic', onAddRelic);
    });
    
    this.showFloorObjective();
    this.updateObjectiveUI();
    this.emitApUpdate();
    this.updateEnemyRadar();
    window.dispatchEvent(new CustomEvent('tower-turn-started', { detail: { turn: this.turnCounter } }));
    
    // 🌟 收到死亡信號，立刻切斷所有法術詠唱
    window.addEventListener('tower-game-over-triggered', () => {
       this.isGameOverInterrupted = true;
    });
  }

  // ==========================================
  // 2. 回合與資源管理 (Turn & AP Management)
  // ==========================================
  emitApUpdate() {
    window.dispatchEvent(new CustomEvent('tower-update-ap', { 
        detail: { current: this.currentAp, max: this.maxAp, turn: this.turnCounter } 
    }));
  }

  resetTurn() {
    this.turnCounter++;
    this.currentAp = this.maxAp;
    this.isPlayerTurn = true;
    this.emitApUpdate();
    window.dispatchEvent(new CustomEvent('tower-turn-started', { detail: { turn: this.turnCounter } }));
    console.log(`🔄 第 ${this.turnCounter} 回合，AP 重置為 ${this.maxAp}。`);
  }

  // ==========================================
  // 3. 遊戲編譯器與執行器 (Execution Pipeline)
  // ==========================================
  
  // A. 處理積木序列
  async executeTurnSequence(commands) {
    if (this.isGameOverInterrupted) return;
    if (!commands || commands.length === 0) return;
    console.log("🤖 積木序列開始執行...", commands);

    let i = 0;
    while (i < commands.length) {
      const cmd = commands[i];
      const skillName = typeof cmd === 'string' ? cmd : cmd.id;
      
      // 動態扣除 AP
      const cost = AP_COSTS[skillName] || 1;
      if (this.currentAp < cost) {
          this.showBlackoutEffect();
          this.showErrorMessage(`⚡ AP 不足！無法執行: ${skillName}`, '#b91c1c', '#7f1d1d');
          break; // AP 不足，中斷回合
      }
      this.currentAp -= cost;
      this.emitApUpdate();

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

      await new Promise(r => setTimeout(r, 150));
      i++;
    }
  }

  // B. 處理玩家純文字程式碼 (補回的重要功能)
  async executeRawCode(userCodeStr) {
    if (this.isGameOverInterrupted) return;
    console.log("📜 原始玩家程式碼:\n", userCodeStr);

    let safeCode = userCodeStr;
    safeCode = safeCode.replace(/function\s+(\w+)\s*\(/g, "async function $1(");
    safeCode = safeCode.replace(/const\s+(\w+)\s*=\s*(?:async\s*)?\((.*?)\)\s*=>/g, "const $1 = async ($2) =>");
    safeCode = safeCode.replace(/let\s+(\w+)\s*=\s*(?:async\s*)?\((.*?)\)\s*=>/g, "let $1 = async ($2) =>");
    safeCode = safeCode.replace(/(?:p\.)?(?:moveUp|moveDown|moveLeft|moveRight|returnToPlayer|shoot|laser|bomb|boomerang|attack|dash)\s*\(/g, (match) => "await " + match);
    safeCode = safeCode.replace(/await\s+await\s+/g, "await ");

    // ⚡ AP 扣除攔截器
    const checkAndDeductAP = (skillName) => {
        const cost = AP_COSTS[skillName] || 1;
        if (this.currentAp < cost) {
            throw new OutOfAPError(`指令 [${skillName}] 需要 ${cost} AP，剩餘 ${this.currentAp} AP。`);
        }
        this.currentAp -= cost;
        this.emitApUpdate();
    };

    const createSkillProxy = (skillName) => async (arg1, arg2, arg3) => {
        checkAndDeductAP(skillName); 
        let dx = this.playerFacing.dx, dy = this.playerFacing.dy, behavior = null;

        if (typeof arg1 === 'function') { behavior = arg1; } 
        else if (typeof arg1 === 'number' && typeof arg2 === 'number') { dx = Math.sign(arg1); dy = Math.sign(arg2); if (typeof arg3 === 'function') behavior = arg3; } 
        else if (typeof arg1 === 'object' && arg1 !== null) { if (arg1.dx !== undefined) dx = Math.sign(arg1.dx); if (arg1.dy !== undefined) dy = Math.sign(arg1.dy); if (arg1.behavior) behavior = arg1.behavior; }
        if (dx === 0 && dy === 0) { dx = this.playerFacing.dx; dy = this.playerFacing.dy; }

        await this.executeCombatSkill(skillName, dx, dy, behavior);
    };

    const attack = createSkillProxy('attack');
    const shoot = createSkillProxy('shoot');
    const laser = createSkillProxy('laser');
    const bomb = createSkillProxy('bomb');
    const boomerang = createSkillProxy('boomerang');

    const moveWithAP = async (dir) => {
        checkAndDeductAP(dir); 
        await this.runPlayerCommand(dir);
    };

    const moveUp = async () => await moveWithAP('moveUp');
    const moveDown = async () => await moveWithAP('moveDown');
    const moveLeft = async () => await moveWithAP('moveLeft');
    const moveRight = async () => await moveWithAP('moveRight');
    const dash = async (args) => { checkAndDeductAP('dash'); await SKILL_DICT['dash'](this, args); };
    
    const isWall = (dx = this.playerFacing.dx, dy = this.playerFacing.dy) => {
      return this.walls.some(w => w.gx === this.playerGridX + dx && w.gy === this.playerGridY + dy);
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
      if (err.name === 'OutOfAPError') {
          console.warn("⚡ 斷電中斷：", err.message);
          this.showBlackoutEffect();
          this.showErrorMessage("⚡ 斷電保護觸發！" + err.message, '#b45309', '#78350f');
      } else {
          console.error("❌ 程式錯誤：", err.message);
          this.cameras.main.shake(150, 0.01);
          this.showErrorMessage(err.message);
      }
    }
  }

  // C. 單一指令執行路由
  async runPlayerCommand(cmd) {
    if (this.isGameOverInterrupted) return;
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
        const fromX = this.playerGridX;
        const fromY = this.playerGridY;
        this.playerGridX = tx;
        this.playerGridY = ty;
        const px = this.startX + tx * this.tileSize;
        const py = this.startY + ty * this.tileSize;

        await this.playPlayerWalk(px, py, tx - fromX, ty - fromY);
        this.checkInteractions();
        this.updateEnemyRadar();
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
    else if (['attack', 'shoot', 'laser', 'bomb', 'boomerang'].includes(skillName)) {
        let dx = skillArgs.dx !== undefined ? Math.sign(skillArgs.dx) : this.playerFacing.dx;
        let dy = skillArgs.dy !== undefined ? Math.sign(skillArgs.dy) : this.playerFacing.dy;
        if (dx === 0 && dy === 0) { dx = this.playerFacing.dx; dy = this.playerFacing.dy; }
        
        await this.executeCombatSkill(skillName, dx, dy, skillArgs.behavior);
    }
    else if (SKILL_DICT && SKILL_DICT[skillName]) {
      await SKILL_DICT[skillName](this, skillArgs);
    }
  }

  // D. 戰鬥系統統一管線
  async executeCombatSkill(skillName, dx, dy, behaviorFunc, originX = null, originY = null) {
    const startX = originX !== null ? originX : this.playerGridX;
    const startY = originY !== null ? originY : this.playerGridY;

    // 記錄面向，並讓冒險者閃爍施法的魔力光芒
    if (originX === null) {
      this.playerFacing = { dx, dy };
      this.playCastEffect(this.player.x, this.player.y, skillName);
      this.playPlayerCastPose(dx, dy, skillName);
    }

    // 遺物判定：雙重連擊 (modifier_double)
    const hitCount = this.relics && this.relics.includes('modifier_double') ? 2 : 1;
    let targets = [{ dx, dy }];
    
    // 遺物判定：狂風劍氣/橫掃 (modifier_cleave)
    if (this.relics && this.relics.includes('modifier_cleave')) {
      if (dx !== 0 && dy === 0) { targets.push({ dx, dy: dy - 1 }); targets.push({ dx, dy: dy + 1 }); } 
      else if (dx === 0 && dy !== 0) { targets.push({ dx: dx - 1, dy }); targets.push({ dx: dx + 1, dy }); } 
      else if (dx !== 0 && dy !== 0) { targets.push({ dx: 0, dy }); targets.push({ dx, dy: 0 }); }
    }

    // 執行連擊迴圈
    for (let i = 0; i < hitCount; i++) {
      const promises = [];
      for (let t of targets) {
        if (skillName === 'attack') {
          // 基礎物理攻擊特效 (劍刃斬擊)
          const px = this.startX + (startX + t.dx) * this.tileSize;
          const py = this.startY + (startY + t.dy) * this.tileSize;
          this.playSlashEffect(px, py, Phaser.Math.RadToDeg(Phaser.Math.Angle.Between(0, 0, t.dx, t.dy)));
         const slash = this.add.text(px, py, '✨', { 
            fontSize: Math.floor(this.tileSize * 1) + 'px' // 稍微放大一點點
          }).setOrigin(0.5);
          
          // 魔力爆發動畫：除了放大與漸隱，加入 90 度旋轉讓它看起來像法術綻放！
          this.tweens.add({ 
            targets: slash, 
            scale: 1.8, 
            angle: 90, 
            alpha: 0, 
            duration: 350, 
            ease: 'Cubic.easeOut',
            onComplete: () => slash.destroy() 
          });
          
          // 結算傷害
          this.damageEnemyAt(startX + t.dx, startY + t.dy, this.playerAttack);
          promises.push(Promise.resolve());
        } else if (SKILL_DICT && SKILL_DICT[skillName]) {
          // 施展魔法與其他戰技
          promises.push(SKILL_DICT[skillName](this, { dx: t.dx, dy: t.dy, behavior: behaviorFunc, originX: startX, originY: startY }));
        }
      }
      await Promise.all(promises);
      
      // 如果有連擊，稍微延遲一下讓打擊感更好
      if (hitCount > 1 && i < hitCount - 1) await new Promise(r => setTimeout(r, 150));
    }
  }

  // ==========================================
  // 4. 戰鬥邏輯與交互 (Combat & Interactions)
  // ==========================================
  damageEnemyAt(tx, ty, damage) { 
    if (damage === undefined) damage = this.playerAttack;
    const enemyIndex = this.enemies.findIndex(e => e.gx === tx && e.gy === ty);
    
    if (enemyIndex !== -1) {
      const enemy = this.enemies[enemyIndex];
      if (!enemy) return false; 
      
      this.cameras.main.shake(150, 0.015);
      enemy.hp -= damage;
      this.playHitEffect(enemy.sprite.x, enemy.sprite.y, enemy.hp <= 0 ? 0xf97316 : 0xfde68a);
      this.tweens.add({
        targets: enemy.sprite,
        scaleX: 1.12,
        scaleY: 0.88,
        yoyo: true,
        duration: 90,
        ease: 'Quad.easeOut'
      });

      // 更新血條
      if (enemy.hpFill && enemy.maxHp) {
        const hpPercent = Phaser.Math.Clamp(enemy.hp / enemy.maxHp, 0, 1);
        enemy.hpFill.width = (this.tileSize * 0.65) * hpPercent;
      }

      // 傷害飄字
      const dmgText = this.add.text(enemy.sprite.x, enemy.sprite.y - 20, `-${damage}`, { 
        fontSize: '20px', color: '#FF0000', fontStyle: 'bold', stroke: '#000000', strokeThickness: 4 
      }).setOrigin(0.5).setDepth(50);

      this.tweens.add({
        targets: dmgText, y: enemy.sprite.y - 50, alpha: 0, duration: 800,
        onComplete: () => dmgText.destroy()
      });

      // 🌟 死亡判定與掉落物結算
      if (enemy.hp <= 0) {
        console.log(`💀 魔物消散！`);

        this.sessionKills++;

        const enemyConfig = ENEMY_DICT && ENEMY_DICT[enemy.id] ? ENEMY_DICT[enemy.id] : {};
        if (enemyConfig.isBoss || enemy.id.includes('boss')) {
             this.sessionBossKills++; 
        }
        
        // 確保這兩個變數在這裡被宣告
        const coinAmt = enemy.coinReward || 5;
        const xpAmt = enemy.xpReward || 15;
        
        const px = enemy.sprite.x;
        const py = enemy.sprite.y;

        // 金幣飄字
        const coinText = this.add.text(px, py - 20, `+${coinAmt} 🪙`, { 
          fontSize: '24px', color: '#FFD700', fontFamily: 'serif', fontStyle: 'bold', stroke: '#593922', strokeThickness: 4
        }).setOrigin(0.5).setDepth(60);

        this.tweens.add({
            targets: coinText, y: py - 70, alpha: 0, duration: 1200, ease: 'Power2',
            onComplete: () => coinText.destroy()
        });

        // 經驗值飄字
        const xpText = this.add.text(px, py - 40, `+${xpAmt} ✨`, { 
          fontSize: '22px', color: '#8FBC8F', fontFamily: 'serif', fontStyle: 'bold', stroke: '#1A2F1A', strokeThickness: 4
        }).setOrigin(0.5).setDepth(60);

        this.tweens.add({
            targets: xpText, y: py - 90, alpha: 0, duration: 1200, ease: 'Power2', delay: 150,
            onComplete: () => xpText.destroy()
        });

        // 魔物化為煙塵動畫
        this.tweens.add({
          targets: enemy.sprite, scale: 0.1, alpha: 0, angle: 180, duration: 300,
          onComplete: () => { enemy.sprite.destroy(); }
        });
        
        this.enemies.splice(enemyIndex, 1);
        this.enemiesKilled++;
        this.updateObjectiveUI(); 
        
        // 🌟 正確發送事件 (變數名稱為 coinAmt 與 xpAmt)
        window.dispatchEvent(new CustomEvent('tower-coin-collected', { detail: { amount: coinAmt } }));
        window.dispatchEvent(new CustomEvent('tower-xp-gained', { detail: { amount: xpAmt, source: `擊殺 ${enemy.name || '魔物'}` } }));
        
        if (this.levelConfig.winCondition.type === 'exterminate' && this.enemies.length === 0) {
            if (this.terminal && this.playerGridX === this.terminal.gx && this.playerGridY === this.terminal.gy) {
                window.dispatchEvent(new CustomEvent('tower-floor-cleared'));
            }
        }
      }
      this.updateEnemyRadar();
      return true;
    }
    return false;
  }

  // ==========================================
  // 🌟 敵意雷達掃描系統
  // ==========================================
  updateEnemyRadar() {
    if (!this.enemies || this.isGameOverInterrupted) return;

    let bossInfo = null;
    let nearbyEnemies = []; // 🌟 改成陣列，收集所有周圍敵人

    this.enemies.forEach((e, index) => {
      const config = ENEMY_DICT && ENEMY_DICT[e.id] ? ENEMY_DICT[e.id] : null;
      if (!config) return;

      // 1. 如果這層有 Boss，直接鎖定 Boss 資訊
      if (config.isBoss) {
        bossInfo = {
          name: config.name,
          hp: e.hp,
          maxHp: e.maxHp,
          damage: config.damage,
          symbol: config.symbol
        };
      } 
      // 2. 尋找 3 格內的所有普通怪
      else {
        const dist = Math.abs(e.gx - this.playerGridX) + Math.abs(e.gy - this.playerGridY);
        if (dist <= 3) {
          nearbyEnemies.push({
            uniqueId: index, // 用 index 當作穩定 key，血條動畫才不會斷
            name: config.name,
            hp: e.hp,
            maxHp: e.maxHp,
            damage: config.damage,
            symbol: config.symbol,
            dist: dist
          });
        }
      }
    });

    // 🌟 依照距離由近到遠排序
    nearbyEnemies.sort((a, b) => a.dist - b.dist);

    // 觸發事件傳給 Vue
    window.dispatchEvent(new CustomEvent('tower-enemy-radar', {
      detail: { boss: bossInfo, nearby: nearbyEnemies }
    }));
  }

  async processEnemyTurns() {
    if (this.isGameOverInterrupted) return;
    console.log("👻 怪物回合開始...");
    this.updateEnemyRadar();
    
    // 讓怪物依序行動，避免兩隻怪物走到同一個格子重疊
    for (let i = 0; i < this.enemies.length; i++) {
      const enemy = this.enemies[i];
      const enemyConfig = ENEMY_DICT[enemy.id];

      // 確保字典裡有這隻怪，且有設定 takeTurn 函式
      if (enemyConfig && typeof enemyConfig.takeTurn === 'function') {
        await enemyConfig.takeTurn(this, enemy);
        
        // 怪物之間稍微停頓，讓玩家看清楚誰在動 (體驗優化)
        await new Promise(r => setTimeout(r, 100)); 
      }
    }
    
    console.log("👻 怪物回合結束！");
  }

  checkInteractions() {
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

    const coinIndex = this.coins.findIndex(c => c.gx === this.playerGridX && c.gy === this.playerGridY);
    if (coinIndex !== -1) {
      this.coins[coinIndex].sprite.destroy(); 
      this.coins.splice(coinIndex, 1);
      window.dispatchEvent(new CustomEvent('tower-coin-collected', { detail: { amount: 20 } }));
    }
    
    const keyIndex = this.keys.findIndex(k => k.gx === this.playerGridX && k.gy === this.playerGridY);
    if (keyIndex !== -1) {
      this.keys[keyIndex].sprite.destroy();
      this.keys.splice(keyIndex, 1);
      this.keysCollected++;
      this.updateObjectiveUI();
      this.showErrorMessage(`🔑 獲得資料金鑰！(${this.keysCollected}/${this.levelConfig.winCondition.targetValue})`, '#047857', '#065f46');
    }
  }

  checkTerminalState() {
      if (this.terminal && this.playerGridX === this.terminal.gx && this.playerGridY === this.terminal.gy) {
          if (this.checkWinCondition()) {
              console.log("🏁 達成通關條件，發送通關事件！");
              window.dispatchEvent(new CustomEvent('tower-floor-cleared'));
              return true; 
          } else {
              console.log("❌ 抵達終點，未達成通關條件！");
              this.showErrorMessage("尚未達成任務目標，終端機存取被拒！", "#b91c1c", "#7f1d1d");
              this.cameras.main.shake(200, 0.015);
              
              this.playerGridX -= this.playerFacing.dx;
              this.playerGridY -= this.playerFacing.dy;
              
              const px = this.startX + this.playerGridX * this.tileSize;
              const py = this.startY + this.playerGridY * this.tileSize;
              this.tweens.add({ targets: this.player, x: px, y: py, duration: 200, ease: 'Bounce.easeOut' });
              return false;
          }
      }
      return false;
  }

  checkWinCondition() {
      const condition = this.levelConfig.winCondition;
      if (condition.type === 'reach_goal') return true; 
      if (condition.type === 'kill_enemies') return this.enemiesKilled >= condition.targetValue;
      if (condition.type === 'collect_keys') return this.keysCollected >= condition.targetValue;
      if (condition.type === 'exterminate') return this.enemies.length === 0;
      return false;
  }

  // ==========================================
  // 5. 視覺反饋與 UI (Visuals & UI)
  // ==========================================
  updateObjectiveUI() {
    const cond = this.levelConfig.winCondition;
    let text = "";
    if (cond.type === 'reach_goal') text = "🎯 目標：抵達終點";
    else if (cond.type === 'kill_enemies') text = `🎯 目標：\n1. 擊殺怪物 (${this.enemiesKilled}/${cond.targetValue})\n2. 抵達終點`;
    else if (cond.type === 'collect_keys') text = `🎯 目標：\n1. 收集鑰匙 (${this.keysCollected}/${cond.targetValue})\n2. 抵達終點`;
    else if (cond.type === 'exterminate') text = `🎯 目標：\n1. 殲滅所有病毒 (剩餘 ${this.enemies.length})\n2. 抵達終點`;

    window.dispatchEvent(new CustomEvent('tower-objective-updated', { detail: text }));
  }

  showFloorObjective() {
      const condition = this.levelConfig.winCondition;
      let msg = "";
      if (condition.type === 'kill_enemies') msg = `本層目標：擊殺至少 ${condition.targetValue} 隻病毒！`;
      else if (condition.type === 'collect_keys') msg = `本層目標：收集 ${condition.targetValue} 把資料金鑰以解鎖終端機！`;
      else if (condition.type === 'exterminate') msg = `本層目標：殲滅所有病毒！`;
      
      if (msg) {
          this.time.delayedCall(500, () => {
              this.showErrorMessage(msg, '#1d4ed8', '#1e3a8a'); 
          });
      }
  }

  // 補回斷電特效
  showBlackoutEffect() {
    this.cameras.main.shake(300, 0.015);
    if (this.playerAura) {
        this.playerAura.setFillStyle(0x111827, 0.34);
        this.time.delayedCall(1000, () => {
            if (this.playerAura) this.playerAura.setFillStyle(0x38bdf8, 0.14);
        });
    }
    const px = this.startX + this.playerGridX * this.tileSize;
    const py = this.startY + this.playerGridY * this.tileSize;
    const sweat = this.add.text(px + 15, py - 30, '💦', { fontSize: '24px' }).setOrigin(0.5);
    const battery = this.add.text(px, py - 50, '🪫', { fontSize: '32px' }).setOrigin(0.5);
    
    this.tweens.add({ 
        targets: [sweat, battery], y: '-=20', alpha: 0, duration: 1500, ease: 'Sine.easeOut', 
        onComplete: () => { sweat.destroy(); battery.destroy(); } 
    });
  }

  // 補回錯誤提示 UI
  showErrorMessage(message, bgColor = '#b91c1c', strokeColor = '#7f1d1d') {
    let translatedMsg = message;
    if (bgColor === '#b91c1c') {
        if (message.includes("is not defined")) {
          translatedMsg = `找不到變數或指令。\n請檢查是不是拼錯字了？`;
        } else if (message.includes("Unexpected token") || message.includes("Unexpected identifier")) {
          translatedMsg = `語法結構錯誤！\n請檢查有沒有少寫括號 ()、大括號 {} 或是分號 ; ？`;
        } else if (message.includes("is not a function")) {
          translatedMsg = `這不是一個可執行的指令，\n請確認括號 () 的用法！`;
        }
    }

    const textStyle = { 
        fontSize: '18px', fontFamily: 'monospace', color: '#ffffff', backgroundColor: bgColor, 
        padding: { x: 15, y: 15 }, stroke: strokeColor, strokeThickness: 2, align: 'center',
        wordWrap: { width: this.scale.width * 0.8 }
    };
    
    const displayMsg = bgColor === '#b91c1c' ? `🐛 系統回報：\n\n${translatedMsg}` : translatedMsg;
    const errorText = this.add.text(this.scale.width / 2, this.scale.height / 2, displayMsg, textStyle)
        .setOrigin(0.5).setDepth(100).setAlpha(0);

    this.tweens.add({
        targets: errorText, alpha: 1, y: this.scale.height / 2 - 30, duration: 300, ease: 'Back.out',
        onComplete: () => {
            this.time.delayedCall(4000, () => {
                this.tweens.add({ targets: errorText, alpha: 0, y: errorText.y - 20, duration: 300, onComplete: () => errorText.destroy() });
            });
        }
    });
  }

  // ==========================================
  // 6. 關卡生成與地圖物件 (Level Generation)
  // ==========================================
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
        
        // ✨ 奇幻化：深邃的石板地磚 (0x150C08) 與 斑駁的石縫/木紋邊框 (0x3A2318)
        this.add.rectangle(px, py, this.tileSize - 2, this.tileSize - 2, 0x150C08)
            .setStrokeStyle(1, 0x3A2318, 0.8);
      }
    }
  }

  setupPlayer() {
    // The starting tile and its four neighbours are protected from walls.
    // This prevents unwinnable starts and keeps the exit meaningfully distant.
    this.playerGridX = 1;
    this.playerGridY = Math.max(1, this.rows - 2);
    this.playerFacing = { dx: 0, dy: -1 }; 

    const px = this.startX + this.playerGridX * this.tileSize;
    const py = this.startY + this.playerGridY * this.tileSize;
    
    // 🧙‍♂️ 玩家降臨的光陣 (魔法藍光)
    this.add.rectangle(px, py, this.tileSize - 4, this.tileSize - 4, 0x4299E1, 0.15)
        .setStrokeStyle(2, 0x3182CE, 0.8);
    this.add.text(px, py, '降臨點', { fontSize: '11px', color: '#63B3ED', fontFamily: 'serif', fontStyle: 'bold' }).setOrigin(0.5, 2.3);
    
    // 呼叫建立玩家精靈的邏輯 (假設內部會畫出 🧙‍♂️)
    this.createPlayerGraphic(px, py);
  }

  createPlayerGraphic(x, y) {
    if (this.player) this.player.destroy();
    const shadow = this.add.ellipse(0, this.tileSize * 0.3, this.tileSize * 0.65, this.tileSize * 0.2, 0x030712, 0.6);
    const glow = this.add.circle(0, 0, this.tileSize * 0.48, 0x38bdf8, 0.12).setBlendMode(Phaser.BlendModes.ADD);
    const rune = this.add.circle(0, this.tileSize * 0.08, this.tileSize * 0.34).setStrokeStyle(2, 0x60a5fa, 0.55).setFillStyle(0x0c4a6e, 0.08);
    const hero = this.createDungeonArt('dungeon-hero', this.tileSize * 1.5);
    this.playerAura = this.add.circle(0, 0, this.tileSize * 0.38, 0x38bdf8, 0.14).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: glow, scale: 1.18, alpha: 0.08, duration: 900, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: rune, angle: 360, duration: 7000, repeat: -1 });

    this.player = this.add.container(x, y, [shadow, glow, rune, this.playerAura, hero]);
    this.playerHero = hero;
    this.playerShadow = shadow;
    this.player.setDepth(20);
  }

  playPlayerWalk(targetX, targetY, dx, dy) {
    if (!this.player) return Promise.resolve();
    if (this.playerHero && dx !== 0) this.playerHero.setFlipX(dx < 0);
    const footstep = this.add.ellipse(this.player.x, this.player.y + this.tileSize * 0.3, this.tileSize * 0.3, this.tileSize * 0.1, 0x93c5fd, 0.5).setDepth(19);
    this.tweens.add({ targets: footstep, scaleX: 1.8, alpha: 0, duration: 210, onComplete: () => footstep.destroy() });
    if (this.playerHero) {
      this.tweens.killTweensOf(this.playerHero);
      this.tweens.add({ targets: this.playerHero, y: -this.tileSize * 0.08, angle: dx * 5, scaleY: 0.93, duration: 90, yoyo: true, repeat: 1, ease: 'Sine.easeInOut', onComplete: () => this.playerHero?.setAngle(0).setScale(1) });
    }
    return new Promise(resolve => this.tweens.add({ targets: this.player, x: targetX, y: targetY, duration: 210, ease: 'Sine.easeInOut', onComplete: resolve }));
  }

  createDungeonArt(textureKey, targetSize) {
    const art = this.add.image(0, 0, textureKey);
    const source = art.texture?.getSourceImage?.();
    const width = source?.width || 1;
    const height = source?.height || 1;
    const scale = targetSize / Math.max(width, height);
    return art.setScale(scale, scale);
  }

  getEnemyArtSize(enemyId, isBoss = false) {
    if (enemyId === 'patrol_bug' || enemyId === 'tracker_virus' || enemyId === 'void_creeper') {
      return this.tileSize * (isBoss ? 0.95 : 0.62);
    }
    return this.tileSize * (isBoss ? 1.08 : 0.84);
  }

  createTerminalArt(x, y, color) {
    const glow = this.add.circle(0, 0, this.tileSize * 0.42, color, 0.16).setBlendMode(Phaser.BlendModes.ADD);
    const arch = this.add.rectangle(0, 0, this.tileSize * 0.5, this.tileSize * 0.66, 0x23130e).setStrokeStyle(2, color, 0.95);
    const portal = this.add.ellipse(0, 0, this.tileSize * 0.26, this.tileSize * 0.42, color, 0.78).setStrokeStyle(2, 0xfff7d6, 0.8);
    const rune = this.add.circle(0, 0, this.tileSize * 0.055, 0xfff7d6, 0.95).setBlendMode(Phaser.BlendModes.ADD);
    const sprite = this.add.container(x, y, [glow, arch, portal, rune]).setDepth(25);
    this.tweens.add({ targets: [glow, portal], scale: 1.12, alpha: 0.38, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: rune, scale: 1.8, alpha: 0.25, duration: 520, yoyo: true, repeat: -1 });
    return sprite;
  }

  playPlayerCastPose(dx, dy, skillName) {
    if (!this.playerHero) return;
    const castAngle = dx === 0 ? 0 : dx * 7;
    this.tweens.killTweensOf(this.playerHero);
    this.tweens.add({ targets: this.playerHero, scale: 1.1, angle: castAngle, duration: 110, yoyo: true, ease: 'Back.easeOut', onComplete: () => this.playerHero?.setScale(1).setAngle(0) });
    if (this.playerAura) {
      const color = skillName === 'bomb' ? 0xfb7185 : skillName === 'shoot' ? 0xfbbf24 : 0x67e8f9;
      this.playerAura.setFillStyle(color, 0.5).setAlpha(0.5);
      this.tweens.add({ targets: this.playerAura, alpha: 0.1, scale: 1.45, duration: 280, onComplete: () => this.playerAura?.setScale(1).setFillStyle(0x38bdf8, 0.14) });
    }
  }

  playCastEffect(x, y, skillName) {
    if (!this.player) return;
    const color = skillName === 'bomb' ? 0xfb7185 : skillName === 'laser' ? 0x22d3ee : 0xa78bfa;
    const ring = this.add.circle(x, y, this.tileSize * 0.2).setStrokeStyle(3, color, 0.9).setFillStyle(color, 0.08).setDepth(42);
    const flash = this.playerAura;
    if (flash) {
      flash.setFillStyle(color, 0.5).setAlpha(0.5);
      this.tweens.add({ targets: flash, alpha: 0.7, duration: 260, onComplete: () => flash.setAlpha(1) });
    }
    this.tweens.add({
      targets: ring,
      scale: 2.2,
      alpha: 0,
      duration: 360,
      ease: 'Cubic.easeOut',
      onComplete: () => ring.destroy()
    });
  }

  playSlashEffect(x, y, angle) {
    const slash = this.add.graphics().setPosition(x, y).setDepth(46);
    slash.lineStyle(Math.max(3, this.tileSize * 0.06), 0xfde68a, 0.95);
    slash.beginPath();
    slash.arc(0, 0, this.tileSize * 0.32, Phaser.Math.DegToRad(angle - 70), Phaser.Math.DegToRad(angle + 70), false);
    slash.strokePath();
    slash.lineStyle(Math.max(1, this.tileSize * 0.025), 0xffffff, 0.9);
    slash.beginPath();
    slash.arc(0, 0, this.tileSize * 0.2, Phaser.Math.DegToRad(angle - 58), Phaser.Math.DegToRad(angle + 58), false);
    slash.strokePath();
    this.tweens.add({ targets: slash, scale: 1.6, alpha: 0, angle: 24, duration: 260, ease: 'Cubic.easeOut', onComplete: () => slash.destroy() });
  }

  playHitEffect(x, y, color = 0xfbbf24) {
    const burst = this.add.container(x, y).setDepth(55);
    for (let index = 0; index < 8; index++) {
      const spark = this.add.rectangle(0, 0, 3, 10, color, 0.95).setRotation((Math.PI * 2 * index) / 8);
      burst.add(spark);
      this.tweens.add({
        targets: spark,
        x: Math.cos((Math.PI * 2 * index) / 8) * this.tileSize * 0.3,
        y: Math.sin((Math.PI * 2 * index) / 8) * this.tileSize * 0.3,
        alpha: 0,
        scaleY: 0.3,
        duration: 240,
        ease: 'Quad.easeOut'
      });
    }
    this.tweens.add({ targets: burst, alpha: 0, duration: 280, onComplete: () => burst.destroy() });
  }

  generateLevel() {
    // 🚪 奇幻化：產生通往更深層的「地下階梯 / 傳送法陣」 (原：Terminal / 數據終端)
    this.spawnTerminal();

    // 🧱 奇幻化：產生阻擋冒險者的「古老石壁」
    const wallCount = Math.floor(this.cols * this.rows * 0.20); 
    this.spawnWalls(wallCount);
    this.ensurePlayerEscapeRoute();

    // 👾 奇幻化：召喚深淵魔物
    for (let i = 0; i < this.levelConfig.enemyCount; i++) {
      const enemyIds = this.levelConfig.allowedEnemies;
      // 把預設防錯的怪物從 patrol_bug(巡邏蟲) 改成 slime(史萊姆)
      const enemyId = Phaser.Utils.Array.GetRandom(enemyIds) || 'slime'; 
      if (ENEMY_DICT && ENEMY_DICT[enemyId]) this.spawnEnemy(enemyId);
    }

    // 🕸️ 奇幻化：佈置地下城陷阱 (原：Hazard / 數據危害)
    const hazardCount = Math.floor(this.cols / 3);
    for (let i = 0; i < hazardCount; i++) {
      if (!HAZARD_DICT) break;
      const hazardIds = Object.keys(HAZARD_DICT);
      const hazardId = Phaser.Utils.Array.GetRandom(hazardIds);
      this.spawnHazard(hazardId);
    }

    // 🪙 奇幻化：散落的奉獻金幣
    this.spawnCoins(3);
    
    // 🗝️ 奇幻化：守關首領的金鑰 (原：權限鑰匙)
    if (this.levelConfig.keyCount > 0) this.spawnKeys(this.levelConfig.keyCount);
  }

  spawnKeys(count) {
    for (let i = 0; i < count; i++) {
      const pos = this.getRandomEmptyGrid();
      if (!pos) break;
      const fontSize = Math.floor(this.tileSize * 0.5) + 'px';
      // 🗝️ 金色鑰匙
      const sprite = this.add.text(pos.px, pos.py, '🗝️', { fontSize }).setOrigin(0.5);
      
      // 鑰匙底下的微光
      this.add.circle(pos.px, pos.py, this.tileSize * 0.3, 0xFFD700, 0.15).setDepth(29);
      
      this.keys.push({ gx: pos.gx, gy: pos.gy, sprite });
    }
  }

  spawnWalls(count) {
    let placed = 0;
    let attempts = 0;
    while (placed < count && attempts < count * 20) {
      attempts++;
      const pos = this.getRandomEmptyGrid(({ gx, gy }) => !this.isProtectedGrid(gx, gy));
      if (!pos) break;
      
      // 🧱 古老石壁與黑岩
      const sprite = this.add.rectangle(pos.px, pos.py, this.tileSize - 2, this.tileSize - 2, 0x2A1810)
          .setStrokeStyle(2, 0x593922); // 厚實的木/岩石邊框
          
      // 隨機在石壁上加點青苔或裂縫的質感 (可選)
      if (Math.random() > 0.7) {
         this.add.text(pos.px, pos.py, '🌿', { fontSize: '14px', alpha: 0.3 }).setOrigin(0.5);
      }
      
      this.walls.push({ gx: pos.gx, gy: pos.gy, sprite });
      if (this.hasGridRoute()) {
        placed++;
      } else {
        sprite.destroy();
        this.walls.pop();
      }
    }
  }

  spawnCoins(count) {
    for (let i = 0; i < count; i++) {
      const pos = this.getRandomEmptyGrid();
      if (!pos) break;
      const fontSize = Math.floor(this.tileSize * 0.45) + 'px';
      
      // 🪙 奉獻金幣
      const sprite = this.add.text(pos.px, pos.py, '🪙', { fontSize }).setOrigin(0.5);
      this.coins.push({ gx: pos.gx, gy: pos.gy, sprite });
    }
  }

  spawnEnemy(id) {
    const pos = this.getRandomEmptyGrid();
    if (!pos) return;

    // 從字典獲取怪物的設定值 (缺省值設為史萊姆或骷髏)
    const config = ENEMY_DICT && ENEMY_DICT[id] ? ENEMY_DICT[id] : { hp: 30, damage: 10, symbol: '👾' };
    
    const px = this.startX + pos.gx * this.tileSize;
    const py = this.startY + pos.gy * this.tileSize;

    // 1. 魔物圖示
    const fontSize = Math.floor(this.tileSize * 0.55) + 'px';
    const spriteText = this.add.text(0, 0, config.symbol, { fontSize }).setOrigin(0.5);
    spriteText.setShadow(0, 2, 'rgba(0,0,0,0.8)', 4); // 增加實體感陰影

    // 2. 血條背景 (深木框)
    spriteText.setAlpha(0);
    const textureKey = ENEMY_TEXTURE_KEYS[id] || 'dungeon-slime';
    const spriteScale = config.isBoss ? 1.45 : 1;
    const shadow = this.add.ellipse(0, this.tileSize * 0.28, this.tileSize * 0.65 * spriteScale, this.tileSize * 0.18, 0x030712, 0.65);
    const auraColor = config.isBoss ? 0xfb7185 : (id === 'ghost' ? 0x67e8f9 : 0xa78bfa);
    const aura = this.add.circle(0, 0, this.tileSize * 0.34 * spriteScale, auraColor, config.isBoss ? 0.2 : 0.1).setBlendMode(Phaser.BlendModes.ADD);
    const enemyArt = this.createDungeonArt(textureKey, this.getEnemyArtSize(id, config.isBoss) * spriteScale);
    this.tweens.add({ targets: aura, alpha: config.isBoss ? 0.06 : 0.03, scale: 1.16, duration: config.isBoss ? 600 : 1000, yoyo: true, repeat: -1 });

    const barWidth = this.tileSize * 0.65;
    const barHeight = 5;
    const hpBg = this.add.rectangle(0, -this.tileSize * 0.35, barWidth, barHeight, 0x1C110C).setOrigin(0.5)
        .setStrokeStyle(1, 0x000000);
    
    // 3. 血條前景 (暗紅色，設定 Origin(0, 0.5) 確保從左側扣減)
    const hpFill = this.add.rectangle(-barWidth / 2, -this.tileSize * 0.35, barWidth, barHeight, 0x8B0000).setOrigin(0, 0.5);

    // 4. 攻擊力文字 (顯示在魔物下方，用金黃/橘紅色顯示)
    const atkText = this.add.text(0, this.tileSize * 0.35, `⚔️${config.damage}`, { 
      fontSize: '11px', color: '#FF7F50', fontFamily: 'serif', fontStyle: 'bold' 
    }).setOrigin(0.5);

    // 把所有東西打包進一個 Container
    const container = this.add.container(px, py, [shadow, aura, enemyArt, spriteText, hpBg, hpFill, atkText]).setDepth(30);
    this.playEnemyIdleMotion(enemyArt, id, config.isBoss);

    // 將狀態存入 enemies 陣列
    this.enemies.push({ 
      id, 
      gx: pos.gx, 
      gy: pos.gy, 
      sprite: container, 
      hpFill: hpFill,    
      spriteText: spriteText, 
      enemyArt: enemyArt,
      hp: config.hp,
      maxHp: config.hp
    });
  }

  spawnHazard(id) {
    const pos = this.getRandomEmptyGrid();
    if (!pos) return;
    const fontSize = Math.floor(this.tileSize * 0.5) + 'px';
    
    // 隨機選擇地下城陷阱圖示
    const hazardIcons = ['🔥', '🕸️', '🕳️', '🐍'];
    const icon = hazardIcons[Math.floor(Math.random() * hazardIcons.length)];
    
    const sprite = this.add.text(pos.px, pos.py, icon, { fontSize, alpha: 0.8 }).setOrigin(0.5);
    
    // 陷阱底下的危險紅光
    this.add.circle(pos.px, pos.py, this.tileSize * 0.3, 0x8B0000, 0.2).setDepth(15);

    this.hazards.push({ id, gx: pos.gx, gy: pos.gy, sprite });
  }

  spawnTerminal() {
    let pos = null;
    let attempts = 0;
    
    do {
      const tempPos = this.getRandomEmptyGrid();
      if (!tempPos) break;
      const distance = Math.abs(tempPos.gx - this.playerGridX) + Math.abs(tempPos.gy - this.playerGridY);
      // 確保入口距離玩家夠遠
      if (distance >= Math.max(4, Math.floor(this.cols / 1.25))) pos = tempPos;
      attempts++;
    } while (!pos && attempts < 100);

    if (!pos) {
      const candidates = [];
      for (let gy = 0; gy < this.rows; gy++) {
        for (let gx = 0; gx < this.cols; gx++) {
          if (this.isGridEmpty(gx, gy)) candidates.push({ gx, gy, distance: Math.abs(gx - this.playerGridX) + Math.abs(gy - this.playerGridY) });
        }
      }
      candidates.sort((a, b) => b.distance - a.distance);
      pos = candidates[0] || null;
    }
    if (!pos) pos = { gx: this.cols - 1, gy: 0 };

    const px = this.startX + pos.gx * this.tileSize;
    const py = this.startY + pos.gy * this.tileSize;
    
    // 🚪 深淵入口/傳送陣 (依據過關條件變更光芒顏色)
    let terminalColor = 0xDAA520; // 預設：金色魔法陣
    if (this.levelConfig.winCondition.type === 'collect_keys') terminalColor = 0xFFD700; // 金黃色(尋找鑰匙)
    if (this.levelConfig.winCondition.type === 'kill_enemies' || this.levelConfig.winCondition.type === 'exterminate') terminalColor = 0x8B0000; // 暗紅色(討伐任務)

    // 底部的魔法陣光環
    this.add.circle(px, py, this.tileSize * 0.6, terminalColor, 0.2);
    // 石雕底座
    const sprite = this.createTerminalArt(px, py, terminalColor);
    // 階梯或門扉
    
    this.terminal = { gx: pos.gx, gy: pos.gy, sprite };
  }

  // ==========================================
  // 7. 網格計算與尋路 (Pathfinding & Grids)
  // ==========================================
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

  getRandomEmptyGrid(filter = null) {
    let gx, gy, attempts = 0;
    while (attempts < 200) {
      gx = Phaser.Math.Between(0, this.cols - 1);
      gy = Phaser.Math.Between(0, this.rows - 1);
      attempts++;
      if (this.isGridEmpty(gx, gy) && (!filter || filter({ gx, gy }))) {
        return { gx, gy, px: this.startX + gx * this.tileSize, py: this.startY + gy * this.tileSize };
      }
    }
    return null;
  }

  playEnemyIdleMotion(enemyArt, enemyId, isBoss = false) {
    if (!enemyArt) return;
    const isSlime = enemyId === 'slime';
    const isCrawler = enemyId === 'patrol_bug' || enemyId === 'tracker_virus' || enemyId === 'void_creeper';
    this.tweens.add({
      targets: enemyArt,
      y: isCrawler ? this.tileSize * 0.025 : -this.tileSize * 0.045,
      scaleX: isSlime ? 1.06 : 1,
      scaleY: isSlime ? 0.92 : 1,
      duration: isBoss ? 520 : 860,
      yoyo: true,
      repeat: -1,
      ease: isSlime ? 'Sine.easeInOut' : 'Quad.easeInOut'
    });
  }

  isProtectedGrid(gx, gy) {
    const nearPlayer = Math.abs(gx - this.playerGridX) + Math.abs(gy - this.playerGridY) <= 1;
    const nearTerminal = this.terminal && Math.abs(gx - this.terminal.gx) + Math.abs(gy - this.terminal.gy) <= 1;
    return nearPlayer || nearTerminal;
  }

  hasGridRoute() {
    if (!this.terminal) return true;
    const queue = [{ gx: this.playerGridX, gy: this.playerGridY }];
    const visited = new Set([`${this.playerGridX},${this.playerGridY}`]);
    const directions = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    while (queue.length) {
      const current = queue.shift();
      if (current.gx === this.terminal.gx && current.gy === this.terminal.gy) return true;
      directions.forEach(([dx, dy]) => {
        const gx = current.gx + dx;
        const gy = current.gy + dy;
        const key = `${gx},${gy}`;
        if (gx < 0 || gx >= this.cols || gy < 0 || gy >= this.rows || visited.has(key)) return;
        if (this.walls.some(wall => wall.gx === gx && wall.gy === gy)) return;
        visited.add(key);
        queue.push({ gx, gy });
      });
    }
    return false;
  }

  ensurePlayerEscapeRoute() {
    const adjacentWalls = this.walls.filter(wall => Math.abs(wall.gx - this.playerGridX) + Math.abs(wall.gy - this.playerGridY) <= 1);
    adjacentWalls.forEach(wall => wall.sprite.destroy());
    this.walls = this.walls.filter(wall => !adjacentWalls.includes(wall));
    if (this.hasGridRoute() || !this.terminal) return;

    // A fallback for legacy saved maps: carve a direct L-shaped corridor to the exit.
    const corridor = new Set();
    for (let gx = Math.min(this.playerGridX, this.terminal.gx); gx <= Math.max(this.playerGridX, this.terminal.gx); gx++) corridor.add(`${gx},${this.playerGridY}`);
    for (let gy = Math.min(this.playerGridY, this.terminal.gy); gy <= Math.max(this.playerGridY, this.terminal.gy); gy++) corridor.add(`${this.terminal.gx},${gy}`);
    const blocked = this.walls.filter(wall => corridor.has(`${wall.gx},${wall.gy}`));
    blocked.forEach(wall => wall.sprite.destroy());
    this.walls = this.walls.filter(wall => !blocked.includes(wall));
  }

  getGridFromPointer(pointer) {
    const gx = Math.round((pointer.x - this.startX) / this.tileSize);
    const gy = Math.round((pointer.y - this.startY) / this.tileSize);
    return { gx, gy };
  }

  findPath(startX, startY, targetX, targetY, avoidHazards = false) {
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

        const isWall = this.walls.some(w => w.gx === nx && w.gy === ny);
        const isHazard = avoidHazards && this.hazards.some(h => h.gx === nx && h.gy === ny);

        if (isWall || isHazard) continue;

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

  // ==========================================
  // 8. 狀態存讀與輔助 UI (Save/Load & Aim UI)
  // ==========================================
  exportMapState() {
    return {
        playerGridX: this.playerGridX, playerGridY: this.playerGridY, playerFacing: this.playerFacing,
        terminal: this.terminal ? { gx: this.terminal.gx, gy: this.terminal.gy } : null,
        walls: this.walls.map(w => ({ gx: w.gx, gy: w.gy })),
        enemies: this.enemies.map(e => ({ id: e.id, gx: e.gx, gy: e.gy, hp: e.hp, maxHp: e.maxHp })),
        hazards: this.hazards.map(h => ({ id: h.id, gx: h.gx, gy: h.gy })),
        coins: this.coins.map(c => ({ gx: c.gx, gy: c.gy })),
        keys: this.keys.map(k => ({ gx: k.gx, gy: k.gy })),
        enemiesKilled: this.enemiesKilled, keysCollected: this.keysCollected,
        relics: [...this.relics]
    };
  }

  restoreMapState(data) {
    console.log("♻️ [EndlessScene] 偵測到地圖存檔，正在恢復戰場狀態...");
    this.playerGridX = data.playerGridX;
    this.playerGridY = data.playerGridY;
    this.playerFacing = data.playerFacing || { dx: 0, dy: -1 };
    
    const px = this.startX + this.playerGridX * this.tileSize;
    const py = this.startY + this.playerGridY * this.tileSize;
    this.createPlayerGraphic(px, py);

    if (data.terminal) {
        const tx = this.startX + data.terminal.gx * this.tileSize;
        const ty = this.startY + data.terminal.gy * this.tileSize;
        let terminalColor = 0x00ff00;
        if (this.levelConfig.winCondition.type === 'collect_keys') terminalColor = 0xeab308; 
        if (this.levelConfig.winCondition.type === 'kill_enemies' || this.levelConfig.winCondition.type === 'exterminate') terminalColor = 0xef4444;
        const sprite = this.createTerminalArt(tx, ty, terminalColor);
        this.terminal = { gx: data.terminal.gx, gy: data.terminal.gy, sprite };
    }

    (data.walls || []).forEach(w => {
        const sprite = this.add.rectangle(this.startX + w.gx * this.tileSize, this.startY + w.gy * this.tileSize, this.tileSize - 4, this.tileSize - 4, 0x475569).setStrokeStyle(2, 0x1e293b);
        this.walls.push({ gx: w.gx, gy: w.gy, sprite });
    });

   (data.enemies || []).forEach(e => {
        // 從字典抓取原本怪物的設定
        const config = ENEMY_DICT && ENEMY_DICT[e.id] ? ENEMY_DICT[e.id] : { hp: 30, damage: 10, symbol: '👾' };
        
        const ex = this.startX + e.gx * this.tileSize;
        const ey = this.startY + e.gy * this.tileSize;

        const fontSize = Math.floor(this.tileSize * 0.6) + 'px';
        const spriteText = this.add.text(0, 0, config.symbol, { fontSize }).setOrigin(0.5);
        spriteText.setAlpha(0);
        const textureKey = ENEMY_TEXTURE_KEYS[e.id] || 'dungeon-slime';
        const spriteScale = config.isBoss ? 1.45 : 1;
        const shadow = this.add.ellipse(0, this.tileSize * 0.28, this.tileSize * 0.65 * spriteScale, this.tileSize * 0.18, 0x030712, 0.65);
        const auraColor = config.isBoss ? 0xfb7185 : (e.id === 'ghost' ? 0x67e8f9 : 0xa78bfa);
        const aura = this.add.circle(0, 0, this.tileSize * 0.34 * spriteScale, auraColor, config.isBoss ? 0.2 : 0.1).setBlendMode(Phaser.BlendModes.ADD);
        const enemyArt = this.createDungeonArt(textureKey, this.getEnemyArtSize(e.id, config.isBoss) * spriteScale);
        this.tweens.add({ targets: aura, alpha: config.isBoss ? 0.06 : 0.03, scale: 1.16, duration: config.isBoss ? 600 : 1000, yoyo: true, repeat: -1 });

        const barWidth = this.tileSize * 0.7;
        const barHeight = 6;
        const hpBg = this.add.rectangle(0, -this.tileSize * 0.4, barWidth, barHeight, 0x333333).setOrigin(0.5);
        const hpFill = this.add.rectangle(-barWidth / 2, -this.tileSize * 0.4, barWidth, barHeight, 0xef4444).setOrigin(0, 0.5);

        // 讀取存檔中的血量，如果沒有就給滿血 (相容舊存檔)
        const currentHp = e.hp !== undefined ? e.hp : config.hp;
        const maxHp = e.maxHp !== undefined ? e.maxHp : config.hp;
        hpFill.scaleX = Math.max(0, currentHp / maxHp); // 恢復受傷狀態的血條長度

        const atkText = this.add.text(0, this.tileSize * 0.35, `⚔️${config.damage}`, { 
          fontSize: '12px', color: '#f87171', fontFamily: 'monospace', fontStyle: 'bold' 
        }).setOrigin(0.5);

        const container = this.add.container(ex, ey, [shadow, aura, enemyArt, spriteText, hpBg, hpFill, atkText]).setDepth(30);
        this.playEnemyIdleMotion(enemyArt, e.id, config.isBoss);

        this.enemies.push({ 
          id: e.id, 
          gx: e.gx, 
          gy: e.gy, 
          sprite: container, 
          hpFill: hpFill,    
          spriteText: spriteText, 
          enemyArt: enemyArt,
          hp: currentHp,
          maxHp: maxHp
        });
    });

    (data.hazards || []).forEach(h => {
        const fontSize = Math.floor(this.tileSize * 0.6) + 'px';
        const sprite = this.add.text(this.startX + h.gx * this.tileSize, this.startY + h.gy * this.tileSize, '⚠️', { fontSize }).setOrigin(0.5);
        this.hazards.push({ id: h.id, gx: h.gx, gy: h.gy, sprite });
    });

    (data.coins || []).forEach(c => {
        const fontSize = Math.floor(this.tileSize * 0.5) + 'px';
        const sprite = this.add.text(this.startX + c.gx * this.tileSize, this.startY + c.gy * this.tileSize, '🪙', { fontSize }).setOrigin(0.5);
        this.coins.push({ gx: c.gx, gy: c.gy, sprite });
    });

    (data.keys || []).forEach(k => {
        const fontSize = Math.floor(this.tileSize * 0.6) + 'px';
        const sprite = this.add.text(this.startX + k.gx * this.tileSize, this.startY + k.gy * this.tileSize, '🔑', { fontSize }).setOrigin(0.5);
        this.keys.push({ gx: k.gx, gy: k.gy, sprite });
    });

    // Older saved floors may predate safe-spawn generation. Repair only walls
    // that can trap the player while preserving the rest of the exploration.
    this.ensurePlayerEscapeRoute();

    this.enemiesKilled = data.enemiesKilled || 0;
    this.keysCollected = data.keysCollected || 0;
    this.relics = data.relics || [];
  }

  startTargeting() {
    if (!this.ENABLE_AIMING_UI) {
      window.dispatchEvent(new CustomEvent('tower-target-selected', { detail: { dx: this.playerFacing.dx, dy: this.playerFacing.dy, distance: 1, fullPath: [] } }));
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

    window.dispatchEvent(new CustomEvent('tower-target-selected', { detail: { dx: gx - this.playerGridX, dy: gy - this.playerGridY, distance: path.length, fullPath: path } }));
  }
}
