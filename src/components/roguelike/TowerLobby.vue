<template>
  <div class="tower-lobby relative h-full w-full bg-[#05050A] text-slate-200 overflow-hidden font-['Fredoka',sans-serif]">
    
    <div class="absolute bottom-[-150px] left-1/2 -translate-x-1/2 w-[120vw] h-[300px] border-t border-fuchsia-500/20 rounded-[100%] bg-gradient-to-t from-fuchsia-900/20 to-transparent blur-md"></div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-10 pointer-events-none flex items-center justify-center animate-spin-slow">
      <div class="absolute w-full h-full border border-indigo-500/30 rounded-full"></div>
      <div class="absolute w-[80%] h-[80%] border-2 border-dashed border-fuchsia-500/20 rounded-full animate-spin-reverse-slow"></div>
      <svg viewBox="0 0 100 100" class="absolute w-[60%] h-[60%] text-fuchsia-500 fill-transparent stroke-current stroke-[0.5]">
        <polygon points="50,10 90,90 10,90" />
        <polygon points="50,90 90,10 10,10" class="opacity-50" />
      </svg>
    </div>
    <div class="particles-container absolute inset-0 pointer-events-none">
      <div v-for="i in 20" :key="i" class="particle bg-white/20 rounded-full absolute" :style="getParticleStyle(i)"></div>
    </div>

    <header class="absolute top-0 w-full p-6 z-30 flex justify-between items-start pointer-events-none">
      <div class="flex items-center gap-4 bg-[#11111B]/60 backdrop-blur-md border border-[#2A2A40] p-3 rounded-2xl shadow-lg pointer-events-auto transition-opacity duration-500" :class="{ 'opacity-0': isLoading }">
        
        <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-fuchsia-500 rounded-xl flex items-center justify-center text-xl border border-white/20 shadow-inner overflow-hidden shrink-0">
          <img 
            v-if="avatarUrl" 
            :src="avatarUrl" 
            alt="Player Avatar" 
            class="w-full h-full object-cover"
            @error="avatarUrl = ''" 
          />
          <span v-else>👤</span>
        </div>

        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="font-bold text-white tracking-wider">{{ playerName }}</span>
            <span class="px-2 py-0.5 bg-fuchsia-500/20 text-fuchsia-300 text-[10px] rounded font-mono border border-fuchsia-500/30">LV.{{ playerLevel }}</span>
          </div>
          <div class="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 shadow-[0_0_10px_#d946ef] transition-all duration-1000" :style="{ width: (xp / 1000 * 100) + '%' }"></div>
          </div>
        </div>
      </div>

      <div class="flex flex-col items-end gap-3 pointer-events-auto transition-opacity duration-500" :class="{ 'opacity-0': isLoading }">
        <div class="flex gap-3">
          <div class="bg-[#11111B]/60 backdrop-blur-md border border-yellow-500/20 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
            <span>💰</span><span class="font-mono font-bold text-yellow-400">{{ coins }}</span>
          </div>
        </div>
        <div class="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-900/20 border border-emerald-500/20 px-3 py-1 rounded-full">
          <span class="animate-pulse">🔥</span> 經驗值加成 15% (剩餘 2hr)
        </div>
      </div>
    </header>

    <main class="relative z-20 w-full h-full flex items-center justify-between px-12 pt-20">
      
      <div class="w-[320px] flex flex-col gap-6 transform transition-all duration-700 translate-x-0">
        <div class="bg-[#11111B]/70 backdrop-blur-xl border border-[#2A2A40] rounded-2xl p-5 shadow-2xl">
          <div class="flex items-center gap-2 mb-4">
            <span class="text-fuchsia-400">🎯</span>
            <h3 class="font-bold text-white tracking-wide">今日總部委託</h3>
          </div>
          <div class="space-y-4">
            <div>
              <div class="flex justify-between text-xs mb-1">
                <span class="text-slate-300">挑戰高塔</span>
                <span class="text-fuchsia-400 font-mono">0/1</span>
              </div>
              <div class="w-full h-1 bg-slate-800 rounded-full"><div class="h-full bg-fuchsia-500 w-[0%] rounded-full"></div></div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-5 gap-2">
          <button v-for="menu in menus" :key="menu.name" class="group flex flex-col items-center gap-1.5 p-2 bg-[#11111B]/50 backdrop-blur-md border border-[#2A2A40] rounded-xl hover:bg-fuchsia-900/30 hover:border-fuchsia-500/50 transition-all duration-300">
            <span class="text-xl group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(217,70,239,0.8)] transition-all">{{ menu.icon }}</span>
            <span class="text-[10px] text-slate-400 group-hover:text-fuchsia-300">{{ menu.name }}</span>
          </button>
        </div>
      </div>

      <div class="flex-1 flex flex-col items-center justify-center mt-10">
        <div class="text-center animate-breathe">
          <div class="text-fuchsia-400 font-mono tracking-[0.5em] text-sm uppercase mb-2">Operation: Code Quest</div>
          <h1 class="text-[5rem] md:text-[6rem] leading-none font-black italic text-transparent bg-clip-text bg-gradient-to-b from-white via-indigo-200 to-indigo-900 drop-shadow-[0_0_30px_rgba(99,102,241,0.3)]">ENDLESS</h1>
          <h1 class="text-[4rem] leading-none font-black italic text-white/90 tracking-widest mt-[-10px]">TOWER</h1>
        </div>

        <div class="mt-16 flex flex-col items-center gap-4 w-full max-w-sm">
          <button @click="handleStartNew" class="group relative w-full py-4 bg-fuchsia-600 rounded-xl overflow-hidden shadow-[0_0_40px_rgba(217,70,239,0.4)] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" :disabled="isLoading">
            <div class="absolute inset-0 bg-gradient-to-r from-fuchsia-500 to-indigo-600"></div>
            <div class="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 -translate-x-[150%] group-hover:animate-sweep"></div>
            <span class="relative z-10 text-xl font-black tracking-widest flex items-center justify-center gap-3 text-white">
              {{ isLoading ? '系統連線中...' : (activeSave ? '⚠️ 放棄進度並重來' : '🚀 開始挑戰') }}
            </span>
          </button>

          <button 
            v-if="activeSave" 
            @click="handleContinue" 
            class="w-full py-3.5 bg-[#11111B]/80 backdrop-blur-md border border-emerald-500/50 hover:bg-emerald-900/40 hover:border-emerald-400 rounded-xl transition-all text-emerald-300 font-bold tracking-widest flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          >
            <span class="animate-pulse">⚡</span>
            <span>恢復機甲連線</span>
            <span class="text-xs bg-emerald-500/20 px-2 py-0.5 rounded font-mono ml-2 border border-emerald-500/30">
              {{ activeSave.current_floor }}F
            </span>
          </button>
          
          <button @click="$emit('exit')" class="mt-4 text-sm text-slate-500 hover:text-white transition-colors underline underline-offset-4">
            [ 登出高塔系統 返回大廳 ]
          </button>
        </div>
      </div>

      <div class="w-[320px] flex flex-col gap-6">
        <div class="bg-[#11111B]/70 backdrop-blur-xl border border-yellow-500/30 rounded-2xl p-5 shadow-[0_0_20px_rgba(234,179,8,0.05)] relative overflow-hidden group transition-opacity duration-500" :class="{ 'opacity-0': isLoading }">
          <div class="absolute top-0 right-0 w-20 h-20 bg-yellow-500/10 rounded-bl-full pointer-events-none"></div>
          <div class="text-yellow-500/80 text-xs font-bold uppercase mb-4 tracking-wider flex items-center gap-2">
            <span>🏆</span> 歷史最高紀錄
          </div>
          
          <div class="flex items-end justify-between mb-4 border-b border-white/5 pb-4">
            <div class="text-5xl font-black text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
              {{ bestFloor }}<span class="text-xl text-slate-400 ml-1">F</span>
            </div>
            <div class="text-right">
              <div class="text-[10px] text-slate-500 mb-1">作戰評價</div>
              <div class="text-2xl font-black text-yellow-400 italic group-hover:scale-110 transition-transform drop-shadow-[0_0_10px_#facc15]">
                {{ bestFloor > 10 ? 'S' : (bestFloor > 5 ? 'A' : 'B') }}
              </div>
            </div>
          </div>
        </div>

        <div class="bg-[#11111B]/70 backdrop-blur-xl border border-fuchsia-500/30 rounded-2xl p-5 shadow-[0_0_20px_rgba(217,70,239,0.1)]">
          <div class="flex justify-between items-center mb-4">
            <div class="text-fuchsia-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <span>🧬</span> 核心驅動模組
            </div>
          </div>
          <div class="mb-4">
            <div class="text-[10px] text-slate-500 mb-1">當前流派配置</div>
            <div class="font-bold text-white tracking-wide text-lg">⚔️ 狂暴快攻流</div>
          </div>
          <div class="flex gap-3">
            <div class="relative group cursor-pointer" title="連擊增幅"><div class="w-12 h-12 bg-black/50 border border-fuchsia-500/50 rounded-xl flex items-center justify-center text-xl shadow-[inset_0_0_10px_rgba(217,70,239,0.2)]">🔁</div></div>
            <div class="relative group cursor-pointer" title="衝刺引擎"><div class="w-12 h-12 bg-black/50 border border-indigo-500/50 rounded-xl flex items-center justify-center text-xl shadow-[inset_0_0_10px_rgba(99,102,241,0.2)]">⚡</div></div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../../supabase.js';

const emit = defineEmits(['start', 'exit']);

// === 狀態管理 ===
const isLoading = ref(true);
const currentUserId = ref(null);

// 玩家基本資料
const playerName = ref('連線中...');
const playerLevel = ref(1);
const xp = ref(0);
const total_exp = ref(0);
const coins = ref(0);
const max_hp = ref(100);
const max_mp = ref(50);
const max_ap = ref(30);
const bestFloor = ref(0);
const expPercent = ref(0);
const avatarUrl = ref(''); 

// 🌟 新增：暫存從大廳抓回來的原始物件，方便開局時「繼承」數值到存檔
const rawLobbyData = ref(null);

// 塔的存檔資料
const activeSave = ref(null);

// === 獲取資料庫資料 ===
const fetchPlayerData = async () => {
  try {
    isLoading.value = true;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    currentUserId.value = session.user.id;

    // 1. 嘗試抓取高塔專屬資料 (tower_lobby)
    let { data: towerData, error: towerError } = await supabase
      .from('tower_lobby')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle();

    // 2. 如果高塔還沒有資料 (第一次進來)，則執行初始化
    if (!towerData) {
      console.log("🆕 第一次進入高塔，正在初始化資料...");
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, avatar_url, level, xp, total_exp')
        .eq('id', session.user.id)
        .single();

      const { data: newData } = await supabase
        .from('tower_lobby')
        .insert([{
            user_id: session.user.id,
            username: profile?.username || '無名駭客',
            avatar_url: profile?.avatar_url || '',
            level: profile?.level || 1,
            xp: profile?.xp || 0,
            total_exp: profile?.total_exp || 0,
        }])
        .select()
        .single();
      
      towerData = newData;
    }

    // 3. 將資料映射到畫面變數
    if (towerData) {
      rawLobbyData.value = towerData; // 🌟 這裡存下完整資料，供開局使用
      playerName.value = towerData.username;
      avatarUrl.value = towerData.avatar_url;
      playerLevel.value = towerData.level;
      xp.value = towerData.xp;
      total_exp.value = towerData.total_exp;
      coins.value = towerData.coins; 
      bestFloor.value = towerData.best_floor;
      max_hp.value = towerData.max_hp;
      max_mp.value = towerData.max_mp;
      max_ap.value = towerData.max_ap;
    }

    // 4. 抓取進行中的存檔 (tower_saves)
    const { data: saveData } = await supabase
      .from('tower_saves')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle();
    activeSave.value = saveData;

  } catch (err) {
    console.error('初始化失敗:', err);
  } finally {
    isLoading.value = false;
  }
};

// === 處理按鈕點擊事件 ===
const handleStartNew = async () => {
  if (activeSave.value) {
    const confirmOverwrite = confirm('⚠️ 警告：您目前有未完成的作戰進度，開啟新局將會銷毀原本的進度。確定要繼續嗎？');
    if (!confirmOverwrite) return;
    
    isLoading.value = true;
    // 刪除舊有暫存
    await supabase.from('tower_saves').delete().eq('user_id', currentUserId.value);
  }

  try {
    isLoading.value = true;
    
    // 🌟 改動 1：建立新存檔時，從 Lobby 抓取「當前數值」存進 Saves
    const lobby = rawLobbyData.value;
    
    const { data: newSave, error } = await supabase
      .from('tower_saves')
      .insert([{ 
        user_id: currentUserId.value,
        current_floor: 1,               // 新局從第一層開始
        current_hp: lobby?.max_hp || 100,
        max_hp: lobby?.max_hp || 100,
        current_mp: lobby?.max_mp || 50,
        max_mp: lobby?.max_mp || 50,
        current_ap: lobby?.max_ap || 30,
        max_ap: lobby?.max_ap || 30,
        coins: lobby?.coins || 0,       // 帶入大廳持有的金幣
        level: lobby?.level || 1,       // 帶入大廳的等級
        xp: lobby?.xp || 0,             // 帶入大廳的經驗值
        total_exp: lobby?.total_exp || 0, // 帶入大廳的總經驗值
        updated_at: new Date()
      }])
      .select()
      .single();

    if (error) throw error;
    
    console.log("✅ 已成功建立存檔並同步大廳數值");
    emit('start', newSave); 
  } catch (err) {
    console.error('建立新存檔失敗:', err);
    alert('無法連接到伺服器，請稍後再試。');
  } finally {
    isLoading.value = false;
  }
};

const handleContinue = () => {
  if (activeSave.value) {
    // 繼續遊戲則直接傳遞已存在的 saves 資料
    emit('start', activeSave.value);
  }
};

onMounted(() => {
  fetchPlayerData();
});

// 功能選單資料
const menus = [
  { name: '卡牌', icon: '🃏' },
  { name: '商店', icon: '🏪' },
  { name: '圖鑑', icon: '📖' },
  { name: '排行', icon: '🏆' },
  { name: '成就', icon: '🏅' },
];

// 生成隨機粒子樣式 (保持原樣)
const getParticleStyle = (index) => {
  const size = Math.random() * 4 + 1; 
  const left = Math.random() * 100; 
  const top = Math.random() * 100; 
  const duration = Math.random() * 10 + 10; 
  const delay = Math.random() * 5; 
  return {
    width: `${size}px`, height: `${size}px`, left: `${left}%`, top: `${top}%`,
    animation: `float-particle ${duration}s linear ${delay}s infinite`,
    opacity: Math.random() * 0.5 + 0.1
  };
};
</script>

<style scoped>
.animate-spin-slow { animation: spin 60s linear infinite; }
.animate-spin-reverse-slow { animation: spin 45s linear infinite reverse; }
.animate-breathe { animation: breathe 4s ease-in-out infinite; }
@keyframes breathe {
  0%, 100% { transform: scale(1); opacity: 0.9; filter: drop-shadow(0 0 10px rgba(217,70,239,0.2)); }
  50% { transform: scale(1.02); opacity: 1; filter: drop-shadow(0 0 30px rgba(217,70,239,0.6)); }
}
.animate-sweep { animation: sweep 1.5s ease-in-out infinite; }
@keyframes sweep {
  0% { transform: translateX(-150%) skewX(12deg); }
  100% { transform: translateX(250%) skewX(12deg); }
}
@keyframes float-particle {
  0% { transform: translateY(0) scale(1); opacity: 0; }
  10% { opacity: 0.8; }
  90% { opacity: 0.8; }
  100% { transform: translateY(-100vh) scale(1.5); opacity: 0; }
}
</style>