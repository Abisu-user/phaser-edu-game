<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0a0e27]/80 backdrop-blur-md animate-fade-in">
      
      <div class="bg-[#16162a]/90 border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-[0_10px_40px_rgba(0,0,0,0.5)] transform transition-all scale-100 animate-slide-up">
        
        <div class="text-center mb-6">
          <div class="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
            <span class="text-3xl">{{ icon }}</span>
          </div>
          <h2 class="text-2xl font-bold text-white font-['Fredoka'] tracking-wide">{{ title }}</h2>
        </div>

        <p class="text-[#a0a0b8] text-center text-sm mb-8 leading-relaxed">
          {{ message }}
        </p>

        <div class="flex flex-col gap-3">
          <button 
            @click="$emit('confirm')" 
            class="w-full py-3 rounded-xl font-bold transition-all duration-300"
            :class="isDanger ? 'bg-[#ff6b6b] text-white hover:bg-[#ff5252] shadow-[0_0_15px_rgba(255,107,107,0.3)]' : 'bg-[#00d4aa] text-[#0a0e27] hover:bg-[#00e6b8] shadow-[0_0_15px_rgba(0,212,170,0.3)]'"
          >
            {{ confirmText }}
          </button>
          
          <button 
            @click="$emit('cancel')" 
            class="w-full py-3 rounded-xl font-bold text-[#a0a0b8] bg-transparent border border-white/10 hover:bg-white/5 hover:text-white transition-colors"
          >
            {{ cancelText }}
          </button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  isOpen: { type: Boolean, default: false },
  title: { type: String, required: true },
  message: { type: String, required: true },
  confirmText: { type: String, default: '確認' },
  cancelText: { type: String, default: '取消' },
  icon: { type: String, default: '⚠️' },
  isDanger: { type: Boolean, default: false } // 若為 true，確認按鈕會變紅色
});

defineEmits(['confirm', 'cancel']);
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
.animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
</style>