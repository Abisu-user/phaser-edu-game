// src/game/config/LevelRules.js

export const FLOOR_CONFIG = {
  /**
   * 根據目前樓層，回傳該樓層的地圖與生成設定
   * @param {number} floor 當前樓層
   * @returns {Object} 難度設定檔
   */
  getDifficulty: (floor) => {
    let gridSize = 10;
    let enemyCount = 1;
    let allowedEnemies = ['slime']; 
    let winCondition = { type: 'reach_goal', targetValue: 0 }; 
    let keyCount = 0; 

    // ==========================================
    // 👑 1. 史詩 Boss 關卡 (每 10 層觸發)
    // ==========================================
    if (floor % 10 === 0) {
      // Boss 房間的空間控制在適中大小，不會無止盡變大
      gridSize = Math.min(12 + Math.floor(floor / 20), 16); 
      enemyCount = 1; // 競技場裡只有你跟 Boss
      winCondition = { type: 'exterminate', targetValue: 1 }; // 必須擊殺 Boss 才能過關
      keyCount = 0;   // 不用找鑰匙

      // 對應樓層的 Boss 配置
      const bossMap = {
        10: 'boss_bat',
        20: 'boss_skeleton_king',
        30: 'boss_demon_lord',
        40: 'boss_shadow_stalker',
        50: 'boss_dragon',
        60: 'boss_reaper',
        70: 'boss_titan',
        80: 'boss_hydra',
        90: 'boss_lich'
      };
      
      // 100 層 (含) 以上一律出深淵主宰
      allowedEnemies = [bossMap[floor] || 'boss_abyss_god']; 

      return { gridSize, enemyCount, allowedEnemies, winCondition, keyCount };
    }

    // ==========================================
    // ⚔️ 2. 一般樓層難度曲線 (非 Boss 層)
    // ==========================================
    // 網格隨層數漸漸擴大，最大限制在 20x20
    gridSize = Math.min(10 + Math.floor(floor / 5), 20); 
    
    // 怪物數量隨層數增加
    enemyCount = 2 + Math.floor(floor / 3); 

    // 隨著層數推進，解鎖更強大的敵人進池子
    if (floor < 10) allowedEnemies = ['slime', 'patrol_bug'];
    else if (floor < 20) allowedEnemies = ['patrol_bug', 'goblin'];
    else if (floor < 40) allowedEnemies = ['goblin', 'skeleton'];
    else if (floor < 60) allowedEnemies = ['skeleton', 'ghost'];
    else if (floor < 80) allowedEnemies = ['ghost', 'golem'];
    else allowedEnemies = ['golem', 'void_creeper', 'ghost'];

    // ==========================================
    // 🎯 3. 隨機通關任務指派
    // ==========================================
    const missionType = floor % 4; 
    
    if (missionType === 0 || missionType === 2) {
      // 任務：尋找古老金鑰
      keyCount = Math.min(1 + Math.floor(floor / 20), 3); // 鑰匙數量隨層數增加，最多找 3 把
      winCondition = { type: 'collect_keys', targetValue: keyCount };
    } else if (missionType === 1) {
      // 任務：討伐指定數量的魔物 (擊殺當前樓層 50% 數量的怪)
      winCondition = { type: 'kill_enemies', targetValue: Math.ceil(enemyCount / 2) };
    } else {
      // 任務：順利逃脫找到下一層的門扉
      winCondition = { type: 'reach_goal', targetValue: 0 };
    }

    return {
      gridSize,
      enemyCount,
      allowedEnemies,
      winCondition,
      keyCount 
    };
  }
};

// ==========================================
// 房間型態定義 (文字轉為奇幻風格)
// ==========================================
export const ROOM_TYPES = {
  'standard': { id: 'standard', name: '探索迷宮' },
  'exterminate': { id: 'exterminate', name: '全數殲滅' },
  'key_retrieval': { id: 'key_retrieval', name: '收集古老金鑰' },
  'boss_room': { id: 'boss_room', name: '首領競技場' }
};