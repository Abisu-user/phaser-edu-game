<template>
  <div class="h-full w-full relative overflow-hidden bg-[#0a0e27]">
    
    <div v-if="currentView === 'lobby'" id="player-lobby" class="h-full w-full flex flex-col lg:flex-row relative" style="background: linear-gradient(135deg, #0a0e27 0%, #1a1a3e 50%, #0f1428 100%);">
      
      <div class="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div class="particle float-1" style="top:10%;left:15%;background:#ffbb33;animation-delay:0s;"></div>
        <div class="particle float-2" style="top:20%;left:75%;background:#00d4aa;animation-delay:0.8s;"></div>
        <div class="particle float-3" style="top:60%;left:85%;background:#ff6b6b;animation-delay:1.5s;"></div>
        <div class="particle float-1" style="top:80%;left:25%;background:#a78bfa;animation-delay:0.3s;"></div>
        <div class="particle float-2" style="top:45%;left:50%;background:#ffbb33;animation-delay:1.2s;"></div>
      </div>

      <div class="hidden lg:block shrink-0 relative z-20">
        <DashboardSidebar 
          :isCollapsed="isSidebarCollapsed"
          :currentLevel="currentLevel"
          :playerName="playerName"
          :playerAvatarUrl="playerAvatarUrl"  
          :playerRole="playerRole"
          :hasUnread="hasUnreadMessages"
          :currentTitle="currentTitle" 
          v-model:currentSection="currentSection"
          v-model:activeAdminTab="activeAdminTab"
          v-model:activeTeacherTab="activeTeacherTab"
          v-model:activeClassTab="activeClassTab"
          @toggle="isSidebarCollapsed = !isSidebarCollapsed"
          @clear-unread="hasUnreadMessages = false"
        />
      </div>

      <transition enter-active-class="transition ease-out duration-300" enter-from-class="transform translate-y-10 opacity-0" enter-to-class="transform translate-y-0 opacity-100" leave-active-class="transition ease-in duration-200" leave-from-class="transform translate-y-0 opacity-100" leave-to-class="transform translate-y-10 opacity-0">
        <div v-if="globalNotification" class="fixed bottom-24 lg:bottom-10 right-6 lg:right-10 bg-[#1a1a3e] border border-[#00d4aa] rounded-xl p-4 shadow-[0_0_20px_rgba(0,212,170,0.4)] z-[100] flex flex-col min-w-[250px] animate-bounce">
          <div class="flex items-center space-x-2 mb-1">
            <span class="text-xl">💬</span>
            <span class="text-[#00d4aa] font-bold text-lg">{{ globalNotification.title }}</span>
          </div>
          <div class="text-white/90 truncate max-w-[200px]">{{ globalNotification.content }}</div>
        </div>
      </transition>

      <div class="main-content flex-1 flex flex-col h-full overflow-y-auto overflow-x-hidden relative z-10 pb-20 lg:pb-0">
        
        <div class="hidden lg:block">
          <DashboardHeader 
            :playerName="playerName"
            :currentLevel="currentLevel"
            :currentXP="currentXP"
            :xpPerLevel="xpPerLevel"
          />
        </div>

        <header class="lg:hidden shrink-0 bg-[#1a1a3e]/90 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between shadow-md sticky top-0 z-50">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-[0_0_10px_rgba(255,187,51,0.3)]" style="background: linear-gradient(135deg, #ffbb33, #ff8800);">⚡</div>
            <h2 class="text-base sm:text-lg font-black tracking-wide text-white" style="font-family: 'Fredoka', sans-serif;">Code Quest</h2>
          </div>
          
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-1.5 bg-[#0a0e27] px-2.5 py-1.5 rounded-full border border-white/10 shadow-inner" @click="currentSection = 'profile'">
              <span class="text-xs font-black text-[#ffbb33] tracking-wide">Lv.{{ currentLevel }}</span>
              <div class="w-5 h-5 rounded-full overflow-hidden ml-1 border border-[#ffbb33]/50">
                <img :src="playerAvatarUrl || `https://ui-avatars.com/api/?name=${profile?.username || 'User'}&background=random`" class="w-full h-full object-cover" />
              </div>
            </div>
            
            <button @click="triggerLogout" class="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 active:scale-95 transition-all border border-red-500/30 shadow-inner" title="登出">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>
        </header>

        <SystemAnnouncement />

        <div class="block lg:hidden px-4 pt-4 -mb-2">
          <div class="flex items-start gap-3 p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 shadow-inner">
            <span class="text-xl mt-0.5">🖥️</span>
            <p class="text-[12px] text-red-100/90 leading-relaxed font-medium">
              <strong class="text-[#ffbb33]">手機輕量模式</strong><br>
              目前僅開放社交與狀態查詢，<span class="text-white font-bold underline decoration-red-500 underline-offset-2">出發前往地下城請使用電腦</span>以進行程式碼編寫。
            </p>
          </div>
        </div>

        <div class="relative z-10 max-w-7xl mx-auto px-4 lg:px-6 py-6 lg:py-12 w-full flex-1">
          
          <LobbySection 
            v-show="currentSection === 'lobby'" 
            :xpPercent="xpPercent"
            :lastPlayed="lastPlayed"
            :clearedLevelsCount="clearedLevelsCount"
            :pythonCompleted="courseProgress.python"
            :totalLevels="staticLevels.length"
            :dailyQuests="dailyQuests"  
            :badges="badges"         
            :pinnedBadges="pinnedBadges"
            @claim-quest="claimQuest"            
            @trigger-level-up="triggerLevelUp"
            @continue-game="startLevel"
            @go-to-achievements="currentSection = 'achievements'"
            @save-pinned="handleSavePinnedBadges"
          />

          <CoursesSection 
            v-show="currentSection === 'courses'" 
            :courseProgress="courseProgress"
            @open-level-selector="openLevelSelector"
            @open-endless-mode="router.push('/endless-tower')"
          />

          <EndlessLevel 
              v-if="showEndlessMode" 
              @exit="handleExitEndlessMode" 
          />

          <div v-show="currentSection === 'class'">
            <ClassSection v-if="activeClassTab === 'home'" />
            <ClassPolls v-if="activeClassTab === 'polls'" />
            <ClassSurveys v-if="activeClassTab === 'surveys'" />
          </div>

          <FriendsSection v-show="currentSection === 'friends'" />

          <AchievementsSection
            v-show="currentSection === 'achievements'" 
            :badges="badges"
            :currentTitle="currentTitle"
            :pinnedBadges="pinnedBadges"
            @equip="handleEquipTitle"
          />

          <LeaderboardSection 
            v-if="currentSection === 'leaderboard'" 
            :currentUserId="currentUser?.id" 
          />

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
          
          <div v-show="currentSection === 'settings'" class="text-center py-20 text-[#a0a0b8] font-bold">設定即將推出...</div>

          <HelpSection v-show="currentSection === 'help'" />

          <AdminSection 
            v-if="playerRole === 'admin'" 
            v-show="currentSection === 'admin'" 
            :currentTab="activeAdminTab" 
          />

          <TeacherSection 
            v-if="playerRole === 'teacher' && currentSection === 'teacher'"
            :currentTab="activeTeacherTab"
            :playerRole="playerRole"
          />

        </div>

        <footer class="hidden lg:block relative z-10 px-6 py-8 text-center border-t mt-auto" style="border-color:#1e1e2e;">
          <p class="text-sm" style="color:#a0a0b8;">祝你學習愉快！需要幫助？<a href="#" style="color:#00d4aa;text-decoration:none;">查看教程</a></p>
        </footer>
      </div>

      <nav class="lg:hidden fixed bottom-0 left-0 w-full bg-[#1a1a3e]/95 backdrop-blur-md border-t border-white/10 flex justify-between items-center z-[90] shadow-[0_-5px_20px_rgba(0,0,0,0.5)] pb-[env(safe-area-inset-bottom,0px)] px-1">
        <button @click="currentSection = 'lobby'" :class="['flex-1 py-3 flex flex-col items-center gap-1 transition-colors', currentSection === 'lobby' || currentSection === 'courses' ? 'text-[#ffbb33]' : 'text-[#a0a0b8]']">
          <span class="text-[20px] drop-shadow-md leading-none">🏰</span>
          <span class="text-[10px] font-black tracking-wider">大廳</span>
        </button>
        <button @click="currentSection = 'leaderboard'" :class="['flex-1 py-3 flex flex-col items-center gap-1 transition-colors', currentSection === 'leaderboard' ? 'text-[#ffbb33]' : 'text-[#a0a0b8]']">
          <span class="text-[20px] drop-shadow-md leading-none">🏆</span>
          <span class="text-[10px] font-black tracking-wider">天梯</span>
        </button>
        <button @click="currentSection = 'friends'" :class="['relative flex-1 py-3 flex flex-col items-center gap-1 transition-colors', currentSection === 'friends' ? 'text-[#ffbb33]' : 'text-[#a0a0b8]']">
          <span class="text-[20px] drop-shadow-md leading-none">💬</span>
          <span class="text-[10px] font-black tracking-wider">社交</span>
          <span v-if="hasUnreadMessages" class="absolute top-2 right-[25%] w-2 h-2 bg-red-500 rounded-full border border-[#1a1a3e] animate-pulse"></span>
        </button>
        <button @click="currentSection = 'achievements'" :class="['flex-1 py-3 flex flex-col items-center gap-1 transition-colors', currentSection === 'achievements' ? 'text-[#ffbb33]' : 'text-[#a0a0b8]']">
          <span class="text-[20px] drop-shadow-md leading-none">🏅</span>
          <span class="text-[10px] font-black tracking-wider">成就</span>
        </button>
        <button @click="currentSection = 'profile'" :class="['flex-1 py-3 flex flex-col items-center gap-1 transition-colors', currentSection === 'profile' ? 'text-[#ffbb33]' : 'text-[#a0a0b8]']">
          <span class="text-[20px] drop-shadow-md leading-none">🧙‍♂️</span>
          <span class="text-[10px] font-black tracking-wider">狀態</span>
        </button>
      </nav>

      <div class="fixed bottom-24 lg:bottom-6 right-4 lg:right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        <transition-group name="toast">
          <div v-for="toast in toastNotifications" :key="toast.id" 
              @click="currentSection = 'friends'"
              class="bg-[#151932]/95 backdrop-blur-md border border-[#00d4aa]/40 p-4 rounded-2xl shadow-[0_10px_40px_rgba(0,212,170,0.3)] flex items-center gap-4 w-72 lg:w-80 transform transition-all pointer-events-auto cursor-pointer hover:scale-105 hover:border-[#00d4aa]">
            
            <img :src="toast.avatar || `https://ui-avatars.com/api/?name=${profile?.username || 'User'}&background=random`" class="w-10 h-10 lg:w-12 lg:h-12 rounded-full border-2 border-[#00d4aa]/50 object-cover flex-shrink-0" />
            
            <div class="flex-1 overflow-hidden">
              <div class="text-[#00d4aa] font-bold text-sm truncate flex justify-between items-center">
                {{ toast.senderName }}
                <span class="text-white/40 text-[10px] font-normal">剛剛</span>
              </div>
              <div class="text-white text-xs lg:text-sm truncate mt-0.5">{{ toast.content }}</div>
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

    <ConfirmModal 
      :isOpen="isLogoutModalOpen"
      title="確定要登出？"
      message="登出將會結束您目前的冒險連練，您的進度已經安全儲存。期待您的再次歸來！"
      confirmText="確認登出"
      cancelText="不，我點錯了" 
      icon="🚪"
      :isDanger="true"
      @confirm="executeLogout"
      @cancel="isLogoutModalOpen = false" 
    />

    <LevelDesigner 
      v-if="currentSection === 'level-designer'" 
      @preview="handlePreview" 
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, defineAsyncComponent } from 'vue';
import { supabase } from '../../supabase';
import CourseLevelModal from '../level/CourseLevelModal.vue';
import DashboardSidebar from './DashboardSidebar.vue';
import DashboardHeader from './DashboardHeader.vue';
import LevelUpModal from './LevelUpModal.vue';
import { BADGE_LIST } from '../../game/config/badges';
import { levels as staticLevels } from '../../game/scenes/LevelConfig.js';
import { useRouter } from 'vue-router';

import LobbySection from './sections/LobbySection.vue';
import CoursesSection from './sections/CoursesSection.vue';
import AchievementsSection from './sections/AchievementsSection.vue';
import ProfileSection from './sections/ProfileSection.vue';
import AdminSection from './sections/AdminSection.vue';
import TeacherSection from './sections/TeacherSection.vue';
import FriendsSection from './sections/FriendsSection.vue';
import SystemAnnouncement from './sections/admin/SystemAnnouncement.vue';
import ConfirmModal from '../common/ConfirmModal.vue'; 
import ClassSection from './sections/ClassSection.vue';
import LeaderboardSection from './sections/LeaderboardSection.vue';
import LevelDesigner from './sections/admin/LevelDesigner.vue';
import ClassPolls from './sections/ClassPolls.vue';
import ClassSurveys from './sections/ClassSurveys.vue';

const GameLevel = defineAsyncComponent(() => import('../level/GameLevel.vue'));
const EndlessLevel = defineAsyncComponent(() => import('../roguelike/EndlessLevel.vue'));

// --- 狀態管理區 ---
const currentView = ref('lobby'); // 'lobby' 或 'game'
const currentCourseId = ref('');
const selectedLevelId = ref(1);
const levelsList = ref([]);
const globalNotification = ref(null); 
const showEndlessMode = ref(false);
const router = useRouter();

const playerName = ref('遊客模式');
const courseProgress = ref({ python: 0, javascript: 0 });
const currentLevel = ref(1);
const currentId = ref('');
const currentXP = ref(0);
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

const getAuthRole = (user) => {
  const role = user?.app_metadata?.role;
  return ['admin', 'teacher', 'student'].includes(role) ? role : 'student';
};
const activeTeacherTab = ref('overview');
const stat_points = ref(0);
const bestFloor = ref(0);
const coins = ref(0);
const currentTitle = ref('見習冒險者');
const pinnedBadges = ref([]);
const totalKills = ref(0);
const bossKills = ref(0);
const totalDeaths = ref(0);
const passiveCount = ref(0);
const isLogoutModalOpen = ref(false);
const activeClassTab = ref('home');
const xpPerLevel = computed(() => {
  return 1000 + (currentLevel.value - 1) * 500;
});

const emit = defineEmits(['enter-game', 'logout']);

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

// 訂閱事件管理
let globalMessageSubscription = null;
let heartbeatInterval = null;
let maintenanceSubscription = null;
// 🌟 新增：全域經驗值即時監聽器
let globalProfileChannel = null;

// --- 邏輯函數區 ---
const handleNameUpdate = (newName) => playerName.value = newName; 

const handleEquipTitle = async (newTitle) => {
  currentTitle.value = newTitle;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({ current_title: newTitle }).eq('id', user.id);
      
      const notifId = Date.now(); 

      toastNotifications.value.push({
        id: notifId,
        senderName: '🏆 榮耀殿堂',
        content: `成功佩戴新稱號：《${newTitle}》！`
      });

      setTimeout(() => {
        toastNotifications.value = toastNotifications.value.filter(n => n.id !== notifId);
      }, 5000);

    }
  } catch (err) {
    console.error('儲存稱號失敗:', err);
  }
};

const handleSavePinnedBadges = async (newPinnedArray) => {
  pinnedBadges.value = newPinnedArray; 

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({ pinned_badges: newPinnedArray }).eq('id', user.id);
      
      toastNotifications.value.push({
        id: Date.now(),
        senderName: '系統提示',
        content: '✅ 首頁榮譽展示牆已更新！'
      });
      setTimeout(() => { toastNotifications.value.shift(); }, 3000);
    }
  } catch (err) {
    console.error('更新展示徽章失敗:', err);
  }
};

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

const handleOpenEndlessMode = () => {
  showEndlessMode.value = true;
};

const handleExitEndlessMode = () => {
  showEndlessMode.value = false;
};

const xpPercent = computed(() => {
  return Math.min(Math.floor((currentXP.value / xpPerLevel.value) * 100), 100);
});

const openLevelSelector = async (course) => {
  currentCourseId.value = course.id;
  selectedCourse.value = course;
  
  levelsList.value = []; 
  isLevelModalOpen.value = true; 

  const maxCompletedLevel = courseProgress.value[course.id] || 0;
  const highestUnlocked = maxCompletedLevel + 1;

  if (course.id === 'python') {
    levelsList.value = staticLevels.map(l => ({
      level_number: l.id,
      title: l.title,
      is_completed: l.id <= maxCompletedLevel,
      is_locked: l.id > highestUnlocked        
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
        is_completed: l.level_number <= maxCompletedLevel, 
        is_locked: l.level_number > highestUnlocked
      }));
    } else {
      console.error('獲取資料庫關卡失敗:', error);
    }
  }
};

const handleLevelSelect = (levelId) => {
  isLevelModalOpen.value = false;     
  selectedLevelId.value = levelId;    
  currentView.value = 'game'; 
};

const triggerLevelUp = () => isLevelUpModalOpen.value = true;
const startLevel = (data) => emit('enter-game', data);

const addExperience = async (gainAmount) => {
  currentXP.value += gainAmount;
  currentTotalXP.value += gainAmount; 

  let newLevel = currentLevel.value;
  let newXP = currentXP.value;
  let levelsGained = 0;

  const getReqExp = (lvl) => 1000 + (lvl - 1) * 500;

  while (newXP >= getReqExp(newLevel)) {
    newXP -= getReqExp(newLevel);
    newLevel++;                
    levelsGained++;               
  }

  if (levelsGained > 0) {
    currentLevel.value = newLevel;
    currentXP.value = newXP;

    stat_points.value += (levelsGained * 2);
    
    isLevelUpModalOpen.value = true;
    setTimeout(() => { isLevelUpModalOpen.value = false; }, 5000);
  }

  // 寫入資料庫
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({
        xp: newXP,
        level: newLevel,
        total_exp: currentTotalXP.value,
        stat_points: stat_points.value 
      }).eq('id', user.id);
    }
  } catch (err) {
    console.error('更新經驗值失敗:', err);
  }
};

const handleBackToLobby = async () => {
  currentView.value = 'lobby';
  await fetchCourseProgress(); 
  await fetchLobbyData();      
};

const handleGoToNextLevel = async () => {
  await fetchCourseProgress();
  await fetchLobbyData();
  
  selectedLevelId.value = Number(selectedLevelId.value) + 1;
};

const handlePreview = (levelNumber) => {
  currentCourseId.value = 'javascript'; 
  selectedLevelId.value = levelNumber;  
  currentView.value = 'game';           
};

// --- 成就與每日任務 ---
const DAILY_QUEST_META = {
  login: { title: '每日登入', desc: '登入即可領取獎勵' },
  pass_levels: { title: '通關挑戰', desc: '今天完成 3 個關卡' },
  perfect_clear: { title: '完美通關', desc: '今天取得一個三星關卡' }
};

const loadDailyQuests = async () => {
  const { data, error } = await supabase.rpc('get_daily_quest_status');
  if (error) {
    console.error('Unable to load daily quests:', error);
    return;
  }

  dailyQuests.value = (data || []).map((quest) => ({
    id: quest.quest_id,
    title: DAILY_QUEST_META[quest.quest_id]?.title || quest.quest_id,
    desc: DAILY_QUEST_META[quest.quest_id]?.desc || '',
    target: quest.target,
    progress: quest.progress,
    xp: quest.awarded_xp,
    isClaimed: quest.is_claimed
  }));
};

const badges = computed(() => {
  const playerStats = { 
    clearedLevelsCount: clearedLevelsCount.value, 
    currentTotalXP: currentTotalXP.value, 
    currentLevel: currentLevel.value,
    bestFloor: bestFloor.value, 
    coins: coins.value       
  };

  return BADGE_LIST.map(badge => ({
    ...badge,
    current: badge.getCurrent(playerStats), 
    progress: badge.getCurrent(playerStats), 
    isUnlocked: badge.checkUnlock(playerStats)
  }));
});

const claimQuest = async (questId) => {
  const quest = dailyQuests.value.find(q => q.id === questId);
  if (!quest || quest.isClaimed || quest.progress < quest.target) return;

  const { data, error } = await supabase.rpc('claim_daily_quest_reward', { p_quest_id: questId });
  if (error) {
    console.error('Unable to claim daily quest reward:', error);
    toastNotifications.value.push({ id: Date.now(), senderName: '每日任務', content: error.message });
    setTimeout(() => { toastNotifications.value.shift(); }, 4000);
    await loadDailyQuests();
    return;
  }

  const reward = Array.isArray(data) ? data[0] : data;
  if (reward) {
    currentXP.value = reward.current_xp;
    currentLevel.value = reward.current_level;
    currentTotalXP.value = reward.total_xp;
    toastNotifications.value.push({ id: Date.now(), senderName: '每日任務', content: `已領取 ${reward.awarded_xp} XP` });
    setTimeout(() => { toastNotifications.value.shift(); }, 4000);
  }
  await loadDailyQuests();
};

// --- 🌟 資料抓取效能優化區 ---

const fetchLobbyData = async (prefetchedUser = null) => {
  try {
    const user = prefetchedUser || (await supabase.auth.getUser()).data.user;
    if (!user) return;

    playerEmail.value = user.email;
    playerJoinDate.value = user.created_at;

    const [progressRes, profileRes, towerRes] = await Promise.all([
      supabase.from('user_progress').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('profiles').select('id, xp, level, username, avatar_url, role, total_exp, last_login_at, consecutive_days, stat_points, current_title, pinned_badges, total_kills, boss_kills, total_deaths, passive_count').eq('id', user.id).single(),
      supabase.from('tower_lobby').select('max_hp, max_atk, best_floor, coins').eq('user_id', user.id).maybeSingle()
    ]);

    clearedLevelsCount.value = progressRes.count || 0;
    const profile = profileRes.data;
    const towerCheck = towerRes.data;

    if (profile) {
      currentId.value = profile.id || '';
      currentXP.value = profile.xp || 0;
      currentLevel.value = profile.level || 1;
      currentTotalXP.value = profile.total_exp || 0;
      playerAvatarUrl.value = profile.avatar_url || ''; 
      playerName.value = profile.username || '遊客模式';
      playerRole.value = getAuthRole(user);
      currentTitle.value = profile.current_title || '見習冒險者';
      pinnedBadges.value = profile.pinned_badges || [];
      totalKills.value = profile.total_kills || 0;
      bossKills.value = profile.boss_kills || 0;
      totalDeaths.value = profile.total_deaths || 0;
      passiveCount.value = profile.passive_count || 0;
      
      let shouldUpdateDB = false;

      if (towerCheck) {
        bestFloor.value = towerCheck.best_floor || 0;
        coins.value = towerCheck.coins || 0;
      }

      let currentPoints = profile.stat_points;
      const hasNeverUpgraded = !towerCheck || (towerCheck.max_hp === 100 && towerCheck.max_atk === 10);

      if ((currentPoints === 0 || currentPoints === null) && profile.level > 1 && hasNeverUpgraded) {
          currentPoints = (profile.level - 1) * 5;
          shouldUpdateDB = true;
          console.log(`🎁 補發點數：${currentPoints}`);
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let currentStreak = profile.consecutive_days || 1;

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
        await supabase.from('profiles').update({ 
          last_login_at: new Date().toISOString(), 
          consecutive_days: currentStreak,
          stat_points: currentPoints 
        }).eq('id', user.id);
      }
    }
  } catch (err) {
    console.error('fetchLobbyData 錯誤：', err);
  }
};

const fetchCourseProgress = async (prefetchedUser = null) => {
  const user = prefetchedUser || (await supabase.auth.getUser()).data.user;
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
  if (now - lastCheckTime > 60000) {
    lastCheckTime = now;
    refreshUserData();
  }
};

const handleVisibilityChange = () => { if (document.visibilityState === 'visible') refreshUserData(); };

// --- 監聽與生命週期 ---
onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    await Promise.all([
      fetchLobbyData(user),
      fetchCourseProgress(user)
    ]);
  }

  if (user) await loadDailyQuests();
  sendHeartbeat();
  heartbeatInterval = setInterval(sendHeartbeat, 60 * 1000);
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('click', handleUserInteraction);

  maintenanceSubscription = supabase.channel('custom-maintenance-channel')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'system_settings' }, (payload) => {
        if (payload.new?.is_maintenance === true && playerRole.value !== 'admin') {
          isForceLogoutModalOpen.value = true;
        }
    }).subscribe();
});

watch(() => currentId.value, (newId) => {
  if (newId) {
    // 1. 監聽私訊
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

    // ==========================================
    // 🌟 2. 全域經驗值與狀態即時同步監聽器
    // ==========================================
    globalProfileChannel = supabase.channel('global_profile_updates')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'profiles', 
        filter: `id=eq.${newId}` 
      }, (payload) => {
        if (payload.new) {
          console.log('⚡ 偵測到資料庫更新，即時同步 UI！', payload.new);
          
          // 如果偵測到等級變高了，就觸發升級動畫彈出視窗
          if (payload.new.level > currentLevel.value) {
            isLevelUpModalOpen.value = true;
            setTimeout(() => { isLevelUpModalOpen.value = false; }, 5000);
          }

          // 將資料庫傳來的最新數值，無縫替換掉前端的變數
          currentXP.value = payload.new.xp || 0;
          currentTotalXP.value = payload.new.total_exp || 0;
          currentLevel.value = payload.new.level || 1;
          stat_points.value = payload.new.stat_points || 0;
        }
      }).subscribe();
  }
}, { immediate: true });

onUnmounted(() => {
  if (heartbeatInterval) clearInterval(heartbeatInterval);
  if (globalMessageSubscription) supabase.removeChannel(globalMessageSubscription);
  if (maintenanceSubscription) supabase.removeChannel(maintenanceSubscription);
  // 記得關閉監聽器，避免浪費資源
  if (globalProfileChannel) supabase.removeChannel(globalProfileChannel);
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
