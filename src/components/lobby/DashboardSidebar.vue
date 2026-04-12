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

    <div class="flex-1 overflow-y-auto sidebar-scroll px-3 py-2 space-y-1">
      
      <div 
        v-for="item in menuItems" 
        :key="item.id" 
        class="group flex items-center rounded-xl cursor-pointer transition-all duration-300 relative overflow-hidden"
        :class="[
          currentSection === item.id 
            ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/30 shadow-[0_0_15px_rgba(0,212,170,0.15)]' 
            : 'text-[#a0a0b8] border border-transparent hover:bg-white/5 hover:text-white hover:border-white/10',
          isCollapsed ? 'p-3 justify-center' : 'px-4 py-3 gap-4'
        ]"
        @click="$emit('update:currentSection', item.id)"
        :title="isCollapsed ? item.label : ''"
      >
        <div v-if="currentSection === item.id" class="absolute left-0 top-0 bottom-0 w-1 bg-[#00d4aa] shadow-[0_0_10px_#00d4aa]"></div>
        
        <div class="text-xl group-hover:scale-110 transition-transform duration-300">{{ item.icon }}</div>
        <div v-if="!isCollapsed" class="font-medium tracking-wide whitespace-nowrap">{{ item.label }}</div>
      </div>

      <div class="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-4 mx-2"></div>
      
      <div 
        class="group flex items-center rounded-xl cursor-pointer transition-all duration-300"
        :class="[
          currentSection === 'settings' ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/30' : 'text-[#a0a0b8] border border-transparent hover:bg-white/5 hover:text-white hover:border-white/10',
          isCollapsed ? 'p-3 justify-center' : 'px-4 py-3 gap-4'
        ]"
        @click="$emit('update:currentSection', 'settings')"
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
        @click="$emit('update:currentSection', 'help')"
        :title="isCollapsed ? '幫助' : ''"
      >
        <div class="text-xl group-hover:scale-110 transition-transform duration-300">❓</div>
        <div v-if="!isCollapsed" class="font-medium tracking-wide whitespace-nowrap">幫助</div>
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
  currentLevel: [Number, String],
  playerName: String,
  playerAvatarUrl: String,
  playerRole: { type: String, default: 'student' }
});

defineEmits(['toggle', 'update:currentSection']);

const isLogoutModalOpen = ref(false);

const baseMenuItems = [
  { id: 'lobby', label: '大廳', icon: '🏠' },
  { id: 'courses', label: '課程', icon: '📚' },
  { id: 'achievements', label: '成就', icon: '🎖️' },
  { id: 'leaderboard', label: '排行榜', icon: '🏆' },
  { id: 'profile', label: '個人檔案', icon: '👤' }
];

const menuItems = computed(() => {
  if (props.playerRole === 'admin') {
    return [
      { id: 'admin', label: '管理後台', icon: '🛠️' }
    ];
  }
  const items = [...baseMenuItems];
  if (props.playerRole === 'teacher') {
    // 將老師專屬的選項推入陣列中
    items.push({ id: 'teacher', label: '教師中心', icon: '👨‍🏫' });
  }
  return items;
});

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