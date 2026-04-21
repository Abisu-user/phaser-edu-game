<template>
  <div class="h-full w-full relative overflow-hidden bg-[#0a0e27]">
    
    <div v-if="currentView === 'lobby'" id="player-lobby" class="h-full w-full sidebar-wrapper" style="background: linear-gradient(135deg, #0a0e27 0%, #1a1a3e 50%, #0f1428 100%);">
      
      <div class="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div class="particle float-1" style="top:10%;left:15%;background:#ffbb33;animation-delay:0s;"></div>
        <div class="particle float-2" style="top:20%;left:75%;background:#00d4aa;animation-delay:0.8s;"></div>
        <div class="particle float-3" style="top:60%;left:85%;background:#ff6b6b;animation-delay:1.5s;"></div>
        <div class="particle float-1" style="top:80%;left:25%;background:#a78bfa;animation-delay:0.3s;"></div>
        <div class="particle float-2" style="top:45%;left:50%;background:#ffbb33;animation-delay:1.2s;"></div>
      </div>

      <DashboardSidebar 
        :isCollapsed="isSidebarCollapsed"
        :currentLevel="currentLevel"
        :playerName="playerName"
        :playerAvatarUrl="playerAvatarUrl"  
        :playerRole="playerRole"
        :hasUnread="hasUnreadMessages"
        v-model:currentSection="currentSection"
        v-model:activeAdminTab="activeAdminTab"
        v-model:activeTeacherTab="activeTeacherTab"
        @toggle="isSidebarCollapsed = !isSidebarCollapsed"
        @clear-unread="hasUnreadMessages = false"
      />

      <transition enter-active-class="transition ease-out duration-300" enter-from-class="transform translate-y-10 opacity-0" enter-to-class="transform translate-y-0 opacity-100" leave-active-class="transition ease-in duration-200" leave-from-class="transform translate-y-0 opacity-100" leave-to-class="transform translate-y-10 opacity-0">
        <div v-if="globalNotification" class="fixed bottom-10 right-10 bg-[#1a1a3e] border border-[#00d4aa] rounded-xl p-4 shadow-[0_0_20px_rgba(0,212,170,0.4)] z-50 flex flex-col min-w-[250px] animate-bounce">
          <div class="flex items-center space-x-2 mb-1">
            <span class="text-xl">💬</span>
            <span class="text-[#00d4aa] font-bold text-lg">{{ globalNotification.title }}</span>
          </div>
          <div class="text-white/90 truncate max-w-[200px]">{{ globalNotification.content }}</div>
        </div>
      </transition>

      <div class="main-content">
        <DashboardHeader 
          :playerName="playerName"
          :currentLevel="currentLevel"
          :currentXP="currentXP"
          :xpPerLevel="xpPerLevel"
        />

        <SystemAnnouncement />

        <div class="relative z-10 max-w-7xl mx-auto px-6 py-12 w-full">
          
          <LobbySection 
            v-show="currentSection === 'lobby'" 
            :xpPercent="xpPercent"
            :lastPlayed="lastPlayed"
            :clearedLevelsCount="clearedLevelsCount"
            :dailyQuests="dailyQuests"  
            :badges="badges"         
            @claim-quest="claimQuest"            
            @trigger-level-up="triggerLevelUp"
            @continue-game="startLevel"
            @go-to-achievements="currentSection = 'achievements'"
          />

          <CoursesSection 
            v-show="currentSection === 'courses'" 
            :courseProgress="courseProgress"
            @open-level-selector="openLevelSelector"
          />

          <ClassSection v-show="currentSection === 'class'" />

          <FriendsSection v-show="currentSection === 'friends'" />

          <AchievementsSection
            v-show="currentSection === 'achievements'" 
            :badges="badges"
          />

          <div v-show="currentSection === 'leaderboard'">排行榜即將推出...</div>
          
          <ProfileSection 
            v-show="currentSection === 'profile'"
            :playerId="currentId"
            :playerName="playerName"
            :playerEmail="playerEmail"
            :currentLevel="currentLevel"
            :currentXP="currentXP"
            :xpPerLevel="xpPerLevel"
            :clearedLevelsCount="clearedLevelsCount"
            :badges="badges"
            :joinDate="playerJoinDate"
            :playerRole="playerRole"
            :playerAvatarUrl="playerAvatarUrl"  
            @update-avatar="(newUrl) => playerAvatarUrl = newUrl"
            @update-name="handleNameUpdate"
          />
          
          <div v-show="currentSection === 'settings'">設定即將推出...</div>

          <HelpSection v-show="currentSection === 'help'" />

          <AdminSection 
            v-if="playerRole === 'admin'" 
            v-show="currentSection === 'admin'" 
            :currentTab="activeAdminTab" 
          />

          <TeacherSection
            v-if="playerRole === 'teacher'"
            v-show="currentSection === 'teacher'"
            :currentTab="activeTeacherTab"
          />

        </div>

        <footer class="relative z-10 px-6 py-8 text-center border-t mt-auto" style="border-color:#1e1e2e;">
          <p class="text-sm" style="color:#a0a0b8;">祝你學習愉快！需要幫助？<a href="#" style="color:#00d4aa;text-decoration:none;">查看教程</a></p>
        </footer>
      </div>

      <div class="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        <transition-group name="toast">
          <div v-for="toast in toastNotifications" :key="toast.id" 
              @click="currentSection = 'friends'"
              class="bg-[#151932]/95 backdrop-blur-md border border-[#00d4aa]/40 p-4 rounded-2xl shadow-[0_10px_40px_rgba(0,212,170,0.3)] flex items-center gap-4 w-80 transform transition-all pointer-events-auto cursor-pointer hover:scale-105 hover:border-[#00d4aa]">
            
            <img :src="toast.avatar || '/default-avatar.png'" class="w-12 h-12 rounded-full border-2 border-[#00d4aa]/50 object-cover flex-shrink-0" />
            
            <div class="flex-1 overflow-hidden">
              <div class="text-[#00d4aa] font-bold text-sm truncate flex justify-between items-center">
                {{ toast.senderName }}
                <span class="text-white/40 text-[10px] font-normal">剛剛</span>
              </div>
              <div class="text-white text-sm truncate mt-0.5">{{ toast.content }}</div>
            </div>

            <div class="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></div>
          </div>
        </transition-group>
      </div>

    </div>

    <GameLevel
      v-if="currentView === 'game'"
      :key="`${currentCourseId}-${selectedLevelId}`"
      class="absolute inset-0 z-50 bg-[#0a0e27]"
      :courseId="currentCourseId"
      :levelId="selectedLevelId"
      @back="handleBackToLobby"         
      @next-level="handleGoToNextLevel" 
    />

    <LevelUpModal 
      :isOpen="isLevelUpModalOpen"
      :currentLevel="currentLevel"
      @close="isLevelUpModalOpen = false"
    />

    <CourseLevelModal 
      :isOpen="isLevelModalOpen"
      :courseTitle="selectedCourse?.title"
      :courseIcon="selectedCourse?.icon"
      :unlockedLevel="currentLevel"
      :levels-list="levelsList"
      @close="isLevelModalOpen = false"
      @select-level="handleLevelSelect"
    />

    <ConfirmModal 
      :isOpen="isForceLogoutModalOpen"
      title="🚨 系統緊急維護中"
      message="管理員已開啟系統維護模式，為了確保您的資料安全，您將被強制登出。請稍後再重新登入！"
      confirmText="我知道了 (自動登出)"
      cancelText="" 
      icon="🚧"
      :isDanger="true"
      @confirm="executeForceLogout"
      @cancel="executeForceLogout" 
    />

    <LevelDesigner 
      v-if="currentSection === 'level-designer'" 
      @preview="handlePreview" 
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { supabase } from '../../supabase';
import CourseLevelModal from '../level/CourseLevelModal.vue';
import DashboardSidebar from './DashboardSidebar.vue';
import DashboardHeader from './DashboardHeader.vue';
import LevelUpModal from './LevelUpModal.vue';
import { BADGE_LIST } from '../../game/config/badges';
import { levels as staticLevels } from '../../game/scenes/LevelConfig.js';

import LobbySection from './sections/LobbySection.vue';
import CoursesSection from './sections/CoursesSection.vue';
import AchievementsSection from './sections/AchievementsSection.vue';
import ProfileSection from './sections/ProfileSection.vue';
import HelpSection from './sections/HelpSection.vue';
import AdminSection from './sections/AdminSection.vue';
import TeacherSection from './sections/TeacherSection.vue';
import FriendsSection from './sections/FriendsSection.vue';
import SystemAnnouncement from './sections/admin/SystemAnnouncement.vue';
import ConfirmModal from '../common/ConfirmModal.vue'; 
import GameLevel from '../level/GameLevel.vue';
import ClassSection from './sections/ClassSection.vue';

// --- 狀態管理區 ---
const currentView = ref('lobby'); // 'lobby' 或 'game'
const currentCourseId = ref('');
const selectedLevelId = ref(1);
const levelsList = ref([]);
const globalNotification = ref(null); // 補上遺漏的全域通知

const playerName = ref('遊客模式');
const courseProgress = ref({ python: 0, javascript: 0 });
const currentLevel = ref(1);
const currentId = ref('');
const currentXP = ref(0);
const xpPerLevel = ref(1000);
const currentTotalXP = ref(0);
const isSidebarCollapsed = ref(false);
const currentSection = ref('lobby'); 
const isLevelUpModalOpen = ref(false);
const isLevelModalOpen = ref(false);
const selectedCourse = ref(null);
const lastPlayed = ref(null);
const clearedLevelsCount = ref(0);
const dailyQuests = ref([]);
const playerEmail = ref('');
const playerJoinDate = ref(''); 
const playerAvatarUrl = ref('');
const consecutiveDays = ref(1);
const playerRole = ref('');
const toastNotifications = ref([]);
const hasUnreadMessages = ref(false);
const activeAdminTab = ref('system');
const isForceLogoutModalOpen = ref(false);
const activeTeacherTab = ref('overview');

const emit = defineEmits(['enter-game', 'logout']);

// 訂閱事件管理
let globalMessageSubscription = null;
let heartbeatInterval = null;
let maintenanceSubscription = null;

// --- 邏輯函數區 ---
const handleNameUpdate = (newName) => playerName.value = newName; 

const executeForceLogout = async () => {
  await supabase.auth.signOut();
  window.location.reload(); 
};

const sendHeartbeat = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('profiles').update({ last_login_at: new Date().toISOString() }).eq('id', user.id);
  } catch (error) {
    console.error('心跳發送失敗:', error);
  }
};

const xpPercent = computed(() => {
  return Math.min(Math.floor((currentXP.value / xpPerLevel.value) * 100), 100);
});


// 🌟 開啟關卡選單並載入資料
const openLevelSelector = async (course) => {
  currentCourseId.value = course.id;
  selectedCourse.value = course;
  
  // 1. 強制向資料庫抓取最新的過關進度，確保資料絕對同步
  await fetchCourseProgress(); 

  // 2. 取得該課程目前「已通關的最高關卡」，若資料庫沒紀錄就是 0
  const maxCompletedLevel = courseProgress.value[course.id] || 0;
  
  // 3. 允許挑戰的最高關卡 = 已通關最高關卡 + 1
  const highestUnlocked = maxCompletedLevel + 1;

  if (course.id === 'python') {
    levelsList.value = staticLevels.map(l => ({
      level_number: l.id,
      title: l.title,
      is_completed: l.id <= maxCompletedLevel, // 小於等於最高通關紀錄，打勾
      is_locked: l.id > highestUnlocked        // 大於 (最高紀錄+1) 的全部上鎖
    }));
  } else if (course.id === 'javascript') {
    const { data, error } = await supabase
      .from('levels')
      .select('level_number, title')
      .order('level_number', { ascending: true });
    
    if (!error && data) {
      levelsList.value = data.map((l) => ({
        level_number: l.level_number,
        title: l.title,
        // 注意：這裡改用資料庫真實的 level_number 來比對，而不是 index
        is_completed: l.level_number <= maxCompletedLevel, 
        is_locked: l.level_number > highestUnlocked
      }));
    } else {
      console.error('獲取資料庫關卡失敗:', error);
    }
  }
  isLevelModalOpen.value = true;
};

// 🌟 點擊關卡：正式進入遊戲
const handleLevelSelect = (levelId) => {
  isLevelModalOpen.value = false;     
  selectedLevelId.value = levelId;    
  currentView.value = 'game'; // 正確切換到遊戲畫面
  console.log(`[🚀 系統] 切換至遊戲模式 - 課程: ${currentCourseId.value}, 關卡: ${levelId}`);
};

const triggerLevelUp = () => isLevelUpModalOpen.value = true;
const startLevel = (data) => emit('enter-game', data);

const addExperience = async (gainAmount) => {
  currentXP.value += gainAmount;
  currentTotalXP.value += gainAmount; 

  let newLevel = currentLevel.value;
  let newXP = currentXP.value;

  const levelsGained = Math.floor(newXP / xpPerLevel.value);
  if (levelsGained > 0) {
    newLevel += levelsGained;
    newXP = newXP % xpPerLevel.value; 
    currentLevel.value = newLevel;
    currentXP.value = newXP;
    
    isLevelUpModalOpen.value = true;
    setTimeout(() => { isLevelUpModalOpen.value = false; }, 5000);
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({
        xp: newXP,
        level: newLevel,
        total_exp: currentTotalXP.value 
      }).eq('id', user.id);
    }
  } catch (err) {
    console.error('更新經驗值失敗:', err);
  }
};

const handleBackToLobby = async () => {
  currentView.value = 'lobby';
  await fetchCourseProgress(); // 重新計算過關數 (解鎖下一關)
  await fetchLobbyData();      // 重新取得最新 XP 和等級
};

const handleGoToNextLevel = async () => {
  // 1. 同步最新狀態
  await fetchCourseProgress();
  await fetchLobbyData();
  
  // 2. 切換到下一關 (改變 selectedLevelId 會自動重啟 GameLevel 組件)
  selectedLevelId.value = Number(selectedLevelId.value) + 1;
  console.log(`[🚀 系統] 前往下一關 - 課程: ${currentCourseId.value}, 關卡: ${selectedLevelId.value}`);
};

const handlePreview = (levelNumber) => {
  currentCourseId.value = 'javascript'; // 強制設定為資料庫課程
  selectedLevelId.value = levelNumber;  // 設定要預覽的關卡編號
  currentView.value = 'game';           // 🔥 切換到遊戲畫面！
};

// --- 成就與每日任務 ---
const initDailyQuests = () => {
  const today = new Date().toISOString().split('T')[0];
  const storedData = JSON.parse(localStorage.getItem('code_quest_daily') || '{}');

  const defaultQuests = [
    { id: 'login', title: '每日登入報到', target: 1, progress: 1, xp: 50, isClaimed: false, desc: '已完成登入' },
    { id: 'pass_levels', title: '突破自我極限', target: 3, progress: 0, xp: 300, isClaimed: false, desc: '通過 3 個新關卡' },
    { id: 'perfect_clear', title: '完美通關', target: 1, progress: 0, xp: 150, isClaimed: false, desc: '獲得 3 顆星' }
  ];

  if (storedData.date === today) {
    dailyQuests.value = storedData.quests;
  } else {
    dailyQuests.value = defaultQuests;
    localStorage.setItem('code_quest_daily', JSON.stringify({ date: today, quests: defaultQuests }));
  }
};

const badges = computed(() => {
  const playerStats = { clearedLevelsCount: clearedLevelsCount.value, currentTotalXP: currentTotalXP.value, currentLevel: currentLevel.value };
  return BADGE_LIST.map(badge => ({
    id: badge.id, icon: badge.icon, name: badge.name, desc: badge.desc, target: badge.target,
    current: badge.getCurrent(playerStats), isUnlocked: badge.checkUnlock(playerStats)
  }));
});

const claimQuest = async (questId) => {
  const quest = dailyQuests.value.find(q => q.id === questId);
  if (!quest || quest.isClaimed || quest.progress < quest.target) return;

  quest.isClaimed = true;
  await addExperience(quest.xp);
  
  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem('code_quest_daily', JSON.stringify({ date: today, quests: dailyQuests.value }));
};

// --- 抓取與更新使用者資料 ---
const fetchLobbyData = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    playerEmail.value = user.email;
    playerJoinDate.value = user.created_at;

    const { count } = await supabase.from('user_progress').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
    clearedLevelsCount.value = count || 0;

    const { data: profile } = await supabase.from('profiles').select('id, xp, level, username, avatar_url, role, total_exp, last_login_at, consecutive_days').eq('id', user.id).single();

    if (profile) {
      currentId.value = profile.id || '';
      currentXP.value = profile.xp || 0;
      currentLevel.value = profile.level || 1;
      currentTotalXP.value = profile.total_exp || 0;
      playerAvatarUrl.value = profile.avatar_url || ''; 
      playerName.value = profile.username || '遊客模式';
      playerRole.value = profile.role || 'student';

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let currentStreak = profile.consecutive_days || 1;
      let shouldUpdateDB = false;

      if (profile.last_login_at) {
        const lastLoginDate = new Date(profile.last_login_at);
        lastLoginDate.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil(Math.abs(today - lastLoginDate) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) { currentStreak += 1; shouldUpdateDB = true; } 
        else if (diffDays > 1) { currentStreak = 1; shouldUpdateDB = true; }
      } else {
        shouldUpdateDB = true;
      }

      consecutiveDays.value = currentStreak;

      if (shouldUpdateDB) {
        await supabase.from('profiles').update({ last_login_at: new Date().toISOString(), consecutive_days: currentStreak }).eq('id', user.id);
      }
    }
  } catch (err) {
    console.error('fetchLobbyData 錯誤：', err);
  }
};

const fetchCourseProgress = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { data, error } = await supabase.from('user_progress').select('course_id, level_id').eq('user_id', user.id);

  if (data && !error) {
    const progressMap = { python: 0, javascript: 0 };
    data.forEach(record => progressMap[record.course_id] = Math.max(progressMap[record.course_id] || 0, record.level_id));
    courseProgress.value = progressMap;
  }
};

const refreshUserData = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) playerEmail.value = user.email; 
  } catch (err) {
    console.error('更新資料失敗:', err.message);
  }
};

let lastCheckTime = 0;
const handleUserInteraction = () => {
  const now = Date.now();
  // 🌟 優化效能：將後台連線冷卻時間改為 60 秒，避免狂點畫面導致 Supabase 崩潰
  if (now - lastCheckTime > 60000) {
    lastCheckTime = now;
    refreshUserData();
  }
};

const handleVisibilityChange = () => { if (document.visibilityState === 'visible') refreshUserData(); };

// --- 監聽與生命週期 ---
onMounted(() => {
  fetchCourseProgress();
  fetchLobbyData();
  initDailyQuests();
  sendHeartbeat();
  heartbeatInterval = setInterval(sendHeartbeat, 60 * 1000);
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('click', handleUserInteraction);

  // 監聽維護模式
  maintenanceSubscription = supabase.channel('custom-maintenance-channel')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'system_settings' }, (payload) => {
        if (payload.new?.is_maintenance === true && playerRole.value !== 'admin') {
          isForceLogoutModalOpen.value = true;
        }
    }).subscribe();
});

// 🌟 修復記憶體流失：合併到 Watch 來確保有了 UserID 再進行訂閱
watch(() => currentId.value, (newId) => {
  if (newId) {
    globalMessageSubscription = supabase.channel('global-messages')
      .on('postgres_changes', { 
        event: 'INSERT', schema: 'public', table: 'direct_messages',
        filter: `receiver_id=eq.${newId}` 
      }, async (payload) => {
        if (currentSection.value !== 'friends') {
          hasUnreadMessages.value = true;
          const { data: sender } = await supabase.from('profiles').select('username, avatar_url').eq('id', payload.new.sender_id).single();
          if (sender) {
            const notifId = Date.now();
            toastNotifications.value.push({ id: notifId, senderName: sender.username, avatar: sender.avatar_url, content: payload.new.content });
            setTimeout(() => { toastNotifications.value = toastNotifications.value.filter(n => n.id !== notifId); }, 5000);
          }
        }
      }).subscribe();
  }
}, { immediate: true });

onUnmounted(() => {
  if (heartbeatInterval) clearInterval(heartbeatInterval);
  if (globalMessageSubscription) supabase.removeChannel(globalMessageSubscription);
  if (maintenanceSubscription) supabase.removeChannel(maintenanceSubscription);
  document.removeEventListener('visibilitychange', handleVisibilityChange);
  window.removeEventListener('click', handleUserInteraction);
});
</script>

<style scoped>
.sidebar-wrapper { display: flex; height: 100%; width: 100%; }
.main-content { flex: 1; overflow-y: auto; display: flex; flex-direction: column; }
.main-content::-webkit-scrollbar { width: 6px; }
.main-content::-webkit-scrollbar-track { background: transparent; }
.main-content::-webkit-scrollbar-thumb { background: #444455; border-radius: 3px; }

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}
@keyframes particle {
  0% { transform: translateY(0) scale(1); opacity: 0.7; }
  100% { transform: translateY(-60px) scale(0); opacity: 0; }
}

.float-1 { animation: float 3s ease-in-out infinite; }
.float-2 { animation: float 3.5s ease-in-out infinite 0.5s; }
.float-3 { animation: float 4s ease-in-out infinite 1s; }
.particle { position: absolute; width: 6px; height: 6px; border-radius: 50%; animation: particle 2s ease-out infinite; }

.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>