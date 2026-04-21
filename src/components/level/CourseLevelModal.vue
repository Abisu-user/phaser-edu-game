<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div class="bg-[#1e1e2e] border border-[#333355] w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl slide-up">
        
        <div class="px-8 py-6 border-b border-[#333355] flex items-center justify-between bg-[#1a1a2e]">
          <div class="flex items-center gap-4">
            <div class="text-4xl">{{ courseIcon }}</div>
            <div>
              <h2 class="text-2xl font-bold text-[#f0f0f0] font-['Fredoka']">{{ courseTitle }}</h2>
              <p class="text-[#a0a0b8] text-sm">請選擇挑戰關卡</p>
            </div>
          </div>
          <button @click="$emit('close')" class="text-[#a0a0b8] hover:text-white transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div class="p-8 max-h-[60vh] overflow-y-auto grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
          <button
            v-for="lvl in levelsList"
            :key="lvl.level_number"
            @click="!lvl.is_locked ? $emit('select-level', lvl.level_number) : null"
            class="relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all group p-4"
            :class="lvl.is_locked ? 'bg-[#1a1a2e] opacity-50 cursor-not-allowed' : 'bg-[#252540] hover:bg-[#2d2d50] hover:-translate-y-1 shadow-lg'"
          >
            <span class="text-base font-black mb-2" :style="{ color: lvl.is_locked ? '#444' : '#00d4aa' }">
              Level {{ lvl.level_number }}
            </span>
            
            <span v-if="!lvl.is_locked" class="text-sm font-bold text-[#f0f0f0] px-2 leading-snug w-full text-center drop-shadow-md">
              {{ lvl.title }}
            </span>
            
            <div v-if="lvl.is_locked" class="absolute bottom-3 text-[#444]">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            
            <div v-else-if="lvl.is_completed" class="absolute bottom-2 right-2 text-[#00d4aa]">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            </div>
          </button>
        </div>
        <div class="px-8 py-4 bg-[#11111b] text-center">
          <p class="text-xs text-[#a0a0b8]">
            💡 通關當前關卡即可解鎖下一關。目前進度：{{ completedCount }} / {{ totalLevelsCount }} 關卡
          </p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  isOpen: Boolean,
  courseId: String,
  courseTitle: String,
  courseIcon: String,
  unlockedLevel: [Number, String],
  levelsList: {
    type: Array,
    default: () => []
  },
  totalLevels: { type: Number, default: 20 }
});

const emit = defineEmits(['close', 'select-level']);

const selectLevel = (n) => {
  if (n <= props.unlockedLevel) {
    emit('select-level', { courseId: props.courseId, levelId: n });
  }
};

const totalLevelsCount = computed(() => props.levelsList.length);
const completedCount = computed(() => props.levelsList.filter(l => l.is_completed).length);
</script>

<style scoped>
.slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes slide-up {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>