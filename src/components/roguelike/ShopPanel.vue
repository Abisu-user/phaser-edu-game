<template>
  <transition name="fade">
    <div class="absolute inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" @click.self="$emit('close')">
      
      <div class="w-[1180px] max-w-[95vw] h-[935px] max-h-[90vh] bg-[#0D0D17] border border-fuchsia-500/30 rounded-[1.75rem] shadow-[0_0_60px_rgba(217,70,239,0.2)] flex flex-col overflow-hidden transform transition-all">
        
        <header class="h-20 px-8 bg-gradient-to-r from-fuchsia-900/40 to-transparent border-b border-fuchsia-500/20 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-4">
            <span class="text-3xl">🏪</span>
            <h2 class="text-2xl font-black text-fuchsia-400 tracking-widest uppercase">24H 補給商店</h2>
          </div>
          
          <div class="flex items-center gap-5">
            <div class="flex items-center gap-3 bg-black/50 px-5 py-2 rounded-full border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.15)]">
              <span class="text-lg">💰</span>
              <span class="text-yellow-500 font-mono font-bold text-lg">{{ coins }}</span>
            </div>
            <button @click="$emit('close')" class="text-slate-400 hover:text-rose-400 text-3xl font-bold transition-colors w-10 h-10 flex items-center justify-center rounded-full hover:bg-rose-500/10">×</button>
          </div>
        </header>

        <main class="flex-1 overflow-y-auto p-8 custom-scrollbar flex flex-col gap-10 relative">
          
          <transition name="fade">
            <div v-if="successMessage" class="absolute top-10 left-1/2 -translate-x-1/2 z-50 px-8 py-3 bg-emerald-900/90 border border-emerald-500/50 text-emerald-300 rounded-full text-center font-bold text-base tracking-widest shadow-[0_0_25px_rgba(16,185,129,0.5)] backdrop-blur-md">
              {{ successMessage }}
            </div>
          </transition>

          <section>
            <div class="flex items-center gap-3 mb-5 border-b border-white/10 pb-3">
              <span class="text-fuchsia-400 text-xl">🧬</span>
              <h3 class="font-bold text-slate-200 tracking-widest text-lg">核心機體強化 <span class="text-xs text-slate-500 font-normal ml-3">價格將隨強化階級提升</span></h3>
            </div>
            
            <div class="grid grid-cols-4 gap-6">
              <div 
                v-for="item in dynamicFixedUpgrades" 
                :key="item.id"
                class="bg-[#1A1A24] border border-fuchsia-500/30 hover:border-fuchsia-400 rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300 group relative overflow-hidden shadow-[inset_0_0_20px_rgba(217,70,239,0.05)]"
              >
                <div class="absolute top-3 right-3 text-xs font-black font-mono px-2.5 py-1 rounded bg-fuchsia-900/50 text-fuchsia-300 border border-fuchsia-500/30">
                  Lv.{{ item.currentLevel }}
                </div>

                <div class="text-[3.5rem] text-center mt-6 mb-3 group-hover:scale-110 transition-transform group-hover:drop-shadow-[0_0_15px_rgba(217,70,239,0.5)]">{{ item.icon }}</div>
                
                <div class="flex flex-col flex-1 items-center text-center">
                  <h3 class="text-lg font-black text-slate-200 group-hover:text-fuchsia-300">{{ item.name }}</h3>
                  <p class="text-xs text-slate-400 mt-2 leading-relaxed">{{ item.desc }}</p>
                  <p class="text-sm text-fuchsia-400 font-bold mt-3 bg-black/30 px-3 py-1 rounded-lg w-full">當前數值: {{ item.currentStat }}</p>
                </div>

                <div class="mt-auto pt-4 border-t border-fuchsia-500/20 flex items-center justify-between">
                  <div class="flex items-center gap-1.5">
                    <span class="text-sm">💰</span>
                    <span class="text-lg font-mono font-bold" :class="coins >= item.price ? 'text-yellow-500' : 'text-rose-500'">{{ item.price }}</span>
                  </div>
                  <button 
                    @click="buyItem(item)"
                    :disabled="coins < item.price"
                    class="px-4 py-2 rounded-xl text-sm font-black tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    :class="coins >= item.price ? 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-[0_0_15px_rgba(217,70,239,0.4)]' : 'bg-slate-800 text-slate-500'"
                  >購買</button>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div class="flex items-center justify-between mb-5 border-b border-white/10 pb-3">
              <div class="flex items-center gap-3">
                <span class="text-emerald-400 text-xl">📦</span>
                <h3 class="font-bold text-slate-200 tracking-widest text-lg">黑市隨機貨源 <span class="text-xs text-slate-500 font-normal ml-3">根據玩家等級 (Lv.{{ playerLevel }}) 隨機刷新 6 樣商品</span></h3>
              </div>
              <button @click="refreshRandomItems" class="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl border border-slate-600 transition-colors flex items-center gap-2 shadow-md">
                <span>🔄</span> 刷新貨架 (💰 50)
              </button>
            </div>
            
            <div class="grid grid-cols-3 gap-6">
              <div 
                v-for="item in randomItems" 
                :key="item.instanceId"
                class="bg-[#11111B] border border-white/10 hover:border-emerald-500/50 rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300 group relative overflow-hidden"
              >
                <div class="absolute top-3 left-3 text-[11px] font-black px-2.5 py-1 rounded"
                  :class="item.type === 'unlock' ? 'bg-amber-900/50 text-amber-400 border border-amber-500/30' : 'bg-emerald-900/50 text-emerald-400 border border-emerald-500/30'">
                  {{ item.type === 'unlock' ? '指令解鎖' : '消耗品' }}
                </div>

                <div class="text-[3.5rem] text-center mt-6 mb-3 group-hover:scale-110 transition-transform group-hover:drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">{{ item.icon }}</div>
                
                <div class="flex flex-col flex-1 items-center text-center">
                  <h3 class="text-lg font-black text-slate-200 group-hover:text-emerald-300">{{ item.name }}</h3>
                  <p class="text-[13px] text-slate-400 mt-2 leading-relaxed">{{ item.desc }}</p>
                </div>

                <div class="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="text-sm">💰</span>
                    <span class="text-lg font-mono font-bold" :class="coins >= item.price && !item.purchased ? 'text-yellow-500' : 'text-rose-500'">{{ item.price }}</span>
                  </div>
                  <button 
                    @click="buyItem(item)"
                    :disabled="coins < item.price || item.purchased"
                    class="px-5 py-2 rounded-xl text-sm font-black tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    :class="(coins >= item.price && !item.purchased) ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-slate-800 text-slate-500'"
                  >
                    {{ item.purchased ? '售罄' : '購買' }}
                  </button>
                </div>
              </div>
            </div>
          </section>

        </main>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
// 🌟 匯入你剛剛建立的設定檔
import { FIXED_UPGRADES, RANDOM_ITEM_POOL } from '../../game/config/ShopItems.js';

const props = defineProps({
  coins: { type: Number, required: true, default: 0 },
  playerLevel: { type: Number, required: true, default: 1 },
  maxHp: { type: Number, required: true, default: 100 },
  maxMp: { type: Number, required: true, default: 50 },
  maxAp: { type: Number, required: true, default: 30 }, // 🌟 新增 AP
  maxAtk: { type: Number, required: true, default: 10 }
});

const emit = defineEmits(['close', 'purchase']);
const successMessage = ref('');

// 🌟 1. 動態計算固定強化的價格與階級
const dynamicFixedUpgrades = computed(() => {
  return FIXED_UPGRADES.map(item => {
    let currentStat = 0;
    let currentLevel = 0;

    if (item.id === 'max_hp_up') {
      currentStat = props.maxHp;
      currentLevel = Math.max(0, Math.floor((props.maxHp - 100) / 20));
    } else if (item.id === 'max_mp_up') {
      currentStat = props.maxMp;
      currentLevel = Math.max(0, Math.floor((props.maxMp - 50) / 10));
    } else if (item.id === 'max_ap_up') {
      currentStat = props.maxAp;
      currentLevel = Math.max(0, Math.floor((props.maxAp - 30) / 10)); // 基礎30，每升級加10
    } else if (item.id === 'atk_up') {
      currentStat = props.maxAtk;
      currentLevel = Math.max(0, Math.floor((props.maxAtk - 10) / 5));
    }

    return {
      ...item,
      currentStat,
      currentLevel,
      price: item.basePrice + (currentLevel * item.priceIncrement) // 越買越貴公式
    };
  });
});

// 🌟 2. 黑市隨機商品池
const randomItems = ref([]);

const generateRandomItems = () => {
  // 過濾符合等級的商品
  const availableItems = RANDOM_ITEM_POOL.filter(item => item.minLevel <= props.playerLevel);
  
  // 洗牌並抽出 6 個商品 (如果總數不夠6個就全拿)
  const shuffled = [...availableItems].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 6);

  randomItems.value = selected.map(item => {
    // 給予價格 10% 波動
    const vary = Math.floor(item.basePrice * 0.1);
    const finalPrice = item.basePrice + (Math.floor(Math.random() * vary * 2) - vary);
    return { ...item, price: finalPrice, instanceId: Math.random().toString(36).substring(7), purchased: false };
  });
};

const refreshRandomItems = () => {
  if (props.coins >= 50) {
    emit('purchase', { item: { id: 'refresh_shop', name: '刷新黑市', type: 'system' }, cost: 50 });
    generateRandomItems();
  } else {
    alert("金幣不足，無法刷新！");
  }
};

onMounted(() => {
  generateRandomItems();
});

const buyItem = (item) => {
  if (props.coins >= item.price) {
    if (item.type !== 'upgrade' && item.type !== 'system') {
      item.purchased = true;
    }
    emit('purchase', { item, cost: item.price });
    successMessage.value = `獲得：${item.name}！`;
    setTimeout(() => { successMessage.value = ''; }, 2000);
  }
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.2); }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(217, 70, 239, 0.3); border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(217, 70, 239, 0.6); }
</style>