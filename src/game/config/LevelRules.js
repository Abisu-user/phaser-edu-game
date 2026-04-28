// src/game/config/LevelRules.js

export const FLOOR_CONFIG = {
  /**
   * 根據目前樓層，回傳該樓層的地圖與生成設定
   * @param {number} floor 當前樓層
   * @returns {Object} 難度設定檔
   */
  getDifficulty: (floor) => {
    // 預設基礎值
    let gridSize = 10;
    let enemyCount = 1;
    let allowedEnemies = ['patrol_bug']; // 初期只有簡單的蟲子

    // 依據樓層調整難度
    if (floor >= 1 && floor <= 3) {
      // 第 1~3 層：新手區
      gridSize = 10;
      enemyCount = Math.floor(floor / 2) + 1; // 1~2 隻
      allowedEnemies = ['patrol_bug'];
      
    } else if (floor >= 4 && floor <= 7) {
      // 第 4~7 層：進階區 (開始出現追跡病毒)
      gridSize = 12;
      enemyCount = Math.floor(floor / 2) + 1; // 3~4 隻
      allowedEnemies = ['patrol_bug', 'patrol_bug', 'tracker_virus']; // 用比例控制出現機率
      
    } else if (floor >= 8 && floor <= 15) {
      // 第 8~15 層：困難區 (地圖變大，怪物變多)
      gridSize = 15;
      enemyCount = 4 + Math.floor((floor - 7) / 2); // 4~8 隻
      allowedEnemies = ['patrol_bug', 'tracker_virus'];
      
    } else {
      // 第 16 層以上：無間地獄
      gridSize = 18;
      enemyCount = 8 + Math.floor((floor - 15) / 3); 
      allowedEnemies = ['tracker_virus']; // 全都是會追人的病毒！
    }

    return {
      gridSize,
      enemyCount,
      allowedEnemies
    };
  }
};

// 預留未來擴充：如果你想要有不同的過關條件（例如全滅怪物才能過關）
export const ROOM_TYPES = {
  'standard': { id: 'standard', name: '駭入終端機' },
  'exterminate': { id: 'exterminate', name: '全數殲滅' }
};