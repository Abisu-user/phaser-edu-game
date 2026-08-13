<template>
  <transition name="fade">
    <div class="absolute inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-serif" @click.self="closePanel">
      
      <div ref="dialogRef" role="dialog" aria-modal="true" aria-labelledby="stat-upgrade-title" class="w-[1050px] max-w-[95vw] max-h-[90vh] bg-[#1A0F0A] border-[6px] border-double border-[#8C6239] rounded-sm custom-scrollbar shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col relative overflow-hidden">
        
        <div class="absolute inset-0 bg-[#0F0805] opacity-70 pointer-events-none"></div>
        <div class="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[60%] h-[50%] bg-[#DAA520]/10 blur-[100px] rounded-full pointer-events-none"></div>

        <header class="p-6 lg:p-8 bg-[#150C08] border-b-4 border-[#4A2E1B] flex justify-between items-center shrink-0 relative z-10 shadow-[0_5px_15px_rgba(0,0,0,0.8)]">
          <div>
            <h2 id="stat-upgrade-title" class="text-2xl lg:text-3xl font-black text-[#FFD700] tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
              英雄潛能覺醒祭壇 <span class="text-base lg:text-lg text-[#8C6239] ml-4 font-bold tracking-widest">Hero Awakening</span>
            </h2>
            <p class="text-sm text-[#A08060] mt-3 font-bold tracking-widest drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">
              冒險者階級：Lv.{{ level }} <span class="mx-3 text-[#593922]">|</span> 🪙 奉獻金：{{ coins }}
            </p>
          </div>
          
          <div class="text-right flex flex-col items-end hidden sm:flex">
            <span class="text-sm font-black text-[#DAA520] uppercase block mb-1 drop-shadow-[0_1px_1px_rgba(0,0,0,1)] tracking-widest">剩餘潛能點數</span>
            <div class="bg-[#2A1810] px-6 py-1.5 lg:px-8 lg:py-2 border-2 border-[#593922] shadow-[inset_0_2px_10px_rgba(0,0,0,0.9)] rounded-sm transition-all duration-300"
                 :class="{ 'scale-110 border-[#DAA520] shadow-[0_0_15px_rgba(218,165,32,0.5)]': isPointChanged }">
              <span class="text-4xl lg:text-5xl font-black text-[#F5DEB3] drop-shadow-[0_2px_5px_rgba(218,165,32,0.5)]">{{ localPoints }}</span>
            </div>
          </div>
          <button ref="closeButtonRef" type="button" @click="closePanel" aria-label="關閉潛能視窗" class="ml-5 h-10 w-10 shrink-0 rounded-full border-2 border-[#593922] bg-[#1C110C] text-2xl leading-none text-[#D7CCC8] hover:border-[#DAA520] hover:text-[#FFD700] focus:outline-none focus:ring-2 focus:ring-[#FFD700]">×</button>
        </header>

        <main class="flex-1 p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 relative z-10 min-h-0 overflow-hidden">
          
          <div class="space-y-6 overflow-y-auto custom-scrollbar pr-3 h-full">
            <div v-for="stat in upgradeStats" :key="stat.id" class="group bg-[#1C110C] border-2 border-[#3A2318] p-5 rounded-sm hover:border-[#DAA520] transition-all shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] relative">
              
              <div class="flex justify-between items-start mb-5">
                <div class="flex items-center gap-4">
                  <div class="w-14 h-14 shrink-0 rounded-full flex items-center justify-center text-3xl bg-[#0F0805] border-2 border-[#593922] shadow-[inset_0_2px_5px_rgba(0,0,0,1)] drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">
                    {{ stat.icon }}
                  </div>
                  <div>
                    <h3 class="text-lg font-black text-[#F5DEB3] group-hover:text-[#FFD700] drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">
                      {{ stat.name }}
                      <span v-if="getAddedPoints(stat) > 0" class="text-xs text-[#8FBC8F] ml-2 font-mono">
                        (+{{ getAddedPoints(stat) * stat.gain }})
                      </span>
                    </h3>
                    <p class="text-xs text-[#A08060] mt-1 font-bold">{{ stat.desc }}</p>
                  </div>
                </div>
                
                <div class="text-right shrink-0 bg-[#0F0805] px-3 py-1.5 border border-[#3A2318] shadow-[inset_0_2px_5px_rgba(0,0,0,1)]">
                  <span class="text-xl font-black" :class="getAddedPoints(stat) > 0 ? 'text-[#8FBC8F]' : 'text-[#DAA520]'">
                    {{ playerStats[stat.prop] }}
                  </span>
                  <span class="text-[11px] text-[#8C6239] font-bold block mt-0.5">+{{ stat.gain }} / pt</span>
                </div>
              </div>
              
              <div class="flex gap-2">
                <button 
                  @click="deallocate(stat, 1)" 
                  :disabled="getAddedPoints(stat) < 1" 
                  class="w-12 py-2.5 rounded-sm text-lg font-black transition-all shadow-[0_4px_8px_rgba(0,0,0,0.5)] border-2 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                  :class="getAddedPoints(stat) >= 1 
                    ? 'bg-[#3A2318] text-[#FF7F50] hover:text-[#FFF8DC] border-[#2A1810] border-b-[4px] hover:border-b-[2px] hover:translate-y-[2px] active:border-b-[2px] active:translate-y-[2px]' 
                    : 'bg-[#1A0F0A] text-[#593922] border-[#150C08] border-b-[2px] translate-y-[2px]'"
                >
                  -
                </button>
                
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

          <div class="flex flex-col bg-[#EAD8B1] border-[4px] border-double border-[#8C6239] p-6 lg:p-8 relative shadow-[8px_8px_20px_rgba(0,0,0,0.8)] text-[#3A2318] h-full overflow-hidden">
            <div class="absolute top-5 right-5 text-[70px] lg:text-[90px] opacity-20 drop-shadow-md transform -rotate-6 grayscale select-none pointer-events-none">🗽</div>
            
            <h4 class="text-base font-black text-[#593922] tracking-widest mb-6 lg:mb-8 border-b-2 border-[#8C6239] pb-3 flex items-center gap-2 shrink-0">
              <span class="text-xl">✨</span> 能力覺醒預覽 Awakening Preview
            </h4>
            
            <div class="flex-1 space-y-6 relative z-10 overflow-y-auto custom-scrollbar pr-2">
               <div v-for="stat in upgradeStats" :key="'summary-'+stat.id" class="space-y-2">
                 <div class="flex justify-between text-sm font-black">
                   <span class="text-[#593922] drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">{{ stat.name }}</span>
                   <span class="text-[#8B0000] drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">
                     {{ props.stats[stat.prop] }} 
                     <span v-if="getAddedPoints(stat) > 0" class="text-[#2E8B57] ml-1 font-mono">
                       (+{{ getAddedPoints(stat) * stat.gain }})
                     </span>
                   </span>
                 </div>
                 
                 <div class="w-full h-3 bg-[#C8B693] border border-[#8C6239] shadow-inner p-[1px] flex">
                   <div class="h-full bg-gradient-to-r from-[#8B0000] to-[#CD5C5C] relative" 
                        :style="{ width: (props.stats[stat.prop] / stat.max * 100) + '%' }">
                     <div class="absolute top-0 left-0 w-full h-[30%] bg-white/20"></div>
                   </div>
                   <div v-if="getAddedPoints(stat) > 0" 
                        class="h-full bg-[#3CB371] transition-all duration-300 relative border-l border-white/30 animate-pulse" 
                        :style="{ width: ((getAddedPoints(stat) * stat.gain) / stat.max * 100) + '%' }">
                     <div class="absolute top-0 left-0 w-full h-[30%] bg-white/40"></div>
                   </div>
                 </div>
               </div>
            </div>
            
            <div class="flex gap-4 mt-6 lg:mt-8 relative z-10 shrink-0 border-t-2 border-[#8C6239]/30 pt-6">
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

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue';
import { supabase } from '../../supabase.js';

const props = defineProps(['currentUserId', 'stats', 'level', 'points', 'coins']);
const emit = defineEmits(['close', 'updated']);
const dialogRef = ref(null);
const closeButtonRef = ref(null);
let previouslyFocusedElement = null;

const closePanel = () => emit('close');

const handleDialogKeydown = (event) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    closePanel();
    return;
  }

  if (event.key !== 'Tab' || !dialogRef.value) return;
  const focusable = [...dialogRef.value.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')];
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
};

onMounted(() => {
  previouslyFocusedElement = document.activeElement;
  document.addEventListener('keydown', handleDialogKeydown);
  nextTick(() => closeButtonRef.value?.focus());
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleDialogKeydown);
  if (previouslyFocusedElement?.isConnected) previouslyFocusedElement.focus();
});

const localPoints = ref(props.points || 0);
// 用來追蹤「本次操作」新增了多少點
const addedPointsTrack = ref({
  max_hp: 0,
  max_mp: 0,
  max_ap: 0,
  max_atk: 0
});

const playerStats = ref({ ...props.stats });
const isChanged = computed(() => {
  return addedPointsTrack.value.max_hp > 0 || 
         addedPointsTrack.value.max_mp > 0 || 
         addedPointsTrack.value.max_ap > 0 || 
         addedPointsTrack.value.max_atk > 0;
});

// 監聽點數變化，用來觸發 UI 動畫
const isPointChanged = ref(false);

const upgradeStats = [
  { id: 'hp', name: '強韌體質 (HP)', icon: '❤️', prop: 'max_hp', gain: 10, max: 2000, desc: '提升冒險者承受怪物打擊的生命極限。' },
  { id: 'mp', name: '魔力源泉 (MP)', icon: '🔮', prop: 'max_mp', gain: 5, max: 1000, desc: '增加詠唱高級魔法與戰技的魔力儲備。' },
  { id: 'ap', name: '行動耐力 (AP)', icon: '⚡', prop: 'max_ap', gain: 2, max: 100, desc: '決定單回合內能連續施展法術的次數。' },
  { id: 'atk', name: '破壞威能 (ATK)', icon: '⚔️', prop: 'max_atk', gain: 1, max: 500, desc: '提升所有武器與攻擊魔法的基礎破壞力。' },
];

const getAddedPoints = (stat) => addedPointsTrack.value[stat.prop];

const triggerPointAnimation = () => {
  isPointChanged.value = true;
  setTimeout(() => { isPointChanged.value = false; }, 300);
};

// 增加點數
const allocate = (stat, amount) => {
  if (localPoints.value >= amount) {
    localPoints.value -= amount;
    playerStats.value[stat.prop] += (stat.gain * amount);
    addedPointsTrack.value[stat.prop] += amount;
    triggerPointAnimation();
  }
};

// 收回點數 (只能收回本次剛分配的)
const deallocate = (stat, amount) => {
  if (addedPointsTrack.value[stat.prop] >= amount) {
    localPoints.value += amount;
    playerStats.value[stat.prop] -= (stat.gain * amount);
    addedPointsTrack.value[stat.prop] -= amount;
    triggerPointAnimation();
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
      alert('✨ 接受女神的恩賜成功！能力已覺醒。');
      emit('updated');
      emit('close');
    }
  } catch (e) {
    console.error(e);
  }
};

const resetStats = async () => {
  if (props.coins < 1000) {
    alert('❌ 奉獻金不足！洗禮儀式需要 1000 🪙。');
    return;
  }
  
  const confirmReset = confirm('⚠️ 確定要向祭壇奉獻 1000 🪙 進行洗禮嗎？已注入的潛能點數將會全數退還。');
  if (!confirmReset) return;

  try {
    const spentPoints = 
      ((props.stats.max_hp - 100) / 10) +
      ((props.stats.max_mp - 50) / 5) +
      ((props.stats.max_ap - 30) / 2) +
      ((props.stats.max_atk - 10) / 1);
      
    const newTotalPoints = props.points + spentPoints;
    const newCoins = props.coins - 1000;

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

    await supabase.from('tower_saves').update({ coins: newCoins }).eq('user_id', props.currentUserId);
      
    if (!error) {
      alert('✨ 洗禮儀式完成！女神已將潛能點數如數歸還，冒險者的軀體已恢復初始狀態。');
      emit('updated'); 
      emit('close');  
    }
  } catch (err) {
    console.error('重置失敗:', err);
  }
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.custom-scrollbar::-webkit-scrollbar { width: 8px; }
.custom-scrollbar::-webkit-scrollbar-track { background: rgba(15, 8, 5, 0.8); border-radius: 4px; border-left: 1px solid #2A1810; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #593922; border-radius: 4px; border: 1px solid #3A2318; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #8C6239; }
</style>
