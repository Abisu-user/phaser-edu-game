<template>
  <div class="animate-fade-in bg-[#16162a] border border-[#333366] rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl h-[calc(100vh-120px)] flex flex-col transition-all duration-300">
    <ToastMessage :message="notice.message" :type="notice.type" @dismiss="clearNotice" />
    
    <div class="flex flex-col sm:flex-row justify-between items-center bg-[#0a0e27] p-5 rounded-2xl border border-[#ffbb33]/30 shadow-[0_0_20px_rgba(255,187,51,0.15)] mb-6 shrink-0 relative overflow-hidden">
      <div class="absolute -right-6 -top-10 text-8xl opacity-5 pointer-events-none">📢</div>
      <div class="flex items-center gap-5 relative z-10">
        <div class="w-14 h-14 bg-[#16162a] border-2 border-[#ffbb33] rounded-xl flex items-center justify-center text-3xl shadow-[0_0_15px_rgba(255,187,51,0.3)]">
          📢
        </div>
        <div>
          <h2 class="text-sm font-bold text-[#a0a0b8] tracking-widest mb-1">班級互動管理</h2>
          <p class="text-[#ffbb33] text-2xl font-black drop-shadow-md">公告系統</p>
        </div>
      </div>
      <div v-if="viewMode === 'list'" class="mt-4 sm:mt-0 relative z-10">
        <button @click="createNewItem" class="px-5 py-2.5 rounded-lg font-bold text-[#16162a] bg-[#ffbb33] hover:bg-[#ffcc66] transition-all shadow-[0_0_15px_rgba(255,187,51,0.4)] flex items-center gap-2">
          <span>＋</span> 發佈新公告
        </button>
      </div>
    </div>

    <div v-if="viewMode === 'list'" class="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-5 pb-4 min-h-0 animate-fade-in">
      
      <div v-if="announcements.length === 0" class="flex flex-col items-center justify-center py-20 border-2 border-dashed border-[#333366] rounded-xl bg-[#0a0e27]/50 text-[#a0a0b8]">
        <span class="text-5xl mb-4 opacity-50">📭</span>
        <p>目前還沒有任何公告，趕快發佈一個吧！</p>
      </div>

      <div v-else v-for="item in announcements" :key="item.id" 
           class="bg-[#16162a] p-6 rounded-xl border transition-all shadow-lg relative group"
           :class="item.is_pinned ? 'border-[#ffbb33]/50 shadow-[0_0_15px_rgba(255,187,51,0.1)]' : 'border-[#333366] hover:border-[#a0a0b8]/50'">
        
        <div v-if="item.is_pinned" class="absolute -top-3 -right-3 text-2xl drop-shadow-lg animate-bounce" title="置頂公告">📌</div>

        <div class="flex justify-between items-start mb-2">
          <h4 class="text-white font-bold text-lg leading-snug pr-6" :class="item.is_pinned ? 'text-[#ffbb33]' : ''">
            {{ item.title }}
          </h4>
          <span class="text-[11px] text-[#666688] shrink-0 font-medium bg-[#0a0e27] px-2 py-1 rounded border border-[#333366]">
            🗓️ {{ new Date(item.created_at).toLocaleDateString() }}
          </span>
        </div>
        
        <p class="text-sm text-[#a0a0b8] mt-3 whitespace-pre-wrap leading-relaxed max-h-[100px] overflow-hidden relative">
          {{ item.content }}
          <span v-if="item.content.length > 100" class="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#16162a] to-transparent"></span>
        </p>

        <div class="flex gap-2 mt-5 pt-4 border-t border-[#333366] flex-wrap">
          <button @click="togglePin(item)" class="flex-1 py-2 rounded-lg text-sm font-bold transition-colors shadow-inner flex items-center justify-center gap-1"
                  :class="item.is_pinned ? 'bg-[#ffbb33]/10 text-[#ffbb33] border border-[#ffbb33]/30 hover:bg-[#ffbb33] hover:text-[#16162a]' : 'bg-[#0a0e27] text-[#a0a0b8] border border-[#333366] hover:text-white hover:bg-white/10'">
            {{ item.is_pinned ? '取消置頂' : '📌 設為置頂' }}
          </button>
          <button @click="editItem(item)" class="flex-1 py-2 bg-[#0a0e27] hover:bg-white/10 text-white rounded-lg text-sm font-bold border border-[#333366] transition-colors shadow-inner">
            編輯內容
          </button>
          <button @click="triggerDelete(item)" class="px-3 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-sm font-bold border border-red-500/30 transition-colors shadow-inner flex items-center justify-center" title="刪除此公告">
            🗑️
          </button>
        </div>
      </div>
    </div>

    <div v-else-if="viewMode === 'edit'" class="flex-1 flex flex-col h-full animate-fade-in-up min-h-0">
      <div class="flex-1 overflow-y-auto custom-scrollbar pr-3 space-y-6 pb-6 min-h-0">
        <div v-if="formErrors.permission" class="rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300" role="alert">
          {{ formErrors.permission }}
        </div>
        
        <div class="flex items-center justify-between bg-[#ffbb33]/10 border border-[#ffbb33]/30 p-4 rounded-xl">
          <span class="text-[#ffbb33] font-bold text-sm flex items-center gap-2">
            📌 將此公告置頂 (顯示於最上方)
          </span>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="editingItem.is_pinned" class="sr-only peer">
            <div class="w-11 h-6 bg-[#333366] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ffbb33]"></div>
          </label>
        </div>

        <div class="space-y-2">
          <label class="text-[#a0a0b8] font-bold text-sm">公告標題 <span class="text-red-500">*</span></label>
          <input ref="titleInput" v-model="editingItem.title" @input="formErrors.title = ''" type="text" placeholder="例如：期中考範圍提醒..." :class="formErrors.title ? 'border-red-500 focus:border-red-500' : 'border-[#333366] focus:border-[#ffbb33]'" class="w-full bg-[#0a0e27] border-2 rounded-xl px-4 py-3 text-white font-bold outline-none transition-colors" :aria-invalid="!!formErrors.title">
          <p v-if="formErrors.title" class="text-sm font-bold text-red-400" role="alert">{{ formErrors.title }}</p>
        </div>

        <div class="space-y-2 flex-1 flex flex-col h-full min-h-[250px]">
          <label class="text-[#a0a0b8] font-bold text-sm">公告內容 <span class="text-red-500">*</span></label>
          <textarea ref="contentInput" v-model="editingItem.content" @input="formErrors.content = ''" placeholder="請輸入詳細的公告內容..." :class="formErrors.content ? 'border-red-500 focus:border-red-500' : 'border-[#333366] focus:border-[#ffbb33]'" class="w-full flex-1 bg-[#0a0e27] border-2 rounded-xl px-4 py-3 text-white outline-none transition-colors resize-none custom-scrollbar shadow-inner" :aria-invalid="!!formErrors.content"></textarea>
          <p v-if="formErrors.content" class="text-sm font-bold text-red-400" role="alert">{{ formErrors.content }}</p>
        </div>
      </div>

      <div class="pt-5 border-t border-[#333366] mt-4 flex flex-wrap gap-3 items-center justify-end shrink-0">
        <button @click="cancelEdit" class="px-5 py-2.5 rounded-lg font-bold text-[#a0a0b8] hover:bg-white/10 transition-colors mr-auto">
          取消
        </button>
        <button @click="saveItem" class="px-6 py-2.5 rounded-lg font-bold text-[#16162a] bg-[#ffbb33] hover:bg-[#ffcc66] transition-all shadow-md flex items-center gap-2">
          🚀 發佈公告
        </button>
      </div>
    </div>

    <ConfirmModal 
      :isOpen="isConfirmModalOpen" :title="confirmModalConfig.title" :message="confirmModalConfig.message"
      :confirmText="confirmModalConfig.confirmText" :cancelText="confirmModalConfig.cancelText"
      :icon="confirmModalConfig.icon" :isDanger="confirmModalConfig.isDanger"
      @confirm="handleModalConfirm" @cancel="handleModalCancel"
    />

  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { supabase } from '../../../../supabase.js';
import ConfirmModal from '../../../common/ConfirmModal.vue';
import ToastMessage from '../../../common/ToastMessage.vue';

const viewMode = ref('list'); 
const editingItem = ref(null);
const announcements = ref([]);
const myTeacherProfile = ref({ id: '', class_code: '', role: '' });
const formErrors = ref({ title: '', content: '', permission: '' });
const titleInput = ref(null);
const contentInput = ref(null);
const notice = ref({ message: '', type: 'success' });
let noticeTimer;

const clearNotice = () => {
  clearTimeout(noticeTimer);
  notice.value = { message: '', type: 'success' };
};
const showNotice = (message, type = 'success') => {
  clearNotice();
  notice.value = { message, type };
  noticeTimer = setTimeout(clearNotice, 4500);
};
const getWriteErrorMessage = (err) => {
  const message = String(err?.message || '').toLowerCase();
  if (err?.code === '42501' || /row-level security|permission|policy|not allowed|authorized/.test(message)) {
    return '沒有班級發布權限，請確認教師帳號與班級設定。';
  }
  return '資料庫寫入失敗，請稍後再試。';
};

// 彈跳視窗控制
const isConfirmModalOpen = ref(false);
const confirmAction = ref(null);
const confirmModalConfig = ref({ title: '', message: '', confirmText: '確認', cancelText: '取消', icon: '⚠️', isDanger: false });

const openConfirm = (config, onConfirm) => {
  confirmModalConfig.value = { ...confirmModalConfig.value, ...config };
  confirmAction.value = onConfirm;
  isConfirmModalOpen.value = true;
};
const handleModalConfirm = () => { if (confirmAction.value) confirmAction.value(); isConfirmModalOpen.value = false; };
const handleModalCancel = () => { isConfirmModalOpen.value = false; confirmAction.value = null; };

const initTeacher = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { data: profile, error } = await supabase.from('profiles').select('id, class_code, role').eq('id', user.id).single();
  if (error || !profile) {
    showNotice('無法讀取教師帳號資料，請重新登入後再試。', 'error');
    return;
  }
  myTeacherProfile.value = profile;
  if (profile.role !== 'teacher' || !profile.class_code) {
    showNotice('沒有班級發布權限，請確認教師帳號與班級設定。', 'error');
    return;
  }
  await fetchData();
};

const fetchData = async () => {
  if (!myTeacherProfile.value.class_code) return;
  
  // 按照置頂狀態與建立時間排序 (置頂的在最上面，最新的在前面)
  const { data } = await supabase.from('announcements')
    .select('*')
    .eq('class_code', myTeacherProfile.value.class_code)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });
  
  if (data) announcements.value = data;
};

const createNewItem = () => {
  formErrors.value = { title: '', content: '', permission: '' };
  editingItem.value = { title: '', content: '', is_pinned: false };
  viewMode.value = 'edit';
};

const editItem = (item) => {
  formErrors.value = { title: '', content: '', permission: '' };
  editingItem.value = JSON.parse(JSON.stringify(item));
  viewMode.value = 'edit';
};

const cancelEdit = () => {
  if (editingItem.value.title || editingItem.value.content) {
    openConfirm({ title: '放棄編輯？', message: '確定要放棄編輯嗎？未儲存的內容將會遺失。', confirmText: '放棄', icon: '⚠️', isDanger: true }, () => { viewMode.value = 'list'; });
  } else {
    viewMode.value = 'list';
  }
};

const saveItem = async () => {
  formErrors.value = {
    title: editingItem.value.title.trim() ? '' : '請填寫公告標題。',
    content: editingItem.value.content.trim() ? '' : '請填寫公告內容。',
    permission: ''
  };
  if (formErrors.value.title || formErrors.value.content) {
    await nextTick();
    (formErrors.value.title ? titleInput.value : contentInput.value)?.focus();
    return;
  }
  if (myTeacherProfile.value.role !== 'teacher' || !myTeacherProfile.value.class_code) {
    formErrors.value.permission = '沒有班級發布權限，請確認教師帳號與班級設定。';
    showNotice(formErrors.value.permission, 'error');
    return;
  }

  try {
    const payload = {
      title: editingItem.value.title,
      content: editingItem.value.content,
      is_pinned: editingItem.value.is_pinned,
      class_code: myTeacherProfile.value.class_code,
      created_by: myTeacherProfile.value.id
    };

    let result;
    if (editingItem.value.id) {
      result = await supabase.from('announcements').update(payload).eq('id', editingItem.value.id).select();
    } else {
      result = await supabase.from('announcements').insert(payload).select();
    }

    if (result.error) throw result.error;

    showNotice('公告已成功發布。');
    viewMode.value = 'list';
    await fetchData();
  } catch (err) { 
    console.error('公告儲存失敗:', err);
    formErrors.value.permission = getWriteErrorMessage(err);
    showNotice(formErrors.value.permission, 'error');
  }
};

const togglePin = async (item) => {
  const newStatus = !item.is_pinned;
  const { error } = await supabase.from('announcements').update({ is_pinned: newStatus }).eq('id', item.id);
  if (error) {
    showNotice(getWriteErrorMessage(error), 'error');
    return;
  }
  await fetchData();
};

const triggerDelete = (item) => {
  openConfirm({ title: '刪除公告', message: `確定要刪除「${item.title}」嗎？此動作無法復原！`, confirmText: '永久刪除', icon: '🗑️', isDanger: true }, async () => {
    try {
      const { error } = await supabase.from('announcements').delete().eq('id', item.id);
      if (error) throw error;
      showNotice('公告已刪除。');
      await fetchData();
    } catch (err) { showNotice(getWriteErrorMessage(err), 'error'); }
  });
};

onMounted(() => initTeacher());
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
.animate-fade-in-up { animation: fadeInUp 0.3s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 187, 51, 0.3); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 187, 51, 0.6); }
</style>
