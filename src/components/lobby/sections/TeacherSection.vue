<template>
  <div class="max-w-6xl mx-auto text-white font-['Fredoka'] h-full flex flex-col">
    
    <GameLevel 
      v-if="isPreviewing"
      courseId="javascript" 
      :levelId="previewLevelId"
      :isPreviewMode="true"
      @back="handleEndPreview"
      class="rounded-xl overflow-hidden shadow-2xl border border-indigo-500/30"
    />

    <div v-show="!isPreviewing" class="h-full flex flex-col">
      <div class="flex items-center justify-between mb-8 border-b border-[#333366] pb-6 flex-shrink-0">
        <div>
          <h2 class="text-3xl font-bold flex items-center gap-3">
            <span>{{ currentTabIcon }}</span> {{ currentTabTitle }}
          </h2>
          <p class="text-[#a0a0b8] mt-1">{{ currentTabDesc }}</p>
        </div>
        
        <div v-if="isAssistantMode" class="px-4 py-1.5 bg-[#a78bfa]/20 text-[#a78bfa] border border-[#a78bfa]/50 rounded-full text-xs font-bold tracking-widest shadow-[0_0_10px_rgba(167,139,250,0.2)] flex items-center gap-2">
          👑 ASSISTANT MODE
        </div>
        <div v-else class="px-4 py-1.5 bg-[#ffbb33]/20 text-[#ffbb33] border border-[#ffbb33]/50 rounded-full text-xs font-bold tracking-widest shadow-[0_0_10px_rgba(255,187,51,0.2)]">
          TEACHER MODE
        </div>

      </div>

      <div class="flex-1 overflow-y-auto animate-fade-in pr-2 sidebar-scroll">
        
        <TeacherDashboardPanel v-if="currentTab === 'overview'" />
        <TeacherInteractions v-if="currentTab === 'interactions'" />
        <TeacherAnnouncements v-if="currentTab === 'announcements'" />
        <StudentManagementPanel v-if="currentTab === 'students'" />
        <StudentProgressPanel v-if="currentTab === 'analytics'" />
        <LevelDesigner v-show="currentTab === 'content'" @preview="handlePreview" />

      </div>
    </div>

  </div>
</template>

<script setup>
import { computed, ref } from 'vue'; 
import TeacherDashboardPanel from './teacher/TeacherDashboardPanel.vue';
import StudentManagementPanel from './teacher/StudentManagementPanel.vue';
import StudentProgressPanel from './teacher/StudentProgressPanel.vue';
import LevelDesigner from './admin/LevelDesigner.vue';
import GameLevel from '../../level/GameLevel.vue'; 
import TeacherInteractions from './teacher/TeacherInteractions.vue';
import TeacherAnnouncements from './teacher/TeacherAnnouncements.vue';

const props = defineProps({
  currentTab: { type: String, default: 'overview' },
  playerRole: { type: String, default: 'teacher' } 
});

const isAssistantMode = computed(() => props.playerRole === 'student');

// --- 預覽邏輯狀態區 ---
const isPreviewing = ref(false);
const previewLevelId = ref(1);

const handlePreview = (levelId) => {
  previewLevelId.value = levelId;
  isPreviewing.value = true; 
};

const handleEndPreview = () => {
  isPreviewing.value = false; 
};
// -----------------------

const currentTabTitle = computed(() => {
  const titles = { overview: '班級概況總覽', students: '學生進度管理', analytics: '學習數據分析', content: '內容管理', interactions: '互動管理', announcements: '班級公告管理' };
  return titles[props.currentTab] || '教師中心';
});

const currentTabIcon = computed(() => {
  const icons = { overview: '📊', students: '🎓', analytics: '📈', content: '🗺️', interactions: '✨', announcements: '📢' };
  return icons[props.currentTab] || '👨‍🏫';
});

const currentTabDesc = computed(() => {
  // 🌟 如果是助理進來互動管理，顯示專屬的描述
  if (isAssistantMode.value && props.currentTab === 'interactions') {
    return '協助老師發布與管理班級的問卷及投票';
  }

  const descs = {
    overview: '快速查看班級活躍度與平均學習進度',
    students: '追蹤個別學生進度，查看詳細通關紀錄',
    analytics: '深度分析班級整體的邏輯弱點與卡關熱點',
    content: '設計和管理課程內容',
    interactions: '管理與學生的互動與交流',
    announcements: '發布和管理班級公告'
  };
  return descs[props.currentTab] || '教師專屬管理模組';
});
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.sidebar-scroll::-webkit-scrollbar { width: 6px; }
.sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(255, 187, 51, 0.3); border-radius: 10px; }
/* 🌟 如果是助理模式，讓捲軸變紫色，細節質感拉滿 */
:global(.sidebar-scroll.assistant-scroll::-webkit-scrollbar-thumb) {
  background: rgba(167, 139, 250, 0.3); 
}
</style>