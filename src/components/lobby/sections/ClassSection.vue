<template>
  <div class="animate-fade-in bg-[#16162a] border border-[#333366] rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl min-h-[600px] flex flex-col">
    
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

    <div v-else class="flex-1 flex flex-col w-full h-full max-w-5xl mx-auto">
        
        <div class="flex flex-col sm:flex-row justify-between items-center bg-[#0a0e27] p-5 rounded-2xl border border-[#00d4aa]/30 shadow-[0_0_20px_rgba(0,212,170,0.15)] mb-6 shrink-0 relative overflow-hidden">
            <div class="absolute -right-10 -top-10 text-8xl opacity-5 pointer-events-none">🏫</div>
            <div class="flex items-center gap-5 relative z-10">
                <div class="w-14 h-14 bg-[#16162a] border-2 border-[#00d4aa] rounded-xl flex items-center justify-center text-3xl shadow-[0_0_15px_rgba(0,212,170,0.3)]">
                  🏫
                </div>
                <div>
                  <h2 class="text-sm font-bold text-[#a0a0b8] tracking-widest mb-1">班級首頁</h2>
                  <p class="text-[#00d4aa] text-2xl font-black drop-shadow-md">{{ currentClassName }}</p>
                </div>
            </div>
            
            <div class="mt-4 sm:mt-0 flex items-center gap-3 relative z-10">
                <div class="px-4 py-2 bg-[#16162a] rounded-lg border border-[#333366] text-[#a0a0b8] text-sm font-bold shadow-inner">
                  總成員 {{ classMembers.length }} 人
                </div>
                <button 
                  @click="handleLeaveClass" 
                  class="px-4 py-2 bg-[#ff3366]/10 text-[#ff3366] hover:bg-[#ff3366] hover:text-white rounded-lg border border-[#ff3366]/30 transition-all duration-300 text-sm font-bold"
                >
                  退出班級
                </button>
            </div>
        </div>

        <div v-if="isLoadingMembers" class="flex-1 flex items-center justify-center">
          <div class="w-10 h-10 border-4 border-[#ffbb33]/30 border-t-[#ffbb33] rounded-full animate-spin"></div>
        </div>

        <div v-else class="flex-1 relative space-y-6 animate-fade-in pb-4">
          
          <div class="bg-gradient-to-r from-[#1a1a3a] to-[#0a0e27] border border-[#ffbb33]/40 rounded-xl p-5 shadow-lg flex flex-col min-h-0">
            <h3 class="text-[#ffbb33] font-bold mb-4 flex items-center gap-2 border-b border-[#ffbb33]/20 pb-2 shrink-0">
              <span class="text-xl">📢</span> 班級最新公告
            </h3>
            <div class="space-y-3 overflow-y-auto custom-scrollbar pr-2 max-h-[190px] min-h-0">
              <div v-for="ann in announcements" :key="ann.id" class="bg-[#16162a] p-4 rounded-lg border border-[#333366] flex gap-4 items-start shrink-0">
                <div class="shrink-0 mt-1 w-2 h-2 rounded-full" :class="ann.is_pinned ? 'bg-[#ffbb33] shadow-[0_0_8px_#ffbb33]' : 'bg-[#4299e1]'"></div>
                <div class="flex-1 min-w-0">
                  <div class="flex justify-between items-start mb-1">
                    <h4 class="text-white font-bold truncate pr-2" :title="ann.title">{{ ann.title }}</h4>
                    <span class="text-[10px] text-[#a0a0b8] bg-[#0a0e27] px-2 py-0.5 rounded shrink-0">{{ new Date(ann.created_at).toLocaleDateString() }}</span>
                  </div>
                  <p class="text-[#a0a0b8] text-sm leading-relaxed line-clamp-2">{{ ann.content }}</p>
                </div>
              </div>
              <div v-if="announcements.length === 0" class="text-center text-[#a0a0b8] text-sm italic py-4">目前沒有最新公告</div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="bg-[#0a0e27]/80 border border-[#00d4aa]/40 rounded-xl p-5 shadow-lg flex flex-col">
              <h3 class="text-[#00d4aa] font-bold mb-4 flex items-center gap-2 border-b border-[#00d4aa]/20 pb-2">
                <span>👨‍🏫</span> 指導老師
              </h3>
              <div class="flex-1 flex flex-col justify-center">
                <div v-for="teacher in teachers" :key="teacher.id" class="flex items-center gap-4 bg-[#16162a] p-3 pr-8 rounded-xl border border-[#00d4aa]/20 shadow-[0_4px_10px_rgba(0,0,0,0.2)]">
                  <img v-if="teacher.avatar_url" :src="teacher.avatar_url" alt="avatar" class="w-12 h-12 rounded-full object-cover shadow-[0_0_10px_rgba(0,212,170,0.3)] border-2 border-[#00d4aa]/50" />
                  <div v-else class="w-12 h-12 rounded-full bg-[#00d4aa]/20 flex items-center justify-center text-[#00d4aa] text-lg font-bold shadow-[0_0_10px_rgba(0,212,170,0.3)] border-2 border-[#00d4aa]/50">
                    {{ teacher.username ? teacher.username.charAt(0).toUpperCase() : '師' }}
                  </div>
                  <div>
                    <div class="text-white font-bold text-base">{{ teacher.username || '未命名老師' }}</div>
                    <div class="text-[11px] text-[#00d4aa] tracking-widest mt-0.5">班級管理員</div>
                  </div>
                </div>
                <div v-if="teachers.length === 0" class="text-[#a0a0b8] text-sm italic text-center py-2">尚無老師資料</div>
              </div>
            </div>

            <div class="bg-[#0a0e27]/80 border border-[#a78bfa]/40 rounded-xl p-5 shadow-lg flex flex-col relative overflow-hidden group">
              <div class="absolute -right-4 -top-4 text-7xl opacity-5 group-hover:scale-110 transition-transform pointer-events-none">👑</div>
              <h3 class="text-[#a78bfa] font-bold mb-4 flex items-center gap-2 border-b border-[#a78bfa]/20 pb-2 z-10">
                <span>👑</span> 班級助理
              </h3>
              
              <div class="flex-1 flex flex-col justify-center z-10 gap-3">
                <template v-if="classAssistants.length > 0">
                  <div v-for="assistant in classAssistants" :key="assistant.id" class="flex items-center gap-4 bg-[#16162a] p-3 pr-8 rounded-xl border border-[#a78bfa]/20 shadow-[0_4px_10px_rgba(0,0,0,0.2)]">
                    <img v-if="assistant.avatar_url" :src="assistant.avatar_url" alt="avatar" class="w-12 h-12 rounded-full object-cover shadow-[0_0_10px_rgba(167,139,250,0.3)] border-2 border-[#a78bfa]/50" />
                    <div v-else class="w-12 h-12 rounded-full bg-[#a78bfa]/20 flex items-center justify-center text-[#a78bfa] text-lg font-bold shadow-[0_0_10px_rgba(167,139,250,0.3)] border-2 border-[#a78bfa]/50">
                      {{ assistant.username ? assistant.username.charAt(0).toUpperCase() : '助' }}
                    </div>
                    <div>
                      <div class="text-white font-bold text-base flex items-center gap-2">
                        {{ assistant.username || '未命名學生' }}
                        <span v-if="assistant.id === myUserId" class="text-[9px] bg-[#ffbb33] text-[#16162a] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider">我</span>
                      </div>
                      <div class="text-[11px] text-[#a78bfa] tracking-widest mt-0.5">協助管理 / 發布問卷投票</div>
                    </div>
                  </div>
                </template>
                <div v-else class="text-[#a0a0b8] text-sm italic text-center py-2">目前班級尚未指派助理</div>
              </div>
            </div>
          </div>

          <div class="bg-[#0a0e27]/50 border border-[#333366] rounded-xl p-5 flex flex-col h-[400px] shadow-inner">
            <h3 class="text-white font-bold mb-4 flex items-center gap-2 border-b border-[#333366] pb-2 shrink-0">
              <span>👥</span> 同班同學 <span class="text-[#a0a0b8] text-sm ml-1">({{ students.length }} 人)</span>
            </h3>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 flex-1 overflow-y-auto custom-scrollbar pr-2 content-start pb-2">
              <div v-for="student in students" :key="student.id" 
                  class="flex items-center gap-3 bg-[#16162a] p-3 rounded-lg border transition-all hover:bg-[#1a1a3a]"
                  :class="student.id === myUserId ? 'border-[#ffbb33] shadow-[0_0_10px_rgba(255,187,51,0.15)] bg-gradient-to-r from-[#16162a] to-[#2a220d]' : 'border-[#333366] hover:border-[#ffbb33]/50'">
                
                <img v-if="student.avatar_url" :src="student.avatar_url" alt="avatar" class="w-10 h-10 rounded-full object-cover shrink-0" :class="student.id === myUserId ? 'border-2 border-[#ffbb33]' : ''" />
                <div v-else class="w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0"
                    :class="student.id === myUserId ? 'bg-[#ffbb33] text-[#16162a]' : 'bg-[#333366] text-white'">
                  {{ student.username ? student.username.charAt(0).toUpperCase() : '學' }}
                </div>

                <div class="flex-1 min-w-0">
                  <div class="text-white text-sm font-medium flex items-center gap-2 truncate">
                    <span class="truncate">{{ student.username || '未命名學生' }}</span>
                    <span v-if="student.is_assistant" class="shrink-0 text-[9px] bg-[#a78bfa] text-[#16162a] px-1.5 py-0.5 rounded-sm font-bold tracking-wider">👑 助理</span>
                    <span v-if="student.id === myUserId" class="shrink-0 text-[9px] bg-[#ffbb33] text-[#16162a] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider">我</span>
                  </div>
                  <div class="text-[10px] text-[#a0a0b8] mt-0.5">學生</div>
                </div>
              </div>
              
              <div v-if="students.length === 0" class="col-span-full flex items-center justify-center text-[#a0a0b8] text-sm italic py-8 border-2 border-dashed border-[#333366] rounded-xl min-h-[150px]">
                目前尚無其他同學加入
              </div>
            </div>
          </div>
          
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { supabase } from '../../../supabase';

// === 狀態變數 ===
const inputCode = ref('');
const isSubmitting = ref(false);
const currentClassName = ref(null);
const currentClassCode = ref(null);
const myUserId = ref(null);

const classMembers = ref([]);
const isLoadingMembers = ref(false);
const announcements = ref([]);
let realtimeChannel = null;

const fetchAnnouncements = async (classCode) => {
  const { data } = await supabase.from('announcements')
    .select('*')
    .eq('class_code', classCode)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });
  if (data) announcements.value = data;
};

const teachers = computed(() => classMembers.value.filter(m => m.role && m.role.toLowerCase() === 'teacher'));
const students = computed(() => classMembers.value.filter(m => m.role && m.role.toLowerCase() === 'student'));
const isUnassigned = computed(() => !currentClassCode.value);

// 🌟 尋找班級助理陣列 (支援多位)
const classAssistants = computed(() => students.value.filter(s => s.is_assistant === true));

const fetchClassMembers = async (classCode) => {
  isLoadingMembers.value = true;
  try {
    const { data, error } = await supabase.from('profiles').select('id, username, role, avatar_url, is_assistant').eq('class_code', classCode);
    if (error) throw error;
    classMembers.value = data || [];
  } catch (error) {
    console.error('獲取班級成員失敗:', error.message);
  } finally {
    isLoadingMembers.value = false;
  }
};

const fetchClassMembersSilently = async (classCode) => {
  const { data } = await supabase.from('profiles').select('id, username, role, avatar_url, is_assistant').eq('class_code', classCode);
  if (data) classMembers.value = data;
};

const setupRealtime = async (classCode) => {
  if (realtimeChannel) {
    await supabase.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }
  
  if (!classCode) return;

  const uniqueChannelName = `student_class_updates_${Date.now()}`;

  realtimeChannel = supabase.channel(uniqueChannelName)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `class_code=eq.${classCode}` }, (payload) => {
        if (payload.new && payload.new.class_name) currentClassName.value = payload.new.class_name;
        
        if (payload.new && payload.new.id === myUserId.value && !payload.new.class_code) {
          currentClassCode.value = null; 
          currentClassName.value = null; 
          classMembers.value = [];
          if (realtimeChannel) supabase.removeChannel(realtimeChannel);
          alert('您所屬的班級已被老師解散！'); 
          return;
        }
        
        fetchClassMembersSilently(classCode);
      })
    .subscribe();
};

const fetchMyProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  myUserId.value = user.id;
  
  const { data: profile } = await supabase.from('profiles').select('class_name, class_code').eq('id', user.id).single();
  if (profile && profile.class_code) {
    currentClassName.value = profile.class_name; 
    currentClassCode.value = profile.class_code;
    await Promise.all([
      fetchClassMembers(profile.class_code),
      fetchAnnouncements(profile.class_code)
    ]);
    setupRealtime(profile.class_code); 
  }
};

const handleLeaveClass = async () => {
  const isConfirm = window.confirm('確定要退出目前的班級嗎？退出後您將從老師的名單中移除。');
  if (!isConfirm) return;
  try {
    const { error: updateError } = await supabase.rpc('leave_current_class');
    if (updateError) throw updateError;
    currentClassName.value = null; currentClassCode.value = null; classMembers.value = [];
    if (realtimeChannel) supabase.removeChannel(realtimeChannel);
    alert('已成功退出班級！');
  } catch (error) {
    alert('系統錯誤，請稍後再試');
  }
};

const handleJoinClass = async () => {
  if (!inputCode.value) return;
  isSubmitting.value = true;
  try {
    const code = inputCode.value.trim().toUpperCase();
    const { data: teacher, error: teacherError } = await supabase.from('profiles').select('class_name').eq('role', 'teacher').eq('class_code', code).single();
    if (teacherError || !teacher) { alert('找不到該代碼，請確認老師提供的邀請碼是否正確！'); return; }
    
    const { error: updateError } = await supabase.rpc('join_class_by_code', { p_class_code: code });
    if (updateError) throw updateError;
    
    currentClassName.value = teacher.class_name; currentClassCode.value = code; inputCode.value = '';
    await fetchClassMembers(code);
    setupRealtime(code); 
  } catch (error) {
    alert('系統錯誤，請稍後再試');
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => fetchMyProfile());
onUnmounted(() => { if (realtimeChannel) supabase.removeChannel(realtimeChannel); });
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 自訂優雅的細滾動條 */
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
