// src/game/config/Hazards.js

export const HAZARD_DICT = {
  // 1. 火牆 (直接扣除 HP)
  'firewall': {
    id: 'firewall',
    name: '烈焰防火牆',
    symbol: '🔥',
    description: '踩踏會導致機甲裝甲受損，扣除 15 HP。',
    
    // 當玩家踩上去時觸發的效果
    effect: (target) => {
      console.log(`⚠️ ${target.name} 遭受防火牆灼燒！`);
      // 呼叫由 EndlessScene 傳進來的扣血函式
      target.takeDamage(15);
    }
  },

  // 2. 電磁脈衝陷阱 (扣更多血，未來可擴充扣除 MP 或 AP)
  'emp_trap': {
    id: 'emp_trap',
    name: 'EMP 脈衝地雷',
    symbol: '⚡',
    description: '強大的電磁干擾，造成 25 點嚴重傷害。',
    
    effect: (target) => {
      console.log(`💥 ${target.name} 踩到 EMP 地雷！系統短路！`);
      target.takeDamage(25);
      // 未來你可以在這裡加上觸發 'tower-ap-drain' 之類的事件來扣魔力
    }
  }
};