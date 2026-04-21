<template>
  <div class="animate-fade-in bg-[#16162a] border border-[#333366] rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl min-h-[500px] flex flex-col">
    
    <div v-if="isUnassigned" class="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto">
      <div class="text-center mb-8 w-full">
        <div class="inline-block p-4 bg-[#ffbb33]/10 rounded-full mb-4 border border-[#ffbb33]/30 shadow-[0_0_20px_rgba(255,187,51,0.2)]">
          <span class="text-5xl">🎓</span>
        </div>
        <h2 class="text-2xl font-bold text-white">加入班級</h2>
        
        <div class="mt-4 py-2 px-4 bg-[#ff3366]/10 border border-[#ff3366]/30 rounded-lg inline-block">
          <span class="text-[#ff3366] font-bold tracking-widest">目前狀態：未分班</span>
        </div>
        
        <p class="text-[#a0a0b8] mt-4 text-sm">請輸入老師提供的班級邀請碼，綁定您的學習進度與名單</p>
      </div>

      <div class="space-y-6 w-full">
        <div>
          <input 
            v-model="inputCode" 
            type="text" 
            placeholder="例如: GAME01" 
            class="w-full bg-[#0a0e27] border-2 border-[#333366] rounded-xl py-4 px-4 text-center text-3xl font-mono font-bold text-[#ffbb33] focus:border-[#ffbb33] outline-none transition-all uppercase tracking-widest shadow-inner"
            maxlength="10"
            @keyup.enter="handleJoinClass"
          />
        </div>
        
        <button 
          @click="handleJoinClass"
          :disabled="isSubmitting || !inputCode"
          class="w-full py-4 bg-[#ffbb33] hover:bg-[#ffcc66] disabled:bg-[#333366] disabled:text-[#888] disabled:cursor-not-allowed text-[#16162a] font-bold text-lg rounded-xl transition-all shadow-[0_4px_0_rgb(204,136,0)] active:translate-y-1 active:shadow-none flex justify-center items-center gap-2"
        >
          <span v-if="isSubmitting" class="w-5 h-5 border-2 border-[#16162a]/30 border-t-[#16162a] rounded-full animate-spin"></span>
          {{ isSubmitting ? '驗證中...' : '確認加入' }}
        </button>
      </div>
    </div>

    <div v-else class="flex-1 flex flex-col w-full h-full max-w-3xl mx-auto">
        <div class="flex flex-col sm:flex-row justify-between items-center bg-[#0a0e27] p-4 rounded-2xl border border-[#00d4aa]/30 shadow-[0_0_15px_rgba(0,212,170,0.1)] mb-6 shrink-0 transition-all duration-300">
            <div class="flex items-center gap-4">
                <span class="text-4xl">🏫</span>
                <div>
                <h2 class="text-xl font-bold text-white">我的班級</h2>
                <p class="text-[#00d4aa] text-lg font-bold">{{ currentClassName }}</p>
                </div>
            </div>
            
            <div class="mt-4 sm:mt-0 flex items-center gap-3">
                <div class="px-4 py-1.5 bg-[#16162a] rounded-full border border-[#333366] text-[#a0a0b8] text-sm">
                共 {{ classMembers.length }} 位成員
                </div>
                <button 
                @click="handleLeaveClass" 
                class="px-4 py-1.5 bg-[#ff3366]/10 text-[#ff3366] hover:bg-[#ff3366] hover:text-white rounded-full border border-[#ff3366]/30 transition-all duration-300 text-sm font-bold shadow-[0_0_10px_rgba(255,51,102,0.1)] hover:shadow-[0_0_15px_rgba(255,51,102,0.4)]"
                title="退出目前的班級"
                >
                退出班級
                </button>
            </div>
        </div>

      <div v-if="isLoadingMembers" class="flex-1 flex items-center justify-center">
        <div class="w-8 h-8 border-4 border-[#ffbb33]/30 border-t-[#ffbb33] rounded-full animate-spin"></div>
      </div>

      <div v-else class="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
        
        <div class="bg-gradient-to-r from-[#0a0e27] to-[#16162a] border border-[#00d4aa]/40 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div class="absolute -right-4 -top-4 text-7xl opacity-5 pointer-events-none">👨‍🏫</div>
          
          <h3 class="text-[#00d4aa] font-bold mb-4 flex items-center gap-2 border-b border-[#00d4aa]/20 pb-2">
            <span>👨‍🏫</span> 指導老師
          </h3>
          <div class="space-y-3">
            <div v-for="teacher in teachers" :key="teacher.id" class="flex items-center gap-4 bg-[#16162a]/80 p-3 rounded-lg border border-[#00d4aa]/20">
              
              <img v-if="teacher.avatar_url" :src="teacher.avatar_url" alt="avatar" class="w-12 h-12 rounded-full object-cover shadow-[0_0_10px_rgba(0,212,170,0.2)]" />
              <div v-else class="w-12 h-12 rounded-full bg-[#00d4aa]/20 flex items-center justify-center text-[#00d4aa] text-lg font-bold shadow-[0_0_10px_rgba(0,212,170,0.2)]">
                {{ teacher.username ? teacher.username.charAt(0).toUpperCase() : '師' }}
              </div>
              
              <div>
                <div class="text-white font-bold text-lg">{{ teacher.username || '未命名老師' }}</div>
                <div class="text-xs text-[#00d4aa] tracking-widest mt-0.5">班級管理員</div>
              </div>
            </div>
            <div v-if="teachers.length === 0" class="text-[#a0a0b8] text-sm italic">尚無老師資料</div>
          </div>
        </div>

        <div class="bg-[#0a0e27]/50 border border-[#333366] rounded-xl p-5">
          <h3 class="text-[#ffbb33] font-bold mb-4 flex items-center gap-2 border-b border-[#333366] pb-2">
            <span>👥</span> 同班同學 ({{ students.length }})
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div v-for="student in students" :key="student.id" 
                 class="flex items-center gap-3 bg-[#16162a] p-3 rounded-lg border transition-all"
                 :class="student.id === myUserId ? 'border-[#ffbb33] shadow-[0_0_10px_rgba(255,187,51,0.1)]' : 'border-[#333366] hover:border-[#ffbb33]/50'">
              
              <img v-if="student.avatar_url" :src="student.avatar_url" alt="avatar" class="w-10 h-10 rounded-full object-cover" :class="student.id === myUserId ? 'border-2 border-[#16162a]' : ''" />
              <div v-else class="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                   :class="student.id === myUserId ? 'bg-[#ffbb33] text-[#16162a]' : 'bg-[#ffbb33]/20 text-[#ffbb33]'">
                {{ student.username ? student.username.charAt(0).toUpperCase() : '學' }}
              </div>

              <div class="flex-1 truncate">
                <div class="text-white font-medium flex items-center gap-2 truncate">
                  {{ student.username || '未命名學生' }}
                  <span v-if="student.id === myUserId" class="shrink-0 text-[10px] bg-[#ffbb33] text-[#16162a] px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider">我</span>
                </div>
                <div class="text-xs text-[#a0a0b8]">學生</div>
              </div>
            </div>
            <div v-if="students.length === 0" class="text-[#a0a0b8] text-sm italic col-span-full">尚無其他同學</div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
// 🌟 確保引入 onUnmounted 來清除監聽器
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { supabase } from '../../../supabase';

const inputCode = ref('');
const isSubmitting = ref(false);
const currentClassName = ref(null);
const currentClassCode = ref(null); // 🌟 新增：紀錄當前班級代碼
const myUserId = ref(null);

const classMembers = ref([]);
const isLoadingMembers = ref(false);
let realtimeChannel = null; // 🌟 新增：即時監聽頻道

const teachers = computed(() => classMembers.value.filter(m => m.role && m.role.toLowerCase() === 'teacher'));
const students = computed(() => classMembers.value.filter(m => m.role && m.role.toLowerCase() === 'student'));

// 💡 判斷未分班改看 class_code 最準確
const isUnassigned = computed(() => {
  return !currentClassCode.value;
});

// 🌟 關鍵修正：現在撈取同學名單，改用 class_code 而不是 class_name
const fetchClassMembers = async (classCode) => {
  isLoadingMembers.value = true;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, role, avatar_url')
      .eq('class_code', classCode);

    if (error) throw error;
    classMembers.value = data || [];
  } catch (error) {
    console.error('獲取班級成員失敗:', error.message);
  } finally {
    isLoadingMembers.value = false;
  }
};

// 🌟 靜默更新名單 (不會觸發 Loading 轉圈圈)
const fetchClassMembersSilently = async (classCode) => {
  const { data } = await supabase
    .from('profiles')
    .select('id, username, role, avatar_url')
    .eq('class_code', classCode);
  if (data) classMembers.value = data;
};

// 🌟 新增：監聽班級變動 (包含改名、有人加入、被解散)
const setupRealtime = (classCode) => {
  if (realtimeChannel) supabase.removeChannel(realtimeChannel);
  if (!classCode) return;

  realtimeChannel = supabase.channel('student_class_updates')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `class_code=eq.${classCode}` },
      (payload) => {
        console.log('偵測到班級資料變更:', payload);
        
        // 1. 如果老師改了名，立刻更新畫面的 currentClassName
        if (payload.new && payload.new.class_name) {
          currentClassName.value = payload.new.class_name;
        }

        // 2. 如果是自己被解散或踢出 (class_code 變成 null)
        if (payload.new && payload.new.id === myUserId.value && !payload.new.class_code) {
          currentClassCode.value = null;
          currentClassName.value = null;
          classMembers.value = [];
          if (realtimeChannel) supabase.removeChannel(realtimeChannel);
          alert('您所屬的班級已被老師解散！');
          return;
        }

        // 3. 不管是誰加入或改名，默默更新同學名單
        fetchClassMembersSilently(classCode);
      }
    )
    .subscribe();
};

const fetchMyProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  myUserId.value = user.id;
  
  const { data: profile } = await supabase
    .from('profiles')
    // 🌟 同時抓取 class_name 和 class_code
    .select('class_name, class_code')
    .eq('id', user.id)
    .single();

  if (profile && profile.class_code) {
    currentClassName.value = profile.class_name;
    currentClassCode.value = profile.class_code;
    
    await fetchClassMembers(profile.class_code);
    setupRealtime(profile.class_code); // 啟動監聽
  }
};

const handleLeaveClass = async () => {
  const isConfirm = window.confirm('確定要退出目前的班級嗎？退出後您將從老師的名單中移除。');
  if (!isConfirm) return;

  try {
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        class_name: null,
        class_code: null 
      })
      .eq('id', myUserId.value);

    if (updateError) throw updateError;

    currentClassName.value = null;
    currentClassCode.value = null;
    classMembers.value = [];
    if (realtimeChannel) supabase.removeChannel(realtimeChannel);
    alert('已成功退出班級！');

  } catch (error) {
    console.error('退出班級失敗:', error.message);
    alert('系統錯誤，請稍後再試');
  }
};

const handleJoinClass = async () => {
  if (!inputCode.value) return;
  isSubmitting.value = true;

  try {
    const code = inputCode.value.trim().toUpperCase();

    const { data: teacher, error: teacherError } = await supabase
      .from('profiles')
      .select('class_name')
      .eq('role', 'teacher')
      .eq('class_code', code)
      .single();

    if (teacherError || !teacher) {
      alert('找不到該代碼，請確認老師提供的邀請碼是否正確！');
      return;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        class_name: teacher.class_name,
        class_code: code 
      })
      .eq('id', myUserId.value);

    if (updateError) throw updateError;

    currentClassName.value = teacher.class_name;
    currentClassCode.value = code;
    inputCode.value = '';
    
    await fetchClassMembers(code);
    setupRealtime(code); // 啟動監聽

  } catch (error) {
    console.error('加入失敗:', error.message);
    alert('系統錯誤，請稍後再試');
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  fetchMyProfile();
});

onUnmounted(() => {
  // 🌟 離開頁面時清除監聽，避免效能浪費
  if (realtimeChannel) supabase.removeChannel(realtimeChannel);
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(10, 14, 39, 0.5);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(51, 51, 102, 0.8);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 187, 51, 0.5);
}
</style>