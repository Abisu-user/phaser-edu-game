// src/config/badges.js

export const BADGE_LIST = [
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
    id: 'apprentice',
    icon: '🔥',
    name: '勤奮學徒',
    desc: '累積獲得 2000 點 XP',
    target: 2000,
    getCurrent: (stats) => stats.currentTotalXP,
    checkUnlock: (stats) => stats.currentTotalXP >= 2000
  },
  {
    id: 'veteran',
    icon: '⚔️',
    name: '身經百戰',
    desc: '成功通關 10 個關卡',
    target: 10,
    getCurrent: (stats) => stats.clearedLevelsCount,
    checkUnlock: (stats) => stats.clearedLevelsCount >= 10
  },
  {
    id: 'rich',
    icon: '💎',
    name: '財富自由',
    desc: '等級達到 Lv.10',
    target: 10,
    getCurrent: (stats) => stats.currentLevel,
    checkUnlock: (stats) => stats.currentLevel >= 10
  }
  
  // 未來你有幾百個徽章，全部往下加在這裡就好！完全不用動到 Vue 檔案！
];