<template>
  <div class="flex flex-col gap-8 animate-fade-in relative">
    
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-3xl font-bold text-white font-['Fredoka'] flex items-center gap-3">
          <span class="text-4xl drop-shadow-[0_0_15px_rgba(255,187,51,0.5)]">🎖️</span> 榮譽殿堂
        </h2>
        <p class="text-[#a0a0b8] mt-2">完成特定挑戰，收集所有專屬徽章！點擊可查看解鎖條件。</p>
      </div>
      <div class="bg-black/30 px-6 py-3 rounded-2xl border border-white/5 text-center shrink-0">
        <p class="text-[#a0a0b8] text-xs font-bold tracking-widest uppercase mb-1">收集進度</p>
        <p class="text-[#ffbb33] font-bold text-xl font-['Fredoka']">
          {{ unlockedCount }} <span class="text-white/50 text-sm">/ {{ badges.length }}</span>
        </p>
      </div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div 
        v-for="badge in badges" 
        :key="badge.id"
        @click="selectedBadge = badge"
        class="relative group rounded-3xl p-6 flex flex-col items-center justify-center text-center transition-all duration-300 overflow-hidden cursor-pointer"
        :class="badge.isUnlocked 
          ? 'bg-[#16162a] border border-[#ffbb33]/30 hover:border-[#ffbb33]/80 hover:-translate-y-2 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_15px_40px_rgba(255,187,51,0.3)]' 
          : 'bg-black/20 border border-white/5 opacity-60 grayscale hover:grayscale-[50%] hover:opacity-100 hover:-translate-y-1'"
      >
        <div v-if="badge.isUnlocked" class="absolute inset-0 bg-gradient-to-b from-[#ffbb33]/5 to-transparent pointer-events-none"></div>
        
        <div 
          class="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-4 transition-transform duration-500 group-hover:scale-110 shadow-inner"
          :class="badge.isUnlocked ? 'bg-gradient-to-br from-black/40 to-black/10 border border-[#ffbb33]/20' : 'bg-black/40 border border-white/10'"
        >
          {{ badge.isUnlocked ? badge.icon : '🔒' }}
        </div>

        <h3 class="font-bold mb-1 font-['Fredoka'] tracking-wide transition-colors" :class="badge.isUnlocked ? 'text-[#ffbb33] group-hover:text-white' : 'text-[#a0a0b8] group-hover:text-white/80'">
          {{ badge.name }}
        </h3>
        
        <div v-if="badge.isUnlocked" class="mt-2 text-[10px] text-[#00d4aa] font-bold tracking-widest uppercase bg-[#00d4aa]/10 py-1 px-3 rounded-full border border-[#00d4aa]/20 inline-block">
          已解鎖
        </div>
        <div v-else class="mt-2 text-[10px] text-[#ff6b6b] font-bold tracking-widest uppercase bg-[#ff6b6b]/10 py-1 px-3 rounded-full border border-[#ff6b6b]/20 inline-block">
          未解鎖
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="selectedBadge" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0a0e27]/80 backdrop-blur-md animate-fade-in" @click.self="selectedBadge = null">
        
        <div class="bg-[#16162a] border p-8 rounded-3xl text-center max-w-sm w-full shadow-2xl animate-slide-up relative overflow-hidden"
             :class="selectedBadge.isUnlocked ? 'border-[#ffbb33]/50 shadow-[0_0_40px_rgba(255,187,51,0.2)]' : 'border-white/10'">
          
          <div v-if="selectedBadge.isUnlocked" class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-[#ffbb33] opacity-10 blur-[50px]"></div>

          <button @click="selectedBadge = null" class="absolute top-4 right-4 text-[#a0a0b8] hover:text-white transition-colors focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>

          <div class="w-32 h-32 mx-auto rounded-3xl flex items-center justify-center text-7xl mb-6 shadow-inner relative z-10"
               :class="selectedBadge.isUnlocked ? 'bg-gradient-to-br from-[#ffbb33]/20 to-black/40 border border-[#ffbb33]/30 animate-bounce-slight' : 'bg-black/40 border border-white/10 grayscale opacity-50'">
            {{ selectedBadge.isUnlocked ? selectedBadge.icon : '🔒' }}
          </div>
          
          <h2 class="text-3xl font-bold font-['Fredoka'] mb-2 relative z-10 tracking-wide"
              :class="selectedBadge.isUnlocked ? 'text-[#ffbb33]' : 'text-white/50'">
            {{ selectedBadge.name }}
          </h2>
          
          <div class="bg-black/40 rounded-2xl p-5 mb-6 border border-white/5 relative z-10">
            <p class="text-[#00d4aa] text-sm font-bold tracking-wider uppercase mb-2">解鎖條件</p>
            <p class="text-white text-base leading-relaxed">
              {{ selectedBadge.desc }}
            </p>
          </div>
          
          <div class="relative z-10 w-full mb-6">
            <div class="flex justify-between items-end mb-2">
              <span class="text-[#a0a0b8] text-sm font-bold">當前進度</span>
              <span class="font-bold text-lg font-['Fredoka']" :class="selectedBadge.isUnlocked ? 'text-[#ffbb33]' : 'text-white'">
                {{ Math.min(selectedBadge.current, selectedBadge.target) }} <span class="text-[#a0a0b8] text-sm">/ {{ selectedBadge.target }}</span>
              </span>
            </div>
            <div class="h-3 w-full bg-black/60 rounded-full overflow-hidden shadow-inner">
              <div class="h-full rounded-full transition-all duration-1000 ease-out" 
                   :style="{ width: `${Math.min((selectedBadge.current / selectedBadge.target) * 100, 100)}%` }"
                   :class="selectedBadge.isUnlocked ? 'bg-gradient-to-r from-[#ff8800] to-[#ffbb33]' : 'bg-[#00d4aa]/50'">
              </div>
            </div>
          </div>

          <div class="relative z-10">
            <div v-if="selectedBadge.isUnlocked" class="py-3 rounded-xl font-bold text-[#0a0e27] bg-gradient-to-r from-[#ffbb33] to-[#ffaa00] shadow-[0_0_15px_rgba(255,187,51,0.4)]">
              🎉 你已獲得此榮譽！
            </div>
            <div v-else class="py-3 rounded-xl font-bold text-[#a0a0b8] bg-white/5 border border-white/10">
              持續努力，即將解鎖！
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
  badges: { type: Array, required: true }
});

const unlockedCount = computed(() => props.badges.filter(b => b.isUnlocked).length);

// 🌟 新增：用來記錄目前被點擊放大的徽章資料
const selectedBadge = ref(null);
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
.animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.animate-bounce-slight { animation: bounceSlight 2s infinite ease-in-out; }

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes bounceSlight {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
</style>