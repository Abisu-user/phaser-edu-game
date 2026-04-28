export const COMMAND_DICT = [
  // --- 移動類 ---
  { id: 'moveUp',    label: '⬆️ 向上走 (moveUp)', type: 'action', ap: 1 },
  { id: 'moveDown',  label: '⬇️ 向下走 (moveDown)', type: 'action', ap: 1 },
  { id: 'moveLeft',  label: '⬅️ 向左走 (moveLeft)', type: 'action', ap: 1 },
  { id: 'moveRight', label: '➡️ 向右走 (moveRight)', type: 'action', ap: 1 },
  { id: 'wait',      label: '⏳ 等待 (wait)',   type: 'action', ap: 0 },
  { id: 'dash',      label: '💨 衝刺 (dash)',   type: 'action', ap: 2 },

  // --- 互動類 ---
  { id: 'take', label: '🤏 撿起 (take)', type: 'action', ap: 1 },
  { id: 'open', label: '🚪 打開 (open)', type: 'action', ap: 1 },

  // --- 攻擊與戰鬥類 ---
  { id: 'attack',      label: '⚔️ 揮劍 (attack)',    type: 'action', ap: 1 },
  { id: 'shoot',       label: '🏹 射擊 (shoot)',     type: 'action', ap: 1 },
  { id: 'spread_shot', label: '🏹 散彈 (spread_shot)',type: 'action', ap: 2 },
  { id: 'magic',       label: '🔥 魔法 (magic)',     type: 'action', mp: 1 },
  { id: 'bomb',        label: '💣 放炸彈 (bomb)',    type: 'action', ap: 2 },
  { id: 'laser',       label: '⚡ 雷射 (laser)',     type: 'action', ap: 3 },
  { id: 'whirlwind',   label: '🌪️ 旋風斬 (whirlwind)',type: 'action', ap: 2 },
  { id: 'boomerang',   label: '🪃 迴旋鏢 (boomerang)',type: 'action', ap: 1 },
  { id: 'pull',        label: '🧲 資料抓取 (pull)',  type: 'action', ap: 1 },
  { id: 'hack_wall',   label: '🗑️ 垃圾回收 (hack_wall)', type: 'action', ap: 1 },
  { id: 'heal',        label: '💖 補血 (heal)',      type: 'action', mp: 1 },

  // --- 條件感知類 (回傳 True/False) ---
  { id: 'isWall',  label: '🧱 前方有牆壁 (isWall)', type: 'sensor', ap: 0 },
  { id: 'isEnemy', label: '👾 遇到敵人 (isEnemy)',   type: 'sensor', ap: 0 },
  { id: 'isGoal',  label: '🏁 抵達終點 (isGoal)',   type: 'sensor', ap: 0 },
  { id: 'hasKey',  label: '🔑 有鑰匙 (hasKey)',     type: 'sensor', ap: 0 },
  { id: 'lowHp',   label: '🩸 血量過低 (lowHp)',   type: 'sensor', ap: 0 },

  // --- 邏輯控制類 ---
  { id: 'if',       label: '🤔 如果 (if)',       type: 'logic', ap: 0 },
  { id: 'else',     label: '🔄 否則 (else)',     type: 'logic', ap: 0 },
  { id: 'for',      label: '🔁 重複 (for)',      type: 'logic', ap: 0 },
  { id: 'while',    label: '🌀 當 (while)',      type: 'logic', ap: 0 },
  { id: 'function', label: '📦 函式 (function)', type: 'logic', ap: 0 },
  { id: 'break',    label: '🛑 中斷 (break)',    type: 'logic', ap: 0 },
];