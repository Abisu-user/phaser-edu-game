<template>
  <div class="p-8 max-w-6xl mx-auto text-white font-['Fredoka'] h-full flex flex-col">
    
    <div class="flex items-center justify-between mb-8 border-b border-[#333366] pb-6 flex-shrink-0">
      <div>
        <h2 class="text-3xl font-bold flex items-center gap-3">
          <span>{{ currentTabIcon }}</span> {{ currentTabTitle }}
        </h2>
        <p class="text-[#a0a0b8] mt-1">{{ currentTabDesc }}</p>
      </div>
      <div class="px-4 py-1.5 bg-[#ffbb33]/20 text-[#ffbb33] border border-[#ffbb33]/50 rounded-full text-xs font-bold tracking-widest shadow-[0_0_10px_rgba(255,187,51,0.2)]">
        TEACHER MODE
      </div>
    </div>

    <div class="flex-1 overflow-y-auto animate-fade-in pr-2 sidebar-scroll">
      
      <TeacherDashboardPanel v-if="currentTab === 'overview'" />
      
      <StudentManagementPanel v-else-if="currentTab === 'students'" />
      
      <div v-else class="h-full flex flex-col items-center justify-center text-center py-20 opacity-80 bg-[#16162a] rounded-2xl border border-[#333366]">
        <div class="text-7xl mb-6 grayscale">📊</div>
        <h3 class="text-3xl font-bold">進度大數據分析</h3>
        <p class="text-[#a0a0b8]">此模組正在整合全班卡關熱點與 PR 值曲線中...</p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import TeacherDashboardPanel from './teacher/TeacherDashboardPanel.vue';
import StudentManagementPanel from './teacher/StudentManagementPanel.vue';

const props = defineProps({
  // 由 PlayerDashboard 傳入，決定目前顯示哪個子頁籤
  currentTab: { type: String, default: 'overview' }
});

const currentTabTitle = computed(() => {
  const titles = { overview: '班級概況總覽', students: '學生進度管理', analytics: '學習數據分析' };
  return titles[props.currentTab] || '教師中心';
});

const currentTabIcon = computed(() => {
  const icons = { overview: '📊', students: '🎓', analytics: '📈' };
  return icons[props.currentTab] || '👨‍🏫';
});

const currentTabDesc = computed(() => {
  const descs = {
    overview: '快速查看班級活躍度與平均學習進度',
    students: '追蹤個別學生進度，查看詳細通關紀錄',
    analytics: '深度分析班級整體的邏輯弱點與卡關熱點'
  };
  return descs[props.currentTab] || '教師專屬管理模組';
});
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.sidebar-scroll::-webkit-scrollbar { width: 6px; }
.sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(255, 187, 51, 0.3); border-radius: 10px; }
</style>