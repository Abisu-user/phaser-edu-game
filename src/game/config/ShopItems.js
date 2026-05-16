// src/game/config/ShopItems.js

// 🌟 1. 固定核心強化 (會隨購買次數漲價)
// 設定基礎價格與每次升級的漲幅
export const FIXED_UPGRADES = [
  { id: 'max_hp_up', name: '鈦合金裝甲', desc: '永久提升機甲最大 HP 20 點', basePrice: 500, priceIncrement: 300, icon: '🛡️', type: 'upgrade' },
  { id: 'max_mp_up', name: '超導體電容', desc: '永久提升機甲最大 MP 10 點', basePrice: 600, priceIncrement: 350, icon: '⚡', type: 'upgrade' },
  { id: 'max_ap_up', name: '超頻處理器', desc: '永久提升機甲最大 AP 10 點', basePrice: 700, priceIncrement: 400, icon: '⚙️', type: 'upgrade' },
  { id: 'atk_up',    name: '等離子刀刃', desc: '永久提升基礎攻擊力 (ATK) 5 點', basePrice: 800, priceIncrement: 450, icon: '⚔️', type: 'upgrade' }
];

// 🌟 2. 黑市隨機商品池 (隨玩家等級解鎖)
export const RANDOM_ITEM_POOL = [
  // 消耗品
  { id: 'potion_small', name: '微型結構膠', desc: '恢復機甲 30 點 HP', basePrice: 80, minLevel: 1, icon: '🩹', type: 'consumable' },
  { id: 'ap_battery',   name: '應急電池',   desc: '恢復 20 點行動值 (AP)', basePrice: 120, minLevel: 1, icon: '🔋', type: 'consumable' },
  { id: 'potion_large', name: '奈米修復艙', desc: '恢復機甲 100 點 HP', basePrice: 250, minLevel: 3, icon: '💉', type: 'consumable' },
  { id: 'bomb_item',    name: '爆破手雷',   desc: '局內道具：對周圍九宮格造成範圍傷害', basePrice: 400, minLevel: 2, icon: '💣', type: 'consumable' },
  { id: 'shield_item',  name: '力場護盾',   desc: '局內道具：抵擋下一次受到的傷害', basePrice: 500, minLevel: 4, icon: '🛡️', type: 'consumable' },
  
  // 系統指令解鎖區 (對應 COMMAND_DICT 中的 reqModule)
  { id: 'module_dash',      name: '衝刺引擎', desc: '永久解鎖高速位移指令 (dash)', basePrice: 800, minLevel: 1, icon: '💨', type: 'unlock' },
  { id: 'module_spread',    name: '散彈核心', desc: '永久解鎖扇形擴散射擊 (spread_shot)', basePrice: 1200, minLevel: 2, icon: '💥', type: 'unlock' },
  { id: 'module_magic',     name: '魔力迴路', desc: '永久解鎖高能魔法攻擊 (magic)', basePrice: 1500, minLevel: 3, icon: '🔥', type: 'unlock' },
  { id: 'module_bomb',      name: '爆破權限', desc: '永久解鎖放置延時炸彈 (bomb)', basePrice: 1800, minLevel: 3, icon: '🧨', type: 'unlock' },
  { id: 'module_radar',     name: '雷達模組', desc: '解鎖高級感知 (hasKey, lowHp)', basePrice: 2000, minLevel: 2, icon: '📡', type: 'unlock' },
  { id: 'module_hack',      name: '駭客模組', desc: '永久解鎖地圖破壞指令 (hack_wall)', basePrice: 2500, minLevel: 4, icon: '💻', type: 'unlock' },
  { id: 'module_heal',      name: '修復模組', desc: '永久解鎖自我修復指令 (heal)', basePrice: 3000, minLevel: 4, icon: '💖', type: 'unlock' },
  { id: 'module_boomerang', name: '磁浮導引', desc: '永久解鎖折返型攻擊 (boomerang)', basePrice: 3500, minLevel: 5, icon: '🪃', type: 'unlock' },
  { id: 'module_pull',      name: '引力發生器', desc: '永久解鎖目標抓取指令 (pull)', basePrice: 4000, minLevel: 5, icon: '🧲', type: 'unlock' },
  { id: 'module_laser',     name: '雷射模組', desc: '永久解鎖直線貫穿指令 (laser)', basePrice: 4500, minLevel: 6, icon: '☄️', type: 'unlock' },
  { id: 'module_whirlwind', name: '旋風模組', desc: '永久解鎖周圍清場指令 (whirlwind)', basePrice: 6000, minLevel: 7, icon: '🌪️', type: 'unlock' },
];