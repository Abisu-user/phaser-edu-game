<template>
  <transition name="fade">
    <div class="absolute inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-serif" @click.self="$emit('close')">
      
      <div class="w-[1000px] h-[85vh] bg-[#1C110C] border-[6px] border-double border-[#D4AF37] rounded-sm shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden relative">
        <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-20 pointer-events-none"></div>

        <header class="shrink-0 px-8 py-6 bg-[#0F0805] border-b-4 border-[#3A2318] flex items-center justify-between relative z-10">
          <div class="flex items-center gap-4">
            <span class="text-4xl drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">🏆</span>
            <div class="flex flex-col">
              <h2 class="text-3xl font-black text-[#FFD700] tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">榮耀殿堂</h2>
              <span class="text-xs text-[#8C6239] font-bold tracking-widest mt-1">ACHIEVEMENTS & TITLES</span>
            </div>
          </div>
          
          <div class="flex gap-2 bg-[#1C110C] p-1.5 border border-[#3A2318] rounded-sm">
            <button @click="activeTab = 'outside'" :class="activeTab === 'outside' ? 'bg-[#593922] text-[#FFD700] border-[#D4AF37]' : 'text-[#A08060] border-transparent'" class="px-6 py-2 text-sm font-black transition-all border-b-2">🌍 大陸歷練 (塔外)</button>
            <button @click="activeTab = 'tower'" :class="activeTab === 'tower' ? 'bg-[#593922] text-[#FFD700] border-[#D4AF37]' : 'text-[#A08060] border-transparent'" class="px-6 py-2 text-sm font-black transition-all border-b-2">🏰 深淵探索 (塔內)</button>
          </div>
          
          <button @click="$emit('close')" class="text-[#8C6239] hover:text-[#FF0000] text-4xl font-black transition-colors">×</button>
        </header>

        <div class="bg-[#2A1810] border-b-2 border-[#593922] px-8 py-4 flex justify-between items-center z-10 shadow-md">
          <div class="text-[13px] font-black text-[#A08060] flex items-center gap-3">
            目前裝備稱號：
            <span class="text-lg text-[#DAA520] bg-[#0F0805] px-4 py-1 border border-[#593922] shadow-[inset_0_1px_3px_rgba(0,0,0,1)]">
              《 {{ currentTitle }} 》
            </span>
          </div>
          <div class="text-[13px] font-black text-[#8FBC8F]">
            已解鎖成就：{{ unlockedCount }} / {{ currentList.length }}
          </div>
        </div>

        <main class="flex-1 overflow-y-auto p-6 custom-scrollbar relative z-10 bg-[#150C08]">
          <div class="flex flex-col gap-4">
            
            <div 
              v-for="ach in currentList" 
              :key="ach.id"
              class="flex items-center gap-6 p-5 border-2 transition-all duration-300 relative overflow-hidden"
              :class="ach.isUnlocked ? 'bg-[#1C110C] border-[#DAA520] shadow-[0_4px_10px_rgba(218,165,32,0.15)]' : 'bg-[#0A0503] border-[#3A2318] opacity-75'"
            >
              <div v-if="ach.isUnlocked" class="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#FFD700] to-[#B8860B]"></div>

              <div class="w-16 h-16 rounded-full flex items-center justify-center text-3xl shrink-0 border-2 shadow-[inset_0_2px_5px_rgba(0,0,0,1)] transition-all"
                :class="ach.isUnlocked ? 'bg-[#2A1810] border-[#FFD700]' : 'bg-black border-[#593922] grayscale opacity-50'">
                {{ ach.icon }}
              </div>

              <div class="flex-1">
                <div class="flex items-center gap-3 mb-1">
                  <h3 class="text-xl font-black tracking-wider" :class="ach.isUnlocked ? 'text-[#F5DEB3]' : 'text-[#8C6239]'">{{ ach.name }}</h3>
                  
                  <span v-if="ach.rewardTitle" class="text-[10px] font-black px-2 py-0.5 rounded-sm border"
                    :class="ach.isUnlocked ? 'bg-[#3E1010] text-[#FFD700] border-[#8B0000]' : 'bg-[#1A1A1A] text-[#555] border-[#333]'">
                    解鎖稱號: {{ ach.rewardTitle }}
                  </span>
                </div>
                
                <p class="text-[13px] font-bold mb-2.5" :class="ach.isUnlocked ? 'text-[#A08060]' : 'text-[#593922]'">{{ ach.desc }}</p>

                <div v-if="!ach.isUnlocked && ach.target > 1" class="w-full max-w-sm">
                  <div class="flex justify-between text-[10px] font-black mb-1" :class="ach.isUnlocked ? 'text-[#DAA520]' : 'text-[#8C6239]'">
                    <span>推進度...</span>
                    <span>{{ ach.progress }} / {{ ach.target }}</span>
                  </div>
                  <div class="w-full h-1.5 bg-[#0F0805] rounded-full border border-[#3A2318] overflow-hidden shadow-inner p-[1px]">
                    <div class="h-full rounded-full transition-all duration-1000"
                         :class="ach.isUnlocked ? 'bg-gradient-to-r from-[#FFD700] to-[#DAA520]' : 'bg-[#593922]'"
                         :style="{ width: `${Math.min(100, ((ach.progress || 0) / ach.target) * 100)}%` }">
                    </div>
                  </div>
                </div>
              </div>

              <div class="shrink-0 flex flex-col items-end justify-center w-32">
                <template v-if="ach.isUnlocked">
                  <button 
                    v-if="ach.rewardTitle"
                    @click="equipTitle(ach.rewardTitle)"
                    class="px-4 py-2 text-xs font-black transition-all border-2 w-full text-center shadow-md active:translate-y-[2px]"
                    :class="currentTitle === ach.rewardTitle 
                      ? 'bg-[#1A2F1A] border-[#2E8B57] text-[#8FBC8F] cursor-default' 
                      : 'bg-[#2A1810] border-[#D4AF37] text-[#FFD700] hover:bg-[#D4AF37] hover:text-black'"
                    :disabled="currentTitle === ach.rewardTitle"
                  >
                    {{ currentTitle === ach.rewardTitle ? '已裝備' : '裝備稱號' }}
                  </button>
                  <span v-else class="text-[#8FBC8F] font-black text-sm tracking-widest">已達成 ✔️</span>
                </template>
                <template v-else>
                  <span class="text-[#593922] font-black text-2xl">🔒</span>
                </template>
              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  // 將所有成就(包含塔內塔外)的資料陣列傳進來
  achievements: { type: Array, required: true },
  currentTitle: { type: String, default: '' }
});
const emit = defineEmits(['close', 'equip']);

const activeTab = ref('outside'); 

// 根據 Tab 分類過濾成就列表
const currentList = computed(() => {
  return props.achievements.filter(a => a.type === activeTab.value);
});

// 計算當前分頁中，已解鎖的成就數量
const unlockedCount = computed(() => {
  return currentList.value.filter(a => a.isUnlocked).length;
});

const equipTitle = (title) => {
  emit('equip', title);
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