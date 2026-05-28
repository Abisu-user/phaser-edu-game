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
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div v-for="poll in activePolls" :key="poll.id" class="bg-[#16162a] p-5 rounded-xl border border-[#a78bfa]/40 shadow-[0_0_15px_rgba(167,139,250,0.1)] relative overflow-hidden flex flex-col">
            <div v-if="poll.hasVoted" class="absolute top-0 right-0 bg-[#a78bfa] text-[#16162a] text-[10px] font-black px-3 py-1 rounded-bl-lg shadow-md">已完成</div>
            
            <h4 class="text-white font-bold mb-5 pr-10 leading-relaxed text-lg">{{ poll.title }}</h4>
            
            <div class="space-y-3 flex-1">
              <label v-for="opt in poll.options" :key="opt.id" 
                    class="flex items-center gap-3 p-3.5 rounded-lg bg-[#0a0e27] border transition-all duration-200"
                    :class="poll.selectedOption === opt.id ? 'border-[#a78bfa] bg-[#a78bfa]/15 shadow-[0_0_10px_rgba(167,139,250,0.2)]' : 'border-[#333366] hover:border-[#a78bfa]/50 cursor-pointer'">
                <input type="radio" :name="'poll-'+poll.id" :value="opt.id" v-model="poll.selectedOption" 
                      class="w-4 h-4 accent-[#a78bfa]" :disabled="poll.hasVoted">
                <span class="text-sm font-medium" :class="poll.selectedOption === opt.id ? 'text-white' : 'text-[#a0a0b8]'">{{ opt.text }}</span>
              </label>
            </div>
            
            <button @click="submitVote(poll)" 
                    :disabled="!poll.selectedOption || poll.hasVoted" 
                    class="mt-5 w-full py-3 rounded-lg font-bold transition-all text-sm tracking-wider"
                    :class="poll.hasVoted ? 'bg-[#333366] text-[#888]' : 'bg-[#a78bfa] hover:bg-[#9061f9] text-[#16162a] shadow-[0_4px_15px_rgba(167,139,250,0.4)] active:translate-y-1 active:shadow-none'">
              {{ poll.hasVoted ? '✅ 您已投過票' : '送出選擇' }}
            </button>
          </div>
          
          <div v-if="activePolls.length === 0" class="col-span-full flex flex-col items-center justify-center text-[#a0a0b8] py-12 border-2 border-dashed border-[#333366] rounded-xl bg-[#0a0e27]/50">
            <span class="text-4xl mb-3 opacity-50">🎉</span>
            <p>目前沒有進行中的投票</p>
          </div>
        </div>
      </div>
      
      <div class="opacity-80 hover:opacity-100 transition-opacity duration-300">
        <h3 class="text-[#a0a0b8] font-bold mb-4 flex items-center gap-2 border-b border-[#333366] pb-2">
          <span>🛑</span> 已截止的投票
        </h3>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div v-for="poll in endedPolls" :key="poll.id" class="bg-[#0a0e27] p-6 rounded-xl border border-[#333366]">
            <h4 class="text-white font-bold mb-5 leading-relaxed">{{ poll.title }}</h4>
            
            <div class="space-y-3">
              <div v-for="opt in poll.options" :key="opt.id" class="relative overflow-hidden p-3 rounded-lg bg-[#16162a] border border-[#333366] flex justify-between items-center z-10">
                <div class="absolute left-0 top-0 bottom-0 bg-[#a78bfa]/10 -z-10 transition-all duration-1000" :style="{ width: `${(opt.votes / poll.totalVotes) * 100}%` }"></div>
                
                <span class="text-sm font-medium flex items-center gap-2" :class="poll.myVote === opt.id ? 'text-[#a78bfa]' : 'text-[#a0a0b8]'">
                  <span v-if="poll.myVote === opt.id" title="你的選擇">★</span>
                  {{ opt.text }}
                </span>
                
                <div class="flex items-center gap-2">
                  <span class="text-[10px] text-[#666688]">{{ Math.round((opt.votes / poll.totalVotes) * 100) }}%</span>
                  <span class="text-xs font-bold bg-[#333366] text-white px-2 py-1 rounded">{{ opt.votes }} 票</span>
                </div>
              </div>
            </div>
            
            <div class="mt-4 text-[11px] text-[#666688] text-right">
              總投票數: {{ poll.totalVotes }} 人
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../../../supabase'; // 請確認你的 Supabase 引入路徑

const myProfile = ref({ id: '', class_code: '' });
const activePolls = ref([]);
const endedPolls = ref([]);
const isLoading = ref(true);

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

  const endedPollIds = pollsData.filter(p => p.status === 'ended').map(p => p.id);
  let endedVotesData = [];
  if (endedPollIds.length > 0) {
    const { data: vData } = await supabase.from('poll_votes').select('poll_id, option_id').in('poll_id', endedPollIds);
    if (vData) endedVotesData = vData;
  }

  // 📝 3. 準備裝填分類好的資料
  const activeTemp = [];
  const endedTemp = [];

  pollsData.forEach(poll => {
    const myVoteRecord = myVotes?.find(v => v.poll_id === poll.id);
    
    const pollObj = {
      id: poll.id,
      title: poll.title,
      status: poll.status,
      options: poll.poll_options || [],
      hasVoted: !!myVoteRecord,
      selectedOption: myVoteRecord ? myVoteRecord.option_id : null,
      myVote: myVoteRecord ? myVoteRecord.option_id : null
    };

    if (poll.status === 'active') {
      activeTemp.push(pollObj);
    } else if (poll.status === 'ended') {
      // 統計已截止的票數與比例
      const pollVotes = endedVotesData.filter(v => v.poll_id === poll.id);
      pollObj.totalVotes = pollVotes.length;
      
      pollObj.options.forEach(opt => {
        opt.votes = pollVotes.filter(v => v.option_id === opt.id).length;
      });
      endedTemp.push(pollObj);
    }
  });

  activePolls.value = activeTemp;
  endedPolls.value = endedTemp;
};

// 送出投票
const submitVote = async (poll) => {
  if (!poll.selectedOption) return;
  
  const { error } = await supabase.from('poll_votes').insert({
    poll_id: poll.id,
    option_id: poll.selectedOption,
    user_id: myProfile.value.id
  });

  if (error) {
    alert('投票失敗，您可能已經投過票囉！');
  } else {
    alert('🎉 投票成功！感謝您的參與！');
    await loadPolls(); // 實時刷新計票與狀態
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