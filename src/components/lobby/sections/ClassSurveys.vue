<template>
  <div class="animate-fade-in bg-[#16162a] border border-[#333366] rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl h-full max-h-[calc(100vh-100px)] flex flex-col transition-all duration-300">
    
    <div v-if="viewMode === 'list'" class="flex-1 flex flex-col w-full h-full animate-fade-in min-h-0">
      
      <div class="flex flex-col sm:flex-row justify-between items-center bg-[#0a0e27] p-5 rounded-2xl border border-[#4299e1]/30 shadow-[0_0_20px_rgba(66,153,225,0.15)] mb-6 shrink-0 relative overflow-hidden">
        <div class="absolute -right-6 -top-10 text-8xl opacity-5 pointer-events-none">📝</div>
        <div class="flex items-center gap-5 relative z-10">
          <div class="w-14 h-14 bg-[#16162a] border-2 border-[#4299e1] rounded-xl flex items-center justify-center text-3xl shadow-[0_0_15px_rgba(66,153,225,0.3)]">
            📝
          </div>
          <div>
            <h2 class="text-sm font-bold text-[#a0a0b8] tracking-widest mb-1">班級互動</h2>
            <p class="text-[#4299e1] text-2xl font-black drop-shadow-md">問卷系統</p>
          </div>
        </div>
        <div class="mt-4 sm:mt-0 flex items-center gap-3 relative z-10">
          <div class="px-4 py-2 bg-[#16162a] rounded-lg border border-[#333366] text-[#a0a0b8] text-sm font-bold shadow-inner flex gap-3">
            <span>待填寫: <span class="text-[#4299e1]">{{ pendingSurveys.length }}</span></span>
            <span class="w-px bg-[#333366]"></span>
            <span>已完成: <span class="text-white">{{ completedSurveys.length }}</span></span>
          </div>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8 pb-4 min-h-0">
        
        <div>
          <h3 class="text-[#4299e1] font-bold mb-4 flex items-center gap-2 border-b border-[#4299e1]/20 pb-2">
            <span class="relative flex h-3 w-3 mr-1">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4299e1] opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-[#4299e1]"></span>
            </span>
            待辦問卷任務
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div v-for="survey in pendingSurveys" :key="survey.id" class="group bg-[#16162a] p-6 rounded-xl border border-[#4299e1]/40 shadow-[0_0_15px_rgba(66,153,225,0.1)] flex flex-col justify-between hover:border-[#4299e1] transition-all duration-300">
              <div>
                <div class="flex justify-between items-start mb-3">
                  <h4 class="text-white font-bold text-lg leading-snug group-hover:text-[#4299e1] transition-colors">{{ survey.title }}</h4>
                </div>
                <p class="text-sm text-[#a0a0b8] mb-5 leading-relaxed line-clamp-3">{{ survey.desc }}</p>
              </div>
              
              <div>
                <div class="flex items-center gap-2 mb-4">
                  <span class="text-[11px] bg-[#4299e1]/10 text-[#4299e1] px-2.5 py-1 rounded-md font-bold tracking-wider border border-[#4299e1]/30 flex items-center gap-1.5">
                    <span>⏳ 截止:</span>
                    <span class="text-white">{{ survey.deadline }}</span>
                  </span>
                  <span class="text-[11px] bg-[#ffbb33]/10 text-[#ffbb33] px-2.5 py-1 rounded-md border border-[#ffbb33]/30">
                    {{ survey.points }} 積分
                  </span>
                </div>
                <button @click="openSurvey(survey)" class="w-full py-3 bg-[#4299e1]/10 text-[#4299e1] hover:bg-[#4299e1] hover:text-white border border-[#4299e1]/50 rounded-lg transition-all font-bold text-sm tracking-wider flex items-center justify-center gap-2 group-hover:shadow-[0_0_15px_rgba(66,153,225,0.4)]">
                  <span>前往填寫表單</span>
                  <span class="group-hover:translate-x-1 transition-transform">➔</span>
                </button>
              </div>
            </div>
            
            <div v-if="pendingSurveys.length === 0" class="col-span-full flex flex-col items-center justify-center text-[#a0a0b8] py-12 border-2 border-dashed border-[#333366] rounded-xl bg-[#0a0e27]/50">
              <span class="text-4xl mb-3 opacity-50">✨</span>
              <p>太棒了！所有問卷任務都已清空。</p>
            </div>
          </div>
        </div>

        <div class="opacity-80 hover:opacity-100 transition-opacity duration-300">
          <h3 class="text-[#a0a0b8] font-bold mb-4 flex items-center gap-2 border-b border-[#333366] pb-2">
            <span>✅</span> 歷史問卷紀錄
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="survey in completedSurveys" :key="survey.id" class="bg-[#0a0e27] p-5 rounded-xl border border-[#333366] flex justify-between items-center group hover:bg-[#16162a] transition-colors">
              <div>
                <h4 class="text-[#a0a0b8] font-bold group-hover:text-white transition-colors">{{ survey.title }}</h4>
                <span class="text-[11px] text-[#595980] mt-1.5 flex items-center gap-1.5 block">
                  <span>🗓️ 完成於:</span>
                  <span class="text-[#a0a0b8]">{{ survey.completedAt }}</span>
                </span>
              </div>
              <div class="w-10 h-10 rounded-full bg-[#4299e1]/10 flex items-center justify-center border border-[#4299e1]/30">
                <span class="text-[#4299e1] text-xl font-black">✓</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <div v-else-if="viewMode === 'form'" class="flex-1 flex flex-col w-full h-full animate-fade-in-up min-h-0">
      
      <div class="flex items-center justify-between mb-6 shrink-0">
        <button @click="closeSurvey" class="flex items-center gap-2 text-[#a0a0b8] hover:text-[#4299e1] transition-colors font-bold px-4 py-2 bg-[#0a0e27] rounded-lg border border-[#333366] hover:border-[#4299e1]/50">
          <span>⬅</span> 返回列表
        </button>
        <div class="text-[11px] font-bold text-[#4299e1] tracking-widest uppercase bg-[#4299e1]/10 px-3 py-1.5 rounded-full border border-[#4299e1]/30">
          填寫中...
        </div>
      </div>

      <div class="bg-[#0a0e27] border border-[#4299e1]/30 rounded-2xl flex-1 flex flex-col overflow-hidden shadow-[0_0_30px_rgba(66,153,225,0.1)] min-h-0">
        
        <div class="p-6 md:p-8 bg-gradient-to-b from-[#4299e1]/10 to-transparent border-b border-[#333366] shrink-0">
          <h2 class="text-2xl font-black text-white mb-3">{{ currentSurvey.title }}</h2>
          <p class="text-[#a0a0b8] text-sm leading-relaxed">{{ currentSurvey.desc }}</p>
        </div>

        <div class="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 space-y-8 pb-10 min-h-0">
          
          <div v-if="!currentSurvey.form_schema || currentSurvey.form_schema.length === 0" class="text-center py-10 text-[#666688] italic">
            此問卷尚未設定任何題目
          </div>

          <div v-for="(q, index) in currentSurvey.form_schema" :key="q.id" class="space-y-4">
            <h4 class="text-white font-bold text-lg flex items-center gap-2">
              <span class="text-[#4299e1]">{{ index + 1 }}.</span> {{ q.title || '未命名問題' }}
              <span v-if="q.required" class="text-red-500">*</span>
            </h4>
            
            <div v-if="q.type === 'radio'" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <label v-for="opt in q.options" :key="opt" 
                    class="flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200"
                    :class="formAnswers[q.id] === opt ? 'bg-[#4299e1]/20 border-[#4299e1] shadow-[0_0_15px_rgba(66,153,225,0.2)]' : 'bg-[#16162a] border-[#333366] hover:border-[#4299e1]/50'">
                <input type="radio" :value="opt" v-model="formAnswers[q.id]" class="hidden">
                <div class="w-4 h-4 rounded-full border-2 flex items-center justify-center" :class="formAnswers[q.id] === opt ? 'border-[#4299e1]' : 'border-[#666688]'">
                  <div v-if="formAnswers[q.id] === opt" class="w-2 h-2 bg-[#4299e1] rounded-full"></div>
                </div>
                <span class="font-bold" :class="formAnswers[q.id] === opt ? 'text-white' : 'text-[#a0a0b8]'">{{ opt }}</span>
              </label>
            </div>

            <div v-else-if="q.type === 'text'">
              <textarea 
                v-model="formAnswers[q.id]"
                placeholder="請輸入您的回答..."
                class="w-full bg-[#16162a] border-2 border-[#333366] rounded-xl p-4 text-white focus:border-[#4299e1] outline-none transition-colors min-h-[120px] resize-none shadow-inner"
              ></textarea>
            </div>
          </div>

        </div>

        <div class="p-5 border-t border-[#333366] bg-[#16162a]/80 shrink-0 flex justify-end items-center gap-4">
          <span v-if="!isFormValid" class="text-[#ff3366] text-xs font-bold mr-auto ml-2">請完成所有必填題 (*)</span>
          
          <button @click="closeSurvey" class="px-6 py-3 rounded-lg font-bold text-[#a0a0b8] hover:bg-white/5 transition-colors">
            取消
          </button>
          
          <button 
            @click="submitSurvey"
            :disabled="!isFormValid || isSubmitting"
            class="px-8 py-3 rounded-lg font-bold text-white transition-all shadow-[0_4px_0_rgb(49,130,206)] flex items-center gap-2"
            :class="(!isFormValid || isSubmitting) ? 'bg-[#333366] text-[#888] shadow-none cursor-not-allowed' : 'bg-[#4299e1] hover:bg-[#3182ce] hover:translate-y-0.5 hover:shadow-[0_2px_0_rgb(49,130,206)] active:translate-y-1 active:shadow-none'"
          >
            <span v-if="isSubmitting" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            {{ isSubmitting ? '送出中...' : '確認送出表單' }}
          </button>
        </div>

      </div>
    </div>

    <ConfirmModal 
      :isOpen="isConfirmModalOpen"
      :title="confirmModalConfig.title"
      :message="confirmModalConfig.message"
      :confirmText="confirmModalConfig.confirmText"
      :cancelText="confirmModalConfig.cancelText"
      :icon="confirmModalConfig.icon"
      :isDanger="confirmModalConfig.isDanger"
      @confirm="handleModalConfirm"
      @cancel="handleModalCancel"
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { supabase } from '../../../supabase.js';
import ConfirmModal from '../../common/ConfirmModal.vue'; 

// === 狀態管理 ===
const viewMode = ref('list'); // 'list' | 'form'
const currentSurvey = ref(null); 
const isSubmitting = ref(false);
const myProfile = ref({ id: '', class_code: '', xp: 0, level: 1 });
const isLoading = ref(true);

const pendingSurveys = ref([]);
const completedSurveys = ref([]);

// 🌟 動態表單資料儲存區 (取代舊的寫死欄位)
const formAnswers = ref({});

// === 彈跳視窗管理 ===
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

// 🌟 動態表單驗證：檢查所有的必填題 (`required: true`) 是否都有填寫
const isFormValid = computed(() => {
  if (!currentSurvey.value || !currentSurvey.value.form_schema) return false;
  
  return currentSurvey.value.form_schema.every(q => {
    if (!q.required) return true; // 非必填直接通過
    
    const answer = formAnswers.value[q.id];
    if (q.type === 'radio') return !!answer; 
    if (q.type === 'text') return !!answer && String(answer).trim() !== ''; 
    
    return true;
  });
});

// 初始化學生資料
const initStudentSurveys = async () => {
  isLoading.value = true; 
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    isLoading.value = false;
    return;
  }
  
  const { data: profile } = await supabase.from('profiles').select('id, class_code, xp, level').eq('id', user.id).single();
  
  if (profile) {
    myProfile.value = profile;
    await loadSurveys();
  }
  isLoading.value = false;
};

const loadSurveys = async () => {
  const code = myProfile.value.class_code;
  if (!code) return;

  const [
    { data: allSurveys },
    { data: myResponses }
  ] = await Promise.all([
    supabase.from('surveys').select('*').eq('class_code', code).in('status', ['active', 'ended']),
    supabase.from('survey_responses').select('*').eq('user_id', myProfile.value.id)
  ]);

  const respondedIds = myResponses ? myResponses.map(r => r.survey_id) : [];

  if (allSurveys) {
    pendingSurveys.value = allSurveys.filter(s => s.status === 'active' && !respondedIds.includes(s.id)).map(s => ({
      id: s.id,
      title: s.title,
      desc: s.description,
      deadline: s.deadline || '無期限',
      points: s.points,
      form_schema: s.form_schema || [] 
    }));

    completedSurveys.value = allSurveys.filter(s => respondedIds.includes(s.id)).map(s => {
      const matchResp = myResponses.find(r => r.survey_id === s.id);
      return {
        id: s.id,
        title: s.title,
        completedAt: matchResp ? new Date(matchResp.created_at).toISOString().split('T')[0] : '已完成'
      };
    });
  }
};

const openSurvey = (survey) => {
  currentSurvey.value = survey;
  formAnswers.value = {}; 
  viewMode.value = 'form';
};

// 🌟 改用 ConfirmModal 進行防呆提示
const closeSurvey = () => {
  if (Object.keys(formAnswers.value).length > 0) {
    openConfirm({
      title: '放棄作答？',
      message: '表單尚未送出，確定要返回嗎？您剛才填寫的內容將會遺失。',
      confirmText: '放棄作答',
      icon: '⚠️',
      isDanger: true
    }, () => {
      viewMode.value = 'list';
      currentSurvey.value = null;
    });
  } else {
    viewMode.value = 'list';
    currentSurvey.value = null;
  }
};

// 送出問卷
const submitSurvey = async () => {
  if (!isFormValid.value) return;
  isSubmitting.value = true;

  try {
    // 🌟 將動態收集好的答案 (formAnswers.value) 寫入新建立的 `answers` JSONB 欄位中
    const { error: respError } = await supabase.from('survey_responses').insert({
      survey_id: currentSurvey.value.id,
      user_id: myProfile.value.id,
      answers: formAnswers.value 
    });

    if (respError) throw respError;

    // 計算並發放 XP
    const rewardXP = Number(currentSurvey.value.points) || 50;
    let newXP = (myProfile.value.xp || 0) + rewardXP;
    let newLevel = myProfile.value.level || 1;

    const getReqExp = (lvl) => 1000 + (lvl - 1) * 500;
    while (newXP >= getReqExp(newLevel)) {
      newXP -= getReqExp(newLevel);
      newLevel++;
    }

    await supabase.from('profiles').update({
      xp: newXP,
      level: newLevel
    }).eq('id', myProfile.value.id);

    alert(`🎉 問卷送出成功！獲得了 ${rewardXP} 點冒險積分！`);
    
    viewMode.value = 'list';
    currentSurvey.value = null;
    await loadSurveys(); // 實時更新清單狀態
  } catch (err) {
    alert('表單送出出錯，請稍後再試。');
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => initStudentSurveys());
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
.animate-fade-in-up { animation: fadeInUp 0.4s ease-out forwards; }

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 自訂優雅的細滾動條 */
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(66, 153, 225, 0.4); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(66, 153, 225, 0.8); }
</style>