<template>
  <div class="absolute inset-0 z-[100] flex items-center justify-center bg-[#0a0e27]/80 backdrop-blur-sm">
    <div class="bg-[#16162a] border border-[#00d4aa]/50 p-8 rounded-3xl text-center max-w-sm w-full shadow-[0_0_40px_rgba(0,212,170,0.2)] animate-slide-up relative overflow-hidden">
      
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-[#00d4aa] opacity-10 blur-[50px]"></div>

      <div class="flex justify-center items-end gap-2 mb-6 relative z-10 h-[72px]">
        <span 
          v-for="n in 3" 
          :key="n"
          class="transition-all duration-500 drop-shadow-lg" 
          :class="[
            n === 2 ? 'text-6xl' : 'text-5xl', 
            stars >= n ? 'animate-bounce opacity-100 grayscale-0' : 'opacity-20 grayscale'
          ]" 
          :style="{ animationDelay: `${(n-1) * 0.1}s` }"
        >⭐</span>
      </div>
      
      <h2 class="text-3xl font-bold text-white font-['Fredoka'] mb-2 relative z-10 tracking-wide">
        {{ stars === 3 ? '完美通關！' : '順利通關！' }}
      </h2>
      <p class="text-[#a0a0b8] mb-6 text-sm relative z-10">
        {{ stars === 3 ? '程式碼運作完美，成功擊敗 Bug！' : '雖然受了點傷，但還是成功擊敗 Bug！' }}
      </p>
      
      <div class="bg-black/30 rounded-2xl p-5 mb-8 border border-white/5 relative z-10">
        <div class="flex justify-between items-center mb-4">
          <span class="text-[#a0a0b8] text-sm font-bold tracking-wider uppercase">本次獲得</span>
          <span class="text-[#00d4aa] font-bold text-xl drop-shadow-[0_0_8px_rgba(0,212,170,0.5)]">+{{ xpReward }} XP</span>
        </div>
        
        <div class="h-px bg-white/10 w-full mb-4"></div>

        <div class="flex justify-between items-center mb-2">
          <span class="text-white font-bold font-['Fredoka'] text-lg">Lv. {{ currentLevel }}</span>
          <span class="text-[#ffbb33] font-bold text-sm">
            {{ currentXP }} <span class="text-[#a0a0b8] text-xs">/ {{ xpPerLevel }}</span>
          </span>
        </div>
        
        <div class="w-full h-2.5 rounded-full bg-black/60 overflow-hidden relative shadow-inner">
          <div class="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden" 
               :style="{ width: Math.min((currentXP / xpPerLevel * 100), 100) + '%', background: 'linear-gradient(90deg, #ff8800, #ffbb33)' }">
               <div class="absolute inset-0 bg-white/20"></div>
          </div>
        </div>
      </div>
      
      <div class="flex gap-4 relative z-10">
        <button @click="$emit('home')" class="flex-1 py-3.5 rounded-xl font-bold text-[#a0a0b8] bg-black/20 border border-white/10 hover:bg-white/5 hover:text-white transition-colors text-sm">
          回到大廳
        </button>
        <button @click="$emit('next')" class="flex-1 py-3.5 rounded-xl font-bold text-[#0a0e27] bg-gradient-to-r from-[#00d4aa] to-[#00b894] hover:shadow-[0_0_20px_rgba(0,212,170,0.4)] transition-all hover:-translate-y-1 text-sm">
          下一關 🚀
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  currentLevel: { type: Number, default: 1 },
  currentXP: { type: Number, default: 0 },
  xpPerLevel: { type: Number, default: 1000 },
  xpReward: { type: Number, default: 100 },
  stars: { type: Number, default: 3 } // 確保有接收 stars 屬性
});

defineEmits(['next', 'home']);
</script>

<style scoped>
.animate-slide-up { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
</style>