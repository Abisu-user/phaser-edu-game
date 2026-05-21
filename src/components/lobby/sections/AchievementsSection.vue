<template>
  <div class="flex flex-col gap-8 animate-fade-in relative">
    
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-3xl font-bold text-white font-['Fredoka'] flex items-center gap-3">
          <span class="text-4xl drop-shadow-[0_0_15px_rgba(255,187,51,0.5)]">🎖️</span> 榮譽殿堂
        </h2>
        <p class="text-[#a0a0b8] mt-2">完成特定挑戰，收集所有專屬徽章！解鎖可獲得專屬稱號。</p>
      </div>
      <div class="bg-black/30 px-6 py-3 rounded-2xl border border-white/5 text-center shrink-0">
        <p class="text-[#a0a0b8] text-xs font-bold tracking-widest uppercase mb-1">目前分類收集進度</p>
        <p class="text-[#ffbb33] font-bold text-xl font-['Fredoka']">
          {{ unlockedCount }} <span class="text-white/50 text-sm\">/ {{ filteredBadges.length }}</span>
        </p>
      </div>
    </div>

    <div class="flex gap-3">
      <button @click="activeTab = 'outside'" class="px-5 py-2 rounded-xl font-bold transition-all text-sm tracking-widest"
        :class="activeTab === 'outside' ? 'bg-[#ffbb33] text-[#0a0e27] shadow-[0_0_15px_rgba(255,187,51,0.4)]' : 'bg-white/10 text-[#a0a0b8] hover:bg-white/20'">
        🌍 大陸歷練 (主線)
      </button>
      <button @click="activeTab = 'tower'" class="px-5 py-2 rounded-xl font-bold transition-all text-sm tracking-widest"
        :class="activeTab === 'tower' ? 'bg-[#ffbb33] text-[#0a0e27] shadow-[0_0_15px_rgba(255,187,51,0.4)]' : 'bg-white/10 text-[#a0a0b8] hover:bg-white/20'">
        🏰 深淵探索 (高塔)
      </button>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div 
        v-for="badge in filteredBadges" 
        :key="badge.id"
        @click="selectedBadge = badge"
        class="bg-black/40 backdrop-blur-md rounded-2xl p-5 border cursor-pointer group transition-all duration-300 relative overflow-hidden"
        :class="badge.isUnlocked ? 'border-[#ffbb33]/50 hover:border-[#ffbb33] shadow-[0_4px_15px_rgba(255,187,51,0.1)] hover:-translate-y-1' : 'border-white/10 hover:border-white/30'"
      >
        <div class="absolute -right-4 -top-4 w-16 h-16 bg-white/5 rounded-full blur-xl group-hover:bg-[#ffbb33]/10 transition-colors"></div>
        
        <div class="text-5xl text-center mb-4 transform group-hover:scale-110 transition-transform duration-300"
             :class="badge.isUnlocked ? 'drop-shadow-[0_0_15px_rgba(255,187,51,0.6)]' : 'grayscale opacity-40'">
          {{ badge.icon }}
        </div>
        
        <div class="text-center relative z-10">
          <h3 class="font-bold text-lg mb-1 font-['Fredoka']" :class="badge.isUnlocked ? 'text-white' : 'text-[#a0a0b8]'">
            {{ badge.name }}
          </h3>
          <p v-if="badge.rewardTitle" class="text-[11px] font-bold mt-1" :class="badge.isUnlocked ? 'text-[#ffbb33]' : 'text-gray-500'">
            稱號: 《{{ badge.rewardTitle }}》
          </p>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="selectedBadge" 
           class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
           @click.self="selectedBadge = null">
        <div class="bg-[#12141d] border border-white/10 rounded-3xl p-8 max-w-sm w-full relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-center">
          
          <button @click="selectedBadge = null" class="absolute top-4 right-4 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 w-8 h-8 rounded-full flex items-center justify-center transition-colors z-20">
            ✕
          </button>

          <div class="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

          <div class="text-7xl mb-6 relative z-10" :class="selectedBadge.isUnlocked ? 'drop-shadow-[0_0_25px_rgba(255,187,51,0.6)]' : 'grayscale opacity-50'">
            {{ selectedBadge.icon }}
          </div>
          
          <h3 class="text-2xl font-bold text-white mb-2 relative z-10">{{ selectedBadge.name }}</h3>
          
          <div v-if="selectedBadge.rewardTitle" class="text-sm text-[#ffbb33] font-bold mb-3 relative z-10">
            解鎖稱號: 《{{ selectedBadge.rewardTitle }}》
          </div>

          <p class="text-[#a0a0b8] mb-8 relative z-10 leading-relaxed">{{ selectedBadge.desc }}</p>

          <div class="mb-6 relative z-10 bg-black/40 rounded-xl p-4 border border-white/5">
            <div class="flex justify-between text-xs font-bold text-[#a0a0b8] mb-2 uppercase tracking-wider">
              <span>Progress</span>
              <span :class="selectedBadge.isUnlocked ? 'text-[#ffbb33]' : ''">
                {{ selectedBadge.progress }} / {{ selectedBadge.target }}
              </span>
            </div>
            <div class="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-1000 ease-out relative"
                   :style="{ width: `${Math.min(100, (selectedBadge.progress / selectedBadge.target) * 100)}%` }"
                   :class="selectedBadge.isUnlocked ? 'bg-gradient-to-r from-[#ffaa00] to-[#ffbb33]' : 'bg-[#00d4aa]/50'">
              </div>
            </div>
          </div>

          <div class="relative z-10 flex flex-col gap-3 mt-4">
            <template v-if="selectedBadge.isUnlocked">
              
              <button 
                v-if="selectedBadge.rewardTitle"
                @click="$emit('equip', selectedBadge.rewardTitle)"
                class="w-full py-2.5 rounded-xl font-bold transition-all text-sm"
                :class="currentTitle === selectedBadge.rewardTitle 
                  ? 'bg-[#ffbb33]/10 text-[#ffbb33] border border-[#ffbb33]/40 cursor-default' 
                  : 'bg-gradient-to-r from-[#ffbb33] to-[#ffaa00] text-[#0a0e27] hover:scale-105'"
                :disabled="currentTitle === selectedBadge.rewardTitle"
              >
                {{ currentTitle === selectedBadge.rewardTitle ? '⚡ 目前佩戴中' : '🛡️ 裝備此稱號' }}
              </button>
              <div v-else class="py-2.5 rounded-xl font-bold text-[#00d4aa] bg-[#00d4aa]/10 border border-[#00d4aa]/20 text-sm">
                🎉 已達成此項榮譽
              </div>

            </template>
            <div v-else class="py-3 rounded-xl font-bold text-white/30 bg-white/5 border border-white/5 cursor-not-allowed text-sm">
              🔒 挑戰尚未達成
            </div>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  badges: { type: Array, required: true },
  currentTitle: { type: String, default: '' },
});

const emit = defineEmits(['equip']);
const activeTab = ref('outside'); 
const selectedBadge = ref(null);

// 根據 Tab 過濾
const filteredBadges = computed(() => {
  return props.badges.filter(b => b.type === activeTab.value);
});

const unlockedCount = computed(() => filteredBadges.value.filter(b => b.isUnlocked).length);
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>