<template>
  <header class="relative z-50 bg-[#0f0e17] border-b border-white/10 shadow-lg">
    <nav class="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
      
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-[0_0_15px_rgba(255,187,51,0.4)]" style="background: linear-gradient(135deg, #ffbb33, #ff8800);">⚡</div>
        <span class="text-xl font-bold tracking-wider" style="font-family:'Fredoka',sans-serif;color:#f0f0f0;">Code Quest</span>
      </div>

      <div class="hidden md:flex items-center gap-8">
        <a href="#courses" class="nav-item text-[15px] font-bold" style="color:#a0a0b8;">探索課程</a> 
        <a href="#introduce" class="nav-item text-[15px] font-bold" style="color:#a0a0b8;">遊戲介紹</a> 
        <button @click="$emit('enter-dashboard')" class="px-5 py-2.5 rounded-lg text-[15px] font-black shadow-[0_4px_15px_rgba(255,187,51,0.3)] hover:scale-105 transition-transform" style="background:#ffbb33;color:#0f0e17;">登入 / 進入大廳</button>
      </div>

      <button class="md:hidden p-2 focus:outline-none" @click="isMobileMenuOpen = !isMobileMenuOpen" aria-label="切換選單"> 
        <svg v-if="!isMobileMenuOpen" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffbb33" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffbb33" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
      </button>
    </nav>
    
    <transition name="mobile-menu">
      <div v-show="isMobileMenuOpen" class="md:hidden absolute top-full left-0 w-full bg-[#151423] border-b border-white/10 shadow-2xl flex flex-col">
        <div class="px-6 py-4 flex flex-col gap-2">
          
          <a href="#courses" @click="isMobileMenuOpen = false" class="flex items-center gap-3 text-[16px] font-bold py-3.5 px-4 rounded-xl active:bg-white/5 transition-colors" style="color:#e0e0e0;">
            <span class="text-xl">🗺️</span> 探索課程
          </a> 
          <a href="#leaderboard" @click="isMobileMenuOpen = false" class="flex items-center gap-3 text-[16px] font-bold py-3.5 px-4 rounded-xl active:bg-white/5 transition-colors" style="color:#e0e0e0;">
            <span class="text-xl">🏆</span> 排行榜
          </a> 
          <a href="#achievements" @click="isMobileMenuOpen = false" class="flex items-center gap-3 text-[16px] font-bold py-3.5 px-4 rounded-xl active:bg-white/5 transition-colors" style="color:#e0e0e0;">
            <span class="text-xl">🏅</span> 成就系統
          </a> 
          
          <div class="h-[1px] w-full bg-white/10 my-2"></div> <button @click="$emit('enter-dashboard'); isMobileMenuOpen = false" class="mt-2 flex items-center justify-center gap-2 px-4 py-4 rounded-xl text-[16px] font-black active:scale-[0.98] transition-transform shadow-[0_4px_15px_rgba(255,187,51,0.3)]" style="background: linear-gradient(135deg, #ffbb33, #ff8800); color:#0f0e17;">
            <span>🚀 登入 / 進入大廳</span>
          </button>
          
          <div class="mt-5 flex items-start gap-3 p-3.5 rounded-xl bg-[#0f0e17] border border-[#ffbb33]/30 shadow-inner">
            <span class="text-xl leading-none mt-0.5">💻</span>
            <p class="text-[13px] leading-relaxed text-[#a0a0b8] font-medium">
              <strong class="text-[#ffbb33]">輕量探索模式</strong><br>
              手機版僅開放社交與查詢功能。如需編寫程式碼，請使用電腦裝置登入。
            </p>
          </div>

        </div>
      </div>
    </transition>
  </header>
</template>

<script setup>
import { ref } from 'vue';

const isMobileMenuOpen = ref(false);
const emit = defineEmits(['enter-dashboard']);
</script>

<style scoped>
/* 保持你原本的 Hover 效果 */
.nav-item {
  position: relative;
  transition: color 0.2s;
}
.nav-item::after {
  content: '';
  position: absolute;
  bottom: -4px; left: 0;
  width: 0; height: 2px;
  background-color: #ffbb33;
  transition: width 0.3s ease-out; /* 稍微加個 ease-out 讓動畫更絲滑 */
}
.nav-item:hover::after { width: 100%; }
.nav-item:hover { color: #f0f0f0 !important; }

.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  transform-origin: top;
}
.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-15px) scaleY(0.95);
}
</style>