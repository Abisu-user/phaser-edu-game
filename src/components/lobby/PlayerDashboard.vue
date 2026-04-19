<template>
  <div id="player-lobby" class="h-full w-full sidebar-wrapper" style="background: linear-gradient(135deg, #0a0e27 0%, #1a1a3e 50%, #0f1428 100%);">
    
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

        <FriendsSection
          v-show="currentSection === 'friends'"
        />


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

        <HelpSection
          v-show="currentSection === 'help'"
        />

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

  <LevelUpModal 
    :isOpen="isLevelUpModalOpen"
    :currentLevel="currentLevel"
    @close="isLevelUpModalOpen = false"
  />

  <CourseLevelModal 
    :isOpen="isLevelModalOpen"
    :courseId="selectedCourse?.id"
    :courseTitle="selectedCourse?.title"
    :courseIcon="selectedCourse?.icon"
    :unlockedLevel="unlockedLevel"
    @close="isLevelModalOpen = false"
    @select-level="startLevel"
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
  
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { supabase } from '../../supabase';
import CourseLevelModal from '../level/CourseLevelModal.vue';
import DashboardSidebar from './DashboardSidebar.vue';
import DashboardHeader from './DashboardHeader.vue';
import LevelUpModal from './LevelUpModal.vue';
import { BADGE_LIST } from '../../game/config/badges';

import LobbySection from './sections/LobbySection.vue';
import CoursesSection from './sections/CoursesSection.vue';
import AchievementsSection from './sections/AchievementsSection.vue';
import ProfileSection from './sections/ProfileSection.vue';
import HelpSection from './sections/HelpSection.vue';
import AdminSection from './sections/AdminSection.vue';
import TeacherSection from './sections/TeacherSection.vue';
import FriendsSection from './sections/FriendsSection.vue';
import SystemAnnouncement from './sections/admin/SystemAnnouncement.vue';

const playerName = ref('遊客模式');

const courseProgress = ref({
  python: 0,
  javascript: 0
});

const emit = defineEmits(['enter-game', 'logout']);

// 狀態管理
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
const unlockedLevel = ref(1); 
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
const myUserId = ref('');
const activeAdminTab = ref('system');
const isForceLogoutModalOpen = ref(false);
const activeTeacherTab = ref('overview');

let globalMessageSubscription = null;
let heartbeatInterval = null;
let maintenanceSubscription = null;

const handleNameUpdate = (newName) => {
  playerName.value = newName; 
};

const executeForceLogout = async () => {
  await supabase.auth.signOut();
  window.location.reload(); // 重整頁面，自動退回登入畫面
};

const sendHeartbeat = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 將目前的時間寫入資料庫
    await supabase
      .from('profiles')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);
      
  } catch (error) {
    console.error('心跳發送失敗:', error);
  }
};

const xpPercent = computed(() => {
  return Math.min(Math.floor((currentXP.value / xpPerLevel.value) * 100), 100);
});

const addExperience = async (gainAmount) => {
  // 1. 畫面數字更新（同時增加當前經驗與總經驗）
  currentXP.value += gainAmount;
  currentTotalXP.value += gainAmount; // 永遠累加，不歸零！

  let newLevel = currentLevel.value;
  let newXP = currentXP.value;

  // 2. 判斷是否升級
  const levelsGained = Math.floor(newXP / xpPerLevel.value);
  if (levelsGained > 0) {
    newLevel += levelsGained;
    newXP = newXP % xpPerLevel.value; // 取餘數（歸零後剩下的經驗）
    
    currentLevel.value = newLevel;
    currentXP.value = newXP;
    
    // 觸發升級特效 Modal
    isLevelUpModalOpen.value = true;
    setTimeout(() => { isLevelUpModalOpen.value = false; }, 5000);
  }

  // 3. 將最新的狀態同步寫回 Supabase 資料庫
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({
        xp: newXP,
        level: newLevel,
        total_exp: currentTotalXP.value // 🌟 存入不會歸零的總經驗
      }).eq('id', user.id);
    }
  } catch (err) {
    console.error('更新經驗值失敗:', err);
  }

  // 4. 在這裡判定累積成就！
  // checkCumulativeAchievements(); 
};

const setupGlobalMessageListener = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  myUserId.value = user.id;

  globalMessageSubscription = supabase.channel('global-notifications')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages' }, async (payload) => {
      const msg = payload.new;

      // 確認接收者是我，且目前「不在」friends 頁面
      if (msg.receiver_id === myUserId.value && currentSection.value !== 'friends') {
        
        hasUnreadMessages.value = true;
        const { data: sender } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', msg.sender_id)
          .single();


        if (sender) {
          const notificationId = Date.now();
          toastNotifications.value.push({
            id: notificationId,
            senderName: sender.username,
            avatar: sender.avatar_url,
            content: msg.content
          });

          setTimeout(() => {
            toastNotifications.value = toastNotifications.value.filter(n => n.id !== notificationId);
          }, 5000);
        }
      }
    }).subscribe();
};

// // 🌟 判定累積成就的範例函數
// const checkCumulativeAchievements = () => {
//   if (currentTotalXP.value >= 2000) {
//     console.log("🏆 解鎖成就：累積獲得 2000 經驗！");
//   }
// };

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
  const playerStats = {
    clearedLevelsCount: clearedLevelsCount.value,
    currentTotalXP: currentTotalXP.value,
    currentLevel: currentLevel.value
  };

  return BADGE_LIST.map(badge => {
    return {
      id: badge.id,
      icon: badge.icon,
      name: badge.name,
      desc: badge.desc,
      target: badge.target,
      current: badge.getCurrent(playerStats),
      isUnlocked: badge.checkUnlock(playerStats)
    };
  });
});

const claimQuest = async (questId) => {
  const quest = dailyQuests.value.find(q => q.id === questId);
  // 檢查任務是否存在、是否已領取、進度是否達標
  if (!quest || quest.isClaimed || quest.progress < quest.target) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // 1. 標記任務為已領取
  quest.isClaimed = true;
  
  // 2. 🌟 核心修改：直接呼叫我們剛剛做好的「增加經驗函數」！
  // 它會自動幫你處理 currentXP, total_exp, 升級判斷, 寫入資料庫與解鎖成就
  await addExperience(quest.xp);
  
  // 3. 更新本地緩存 (LocalStorage)，記錄今天已經解過這個任務
  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem('code_quest_daily', JSON.stringify({ date: today, quests: dailyQuests.value }));
};

const fetchLobbyData = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return;
    }

    playerEmail.value = user.email;
    playerJoinDate.value = user.created_at;

    const { count } = await supabase
      .from('user_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    
    clearedLevelsCount.value = count || 0;

    const { data: lastRecord } = await supabase
      .from('user_progress')
      .select('course_id, level_id')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(1);

    if (lastRecord && lastRecord.length > 0) {
      const courseMap = {
        'python': { title: 'Python 大冒險', icon: '🐍' },
        'javascript': { title: 'JavaScript 戰場', icon: '⚔️' }
      };
      
      const courseInfo = courseMap[lastRecord[0].course_id];
      if (courseInfo) {
        lastPlayed.value = {
          courseId: lastRecord[0].course_id,
          title: courseInfo.title,
          icon: courseInfo.icon,
          nextLevel: lastRecord[0].level_id + 1 
        };
      }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, xp, level, username, avatar_url, role, total_exp')
      .eq('id', user.id)
      .single();

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

        const diffTime = Math.abs(today - lastLoginDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // 昨天有登入，連登 +1
          currentStreak += 1;
          shouldUpdateDB = true;
        } else if (diffDays > 1) {
          // 斷線超過一天，重置為 1
          currentStreak = 1;
          shouldUpdateDB = true;
        }
        // 如果 diffDays === 0，代表今天已登入過，保持原樣不更新
      } else {
        // 沒有紀錄代表是第一次登入
        shouldUpdateDB = true;
      }

      consecutiveDays.value = currentStreak; // 更新前端顯示天數

      // 如果有跨日更新，寫回 Supabase 資料庫
      if (shouldUpdateDB) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            last_login_at: new Date().toISOString(),
            consecutive_days: currentStreak 
          })
          .eq('id', user.id);

        if (updateError) {
          console.error("更新登入狀態失敗:", updateError);
        }
      }
      
      if (localStorage.getItem('justLeveledUp') === 'true') {
        isLevelUpModalOpen.value = true; 
        localStorage.removeItem('justLeveledUp'); 
        
        setTimeout(() => {
          isLevelUpModalOpen.value = false;
        }, 5000);
      }
    }
  } catch (err) {
    // 🚨 抓到蟲了！如果程式再崩潰，這行會告訴你原因
    console.error('💥 [抓蟲] fetchLobbyData 發生嚴重錯誤：', err);
  }
};

const openLevelSelector = async (course) => {
  selectedCourse.value = course;
  
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('user_progress')
    .select('level_id')
    .eq('user_id', user.id)
    .eq('course_id', course.id)
    .order('level_id', { ascending: false })
    .limit(1);

  if (data && data.length > 0) {
    unlockedLevel.value = data[0].level_id + 1;
  } else {
    unlockedLevel.value = 1;
  }

  isLevelModalOpen.value = true;
};

const refreshUserData = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    
    if (user) {
      // 這裡將抓到的最新 Email 覆寫掉你原本的變數
      playerEmail.value = user.email; 
      
      // 如果你的名字存在 user_metadata 裡，也可以順便更新
      // playerName.value = user.user_metadata.username || playerName.value;
    }
  } catch (err) {
    console.error('背景更新使用者資料失敗:', err.message);
  }
};

let lastCheckTime = 0;
const COOLDOWN_TIME = 5000; 

const handleUserInteraction = () => {
  const now = Date.now();
  // 如果距離上次檢查已經超過 5 秒，才去後台抓資料
  if (now - lastCheckTime > COOLDOWN_TIME) {
    lastCheckTime = now;
    refreshUserData();
  }
};

const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    refreshUserData();
  }
};

const startLevel = (data) => {
  isLevelModalOpen.value = false;
  emit('enter-game', data); 
};

const fetchCourseProgress = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data, error } = await supabase
    .from('user_progress')
    .select('course_id, level_id')
    .eq('user_id', user.id);

  if (data && !error) {
    const progressMap = { python: 0, javascript: 0 };
    
    data.forEach(record => {
      progressMap[record.course_id] = Math.max(progressMap[record.course_id] || 0, record.level_id);
    });
    
    courseProgress.value = progressMap;
  }
};

onMounted(() => {
  console.log('📡 [系統廣播] 準備連線監聽 system_settings...');
  fetchCourseProgress();
  fetchLobbyData();
  initDailyQuests();
  sendHeartbeat();
  heartbeatInterval = setInterval(sendHeartbeat, 1 * 60 * 1000);
  setupGlobalMessageListener();
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('click', handleUserInteraction);
  window.addEventListener('pointerenter', handleUserInteraction);

  maintenanceSubscription = supabase
    .channel('custom-maintenance-channel')
    .on(
      'postgres_changes', 
      { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'system_settings'
      }, 
      (payload) => {
        // 🔥 當資料庫有任何更新，這裡一定會印出東西！
        console.log('🚨 [系統廣播] 收到資料庫更新！', payload);
        console.log('👤 [系統廣播] 當前玩家身份是：', playerRole.value);

        // 加上 ?. 防止 payload.new 為空時報錯
        if (payload.new?.is_maintenance === true && playerRole.value !== 'admin') {
          console.log('🛑 [系統廣播] 條件成立！準備強制踢出！');
          isForceLogoutModalOpen.value = true;
        } else {
          console.log('✅ [系統廣播] 條件不成立，安全放行。');
        }
      }
    )
    .subscribe((status) => {
      // 🔥 檢查連線是否真的成功
      console.log('📶 [系統廣播] 連線狀態：', status);
    });
});

watch(() => myUserId.value, (newId) => {
  if (newId) {
    // 確保有 ID 才建立全域訂閱
    globalMessageSubscription = supabase.channel('global-messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'direct_messages',
        filter: `receiver_id=eq.${newId}` // 確保過濾器綁定到正確的非空 ID
      }, async (payload) => {
        // 1. 觸發側邊欄紅點
        hasUnreadMessages.value = true;
        
        // 2. 處理 Toast 與查詢發送者名稱的邏輯...
      }).subscribe();
  }
}, { immediate: true });

onUnmounted(() => {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
  }

  if (globalMessageSubscription) {
    supabase.removeChannel(globalMessageSubscription);
  }

  if (maintenanceSubscription) {
    supabase.removeChannel(maintenanceSubscription);
  }
  
  document.removeEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('click', handleUserInteraction);
  window.addEventListener('pointerenter', handleUserInteraction);
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

