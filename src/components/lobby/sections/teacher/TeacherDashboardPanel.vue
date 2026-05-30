<template>
  <div class="bg-[#16162a] border border-[#333366] rounded-2xl shadow-lg p-6 relative min-h-[500px]">
    
    <div v-if="isLoading" class="absolute inset-0 bg-[#16162a]/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-[#ffbb33] rounded-2xl">
      <div class="w-10 h-10 border-4 border-[#ffbb33]/30 border-t-[#ffbb33] rounded-full animate-spin mb-3"></div>
      <div class="font-bold tracking-widest animate-pulse">分析數據中...</div>
    </div>

    <div v-if="!isLoading && !hasClass" class="flex flex-col items-center justify-center h-full py-20 text-center">
      <div class="text-6xl mb-4">🏫</div>
      <h2 class="text-2xl font-bold text-white mb-2">您尚未建立班級</h2>
      <p class="text-[#a0a0b8] mb-6">請先前往「學生管理」頁面建立班級，才能查看班級概況與數據。</p>
    </div>

    <div v-else-if="!isLoading && hasClass" class="animate-fade-in space-y-6">
      
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-2xl font-bold text-white flex items-center gap-2">
          📊 班級概況總覽
        </h2>
        <button @click="fetchDashboardData" class="text-sm text-[#a0a0b8] hover:text-[#00d4aa] transition-colors flex items-center gap-1">
          <span>🔄</span> 重新整理
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-[#0a0e27] border border-[#333366] p-5 rounded-xl flex items-center gap-4 hover:border-blue-500/50 transition-colors">
          <div class="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 text-2xl">👥</div>
          <div>
            <div class="text-[#a0a0b8] text-sm mb-1">總班級學生數</div>
            <div class="text-3xl font-bold text-white">{{ stats.totalStudents }} <span class="text-sm font-normal text-[#666688]">人</span></div>
          </div>
        </div>

        <div class="bg-[#0a0e27] border border-[#333366] p-5 rounded-xl flex items-center gap-4 hover:border-[#00d4aa]/50 transition-colors">
          <div class="w-14 h-14 rounded-full bg-[#00d4aa]/10 flex items-center justify-center text-[#00d4aa] text-2xl">📈</div>
          <div>
            <div class="text-[#a0a0b8] text-sm mb-1">平均學習進度</div>
            <div class="text-3xl font-bold text-white">{{ stats.avgProgress }}<span class="text-lg text-[#00d4aa]">%</span></div>
          </div>
        </div>

        <div class="bg-[#0a0e27] border border-[#333366] p-5 rounded-xl flex items-center gap-4 hover:border-purple-500/50 transition-colors">
          <div class="w-14 h-14 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 text-2xl">🔥</div>
          <div>
            <div class="text-[#a0a0b8] text-sm mb-1">近期活躍人數</div>
            <div class="flex items-baseline gap-2">
              <div class="text-3xl font-bold text-white">{{ stats.activeStudents }}</div>
              <div class="text-xs text-purple-400">7天內有通關</div>
            </div>
          </div>
        </div>

        <div class="bg-[#0a0e27] border border-[#333366] p-5 rounded-xl flex items-center gap-4 hover:border-[#ffbb33]/50 transition-colors">
          <div class="w-14 h-14 rounded-full bg-[#ffbb33]/10 flex items-center justify-center text-[#ffbb33] text-2xl">⏳</div>
          <div>
            <div class="text-[#a0a0b8] text-sm mb-1">全班總學習時數</div>
            <div class="text-3xl font-bold text-white">{{ stats.totalHours }} <span class="text-sm font-normal text-[#666688]">分鐘</span></div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div class="lg:col-span-2 bg-[#0a0e27] border border-[#333366] p-6 rounded-xl flex flex-col relative overflow-hidden">
          <h3 class="text-white font-bold mb-4 flex items-center gap-2 shrink-0">
            <span>📊</span> 各關卡通關人數統計
            <span class="text-xs text-[#666688] font-normal ml-2">(可使用滑鼠滾輪左右滑動)</span>
          </h3>
          
          <div v-if="stats.totalStudents === 0" class="flex-1 flex items-center justify-center text-[#a0a0b8] min-h-[200px]">尚無學生資料</div>
          
          <div v-else class="relative w-full mt-2">
            <div class="absolute top-6 left-0 right-0 h-[160px] flex flex-col justify-between pointer-events-none opacity-20 z-0">
              <div class="border-t border-[#666688] w-full"></div>
              <div class="border-t border-[#666688] w-full"></div>
              <div class="border-t border-[#666688] w-full"></div>
              <div class="border-t border-[#666688] w-full"></div>
            </div>

            <div 
              ref="chartContainer"
              class="w-full overflow-x-auto overflow-y-hidden custom-scrollbar-x flex items-end gap-3 z-10 relative scroll-smooth px-2 pb-5 pt-6"
              @wheel.prevent="handleHorizontalScroll"
            >
              <div v-for="bar in levelStats" :key="bar.level" class="flex flex-col items-center shrink-0 w-11 group">
                
                <div class="w-full h-[160px] relative flex items-end justify-center border-b-2 border-[#333366]">
                  
                  <div class="w-full bg-gradient-to-t from-[#00d4aa]/20 to-[#00d4aa] rounded-t-sm transition-all duration-700 ease-out relative group-hover:brightness-125"
                       :style="`height: ${bar.percentage}%`">
                       
                      <div class="absolute left-1/2 -translate-x-1/2 -top-7 text-sm font-black drop-shadow-md transition-colors"
                           :class="bar.count > 0 ? 'text-[#00d4aa]' : 'text-[#666688]'">
                        {{ bar.count }}
                      </div>
                  </div>
                </div>
                
                <div class="text-[#a0a0b8] text-xs font-bold mt-3 text-center">
                  L{{ bar.level }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-[#0a0e27] border border-[#333366] p-6 rounded-xl flex flex-col">
          <h3 class="text-white font-bold mb-4 flex items-center gap-2 shrink-0">
            <span>⚡</span> 最近活動紀錄
          </h3>
          
          <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 max-h-[260px]">
            <div v-if="recentActivities.length === 0" class="text-center text-[#a0a0b8] py-8">
              尚未有任何通關紀錄
            </div>
            
            <div v-else v-for="activity in recentActivities" :key="activity.id" class="flex items-start gap-3 p-3 bg-[#16162a] rounded-lg border border-[#333366] hover:border-[#ffbb33]/30 transition-colors">
              <div class="w-10 h-10 rounded-full bg-[#0a0e27] border border-[#00d4aa]/30 flex items-center justify-center shrink-0 overflow-hidden">
                <img v-if="activity.avatar" :src="activity.avatar" class="w-full h-full object-cover">
                <span v-else class="text-sm font-bold text-[#00d4aa]">{{ activity.username.charAt(0).toUpperCase() }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-start mb-1">
                  <div class="font-bold text-white text-sm truncate pr-2">{{ activity.username }}</div>
                  <div class="text-[10px] text-[#666688] whitespace-nowrap">{{ activity.time }}</div>
                </div>
                <div class="text-xs text-[#a0a0b8]">
                  完成了 <span class="text-[#00d4aa] font-bold">第 {{ activity.level }} 關</span>
                </div>
                <div class="text-[10px] mt-1 tracking-widest">
                  <span v-for="n in activity.stars" :key="n">⭐</span>
                </div>
              </div>
            </div>
          </div>
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
const chartContainer = ref(null);

const stats = ref({
  totalStudents: 0,
  activeStudents: 0,
  avgProgress: 0,
  totalHours: 0
});

const levelStats = ref([]);
const recentActivities = ref([]);

// 🌟 新增：水平滾動事件轉換 (將垂直滾輪轉換為水平滾動)
const handleHorizontalScroll = (event) => {
  if (chartContainer.value) {
    chartContainer.value.scrollLeft += event.deltaY;
  }
};

const fetchDashboardData = async () => {
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

    // 2. 獲取該班級的所有學生
    const { data: students } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, total_learning_hours')
      .eq('class_code', classCode)
      .eq('role', 'student');

    if (!students || students.length === 0) {
      resetStats();
      return;
    }

    const studentIds = students.map(s => s.id);
    
    // 基本數據賦值
    stats.value.totalStudents = students.length;
    stats.value.totalHours = Math.floor(students.reduce((sum, s) => sum + (s.total_learning_hours || 0), 0));

    // 3. 撈取這些學生的通關進度紀錄
    const { data: progress } = await supabase
      .from('user_progress')
      .select('id, user_id, level_id, stars, completed_at')
      .in('user_id', studentIds)
      .order('completed_at', { ascending: false });

    const progData = progress || [];

    // 去重複：同一個學生同一關只算一次
    const uniqueClears = progData.filter((obj, index, self) =>
      index === self.findIndex((t) => (t.user_id === obj.user_id && t.level_id === obj.level_id))
    );

    // 計算平均進度 (總共 25 關)
    const TOTAL_LEVELS = 25; 
    const validClearsCount = uniqueClears.length;
    stats.value.avgProgress = Math.min(Math.round((validClearsCount / (students.length * TOTAL_LEVELS)) * 100), 100);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activeUserIds = new Set(
      progData.filter(p => new Date(p.completed_at) >= sevenDaysAgo).map(p => p.user_id)
    );
    stats.value.activeStudents = activeUserIds.size;

    // 4. 處理圖表資料 (生成 25 關的資料)
    const levelCounts = {};
    uniqueClears.forEach(p => {
      levelCounts[p.level_id] = (levelCounts[p.level_id] || 0) + 1;
    });

    levelStats.value = Array.from({ length: TOTAL_LEVELS }, (_, i) => {
      const count = levelCounts[i + 1] || 0;
      return {
        level: i + 1,
        count: count,
        // 🌟 給予最小的底座高度(2%)，讓沒人通關時也能看出柱子的位置
        percentage: count === 0 ? 2 : Math.max((count / students.length) * 100, 4) 
      };
    });

    // 5. 處理最近活動紀錄
    const userMap = {};
    students.forEach(s => {
      userMap[s.id] = { name: s.username || '未命名', avatar: s.avatar_url };
    });

    recentActivities.value = progData.slice(0, 6).map(p => ({
      id: p.id,
      username: userMap[p.user_id]?.name || '未知',
      avatar: userMap[p.user_id]?.avatar || null,
      level: p.level_id,
      stars: p.stars,
      time: formatTimeAgo(new Date(p.completed_at))
    }));

  } catch (error) {
    console.error('獲取數據失敗:', error);
  } finally {
    isLoading.value = false;
  }
};

const resetStats = () => {
  stats.value = { totalStudents: 0, activeStudents: 0, avgProgress: 0, totalHours: 0 };
  levelStats.value = Array.from({ length: 25 }, (_, i) => ({ level: i + 1, count: 0, percentage: 2 }));
  recentActivities.value = [];
};

const formatTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " 天前";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " 小時前";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " 分鐘前";
  return "剛剛";
};

onMounted(() => {
  fetchDashboardData();
});
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 原始垂直捲軸 */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(51, 51, 102, 0.8);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 212, 170, 0.5);
}

/* 🌟 新增：圖表的水平自訂捲軸 */
.custom-scrollbar-x::-webkit-scrollbar {
  height: 8px;
}
.custom-scrollbar-x::-webkit-scrollbar-track {
  background: rgba(10, 14, 39, 0.5);
  border-radius: 10px;
  margin: 0 10px;
}
.custom-scrollbar-x::-webkit-scrollbar-thumb {
  background: rgba(0, 212, 170, 0.5);
  border-radius: 10px;
}
.custom-scrollbar-x::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 212, 170, 0.9);
}
</style>