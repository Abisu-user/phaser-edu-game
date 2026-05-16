<template>
  <transition name="fade">
    <div class="absolute inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" @click.self="$emit('close')">
      
      <div class="w-[1000px] max-w-[95vw] max-h-[90vh] bg-[#0A0A0F] border border-fuchsia-500/30 rounded-[1.75rem] custom-scrollbar shadow-[0_0_60px_rgba(217,70,239,0.2)] flex flex-col">
        
        <header class="p-8 bg-gradient-to-r from-fuchsia-900/40 to-transparent border-b border-fuchsia-500/20 flex justify-between items-center shrink-0">
          <div>
            <h2 class="text-3xl font-black text-fuchsia-400 tracking-tighter uppercase">機甲硬體優化中心 <span class="text-sm text-slate-500 ml-3">Mech Refit</span></h2>
            <p class="text-xs text-slate-400 mt-2 uppercase tracking-widest">系統階層：Lv.{{ level }} | 💰 持有資金：{{ coins }}</p>
          </div>
          <div class="text-right">
            <span class="text-xs font-black text-fuchsia-500 uppercase block mb-1">剩餘可用點數</span>
            <span class="text-5xl font-mono font-black text-white drop-shadow-[0_0_12px_#d946ef]">{{ localPoints }}</span>
          </div>
        </header>

        <main class="p-10 grid grid-cols-2 gap-10">
          <div class="space-y-8">
            <div v-for="stat in upgradeStats" :key="stat.id" class="group bg-white/5 border border-white/5 p-5 rounded-2xl hover:border-fuchsia-500/30 transition-all">
              <div class="flex justify-between items-start mb-4">
                <div class="flex items-center gap-4">
                  <span class="text-4xl">{{ stat.icon }}</span>
                  <div>
                    <h3 class="text-base font-black text-slate-200">{{ stat.name }}</h3>
                    <p class="text-[11px] text-slate-500 mt-1">{{ stat.desc }}</p>
                  </div>
                </div>
                <div class="text-right shrink-0">
                  <span class="text-sm font-mono font-bold text-white">{{ playerStats[stat.prop] }}</span>
                  <span class="text-[11px] text-emerald-400 block mt-0.5">+{{ stat.gain }} / pt</span>
                </div>
              </div>
              <div class="flex gap-3">
                <button @click="allocate(stat, 1)" :disabled="localPoints < 1" class="flex-1 py-2.5 bg-fuchsia-600/20 hover:bg-fuchsia-600 text-fuchsia-400 hover:text-white rounded-xl text-xs font-black transition-all disabled:opacity-20">投資 1 PT</button>
                <button @click="allocate(stat, 5)" :disabled="localPoints < 5" class="flex-1 py-2.5 bg-fuchsia-600/20 hover:bg-fuchsia-600 text-fuchsia-400 hover:text-white rounded-xl text-xs font-black transition-all disabled:opacity-20">投資 5 PT</button>
              </div>
            </div>
          </div>

          <div class="flex flex-col bg-black/40 rounded-3xl border border-white/5 p-8 relative">
            <div class="absolute top-5 right-5 text-[75px] opacity-10 grayscale">🤖</div>
            <h4 class="text-sm font-black text-slate-500 uppercase tracking-widest mb-8">優化預覽 Summary</h4>
            <div class="flex-1 space-y-5">
               <div v-for="stat in upgradeStats" :key="'summary-'+stat.id" class="space-y-1.5">
                 <div class="flex justify-between text-xs font-bold">
                   <span class="text-slate-400">{{ stat.name }}</span>
                   <span class="text-white">{{ playerStats[stat.prop] }}</span>
                 </div>
                 <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                   <div class="h-full bg-fuchsia-500 transition-all duration-500" :style="{ width: (playerStats[stat.prop] / stat.max * 100) + '%' }"></div>
                 </div>
               </div>
            </div>
            
            <div class="flex gap-4 mt-10">
              <button 
                @click="resetStats" 
                class="w-1/3 py-4 bg-yellow-900/40 hover:bg-yellow-600 text-yellow-500 hover:text-white font-black rounded-xl border border-yellow-500/30 transition-all flex flex-col items-center justify-center gap-1.5 group"
              >
                <span class="text-base">🔄 重置</span>
                <span class="text-[11px] font-mono group-hover:text-yellow-200">-1000 💰</span>
              </button>
              
              <button 
                @click="saveUpgrades" 
                :disabled="!isChanged" 
                class="w-2/3 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-30 flex items-center justify-center text-lg"
              >
                套用更新 (SAVE)
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue';
import { supabase } from '../../supabase.js';

const props = defineProps(['currentUserId', 'stats', 'level', 'points', 'coins']);
const emit = defineEmits(['close', 'updated']);

const localPoints = ref(props.points || 0);
const playerStats = ref({ ...props.stats });
const isChanged = ref(false);

const upgradeStats = [
  { id: 'hp', name: '結構裝甲 (HP)', icon: '🛡️', prop: 'max_hp', gain: 10, max: 2000, desc: '提升機甲最大結構耐受力。' },
  { id: 'mp', name: '運算核心 (MP)', icon: '🔮', prop: 'max_mp', gain: 5, max: 1000, desc: '增加高級指令的運算資源。' },
  { id: 'ap', name: '反應脈衝 (AP)', icon: '⚡', prop: 'max_ap', gain: 2, max: 100, desc: '單回合可執行的指令寬度。' },
  { id: 'atk', name: '邏輯打擊 (ATK)', icon: '⚔️', prop: 'max_atk', gain: 1, max: 500, desc: '提升所有攻擊類指令的基礎傷害。' },
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
  
  const confirmReset = confirm('⚠️ 確定要花費 1000 💰 將所有機甲硬體初始化嗎？點數將會全數退還。');
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
      alert('🔄 系統重置成功！所有點數已全數歸還，機甲恢復基礎狀態。');
      emit('updated'); // 通知大廳重新讀取資料，畫面就會立刻更新！
      emit('close');   // 關閉面板，讓玩家看到大廳最新的數值
    }
  } catch (err) {
    console.error('重置失敗:', err);
  }
};
</script>