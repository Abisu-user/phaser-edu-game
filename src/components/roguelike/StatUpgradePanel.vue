<template>
  <transition name="fade">
    <div class="absolute inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-serif" @click.self="$emit('close')">
      
      <div class="w-[1050px] max-w-[95vw] max-h-[90vh] bg-[#1A0F0A] border-[6px] border-double border-[#8C6239] rounded-sm custom-scrollbar shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col relative overflow-hidden">
        
        <div class="absolute inset-0 bg-[#0F0805] opacity-70 pointer-events-none"></div>
        <div class="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[60%] h-[50%] bg-[#DAA520]/10 blur-[100px] rounded-full pointer-events-none"></div>

        <header class="p-6 lg:p-8 bg-[#150C08] border-b-4 border-[#4A2E1B] flex justify-between items-center shrink-0 relative z-10 shadow-[0_5px_15px_rgba(0,0,0,0.8)]">
          <div>
            <h2 class="text-2xl lg:text-3xl font-black text-[#FFD700] tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
              英雄潛能覺醒祭壇 <span class="text-base lg:text-lg text-[#8C6239] ml-4 font-bold tracking-widest">Hero Awakening</span>
            </h2>
            <p class="text-sm text-[#A08060] mt-3 font-bold tracking-widest drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">
              冒險者階級：Lv.{{ level }} <span class="mx-3 text-[#593922]">|</span> 🪙 奉獻金：{{ coins }}
            </p>
          </div>
          
          <div class="text-right flex flex-col items-end hidden sm:flex">
            <span class="text-sm font-black text-[#DAA520] uppercase block mb-1 drop-shadow-[0_1px_1px_rgba(0,0,0,1)] tracking-widest">剩餘潛能點數</span>
            <div class="bg-[#2A1810] px-6 py-1.5 lg:px-8 lg:py-2 border-2 border-[#593922] shadow-[inset_0_2px_10px_rgba(0,0,0,0.9)] rounded-sm">
              <span class="text-4xl lg:text-5xl font-black text-[#F5DEB3] drop-shadow-[0_2px_5px_rgba(218,165,32,0.5)]">{{ localPoints }}</span>
            </div>
          </div>
        </header>

        <main class="flex-1 p-6 lg:p-10 overflow-y-auto custom-scrollbar grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 relative z-10 min-h-0">
          
          <div class="space-y-6 h-max">
            <div v-for="stat in upgradeStats" :key="stat.id" class="group bg-[#1C110C] border-2 border-[#3A2318] p-5 rounded-sm hover:border-[#DAA520] transition-all shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] relative">
              
              <div class="flex justify-between items-start mb-5">
                <div class="flex items-center gap-4">
                  <div class="w-14 h-14 shrink-0 rounded-full flex items-center justify-center text-3xl bg-[#0F0805] border-2 border-[#593922] shadow-[inset_0_2px_5px_rgba(0,0,0,1)] drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">
                    {{ stat.icon }}
                  </div>
                  <div>
                    <h3 class="text-lg font-black text-[#F5DEB3] group-hover:text-[#FFD700] drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">{{ stat.name }}</h3>
                    <p class="text-xs text-[#A08060] mt-1 font-bold">{{ stat.desc }}</p>
                  </div>
                </div>
                
                <div class="text-right shrink-0 bg-[#0F0805] px-3 py-1.5 border border-[#3A2318] shadow-[inset_0_2px_5px_rgba(0,0,0,1)]">
                  <span class="text-xl font-black text-[#DAA520]">{{ playerStats[stat.prop] }}</span>
                  <span class="text-[11px] text-[#8FBC8F] font-bold block mt-0.5">+{{ stat.gain }} / pt</span>
                </div>
              </div>
              
              <div class="flex gap-4">
                <button 
                  @click="allocate(stat, 1)" 
                  :disabled="localPoints < 1" 
                  class="flex-1 py-2.5 rounded-sm text-sm font-black tracking-widest transition-all shadow-[0_4px_8px_rgba(0,0,0,0.5)] border-2 disabled:opacity-30 disabled:cursor-not-allowed"
                  :class="localPoints >= 1 
                    ? 'bg-[#3E2723] text-[#D7CCC8] hover:text-[#FFF8DC] border-[#2A1810] border-b-[4px] hover:border-b-[2px] hover:translate-y-[2px] active:border-b-[2px] active:translate-y-[2px]' 
                    : 'bg-[#1A0F0A] text-[#593922] border-[#150C08] border-b-[2px] translate-y-[2px]'"
                >注入 1 點</button>
                <button 
                  @click="allocate(stat, 5)" 
                  :disabled="localPoints < 5" 
                  class="flex-1 py-2.5 rounded-sm text-sm font-black tracking-widest transition-all shadow-[0_4px_8px_rgba(0,0,0,0.5)] border-2 disabled:opacity-30 disabled:cursor-not-allowed"
                  :class="localPoints >= 5 
                    ? 'bg-[#4A0E17] text-[#D7CCC8] hover:text-[#FFF8DC] border-[#2A080D] border-b-[4px] hover:border-b-[2px] hover:translate-y-[2px] active:border-b-[2px] active:translate-y-[2px]' 
                    : 'bg-[#1A0F0A] text-[#593922] border-[#150C08] border-b-[2px] translate-y-[2px]'"
                >注入 5 點</button>
              </div>
            </div>
          </div>

          <div class="flex flex-col bg-[#EAD8B1] border-[4px] border-double border-[#8C6239] p-6 lg:p-8 relative shadow-[8px_8px_20px_rgba(0,0,0,0.8)] text-[#3A2318] h-max">
            <div class="absolute top-5 right-5 text-[70px] lg:text-[90px] opacity-20 drop-shadow-md transform -rotate-6 grayscale select-none pointer-events-none">🗽</div>
            
            <h4 class="text-base font-black text-[#593922] tracking-widest mb-6 lg:mb-8 border-b-2 border-[#8C6239] pb-3 flex items-center gap-2">
              <span class="text-xl">✨</span> 能力覺醒預覽 Awakening Preview
            </h4>
            
            <div class="flex-1 space-y-6 relative z-10">
               <div v-for="stat in upgradeStats" :key="'summary-'+stat.id" class="space-y-2">
                 <div class="flex justify-between text-sm font-black">
                   <span class="text-[#593922] drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">{{ stat.name }}</span>
                   <span class="text-[#8B0000] drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">{{ playerStats[stat.prop] }}</span>
                 </div>
                 <div class="w-full h-3 bg-[#C8B693] border border-[#8C6239] shadow-inner p-[1px]">
                   <div class="h-full bg-gradient-to-r from-[#8B0000] to-[#CD5C5C] transition-all duration-500 relative overflow-hidden" :style="{ width: (playerStats[stat.prop] / stat.max * 100) + '%' }">
                     <div class="absolute top-0 left-0 w-full h-[30%] bg-white/20"></div>
                   </div>
                 </div>
               </div>
            </div>
            
            <div class="flex gap-4 mt-8 lg:mt-10 relative z-10">
              <button 
                @click="resetStats" 
                class="w-1/3 py-3 lg:py-4 bg-[#1C110C] hover:bg-[#2A1810] text-[#D7CCC8] hover:text-[#FFF8DC] font-black rounded-sm border-2 border-[#593922] border-b-[4px] hover:border-b-[2px] hover:translate-y-[2px] active:border-b-[2px] active:translate-y-[2px] transition-all flex flex-col items-center justify-center gap-1 lg:gap-1.5 shadow-[0_5px_10px_rgba(0,0,0,0.5)] group"
              >
                <span class="text-sm lg:text-base">🔄 洗禮</span>
                <span class="text-[10px] lg:text-[11px] text-[#DAA520] font-bold group-hover:text-[#FFD700]">-1000 🪙</span>
              </button>
              
              <button 
                @click="saveUpgrades" 
                :disabled="!isChanged" 
                class="w-2/3 py-3 lg:py-4 font-black rounded-sm shadow-[0_10px_20px_rgba(0,0,0,0.7)] transition-all flex items-center justify-center text-lg lg:text-xl tracking-widest border-2 disabled:opacity-60 disabled:cursor-not-allowed"
                :class="isChanged 
                  ? 'bg-[#8B0000] hover:bg-[#A52A2A] text-[#FFD700] border-[#DAA520] border-b-[6px] hover:border-b-[2px] hover:translate-y-[4px] active:border-b-[2px] active:translate-y-[4px]' 
                  : 'bg-[#C8B693] text-[#8C6239] border-[#A08060] border-b-[2px] translate-y-[4px]'"
              >
                接受恩賜
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* 滾動條改為木質深棕色系 */
.custom-scrollbar::-webkit-scrollbar { width: 8px; }
.custom-scrollbar::-webkit-scrollbar-track { background: rgba(15, 8, 5, 0.8); border-radius: 4px; border-left: 1px solid #2A1810; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #593922; border-radius: 4px; border: 1px solid #3A2318; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #8C6239; }
</style>

<script setup>
import { ref } from 'vue';
import { supabase } from '../../supabase.js';

const props = defineProps(['currentUserId', 'stats', 'level', 'points', 'coins']);
const emit = defineEmits(['close', 'updated']);

const localPoints = ref(props.points || 0);
const playerStats = ref({ ...props.stats });
const isChanged = ref(false);

const upgradeStats = [
  { 
    id: 'hp', 
    name: '強韌體質 (HP)', 
    icon: '❤️', 
    prop: 'max_hp', 
    gain: 10, 
    max: 2000, 
    desc: '提升冒險者承受怪物打擊的生命極限。' 
  },
  { 
    id: 'mp', 
    name: '魔力源泉 (MP)', 
    icon: '🔮', 
    prop: 'max_mp', 
    gain: 5, 
    max: 1000, 
    desc: '增加詠唱高級魔法與戰技的魔力儲備。' 
  },
  { 
    id: 'ap', 
    name: '行動耐力 (AP)', 
    icon: '⚡', 
    prop: 'max_ap', 
    gain: 2, 
    max: 100, 
    desc: '決定單回合內能連續施展法術的次數。' 
  },
  { 
    id: 'atk', 
    name: '破壞威能 (ATK)', 
    icon: '⚔️', 
    prop: 'max_atk', 
    gain: 1, 
    max: 500, 
    desc: '提升所有武器與攻擊魔法的基礎破壞力。' 
  },
];

const allocate = (stat, amount) => {
  if (localPoints.value >= amount) {
    localPoints.value -= amount;
    playerStats.value[stat.prop] += (stat.gain * amount);
    isChanged.value = true;
  }
};

const saveUpgrades = async () => {
  try {
    const { error } = await supabase
      .from('tower_lobby')
      .update({
        stat_points: localPoints.value,
        max_hp: playerStats.value.max_hp,
        max_mp: playerStats.value.max_mp,
        max_ap: playerStats.value.max_ap,
        max_atk: playerStats.value.max_atk
      })
      .eq('user_id', props.currentUserId);

    if (!error) {
      alert('✅ 機甲硬體優化成功！');
      emit('updated');
      emit('close');
    }
  } catch (e) {
    console.error(e);
  }
};

// 🌟 系統重置 (洗點) 邏輯
const resetStats = async () => {
  if (props.coins < 1000) {
    alert('❌ 資金不足！系統重置需要花費 1000 金幣。');
    return;
  }
  
  const confirmReset = confirm('⚠️ 確定要向祭壇奉獻 1000 🪙 進行洗禮嗎？已注入的潛能點數將會全數退還。');
  if (!confirmReset) return;

  try {
    // 1. 計算這台機甲身上已經花掉的點數 (利用目前數值減去基礎值 100/50/30/10，再除以每點收益)
    const spentPoints = 
      ((props.stats.max_hp - 100) / 10) +
      ((props.stats.max_mp - 50) / 5) +
      ((props.stats.max_ap - 30) / 2) +
      ((props.stats.max_atk - 10) / 1);
      
    const newTotalPoints = props.points + spentPoints;
    const newCoins = props.coins - 1000;

    // 2. 更新高塔大廳資料庫 (還原基礎值，退還點數，扣除金幣)
    const { error } = await supabase
      .from('tower_lobby')
      .update({
        stat_points: newTotalPoints,
        max_hp: 100,
        max_mp: 50,
        max_ap: 30,
        max_atk: 10,
        coins: newCoins
      })
      .eq('user_id', props.currentUserId);

    // 3. 如果有正在進行中的存檔，也要扣除他的金幣
    await supabase.from('tower_saves').update({ coins: newCoins }).eq('user_id', props.currentUserId);
      
    if (!error) {
      alert('✨ 洗禮儀式完成！女神已將潛能點數如數歸還，冒險者的軀體已恢復初始狀態。');
      emit('updated'); // 通知大廳重新讀取資料，畫面就會立刻更新！
      emit('close');   // 關閉面板，讓玩家看到大廳最新的數值
    }
  } catch (err) {
    console.error('重置失敗:', err);
  }
};
</script>