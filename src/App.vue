<template>
  <Analytics />
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Analytics } from '@vercel/analytics/vue';
import { supabase } from './supabase.js';
import './style.css'; 
import { levels } from './game/scenes/LevelConfig.js'; 

const router = useRouter();
const currentLevelData = ref(null);
const currentPlayerName = ref('');       

const onLoginSuccess = (username) => {
  currentPlayerName.value = username; 
  router.push('/dashboard'); 
};

const handleLogout = async () => {
  await supabase.auth.signOut(); 
  currentPlayerName.value = '';      
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

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    const { data: profile } = await supabase.from('profiles').select('username').eq('id', session.user.id).single();
    if (profile) currentPlayerName.value = profile.username;
    // 如果在首頁，自動進大廳
    if (window.location.pathname === '/') router.push('/dashboard');
  }

  supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') router.push('/');
  });
});
</script>