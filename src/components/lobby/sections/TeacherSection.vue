<template>
  <div class="p-8 max-w-6xl mx-auto text-white font-['Fredoka']">
    
    <div class="flex items-center justify-between mb-8 border-b border-[#333366] pb-4">
      <div class="flex items-center gap-4">
        <button 
          v-if="currentView !== 'dashboard'" 
          @click="goBack"
          class="p-2 hover:bg-white/10 rounded-lg transition-colors text-[#a0a0b8] hover:text-white"
          title="返回"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h2 class="text-3xl font-bold text-[#00d4aa] flex items-center gap-3">
          <span>👨‍🏫</span> 
          {{ 
            currentView === 'dashboard' ? '教師管理中心' : 
            currentView === 'student_list' ? '班級與學生名單' : 
            `${selectedStudent?.username} 的學習進度` 
          }}
        </h2>
      </div>
      <div class="px-4 py-1.5 bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/50 rounded-full text-sm font-bold tracking-widest">
        TEACHER MODE
      </div>
    </div>

    <div v-if="currentView === 'dashboard'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div @click="openStudentList" class="bg-[#16162a] border border-[#333366] rounded-2xl p-6 shadow-lg hover:border-[#00d4aa]/50 transition-colors cursor-pointer group">
        <div class="text-4xl mb-4 group-hover:scale-110 transition-transform">👥</div>
        <h3 class="text-xl text-white font-bold mb-2">班級與學生管理</h3>
        <p class="text-[#a0a0b8] text-sm leading-relaxed">檢視你負責的班級名單，查看個別學生的上線狀態與學習時數。</p>
        <button class="mt-4 w-full py-2 bg-[#0a0e27] text-[#00d4aa] border border-[#00d4aa]/30 rounded-lg group-hover:bg-[#00d4aa]/10 transition-colors pointer-events-none">
          進入班級
        </button>
      </div>
      </div>

    <div v-else-if="currentView === 'student_list'" class="animate-fade-in">
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
        <div class="w-12 h-12 border-4 border-[#333366] border-t-[#00d4aa] rounded-full animate-spin mb-4"></div>
        <p class="text-[#a0a0b8]">正在載入學生資料庫...</p>
      </div>

      <div v-else class="bg-[#16162a] border border-[#333366] rounded-2xl overflow-hidden shadow-lg">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-[#0a0e27] border-b border-[#333366]">
              <th class="p-4 font-semibold text-[#a0a0b8]">學生姓名</th>
              <th class="p-4 font-semibold text-[#a0a0b8]">角色等級</th>
              <th class="p-4 font-semibold text-[#a0a0b8]">狀態</th>
              <th class="p-4 font-semibold text-[#a0a0b8]">最後上線</th>
              <th class="p-4 font-semibold text-[#a0a0b8] text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in students" :key="student.id" class="border-b border-[#333366]/50 hover:bg-[#333366]/30 transition-colors">
              <td class="p-4 flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-[#333366] overflow-hidden border border-[#00d4aa]/30 flex items-center justify-center">
                  <img v-if="student.avatar_url" :src="student.avatar_url" alt="avatar" class="w-full h-full object-cover" />
                  <span v-else class="text-xl">👾</span>
                </div>
                <span class="font-bold text-white">{{ student.username || '未命名學生' }}</span>
              </td>
              <td class="p-4 text-[#ffbb33] font-bold">Lv. {{ student.level || 1 }}</td>
              <td class="p-4">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full" :class="checkIsOnline(student.last_login_at) ? 'bg-[#00d4aa] shadow-[0_0_8px_#00d4aa]' : 'bg-gray-500'"></span>
                  <span class="text-sm font-medium" :class="checkIsOnline(student.last_login_at) ? 'text-[#00d4aa]' : 'text-[#a0a0b8]'">
                    {{ checkIsOnline(student.last_login_at) ? '線上' : '離線' }}
                  </span>
                </div>
              </td>
              <td class="p-4 text-sm text-[#a0a0b8]">{{ formatDate(student.last_login_at) }}</td>
              <td class="p-4 text-center">
                <button 
                  @click="openStudentProgress(student)" 
                  class="px-3 py-1.5 bg-white/5 hover:bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30 rounded-md text-sm transition-colors"
                >
                  查看進度
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else-if="currentView === 'student_progress'" class="animate-fade-in">
      
      <div v-if="isProgressLoading" class="flex flex-col items-center justify-center py-20">
        <div class="w-12 h-12 border-4 border-[#333366] border-t-[#ffbb33] rounded-full animate-spin mb-4"></div>
        <p class="text-[#a0a0b8]">正在讀取關卡數據...</p>
      </div>

      <div v-else>
        <div class="flex items-center gap-6 bg-[#16162a] border border-[#333366] rounded-2xl p-6 shadow-lg mb-6">
          <div class="w-20 h-20 rounded-2xl bg-[#0a0e27] overflow-hidden border-2 border-[#00d4aa]/50 flex items-center justify-center shadow-[0_0_15px_rgba(0,212,170,0.2)]">
            <img v-if="selectedStudent?.avatar_url" :src="selectedStudent.avatar_url" alt="avatar" class="w-full h-full object-cover" />
            <span v-else class="text-4xl">👾</span>
          </div>
          <div>
            <h3 class="text-2xl font-bold text-white mb-1">{{ selectedStudent?.username }}</h3>
            <p class="text-[#a0a0b8] mb-2">ID: {{ selectedStudent?.id }}</p>
            <div class="inline-block px-3 py-1 bg-[#ffbb33]/20 text-[#ffbb33] border border-[#ffbb33]/50 rounded-md text-sm font-bold">
              Level {{ selectedStudent?.level || 1 }}
            </div>
          </div>
        </div>

        <h4 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>📚</span> 課程破關進度
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            v-for="course in studentProgressData" 
            :key="course.id"
            class="bg-[#16162a] border border-[#333366] rounded-xl p-5 shadow-lg"
          >
            <div class="flex justify-between items-end mb-3">
              <h5 class="font-bold text-white text-lg" :style="{ color: course.color }">{{ course.name }}</h5>
              <span class="text-sm text-[#a0a0b8] font-medium">關卡 {{ course.currentLevel }} / {{ course.totalLevels }}</span>
            </div>
            <div class="w-full h-3 bg-[#0a0e27] rounded-full overflow-hidden border border-[#333366]">
              <div 
                class="h-full transition-all duration-1000 ease-out"
                :style="{ 
                  width: `${(course.currentLevel / course.totalLevels) * 100}%`,
                  backgroundColor: course.color,
                  boxShadow: `0 0 10px ${course.color}`
                }"
              ></div>
            </div>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'; // 新增引入生命週期
import { supabase } from '../../../supabase'; 

const currentView = ref('dashboard');
const students = ref([]);
const isLoading = ref(false);

const selectedStudent = ref(null);
const studentProgressData = ref([]);
const isProgressLoading = ref(false);

// 🌟 新增：響應式的當前時間，用來讓 Vue 自動重新計算是否離線
const currentTime = ref(new Date().getTime());
let timer = null;
let realtimeChannel = null; // 用來儲存 Supabase 的訂閱通道

const goBack = () => {
  if (currentView.value === 'student_progress') {
    currentView.value = 'student_list';
  } else if (currentView.value === 'student_list') {
    currentView.value = 'dashboard';
  }
};

// 🌟 修改：使用 currentTime.value 來計算，只要 currentTime 改變，綠燈狀態就會自動重新判定
const checkIsOnline = (dateString) => {
  if (!dateString) return false;
  const lastActivity = new Date(dateString).getTime();
  const diffInMinutes = (currentTime.value - lastActivity) / (1000 * 60);
  return diffInMinutes <= 5; 
};

const formatDate = (dateString) => {
  if (!dateString) return '從未登入';
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
};

// 🌟 新增：設定 Supabase 的即時監聽
const setupRealtime = () => {
  if (realtimeChannel) return; // 避免重複訂閱

  realtimeChannel = supabase
    .channel('profiles-updates')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'profiles' },
      (payload) => {
        const updatedData = payload.new;
        // 如果變更的是學生名單中的人，立刻更新他的最後上線時間
        const index = students.value.findIndex(s => s.id === updatedData.id);
        if (index !== -1) {
          students.value[index].last_login_at = updatedData.last_login_at;
          students.value[index].level = updatedData.level; // 順便更新等級
        }
      }
    )
    .subscribe();
};

const openStudentList = async () => {
  currentView.value = 'student_list';
  isLoading.value = true;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, level, role, last_login_at')
      .eq('role', 'student')
      .order('level', { ascending: false }); 

    if (error) throw error;
    students.value = data || [];
    
    // 🌟 載入名單後，啟動即時監聽
    setupRealtime();
    
  } catch (err) {
    console.error('撈取學生名單失敗:', err);
  } finally {
    isLoading.value = false;
  }
};

const openStudentProgress = async (student) => {
  // ... 原本的 openStudentProgress 程式碼保持不變 ...
  selectedStudent.value = student; 
  currentView.value = 'student_progress';
  isProgressLoading.value = true;

  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('course_id, level_id')
      .eq('user_id', student.id);

    if (error) throw error;

    const systemCourses = [
      { id: 'python', name: 'Python 基礎語法', totalLevels: 20, color: '#ffbb33' },
      { id: 'javascript', name: 'JavaScript 實戰', totalLevels: 20, color: '#00d4aa' },
      { id: 'algorithm', name: '資料結構與演算法', totalLevels: 20, color: '#a78bfa' },
      { id: 'phaser', name: 'Phaser 遊戲開發', totalLevels: 20, color: '#ff6b6b' }
    ];

    if (!data || data.length === 0) {
      studentProgressData.value = systemCourses.map(course => ({
        ...course,
        currentLevel: 0
      }));
    } else {
      const progressMap = {};
      data.forEach(record => {
         progressMap[record.course_id] = Math.max(progressMap[record.course_id] || 0, record.level_id);
      });

      studentProgressData.value = systemCourses.map(course => ({
        ...course,
        currentLevel: progressMap[course.id] || 0
      }));
    }

  } catch (err) {
    console.warn('❌ 撈取真實進度失敗', err);
  } finally {
    isProgressLoading.value = false;
  }
};

// 🌟 新增：在元件掛載時啟動計時器，並在卸載時清理
onMounted(() => {
  // 每 30 秒更新一次時間（不需重新整理畫面），超過 5 分鐘的人會自動變成離線
  timer = setInterval(() => {
    currentTime.value = new Date().getTime();
  }, 30000); 
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
  if (realtimeChannel) supabase.removeChannel(realtimeChannel); // 離開頁面時切斷監聽，節省效能
});
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>