export const COMMAND_DICT = [
  // --- 移動類 ---
  { id: 'moveUp', label: '⬆️ 向上走', type: 'action' },
  { id: 'moveDown', label: '⬇️ 向下走', type: 'action' },
  { id: 'moveLeft', label: '⬅️ 向左走', type: 'action' },
  { id: 'moveRight', label: '➡️ 向右走', type: 'action' },
  { id: 'wait', label: '⏳ 等待', type: 'action' },

  // --- 互動類 ---
  { id: 'take', label: '🤏 撿起', type: 'action' },
  { id: 'open', label: '🚪 打開', type: 'action' },

  // --- 攻擊與戰鬥類 ---
  { id: 'attack', label: '⚔️ 揮劍', type: 'action' },
  { id: 'shoot', label: '🏹 射擊', type: 'action' },
  { id: 'magic', label: '🔥 魔法', type: 'action' },
  { id: 'bomb', label: '💣 放炸彈', type: 'action' },
  { id: 'heal', label: '💖 補血', type: 'action' },
  { id: 'dash', label: '💨 衝刺', type: 'action' },

  // --- 條件感知類 (回傳 True/False) ---
  { id: 'isWall', label: '🧱 遇到牆壁', type: 'sensor' },
  { id: 'isEnemy', label: '👾 遇到敵人', type: 'sensor' },
  { id: 'isGoal', label: '🏁 抵達終點', type: 'sensor' },
  { id: 'hasKey', label: '🔑 有鑰匙', type: 'sensor' },
  { id: 'lowHp', label: '🩸 血量過低', type: 'sensor' },

  // --- 邏輯控制類 ---
  { id: 'repeat', label: '🔁 重複執行', type: 'logic' },
  { id: 'while', label: '🔄 直到條件成立', type: 'logic' },
  { id: 'if', label: '🤔 如果 (If)', type: 'logic' },
  { id: 'ifElse', label: '⚖️ 如果...否則...', type: 'logic' }
];