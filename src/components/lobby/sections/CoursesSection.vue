<template>
  <div>
    <div class="mb-8">
      <h1 class="text-4xl font-bold mb-2" style="color:#f0f0f0;font-family:'Fredoka',sans-serif;">📚 所有課程</h1>
      <p style="color:#a0a0b8;">選擇你喜歡的課程開始學習</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      
      <div 
        @click="$emit('open-level-selector', { id: 'python', title: 'Python 大冒險', icon: '🐍' })" 
        class="rounded-2xl p-6 transition-all hover:-translate-y-1 cursor-pointer bg-white dark:bg-[#252540] border-2 border-gray-200 dark:border-[#00d4aa44]"
      >
        <div class="text-4xl mb-4">🐍</div>
        <h3 class="text-xl font-bold mb-2 text-gray-900 dark:text-[#f0f0f0] font-['Fredoka']">Python 大冒險</h3>
        
        <p class="text-gray-500 dark:text-[#a0a0b8] text-sm mb-3">
          已完成 {{ courseProgress.python || 0 }} / 20 關卡
        </p>
        
        <div class="w-full h-2 rounded-full overflow-hidden mb-3 bg-gray-200 dark:bg-[#1e1e2e]">
          <div class="h-full bg-[#00d4aa] transition-all duration-500" 
               :style="{ width: ((courseProgress.python || 0) / 20 * 100) + '%' }">
          </div>
        </div>
        
        <button class="w-full py-2 rounded-lg font-semibold bg-[#00d4aa] text-[#0f0e17]">繼續</button>
      </div>
      
      <div 
        @click="$emit('open-level-selector', { id: 'javascript', title: 'JavaScript 戰場', icon: '⚔️' })" 
        class="rounded-2xl p-6 transition-all hover:-translate-y-1 cursor-pointer bg-white dark:bg-[#252540] border-2 border-gray-200 dark:border-[#ffbb3344]"
      >
        <div class="text-4xl mb-4">⚔️</div>
        <h3 class="text-xl font-bold mb-2 text-gray-900 dark:text-[#f0f0f0] font-['Fredoka']">JavaScript 戰場</h3>
        
        <p class="text-gray-500 dark:text-[#a0a0b8] text-sm mb-3">
          已完成 {{ courseProgress.javascript || 0 }} / 15 關卡
        </p>
        
        <div class="w-full h-2 rounded-full overflow-hidden mb-3 bg-gray-200 dark:bg-[#1e1e2e]">
          <div class="h-full bg-[#ffbb33] transition-all duration-500" 
               :style="{ width: ((courseProgress.javascript || 0) / 15 * 100) + '%' }">
          </div>
        </div>
        
        <button class="w-full py-2 rounded-lg font-semibold bg-[#ffbb33] text-[#0f0e17]">進入戰場</button>
      </div>

    </div>
  </div>
</template>

<script setup>
// 定義接收父組件傳來的進度資料
defineProps({
  courseProgress: {
    type: Object,
    default: () => ({ python: 0, javascript: 0 }) // 預設進度為 0
  }
});

defineEmits(['open-level-selector']);
</script>