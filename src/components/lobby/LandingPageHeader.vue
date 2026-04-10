<template>
  <header class="relative z-10">
    <nav class="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
      <div class="flex items-center gap-2">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style="background: linear-gradient(135deg, #ffbb33, #ff8800);">⚡</div>
        <span class="text-xl font-bold" style="font-family:'Fredoka',sans-serif;color:#f0f0f0;">Code Quest</span>
      </div>
      <div class="hidden md:flex items-center gap-8">
        <a href="#courses" class="nav-item text-sm font-medium" style="color:#a0a0b8;">探索課程</a> 
        <a href="#leaderboard" class="nav-item text-sm font-medium" style="color:#a0a0b8;">排行榜</a> 
        <a href="#achievements" class="nav-item text-sm font-medium" style="color:#a0a0b8;">成就系統</a> 
        <button @click="$emit('enter-dashboard')" class="px-4 py-2 rounded-lg text-sm font-semibold" style="background:#ffbb33;color:#0f0e17;">登入</button>
      </div>
      <button class="md:hidden text-white" @click="isMobileMenuOpen = !isMobileMenuOpen" aria-label="開啟選單"> 
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
      </button>
    </nav>
    
    <div v-show="isMobileMenuOpen" class="md:hidden px-6 pb-4 flex flex-col gap-3">
      <a href="#courses" class="text-sm font-medium py-2" style="color:#a0a0b8;">探索課程</a> 
      <a href="#leaderboard" class="text-sm font-medium py-2" style="color:#a0a0b8;">排行榜</a> 
      <a href="#achievements" class="text-sm font-medium py-2" style="color:#a0a0b8;">成就系統</a> 
      <button class="px-4 py-2 rounded-lg text-sm font-semibold w-full" style="background:#ffbb33;color:#0f0e17;">登入</button>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue';
const isMobileMenuOpen = ref(false);
const emit = defineEmits(['enter-dashboard']);
</script>

<style scoped>
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
  transition: width 0.3s;
}
.nav-item:hover::after { width: 100%; }
.nav-item:hover { color: #f0f0f0 !important; }
</style>