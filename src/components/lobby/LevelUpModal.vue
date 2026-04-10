<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div class="bg-[#1e1e2e] border-2 border-[#ffbb33] p-8 rounded-2xl text-center max-w-sm w-full shadow-[0_0_40px_rgba(255,187,51,0.4)] transform transition-all scale-100">
        <div class="text-6xl mb-4">🏆</div>
        <h2 class="text-3xl font-bold text-[#f0f0f0] mb-2 font-['Fredoka']">恭喜升級！</h2>
        <p class="text-[#ffbb33] text-xl font-bold mb-6">達到了 Lv. {{ currentLevel }}</p>
        <button @click="$emit('close')" class="w-full py-3 rounded-xl font-bold text-gray-900 bg-gradient-to-r from-[#ffbb33] to-[#ff8800] hover:scale-105 transition-transform">
          領取獎勵並繼續
        </button>
      </div>
    </div>

    <div v-if="isOpen" class="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
      <div v-for="c in confettis" :key="c.id" class="confetti" :style="{ '--tx': c.tx + 'px', '--ty': c.ty + 'px', backgroundColor: c.color }"></div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  isOpen: Boolean,
  currentLevel: Number
});

defineEmits(['close']);

const confettis = ref([]);

// 當 Modal 打開時，自動產生彩帶
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    const colors = ['#ffbb33', '#00d4aa', '#a78bfa', '#ff6b6b', '#fff'];
    confettis.value = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      color: colors[Math.floor(Math.random() * colors.length)],
      tx: (Math.random() - 0.5) * 600,
      ty: (Math.random() - 0.5) * 600 - 200
    }));

    setTimeout(() => {
      confettis.value = [];
    }, 2500);
  }
});
</script>

<style scoped>
@keyframes reward-burst {
  0% { transform: translate(0, 0) scale(0); opacity: 1; }
  100% { transform: translate(var(--tx), var(--ty)) scale(1.5); opacity: 0; }
}
.confetti {
  position: absolute;
  width: 10px; height: 10px; border-radius: 2px;
  top: 50%; left: 50%;
  animation: reward-burst 2s ease-out forwards;
}
</style>