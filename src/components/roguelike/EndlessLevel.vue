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
        :atk="atk"  
        :coins="coins"
        :level="level"
        :xp="xp"
        :totalExp="totalExp"
        :inventory="inventory"   @stop="handleStopAndSave"
        @abandon="handleAbandonGame"
        @init-game="initPhaser"
        @execute="handleExecute"
        @update-stats="handleUpdateStats"
        @floor-cleared="handleNextFloor"
        @update-inventory="handleUpdateInventory" />
    </transition>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../../supabase.js'; 
import Phaser from 'phaser';
import EndlessScene from '../../game/scenes/EndlessScene';
import TowerLobby from './TowerLobby.vue';
import TowerBattle from './TowerBattle.vue';

const router = useRouter();
const isGameStarted = ref(false);
const game = ref(null);

const currentUserId = ref(null);
const floor = ref(1);
const hp = ref(100);
const maxHp = ref(100);
const mp = ref(50);
const maxMp = ref(50);
const ap = ref(10);
const maxAp = ref(10);
const atk = ref(10); 
const maxAtk = ref(10); 
const coins = ref(0);
const level = ref(1);
const xp = ref(0);
const totalExp = ref(0);
const inventory = ref([]);

// 🌟 新增：存放當前地圖資料
const mapData = ref(null);

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
    
    atk.value = data.current_atk || data.max_atk || 10;
    maxAtk.value = data.max_atk || 10;
    
    coins.value = data.coins || 0;
    level.value = data.level || 1;
    xp.value = data.xp || 0;
    totalExp.value = data.total_exp || 0;
    inventory.value = data.inventory || [];
    // 🌟 讀取地圖資料 (如果有存檔的話)
    mapData.value = data.map_data || null;
    
    if (currentUserId.value) {
      await saveToTowerSaves();
    }
  }
  isGameStarted.value = true;
};

// 🌟 處理戰鬥中消耗道具的事件
const handleUpdateInventory = async (newInventory) => {
  inventory.value = newInventory;
  
  // 1. 更新當下這局的存檔
  await saveToTowerSaves();

  // 2. 立即同步回「大廳資料庫」，防止玩家中途跳GAME導致道具沒扣到
  if (currentUserId.value) {
    try {
      await supabase
        .from('tower_lobby')
        .update({ inventory: inventory.value })
        .eq('user_id', currentUserId.value);
    } catch (err) {
      console.error("同步大廳背包失敗", err);
    }
  }
};

const saveToTowerSaves = async () => {
  if (!currentUserId.value) return;
  
  // 🌟 存檔前，先向遊戲引擎索取最新的地圖狀態 (包含玩家走到哪了)
  let currentMapData = mapData.value;
  if (game.value) {
    const scene = game.value.scene.getScene('EndlessScene');
    if (scene && typeof scene.exportMapState === 'function') {
      try {
        currentMapData = scene.exportMapState();
        mapData.value = currentMapData; // 同步到 Vue 變數
      } catch (err) {
        console.warn("地圖資料匯出失敗", err);
      }
    }
  }

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
        current_atk: maxAtk.value, 
        max_atk: maxAtk.value,     
        coins: coins.value,
        level: level.value,
        xp: xp.value,
        total_exp: totalExp.value,
        map_data: currentMapData, // 🌟 寫入地圖 JSON
        inventory: inventory.value, // 🌟 寫入背包資料
        updated_at: new Date()
        }, { onConflict: 'user_id' });
};

const handleNextFloor = async () => {
  console.log("🚀 [EndlessLevel] 準備進入下一層...");
  floor.value++;
  
  // 🌟 進入下一層時，必須清除舊地圖，讓系統重新生成新地形
  mapData.value = null; 
  await saveToTowerSaves(); 
  
  if (game.value) {
    const scene = game.value.scene.getScene('EndlessScene');
    if (scene) {
      scene.scene.restart({ floor: floor.value, mapData: null });
    }
  }
};

const handleStopAndSave = () => {
  isGameStarted.value = false; 
  setTimeout(async () => {
    await saveToTowerSaves();
    if (game.value) {
      game.value.destroy(true);
      game.value = null;
    }
  }, 50);
};

const handleAbandonGame = () => {
  isGameStarted.value = false; 
  setTimeout(async () => {
    if (!currentUserId.value) return;

    try {
      const { data: lobbyData } = await supabase
        .from('tower_lobby')
        .select('best_floor')
        .eq('user_id', currentUserId.value)
        .single();
        
      const oldBestFloor = lobbyData?.best_floor || 0;

      await supabase
        .from('tower_lobby')
        .update({
            coins: coins.value,           
            level: level.value,           
            xp: xp.value,               
            total_exp: totalExp.value,  
            best_floor: Math.max(oldBestFloor, floor.value), 
            updated_at: new Date()
        })
        .eq('user_id', currentUserId.value);

      await supabase
        .from('tower_saves')
        .delete()
        .eq('user_id', currentUserId.value);

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

const handleUpdateStats = async (newStats) => {
  let isLeveledUp = false;

  // 更新本地變數
  if (newStats.maxHp !== undefined) maxHp.value = newStats.maxHp;
  if (newStats.maxMp !== undefined) maxMp.value = newStats.maxMp;
  if (newStats.maxAp !== undefined) maxAp.value = newStats.maxAp;
  if (newStats.atk !== undefined) atk.value = newStats.atk;
  if (newStats.hp !== undefined) hp.value = Math.min(newStats.hp, maxHp.value);
  if (newStats.mp !== undefined) mp.value = Math.min(newStats.mp, maxMp.value);
  if (newStats.ap !== undefined) ap.value = Math.min(newStats.ap, maxAp.value);
  if (newStats.coins !== undefined) coins.value = newStats.coins;
  if (newStats.floor !== undefined) floor.value = newStats.floor;

  // 處理經驗值與升級邏輯
  if (newStats.xp !== undefined) {
  xp.value = newStats.xp;
  let pointsGained = 0;
  
  while (xp.value >= level.value * 100) {
    xp.value -= level.value * 100; 
    level.value++;
    // 🌟 核心變更：不再自動加 HP/ATK，改為給予屬性點 (例如每級 5 點)
    pointsGained += 5;
  }

  if (pointsGained > 0) {
    // 更新本地顯示
    stat_points.value = (stat_points.value || 0) + pointsGained;
    
    // 同步到雲端，讓玩家在大廳可以分配
    await supabase.from('profiles').update({ 
      level: level.value, 
      xp: xp.value,
      stat_points: stat_points.value 
    }).eq('id', currentUserId.value);

    await supabase.from('tower_lobby').update({ 
      level: level.value, 
      xp: xp.value,
      stat_points: stat_points.value 
    }).eq('user_id', currentUserId.value);
  }
}

  // 1. 同步至當前戰鬥存檔 (tower_saves) - 確保重新整理後戰鬥狀態還在
  await saveToTowerSaves();

  // 2. 🌟 [關鍵同步] 如果有變動，同步至「外部大廳」與「高塔大廳」資料庫
  if (currentUserId.value) {
    try {
      // 同步更新「外部大廳」的全服等級 (profiles 表)
      await supabase
        .from('profiles')
        .update({
          level: level.value,
          xp: xp.value,
          total_exp: totalExp.value
        })
        .eq('id', currentUserId.value);

      // 同步更新「高塔大廳」的等級 (tower_lobby 表)
      await supabase
        .from('tower_lobby')
        .update({
          level: level.value,
          xp: xp.value,
          total_exp: totalExp.value,
          max_hp: maxHp.value,
          max_atk: atk.value,
          max_mp: maxMp.value,
          max_ap: maxAp.value
        })
        .eq('user_id', currentUserId.value);

      console.log(`[🔄 同步成功] 等級: ${level.value} 已同步至全服存檔`);
    } catch (err) {
      console.error('同步全服等級失敗:', err);
    }
  }
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

// 🌟 新增：讓 Phaser 剛啟動時可以跟 Vue 索取最新的地圖資料
const provideInitData = (e) => {
  e.detail.data = {
    floor: floor.value,
    mapData: mapData.value
  };
};

onMounted(() => {
  window.addEventListener('tower-request-init-data', provideInitData);
});

onUnmounted(() => {
  window.removeEventListener('tower-request-init-data', provideInitData);
});

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
.page-fade-enter-active, .page-fade-leave-active { transition: opacity 0.5s ease; }
.page-fade-enter-from, .page-leave-to { opacity: 0; }
</style>