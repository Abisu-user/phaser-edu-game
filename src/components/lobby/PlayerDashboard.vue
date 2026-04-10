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
      v-model:currentSection="currentSection"
      @toggle="isSidebarCollapsed = !isSidebarCollapsed"
    />

    <div class="main-content">
      <DashboardHeader 
        :playerName="playerName"
        :currentLevel="currentLevel"
        :currentXP="currentXP"
        :xpPerLevel="xpPerLevel"
      />

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

        <AchievementsSection
          v-show="currentSection === 'achievements'" 
          :badges="badges"
        />

        <div v-show="currentSection === 'leaderboard'">排行榜即將推出...</div>
        
        <ProfileSection 
          v-show="currentSection === 'profile'"
          :playerName="playerName"
          :playerEmail="playerEmail"
          :currentLevel="currentLevel"
          :currentXP="currentXP"
          :xpPerLevel="xpPerLevel"
          :clearedLevelsCount="clearedLevelsCount"
          :badges="badges"
          :joinData="playerJoinData"
          :playerAvatarUrl="playerAvatarUrl"  
          @update-avatar="(newUrl) => playerAvatarUrl = newUrl"
        />
        <div v-show="currentSection === 'settings'">設定即將推出...</div>
        <div v-show="currentSection === 'help'">幫助內容即將推出...</div>
        </div>

      <footer class="relative z-10 px-6 py-8 text-center border-t mt-auto" style="border-color:#1e1e2e;">
        <p class="text-sm" style="color:#a0a0b8;">祝你學習愉快！需要幫助？<a href="#" style="color:#00d4aa;text-decoration:none;">查看教程</a></p>
      </footer>
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
  
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
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

// 🌟 修正 1：將 playerName 從 Props 移除，改用本地的 ref，這樣才能被 supabase 更新
const playerName = ref('遊客模式');

const courseProgress = ref({
  python: 0,
  javascript: 0
});

const emit = defineEmits(['enter-game', 'logout']);

// 狀態管理
const currentLevel = ref(1);
const currentXP = ref(0);
const xpPerLevel = ref(1000);
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
const playerJoinData = ref(''); // 👈 這裡字尾是 a
const playerAvatarUrl = ref('');

const xpPercent = computed(() => {
  return Math.min(Math.floor((currentXP.value / xpPerLevel.value) * 100), 100);
});

const triggerLevelUp = () => {
  currentXP.value += 660; 
  const levelsGained = Math.floor(currentXP.value / xpPerLevel.value);
  if (levelsGained > 0) {
    currentLevel.value += levelsGained;
    currentXP.value = currentXP.value % xpPerLevel.value;
    isLevelUpModalOpen.value = true;
    
    setTimeout(() => {
      isLevelUpModalOpen.value = false;
    }, 5000);
  }
};

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
    currentXP: currentXP.value,
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
  if (!quest || quest.isClaimed || quest.progress < quest.target) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  quest.isClaimed = true;
  let newXp = currentXP.value + quest.xp;
  let newLevel = currentLevel.value;

  if (newXp >= xpPerLevel.value) {
    newLevel += Math.floor(newXp / xpPerLevel.value);
    newXp = newXp % xpPerLevel.value;
    isLevelUpModalOpen.value = true;
    setTimeout(() => { isLevelUpModalOpen.value = false; }, 5000);
  }

  currentXP.value = newXp;
  currentLevel.value = newLevel;

  await supabase.from('profiles').update({ xp: newXp, level: newLevel }).eq('id', user.id);
  
  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem('code_quest_daily', JSON.stringify({ date: today, quests: dailyQuests.value }));
};

const fetchLobbyData = async () => {
  // 🌟 加入 try...catch，以後任何報錯都會在 Console 顯示，不會再死得不明不白
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('🚨 [抓蟲] 完蛋！找不到 user，提早結束了！'); 
      return;
    }

    playerEmail.value = user.email;
    // 🐛 修正 2：原本寫成 playerJoinDate，導致程式在這裡崩潰中斷
    playerJoinData.value = user.created_at;

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
      .select('xp, level, username, avatar_url')
      .eq('id', user.id)
      .single();

    console.log('🔍 [抓蟲] 資料庫回傳的 profile:', profile); 

    if (profile) {
      currentXP.value = profile.xp || 0;
      currentLevel.value = profile.level || 1;
      playerAvatarUrl.value = profile.avatar_url || ''; 
      console.log('🖼️ [抓蟲] 準備顯示的頭像網址:', playerAvatarUrl.value);
      
      // 🐛 修正 3：playerName 現在是 ref 了，可以正常賦值了！
      playerName.value = profile.username || '遊客模式';
      
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
  fetchCourseProgress();
  fetchLobbyData();
  initDailyQuests();
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
</style>

