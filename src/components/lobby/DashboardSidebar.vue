<template>
  <div 
    class="relative z-30 flex flex-col border-r border-white/5 backdrop-blur-2xl transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[4px_0_24px_rgba(0,0,0,0.2)]"
    :class="isCollapsed ? 'w-[80px] bg-[#0a0e27]/95' : 'w-[280px] bg-[#0a0e27]/80'"
  >
    
    <div class="p-4 flex justify-end">
      <button 
        @click="$emit('toggle')" 
        class="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 text-[#00d4aa] border border-transparent hover:bg-[#00d4aa]/10 hover:border-[#00d4aa]/30 focus:outline-none"
        :class="isCollapsed ? 'mx-auto' : ''"
        title="縮放導覽列"
      >
        <svg v-if="!isCollapsed" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="transition-transform hover:-translate-x-1"><path d="m15 18-6-6 6-6"/></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="transition-transform hover:translate-x-1"><path d="m9 18 6-6-6-6"/></svg>
      </button>
    </div>

    <div class="px-4 pb-4 border-b border-white/5">
      <div 
        class="flex items-center gap-3 transition-all duration-300"
        :class="isCollapsed ? 'justify-center' : 'p-2 bg-black/20 border border-white/5 rounded-xl'"
      >
        <div 
          class="rounded-full border-[2.5px] border-white aspect-square overflow-hidden bg-[#16162a] shrink-0 shadow-[0_0_15px_rgba(255,255,255,0.15)] transition-all duration-300"
          :class="isCollapsed ? 'w-10 h-10' : 'w-12 h-12'"
        >
          <img 
            :src="playerAvatarUrl || '/avatars/default.png'" 
            alt="User Avatar" 
            class="w-full h-full object-cover"
          />
        </div>
        <div v-if="!isCollapsed" class="flex-1 min-w-0 overflow-hidden">
          <p class="text-white text-sm font-bold truncate">{{ playerName || '玩家名稱' }}</p>
          <p class="text-[#00d4aa] text-[11px] font-['Fredoka'] font-bold tracking-wider uppercase mt-0.5">Lv. {{ currentLevel }}</p>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto sidebar-scroll px-3 py-4 space-y-6">
      
      <div v-for="(section, index) in sectionedMenus" :key="index" class="space-y-1">
        
        <p v-if="section.header && !isCollapsed" class="px-4 mb-2 text-[10px] font-bold text-[#666688] uppercase tracking-widest transition-opacity duration-300">
          {{ section.header }}
        </p>
        <div v-if="section.header && isCollapsed && index > 0" class="h-px bg-white/5 my-4 mx-2"></div>

        <div 
          v-for="item in section.items" 
          :key="item.id" 
          class="group flex items-center rounded-xl cursor-pointer transition-all duration-300 relative mb-1"
          :class="[
            isActive(item.id)
              ? (item.id.startsWith('admin-') ? 'bg-[#9d4edd]/10 text-[#9d4edd] border border-[#9d4edd]/30 shadow-[0_0_15px_rgba(157,78,221,0.15)]' 
                 : item.id.startsWith('teacher-') ? 'bg-[#ffbb33]/20 text-[#ffbb33] border border-[#ffbb33]/30 shadow-[0_0_15px_rgba(255,187,51,0.15)]' 
                 : 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/30 shadow-[0_0_15px_rgba(0,212,170,0.15)]') 
              : 'text-[#a0a0b8] border border-transparent hover:bg-white/5 hover:text-white hover:border-white/10',
            isCollapsed ? 'p-3 justify-center' : 'px-4 py-3 gap-4'
          ]"
          @click="selectItem(item.id)"
        >
          <div v-if="isActive(item.id)" class="absolute left-0 top-0 bottom-0 w-1" :class="item.id.startsWith('admin-') ? 'bg-[#9d4edd] shadow-[0_0_10px_#9d4edd]' : item.id.startsWith('teacher-') ? 'bg-[#ffbb33] shadow-[0_0_10px_#ffbb33]' : 'bg-[#00d4aa] shadow-[0_0_10px_#00d4aa]'"></div>
          
          <div class="text-xl group-hover:scale-110 transition-transform duration-300 relative">
            {{ item.icon }}
            <div v-if="item.id === 'friends' && props.hasUnread && currentSection !== 'friends'" 
                class="absolute -top-1.5 -right-1.5 w-3 h-3 bg-red-500 rounded-full border-2 border-[#0a0e27] shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse">
            </div>
          </div>

          <div v-if="!isCollapsed" class="font-medium tracking-wide whitespace-nowrap">{{ item.label }}</div>
        </div>
      </div>

      <div class="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-4 mx-2"></div>
      
      <div class="space-y-1">
        <div 
          class="group flex items-center rounded-xl cursor-pointer transition-all duration-300"
          :class="[
            currentSection === 'settings' ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/30' : 'text-[#a0a0b8] border border-transparent hover:bg-white/5 hover:text-white hover:border-white/10',
            isCollapsed ? 'p-3 justify-center' : 'px-4 py-3 gap-4'
          ]"
          @click="selectItem('settings')"
          :title="isCollapsed ? '設定' : ''"
        >
          <div class="text-xl group-hover:rotate-90 transition-transform duration-500">⚙️</div>
          <div v-if="!isCollapsed" class="font-medium tracking-wide whitespace-nowrap">設定</div>
        </div>
        
        <div 
          class="group flex items-center rounded-xl cursor-pointer transition-all duration-300"
          :class="[
            currentSection === 'help' ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/30' : 'text-[#a0a0b8] border border-transparent hover:bg-white/5 hover:text-white hover:border-white/10',
            isCollapsed ? 'p-3 justify-center' : 'px-4 py-3 gap-4'
          ]"
          @click="selectItem('help')"
          :title="isCollapsed ? '幫助' : ''"
        >
          <div class="text-xl group-hover:scale-110 transition-transform duration-300">❓</div>
          <div v-if="!isCollapsed" class="font-medium tracking-wide whitespace-nowrap">幫助</div>
        </div>
      </div>

    </div>

    <div class="p-4 border-t border-white/5 bg-gradient-to-b from-transparent to-black/40">
      <button 
        @click="triggerLogout"
        class="w-full flex items-center justify-center gap-2 rounded-xl text-[#ff6b6b] transition-all duration-300 border border-transparent hover:bg-[#ff6b6b]/10 hover:border-[#ff6b6b]/30 group"
        :class="isCollapsed ? 'py-3' : 'py-2.5 px-4'"
        title="登出遊戲"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="group-hover:-translate-x-1 transition-transform"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        <span v-if="!isCollapsed" class="font-bold text-sm tracking-wide whitespace-nowrap">登出</span>
      </button>
    </div>

    <ConfirmModal 
      :isOpen="isLogoutModalOpen"
      title="確定要登出了嗎？"
      message="登出將會結束您目前的冒險連線。您的進度已經安全儲存。"
      confirmText="確認登出"
      cancelText="不，我點錯了"
      icon="🚪"
      :isDanger="true"
      @confirm="executeLogout"
      @cancel="isLogoutModalOpen = false"
    />

  </div>
</template>

<script setup>
import { supabase } from '../../supabase'; 
import { ref, computed } from 'vue';
import ConfirmModal from '../common/ConfirmModal.vue';

const props = defineProps({
  isCollapsed: Boolean,
  currentSection: String,
  activeAdminTab: String, 
  activeTeacherTab: String, // 🌟 新增：用來追蹤老師點了哪個子分頁
  currentLevel: [Number, String],
  playerName: String,
  playerAvatarUrl: String,
  hasUnread: Boolean,
  playerRole: { type: String, default: 'student' }
});

const emit = defineEmits([
  'toggle', 
  'update:currentSection', 
  'update:activeAdminTab', 
  'update:activeTeacherTab', // 🌟 新增：讓父層知道老師切換了分頁
  'clear-unread'
]);

const isLogoutModalOpen = ref(false);

// 基礎大廳選單
const lobbyItems = [
  { id: 'lobby', label: '大廳首頁', icon: '🏠' },
  { id: 'courses', label: '課程', icon: '📚' },
  { id: 'class', label: '班級', icon: '🏫' },
  { id: 'friends', label: '好友', icon: '👥' },
  { id: 'achievements', label: '成就', icon: '🎖️' },
  { id: 'leaderboard', label: '排行榜', icon: '🏆' },
  { id: 'profile', label: '個人檔案', icon: '👤' }
];

// 🔥 動態產生分組選單結構
const sectionedMenus = computed(() => {
  // 1. 建立基礎的選單陣列
  const baseItems = [
    { id: 'lobby', label: '大廳首頁', icon: '🏠' },
    { id: 'courses', label: '課程', icon: '📚' }
  ];

  // 🌟 關鍵：只有身份是 student (學生) 時，才加入「我的班級」
  if (props.playerRole === 'student') {
    baseItems.push({ id: 'class', label: '班級', icon: '🏫' });
  }

  // 將剩下的通用選項補上
  baseItems.push(
    { id: 'friends', label: '好友', icon: '👥' },
    { id: 'achievements', label: '成就', icon: '🎖️' },
    { id: 'leaderboard', label: '排行榜', icon: '🏆' },
    { id: 'profile', label: '個人檔案', icon: '👤' }
  );

  const menus = [
    { header: 'Lobby Section', items: baseItems }
  ];

  if (props.playerRole === 'admin') {
    menus.push({
      header: 'System Admin',
      items: [
        { id: 'admin-content', icon: '🗺️', label: '內容管理' },
        { id: 'admin-users', icon: '👥', label: '使用者管理' },
        { id: 'admin-analytics', icon: '📊', label: '數據統計' },
        { id: 'admin-system', icon: '📢', label: '系統公告' }
      ]
    });
  }

  if (props.playerRole === 'teacher') {
    menus.push({
      header: 'Teacher Section',
      items: [
        { id: 'teacher-overview', icon: '📊', label: '班級概況' },
        { id: 'teacher-students', icon: '🎓', label: '學生管理' },
        { id: 'teacher-analytics', icon: '📈', label: '進度分析' }
      ]
    });
  }

  return menus;
});

// 🔥 處理點擊事件與路由分發
const selectItem = (itemId) => {
  if (itemId.startsWith('admin-')) {
    emit('update:currentSection', 'admin');
    emit('update:activeAdminTab', itemId.replace('admin-', ''));
  } else if (itemId.startsWith('teacher-')) {
    emit('update:currentSection', 'teacher');
    emit('update:activeTeacherTab', itemId.replace('teacher-', ''));
  } else {
    emit('update:currentSection', itemId);
    if (itemId === 'friends') emit('clear-unread');
  }
};

// 🔥 判斷當前項目是否為 Active 狀態
const isActive = (itemId) => {
  if (itemId.startsWith('admin-')) {
    return props.currentSection === 'admin' && props.activeAdminTab === itemId.replace('admin-', '');
  }
  if (itemId.startsWith('teacher-')) {
    return props.currentSection === 'teacher' && props.activeTeacherTab === itemId.replace('teacher-', '');
  }
  return props.currentSection === itemId;
};

// 登出邏輯
const triggerLogout = () => {
  isLogoutModalOpen.value = true;
};

const executeLogout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('登出失敗:', error);
    alert('登出時發生錯誤，請稍後再試！');
  }
};
</script>

<style scoped>
/* 隱藏原生捲軸，改用優雅的細捲軸 */
.sidebar-scroll::-webkit-scrollbar {
  width: 4px;
}
.sidebar-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.sidebar-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}
.sidebar-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 212, 170, 0.5);
}
</style>