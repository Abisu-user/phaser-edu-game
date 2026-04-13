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
const currentTotalXP = ref(0);

let game = null;

// 🌟 修改處：完全重構的 executeCode
// 接收 CodeEditorPanel 傳來的 Blockly 代碼字串與積木數量
const executeCode = async (code, blockCount = 0) => {
  // 1. 攔截積木數量限制
  const maxBlocks = props.levelConfig?.restrictions?.maxBlocks;
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

  // 延遲一點點確保場景重置完成
  setTimeout(async () => {
      try {
        // 使用 Async 封裝並執行
        const asyncCode = `
          return (async () => {
            // 執行 Blockly 產生的邏輯
            ${code}
            
            // 程式跑完後檢查是否勝利
            scene.checkVictory();

            // 回傳怪物是否已被擊敗 (alpha === 0)
            return scene.enemy.alpha === 0; 
          })();
        `;
        
        // 將 phaserScene 當作 scene 變數傳入腳本中執行
        const run = new Function('scene', asyncCode);
        const isSuccess = await run(phaserScene);

        // 如果跑完沒有勝利，就扣愛心
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
  if (game) {
    const scene = game.scene.getScene('TeachingScene');
    if (scene) scene.resetLevel();
  }
};

const clearCode = () => {
  currentLine.value = -1;
};

// 處理每日任務 (維持你原本的邏輯)
if (storedDaily.date === today) {
  const quests = storedDaily.quests;
  
  const passTask = quests.find(q => q.id === 'pass_levels');
  if (passTask && passTask.progress < passTask.target) passTask.progress += 1;
  
  const perfectTask = quests.find(q => q.id === 'perfect_clear');
  if (perfectTask && perfectTask.progress < perfectTask.target) perfectTask.progress += 1; 
  
  localStorage.setItem('code_quest_daily', JSON.stringify({ date: today, quests }));
}

// 寫入通關紀錄與經驗值
const handleWin = async () => {
  // 1. 取得使用者，並防範未登入狀態
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    console.warn('未登入或無法取得使用者狀態，僅顯示通關畫面不存檔。');
    showWinModal.value = true;
    return;
  }

  // 確保 ID 存在
  const safeCourseId = props.levelConfig?.courseId || 'python';
  const levelId = props.levelConfig?.id ? Number(props.levelConfig.id) : 0;
  
  // --- 2. 更新通關進度 (方法二：手動檢查是否存在) ---
  
  // 先查詢資料庫中是否已有該玩家對應該關卡的紀錄
  const { data: existingProgress, error: fetchError } = await supabase
    .from('user_progress')
    .select('id')
    .eq('user_id', user.id)
    .eq('level_id', levelId) 
    .maybeSingle(); 

  let progressError = null;

  if (existingProgress) {
    // A. 如果紀錄已存在 -> 執行 Update (更新星星數)
    const { error } = await supabase
      .from('user_progress')
      .update({ 
        stars: hp.value, 
        course_id: safeCourseId 
      })
      .eq('id', existingProgress.id);
    progressError = error;
  } else {
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('查詢進度時發生非預期錯誤:', fetchError);
    }
    
    const { error } = await supabase
      .from('user_progress')
      .insert({ 
        user_id: user.id, 
        course_id: safeCourseId, 
        level_id: levelId, 
        stars: hp.value 
      });
    progressError = error;
  }

  // 檢查進度存檔結果
  if (progressError) {
    console.error('存檔過程發生錯誤:', progressError);
    return alert('存檔失敗：' + progressError.message);
  }

  // --- 3. 更新玩家經驗值與等級 (保持原邏輯) ---
  const xpReward = props.levelConfig?.xpReward || 100;
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('xp, level, total_exp') 
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('取得玩家資料失敗:', profileError);
  }

  if (profile) {
    let newXp = (profile.xp || 0) + xpReward;
    let newLevel = profile.level || 1;
    let newTotalXp = (profile.total_exp || 0) + xpReward; 

    if (newXp >= xpPerLevel.value) {
      newLevel += Math.floor(newXp / xpPerLevel.value);
      newXp = newXp % xpPerLevel.value;
      localStorage.setItem('justLeveledUp', 'true'); 
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ xp: newXp, level: newLevel, total_exp: newTotalXp })
      .eq('id', user.id);
      
    if (updateError) {
       console.error('更新經驗值失敗:', updateError);
    } else {
       currentLevel.value = newLevel;
       currentXP.value = newXp;
       currentTotalXP.value = newTotalXp; 
    }
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
      .select('xp, level, total_exp')
      .eq('id', user.id)
      .single();
      
    if (profile) {
      currentLevel.value = profile.level || 1;
      currentXP.value = profile.xp || 0;
      currentTotalXP.value = profile.total_exp || 0;
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