<template>
  <div class="h-full flex flex-col bg-[#0f172a] text-slate-200 overflow-hidden relative">
    <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
    <div class="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>

    <header class="px-8 py-6 border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md z-10 flex justify-between items-center shrink-0">
      <div class="flex flex-col">
        <div class="flex items-center gap-3">
          <span class="text-3xl">🏆</span>
          <h2 class="text-2xl font-black text-white tracking-wider">全服榮譽榜</h2>
        </div>
        <p class="text-sm text-slate-400 mt-1">Global Leaderboard · 展現你的學習與駭客實力</p>
      </div>
      <button @click="fetchLeaderboard" class="px-4 py-2 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-lg text-sm font-bold transition-all flex items-center gap-2">
        <span :class="{'animate-spin': isLoading}">🔄</span> 重新同步
      </button>
    </header>

    <main class="flex-1 overflow-y-auto custom-scrollbar p-8 z-10">
      
      <div v-if="isLoading" class="flex flex-col items-center justify-center h-64 text-indigo-400">
        <span class="text-5xl animate-spin mb-4">⚙️</span>
        <p class="font-bold tracking-widest animate-pulse">正在存取神羅總部資料庫...</p>
      </div>

      <div v-else-if="leaderboardData.length === 0" class="flex flex-col items-center justify-center h-64 text-slate-500">
        <span class="text-6xl mb-4 opacity-50">📭</span>
        <p class="font-bold tracking-widest">目前尚無排名數據</p>
      </div>

      <div v-else class="max-w-5xl mx-auto flex flex-col gap-8">
        
        <div class="flex items-end justify-center gap-6 pt-10 pb-6">
          <div v-if="topThree[1]" class="flex flex-col items-center w-48 transform translate-y-8">
            <div class="text-4xl drop-shadow-[0_0_10px_#cbd5e1] mb-2 z-10">🥈</div>
            <div class="w-20 h-20 rounded-full bg-slate-800 border-4 border-slate-300 shadow-[0_0_20px_rgba(203,213,225,0.3)] overflow-hidden mb-[-20px] z-10">
              <img v-if="topThree[1].avatar_url" :src="topThree[1].avatar_url" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center text-2xl">👤</div>
            </div>
            <div class="w-full bg-slate-800/80 border border-slate-700 rounded-t-2xl pt-8 pb-4 flex flex-col items-center shadow-lg">
              <span class="font-black text-slate-200 truncate w-full text-center px-2">{{ topThree[1].username || '無名氏' }}</span>
              <span class="text-sm font-mono text-indigo-400 font-bold mt-1">Lv.{{ topThree[1].level }}</span>
            </div>
          </div>

          <div v-if="topThree[0]" class="flex flex-col items-center w-56 z-20">
            <div class="text-6xl drop-shadow-[0_0_15px_#facc15] mb-2 z-10 animate-bounce">👑</div>
            <div class="w-28 h-28 rounded-full bg-slate-800 border-4 border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.4)] overflow-hidden mb-[-25px] z-10">
              <img v-if="topThree[0].avatar_url" :src="topThree[0].avatar_url" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center text-4xl">👤</div>
            </div>
            <div class="w-full bg-gradient-to-b from-yellow-900/40 to-slate-800/80 border border-yellow-500/50 rounded-t-2xl pt-10 pb-6 flex flex-col items-center shadow-[0_-10px_20px_rgba(250,204,21,0.1)]">
              <span class="font-black text-yellow-400 text-lg truncate w-full text-center px-2">{{ topThree[0].username || '無名氏' }}</span>
              <span class="text-base font-mono text-indigo-300 font-black mt-1">Lv.{{ topThree[0].level }}</span>
            </div>
          </div>

          <div v-if="topThree[2]" class="flex flex-col items-center w-48 transform translate-y-12">
            <div class="text-4xl drop-shadow-[0_0_10px_#fb923c] mb-2 z-10">🥉</div>
            <div class="w-20 h-20 rounded-full bg-slate-800 border-4 border-orange-400 shadow-[0_0_20px_rgba(251,146,60,0.3)] overflow-hidden mb-[-20px] z-10">
              <img v-if="topThree[2].avatar_url" :src="topThree[2].avatar_url" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center text-2xl">👤</div>
            </div>
            <div class="w-full bg-slate-800/80 border border-slate-700 rounded-t-2xl pt-8 pb-4 flex flex-col items-center shadow-lg">
              <span class="font-black text-slate-200 truncate w-full text-center px-2">{{ topThree[2].username || '無名氏' }}</span>
              <span class="text-sm font-mono text-indigo-400 font-bold mt-1">Lv.{{ topThree[2].level }}</span>
            </div>
          </div>
        </div>

        <div class="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div class="flex items-center px-6 py-4 bg-slate-800/50 border-b border-slate-700/50 text-xs font-black text-slate-400 uppercase tracking-widest">
            <div class="w-16 text-center">Rank</div>
            <div class="flex-1 pl-4">Hacker Profile</div>
            <div class="w-32 text-center">Level</div>
            <div class="w-32 text-right pr-4">Total EXP</div>
          </div>

          <div class="flex flex-col">
            <div 
              v-for="(player, index) in restPlayers" 
              :key="player.id"
              class="flex items-center px-6 py-4 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
              :class="{'bg-indigo-900/20 border-l-4 border-l-indigo-500': player.id === currentUserId}"
            >
              <div class="w-16 text-center font-black text-slate-500 text-lg">
                #{{ index + 4 }}
              </div>
              
              <div class="flex-1 pl-4 flex items-center gap-4">
                <div class="w-10 h-10 rounded-lg overflow-hidden bg-black/50 border border-slate-700 shrink-0">
                  <img v-if="player.avatar_url" :src="player.avatar_url" class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full flex items-center justify-center text-sm">👤</div>
                </div>
                <div class="font-bold text-slate-200">
                  {{ player.username || '無名氏' }}
                  <span v-if="player.id === currentUserId" class="ml-2 text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full font-mono tracking-widest">YOU</span>
                </div>
              </div>

              <div class="w-32 text-center font-mono font-black text-indigo-400 text-lg">
                {{ player.level }}
              </div>

              <div class="w-32 text-right pr-4 font-mono font-bold text-slate-400 text-sm">
                {{ player.total_exp?.toLocaleString() || 0 }}
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { supabase } from '../../../supabase.js'; // 根據你的路徑調整

const props = defineProps({
  currentUserId: {
    type: String,
    required: false
  }
});

const isLoading = ref(true);
const leaderboardData = ref([]);

// 將資料拆分為前三名和剩下的名單
const topThree = computed(() => leaderboardData.value.slice(0, 3));
const restPlayers = computed(() => leaderboardData.value.slice(3));

const fetchLeaderboard = async () => {
  isLoading.value = true;
  try {
    // 抓取全服資料表 profiles，依照等級和總經驗值降冪排序，抓取前 50 名
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, level, total_exp')
      .order('level', { ascending: false })
      .order('total_exp', { ascending: false })
      .limit(50);

    if (error) throw error;
    if (data) leaderboardData.value = data;

  } catch (err) {
    console.error('抓取全服排行榜失敗:', err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchLeaderboard();
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 8px; }
.custom-scrollbar::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.5); }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4f46e5; }
</style>