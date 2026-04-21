<template>
  <div class="w-80 md:w-96 flex flex-col flex-shrink-0 h-full" style="background:linear-gradient(180deg, rgba(30,30,46,0.9), rgba(26,26,46,0.95));">
      
    <div class="px-4 py-3 border-b flex-shrink-0" style="border-color:#333355;">
      <p class="text-xs font-semibold uppercase tracking-wider" style="color:#a0a0b8;">📝 撰寫程式碼</p>
      <p class="text-xs mt-1" style="color:#f0f0f0;">{{ levelConfig.hint || '點擊拼圖輸入指令' }}</p>
    </div>

    <div v-if="levelConfig.restrictions?.maxBlocks" class="px-4 py-2 border-b flex-shrink-0 bg-black/40 border-[#ffbb33]/30">
      <p class="text-[12px] font-bold text-[#ffbb33]">⚡ 指令行數限制: {{ levelConfig.restrictions.maxBlocks }} 行</p>
    </div>

    <div class="px-4 py-3 border-b flex-shrink-0" style="border-color:#333355; background: rgba(0,0,0,0.2);">
      <p class="text-xs mb-2" style="color:#8b949e;">可用的指令拼圖：</p>
      <div class="grid grid-cols-2 gap-2">
        <button v-for="block in filteredBlocks" :key="block.code" @click="insertCode(block.code)"
          class="px-3 py-2 rounded text-xs font-mono font-bold transition-transform hover:scale-105 active:scale-95 flex items-center gap-1.5 justify-center"
          :style="{ backgroundColor: block.color, color: '#0f0e17', boxShadow: `0 2px 8px ${block.color}40` }">
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

    <div class="px-4 py-3 border-t flex-shrink-0" style="border-color:#333355;">
      <p class="text-xs font-semibold mb-2" style="color:#00d4aa;">🎯 目標：</p>
      <div class="space-y-2">
        <div v-for="(goal, index) in levelConfig.goals" :key="index" class="flex items-start gap-2">
          <div class="w-4 h-4 rounded flex-shrink-0 mt-0.5 flex items-center justify-center text-xs" style="background:#00d4aa;color:#0f0e17;">✓</div>
          <p class="text-xs" style="color:#a0a0b8;">{{ goal }}</p>
        </div>
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
import { COMMAND_DICT } from '../../game/config/CommandList.js'; 

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

// ===============================================
// 1. 動態從 COMMAND_DICT 產生按鈕與提示
// ===============================================

// 動態產生的按鈕清單
const ALL_BLOCKS = COMMAND_DICT.filter(cmd => cmd.type !== 'logic' || cmd.id === 'repeat').map(cmd => {
  // 自動解析 Emoji 和文字
  const match = cmd.label.match(/([\uD800-\uDBFF][\uDC00-\uDFFF]|\p{Emoji_Presentation})/u);
  const icon = match ? match[0] : '🧩';
  const labelText = cmd.label.replace(icon, '').trim();

  // 根據類型分配顏色
  let color = '#00d4aa'; // 預設綠色 (移動類)
  if (['attack', 'shoot', 'magic', 'bomb'].includes(cmd.id)) color = '#ffbb33'; // 攻擊類橘色
  if (cmd.type === 'sensor') color = '#38bdf8'; // 感知類藍色
  if (cmd.type === 'logic') color = '#ff6b6b'; // 邏輯類紅色

  // 定義插入的程式碼模板
  let codeSnippet = `${cmd.id}();`;
  if (cmd.id === 'repeat') codeSnippet = `repeat(3, () => {\n  // 寫入重複動作\n});`;

  return { id: cmd.id, label: labelText, code: codeSnippet, color, icon };
});

// 自動補全提示字串 (Snippets)
const availableSnippets = [
  ...COMMAND_DICT.filter(cmd => cmd.type === 'action').map(cmd => `${cmd.id}();`),
  'repeat(3, () => {\n  \n});',
  'if (isWall()) {\n  \n}', 
  'while (!isGoal()) {\n  \n}',
  'if (isEnemy()) {\n  \n}'
];

const lineCount = computed(() => Math.max(15, userCode.value.split('\n').length));
const filteredBlocks = computed(() => props.levelConfig.availableCommands 
  ? ALL_BLOCKS.filter(b => props.levelConfig.availableCommands.includes(b.id)) 
  : ALL_BLOCKS);

// --- 捲動與游標處理 ---
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
      if (code.includes('repeat') || code.includes('if') || code.includes('while')) {
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
    if (suggestion.includes('repeat') || suggestion.includes('if') || suggestion.includes('while')) newPos -= 4;
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

// ===============================================
// 🌟 2. 核心魔法：全自動微型編譯器
// ===============================================
const handleExecute = () => {
  let codeToRun = userCode.value;
  
  // 1. 轉換 repeat 迴圈 (將 repeat(3, () => {...}) 轉為標準 for 迴圈)
  codeToRun = codeToRun.replace(/repeat\s*\(\s*(\d+)\s*,\s*\(\s*\)\s*=>\s*\{([\s\S]*?)\}\s*\);?/g, "for(let i=0; i<$1; i++) { $2 }");
  
  // 2. 自動遍歷 COMMAND_DICT，替換所有動作與感應器 (不需再手動一條一條加)
  COMMAND_DICT.forEach(cmd => {
    if (cmd.type === 'action') {
      // 將 moveRight(); 替換成 await scene.addCommand('moveRight');
      const regex = new RegExp(`\\b${cmd.id}\\(\\);?`, 'g');
      codeToRun = codeToRun.replace(regex, `await scene.addCommand('${cmd.id}');`);
    } else if (cmd.type === 'sensor') {
      // 將 isWall() 替換成 (await scene.checkSensor('isWall'))
      const regex = new RegExp(`\\b${cmd.id}\\(\\)`, 'g');
      codeToRun = codeToRun.replace(regex, `(await scene.checkSensor('${cmd.id}'))`);
    }
  });

  // 3. 計算有效行數 (當作是「積木數量」來檢查關卡限制)
  let blockCount = 0;
  const lines = userCode.value.split('\n');
  for (let line of lines) {
    // 忽略空白行與註解
    if (line.trim() !== '' && !line.trim().startsWith('//')) {
      blockCount++;
    }
  }

  // 將編譯過後的程式碼與行數，發送給 GameLevel.vue 執行
  emit('execute', codeToRun, blockCount);
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
</style>