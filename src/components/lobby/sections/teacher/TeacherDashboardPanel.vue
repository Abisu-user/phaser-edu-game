<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="stat in stats" :key="stat.label" class="bg-[#16162a] border border-[#333366] p-6 rounded-2xl shadow-lg flex items-center gap-4">
        <div class="w-14 h-14 rounded-full flex items-center justify-center text-2xl" :style="`background: ${stat.color}20; color: ${stat.color};`">
          {{ stat.icon }}
        </div>
        <div>
          <div class="text-[#a0a0b8] text-sm">{{ stat.label }}</div>
          <div class="text-3xl font-bold">{{ stat.value }} <span class="text-sm font-normal text-[#a0a0b8]">{{ stat.unit }}</span></div>
        </div>
      </div>
    </div>

    <div class="bg-[#16162a] border border-[#333366] p-6 rounded-2xl shadow-lg">
      <h3 class="text-xl font-bold text-[#ffbb33] mb-4 flex items-center gap-2"><span>📢</span> 實時學習動態</h3>
      <div class="space-y-3">
        <div v-for="feed in recentFeeds" :key="feed.id" class="flex items-center gap-3 text-[#a0a0b8] bg-[#0a0e27] p-4 rounded-xl border border-[#333366]">
          <span :class="feed.type === 'warning' ? 'text-red-400' : 'text-green-400'">{{ feed.type === 'warning' ? '⚠️' : '🎉' }}</span>
          <span v-html="feed.content"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const stats = ref([
  { label: '班級總人數', value: 24, unit: '人', icon: '👥', color: '#00d4aa' },
  { label: '平均等級', value: 8.5, unit: '', icon: '⭐', color: '#ffbb33' },
  { label: '本週活躍度', value: 92, unit: '%', icon: '🔥', color: '#ff6b6b' }
]);
const recentFeeds = ref([
  { id: 1, type: 'warning', content: '學生 <strong>王小明</strong> 在「迴圈關卡 3」已卡關超過 2 天。' },
  { id: 2, type: 'success', content: '學生 <strong>陳依依</strong> 剛剛通關了進階迷宮！' }
]);
</script>