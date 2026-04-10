<template>
  <header class="relative z-20 px-6 py-4 border-b flex-shrink-0" style="border-color:#1e1e2e;background:rgba(10,14,39,0.9);backdrop-filter:blur(10px);">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="text-2xl">⚡</div>
        <div>
          <p class="text-xs font-semibold" style="color:#a0a0b8;">歡迎回來</p>
          <p class="text-lg font-bold" style="color:#f0f0f0;">{{ playerName }}</p>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2 px-4 py-2 rounded-lg" style="background:#1e1e2e;">
          <span style="color:#ffbb33;">⭐</span> 
          <span class="text-sm font-bold" style="color:#ffbb33;">{{ currentXP }} / {{ xpPerLevel }}</span>
        </div>
        <div class="flex items-center gap-2 px-4 py-2 rounded-lg" style="background:#1e1e2e;">
          <span style="color:#a78bfa;">🏆</span> 
          <span class="text-sm font-bold" style="color:#a78bfa;">Lv. {{ currentLevel }}</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps({
  playerName: String,
  currentXP: Number,
  xpPerLevel: Number,
  currentLevel: Number
});
</script>