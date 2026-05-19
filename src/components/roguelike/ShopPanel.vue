<template>
  <transition name="fade">
    <div class="absolute inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-serif" @click.self="$emit('close')">
      
      <div class="w-[1180px] max-w-[95vw] h-[935px] max-h-[90vh] bg-[#2A1810] border-[6px] border-double border-[#8C6239] rounded-sm shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden transform transition-all relative">
        
        <div class="absolute inset-0 bg-[#1A0F0A] opacity-50 pointer-events-none"></div>

        <header class="h-20 px-8 bg-[#150C08] border-b-4 border-[#4A2E1B] flex items-center justify-between shrink-0 relative z-10 shadow-[0_5px_15px_rgba(0,0,0,0.8)]">
          <div class="flex items-center gap-4">
            <span class="text-3xl drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">⚖️</span>
            <h2 class="text-2xl font-black text-[#FFD700] tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">流浪商行與鍛造鋪</h2>
          </div>
          
          <div class="flex items-center gap-5">
            <div class="flex items-center gap-3 bg-[#0F0805] px-5 py-2 border-2 border-[#593922] shadow-[inset_0_2px_10px_rgba(0,0,0,0.9)] rounded-sm">
              <span class="text-lg drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">🪙</span>
              <span class="text-[#FFD700] font-bold text-lg tracking-wider">{{ coins }}</span>
            </div>
            <button @click="$emit('close')" class="text-[#8C6239] hover:text-[#FF0000] text-4xl font-black transition-colors w-10 h-10 flex items-center justify-center hover:scale-110 drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">×</button>
          </div>
        </header>

        <main class="flex-1 overflow-y-auto p-8 custom-scrollbar flex flex-col gap-10 relative z-10">
          
          <transition name="fade">
            <div v-if="successMessage" class="absolute top-6 left-1/2 -translate-x-1/2 z-50 px-10 py-3 bg-[#EAD8B1] border-4 border-double border-[#8C6239] text-[#8B0000] rounded-sm text-center font-black text-lg tracking-widest shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
              {{ successMessage }}
            </div>
          </transition>

          <section>
            <div class="flex items-center gap-3 mb-5 border-b-2 border-[#593922] pb-3">
              <span class="text-[#DAA520] text-2xl drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">⚒️</span>
              <h3 class="font-black text-[#F5DEB3] tracking-widest text-xl drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">
                基礎能力鍛鍊 
                <span class="text-sm text-[#8C6239] font-bold ml-4">所需奉獻金將隨階級提升</span>
              </h3>
            </div>
            
            <div class="grid grid-cols-4 gap-6">
              <div 
                v-for="item in dynamicFixedUpgrades" 
                :key="item.id"
                class="bg-[#1C110C] border-2 border-[#593922] hover:border-[#DAA520] rounded-sm p-6 flex flex-col gap-4 transition-all duration-300 group relative overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]"
              >
                <div class="absolute top-3 right-3 text-xs font-black px-2.5 py-1 rounded-sm bg-[#8B0000] text-[#FFD700] border border-[#593922] shadow-[1px_1px_0_rgba(0,0,0,0.8)]">
                  Lv.{{ item.currentLevel }}
                </div>

                <div class="text-[3.5rem] text-center mt-6 mb-3 group-hover:scale-110 transition-transform group-hover:drop-shadow-[0_0_15px_rgba(218,165,32,0.4)]">{{ item.icon }}</div>
                
                <div class="flex flex-col flex-1 items-center text-center">
                  <h3 class="text-xl font-black text-[#F5DEB3] group-hover:text-[#FFD700] drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">{{ item.name }}</h3>
                  <p class="text-sm text-[#A08060] mt-2 font-bold leading-relaxed">{{ item.desc }}</p>
                  <p class="text-sm text-[#DAA520] font-black mt-3 bg-[#0F0805] border border-[#3A2318] shadow-[inset_0_2px_5px_rgba(0,0,0,1)] px-3 py-1.5 w-full">目前能力: {{ item.currentStat }}</p>
                </div>

                <div class="mt-auto pt-4 border-t-2 border-[#3A2318] flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="text-sm drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">🪙</span>
                    <span class="text-xl font-bold drop-shadow-[0_1px_1px_rgba(0,0,0,1)]" :class="coins >= item.price ? 'text-[#FFD700]' : 'text-rose-700'">{{ item.price }}</span>
                  </div>
                  <button 
                    @click="buyItem(item)"
                    :disabled="coins < item.price"
                    class="px-5 py-2 rounded-sm text-sm font-black tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_5px_10px_rgba(0,0,0,0.6)] border-2"
                    :class="coins >= item.price 
                      ? 'bg-[#8B0000] hover:bg-[#A52A2A] text-[#FFD700] border-[#DAA520] border-b-[4px] hover:border-b-[2px] hover:translate-y-[2px] active:border-b-[2px] active:translate-y-[2px]' 
                      : 'bg-[#3E2723] text-[#8C6239] border-[#2A1810] border-b-[2px] translate-y-[2px]'"
                  >奉獻</button>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div class="flex items-center justify-between mb-5 border-b-2 border-[#593922] pb-3">
              <div class="flex items-center gap-3">
                <span class="text-[#8FBC8F] text-2xl drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">📜</span>
                <h3 class="font-black text-[#F5DEB3] tracking-widest text-xl drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">
                  神秘商人的珍稀貨架 
                  <span class="text-sm text-[#8C6239] font-bold ml-4">根據冒險者等級 (Lv.{{ playerLevel }}) 隨機陳列 6 件珍品</span>
                </h3>
              </div>
              <button @click="refreshRandomItems" class="text-xs bg-[#3E2723] hover:bg-[#5D4037] text-[#D7CCC8] font-bold px-4 py-2 rounded-sm border-2 border-[#8C6239] border-b-4 hover:border-b-2 hover:translate-y-[2px] active:border-b-2 active:translate-y-[2px] transition-all flex items-center gap-2 shadow-[0_4px_10px_rgba(0,0,0,0.6)]">
                <span>🔄</span> 重新陳列貨物 (🪙 50)
              </button>
            </div>
            
            <div class="grid grid-cols-3 gap-6">
              <div 
                v-for="item in randomItems" 
                :key="item.instanceId"
                class="bg-[#EAD8B1] border-[4px] border-double border-[#8C6239] p-6 flex flex-col gap-4 transition-all duration-300 group relative shadow-[4px_4px_15px_rgba(0,0,0,0.6)]"
              >
                <div class="absolute top-3 left-3 text-xs font-black px-2.5 py-1 rounded-sm shadow-[1px_1px_0_rgba(0,0,0,0.5)]"
                  :class="item.type === 'unlock' ? 'bg-[#593922] text-[#EAD8B1] border border-[#3A2318]' : 'bg-[#1A2F1A] text-[#8FBC8F] border border-[#0A1A0A]'">
                  {{ item.type === 'unlock' ? '魔法卷軸' : '秘藥與物資' }}
                </div>

                <div class="text-[3.5rem] text-center mt-6 mb-3 group-hover:scale-110 transition-transform drop-shadow-[0_4px_4px_rgba(0,0,0,0.3)]">{{ item.icon }}</div>
                
                <div class="flex flex-col flex-1 items-center text-center">
                  <h3 class="text-xl font-black text-[#3A2318] group-hover:text-[#8B0000]">{{ item.name }}</h3>
                  <p class="text-sm text-[#593922] mt-2 font-bold leading-relaxed">{{ item.desc }}</p>
                </div>

                <div class="mt-auto pt-4 border-t-2 border-[#C8B693] flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="text-sm">🪙</span>
                    <span class="text-xl font-bold" :class="coins >= item.price && !item.purchased ? 'text-[#8B0000]' : 'text-zinc-500'">{{ item.price }}</span>
                  </div>
                  <button 
                    @click="buyItem(item)"
                    :disabled="coins < item.price || item.purchased"
                    class="px-6 py-2 rounded-sm text-sm font-black tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2"
                    :class="(coins >= item.price && !item.purchased) 
                      ? 'bg-[#1A365D] hover:bg-[#2A4365] text-[#FFF8DC] border-[#4299E1] border-b-[4px] hover:border-b-[2px] hover:translate-y-[2px] active:border-b-[2px] active:translate-y-[2px] shadow-[0_5px_10px_rgba(0,0,0,0.4)]' 
                      : 'bg-[#C8B693] text-[#8C6239] border-[#A08060] border-b-[2px] translate-y-[2px]'"
                  >
                    {{ item.purchased ? '已售出' : '交易' }}
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

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* 滾動條改為適合木質的深棕色系 */
.custom-scrollbar::-webkit-scrollbar { width: 8px; }
.custom-scrollbar::-webkit-scrollbar-track { background: rgba(20, 10, 5, 0.6); border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #593922; border-radius: 4px; border: 1px solid #3A2318; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #8C6239; }
</style>

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