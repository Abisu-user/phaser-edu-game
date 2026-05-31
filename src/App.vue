<template>
  <router-view v-slot="{ Component }">
    <component 
      :is="Component" 
      :key="$route.fullPath"
      :player-name="currentPlayerName"
      :levelConfig="currentLevelData"
      @go-login="$router.push('/login')"
      @login-success="onLoginSuccess"
      @back-to-home="$router.push('/')"
      @logout="handleLogout"
      @enter-game="goToLevel"
      @back="$router.push('/dashboard')"
      @next-level="goToNextLevel"
    />
  </router-view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'; 
import { useRouter } from 'vue-router';
import { supabase } from './supabase.js';
import './style.css'; 
import { levels } from './game/scenes/LevelConfig.js'; 

const router = useRouter();
const currentLevelData = ref(null);
const currentPlayerName = ref('');       
const currentUserRole = ref('student'); 

const onLoginSuccess = (username) => {
  currentPlayerName.value = username; 
  router.push('/dashboard'); 
};

const handleLogout = async () => {
  await supabase.auth.signOut(); 
  currentPlayerName.value = '';      
  currentUserRole.value = 'student'; 
  router.push('/'); 
};

const goToLevel = (payload) => {
  let targetId = 1;
  let targetCourseId = 'python';
  if (typeof payload === 'object' && payload !== null) {
    targetId = payload.levelId;
    targetCourseId = payload.courseId;
  } else if (typeof payload === 'number') {
    targetId = payload;
  }

  const level = levels.find(l => l.id === targetId);
  if (level) {
    currentLevelData.value = { ...level, courseId: targetCourseId }; 
    router.push('/level'); 
  }
};

const goToNextLevel = () => {
  if (currentLevelData.value) {
    goToLevel({ courseId: currentLevelData.value.courseId, levelId: currentLevelData.value.id + 1 });
  }
};

// ==========================================
// 🛡️ 防作弊與防調試系統 (Anti-Cheat)
// ==========================================
const antiCheatHandler = (e) => {
  if (currentUserRole.value === 'admin') return;

  // 偵測 F12
  const isF12 = e.key === 'F12' || e.keyCode === 123;
  const isInspect = (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'C' || e.key === 'c')) || 
                    (e.metaKey && e.altKey && (e.key === 'I' || e.key === 'i')) ||
                    (e.metaKey && e.shiftKey && (e.key === 'C' || e.key === 'c'));

  if (isF12 || isInspect) {
    e.preventDefault(); 

    document.body.innerHTML = `
      <div style="background:#0a0e27; height:100vh; width:100vw; display:flex; justify-content:center; align-items:center; color:#ff6b6b; font-size:30px; font-weight:bold; font-family:sans-serif; text-align:center; z-index:99999; position:fixed; top:0; left:0;">
        <div>
          <div style="font-size:60px; margin-bottom:20px;">🚨</div>
          ⚠️ 偵測到非法調試行為<br>連線已強制中斷！
        </div>
      </div>`;
    
    setTimeout(() => {
      window.location.href = "about:blank"; 
    }, 1500);
  }
};

const preventContextMenu = (e) => {
  if (currentUserRole.value !== 'admin') {
    e.preventDefault();
  }
};

// ==========================================
// 生命週期掛載
// ==========================================
onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    const { data: profile } = await supabase.from('profiles').select('username, role').eq('id', session.user.id).single();
    if (profile) {
      currentPlayerName.value = profile.username;
      currentUserRole.value = profile.role || 'student'; // 讀取權限
    }
    // 如果在首頁，自動進大廳
    if (window.location.pathname === '/') router.push('/dashboard');
  }

  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_OUT') {
      router.push('/');
    } else if (event === 'SIGNED_IN' && session) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
      if (profile) currentUserRole.value = profile.role || 'student';
    }
  });

  window.addEventListener('keydown', antiCheatHandler);
  window.addEventListener('contextmenu', preventContextMenu);
});

onUnmounted(() => {
  window.removeEventListener('keydown', antiCheatHandler);
  window.removeEventListener('contextmenu', preventContextMenu);
});
</script>