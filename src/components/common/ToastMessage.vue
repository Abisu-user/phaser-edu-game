<template>
  <Teleport to="body">
    <Transition name="toast">
      <div
        v-if="message"
        class="fixed right-4 top-4 z-[120] flex max-w-md items-start gap-3 rounded-xl border px-4 py-3 shadow-2xl"
        :class="type === 'error'
          ? 'border-rose-400/40 bg-[#2a1120] text-rose-100'
          : 'border-emerald-400/40 bg-[#102a25] text-emerald-100'"
        role="status"
        aria-live="polite"
      >
        <span class="pt-0.5 text-lg" aria-hidden="true">{{ type === 'error' ? '⚠️' : '✓' }}</span>
        <p class="flex-1 text-sm font-medium leading-6">{{ message }}</p>
        <button
          type="button"
          class="rounded p-1 text-current/70 transition hover:bg-white/10 hover:text-white"
          aria-label="關閉提示"
          @click="$emit('dismiss')"
        >
          ×
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  message: { type: String, default: '' },
  type: { type: String, default: 'success' }
});

defineEmits(['dismiss']);
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
