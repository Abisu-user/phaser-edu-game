<template>
  <transition name="fade">
    <div class="absolute inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" @click.self="$emit('close')">
      
      <div class="w-[1060px] max-w-[95vw] max-h-[90vh] bg-[#0D0D17] border border-indigo-500/30 rounded-[1.75rem] shadow-[0_0_60px_rgba(99,102,241,0.2)] flex flex-col overflow-hidden transform transition-all">
        
        <header class="shrink-0 px-8 py-6 bg-gradient-to-r from-indigo-900/40 to-transparent border-b border-indigo-500/20 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <span class="text-4xl">🎒</span>
            <h2 class="text-3xl font-black text-indigo-400 tracking-widest uppercase">戰術背包 <span class="text-lg text-slate-500 ml-3 font-normal">Inventory</span></h2>
          </div>
          
          <div class="flex items-center gap-6">
            <div class="flex items-center gap-2.5 bg-black/50 px-5 py-2 rounded-full border border-white/10 text-sm font-bold text-slate-300">
              已佔用空間：<span class="text-indigo-400 font-mono text-base">{{ inventory.length }}</span> / ∞
            </div>
            <button @click="$emit('close')" class="text-slate-400 hover:text-indigo-400 text-3xl font-bold transition-colors w-10 h-10 flex items-center justify-center rounded-full hover:bg-indigo-500/10">×</button>
          </div>
        </header>

        <main class="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          <div v-if="inventory.length === 0" class="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-5 py-20">
            <span class="text-[5rem] opacity-50 drop-shadow-md">🕸️</span>
            <p class="text-2xl font-black tracking-widest">背包空空如也...</p>
            <p class="text-sm">快去 24H 補給商店採購一些物資吧！</p>
          </div>

          <div v-else class="grid grid-cols-4 gap-6">
            <div 
              v-for="item in inventory" 
              :key="item.id"
              class="bg-[#1A1A24] border border-white/5 hover:border-indigo-500/50 rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300 group relative overflow-hidden shadow-[inset_0_0_20px_rgba(99,102,241,0.02)]"
            >
              <div class="absolute top-3 left-3 text-xs font-black px-2.5 py-1 rounded"
                :class="item.type === 'unlock' ? 'bg-amber-900/50 text-amber-400 border border-amber-500/30' : 'bg-emerald-900/50 text-emerald-400 border border-emerald-500/30'">
                {{ item.type === 'unlock' ? '系統指令' : '消耗品' }}
              </div>

              <div v-if="item.quantity > 1" class="absolute top-3 right-3 text-sm font-black font-mono px-3 py-1 rounded-full bg-indigo-600 text-white shadow-[0_0_15px_#4f46e5] z-10">
                x{{ item.quantity }}
              </div>

              <div class="text-[3.5rem] text-center mt-8 mb-3 group-hover:scale-110 transition-transform group-hover:drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                {{ item.icon }}
              </div>
              
              <div class="flex flex-col flex-1 items-center text-center">
                <h3 class="text-xl font-black text-slate-200 group-hover:text-indigo-300">{{ item.name }}</h3>
                <p class="text-sm text-slate-400 mt-3 leading-relaxed">{{ item.desc }}</p>
              </div>

              <div class="mt-auto pt-4 border-t border-white/5 w-full">
                <button 
                  class="w-full py-2.5 rounded-xl text-xs font-black tracking-widest transition-all text-slate-500 bg-black/40 cursor-not-allowed"
                >
                  {{ item.type === 'unlock' ? '已自動載入系統' : '只能在戰鬥中使用' }}
                </button>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  inventory: {
    type: Array,
    required: true,
    default: () => []
  }
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.2); }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.3); border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99, 102, 241, 0.6); }
</style>