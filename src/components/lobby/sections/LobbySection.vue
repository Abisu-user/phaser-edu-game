<template>
  <div class="flex flex-col gap-6 md:gap-8">
    
    <div class="bg-opacity-50 rounded-[24px] p-6 md:p-8" style="background:linear-gradient(135deg, rgba(30,30,46,0.5), rgba(42,42,78,0.3));border:1px solid #333366;">
      <div class="flex items-center justify-between mb-4">
        <span class="font-semibold text-[#f0f0f0]">下一階段進度</span> 
        <span class="text-[#ffbb33] font-['Fredoka'] font-bold text-lg">{{ xpPercent }}%</span>
      </div>
      <div class="w-full h-5 rounded-full overflow-hidden bg-[#1e1e2e]">
        <div class="h-full rounded-full transition-all duration-1000 ease-out" 
             :style="{ width: xpPercent + '%', background: 'linear-gradient(90deg,#ffbb33,#ff8800)', boxShadow: '0 0 20px rgba(255,187,51,0.5)' }"></div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
      
      <div class="md:col-span-2 flex flex-col gap-6 md:gap-8">
        
        <div v-if="lastPlayed" @click="$emit('continue-game', { courseId: lastPlayed.courseId, levelId: lastPlayed.nextLevel || 1 })"
             class="rounded-[24px] p-6 md:p-8 border border-[#00d4aa44] relative overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_8px_30px_rgba(0,212,170,0.15)] min-h-[160px] flex flex-col justify-center" 
             style="background:linear-gradient(160deg,#1e1e2e,#252540);">
          <div class="absolute top-0 right-0 w-48 h-48 bg-[#00d4aa] opacity-5 rounded-full blur-3xl group-hover:opacity-15 transition-opacity duration-500"></div>
          <p class="text-[#00d4aa] text-xs font-bold tracking-widest mb-3 uppercase relative z-10">上次遊玩</p>
          <div class="flex items-center justify-between relative z-10">
            <div>
              <h3 class="text-3xl font-bold text-[#f0f0f0] font-['Fredoka'] mb-2">{{ lastPlayed.icon }} {{ lastPlayed.title }}</h3>
              <p class="text-[#a0a0b8] text-sm">推薦挑戰：第 {{ lastPlayed.nextLevel || 1 }} 關</p>
            </div>
            <div class="w-14 h-14 rounded-full bg-[#00d4aa] flex items-center justify-center text-[#0f0e17] group-hover:bg-[#00e6b8] group-hover:scale-110 transition-all shadow-[0_0_20px_rgba(0,212,170,0.4)] shrink-0 ml-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </div>
          </div>
        </div>

        <div v-else class="rounded-[24px] p-6 md:p-8 border border-[#333355] bg-[#1a1a2e] relative overflow-hidden flex flex-col justify-center min-h-[160px]">
          <p class="text-[#a0a0b8] text-xs font-bold tracking-widest mb-3 uppercase relative z-10">上次遊玩</p>
          <h3 class="text-3xl font-bold text-[#f0f0f0] font-['Fredoka'] mb-2 relative z-10">🥚 旅程尚未開始</h3>
          <p class="text-[#a0a0b8] text-sm relative z-10">前往「課程」頁籤挑選第一堂課吧！</p>
        </div>

        <div class="rounded-[24px] p-6 md:p-8 border border-[#333355] bg-[#1a1a2e] flex-1 flex flex-col">
          <h3 class="text-xl font-bold text-[#f0f0f0] font-['Fredoka'] mb-5 flex items-center gap-3"><span>📜</span> 每日任務</h3>
          <div class="space-y-4 flex-1">
            <div v-for="quest in dailyQuests" :key="quest.id" class="group flex items-center justify-between p-5 rounded-2xl border transition-colors"
                 :class="quest.isClaimed ? 'bg-black/10 border-[#00d4aa]/20' : (quest.progress >= quest.target ? 'bg-[#ffbb33]/10 border-[#ffbb33]/50 shadow-[0_0_15px_rgba(255,187,51,0.05)]' : 'bg-black/20 border-white/5')">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg" :class="quest.isClaimed ? 'border-[#00d4aa]/50 text-[#00d4aa]' : 'border-white/20 text-transparent'">{{ quest.isClaimed ? '✓' : '' }}</div>
                <div>
                  <p class="font-bold text-[15px]" :class="quest.isClaimed ? 'text-white/50' : 'text-white'">{{ quest.title }}</p>
                  <p class="text-xs text-[#a0a0b8] mt-1">{{ quest.desc }}</p>
                </div>
              </div>
              <button v-if="quest.progress >= quest.target && !quest.isClaimed" @click="$emit('claim-quest', quest.id)" class="text-[#0a0e27] bg-[#ffbb33] px-5 py-2.5 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(255,187,51,0.4)] hover:scale-105 transition-transform">領取</button>
            </div>
          </div>
        </div>

      </div>

      <div class="md:col-span-1 flex flex-col gap-6 md:gap-8">
        
        <div class="rounded-[24px] p-6 border border-[#333355] bg-[#1a1a2e] relative overflow-hidden flex flex-col justify-center">
          <p class="text-[#a78bfa] text-xs font-bold tracking-widest mb-4 uppercase">數據統計</p>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-black/20 rounded-xl p-4 border border-white/5 flex flex-col justify-center items-center text-center">
              <span class="text-xs text-[#a0a0b8] font-medium mb-1.5">已通關卡</span>
              <span class="text-3xl font-bold text-white font-['Fredoka']">{{ clearedLevelsCount }} <span class="text-xs text-white/40 font-sans">關</span></span>
            </div>
            <div class="bg-black/20 rounded-xl p-4 border border-white/5 flex flex-col justify-center items-center text-center">
              <span class="text-xs text-[#a0a0b8] font-medium mb-1.5">連續登入</span>
              <span class="text-3xl font-bold text-[#ffbb33] font-['Fredoka']">{{ consecutiveDays }} <span class="text-xs text-[#ffbb33]/60 font-sans">天</span></span>
            </div>
          </div>
        </div>

        <div class="rounded-[24px] p-6 border border-[#333355] bg-[#1a1a2e] flex-1 flex flex-col">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold text-[#f0f0f0] font-['Fredoka'] flex items-center gap-3"><span>🎖️</span> 榮譽徽章</h3>
            <button @click="openEditModal" class="text-xs bg-white/10 hover:bg-[#ffbb33] hover:text-[#0a0e27] text-white/70 px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all font-bold">
              <span>✏️</span> 編輯
            </button>
          </div>
          
          <template v-if="displayBadges.length > 0">
            <div class="grid grid-cols-3 gap-3 mb-auto content-start">
              <div v-for="badge in displayBadges" :key="badge.id" class="aspect-square rounded-2xl flex flex-col items-center justify-center bg-gradient-to-br from-[#ffbb33]/25 to-transparent border border-[#ffbb33]/40 shadow-[inset_0_0_15px_rgba(255,187,51,0.1)] group">
                <span class="text-4xl md:text-5xl mb-2 group-hover:scale-110 transition-transform drop-shadow-lg">{{ badge.icon }}</span>
                <span class="text-[10px] md:text-xs text-[#ffbb33] font-bold truncate w-full text-center px-1">{{ badge.name }}</span>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="flex-1 flex flex-col items-center justify-center p-6 bg-black/20 border border-white/5 rounded-2xl text-center mb-auto">
              <span class="text-5xl filter grayscale opacity-40 mb-4">🔒</span>
              <p class="text-xs text-white/20">尚未展示任何徽章</p>
            </div>
          </template>
          
          <button @click="$emit('go-to-achievements')" class="w-full mt-auto py-4 text-sm font-bold tracking-widest text-[#a0a0b8] hover:text-[#0a0e27] hover:bg-[#00d4aa] transition-all border border-[#333355] hover:border-transparent rounded-xl">
            前往榮譽殿堂 →
          </button>
        </div>

      </div>
    </div>

    <Teleport to="body">
      <div v-if="isEditingBadges" class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-serif" @click.self="closeEditModal">
        
        <div v-if="!showPicker" class="bg-[#12141d] border border-[#ffbb33]/30 rounded-3xl p-8 max-w-[500px] w-full shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative overflow-hidden transition-all duration-300">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-white flex items-center gap-2"><span class="text-[#ffbb33]">📌</span> 自訂展示牆</h2>
            <button @click="closeEditModal" class="text-white/40 hover:text-red-400 text-2xl transition-colors">✕</button>
          </div>

          <p class="text-[#a0a0b8] text-sm mb-6">你可以選擇最多 6 個已解鎖的榮譽徽章展示在首頁。</p>

          <div class="grid grid-cols-3 gap-4 mb-8">
            <div v-for="(badgeId, index) in tempPinned" :key="index" class="aspect-square relative rounded-2xl">
              
              <div v-if="badgeId && getBadgeData(badgeId)" class="w-full h-full bg-gradient-to-br from-[#ffbb33]/25 to-transparent border border-[#ffbb33]/50 flex flex-col items-center justify-center rounded-2xl group cursor-pointer" @click="removeBadge(index)">
                <button class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-black shadow-lg hover:bg-red-600 hover:scale-110 transition-transform z-10 opacity-0 group-hover:opacity-100">✕</button>
                <span class="text-4xl drop-shadow-lg mb-2">{{ getBadgeData(badgeId).icon }}</span>
                <span class="text-[11px] text-[#ffbb33] font-bold w-full text-center truncate px-2">{{ getBadgeData(badgeId).name }}</span>
              </div>

              <button v-else @click="openPicker(index)" class="w-full h-full border-2 border-dashed border-white/20 hover:border-[#00d4aa] bg-white/5 hover:bg-[#00d4aa]/10 flex items-center justify-center rounded-2xl transition-all group">
                <span class="text-4xl text-white/20 group-hover:text-[#00d4aa] group-hover:scale-110 transition-all">+</span>
              </button>
            </div>
          </div>

          <div class="flex gap-4">
            <button @click="closeEditModal" class="flex-1 py-3 rounded-xl font-bold text-[#a0a0b8] bg-white/10 hover:bg-white/20 transition-all">取消</button>
            <button @click="savePinnedBadges" class="flex-1 py-3 rounded-xl font-bold text-[#0a0e27] bg-gradient-to-r from-[#00d4aa] to-[#00a884] shadow-[0_0_15px_rgba(0,212,170,0.3)] hover:scale-[1.02] transition-all">儲存展示</button>
          </div>
        </div>

        <div v-if="showPicker" class="bg-[#12141d] border border-[#00d4aa]/30 rounded-3xl p-8 max-w-[600px] w-full shadow-[0_20px_60px_rgba(0,0,0,0.8)] transition-all duration-300">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-white flex items-center gap-2">選擇徽章</h2>
            <button @click="showPicker = false" class="text-white/40 hover:text-white transition-colors font-bold px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10">返回</button>
          </div>

          <div class="grid grid-cols-4 gap-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
            <button 
              v-for="badge in availableBadges" 
              :key="badge.id"
              @click="selectBadge(badge.id)"
              class="aspect-square bg-white/5 hover:bg-[#ffbb33]/20 border border-white/10 hover:border-[#ffbb33] rounded-2xl flex flex-col items-center justify-center transition-all group"
            >
              <span class="text-4xl mb-2 group-hover:scale-110 transition-transform drop-shadow-md">{{ badge.icon }}</span>
              <span class="text-[11px] text-white/70 font-bold px-1 text-center leading-tight">{{ badge.name }}</span>
            </button>

            <div v-if="availableBadges.length === 0" class="col-span-4 py-16 text-center text-white/40 font-bold">
              目前沒有其他可裝備的已解鎖徽章
            </div>
          </div>
        </div>

      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  xpPercent: { type: Number, required: true },
  lastPlayed: { type: Object, default: null },
  clearedLevelsCount: { type: Number, default: 0 },
  dailyQuests: { type: Array, default: () => [] },
  badges: { type: Array, default: () => [] },
  consecutiveDays: { type: Number, default: 1 },
  pinnedBadges: { type: Array, default: () => [] },
});

const emit = defineEmits([
  'trigger-level-up', 
  'continue-game', 
  'claim-quest', 
  'go-to-achievements', 
  'save-pinned'
]);

// === 大廳的展示邏輯 ===
const displayBadges = computed(() => {
  if (props.pinnedBadges && props.pinnedBadges.length > 0) {
    return props.pinnedBadges.map(id => props.badges.find(b => b.id === id)).filter(Boolean);
  }
  return props.badges.filter(b => b.isUnlocked).slice(0, 6);
});

// === 🌟 編輯器邏輯 ===
const isEditingBadges = ref(false);
const showPicker = ref(false);
const activeSlot = ref(0);
const tempPinned = ref([null, null, null, null, null, null]);

// 開啟編輯器
const openEditModal = () => {
  tempPinned.value = Array.from({ length: 6 }, (_, i) => props.pinnedBadges[i] || null);
  isEditingBadges.value = true;
  showPicker.value = false;
};

// 關閉編輯器
const closeEditModal = () => {
  isEditingBadges.value = false;
  showPicker.value = false;
};

// 取得徽章詳細資料
const getBadgeData = (id) => {
  return props.badges.find(b => b.id === id);
};

// 移除格子內的徽章
const removeBadge = (index) => {
  tempPinned.value[index] = null;
};

// 開啟挑選面板
const openPicker = (index) => {
  activeSlot.value = index;
  showPicker.value = true;
};

// 選定徽章放入格子
const selectBadge = (badgeId) => {
  tempPinned.value[activeSlot.value] = badgeId;
  showPicker.value = false;
};

// 儲存並發送給父層
const savePinnedBadges = () => {
  const finalBadges = tempPinned.value.filter(id => id !== null);
  emit('save-pinned', finalBadges);
  closeEditModal();
};

// 計算可以被挑選的徽章：必須是「已解鎖」且「不在目前的 tempPinned 裡面」
const availableBadges = computed(() => {
  return props.badges.filter(b => b.isUnlocked && !tempPinned.value.includes(b.id));
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.4); }
</style>