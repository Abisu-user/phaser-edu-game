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
        :attack="atk"  
        :coins="coins"
        :level="level"
        :xp="xp"
        :totalExp="totalExp"
        :inventory="inventory"   
        @stop="handleStopAndSave"
        @abandon="handleAbandonGame"
        @init-game="initPhaser"
        @execute="handleExecute"
        @update-stats="handleUpdateStats"
        @floor-cleared="handleNextFloor"
        @update-inventory="handleUpdateInventory" 
      />
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

// 🌟 修正 1：補上遺漏的 stat_points 宣告，避免升級時報錯崩潰！
const stat_points = ref(0); 

// 存放當前地圖資料
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
    stat_points.value = data.stat_points || 0;
    
    mapData.value = data.map_data || null;
    
    if (currentUserId.value) {
      await saveToTowerSaves();
    }
  }
  isGameStarted.value = true;
};

const handleUpdateInventory = async (newInventory) => {
  inventory.value = newInventory;
  
  await saveToTowerSaves();

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
  
  let currentMapData = mapData.value;
  if (game.value) {
    const scene = game.value.scene.getScene('EndlessScene');
    if (scene && typeof scene.exportMapState === 'function') {
      try {
        currentMapData = scene.exportMapState();
        mapData.value = currentMapData; 
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
        
        // 🌟 修正：把欄位名稱加回 current_ 前綴，對齊你的資料庫！
        current_floor: floor.value, 
        current_hp: hp.value,
        max_hp: maxHp.value,
        current_mp: mp.value,
        max_mp: maxMp.value,
        current_ap: ap.value,
        max_ap: maxAp.value,
        current_atk: atk.value,  
        max_atk: maxAtk.value,     
        
        coins: coins.value,
        level: level.value,
        xp: xp.value,
        total_exp: totalExp.value,
        map_data: currentMapData,
        inventory: inventory.value, 
        updated_at: new Date()
    }, { onConflict: 'user_id' }); // 確保衝突時更新
};

const handleNextFloor = async () => {
  console.log("🚀 [EndlessLevel] 準備進入下一層...");
  floor.value++;
  
  mapData.value = null; 
  await saveToTowerSaves(); 
  
  if (game.value) {
    const scene = game.value.scene.getScene('EndlessScene');
    if (scene) {
      scene.scene.restart({ floor: floor.value, mapData: null });
    }
  }
};

const handleStopAndSave = async () => {
  console.log("💾 [暫時中斷] 正在打包所有戰局資料存入 tower_saves...");

  let currentMapState = null;
  if (game.value) {
    const currentScene = game.value.scene.getScene('EndlessScene');
    if (currentScene) {
      currentMapState = currentScene.exportMapState();
    }
  }

  let lobbyDataToRestore = null;

  try {
    if (currentUserId.value) {
      const { data: lobbyData } = await supabase
        .from('tower_lobby')
        .select('*')
        .eq('user_id', currentUserId.value)
        .single();
      
      lobbyDataToRestore = lobbyData;

      await supabase
        .from('tower_saves')
        .upsert({
          user_id: currentUserId.value,
          
          // 🌟 修正：把欄位名稱加回 current_ 前綴！
          current_floor: floor.value,
          map_data: currentMapState,
          inventory: inventory.value,
          coins: coins.value,
          current_hp: hp.value,
          max_hp: maxHp.value,
          current_mp: mp.value,
          max_mp: maxMp.value,
          current_ap: ap.value,
          max_ap: maxAp.value,
          current_atk: atk.value
          
        }, { onConflict: 'user_id' }); // 🌟 補上這個設定，確保如果已有存檔會直接覆蓋
      
      console.log("✅ [tower_saves] 局內資料已安全暫存。");
    }
  } catch (err) {
    console.error("❌ 暫時中斷存檔失敗:", err);
  }

  isGameStarted.value = false;
  resetLocalStatsToDefault(lobbyDataToRestore);
};

const handleAbandonGame = async () => {
  console.log("💀 [終結連線] 開始結算永久資源，並格式化戰局...");

  try {
    if (currentUserId.value) {
      const { data: lobbyData } = await supabase
        .from('tower_lobby') 
        .select('*')
        .eq('user_id', currentUserId.value)
        .single();

      const oldBestFloor = lobbyData?.best_floor || 1;
      const newBestFloor = floor.value > oldBestFloor ? floor.value : oldBestFloor;
      const totalCoins = (lobbyData?.coins || 0) + coins.value;
      const finalInventory = inventory.value; 

      console.log("☁️ 正在將永久資源傳遞給 tower_lobby...");
      
      // 🌟 修正 4：把清除寫死狀態的多餘呼叫刪掉，只保留有傳 lobbyData 的這行
      resetLocalStatsToDefault(lobbyData);
      
      await supabase
        .from('tower_lobby')
        .update({
          best_floor: newBestFloor,
          coins: totalCoins,
          inventory: finalInventory
        })
        .eq('user_id', currentUserId.value);

      console.log("✅ 永久資源已成功回收至大廳！");

      console.log("🧹 正在清空 tower_saves 暫存資料...");
      await supabase
        .from('tower_saves')
        .delete()
        .eq('user_id', currentUserId.value);
        
      console.log("🗑️ tower_saves 暫存檔已安全抹除。");
    }
  } catch (err) {
    console.error("❌ 終結連線資料結算或清除失敗:", err);
  }

  floor.value = 1;
  mapData.value = null; 
  inventory.value = [];
  coins.value = 0;
  
  isGameStarted.value = false;
};

const handleUpdateStats = async (newStats) => {
  // 更新本地變數
  if (newStats.maxHp !== undefined) maxHp.value = newStats.maxHp;
  if (newStats.maxMp !== undefined) maxMp.value = newStats.maxMp;
  if (newStats.maxAp !== undefined) maxAp.value = newStats.maxAp;
  if (newStats.attack !== undefined) atk.value = newStats.attack;
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
      pointsGained += 5;
    }

    if (pointsGained > 0) {
      stat_points.value = (stat_points.value || 0) + pointsGained;
      
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

  // 1. 同步至當前戰鬥存檔 (tower_saves)
  await saveToTowerSaves();

  // 2. 同步外部大廳與高塔大廳
  if (currentUserId.value) {
    try {
      await supabase
        .from('profiles')
        .update({
          level: level.value,
          xp: xp.value,
          total_exp: totalExp.value
        })
        .eq('id', currentUserId.value);

      await supabase
        .from('tower_lobby')
        .update({
          level: level.value,
          xp: xp.value,
          total_exp: totalExp.value
          // 🌟 修正 3：刪除這裡的 max_hp, max_atk 等，嚴格禁止局內升級污染大廳！
        })
        .eq('user_id', currentUserId.value);

      console.log(`[🔄 同步成功] 等級: ${level.value} 已同步`);
    } catch (err) {
      console.error('同步等級失敗:', err);
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
  if (game.value) {
    game.value.destroy(true);
    game.value = null;
  }

  setTimeout(() => {
    if (!isGameStarted.value) return;

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
    console.log("🎮 [Phaser] 容器尺寸已穩定，遊戲引擎成功安全啟動。");
  }, 100);
};

const resetLocalStatsToDefault = (lobbyData) => {
  if (!lobbyData) {
    maxHp.value = 100;   hp.value = 100;
    maxMp.value = 50;    mp.value = 50;
    maxAp.value = 10;    ap.value = 10;
    atk.value = 10;      maxAtk.value = 10;
    return;
  }

  maxHp.value = lobbyData.max_hp || 100;
  hp.value = lobbyData.max_hp || 100; 

  maxMp.value = lobbyData.max_mp || 50;
  mp.value = lobbyData.max_mp || 50;

  maxAp.value = lobbyData.max_ap || 10;
  ap.value = lobbyData.max_ap || 10;

  atk.value = lobbyData.max_atk || 10; 
  maxAtk.value = lobbyData.max_atk || 10;
};
</script>

<style>
.page-fade-enter-active, .page-fade-leave-active { transition: opacity 0.5s ease; }
.page-fade-enter-from, .page-leave-to { opacity: 0; }
</style>