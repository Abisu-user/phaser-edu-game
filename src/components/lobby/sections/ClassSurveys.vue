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
          <p class="text-[#a0a0b8] text-sm leading-relaxed whitespace-pre-wrap">{{ currentSurvey.desc }}</p>
        </div>

        <div class="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 space-y-8 pb-10 min-h-0">
          
          <div v-if="!currentSurvey.form_schema || currentSurvey.form_schema.length === 0" class="text-center py-10 text-[#666688] italic">
            此問卷尚未設定任何題目
          </div>

          <div v-for="(q, index) in currentSurvey.form_schema" :key="q.id" class="space-y-4 bg-[#16162a] p-6 rounded-xl border border-[#333366] transition-all hover:border-[#4299e1]/50 shadow-sm">
            <h4 class="text-white font-bold text-lg leading-relaxed flex items-start gap-2">
              <span class="text-[#4299e1] shrink-0 mt-0.5">{{ index + 1 }}.</span>
              <span>{{ q.title || '未命名問題' }}</span>
              <span v-if="q.required" class="text-red-500 font-bold ml-1">*</span>
            </h4>
            
            <div v-if="['short_text', 'paragraph'].includes(q.type)">
              <input v-if="q.type === 'short_text'" v-model="formAnswers[q.id]" type="text" placeholder="您的回答" class="w-full md:w-2/3 bg-transparent border-b border-[#666688] focus:border-[#4299e1] text-white outline-none py-2 transition-colors">
              <textarea v-else v-model="formAnswers[q.id]" placeholder="您的回答" class="w-full bg-[#0a0e27] border border-[#333366] rounded-xl p-4 text-white focus:border-[#4299e1] outline-none transition-colors min-h-[100px] resize-none shadow-inner"></textarea>
            </div>

            <div v-else-if="q.type === 'multiple_choice'" class="space-y-3">
              <label v-for="opt in q.options" :key="opt" class="flex items-center gap-3 cursor-pointer group p-3 rounded-lg hover:bg-[#0a0e27] border border-transparent hover:border-[#333366] transition-all">
                <input type="radio" :name="q.id" :value="opt" v-model="formAnswers[q.id]" class="w-5 h-5 accent-[#4299e1] cursor-pointer">
                <span class="text-white group-hover:text-[#4299e1] transition-colors">{{ opt }}</span>
              </label>
            </div>

            <div v-else-if="q.type === 'checkbox'" class="space-y-3">
              <label v-for="opt in q.options" :key="opt" class="flex items-center gap-3 cursor-pointer group p-3 rounded-lg hover:bg-[#0a0e27] border border-transparent hover:border-[#333366] transition-all">
                <input type="checkbox" :value="opt" v-model="formAnswers[q.id]" class="w-5 h-5 accent-[#4299e1] cursor-pointer rounded">
                <span class="text-white group-hover:text-[#4299e1] transition-colors">{{ opt }}</span>
              </label>
            </div>

            <div v-else-if="q.type === 'dropdown'" class="w-full md:w-2/3">
              <select v-model="formAnswers[q.id]" class="w-full bg-[#0a0e27] border border-[#333366] text-white px-4 py-3 rounded-lg outline-none focus:border-[#4299e1] cursor-pointer">
                <option :value="undefined" disabled selected>請選擇...</option>
                <option v-for="opt in q.options" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </div>

            <div v-else-if="q.type === 'linear_scale'" class="flex flex-col items-center max-w-lg mx-auto mt-4 bg-[#0a0e27] p-6 rounded-xl border border-[#333366] shadow-inner">
              <div class="flex justify-between w-full text-[#a0a0b8] text-sm font-bold mb-6">
                <span>{{ q.scale?.minLabel }}</span>
                <span>{{ q.scale?.maxLabel }}</span>
              </div>
              <div class="flex justify-between w-full">
                <label v-for="n in (q.scale?.max - q.scale?.min + 1)" :key="n" class="flex flex-col items-center gap-3 cursor-pointer group">
                  <span class="text-[#666688] group-hover:text-white font-bold transition-colors" :class="{ 'text-[#4299e1]': formAnswers[q.id] === (Number(q.scale?.min) + n - 1) }">
                    {{ Number(q.scale?.min) + n - 1 }}
                  </span>
                  <input type="radio" :name="q.id" :value="Number(q.scale?.min) + n - 1" v-model="formAnswers[q.id]" class="w-6 h-6 accent-[#4299e1] cursor-pointer">
                </label>
              </div>
            </div>

            <div v-else-if="q.type === 'rating'" class="flex items-center gap-2 text-4xl">
              <span v-for="n in q.ratingMax" :key="n" 
                    @click="formAnswers[q.id] = n" 
                    class="cursor-pointer transition-transform hover:scale-110 drop-shadow-md" 
                    :class="(formAnswers[q.id] || 0) >= n ? 'text-yellow-500' : 'text-[#333366]'">
                ★
              </span>
            </div>

            <div v-else-if="['radio_grid', 'checkbox_grid'].includes(q.type)" class="overflow-x-auto rounded-xl border border-[#333366] bg-[#0a0e27]">
              <table class="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr class="bg-[#16162a]">
                    <th class="p-4 border-b border-[#333366]"></th>
                    <th v-for="col in q.columns" :key="col" class="p-4 text-center text-[#a0a0b8] font-bold border-b border-[#333366]">{{ col }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, rIdx) in q.rows" :key="row" class="border-b border-[#333366] last:border-0 hover:bg-[#16162a]/50 transition-colors">
                    <td class="p-4 text-white font-medium bg-[#16162a]/30">{{ row }}</td>
                    <td v-for="(col, cIdx) in q.columns" :key="cIdx" class="p-4 text-center">
                      <input :type="q.type === 'radio_grid' ? 'radio' : 'checkbox'" 
                             :name="`${q.id}_${rIdx}`" 
                             :value="col" 
                             v-model="formAnswers[`${q.id}_${row}`]" 
                             class="w-5 h-5 accent-[#4299e1] cursor-pointer">
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-else-if="['date', 'time'].includes(q.type)" class="w-full md:w-1/3">
              <input :type="q.type" v-model="formAnswers[q.id]" class="w-full bg-[#0a0e27] border border-[#333366] focus:border-[#4299e1] text-white px-4 py-3 rounded-lg outline-none [color-scheme:dark] transition-colors cursor-pointer">
            </div>

          </div>
        </div>

        <div class="p-5 border-t border-[#333366] bg-[#16162a]/95 backdrop-blur-sm shrink-0 flex justify-end items-center gap-4 z-10">
          <span v-if="!isFormValid" class="text-[#ff3366] text-xs font-bold mr-auto ml-2">⚠️ 請完成所有必填題 (*)</span>
          
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

// 🌟 動態表單資料儲存區
const formAnswers = ref({});

// === 彈跳視窗管理 ===
const isConfirmModalOpen = ref(false);
const confirmAction = ref(null);
const confirmModalConfig = ref({ title: '', message: '', confirmText: '確認', cancelText: '取消', icon: '⚠️', isDanger: false });

const openConfirm = (config, onConfirm) => { confirmModalConfig.value = { ...confirmModalConfig.value, ...config }; confirmAction.value = onConfirm; isConfirmModalOpen.value = true; };
const handleModalConfirm = () => { if (confirmAction.value) confirmAction.value(); isConfirmModalOpen.value = false; };
const handleModalCancel = () => { isConfirmModalOpen.value = false; confirmAction.value = null; };

// 🌟 嚴謹的動態表單驗證 (支援所有題型與網格)
const isFormValid = computed(() => {
  if (!currentSurvey.value || !currentSurvey.value.form_schema) return false;
  
  return currentSurvey.value.form_schema.every(q => {
    if (!q.required) return true; // 非必填直接通過
    
    // 網格題 (Grid) 驗證：每一 row 都必須有值
    if (['radio_grid', 'checkbox_grid'].includes(q.type)) {
      if (!q.rows || q.rows.length === 0) return true;
      return q.rows.every(row => {
        const gridAnswer = formAnswers.value[`${q.id}_${row}`];
        return q.type === 'radio_grid' ? !!gridAnswer : (Array.isArray(gridAnswer) && gridAnswer.length > 0);
      });
    }

    // 多選題 (Checkbox) 驗證：必須至少勾選一個
    if (q.type === 'checkbox') {
      const chkAnswer = formAnswers.value[q.id];
      return Array.isArray(chkAnswer) && chkAnswer.length > 0;
    }

    // 其他題型驗證 (Text, Radio, Dropdown, Scale, Rating, Date/Time)
    const answer = formAnswers.value[q.id];
    return answer !== undefined && answer !== null && String(answer).trim() !== ''; 
  });
});

// 初始化學生資料
const initStudentSurveys = async () => {
  isLoading.value = true; 
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { isLoading.value = false; return; }
  
  const { data: profile } = await supabase.from('profiles').select('id, class_code, xp, level').eq('id', user.id).single();
  if (profile) { myProfile.value = profile; await loadSurveys(); }
  isLoading.value = false;
};

const loadSurveys = async () => {
  const code = myProfile.value.class_code;
  if (!code) return;

  const [ { data: allSurveys }, { data: myResponses } ] = await Promise.all([
    supabase.from('surveys').select('*').eq('class_code', code).in('status', ['active', 'ended']),
    supabase.from('survey_responses').select('*').eq('user_id', myProfile.value.id)
  ]);

  const respondedIds = myResponses ? myResponses.map(r => r.survey_id) : [];

  if (allSurveys) {
    pendingSurveys.value = allSurveys.filter(s => s.status === 'active' && !respondedIds.includes(s.id)).map(s => ({
      id: s.id, title: s.title, desc: s.description, deadline: s.deadline || '無期限', points: s.points, form_schema: s.form_schema || [] 
    }));
    completedSurveys.value = allSurveys.filter(s => respondedIds.includes(s.id)).map(s => {
      const matchResp = myResponses.find(r => r.survey_id === s.id);
      return { id: s.id, title: s.title, completedAt: matchResp ? new Date(matchResp.created_at).toISOString().split('T')[0] : '已完成' };
    });
  }
};

const openSurvey = (survey) => {
  currentSurvey.value = survey;
  
  // 🌟 初始化答案物件 (處理陣列型態的預設值，避免錯誤)
  const initialAnswers = {};
  survey.form_schema.forEach(q => {
    if (q.type === 'checkbox') initialAnswers[q.id] = [];
    if (q.type === 'checkbox_grid') {
      q.rows?.forEach(row => { initialAnswers[`${q.id}_${row}`] = []; });
    }
  });
  formAnswers.value = initialAnswers; 
  viewMode.value = 'form';
};

const closeSurvey = () => {
  // 如果不是空物件 (排除陣列初始化造成的誤判)，則提示
  const hasInput = Object.entries(formAnswers.value).some(([key, val]) => (Array.isArray(val) ? val.length > 0 : !!val));
  
  if (hasInput) {
    openConfirm({ title: '放棄作答？', message: '表單尚未送出，確定要返回嗎？您剛才填寫的內容將會遺失。', confirmText: '放棄作答', icon: '⚠️', isDanger: true }, () => {
      viewMode.value = 'list'; currentSurvey.value = null;
    });
  } else { viewMode.value = 'list'; currentSurvey.value = null; }
};

const submitSurvey = async () => {
  if (!isFormValid.value) return;
  isSubmitting.value = true;

  try {
    const { error: respError } = await supabase.from('survey_responses').insert({
      survey_id: currentSurvey.value.id, user_id: myProfile.value.id, answers: formAnswers.value 
    });
    if (respError) throw respError;

    const rewardXP = Number(currentSurvey.value.points) || 0;
    let expMessage = '';
    
    if (rewardXP > 0) {
      const { error: expError } = await supabase.rpc('add_student_exp', {
        p_user_id: myProfile.value.id,
        p_exp_amount: rewardXP
      });
      
      if (!expError) {
        expMessage = `\n✨ 恭喜獲得 ${rewardXP} 點 EXP！`;
      } else {
        console.error('發放經驗值失敗:', expError);
      }
    }

    alert(`🎉 問卷送出成功！${expMessage}`);
    viewMode.value = 'list'; 
    currentSurvey.value = null; 
    await loadSurveys(); 
    
  } catch (err) { 
    console.error(err);
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
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(66, 153, 225, 0.4); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(66, 153, 225, 0.8); }
</style>