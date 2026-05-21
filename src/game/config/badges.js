// src/game/config/badges.js

export const BADGE_LIST = [
  // ==========================================
  // 🚀 路線一：關卡推進系列 (塔外)
  // ==========================================
  {
    id: 'first_blood', type: 'outside', icon: '🥚', name: '初來乍到', desc: '成功通關第 1 個關卡', rewardTitle: '初階探索者',
    target: 1, getCurrent: (stats) => stats.clearedLevelsCount || 0, checkUnlock: (stats) => (stats.clearedLevelsCount || 0) >= 1
  },
  {
    id: 'persistent', type: 'outside', icon: '🌱', name: '漸入佳境', desc: '累積通關 5 個關卡', rewardTitle: '拓荒先鋒',
    target: 5, getCurrent: (stats) => stats.clearedLevelsCount || 0, checkUnlock: (stats) => (stats.clearedLevelsCount || 0) >= 5
  },
  {
    id: 'veteran', type: 'outside', icon: '⚔️', name: '身經百戰', desc: '累積通關 10 個關卡', rewardTitle: '百戰勇士',
    target: 10, getCurrent: (stats) => stats.clearedLevelsCount || 0, checkUnlock: (stats) => (stats.clearedLevelsCount || 0) >= 10
  },
  {
    id: 'challenger', type: 'outside', icon: '🏆', name: '不屈挑戰者', desc: '累積通關 20 個關卡', rewardTitle: '無畏挑戰者',
    target: 20, getCurrent: (stats) => stats.clearedLevelsCount || 0, checkUnlock: (stats) => (stats.clearedLevelsCount || 0) >= 20
  },

  // ==========================================
  // 🧠 路線二：經驗累積系列 (塔外)
  // ==========================================
  {
    id: 'novice', type: 'outside', icon: '📘', name: '程式新手', desc: '累積獲得 500 點 XP', rewardTitle: '見習學徒',
    target: 500, getCurrent: (stats) => stats.currentTotalXP || 0, checkUnlock: (stats) => (stats.currentTotalXP || 0) >= 500
  },
  {
    id: 'apprentice', type: 'outside', icon: '🔥', name: '勤奮學徒', desc: '累積獲得 2,000 點 XP', rewardTitle: '求知者',
    target: 2000, getCurrent: (stats) => stats.currentTotalXP || 0, checkUnlock: (stats) => (stats.currentTotalXP || 0) >= 2000
  },
  {
    id: 'expert', type: 'outside', icon: '⚡', name: '熟練專家', desc: '累積獲得 5,000 點 XP', rewardTitle: '熟練專家',
    target: 5000, getCurrent: (stats) => stats.currentTotalXP || 0, checkUnlock: (stats) => (stats.currentTotalXP || 0) >= 5000
  },
  {
    id: 'elite', type: 'outside', icon: '🌟', name: '菁英編碼者', desc: '累積獲得 10,000 點 XP', rewardTitle: '菁英法師',
    target: 10000, getCurrent: (stats) => stats.currentTotalXP || 0, checkUnlock: (stats) => (stats.currentTotalXP || 0) >= 10000
  },
  {
    id: 'mythic', type: 'outside', icon: '☄️', name: '神話傳說', desc: '累積獲得 25,000 點 XP', rewardTitle: '傳說締造者',
    target: 25000, getCurrent: (stats) => stats.currentTotalXP || 0, checkUnlock: (stats) => (stats.currentTotalXP || 0) >= 25000
  },
  {
    id: 'legendary', type: 'outside', icon: '🌌', name: '無盡星空', desc: '累積獲得 50,000 點 XP', rewardTitle: '星空主宰',
    target: 50000, getCurrent: (stats) => stats.currentTotalXP || 0, checkUnlock: (stats) => (stats.currentTotalXP || 0) >= 50000
  },

  // ==========================================
  // 👑 路線三：等級突破系列 (塔外)
  // ==========================================
  {
    id: 'first_step', type: 'outside', icon: '🚶', name: '跨出新手村', desc: '等級達到 Lv.2', rewardTitle: '初生之犢',
    target: 2, getCurrent: (stats) => stats.currentLevel || 0, checkUnlock: (stats) => (stats.currentLevel || 0) >= 2
  },
  {
    id: 'rising_star', type: 'outside', icon: '⭐', name: '明日之星', desc: '等級達到 Lv.5', rewardTitle: '明日之星',
    target: 5, getCurrent: (stats) => stats.currentLevel || 0, checkUnlock: (stats) => (stats.currentLevel || 0) >= 5
  },
  {
    id: 'rich', type: 'outside', icon: '💎', name: '財富自由', desc: '等級達到 Lv.10', rewardTitle: '黃金貴族',
    target: 10, getCurrent: (stats) => stats.currentLevel || 0, checkUnlock: (stats) => (stats.currentLevel || 0) >= 10
  },
  {
    id: 'pro_gamer', type: 'outside', icon: '🎮', name: '職業玩家', desc: '等級達到 Lv.20', rewardTitle: '戰場老兵',
    target: 20, getCurrent: (stats) => stats.currentLevel || 0, checkUnlock: (stats) => (stats.currentLevel || 0) >= 20
  },
  {
    id: 'sage', type: 'outside', icon: '🧙‍♂️', name: '智慧大賢者', desc: '等級達到 Lv.30', rewardTitle: '大賢者',
    target: 30, getCurrent: (stats) => stats.currentLevel || 0, checkUnlock: (stats) => (stats.currentLevel || 0) >= 30
  },
  {
    id: 'grandmaster', type: 'outside', icon: '🐉', name: '龍之宗師', desc: '等級達到 Lv.50', rewardTitle: '宗師',
    target: 50, getCurrent: (stats) => stats.currentLevel || 0, checkUnlock: (stats) => (stats.currentLevel || 0) >= 50
  },
  {
    id: 'demigod', type: 'outside', icon: '👼', name: '半神降臨', desc: '等級達到 Lv.75', rewardTitle: '半神',
    target: 75, getCurrent: (stats) => stats.currentLevel || 0, checkUnlock: (stats) => (stats.currentLevel || 0) >= 75
  },
  {
    id: 'god_of_code', type: 'outside', icon: '💻', name: '程式碼之神', desc: '等級達到滿級 Lv.100', rewardTitle: '創世神',
    target: 100, getCurrent: (stats) => stats.currentLevel || 0, checkUnlock: (stats) => (stats.currentLevel || 0) >= 100
  },

 // ==========================================
  // 🏰 路線四：深淵高塔系列 (塔內)
  // ==========================================
  
  // --- 【推塔進度類】 ---
  { 
    id: 'tower_b10', type: 'tower', icon: '🦇', name: '深淵初探', desc: '成功討伐無盡地下城 第 10 層', rewardTitle: '深淵漫步者', 
    target: 10, getCurrent: (stats) => stats.bestFloor || 0, checkUnlock: (stats) => (stats.bestFloor || 0) >= 10 
  },
  { 
    id: 'tower_b20', type: 'tower', icon: '💀', name: '骸骨迷陣', desc: '成功討伐無盡地下城 第 20 層', rewardTitle: '破骨者', 
    target: 20, getCurrent: (stats) => stats.bestFloor || 0, checkUnlock: (stats) => (stats.bestFloor || 0) >= 20 
  },
  { 
    id: 'tower_b30', type: 'tower', icon: '👿', name: '惡魔凝視', desc: '成功討伐無盡地下城 第 30 層', rewardTitle: '深淵淨化者', 
    target: 30, getCurrent: (stats) => stats.bestFloor || 0, checkUnlock: (stats) => (stats.bestFloor || 0) >= 30 
  },
  { 
    id: 'tower_b40', type: 'tower', icon: '🌑', name: '暗影長廊', desc: '成功討伐無盡地下城 第 40 層', rewardTitle: '追光者', 
    target: 40, getCurrent: (stats) => stats.bestFloor || 0, checkUnlock: (stats) => (stats.bestFloor || 0) >= 40 
  },
  { 
    id: 'tower_b50', type: 'tower', icon: '🐉', name: '斬龍騎士', desc: '成功討伐無盡地下城 第 50 層', rewardTitle: '屠龍者', 
    target: 50, getCurrent: (stats) => stats.bestFloor || 0, checkUnlock: (stats) => (stats.bestFloor || 0) >= 50 
  },
  { 
    id: 'tower_b75', type: 'tower', icon: '🌌', name: '虛空領域', desc: '成功討伐無盡地下城 第 75 層', rewardTitle: '虛空行者', 
    target: 75, getCurrent: (stats) => stats.bestFloor || 0, checkUnlock: (stats) => (stats.bestFloor || 0) >= 75 
  },
  { 
    id: 'tower_b100', type: 'tower', icon: '👑', name: '深淵盡頭', desc: '成功討伐無盡地下城 第 100 層', rewardTitle: '深淵之主', 
    target: 100, getCurrent: (stats) => stats.bestFloor || 0, checkUnlock: (stats) => (stats.bestFloor || 0) >= 100 
  },

  // --- 【財富累積類】 ---
  { 
    id: 'rich_guy_tower', type: 'tower', icon: '💰', name: '高塔富翁', desc: '在深淵中累積獲得超過 1,000 金幣', rewardTitle: '初級理財家', 
    target: 1000, getCurrent: (stats) => stats.coins || 0, checkUnlock: (stats) => (stats.coins || 0) >= 1000 
  },
  { 
    id: 'wealth_10k', type: 'tower', icon: '💎', name: '貪婪之手', desc: '在深淵中累積獲得超過 10,000 金幣', rewardTitle: '尋寶獵人', 
    target: 10000, getCurrent: (stats) => stats.coins || 0, checkUnlock: (stats) => (stats.coins || 0) >= 10000 
  },
  { 
    id: 'wealth_100k', type: 'tower', icon: '🏦', name: '財寶深淵', desc: '在深淵中累積獲得超過 100,000 金幣', rewardTitle: '深淵大富翁', 
    target: 100000, getCurrent: (stats) => stats.coins || 0, checkUnlock: (stats) => (stats.coins || 0) >= 100000 
  },

  // --- 【殺敵討伐類】 ---
  { 
    id: 'kills_100', type: 'tower', icon: '⚔️', name: '鮮血試煉', desc: '在塔內累計擊殺 100 隻怪物', rewardTitle: '見習清道夫', 
    target: 100, getCurrent: (stats) => stats.totalKills || 0, checkUnlock: (stats) => (stats.totalKills || 0) >= 100 
  },
  { 
    id: 'kills_1000', type: 'tower', icon: '🩸', name: '殺戮機器', desc: '在塔內累計擊殺 1,000 隻怪物', rewardTitle: '百戰勇士', 
    target: 1000, getCurrent: (stats) => stats.totalKills || 0, checkUnlock: (stats) => (stats.totalKills || 0) >= 1000 
  },
  { 
    id: 'kills_10000', type: 'tower', icon: '🔥', name: '修羅之路', desc: '在塔內累計擊殺 10,000 隻怪物', rewardTitle: '深淵死神', 
    target: 10000, getCurrent: (stats) => stats.totalKills || 0, checkUnlock: (stats) => (stats.totalKills || 0) >= 10000 
  },

  // --- 【首領擊殺類】 ---
  { 
    id: 'boss_1', type: 'tower', icon: '👹', name: '首領之血', desc: '在塔內首次擊殺任意 Boss', rewardTitle: '弒君者', 
    target: 1, getCurrent: (stats) => stats.bossKills || 0, checkUnlock: (stats) => (stats.bossKills || 0) >= 1 
  },
  { 
    id: 'boss_10', type: 'tower', icon: '👿', name: '夢魘粉碎', desc: '在塔內累計擊殺 10 隻 Boss', rewardTitle: '惡魔獵人', 
    target: 10, getCurrent: (stats) => stats.bossKills || 0, checkUnlock: (stats) => (stats.bossKills || 0) >= 10 
  },
  { 
    id: 'boss_50', type: 'tower', icon: '🔱', name: '霸主隕落', desc: '在塔內累計擊殺 50 隻 Boss', rewardTitle: '塔之征服者', 
    target: 50, getCurrent: (stats) => stats.bossKills || 0, checkUnlock: (stats) => (stats.bossKills || 0) >= 50 
  },

  // --- 【被動技能類 (未來擴充預留)】 ---
  { 
    id: 'passive_1', type: 'tower', icon: '✨', name: '覺醒之力', desc: '在深淵中解鎖 1 個被動技能', rewardTitle: '覺醒者', 
    target: 1, getCurrent: (stats) => stats.passiveCount || 0, checkUnlock: (stats) => (stats.passiveCount || 0) >= 1 
  },
  { 
    id: 'passive_5', type: 'tower', icon: '🌟', name: '潛能爆發', desc: '在深淵中累計解鎖 5 個被動技能', rewardTitle: '天賦異稟', 
    target: 5, getCurrent: (stats) => stats.passiveCount || 0, checkUnlock: (stats) => (stats.passiveCount || 0) >= 5 
  },

  // --- 【特殊行為類 (死亡挑戰)】 ---
  { 
    id: 'deaths_1', type: 'tower', icon: '🪦', name: '歡迎來到深淵', desc: '在塔內體驗第一次死亡', rewardTitle: '祭品', 
    target: 1, getCurrent: (stats) => stats.totalDeaths || 0, checkUnlock: (stats) => (stats.totalDeaths || 0) >= 1 
  },
  { 
    id: 'deaths_50', type: 'tower', icon: '🧟', name: '不屈的靈魂', desc: '在塔內累計死亡 50 次', rewardTitle: '輪迴者', 
    target: 50, getCurrent: (stats) => stats.totalDeaths || 0, checkUnlock: (stats) => (stats.totalDeaths || 0) >= 50 
  }
];