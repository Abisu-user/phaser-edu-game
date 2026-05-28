<template>
    <div id="game-screen" class="h-full w-full flex flex-col overflow-hidden" style="background: linear-gradient(135deg, #0a0e27 0%, #1a1a3e 50%, #0f1428 100%);">
        
        <div class="flex items-center justify-between px-6 py-3 border-b flex-shrink-0" style="border-color:#1e1e2e; background:#0a0e27; z-index:50;">
            <div class="flex items-center gap-3">
                <button @click="$emit('back')" class="p-2 rounded-lg hover:bg-white/10 transition" style="color:#f0f0f0;"> 
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                </button>
                <div>
                <p class="text-xs font-semibold" style="color:#a0a0b8;">{{ levelConfig.description }}</p>
                <p class="text-sm font-bold" style="color:#f0f0f0;">{{ levelConfig.title }}</p>
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex items-center gap-2 px-3 py-2 rounded-lg" style="background:#1e1e2e;"><span style="color:#ffbb33;">⭐</span> <span class="text-sm font-bold" style="color:#ffbb33;">{{ xp }} XP</span></div>
                <div class="flex items-center gap-2 px-3 py-2 rounded-lg" style="background:#1e1e2e;"><span style="color:#ff6b6b;">❤️</span> <span class="text-sm font-bold" style="color:#ff6b6b;">{{ hp }} / 3</span></div>
            </div>
        </div>

        <div class="flex-1 flex overflow-hidden">
        
            <div class="flex-1 min-w-0 min-h-0 flex flex-col bg-[#1e1e3f] border-r" style="border-color:#333355;">
                
                <div class="flex-1 relative w-full p-4 flex items-center justify-center min-h-0">
                <div id="game-container" class="w-full h-full flex items-center justify-center"></div>
                </div>

                <div class="h-28 w-full px-8 py-4 flex gap-8 justify-center bg-[#11111b] border-t flex-shrink-0" style="border-color:#333355;">
                <div class="text-center flex-1 max-w-xs">
                    <p class="text-xs mb-1" style="color:#a0a0b8;">怪物血量</p>
                    <div class="w-full h-3 rounded-full overflow-hidden" style="background:#1e1e2e;">
                    <div class="h-full w-1/3 rounded-full" style="background:linear-gradient(90deg,#ff6b6b,#ff3333);box-shadow:0 0 10px rgba(255,107,107,0.5);"></div>
                    </div>
                    <p class="text-xs mt-1" style="color:#ff6b6b;">25 / 80 HP</p>
                </div>
                <div class="text-center flex-1 max-w-xs">
                    <p class="text-xs mb-1" style="color:#a0a0b8;">你的法力</p>
                    <div class="w-full h-3 rounded-full overflow-hidden" style="background:#1e1e2e;">
                    <div class="h-full w-4/5 rounded-full" style="background:linear-gradient(90deg,#a78bfa,#8b5cf6);box-shadow:0 0 10px rgba(167,139,250,0.5);"></div>
                    </div>
                    <p class="text-xs mt-1" style="color:#a78bfa;">80 / 100 MP</p>
                </div>
                </div>

            </div>

            <div class="w-80 md:w-96 flex flex-col flex-shrink-0" style="background:linear-gradient(180deg, rgba(30,30,46,0.9), rgba(26,26,46,0.95));">
                
                <div class="px-4 py-3 border-b flex-shrink-0" style="border-color:#333355;">
                <p class="text-xs font-semibold uppercase tracking-wider" style="color:#a0a0b8;">📝 撰寫程式碼</p>
                <p class="text-xs mt-1" style="color:#f0f0f0;">{{ levelConfig.hint || '點擊拼圖輸入指令' }}</p>
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
                            @input="updateSuggestions"  @click="updateSuggestions"  class="flex-1 w-full h-full bg-transparent resize-none outline-none font-mono text-sm leading-[21px] pl-4 pr-4 py-3 relative z-20 scrollbar-thin whitespace-pre"
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
                    <button @click="resetAndPlay" :disabled="isExecuting" class="w-full py-3 rounded-lg font-bold text-sm transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" style="background:linear-gradient(135deg,#ffbb33,#ff8800);color:#0f0e17; box-shadow: 0 0 15px rgba(255,187,51,0.3);"> 
                        {{ isExecuting ? '⏳ 執行中...' : '⚡ 執行程式碼' }} 
                    </button> 
                    <button @click="userCode = ''; currentLine = -1;" :disabled="isExecuting" class="w-full py-2 rounded-lg font-semibold text-sm border transition-colors hover:bg-white/10 disabled:opacity-50" style="border-color:#ff6b6b;color:#ff6b6b;"> 🗑️ 清空程式碼 </button>
                </div>
            </div>
        </div>
    </div>

    <div v-if="isLevelCleared" class="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div class="bg-[#1e1e2e] border-2 border-[#00d4aa] p-8 rounded-2xl text-center max-w-md w-full shadow-[0_0_30px_rgba(0,212,170,0.3)] slide-up">
            <div class="text-6xl mb-4">🏆</div>
            <h2 class="text-3xl font-bold text-[#f0f0f0] mb-2 font-['Fredoka']">關卡完成！</h2>
            <p class="text-[#a0a0b8] mb-8">{{ levelConfig.successMessage || '你寫出了完美的程式碼！' }}</p>
            
            <div class="flex flex-col gap-3">
            <button @click="handleNextLevel" class="w-full py-3 rounded-xl text-lg font-bold bg-gradient-to-r from-[#ffbb33] to-[#ff8800] text-[#0f0e17] hover:scale-105 transition-transform">
                進入下一關 🚀
            </button>
            <div class="flex gap-3">
                <button @click="retryLevel" class="flex-1 py-2 rounded-xl font-semibold border border-[#333355] text-[#a0a0b8] hover:bg-white/5 transition-colors">
                重新挑戰
                </button>
                <button @click="$emit('back')" class="flex-1 py-2 rounded-xl font-semibold border border-[#333355] text-[#a0a0b8] hover:bg-white/5 transition-colors">
                回首頁選關
                </button>
            </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, computed, nextTick } from 'vue';
import Phaser from 'phaser';
import TeachingScene from '../game/scenes/TeachingScene.js';

const props = defineProps({
  levelConfig: { type: Object, required: true }
});
const emit = defineEmits(['back', 'next-level']);
const isLevelCleared = ref(false);

let game = null;
const userCode = ref('');
const isExecuting = ref(false);
const currentLine = ref(-1);
const codeTextarea = ref(null);
const lineNumbersRef = ref(null);
const showSuggestions = ref(false);
const filteredSnippets = ref([]);
const selectedIndex = ref(0);
const suggestPos = ref({ top: 0, left: 0 });
const typingWordLength = ref(0);
const xp = ref(0);
const hp = ref(3);

const ALL_BLOCKS = [
  { id: 'move', label: '向右走', code: 'moveRight();', color: '#00d4aa', icon: '👉' },
  { id: 'move', label: '向左走', code: 'moveLeft();', color: '#00d4aa', icon: '👈' },
  { id: 'move', label: '向上走', code: 'moveUp();', color: '#a78bfa', icon: '👆' }, 
  { id: 'move', label: '向下走', code: 'moveDown();', color: '#a78bfa', icon: '👇' },
  { id: 'attack', label: '近戰攻擊', code: 'attack();', color: '#ffbb33', icon: '⚔️' },
  { id: 'repeat', label: '重複3次', code: 'repeat(3, () => {\n  // 寫入重複動作\n});', color: '#ff6b6b', icon: '🔁' }
];

const availableSnippets = [
  'moveUp();', 
  'moveDown();', 
  'moveLeft();', 
  'moveRight();', 
  'attack();', 
  'repeat(3, () => {\n  \n});'
];

const updateSuggestions = () => {
  const textarea = codeTextarea.value;
  if (!textarea) return;

  const startPos = textarea.selectionStart;
  const textBeforeCursor = userCode.value.substring(0, startPos);

  // 抓取游標前正在輸入的英文字母
  const match = textBeforeCursor.match(/[a-zA-Z]+$/);
  
  if (match) {
    const typingWord = match[0];
    typingWordLength.value = typingWord.length;
    
    // 過濾出開頭符合的指令 (忽略大小寫)
    const matches = availableSnippets.filter(cmd => 
      cmd.toLowerCase().startsWith(typingWord.toLowerCase())
    );

    // 如果有找到符合的指令，而且玩家還沒打完完整的字
    if (matches.length > 0 && matches[0] !== typingWord) {
      filteredSnippets.value = matches;
      showSuggestions.value = true;
      selectedIndex.value = 0; // 重置選擇焦點

      // 💡 魔法計算：根據等寬字體與行高，估算選單要浮動在哪裡
      const lines = textBeforeCursor.split('\n');
      const currentLineIndex = lines.length - 1;
      const currentLineText = lines[currentLineIndex];
      
      suggestPos.value = {
        // top: 行高(21) * 行數 + 上下padding(12) + 一行的高度(21) - 滾動距離
        top: (currentLineIndex * 21) + 12 + 21 - textarea.scrollTop,
        // left: 行號區寬度(40) + 左padding(16) + 字元數 * 每個字大約寬度(8.4px)
        left: 40 + 16 + (currentLineText.length * 8.4)
      };
      return;
    }
  }
  // 如果沒有匹配，或游標移走，就關閉選單
  showSuggestions.value = false;
};

// 🌟 套用選單中的指令 🌟
const applySuggestion = (index) => {
  const textarea = codeTextarea.value;
  if (!textarea) return;

  const suggestion = filteredSnippets.value[index];
  const startPos = textarea.selectionStart;
  const textBeforeCursor = userCode.value.substring(0, startPos);
  const textAfterCursor = userCode.value.substring(textarea.selectionEnd);

  // 拔掉玩家打到一半的字，換成完整的指令
  const textWithoutTyping = textBeforeCursor.substring(0, textBeforeCursor.length - typingWordLength.value);
  userCode.value = textWithoutTyping + suggestion + textAfterCursor;
  
  showSuggestions.value = false; // 關閉選單

  // 把游標移到新指令的最後面
  nextTick(() => {
    let newPos = textWithoutTyping.length + suggestion.length;
    if (suggestion.includes('repeat')) {
      newPos -= 5; // 如果是迴圈，把游標放在大括號中間
    }
    textarea.selectionStart = newPos;
    textarea.selectionEnd = newPos;
    textarea.focus();
    updateSuggestions(); // 重新檢查狀態
  });
};

// 處理鍵盤按鍵 (特別是 Tab 鍵)
const handleKeydown = (e) => {
  const textarea = codeTextarea.value;
  if (!textarea) return;

  // 🎯 如果選單開著，接管鍵盤方向鍵與確認鍵
  if (showSuggestions.value) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex.value = (selectedIndex.value + 1) % filteredSnippets.value.length;
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex.value = (selectedIndex.value - 1 + filteredSnippets.value.length) % filteredSnippets.value.length;
      return;
    }
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      applySuggestion(selectedIndex.value);
      return;
    }
    if (e.key === 'Escape') {
      showSuggestions.value = false;
      return;
    }
  }

  // 🎯 如果選單沒開，Tab 鍵就乖乖做「縮排」
  if (e.key === 'Tab') {
    e.preventDefault();
    const startPos = textarea.selectionStart;
    const textBeforeCursor = userCode.value.substring(0, startPos);
    const textAfterCursor = userCode.value.substring(textarea.selectionEnd);
    
    userCode.value = textBeforeCursor + '  ' + textAfterCursor;
    nextTick(() => {
      textarea.selectionStart = startPos + 2;
      textarea.selectionEnd = startPos + 2;
      updateSuggestions(); 
    });
  }
};

// 按下下一關
const handleNextLevel = () => {
  isLevelCleared.value = false;
  emit('next-level');
};

// 監聽來自 Phaser 的通關事件
const onLevelWin = () => {
  isLevelCleared.value = true;
};

// 按下重新挑戰
const retryLevel = () => {
  isLevelCleared.value = false;
  
  // 透過事件通知 Phaser 執行 resetLevel()
  if (gameInstance) {
    const scene = gameInstance.scene.getScene('TeachingScene');
    if (scene) {
      scene.resetLevel();
    }
  }
};

const lineCount = computed(() => {
  const lines = userCode.value.split('\n').length;
  return Math.max(15, lines);
});

const syncScroll = (e) => {
  if (lineNumbersRef.value) {
    lineNumbersRef.value.scrollTop = e.target.scrollTop;
  }
};

const filteredBlocks = computed(() => {
  if (!props.levelConfig.availableCommands) return ALL_BLOCKS;
  return ALL_BLOCKS.filter(b => props.levelConfig.availableCommands.includes(b.id));
});

const insertCode = (code) => {
  const textarea = codeTextarea.value;
  
  // 如果有抓到 textarea 元素，就依照游標位置插入
  if (textarea) {
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    
    // 把目前的程式碼切成「游標前」跟「游標後」兩半
    const beforeText = userCode.value.substring(0, startPos);
    const afterText = userCode.value.substring(endPos);
    
    // 組合新的程式碼
    const textToInsert = code + '\n';
    userCode.value = beforeText + textToInsert + afterText;
    
    // 等待 Vue 更新畫面後，把游標移回剛插入文字的後方，並保持焦點
    nextTick(() => {
      const newCursorPos = startPos + textToInsert.length;
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    });
  } else {
    // 預防萬一的防呆機制：如果沒抓到元素，就用舊的方法加在最後面
    userCode.value += code + '\n';
  }
};

onMounted(() => {
    window.addEventListener('level-win', onLevelWin);
    const config = {
        type: Phaser.AUTO,
        parent: 'game-container',
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 800, height: 800 
        },
        physics: { default: 'arcade', arcade: { gravity: { y: 0 } } },
        scene: [TeachingScene],
        backgroundColor: '#1e1e3f' 
    };
    
    game = new Phaser.Game(config);

    game.events.once('ready', () => {
        game.scene.start('TeachingScene', props.levelConfig);
    });
    
    setTimeout(() => { window.dispatchEvent(new Event('resize')); }, 100);
});

onUnmounted(() => {
    if (game) { game.destroy(true); game = null; }
    window.removeEventListener('level-win', onLevelWin);
});

const resetAndPlay = () => {
  const scene = game.scene.getScene('TeachingScene');
  scene.resetLevel();
  currentLine.value = -1;
  
  let callCount = {};
  let linesByFn = {};

  userCode.value.split('\n').forEach((l, i) => {
    let m = l.match(/^\s*(moveRight|moveLeft|moveUp|moveDown|attack)\s*\(/);
    if (m) { (linesByFn[m[1]] = linesByFn[m[1]] || []).push(i); }
  });

  const makeCmd = (type, fn) => () => {
    callCount[fn] = callCount[fn] || 0;
    scene.addCommand(type, linesByFn[fn]?.[callCount[fn]++] ?? -1);
  };

  try {
    new Function('moveRight','moveLeft','moveUp','moveDown','attack','repeat', userCode.value)(
      makeCmd('move_right','moveRight'),
      makeCmd('move_left', 'moveLeft'),
      makeCmd('move_up',   'moveUp'),
      makeCmd('move_down', 'moveDown'),
      makeCmd('attack',    'attack'),
      (n, fn) => { for (let i = 0; i < n; i++) fn(); }
    );

    isExecuting.value = true;
    scene.runCommands(
      (lineIdx) => { currentLine.value = lineIdx; },
      (isSuccess) => {
        isExecuting.value = false;
        currentLine.value = -1;
        if (isSuccess) xp.value = Math.min(xp.value + (props.levelConfig.xpReward || 100), 999);
        else hp.value = Math.max(0, hp.value - 1);
      }
    );
  } catch (error) {
    console.error('程式碼語法錯誤：', error);
    isExecuting.value = false;
    alert('執行失敗！請檢查是否漏打括號或分號。');
  }
};
</script>

<style scoped>
.scrollbar-thin::-webkit-scrollbar { width: 6px; }
.scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
.scrollbar-thin::-webkit-scrollbar-thumb { background-color: #333355; border-radius: 3px; }
</style>