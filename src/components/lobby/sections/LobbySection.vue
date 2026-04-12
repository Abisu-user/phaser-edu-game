<template>
  <div class="flex flex-col gap-6">
    
    <div class="bg-opacity-50 rounded-2xl p-6" style="background:linear-gradient(135deg, rgba(30,30,46,0.5), rgba(42,42,78,0.3));border:1px solid #333366;">
      <div class="flex items-center justify-between mb-3">
        <span class="font-semibold text-[#f0f0f0]">下一階段進度</span> 
        <span class="text-[#ffbb33] font-['Fredoka'] font-bold">{{ xpPercent }}%</span>
      </div>
      <div class="w-full h-4 rounded-full overflow-hidden bg-[#1e1e2e]">
        <div class="h-full rounded-full transition-all duration-1000 ease-out" 
             :style="{ width: xpPercent + '%', background: 'linear-gradient(90deg,#ffbb33,#ff8800)', boxShadow: '0 0 20px rgba(255,187,51,0.5)' }"></div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      <div class="md:col-span-2">
        <div 
          v-if="lastPlayed"
          @click="$emit('continue-game', { courseId: lastPlayed.courseId, levelId: lastPlayed.nextLevel || 1 })"
          class="rounded-2xl p-6 border border-[#00d4aa44] relative overflow-hidden group cursor-pointer flex flex-col justify-center h-full transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(0,212,170,0.15)]" 
          style="background:linear-gradient(160deg,#1e1e2e,#252540);"
        >
          <div class="absolute top-0 right-0 w-32 h-32 bg-[#00d4aa] opacity-5 rounded-full blur-3xl group-hover:opacity-20 transition-opacity duration-500"></div>
          <p class="text-[#00d4aa] text-xs font-bold tracking-wider mb-2 uppercase z-10">上次遊玩</p>
          
          <div class="flex items-center justify-between z-10">
            <div>
              <h3 class="text-2xl font-bold text-[#f0f0f0] font-['Fredoka'] mb-1">
                {{ lastPlayed.icon }} {{ lastPlayed.title }}
              </h3>
              <p class="text-[#a0a0b8] text-sm">推薦挑戰：第 {{ lastPlayed.nextLevel || 1 }} 關</p>
            </div>

            <div class="w-12 h-12 rounded-full bg-[#00d4aa] flex items-center justify-center text-[#0f0e17] group-hover:bg-[#00e6b8] transition-colors shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </div>
          </div>
        </div>

        <div v-else class="rounded-2xl p-6 border border-[#333355] relative overflow-hidden bg-[#1a1a2e] flex flex-col justify-center h-full">
          <p class="text-[#a0a0b8] text-xs font-bold tracking-wider mb-2 uppercase">上次遊玩</p>
          <h3 class="text-2xl font-bold text-[#f0f0f0] font-['Fredoka'] mb-1">🥚 旅程尚未開始</h3>
          <p class="text-[#a0a0b8] text-sm">前往「課程」頁籤挑選你的第一堂課吧！</p>
        </div>
      </div>

      <div class="md:col-span-1">
        <div class="rounded-2xl p-6 border border-[#333355] bg-[#1a1a2e] flex flex-col justify-center h-full">
          <h3 class="text-lg font-bold text-[#f0f0f0] font-['Fredoka'] mb-4">📊 戰力統計</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-[#1e1e2e] p-4 rounded-xl text-center border border-[#333344]">
              <div class="text-[#a78bfa] text-2xl font-bold font-['Fredoka'] mb-1">{{ clearedLevelsCount }}</div>
              <div class="text-[#a0a0b8] text-[10px] uppercase">已通關卡</div>
            </div>
            <div class="bg-[#1e1e2e] p-4 rounded-xl text-center border border-[#333344]">
              <div class="text-[#ff6b6b] text-2xl font-bold font-['Fredoka'] mb-1">{{ consecutiveDays }}</div>
              <div class="text-[#a0a0b8] text-[10px] uppercase">連登天數</div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      <div class="md:col-span-2">
        <div class="rounded-2xl p-6 border border-[#333355] bg-[#1a1a2e] h-full">
          <h3 class="text-lg font-bold text-[#f0f0f0] font-['Fredoka'] mb-4 flex items-center gap-2">
            <span>📜</span> 每日任務
          </h3>
          <div class="space-y-4">
            <div 
              v-for="quest in dailyQuests" 
              :key="quest.id"
              class="group flex items-center justify-between p-4 rounded-2xl border transition-colors"
              :class="quest.isClaimed ? 'bg-black/10 border-[#00d4aa]/20' : (quest.progress >= quest.target ? 'bg-[#ffbb33]/10 border-[#ffbb33]/50 shadow-[0_0_15px_rgba(255,187,51,0.1)]' : 'bg-black/20 border-white/5 hover:border-white/20')"
            >
              <div class="flex items-center gap-4">
                <div v-if="quest.isClaimed" class="w-8 h-8 rounded-full bg-[#00d4aa]/20 flex items-center justify-center text-[#00d4aa]">✓</div>
                <div v-else-if="quest.progress >= quest.target" class="w-8 h-8 rounded-full bg-[#ffbb33] flex items-center justify-center text-[#0a0e27] animate-bounce">🎁</div>
                <div v-else class="w-8 h-8 rounded-full border-2 border-white/20 flex items-center justify-center"></div>
                
                <div>
                  <p class="font-bold text-sm" :class="quest.isClaimed ? 'text-white/50' : 'text-white'">{{ quest.title }}</p>
                  <p class="text-xs" :class="quest.isClaimed ? 'text-[#00d4aa]/50' : 'text-[#a0a0b8]'">
                    <span v-if="quest.isClaimed">已領取獎勵</span>
                    <span v-else>{{ quest.desc }} ({{ quest.progress }}/{{ quest.target }})</span>
                  </p>
                </div>
              </div>
              
              <button 
                v-if="quest.progress >= quest.target && !quest.isClaimed" 
                @click="$emit('claim-quest', quest.id)"
                class="text-[#0a0e27] bg-[#ffbb33] hover:bg-[#ffaa00] transition-colors text-sm font-bold px-4 py-2 rounded-xl shadow-[0_0_10px_rgba(255,187,51,0.4)] hover:-translate-y-0.5"
              >
                領取獎勵
              </button>
              <span 
                v-else 
                class="text-sm font-bold px-3 py-1 rounded-lg"
                :class="quest.isClaimed ? 'text-white/30 line-through bg-transparent' : 'text-[#ffbb33] bg-[#ffbb33]/10 border border-[#ffbb33]/20'"
              >
                +{{ quest.xp }} XP
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="md:col-span-1">
        <div class="rounded-2xl p-6 border border-[#333355] bg-[#1a1a2e] h-full flex flex-col">
          <h3 class="text-lg font-bold text-[#f0f0f0] font-['Fredoka'] mb-4 flex items-center gap-2">
            <span>🎖️</span> 榮譽徽章
          </h3>
          
          <div class="grid grid-cols-3 gap-3 flex-1 content-start">
            <div 
              v-for="badge in badges.slice(0, 6)" 
              :key="badge.id"
              class="aspect-square rounded-2xl flex flex-col items-center justify-center relative cursor-pointer transition-all duration-300"
              :class="badge.isUnlocked 
                ? 'bg-gradient-to-br from-[#ffbb33]/20 to-transparent border border-[#ffbb33]/40 hover:scale-105 shadow-inner group' 
                : 'bg-black/20 border border-white/5 opacity-50'"
            >
              <template v-if="badge.isUnlocked">
                <span class="text-3xl mb-1 drop-shadow-md group-hover:rotate-12 transition-transform">{{ badge.icon }}</span>
                <span class="text-[10px] text-[#ffbb33] font-bold tracking-wider truncate w-full text-center px-1">{{ badge.name }}</span>
              </template>
              
              <template v-else>
                <span class="text-xl mb-1 text-white/30">🔒</span>
                <span class="text-[9px] text-white/40 tracking-wider font-semibold uppercase">Locked</span>
              </template>
            </div>
          </div>
          
          <button @click="$emit('go-to-achievements')" class="w-full mt-4 py-2 text-xs font-semibold text-[#a0a0b8] hover:text-[#00d4aa] transition-colors border border-transparent hover:border-[#00d4aa44] rounded-lg">
            查看所有徽章 →
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
defineProps({
  xpPercent: { type: Number, required: true },
  lastPlayed: { type: Object, default: null },
  clearedLevelsCount: { type: Number, default: 0 },
  dailyQuests: { type: Array, default: () => [] },
  badges: { type: Array, default: () => [] },
  consecutiveDays: { type: Number, default: 1 },
});
defineEmits(['trigger-level-up', 'continue-game', 'claim-quest', 'go-to-achievements']);
</script>