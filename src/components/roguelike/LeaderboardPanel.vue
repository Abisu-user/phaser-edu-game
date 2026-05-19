<template>
  <transition name="fade">
    <div class="absolute inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-serif" @click.self="$emit('close')">
      
      <div class="w-[1125px] max-w-[95vw] h-[935px] max-h-[90vh] bg-[#1A0F0A] border-[6px] border-double border-[#8C6239] rounded-sm shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden transform transition-all relative">
        
        <div class="absolute inset-0 bg-[#0F0805] opacity-60 pointer-events-none"></div>

        <header class="h-20 px-8 bg-[#150C08] border-b-4 border-[#4A2E1B] flex items-center justify-between shrink-0 relative z-10 shadow-[0_5px_15px_rgba(0,0,0,0.8)]">
          <div class="flex items-center gap-4">
            <span class="text-3xl drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">👑</span>
            <h2 class="text-2xl font-black text-[#FFD700] tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
              公會榮譽榜 
              <span class="text-sm text-[#8C6239] ml-4 font-bold tracking-widest">Hall of Heroes</span>
            </h2>
          </div>
          <div class="flex items-center gap-5">
            <button @click="fetchData" class="text-xs bg-[#3E2723] hover:bg-[#5D4037] text-[#D7CCC8] font-bold px-4 py-2 rounded-sm border-2 border-[#8C6239] border-b-4 hover:border-b-2 hover:translate-y-[2px] active:border-b-2 active:translate-y-[2px] transition-all flex items-center gap-2 shadow-[0_4px_10px_rgba(0,0,0,0.6)]">
              <span :class="{'animate-spin': isLoading}">🔄</span> 翻閱名冊
            </button>
            <button @click="$emit('close')" class="text-[#8C6239] hover:text-[#FF0000] text-4xl font-black transition-colors w-10 h-10 flex items-center justify-center hover:scale-110 drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">×</button>
          </div>
        </header>

        <div class="flex border-b-4 border-[#2A1810] bg-[#150C08] shrink-0 relative z-10 shadow-[0_5px_10px_rgba(0,0,0,0.5)]">
          <button 
            @click="switchTab('tower')" 
            class="flex-1 py-4 text-lg font-black tracking-widest transition-all relative"
            :class="activeTab === 'tower' ? 'text-[#FFD700] bg-[#3A2318] border-b-[4px] border-[#DAA520] shadow-[inset_0_-2px_10px_rgba(218,165,32,0.2)]' : 'text-[#8C6239] hover:text-[#D7CCC8] hover:bg-white/5 border-b-[4px] border-transparent'"
          >
            🗼 深淵攻略榜
          </button>
          <button 
            @click="switchTab('global')" 
            class="flex-1 py-4 text-lg font-black tracking-widest transition-all relative"
            :class="activeTab === 'global' ? 'text-[#8FBC8F] bg-[#1A2F1A] border-b-[4px] border-[#2E8B57] shadow-[inset_0_-2px_10px_rgba(46,139,87,0.2)]' : 'text-[#8C6239] hover:text-[#D7CCC8] hover:bg-white/5 border-b-[4px] border-transparent'"
          >
            🌍 冒險者總榜
          </button>
        </div>

        <main class="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-10">
          
          <div v-if="isLoading" class="absolute inset-0 flex flex-col items-center justify-center z-50 bg-[#0F0805]/90 backdrop-blur-sm">
            <span class="text-6xl animate-bounce mb-5 drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">📜</span>
            <p class="font-bold tracking-widest animate-pulse text-[#DAA520] text-xl drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">正在翻閱古老公會名冊...</p>
          </div>

          <div v-if="!isLoading && leaderboardData.length > 0" class="flex flex-col gap-10 max-w-5xl mx-auto">
            
            <div class="flex items-end justify-center gap-5 pt-10 pb-5 shrink-0">
              
              <div v-if="topThree[1]" class="flex flex-col items-center w-52 transform translate-y-8">
                <div class="text-5xl drop-shadow-[0_2px_10px_rgba(192,192,192,0.6)] mb-3 z-10">🥈</div>
                <div class="w-20 h-20 rounded-full bg-[#1C110C] border-[4px] border-[#C0C0C0] shadow-[0_0_20px_rgba(192,192,192,0.3)] overflow-hidden mb-[-20px] z-10 relative">
                  <img v-if="topThree[1].avatar_url" :src="topThree[1].avatar_url" class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full flex items-center justify-center text-3xl">🧙‍♂️</div>
                </div>
                <div class="w-full bg-[#1C110C] border-2 border-[#593922] border-t-0 rounded-sm pt-8 pb-4 flex flex-col items-center shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
                  <span class="font-black text-[#F5DEB3] text-base truncate w-full text-center px-3 drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">{{ topThree[1].username || '無名冒險者' }}</span>
                  <span class="text-sm font-bold mt-1.5" :class="activeTab === 'tower' ? 'text-[#DAA520]' : 'text-[#8FBC8F]'">
                    <template v-if="activeTab === 'tower'">{{ topThree[1].best_floor !== null ? topThree[1].best_floor + ' 階' : '尚未探索' }}</template>
                    <template v-else>Lv.{{ topThree[1].level }}</template>
                  </span>
                </div>
              </div>

              <div v-if="topThree[0]" class="flex flex-col items-center w-60 z-20 relative">
                <div class="absolute top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-[#DAA520]/20 blur-2xl rounded-full pointer-events-none"></div>
                <div class="text-6xl drop-shadow-[0_0_20px_rgba(218,165,32,0.8)] mb-3 z-10 animate-bounce">👑</div>
                <div class="w-[100px] h-[100px] rounded-full bg-[#1C110C] border-[6px] border-[#FFD700] shadow-[0_0_30px_rgba(255,215,0,0.5)] overflow-hidden mb-[-25px] z-10 relative">
                  <img v-if="topThree[0].avatar_url" :src="topThree[0].avatar_url" class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full flex items-center justify-center text-4xl">🧙‍♂️</div>
                </div>
                <div class="w-full bg-gradient-to-b from-[#8B0000] to-[#3E1010] border-2 border-[#DAA520] rounded-sm pt-10 pb-5 flex flex-col items-center shadow-[0_15px_30px_rgba(0,0,0,0.9)] relative">
                  <div class="absolute inset-0 border border-[#FFD700]/30 m-1 pointer-events-none"></div>
                  <span class="font-black text-[#FFD700] text-xl truncate w-full text-center px-3 drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">{{ topThree[0].username || '無名冒險者' }}</span>
                  <span class="text-lg font-black mt-1.5 drop-shadow-[0_2px_2px_rgba(0,0,0,1)]" :class="activeTab === 'tower' ? 'text-[#FFF8DC]' : 'text-[#D1FAB7]'">
                    <template v-if="activeTab === 'tower'">{{ topThree[0].best_floor !== null ? topThree[0].best_floor + ' 階' : '尚未探索' }}</template>
                    <template v-else>Lv.{{ topThree[0].level }}</template>
                  </span>
                </div>
              </div>

              <div v-if="topThree[2]" class="flex flex-col items-center w-52 transform translate-y-12">
                <div class="text-5xl drop-shadow-[0_2px_10px_rgba(205,127,50,0.6)] mb-3 z-10">🥉</div>
                <div class="w-20 h-20 rounded-full bg-[#1C110C] border-[4px] border-[#CD7F32] shadow-[0_0_20px_rgba(205,127,50,0.3)] overflow-hidden mb-[-20px] z-10 relative">
                  <img v-if="topThree[2].avatar_url" :src="topThree[2].avatar_url" class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full flex items-center justify-center text-3xl">🧙‍♂️</div>
                </div>
                <div class="w-full bg-[#1C110C] border-2 border-[#593922] border-t-0 rounded-sm pt-8 pb-4 flex flex-col items-center shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
                  <span class="font-black text-[#F5DEB3] text-base truncate w-full text-center px-3 drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">{{ topThree[2].username || '無名冒險者' }}</span>
                  <span class="text-sm font-bold mt-1.5" :class="activeTab === 'tower' ? 'text-[#DAA520]' : 'text-[#8FBC8F]'">
                    <template v-if="activeTab === 'tower'">{{ topThree[2].best_floor !== null ? topThree[2].best_floor + ' 階' : '尚未探索' }}</template>
                    <template v-else>Lv.{{ topThree[2].level }}</template>
                  </span>
                </div>
              </div>
            </div>

            <div class="bg-[#EAD8B1] border-[4px] border-double border-[#8C6239] shadow-[8px_8px_20px_rgba(0,0,0,0.8)] relative text-[#3A2318] p-1">
              
              <div class="flex items-center px-8 py-4 bg-[#C8B693] border-b-2 border-[#8C6239] text-sm font-black text-[#593922] tracking-widest shadow-inner">
                <div class="w-16 text-center">排名</div>
                <div class="flex-1 pl-5">冒險者名號</div>
                <div class="w-40 text-center">{{ activeTab === 'tower' ? '最深到達階層' : '公會等級' }}</div>
                <div v-if="activeTab === 'global'" class="w-32 text-right">累積奉獻 (EXP)</div>
              </div>

              <div class="flex flex-col bg-[#F5DEB3]">
                <div 
                  v-for="(player, index) in restPlayers" 
                  :key="player.id"
                  class="flex items-center px-8 py-4 border-b border-[#D4C3A3] transition-colors"
                  :class="player.id === currentUserId 
                    ? 'bg-[#D2B48C] border-l-[6px] border-l-[#8B0000] shadow-[inset_0_0_10px_rgba(139,0,0,0.1)]' 
                    : 'hover:bg-[#EAD8B1]'"
                >
                  <div class="w-16 text-center font-black text-[#593922] text-xl drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">
                    #{{ index + 4 }}
                  </div>
                  
                  <div class="flex-1 pl-5 flex items-center gap-4">
                    <div class="w-10 h-10 rounded-sm overflow-hidden bg-[#1C110C] border-2 border-[#8C6239] shrink-0 shadow-sm">
                      <img v-if="player.avatar_url" :src="player.avatar_url" class="w-full h-full object-cover" />
                      <div v-else class="w-full h-full flex items-center justify-center text-sm">🧙‍♂️</div>
                    </div>
                    <div class="font-black text-[#3A2318] text-lg tracking-wide drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">
                      {{ player.username || '無名冒險者' }}
                      <span v-if="player.id === currentUserId" class="ml-3 text-[11px] bg-[#8B0000] text-[#FFD700] px-2.5 py-1 rounded-sm border border-[#593922] shadow-[1px_1px_0_rgba(0,0,0,0.5)] tracking-widest relative -top-0.5">
                        本人
                      </span>
                    </div>
                  </div>

                  <div class="w-40 text-center font-black text-xl drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]" :class="activeTab === 'tower' ? 'text-[#B8860B]' : 'text-[#2E8B57]'">
                    <template v-if="activeTab === 'tower'">
                      <span v-if="player.best_floor !== null">{{ player.best_floor }} <span class="text-sm text-[#8C6239] ml-1">階</span></span>
                      <span v-else class="text-sm text-[#8C6239] tracking-widest">尚未探索</span>
                    </template>
                    <template v-else>
                      Lv.{{ player.level }}
                    </template>
                  </div>

                  <div v-if="activeTab === 'global'" class="w-32 text-right font-bold text-[#8C6239] text-base drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">
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

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* 滾動條改為適合羊皮紙與木質的深棕色系 */
.custom-scrollbar::-webkit-scrollbar { width: 8px; }
.custom-scrollbar::-webkit-scrollbar-track { background: rgba(20, 10, 5, 0.6); border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #593922; border-radius: 4px; border: 1px solid #3A2318; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #8C6239; }
</style>

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