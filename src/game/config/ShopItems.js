// src/game/config/ShopItems.js

// 🌟 2. 流浪商行隨機商品池 (隨玩家等級解鎖)
export const RANDOM_ITEM_POOL = [
  // --- 消耗品 (秘藥與奇物) ---
  { id: 'potion_small', name: '微型治癒藥水', desc: '飲用後恢復 30 點生命值 (HP)', basePrice: 80, minLevel: 1, icon: '🧪', type: 'consumable' },
  { id: 'ap_battery',   name: '活力秘藥',     desc: '飲用後瞬間恢復 20 點行動耐力 (AP)', basePrice: 120, minLevel: 1, icon: '🏺', type: 'consumable' },
  { id: 'potion_large', name: '女神的聖水',   desc: '受到神聖祝福，恢復 100 點生命值 (HP)', basePrice: 250, minLevel: 3, icon: '🍷', type: 'consumable' },
  { id: 'bomb_item',    name: '煉金爆火',     desc: '行囊奇物：擲出後對周圍九宮格造成毀滅性範圍傷害', basePrice: 400, minLevel: 2, icon: '💣', type: 'consumable' },
  { id: 'shield_item',  name: '聖光護身符',   desc: '行囊奇物：產生聖光法陣，完全抵擋下一次受到的傷害', basePrice: 500, minLevel: 4, icon: '🛡️', type: 'consumable' },
  { id: 'relic_holy_maiden_prayer', name: '聖女的限時祈禱', desc: '獲得聖女的祝福，15 分鐘內獲得的 EXP 提升 15%', basePrice: 300, minLevel: 1, icon: '⏳', type: 'consumable' },
  
  // --- 系統指令解鎖區 (魔法卷軸與戰技) ---
  { id: 'module_dash',      name: '瞬動術卷軸',   desc: '永久解鎖高速位移法術 (dash)', basePrice: 800, minLevel: 1, icon: '💨', type: 'unlock' },
  { id: 'module_spread',    name: '多重火花卷軸', desc: '永久解鎖扇形魔法擴散射擊 (spread_shot)', basePrice: 1200, minLevel: 2, icon: '✨', type: 'unlock' },
  { id: 'module_magic',     name: '爆炎術卷軸',   desc: '永久解鎖高能火屬性魔法攻擊 (magic)', basePrice: 1500, minLevel: 3, icon: '🔥', type: 'unlock' },
  { id: 'module_bomb',      name: '爆裂法陣卷軸', desc: '永久解鎖放置延遲魔法地雷 (bomb)', basePrice: 1800, minLevel: 3, icon: '🧨', type: 'unlock' },
  { id: 'module_radar',     name: '真視之眼卷軸', desc: '解鎖高級感知魔法，洞悉迷宮 (hasKey, lowHp)', basePrice: 2000, minLevel: 2, icon: '👁️', type: 'unlock' },
  { id: 'module_hack',      name: '崩解術卷軸',   desc: '永久解鎖破壞迷宮石壁的法術 (hack_wall)', basePrice: 2500, minLevel: 4, icon: '⛏️', type: 'unlock' },
  { id: 'module_heal',      name: '聖療術卷軸',   desc: '永久解鎖引導聖光自我治癒法術 (heal)', basePrice: 3000, minLevel: 4, icon: '💖', type: 'unlock' },
  { id: 'module_boomerang', name: '迴旋飛刃卷軸', desc: '永久解鎖折返型迴旋魔法攻擊 (boomerang)', basePrice: 3500, minLevel: 5, icon: '🪃', type: 'unlock' },
  { id: 'module_pull',      name: '引力漩渦卷軸', desc: '永久解鎖將目標強制牽引的法術 (pull)', basePrice: 4000, minLevel: 5, icon: '🌀', type: 'unlock' },
  { id: 'module_laser',     name: '貫穿魔光卷軸', desc: '永久解鎖釋放直線貫穿魔砲 (laser)', basePrice: 4500, minLevel: 6, icon: '☄️', type: 'unlock' },
  { id: 'module_whirlwind', name: '劍刃風暴卷軸', desc: '永久解鎖剿滅周圍魔物的清場戰技 (whirlwind)', basePrice: 6000, minLevel: 7, icon: '🌪️', type: 'unlock' },
  { id: 'relic_goddess_blessing', name: '女神的永久眷顧', desc: '靈魂與女神綁定，永久提升 25% 獲得的 EXP', basePrice: 5000, minLevel: 10, icon: '✨', type: 'unlock' },
];