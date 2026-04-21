<template>
  <div>
    <div class="mb-8">
      <h1 class="text-4xl font-bold mb-2" style="color:#f0f0f0;font-family:'Fredoka',sans-serif;">📚 冒險模式選擇</h1>
      <p style="color:#a0a0b8;">選擇基礎的邏輯教學，或是挑戰管理員精心設計的關卡！</p>
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

const emit = defineEmits(['open-level-selector']);

// === 關卡總數狀態 ===
// 左邊基礎教學：從靜態設定檔直接算陣列長度
const totalPythonLevels = ref(staticLevels ? staticLevels.length : 20);

// 右邊管理員關卡：預設為 0，等一下去資料庫抓
const totalCustomLevels = ref(0); 

// === 計算進度條的百分比 ===
const pythonProgressPercent = computed(() => {
  const progress = props.courseProgress.python || 0;
  const total = totalPythonLevels.value || 1; // 避免分母為 0
  return Math.min(100, (progress / total) * 100);
});

const customProgressPercent = computed(() => {
  const progress = props.courseProgress.javascript || 0;
  // 如果資料庫真的 0 關，為了不讓進度條壞掉，分母給 1
  const total = totalCustomLevels.value === 0 ? 1 : totalCustomLevels.value; 
  return Math.min(100, (progress / total) * 100);
});

// === 去資料庫抓取「實際有幾關」 ===
const fetchCustomLevelsCount = async () => {
  try {
    // 透過 head: true 可以只取得數量 (count) 而不用抓下所有資料，效能更好！
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

// 組件載入時，發送請求計算關卡數量
onMounted(() => {
  fetchCustomLevelsCount();
});
</script>