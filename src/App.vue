<template>
  <router-view v-slot="{ Component }">
    <Suspense>
      <component 
        :is="Component" 
        :key="$route.fullPath"
        :player-name="currentPlayerName"
        @go-login="$router.push('/login')"
        @login-success="onLoginSuccess"
        @back-to-home="$router.push('/')"
        @logout="handleLogout"
        @enter-game="goToLevel"
        @back="$router.push('/dashboard')"
        @next-level="goToNextLevel"
      />
      
      <template #fallback>
        <div style="background-color: #0a0e27; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; color: white;">
          <div class="loading-spinner">🌀</div>
          <h2 style="font-size: 24px; font-weight: bold; margin-top: 20px; color: #00d4aa; text-shadow: 0 0 10px rgba(0,212,170,0.5);">魔法大廳連線中...</h2>
        </div>
      </template>
    </Suspense>
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

const getAuthRole = (user) => {
  const role = user?.app_metadata?.role;
  return ['admin', 'teacher', 'student'].includes(role) ? role : 'student';
};

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
    router.push({ name: 'Level', query: { course: targetCourseId, level: targetId } });
  }
};

const goToNextLevel = () => {
  if (currentLevelData.value) {
    goToLevel({ courseId: currentLevelData.value.courseId, levelId: currentLevelData.value.id + 1 });
  }
};

// ==========================================
// 🛡️ 防作弊系統 1：懲罰執行器
// ==========================================
const executePunishment = () => {
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
};

// ==========================================
// 🛡️ 防作弊系統 2：被動按鍵攔截
// ==========================================
const antiCheatHandler = (e) => {
  if (currentUserRole.value === 'admin') return;

  const isF12 = e.key === 'F12' || e.keyCode === 123;
  const isInspect = (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'C' || e.key === 'c')) || 
                    (e.metaKey && e.altKey && (e.key === 'I' || e.key === 'i')) ||
                    (e.metaKey && e.shiftKey && (e.key === 'C' || e.key === 'c'));

  if (isF12 || isInspect) {
    e.preventDefault(); 
    executePunishment();
  }
};

const preventContextMenu = (e) => {
  if (currentUserRole.value !== 'admin') {
    e.preventDefault();
  }
};

// ==========================================
// 🛡️ 防作弊系統 3：主動 Debugger 陷阱 
// ==========================================
const startDevToolsDetector = () => {
  return;
  if (currentUserRole.value === 'admin') return;
  if (devToolsInterval) clearInterval(devToolsInterval);

  devToolsInterval = setInterval(() => {
    const start = performance.now();
    console.clear();
    
    // 強制暫停陷阱
    return;
    
    const end = performance.now();
    
    // 如果卡頓超過 1.2 秒，判定為開啟開發者工具
    if (end - start > 1200) {
      executePunishment();
    }
  }, 1000);
};

// ==========================================
// 🛡️ 封印控制台 (Anti-Console)
// ==========================================
try {
  const shouldBlockConsole = false;

  if (shouldBlockConsole) {
    const noop = () => {};
    const methods = ['log', 'info', 'warn', 'error', 'dir', 'table', 'clear'];
    
    methods.forEach((method) => {
      window.console[method] = noop;
    });

    Object.freeze(window.console);
  }
} catch (e) {}

// ==========================================
// 生命週期掛載
// ==========================================
onMounted(async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      const { data: profile } = await supabase.from('profiles').select('username').eq('id', session.user.id).single();
      
      if (profile) {
        currentPlayerName.value = profile.username || '玩家';
      }
      currentUserRole.value = getAuthRole(session.user);

      // 如果已經登入且在首頁，自動進大廳
      if (window.location.pathname === '/') {
        router.push('/dashboard');
      }

      // 🌟 延遲 3 秒後啟動防外掛陷阱 (給網頁足夠的時間載入)
    }
  } catch (err) {
    console.error("載入時發生錯誤:", err);
  }

  // 監聽登出入狀態切換
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_OUT') {
      router.push('/');
    } else if (event === 'SIGNED_IN' && session) {
      currentUserRole.value = getAuthRole(session.user);
      
    }
  });

});

onUnmounted(() => {
});
</script>

<style scoped>
/* 給載入動畫加上無限旋轉效果 */
.loading-spinner {
  font-size: 60px;
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
