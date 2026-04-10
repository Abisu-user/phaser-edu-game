<template>
  <LandingPage
    v-if="currentScreen === 'LandingPage'" 
    @go-login="currentScreen = 'login'"
  />

  <LoginScreen
    v-else-if="currentScreen === 'login'"
    @login-success="onLoginSuccess"
    @back-to-home="currentScreen = 'LandingPage'"
  />

  <PlayerDashboard
    v-else-if="currentScreen === 'dashboard'"
    :player-name="currentPlayerName"
    @logout="handleLogout"
    @enter-game="goToLevel"
  />

  <GameLevel 
    v-else-if="currentScreen === 'level'" 
    :levelConfig="currentLevelData" 
    :key="currentLevelData.id"
    @back="currentScreen = 'dashboard'" 
    @next-level="goToNextLevel"
  />
</template>

<script setup>
import { ref, onMounted} from 'vue';
import { supabase } from './supabase.js';
import './style.css'; 
import LandingPage from './components/lobby/LandingPage.vue';
import GameLevel from './components/level/GameLevel.vue';
import PlayerDashboard from './components/lobby/PlayerDashboard.vue';
import LoginScreen from './components/auth/LoginScreen.vue';
import { levels } from './game/scenes/LevelConfig.js'; 

// 狀態管理
const currentScreen = ref('LandingPage'); 
const currentLevelData = ref(null);
const currentPlayerName = ref('');       

// --- 登入與登出邏輯 ---
const onLoginSuccess = (username) => {
  currentPlayerName.value = username; 
  currentScreen.value = 'dashboard'; 
};

const handleLogout = () => {
  currentPlayerName.value = '';      
  currentScreen.value = 'LandingPage';
};

const checkLoginState = async () => {
  // 跟 Supabase 拿目前的 Session (憑證)
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    // 如果有憑證，代表已經登入過！直接跳過登入畫面
    currentScreen.value = 'dashboard';
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', session.user.id)
      .single();
      
    if (profile) {
      currentPlayerName.value = profile.username;
    }
  } else {
    // 如果沒有憑證，就乖乖待在登入畫面
    currentScreen.value = 'login';
  }
};

// --- 遊戲關卡邏輯 ---
const goToLevel = (payload) => {
  let targetId = 1;
  let targetCourseId = 'python';

  // 判斷傳進來的是數字還是包含 courseId 的物件
  if (typeof payload === 'object' && payload !== null) {
    targetId = payload.levelId;
    targetCourseId = payload.courseId;
  } else if (typeof payload === 'number') {
    targetId = payload;
  }

  const level = levels.find(l => l.id === targetId);
  
  if (level) {
    // 🌟 關鍵：把 courseId 塞進 currentLevelData，這樣 GameLevel 才知道這關屬於什麼課
    currentLevelData.value = { ...level, courseId: targetCourseId }; 
    currentScreen.value = 'level';  
  } else {
    alert('🎉 恭喜你通關了目前所有的關卡！');
    currentScreen.value = 'dashboard';
  }
};

const goToNextLevel = () => {
  if (currentLevelData.value) {
    goToLevel({
      courseId: currentLevelData.value.courseId,
      levelId: currentLevelData.value.id + 1
    });
  }
};

onMounted(() => {
  checkLoginState();

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
      currentScreen.value = 'dashboard';
    } else if (event === 'SIGNED_OUT') {
      currentScreen.value = 'LandingPage';
    }
  });
});
</script>