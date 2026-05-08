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
        :attack="attack"  
        :coins="coins"
        :level="level"
        :xp="xp"
        :totalExp="totalExp"
        @stop="handleStopAndSave"
        @abandon="handleAbandonGame"
        @init-game="initPhaser"
        @execute="handleExecute"
        @update-stats="handleUpdateStats"
        @floor-cleared="handleNextFloor"
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
// 🌟 攻擊力狀態
const attack = ref(10); 
const maxAtk = ref(10); 

const coins = ref(0);
const level = ref(1);
const xp = ref(0);
const totalExp = ref(0);

/**
 * 🌟 處理進入關卡：
 * 如果是新局，data 會是大廳的基礎資料；
 * 如果是繼續，data 會是 tower_saves 的局內資料。
 */
const handleStart = async (data) => {
  if (data) {
    currentUserId.value = data.user_id;
    
    floor.value = data.current_floor || 1;
    hp.value = data.current_hp || data.max_hp || 100;
    maxHp.value = data.max_hp || 100;
    mp.value = data.current_mp || data.max_mp || 50;
    maxMp.value = data.max_mp || 50;
    ap.value = data.current_ap || data.max_ap || 10;
    maxAp.value = data.max_ap || 10;
    
    // 初始化攻擊力 (優先讀取局內 current_atk，沒有的話讀大廳 max_atk)
    attack.value = data.current_atk || data.max_atk || 10;
    maxAtk.value = data.max_atk || 10;
    
    coins.value = data.coins || 0;
    level.value = data.level || 1;
    xp.value = data.xp || 0;
    totalExp.value = data.total_exp || 0;
    
    // 進入時確保 Saves 表有一份最新的局內資料
    if (currentUserId.value) {
      await saveToTowerSaves();
    }
  }
  isGameStarted.value = true;
};

/**
 * 🌟 局內專用存檔 (只同步到 tower_saves)
 * 包含局內暫時提升的 HP、ATK 等
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
        current_atk: attack.value, // 存入局內當前攻擊力
        max_atk: maxAtk.value,     // 存入局內最大攻擊力基底
        coins: coins.value,
        level: level.value,
        xp: xp.value,
        total_exp: totalExp.value,
        updated_at: new Date()
        }, { onConflict: 'user_id' });
};

const handleNextFloor = async () => {
  console.log("🚀 [EndlessLevel] 準備進入下一層...");
  floor.value++;
  await saveToTowerSaves();
  
  if (game.value) {
    const scene = game.value.scene.getScene('EndlessScene');
    if (scene) {
      scene.scene.restart({ floor: floor.value });
    }
  }
};

const handleStopAndSave = () => {
  isGameStarted.value = false; 
  setTimeout(async () => {
    await saveToTowerSaves(); // 中斷時確保局內進度有存好
    if (game.value) {
      game.value.destroy(true);
      game.value = null;
    }
  }, 50);
};

/**
 * 🌟 終止連線/死亡結算
 * 邏輯：更新大廳的「最高樓層」、「金幣」、「經驗值」，但絕不覆蓋大廳的 HP/MP/ATK
 */
const handleAbandonGame = () => {
  isGameStarted.value = false; 
  setTimeout(async () => {
    if (!currentUserId.value) return;

    try {
      console.log("🏁 終止連線：結算局外資源，清空局內進度...");
      
      const { data: lobbyData } = await supabase
        .from('tower_lobby')
        .select('best_floor')
        .eq('user_id', currentUserId.value)
        .single();
        
      const oldBestFloor = lobbyData?.best_floor || 0;

      // 1. 更新大廳資料 (只更新通用資源與紀錄，不更新戰鬥數值)
      await supabase
        .from('tower_lobby')
        .update({
            coins: coins.value,           // 將局內獲得的金幣帶回大廳
            level: level.value,           // 角色等級帶回大廳
            xp: xp.value,               
            total_exp: totalExp.value,  
            best_floor: Math.max(oldBestFloor, floor.value), 
            updated_at: new Date()
        })
        .eq('user_id', currentUserId.value);

      // 2. 刪除局內存檔 (所有暫時加成包含火力強化、裝甲修復都會消失)
      await supabase
        .from('tower_saves')
        .delete()
        .eq('user_id', currentUserId.value);

      console.log("🗑️ 局內存檔 tower_saves 已刪除");

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

// 🌟 處理數值更新與升級邏輯
const handleUpdateStats = async (newStats) => {
  // 1. 更新最大值與攻擊力
  if (newStats.maxHp !== undefined) maxHp.value = newStats.maxHp;
  if (newStats.maxMp !== undefined) maxMp.value = newStats.maxMp;
  if (newStats.maxAp !== undefined) maxAp.value = newStats.maxAp;
  if (newStats.attack !== undefined) attack.value = newStats.attack;

  // 2. 更新當前值 (確保不超過上限)
  if (newStats.hp !== undefined) hp.value = Math.min(newStats.hp, maxHp.value);
  if (newStats.mp !== undefined) mp.value = Math.min(newStats.mp, maxMp.value);
  if (newStats.ap !== undefined) ap.value = Math.min(newStats.ap, maxAp.value);
  if (newStats.coins !== undefined) coins.value = newStats.coins;
  if (newStats.floor !== undefined) floor.value = newStats.floor;

  // 3. 處理經驗值與升級
  if (newStats.xp !== undefined) {
    xp.value = newStats.xp;
    
    // 升級邏輯：每級所需經驗為 level * 100
    while (xp.value >= level.value * 100) {
      xp.value -= level.value * 100; // 扣除升級所需的經驗
      level.value++;
      
      // 升級能力提升 (暫時性的，因為只存在局內變數中)
      maxHp.value += 10;
      hp.value = maxHp.value; 
      attack.value += 2;      
      
      console.log(`🆙 升級了！目前等級: ${level.value}，攻擊力提升至: ${attack.value}`);
    }
  }

  // 🌟 數值一有變化，立刻存入 tower_saves，防止玩家重新整理網頁洗數值
  await saveToTowerSaves();
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