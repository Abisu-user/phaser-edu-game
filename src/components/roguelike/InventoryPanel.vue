<template>
  <transition name="fade">
    <div class="absolute inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-serif" @click.self="$emit('close')">
      
      <div class="w-[1060px] max-w-[95vw] max-h-[90vh] bg-[#2A1A14] border-[6px] border-double border-[#593922] rounded-lg shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden transform transition-all relative">
        <div class="absolute inset-0 bg-[#1A0F0A] opacity-80 pointer-events-none"></div>

        <header class="shrink-0 px-8 py-6 bg-[#1F120D] border-b-4 border-[#3A2318] flex items-center justify-between relative z-10 shadow-[0_5px_15px_rgba(0,0,0,0.8)]">
          <div class="flex items-center gap-8">
            <h2 class="text-3xl font-black text-[#F5DEB3] tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">
              行囊 <span class="text-lg text-[#8C6239] ml-2 font-bold tracking-widest">Inventory</span>
            </h2>
            <div class="flex bg-[#0F0805] p-1 rounded-sm border border-[#593922]">
              <button @click="activeTab = 'consumable'" :class="activeTab === 'consumable' ? 'bg-[#593922] text-[#F5DEB3]' : 'text-[#8C6239]'" class="px-6 py-1.5 text-sm font-black transition-all">秘藥與祈禱</button>
              <button @click="activeTab = 'unlock'" :class="activeTab === 'unlock' ? 'bg-[#593922] text-[#F5DEB3]' : 'text-[#8C6239]'" class="px-6 py-1.5 text-sm font-black transition-all">魔法卷軸庫</button>
            </div>
          </div>
          <button @click="$emit('close')" class="text-[#8C6239] hover:text-[#FF0000] text-4xl font-black transition-colors">×</button>
        </header>

        <main class="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-10">
          <div v-if="filteredInventory.length === 0" class="w-full h-full flex flex-col items-center justify-center text-[#8C6239] py-20">
            <span class="text-[6rem]">🥔</span>
            <p class="text-xl font-black">此分類下空空如也...</p>
          </div>

          <div v-else class="grid grid-cols-4 gap-6">
            <div v-for="item in filteredInventory" :key="item.id" class="bg-[#1C110C] border-2 border-[#3A2318] p-6 flex flex-col gap-4 relative shadow-[inset_0_0_30px_rgba(0,0,0,0.8)]">
              <div v-if="item.quantity > 1" class="absolute top-3 right-3 text-sm font-black px-3 py-1 rounded-full bg-[#8B0000] text-[#FFD700]">x{{ item.quantity }}</div>

              <div class="text-[3.5rem] text-center mt-4">{{ item.icon }}</div>
              <div class="flex flex-col flex-1 items-center text-center">
                <h3 class="text-xl font-black text-[#F5DEB3]">{{ item.name }}</h3>
                <p class="text-sm text-[#A08060] font-bold mt-2">{{ item.desc }}</p>
              </div>

              <div class="mt-auto pt-4 border-t-2 border-[#3A2318] w-full">
                <button v-if="activeTab === 'consumable' && item.id === 'relic_holy_maiden_prayer'" 
                  @click="$emit('use', item)"
                  class="w-full py-2.5 rounded-sm text-xs font-black bg-[#2A1810] border-2 border-[#D4AF37] text-[#FFD700] hover:bg-[#D4AF37] hover:text-black">
                  ✨ 啟用祈禱 (EXP+15%)
                </button>
                <div v-else-if="item.type === 'unlock'" class="w-full py-2.5 text-center text-xs font-black text-[#8C6239] bg-[#0F0805] border border-[#2A1810]">
                  📜 已登錄至魔法名冊
                </div>
                <div v-else class="w-full py-2.5 text-center text-xs font-black text-[#8C6239] bg-[#0F0805] border border-[#2A1810]">
                  ⚔️ 僅限戰鬥中使用
                </div>
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
import { ref, computed } from 'vue';

const props = defineProps({ inventory: Array });
const emit = defineEmits(['close', 'use']);
const activeTab = ref('consumable');

const filteredInventory = computed(() => {
  return props.inventory.filter(item => {
    // 🌟 關鍵新增：數量被扣到 0 的道具，在視覺上直接隱藏
    if (item.quantity !== undefined && item.quantity <= 0) return false;
    
    if (activeTab.value === 'unlock') return item.type === 'unlock';
    return item.type !== 'unlock'; 
  });
});
</script>