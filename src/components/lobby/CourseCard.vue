<template>
  <div 
    class="course-card rounded-2xl p-6 transition-all duration-300"
    :class="{ 'cursor-not-allowed opacity-70': disabled, 'cursor-pointer hover:-translate-y-1.5 hover:scale-[1.02]': !disabled }"
    @click="handleClick"
    :style="{ 
      background: 'linear-gradient(160deg,#1e1e2e,#252540)', 
      border: disabled ? '1px dashed #555' : '1px solid #333355' 
    }"
  >
    <div class="text-4xl mb-4">{{ icon }}</div>
    <h3 class="text-xl font-bold mb-2" style="color:#f0f0f0;font-family:'Fredoka',sans-serif;">{{ title }}</h3>
    <p class="text-sm mb-4" style="color:#a0a0b8;">{{ description }}</p>
    
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="px-2 py-1 rounded-md text-xs font-semibold" :style="{ background: badgeBg, color: badgeColor }">{{ badgeText }}</span> 
        <span v-if="levelsText" class="text-xs" style="color:#a0a0b8;">{{ levelsText }}</span>
      </div>
    </div>
    
    <div class="mt-4 rounded-full h-2 overflow-hidden" style="background:#333355;">
      <div class="xp-bar h-full rounded-full transition-all duration-1000 ease-out" 
           style="width: 0%;" 
           :style="{ background: barGradient }" 
           :data-target="progress"></div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  icon: String,
  title: String,
  description: String,
  badgeText: String,
  badgeColor: String,
  badgeBg: String,
  levelsText: String,
  progress: [Number, String],
  barGradient: String,
  disabled: { type: Boolean, default: false }
});

const emit = defineEmits(['click']);

const handleClick = () => {
  if (!props.disabled) {
    emit('click');
  }
};
</script>

<style scoped>
.course-card { box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
.course-card:hover:not(.cursor-not-allowed) { box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2); }
</style>