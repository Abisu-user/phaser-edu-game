// src/game/config/badges.js

export const BADGE_LIST = [
  // ==========================================
  // 🚀 路線一：關卡推進系列 (看通關數 clearedLevelsCount)
  // ==========================================
  {
    id: 'first_blood',
    icon: '🥚',
    name: '初來乍到',
    desc: '成功通關第 1 個關卡',
    target: 1,
    getCurrent: (stats) => stats.clearedLevelsCount,
    checkUnlock: (stats) => stats.clearedLevelsCount >= 1
  },
  {
    id: 'persistent',
    icon: '🌱',
    name: '漸入佳境',
    desc: '累積通關 5 個關卡',
    target: 5,
    getCurrent: (stats) => stats.clearedLevelsCount,
    checkUnlock: (stats) => stats.clearedLevelsCount >= 5
  },
  {
    id: 'veteran',
    icon: '⚔️',
    name: '身經百戰',
    desc: '累積通關 10 個關卡',
    target: 10,
    getCurrent: (stats) => stats.clearedLevelsCount,
    checkUnlock: (stats) => stats.clearedLevelsCount >= 10
  },
  {
    id: 'challenger',
    icon: '🏆',
    name: '不屈挑戰者',
    desc: '累積通關 20 個關卡',
    target: 20,
    getCurrent: (stats) => stats.clearedLevelsCount,
    checkUnlock: (stats) => stats.clearedLevelsCount >= 20
  },
  {
    id: 'master_clearer',
    icon: '🧩',
    name: '解謎大師',
    desc: '累積通關 50 個關卡',
    target: 50,
    getCurrent: (stats) => stats.clearedLevelsCount,
    checkUnlock: (stats) => stats.clearedLevelsCount >= 50
  },
  {
    id: 'conqueror',
    icon: '🌍',
    name: '世界征服者',
    desc: '累積通關 100 個關卡',
    target: 100,
    getCurrent: (stats) => stats.clearedLevelsCount,
    checkUnlock: (stats) => stats.clearedLevelsCount >= 100
  },

  // ==========================================
  // 🧠 路線二：經驗累積系列 (看總 XP currentTotalXP)
  // ==========================================
  {
    id: 'novice',
    icon: '📘',
    name: '程式新手',
    desc: '累積獲得 500 點 XP',
    target: 500,
    getCurrent: (stats) => stats.currentTotalXP,
    checkUnlock: (stats) => stats.currentTotalXP >= 500
  },
  {
    id: 'apprentice',
    icon: '🔥',
    name: '勤奮學徒',
    desc: '累積獲得 2,000 點 XP',
    target: 2000,
    getCurrent: (stats) => stats.currentTotalXP,
    checkUnlock: (stats) => stats.currentTotalXP >= 2000
  },
  {
    id: 'expert',
    icon: '⚡',
    name: '熟練專家',
    desc: '累積獲得 5,000 點 XP',
    target: 5000,
    getCurrent: (stats) => stats.currentTotalXP,
    checkUnlock: (stats) => stats.currentTotalXP >= 5000
  },
  {
    id: 'elite',
    icon: '🌟',
    name: '菁英編碼者',
    desc: '累積獲得 10,000 點 XP',
    target: 10000,
    getCurrent: (stats) => stats.currentTotalXP,
    checkUnlock: (stats) => stats.currentTotalXP >= 10000
  },
  {
    id: 'mythic',
    icon: '☄️',
    name: '神話傳說',
    desc: '累積獲得 25,000 點 XP',
    target: 25000,
    getCurrent: (stats) => stats.currentTotalXP,
    checkUnlock: (stats) => stats.currentTotalXP >= 25000
  },
  {
    id: 'legendary',
    icon: '🌌',
    name: '無盡星空',
    desc: '累積獲得 50,000 點 XP',
    target: 50000,
    getCurrent: (stats) => stats.currentTotalXP,
    checkUnlock: (stats) => stats.currentTotalXP >= 50000
  },

  // ==========================================
  // 👑 路線三：等級突破系列 (看當前等級 currentLevel)
  // ==========================================
  {
    id: 'first_step',
    icon: '🚶',
    name: '跨出新手村',
    desc: '等級達到 Lv.2',
    target: 2,
    getCurrent: (stats) => stats.currentLevel,
    checkUnlock: (stats) => stats.currentLevel >= 2
  },
  {
    id: 'rising_star',
    icon: '⭐',
    name: '明日之星',
    desc: '等級達到 Lv.5',
    target: 5,
    getCurrent: (stats) => stats.currentLevel,
    checkUnlock: (stats) => stats.currentLevel >= 5
  },
  {
    id: 'rich',
    icon: '💎',
    name: '財富自由',
    desc: '等級達到 Lv.10',
    target: 10,
    getCurrent: (stats) => stats.currentLevel,
    checkUnlock: (stats) => stats.currentLevel >= 10
  },
  {
    id: 'pro_gamer',
    icon: '🎮',
    name: '職業玩家',
    desc: '等級達到 Lv.20',
    target: 20,
    getCurrent: (stats) => stats.currentLevel,
    checkUnlock: (stats) => stats.currentLevel >= 20
  },
  {
    id: 'sage',
    icon: '🧙‍♂️',
    name: '智慧大賢者',
    desc: '等級達到 Lv.30',
    target: 30,
    getCurrent: (stats) => stats.currentLevel,
    checkUnlock: (stats) => stats.currentLevel >= 30
  },
  {
    id: 'grandmaster',
    icon: '🐉',
    name: '龍之宗師',
    desc: '等級達到 Lv.50',
    target: 50,
    getCurrent: (stats) => stats.currentLevel,
    checkUnlock: (stats) => stats.currentLevel >= 50
  },
  {
    id: 'demigod',
    icon: '👼',
    name: '半神降臨',
    desc: '等級達到 Lv.75',
    target: 75,
    getCurrent: (stats) => stats.currentLevel,
    checkUnlock: (stats) => stats.currentLevel >= 75
  },
  {
    id: 'god_of_code',
    icon: '💻',
    name: '程式碼之神',
    desc: '等級達到滿級 Lv.100',
    target: 100,
    getCurrent: (stats) => stats.currentLevel,
    checkUnlock: (stats) => stats.currentLevel >= 100
  }
];