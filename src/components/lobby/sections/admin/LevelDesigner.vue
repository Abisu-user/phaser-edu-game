<template>
  <div class="h-[90vh] flex flex-col bg-[#0f0d1a] text-gray-100 font-sans overflow-hidden rounded-xl border border-indigo-900/40 shadow-2xl">
    
    <header class="flex-shrink-0 px-6 py-4 flex items-center justify-between border-b border-indigo-900/40 bg-[#13111f]">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xl shadow-lg shadow-indigo-500/30">
          🗺️
        </div>
        <div>
          <h1 class="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">
            視覺化關卡設計師
          </h1>
          <p class="text-xs text-gray-500">對應資料庫完整欄位 · 動態網格縮放</p>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <button @click="openLoadModal" class="flex items-center gap-1.5 text-sm font-medium text-indigo-300 bg-indigo-900/40 border border-indigo-700/50 rounded-lg px-4 py-2 hover:bg-indigo-800/60 transition-all">
          📂 讀取 / 管理關卡
        </button>

        <button @click="clearGrid" class="flex items-center gap-1.5 text-xs font-medium text-rose-400 bg-rose-950/40 border border-rose-800/30 rounded-lg px-4 py-2 hover:bg-rose-900/50 transition">
          🗑️ 清空地圖
        </button>
        
        <button @click="previewLevel" :disabled="loading" class="flex items-center gap-2 bg-[#ffbb33] hover:bg-[#ffaa00] text-amber-950 px-5 py-2 rounded-lg font-bold transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(255,187,51,0.3)]">
          👁️ 預覽試玩
        </button>

        <button @click="saveLevel()" :disabled="loading" class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-6 py-2 rounded-lg font-bold transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(79,70,229,0.4)]">
          {{ loading ? '處理中...' : '💾 發布 / 儲存' }}
        </button>
      </div>
    </header>

    <div class="flex-1 overflow-hidden flex flex-col lg:flex-row-reverse">
      
      <aside class="w-full lg:w-[340px] shrink-0 border-l border-indigo-900/40 bg-[#171527] overflow-y-auto custom-scrollbar flex flex-col">
        <div class="p-5 space-y-6">
          
          <section>
            <h3 class="text-sm font-bold text-indigo-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-400"></span> 基礎設定
            </h3>
            <div class="space-y-4">
              
              <div class="flex gap-3">
                <div class="w-20 shrink-0">
                  <label class="block text-xs text-gray-400 mb-1.5">編號</label>
                  <input v-model.number="form.level_number" type="number" placeholder="1" class="w-full bg-[#0a0914] border border-indigo-900/50 rounded-lg p-2.5 text-sm text-center focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition" />
                </div>
                <div class="flex-1">
                  <label class="block text-xs text-gray-400 mb-1.5">關卡標題</label>
                  <input ref="titleInput" v-model="form.title" @input="formError = ''" type="text" placeholder="例如: 窄門試煉" :class="formError ? 'border-rose-500 focus:border-rose-500' : 'border-indigo-900/50 focus:border-indigo-500'" class="w-full bg-[#0a0914] border rounded-lg p-2.5 text-sm outline-none transition" />
                  <p v-if="formError" class="mt-1.5 text-xs font-bold text-rose-400" role="alert">{{ formError }}</p>
                </div>
              </div>
              
              <div>
                <label class="block text-xs text-gray-400 mb-1.5">任務描述</label>
                <textarea v-model="form.description" rows="2" placeholder="敘述通關目標..." class="w-full bg-[#0a0914] border border-indigo-900/50 rounded-lg p-2.5 text-sm focus:border-indigo-500 outline-none transition resize-none"></textarea>
              </div>

              <div class="flex gap-3">
                <div class="flex-1">
                  <label class="block text-xs text-gray-400 mb-1.5">怪物名稱</label>
                  <input v-model="form.enemy_name" type="text" placeholder="史萊姆" class="w-full bg-[#0a0914] border border-indigo-900/50 rounded-lg p-2.5 text-sm focus:border-indigo-500 outline-none transition" />
                </div>
                <div class="w-20 shrink-0">
                  <label class="block text-xs text-gray-400 mb-1.5">次數 ❤️</label>
                  <input v-model.number="form.hearts" type="number" min="1" max="10" placeholder="3" class="w-full bg-[#0a0914] border border-indigo-900/50 rounded-lg p-2.5 text-sm text-center text-rose-400 font-bold focus:border-indigo-500 outline-none transition" />
                </div>
              </div>

            </div>
          </section>

          <hr class="border-indigo-900/30">

          <section>
            <h3 class="text-sm font-bold text-indigo-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-400"></span> 條件與獎勵
            </h3>
            <div class="space-y-4">
              
              <div>
                <label class="block text-xs text-gray-400 mb-2">🏆 過關條件 (可複選)</label>
                <div class="space-y-2 bg-[#0a0914] border border-indigo-900/50 rounded-lg p-3">
                  <label class="flex items-center gap-2 cursor-pointer hover:text-indigo-300 transition">
                    <input type="checkbox" value="kill_enemy" v-model="form.victory_condition" class="accent-indigo-500 w-4 h-4">
                    <span class="text-sm font-bold">⚔️ 必須擊殺怪物</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer hover:text-indigo-300 transition">
                    <input type="checkbox" value="reach_goal" v-model="form.victory_condition" class="accent-indigo-500 w-4 h-4">
                    <span class="text-sm font-bold">🚪 抵達終點之門</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer hover:text-indigo-300 transition">
                    <input type="checkbox" value="get_key" v-model="form.victory_condition" class="accent-indigo-500 w-4 h-4">
                    <span class="text-sm font-bold">🗝️ 必須取得鑰匙</span>
                  </label>
                </div>
              </div>

              <div>
               <label class="block text-xs text-gray-400 mb-2">🎓 強制包含指令 (可複選)</label>
                <div class="grid grid-cols-2 gap-2 bg-[#0a0914] border border-indigo-900/50 rounded-lg p-3">
                  <label class="flex items-center gap-2 cursor-pointer hover:text-indigo-300 transition">
                    <input type="checkbox" value="for_loop" v-model="form.required_command" class="accent-indigo-500 w-4 h-4">
                    <span class="text-sm font-bold">🔄 迴圈 (for)</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer hover:text-indigo-300 transition">
                    <input type="checkbox" value="while_loop" v-model="form.required_command" class="accent-indigo-500 w-4 h-4">
                    <span class="text-sm font-bold">🔁 條件 (while)</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer hover:text-indigo-300 transition">
                    <input type="checkbox" value="if_else" v-model="form.required_command" class="accent-indigo-500 w-4 h-4">
                    <span class="text-sm font-bold">🔀 判斷 (if)</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer hover:text-indigo-300 transition">
                    <input type="checkbox" value="function" v-model="form.required_command" class="accent-indigo-500 w-4 h-4">
                    <span class="text-sm font-bold">🔧 函式 (function)</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer hover:text-indigo-300 transition">
                    <input type="checkbox" value="isWall" v-model="form.required_command" class="accent-indigo-500 w-4 h-4">
                    <span class="text-sm font-bold">🧱 雷達 (isWall)</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer hover:text-indigo-300 transition">
                    <input type="checkbox" value="isEnemy" v-model="form.required_command" class="accent-indigo-500 w-4 h-4">
                    <span class="text-sm font-bold">🎯 雷達 (isEnemy)</span>
                  </label>
                </div>
              </div>

              <div>
                <label class="block text-xs text-gray-400 mb-1.5">⚡ 經驗值</label>
                <input v-model.number="form.xp_reward" type="number" min="10" step="10" placeholder="200" class="w-full bg-[#0a0914] border border-indigo-900/50 rounded-lg p-2.5 text-sm text-[#ffbb33] font-bold focus:border-indigo-500 outline-none" />
              </div>

            </div>
          </section>

          <hr class="border-indigo-900/30">

          <section>
            <h3 class="text-sm font-bold text-indigo-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-400"></span> 環境與限制
            </h3>
            <div class="space-y-4">
              
              <div class="flex gap-3">
                <div class="flex-1">
                  <label class="block text-xs text-gray-400 mb-1.5">網格 (欄 x 列)</label>
                  <div class="flex gap-2">
                    <input v-model.number="form.grid_size.cols" type="number" min="5" max="20" class="w-1/2 bg-[#0a0914] border border-indigo-900/50 rounded-lg p-2.5 text-sm text-center focus:border-indigo-500 outline-none" />
                    <span class="text-gray-500 self-center">x</span>
                    <input v-model.number="form.grid_size.rows" type="number" min="5" max="20" class="w-1/2 bg-[#0a0914] border border-indigo-900/50 rounded-lg p-2.5 text-sm text-center focus:border-indigo-500 outline-none" />
                  </div>
                </div>
                <div class="w-[88px] shrink-0">
                  <label class="block text-xs text-gray-400 mb-1.5">積木上限</label>
                  <input v-model.number="form.max_blocks" type="number" placeholder="20" class="w-full bg-[#0a0914] border border-indigo-900/50 rounded-lg p-2.5 text-sm text-center focus:border-indigo-500 outline-none" />
                </div>
              </div>

            </div>
          </section>

          <hr class="border-indigo-900/30">

          <section>
            <h3 class="text-sm font-bold text-indigo-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-400"></span> 開放積木指令
            </h3>
            
            <div class="space-y-2">
              <details 
                v-for="(group, index) in groupedCommands" 
                :key="group.name" 
                class="group bg-[#0a0914] border border-indigo-900/50 rounded-lg overflow-hidden"
                :open="index === 0" 
              >
                <summary class="cursor-pointer px-3 py-2.5 text-xs font-bold text-gray-300 bg-indigo-900/20 hover:bg-indigo-900/40 select-none flex justify-between items-center transition-colors">
                  {{ group.name }}
                  <span class="text-indigo-500 group-open:rotate-180 transition-transform duration-200">▼</span>
                </summary>
                
                <div class="p-3 flex flex-wrap gap-2 bg-[#0a0914] border-t border-indigo-900/30">
                  <label 
                    v-for="cmd in group.commands" 
                    :key="cmd.id" 
                    class="flex items-center gap-2 border border-indigo-900/50 px-3 py-1.5 rounded-lg cursor-pointer hover:border-indigo-500 transition has-[:checked]:bg-indigo-900/40 has-[:checked]:border-indigo-500"
                  >
                    <input type="checkbox" :value="cmd.id" v-model="form.available_commands" class="w-3.5 h-3.5 accent-indigo-500 rounded bg-gray-800 border-gray-600">
                    <span class="text-xs text-gray-300">{{ cmd.label || cmd.id }}</span>
                  </label>
                </div>
              </details>
            </div>

          </section>

        </div>
      </aside>

      <main class="flex-1 bg-[#0a0914] flex flex-col relative overflow-hidden">
        
        <div class="absolute top-4 left-1/2 -translate-x-1/2 bg-[#171527]/90 backdrop-blur-md border border-indigo-900/50 rounded-2xl p-2 flex gap-1.5 shadow-2xl z-10">
          <button v-for="brush in brushes" :key="brush.id"
                  @click="activeBrush = brush.id"
                  class="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200"
                  :class="activeBrush === brush.id ? brush.activeClass : 'text-gray-400 hover:bg-white/5'">
            <span class="text-lg">{{ brush.icon }}</span>
            <span class="text-sm font-bold">{{ brush.name }}</span>
          </button>
        </div>

        <div class="flex-1 overflow-auto flex items-center justify-center p-8 custom-scrollbar">
          <div class="relative bg-[#1e1c32] shadow-2xl border border-indigo-900/30 transition-all"
              :style="{ 
              display: 'grid', 
              gridTemplateColumns: `repeat(${form.grid_size.cols}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${form.grid_size.rows}, minmax(0, 1fr))`, 
              width: `${Math.min(form.grid_size.cols * 45, 800)}px`,
              height: `${Math.min(form.grid_size.rows * 45, 800)}px`
              }">
            
            <div v-for="cell in cells" :key="cell.key"
                 @mousedown="isDrawing = true; paint(cell.key)"
                 @mouseenter="isDrawing && paint(cell.key)"
                 @mouseup="isDrawing = false"
                 class="border border-indigo-900/20 bg-[#13111f]/50 hover:bg-indigo-500/20 transition-colors cursor-crosshair flex items-center justify-center select-none overflow-hidden"
                 :style="{ width: '100%', height: '100%' }">
              <span v-if="gridMap[cell.key]" class="text-2xl drop-shadow-md pointer-events-none transform transition-transform animate-pop leading-none">
                {{ getBrushIcon(gridMap[cell.key]) }}
              </span>
            </div>

          </div>
        </div>
      </main>

    </div>

    <div v-if="showLoadModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div class="bg-[#171527] border border-indigo-500/30 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div class="px-6 py-4 border-b border-indigo-900/50 flex justify-between items-center bg-[#13111f]">
          <h2 class="text-lg font-bold text-indigo-300 flex items-center gap-2">
            📂 載入與管理關卡
          </h2>
          <button @click="showLoadModal = false" class="text-gray-400 hover:text-white">✖</button>
        </div>
        
        <div class="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <div v-if="isFetchingLevels" class="text-center py-10 text-indigo-400">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-2"></div>
            讀取資料庫中...
          </div>
          
          <div v-else-if="savedLevels.length === 0" class="text-center py-10 text-gray-500">
            <p>目前還沒有儲存任何關卡喔！</p>
            <p class="mt-2 text-xs leading-relaxed text-gray-600">此處僅顯示教師自建的班級關卡；基礎邏輯課程的既有關卡不會列在這裡。</p>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
            
            <div v-if="isModifying" class="absolute inset-0 bg-[#171527]/50 backdrop-blur-[2px] z-10 rounded-xl flex items-center justify-center">
               <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>

            <div v-for="(lvl, index) in savedLevels" :key="lvl.id" 
                 class="flex flex-col bg-[#0a0914] border border-indigo-900/50 rounded-xl overflow-hidden shadow-lg">
              
              <button @click="loadLevel(lvl)" class="text-left p-4 hover:bg-indigo-900/20 transition flex-1 group">
                <div class="flex justify-between items-start mb-1">
                  <div class="text-xs text-indigo-400 font-bold bg-indigo-900/30 px-2 py-1 rounded">Level {{ lvl.level_number }}</div>
                </div>
                <div class="text-white font-bold truncate mt-2 group-hover:text-indigo-300 transition-colors">{{ lvl.title }}</div>
                <div class="text-xs text-gray-500 mt-1 truncate">{{ lvl.description || '無描述' }}</div>
              </button>

              <div class="flex items-center justify-between px-3 py-2 bg-[#13111f] border-t border-indigo-900/30">
                <div class="flex items-center gap-1">
                  <button @click="swapLevels(index, index - 1)" :disabled="index === 0" class="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 disabled:opacity-20 transition" title="往前移">
                    ⬆️
                  </button>
                  <button @click="swapLevels(index, index + 1)" :disabled="index === savedLevels.length - 1" class="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 disabled:opacity-20 transition" title="往後移">
                    ⬇️
                  </button>
                </div>
                
                <button @click="deleteLevel(lvl)" class="text-xs font-bold text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 px-3 py-1.5 rounded transition flex items-center gap-1">
                  🗑️ 刪除
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #333355; border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4f46e5; }
@keyframes pop {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
.animate-pop { animation: pop 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
</style>

<script setup>
import { ref, computed, nextTick } from 'vue';
import { supabase } from '../../../../supabase'; 
import { OUTGAME_COMMANDS } from '../../../../game/config/CommandList.js';

const emit = defineEmits(['preview']);

// --- 狀態管理 ---
const loading = ref(false);
const isDrawing = ref(false);
const showLoadModal = ref(false);
const savedLevels = ref([]);
const isFetchingLevels = ref(false);
const isModifying = ref(false); 
const formError = ref('');
const titleInput = ref(null);

const form = ref({
  id: null,
  level_number: 1,
  title: '',
  description: '',
  enemy_name: '史萊姆',
  hearts: 3,
  max_blocks: 20,
  xp_reward: 200,              
  // 🌟 將兩者初始化為「陣列」
  victory_condition: ['kill_enemy'], 
  required_command: [],           
  grid_size: { cols: 10, rows: 10 },
  available_commands: ['moveUp', 'moveDown', 'moveLeft', 'moveRight', 'attack'],
});

const gridMap = ref({});
const activeBrush = ref('player');

const groupedCommands = computed(() => {
  const groups = {
    '🚶‍♂️ 移動類': ['moveUp', 'moveDown', 'moveLeft', 'moveRight', 'dash'],
    '⚔️ 動作與戰鬥': ['wait', 'take', 'open', 'attack', 'shoot', 'magic', 'bomb', 'heal'],
    '👁️ 環境偵測': ['isWall', 'isEnemy', 'isGoal', 'hasKey', 'lowHp'],
    '🧠 邏輯與控制': ['for', 'while', 'if', 'else', 'function']
  };

  const result = [];
  const usedIds = new Set();

  for (const [name, ids] of Object.entries(groups)) {
    const commands = OUTGAME_COMMANDS.filter(cmd => ids.includes(cmd.id));
    if (commands.length > 0) {
      result.push({ name, commands });
      commands.forEach(c => usedIds.add(c.id));
    }
  }

  const others = OUTGAME_COMMANDS.filter(cmd => !usedIds.has(cmd.id));
  if (others.length > 0) {
    result.push({ name: '📦 其他', commands: others });
  }

  return result;
});

const brushes = [
  { id: 'player', name: '玩家', icon: '🧙', activeClass: 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]', unique: true },
  { id: 'enemy', name: '怪物', icon: '👾', activeClass: 'bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.5)]', unique: true },
  { id: 'goal', name: '終點', icon: '🚪', activeClass: 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(5,150,105,0.5)]', unique: true }, 
  { id: 'key', name: '鑰匙', icon: '🗝️', activeClass: 'bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)]', unique: true }, 
  { id: 'rock', name: '石頭', icon: '🪨', activeClass: 'bg-slate-600 text-white shadow-[0_0_15px_rgba(71,85,105,0.5)]', unique: false },
  { id: 'lava', name: '岩漿', icon: '🔥', activeClass: 'bg-orange-600 text-white shadow-[0_0_15px_rgba(234,88,12,0.5)]', unique: false },
  { id: 'empty', name: '橡皮擦', icon: '🧹', activeClass: 'bg-gray-800 text-white border border-gray-600', unique: false }
];

const getBrushIcon = (id) => brushes.find(b => b.id === id)?.icon || '';

const cells = computed(() => {
  const arr = [];
  for (let y = 0; y < form.value.grid_size.rows; y++) {
    for (let x = 0; x < form.value.grid_size.cols; x++) {
      arr.push({ x, y, key: `${x},${y}` });
    }
  }
  return arr;
});

window.addEventListener('mouseup', () => isDrawing.value = false);

const paint = (key) => {
  if (activeBrush.value === 'empty') {
    delete gridMap.value[key];
  } else {
    const brush = brushes.find(b => b.id === activeBrush.value);
    if (brush.unique) {
      for (const k in gridMap.value) {
        if (gridMap.value[k] === activeBrush.value) delete gridMap.value[k];
      }
    }
    gridMap.value[key] = activeBrush.value;
  }
};

const clearGrid = () => {
  if (confirm('確定要清空所有地圖配置嗎？')) gridMap.value = {};
};

// --- 讀取、排序與刪除功能 ---
const openLoadModal = async () => {
  showLoadModal.value = true;
  isFetchingLevels.value = true;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('levels')
      .select('id, level_number, title, description')
      .eq('teacher_id', user.id) 
      .order('level_number', { ascending: true });
    
    if (error) throw error;
    savedLevels.value = data || [];
  } catch (error) {
    alert("讀取關卡列表失敗：" + error.message);
  } finally {
    isFetchingLevels.value = false;
  }
};

const loadLevel = async (lvlInfo) => {
  try { 
    const { data, error } = await supabase
      .from('levels')
      .select('*')
      .eq('id', lvlInfo.id)
      .single();
    
    if (error) throw error;

    // 🌟 解析過關條件與指令為陣列 (兼容舊資料字串)
    let vc = data.victory_condition;
    try { vc = JSON.parse(vc); } catch(e) {}
    if (!Array.isArray(vc)) {
      if (vc === 'key_and_goal') vc = ['get_key', 'reach_goal'];
      else if (vc) vc = [vc];
      else vc = ['kill_enemy'];
    }

    let rc = data.required_command;
    try { rc = JSON.parse(rc); } catch(e) {}
    if (!Array.isArray(rc)) {
      if (rc) rc = [rc];
      else rc = [];
    }

    form.value = {
      id: data.id, 
      level_number: data.level_number,
      title: data.title,
      description: data.description || '',
      enemy_name: data.enemy_name || '怪物',
      hearts: data.hearts || 3, 
      max_blocks: data.max_blocks || 20,
      grid_size: data.grid_size || { cols: 10, rows: 10 },
      available_commands: data.available_commands || [],
      xp_reward: data.xp_reward || 200,
      victory_condition: vc, // 塞入陣列
      required_command: rc,  // 塞入陣列
    };

    gridMap.value = {};
    let obsArray = [];
    try {
      obsArray = typeof data.obstacles === 'string' ? JSON.parse(data.obstacles) : (data.obstacles || []);
    } catch(e) {}

    if (Array.isArray(obsArray)) {
      obsArray.forEach(item => {
        gridMap.value[`${item.x},${item.y}`] = item.type;
      });
    }

    showLoadModal.value = false;
  } catch (error) {
    alert("載入關卡詳細資料失敗：" + error.message);
  }
};

const deleteLevel = async (lvl) => {
  if (!confirm(`確定要刪除「Level ${lvl.level_number}: ${lvl.title}」嗎？\n此操作無法復原！`)) return;

  isModifying.value = true;
  try {
    const { error } = await supabase.from('levels').delete().eq('id', lvl.id);
    if (error) throw error;
    await openLoadModal(); 
  } catch (error) {
    alert("刪除失敗：" + error.message);
  } finally {
    isModifying.value = false;
  }
};

const swapLevels = async (indexA, indexB) => {
  if (indexB < 0 || indexB >= savedLevels.value.length) return;
  
  isModifying.value = true;
  try {
    const lvlA = savedLevels.value[indexA];
    const lvlB = savedLevels.value[indexB];
    const numA = lvlA.level_number;
    const numB = lvlB.level_number;

    await supabase.from('levels').update({ level_number: -999 }).eq('id', lvlA.id);
    await supabase.from('levels').update({ level_number: numA }).eq('id', lvlB.id);
    await supabase.from('levels').update({ level_number: numB }).eq('id', lvlA.id);

    await openLoadModal(); 
  } catch (error) {
    alert("排序失敗：" + error.message);
  } finally {
    isModifying.value = false;
  }
};


// --- 儲存與預覽 ---
const saveLevel = async (showAlert = true) => {
  if (!form.value.title.trim()) {
    formError.value = '請輸入關卡名稱。';
    await nextTick();
    titleInput.value?.focus();
    return false;
  }
  formError.value = '';
  loading.value = true;

  const obstacles = [];
  for (const [key, type] of Object.entries(gridMap.value)) {
    const [x, y] = key.split(',').map(Number);
    obstacles.push({ x, y, type });
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!form.value.id) {
      const { data: existing } = await supabase
        .from('levels')
        .select('id')
        .eq('level_number', form.value.level_number)
        .eq('teacher_id', user.id)
        .maybeSingle();

      if (existing?.id) {
        form.value.id = existing.id;
      }
    }

    const payload = { 
      ...form.value, 
      // 🌟 將陣列轉換成 JSON 字串存入資料庫
      victory_condition: JSON.stringify(form.value.victory_condition),
      required_command: JSON.stringify(form.value.required_command),
      obstacles, 
      teacher_id: user.id 
    };
    
    if (!payload.id) delete payload.id;

    const { data, error } = await supabase.from('levels').upsert([payload]).select().single();
    
    if (error) throw error;
    
    if (data && data.id) {
      form.value.id = data.id;
    }
    
    if (showAlert) alert('✅ 儲存成功！');
    return true;
  } catch (err) {
    console.error('儲存失敗', err);
    alert('儲存失敗：' + err.message);
    return false;
  } finally {
    loading.value = false;
  }
};

const previewLevel = async () => {
  const isSaved = await saveLevel(false);
  if (isSaved) {
    emit('preview', form.value.level_number);
  }
};
</script>
