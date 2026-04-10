<template>
  <div class="absolute inset-0 z-[100] flex items-center justify-center bg-[#0a0e27]/90 backdrop-blur-md animate-fade-in">
    <div class="bg-[#16162a] border border-[#ff6b6b]/50 p-8 rounded-3xl text-center max-w-sm w-full shadow-[0_0_40px_rgba(255,107,107,0.2)] animate-slide-up relative overflow-hidden">
      
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-[#ff6b6b] opacity-10 blur-[50px]"></div>

      <div class="mb-6 relative z-10">
        <div class="w-20 h-20 mx-auto bg-[#ff6b6b]/20 rounded-full flex items-center justify-center border border-[#ff6b6b]/30">
          <span class="text-5xl animate-pulse">💀</span>
        </div>
      </div>
      
      <h2 class="text-3xl font-bold text-white font-['Fredoka'] mb-2 relative z-10 tracking-wide">任務失敗</h2>
      <p class="text-[#a0a0b8] mb-8 text-sm relative z-10 leading-relaxed">
        程式碼似乎遇到了一些 Bug...<br>別氣餒，調整一下邏輯再試一次！
      </p>
      
      <div class="flex flex-col gap-3 relative z-10">
        <button 
          @click="$emit('restart')" 
          class="w-full py-3.5 rounded-xl font-bold text-[#0a0e27] bg-gradient-to-r from-[#ff6b6b] to-[#ee5253] hover:shadow-[0_0_20px_rgba(255,107,107,0.4)] transition-all hover:-translate-y-0.5 active:scale-95 text-sm"
        >
          重新開始挑戰 🔄
        </button>
        <button 
          @click="$emit('home')" 
          class="w-full py-3.5 rounded-xl font-bold text-[#a0a0b8] bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-colors text-sm"
        >
          回到大廳
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
defineEmits(['restart', 'home']);
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
.animate-slide-up { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
</style>