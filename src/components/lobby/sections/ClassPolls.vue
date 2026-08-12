<template>
  <div class="animate-fade-in bg-[#16162a] border border-[#333366] rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl h-[calc(100vh-120px)] flex flex-col transition-all duration-300">
    
    <div class="flex flex-col sm:flex-row justify-between items-center bg-[#0a0e27] p-5 rounded-2xl border border-[#a78bfa]/30 shadow-[0_0_20px_rgba(167,139,250,0.15)] mb-6 shrink-0 relative overflow-hidden">
      <div class="absolute -right-6 -top-10 text-8xl opacity-5 pointer-events-none">📊</div>
      <div class="flex items-center gap-5 relative z-10">
        <div class="w-14 h-14 bg-[#16162a] border-2 border-[#a78bfa] rounded-xl flex items-center justify-center text-3xl shadow-[0_0_15px_rgba(167,139,250,0.3)]">
          📊
        </div>
        <div>
          <h2 class="text-sm font-bold text-[#a0a0b8] tracking-widest mb-1">班級互動</h2>
          <p class="text-[#a78bfa] text-2xl font-black drop-shadow-md">投票系統</p>
        </div>
      </div>
      <div class="mt-4 sm:mt-0 flex items-center gap-3 relative z-10">
        <div class="px-4 py-2 bg-[#16162a] rounded-lg border border-[#333366] text-[#a0a0b8] text-sm font-bold shadow-inner flex gap-3">
          <span>進行中: <span class="text-[#a78bfa]">{{ activePolls.length }}</span></span>
          <span class="w-px bg-[#333366]"></span>
          <span>已結束: <span class="text-white">{{ endedPolls.length }}</span></span>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8 pb-4 min-h-0">
      
      <div>
        <h3 class="text-[#a78bfa] font-bold mb-4 flex items-center gap-2 border-b border-[#a78bfa]/20 pb-2">
          <span class="relative flex h-3 w-3 mr-1">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#a78bfa] opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3 w-3 bg-[#a78bfa]"></span>
          </span>
          進行中的投票
        </h3>
        
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div v-for="poll in activePolls" :key="poll.id" class="bg-[#16162a] p-6 rounded-xl border border-[#a78bfa]/40 shadow-[0_0_15px_rgba(167,139,250,0.1)] relative overflow-hidden flex flex-col">
            
            <div v-if="poll.hasVoted" class="absolute top-0 right-0 bg-[#a78bfa] text-[#16162a] text-[10px] font-black px-4 py-1 rounded-bl-lg shadow-md z-10">已完成</div>
            
            <div class="mb-5 z-10">
              <h4 class="text-white font-bold pr-12 leading-relaxed text-xl mb-3">{{ poll.title }}</h4>
              <div class="flex flex-wrap gap-2">
                <span v-if="poll.settings?.expReward" class="text-[10px] bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded border border-yellow-500/20 shadow-sm">✨ +{{ poll.settings.expReward }} EXP</span>
                <span class="text-[10px] bg-[#a78bfa]/10 text-[#a78bfa] px-2 py-0.5 rounded border border-[#a78bfa]/20">
                  {{ poll.settings?.isMultipleChoice ? `多選 (最多 ${poll.settings.maxChoices} 項)` : '單選' }}
                </span>
                <span v-if="poll.settings?.isAnonymous" class="text-[10px] bg-[#666688]/20 text-[#a0a0b8] px-2 py-0.5 rounded border border-[#666688]/30">🕵️ 匿名投票</span>
                <span v-if="poll.settings?.deadline" class="text-[10px] bg-[#ff3366]/10 text-[#ff3366] px-2 py-0.5 rounded border border-[#ff3366]/20">⏳ 限時進行中</span>
              </div>
            </div>
            
            <div v-if="!poll.hasVoted" class="space-y-3 flex-1">
              <label v-for="opt in poll.options" :key="opt.id" 
                    class="flex items-center gap-3 p-4 rounded-xl bg-[#0a0e27]/80 border transition-all duration-200 cursor-pointer group"
                    :class="(poll.settings.isMultipleChoice ? poll.selectedOptions.includes(opt.id) : poll.selectedOption === opt.id) ? 'border-[#a78bfa] bg-[#a78bfa]/10 shadow-[0_0_10px_rgba(167,139,250,0.15)]' : 'border-[#333366] hover:border-[#a78bfa]/50'">
                
                <input v-if="poll.settings.isMultipleChoice" type="checkbox" :value="opt.id" v-model="poll.selectedOptions" 
                      class="w-5 h-5 accent-[#a78bfa] rounded cursor-pointer" 
                      :disabled="poll.selectedOptions.length >= poll.settings.maxChoices && !poll.selectedOptions.includes(opt.id)">
                <input v-else type="radio" :name="'poll-'+poll.id" :value="opt.id" v-model="poll.selectedOption" 
                      class="w-5 h-5 accent-[#a78bfa] cursor-pointer">
                
                <span class="text-[15px] font-medium transition-colors" :class="(poll.settings.isMultipleChoice ? poll.selectedOptions.includes(opt.id) : poll.selectedOption === opt.id) ? 'text-white' : 'text-[#a0a0b8] group-hover:text-white'">{{ opt.text }}</span>
                
                <span v-if="poll.settings.visibility === 'instant'" class="ml-auto text-xs text-[#666688] font-bold">{{ opt.votes }} 票</span>
              </label>

              <button @click="submitVote(poll)" 
                      :disabled="(poll.settings.isMultipleChoice ? poll.selectedOptions.length === 0 : !poll.selectedOption)" 
                      class="mt-6 w-full py-3 rounded-xl font-bold transition-all text-[15px] tracking-wider bg-[#a78bfa] hover:bg-[#9061f9] text-[#16162a] shadow-[0_4px_15px_rgba(167,139,250,0.4)] active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:shadow-none">
                送出選票
              </button>
            </div>

            <div v-else class="flex-1 flex flex-col justify-center">
              
              <div v-if="poll.settings.visibility === 'hidden'" class="flex flex-col items-center justify-center py-8 text-[#666688] bg-[#0a0e27]/50 rounded-xl border border-[#333366] border-dashed">
                <span class="text-3xl mb-2">🔒</span>
                <p class="text-sm font-bold">投票結果隱藏中</p>
                <p class="text-xs mt-1">結算後將由老師公開</p>
              </div>

              <div v-else class="space-y-3 w-full">
                <div v-for="opt in poll.options" :key="opt.id" class="relative overflow-hidden p-3.5 rounded-lg bg-[#0a0e27] border border-[#333366] flex justify-between items-center z-10">
                  <div class="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#a78bfa]/20 to-[#818cf8]/20 -z-10 transition-all duration-1000" :style="{ width: `${poll.totalVotes > 0 ? (opt.votes / poll.totalVotes) * 100 : 0}%` }"></div>
                  
                  <span class="text-sm font-medium flex items-center gap-2" :class="(poll.settings.isMultipleChoice ? poll.myVotes.includes(opt.id) : poll.myVote === opt.id) ? 'text-white' : 'text-[#a0a0b8]'">
                    <span v-if="poll.settings.isMultipleChoice ? poll.myVotes.includes(opt.id) : poll.myVote === opt.id" title="你的選擇" class="text-[#a78bfa] drop-shadow-md">★</span>
                    {{ opt.text }}
                  </span>
                  
                  <div class="flex items-center gap-3">
                    <span class="text-[11px] text-[#888] font-bold">{{ poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0 }}%</span>
                    <span class="text-[11px] font-bold bg-[#16162a] border border-[#333366] text-[#a78bfa] px-2 py-1 rounded-md">{{ opt.votes }} 票</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
          
          <div v-if="activePolls.length === 0" class="col-span-full flex flex-col items-center justify-center text-[#a0a0b8] py-16 border-2 border-dashed border-[#333366] rounded-xl bg-[#0a0e27]/50">
            <span class="text-5xl mb-4 opacity-50">🎉</span>
            <p class="text-lg">目前沒有進行中的投票</p>
          </div>
        </div>
      </div>
      
      <div class="opacity-80 hover:opacity-100 transition-opacity duration-300 pt-4">
        <h3 class="text-[#a0a0b8] font-bold mb-4 flex items-center gap-2 border-b border-[#333366] pb-2">
          <span>🛑</span> 已截止的投票
        </h3>
        
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div v-for="poll in endedPolls" :key="poll.id" class="bg-[#0a0e27] p-6 rounded-xl border border-[#333366]">
            
            <div class="mb-4 flex flex-col gap-2">
              <h4 class="text-white font-bold leading-relaxed text-lg">{{ poll.title }}</h4>
              <div class="flex gap-2">
                <span class="text-[9px] bg-[#333366] text-[#a0a0b8] px-2 py-0.5 rounded">{{ poll.settings?.isMultipleChoice ? '多選' : '單選' }}</span>
                <span v-if="poll.settings?.isAnonymous" class="text-[9px] bg-[#333366] text-[#a0a0b8] px-2 py-0.5 rounded">匿名</span>
              </div>
            </div>
            
            <div class="space-y-2.5">
              <div v-for="opt in poll.options" :key="opt.id" class="relative overflow-hidden p-3 rounded-lg bg-[#16162a] border border-[#333366] flex justify-between items-center z-10">
                <div class="absolute left-0 top-0 bottom-0 bg-[#a78bfa]/15 -z-10 transition-all duration-1000" :style="{ width: `${poll.totalVotes > 0 ? (opt.votes / poll.totalVotes) * 100 : 0}%` }"></div>
                
                <span class="text-sm font-medium flex items-center gap-2" :class="(poll.settings.isMultipleChoice ? poll.myVotes.includes(opt.id) : poll.myVote === opt.id) ? 'text-[#a78bfa]' : 'text-[#a0a0b8]'">
                  <span v-if="poll.settings.isMultipleChoice ? poll.myVotes.includes(opt.id) : poll.myVote === opt.id" title="你的選擇">★</span>
                  {{ opt.text }}
                </span>
                
                <div class="flex items-center gap-2">
                  <span class="text-[10px] text-[#666688] font-bold">{{ poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0 }}%</span>
                  <span class="text-xs font-bold bg-[#333366] text-white px-2 py-1 rounded">{{ opt.votes }} 票</span>
                </div>
              </div>
            </div>
            
            <div class="mt-4 text-[11px] text-[#666688] text-right font-bold">
              總計: {{ poll.totalVotes }} 票
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../../../supabase'; // 請確認 Supabase 路徑

const myProfile = ref({ id: '', class_code: '' });
const activePolls = ref([]);
const endedPolls = ref([]);
const isLoading = ref(true);

// 初始化資料
const initStudentPolls = async () => {
  isLoading.value = true;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { isLoading.value = false; return; }
  
  const { data: profile } = await supabase.from('profiles').select('id, class_code').eq('id', user.id).single();
  if (profile) {
    myProfile.value = profile;
    await loadPolls();
  }
  isLoading.value = false;
};

// 載入投票與選票資料
const loadPolls = async () => {
  const code = myProfile.value.class_code;
  if (!code) return;

  const [
    { data: pollsData },
    { data: myVotes }
  ] = await Promise.all([
    supabase.from('polls').select('*, poll_options(*)').eq('class_code', code).in('status', ['active', 'ended']).order('created_at', { ascending: false }),
    supabase.from('poll_votes').select('poll_id, option_id').eq('user_id', myProfile.value.id)
  ]);

  if (!pollsData) return;

  // 抓取所有票數 (為了計算即時進度條與截止結果)
  const allPollIds = pollsData.map(p => p.id);
  let voteSummary = [];
  if (allPollIds.length > 0) {
    const { data: summaryData } = await supabase.rpc('get_poll_vote_summary', {
      p_poll_ids: allPollIds
    });
    if (summaryData) voteSummary = summaryData;
  }

  const activeTemp = [];
  const endedTemp = [];

  pollsData.forEach(poll => {
    // 💡 匿名防呆處理：檢查 LocalStorage 判斷是否投過匿名票
    const myVoteRecords = myVotes?.filter(v => v.poll_id === poll.id) || [];
    
    // 注入預設 settings 防止報錯
    const settings = poll.settings || { expReward: 0, isAnonymous: false, isMultipleChoice: false, maxChoices: 1, visibility: 'instant' };

    const pollObj = {
      id: poll.id,
      title: poll.title,
      status: poll.status,
      options: poll.poll_options || [],
      settings: settings,
      hasVoted: myVoteRecords.length > 0,
      
      // 狀態儲存 (同時支援單選/多選)
      selectedOption: myVoteRecords.length > 0 ? myVoteRecords[0].option_id : null,
      selectedOptions: myVoteRecords.map(v => v.option_id),
      myVote: myVoteRecords.length > 0 ? myVoteRecords[0].option_id : null,
      myVotes: myVoteRecords.map(v => v.option_id)
    };

    // 計算選項得票數與總數
    const pollVotes = voteSummary.filter(v => v.poll_id === poll.id);
    pollObj.totalVotes = pollVotes.length; // 以「總票數」為分母
    pollObj.totalVotes = pollVotes.reduce((sum, vote) => sum + Number(vote.vote_count || 0), 0);
    pollObj.options.forEach(opt => {
      opt.votes = Number(pollVotes.find(v => v.option_id === opt.id)?.vote_count || 0);
    });

    if (poll.status === 'active') {
      activeTemp.push(pollObj);
    } else if (poll.status === 'ended') {
      endedTemp.push(pollObj);
    }
  });

  activePolls.value = activeTemp;
  endedPolls.value = endedTemp;
};

// 🚀 送出投票邏輯 (🌟 加入發放經驗值的功能！)
const submitVote = async (poll) => {
  let optionIds = [];
  // 💡 如果是匿名，user_id 存為 null (確保票數的後端關聯是斷開的，達成絕對匿名)

  if (poll.settings.isMultipleChoice) {
    if (!poll.selectedOptions || poll.selectedOptions.length === 0) return;
    optionIds = poll.selectedOptions;
  } else {
    if (!poll.selectedOption) return;
    optionIds = [poll.selectedOption];
  }

  const { error } = await supabase.rpc('cast_poll_vote', {
    p_poll_id: poll.id,
    p_option_ids: optionIds
  });

  if (error) {
    alert('投票失敗！請確認網路狀態。');
  } else {
    // 💡 如果是匿名，將投票紀錄存入本地瀏覽器防重複
    // ==========================================
    // 🌟 發放經驗值邏輯
    // ==========================================
    let expMessage = '';
    if (poll.settings?.expReward > 0) {
      // 呼叫我們剛剛在 Supabase 建立的 RPC
      const { data: awardedXp, error: expError } = await supabase.rpc('claim_poll_reward', {
        p_poll_id: poll.id
      });
      
      if (!expError && awardedXp > 0) {
        expMessage = `\n✨ 恭喜獲得 ${awardedXp} 點 EXP！`;
      } else {
        console.error('發放經驗值失敗:', expError);
      }
    }

    alert(`🎉 投票成功！${expMessage}`);
    await loadPolls(); // 實時刷新畫面與狀態
  }
};

onMounted(() => initStudentPolls());
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: rgba(10, 14, 39, 0.5); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(167, 139, 250, 0.5); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(167, 139, 250, 0.8); }
</style>
