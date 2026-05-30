<template>
  <div class="bg-[#16162a] border border-[#333366] rounded-2xl shadow-lg p-6 relative min-h-[500px] flex flex-col">
    
    <div v-if="isLoading" class="absolute inset-0 bg-[#16162a]/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-[#ffbb33] rounded-2xl">
      <div class="w-10 h-10 border-4 border-[#ffbb33]/30 border-t-[#ffbb33] rounded-full animate-spin mb-3"></div>
      <div class="font-bold tracking-widest animate-pulse">正在運算大數據模型...</div>
    </div>

    <div v-if="!isLoading && !hasClass" class="flex flex-col items-center justify-center h-full py-20 text-center flex-1">
      <div class="text-6xl mb-4">📊</div>
      <h2 class="text-2xl font-bold text-white mb-2">缺乏數據來源</h2>
      <p class="text-[#a0a0b8] mb-6">請先建立班級並邀請學生加入，系統才能進行進度大數據分析。</p>
    </div>

    <div v-else-if="!isLoading && hasClass" class="animate-fade-in flex flex-col h-full space-y-6">
      
      <div class="flex items-center justify-between shrink-0">
        <div>
          <h2 class="text-2xl font-bold text-white flex items-center gap-2">
            <span>📈</span> 學習數據深度分析
          </h2>
          <p class="text-[#a0a0b8] text-sm mt-1">深度分析班級整體的邏輯弱點與卡關熱點</p>
        </div>
        <button @click="fetchAnalysisData" class="text-sm px-4 py-2 bg-[#0a0e27] border border-[#333366] rounded-lg text-[#a0a0b8] hover:text-white hover:border-[#00d4aa] transition-all flex items-center gap-2">
          <span>🔄</span> 重新運算
        </button>
      </div>

      <div class="shrink-0">
        <h3 class="text-[#ff6b6b] font-bold mb-3 flex items-center gap-2">
          <span class="animate-pulse">🚨</span> 全班卡關熱點 (Top 3 最難關卡)
        </h3>
        
        <div v-if="hotspots.length === 0" class="bg-[#0a0e27] border border-[#333366] rounded-xl p-6 text-center text-[#a0a0b8]">
          目前學生們勢如破竹，尚未發現明顯的卡關熱點！
        </div>
        
        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div v-for="(spot, index) in hotspots" :key="spot.level" class="bg-gradient-to-br from-[#2a0808]/80 to-[#160404] border border-[#ff6b6b]/40 rounded-xl p-4 relative overflow-hidden group hover:border-[#ff6b6b] transition-colors">
            
            <div class="absolute -right-4 -top-4 text-6xl opacity-10 font-black italic">#{{ index + 1 }}</div>
            
            <div class="flex justify-between items-start mb-2 relative z-10">
              <div class="font-black text-xl text-white">第 {{ spot.level }} 關</div>
              <div class="text-xs font-bold px-2 py-1 bg-[#ff6b6b]/20 text-[#ff6b6b] rounded-md border border-[#ff6b6b]/30">
                苦戰中
              </div>
            </div>
            
            <div class="space-y-2 mt-4 relative z-10">
              <div class="flex justify-between items-center text-sm">
                <span class="text-[#a0a0b8]">平均獲得星數</span>
                <span class="font-bold text-[#ffbb33]">{{ spot.avgStars }} ⭐</span>
              </div>
              <div class="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
                <div class="h-full bg-[#ffbb33]" :style="`width: ${(spot.avgStars / 3) * 100}%`"></div>
              </div>
              
              <div class="flex justify-between items-center text-sm mt-2">
                <span class="text-[#a0a0b8]">挑戰失敗/重試人數</span>
                <span class="font-bold text-white">{{ spot.playerCount }} 人</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex-1 flex flex-col min-h-[300px] bg-[#0a0e27] border border-[#333366] rounded-xl overflow-hidden">
        <div class="p-4 border-b border-[#333366] bg-[#16162a]/50 flex justify-between items-center shrink-0">
          <h3 class="text-white font-bold flex items-center gap-2">
            <span>🏆</span> 學生學習雷達與排行
          </h3>
          <div class="text-xs text-[#a0a0b8] bg-[#16162a] px-3 py-1 rounded-full border border-[#333366]">
            共 {{ studentsData.length }} 名學生數據
          </div>
        </div>

        <div class="flex-1 overflow-auto custom-scrollbar relative">
          <table class="w-full text-left border-collapse min-w-[700px]">
            <thead class="bg-[#0a0e27] sticky top-0 z-10 shadow-sm">
              <tr>
                <th class="p-4 text-[#a0a0b8] font-bold text-sm border-b border-[#333366] w-16 text-center">排名</th>
                <th class="p-4 text-[#a0a0b8] font-bold text-sm border-b border-[#333366]">學生名稱</th>
                <th class="p-4 text-[#a0a0b8] font-bold text-sm border-b border-[#333366]">當前等級</th>
                <th class="p-4 text-[#a0a0b8] font-bold text-sm border-b border-[#333366]">通關總數</th>
                <th class="p-4 text-[#a0a0b8] font-bold text-sm border-b border-[#333366]">完美通關 (3⭐)</th>
                <th class="p-4 text-[#a0a0b8] font-bold text-sm border-b border-[#333366]">總學習時數</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="studentsData.length === 0">
                <td colspan="6" class="p-8 text-center text-[#666688]">目前班級尚無學生學習數據</td>
              </tr>
              <tr v-for="(student, index) in studentsData" :key="student.id" 
                  class="border-b border-[#333366]/50 hover:bg-[#16162a] transition-colors group">
                
                <td class="p-4 text-center">
                  <span v-if="index === 0" class="text-2xl drop-shadow-md">🥇</span>
                  <span v-else-if="index === 1" class="text-2xl drop-shadow-md">🥈</span>
                  <span v-else-if="index === 2" class="text-2xl drop-shadow-md">🥉</span>
                  <span v-else class="text-[#666688] font-bold">{{ index + 1 }}</span>
                </td>
                
                <td class="p-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-[#16162a] border border-[#333366] overflow-hidden shrink-0">
                      <img v-if="student.avatar" :src="student.avatar" class="w-full h-full object-cover">
                      <div v-else class="w-full h-full flex items-center justify-center text-[#00d4aa] font-bold text-xs">
                        {{ student.name.charAt(0).toUpperCase() }}
                      </div>
                    </div>
                    <div>
                      <div class="text-white font-bold text-sm group-hover:text-[#00d4aa] transition-colors">{{ student.name }}</div>
                    </div>
                  </div>
                </td>
                
                <td class="p-4">
                  <span class="px-2 py-1 bg-[#16162a] border border-[#333366] text-[#ffbb33] rounded text-xs font-bold">
                    Lv.{{ student.level }}
                  </span>
                </td>
                
                <td class="p-4">
                  <div class="flex items-center gap-2">
                    <span class="text-white font-bold">{{ student.clearedLevels }}</span>
                    <span class="text-xs text-[#666688]">關</span>
                  </div>
                </td>
                
                <td class="p-4">
                  <div class="flex items-center gap-1.5">
                    <span class="text-white font-bold">{{ student.perfectClears }}</span>
                    <span class="text-xs text-[#666688]">關</span>
                  </div>
                </td>
                
                <td class="p-4">
                  <span class="text-[#a0a0b8] text-sm">{{ formatMinutes(student.totalTimeSeconds) }}</span>
                </td>
                
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../../../../supabase.js';

const isLoading = ref(true);
const hasClass = ref(false);

const hotspots = ref([]);
const studentsData = ref([]);

const fetchAnalysisData = async () => {
  isLoading.value = true;
  try {
    // 1. 獲取老師的班級代碼
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from('profiles')
      .select('class_code')
      .eq('id', user.id)
      .single();

    if (!profile || !profile.class_code) {
      hasClass.value = false;
      return;
    }
    
    hasClass.value = true;
    const classCode = profile.class_code;

    // 2. 獲取班級學生基本資料
    const { data: students } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, level, total_exp')
      .eq('class_code', classCode)
      .eq('role', 'student');

    if (!students || students.length === 0) {
      hotspots.value = [];
      studentsData.value = [];
      return;
    }

    const studentIds = students.map(s => s.id);

    // 3. 獲取學生通關紀錄大數據
    const { data: progress } = await supabase
      .from('user_progress')
      .select('user_id, level_id, stars, time_spent_seconds')
      .in('user_id', studentIds);

    const progData = progress || [];

    // ==========================================
    // 💡 大數據分析 1：尋找卡關熱點 (Hotspots)
    // ==========================================
    const levelStats = {};
    progData.forEach(p => {
      if (!levelStats[p.level_id]) {
        levelStats[p.level_id] = { totalStars: 0, totalTime: 0, count: 0 };
      }
      levelStats[p.level_id].totalStars += (p.stars || 0);
      levelStats[p.level_id].totalTime += (p.time_spent_seconds || 0);
      levelStats[p.level_id].count += 1;
    });

    const analyzedLevels = Object.keys(levelStats).map(levelId => {
      const stat = levelStats[levelId];
      const avgStars = Number((stat.totalStars / stat.count).toFixed(1));
      return {
        level: levelId,
        avgStars: avgStars,
        playerCount: stat.count,
        // 我們用「平均星數」來定義難度，星數越低代表越難
        difficultyScore: avgStars 
      };
    });

    // 排序：找出平均星數最低的前 3 名關卡 (只顯示有人玩過且平均星數 < 2.5 的關卡，作為弱點)
    hotspots.value = analyzedLevels
      .filter(l => l.avgStars < 2.5 && l.playerCount > 1) 
      .sort((a, b) => a.difficultyScore - b.difficultyScore)
      .slice(0, 3);


    // ==========================================
    // 💡 大數據分析 2：學生進度排名與詳細數據
    // ==========================================
    const studentStats = {};
    studentIds.forEach(id => {
      studentStats[id] = { clearedLevels: 0, perfectClears: 0, totalTimeSeconds: 0 };
    });

    // 確保同一關卡只算最高成績 (去重處理)
    const bestProgressMap = {};
    progData.forEach(p => {
      const key = `${p.user_id}_${p.level_id}`;
      if (!bestProgressMap[key] || bestProgressMap[key].stars < p.stars) {
        bestProgressMap[key] = p;
      }
    });

    Object.values(bestProgressMap).forEach(p => {
      if (studentStats[p.user_id]) {
        studentStats[p.user_id].clearedLevels += 1;
        studentStats[p.user_id].totalTimeSeconds += (p.time_spent_seconds || 0);
        if (p.stars === 3) {
          studentStats[p.user_id].perfectClears += 1;
        }
      }
    });

    // 組合最終列表
    const finalStudentData = students.map(s => ({
      id: s.id,
      name: s.username || '未命名',
      avatar: s.avatar_url,
      level: s.level || 1,
      totalExp: s.total_exp || 0,
      clearedLevels: studentStats[s.id].clearedLevels,
      perfectClears: studentStats[s.id].perfectClears,
      totalTimeSeconds: studentStats[s.id].totalTimeSeconds
    }));

    // 排序邏輯：1.通關數最高 2.等級最高 3.總經驗值最高
    studentsData.value = finalStudentData.sort((a, b) => {
      if (b.clearedLevels !== a.clearedLevels) return b.clearedLevels - a.clearedLevels;
      if (b.level !== a.level) return b.level - a.level;
      return b.totalExp - a.totalExp;
    });

  } catch (error) {
    console.error('分析大數據失敗:', error);
  } finally {
    isLoading.value = false;
  }
};

const formatMinutes = (seconds) => {
  if (!seconds || seconds === 0) return '0 分鐘';
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) {
    return `${hours} 小時 ${minutes % 60} 分鐘`;
  }
  return `${minutes} 分鐘`;
};

onMounted(() => {
  fetchAnalysisData();
});
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(51, 51, 102, 0.8); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 212, 170, 0.5); }
</style>