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

        <button @click="saveLevel" :disabled="loading" class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-6 py-2 rounded-lg font-bold transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(79,70,229,0.4)]">
          {{ loading ? '處理中...' : '💾 發布 / 儲存' }}
        </button>
      </div>
    </header>

    <div class="flex-1 overflow-hidden flex flex-col lg:flex-row-reverse">
      
      <aside class="w-full lg:w-80 border-l border-indigo-900/40 bg-[#171527] overflow-y-auto custom-scrollbar flex flex-col">
        <div class="p-5 space-y-6">
          
          <section>
            <h3 class="text-sm font-bold text-indigo-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-400"></span> 基本資訊
            </h3>
            <div class="space-y-4">
              <div>
                <label class="block text-xs text-gray-400 mb-1.5">關卡編號 (Level Number)</label>
                <input v-model.number="form.level_number" type="number" placeholder="例如: 1" class="w-full bg-[#0a0914] border border-indigo-900/50 rounded-lg p-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition" />
              </div>
              <div>
                <label class="block text-xs text-gray-400 mb-1.5">關卡標題 (Title)</label>
                <input v-model="form.title" type="text" placeholder="例如: 窄門試煉" class="w-full bg-[#0a0914] border border-indigo-900/50 rounded-lg p-2.5 text-sm focus:border-indigo-500 outline-none transition" />
              </div>
              <div>
                <label class="block text-xs text-gray-400 mb-1.5">任務描述 (Description)</label>
                <textarea v-model="form.description" rows="2" placeholder="敘述通關目標..." class="w-full bg-[#0a0914] border border-indigo-900/50 rounded-lg p-2.5 text-sm focus:border-indigo-500 outline-none transition resize-none"></textarea>
              </div>
              <div>
                <label class="block text-xs text-gray-400 mb-1.5">🏆 過關條件</label>
                <select v-model="form.victory_condition" class="w-full bg-[#0a0914] border border-indigo-900/50 rounded-lg p-2.5 text-sm focus:border-indigo-500 outline-none">
                  <option value="kill_enemy">⚔️ 必須擊殺怪物</option>
                  <option value="reach_goal">🚪 抵達終點之門</option>
                  <option value="key_and_goal">🗝️ 取得鑰匙並抵達終點</option>
                </select>
              </div>
              <div class="flex gap-3">
                <div class="flex-1">
                  <label class="block text-xs text-gray-400 mb-1.5">怪物名稱 (Enemy)</label>
                  <input v-model="form.enemy_name" type="text" placeholder="史萊姆" class="w-full bg-[#0a0914] border border-indigo-900/50 rounded-lg p-2.5 text-sm focus:border-indigo-500 outline-none transition" />
                </div>
                <div class="w-24 shrink-0">
                  <label class="block text-xs text-gray-400 mb-1.5">生命值 ❤️</label>
                  <input v-model.number="form.hearts" type="number" min="1" max="10" placeholder="3" class="w-full bg-[#0a0914] border border-indigo-900/50 rounded-lg p-2.5 text-sm text-center text-rose-400 font-bold focus:border-indigo-500 outline-none transition" />
                </div>
                <div class="flex-1">
                  <label class="block text-xs text-gray-400 mb-1.5">🎓 必須包含指令 (選填)</label>
                  <select v-model="form.required_command" class="w-full bg-[#0a0914] border border-indigo-900/50 rounded-lg p-2.5 text-sm focus:border-indigo-500 outline-none">
                    <option value="">無限制</option>
                    <option value="for">🔄 迴圈 (for)</option>
                    <option value="if">🤔 判斷式 (if)</option>
                    <option value="while">🔁 條件迴圈 (while)</option>
                  </select>
                </div>
                <div class="w-24 shrink-0">
                  <label class="block text-xs text-gray-400 mb-1.5">⚡ 經驗值</label>
                  <input v-model.number="form.xp_reward" type="number" min="10" step="10" placeholder="200" class="w-full bg-[#0a0914] border border-indigo-900/50 rounded-lg p-2.5 text-sm text-center text-[#ffbb33] font-bold focus:border-indigo-500 outline-none" />
                </div>
              </div>
            </div>
            
          </section>

          <hr class="border-indigo-900/30">

          <section>
            <h3 class="text-sm font-bold text-indigo-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-400"></span> 限制與環境
            </h3>
            <div class="space-y-4">
              <div>
                <label class="block text-xs text-gray-400 mb-1.5">網格尺寸 (欄 x 列)</label>
                <div class="flex gap-2">
                  <input v-model.number="form.grid_size.cols" type="number" min="5" max="20" class="w-1/2 bg-[#0a0914] border border-indigo-900/50 rounded-lg p-2.5 text-sm text-center focus:border-indigo-500 outline-none" />
                  <span class="text-gray-500 self-center">x</span>
                  <input v-model.number="form.grid_size.rows" type="number" min="5" max="20" class="w-1/2 bg-[#0a0914] border border-indigo-900/50 rounded-lg p-2.5 text-sm text-center focus:border-indigo-500 outline-none" />
                </div>
              </div>
              <div>
                <label class="block text-xs text-gray-400 mb-1.5">積木數量限制 (Max Blocks)</label>
                <input v-model.number="form.max_blocks" type="number" placeholder="預設 20" class="w-full bg-[#0a0914] border border-indigo-900/50 rounded-lg p-2.5 text-sm focus:border-indigo-500 outline-none" />
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
            目前還沒有儲存任何關卡喔！
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

<script setup>
import { ref, computed } from 'vue';
import { supabase } from '../../../../supabase'; 
import { COMMAND_DICT } from '../../../../game/config/CommandList.js';

const emit = defineEmits(['preview']);

// --- 狀態管理 ---
const loading = ref(false);
const isDrawing = ref(false);
const showLoadModal = ref(false);
const savedLevels = ref([]);
const isFetchingLevels = ref(false);
const isModifying = ref(false); // 🌟 新增：控制刪除/排序時的讀取狀態

const form = ref({
  level_number: 1,
  title: '',
  description: '',
  enemy_name: '史萊姆',
  hearts: 3,
  max_blocks: 20,
  xp_reward: 200,              
  victory_condition: 'kill_enemy', 
  required_command: '',           
  grid_size: { cols: 10, rows: 10 },
  available_commands: ['moveUp', 'moveDown', 'moveLeft', 'moveRight', 'attack']
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
    const commands = COMMAND_DICT.filter(cmd => ids.includes(cmd.id));
    if (commands.length > 0) {
      result.push({ name, commands });
      commands.forEach(c => usedIds.add(c.id));
    }
  }

  const others = COMMAND_DICT.filter(cmd => !usedIds.has(cmd.id));
  if (others.length > 0) {
    result.push({ name: '📦 其他', commands: others });
  }

  return result;
});

const brushes = [
  { id: 'player', name: '玩家', icon: '🧙', activeClass: 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]', unique: true },
  { id: 'enemy', name: '怪物', icon: '👾', activeClass: 'bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.5)]', unique: true },
  { id: 'goal', name: '終點', icon: '🚪', activeClass: 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(5,150,105,0.5)]', unique: true }, // 新增
  { id: 'key', name: '鑰匙', icon: '🗝️', activeClass: 'bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)]', unique: true }, // 新增
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

    form.value = {
      level_number: data.level_number,
      title: data.title,
      description: data.description || '',
      enemy_name: data.enemy_name || '怪物',
      hearts: data.hearts || 3, // 🌟 載入生命值
      max_blocks: data.max_blocks || 20,
      grid_size: data.grid_size || { cols: 10, rows: 10 },
      available_commands: data.available_commands || [],
      xp_reward: data.xp_reward || 200,
      victory_condition: data.victory_condition || 'kill_enemy',
      required_command: data.required_command || '',
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

// 🌟 新增：刪除關卡
const deleteLevel = async (lvl) => {
  if (!confirm(`確定要刪除「Level ${lvl.level_number}: ${lvl.title}」嗎？\n此操作無法復原！`)) return;
  
  isModifying.value = true;
  try {
    const { error } = await supabase.from('levels').delete().eq('id', lvl.id);
    if (error) throw error;
    await openLoadModal(); // 刪除成功後重新載入列表
  } catch (error) {
    alert("刪除失敗：" + error.message);
  } finally {
    isModifying.value = false;
  }
};

// 🌟 新增：交換順序 (上移/下移)
const swapLevels = async (indexA, indexB) => {
  if (indexB < 0 || indexB >= savedLevels.value.length) return;
  
  isModifying.value = true;
  try {
    const lvlA = savedLevels.value[indexA];
    const lvlB = savedLevels.value[indexB];
    const numA = lvlA.level_number;
    const numB = lvlB.level_number;

    // 💡 技巧：為了避免在切換的過程中違反資料庫的 (teacher_id, level_number) 組合唯一限制
    // 我們需要先把 A 暫時設為一個絕對不會重複的負數 (-999)
    await supabase.from('levels').update({ level_number: -999 }).eq('id', lvlA.id);
    // 再把 B 設為 A 原本的數字
    await supabase.from('levels').update({ level_number: numA }).eq('id', lvlB.id);
    // 最後把 A 設為 B 原本的數字
    await supabase.from('levels').update({ level_number: numB }).eq('id', lvlA.id);

    await openLoadModal(); // 更新成功後重新載入列表
  } catch (error) {
    alert("排序失敗：" + error.message);
  } finally {
    isModifying.value = false;
  }
};


// --- 儲存與預覽 ---
const saveLevel = async () => {
  if (!form.value.title) {
    alert('請輸入關卡名稱！');
    return false;
  }
  loading.value = true;

  const obstacles = [];
  for (const [key, type] of Object.entries(gridMap.value)) {
    const [x, y] = key.split(',').map(Number);
    obstacles.push({ x, y, type });
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();

    // 將 teacher_id, hearts 等資訊包裝進去
    const payload = { ...form.value, obstacles, teacher_id: user.id };
    const { error } = await supabase.from('levels').upsert([payload]);
    
    if (error) throw error;
    
    alert('✅ 儲存成功！');
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
  const isSaved = await saveLevel();
  if (isSaved) {
    emit('preview', form.value.level_number);
  }
};
</script>

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