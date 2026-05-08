<template>
  <div class="tower-battle h-full w-full flex flex-col bg-[#0B0B12] relative">
    
    <transition name="fade">
      <div v-if="showClearModal" class="absolute inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md">
        <div class="w-[600px] bg-[#1A1A24] border border-emerald-500/50 rounded-3xl p-8 shadow-[0_0_40px_rgba(16,185,129,0.3)] flex flex-col gap-6 text-center transform transition-all">
          
          <div class="space-y-2">
            <div class="text-4xl animate-bounce">🎉</div>
            <h3 class="text-emerald-400 font-black text-2xl tracking-widest">區域突破成功！</h3>
            <p class="text-slate-400 text-sm">系統正在重組下一層的空間數據...</p>
          </div>
          
          <div class="flex flex-col gap-3 mt-2">
            <div class="text-sm text-emerald-500 font-bold tracking-widest text-left flex items-center gap-2">
              <span class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              偵測到可用模組，請選擇一項升級：
            </div>
            
            <div class="grid grid-cols-3 gap-4">
              <button 
                v-for="reward in currentRewards" 
                :key="reward.id"
                @click="selectReward(reward)"
                class="group border border-slate-600 bg-slate-800/80 hover:bg-emerald-900/40 hover:border-emerald-400 rounded-xl p-5 flex flex-col items-center gap-3 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-[0_10px_20px_rgba(16,185,129,0.25)] cursor-pointer"
              >
                <span class="text-4xl group-hover:scale-125 transition-transform duration-300">{{ reward.icon }}</span>
                <div class="flex flex-col items-center">
                  <span class="text-sm font-black text-slate-200 group-hover:text-emerald-300 tracking-wider">{{ reward.name }}</span>
                  <span class="text-[11px] font-medium text-slate-400 group-hover:text-emerald-100/70 mt-1">{{ reward.desc }}</span>
                </div>
              </button>
            </div>
          </div>
          
          <button @click="proceedToNextFloor" class="py-3 mt-4 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 font-bold tracking-widest transition-all">
            放棄獎勵，直接進入下一層 ＞
          </button>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="showMenu" class="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md">
        <div class="w-80 bg-[#1A1A24] border border-[#2A2A40] rounded-2xl p-6 shadow-2xl flex flex-col gap-4 text-center">
          <h3 class="text-indigo-400 font-bold text-lg mb-2">機甲控制系統</h3>
          <button @click="showMenu = false" class="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all">繼續探索</button>
          <button @click="confirmExit('save')" class="py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-[0_0_15px_rgba(79,70,229,0.4)]">暫時中斷 (儲存並退出)</button>
          <button @click="confirmExit('abandon')" class="py-3 rounded-xl border border-rose-900/50 bg-rose-950/20 hover:bg-rose-600 text-rose-400 hover:text-white font-bold transition-all">終止連線 (放棄進度)</button>
        </div>
      </div>
    </transition>

   <header class="h-16 flex items-center justify-between px-6 border-b border-[#2A2A40] bg-[#131320]">
      <div class="flex items-center gap-5">
        <button @click="showMenu = true" class="text-slate-500 hover:text-white text-sm font-bold border border-slate-800 px-3 py-1 rounded transition-colors flex items-center gap-2">
          ⚙️ 系統選單
        </button>
        <h2 class="text-xl font-black text-white tracking-widest">第 {{ floor }} 層</h2>
      </div>
      
      <div class="flex gap-6 items-center">
        <div class="text-yellow-400 font-mono font-bold flex items-center gap-2 text-lg">
          <span>💰</span> {{ coins }}
        </div>
        
        <div class="flex flex-col w-48 ml-2">
          <div class="flex justify-between items-end mb-1">
            <span class="text-xs text-indigo-400 font-bold uppercase tracking-wider">Level : {{ level }}</span>
            <span class="text-[10px] text-indigo-300 font-mono">{{ xp }} / {{ 1000 }}</span>
          </div>
          <div class="w-full h-2 bg-slate-800 rounded-full overflow-hidden shadow-[inset_0_0_5px_rgba(0,0,0,0.8)]">
            <div class="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 shadow-[0_0_10px_#d946ef] transition-all duration-1000" :style="{ width: (xp / 1000 * 100) + '%' }"></div>
          </div>
        </div>
        
        <div class="flex items-center gap-2 ml-4">
          <span class="text-rose-500 font-black text-xs italic">HP : {{ hp }}/{{ maxHp }}</span>
          <div class="w-24 h-3 bg-black rounded-full overflow-hidden border border-slate-800">
            <div class="h-full bg-gradient-to-r from-rose-700 to-rose-500 transition-all duration-300" :style="{ width: (hp / maxHp * 100) + '%' }"></div>
          </div>
          
          <span class="text-cyan-500 font-black text-xs italic ml-2">MP : {{ mp }}/{{ maxMp }}</span>
          <div class="w-24 h-3 bg-black rounded-full overflow-hidden border border-slate-800">
            <div class="h-full bg-gradient-to-r from-cyan-700 to-cyan-500 transition-all duration-300" :style="{ width: (mp / maxMp * 100) + '%' }"></div>
          </div>
          
          <span class="text-fuchsia-500 font-black text-xs italic ml-2">AP : {{ ap }}/{{ maxAp }}</span>
          <div class="w-24 h-3 bg-black rounded-full overflow-hidden border border-slate-800">
            <div class="h-full bg-gradient-to-r from-fuchsia-700 to-fuchsia-500 transition-all duration-300" :style="{ width: (ap / maxAp * 100) + '%' }"></div>
          </div>

          <div class="flex items-center justify-center ml-2 bg-orange-950/40 border border-orange-800/50 px-3 py-1 rounded-lg">
            <span class="text-orange-500 font-black text-sm italic">⚔️ ATK : {{ attack || 10 }}</span>
          </div>
        </div>
      </div>
    </header>

    <main class="flex-1 flex overflow-hidden p-4 gap-4">
      <div class="relative flex-1 bg-black rounded-2xl border border-[#2A2A40] overflow-hidden shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]">
        
        <div class="absolute top-4 left-4 z-50 pointer-events-none transition-all duration-300">
          <div class="bg-[#1A1A24]/90 backdrop-blur-md border border-indigo-500/50 rounded-xl p-4 shadow-[0_0_25px_rgba(79,70,229,0.3)] min-w-[200px]">
            <div class="text-[10px] uppercase tracking-[0.2em] text-indigo-400 font-black mb-2 flex items-center gap-2">
              <span class="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>Mission Objectives
            </div>
            <div class="text-white font-bold text-sm leading-relaxed whitespace-pre-line">{{ currentObjective || '系統連線中...' }}</div>
          </div>
        </div>

        <div id="endless-game-container" class="w-full h-full"></div>
      </div>

      <aside class="w-[400px] bg-[#11111B]/90 backdrop-blur-xl border border-[#2A2A40] rounded-2xl flex flex-col overflow-hidden shadow-2xl relative z-40">
        <div class="p-4 border-b border-[#2A2A40] font-bold text-indigo-400 flex items-center gap-2">
          <span class="animate-pulse">💻</span> 戰術指令控制台
        </div>
        
        <div class="flex-1 p-4 overflow-hidden flex flex-col gap-4">
          <div class="h-1/2 flex flex-col">
            <div class="text-xs text-slate-400 mb-2 font-bold tracking-wider">📥 模組資料庫：</div>
            <div class="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
              <details v-for="(cat, index) in commandCategories" :key="index" :open="cat.open" class="group bg-[#1A1A24]/80 rounded-xl border border-[#2A2A40] overflow-hidden transition-all duration-300">
                <summary class="cursor-pointer p-3 text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 flex justify-between items-center select-none transition-colors">
                  <span>{{ cat.name }}</span><span class="group-open:rotate-180 transition-transform duration-300 text-slate-500 text-xs">▼</span>
                </summary>
                <div class="p-3 pt-1 grid grid-cols-2 gap-2 bg-[#0B0B12]/50 border-t border-[#2A2A40]/50">
                  <button v-for="cmd in cat.commands" :key="cmd.id" @click="insertCode(cmd.id)" class="text-xs py-2 px-2 rounded-lg border transition-all duration-300 text-left truncate flex items-center gap-1.5" :class="getThemeClasses(cat.theme)" :title="cmd.label">
                    {{ cmd.label }}
                  </button>
                </div>
              </details>
            </div>
          </div>

          <div class="h-1/2 flex flex-col bg-[#1E1E2E] rounded-xl border overflow-hidden relative shadow-inner transition-colors duration-300" :class="errorMessage ? 'border-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.4)]' : 'border-slate-700/50'">
              <div class="flex justify-between items-center px-3 py-2 bg-[#181825] border-b border-slate-700/50 z-10 relative">
                <div class="text-xs font-bold text-slate-300 flex items-center gap-2"><span>📝</span> 程式碼編輯器</div>
                <button @click="clearCode" class="text-[10px] text-rose-400 hover:text-white px-2 py-1 rounded bg-rose-950/30 border border-rose-900/50 hover:bg-rose-600 transition-colors">清空程式碼</button>
              </div>

              <transition name="fade">
                <div v-if="errorMessage" class="absolute bottom-6 right-6 z-50 bg-rose-900/95 border border-rose-500/50 text-rose-200 px-4 py-3 rounded-lg shadow-xl flex items-center justify-between backdrop-blur-sm max-w-[80%] shadow-[0_4px_20px_rgba(225,29,72,0.3)]">
                  <span class="text-sm font-medium flex-1 mr-4">⚠️ {{ errorMessage }}</span>
                  <button @click="errorMessage = ''" class="text-rose-400 hover:text-white text-xl leading-none font-bold">×</button>
                </div>
              </transition>
              
              <div class="flex-1 relative flex overflow-hidden">
                <div ref="lineNumbersRef" class="w-8 bg-[#181825] border-r border-slate-700/50 flex flex-col items-center py-4 text-[10px] text-slate-600 font-mono select-none overflow-hidden">
                  <span v-for="n in lineCount" :key="n" class="mb-1 leading-relaxed">{{ n }}</span>
                </div>
               <textarea ref="codeEditor" v-model="codeContent" @scroll="syncScroll" @keydown.tab.prevent="handleTab" @keydown="handleAutoClose" @keyup="checkAutocomplete" class="flex-1 w-full h-full p-4 bg-transparent text-indigo-300 font-mono text-sm resize-none focus:outline-none overflow-y-auto custom-scrollbar leading-relaxed" placeholder="// 輸入程式碼...&#10;// 例如: moveUp();" spellcheck="false"></textarea>
              </div>
          </div>
        </div>

        <button @click="executeCode" class="m-4 relative overflow-hidden py-3 rounded-xl font-black text-white transition-all duration-300 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 hover:-translate-y-0.5" :class="codeContent.trim().length > 0 && !errorMessage ? 'bg-gradient-to-r from-indigo-600 to-fuchsia-600 shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'bg-slate-800 border border-slate-700'" :disabled="codeContent.trim().length === 0 || isAiming || errorMessage !== ''">
          <span v-if="codeContent.trim().length > 0 && !errorMessage" class="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-[150%] animate-[sweep_2s_ease-in-out_infinite]"></span>
          <span class="relative z-10">▶</span> <span class="relative z-10 tracking-widest">編譯並啟動機甲</span>
        </button>
      </aside>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'; 
import { COMMAND_DICT } from '../../game/config/CommandList.js'; 
// 🌟 引入剛剛寫的獎勵模組
import { getRandomRewards } from '../../game/config/RewardList.js';

// 🌟 Props 增加 attack
const props = defineProps(['floor', 'hp', 'maxHp', 'mp', 'maxMp', 'ap', 'maxAp', 'attack', 'coins', 'level', 'xp', 'totalExp']);
const emit = defineEmits(['stop', 'abandon', 'init-game', 'execute', 'update-stats', 'floor-cleared']);

const showMenu = ref(false); 
const codeContent = ref('');
const codeEditor = ref(null);
const errorMessage = ref("");
const lineNumbersRef = ref(null);

const showClearModal = ref(false);
const currentObjective = ref('');
const isAiming = ref(false);
const pendingCommand = ref(null);

// 🌟 儲存當前抽到的獎勵
const currentRewards = ref([]);

const VALID_KEYWORDS = [
  'function', 'let', 'const', 'var', 'for', 'while', 'if', 'else', 'await', 'async', 'return', 'true', 'false', 'p',
  'moveUp', 'moveDown', 'moveLeft', 'moveRight', 'wait', 'dash', 'take', 'open',
  'attack', 'shoot', 'spread_shot', 'magic', 'bomb', 'laser', 'whirlwind', 'boomerang', 'pull', 'heal',
  'isWall', 'isEnemy', 'isGoal'
];

const handleAutoClose = async (e) => {
  const pairs = { '{': '}', '[': ']', '(': ')', '"': '"', "'": "'" };
  const openChar = e.key;
  const closeChar = pairs[openChar];

  if (closeChar) {
    e.preventDefault(); 
    const el = codeEditor.value;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = codeContent.value;
    codeContent.value = text.substring(0, start) + openChar + closeChar + text.substring(end);
    await nextTick();
    el.selectionStart = el.selectionEnd = start + 1;
  }
};

const confirmExit = (type) => {
  showMenu.value = false;
  if (type === 'save') { emit('stop'); } 
  else if (type === 'abandon') {
    if (confirm('警告：確定要終止連線嗎？目前的層數與局內金幣將會消失！')) { emit('abandon'); }
  }
};

// 🌟 處理過關事件：抽出 3 個獎勵
const handleFloorCleared = () => {
  console.log("✅ [TowerBattle.vue] 收到 'tower-floor-cleared' 訊號，準備抽取獎勵顯示過關視窗！");
  currentRewards.value = getRandomRewards(3);
  showClearModal.value = true;
};

// 🌟 點擊選擇獎勵
const selectReward = (reward) => {
  console.log(`🎁 玩家選擇了獎勵: ${reward.name}`);
  // 1. 將當前狀態包裝起來傳給 apply 計算
  const currentStats = {
    hp: props.hp, maxHp: props.maxHp,
    mp: props.mp, maxMp: props.maxMp,
    ap: props.ap, maxAp: props.maxAp,
    attack: props.attack || 10,
    coins: props.coins, xp: props.xp, level: props.level
  };
  
  // 2. 獲取變更後的數值
  const newStats = reward.apply(currentStats);
  
  // 3. 發送更新事件給 EndlessLevel
  emit('update-stats', newStats);
  
  // 4. 進入下一層
  proceedToNextFloor();
};

// 🌟 點擊前往下一層
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

const syncScroll = (e) => {
  if (lineNumbersRef.value) { lineNumbersRef.value.scrollTop = e.target.scrollTop; }
};

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
  } else {
    alert(`⚡ 系統警告：行動值 (AP) 不足！\n執行此程式需要 ${totalApCost} AP，但目前僅剩 ${props.ap} AP。`);
  }
};

const commandCategories = computed(() => {
  const moveIds = ['moveUp', 'moveDown', 'moveLeft', 'moveRight', 'wait', 'dash'];
  const interactIds = ['take', 'open', 'hack_wall'];
  const combatIds = ['attack', 'shoot', 'magic', 'bomb', 'heal', 'laser', 'spread_shot', 'pull', 'boomerang', 'whirlwind'];
  
  return [
    { name: '🏃‍♂️ 移動與動作', theme: 'indigo', open: true, commands: COMMAND_DICT.filter(c => moveIds.includes(c.id)) },
    { name: '👁️ 條件與感知', theme: 'emerald', open: false, commands: COMMAND_DICT.filter(c => c.type === 'sensor') },
    { name: '⚙️ 互動與機制', theme: 'amber', open: false, commands: COMMAND_DICT.filter(c => interactIds.includes(c.id)) },
    { name: '⚔️ 攻擊與戰鬥', theme: 'rose', open: false, commands: COMMAND_DICT.filter(c => combatIds.includes(c.id)) },
    { name: '🧠 邏輯控制', theme: 'pink', open: false, commands: COMMAND_DICT.filter(c => c.type === 'logic') }
  ].filter(cat => cat.commands && cat.commands.length > 0);
});

const handleTab = (e) => {
  const start = e.target.selectionStart;
  const end = e.target.selectionEnd;
  codeContent.value = codeContent.value.substring(0, start) + "  " + codeContent.value.substring(end);
  nextTick(() => { e.target.selectionStart = e.target.selectionEnd = start + 2; });
};

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
    if (!VALID_KEYWORDS.includes(word) && !declaredVariables.includes(word)) {
      errorMessage.value = `❌ 語法錯誤：系統不認識 '${word}' 這個指令。您是不是拼錯了？`;
      return; 
    }
  }
};

watch(codeContent, () => validateCode());

const showSuggestions = ref(false);
const suggestions = ref([]);
const currentWord = ref("");

const checkAutocomplete = (e) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Enter'].includes(e.key)) {
    showSuggestions.value = false;
    return;
  }
  const cursorPosition = e.target.selectionStart;
  const textBeforeCursor = codeContent.value.substring(0, cursorPosition);
  const match = textBeforeCursor.match(/[a-zA-Z_]+$/);
  
  if (match) {
    currentWord.value = match[0];
    if (currentWord.value.length >= 1 && !VALID_KEYWORDS.includes(currentWord.value)) {
        suggestions.value = VALID_KEYWORDS.filter(k => k.startsWith(currentWord.value));
        showSuggestions.value = suggestions.value.length > 0;
    } else { showSuggestions.value = false; }
  } else { showSuggestions.value = false; }
};

const applySuggestion = (suggestion) => {
  const cursorPosition = codeEditor.value.selectionStart;
  const textBeforeCursor = codeContent.value.substring(0, cursorPosition);
  const textAfterCursor = codeContent.value.substring(cursorPosition);
  const newTextBefore = textBeforeCursor.replace(/[a-zA-Z_]+$/, suggestion);
  const isKeyword = ['function', 'let', 'const', 'for', 'while', 'if', 'else', 'await'].includes(suggestion);
  const appendText = isKeyword ? ' ' : '()';

  codeContent.value = newTextBefore + appendText + textAfterCursor;
  showSuggestions.value = false;

  nextTick(() => {
    const newCursorPos = newTextBefore.length + (isKeyword ? 1 : 1);
    codeEditor.value.selectionStart = codeEditor.value.selectionEnd = newCursorPos;
    codeEditor.value.focus();
    validateCode(); 
  });
};

const getThemeClasses = (theme) => {
  const themes = {
    indigo: 'bg-indigo-950/40 border-indigo-800/50 text-indigo-300 hover:bg-indigo-600 hover:text-white hover:border-indigo-400 hover:shadow-[0_0_15px_rgba(79,70,229,0.4)]',
    emerald: 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300 hover:bg-emerald-600 hover:text-white hover:border-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]',
    amber: 'bg-amber-950/40 border-amber-800/50 text-amber-300 hover:bg-amber-600 hover:text-white hover:border-amber-400 hover:shadow-[0_0_15px_rgba(245,158,11,0.4)]',
    rose: 'bg-rose-950/40 border-rose-800/50 text-rose-300 hover:bg-rose-600 hover:text-white hover:border-rose-400 hover:shadow-[0_0_15px_rgba(225,29,72,0.4)]',
    pink: 'bg-pink-950/40 border-pink-800/50 text-pink-300 hover:bg-pink-600 hover:text-white hover:border-pink-400 hover:shadow-[0_0_15px_rgba(236,72,153,0.4)]'
  };
  return themes[theme] || themes.indigo;
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
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #475569; 
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #6366f1; 
}

@keyframes sweep {
  0% { transform: translateX(-150%) skewX(12deg); }
  100% { transform: translateX(250%) skewX(12deg); }
}
</style>