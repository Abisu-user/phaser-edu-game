<template>
  <div class="w-80 md:w-96 flex flex-col flex-shrink-0 h-full" style="background:linear-gradient(180deg, rgba(30,30,46,0.9), rgba(26,26,46,0.95));">
      
    <div class="px-4 py-3 border-b flex-shrink-0" style="border-color:#333355;">
      <p class="text-xs font-semibold uppercase tracking-wider" style="color:#a0a0b8;">📝 撰寫程式碼</p>
      <p class="text-xs mt-1" style="color:#f0f0f0;">{{ levelConfig.hint || '點擊拼圖輸入指令' }}</p>
    </div>

    <div v-if="levelConfig.restrictions?.maxBlocks" class="px-4 py-2 border-b flex-shrink-0 bg-black/40 border-[#ffbb33]/30">
      <p class="text-[12px] font-bold text-[#ffbb33]">⚡ 指令行數限制: {{ levelConfig.restrictions.maxBlocks }} 行</p>
    </div>

    <div class="px-4 py-3 border-b flex-shrink-0 relative" style="border-color:#333355; background: rgba(0,0,0,0.2);">
      <p class="text-xs mb-2" style="color:#8b949e;">可用的指令拼圖：</p>
      <div class="grid grid-cols-2 gap-2">
        <button v-for="block in filteredBlocks" :key="block.code" @click="insertCode(block.code)"
          class="px-3 py-2 rounded text-xs font-mono font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 justify-center relative"
          :class="{ 'animate-pulse border-2 border-white': isNewCommand(block.id) }"
          :style="{ backgroundColor: block.color, color: '#0f0e17', boxShadow: isNewCommand(block.id) ? '0 0 15px white' : `0 2px 8px ${block.color}40` }">
          
          <span v-if="isNewCommand(block.id)" class="absolute -top-2 -right-2 bg-white text-[9px] px-1 rounded text-black font-black z-10 shadow-sm animate-bounce">
            NEW
          </span>

          <span class="text-[12px]">{{ block.icon }}</span> {{ block.label }}
        </button>
      </div>
    </div>

    <div class="flex-1 flex flex-col mx-4 my-2 rounded-xl border border-[#333355] shadow-2xl overflow-hidden bg-[#1e1e2e]">
      <div class="flex items-center px-4 py-0 bg-[#11111b] border-b border-[#333355] relative h-9">
        <div class="flex gap-1.5 absolute left-4">
          <div class="w-3 h-3 rounded-full bg-[#ff5f56] shadow-sm"></div>
          <div class="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-sm"></div>
          <div class="w-3 h-3 rounded-full bg-[#27c93f] shadow-sm"></div>
        </div>
        <div class="mx-auto flex items-center gap-2 bg-[#1e1e2e] px-4 py-1.5 rounded-t-lg border-t border-x border-[#333355] mt-auto">
          <span class="text-[10px] font-bold text-[#ffbb33]">JS</span>
          <span class="text-xs font-mono text-[#a0a0b8]">hero_logic.js</span>
        </div>
      </div>

      <div class="flex-1 relative flex overflow-hidden">
        <div ref="lineNumbersRef" class="w-10 bg-[#181825] border-r border-[#333355] py-3 flex flex-col items-center select-none overflow-hidden text-xs font-mono text-[#5c5c77] flex-shrink-0">
          <div v-for="n in lineCount" :key="n" class="leading-[21px] h-[21px]">{{ n }}</div>
        </div>

        <div v-if="currentLine >= 0" class="absolute left-10 right-0 h-[21px] pointer-events-none transition-all duration-200 z-10" 
          :style="{ top: `${12 + currentLine * 21}px`, background: 'rgba(0, 212, 170, 0.15)', borderLeft: '3px solid #00d4aa' }"></div>

        <textarea 
          ref="codeTextarea" 
          v-model="userCode" 
          spellcheck="false"
          wrap="off"
          :disabled="isExecuting"
          @scroll="syncScroll"
          @keydown="handleKeydown"
          @input="updateSuggestions" @click="updateSuggestions"
          class="flex-1 w-full h-full bg-transparent resize-none outline-none font-mono text-sm leading-[21px] pl-4 pr-4 py-3 relative z-20 scrollbar-thin whitespace-pre"
          style="color: #f8f8f2; caret-color: #ffbb33;"
          :style="{ opacity: isExecuting ? 0.5 : 1, cursor: isExecuting ? 'not-allowed' : 'text' }"
          placeholder="// 點擊上方拼圖，或在這裡輸入指令...">
        </textarea>

        <ul v-if="showSuggestions"
          class="absolute z-50 bg-[#1e1e2e] border border-[#333355] rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.5)] py-1 overflow-hidden transition-all duration-75"
          :style="{ top: suggestPos.top + 'px', left: suggestPos.left + 'px' }">
          <li v-for="(snippet, index) in filteredSnippets" :key="index"
            class="px-4 py-1.5 text-sm font-mono cursor-pointer hover:bg-[#333355] text-[#a0a0b8]"
            :class="{ 'bg-[#333355] text-[#00d4aa] font-bold': index === selectedIndex }"
            @mousedown.prevent="applySuggestion(index)"> {{ snippet }}
          </li>
        </ul>
      </div>
    </div>

    <div class="px-4 py-4 border-t flex flex-col gap-2 flex-shrink-0" style="border-color:#333355;">
      <button @click="handleExecute" :disabled="isExecuting" class="w-full py-3 rounded-lg font-bold text-sm transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" style="background:linear-gradient(135deg,#ffbb33,#ff8800);color:#0f0e17; box-shadow: 0 0 15px rgba(255,187,51,0.3);"> 
        {{ isExecuting ? '⏳ 執行中...' : '⚡ 執行程式碼' }} 
      </button> 
      <button @click="handleClear" :disabled="isExecuting" class="w-full py-2 rounded-lg font-semibold text-sm border transition-colors hover:bg-white/10 disabled:opacity-50" style="border-color:#ff6b6b;color:#ff6b6b;"> 🗑️ 清空程式碼 </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';
import { OUTGAME_COMMANDS } from '../../game/config/CommandList.js'; 

const props = defineProps({
  levelConfig: { type: Object, required: true },
  isExecuting: { type: Boolean, default: false },
  currentLine: { type: Number, default: -1 }
});

const emit = defineEmits(['execute', 'clear']);

const userCode = ref('');
const codeTextarea = ref(null);
const lineNumbersRef = ref(null);
const showSuggestions = ref(false);
const filteredSnippets = ref([]);
const selectedIndex = ref(0);
const suggestPos = ref({ top: 0, left: 0 });
const typingWordLength = ref(0);

// 🌟 判斷是否為這關剛解鎖的新指令 (用來套用發光特效)
const isNewCommand = (cmdId) => {
  return props.levelConfig.tutorial?.newCommand === cmdId;
};

// ===============================================
// 1. 動態從 OUTGAME_COMMANDS 產生按鈕與提示
// ===============================================

const BUILTIN_LOGIC = [
  { id: 'if', label: '❓如果 (if)', type: 'logic' },
  { id: 'else', label: '⚖️ 否則 (else)', type: 'logic' },
  { id: 'while', label: '🔄 當 (while)', type: 'logic' },
  { id: 'function', label: '🔧 函式 (function)', type: 'logic' }
];

const baseCommands = OUTGAME_COMMANDS.filter(cmd => cmd.type !== 'logic' || cmd.id === 'for');
const combinedCommands = [...baseCommands, ...BUILTIN_LOGIC];

const ALL_BLOCKS = combinedCommands.map(cmd => {
  const match = cmd.label.match(/([\uD800-\uDBFF][\uDC00-\uDFFF]|\p{Emoji_Presentation})/u);
  const icon = match ? match[0] : '🧩';
  const labelText = cmd.label.replace(icon, '').trim();

  let color = '#00d4aa'; 
  if (['attack', 'shoot', 'magic', 'bomb'].includes(cmd.id)) color = '#ffbb33'; 
  if (cmd.type === 'sensor') color = '#38bdf8'; 
  if (cmd.type === 'logic') color = '#ff6b6b'; 

  let codeSnippet = `${cmd.id}();`;
  if (cmd.id === 'for') codeSnippet = `for(3, () => {\n  // 寫入重複動作\n});`;
  else if (cmd.id === 'if') codeSnippet = `if (isWall()) {\n  \n}`;
  else if (cmd.id === 'else') codeSnippet = `else {\n  \n}`;
  else if (cmd.id === 'while') codeSnippet = `while (!isGoal()) {\n  \n}`;
  else if (cmd.id === 'function') codeSnippet = `function mySkill() {\n  \n}`;

  return { id: cmd.id, label: labelText, code: codeSnippet, color, icon };
});

const availableSnippets = [
  ...OUTGAME_COMMANDS.filter(cmd => cmd.type === 'action').map(cmd => `${cmd.id}();`),
  'for(3, () => {\n  \n});',
  'if (isWall()) {\n  \n}', 
  'while (!isGoal()) {\n  \n}',
  'if (isEnemy()) {\n  \n}'
];

const lineCount = computed(() => Math.max(15, userCode.value.split('\n').length));
const filteredBlocks = computed(() => props.levelConfig.availableCommands 
  ? ALL_BLOCKS.filter(b => props.levelConfig.availableCommands.includes(b.id)) 
  : ALL_BLOCKS);

const syncScroll = (e) => {
  if (lineNumbersRef.value) lineNumbersRef.value.scrollTop = e.target.scrollTop;
};

const insertCode = (code) => {
  const textarea = codeTextarea.value;
  if (textarea) {
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const beforeText = userCode.value.substring(0, startPos);
    const afterText = userCode.value.substring(endPos);
    const textToInsert = code + '\n';
    
    userCode.value = beforeText + textToInsert + afterText;
    nextTick(() => {
      const newCursorPos = startPos + textToInsert.length;
      if (code.includes('for') || code.includes('if') || code.includes('while')) {
        textarea.focus();
        textarea.setSelectionRange(startPos + textToInsert.indexOf('{') + 4, startPos + textToInsert.indexOf('{') + 4);
      } else {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    });
  } else {
    userCode.value += code + '\n';
  }
};

const updateSuggestions = () => {
  const textarea = codeTextarea.value;
  if (!textarea) return;
  const textBeforeCursor = userCode.value.substring(0, textarea.selectionStart);
  const match = textBeforeCursor.match(/[a-zA-Z]+$/);
  
  if (match) {
    const typingWord = match[0];
    typingWordLength.value = typingWord.length;
    const matches = availableSnippets.filter(cmd => cmd.toLowerCase().startsWith(typingWord.toLowerCase()));

    if (matches.length > 0 && matches[0] !== typingWord) {
      filteredSnippets.value = matches;
      showSuggestions.value = true;
      selectedIndex.value = 0;
      const lines = textBeforeCursor.split('\n');
      suggestPos.value = {
        top: ((lines.length - 1) * 21) + 12 + 21 - textarea.scrollTop,
        left: 40 + 16 + (lines[lines.length - 1].length * 8.4)
      };
      return;
    }
  }
  showSuggestions.value = false;
};

const applySuggestion = (index) => {
  const textarea = codeTextarea.value;
  if (!textarea) return;
  const suggestion = filteredSnippets.value[index];
  const startPos = textarea.selectionStart;
  const textBeforeCursor = userCode.value.substring(0, startPos);
  const textAfterCursor = userCode.value.substring(textarea.selectionEnd);

  const textWithoutTyping = textBeforeCursor.substring(0, textBeforeCursor.length - typingWordLength.value);
  userCode.value = textWithoutTyping + suggestion + textAfterCursor;
  showSuggestions.value = false;

  nextTick(() => {
    let newPos = textWithoutTyping.length + suggestion.length;
    if (suggestion.includes('for') || suggestion.includes('if') || suggestion.includes('while')) newPos -= 4;
    textarea.selectionStart = textarea.selectionEnd = newPos;
    textarea.focus();
    updateSuggestions();
  });
};

const handleKeydown = (e) => {
  const textarea = codeTextarea.value;
  if (!textarea) return;

  if (showSuggestions.value) {
    if (e.key === 'ArrowDown') { e.preventDefault(); selectedIndex.value = (selectedIndex.value + 1) % filteredSnippets.value.length; return; }
    if (e.key === 'ArrowUp') { e.preventDefault(); selectedIndex.value = (selectedIndex.value - 1 + filteredSnippets.value.length) % filteredSnippets.value.length; return; }
    if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); applySuggestion(selectedIndex.value); return; }
    if (e.key === 'Escape') { showSuggestions.value = false; return; }
  }

  if (e.key === 'Tab') {
    e.preventDefault();
    const startPos = textarea.selectionStart;
    userCode.value = userCode.value.substring(0, startPos) + '  ' + userCode.value.substring(textarea.selectionEnd);
    nextTick(() => {
      textarea.selectionStart = textarea.selectionEnd = startPos + 2;
      updateSuggestions(); 
    });
  }
};

const handleExecute = () => {
  let codeToRun = userCode.value;
  const originalCode = userCode.value; 
  
  codeToRun = codeToRun.replace(/for\s*\(\s*(\d+)\s*,\s*\(\s*\)\s*=>\s*\{([\s\S]*?)\}\s*\);?/g, "for(let i=0; i<$1; i++) { $2 }");
  codeToRun = codeToRun.replace(/\(\s*\)\s*=>/g, "async () =>");
  codeToRun = codeToRun.replace(/\bshoot\s*\(([^)]+)\);?/g, "await window.shoot($1);");

  const customFuncs = [];
  const funcRegex = /function\s+([a-zA-Z0-9_]+)\s*\(/g;
  let match;
  while ((match = funcRegex.exec(codeToRun)) !== null) {
    customFuncs.push(match[1]);
  }
  
  customFuncs.forEach(funcName => {
    const callRegex = new RegExp(`(\\bfunction\\s+)?\\b(${funcName})\\s*\\(`, 'g');
    codeToRun = codeToRun.replace(callRegex, (m, isDef, name) => {
      if (isDef) return m; 
      return `await ${name}(`;
    });
  });
  
  codeToRun = codeToRun.replace(/function\s+([a-zA-Z0-9_]+)\s*\(/g, "async function $1(");

  OUTGAME_COMMANDS.forEach(cmd => {
    if (cmd.type === 'action') {
      const regex = new RegExp(`(?<!\\.)\\b${cmd.id}\\s*\\(\\);?`, 'g');
      codeToRun = codeToRun.replace(regex, `await scene.addCommand('${cmd.id}');`);
    } else if (cmd.type === 'sensor') {
      const regex = new RegExp(`(?<!\\.)\\b${cmd.id}\\s*\\(\\)`, 'g');
      codeToRun = codeToRun.replace(regex, `(await scene.checkSensor('${cmd.id}'))`);
    }
  });

  let blockCount = 0;
  const cleanCode = originalCode.replace(/\/\/.*$/gm, ''); 
  
  const singleBlocks = [
    'moveRight', 'moveLeft', 'moveUp', 'moveDown', 'dash',
    'attack', 'heal', 'magic', 'shoot', 'bomb', 'take', 'open', 'wait',
    'if', 'else', 'while', 'function', 'isWall', 'isEnemy'
  ];
  
  singleBlocks.forEach(kw => {
    const regex = new RegExp(`\\b${kw}\\b`, 'g');
    const matches = cleanCode.match(regex);
    if (matches) blockCount += matches.length;
  });

  const forMatches = cleanCode.match(/\bfor\b/g);
  if (forMatches) {
    blockCount += (forMatches.length * 2);
  }

  emit('execute', codeToRun, blockCount, originalCode);
};

const handleClear = () => {
  userCode.value = '';
  emit('clear');
};
</script>

<style scoped>
.scrollbar-thin::-webkit-scrollbar { width: 6px; }
.scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
.scrollbar-thin::-webkit-scrollbar-thumb { background-color: #333355; border-radius: 3px; }

/* 讓發光按鈕有呼吸效果 */
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.9; transform: scale(1.02); }
}
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>