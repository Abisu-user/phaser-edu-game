<template>
  <div id="game-screen" class="h-full w-full flex flex-col overflow-hidden relative" style="background: linear-gradient(135deg, #0a0e27 0%, #1a1a3e 50%, #0f1428 100%);">
      
    <div v-if="showTutorial" class="absolute inset-0 z-[200] flex items-center justify-center bg-[#0a0e27]/90 backdrop-blur-sm p-4">
      <div class="bg-[#1e1e2e] border border-[#ffbb33] p-8 rounded-2xl max-w-lg w-full shadow-[0_0_50px_rgba(255,187,51,0.15)] text-center animate-slide-up relative overflow-hidden">
        
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-[#ffbb33] opacity-10 blur-[50px] pointer-events-none"></div>

        <div class="text-6xl mb-4 relative z-10 drop-shadow-lg">🧙‍♂️</div>
        <h2 class="text-2xl font-black text-[#ffbb33] mb-4 tracking-wider relative z-10">魔法導師傳授</h2>
        
        <div class="bg-[#0a0e27]/50 rounded-xl p-5 mb-8 border border-[#ffbb33]/20 relative z-10">
          <div class="text-white text-[15px] leading-relaxed font-medium" 
               v-html="levelConfig.tutorial?.message || '準備好迎接新的挑戰了嗎？'">
          </div>
        </div>
        
        <button @click="closeTutorial" class="w-full py-4 bg-gradient-to-r from-[#ffbb33] to-[#ff8800] text-[#0a0e27] font-black text-lg rounded-xl shadow-[0_0_20px_rgba(255,187,51,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all relative z-10">
          我準備好了！ 🚀
        </button>
      </div>
    </div>

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
          
          <div v-if="levelConfig.title" class="absolute top-6 left-6 z-10 flex flex-col gap-3 pointer-events-none">
            
            <div class="bg-[#0a0e27]/85 backdrop-blur-md border border-white/10 p-3.5 rounded-xl shadow-lg transition-all duration-300">
              <h3 class="font-bold text-sm mb-2 flex items-center gap-1.5 drop-shadow-md transition-colors"
                  :class="isLevelCleared ? 'text-[#00d4aa]' : 'text-[#ffbb33]'">
                <span class="text-base">🎯</span> 通關目標
              </h3>
              <ul class="text-xs space-y-2 pl-1 font-medium tracking-wide">
                <li v-for="(cond, i) in parsedVictoryConditions" :key="'vc-'+i" 
                    class="flex items-center gap-2 transition-all duration-500"
                    :class="cond.isCompleted ? 'text-[#00d4aa] scale-105' : 'text-white/80'">
                  <span v-if="cond.isCompleted" class="animate-bounce">✅</span>
                  <span v-else class="w-1.5 h-1.5 rounded-full bg-[#ffbb33] shadow-[0_0_5px_#ffbb33]"></span>
                  <span :class="{'line-through opacity-70': cond.isCompleted}">{{ cond.text }}</span>
                </li>
              </ul>
            </div>

            <div v-if="parsedRequiredCommands && parsedRequiredCommands.length > 0" 
                 class="bg-[#2a0808]/85 backdrop-blur-md border border-[#ff6b6b]/30 p-3.5 rounded-xl shadow-lg transition-all duration-300"
                 :class="{'border-[#00d4aa]/50 bg-[#0a1f18]/85': parsedRequiredCommands.every(r => r.isCompleted)}">
              <h3 class="font-bold text-sm mb-2 flex items-center gap-1.5 drop-shadow-md transition-colors"
                  :class="parsedRequiredCommands.every(r => r.isCompleted) ? 'text-[#00d4aa]' : 'text-[#ff6b6b]'">
                <span class="text-base">{{ parsedRequiredCommands.every(r => r.isCompleted) ? '✅' : '⚠️' }}</span> 額外條件
              </h3>
              <ul class="text-xs space-y-2 pl-1 font-medium tracking-wide">
                <li v-for="(req, i) in parsedRequiredCommands" :key="'req-'+i" 
                    class="flex items-center gap-2 transition-all duration-500"
                    :class="req.isCompleted ? 'text-[#00d4aa] scale-105' : 'text-white/80'">
                  <span v-if="req.isCompleted" class="animate-bounce">✅</span>
                  <span v-else class="w-1.5 h-1.5 rounded-full bg-[#ff6b6b] shadow-[0_0_5px_#ff6b6b]"></span>
                  <span :class="{'line-through opacity-70': req.isCompleted}">{{ req.text }}</span>
                </li>
              </ul>
            </div>

          </div>

          <div id="game-container" class="w-full h-full flex items-center justify-center rounded-xl overflow-hidden shadow-2xl"></div>
          
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
    :xpReward="actualXpGained"
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
import { onMounted, onUnmounted, ref, watch, nextTick, computed } from 'vue';
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
const xpPerLevel = ref(1000); // 預設值，在 onMounted 中會動態計算
const hp = ref(3);
const currentTotalXP = ref(0);
const enterTime = ref(0);
const levelConfig = ref({});
const isLastLevel = ref(false);

const isFirstTimeClear = ref(true);
const actualXpGained = ref(0);
const achievedCommands = ref([]);

const showTutorial = ref(false);

let game = null;

// 🌟 新增：計算某個等級升級需要多少經驗值 (1級1000, 2級1500, 3級2000...)
const getRequiredExpForLevel = (level) => {
  return 1000 + (level - 1) * 500; 
};

const parsedVictoryConditions = computed(() => {
  let conds = levelConfig.value?.victoryCondition;
  if (!conds || conds.length === 0) conds = ['kill_enemy'];
  
  return conds.map(cond => {
    let text = '';
    switch(cond) {
      case 'kill_enemy': text = '擊敗敵人 👾'; break;
      case 'reach_goal': text = '抵達終點門 🚪'; break;
      case 'get_key': text = '取得鑰匙 🗝️'; break;
      default: text = '完成挑戰';
    }
    return {
      id: cond,
      text: text,
      isCompleted: isLevelCleared.value
    };
  });
});

const parsedRequiredCommands = computed(() => {
  if (!levelConfig.value?.requiredCommand) return [];
  
  const normalizedCommands = levelConfig.value.requiredCommand.map(cmd => {
    if (cmd === 'for') return 'for_loop';
    if (cmd === 'while') return 'while_loop';
    if (cmd === 'if') return 'if_else';
    return cmd;
  });

  const uniqueCommands = [...new Set(normalizedCommands)];
  
  return uniqueCommands.map(cmd => {
    let text = '';
    switch(cmd) {
      case 'for_loop': text = '必須使用 for 迴圈 🔁'; break;
      case 'while_loop': text = '必須使用 while 迴圈 🔁'; break;
      case 'if_else': text = '必須使用 if 判斷式 🔀'; break;
      case 'function': text = '必須使用函式 (function) 🔧'; break;
      case 'isWall': text = '必須使用 isWall() 雷達 🧱'; break;
      case 'isEnemy': text = '必須使用 isEnemy() 雷達 🎯'; break;
      case 'variable': text = '必須使用自訂變數 📦'; break;
      default: text = `必須使用 ${cmd} 積木`;
    }
    return {
      id: cmd,
      text: text,
      isCompleted: achievedCommands.value.includes(cmd) 
    };
  });
});

const closeTutorial = () => {
  showTutorial.value = false;
};

const executeCode = async (code, blockCount = 0, rawUserCode = '') => {
  const checkCode = rawUserCode || code; 
  
  const maxBlocks = levelConfig.value?.restrictions?.maxBlocks;
  if (maxBlocks && blockCount > maxBlocks) {
    alert(`⚠️ 魔法能量不足！這關最多只能使用 ${maxBlocks} 個積木，但你使用了 ${blockCount} 個。\n請嘗試使用迴圈來優化！`);
    return;
  }

  const currentAchieved = [];
  const reqCmds = levelConfig.value?.requiredCommand || [];
  
  if (reqCmds.includes('for_loop') && /\bfor\b/.test(checkCode)) currentAchieved.push('for_loop');
  if (reqCmds.includes('while_loop') && /\bwhile\b/.test(checkCode)) currentAchieved.push('while_loop');
  if (reqCmds.includes('if_else') && /\bif\b/.test(checkCode)) currentAchieved.push('if_else');
  if (reqCmds.includes('function') && /\bfunction\b/.test(checkCode)) currentAchieved.push('function');
  if (reqCmds.includes('isWall') && /\bisWall\b/.test(checkCode)) currentAchieved.push('isWall');
  if (reqCmds.includes('isEnemy') && /\bisEnemy\b/.test(checkCode)) currentAchieved.push('isEnemy');
  if (reqCmds.includes('variable') && /\b(let|const|var)\b/.test(checkCode)) currentAchieved.push('variable');
  if (reqCmds.includes('shoot') && /\bshoot\b/.test(checkCode)) currentAchieved.push('shoot');
  
  achievedCommands.value = currentAchieved; 
  isLevelCleared.value = false;

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
        const isSuccess = await run(phaserScene, checkCode); 

        if (!isSuccess) {
           hp.value = Math.max(0, hp.value - 1);
           phaserScene.resetLevel(false);
        }

      } catch (error) {
        if (error?.message === 'LEVEL_FAILED') {
           hp.value = Math.max(0, hp.value - 1);
           phaserScene.resetLevel(false); 
        } else {
           console.error("執行過程中出現魔法錯誤:", error);
           alert("執行失敗！請檢查積木是否有拼錯。");
        }
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

  actualXpGained.value = isFirstTimeClear.value ? (levelConfig.value?.xpReward || 200) : 0;

  if (isFirstTimeClear.value) {
    currentXP.value += actualXpGained.value;
    currentTotalXP.value += actualXpGained.value;

    let leveledUp = false;

    // 🌟 核心修復：使用 while 迴圈處理升級 (支援一次獲得大量 XP 連升好幾級的情況)
    while (currentXP.value >= xpPerLevel.value) {
      currentXP.value -= xpPerLevel.value; // 扣除升級消耗的經驗值
      currentLevel.value += 1;             // 等級提升
      xpPerLevel.value = getRequiredExpForLevel(currentLevel.value); // 重新計算下一級的經驗值上限
      leveledUp = true;
    }

    if (leveledUp) {
      localStorage.setItem('justLeveledUp', 'true'); 
    }
  }

  showWinModal.value = true;

  (async () => {
      const leaveTime = Date.now();
      const timeSpentSeconds = Math.floor((leaveTime - enterTime.value) / 1000);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const safeCourseId = props.courseId || 'python';
      const levelId = levelConfig.value?.id || Number(props.levelId) || 0; 

      if (!isFirstTimeClear.value) {
        const { data: existingProgress } = await supabase.from('user_progress').select('id, stars').eq('user_id', user.id).eq('course_id', safeCourseId).eq('level_id', levelId).maybeSingle();
        if (existingProgress) {
          const newStars = Math.max(existingProgress.stars || 0, hp.value);
          await supabase.from('user_progress').update({ stars: newStars, time_spent_seconds: timeSpentSeconds }).eq('id', existingProgress.id);
        }
      } else {
        await supabase.from('user_progress').insert({ user_id: user.id, course_id: safeCourseId, level_id: levelId, stars: hp.value, time_spent_seconds: timeSpentSeconds });
        await supabase.from('profiles').update({ xp: currentXP.value, level: currentLevel.value, total_exp: currentTotalXP.value }).eq('id', user.id);
      }
        
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
  achievedCommands.value = []; 
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
  achievedCommands.value = []; 
  isLevelCleared.value = false;
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
    const currentIndex = staticLevels.findIndex(l => l.id === Number(props.levelId));
    isLastLevel.value = (currentIndex === staticLevels.length - 1);
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

      rCmd = rCmd.map(cmd => {
      if (cmd === 'for') return 'for_loop';
      if (cmd === 'while') return 'while_loop';
      if (cmd === 'if') return 'if_else';
      return cmd;
      });
      rCmd = [...new Set(rCmd)]; 

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

  if (levelConfig.value?.tutorial) {
    showTutorial.value = true;
  }
};

onMounted(async () => {
  enterTime.value = Date.now();
  window.addEventListener('level-win', onLevelWin);

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const [profileRes, progressRes] = await Promise.all([
      supabase.from('profiles').select('xp, level, total_exp').eq('id', user.id).single(),
      supabase.from('user_progress').select('id').eq('user_id', user.id).eq('course_id', props.courseId).eq('level_id', Number(props.levelId)).maybeSingle()
    ]);

    if (profileRes.data) {
      currentLevel.value = profileRes.data.level || 1;
      currentXP.value = profileRes.data.xp || 0;
      currentTotalXP.value = profileRes.data.total_exp || 0;
      
      // 🌟 新增：根據玩家目前的等級，設定正確的經驗值上限
      xpPerLevel.value = getRequiredExpForLevel(currentLevel.value);
    }

    isFirstTimeClear.value = !progressRes.data; 
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

<style scoped>
.animate-slide-up {
  animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
</style>