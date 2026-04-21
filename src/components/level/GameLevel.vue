<template>
  <div id="game-screen" class="h-full w-full flex flex-col overflow-hidden" style="background: linear-gradient(135deg, #0a0e27 0%, #1a1a3e 50%, #0f1428 100%);">
      
    <div class="flex items-center justify-between px-6 py-3 border-b flex-shrink-0" style="border-color:#1e1e2e; background:#0a0e27; z-index:50;">
      <div class="flex items-center gap-3">
        <button @click="$emit('back')" class="p-2 rounded-lg hover:bg-white/10 transition" style="color:#f0f0f0;"> 
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        </button>
        <div>
          <p class="text-xs font-semibold" style="color:#a0a0b8;">{{ levelConfig.description || '載入中...' }}</p>
          <p class="text-sm font-bold" style="color:#f0f0f0;">{{ levelConfig.title || '讀取關卡...' }}</p>
        </div>
      </div>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 font-bold px-4 py-1.5 rounded-full bg-black/40 border border-white/10 shadow-inner">
            <span class="text-white font-['Fredoka'] tracking-wide">Lv. {{ currentLevel }}</span>
            <span class="w-px h-4 bg-white/20"></span>
            <span class="text-[#ffbb33] drop-shadow-[0_0_5px_rgba(255,187,51,0.5)]">
              ⚡ {{ currentXP }} <span class="text-[#a0a0b8] text-xs">/ {{ xpPerLevel }}</span>
            </span>
          </div>
          
          <div class="flex items-center gap-1 font-bold px-3 py-1.5 rounded-full bg-black/40 border border-white/10" style="color:#ff6b6b;">
            <span class="drop-shadow-[0_0_5px_rgba(255,107,107,0.5)]">❤️</span><span>{{ hp }}</span>
          </div>
        </div>
    </div>

    <div class="flex-1 flex overflow-hidden">
      <div v-if="isLoading" class="flex-1 flex flex-col items-center justify-center bg-[#1e1e3f] border-r border-[#333355]">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00d4aa] mb-4"></div>
        <p class="text-[#a0a0b8] font-bold tracking-widest">魔法陣構築中...</p>
      </div>

      <div v-else class="flex-1 min-w-0 min-h-0 flex flex-col bg-[#1e1e3f] border-r" style="border-color:#333355;">
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

      <CodeEditorPanel 
        v-if="!isLoading"
        :levelConfig="levelConfig"
        :isExecuting="isExecuting"
        :currentLine="currentLine"
        @execute="executeCode"
        @clear="clearCode"
      />
    </div>
  </div>

  <LevelWinModal 
    v-if="showWinModal"
    :currentLevel="currentLevel"
    :currentXP="currentXP"
    :xpPerLevel="xpPerLevel"
    :xpReward="levelConfig?.xpReward || 100"
    :stars="hp"  
    @next="handleNextLevel"
    @home="$emit('back')"
  />

  <LevelFailModal 
    v-if="showFailModal"
    @restart="handleRestart"
    @home="$emit('back')"
  />
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch, nextTick } from 'vue';
import { supabase } from '../../supabase.js';
import { BADGE_LIST } from '../../game/config/badges.js';
import { levels as staticLevels } from '../../game/scenes/LevelConfig.js'; // 🌟 修正：補上遺漏的 Import！
import Phaser from 'phaser';
import TeachingScene from '../../game/scenes/TeachingScene.js';
import CodeEditorPanel from './CodeEditorPanel.vue';
import LevelWinModal from './LevelWinModal.vue';
import LevelFailModal from './LevelFailModal.vue';

// 🌟 修正：移除了衝突的 levelConfig prop，現在 GameLevel 完全靠自己抓資料
const props = defineProps({
  courseId: { type: String, required: true },
  levelId: { type: [String, Number], required: true }
});
const emit = defineEmits(['back', 'next-level']);

const isLevelCleared = ref(false);
const showWinModal = ref(false);
const isExecuting = ref(false);
const showFailModal = ref(false);
const isLoading = ref(true); // 🌟 新增：讀取狀態控制
const currentLine = ref(-1);
const currentLevel = ref(1);
const currentXP = ref(0);
const xpPerLevel = ref(1000);
const hp = ref(3);
const today = new Date().toISOString().split('T')[0];
const storedDaily = JSON.parse(localStorage.getItem('code_quest_daily') || '{}');
const currentTotalXP = ref(0);
const enterTime = ref(0);
const levelConfig = ref({}); // 這是我們唯一使用的關卡資料狀態

let game = null;

const executeCode = async (code, blockCount = 0) => {
  // 🌟 修正：統一 maxBlocks 的存取路徑
  const maxBlocks = levelConfig.value?.restrictions?.maxBlocks;
  if (maxBlocks && blockCount > maxBlocks) {
    alert(`⚠️ 魔法能量不足！這關最多只能使用 ${maxBlocks} 個積木，但你使用了 ${blockCount} 個。請嘗試使用迴圈來優化！`);
    return;
  }

  if (!game) return;
  const phaserScene = game.scene.getScene('TeachingScene');
  if (!phaserScene) return;

  isExecuting.value = true;
  phaserScene.resetLevel();
  currentLine.value = -1;

  setTimeout(async () => {
      try {
        const asyncCode = `
          return (async () => {
            ${code}
            scene.checkVictory();
            return scene.enemy.alpha === 0; 
          })();
        `;
        
        const run = new Function('scene', asyncCode);
        const isSuccess = await run(phaserScene);

        if (!isSuccess) {
           hp.value = Math.max(0, hp.value - 1);
        }

      } catch (error) {
        console.error("執行過程中出現魔法錯誤:", error);
        alert("執行失敗！請檢查積木是否有拼錯。");
      } finally {
        isExecuting.value = false;
      }
  }, 100); 
};

const onLevelWin = () => {
  isLevelCleared.value = true;
  handleWin();
};

const handleNextLevel = () => {
  isLevelCleared.value = false;
  emit('next-level');
};

watch(hp, (newHp) => {
  if (newHp <= 0) {
    setTimeout(() => {
      showFailModal.value = true;
    }, 500);
  }
});

const handleRestart = () => {
  showFailModal.value = false;
  hp.value = 3;
  enterTime.value = Date.now(); 

  if (game) {
    const scene = game.scene.getScene('TeachingScene');
    if (scene) scene.resetLevel();
  }
};

const clearCode = () => {
  currentLine.value = -1;
};

if (storedDaily.date === today) {
  const quests = storedDaily.quests;
  const passTask = quests.find(q => q.id === 'pass_levels');
  if (passTask && passTask.progress < passTask.target) passTask.progress += 1;
  const perfectTask = quests.find(q => q.id === 'perfect_clear');
  if (perfectTask && perfectTask.progress < perfectTask.target) perfectTask.progress += 1; 
  localStorage.setItem('code_quest_daily', JSON.stringify({ date: today, quests }));
}

const handleWin = async () => {
  const leaveTime = Date.now();
  const timeSpentSeconds = Math.floor((leaveTime - enterTime.value) / 1000);
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    showWinModal.value = true;
    return;
  }

  const safeCourseId = props.courseId || 'python';
  const levelId = levelConfig.value?.id || Number(props.levelId) || 0; 

  const { data: existingProgress, error: fetchError } = await supabase
    .from('user_progress')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', safeCourseId) // 👈 就是加了這行
    .eq('level_id', levelId) 
    .maybeSingle(); 

  let progressError = null;

  if (existingProgress) {
    // 已經破過這關，更新星星與通關秒數
    const { error } = await supabase.from('user_progress').update({ 
        stars: hp.value, 
        time_spent_seconds: timeSpentSeconds 
      }).eq('id', existingProgress.id);
    progressError = error;
  } else {
    // 第一次破關，新增一筆進度紀錄
    const { error } = await supabase.from('user_progress').insert({ 
        user_id: user.id, 
        course_id: safeCourseId, 
        level_id: levelId, 
        stars: hp.value,
        time_spent_seconds: timeSpentSeconds 
      });
    progressError = error;
  }

  if (progressError) {
    console.error('存檔過程發生錯誤:', progressError);
  }

  const xpReward = levelConfig.value?.xpReward || 200; 
  
  const { data: profile } = await supabase.from('profiles').select('xp, level, total_exp').eq('id', user.id).single();

  if (profile) {
    let newXp = (profile.xp || 0) + xpReward;
    let newLevel = profile.level || 1;
    let newTotalXp = (profile.total_exp || 0) + xpReward; 

    if (newXp >= xpPerLevel.value) {
      newLevel += Math.floor(newXp / xpPerLevel.value);
      newXp = newXp % xpPerLevel.value;
      localStorage.setItem('justLeveledUp', 'true'); 
    }

    await supabase.from('profiles').update({ xp: newXp, level: newLevel, total_exp: newTotalXp }).eq('id', user.id);
      
    currentLevel.value = newLevel;
    currentXP.value = newXp;
    currentTotalXP.value = newTotalXp; 

    const { count: clearedCount } = await supabase.from('user_progress').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
    const currentStats = { clearedLevelsCount: clearedCount || 0, currentTotalXP: newTotalXp, currentLevel: newLevel };

    for (const badge of BADGE_LIST) {
      if (badge.checkUnlock(currentStats)) {
        await supabase.from('user_achievements').upsert({
          user_id: user.id, achievement_id: badge.id
        }, { onConflict: 'user_id, achievement_id', ignoreDuplicates: true });
      }
    }
  }

  showWinModal.value = true;
};

// 🌟 修正：負責判斷去哪裡抓資料
const loadLevelData = async () => {
  isLoading.value = true;
  if (props.courseId === 'python') {
    const localLevel = staticLevels.find(l => l.id === Number(props.levelId));
    if(localLevel) levelConfig.value = localLevel;
  } else if (props.courseId === 'javascript') {
    const { data, error } = await supabase.from('levels').select('*').eq('level_number', Number(props.levelId)).single();
    if (!error && data) {
      
      // 🌟 1. 安全解析 grid_size (防禦字串型態)
      let gridCols = 10;
      let gridRows = 10;
      try {
          const gs = typeof data.grid_size === 'string' ? JSON.parse(data.grid_size) : (data.grid_size || {});
          gridCols = Number(gs.cols) || 10;
          gridRows = Number(gs.rows) || 10;
      } catch(e) { console.warn("網格大小解析失敗"); }

      // 給予預設值 (避免設計器沒存到時，整個遊戲當機)
      let playerPos = { gridX: 0, gridY: 0, emoji: '🧙', label: '玩家' };
      let enemyPos = { gridX: gridCols - 1, gridY: gridRows - 1, emoji: '👾', label: data.enemy_name || '怪物' };
      let actualObstacles = [];

      // 🌟 2. 安全解析 obstacles
      let obsArray = [];
      try {
          obsArray = typeof data.obstacles === 'string' ? JSON.parse(data.obstacles) : (data.obstacles || []);
      } catch(e) { console.warn("障礙物解析失敗"); }

      if (Array.isArray(obsArray)) {
        obsArray.forEach(item => {
          // 確保就算有意外，座標也絕對是數字
          const itemX = Number(item.x);
          const itemY = Number(item.y);

          if (item.type === 'player') {
            if (!isNaN(itemX)) playerPos.gridX = itemX;
            if (!isNaN(itemY)) playerPos.gridY = itemY;
          } else if (item.type === 'enemy') {
            if (!isNaN(itemX)) enemyPos.gridX = itemX;
            if (!isNaN(itemY)) enemyPos.gridY = itemY;
          } else {
            // 剩下的都是石頭或岩漿
            actualObstacles.push({ ...item, x: itemX, y: itemY });
          }
        });
      }

      // 🌟 3. 防呆：如果你設計器其實把座標存在獨立欄位 (player_pos) 的話，優先吃這個
      if (data.player_pos) {
          try {
              const pp = typeof data.player_pos === 'string' ? JSON.parse(data.player_pos) : data.player_pos;
              if (pp.x !== undefined) playerPos.gridX = Number(pp.x);
              if (pp.y !== undefined) playerPos.gridY = Number(pp.y);
          } catch(e){}
      }
      if (data.enemy_pos) {
          try {
              const ep = typeof data.enemy_pos === 'string' ? JSON.parse(data.enemy_pos) : data.enemy_pos;
              if (ep.x !== undefined) enemyPos.gridX = Number(ep.x);
              if (ep.y !== undefined) enemyPos.gridY = Number(ep.y);
          } catch(e){}
      }

      // 🌟 4. 安全解析可用指令 (Blockly 編輯器才不會壞掉)
      let cmds = ['moveRight', 'attack'];
      try {
          cmds = typeof data.available_commands === 'string' ? JSON.parse(data.available_commands) : (data.available_commands || cmds);
      } catch(e){}

      // 最終拼裝
      levelConfig.value = {
        id: data.level_number,
        title: data.title,
        description: data.description,
        player: playerPos,
        enemy: enemyPos,
        obstacles: actualObstacles,
        availableCommands: cmds,
        grid_size: { cols: gridCols, rows: gridRows },
        restrictions: { maxBlocks: Number(data.max_blocks) || 20 }, 
        xpReward: 200 
      };
    } else {
      console.error('抓取關卡資料失敗:', error);
      alert('無法載入此關卡資料！');
    }
  }
  isLoading.value = false;
};

onMounted(async () => {
  enterTime.value = Date.now();
  window.addEventListener('level-win', onLevelWin);

  // 先拿玩家經驗值
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('xp, level, total_exp').eq('id', user.id).single();
    if (profile) {
      currentLevel.value = profile.level || 1;
      currentXP.value = profile.xp || 0;
      currentTotalXP.value = profile.total_exp || 0;
    }
  }
  
  // 1. 等待資料載入並結算
  await loadLevelData();

  // 🛑 2. 超級關鍵魔法：強迫 Vue 等到畫布 <div id="game-container"> 真正出現後，才往下走！
  await nextTick();

  // 3. 啟動 Phaser 遊戲
  const config = {
      type: Phaser.AUTO,
      parent: 'game-container',
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: 800, height: 800 },
      physics: { default: 'arcade', arcade: { gravity: { y: 0 } } },
      scene: [TeachingScene],
      backgroundColor: '#1e1e3f' 
  };
  game = new Phaser.Game(config);

  game.events.once('ready', () => {
      game.scene.start('TeachingScene', levelConfig.value);
  });
  
  setTimeout(() => { window.dispatchEvent(new Event('resize')); }, 100);
});

onUnmounted(() => {
  if (game) { game.destroy(true); game = null; }
  window.removeEventListener('level-win', onLevelWin);
});
</script>