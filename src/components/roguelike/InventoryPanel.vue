<template>
  <transition name="fade">
    <div class="absolute inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-serif" @click.self="$emit('close')">
      
      <div class="w-[1060px] max-w-[95vw] max-h-[90vh] bg-[#2A1A14] border-[6px] border-double border-[#593922] rounded-lg shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden transform transition-all relative">
        
        <div class="absolute inset-0 bg-[#1A0F0A] opacity-80 pointer-events-none"></div>

        <header class="shrink-0 px-8 py-6 bg-[#1F120D] border-b-4 border-[#3A2318] flex items-center justify-between relative z-10 shadow-[0_5px_15px_rgba(0,0,0,0.8)]">
          <div class="flex items-center gap-4">
            <span class="text-4xl drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">👝</span>
            <h2 class="text-3xl font-black text-[#F5DEB3] tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">
              冒險者行囊 
              <span class="text-lg text-[#8C6239] ml-4 font-bold tracking-widest">Inventory</span>
            </h2>
          </div>
          
          <div class="flex items-center gap-6">
            <div class="flex items-center gap-2.5 bg-[#0F0805] px-5 py-2 border-2 border-[#593922] shadow-[inset_0_2px_5px_rgba(0,0,0,0.8)] rounded-sm text-sm font-bold text-[#A08060]">
              行囊負重：<span class="text-[#DAA520] font-black text-base">{{ inventory.length }}</span> / ∞
            </div>
            <button @click="$emit('close')" class="text-[#8C6239] hover:text-[#FF0000] text-4xl font-black transition-colors w-10 h-10 flex items-center justify-center hover:scale-110 drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">×</button>
          </div>
        </header>

        <main class="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-10">
          
          <div v-if="inventory.length === 0" class="w-full h-full flex flex-col items-center justify-center text-[#8C6239] gap-5 py-20">
            <span class="text-[6rem] opacity-70 drop-shadow-[0_5px_10px_rgba(0,0,0,0.8)] transform -rotate-12">🥔</span>
            <p class="text-2xl font-black tracking-widest text-[#D7CCC8] drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">行囊空空如也...</p>
            <p class="text-sm font-bold">快去流浪商行採購一些秘藥與物資吧！</p>
          </div>

          <div v-else class="grid grid-cols-4 gap-6">
            <div 
              v-for="item in inventory" 
              :key="item.id"
              class="bg-[#1C110C] border-2 border-[#3A2318] hover:border-[#8C6239] rounded-sm p-6 flex flex-col gap-4 transition-all duration-300 group relative overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,0.8)]"
            >
              <div class="absolute top-3 left-3 text-xs font-black px-2.5 py-1 rounded-sm shadow-[1px_1px_0_rgba(0,0,0,0.5)]"
                :class="item.type === 'unlock' ? 'bg-[#593922] text-[#EAD8B1] border border-[#3A2318]' : 'bg-[#1A2F1A] text-[#8FBC8F] border border-[#0A1A0A]'">
                {{ item.type === 'unlock' ? '魔法卷軸' : '秘藥與物資' }}
              </div>

              <div v-if="item.quantity > 1" class="absolute top-3 right-3 text-sm font-black px-3 py-1 rounded-full bg-[#8B0000] text-[#FFD700] border border-[#593922] shadow-[1px_1px_0_rgba(0,0,0,0.8)] z-10">
                x{{ item.quantity }}
              </div>

              <div class="text-[3.5rem] text-center mt-8 mb-3 group-hover:scale-110 transition-transform drop-shadow-[0_5px_10px_rgba(0,0,0,0.5)]">
                {{ item.icon }}
              </div>
              
              <div class="flex flex-col flex-1 items-center text-center">
                <h3 class="text-xl font-black text-[#F5DEB3] group-hover:text-[#DAA520] drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">{{ item.name }}</h3>
                <p class="text-sm text-[#A08060] font-bold mt-3 leading-relaxed">{{ item.desc }}</p>
              </div>

              <div class="mt-auto pt-4 border-t-2 border-[#3A2318] w-full">
                <button 
                  class="w-full py-2.5 rounded-sm text-xs font-black tracking-widest transition-all text-[#8C6239] bg-[#0F0805] border border-[#2A1810] shadow-[inset_0_2px_5px_rgba(0,0,0,1)] cursor-not-allowed"
                >
                  {{ item.type === 'unlock' ? '📜 已登錄至公會名冊' : '⚔️ 僅限戰鬥中使用' }}
                </button>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* 滾動條改為適合木質與皮革的深棕色系 */
.custom-scrollbar::-webkit-scrollbar { width: 8px; }
.custom-scrollbar::-webkit-scrollbar-track { background: rgba(15, 8, 5, 0.8); border-radius: 4px; border-left: 1px solid #2A1810; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #593922; border-radius: 4px; border: 1px solid #3A2318; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #8C6239; }
</style>

<script setup>
defineProps({
  inventory: {
    type: Array,
    required: true,
    default: () => []
  }
});
</script>