<template>
  <div class="space-y-6 max-w-4xl relative">
    
    <div v-if="isLoading" class="absolute inset-0 bg-[#16162a]/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-[#9d4edd] rounded-2xl">
      <div class="w-10 h-10 border-4 border-[#9d4edd]/30 border-t-[#9d4edd] rounded-full animate-spin mb-3"></div>
      <div class="font-bold tracking-widest animate-pulse">讀取系統設定中...</div>
    </div>

    <div class="bg-[#16162a] border border-[#333366] rounded-2xl p-6 shadow-lg">
      
      <div class="mb-6 pb-6 border-b border-[#333366]">
        <h3 class="font-bold text-[#9d4edd] text-xl flex items-center gap-2 mb-2">
          <span>💬</span> 發布全站跑馬燈公告
        </h3>
        <p class="text-[#a0a0b8] text-sm mb-4">這段文字將會顯示在所有玩家的大廳畫面上。留空則不顯示公告。</p>
        
        <textarea 
          v-model="announcementText" 
          placeholder="請輸入要顯示在大廳的系統公告... (例如：伺服器將於今晚 12 點進行維護，請提早存檔！)"
          class="w-full bg-[#0a0e27] border border-[#333366] rounded-xl p-4 h-32 focus:outline-none focus:border-[#9d4edd] focus:ring-1 focus:ring-[#9d4edd] text-white resize-none transition-all"
        ></textarea>
      </div>

      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        
        <div class="flex items-center gap-4 p-4 bg-[#0a0e27] border border-[#333366] rounded-xl flex-1 w-full sm:w-auto">
          <div class="flex-1">
            <h4 class="text-white font-bold flex items-center gap-2">
              <span>🚧</span> 系統維護模式
            </h4>
            <p class="text-xs text-[#a0a0b8] mt-1">開啟後，一般學生與老師將無法登入遊戲。</p>
          </div>
          
          <label class="relative flex items-center cursor-pointer">
            <input type="checkbox" v-model="isMaintenanceMode" class="sr-only peer">
            <div class="w-14 h-7 bg-[#333366] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-500 shadow-inner"></div>
          </label>
        </div>

        <button 
          @click="triggerSave" 
          :disabled="isSaving"
          class="w-full sm:w-auto px-8 py-4 bg-[#9d4edd] hover:bg-[#8e3ccc] text-white font-bold rounded-xl transition-all shadow-[0_4px_14px_rgba(157,78,221,0.3)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span v-if="isSaving" class="animate-pulse">💾 寫入資料庫中...</span>
          <span v-else>💾 儲存並發布更新</span>
        </button>

      </div>
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
import { ref, onMounted } from 'vue';
import { supabase } from '../../../../supabase'; 
// 引入 Modal
import ConfirmModal from '../../../common/ConfirmModal.vue';

const isLoading = ref(true);
const isSaving = ref(false);

// 表單狀態
const announcementText = ref('');
const isMaintenanceMode = ref(false);

// ==========================================
// Modal 狀態管理
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

const customAlert = (title, message, icon = 'ℹ️') => {
  modalConfig.value = {
    isOpen: true, title, message, confirmText: '我知道了', cancelText: '', icon, isDanger: false, actionType: 'alert'
  };
};

// ==========================================
// API: 讀取系統設定
// ==========================================
const fetchSettings = async () => {
  isLoading.value = true;
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('id', 1) // 我們永遠只抓 id=1 的這筆唯一資料
      .single();

    if (error) throw error;
    
    // 把資料庫的值塞回畫面上
    if (data) {
      announcementText.value = data.announcement_text || '';
      isMaintenanceMode.value = data.is_maintenance || false;
    }
  } catch (error) {
    console.error('讀取系統設定失敗:', error.message);
    customAlert('讀取失敗', '無法獲取系統設定，請檢查資料庫連線。', '🔌');
  } finally {
    isLoading.value = false;
  }
};

// ==========================================
// API: 儲存系統設定
// ==========================================
const triggerSave = () => {
  // 點擊儲存時，先跳出 Modal 二次確認
  modalConfig.value = {
    isOpen: true,
    title: '確定要發布更新嗎？',
    message: isMaintenanceMode.value 
      ? '⚠️ 注意：您已開啟「系統維護模式」，發布後一般玩家將會被強制登出且無法登入！'
      : '您的系統設定與公告即將同步給所有在線上的玩家。',
    confirmText: '確認發布',
    cancelText: '再檢查一下',
    icon: isMaintenanceMode.value ? '🚧' : '📢',
    isDanger: isMaintenanceMode.value, // 如果有開維護模式，按鈕變紅色的警告樣式
    actionType: 'save_settings'
  };
};

const handleModalConfirm = async () => {
  const currentActionType = modalConfig.value.actionType;
  modalConfig.value.isOpen = false;

  if (currentActionType === 'alert') return;

  if (currentActionType === 'save_settings') {
    isSaving.value = true;
    try {
      const { error } = await supabase
        .from('system_settings')
        .update({ 
          announcement_text: announcementText.value,
          is_maintenance: isMaintenanceMode.value,
          updated_at: new Date() // 更新時間戳記
        })
        .eq('id', 1);

      if (error) throw error;
      
      // 更新成功後，跳出成功的 Alert
      setTimeout(() => customAlert('發布成功！', '全站系統設定與公告已成功更新。', '✅'), 300);

    } catch (error) {
      console.error('寫入設定失敗:', error.message);
      setTimeout(() => customAlert('更新失敗', '儲存系統設定時發生錯誤，請稍後再試！', '❌'), 300);
    } finally {
      isSaving.value = false;
    }
  }
};

const handleModalCancel = () => {
  modalConfig.value.isOpen = false;
};

// ==========================================
// 元件掛載時觸發
// ==========================================
onMounted(() => {
  fetchSettings();
});
</script>