<template>
  <transition name="fade">
    <div class="absolute inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" @click.self="$emit('close')">
      
      <div class="w-[1180px] max-w-[95vw] h-[935px] max-h-[90vh] bg-[#050B14] border border-cyan-500/30 rounded-[1.75rem] shadow-[0_0_60px_rgba(6,182,212,0.2)] flex flex-col overflow-hidden transform transition-all">
        
        <header class="h-20 px-8 bg-gradient-to-r from-cyan-900/40 to-transparent border-b border-cyan-500/20 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-4">
            <span class="text-3xl">📖</span>
            <h2 class="text-2xl font-black text-cyan-400 tracking-widest uppercase">全域資料圖鑑 <span class="text-base text-slate-500 ml-3 font-normal">Archive</span></h2>
          </div>
          
          <div class="flex items-center gap-5">
            <div class="flex items-center gap-2.5 bg-black/50 px-5 py-2 rounded-full border border-cyan-500/20 text-sm font-bold text-slate-300">
              解鎖進度：<span class="text-cyan-400 font-mono text-base">{{ unlockedCount }} / {{ totalCount }}</span>
            </div>
            <button @click="$emit('close')" class="text-slate-400 hover:text-cyan-400 text-3xl font-bold transition-colors w-10 h-10 flex items-center justify-center rounded-full hover:bg-cyan-500/10">×</button>
          </div>
        </header>

        <div class="flex border-b border-white/5 bg-[#0A101A] shrink-0">
          <button 
            @click="activeTab = 'commands'; selectedCommand = null" 
            class="flex-1 py-4 text-base font-black tracking-widest transition-all border-b-[3px]"
            :class="activeTab === 'commands' ? 'border-cyan-500 text-cyan-400 bg-cyan-900/10' : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'"
          >
            💻 指令文獻
          </button>
          <button 
            @click="activeTab = 'items'" 
            class="flex-1 py-4 text-base font-black tracking-widest transition-all border-b-[3px]"
            :class="activeTab === 'items' ? 'border-emerald-500 text-emerald-400 bg-emerald-900/10' : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'"
          >
            📦 道具庫存
          </button>
        </div>

        <main class="flex-1 overflow-hidden bg-[#050B14]">
          
          <div v-if="activeTab === 'commands'" class="h-full flex">
            
            <div class="w-1/3 h-full overflow-y-auto custom-scrollbar border-r border-white/5 p-6 bg-[#0A101A]/50">
              <div v-for="category in categorizedCommands" :key="category.name" class="mb-8">
                <div class="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 px-1 border-b border-slate-800 pb-2">
                  {{ category.name }}
                </div>
                <div class="flex flex-col gap-3">
                  <button
                    v-for="cmd in category.cmds"
                    :key="cmd.id"
                    @click="selectedCommand = cmd"
                    class="flex items-center gap-4 p-3.5 rounded-xl border text-left transition-all duration-200"
                    :class="[
                      selectedCommand?.id === cmd.id 
                        ? 'bg-cyan-900/30 border-cyan-500 text-cyan-300 shadow-[inset_0_0_20px_rgba(6,182,212,0.15)]' 
                        : (cmd.isUnlocked ? 'bg-[#11111B] border-white/5 hover:border-cyan-500/50 hover:bg-[#1A2235] text-slate-300' : 'bg-black/50 border-transparent text-slate-600 grayscale opacity-50')
                    ]"
                  >
                    <span class="text-2xl w-8 text-center">{{ cmd.isUnlocked ? (cmd.icon || '🔹') : '🔒' }}</span>
                    <span class="text-sm font-bold font-mono tracking-wider">{{ cmd.isUnlocked ? cmd.id : '???' }}</span>
                  </button>
                </div>
              </div>
            </div>

            <div class="w-2/3 h-full p-8 overflow-y-auto custom-scrollbar relative">
              
              <div v-if="!selectedCommand" class="absolute inset-0 flex flex-col items-center justify-center text-slate-600 opacity-50">
                <span class="text-[5rem] mb-6">🖥️</span>
                <p class="font-bold tracking-widest text-lg">請從左側選擇指令以查看文獻</p>
              </div>

              <div v-else-if="!selectedCommand.isUnlocked" class="h-full flex flex-col items-center justify-center text-rose-500/80">
                <span class="text-[5rem] mb-6">🔒</span>
                <h3 class="text-2xl font-black tracking-widest mb-3">權限不足</h3>
                <p class="text-base text-rose-400/60">無法存取此指令資料。請前往 24H 補給商店購買對應模組以解鎖。</p>
              </div>

              <div v-else class="flex flex-col gap-8 animate-fade-in">
                <div class="flex gap-6 items-start border-b border-cyan-500/20 pb-8">
                  <div class="w-32 h-32 shrink-0 rounded-3xl bg-cyan-900/20 border border-cyan-500/50 flex items-center justify-center text-[5rem] shadow-[0_0_40px_rgba(6,182,212,0.2)]">
                    {{ selectedCommand.icon || '🔹' }}
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center gap-4 mb-3">
                      <h2 class="text-4xl font-black text-cyan-300 tracking-wider">{{ selectedCommand.label }}</h2>
                      <span class="px-3 py-1 rounded-md bg-cyan-950 text-cyan-400 text-xs font-mono border border-cyan-800">AP COST: {{ selectedCommand.ap || 0 }}</span>
                    </div>
                    <p class="text-base text-cyan-100/70 font-mono bg-cyan-950/30 px-4 py-2 rounded-lg mt-3 inline-block border border-cyan-900/50">
                      Syntax: <span class="text-cyan-300">{{ selectedCommand.id }}()</span>
                    </p>
                  </div>
                </div>

                <div>
                  <h4 class="text-sm font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span class="w-2 h-2 bg-slate-400 rounded-full"></span> 運作原理 Description
                  </h4>
                  <p class="text-base text-slate-300 leading-relaxed bg-white/5 p-5 rounded-2xl border border-white/5">
                    {{ selectedCommand.desc }}
                  </p>
                </div>

                <div>
                  <h4 class="text-sm font-black text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span class="w-2 h-2 bg-emerald-400 rounded-full"></span> 實戰範例 Example Code
                  </h4>
                  <div class="bg-[#05050A] rounded-2xl border border-emerald-500/20 p-5 relative overflow-hidden group">
                    <div class="absolute top-0 right-0 px-3 py-1.5 bg-emerald-900/40 text-emerald-500 text-xs font-bold rounded-bl-xl border-b border-l border-emerald-500/20">JAVASCRIPT</div>
                    <pre class="font-mono text-base text-emerald-300/90 whitespace-pre-wrap mt-2"><code>{{ getExampleCode(selectedCommand.id) }}</code></pre>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <div v-if="activeTab === 'items'" class="h-full overflow-y-auto p-8 custom-scrollbar">
            <div class="grid grid-cols-3 gap-6">
              <div 
                v-for="item in dictionaryItems" 
                :key="item.id"
                class="border rounded-2xl p-6 flex flex-col items-center text-center gap-4 transition-all duration-300 relative overflow-hidden"
                :class="item.isUnlocked ? 'bg-[#0F172A] border-emerald-500/30 hover:border-emerald-400 shadow-[inset_0_0_30px_rgba(16,185,129,0.05)]' : 'bg-black/50 border-white/5 grayscale opacity-60'"
              >
                <div class="w-20 h-20 shrink-0 rounded-full flex items-center justify-center text-5xl bg-black/40 border border-white/5"
                     :class="{'drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]': item.isUnlocked}">
                  {{ item.isUnlocked ? item.icon : '❓' }}
                </div>
                
                <div>
                  <h3 class="text-lg font-black tracking-wide" :class="item.isUnlocked ? 'text-emerald-300' : 'text-slate-500'">
                    {{ item.isUnlocked ? item.name : '???' }}
                  </h3>
                  <p class="text-xs mt-2 leading-relaxed" :class="item.isUnlocked ? 'text-slate-400' : 'text-slate-600'">
                    {{ item.isUnlocked ? item.desc : '尚未解析此物質的組成成分' }}
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

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.2); }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(6, 182, 212, 0.3); border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(6, 182, 212, 0.6); }
</style>