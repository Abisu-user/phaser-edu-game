<template>
  <div class="tower-lobby relative h-full w-full bg-[#1A100C] text-[#E8D4B4] overflow-hidden font-serif">
    
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] pointer-events-none flex items-center justify-center animate-magical-breathe">
      <div class="absolute w-full h-full border-4 border-double border-[#8C6239] rounded-full shadow-[0_0_60px_rgba(184,134,11,0.2)] animate-spin-extremely-slow"></div>
      
      <div class="absolute w-[80%] h-[80%] border-2 border-dashed border-[#DAA520]/20 rounded-full animate-spin-reverse-extremely-slow"></div>

      <svg viewBox="0 0 100 100" class="absolute w-[60%] h-[60%] text-[#DAA520] fill-transparent stroke-current stroke-[0.8] drop-shadow-[0_0_25px_rgba(218,165,32,0.4)]">
        <polygon points="50,10 90,90 10,90" /> <polygon points="50,90 90,10 10,10" class="opacity-60" /> <circle cx="50" cy="50" r="5" fill="#DAA520" fill-opacity="0.2"/> </svg>
    </div>

    <div class="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-amber-600/10 blur-[120px] rounded-full pointer-events-none"></div>
    <div class="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-red-700/10 blur-[150px] rounded-full pointer-events-none"></div>

    <header class="absolute top-0 w-full px-8 py-6 z-30 flex justify-between items-start pointer-events-none border-b-[3px] border-[#3A2318] bg-gradient-to-b from-[#25150E] to-transparent shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
      
      <div class="flex items-center gap-5 bg-[#2A1810] border-2 border-[#593922] p-3 pr-6 rounded-r-full shadow-[4px_4px_10px_rgba(0,0,0,0.5)] pointer-events-auto transition-opacity duration-500 relative" :class="{ 'opacity-0': isLoading }">
        <div class="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#8C6239] shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.8)]"></div>
        
        <div class="w-16 h-16 bg-[#150C08] border-[3px] border-[#B8860B] rounded-md flex items-center justify-center text-4xl shadow-[inset_0_0_15px_rgba(0,0,0,1)] overflow-hidden shrink-0 relative">
          <div class="absolute inset-0 border border-[#F5DEB3]/30 m-[2px]"></div>
          <img v-if="avatarUrl" :src="avatarUrl" alt="Player Avatar" class="w-full h-full object-cover" @error="avatarUrl = ''" />
          <span v-else>🧙‍♂️</span>
        </div>

        <div>
          <div class="flex items-center gap-3 mb-1.5">
            <span class="font-black text-[#F5DEB3] tracking-widest text-xl drop-shadow-[1px_2px_0_rgba(0,0,0,1)]">{{ playerName }}</span>
            <span class="px-2 py-0.5 bg-[#4A0E17] text-[#FFD700] text-xs font-bold border border-[#8B0000] shadow-[1px_1px_0_rgba(0,0,0,0.8)]">Lv.{{ playerLevel }}</span>
            <div class="text-[11px] font-black text-[#DAA520] tracking-widest mb-0.5 drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">
              <span class="opacity-70">《</span>{{ currentTitle }}<span class="opacity-70">》</span>
            </div>
          </div>
          
          <div class="w-56 h-2.5 bg-[#150C08] border-[1px] border-[#593922] shadow-[inset_0_2px_5px_rgba(0,0,0,1)] overflow-hidden relative p-[1px]">
            <div class="h-full bg-gradient-to-r from-red-700 to-red-400 transition-all duration-1000 relative" :style="{ width: Math.min((xp / requiredXp) * 100, 100) + '%' }">
              <div class="absolute top-0 left-0 w-full h-[30%] bg-white/20"></div>
            </div>
          </div>
          
          <div class="text-[11px] text-[#A08060] font-mono font-bold mt-1 tracking-wider flex justify-between w-56 drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">
            <span>EXP 經驗值</span>
            <span class="text-[#F5DEB3]">{{ xp }} / {{ requiredXp }}</span>
          </div>
        </div>
      </div>

     <div class="flex flex-col items-end gap-3 pointer-events-auto transition-opacity duration-500" :class="{ 'opacity-0': isLoading }">
        <div class="bg-[#2A1810] border-2 border-[#B8860B] px-6 py-2 flex items-center gap-3 shadow-[0_5px_15px_rgba(0,0,0,0.6)] rounded-l-full relative">
          <div class="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#8C6239] shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.8)]"></div>
          <span class="text-2xl drop-shadow-[0_2px_5px_rgba(255,215,0,0.4)] ml-4">🪙</span>
          <span class="font-bold text-[#FFD700] text-xl drop-shadow-[1px_2px_0_rgba(0,0,0,1)] tracking-wider">{{ coins }}</span>
        </div>
        
        <transition name="fade" mode="out-in">
          <div v-if="hasPermanentBuff" class="flex items-center gap-2 text-xs font-bold text-[#FFD700] bg-[#3A2318]/90 border border-[#DAA520] px-4 py-1.5 shadow-[2px_2px_0_rgba(0,0,0,0.8)]">
            <span class="animate-pulse">✨</span> 女神眷顧: EXP +25%
          </div>
          <div v-else-if="hasTemporaryBuff" class="flex items-center gap-2 text-xs font-bold text-[#8FBC8F] bg-[#1A2F1A]/90 border border-[#2E8B57] px-4 py-1.5 shadow-[2px_2px_0_rgba(0,0,0,0.8)]" :class="{ 'text-red-400 border-red-500': isBuffExpiring }">
            <span class="animate-spin-slow">⏳</span> 聖女祈禱: EXP +15% 
            <span class="text-white ml-1 bg-black/40 px-1.5 rounded">{{ timeRemaining }}</span>
          </div>
        </transition>
      </div>
    </header>

    <main class="relative z-20 w-full h-full flex items-center justify-between px-16 pt-20">
      
      <div class="w-[380px] flex flex-col gap-6 transform transition-all duration-700 translate-x-0">
        
        <div class="bg-[#EAD8B1] border-[6px] border-double border-[#8C6239] p-6 shadow-[8px_8px_20px_rgba(0,0,0,0.8)] relative text-[#3A2318]">
          <div class="absolute top-2 left-2 w-3 h-3 bg-zinc-800 rounded-full shadow-sm"></div>
          <div class="absolute top-2 right-2 w-3 h-3 bg-zinc-800 rounded-full shadow-sm"></div>
          <div class="absolute bottom-2 left-2 w-3 h-3 bg-zinc-800 rounded-full shadow-sm"></div>
          <div class="absolute bottom-2 right-2 w-3 h-3 bg-zinc-800 rounded-full shadow-sm"></div>
          
          <div class="flex justify-center items-center gap-2 mb-6 border-b-2 border-[#8C6239] pb-3">
            <span class="text-xl">📜</span>
            <h3 class="font-black tracking-widest text-xl">公會緊急委託</h3>
            <span class="text-xl">📜</span>
          </div>
          
          <div class="space-y-4 font-bold">
            <div>
              <div class="flex justify-between text-sm mb-2">
                <span>討伐無盡地下城</span>
                <span class="text-red-700">0 / 1</span>
              </div>
              <div class="w-full h-3 bg-[#C8B693] border border-[#8C6239] shadow-inner p-[1px]">
                <div class="h-full bg-[#8B0000] w-[0%]"></div>
              </div>
            </div>
            <div class="absolute bottom-4 right-4 text-red-700/40 font-black text-4xl transform -rotate-12 border-4 border-red-700/40 p-1 rounded-sm">
              PENDING
            </div>
          </div>
        </div>

        <div class="grid grid-cols-4 gap-3">
          <button 
            v-for="menu in menus" 
            :key="menu.name" 
            @click="handleMenuClick(menu.name)"
            class="group flex flex-col items-center justify-center gap-2 py-4 bg-[#3E2723] hover:bg-[#5D4037] border-2 border-[#8D6E63] border-b-4 hover:border-b-2 hover:translate-y-[2px] transition-all duration-100 shadow-[2px_4px_10px_rgba(0,0,0,0.6)] relative overflow-hidden"
          >
            <div class="absolute inset-0 border border-white/5 m-[2px]"></div>
            <span class="text-3xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] group-hover:scale-110 transition-transform">{{ menu.icon }}</span>
            <span class="text-[11px] font-bold text-[#D7CCC8] group-hover:text-white">{{ menu.name }}</span>
          </button>
        </div>
      </div>

      <div class="flex-1 flex flex-col items-center justify-center mt-8">
        <div class="text-center relative z-10">
          <div class="text-[#FFD700] font-bold tracking-[0.5em] text-sm uppercase mb-4 drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">Chronicles of the Abyss</div>
          <h1 class="text-[7rem] md:text-[8rem] leading-none font-black text-transparent bg-clip-text bg-gradient-to-b from-[#FFF8DC] via-[#DAA520] to-[#8B6508] drop-shadow-[0_10px_0_rgba(20,10,0,1)] filter brightness-110">ENDLESS</h1>
          <h1 class="text-[4.5rem] leading-none font-black text-[#F5DEB3] tracking-[0.3em] mt-2 drop-shadow-[0_5px_0_rgba(20,10,0,1)] border-t border-b border-[#DAA520]/30 py-2">DUNGEON</h1>
        </div>

        <div class="mt-16 flex flex-col items-center gap-5 w-full max-w-[420px] relative z-10">
          
          <button @click="handleStartNew" class="group relative w-full py-5 bg-[#8B0000] border-4 border-[#DAA520] border-b-[8px] hover:border-b-4 hover:translate-y-[4px] active:border-b-4 active:translate-y-[4px] transition-all shadow-[0_15px_30px_rgba(0,0,0,0.8)]" :disabled="isLoading">
            <div class="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
            <div class="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 -translate-x-[150%] group-hover:animate-sweep"></div>
            <span class="relative z-10 text-2xl font-black tracking-widest flex items-center justify-center gap-3 text-[#FFF8DC] drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
              {{ isLoading ? '召喚法陣準備中...' : (activeSave ? '⚠️ 放棄探索' : '⚔️ 踏入地下城') }}
            </span>
          </button>

          <button 
            v-if="activeSave" 
            @click="handleContinue" 
            class="group w-full py-4 bg-[#1A365D] border-2 border-[#4299E1] border-b-[6px] hover:border-b-2 hover:translate-y-[4px] transition-all shadow-[0_10px_20px_rgba(0,0,0,0.6)] text-[#EBF8FF] font-bold tracking-widest flex items-center justify-center gap-3 relative"
          >
            <div class="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></div>
            <span class="text-xl">🔮</span>
            <span>接續先前的探索</span>
            <span class="text-xs bg-[#000000]/50 px-2 py-1 border border-[#4299E1]/50 ml-2 shadow-[inset_0_0_5px_rgba(0,0,0,0.8)]">
              地下 {{ activeSave.current_floor }} 階
            </span>
          </button>
          
          <button @click="$emit('exit')" class="mt-4 text-sm font-bold text-[#8C6239] hover:text-[#DAA520] transition-colors drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">
            【 離開公會 返回城鎮 】
          </button>
        </div>
      </div>

      <div class="w-[380px] flex flex-col gap-6">
        
        <div class="bg-[#1C110C] border-2 border-[#D4AF37] p-6 shadow-[8px_8px_20px_rgba(0,0,0,0.8)] relative">
          <div class="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#D4AF37]"></div>
          <div class="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#D4AF37]"></div>
          <div class="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#D4AF37]"></div>
          <div class="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#D4AF37]"></div>
          
          <div class="text-[#D4AF37] text-sm font-black uppercase mb-4 tracking-widest flex items-center justify-center gap-2 border-b border-[#D4AF37]/30 pb-3">
            <span class="text-xl">👑</span> 英雄殿堂紀錄
          </div>
          
          <div class="flex items-end justify-between mt-6">
            <div>
              <div class="text-xs text-[#8C6239] mb-1 font-bold">最高通關階層</div>
              <div class="text-6xl font-black text-[#FFF8DC] drop-shadow-[0_2px_10px_rgba(212,175,55,0.2)]">
                {{ bestFloor }}<span class="text-2xl text-[#8C6239] ml-1">階</span>
              </div>
            </div>
            <div class="text-right">
              <div class="text-xs text-[#8C6239] mb-1 font-bold">冒險者評級</div>
              <div class="text-4xl font-black font-serif italic drop-shadow-[0_2px_4px_rgba(0,0,0,1)] transform -rotate-6" :class="rankColor">
                {{ adventurerRank }}
              </div>
            </div>
          </div>
        </div>

        <div class="bg-[#2C2C2C] border-4 border-[#1A1A1A] p-6 shadow-[8px_8px_20px_rgba(0,0,0,0.9)]">
          <div class="flex justify-between items-center mb-4 border-b-2 border-[#404040] pb-3">
            <div class="text-[#A0A0A0] text-sm font-black tracking-widest flex items-center gap-2">
              <span class="text-xl">⚔️</span> 戰鬥流派分析
            </div>
          </div>
          <div class="mb-5">
            <div class="text-xs text-[#808080] mb-1 font-bold">根據屬性推演出的流派</div>
            <div class="font-black text-[#FFF8DC] tracking-widest text-lg drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">
              {{ combatStyle.name }}
            </div>
          </div>
          <div class="flex gap-4">
            <div v-for="(icon, idx) in combatStyle.icons" :key="idx" class="w-14 h-14 bg-[#111] border-2 border-[#000] rounded-sm flex items-center justify-center text-3xl shadow-[inset_0_4px_10px_rgba(0,0,0,1)] cursor-help hover:bg-[#222] transition-colors relative">
              <div class="absolute inset-0 border border-[#555] m-[1px]"></div>
              {{ icon }}
            </div>
          </div>
        </div>
      </div>
    </main>

    <ShopPanel v-if="isShopOpen" :coins="coins" :playerLevel="playerLevel" :maxHp="max_hp" :maxMp="max_mp" :maxAp="max_ap" :maxAtk="max_atk" @close="isShopOpen = false" @purchase="handlePurchase" />
    <InventoryPanel v-if="isInventoryOpen" :inventory="inventory" @close="isInventoryOpen = false" @use="useItem" />
    <DictionaryPanel v-if="isDictionaryOpen" :inventory="inventory" @close="isDictionaryOpen = false" />
    <LeaderboardPanel v-if="isLeaderboardOpen" :currentUserId="currentUserId" @close="isLeaderboardOpen = false" />
    <StatUpgradePanel v-if="isStatUpgradeOpen" :currentUserId="currentUserId" :level="playerLevel" :points="stat_points" :coins="coins" :stats="{ max_hp: max_hp, max_mp: max_mp, max_ap: max_ap, max_atk: max_atk }" @close="isStatUpgradeOpen = false" @updated="fetchPlayerData" />
    <AchievementPanel v-if="isAchievementOpen" :achievements="allAchievements" :currentTitle="currentTitle" @close="isAchievementOpen = false" @equip="handleEquipTitle"
/>
  </div>
</template>

<style scoped>
.animate-sweep { animation: sweep 2.5s ease-in-out infinite; }
@keyframes sweep {
  0% { transform: translateX(-150%) skewX(20deg); }
  30%, 100% { transform: translateX(250%) skewX(20deg); }
}

.animate-spin-extremely-slow { animation: spin 180s linear infinite; }
.animate-spin-reverse-extremely-slow { animation: spin 150s linear infinite reverse; }

.animate-magical-breathe { animation: magical-breathe 8s ease-in-out infinite; }
@keyframes magical-breathe {
  0%, 100% { opacity: 0.08; filter: drop-shadow(0 0 20px rgba(218,165,32,0.1)); }
  50% { opacity: 0.15; filter: drop-shadow(0 0 40px rgba(218,165,32,0.3)); }
}
</style>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { supabase } from '../../supabase.js';
import { BADGE_LIST } from '../../game/config/badges.js';
import ShopPanel from './ShopPanel.vue';
import InventoryPanel from './InventoryPanel.vue';
import DictionaryPanel from './DictionaryPanel.vue';
import LeaderboardPanel from './LeaderboardPanel.vue';
import StatUpgradePanel from './StatUpgradePanel.vue';
import AchievementPanel from './AchievementPanel.vue';

const emit = defineEmits(['start', 'exit']);

// === 狀態管理 ===
const isLoading = ref(true);
const currentUserId = ref(null);
const isShopOpen = ref(false);
const isInventoryOpen = ref(false);
const isDictionaryOpen = ref(false);
const isLeaderboardOpen = ref(false);
const isStatUpgradeOpen = ref(false);
const isAchievementOpen = ref(false);
const inventory = ref([]);
const stat_points = ref(0);

const playerName = ref('連線中...');
const playerLevel = ref(1);
const xp = ref(0);
const total_exp = ref(0);
const coins = ref(0);
const max_hp = ref(100);
const max_mp = ref(50);
const max_ap = ref(30);
const max_atk = ref(10); 
const bestFloor = ref(0);
const expPercent = ref(0);
const avatarUrl = ref(''); 
const actionMessage = ref('');
const currentTitle = ref('見習冒險者');
const unlockedAchievements= ref(['first_steps']);
const requiredXp = computed(() => {
  return 1000 + (playerLevel.value - 1) * 500;
});

const rawLobbyData = ref(null);
const activeSave = ref(null);

// ==========================================
// 🌟 1. 冒險者評級邏輯 (每 10 層一階)
// ==========================================
const adventurerRank = computed(() => {
  const f = bestFloor.value;
  if (f >= 80) return 'SSS';
  if (f >= 70) return 'SS';
  if (f >= 60) return 'S';
  if (f >= 50) return 'A';
  if (f >= 40) return 'B';
  if (f >= 30) return 'C';
  if (f >= 20) return 'D';
  if (f >= 10) return 'E';
  return 'F';
});

const rankColor = computed(() => {
  const r = adventurerRank.value;
  if (r.includes('S')) return 'text-[#FFD700]'; // 閃耀金
  if (r === 'A') return 'text-[#FF4500]'; // 橘紅
  if (r === 'B') return 'text-[#9370DB]'; // 史詩紫
  if (r === 'C') return 'text-[#4169E1]'; // 稀有藍
  if (r === 'D') return 'text-[#32CD32]'; // 優秀綠
  return 'text-[#A0A0A0]'; // E與F 普通灰
});

// ==========================================
// 🌟 2. 動態作戰流派判斷 (根據投資的屬性點數)
// ==========================================
const combatStyle = computed(() => {
  // 換算各屬性投資了「多少點」 (減去基礎值並除以每點收益)
  const ptsHP = (max_hp.value - 100) / 10;
  const ptsMP = (max_mp.value - 50) / 5;
  const ptsAP = (max_ap.value - 30) / 2;
  const ptsATK = (max_atk.value - 10) / 1;

  const totalPts = ptsHP + ptsMP + ptsAP + ptsATK;

  // 如果完全沒點，或是點數極低
  if (totalPts === 0) {
    return { name: '見習冒險者 (Novice)', icons: ['🎒', '🕯️'] };
  }

  // 排序屬性，找出最高的前兩名
  const stats = [
    { id: 'hp', pts: ptsHP, icon: '❤️' },
    { id: 'mp', pts: ptsMP, icon: '🔮' },
    { id: 'ap', pts: ptsAP, icon: '⚡' },
    { id: 'atk', pts: ptsATK, icon: '⚔️' }
  ].sort((a, b) => b.pts - a.pts);

  const primary = stats[0];
  const secondary = stats[1];

  let name = '';
  
  // 根據最高的屬性決定流派基調
  if (primary.id === 'atk') name = '毀滅破劍者 (Berserker)';
  else if (primary.id === 'mp') name = '深淵大魔導 (Archmage)';
  else if (primary.id === 'hp') name = '不滅之神盾 (Paladin)';
  else if (primary.id === 'ap') name = '幻影風行者 (Assassin)';

  // 如果第一名跟第二名點數很接近 (平衡流派)
  if (primary.pts > 0 && (primary.pts - secondary.pts <= Math.max(2, totalPts * 0.15))) {
     if ((primary.id === 'atk' && secondary.id === 'mp') || (primary.id === 'mp' && secondary.id === 'atk')) name = '魔劍士 (Magic Knight)';
     else if ((primary.id === 'hp' && secondary.id === 'atk') || (primary.id === 'atk' && secondary.id === 'hp')) name = '重裝戰士 (Heavy Warrior)';
     else if ((primary.id === 'ap' && secondary.id === 'atk') || (primary.id === 'atk' && secondary.id === 'ap')) name = '致命刺客 (Deadly Rogue)';
     else name = '全能勇者 (Wandering Hero)';
  }

  return {
    name,
    icons: [primary.icon, secondary.icon]
  };
});

const allAchievements = computed(() => {
  // 將大廳的變數統整成一個 stats 物件
  const currentStats = {
    currentTotalXP: total_exp.value,
    currentLevel: playerLevel.value,
    bestFloor: bestFloor.value,
    coins: coins.value,
    clearedLevelsCount: rawLobbyData.value?.clearedLevelsCount || 0 
  };

  // 映射出完整的成就清單，供 Panel 使用
  return BADGE_LIST.map(badge => {
    return {
      ...badge,
      progress: badge.getCurrent(currentStats),
      isUnlocked: badge.checkUnlock(currentStats)
    };
  });
});

const handleEquipTitle = async (newTitle) => {
  currentTitle.value = newTitle; // 先在本地端切換畫面
  
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ current_title: newTitle })
      .eq('id', currentUserId.value);

    if (!error) {
      // 利用原本寫好的 actionMessage 來顯示成功提示
      actionMessage.value = `已裝備稱號：《${newTitle}》`;
      setTimeout(() => { actionMessage.value = ''; }, 2000);
    } else {
      console.error("❌ 更新稱號失敗:", error);
    }
  } catch (err) {
    console.error("❌ 裝備稱號發生錯誤:", err);
  }
};

// === 獲取資料庫資料 ===
const fetchPlayerData = async () => {
  try {
    isLoading.value = true;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    currentUserId.value = session.user.id;

    const [towerRes, profileRes] = await Promise.all([
      supabase.from('tower_lobby').select('*').eq('user_id', session.user.id).limit(1),
      supabase.from('profiles').select('username, avatar_url, level, xp, total_exp, stat_points, current_title, total_kills, boss_kills, total_deaths, passive_count').eq('id', session.user.id).single()
    ]);

    let towerData = towerRes.data?.[0] || null; 
    const profileData = profileRes.data;

    if (!towerData) {
      console.log("🆕 第一次進入高塔，正在從全服 Profile 初始化資料...");
      
      const { data: newData } = await supabase
        .from('tower_lobby')
        .insert([{
            user_id: session.user.id,
            username: profileData?.username || '無名駭客',
            avatar_url: profileData?.avatar_url || '',
            level: profileData?.level || 1,
            xp: profileData?.xp || 0,
            total_exp: profileData?.total_exp || 0,
            stat_points: profileData?.stat_points || 0,
            currentTitle: profileData?.current_title || '見習冒險者',
            max_hp: 100,
            max_mp: 50,
            max_ap: 30,
            max_atk: 10,
            coins: 0,
            best_floor: 1
        }])
        .select()
        .single();
      
      towerData = newData;
    } else {
      if (towerData.level !== profileData.level || towerData.xp !== profileData.xp || towerData.stat_points !== profileData.stat_points) {
    
          let finalPoints = towerData.stat_points; 
          const finalLevel = Math.max(towerData.level, profileData.level);

          if (profileData.level > towerData.level) {
              const levelDiff = profileData.level - towerData.level;
              finalPoints += (levelDiff * 5); 
          }

          await supabase.from('tower_lobby').update({
              level: finalLevel,
              xp: profileData?.xp ?? 0,
              total_exp: profileData?.total_exp ?? 0,
              stat_points: finalPoints,
          }).eq('user_id', session.user.id);

          await supabase.from('profiles').update({
              level: finalLevel,
              stat_points: finalPoints
          }).eq('id', session.user.id);
          
           towerData.level = finalLevel;
           towerData.xp = profileData?.xp ?? 0;
           towerData.total_exp = profileData?.total_exp ?? 0;
           towerData.stat_points = finalPoints;
      }
    }

    if (towerData) {
      rawLobbyData.value = towerData; 
      playerName.value = towerData.username;
      avatarUrl.value = towerData.avatar_url;
      playerLevel.value = towerData.level;
      xp.value = towerData.xp;
      total_exp.value = towerData.total_exp;
      coins.value = towerData.coins; 
      bestFloor.value = towerData.best_floor;
      max_hp.value = towerData.max_hp;
      max_mp.value = towerData.max_mp;
      max_ap.value = towerData.max_ap || 30;
      max_atk.value = towerData.max_atk || 10;
      inventory.value = towerData.inventory || []; 
      stat_points.value = towerData.stat_points || 0;

      const currentStats = {
        bestFloor: towerData.best_floor || 0,
        coins: towerData.coins || 0,
        totalKills: profileData?.total_kills || 0,
        bossKills: profileData?.boss_kills || 0,
        totalDeaths: profileData?.total_deaths || 0,
        passiveCount: profileData?.passive_count || 0
      };
    }

    const { data: saveData } = await supabase
      .from('tower_saves')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle();
      
    activeSave.value = saveData;

  } catch (err) {
    console.error('大廳初始化失敗:', err);
  } finally {
    isLoading.value = false;
  }
};

const handleStartNew = async () => {
  if (activeSave.value) {
    const confirmOverwrite = confirm('⚠️ 警告：您目前有未完成的作戰進度，開啟新局將會銷毀原本的進度。確定要繼續嗎？');
    if (!confirmOverwrite) return;
    
    isLoading.value = true;
    await supabase.from('tower_saves').delete().eq('user_id', currentUserId.value);
  }

  try {
    isLoading.value = true;
    const lobby = rawLobbyData.value;
    
    const { data: newSave, error } = await supabase
      .from('tower_saves')
      .insert([{ 
        user_id: currentUserId.value,
        current_floor: 1,              
        current_hp: lobby?.max_hp || 100,
        max_hp: lobby?.max_hp || 100,
        current_mp: lobby?.max_mp || 50,
        max_mp: lobby?.max_mp || 50,
        current_ap: lobby?.max_ap || 30,
        max_ap: lobby?.max_ap || 30,
        max_atk: lobby?.max_atk || 10,
        current_atk: lobby?.max_atk || 10,
        coins: lobby?.coins || 0,       
        level: lobby?.level || 1,       
        xp: lobby?.xp || 0,             
        total_exp: lobby?.total_exp || 0, 
        inventory: lobby?.inventory || [],
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
  if (activeSave.value) emit('start', activeSave.value);
};

onMounted(() => {
  fetchPlayerData();
});

const menus = [
  { name: '背包', icon: '👝' },
  { name: '商店', icon: '⚖️' },
  { name: '潛能', icon: '⚒️' },
  { name: '圖鑑', icon: '📜' },
  { name: '排行', icon: '👑' },
  { name: '成就', icon: '🏵️' },
];

const handleMenuClick = (menuName) => {
  if (menuName === '商店') isShopOpen.value = true;
  else if (menuName === '背包') isInventoryOpen.value = true;
  else if (menuName === '圖鑑') isDictionaryOpen.value = true;
  else if (menuName === '排行') isLeaderboardOpen.value = true;
  else if (menuName === '潛能') isStatUpgradeOpen.value = true;
  else if (menuName === '成就') isAchievementOpen.value = true;
  else alert(`系統提示：[${menuName}] 模組正在建構中...`);
};

const handlePurchase = async (payload) => {
  const { item, cost } = payload;
  coins.value -= cost;

  if (rawLobbyData.value) rawLobbyData.value.coins = coins.value;
  if (activeSave.value) activeSave.value.coins = coins.value;
  
  if (item.type === 'system') {
    await supabase.from('tower_lobby').update({ coins: coins.value }).eq('user_id', currentUserId.value);
    if (activeSave.value) await supabase.from('tower_saves').update({ coins: coins.value }).eq('user_id', currentUserId.value);
    return;
  }
  
  if (item.id === 'max_hp_up') { max_hp.value += 20; rawLobbyData.value.max_hp += 20; } 
  else if (item.id === 'atk_up') { max_atk.value += 5; rawLobbyData.value.max_atk += 5; } 
  else if (item.id === 'max_mp_up') { max_mp.value += 10; rawLobbyData.value.max_mp += 10; } 
  else if (item.id === 'max_ap_up') { max_ap.value += 10; rawLobbyData.value.max_ap += 10; } 
  // 🌟 特殊處理：限時祈禱 Buff
  else if (item.id === 'relic_holy_maiden_prayer') {
    const existing = inventory.value.find(i => i.id === item.id);
    if (existing) {
        existing.quantity += 1; // 變成累加數量，不設定時間
    } else {
        inventory.value.push({ ...item, quantity: 1 });
    }
  }
  // 🌟 特殊處理：永久眷顧 Buff
  else if (item.id === 'relic_goddess_blessing') {
    const existing = inventory.value.find(i => i.id === item.id);
    if (!existing) inventory.value.push({ ...item, quantity: 1 });
  }
  // 其他常規消耗品/解鎖
  else if (item.type === 'consumable' || item.type === 'unlock') {
    const existingItem = inventory.value.find(i => i.id === item.id);
    if (existingItem) existingItem.quantity += 1; 
    else inventory.value.push({ ...item, quantity: 1 }); 
  }

  if (activeSave.value) activeSave.value.inventory = inventory.value;
  
  const { error } = await supabase.from('tower_lobby').update({
      coins: coins.value, max_hp: max_hp.value, max_atk: max_atk.value, max_mp: max_mp.value, max_ap: max_ap.value, inventory: inventory.value 
    }).eq('user_id', currentUserId.value);

  if (activeSave.value && !error) {
    await supabase.from('tower_saves').update({ coins: coins.value, inventory: inventory.value }).eq('user_id', currentUserId.value);
  }

  if (error) console.error('❌ 同步資料庫失敗:', error);
  else console.log(`✅ 成功購買 [${item.name}] 並已同步至雲端資料庫！`);
};

const useItem = async (item) => {
  // 1. 聖女祈禱邏輯 (限時 buff)
  if (item.id === 'relic_holy_maiden_prayer') {
    const idx = inventory.value.findIndex(i => i.id === item.id);
    if (idx !== -1) {
      inventory.value[idx].quantity -= 1;
      inventory.value[idx].expiresAt = Date.now() + (15 * 60 * 1000);
      await updateInventory(inventory.value); 
    }
  } 
  // 2. 一般消耗品使用邏輯 (如果大廳允許使用的話)
  else if (item.type === 'consumable') {
    const idx = inventory.value.findIndex(i => i.id === item.id);
    if (idx !== -1) {
      if (inventory.value[idx].quantity > 1) {
        inventory.value[idx].quantity -= 1;
      } else {
        // 數量剩 1，且不是 Buff 道具，直接從陣列徹底移除
        inventory.value.splice(idx, 1);
      }
      await updateInventory(inventory.value);
    }
  }
};

// 🌟 這個函式才是與資料庫同步的核心
const updateInventory = async (newInventory) => {
  try {
    // 1. 同步到 tower_lobby (大廳資料)
    const { error } = await supabase
      .from('tower_lobby')
      .update({ inventory: newInventory })
      .eq('user_id', currentUserId.value);

    if (error) throw error;

    // 2. 如果戰局中也有存檔，同步過去 (防止局內背包顯示舊資料)
    if (activeSave.value) {
      await supabase
        .from('tower_saves')
        .update({ inventory: newInventory })
        .eq('user_id', currentUserId.value);
    }

    actionMessage.value = "使用成功！";
    setTimeout(() => { actionMessage.value = ''; }, 2000);
    
    console.log("✅ 背包已同步至雲端");
  } catch (err) {
    console.error("❌ 同步背包失敗:", err);
    alert("同步失敗，請檢查網路。");
  }
};

// ==========================================
// 🌟 3. Buff 狀態與倒數計時系統
// ==========================================
const currentTime = ref(Date.now());
let buffTimer = null;

onMounted(() => {
  fetchPlayerData();
  // 每秒更新一次當前時間，用來計算倒數
  buffTimer = setInterval(() => {
    currentTime.value = Date.now();
  }, 1000);
});

onUnmounted(() => {
  if (buffTimer) clearInterval(buffTimer);
});

// 判斷是否有永久 Buff
const hasPermanentBuff = computed(() => {
  return inventory.value.some(i => i.id === 'relic_goddess_blessing');
});

// 找出限時 Buff (如果存在且還沒過期)
const temporaryBuff = computed(() => {
  const buff = inventory.value.find(i => i.id === 'relic_holy_maiden_prayer');
  if (buff && buff.expiresAt && buff.expiresAt > currentTime.value) {
    return buff;
  }
  return null;
});

const hasTemporaryBuff = computed(() => !!temporaryBuff.value);

// 判斷快過期 (小於 1 分鐘) 讓字體變紅警告
const isBuffExpiring = computed(() => {
  if (!temporaryBuff.value) return false;
  return (temporaryBuff.value.expiresAt - currentTime.value) < 60000;
});

// 格式化倒數時間 (mm:ss)
const timeRemaining = computed(() => {
  if (!temporaryBuff.value) return '';
  const diff = temporaryBuff.value.expiresAt - currentTime.value;
  const m = Math.floor(diff / 60000).toString().padStart(2, '0');
  const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
  return `${m}:${s}`;
});
</script>
