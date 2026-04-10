// 所有關卡的設定資料，新增關卡只需在這裡加一個物件

export const levels = [
  {
    id: 1,
    title: '關卡 1: 近戰打擊',
    description: '順序邏輯教學',
    player: { gridX: 2, gridY: 7, emoji: '🧙', label: '程式法師' },
    enemy:  { gridX: 7, gridY: 2, emoji: '👹', label: 'Bug怪物' },
    goals: [
      '使用移動與攻擊程式碼',
      '近戰擊敗 Bug 怪物：移動到相鄰格並 attack();',
    ],
    availableCommands: ['move', 'attack'],
    hint: '移動到怪物相鄰格，再使用 attack();',
    xpReward: 100,
    successMessage: '✨ 任務完成！你成功利用近戰擊敗了 Bug 怪物！',
  },
  {
    id: 2,
    title: '關卡 2: 迴圈魔法',
    description: '迴圈邏輯教學',
    player: { gridX: 1, gridY: 5, emoji: '🧙', label: '程式法師' },
    enemy:  { gridX: 8, gridY: 5, emoji: '👾', label: '迴圈怪' },
    goals: [
      '使用 repeat() 迴圈指令',
      '以最少程式碼擊敗怪物',
    ],
    availableCommands: ['move', 'attack', 'repeat'],
    hint: '試試 repeat(5, () => {\n  moveRight();\n});',
    xpReward: 150,
    successMessage: '✨ 迴圈大師！你用最精簡的程式碼擊敗了怪物！',
  },
  {
    id: 3,
    title: '關卡 3: 曲折小徑',
    description: '多方向移動組合',
    player: { gridX: 2, gridY: 2, emoji: '🧙', label: '程式法師' },
    enemy:  { gridX: 5, gridY: 4, emoji: '👻', label: '幽靈Bug' },
    goals: [
      '使用不同方向的移動指令',
      '走到怪物旁邊並使用 attack();'
    ],
    availableCommands: ['move', 'attack'],
    hint: '怪物不在直線上！你需要先向右走，再向下走，最後發動攻擊。',
    xpReward: 150,
    successMessage: '✨ 幹得好！你成功掌握了 2D 平面的路線規劃！',
  },
  {
    id: 4,
    title: '關卡 4: 長途跋涉',
    description: '進階迴圈應用',
    player: { gridX: 1, gridY: 1, emoji: '🧙', label: '程式法師' },
    enemy:  { gridX: 1, gridY: 8, emoji: '🛡️', label: '遠方守衛' },
    goals: [
      '使用 repeat() 迴圈進行長距離移動',
      '在最少行數內抵達並擊敗敵人'
    ],
    availableCommands: ['move', 'attack', 'repeat'],
    hint: '距離有點遠，連寫 6 次 moveDown() 太累了，試試 repeat(6, () => { ... }); 吧！',
    xpReward: 200,
    successMessage: '✨ 完美！迴圈讓你的程式碼變得簡潔又優雅！',
  },
  {
    id: 5,
    title: '關卡 5: 迴圈雙人舞',
    description: '綜合邏輯挑戰',
    player: { gridX: 2, gridY: 2, emoji: '🧙', label: '程式法師' },
    enemy:  { gridX: 7, gridY: 6, emoji: '👑', label: 'Bug國王' },
    goals: [
      '結合多個 repeat() 迴圈與一般移動',
      '精準計算格子數量並擊敗 Bug 國王'
    ],
    availableCommands: ['move', 'attack', 'repeat'],
    hint: '試著先寫一個向右的迴圈，再接著寫一個向下的迴圈，最後攻擊！',
    xpReward: 300,
    successMessage: '✨ 太神啦！你完美破解了 Bug 國王的防線，邏輯非常清晰！',
  }
];