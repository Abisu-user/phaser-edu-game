<template>
  <div class="absolute inset-0 z-[100] flex items-center justify-center bg-[#0a0e27]/80 backdrop-blur-sm">
    <div class="bg-[#16162a] border border-[#ff6b6b]/50 p-8 rounded-3xl text-center max-w-sm w-full shadow-[0_0_40px_rgba(255,107,107,0.2)] animate-slide-up relative overflow-hidden">
      
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-[#ff6b6b] opacity-10 blur-[50px]"></div>

      <div class="flex justify-center items-center mb-6 relative z-10 h-[72px]">
        <span class="text-7xl animate-pulse drop-shadow-[0_0_15px_rgba(255,107,107,0.5)]">💔</span>
      </div>
      
      <h2 class="text-3xl font-bold text-white font-['Fredoka'] mb-2 relative z-10 tracking-wide">
        {{ isPreviewMode ? '❌ 測試失敗！' : '任務失敗！' }}
      </h2>
      <p class="text-[#a0a0b8] mb-8 text-sm relative z-10 leading-relaxed">
        {{ isPreviewMode ? '看來關卡的邏輯設定或難度需要再調整一下，回去修改看看吧！' : '魔法能量耗盡了... 仔細檢查積木的邏輯，找出 Bug 再試一次吧！' }}
      </p>
      
      <div class="flex flex-col gap-3 relative z-10">
        <button @click="$emit('restart')" class="w-full py-3.5 rounded-xl font-bold text-[#0a0e27] bg-gradient-to-r from-[#ff6b6b] to-[#ff4757] hover:shadow-[0_0_20px_rgba(255,107,107,0.4)] transition-all hover:-translate-y-1 text-sm">
          重新嘗試 🔄
        </button>
        
        <button @click="$emit('home')" class="w-full py-3.5 rounded-xl font-bold text-[#a0a0b8] bg-black/20 border border-white/10 hover:bg-white/5 hover:text-white transition-colors text-sm">
          {{ isPreviewMode ? '🔙 結束測試 (回到設計器)' : '🏠 放棄關卡 (回到大廳)' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  currentLevel: { type: Number, default: 1 },
  currentXP: { type: Number, default: 0 },
  xpPerLevel: { type: Number, default: 1000 },
  xpReward: { type: Number, default: 100 },
  stars: { type: Number, default: 3 },
  maxStars: { type: Number, default: 3 },
  isPreviewMode: { type: Boolean, default: false }
});

defineEmits(['next', 'home']);

// 🌟 新增邏輯：動態計算評價星數 (1~3顆星)
const displayStars = computed(() => {
  // 如果一次都沒失敗過 (剩餘次數 >= 總次數)
  if (props.stars >= props.maxStars) return 3;
  
  // 如果還剩下一半以上的次數
  if (props.stars >= Math.ceil(props.maxStars / 2)) return 2;
  
  // 錯很多次，低空飛過
  return 1;
});
</script>

<style scoped>
.animate-slide-up { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
</style>