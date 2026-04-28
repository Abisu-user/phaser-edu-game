<template>
  <div>
    <div class="mb-8">
      <h1 class="text-4xl font-bold mb-2" style="color:#f0f0f0;font-family:'Fredoka',sans-serif;">📚 冒險模式選擇</h1>
      <p style="color:#a0a0b8;">選擇基礎的邏輯教學，或是挑戰管理員精心設計的關卡！</p>
    </div>

    <div 
      @click="isEndlessUnlocked ? $emit('open-endless-mode') : null"
      class="mb-10 relative overflow-hidden rounded-2xl group transition-all duration-300 border-2"
      :class="[
        isEndlessUnlocked 
          ? 'cursor-pointer border-fuchsia-500/40 hover:border-fuchsia-400 shadow-[0_0_20px_rgba(217,70,239,0.15)] hover:shadow-[0_0_40px_rgba(217,70,239,0.3)]' 
          : 'cursor-not-allowed border-slate-800 opacity-80 grayscale-[40%]'
      ]"
      :style="{ background: isEndlessUnlocked ? 'linear-gradient(135deg, #1a1025 0%, #2d1b4e 100%)' : 'linear-gradient(135deg, #181825 0%, #11111b 100%)' }"
    >
      <div v-if="isEndlessUnlocked" class="absolute top-0 right-0 w-72 h-72 bg-fuchsia-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-transform group-hover:scale-110"></div>
      <div v-if="isEndlessUnlocked" class="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>

      <div class="p-8 md:p-10 flex flex-col md:flex-row items-center justify-between relative z-10">
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-3">
            <span v-if="isEndlessUnlocked" class="px-3 py-1 bg-fuchsia-500/20 text-fuchsia-300 text-sm font-bold rounded-md border border-fuchsia-500/30">
              ⚡ 全新挑戰
            </span>
            <span v-else class="px-3 py-1 bg-slate-800 text-slate-400 text-sm font-bold rounded-md border border-slate-700 flex items-center gap-1.5">
              🔒 尚未解鎖
            </span>
          </div>
          
          <h2 class="text-3xl md:text-4xl font-bold mb-3 tracking-wide" 
              :class="isEndlessUnlocked ? 'text-white' : 'text-slate-500'"
              style="font-family:'Fredoka',sans-serif;">
            【挑戰】無盡程式塔
          </h2>
          
          <p class="text-lg" :class="isEndlessUnlocked ? 'text-fuchsia-200/70' : 'text-slate-500'">
            RogueLike 模式：隨機地圖、動態生成、無限難度。<br v-if="!isEndlessUnlocked" />
            <span v-if="!isEndlessUnlocked" class="text-rose-400/90 text-sm mt-2 block font-medium">※ 需通關所有「基礎邏輯教學」才能解鎖此模式</span>
            <span v-else>你能用程式邏輯爬到第幾層？</span>
          </p>
        </div>
        
        <div class="mt-6 md:mt-0 shrink-0">
          <button 
            class="px-8 py-4 font-bold text-lg rounded-xl shadow-lg transition-all flex items-center gap-3 border"
            :class="[
              isEndlessUnlocked 
                ? 'bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white transform group-hover:scale-105 border-fuchsia-400/50' 
                : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
            ]"
            :disabled="!isEndlessUnlocked"
          >
            <span>{{ isEndlessUnlocked ? '進入高塔' : '未達條件' }}</span>
            <span v-if="isEndlessUnlocked" class="text-2xl group-hover:translate-x-1 transition-transform">🚀</span>
            <span v-else class="text-xl">🔒</span>
          </button>
        </div>
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      <div 
        @click="$emit('open-level-selector', { id: 'python', title: '基礎邏輯教學', icon: '🐍' })" 
        class="rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer bg-[#1e1e2e] border border-[#333355] hover:border-[#00d4aa] hover:shadow-[0_10px_20px_rgba(0,212,170,0.15)] group"
      >
        <div class="text-5xl mb-5 transform group-hover:scale-110 transition-transform origin-left">🐍</div>
        <h3 class="text-2xl font-bold mb-2 text-[#f0f0f0] font-['Fredoka']">基礎邏輯教學</h3>
        
        <p class="text-[#a0a0b8] text-sm mb-6">
          適合新手的起點！學習程式基礎思維，破除前方的所有障礙。
        </p>
        
        <div class="flex justify-between items-end mb-2">
          <span class="text-sm font-bold text-[#00d4aa]">通關進度</span>
          <span class="text-sm font-bold text-[#f0f0f0]">
            {{ courseProgress.python || 0 }} <span class="text-[#a0a0b8] font-normal">/ {{ totalPythonLevels }} 關卡</span>
          </span>
        </div>
        
        <div class="w-full h-2.5 rounded-full overflow-hidden bg-[#11111b] shadow-inner">
          <div class="h-full bg-[#00d4aa] transition-all duration-1000 ease-out"
               :style="{ width: pythonProgressPercent + '%' }">
          </div>
        </div>
      </div>
      
      <div 
        @click="$emit('open-level-selector', { id: 'javascript', title: '管理員自訂關卡', icon: '🗺️' })" 
        class="rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer bg-[#1e1e2e] border border-[#333355] hover:border-[#ffbb33] hover:shadow-[0_10px_20px_rgba(255,187,51,0.15)] group"
      >
        <div class="text-5xl mb-5 transform group-hover:scale-110 transition-transform origin-left">🗺️</div>
        <h3 class="text-2xl font-bold mb-2 text-[#f0f0f0] font-['Fredoka']">管理員自訂關卡</h3>
        
        <p class="text-[#a0a0b8] text-sm mb-6">
          由管理員透過設計器製作的全新地圖！準備好挑戰各種奇葩關卡了嗎？
        </p>
        
        <div class="flex justify-between items-end mb-2">
          <span class="text-sm font-bold text-[#ffbb33]">通關進度</span>
          <span class="text-sm font-bold text-[#f0f0f0]">
            {{ courseProgress.javascript || 0 }} <span class="text-[#a0a0b8] font-normal">/ {{ totalCustomLevels }} 關卡</span>
          </span>
        </div>
        
        <div class="w-full h-2.5 rounded-full overflow-hidden bg-[#11111b] shadow-inner">
          <div class="h-full bg-[#ffbb33] transition-all duration-1000 ease-out"
               :style="{ width: customProgressPercent + '%' }">
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { supabase } from '../../../supabase.js';
import { levels as staticLevels } from '../../../game/scenes/LevelConfig.js';

const props = defineProps({
  courseProgress: {
    type: Object,
    default: () => ({ python: 0, javascript: 0 })
  }
});

const emit = defineEmits(['open-level-selector', 'open-endless-mode']);

// === 關卡總數狀態 ===
const totalPythonLevels = ref(staticLevels ? staticLevels.length : 20);
const totalCustomLevels = ref(0); 

// 🔥 新增：判斷無盡模式是否解鎖 (當 python 進度 >= 總關卡數) 🔥
const isEndlessUnlocked = computed(() => {
  const currentProgress = props.courseProgress.python || 0;
  const maxLevels = totalPythonLevels.value || 1;
  return currentProgress >= maxLevels; // 只要過關數達到或超過總關卡數就解鎖
});

// === 計算進度條的百分比 ===
const pythonProgressPercent = computed(() => {
  const progress = props.courseProgress.python || 0;
  const total = totalPythonLevels.value || 1;
  return Math.min(100, (progress / total) * 100);
});

const customProgressPercent = computed(() => {
  const progress = props.courseProgress.javascript || 0;
  const total = totalCustomLevels.value === 0 ? 1 : totalCustomLevels.value; 
  return Math.min(100, (progress / total) * 100);
});

// === 去資料庫抓取「實際有幾關」 ===
const fetchCustomLevelsCount = async () => {
  try {
    const { count, error } = await supabase
      .from('levels')
      .select('*', { count: 'exact', head: true });

    if (!error && count !== null) {
      totalCustomLevels.value = count; 
    }
  } catch (err) {
    console.error('抓取自訂關卡數量失敗:', err);
  }
};

onMounted(() => {
  fetchCustomLevelsCount();
});
</script>