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

      <CodeEditorPanel 
        :levelConfig="levelConfig"
        :isExecuting="isExecuting"
        :currentLine="currentLine"
        @execute="runCode"
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
    :stars="hp"  @next="handleNextLevel"
    @home="$emit('back')"
  />

  <LevelFailModal 
    v-if="showFailModal"
    @restart="handleRestart"
    @home="$emit('back')"
  />
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { supabase } from '../../supabase.js';
import Phaser from 'phaser';
import TeachingScene from '../../game/scenes/TeachingScene.js';
import CodeEditorPanel from './CodeEditorPanel.vue';
import LevelWinModal from './LevelWinModal.vue';
import LevelFailModal from './LevelFailModal.vue';

const props = defineProps({
  levelConfig: { type: Object, required: true }
});
const emit = defineEmits(['back', 'next-level']);

const isLevelCleared = ref(false);
const showWinModal = ref(false);
const isExecuting = ref(false);
const showFailModal = ref(false);
const currentLine = ref(-1);
const currentLevel = ref(1);
const currentXP = ref(0);
const xpPerLevel = ref(1000);
const hp = ref(3);
const today = new Date().toISOString().split('T')[0];
const storedDaily = JSON.parse(localStorage.getItem('code_quest_daily') || '{}');

let game = null;

const onLevelWin = () => {
  isLevelCleared.value = true;
};

const handleNextLevel = () => {
  isLevelCleared.value = false;
  emit('next-level');
};

watch(hp, (newHp) => {
  if (newHp <= 0) {
    // 延遲一點點顯示，讓玩家看清楚最後一顆心消失的動畫
    setTimeout(() => {
      showFailModal.value = true;
    }, 500);
  }
});

const handleRestart = () => {
  showFailModal.value = false;
  hp.value = 3;
  window.dispatchEvent(new CustomEvent('reset-game'));
};

const retryLevel = () => {
  isLevelCleared.value = false;
  if (game) {
    const scene = game.scene.getScene('TeachingScene');
    if (scene) scene.resetLevel();
  }
};

const clearCode = () => {
  currentLine.value = -1;
};

// 處理來自編輯器的程式碼執行請求
const runCode = (code) => {
  const scene = game.scene.getScene('TeachingScene');
  scene.resetLevel();
  currentLine.value = -1;
  
  let callCount = {};
  let linesByFn = {};

  code.split('\n').forEach((l, i) => {
    let m = l.match(/^\s*(moveRight|moveLeft|moveUp|moveDown|attack)\s*\(/);
    if (m) { (linesByFn[m[1]] = linesByFn[m[1]] || []).push(i); }
  });

  const makeCmd = (type, fn) => () => {
    callCount[fn] = callCount[fn] || 0;
    scene.addCommand(type, linesByFn[fn]?.[callCount[fn]++] ?? -1);
  };

  try {
    new Function('moveRight','moveLeft','moveUp','moveDown','attack','repeat', code)(
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
        if (isSuccess) {
          handleWin();
        } else {
          hp.value = Math.max(0, hp.value - 1);
        }
      }
    );
  } catch (error) {
    console.error('程式碼語法錯誤：', error);
    isExecuting.value = false;
    alert('執行失敗！請檢查是否漏打括號或分號。');
  }
};

if (storedDaily.date === today) {
  const quests = storedDaily.quests;
  
  // 1. 更新「通過 3 個新關卡」任務
  const passTask = quests.find(q => q.id === 'pass_levels');
  if (passTask && passTask.progress < passTask.target) {
    passTask.progress += 1;
  }
  
  // 2. 更新「完美通關」任務 (假設我們通關就是 3 顆星)
  const perfectTask = quests.find(q => q.id === 'perfect_clear');
  // 假設你未來有星星系統，這裡可以判斷 stars === 3
  if (perfectTask && perfectTask.progress < perfectTask.target) {
    perfectTask.progress += 1; 
  }
  
  localStorage.setItem('code_quest_daily', JSON.stringify({ date: today, quests }));
}

const handleWin = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  const safeCourseId = props.levelConfig?.courseId || 'python';
  
  // 寫入通關紀錄
  const { error } = await supabase
    .from('user_progress')
    .upsert({ 
      user_id: user.id, 
      course_id: safeCourseId, 
      level_id: props.levelConfig.id, 
      stars: hp.value 
    });

  if (error) return alert('存檔失敗：' + error.message);

  const xpReward = props.levelConfig?.xpReward || 100;
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('xp, level')
    .eq('id', user.id)
    .single();

  if (profile) {
    let newXp = (profile.xp || 0) + xpReward;
    let newLevel = profile.level || 1;

    if (newXp >= xpPerLevel.value) {
      newLevel += Math.floor(newXp / xpPerLevel.value);
      newXp = newXp % xpPerLevel.value;
      localStorage.setItem('justLeveledUp', 'true'); 
    }

    // 更新到資料庫
    await supabase
      .from('profiles')
      .update({ xp: newXp, level: newLevel })
      .eq('id', user.id);
      
    // 🌟 關鍵：將最新結算完的等級與 XP 更新給畫面的變數，讓 Modal 顯示最新進度！
    currentLevel.value = newLevel;
    currentXP.value = newXp;
  }

  showWinModal.value = true;
};

onMounted( async() => {
  window.addEventListener('level-win', onLevelWin);
  const config = {
      type: Phaser.AUTO,
      parent: 'game-container',
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: 800, height: 800 },
      physics: { default: 'arcade', arcade: { gravity: { y: 0 } } },
      scene: [TeachingScene],
      backgroundColor: '#1e1e3f' 
  };

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('xp, level')
      .eq('id', user.id)
      .single();
      
    if (profile) {
      currentLevel.value = profile.level || 1;
      currentXP.value = profile.xp || 0;
    }
  }
  
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
</script>