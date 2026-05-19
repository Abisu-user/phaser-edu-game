// src/game/config/ShopItems.js

// 🌟 1. 祭壇基礎能力鍛鍊 (對應原：FIXED_UPGRADES)
export const FIXED_UPGRADES = [
  { id: 'max_hp_up', name: '巨人之心', desc: '永久提升冒險者最大生命極限 (HP) 20 點', basePrice: 500, priceIncrement: 300, icon: '❤️', type: 'upgrade' },
  { id: 'max_mp_up', name: '魔力源泉', desc: '永久提升詠唱最大魔力儲備 (MP) 10 點', basePrice: 600, priceIncrement: 350, icon: '🔮', type: 'upgrade' },
  { id: 'max_ap_up', name: '風神護符', desc: '永久提升單回合最大行動耐力 (AP) 10 點', basePrice: 700, priceIncrement: 400, icon: '🦅', type: 'upgrade' },
  { id: 'atk_up',    name: '戰神之刃', desc: '永久提升基礎破壞力 (ATK) 5 點', basePrice: 800, priceIncrement: 450, icon: '⚔️', type: 'upgrade' }
];

// 🌟 2. 流浪商行隨機商品池 (隨玩家等級解鎖)
export const RANDOM_ITEM_POOL = [
  // --- 消耗品 (秘藥與奇物) ---
  { id: 'potion_small', name: '微型治癒藥水', desc: '飲用後恢復 30 點生命值 (HP)', basePrice: 80, minLevel: 1, icon: '🧪', type: 'consumable' },
  { id: 'ap_battery',   name: '活力秘藥',     desc: '飲用後瞬間恢復 20 點行動耐力 (AP)', basePrice: 120, minLevel: 1, icon: '🏺', type: 'consumable' },
  { id: 'potion_large', name: '女神的聖水',   desc: '受到神聖祝福，恢復 100 點生命值 (HP)', basePrice: 250, minLevel: 3, icon: '🍷', type: 'consumable' },
  { id: 'bomb_item',    name: '煉金爆火',     desc: '行囊奇物：擲出後對周圍九宮格造成毀滅性範圍傷害', basePrice: 400, minLevel: 2, icon: '💣', type: 'consumable' },
  { id: 'shield_item',  name: '聖光護身符',   desc: '行囊奇物：產生聖光法陣，完全抵擋下一次受到的傷害', basePrice: 500, minLevel: 4, icon: '🛡️', type: 'consumable' },
  
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
];