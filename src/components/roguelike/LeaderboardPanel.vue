<template>
  <transition name="fade">
    <div class="absolute inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" @click.self="$emit('close')">
      
      <div class="w-[1125px] max-w-[95vw] h-[935px] max-h-[90vh] bg-[#050B14] border border-yellow-500/30 rounded-[1.75rem] shadow-[0_0_60px_rgba(234,179,8,0.2)] flex flex-col overflow-hidden transform transition-all">
        
        <header class="h-20 px-8 bg-gradient-to-r from-yellow-900/40 to-transparent border-b border-yellow-500/20 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-4">
            <span class="text-3xl">🏆</span>
            <h2 class="text-2xl font-black text-yellow-400 tracking-widest uppercase">全域排行榜 <span class="text-base text-slate-500 ml-3 font-normal">Leaderboard</span></h2>
          </div>
          <div class="flex items-center gap-5">
            <button @click="fetchData" class="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-1.5 rounded-lg border border-slate-600 transition-colors flex items-center gap-1.5">
              <span :class="{'animate-spin': isLoading}">🔄</span> 重新同步
            </button>
            <button @click="$emit('close')" class="text-slate-400 hover:text-yellow-400 text-3xl font-bold transition-colors w-10 h-10 flex items-center justify-center rounded-full hover:bg-yellow-500/10">×</button>
          </div>
        </header>

        <div class="flex border-b border-white/5 bg-[#0A101A] shrink-0">
          <button 
            @click="switchTab('tower')" 
            class="flex-1 py-4 text-base font-black tracking-widest transition-all border-b-[3px]"
            :class="activeTab === 'tower' ? 'border-yellow-500 text-yellow-400 bg-yellow-900/10' : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'"
          >
            🗼 高塔巔峰榜
          </button>
          <button 
            @click="switchTab('global')" 
            class="flex-1 py-4 text-base font-black tracking-widest transition-all border-b-[3px]"
            :class="activeTab === 'global' ? 'border-indigo-500 text-indigo-400 bg-indigo-900/10' : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'"
          >
            🌍 全服綜合榜
          </button>
        </div>

        <main class="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#050B14] relative">
          
          <div v-if="isLoading" class="absolute inset-0 flex flex-col items-center justify-center text-slate-500 z-50 bg-[#050B14]/80 backdrop-blur-sm">
            <span class="text-5xl animate-spin mb-5">⚙️</span>
            <p class="font-bold tracking-widest animate-pulse text-lg">正在同步神羅網路數據...</p>
          </div>

          <div v-if="!isLoading && leaderboardData.length > 0" class="flex flex-col gap-10 max-w-5xl mx-auto">
            
            <div class="flex items-end justify-center gap-5 pt-10 pb-5 shrink-0">
              
              <div v-if="topThree[1]" class="flex flex-col items-center w-52 transform translate-y-8">
                <div class="text-5xl drop-shadow-[0_0_12px_#cbd5e1] mb-3 z-10">🥈</div>
                <div class="w-20 h-20 rounded-full bg-slate-800 border-[3px] border-slate-300 shadow-[0_0_20px_rgba(203,213,225,0.3)] overflow-hidden mb-[-20px] z-10">
                  <img v-if="topThree[1].avatar_url" :src="topThree[1].avatar_url" class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full flex items-center justify-center text-2xl">👤</div>
                </div>
                <div class="w-full bg-slate-800/80 border border-slate-700 rounded-t-3xl pt-8 pb-4 flex flex-col items-center shadow-lg">
                  <span class="font-black text-slate-200 text-base truncate w-full text-center px-3">{{ topThree[1].username || '無名氏' }}</span>
                  <span class="text-sm font-mono font-bold mt-1.5" :class="activeTab === 'tower' ? 'text-yellow-400' : 'text-indigo-400'">
                    <template v-if="activeTab === 'tower'">{{ topThree[1].best_floor !== null ? topThree[1].best_floor + 'F' : '未加入' }}</template>
                    <template v-else>Lv.{{ topThree[1].level }}</template>
                  </span>
                </div>
              </div>

              <div v-if="topThree[0]" class="flex flex-col items-center w-60 z-20">
                <div class="text-6xl drop-shadow-[0_0_20px_#facc15] mb-3 z-10 animate-bounce">👑</div>
                <div class="w-[100px] h-[100px] rounded-full bg-slate-800 border-[5px] border-yellow-400 shadow-[0_0_25px_rgba(250,204,21,0.4)] overflow-hidden mb-[-25px] z-10">
                  <img v-if="topThree[0].avatar_url" :src="topThree[0].avatar_url" class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full flex items-center justify-center text-3xl">👤</div>
                </div>
                <div class="w-full bg-gradient-to-b from-yellow-900/40 to-slate-800/80 border border-yellow-500/50 rounded-t-3xl pt-10 pb-5 flex flex-col items-center shadow-[0_-10px_20px_rgba(250,204,21,0.1)]">
                  <span class="font-black text-yellow-400 text-lg truncate w-full text-center px-3">{{ topThree[0].username || '無名氏' }}</span>
                  <span class="text-base font-mono font-black mt-1.5" :class="activeTab === 'tower' ? 'text-yellow-300' : 'text-indigo-300'">
                    <template v-if="activeTab === 'tower'">{{ topThree[0].best_floor !== null ? topThree[0].best_floor + 'F' : '未加入' }}</template>
                    <template v-else>Lv.{{ topThree[0].level }}</template>
                  </span>
                </div>
              </div>

              <div v-if="topThree[2]" class="flex flex-col items-center w-52 transform translate-y-12">
                <div class="text-5xl drop-shadow-[0_0_12px_#fb923c] mb-3 z-10">🥉</div>
                <div class="w-20 h-20 rounded-full bg-slate-800 border-[3px] border-orange-400 shadow-[0_0_20px_rgba(251,146,60,0.3)] overflow-hidden mb-[-20px] z-10">
                  <img v-if="topThree[2].avatar_url" :src="topThree[2].avatar_url" class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full flex items-center justify-center text-2xl">👤</div>
                </div>
                <div class="w-full bg-slate-800/80 border border-slate-700 rounded-t-3xl pt-8 pb-4 flex flex-col items-center shadow-lg">
                  <span class="font-black text-slate-200 text-base truncate w-full text-center px-3">{{ topThree[2].username || '無名氏' }}</span>
                  <span class="text-sm font-mono font-bold mt-1.5" :class="activeTab === 'tower' ? 'text-yellow-400' : 'text-indigo-400'">
                    <template v-if="activeTab === 'tower'">{{ topThree[2].best_floor !== null ? topThree[2].best_floor + 'F' : '未加入' }}</template>
                    <template v-else>Lv.{{ topThree[2].level }}</template>
                  </span>
                </div>
              </div>
            </div>

            <div class="bg-[#0A101A] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
              <div class="flex items-center px-8 py-4 bg-black/40 border-b border-white/5 text-xs font-black text-slate-500 uppercase tracking-widest">
                <div class="w-16 text-center">Rank</div>
                <div class="flex-1 pl-5">Hacker Profile</div>
                <div class="w-40 text-center">{{ activeTab === 'tower' ? 'Max Floor' : 'Level' }}</div>
                <div v-if="activeTab === 'global'" class="w-32 text-right">Total EXP</div>
              </div>

              <div class="flex flex-col">
                <div 
                  v-for="(player, index) in restPlayers" 
                  :key="player.id"
                  class="flex items-center px-8 py-4 border-b border-white/5 hover:bg-white/5 transition-colors"
                  :class="{'bg-indigo-900/20 border-l-[5px] border-l-indigo-500': player.id === currentUserId}"
                >
                  <div class="w-16 text-center font-black text-slate-600 text-lg">
                    #{{ index + 4 }}
                  </div>
                  
                  <div class="flex-1 pl-5 flex items-center gap-4">
                    <div class="w-10 h-10 rounded-xl overflow-hidden bg-black/50 border border-white/10 shrink-0">
                      <img v-if="player.avatar_url" :src="player.avatar_url" class="w-full h-full object-cover" />
                      <div v-else class="w-full h-full flex items-center justify-center text-sm">👤</div>
                    </div>
                    <div class="font-bold text-slate-300 text-base">
                      {{ player.username || '無名氏' }}
                      <span v-if="player.id === currentUserId" class="ml-3 text-[11px] bg-indigo-500 text-white px-2 py-1 rounded-full font-mono tracking-widest">YOU</span>
                    </div>
                  </div>

                  <div class="w-40 text-center font-mono font-black text-lg" :class="activeTab === 'tower' ? 'text-yellow-500' : 'text-indigo-400'">
                    <template v-if="activeTab === 'tower'">
                      <span v-if="player.best_floor !== null">{{ player.best_floor }} <span class="text-xs text-slate-500 font-sans">F</span></span>
                      <span v-else class="text-xs text-slate-500 tracking-widest font-sans">未加入高塔</span>
                    </template>
                    <template v-else>
                      {{ player.level }}
                    </template>
                  </div>

                  <div v-if="activeTab === 'global'" class="w-32 text-right font-mono font-bold text-slate-500 text-sm">
                    {{ player.total_exp?.toLocaleString() || 0 }}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { supabase } from '../../supabase.js';

const props = defineProps(['currentUserId']);
const emit = defineEmits(['close']);

const activeTab = ref('tower');
const isLoading = ref(true);

// 存放所有從資料庫抓來的原始資料
const rawProfiles = ref([]);
const rawTowerData = ref([]);

// 最終整理過並排序的資料
const leaderboardData = ref([]);

// 將資料拆分為前三名和剩下的名單
const topThree = computed(() => leaderboardData.value.slice(0, 3));
const restPlayers = computed(() => leaderboardData.value.slice(3));

// 🌟 一次性抓取「所有玩家」與「高塔紀錄」並合併
const fetchData = async () => {
  isLoading.value = true;
  try {
    // 併發兩個請求以加快速度
    const [profilesRes, towerRes] = await Promise.all([
      supabase.from('profiles').select('id, username, avatar_url, level, total_exp'),
      supabase.from('tower_lobby').select('user_id, best_floor')
    ]);

    if (profilesRes.data) rawProfiles.value = profilesRes.data;
    if (towerRes.data) rawTowerData.value = towerRes.data;

    applySorting(); // 抓完資料後，根據當前 Tab 進行排序
  } catch (err) {
    console.error('資料庫同步失敗:', err);
  } finally {
    isLoading.value = false;
  }
};

// 🌟 根據選擇的標籤進行排序
const applySorting = () => {
  // 1. 先把高塔資料合併進 profiles 裡面
  let mergedData = rawProfiles.value.map(profile => {
    const towerRecord = rawTowerData.value.find(t => t.user_id === profile.id);
    return {
      ...profile,
      best_floor: towerRecord ? towerRecord.best_floor : null // 找不到高塔紀錄就是 null
    };
  });

  // 2. 根據目前分頁排序
  if (activeTab.value === 'tower') {
    // 高塔榜：有層數的排前面(數字大到小)，沒層數的排最後面
    mergedData.sort((a, b) => {
      const floorA = a.best_floor !== null ? a.best_floor : -1;
      const floorB = b.best_floor !== null ? b.best_floor : -1;
      
      if (floorA !== floorB) {
        return floorB - floorA; // 降冪排列
      }
      // 層數一樣(或都未加入)時，等級高的排前面
      return (b.level || 0) - (a.level || 0);
    });
  } else {
    // 全服榜：比等級，等級一樣比總經驗
    mergedData.sort((a, b) => {
      if (a.level !== b.level) {
        return (b.level || 0) - (a.level || 0);
      }
      return (b.total_exp || 0) - (a.total_exp || 0);
    });
  }

  // 3. 截取前 50 名顯示
  leaderboardData.value = mergedData.slice(0, 50);
};

const switchTab = (tab) => {
  activeTab.value = tab;
  applySorting(); // 切換分頁不用重新 fetch，直接重新排序就好，極致順暢！
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.2); }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(234, 179, 8, 0.3); border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(234, 179, 8, 0.6); }
</style>