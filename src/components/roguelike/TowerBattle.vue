<template>
  <div class="tower-battle h-full w-full flex flex-col bg-[#05050A] relative text-slate-300 font-sans">
    
    <transition name="fade">
      <div v-if="showClearModal" class="absolute inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md">
        <div class="w-[660px] bg-[#1A1A24] border border-emerald-500/50 rounded-[2rem] p-9 shadow-[0_0_40px_rgba(16,185,129,0.3)] flex flex-col gap-7 text-center transform transition-all">
          <div class="space-y-2.5">
            <div class="text-5xl animate-bounce">🎉</div>
            <h3 class="text-emerald-400 font-black text-3xl tracking-widest">區域突破成功！</h3>
            <p class="text-slate-400 text-[15px]">系統正在重組下一層的空間數據...</p>
          </div>
          <div class="flex flex-col gap-3.5 mt-2">
            <div class="text-[15px] text-emerald-500 font-bold tracking-widest text-left flex items-center gap-2.5">
              <span class="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
              偵測到可用模組，請選擇一項升級：
            </div>
            <div class="grid grid-cols-3 gap-4.5">
              <button 
                v-for="reward in currentRewards" 
                :key="reward.id"
                @click="selectReward(reward)"
                class="group border border-slate-600 bg-slate-800/80 hover:bg-emerald-900/40 hover:border-emerald-400 rounded-2xl p-6 flex flex-col items-center gap-3.5 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-[0_10px_20px_rgba(16,185,129,0.25)] cursor-pointer"
              >
                <span class="text-5xl group-hover:scale-125 transition-transform duration-300">{{ reward.icon }}</span>
                <div class="flex flex-col items-center mt-1">
                  <span class="text-[15px] font-black text-slate-200 group-hover:text-emerald-300 tracking-wider">{{ reward.name }}</span>
                  <span class="text-xs font-medium text-slate-400 group-hover:text-emerald-100/70 mt-1.5">{{ reward.desc }}</span>
                </div>
              </button>
            </div>
          </div>
          <button @click="proceedToNextFloor" class="py-3.5 mt-5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 font-bold tracking-widest transition-all text-[15px]">
            放棄獎勵，直接進入下一層 ＞
          </button>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="showMenu" class="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md">
        <div class="w-[350px] bg-[#1A1A24] border border-[#2A2A40] rounded-3xl p-7 shadow-2xl flex flex-col gap-5 text-center">
          <h3 class="text-indigo-400 font-bold text-xl mb-2">機甲控制系統</h3>
          <button @click="showMenu = false" class="py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all text-[15px]">繼續探索</button>
          <button @click="confirmExit('save')" class="py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-[0_0_15px_rgba(79,70,229,0.4)] text-[15px]">暫時中斷 (儲存並退出)</button>
          <button @click="confirmExit('abandon')" class="py-3.5 rounded-xl border border-rose-900/50 bg-rose-950/20 hover:bg-rose-600 text-rose-400 hover:text-white font-bold transition-all text-[15px]">終止連線 (放棄進度)</button>
        </div>
      </div>
    </transition>

    <header class="h-16 flex items-center justify-between px-7 border-b border-indigo-500/20 bg-[#0D0D17] shrink-0 z-50">
      <div class="flex items-center gap-7">
        <button @click="showMenu = true" class="px-3.5 py-2 rounded-lg border border-slate-700 bg-slate-800/40 text-[13px] font-bold hover:bg-slate-700 transition-all shadow-sm">⚙️ 選單</button>
        <div class="flex flex-col">
          <span class="text-[11px] text-indigo-400 font-black tracking-tighter uppercase">Current Location</span>
          <h2 class="text-xl font-black text-white leading-none tracking-wide mt-0.5">ENDLESS TOWER - {{ floor }}F</h2>
        </div>
      </div>

      <div class="flex items-center gap-5">
        <div class="flex items-center gap-4.5 bg-black/40 px-5 py-2.5 rounded-xl border border-white/5 shadow-inner">
          <div class="flex items-center gap-3.5 border-r border-white/10 pr-5">
            <span class="text-[13px] font-black text-indigo-500">LV.{{ level }}</span>
            <div class="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div class="h-full bg-indigo-500 shadow-[0_0_8px_#6366f1] transition-all" :style="{ width: (xp / (level * 100) * 100) + '%' }"></div>
            </div>
          </div>
          <div class="flex items-center gap-2 pl-1.5">
            <span class="text-[15px]">💰</span>
            <span class="text-[15px] font-mono font-bold text-yellow-500">{{ coins }}</span>
          </div>
        </div>
      </div>
    </header>

    <main class="flex-1 flex overflow-hidden p-2.5 gap-2.5">
      
      <aside class="w-[280px] bg-[#0D0D17]/80 backdrop-blur-md border border-white/5 rounded-xl flex flex-col gap-6 p-5 overflow-y-auto custom-scrollbar shadow-xl">
        
        <div>
          <div class="text-[11px] font-black text-indigo-400 uppercase tracking-widest mb-3.5 border-b border-indigo-500/20 pb-1.5">Mission Objective</div>
          <div class="text-[15px] font-bold text-slate-200 leading-relaxed whitespace-pre-line bg-indigo-500/5 p-3.5 rounded-lg border border-indigo-500/10">
            {{ currentObjective || '載入數據中...' }}
          </div>
        </div>

        <div>
          <div class="text-[11px] font-black text-rose-400 uppercase tracking-widest mb-3.5 border-b border-rose-500/20 pb-1.5">Mech Status</div>
          <div class="space-y-3.5 bg-black/30 p-3.5 rounded-lg border border-white/5 shadow-inner">
            <div v-for="stat in stats" :key="stat.label" class="flex flex-col gap-2">
              <div class="flex justify-between items-end leading-none">
                <span :class="stat.colorClass" class="text-[11px] font-black italic">{{ stat.label }}</span>
                <span class="text-[11px] font-mono font-bold text-white">{{ stat.val }} / {{ stat.max }}</span>
              </div>
              <div class="w-full h-2 bg-[#0B0B12] rounded-full overflow-hidden border border-white/5">
                <div class="h-full transition-all" :class="stat.bgClass" :style="{ width: (stat.val / stat.max * 100) + '%' }"></div>
              </div>
            </div>
            <div class="flex justify-between items-center bg-orange-950/30 border border-orange-500/30 px-3.5 py-2.5 rounded-lg mt-2.5">
              <span class="text-[11px] font-black text-orange-500 italic">⚔️ ATK</span>
              <span class="text-[13px] font-mono font-black text-orange-400">{{ attack }}</span>
            </div>
          </div>
        </div>

        <div>
          <div class="text-[11px] font-black text-amber-400 uppercase tracking-widest mb-3.5 border-b border-amber-500/20 pb-1.5 flex justify-between items-end">
            <span>Tactical Backpack</span>
            <transition name="fade">
              <span v-if="actionMessage" class="text-emerald-400 normal-case text-[10px]">{{ actionMessage }}</span>
            </transition>
          </div>
          
          <div class="flex flex-col gap-3 bg-black/30 p-2.5 rounded-lg border border-white/5 shadow-inner min-h-[66px] max-h-[240px] overflow-y-auto custom-scrollbar">
            <div v-if="consumableItems.length === 0" class="py-7 text-[11px] text-slate-600 text-center flex items-center justify-center font-bold tracking-widest">
              背包內無可用道具
            </div>
            
            <button
              v-for="item in consumableItems"
              :key="item.id"
              @click="useItem(item)"
              class="relative group bg-[#11111B] border border-white/10 hover:border-amber-500/50 rounded-lg p-3.5 flex items-center gap-4.5 transition-all duration-300 ease-out shadow-[inset_0_0_10px_rgba(245,158,11,0.02)] active:scale-95 text-left transform-gpu hover:scale-105 hover:shadow-[0_10px_20px_-5px_rgba(245,158,11,0.25)] hover:z-20"
              :title="item.desc"
            >
              <div class="text-4xl shrink-0 group-hover:drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]">
                {{ item.icon }}
              </div>
              
              <div class="flex flex-col flex-1 overflow-hidden">
                <div class="flex justify-between items-center">
                  <span class="text-[13px] font-bold text-slate-200 group-hover:text-amber-300 truncate">{{ item.name }}</span>
                  <span class="text-[11px] font-mono text-amber-500 font-black bg-amber-900/30 px-2 py-1 rounded ml-2">x{{ item.quantity }}</span>
                </div>
                <span class="text-[11px] text-slate-500 truncate mt-1 tracking-tight">{{ item.desc }}</span>
              </div>
            </button>
          </div>
        </div>

        <div>
          <div class="text-[11px] font-black text-emerald-400 uppercase tracking-widest mb-3.5 border-b border-emerald-500/20 pb-1.5">System Status</div>
          <div class="space-y-2.5 bg-emerald-500/5 p-3.5 rounded-lg border border-emerald-500/10">
            <div class="flex justify-between text-[13px]"><span class="text-slate-400 font-bold">當前回合</span><span class="text-emerald-300 font-mono font-bold">TURN {{ currentTurn }}</span></div>
            <div class="flex justify-between text-[13px]"><span class="text-slate-400 font-bold">掃描深度</span><span class="text-emerald-300 font-mono font-bold">{{ floor * 100 }}m</span></div>
          </div>
        </div>

        <div class="mt-auto pt-2.5">
          <div class="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3.5 border-b border-slate-700 pb-1.5">Legend</div>
          <div class="grid grid-cols-2 gap-3 text-[11px] font-bold text-slate-400">
            <div class="flex items-center gap-2.5"><span class="w-3 h-3 rounded-sm bg-indigo-500 shadow-[0_0_5px_#6366f1]"></span> 玩家機甲</div>
            <div class="flex items-center gap-2.5"><span class="w-3 h-3 rounded-sm bg-fuchsia-500 shadow-[0_0_5px_#d946ef]"></span> 數據終端</div>
            <div class="flex items-center gap-2.5"><span class="w-3 h-3 rounded-sm bg-rose-500"></span> 威脅目標</div>
            <div class="flex items-center gap-2.5"><span class="w-3 h-3 rounded-sm bg-emerald-500"></span> 起始座標</div>
          </div>
        </div>
      </aside>

      <div class="flex-1 bg-black rounded-xl border border-white/5 overflow-hidden relative shadow-2xl">
        <div id="endless-game-container" class="w-full h-full"></div>
      </div>

      <aside class="w-[440px] flex flex-col gap-2.5">
        <div class="h-[60%] bg-[#131320] border border-white/5 rounded-xl flex flex-col overflow-hidden shadow-2xl relative z-40">
          <div class="px-5 py-2.5 bg-black/40 border-b border-white/5 flex justify-between items-center shrink-0">
            <span class="text-[11px] font-black text-indigo-400 uppercase tracking-widest">Code Editor</span>
            <button @click="clearCode" class="text-[11px] text-rose-400 hover:text-white transition-colors">CLEAN</button>
          </div>
          
          <transition name="fade">
            <div v-if="commandPreview.length > 0" class="bg-[#0A0A10] border-b border-indigo-500/20 flex gap-2.5 overflow-x-auto custom-scrollbar items-center shrink-0 p-2.5 shadow-inner">
              <span class="text-[10px] font-black text-indigo-500/70 shrink-0 ml-2.5">EXPECTED:</span>
              <div class="flex gap-2 shrink-0 px-2.5">
                <span v-for="(icon, index) in commandPreview" :key="index" class="w-7 h-7 flex items-center justify-center bg-indigo-900/30 border border-indigo-500/30 rounded text-[13px] text-indigo-200 shadow-[0_0_8px_rgba(99,102,241,0.15)] animate-pulse" :style="{ animationDelay: `${index * 0.1}s` }">
                  {{ icon }}
                </span>
              </div>
            </div>
          </transition>

          <div class="flex-1 relative flex overflow-hidden">
            <div ref="lineNumbersRef" class="w-9 bg-black/20 flex flex-col items-center py-4.5 text-[11px] text-slate-600 font-mono border-r border-white/5 shrink-0 overflow-hidden select-none">
              <span v-for="n in lineCount" :key="n" class="leading-relaxed">{{ n }}</span>
            </div>
            
            <textarea 
              ref="codeEditor"
              v-model="codeContent" 
              class="flex-1 p-4.5 bg-transparent text-indigo-300 font-mono text-[15px] resize-none focus:outline-none overflow-y-auto custom-scrollbar leading-relaxed"
              placeholder="// Enter command..."
              spellcheck="false"
              @scroll="syncScroll"
              @keydown="handleEditorKeyDown" 
              @keyup="checkAutocomplete"
            ></textarea>

            <transition name="fade">
              <div v-if="showSuggestions" class="absolute z-50 bg-[#1A1A24] border border-indigo-500/50 rounded-lg shadow-xl pb-1 min-w-[165px] bottom-1 left-14 max-h-[176px] overflow-y-auto custom-scrollbar shadow-[0_0_15px_rgba(79,70,229,0.3)]">
                <div class="px-3.5 py-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest border-b border-indigo-500/30 bg-black/40 sticky top-0">系統建議指令</div>
                
                <div 
                  v-for="s in suggestions" 
                  :key="s" 
                  @mousedown.prevent="applySuggestion(s)" 
                  class="px-4.5 py-2.5 text-[13px] font-mono text-indigo-300 hover:bg-indigo-600 hover:text-white cursor-pointer transition-colors"
                >
                  {{ s }}()
                </div>
              </div>
            </transition>
          </div>

          <transition name="fade">
            <div v-if="errorMessage" class="shrink-0 p-4.5 bg-rose-950/95 border-t border-rose-500/50 text-rose-200 shadow-xl flex items-start justify-between backdrop-blur-sm z-50 shadow-[0_-4px_20px_rgba(225,29,72,0.3)]">
              <span class="text-[15px] font-medium flex-1 mr-4.5">⚠️ {{ errorMessage }}</span>
              <button @click="errorMessage = ''" class="text-rose-400 hover:text-white text-[22px] leading-none font-bold">×</button>
            </div>
          </transition>
        </div>

        <div class="h-[40%] bg-[#0D0D17] border border-white/5 rounded-xl flex flex-col overflow-hidden">
          <div class="px-4.5 py-2.5 bg-black/40 border-b border-white/5 text-[11px] font-black text-slate-500 uppercase tracking-widest">Command Library</div>
          <div class="flex-1 p-3.5 overflow-y-auto custom-scrollbar">
            <div v-for="cat in commandCategories" :key="cat.name" class="mb-4.5">
              <div class="text-[11px] text-slate-500 mb-2.5 px-1">{{ cat.name }}</div>
              <div class="grid grid-cols-2 gap-2">
                <button v-for="cmd in cat.commands" :key="cmd.id" @click="insertCode(cmd.id)" class="text-xs py-2 px-2.5 rounded-md border border-white/5 bg-white/5 hover:bg-white/10 transition-all flex items-center gap-2.5">
                  <span class="text-[13px]">{{ cmd.icon || '🔹' }}</span> {{ cmd.label }}
                </button>
              </div>
            </div>
          </div>
          <div class="m-3.5 flex gap-2.5">
            <button 
              v-if="isAiming" 
              @click="cancelAiming" 
              class="flex-1 py-3.5 bg-rose-950/40 border border-rose-900 hover:bg-rose-600 text-rose-300 hover:text-white font-black rounded-lg shadow-lg active:scale-95 transition-all text-[15px] tracking-widest"
            >
              🚫 取消瞄準
            </button>
            <button 
              v-else 
              @click="executeCode" 
              class="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-lg shadow-lg shadow-indigo-500/20 active:scale-95 transition-all text-[15px] tracking-widest disabled:opacity-50 disabled:cursor-not-allowed" 
              :disabled="!codeContent.trim() || errorMessage !== ''"
            >
              EXECUTE PROGRAM
            </button>
          </div>
        </div>
      </aside>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'; 
import { COMMAND_DICT } from '../../game/config/CommandList.js'; 
import { getRandomRewards } from '../../game/config/RewardList.js';

const props = defineProps(['floor', 'hp', 'maxHp', 'mp', 'maxMp', 'ap', 'maxAp', 'attack', 'coins', 'level', 'xp', 'totalExp', 'inventory']);
const emit = defineEmits(['stop', 'abandon', 'init-game', 'execute', 'update-stats', 'floor-cleared', 'update-inventory']);

const showMenu = ref(false); 
const codeContent = ref('');
const codeEditor = ref(null);
const errorMessage = ref("");
const lineNumbersRef = ref(null);
const showClearModal = ref(false);
const currentObjective = ref('');
const isAiming = ref(false);
const pendingCommand = ref(null);
const currentRewards = ref([]);
const currentTurn = ref(1); 
const actionMessage = ref('');

const consumableItems = computed(() => {
  return (props.inventory || []).filter(item => item.type === 'consumable');
});

const availableCommands = computed(() => {
  return COMMAND_DICT.filter(cmd => {
    if (!cmd.reqModule) return true;
    return (props.inventory || []).some(i => i.id === cmd.reqModule);
  });
});

// 🌟 修正：將 validKeywords 改為大寫 VALID_KEYWORDS 確保與下方變數呼叫一致
const VALID_KEYWORDS = computed(() => {
  const jsKeywords = ['let', 'const', 'var', 'await', 'async', 'return', 'true', 'false', 'p'];
  return [...jsKeywords, ...availableCommands.value.map(c => c.id)];
});

const useItem = (item) => {
  const newInventory = JSON.parse(JSON.stringify(props.inventory || []));
  const itemIndex = newInventory.findIndex(i => i.id === item.id);

  if (itemIndex === -1) return;

  let effectMsg = '';
  if (item.id === 'potion_small') {
    const healAmount = 30;
    emit('update-stats', { hp: Math.min(props.maxHp, props.hp + healAmount) });
    effectMsg = `+${healAmount} HP`;
  } else if (item.id === 'potion_large') {
    const healAmount = 100;
    emit('update-stats', { hp: Math.min(props.maxHp, props.hp + healAmount) });
    effectMsg = `+${healAmount} HP`;
  } else if (item.id === 'ap_battery') {
    const apRestore = 20;
    emit('update-stats', { ap: Math.min(props.maxAp, props.ap + apRestore) });
    effectMsg = `+${apRestore} AP`;
  } else {
    window.dispatchEvent(new CustomEvent('use-battle-item', { detail: { itemId: item.id } }));
    effectMsg = `使用 ${item.name}`;
  }

  newInventory[itemIndex].quantity -= 1;
  if (newInventory[itemIndex].quantity <= 0) {
    newInventory.splice(itemIndex, 1);
  }

  emit('update-inventory', newInventory);

  actionMessage.value = effectMsg;
  setTimeout(() => { actionMessage.value = ''; }, 2000);
};

const stats = computed(() => [
  { label: 'HP', val: props.hp, max: props.maxHp, bgClass: 'bg-rose-500 shadow-[0_0_8px_#ef4444]', colorClass: 'text-rose-500' },
  { label: 'MP', val: props.mp, max: props.maxMp, bgClass: 'bg-cyan-500 shadow-[0_0_8px_#06b6d4]', colorClass: 'text-cyan-500' },
  { label: 'AP', val: props.ap, max: props.maxAp, bgClass: 'bg-fuchsia-500 shadow-[0_0_8px_#d946ef]', colorClass: 'text-fuchsia-500' },
]);

const confirmExit = (type) => {
  showMenu.value = false;
  if (type === 'save') { emit('stop'); } 
  else if (type === 'abandon') {
    if (confirm('警告：確定要終止連線嗎？目前的層數與局內金幣將會消失！')) { emit('abandon'); }
  }
};

const handleFloorCleared = () => {
  currentRewards.value = getRandomRewards(3);
  showClearModal.value = true;
};

const selectReward = (reward) => {
  if (!reward.type || reward.type === 'stat') {
    const currentStats = {
      hp: props.hp, maxHp: props.maxHp,
      mp: props.mp, maxMp: props.maxMp,
      ap: props.ap, maxAp: props.maxAp,
      attack: props.attack || 10,
      coins: props.coins, xp: props.xp, level: props.level
    };
    emit('update-stats', reward.apply(currentStats));
  }

  else if (reward.type === 'relic') {
    // 透過事件傳遞給 Phaser 遊戲引擎
    window.dispatchEvent(new CustomEvent('tower-add-relic', { detail: reward.relicId }));
    
    // 顯示提示文字
    actionMessage.value = `安裝晶片: ${reward.name}`;
    setTimeout(() => { actionMessage.value = ''; }, 3000);
  }
  proceedToNextFloor();
};

const proceedToNextFloor = () => {
  showClearModal.value = false;
  codeContent.value = '';
  emit('floor-cleared'); 
};

const lineCount = computed(() => {
  if (!codeContent.value) return 25;
  const lines = codeContent.value.split('\n').length;
  return Math.max(25, lines);
});

const insertCode = (commandId) => {
  const needTargetingSkills = ['attack', 'shoot', 'magic', 'bomb', 'laser', 'dash', 'hack_wall', 'pull', 'boomerang', 'spread_shot'];
  if (needTargetingSkills.includes(commandId)) {
    isAiming.value = true;
    pendingCommand.value = commandId;
    window.dispatchEvent(new CustomEvent('tower-start-targeting'));
    return; 
  }

  let snippet = '';
  if (commandId === 'for') { snippet = `for(let i=0; i < 3; i++){\n  \n}\n`; }
  else if (commandId === 'if') { snippet = `if (isWall(1,0)) {\n  \n}\n`; }
  else if (commandId === 'while') { snippet = `while (isWall(1,0)) {\n  \n}\n`; }
  else if (commandId === 'function') { snippet = `function mySkill() {\n  \n}\n`; }
  else if (commandId === 'isWall') { snippet = `isWall(0, 1);\n`; }
  else if (commandId === 'isEnemy') { snippet = `isEnemy(1, 0);\n`; }
  else if (commandId === 'isGoal') { snippet = `isGoal(0, -1);\n`; }
  else { snippet = `${commandId}();\n`; }
  codeContent.value += snippet;
};

const commandPreview = computed(() => {
  if (!codeContent.value) return [];
  const lines = codeContent.value.split(/[\n;]+/);
  const preview = [];
  
  const iconMap = {
    'moveUp': '↑', 'moveDown': '↓', 'moveLeft': '←', 'moveRight': '→',
    'attack': '⚔️', 'shoot': '🔫', 'wait': '⏳', 'take': '🖐️', 'dash': '⚡',
    'magic': '✨', 'bomb': '💣', 'heal': '💖'
  };

  for (const line of lines) {
    const match = line.match(/([a-zA-Z_0-9]+)\s*\(/);
    if (match && iconMap[match[1]]) {
      preview.push(iconMap[match[1]]);
    }
  }
  return preview;
});

const cancelAiming = () => {
  isAiming.value = false;
  pendingCommand.value = null;
  window.dispatchEvent(new CustomEvent('tower-cancel-targeting'));
};

const handleTargetSelected = (e) => {
  if (isAiming.value && pendingCommand.value) {
    const { dx, dy } = e.detail;
    const argsObj = { dx: dx, dy: dy };
    const argsString = JSON.stringify(argsObj).replace(/"/g, "'").replace(/,/g, ", ");
    codeContent.value += `${pendingCommand.value}(${argsString});\n`;
    isAiming.value = false;
    pendingCommand.value = null;
  }
};

const handleObjectiveUpdate = (e) => {
  currentObjective.value = e.detail;
};

const clearCode = () => {
  codeContent.value = '';
  errorMessage.value = '';
};

const executeCode = () => {
  if (errorMessage.value) return;
  const rawCode = codeContent.value.trim();
  if (!rawCode) return;
  
  let totalApCost = 0;
  const parsedCommands = rawCode
    .split(/[\n;]+/)
    .map(cmd => cmd.trim())
    .filter(cmd => cmd.length > 0)
    .map(cmdStr => {
      const match = cmdStr.match(/^([a-zA-Z_0-9]+)\s*\((.*)\)$/);
      if (match) {
        const id = match[1];
        let args = {};
        if (match[2].trim()) {
          try { args = new Function('return ' + match[2])() || {}; } catch(e) {}
        }
        const dictCmd = COMMAND_DICT.find(c => c.id === id);
        totalApCost += dictCmd?.ap || 0; 
        return { id, args }; 
      }
      const dictCmd = COMMAND_DICT.find(c => c.id === cmdStr);
      totalApCost += dictCmd?.ap || 0;
      return { id: cmdStr, args: {} };
    });

  if (props.ap >= totalApCost) {
    emit('update-stats', { ap: Math.max(0, props.ap - totalApCost) });
    emit('execute', codeContent.value); 
    currentTurn.value++;
  } else {
    alert(`⚡ 系統警告：行動值 (AP) 不足！\n執行此程式需要 ${totalApCost} AP，但目前僅剩 ${props.ap} AP。`);
  }
};

const commandCategories = computed(() => {
  const moveIds = ['moveUp', 'moveDown', 'moveLeft', 'moveRight', 'wait', 'dash'];
  const interactIds = ['take', 'open', 'hack_wall'];
  const combatIds = ['attack', 'shoot', 'magic', 'bomb', 'heal', 'laser', 'spread_shot', 'pull', 'boomerang', 'whirlwind'];
  
  return [
    { name: '🏃‍♂️ 移動與動作', theme: 'indigo', open: true, commands: availableCommands.value.filter(c => moveIds.includes(c.id)) },
    { name: '👁️ 條件與感知', theme: 'emerald', open: false, commands: availableCommands.value.filter(c => c.type === 'sensor') },
    { name: '⚙️ 互動與機制', theme: 'amber', open: false, commands: availableCommands.value.filter(c => interactIds.includes(c.id)) },
    { name: '⚔️ 攻擊與戰鬥', theme: 'rose', open: false, commands: availableCommands.value.filter(c => combatIds.includes(c.id)) },
    { name: '🧠 邏輯控制', theme: 'pink', open: false, commands: availableCommands.value.filter(c => c.type === 'logic') }
  ].filter(cat => cat.commands && cat.commands.length > 0);
});

const validateCode = () => {
  errorMessage.value = "";
  if (!codeContent.value) return;
  const codeWithoutComments = codeContent.value.replace(/\/\/.*$/gm, '');
  const words = codeWithoutComments.match(/[a-zA-Z_]+/g) || [];
  const declaredVariables = []; 

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (i > 0 && ['function', 'let', 'const', 'var'].includes(words[i - 1])) {
      declaredVariables.push(word);
      continue;
    }
    if (word.length <= 1) continue;
    
    // 🌟 修正：因為 VALID_KEYWORDS 是 computed 屬性，這裡必須加上 .value 取值
    if (!VALID_KEYWORDS.value.includes(word) && !declaredVariables.includes(word)) {
      errorMessage.value = `❌ 語法錯誤：系統不認識 '${word}' 這個指令。您是不是拼錯了？`;
      return; 
    }
  }
};

watch(codeContent, () => validateCode());

const showSuggestions = ref(false);
const suggestions = ref([]);
const currentWord = ref("");

const handleEditorKeyDown = async (e) => {
  const el = e.target;
  const key = e.key;

  if (key === 'Tab') {
    e.preventDefault();
    if (showSuggestions.value && suggestions.value.length > 0) {
      applySuggestion(suggestions.value[0], el);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    codeContent.value = codeContent.value.substring(0, start) + "  " + codeContent.value.substring(end);
    await nextTick();
    el.selectionStart = el.selectionEnd = start + 2;
    return;
  }

  const pairs = { '{': '}', '[': ']', '(': ')', '"': '"', "'": "'" };
  const closeChars = ['}', ']', ')', '"', "'"];
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const text = codeContent.value;

  if (closeChars.includes(key) && text.charAt(start) === key) {
    e.preventDefault(); 
    el.selectionStart = el.selectionEnd = start + 1; 
    return;
  }
  const closeChar = pairs[key];
  if (closeChar) {
    e.preventDefault(); 
    codeContent.value = text.substring(0, start) + key + closeChar + text.substring(end);
    await nextTick();
    el.selectionStart = el.selectionEnd = start + 1; 
  }
};

const checkAutocomplete = (e) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Enter', 'Tab'].includes(e.key)) {
    showSuggestions.value = false;
    return;
  }
  
  const el = codeEditor.value || document.querySelector('textarea');
  if (!el) return;

  const cursorPosition = el.selectionStart;
  const textBeforeCursor = codeContent.value.substring(0, cursorPosition);
  const match = textBeforeCursor.match(/[a-zA-Z_]+$/);
  
  if (match) {
    currentWord.value = match[0];
    // 🌟 修正：這裡也同樣需要加上 .value
    if (currentWord.value.length >= 1 && !VALID_KEYWORDS.value.includes(currentWord.value)) {
        suggestions.value = VALID_KEYWORDS.value.filter(k => k.startsWith(currentWord.value));
        showSuggestions.value = suggestions.value.length > 0;
    } else { showSuggestions.value = false; }
  } else { showSuggestions.value = false; }
};

const applySuggestion = (suggestion, targetEl = null) => {
  const el = targetEl || codeEditor.value || document.querySelector('textarea');
  if (!el) return; 
  
  const cursorPosition = el.selectionStart;
  const textBeforeCursor = codeContent.value.substring(0, cursorPosition);
  const textAfterCursor = codeContent.value.substring(cursorPosition);
  const newTextBefore = textBeforeCursor.replace(/[a-zA-Z_]+$/, suggestion);
  
  const isKeyword = ['function', 'let', 'const', 'for', 'while', 'if', 'else', 'await'].includes(suggestion);
  const appendText = isKeyword ? ' ' : '()';

  codeContent.value = newTextBefore + appendText + textAfterCursor;
  showSuggestions.value = false;

  nextTick(() => {
    const newCursorPos = newTextBefore.length + (isKeyword ? 1 : 1);
    el.selectionStart = el.selectionEnd = newCursorPos;
    el.focus();
    validateCode(); 
  });
};

const syncScroll = (e) => {
  if (lineNumbersRef.value) {
    lineNumbersRef.value.scrollTop = e.target.scrollTop;
  }
};

onMounted(() => {
  emit('init-game');
  window.addEventListener('tower-player-hurt', (e) => emit('update-stats', { hp: Math.max(0, props.hp - e.detail.damage) }));
  window.addEventListener('tower-player-heal', (e) => emit('update-stats', { hp: Math.min(props.maxHp, props.hp + e.detail.amount) }));
  window.addEventListener('tower-coin-collected', (e) => emit('update-stats', { coins: props.coins + e.detail.amount }));
  window.addEventListener('tower-target-selected', handleTargetSelected);
  window.addEventListener('tower-objective-updated', handleObjectiveUpdate); 
  window.addEventListener('tower-floor-cleared', handleFloorCleared);
});

onUnmounted(() => {
  window.removeEventListener('tower-target-selected', handleTargetSelected);
  window.removeEventListener('tower-objective-updated', handleObjectiveUpdate); 
  window.removeEventListener('tower-floor-cleared', handleFloorCleared);
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.2); }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6366f1; }
@keyframes sweep { 0% { transform: translateX(-150%) skewX(12deg); } 100% { transform: translateX(250%) skewX(12deg); } }
</style>