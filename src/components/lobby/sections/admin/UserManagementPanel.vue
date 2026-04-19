<template>
  <div class="space-y-6 relative">
    
    <div class="flex flex-col md:flex-row gap-4 justify-between bg-[#16162a] border border-[#333366] rounded-2xl p-5 shadow-lg">
      <div class="relative w-full md:w-72">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[#a0a0b8]">🔍</span>
        <input 
          v-model="searchQuery" type="text" placeholder="搜尋名稱或 Email..." 
          class="w-full bg-[#0a0e27] border border-[#333366] rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-[#ff6b6b] transition-colors"
        >
      </div>
      <div class="flex gap-2 overflow-x-auto hide-scrollbar">
        <button 
          v-for="filter in userFilters" :key="filter.value" @click="currentUserFilter = filter.value"
          class="px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border"
          :class="currentUserFilter === filter.value ? 'bg-[#ff6b6b]/20 text-[#ff6b6b] border-[#ff6b6b]/50 shadow-[0_0_10px_rgba(255,107,107,0.2)]' : 'bg-[#0a0e27] text-[#a0a0b8] border-[#333366] hover:text-white hover:bg-[#333366]'"
        >
          {{ filter.label }}
          <span v-if="filter.value === 'pending' && pendingCount > 0" class="ml-1 inline-flex items-center justify-center w-5 h-5 bg-red-500 text-white text-[10px] rounded-full">
            {{ pendingCount }}
          </span>
        </button>
      </div>
    </div>

    <div class="bg-[#16162a] border border-[#333366] rounded-2xl shadow-lg overflow-x-auto relative min-h-[300px]">
      
      <div v-if="isLoading" class="absolute inset-0 bg-[#16162a]/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-[#9d4edd]">
        <div class="w-10 h-10 border-4 border-[#9d4edd]/30 border-t-[#9d4edd] rounded-full animate-spin mb-3"></div>
        <div class="font-bold tracking-widest animate-pulse">讀取資料庫中...</div>
      </div>

      <table class="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr class="bg-[#0a0e27] border-b border-[#333366] text-[#a0a0b8] text-sm tracking-wider">
            <th class="p-4 font-bold rounded-tl-2xl">使用者 (User)</th>
            <th class="p-4 font-bold">電子郵件 (Email)</th>
            <th class="p-4 font-bold">身份角色 (Role)</th>
            <th class="p-4 font-bold">帳號狀態 (Status)</th>
            <th class="p-4 font-bold text-center rounded-tr-2xl">操作管理 (Actions)</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#333366]">
          
          <tr v-if="!isLoading && filteredUsers.length === 0">
            <td colspan="5" class="p-8 text-center text-[#a0a0b8]">
              <div class="text-4xl mb-2">👻</div>
              找不到符合條件的使用者
            </td>
          </tr>

          <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-white/5 transition-colors group">
            <td class="p-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-[#333366] flex items-center justify-center overflow-hidden border-2" :class="user.role === 'teacher' ? 'border-[#ffbb33]' : 'border-[#00d4aa]'">
                  <img v-if="user.avatar_url" :src="user.avatar_url" class="w-full h-full object-cover">
                  <span v-else class="text-xl">👤</span>
                </div>
                <div>
                  <div class="font-bold text-white">{{ user.username || '未命名玩家' }}</div>
                  <div class="text-xs text-[#a0a0b8]">Lv. {{ user.level || 1 }}</div>
                </div>
              </div>
            </td>
            <td class="p-4 text-sm text-[#a0a0b8]">{{ user.email }}</td>
            <td class="p-4">
              <span 
                class="px-2.5 py-1 rounded-md text-xs font-bold border"
                :class="[
                    user.status === 'pending' 
                    ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' 
                    : (user.role === 'teacher' 
                        ? 'bg-[#ffbb33]/20 text-[#ffbb33] border-[#ffbb33]/30' 
                        : 'bg-[#00d4aa]/20 text-[#00d4aa] border-[#00d4aa]/30')
                ]"
                >
                {{ user.status === 'pending' ? '⏳ 申請審核中' : (user.role === 'teacher' ? '👨‍🏫 教師' : '🎓 學生') }}
                </span>
            </td>
            <td class="p-4">
              <span v-if="user.status === 'active'" class="text-green-400 text-sm font-bold flex items-center gap-1"><div class="w-2 h-2 rounded-full bg-green-400"></div> 正常</span>
              <span v-else-if="user.status === 'pending'" class="text-orange-400 text-sm font-bold flex items-center gap-1 animate-pulse"><div class="w-2 h-2 rounded-full bg-orange-400"></div> 待審核</span>
              <span v-else-if="user.status === 'banned'" class="text-red-500 text-sm font-bold flex items-center gap-1"><div class="w-2 h-2 rounded-full bg-red-500"></div> 已停權</span>
            </td>
            <td class="p-4 text-center">
              <div class="flex items-center justify-center gap-2 transition-opacity" :class="{ 'opacity-50 pointer-events-none': isUpdating === user.id }">
                
                <template v-if="user.status === 'pending'">
                  <button @click="triggerUpdateStatus(user, 'approve')" class="px-3 py-1 bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white rounded text-sm font-bold">核准</button>
                  <button @click="triggerUpdateStatus(user, 'reject')" class="px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded text-sm font-bold">退回</button>
                </template>
                <template v-else>
                  <button v-if="user.status !== 'banned'" @click="triggerUpdateStatus(user, 'ban')" class="p-1.5 rounded bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white" title="停權">🚫</button>
                  <button v-else @click="triggerUpdateStatus(user, 'unban')" class="p-1.5 rounded bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white" title="解除停權">✅</button>
                </template>

              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ConfirmModal 
      :isOpen="modalConfig.isOpen"
      :title="modalConfig.title"
      :message="modalConfig.message"
      :confirmText="modalConfig.confirmText"
      :cancelText="modalConfig.cancelText"
      :icon="modalConfig.icon"
      :isDanger="modalConfig.isDanger"
      @confirm="handleModalConfirm"
      @cancel="handleModalCancel"
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { supabase } from '../../../../supabase'; 
import ConfirmModal from '../../../common/ConfirmModal.vue';

const isLoading = ref(true);
const isUpdating = ref(null); 
const usersData = ref([]);    

// ==========================================
// 共用 Modal 狀態管理系統
// ==========================================
const modalConfig = ref({
  isOpen: false,
  title: '',
  message: '',
  confirmText: '',
  cancelText: '',
  icon: '',
  isDanger: false,
  actionType: '' 
});

const pendingActionData = ref(null); 

const customAlert = (title, message, icon = 'ℹ️') => {
  modalConfig.value = {
    isOpen: true, title, message, confirmText: '我知道了', cancelText: '', icon, isDanger: false, actionType: 'alert'
  };
};

// 🔥 統一處理所有的確認邏輯，根據 action 區分
const triggerUpdateStatus = (user, action) => {
  pendingActionData.value = { userId: user.id, action }; 
  const userName = user.username || '該名玩家';

  if (action === 'approve') {
    modalConfig.value = {
      isOpen: true, title: '確認核准教師', message: `確定要核准 ${userName} 成為正式教師嗎？`,
      confirmText: '確認核准', cancelText: '取消', icon: '👨‍🏫', isDanger: false, actionType: 'update_status'
    };
  } else if (action === 'reject') {
    modalConfig.value = {
      isOpen: true, title: '退回教師申請', message: `確定要退回 ${userName} 的申請嗎？他將恢復為一般學生身分。`,
      confirmText: '確認退回', cancelText: '取消', icon: '❌', isDanger: true, actionType: 'update_status'
    };
  } else if (action === 'ban') {
    modalConfig.value = {
      isOpen: true, title: '確認停權', message: `⚠️ 確定要停權 ${userName} 嗎？他們將無法登入遊戲。`,
      confirmText: '確認停權', cancelText: '取消', icon: '🚫', isDanger: true, actionType: 'update_status'
    };
  } else if (action === 'unban') {
    modalConfig.value = {
      isOpen: true, title: '解除停權', message: `確定要解除 ${userName} 的停權狀態嗎？`,
      confirmText: '確認解除', cancelText: '取消', icon: '✅', isDanger: false, actionType: 'update_status'
    };
  }
};

const handleModalConfirm = async () => {
  const currentActionType = modalConfig.value.actionType;
  modalConfig.value.isOpen = false; 

  if (currentActionType === 'alert') return;

  if (currentActionType === 'update_status' && pendingActionData.value) {
    const { userId, action } = pendingActionData.value;
    isUpdating.value = userId; 

    // 🔥 根據 Action 動態決定要更新的欄位內容 (重點修正區塊)
    let updatePayload = {};
    if (action === 'approve') updatePayload = { status: 'active', role: 'teacher' };
    if (action === 'reject')  updatePayload = { status: 'active', role: 'student' }; // 退回後變回學生
    if (action === 'ban')     updatePayload = { status: 'banned' };
    if (action === 'unban')   updatePayload = { status: 'active' };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updatePayload) // 一次把 status 跟 role 寫進去
        .eq('id', userId);

      if (error) throw error;

      // 更新本地畫面
      const userIndex = usersData.value.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        usersData.value[userIndex].status = updatePayload.status;
        if (updatePayload.role) {
          usersData.value[userIndex].role = updatePayload.role;
        }
      }
    } catch (error) {
      console.error('更新狀態失敗:', error.message);
      setTimeout(() => {
        customAlert('更新失敗', '請確認你的資料庫欄位或網路連線是否正常！', '❌');
      }, 300); 
    } finally {
      isUpdating.value = null; 
      pendingActionData.value = null; 
    }
  }
};

const handleModalCancel = () => {
  modalConfig.value.isOpen = false;
  pendingActionData.value = null;
};


// ==========================================
// 資料庫與過濾邏輯 
// ==========================================
const searchQuery = ref('');
const currentUserFilter = ref('all');
const userFilters = [
  { label: '全部使用者', value: 'all' },
  { label: '學生', value: 'student' },
  { label: '教師', value: 'teacher' },
  { label: '待審核', value: 'pending' }
];

const pendingCount = computed(() => usersData.value.filter(u => u.status === 'pending').length);

const filteredUsers = computed(() => {
  return usersData.value.filter(user => {
    if (currentUserFilter.value === 'student' && user.role !== 'student') return false;
    if (currentUserFilter.value === 'teacher' && user.role !== 'teacher') return false;
    if (currentUserFilter.value === 'pending' && user.status !== 'pending') return false;
    
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      // 🔥 修正：資料庫的欄位是 username，所以這裡改為 user.username
      const nameMatch = user.username ? user.username.toLowerCase().includes(q) : false;
      const emailMatch = user.email ? user.email.toLowerCase().includes(q) : false;
      if (!nameMatch && !emailMatch) return false;
    }
    return true;
  });
});

const fetchUsers = async () => {
  isLoading.value = true;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('role', 'admin') 
      .order('created_at', { ascending: false }); 

    if (error) throw error;
    
    usersData.value = (data || []).map(user => ({
      ...user,
      status: user.status || 'active',
      email: user.email || '未同步信箱' 
    }));
    
  } catch (error) {
    console.error('獲取使用者資料失敗:', error.message);
    customAlert('載入失敗', '無法載入使用者資料，請確認資料庫連線。', '🔌');
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>