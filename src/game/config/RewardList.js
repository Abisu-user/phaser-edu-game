export const REWARD_POOL = [
  {
    id: 'atk_up',
    name: '戰神賜福',
    desc: '基礎破壞力 +5',
    icon: '⚔️',
    apply: (stats) => ({ attack: (stats.attack || 10) + 5})
  },
  {
    id: 'max_hp_up',
    name: '巨人之心',
    desc: '最大生命極限 +20，並恢復 20 點生命',
    icon: '❤️',
    apply: (stats) => ({ 
      maxHp: stats.maxHp + 20, 
      hp: Math.min(stats.hp + 20, stats.maxHp + 20) 
    })
  },
  {
    id: 'ap_up',
    name: '風之神速',
    desc: '最大行動耐力 (AP) +5',
    icon: '🦅',
    apply: (stats) => ({ maxAp: stats.maxAp + 5, ap: stats.ap + 5 })
  },
  {
    id: 'mp_up',
    name: '深淵魔源',
    desc: '最大魔力儲備 (MP) +10',
    icon: '🔮',
    apply: (stats) => ({ maxMp: stats.maxMp + 10, mp: stats.mp + 10 })
  },
  {
    id: 'coin_stash',
    name: '沉睡的黃金寶箱',
    desc: '獲得 100 枚奉獻金幣',
    icon: '🪙',
    apply: (stats) => ({ coins: stats.coins + 100 })
  },
  {
    id: 'exp_chip',
    name: '先知的殘卷',
    desc: '獲得 150 點累積奉獻 (EXP)',
    icon: '📜',
    apply: (stats) => ({ xp: stats.xp + 150 })
  },
  {
    id: 'full_heal',
    name: '世界樹之露',
    desc: '生命值 (HP) 奇蹟般地完全恢復',
    icon: '🧪',
    apply: (stats) => ({ hp: stats.maxHp })
  }
];


export const REWARD_DICT = [
  // --- 元素附魔 ---
  {
    id: 'relic_fire', name: '伊弗利特的餘燼', desc: '武器附帶烈焰，將魔物吞噬於火海之中。',
    icon: '🔥', type: 'relic', relicId: 'element_fire'
  },
  {
    id: 'relic_lightning', name: '蒼雷印記', desc: '攻擊時引發狂暴的落雷特效。',
    icon: '⚡', type: 'relic', relicId: 'element_lightning'
  },
  {
    id: 'relic_ice', name: '極地冰晶', desc: '武器散發刺骨的冰霜寒氣。',
    icon: '❄️', type: 'relic', relicId: 'element_ice'
  },
  
  // --- 物理變異 ---
  {
    id: 'relic_cleave', name: '狂風劍氣', desc: '劍氣擴散，對目標及其左右兩側的敵人造成橫掃打擊。',
    icon: '🌪️', type: 'relic', relicId: 'modifier_cleave'
  },
  {
    id: 'relic_double', name: '幻影連擊', desc: '突破肉體極限，發動迅雷不及掩耳的雙重連擊。',
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