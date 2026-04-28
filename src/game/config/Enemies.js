// src/game/config/Enemies.js

export const ENEMY_DICT = {
  // 1. 基礎怪：巡邏蟲 (行為不可預測，到處亂走)
  'patrol_bug': {
    id: 'patrol_bug',
    name: '巡邏蟲',
    hp: 30,
    damage: 10,
    symbol: '🐛', // 預留欄位：之後可以讓不同怪物顯示不同 Emoji 或圖片
    description: '基礎的惡意除錯蟲，沒有目標，只會在網格上隨機移動。',
    
    // AI 邏輯：決定下一步要走去哪
    takeTurn: (enemyState, playerState) => {
      // 巡邏蟲邏輯：隨機選擇上下左右其中一個方向
      const moves = [
        { dx: 0, dy: -1 }, // 上
        { dx: 0, dy: 1 },  // 下
        { dx: -1, dy: 0 }, // 左
        { dx: 1, dy: 0 }   // 右
      ];
      // 隨機抽一個方向
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      
      return { 
        action: 'move', 
        targetX: enemyState.gx + randomMove.dx, 
        targetY: enemyState.gy + randomMove.dy 
      };
    }
  },

  // 2. 進階怪：追跡病毒 (具備簡單尋路功能)
  'tracker_virus': {
    id: 'tracker_virus',
    name: '追跡病毒',
    hp: 50,
    damage: 15,
    symbol: '🦠',
    description: '會鎖定機甲的座標，不斷朝著玩家逼近的危險程式。',
    
    takeTurn: (enemyState, playerState) => {
      // 追跡病毒邏輯：比較自己與玩家的 X, Y 座標，決定往哪走
      let dx = 0;
      let dy = 0;

      // 先決定要走水平還是垂直 (簡單的靠近邏輯)
      if (Math.abs(playerState.pgx - enemyState.gx) > Math.abs(playerState.pgy - enemyState.gy)) {
        // X 軸距離比較遠，水平移動
        dx = playerState.pgx > enemyState.gx ? 1 : -1;
      } else {
        // Y 軸距離比較遠，垂直移動
        dy = playerState.pgy > enemyState.gy ? 1 : -1;
      }

      return { 
        action: 'move', 
        targetX: enemyState.gx + dx, 
        targetY: enemyState.gy + dy 
      };
    }
  }
};