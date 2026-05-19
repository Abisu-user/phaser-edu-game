<template>
  <transition name="fade">
    <div class="absolute inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-serif" @click.self="$emit('close')">
      
      <div class="w-[1180px] max-w-[95vw] h-[935px] max-h-[90vh] bg-[#1A0F0A] border-[6px] border-double border-[#8C6239] rounded-sm shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden transform transition-all relative">
        
        <div class="absolute inset-0 bg-[#0F0805] opacity-60 pointer-events-none"></div>

        <header class="h-20 px-8 bg-[#150C08] border-b-4 border-[#4A2E1B] flex items-center justify-between shrink-0 relative z-10 shadow-[0_5px_15px_rgba(0,0,0,0.8)]">
          <div class="flex items-center gap-4">
            <span class="text-3xl drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">📜</span>
            <h2 class="text-2xl font-black text-[#F5DEB3] tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
              公會秘寶與魔物誌 
              <span class="text-sm text-[#8C6239] ml-4 font-bold tracking-widest">Guild Archive</span>
            </h2>
          </div>
          
          <div class="flex items-center gap-5">
            <div class="flex items-center gap-2.5 bg-[#2A1810] px-5 py-2 border-2 border-[#593922] shadow-[inset_0_2px_5px_rgba(0,0,0,0.8)] rounded-sm text-sm font-bold text-[#D7CCC8]">
              卷軸解譯進度：<span class="text-[#DAA520] font-black text-base">{{ unlockedCount }} / {{ totalCount }}</span>
            </div>
            <button @click="$emit('close')" class="text-[#8C6239] hover:text-[#FF0000] text-4xl font-black transition-colors w-10 h-10 flex items-center justify-center hover:scale-110 drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">×</button>
          </div>
        </header>

        <div class="flex border-b-4 border-[#2A1810] bg-[#150C08] shrink-0 relative z-10 shadow-[0_5px_10px_rgba(0,0,0,0.5)]">
          <button 
            @click="activeTab = 'commands'; selectedCommand = null" 
            class="flex-1 py-4 text-lg font-black tracking-widest transition-all relative"
            :class="activeTab === 'commands' ? 'text-[#FFD700] bg-[#3A2318] border-b-[4px] border-[#DAA520] shadow-[inset_0_-2px_10px_rgba(218,165,32,0.2)]' : 'text-[#8C6239] hover:text-[#D7CCC8] hover:bg-white/5 border-b-[4px] border-transparent'"
          >
            📜 戰技與魔法卷軸
          </button>
          <button 
            @click="activeTab = 'items'" 
            class="flex-1 py-4 text-lg font-black tracking-widest transition-all relative"
            :class="activeTab === 'items' ? 'text-[#8FBC8F] bg-[#1A2F1A] border-b-[4px] border-[#2E8B57] shadow-[inset_0_-2px_10px_rgba(46,139,87,0.2)]' : 'text-[#8C6239] hover:text-[#D7CCC8] hover:bg-white/5 border-b-[4px] border-transparent'"
          >
            🧪 秘藥與奇物圖鑑
          </button>
        </div>

        <main class="flex-1 overflow-hidden relative z-10">
          
          <div v-if="activeTab === 'commands'" class="h-full flex">
            
            <div class="w-1/3 h-full overflow-y-auto custom-scrollbar border-r-[4px] border-[#3A2318] p-6 bg-[#1C110C] shadow-[inset_-5px_0_15px_rgba(0,0,0,0.6)]">
              <div v-for="category in categorizedCommands" :key="category.name" class="mb-8">
                <div class="text-sm font-black text-[#D4AF37] uppercase tracking-widest mb-4 px-2 border-b-2 border-[#593922] pb-2 drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">
                  {{ category.name }}
                </div>
                
                <div class="flex flex-col gap-3">
                  <button
                    v-for="cmd in category.cmds"
                    :key="cmd.id"
                    @click="selectedCommand = cmd"
                    class="flex items-center gap-4 p-3.5 rounded-sm border-2 text-left transition-all duration-200 shadow-[2px_2px_5px_rgba(0,0,0,0.5)]"
                    :class="[
                      selectedCommand?.id === cmd.id 
                        ? 'bg-[#3E2723] border-[#DAA520] text-[#FFD700] shadow-[inset_0_0_15px_rgba(218,165,32,0.2)] scale-[1.02]' 
                        : (cmd.isUnlocked ? 'bg-[#2A1810] border-[#593922] hover:border-[#8C6239] hover:bg-[#352015] text-[#F5DEB3]' : 'bg-[#0F0805] border-[#1A0F0A] text-[#593922] grayscale opacity-70')
                    ]"
                  >
                    <span class="text-2xl w-8 text-center drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">{{ cmd.isUnlocked ? (cmd.icon || '📜') : '🔒' }}</span>
                    <span class="text-sm font-black font-sans tracking-wider" :class="!cmd.isUnlocked && 'blur-[2px] select-none'">{{ cmd.isUnlocked ? cmd.id : '未知卷軸' }}</span>
                  </button>
                </div>
              </div>
            </div>

            <div class="w-2/3 h-full p-8 overflow-y-auto custom-scrollbar relative bg-[#150C08]">
              
              <div v-if="!selectedCommand" class="absolute inset-0 flex flex-col items-center justify-center text-[#8C6239] opacity-70">
                <span class="text-[6rem] mb-6 drop-shadow-[0_5px_5px_rgba(0,0,0,1)] transform -rotate-12">📚</span>
                <p class="font-black tracking-widest text-xl drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">請從左側書架抽取卷軸以供閱覽</p>
              </div>

              <div v-else-if="!selectedCommand.isUnlocked" class="h-full flex flex-col items-center justify-center text-[#8B0000]">
                <div class="relative">
                  <div class="absolute inset-0 bg-[#8B0000] blur-3xl opacity-20 rounded-full animate-pulse"></div>
                  <span class="text-[6rem] mb-6 relative z-10 drop-shadow-[0_5px_10px_rgba(0,0,0,1)]">🔒</span>
                </div>
                <h3 class="text-3xl font-black tracking-widest mb-4 drop-shadow-[0_2px_2px_rgba(0,0,0,1)] text-[#FF0000]">封印尚未解除</h3>
                <p class="text-lg text-[#D7CCC8] font-bold">此卷軸被古老的魔法封印著，請前往<span class="text-[#DAA520] mx-1">流浪商行</span>尋求破解之道。</p>
              </div>

              <div v-else class="flex flex-col gap-8 animate-fade-in bg-[#EAD8B1] border-[4px] border-double border-[#8C6239] p-8 min-h-full shadow-[8px_8px_25px_rgba(0,0,0,1)] relative text-[#3A2318]">
                <div class="absolute top-3 left-3 w-3 h-3 bg-zinc-800 rounded-full shadow-[1px_1px_2px_rgba(0,0,0,0.8)]"></div>
                <div class="absolute top-3 right-3 w-3 h-3 bg-zinc-800 rounded-full shadow-[1px_1px_2px_rgba(0,0,0,0.8)]"></div>
                
                <div class="flex gap-6 items-start border-b-2 border-[#8C6239] pb-6">
                  <div class="w-32 h-32 shrink-0 rounded-sm bg-[#C8B693] border-4 border-[#8C6239] flex items-center justify-center text-[5rem] shadow-[inset_0_4px_10px_rgba(0,0,0,0.3)]">
                    {{ selectedCommand.icon || '📜' }}
                  </div>
                  <div class="flex-1 mt-2">
                    <div class="flex items-center gap-4 mb-4">
                      <h2 class="text-4xl font-black text-[#3A2318] tracking-wider">{{ selectedCommand.label }}</h2>
                      <span class="px-3 py-1 rounded-sm bg-[#8B0000] text-[#FFD700] text-sm font-black border border-[#593922] shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
                        詠唱消耗: {{ selectedCommand.ap || 0 }} AP
                      </span>
                    </div>
                    <p class="text-sm font-bold bg-[#D4C3A3] px-4 py-2 border-l-4 border-[#8C6239] mt-2 inline-block shadow-inner">
                      法術真名 (Syntax): <span class="text-[#8B0000] font-black font-sans text-lg tracking-wider ml-1">{{ selectedCommand.id }}()</span>
                    </p>
                  </div>
                </div>

                <div>
                  <h4 class="text-base font-black text-[#593922] uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span class="w-2.5 h-2.5 bg-[#8C6239] rotate-45"></span> 文獻記載 Lore & Effects
                  </h4>
                  <p class="text-lg font-bold leading-relaxed bg-[#F5DEB3] p-5 border border-[#D4C3A3] shadow-inner text-[#4A2E1B]">
                    {{ selectedCommand.desc }}
                  </p>
                </div>

                <div>
                  <h4 class="text-base font-black text-[#2E8B57] uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span class="w-2.5 h-2.5 bg-[#2E8B57] rotate-45"></span> 魔力流動軌跡 Runes & Execution
                  </h4>
                  <div class="bg-[#150C08] rounded-sm border-2 border-[#3A2318] p-5 relative overflow-hidden group shadow-[inset_0_5px_15px_rgba(0,0,0,1)] text-[#D4AF37]">
                    <div class="absolute top-0 right-0 px-3 py-1.5 bg-[#2E8B57] text-[#1A2F1A] text-xs font-black rounded-bl-lg border-b border-l border-[#1A2F1A] shadow-[inset_0_0_5px_rgba(0,0,0,0.5)]">
                      ANCIENT RUNES (JS)
                    </div>
                    <pre class="font-sans font-bold text-lg whitespace-pre-wrap mt-3 leading-relaxed"><code>{{ getExampleCode(selectedCommand.id) }}</code></pre>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <div v-if="activeTab === 'items'" class="h-full overflow-y-auto p-8 custom-scrollbar bg-[#1C110C] shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]">
            <div class="grid grid-cols-3 gap-6">
              
              <div 
                v-for="item in dictionaryItems" 
                :key="item.id"
                class="border-2 rounded-sm p-6 flex flex-col items-center text-center gap-4 transition-all duration-300 relative overflow-hidden"
                :class="item.isUnlocked ? 'bg-[#2A1810] border-[#8C6239] hover:border-[#DAA520] shadow-[0_5px_15px_rgba(0,0,0,0.5)]' : 'bg-[#0F0805] border-[#1A0F0A] grayscale opacity-70'"
              >
                <div class="w-24 h-24 shrink-0 rounded-full flex items-center justify-center text-5xl bg-[#150C08] border-4 border-[#3A2318] shadow-[inset_0_5px_10px_rgba(0,0,0,1)] relative"
                     :class="{'drop-shadow-[0_0_15px_rgba(143,188,143,0.4)] border-[#4A5D23]': item.isUnlocked}">
                  <div v-if="item.isUnlocked" class="absolute inset-0 bg-[#8FBC8F] blur-xl opacity-20 rounded-full"></div>
                  <span class="relative z-10">{{ item.isUnlocked ? item.icon : '❓' }}</span>
                </div>
                
                <div>
                  <h3 class="text-xl font-black tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,1)]" :class="item.isUnlocked ? 'text-[#8FBC8F]' : 'text-[#593922]'">
                    {{ item.isUnlocked ? item.name : '未知的秘寶' }}
                  </h3>
                  <p class="text-sm font-bold mt-2 leading-relaxed" :class="item.isUnlocked ? 'text-[#D7CCC8]' : 'text-[#593922]'">
                    {{ item.isUnlocked ? item.desc : '尚未鑑定此物品的來歷與功效' }}
                  </p>
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

/* 展開羊皮紙的進場動畫 */
.animate-fade-in { animation: unrollParchment 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); transform-origin: top; }
@keyframes unrollParchment { 
  from { opacity: 0; transform: scaleY(0.8) translateY(-20px); } 
  to { opacity: 1; transform: scaleY(1) translateY(0); } 
}

/* 滾動條改為木質深棕色系 */
.custom-scrollbar::-webkit-scrollbar { width: 8px; }
.custom-scrollbar::-webkit-scrollbar-track { background: rgba(15, 8, 5, 0.8); border-radius: 4px; border-left: 1px solid #2A1810; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #593922; border-radius: 4px; border: 1px solid #3A2318; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #8C6239; }
</style>

<script setup>
import { ref, computed } from 'vue';
import { COMMAND_DICT } from '../../game/config/CommandList.js'; 
import { RANDOM_ITEM_POOL } from '../../game/config/ShopItems.js';

const props = defineProps({
  inventory: {
    type: Array,
    required: true,
    default: () => []
  }
});

const activeTab = ref('commands');
const selectedCommand = ref(null);

// 指令解鎖條件
const commandUnlockMap = {
  'isDanger': 'module_radar',
  'hack_wall': 'module_hack',
  'heal': 'module_heal',
  'laser': 'module_laser',
  'whirlwind': 'module_whirlwind'
};

const dictionaryCommands = computed(() => {
  return COMMAND_DICT.map(cmd => {
    let unlocked = true;
    
    if (cmd.reqModule) {
      unlocked = props.inventory.some(i => i.id === cmd.reqModule);
    }

    return { ...cmd, isUnlocked: unlocked };
  });
});

// 🌟 將指令進行分類 (給左側列表用)
const categorizedCommands = computed(() => {
  const moveIds = ['moveUp', 'moveDown', 'moveLeft', 'moveRight', 'wait', 'dash'];
  const interactIds = ['take', 'open', 'hack_wall'];
  const combatIds = ['attack', 'shoot', 'magic', 'bomb', 'heal', 'laser', 'spread_shot', 'pull', 'boomerang', 'whirlwind'];
  
  const groups = [
    { name: '🏃‍♂️ 移動與動作', cmds: dictionaryCommands.value.filter(c => moveIds.includes(c.id)) },
    { name: '👁️ 條件與感知', cmds: dictionaryCommands.value.filter(c => c.type === 'sensor') },
    { name: '⚙️ 互動與機制', cmds: dictionaryCommands.value.filter(c => interactIds.includes(c.id)) },
    { name: '⚔️ 攻擊與戰鬥', cmds: dictionaryCommands.value.filter(c => combatIds.includes(c.id)) },
    { name: '🧠 邏輯控制',   cmds: dictionaryCommands.value.filter(c => c.type === 'logic') }
  ];
  
  // 濾掉沒有指令的空分類
  return groups.filter(cat => cat.cmds && cat.cmds.length > 0);
});

// 道具圖鑑
const dictionaryItems = computed(() => {
  return RANDOM_ITEM_POOL
    .filter(item => item.type === 'consumable')
    .map(item => {
      const unlocked = props.inventory.some(i => i.id === item.id);
      return { ...item, isUnlocked: unlocked };
    });
});

const unlockedCount = computed(() => {
  return dictionaryCommands.value.filter(c => c.isUnlocked).length + dictionaryItems.value.filter(c => c.isUnlocked).length;
});

const totalCount = computed(() => {
  return dictionaryCommands.value.length + dictionaryItems.value.length;
});

// 🌟 獲取指令的程式碼範例
const getExampleCode = (cmdId) => {
  // 直接從字典中尋找對應的指令物件
  const cmd = COMMAND_DICT.find(c => c.id === cmdId);
  
  // 如果有範例就顯示，沒有的話才給預設
  return cmd?.example || `// 執行指令\n${cmdId}();`;
};
</script>