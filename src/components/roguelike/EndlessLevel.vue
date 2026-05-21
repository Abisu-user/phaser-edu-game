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
const isShuttingDown = ref(false);

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
  isShuttingDown.value = false;
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
  if (isShuttingDown.value) return;
  
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
  console.log("💾 [暫時中陣] 正在打包所有戰局資料存入 tower_saves...");
  isShuttingDown.value = true; // 🌟 啟動關機鎖

  let currentMapState = null;
  if (game.value) {
    const currentScene = game.value.scene.getScene('EndlessScene');
    if (currentScene && typeof currentScene.exportMapState === 'function') {
      currentMapState = currentScene.exportMapState();
    }
    game.value.destroy(true); 
    game.value = null;
  }

  let lobbyDataToRestore = null;

  try {
    if (currentUserId.value) {
      // 🌟 安全修正：改用 limit(1) 取代 single() 防止多行崩潰
      const { data: lobbyList } = await supabase
        .from('tower_lobby')
        .select('*')
        .eq('user_id', currentUserId.value)
        .limit(1);
      
      lobbyDataToRestore = lobbyList?.[0] || null;

      await supabase
        .from('tower_saves')
        .upsert({
          user_id: currentUserId.value,
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
          current_atk: atk.value,
          max_atk: maxAtk.value
        }, { onConflict: 'user_id' }); 
      
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
  isShuttingDown.value = true; // 🌟 1. 優先鎖定自動存檔

  try {
    if (currentUserId.value) {
      let currentRunKills = 0;
      let currentRunBossKills = 0;
      let currentRunPassives = 0;

      // 2. 立即回收戰局數值並當場摧毀 Phaser 引擎
      if (game.value) {
        const scene = game.value.scene.getScene('EndlessScene');
        if (scene) {
           currentRunKills = scene.sessionKills || 0;
           currentRunBossKills = scene.sessionBossKills || 0;
           currentRunPassives = scene.sessionPassives || 0;
        }
        game.value.destroy(true); 
        game.value = null;
      }

      // 3. 🌟【核心修正】第一時間優先刪除暫存檔！確保大廳按鈕絕對會恢復正常
      await supabase
        .from('tower_saves')
        .delete()
        .eq('user_id', currentUserId.value);
      console.log("🗑️ tower_saves 暫存檔已安全抹除。");

      // 4. 🌟【安全修正】改用 limit(1) 取代 single()，杜絕多行重複數據導致的系統崩潰
      const { data: lobbyList } = await supabase
        .from('tower_lobby') 
        .select('*')
        .eq('user_id', currentUserId.value)
        .limit(1);

      const lobbyData = lobbyList?.[0] || null;
      const oldBestFloor = lobbyData?.best_floor || 1;
      const newBestFloor = floor.value > oldBestFloor ? floor.value : oldBestFloor;
      const finalInventory = inventory.value; 
      const totalCoins = coins.value; 

      console.log("☁️ 正在將永久資源傳遞給 tower_lobby...");
      resetLocalStatsToDefault(lobbyData);
      
      // 更新大廳永久數據
      await supabase
        .from('tower_lobby')
        .update({
          best_floor: newBestFloor,
          coins: totalCoins, 
          inventory: finalInventory
        })
        .eq('user_id', currentUserId.value);

      // 5. 更新全域成就數據
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_kills, boss_kills, total_deaths, passive_count')
        .eq('id', currentUserId.value)
        .single();

      if (profile) {
        await supabase.from('profiles').update({
            total_kills: (profile.total_kills || 0) + currentRunKills,      
            boss_kills: (profile.boss_kills || 0) + currentRunBossKills,    
            passive_count: (profile.passive_count || 0) + currentRunPassives,  
            total_deaths: (profile.total_deaths || 0) + 1,                  
        }).eq('id', currentUserId.value);
      }

      console.log("✅ 永久資源與成就已成功結算回收！");
    }
  } catch (err) {
    console.error("❌ 終結連線部分結算回收失敗:", err);
  }

  // 6. 強制清除本地戰局殘留變數
  floor.value = 1;
  mapData.value = null; 
  inventory.value = [];
  coins.value = 0;
  isGameStarted.value = false;
  radarNearby.value = null;
  radarBoss.value = null;
};

const handleUpdateStats = async (newStats) => {
  // 1. 更新本地變數 (加上對 totalExp 的接收)
  if (newStats.maxHp !== undefined) maxHp.value = newStats.maxHp;
  if (newStats.maxMp !== undefined) maxMp.value = newStats.maxMp;
  if (newStats.maxAp !== undefined) maxAp.value = newStats.maxAp;
  if (newStats.attack !== undefined) atk.value = newStats.attack;
  if (newStats.hp !== undefined) hp.value = Math.min(newStats.hp, maxHp.value);
  if (newStats.mp !== undefined) mp.value = Math.min(newStats.mp, maxMp.value);
  if (newStats.ap !== undefined) ap.value = Math.min(newStats.ap, maxAp.value);
  if (newStats.coins !== undefined) coins.value = newStats.coins;
  if (newStats.floor !== undefined) floor.value = newStats.floor;
  if (newStats.totalExp !== undefined) totalExp.value = newStats.totalExp;

  // 2. 接收從 TowerBattle 傳來的經驗值與升級結果
  if (newStats.xp !== undefined) xp.value = newStats.xp;
  
  let isLevelUp = false;
  if (newStats.level !== undefined && newStats.level > level.value) {
    const levelsGained = newStats.level - level.value;
    level.value = newStats.level;
    // 🌟 每升一級獲得 5 點屬性點
    stat_points.value = (stat_points.value || 0) + (levelsGained * 5); 
    isLevelUp = true;
  }

  // 3. 同步至當前戰鬥存檔 (tower_saves)
  await saveToTowerSaves();

  // 4. 即時同步外部大廳與高塔大廳
  if (currentUserId.value) {
    try {
      // A. 同步全服 Profile
      let profileUpdate = { level: level.value, xp: xp.value, total_exp: totalExp.value };
      if (isLevelUp) profileUpdate.stat_points = stat_points.value;
      
      await supabase.from('profiles').update(profileUpdate).eq('id', currentUserId.value);

      // B. 同步大廳 Lobby (🌟 這裡補上 coins，解決金幣不同步問題！)
      let lobbyUpdate = { 
        coins: coins.value, 
        level: level.value, 
        xp: xp.value, 
        total_exp: totalExp.value 
      };
      if (isLevelUp) lobbyUpdate.stat_points = stat_points.value;
      
      await supabase.from('tower_lobby').update(lobbyUpdate).eq('user_id', currentUserId.value);

      console.log(`[🔄 同步成功] 金幣: ${coins.value}, 等級: ${level.value}, 經驗: ${xp.value}, 總經驗: ${totalExp.value}`);
    } catch (err) {
      console.error('同步資料庫失敗:', err);
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

  mapData.value = null;
};
</script>

<style>
.page-fade-enter-active, .page-fade-leave-active { transition: opacity 0.5s ease; }
.page-fade-enter-from, .page-leave-to { opacity: 0; }
</style>