<template>
  <div class="p-8 max-w-6xl mx-auto text-white font-['Fredoka'] h-full flex flex-col">
    
    <div class="flex items-center justify-between mb-8 border-b border-[#333366] pb-6 flex-shrink-0">
      <div>
        <h2 class="text-3xl font-bold flex items-center gap-3">
          <span>{{ currentTabIcon }}</span> {{ currentTabTitle }}
        </h2>
        <p class="text-[#a0a0b8] mt-1">{{ currentTabDesc }}</p>
      </div>
      <div class="px-4 py-1.5 bg-red-500/20 text-red-400 border border-red-500/50 rounded-full text-xs font-bold tracking-widest shadow-[0_0_10px_rgba(239,68,68,0.2)]">
        ADMIN MODE
      </div>
    </div>

    <div class="flex-1 overflow-y-auto animate-fade-in pr-2 sidebar-scroll">
      
      <SystemSettingsPanel v-if="currentTab === 'system'" />
      
      <UserManagementPanel v-else-if="currentTab === 'users'" />

      <LevelDesigner v-else-if="currentTab === 'content'" />
      
      <UnderConstruction 
        v-else 
        :icon="currentTabIcon" 
        :title="currentTabTitle" 
        :desc="currentTabDesc" 
      />

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

// 引入我們拆分出去的子元件
import SystemSettingsPanel from './admin/SystemSettingsPanel.vue';
import UserManagementPanel from './admin/UserManagementPanel.vue';
import UnderConstruction from './admin/UnderConstruction.vue';
import LevelDesigner from './admin/LevelDesigner.vue';

const props = defineProps({
  currentTab: { type: String, default: 'system' }
});

const currentTabTitle = computed(() => {
  const titles = { content: '遊戲內容管理', users: '使用者權限管理', analytics: '全站數據統計', system: '系統設定與公告' };
  return titles[props.currentTab] || '管理模組';
});
const currentTabIcon = computed(() => {
  const icons = { content: '🗺️', users: '👥', analytics: '📊', system: '📢' };
  return icons[props.currentTab] || '🛠️';
});
const currentTabDesc = computed(() => {
  const descs = {
    content: '管理 Blockly 關卡與迷宮參數',
    users: '全站帳號審核、停權與身份管理',
    analytics: 'DAU 日活與卡關熱點分析報表',
    system: '發布全站跑馬燈公告或設定系統狀態'
  };
  return descs[props.currentTab] || '未來進階設定將在此開放';
});
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.sidebar-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
.sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
.sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(157, 78, 221, 0.3); border-radius: 10px; }
.sidebar-scroll::-webkit-scrollbar-thumb:hover { background: rgba(157, 78, 221, 0.6); }
</style>