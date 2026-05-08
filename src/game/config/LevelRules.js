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
    let allowedEnemies = ['patrol_bug']; 
    
    // 🌟 新增：通關條件與特殊物件預設值
    // type 可以是: 'reach_goal' (單純抵達), 'kill_enemies' (殺怪), 'collect_keys' (找鑰匙)
    let winCondition = { type: 'reach_goal', targetValue: 0 }; 
    let keyCount = 0; // 該層地圖需要生成的鑰匙數量

    // 依據樓層調整難度與通關條件
    if (floor >= 1 && floor <= 3) {
      // 第 1~3 層：新手區 (單純抵達終點即可)
      gridSize = 10;
      enemyCount = Math.floor(floor / 2) + 1; 
      allowedEnemies = ['patrol_bug'];
      winCondition = { type: 'reach_goal', targetValue: 0 };
      
    } else if (floor >= 4 && floor <= 7) {
      // 第 4~7 層：進階區 (開始出現追跡病毒，並加入變化條件)
      gridSize = 12;
      enemyCount = Math.floor(floor / 2) + 1; 
      allowedEnemies = ['patrol_bug', 'patrol_bug', 'tracker_virus']; 
      
      // 🌟 設定樓層變化：偶數層要求殺怪，奇數層要求找鑰匙
      if (floor % 2 === 0) {
        // 要求擊殺目前層數一半的怪物 (向上取整)
        winCondition = { type: 'kill_enemies', targetValue: Math.ceil(enemyCount / 2) }; 
      } else {
        // 要求收集 1 把鑰匙才能開門
        winCondition = { type: 'collect_keys', targetValue: 1 };
        keyCount = 1;
      }
      
    } else if (floor >= 8 && floor <= 15) {
      // 第 8~15 層：困難區 
      gridSize = 15;
      enemyCount = 4 + Math.floor((floor - 7) / 2); 
      allowedEnemies = ['patrol_bug', 'tracker_virus'];
      
      // 🌟 更難的條件
      if (floor % 3 === 0) {
        winCondition = { type: 'collect_keys', targetValue: 2 };
        keyCount = 2; // 地圖上會生成 2 把鑰匙
      } else {
        winCondition = { type: 'kill_enemies', targetValue: enemyCount }; // 必須全滅怪物
      }
      
    } else {
      // 第 16 層以上：無間地獄
      gridSize = 18;
      enemyCount = 8 + Math.floor((floor - 15) / 3); 
      allowedEnemies = ['tracker_virus']; 
      
      // 複合條件：極端困難 (全滅且可能還有鑰匙，這裡簡化為全滅)
      winCondition = { type: 'exterminate', targetValue: enemyCount }; 
    }

    return {
      gridSize,
      enemyCount,
      allowedEnemies,
      winCondition, // 回傳給遊戲場景判斷
      keyCount      // 回傳給地圖生成器生成鑰匙
    };
  }
};

// 預留未來擴充
export const ROOM_TYPES = {
  'standard': { id: 'standard', name: '駭入終端機' },
  'exterminate': { id: 'exterminate', name: '全數殲滅' },
  'key_retrieval': { id: 'key_retrieval', name: '資料金鑰回收' }
};