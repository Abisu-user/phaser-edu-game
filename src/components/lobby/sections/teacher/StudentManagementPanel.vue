<template>
  <div class="bg-[#16162a] border border-[#333366] rounded-2xl shadow-lg overflow-hidden relative min-h-[500px]">
    
    <div v-if="isLoading" class="absolute inset-0 bg-[#16162a]/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-[#ffbb33]">
      <div class="w-10 h-10 border-4 border-[#ffbb33]/30 border-t-[#ffbb33] rounded-full animate-spin mb-3"></div>
      <div class="font-bold tracking-widest animate-pulse">讀取中...</div>
    </div>

    <div v-if="currentView === 'list'" class="animate-fade-in">
      <div class="p-4 border-b border-[#333366] bg-[#0a0e27]/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div class="relative w-full sm:w-72">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[#a0a0b8]">🔍</span>
          <input v-model="searchQuery" type="text" placeholder="搜尋學生姓名..." class="w-full bg-[#0a0e27] border border-[#333366] rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-[#ffbb33] transition-colors">
        </div>
        <button class="w-full sm:w-auto px-4 py-2 bg-[#333366] hover:bg-[#444455] text-white rounded-lg text-sm font-bold transition-colors">
          📥 匯出成績單
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr class="bg-[#0a0e27] border-b border-[#333366] text-[#a0a0b8] text-sm tracking-wider">
              <th class="p-4 font-bold">學生姓名</th>
              <th class="p-4 font-bold">當前等級</th>
              <th class="p-4 font-bold">解鎖關卡數</th>
              <th class="p-4 font-bold">註冊時間</th>
              <th class="p-4 font-bold text-center">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#333366]">
            <tr v-if="!isLoading && filteredStudents.length === 0">
              <td colspan="5" class="p-8 text-center text-[#a0a0b8]"><div class="text-4xl mb-2">👻</div>找不到符合條件的學生</td>
            </tr>
            <tr v-for="student in filteredStudents" :key="student.id" class="hover:bg-white/5 transition-colors" :class="{'opacity-50': student.status === 'banned'}">
              <td class="p-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-[#16162a] border border-[#00d4aa]/50 flex items-center justify-center overflow-hidden shrink-0">
                    <img v-if="student.avatarUrl" :src="student.avatarUrl" class="w-full h-full object-cover">
                    <span v-else class="text-sm">👤</span>
                  </div>
                  <div>
                    <div class="font-bold text-white">{{ student.name }}</div>
                    <div v-if="student.status === 'banned'" class="text-[10px] text-red-400 font-bold bg-red-500/10 px-1.5 py-0.5 rounded inline-block mt-0.5">已停權</div>
                  </div>
                </div>
              </td>
              <td class="p-4"><span class="px-2 py-1 bg-[#ffbb33]/20 text-[#ffbb33] rounded text-xs font-bold border border-[#ffbb33]/30">Lv. {{ student.level }}</span></td>
              <td class="p-4 text-[#a0a0b8]">
                <div class="flex items-center gap-2">
                  <div class="w-full bg-[#0a0e27] h-2 rounded-full overflow-hidden">
                    <div class="bg-[#00d4aa] h-full transition-all duration-500" :style="`width: ${(student.cleared / 30) * 100}%`"></div>
                  </div>
                  <span class="text-xs whitespace-nowrap">{{ student.cleared }} / 30</span>
                </div>
              </td>
              <td class="p-4 text-sm text-[#a0a0b8]">{{ student.lastActive }}</td>
              <td class="p-4 text-center">
                <button @click="viewStudentDetails(student)" class="px-3 py-1.5 bg-[#333366] hover:bg-[#ffbb33] hover:text-[#0a0e27] text-white rounded text-xs font-bold transition-colors">
                  查看詳情
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else-if="currentView === 'detail' && selectedStudent" class="animate-slide-in p-6 relative h-full flex flex-col">
      
      <div v-if="isDetailsLoading" class="absolute inset-0 bg-[#16162a]/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-[#00d4aa]">
        <div class="w-8 h-8 border-4 border-[#00d4aa]/30 border-t-[#00d4aa] rounded-full animate-spin mb-2"></div>
        <div class="text-sm font-bold tracking-widest animate-pulse">同步學生進度中...</div>
      </div>

      <div class="flex items-center gap-4 mb-6 pb-4 border-b border-[#333366]">
        <button @click="backToList" class="w-10 h-10 rounded-xl bg-[#0a0e27] border border-[#333366] text-[#a0a0b8] hover:text-white hover:border-[#ffbb33] flex items-center justify-center transition-all">
          ←
        </button>
        <div class="flex-1"><h2 class="text-xl font-bold text-white flex items-center gap-2">學生學習報告</h2></div>
      </div>

      <div class="bg-[#0a0e27] rounded-2xl p-6 border border-[#333366] mb-6 flex flex-wrap gap-6 items-center" :class="{'border-red-500/50 bg-red-500/5': selectedStudent.status === 'banned'}">
        <div class="w-20 h-20 rounded-full bg-[#16162a] border-4 flex items-center justify-center overflow-hidden shrink-0 shadow-lg" :class="selectedStudent.status === 'banned' ? 'border-red-500/50' : 'border-[#00d4aa]/30'">
          <img v-if="selectedStudent.avatarUrl" :src="selectedStudent.avatarUrl" class="w-full h-full object-cover">
          <span v-else class="text-4xl">👤</span>
        </div>
        <div class="flex-1 min-w-[200px]">
          <div class="flex items-center gap-2 mb-1">
            <h3 class="text-2xl font-bold text-white">{{ selectedStudent.name }}</h3>
            <span v-if="selectedStudent.status === 'banned'" class="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">停權中</span>
          </div>
          <p class="text-sm text-[#a0a0b8] mb-3">帳號建立於：{{ selectedStudent.lastActive }}</p>
          <span class="px-3 py-1 bg-[#ffbb33]/20 text-[#ffbb33] rounded-lg text-sm font-bold border border-[#ffbb33]/30">當前等級 Lv. {{ selectedStudent.level }}</span>
        </div>
        
        <div class="flex gap-4">
          <button @click="showMessageModal = true" class="px-4 py-2 bg-[#333366] hover:bg-[#444455] text-white rounded-xl text-sm font-bold transition-colors shadow-lg">
            ✉️ 發送訊息
          </button>
          <button @click="showBanModal = true" 
            class="px-4 py-2 border rounded-xl text-sm font-bold transition-colors shadow-lg"
            :class="selectedStudent.status === 'banned' 
              ? 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/40' 
              : 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/40'">
            {{ selectedStudent.status === 'banned' ? '✅ 解除停權' : '⚠️ 警告/停權' }}
          </button>
        </div>
      </div>

      <h4 class="text-[#a0a0b8] font-bold mb-4 uppercase tracking-wider text-sm">數據統計</h4>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-[#0a0e27] p-5 rounded-xl border border-[#333366]">
            <div class="text-[#a0a0b8] text-sm mb-1">通關總數</div>
            <div class="text-3xl font-bold text-[#00d4aa]">{{ selectedStudent.cleared }} <span class="text-sm text-[#666688] font-normal">/ 30 關</span></div>
        </div>
        <div class="bg-[#0a0e27] p-5 rounded-xl border border-[#333366]">
            <div class="text-[#a0a0b8] text-sm mb-1">獲得成就</div>
            <div class="text-3xl font-bold text-[#ffbb33]">{{ studentStats.badges }} <span class="text-sm text-[#666688] font-normal">個徽章</span></div>
        </div>
        <div class="bg-[#0a0e27] p-5 rounded-xl border border-[#333366]">
            <div class="text-[#a0a0b8] text-sm mb-1">總學習時數</div>
            <div class="text-3xl font-bold text-[#a78bfa]">{{ Math.floor(studentStats.hours) }} <span class="text-sm text-[#666688] font-normal">分鐘</span></div>
        </div>
      </div>

      <h4 class="text-[#a0a0b8] font-bold mb-4 uppercase tracking-wider text-sm">近期通關紀錄</h4>
      <div class="bg-[#0a0e27] rounded-xl border border-[#333366] overflow-hidden flex-1">
        <div v-if="studentRecords.length === 0" class="p-8 text-center text-[#a0a0b8]">
          <span class="text-2xl block mb-2">📭</span>
          這個學生還沒有留下任何通關紀錄喔！
        </div>
        <div v-else v-for="record in studentRecords" :key="record.id" class="p-4 border-b border-[#333366] last:border-0 flex justify-between items-center hover:bg-white/5 transition-colors">
          <div class="flex flex-col">
            <span class="font-bold text-white">{{ record.level_name }}</span>
            <span class="text-[10px] text-[#666688]">{{ formatTime(record.cleared_at) }}</span>
          </div>
          <div class="text-sm text-[#00d4aa] font-bold tracking-widest">
            <span v-for="n in record.stars" :key="n">⭐</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showMessageModal" class="absolute inset-0 z-50 bg-[#0a0e27]/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div class="bg-[#16162a] border border-[#333366] p-6 rounded-2xl shadow-2xl w-full max-w-md">
        <h3 class="text-xl font-bold text-white mb-2">發送訊息給 {{ selectedStudent.name }}</h3>
        <p class="text-sm text-[#a0a0b8] mb-4">此訊息將會送達學生的個人收件匣。</p>
        
        <textarea 
          v-model="messageText"
          rows="4"
          placeholder="請輸入你要發送的訊息內容..."
          class="w-full bg-[#0a0e27] border border-[#333366] rounded-xl p-3 text-white focus:outline-none focus:border-[#00d4aa] transition-colors resize-none mb-4"
        ></textarea>

        <div v-if="messageAlert" class="mb-4 text-sm font-bold text-[#00d4aa] bg-[#00d4aa]/10 p-2 rounded">
          {{ messageAlert }}
        </div>

        <div class="flex gap-3 justify-end">
          <button @click="showMessageModal = false" :disabled="isSendingMsg" class="px-4 py-2 text-[#a0a0b8] hover:text-white transition-colors">取消</button>
          <button @click="handleSendMessage" :disabled="!messageText.trim() || isSendingMsg" class="px-6 py-2 bg-[#00d4aa] hover:bg-[#00b38f] text-[#0a0e27] font-bold rounded-lg transition-colors disabled:opacity-50">
            <span v-if="isSendingMsg">發送中...</span>
            <span v-else>發送</span>
          </button>
        </div>
      </div>
    </div>

    <div v-if="showBanModal" class="absolute inset-0 z-50 bg-[#0a0e27]/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div class="bg-[#16162a] border border-red-500/30 p-6 rounded-2xl shadow-2xl w-full max-w-md text-center">
        <div class="text-5xl mb-4">{{ selectedStudent.status === 'banned' ? '✅' : '⚠️' }}</div>
        <h3 class="text-xl font-bold text-white mb-2">
          確定要{{ selectedStudent.status === 'banned' ? '解除停權' : '停權' }}嗎？
        </h3>
        <p class="text-sm text-[#a0a0b8] mb-6">
          <span v-if="selectedStudent.status === 'banned'">解除停權後，該學生將能重新登入遊戲並繼續學習。</span>
          <span v-else>停權後，該學生將無法登入系統。這通常用於處理違規或異常帳號。</span>
        </p>

        <div class="flex gap-3 justify-center">
          <button @click="showBanModal = false" :disabled="isUpdatingStatus" class="px-6 py-2 text-[#a0a0b8] bg-[#333366] hover:bg-[#444455] font-bold rounded-lg transition-colors">
            取消
          </button>
          <button @click="handleToggleBan" :disabled="isUpdatingStatus" 
            class="px-6 py-2 font-bold rounded-lg transition-colors disabled:opacity-50 text-white"
            :class="selectedStudent.status === 'banned' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'">
            <span v-if="isUpdatingStatus">處理中...</span>
            <span v-else>確認執行</span>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { supabase } from '../../../../supabase.js'; 

// 基礎狀態
const isLoading = ref(true);
const studentsData = ref([]);
const searchQuery = ref('');
const currentView = ref('list');
const selectedStudent = ref(null);

// 詳情狀態
const isDetailsLoading = ref(false);
const studentRecords = ref([]);
const studentStats = ref({ badges: 0, hours: 0 });

// 🌟 Modal 控制狀態
const showMessageModal = ref(false);
const messageText = ref('');
const isSendingMsg = ref(false);
const messageAlert = ref('');

const showBanModal = ref(false);
const isUpdatingStatus = ref(false);

const fetchStudents = async () => {
  isLoading.value = true;
  try {
    // 1. 抓取所有學生的基本資料
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, username, level, avatar_url, created_at, status')
      .eq('role', 'student')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // 2. 🌟 解決 Bug 關鍵：一次抓取這些學生的通關紀錄
    const studentIds = (profiles || []).map(p => p.id);
    let progressCountMap = {};

    if (studentIds.length > 0) {
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('user_id')
        .in('user_id', studentIds); // 一次撈出所有名單內學生的紀錄

      if (!progressError && progressData) {
        // 計算每個 user_id 出現的次數 (即通關數)
        progressData.forEach(record => {
          progressCountMap[record.user_id] = (progressCountMap[record.user_id] || 0) + 1;
        });
      }
    }

    // 3. 將計算好的通關數與學生資料合併
    studentsData.value = (profiles || []).map(student => ({
      id: student.id,
      name: student.username || '未命名學生',
      level: student.level || 1,
      cleared: progressCountMap[student.id] || 0, 
      lastActive: formatTime(student.created_at),
      avatarUrl: student.avatar_url,
      status: student.status || 'active'
    }));

  } catch (error) {
    console.error('獲取學生名單失敗:', error.message);
  } finally {
    isLoading.value = false;
  }
};

const viewStudentDetails = async (student) => {
  selectedStudent.value = student;
  currentView.value = 'detail';
  await fetchStudentDetails(student.id);
};

const backToList = () => {
  selectedStudent.value = null;
  currentView.value = 'list';
  studentRecords.value = [];
  // 關閉可能開啟的 Modal
  showMessageModal.value = false;
  showBanModal.value = false;
};

const fetchStudentDetails = async (studentId) => {
  isDetailsLoading.value = true;
  try {
    const { data: records } = await supabase.from('user_progress').select('id, course_id, level_id, stars, completed_at').eq('user_id', studentId).order('completed_at', { ascending: false }).limit(5);
    studentRecords.value = (records || []).map(record => ({
      id: record.id,
      level_name: `${record.course_id.charAt(0).toUpperCase() + record.course_id.slice(1)} - 第 ${record.level_id} 關`,
      stars: record.stars,
      cleared_at: record.completed_at
    }));

    const { count } = await supabase.from('user_progress').select('*', { count: 'exact', head: true }).eq('user_id', studentId);
    selectedStudent.value.cleared = count || 0;

    const { data: profileObj } = await supabase.from('profiles').select('badges_count, total_learning_hours').eq('id', studentId).single();
    studentStats.value.badges = profileObj?.badges_count || 0;
    studentStats.value.hours = profileObj?.total_learning_hours || 0;
  } catch (error) {
    console.error('獲取紀錄失敗:', error.message);
  } finally {
    isDetailsLoading.value = false;
  }
};

// 🌟 功能：發送訊息
const handleSendMessage = async () => {
  if (!messageText.value.trim()) return;
  isSendingMsg.value = true;
  messageAlert.value = '';

  try {
    // 獲取當前登入的教師 ID
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) throw new Error('無法驗證您的身分');

    const teacherId = authData.user.id;

    // 寫入 direct_messages 表
    const { error } = await supabase.from('direct_messages').insert({
      sender_id: teacherId,
      receiver_id: selectedStudent.value.id,
      content: messageText.value.trim()
    });

    if (error) throw error;

    messageAlert.value = '✅ 訊息發送成功！';
    setTimeout(() => {
      showMessageModal.value = false;
      messageText.value = '';
      messageAlert.value = '';
    }, 1500);

  } catch (error) {
    console.error('發送失敗', error);
    alert('訊息發送失敗: ' + error.message);
  } finally {
    isSendingMsg.value = false;
  }
};

// 🌟 功能：切換帳號停權狀態
const handleToggleBan = async () => {
  isUpdatingStatus.value = true;
  try {
    // 判斷要切換成什麼狀態
    const newStatus = selectedStudent.value.status === 'banned' ? 'active' : 'banned';

    // 寫入 profiles 表
    const { error } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', selectedStudent.value.id);

    if (error) throw error;

    // 更新本地資料狀態，讓畫面立即反應
    selectedStudent.value.status = newStatus;
    
    // 同時更新列表中該學生的狀態
    const studentInList = studentsData.value.find(s => s.id === selectedStudent.value.id);
    if (studentInList) {
      studentInList.status = newStatus;
    }

    showBanModal.value = false;
  } catch (error) {
    console.error('狀態更新失敗', error);
    alert('狀態更新失敗: ' + error.message);
  } finally {
    isUpdatingStatus.value = false;
  }
};

const formatTime = (dateString) => {
  if (!dateString) return '未記錄';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const filteredStudents = computed(() => {
  if (!searchQuery.value) return studentsData.value;
  const q = searchQuery.value.toLowerCase();
  return studentsData.value.filter(s => s.name.toLowerCase().includes(q));
});

onMounted(() => {
  fetchStudents();
});
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}
.animate-slide-in {
  animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes slideIn {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}
</style>