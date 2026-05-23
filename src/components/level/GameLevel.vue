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
    :maxStars="levelConfig?.hearts || 3" 
    :isPreviewMode="isPreviewMode"
    :isLastLevel="isLastLevel"
    @next="handleNextLevel"
    @home="$emit('back')"
  />

  <LevelFailModal 
    v-if="showFailModal"
    :isPreviewMode="isPreviewMode"
    @restart="handleRestart"
    @home="$emit('back')"
  />
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch, nextTick } from 'vue';
import { supabase } from '../../supabase.js';
import { BADGE_LIST } from '../../game/config/badges.js';
import { levels as staticLevels } from '../../game/scenes/LevelConfig.js'; 
import Phaser from 'phaser';
import TeachingScene from '../../game/scenes/TeachingScene.js';
import CodeEditorPanel from './CodeEditorPanel.vue';
import LevelWinModal from './LevelWinModal.vue';
import LevelFailModal from './LevelFailModal.vue';

const props = defineProps({
  courseId: { type: String, required: true },
  levelId: { type: [String, Number], required: true },
  isPreviewMode: { type: Boolean, default: false }
});
const emit = defineEmits(['back', 'next-level']);

const isLevelCleared = ref(false);
const showWinModal = ref(false);
const isExecuting = ref(false);
const showFailModal = ref(false);
const isLoading = ref(true); 
const currentLine = ref(-1);
const currentLevel = ref(1);
const currentXP = ref(0);
const xpPerLevel = ref(1000);
const hp = ref(3);
const currentTotalXP = ref(0);
const enterTime = ref(0);
const levelConfig = ref({});
const isLastLevel = ref(false);

let game = null;

const executeCode = async (code, blockCount = 0) => {
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
            ${code}; 
            return scene.checkVictory(rawCode); 
          })();
        `;
        const run = new Function('scene', 'rawCode', asyncCode);
        const isSuccess = await run(phaserScene, code); 

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

const handleWin = () => {
  if (props.isPreviewMode) {
    showWinModal.value = true;
    return; 
  }
  const xpReward = levelConfig.value?.xpReward || 200; 
  currentXP.value += xpReward;
  currentTotalXP.value += xpReward;

  if (currentXP.value >= xpPerLevel.value) {
    currentLevel.value += Math.floor(currentXP.value / xpPerLevel.value);
    currentXP.value = currentXP.value % xpPerLevel.value;
    localStorage.setItem('justLeveledUp', 'true'); 
  }

  showWinModal.value = true;

  // 🌟 2. 背景資料庫結算 (Fire & Forget)：讓它在背後自己慢慢跑，不阻礙玩家視窗跳出
  (async () => {
      const leaveTime = Date.now();
      const timeSpentSeconds = Math.floor((leaveTime - enterTime.value) / 1000);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const safeCourseId = props.courseId || 'python';
      const levelId = levelConfig.value?.id || Number(props.levelId) || 0; 

      const { data: existingProgress } = await supabase.from('user_progress').select('id').eq('user_id', user.id).eq('course_id', safeCourseId).eq('level_id', levelId).maybeSingle(); 

      if (existingProgress) {
        await supabase.from('user_progress').update({ stars: hp.value, time_spent_seconds: timeSpentSeconds }).eq('id', existingProgress.id);
      } else {
        await supabase.from('user_progress').insert({ user_id: user.id, course_id: safeCourseId, level_id: levelId, stars: hp.value, time_spent_seconds: timeSpentSeconds });
      }

      await supabase.from('profiles').update({ xp: currentXP.value, level: currentLevel.value, total_exp: currentTotalXP.value }).eq('id', user.id);
        
      const { count: clearedCount } = await supabase.from('user_progress').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
      const currentStats = { clearedLevelsCount: clearedCount || 0, currentTotalXP: currentTotalXP.value, currentLevel: currentLevel.value };

      for (const badge of BADGE_LIST) {
        if (badge.checkUnlock(currentStats)) {
          await supabase.from('user_achievements').upsert({ user_id: user.id, achievement_id: badge.id }, { onConflict: 'user_id, achievement_id', ignoreDuplicates: true });
        }
      }
  })();
};

const handleNextLevel = () => {
  isLevelCleared.value = false;
  emit('next-level');
};

watch(hp, (newHp) => {
  if (newHp <= 0) {
    setTimeout(() => { showFailModal.value = true; }, 500);
  }
});

const handleRestart = () => {
  showFailModal.value = false;
  hp.value = levelConfig.value.hearts || 3; 
  enterTime.value = Date.now(); 
  if (game) {
    const scene = game.scene.getScene('TeachingScene');
    if (scene) scene.resetLevel();
  }
};

const clearCode = () => { currentLine.value = -1; };

const loadLevelData = async () => {
  isLoading.value = true;
  if (props.courseId === 'python') {
    const localLevel = staticLevels.find(l => l.id === Number(props.levelId));
    if(localLevel) levelConfig.value = localLevel;
  } else if (props.courseId === 'javascript') {
    const { data, error } = await supabase.from('levels').select('*').eq('level_number', Number(props.levelId)).single();
    if (!error && data) {
      
      let gridCols = 10, gridRows = 10;
      try {
          const gs = typeof data.grid_size === 'string' ? JSON.parse(data.grid_size) : (data.grid_size || {});
          gridCols = Number(gs.cols) || 10;
          gridRows = Number(gs.rows) || 10;
      } catch(e) {}

      let playerPos = { gridX: 0, gridY: 0, emoji: '🧙', label: '玩家' };
      let enemyPos = { gridX: gridCols - 1, gridY: gridRows - 1, emoji: '👾', label: data.enemy_name || '怪物' };
      let goalPos = null;
      let keyPos = null;
      let actualObstacles = [];

      let obsArray = [];
      try { obsArray = typeof data.obstacles === 'string' ? JSON.parse(data.obstacles) : (data.obstacles || []); } catch(e) {}

      if (Array.isArray(obsArray)) {
        obsArray.forEach(item => {
          const itemX = Number(item.x), itemY = Number(item.y);
          if (item.type === 'player') { playerPos.gridX = itemX; playerPos.gridY = itemY; }
          else if (item.type === 'enemy') { enemyPos.gridX = itemX; enemyPos.gridY = itemY; }
          else if (item.type === 'goal') { goalPos = { gridX: itemX, gridY: itemY, emoji: '🚪' }; }
          else if (item.type === 'key') { keyPos = { gridX: itemX, gridY: itemY, emoji: '🗝️' }; }
          else { actualObstacles.push({ ...item, x: itemX, y: itemY }); }
        });
      }

      let vCond = data.victory_condition;
      try { vCond = typeof vCond === 'string' ? JSON.parse(vCond) : vCond; } catch(e) {}
      if (!Array.isArray(vCond)) {
        if (vCond === 'key_and_goal') vCond = ['get_key', 'reach_goal'];
        else if (vCond) vCond = [vCond];
        else vCond = ['kill_enemy'];
      }

      let rCmd = data.required_command;
      try { rCmd = typeof rCmd === 'string' ? JSON.parse(rCmd) : rCmd; } catch(e) {}
      if (!Array.isArray(rCmd)) {
        rCmd = rCmd ? [rCmd] : [];
      }

      let cmds = ['moveRight', 'attack'];
      try { cmds = typeof data.available_commands === 'string' ? JSON.parse(data.available_commands) : (data.available_commands || cmds); } catch(e){}

      levelConfig.value = {
        id: data.level_number,
        title: data.title,
        description: data.description,
        player: playerPos,
        enemy: enemyPos,
        obstacles: actualObstacles,
        goal: goalPos,
        key: keyPos,  
        availableCommands: cmds,
        grid_size: { cols: gridCols, rows: gridRows },
        restrictions: { maxBlocks: Number(data.max_blocks) || 20 }, 
        hearts: Number(data.hearts) || 3,
        xpReward: Number(data.xp_reward) || 200, 
        victoryCondition: vCond, 
        requiredCommand: rCmd,   
      };

      hp.value = levelConfig.value.hearts;

      const { data: nextLevelData } = await supabase
        .from('levels')
        .select('id')
        .gt('level_number', Number(props.levelId))
        .limit(1);
      
      isLastLevel.value = (!nextLevelData || nextLevelData.length === 0);
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

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('xp, level, total_exp').eq('id', user.id).single();
    if (profile) {
      currentLevel.value = profile.level || 1;
      currentXP.value = profile.xp || 0;
      currentTotalXP.value = profile.total_exp || 0;
    }
  }
  
  await loadLevelData();
  await nextTick();

  game = new Phaser.Game({
      type: Phaser.AUTO, parent: 'game-container',
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: 800, height: 800 },
      physics: { default: 'arcade', arcade: { gravity: { y: 0 } } },
      scene: [TeachingScene], backgroundColor: '#1e1e3f' 
  });

  game.events.once('ready', () => game.scene.start('TeachingScene', levelConfig.value));
  setTimeout(() => { window.dispatchEvent(new Event('resize')); }, 100);
});

onUnmounted(() => {
  if (game) { game.destroy(true); game = null; }
  window.removeEventListener('level-win', onLevelWin);
});
</script>