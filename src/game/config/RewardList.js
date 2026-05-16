export const REWARD_POOL = [
  {
    id: 'atk_up',
    name: '火力強化',
    desc: '基礎攻擊力 +5',
    icon: '⚔️',
    apply: (stats) => ({ attack: stats.attack + 5 })
  },
  {
    id: 'max_hp_up',
    name: '鈦合金裝甲',
    desc: '最大 HP +20，並回復 20 HP',
    icon: '❤️',
    apply: (stats) => ({ 
      maxHp: stats.maxHp + 20, 
      hp: Math.min(stats.hp + 20, stats.maxHp + 20) 
    })
  },
  {
    id: 'ap_up',
    name: '引擎超載',
    desc: '最大 AP +5',
    icon: '⚡',
    apply: (stats) => ({ maxAp: stats.maxAp + 5, ap: stats.ap + 5 })
  },
  {
    id: 'mp_up',
    name: '魔力擴充',
    desc: '最大 MP +10',
    icon: '🔮',
    apply: (stats) => ({ maxMp: stats.maxMp + 10, mp: stats.mp + 10 })
  },
  {
    id: 'coin_stash',
    name: '舊世代保險箱',
    desc: '獲得 100 金幣',
    icon: '💰',
    apply: (stats) => ({ coins: stats.coins + 100 })
  },
  {
    id: 'exp_chip',
    name: '作戰經驗晶片',
    desc: '獲得 150 EXP',
    icon: '🧠',
    apply: (stats) => ({ xp: stats.xp + 150 })
  },
  {
    id: 'full_heal',
    name: '奈米機器人',
    desc: 'HP 完全回復',
    icon: '💉',
    apply: (stats) => ({ hp: stats.maxHp })
  }
];


export const REWARD_DICT = [
  // --- 元素附魔 ---
  {
    id: 'relic_fire', name: '紅炎核心', desc: '攻擊附帶火焰，對敵人造成燃燒視覺。',
    icon: '🔥', type: 'relic', relicId: 'element_fire'
  },
  {
    id: 'relic_lightning', name: '高壓線圈', desc: '攻擊附帶雷電特效。',
    icon: '⚡', type: 'relic', relicId: 'element_lightning'
  },
  {
    id: 'relic_ice', name: '絕對零度', desc: '攻擊附帶冰凍特效。',
    icon: '❄️', type: 'relic', relicId: 'element_ice'
  },
  
  // --- 物理變異 ---
  {
    id: 'relic_cleave', name: '空間震盪器', desc: '攻擊範圍擴散至目標的左右兩側 (橫掃)。',
    icon: '🌊', type: 'relic', relicId: 'modifier_cleave'
  },
  {
    id: 'relic_double', name: '超頻齒輪', desc: '攻擊將會連續發動兩次 (連擊)。',
    icon: '⚔️', type: 'relic', relicId: 'modifier_double'
  }
];
/**
 * 隨機抽出 N 個不重複的獎勵
 */
export const getRandomRewards = (count = 3) => {
  const shuffled = [...REWARD_POOL, ...REWARD_DICT].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};