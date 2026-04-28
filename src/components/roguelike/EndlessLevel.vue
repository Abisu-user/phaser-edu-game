<template>
  <div class="endless-wrapper h-screen w-screen overflow-hidden bg-black">
    <transition name="page-fade" mode="out-in">
      <TowerLobby 
        v-if="!isGameStarted" 
        @start="handleStart" 
        @exit="handleExit" 
      />

      <TowerBattle 
        v-else 
        :floor="floor" 
        :hp="hp" 
        :maxHp="maxHp" 
        :mp="mp"
        :maxMp="maxMp"
        :ap="ap"
        :maxAp="maxAp"
        :coins="coins"
        :level="level"
        :xp="xp"
        :totalExp="totalExp"
        @stop="handleStopAndSave"
        @abandon="handleAbandonGame"
        @init-game="initPhaser"
        @execute="handleExecute"
        @update-stats="handleUpdateStats"
      />
    </transition>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../../supabase.js'; 
import Phaser from 'phaser';
import EndlessScene from '../../game/scenes/EndlessScene';
import TowerLobby from './TowerLobby.vue';
import TowerBattle from './TowerBattle.vue';

const router = useRouter();
const isGameStarted = ref(false);
const game = ref(null);

// === 遊戲即時狀態變數 ===
const currentUserId = ref(null);

const floor = ref(1);
const hp = ref(100);
const maxHp = ref(100);
const mp = ref(50);
const maxMp = ref(50);
const ap = ref(10);
const maxAp = ref(10);
const coins = ref(0);
const level = ref(1);
const xp = ref(0);
const totalExp = ref(0);

/**
 * 處理進入關卡：從 Lobby 抓資料並同步到 tower_saves
 */
const handleStart = async (data) => {
  if (data) {
    currentUserId.value = data.user_id;
    floor.value = data.current_floor || 1;
    hp.value = data.current_hp || 100;
    maxHp.value = data.max_hp || 100;
    mp.value = data.current_mp || 50;
    maxMp.value = data.max_mp || 50;
    ap.value = data.current_ap || 10;
    maxAp.value = data.max_ap || 10;
    coins.value = data.coins || 0;
    level.value = data.level || 1;
    xp.value = data.xp || 0;
    totalExp.value = data.total_exp || 0;
    // 進入時確保 Saves 表有這筆資料
    if (currentUserId.value) {
      await supabase
        .from('tower_saves')
        .upsert({
          user_id: currentUserId.value,
          current_floor: floor.value,
          current_hp: hp.value,
          max_hp: maxHp.value,
          current_mp: mp.value,
          max_mp: maxMp.value,
          current_ap: ap.value,
          max_ap: maxAp.value,
          coins: coins.value,
          level: level.value,
          xp: xp.value,
          total_exp: totalExp.value,
          updated_at: new Date()
        }, { onConflict: 'user_id' });
    }
  }
  isGameStarted.value = true;
};

/**
 * 通用的即時存檔功能 (僅寫入 tower_saves)
 */
const saveToTowerSaves = async () => {
  if (!currentUserId.value) return;
  console.log("💾 正在同步當前進度至 tower_saves...");
  
  await supabase
    .from('tower_saves')
    .upsert({
        user_id: currentUserId.value,
        current_floor: floor.value,
        current_hp: hp.value,
        max_hp: maxHp.value,
        current_mp: mp.value,
        max_mp: maxMp.value,
        current_ap: ap.value,
        max_ap: maxAp.value,
        coins: coins.value,
        level: level.value,
        xp: xp.value,
        total_exp: totalExp.value,
        updated_at: new Date()
        }, { onConflict: 'user_id' });
};

/**
 * 1. 🌟 暫時中斷 (儲存並退出)
 * 邏輯：存進 tower_saves，保留存檔，回大廳
 */
const handleStopAndSave = () => {
  isGameStarted.value = false; // 立即切換 UI

  setTimeout(async () => {
    // 執行即時存檔，確保進度被保留在 tower_saves
    await saveToTowerSaves();
    console.log("⏸️ 已暫時中斷，進度已保留在 tower_saves");

    // 關閉遊戲引擎
    if (game.value) {
      game.value.destroy(true);
      game.value = null;
    }
  }, 50);
};

const handleAbandonGame = () => {
  isGameStarted.value = false; // 立即切換 UI

  setTimeout(async () => {
    if (!currentUserId.value) return;

    try {
      console.log("🏁 終止連線：執行結算流程...");

      // A. 將當前資料覆蓋回大廳 (包含金幣、血量上限、最高樓層等)
      // 注意：這裡假設你想要「覆蓋」，若是累加金幣請自行修改邏輯
      const { data: lobbyData } = await supabase
        .from('tower_lobby')
        .select('best_floor')
        .eq('user_id', currentUserId.value)
        .single();
        
      const oldBestFloor = lobbyData?.best_floor || 0;

      await supabase
        .from('tower_lobby')
        .upsert({
            user_id: currentUserId.value,
            coins: coins.value,                              // 覆寫金幣
            max_hp: maxHp.value,                             // 覆寫血量上限
            max_mp: maxMp.value,                             // 覆寫魔力上限
            max_ap: maxAp.value,                             // 覆寫行動力上限
            best_floor: Math.max(oldBestFloor, floor.value),   // 更新最高樓層
            level: level.value,                              // 更新等級
            xp: xp.value,                                  // 更新經驗值
            total_exp: totalExp.value,                     // 更新總經驗值
            updated_at: new Date()
            }, { onConflict: 'user_id' });

      console.log("✅ 資料已同步回 tower_lobby");

      // B. 刪除本次的暫存檔
      await supabase
        .from('tower_saves')
        .delete()
        .eq('user_id', currentUserId.value);

      console.log("🗑️ 已清空 tower_saves，下次進入將是全新開局");

    } catch (err) {
      console.error("❌ 結算失敗:", err);
    } finally {
      if (game.value) {
        game.value.destroy(true);
        game.value = null;
      }
    }
  }, 50);
};

const handleUpdateStats = (newStats) => {
  if (newStats.hp !== undefined) hp.value = newStats.hp;
  if (newStats.mp !== undefined) mp.value = newStats.mp;
  if (newStats.ap !== undefined) ap.value = newStats.ap;
  if (newStats.coins !== undefined) coins.value = newStats.coins;
  if (newStats.floor !== undefined) floor.value = newStats.floor;
};

const handleExit = () => {
  router.push('/dashboard');
};

const handleExecute = (commandIds) => {
  if (game.value) {
    const currentScene = game.value.scene.getScene('EndlessScene');
    if (currentScene) {
      currentScene.events.emit('PLAYER_EXECUTE', commandIds);
    }
  }
};

const initPhaser = async () => {
  await nextTick();
  if (game.value) game.value.destroy(true);

  const config = {
    type: Phaser.AUTO,
    parent: 'endless-game-container',
    width: '100%',
    height: '100%',
    transparent: true,
    physics: {
      default: 'arcade',
      arcade: { debug: false }
    },
    scene: [EndlessScene]
  };
  game.value = new Phaser.Game(config);
};
</script>

<style>
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.5s ease;
}
.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}
</style>