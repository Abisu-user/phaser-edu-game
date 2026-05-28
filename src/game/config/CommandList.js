// ==========================================
// ⚔️ 局內指令 (關卡內專用：包含戰鬥、AP/MP消耗、解鎖條件)
// ==========================================
export const COMMAND_DICT = [
  // === 🟢 基礎指令 (無須解鎖) ===
  { id: 'moveUp', label: '⬆️ 向上走 (moveUp)', type: 'action', ap: 1, desc: '引導冒險者向北方移動一個步伐。', example: 'moveUp();' },
  { id: 'moveDown', label: '⬇️ 向下走 (moveDown)', type: 'action', ap: 1, desc: '引導冒險者向南方移動一個步伐。', example: 'moveDown();' },
  { id: 'moveLeft', label: '⬅️ 向左走 (moveLeft)', type: 'action', ap: 1, desc: '引導冒險者向西方移動一個步伐。', example: 'moveLeft();' },
  { id: 'moveRight', label: '➡️ 向右走 (moveRight)', type: 'action', ap: 1, desc: '引導冒險者向東方移動一個步伐。', example: 'moveRight();' },
  { id: 'wait', label: '⏳ 等待 (wait)', type: 'action', ap: 0, desc: '原地進入屏息守備，不消耗行動耐力。', example: 'wait();' },
  { id: 'open', label: '🚪 打開 (open)', type: 'action', ap: 1, desc: '解開機關並開啟前方的地下城閘門。', example: 'open();' },
  { id: 'attack', label: '⚔️ 魔法 (attack)', type: 'action', ap: 1, desc: '施展魔法，對相鄰的魔物造成魔法傷害。', example: 'attack();' },
  { id: 'shoot', label: '🏹 射擊 (shoot)', type: 'action', ap: 1, desc: '射出魔法箭矢，具備較長射程攻擊手段。', example: 'shoot();' },
  { id: 'isWall', label: '🧱 前方有牆壁 (isWall)', type: 'sensor', ap: 0, desc: '感知前方是否存在無法通行的地下城石壁。', example: 'isWall(0, 1);' },
  { id: 'isEnemy', label: '👾 遇到敵人 (isEnemy)', type: 'sensor', ap: 0, desc: '感知前方是否存在具備敵意的魔物氣息。', example: 'isEnemy(1, 0);' },
  { id: 'if', label: '🤔 如果 (if)', type: 'logic', ap: 0, desc: '法術的因果律分支判定。', example: 'if (isEnemy(0, 1)) {\n  attack();\n}' },
  { id: 'else', label: '🔄 否則 (else)', type: 'logic', ap: 0, desc: '與 if 配合使用的命運轉折區塊。', example: 'else {\n  moveUp();\n}' },
  { id: 'for', label: '🔁 重複 (for)', type: 'logic', ap: 0, desc: '設定固定的迴圈次數來反覆詠唱法術。', example: 'for(let i=0; i<4; i++) {\n  moveRight();\n}' },
  { id: 'while', label: '🌀 當 (while)', type: 'logic', ap: 0, desc: '只要特定魔力條件成立，便持續牽引法術迴圈。', example: 'while (!isWall(0, 1)) {\n  moveUp();\n}' },
  { id: 'function', label: '📦 函式 (function)', type: 'logic', ap: 0, desc: '將複雜的法術軌跡封裝為真名，以便隨時呼喚。', example: 'function patrol() {\n  moveUp();\n}' },
  { id: 'break', label: '🛑 中斷 (break)', type: 'logic', ap: 0, desc: '強制截斷當前的法術迴圈。', example: 'break;' },

  // === 🔴 進階指令 (需在商店購買卷軸解鎖) ===
  { id: 'dash', label: '💨 衝刺 (dash)', type: 'action', ap: 2, reqModule: 'module_dash', desc: '消耗大量耐力施展瞬動步法，進行長距離位移。', example: 'dash();' },
  { id: 'spread_shot', label: '✨ 散彈 (spread_shot)', type: 'action', ap: 2, reqModule: 'module_spread', desc: '釋放扇形擴散的魔法火花，打擊複數敵人。', example: 'spread_shot();' },
  { id: 'magic', label: '🔥 魔法 (magic)', type: 'action', mp: 1, reqModule: 'module_magic', desc: '消耗魔力詠唱爆炎術，引發強烈的高溫爆破。', example: 'magic();' },
  { id: 'bomb', label: '🧨 延遲爆破 (bomb)', type: 'action', ap: 2, reqModule: 'module_bomb', desc: '在地上繪製延遲爆裂法陣，對 3x3 範圍造成毀滅打擊。', example: 'bomb();' },
  { id: 'laser', label: '☄️ 貫穿光束 (laser)', type: 'action', ap: 3, reqModule: 'module_laser', desc: '引導魔力射出貫穿直線上所有魔物的極光魔砲。', example: 'laser();' },
  { id: 'whirlwind', label: '🌪️ 旋風斬 (whirlwind)', type: 'action', ap: 2, reqModule: 'module_whirlwind', desc: '揮舞武器化為劍刃風暴，對周圍八個方位發動無差別斬擊。', example: 'whirlwind();' },
  { id: 'boomerang', label: '🪃 迴旋鏢 (boomerang)', type: 'action', ap: 1, reqModule: 'module_boomerang', desc: '擲出附帶風之魔力的迴旋飛刃，撕裂路徑上的敵人並折返。', example: 'boomerang();' },
  { id: 'pull', label: '🌀 引力漩渦 (pull)', type: 'action', ap: 1, reqModule: 'module_pull', desc: '施展引力魔法，將遠方的魔物強制牽扯至身前。', example: 'pull();' },
  { id: 'hack_wall', label: '⛏️ 崩解石壁 (hack_wall)', type: 'action', ap: 1, reqModule: 'module_hack', desc: '施展崩解術，將擋路的地下城石壁化為齏粉。', example: 'hack_wall();' },
  { id: 'heal', label: '💖 聖療 (heal)', type: 'action', mp: 1, reqModule: 'module_heal', desc: '消耗魔力引導聖光，治癒冒險者的肉體創傷。', example: 'heal();' },
];


// ==========================================
// 🗺️ 局外指令 (大廳/大地圖專用：無 AP/MP、無戰鬥技能)
// ==========================================
export const OUTGAME_COMMANDS = [
  // 基礎移動與互動
  { id: 'moveUp', label: '⬆️ 向上走 (moveUp)', type: 'action', desc: '向北方移動一個步伐。' },
  { id: 'moveDown', label: '⬇️ 向下走 (moveDown)', type: 'action', desc: '向南方移動一個步伐。' },
  { id: 'moveLeft', label: '⬅️ 向左走 (moveLeft)', type: 'action', desc: '向西方移動一個步伐。' },
  { id: 'moveRight', label: '➡️ 向右走 (moveRight)', type: 'action', desc: '向東方移動一個步伐。' },
  { id: 'attack', label: '⚔️ 魔法 (attack)', type: 'action', desc: '施展魔法，對相鄰的魔物造成魔法傷害。'},
  { id: 'shoot', label: '🏹 射擊 (shoot)', type: 'action', desc: '射出魔法箭矢，具備較長射程攻擊手段。'},
  { id: 'isWall', label: '🧱 前方有牆壁 (isWall)', type: 'sensor', desc: '感知前方是否有障礙物擋道。' },
  { id: 'isEnemy', label: '👾 遇到敵人 (isEnemy)', type: 'sensor', desc: '感知前方是否存在具備敵意的魔物氣息。' },
  { id: 'if', label: '🤔 如果 (if)', type: 'logic', desc: '簡單的條件判斷。' },
  { id: 'else', label: '🔄 否則 (else)', type: 'logic', desc: '條件不成立時的轉折。' },
  { id: 'for', label: '🔁 重複 (for)', type: 'logic', desc: '設定固定的次數來重複移動。' },
  { id: 'while', label: '🌀 當 (while)', type: 'logic', desc: '只要條件成立就持續執行。' },
  { id: 'function', label: '📦 函式 (function)', type: 'logic', desc: '將移動步驟打包備用。' },
  { id: 'break', label: '🛑 中斷 (break)', type: 'logic', desc: '強制截斷當前的法術迴圈。'},
];