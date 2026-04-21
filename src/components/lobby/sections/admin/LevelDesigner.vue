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
          📂 讀取關卡
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
                <label class="block text-xs text-gray-400 mb-1.5">怪物名稱 (Enemy Name)</label>
                <input v-model="form.enemy_name" type="text" placeholder="例如: 史萊姆" class="w-full bg-[#0a0914] border border-indigo-900/50 rounded-lg p-2.5 text-sm focus:border-indigo-500 outline-none transition" />
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
            <div class="flex flex-wrap gap-2">
              <label v-for="cmd in allCommands" :key="cmd.id" class="flex items-center gap-2 bg-[#0a0914] border border-indigo-900/50 px-3 py-1.5 rounded-lg cursor-pointer hover:border-indigo-500 transition has-[:checked]:bg-indigo-900/40 has-[:checked]:border-indigo-500">
                <input type="checkbox" :value="cmd.id" v-model="form.available_commands" class="w-3.5 h-3.5 accent-indigo-500 rounded bg-gray-800 border-gray-600">
                <span class="text-xs text-gray-300">{{ cmd.label }}</span>
              </label>
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
      <div class="bg-[#171527] border border-indigo-500/30 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div class="px-6 py-4 border-b border-indigo-900/50 flex justify-between items-center bg-[#13111f]">
          <h2 class="text-lg font-bold text-indigo-300 flex items-center gap-2">
            📂 載入我的關卡
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

          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button v-for="lvl in savedLevels" :key="lvl.id" @click="loadLevel(lvl)" 
                    class="text-left bg-[#0a0914] border border-indigo-900/50 p-4 rounded-xl hover:border-indigo-400 hover:bg-indigo-900/20 transition group">
              <div class="text-xs text-indigo-400 font-bold mb-1">Level {{ lvl.level_number }}</div>
              <div class="text-white font-bold truncate">{{ lvl.title }}</div>
              <div class="text-xs text-gray-500 mt-2 truncate">{{ lvl.description || '無描述' }}</div>
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { supabase } from '../../../../supabase'; 

const emit = defineEmits(['preview']);

// --- 狀態管理 ---
const loading = ref(false);
const isDrawing = ref(false);

const form = ref({
  level_number: 1,
  title: '',
  description: '',
  enemy_name: '史萊姆',
  max_blocks: 20,
  grid_size: { cols: 10, rows: 10 },
  available_commands: ['moveUp', 'moveDown', 'moveLeft', 'moveRight', 'attack']
});

const gridMap = ref({});
const activeBrush = ref('player');

const allCommands = [
  { id: 'moveUp', label: '⬆️ 向上走' },
  { id: 'moveDown', label: '⬇️ 向下走' },
  { id: 'moveLeft', label: '⬅️ 向左走' },
  { id: 'moveRight', label: '➡️ 向右走' },
  { id: 'attack', label: '⚔️ 攻擊' },
  { id: 'repeat', label: '🔁 重複迴圈 (repeat)' },
  { id: 'while', label: '🔄 條件迴圈 (while)' },
  { id: 'if', label: '🤔 如果判斷 (if)' },
  { id: 'isWall', label: '🧱 感知:前方有牆' },
  { id: 'isEnemy', label: '👾 感知:敵人在旁' }
];

const brushes = [
  { id: 'player', name: '玩家', icon: '🧙', activeClass: 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]', unique: true },
  { id: 'enemy', name: '怪物', icon: '👾', activeClass: 'bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.5)]', unique: true },
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

// --- 讀取功能 ---
const showLoadModal = ref(false);
const savedLevels = ref([]);
const isFetchingLevels = ref(false);

const openLoadModal = async () => {
  showLoadModal.value = true;
  isFetchingLevels.value = true;
  try {
    const { data, error } = await supabase
      .from('levels')
      .select('id, level_number, title, description')
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
    // 🌟 修正：加上 .select('*') 以解決 eq is not a function 錯誤
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
      max_blocks: data.max_blocks || 20,
      grid_size: data.grid_size || { cols: 10, rows: 10 },
      available_commands: data.available_commands || []
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

  const payload = { ...form.value, obstacles };

  try {
    const { error } = await supabase.from('levels').upsert([payload], { onConflict: 'level_number' });
    if (error) throw error;
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