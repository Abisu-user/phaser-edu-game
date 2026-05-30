<template>
  <div class="h-full flex flex-col relative min-h-0">

    <div v-if="viewMode === 'list'" class="flex-1 flex flex-col min-h-0 animate-fade-in">

      <div class="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6 pb-4">
        <div v-if="pollsList.length === 0" class="flex flex-col items-center justify-center py-20 border-2 border-dashed border-[#333366] rounded-xl bg-[#0a0e27]/50 text-[#a0a0b8]">
          <span class="text-5xl mb-4 opacity-50">📭</span>
          <p>目前還沒有任何投票，趕快建立一個吧！</p>
        </div>

        <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div v-for="item in pollsList" :key="item.id" class="bg-[#16162a] p-5 rounded-xl border border-[#333366] flex flex-col justify-between hover:border-[#a0a0b8]/50 transition-all shadow-lg">
            <div>
              <div class="flex justify-between items-start mb-3">
                <h4 class="text-white font-bold text-lg leading-snug">{{ item.title }}</h4>
                <span class="text-[10px] px-2 py-1 rounded font-bold tracking-wider shrink-0" :class="getStatusClass(item.status)">
                  {{ getStatusText(item.status) }}
                </span>
              </div>
              
              <div class="flex flex-wrap gap-2 mb-3">
                <span v-if="item.settings?.expReward" class="text-[10px] bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded border border-yellow-500/20">✨ {{ item.settings.expReward }} EXP</span>
                <span class="text-[10px] bg-[#a78bfa]/10 text-[#a78bfa] px-2 py-0.5 rounded border border-[#a78bfa]/20">
                  {{ item.settings?.isMultipleChoice ? `多選 (最多 ${item.settings.maxChoices} 項)` : '單選' }}
                </span>
                <span v-if="item.settings?.isAnonymous" class="text-[10px] bg-[#666688]/20 text-[#a0a0b8] px-2 py-0.5 rounded border border-[#666688]/30">🕵️ 匿名</span>
              </div>

              <div v-if="item.status === 'active'" class="space-y-3 mt-3 bg-[#0a0e27] p-3.5 rounded-xl border border-[#a78bfa]/20 shadow-inner">
                <div class="text-xs text-[#a78bfa] font-bold flex justify-between items-center mb-1">
                  <span>📈 即時數據監控</span>
                  <span class="bg-[#a78bfa]/10 px-2 py-0.5 rounded text-white">已投: {{ getUniqueVotersCount(item) }} 人</span>
                </div>
                <div v-if="item.settings?.visibility === 'hidden' && item.status !== 'ended'" class="text-center text-[#666688] text-xs py-2">
                  🔒 數據隱藏中，結算後公開
                </div>
                <div v-else v-for="opt in item.options" :key="opt.id" class="space-y-1">
                  <div class="flex justify-between text-xs font-medium">
                    <span class="text-[#a0a0b8] truncate max-w-[70%]">{{ opt.text }}</span>
                    <span class="text-white font-bold">{{ opt.votesCount || 0 }} 票 ({{ item.totalVotes > 0 ? Math.round((opt.votesCount / item.totalVotes) * 100) : 0 }}%)</span>
                  </div>
                  <div class="w-full h-2 bg-[#16162a] rounded-full overflow-hidden border border-white/5">
                    <div class="h-full bg-gradient-to-r from-[#a78bfa] to-[#818cf8] transition-all duration-500" :style="{ width: `${item.totalVotes > 0 ? (opt.votesCount / item.totalVotes) * 100 : 0}%` }"></div>
                  </div>
                </div>
              </div>

              <p v-if="item.status === 'draft'" class="text-sm text-[#666688] mt-2 italic">此投票仍為草稿，發佈後可即時追蹤票數。</p>
              <p v-if="item.status === 'ended'" class="text-sm text-[#ff3366] mt-2 italic">投票已截止，可查看詳細結算報告。</p>
            </div>
            
            <div class="flex gap-2 mt-5 pt-4 border-t border-[#333366] flex-wrap">
              <button v-if="item.status !== 'ended'" @click="editItem(item)" class="flex-1 py-2 bg-[#0a0e27] hover:bg-white/10 text-white rounded-lg text-sm font-bold border border-[#333366] transition-colors shadow-inner">編輯 / 預覽</button>
              
              <button v-if="item.status === 'draft'" @click="publishFromList(item)" class="flex-1 py-2 text-white rounded-lg text-sm font-bold transition-colors bg-[#a78bfa]/20 text-[#a78bfa] hover:bg-[#a78bfa] hover:text-[#16162a]">發佈</button>
              
              <button v-if="item.status === 'active' || item.status === 'ended'" @click="viewPollResult(item)" class="flex-1 py-2 text-white rounded-lg text-sm font-bold transition-colors bg-[#00d4aa]/20 text-[#00d4aa] hover:bg-[#00d4aa] hover:text-[#16162a]">查看結果</button>
              
              <button v-if="item.status === 'active'" @click="endItem(item)" class="flex-1 py-2 bg-[#ff3366]/20 text-[#ff3366] hover:bg-[#ff3366] hover:text-white rounded-lg text-sm font-bold transition-colors">結束 / 結算</button>
              
              <button @click="triggerDelete(item)" class="px-3 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-sm font-bold border border-red-500/30 transition-colors shadow-inner" title="刪除此項目">🗑️</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="viewMode === 'result' && selectedPoll" class="flex-1 flex flex-col bg-[#0a0e27] rounded-xl border border-[#333366] shadow-inner mb-2 animate-fade-in relative min-h-[550px]">
      
      <div class="flex items-center justify-between p-4 border-b border-[#333366] bg-[#16162a]/80 rounded-t-xl shrink-0 backdrop-blur-sm">
        <button @click="viewMode = 'list'" class="flex items-center gap-2 text-[#a0a0b8] hover:text-[#00d4aa] transition-colors text-sm font-bold bg-[#333366]/30 hover:bg-[#333366]/60 px-4 py-2 rounded-lg">
          <span>⬅</span> 返回列表
        </button>
        <div class="text-white font-bold text-lg flex items-center gap-3">
          📊 投票結算報告
          <span class="text-[10px] px-2 py-1 rounded tracking-wider" :class="getStatusClass(selectedPoll.status)">{{ getStatusText(selectedPoll.status) }}</span>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto custom-scrollbar p-5 md:p-6">
        <div class="flex flex-col min-h-full">
          
          <div class="text-center mb-8 shrink-0">
            <h2 class="text-3xl font-black text-white mb-4">{{ selectedPoll.title }}</h2>
            <div class="flex flex-wrap items-center justify-center gap-3 text-sm text-[#a0a0b8]">
              <span class="bg-[#333366]/40 border border-[#333366] px-4 py-1.5 rounded-full shadow-sm">總參與人數: <strong class="text-white ml-1">{{ uniqueVoterIds.length }} / {{ classStudents.length }}</strong> 人</span>
              <span class="bg-[#333366]/40 border border-[#333366] px-4 py-1.5 rounded-full shadow-sm">總票數: <strong class="text-[#a78bfa] ml-1">{{ selectedPoll.totalVotes }}</strong> 票</span>
              <span v-if="selectedPoll.settings?.isAnonymous" class="bg-[#666688]/30 border border-[#666688]/50 px-4 py-1.5 rounded-full shadow-sm">🕵️ 匿名投票</span>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 items-stretch min-h-0">
            
            <div class="bg-[#16162a] p-6 rounded-xl border border-[#333366] shadow-lg flex flex-col h-full">
              <h3 class="text-[#a78bfa] font-bold text-lg mb-6 flex items-center gap-2 shrink-0 border-b border-[#333366] pb-3">
                <span>📈</span> 選項得票分佈
              </h3>
              
              <div class="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
                <div v-for="opt in selectedPoll.options" :key="opt.id" class="relative">
                  <div class="flex justify-between items-end mb-2">
                    <span class="text-white font-medium text-sm pr-4 break-words flex-1">{{ opt.text }}</span>
                    <div class="text-right shrink-0 ml-4">
                      <div class="text-[#a78bfa] font-black text-xl leading-none">{{ opt.votesCount || 0 }} <span class="text-xs font-normal text-[#666688]">票</span></div>
                      <div class="text-[#a0a0b8] text-[11px] font-mono mt-1">{{ selectedPoll.totalVotes > 0 ? Math.round((opt.votesCount / selectedPoll.totalVotes) * 100) : 0 }}%</div>
                    </div>
                  </div>
                  <div class="w-full h-2.5 bg-[#0a0e27] rounded-full overflow-hidden border border-[#333366] shadow-inner">
                    <div class="h-full bg-gradient-to-r from-[#a78bfa] to-[#00d4aa] transition-all duration-1000 relative" :style="{ width: `${selectedPoll.totalVotes > 0 ? (opt.votesCount / selectedPoll.totalVotes) * 100 : 0}%` }">
                      <div class="absolute inset-0 w-full h-full opacity-30" style="background-image: linear-gradient(45deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.2) 75%, transparent 75%, transparent); background-size: 1rem 1rem;"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-6 h-full min-h-0">
              
              <div class="bg-[#16162a] p-6 rounded-xl border border-[#333366] shadow-lg shrink-0">
                <h3 class="text-[#00d4aa] font-bold text-lg mb-4 flex items-center gap-2">
                  <span>👥</span> 班級參與率
                </h3>
                <div class="flex items-center gap-4">
                  <div class="flex-1 h-4 bg-[#0a0e27] rounded-full overflow-hidden border border-[#333366] shadow-inner relative">
                    <div class="h-full bg-[#00d4aa] transition-all duration-1000 relative" :style="{ width: `${classStudents.length > 0 ? (uniqueVoterIds.length / classStudents.length) * 100 : 0}%` }">
                      <div class="absolute inset-0 w-full h-full opacity-30" style="background-image: linear-gradient(45deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.2) 75%, transparent 75%, transparent); background-size: 1rem 1rem;"></div>
                    </div>
                  </div>
                  <div class="text-3xl font-black text-[#00d4aa] drop-shadow-md">{{ classStudents.length > 0 ? Math.round((uniqueVoterIds.length / classStudents.length) * 100) : 0 }}%</div>
                </div>
              </div>

              <div class="bg-[#16162a] rounded-xl border border-[#333366] shadow-lg overflow-hidden flex flex-col flex-1 min-h-[250px]">
                <div class="flex border-b border-[#333366] bg-[#0a0e27]/50 shrink-0">
                  <button @click="activeResultTab = 'voted'" class="flex-1 py-3.5 text-sm font-bold transition-colors border-b-2" :class="activeResultTab === 'voted' ? 'bg-[#00d4aa]/10 text-[#00d4aa] border-[#00d4aa]' : 'text-[#a0a0b8] border-transparent hover:bg-white/5 hover:text-white'">✅ 已投票 ({{ votedStudents.length }})</button>
                  <button @click="activeResultTab = 'unvoted'" class="flex-1 py-3.5 text-sm font-bold transition-colors border-b-2" :class="activeResultTab === 'unvoted' ? 'bg-[#ff3366]/10 text-[#ff3366] border-[#ff3366]' : 'text-[#a0a0b8] border-transparent hover:bg-white/5 hover:text-white'">❌ 未投票 ({{ unvotedStudents.length }})</button>
                </div>
                
                <div class="flex-1 overflow-y-auto custom-scrollbar p-5 bg-[#0a0e27]/30">
                  <div v-if="activeResultTab === 'voted'" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div v-for="student in votedStudents" :key="student.id" class="flex items-center gap-3 bg-[#16162a] p-2.5 rounded-lg border border-[#00d4aa]/30 shadow-sm hover:border-[#00d4aa]/60 transition-colors">
                      <img v-if="student.avatar_url" :src="student.avatar_url" class="w-7 h-7 rounded-full object-cover border border-[#00d4aa]/50">
                      <div v-else class="w-7 h-7 rounded-full bg-[#00d4aa]/20 text-[#00d4aa] flex items-center justify-center text-[11px] font-bold border border-[#00d4aa]/50">{{ student.username ? student.username.charAt(0) : '學' }}</div>
                      <span class="text-white text-xs truncate font-medium">{{ student.username || '未命名' }}</span>
                    </div>
                    <div v-if="votedStudents.length === 0" class="col-span-full flex flex-col items-center justify-center text-[#666688] text-sm py-10 h-full">
                      <span class="text-4xl mb-2 opacity-50">👻</span>
                      目前還沒有人投票
                    </div>
                  </div>

                  <div v-if="activeResultTab === 'unvoted'" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div v-for="student in unvotedStudents" :key="student.id" class="flex items-center gap-3 bg-[#16162a] p-2.5 rounded-lg border border-[#ff3366]/20 shadow-sm hover:border-[#ff3366]/50 transition-colors">
                      <img v-if="student.avatar_url" :src="student.avatar_url" class="w-7 h-7 rounded-full object-cover grayscale opacity-60 border border-[#ff3366]/30">
                      <div v-else class="w-7 h-7 rounded-full bg-[#ff3366]/10 text-[#ff3366] flex items-center justify-center text-[11px] font-bold border border-[#ff3366]/30">{{ student.username ? student.username.charAt(0) : '學' }}</div>
                      <span class="text-[#a0a0b8] text-xs truncate">{{ student.username || '未命名' }}</span>
                    </div>
                    <div v-if="unvotedStudents.length === 0" class="col-span-full flex flex-col items-center justify-center text-[#00d4aa] font-bold text-sm py-10 h-full">
                      <span class="text-4xl mb-2">🎉</span>
                      太棒了！全班都已經完成投票！
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="viewMode === 'edit'" class="flex-1 flex overflow-hidden bg-[#0a0e27] rounded-xl border border-[#333366] shadow-inner mb-2 animate-fade-in">
      <div class="flex-1 overflow-y-auto custom-scrollbar p-5 md:p-8 space-y-6">
        
        <div class="bg-[#16162a] border-t-8 border-[#a78bfa] p-6 rounded-xl shadow-lg relative">
          <input v-model="editingItem.title" type="text" placeholder="投票標題" class="w-full bg-transparent text-3xl text-white font-black outline-none border-b border-transparent focus:border-[#a78bfa] pb-2 transition-colors mb-4">
        </div>

        <div class="bg-[#16162a] p-6 rounded-xl border border-[#333366] shadow-md group focus-within:border-l-4 focus-within:border-l-[#a78bfa] transition-all">
          <h3 class="text-white text-lg font-bold mb-5 flex items-center gap-2">⚙️ 投票進階設定</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-[#a0a0b8] text-sm font-bold">✨ 經驗值獎勵</label>
              <div class="flex items-center gap-2">
                <input v-model="editingItem.settings.expReward" type="number" min="0" class="bg-[#0a0e27] border border-[#333366] text-white rounded-lg px-3 py-2 w-24 outline-none focus:border-[#a78bfa]">
                <span class="text-[#666688] text-sm">EXP</span>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-[#a0a0b8] text-sm font-bold">🕵️ 隱私設定</label>
              <div class="flex items-center gap-4 mt-2">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" v-model="editingItem.settings.isAnonymous" :value="false" class="w-4 h-4 accent-[#a78bfa]">
                  <span class="text-white text-sm">公開記名</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" v-model="editingItem.settings.isAnonymous" :value="true" class="w-4 h-4 accent-[#a78bfa]">
                  <span class="text-white text-sm">匿名投票</span>
                </label>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-[#a0a0b8] text-sm font-bold">☑️ 投票規則</label>
              <div class="flex items-center gap-3 mt-1">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="editingItem.settings.isMultipleChoice" class="w-4 h-4 accent-[#a78bfa] rounded">
                  <span class="text-white text-sm">允許開放多選</span>
                </label>
                <div v-if="editingItem.settings.isMultipleChoice" class="flex items-center gap-2 animate-fade-in">
                  <span class="text-[#666688] text-sm">最多選</span>
                  <input v-model="editingItem.settings.maxChoices" type="number" min="2" class="bg-[#0a0e27] border border-[#333366] text-white rounded px-2 py-1 w-16 outline-none focus:border-[#a78bfa] text-sm">
                  <span class="text-[#666688] text-sm">項</span>
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-[#a0a0b8] text-sm font-bold">📊 結果公開時機</label>
              <select v-model="editingItem.settings.visibility" class="bg-[#0a0e27] border border-[#333366] text-white rounded-lg px-3 py-2 w-full outline-none focus:border-[#a78bfa] text-sm">
                <option value="instant">即時公開 (所有人可見目前票數)</option>
                <option value="after_vote">投完才顯示 (防跟風效應)</option>
                <option value="hidden">完全隱藏 (僅老師可見，結算後公開)</option>
              </select>
            </div>
            
            <div class="space-y-2 md:col-span-2">
              <label class="text-[#a0a0b8] text-sm font-bold">⏳ 截止時間 (選填)</label>
              <div class="flex items-center gap-2">
                <input v-model="editingItem.settings.deadline" type="datetime-local" class="bg-[#0a0e27] border border-[#333366] text-white rounded-lg px-3 py-2 outline-none focus:border-[#a78bfa] text-sm [color-scheme:dark]">
                <span class="text-[#666688] text-xs">到達時間將自動截止投票</span>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-[#16162a] p-6 rounded-xl border border-[#333366] shadow-md group focus-within:border-l-4 focus-within:border-l-[#a78bfa] transition-all">
          <h3 class="text-white text-lg font-bold mb-5 flex items-center gap-2">選項內容 <span class="text-xs font-normal text-[#666688]">(最少需 2 個選項)</span></h3>
          
          <div class="space-y-3 pl-2">
            <div v-for="(opt, index) in editingItem.options" :key="index" class="flex items-center gap-3">
              <span class="text-[#666688] text-lg">{{ editingItem.settings.isMultipleChoice ? '☐' : '⚪' }}</span>
              <input v-model="opt.text" type="text" placeholder="選項內容..." class="flex-1 bg-transparent border-b border-transparent hover:border-[#333366] focus:border-[#a78bfa] text-white outline-none py-1">
              <button @click="removeOption(index)" class="text-[#666688] hover:text-red-500">✕</button>
            </div>
            <button @click="addOption" class="text-[#a78bfa] text-sm font-bold flex items-center gap-1 mt-4">
              <span>＋</span> 新增選項
            </button>
          </div>
        </div>
        
        <div class="pb-10"></div>
      </div>

      <div class="w-16 md:w-20 bg-[#16162a] border-l border-[#333366] flex flex-col items-center py-4 md:py-6 gap-4 shrink-0 z-10 overflow-y-auto custom-scrollbar">
        <button @click="viewMode = 'list'" class="w-10 h-10 shrink-0 text-[#a0a0b8] hover:text-white bg-[#333366]/50 rounded-lg flex items-center justify-center transition-all mb-2" title="返回">⬅</button>
        <div class="w-8 h-px bg-[#333366] shrink-0"></div>
        <button @click="viewMode = 'preview'" class="w-10 h-10 shrink-0 text-[#a0a0b8] hover:text-white hover:bg-white/10 rounded-lg flex items-center justify-center transition-all" title="學生視角預覽">👁️</button>
        
        <div class="mt-auto flex flex-col gap-3 shrink-0 w-full items-center pt-4">
          <button @click="saveItem('draft')" class="flex flex-col items-center text-[#a0a0b8] hover:text-white group" title="存為草稿">
            <span class="text-lg group-hover:scale-110 transition-transform">💾</span>
            <span class="text-[10px] mt-1 font-bold hidden md:block">草稿</span>
          </button>
          <button @click="saveItem('active')" class="w-10 h-10 md:w-12 md:h-12 shrink-0 bg-[#a78bfa] text-[#16162a] rounded-full font-bold shadow-[0_0_15px_rgba(167,139,250,0.4)] hover:scale-110 transition-all flex items-center justify-center text-xl mt-2" title="發佈">🚀</button>
        </div>
      </div>
    </div>

    <div v-else-if="viewMode === 'preview'" class="flex-1 flex flex-col bg-[#0a0e27] rounded-xl border border-[#333366] relative overflow-hidden mb-2 animate-fade-in">
      <div class="absolute top-4 left-0 right-0 flex justify-center z-20">
        <div class="bg-[#ffbb33] text-[#16162a] px-4 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-3">
          <span>👁️ 目前為學生視角預覽模式</span>
          <button @click="viewMode = 'edit'" class="bg-[#16162a] text-white px-3 py-1 rounded-full text-xs hover:bg-black transition-colors">返回編輯</button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 pt-20 flex justify-center">
        <div class="w-full max-w-2xl space-y-4">
          <div class="bg-[#16162a] border-t-8 border-[#a78bfa] p-8 rounded-xl shadow-lg border border-[#333366] relative overflow-hidden">
            
            <div v-if="editingItem.settings.expReward > 0" class="absolute top-0 right-0 bg-yellow-500 text-[#16162a] font-black px-6 py-1 rounded-bl-xl text-sm shadow-md">
              ✨ +{{ editingItem.settings.expReward }} EXP
            </div>

            <h1 class="text-3xl text-white font-black mb-2 text-center mt-4">{{ editingItem.title || '未命名投票' }}</h1>
            <p class="text-center text-[#a0a0b8] text-sm mb-8 flex justify-center items-center gap-3">
              <span v-if="editingItem.settings.isAnonymous" class="bg-[#333366] px-2 py-0.5 rounded text-xs">🕵️ 匿名投票</span>
              <span v-if="editingItem.settings.deadline" class="bg-[#ff3366]/20 text-[#ff3366] px-2 py-0.5 rounded text-xs border border-[#ff3366]/30">⏳ 倒數計時中</span>
              <span>{{ editingItem.settings.isMultipleChoice ? `請選擇最多 ${editingItem.settings.maxChoices} 個選項` : '請選擇 1 個選項' }}</span>
            </p>
            
            <div class="space-y-4">
              <label v-for="(opt, index) in editingItem.options" :key="index" class="flex items-center gap-4 p-4 rounded-xl border border-[#333366] hover:border-[#a78bfa] cursor-pointer group transition-colors bg-[#0a0e27]/50">
                <input :type="editingItem.settings.isMultipleChoice ? 'checkbox' : 'radio'" name="preview_poll" class="w-5 h-5 accent-[#a78bfa] cursor-pointer" :class="editingItem.settings.isMultipleChoice ? 'rounded' : ''">
                <span class="text-white group-hover:text-[#a78bfa] transition-colors text-lg font-medium">{{ opt.text || '未命名選項' }}</span>
              </label>
            </div>

            <p v-if="editingItem.settings.visibility === 'after_vote'" class="text-center text-[#666688] text-xs mt-6">
              📊 投票結果將於送出後顯示
            </p>

            <div class="flex justify-center mt-6">
              <button class="px-10 py-3 bg-[#a78bfa] text-[#16162a] text-lg font-bold rounded-xl pointer-events-none opacity-50 shadow-lg">送出選票</button>
            </div>
          </div>
          <div class="pb-20"></div>
        </div>
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
import { ref, onMounted, watch, computed } from 'vue';
import { supabase } from '../../../../supabase.js';
import ConfirmModal from '../../../common/ConfirmModal.vue'; 

const viewMode = ref('list'); // 'list', 'edit', 'preview', 'result'
const myTeacherProfile = ref({ id: '', class_code: '' });
const pollsList = ref([]);
const classStudents = ref([]); // 🌟 新增：存放該班級所有的學生名單

// 🌟 結算報告相關狀態
const selectedPoll = ref(null);
const activeResultTab = ref('unvoted'); // 'voted' or 'unvoted'

// 🌟 新增：計算出這個投票不重複的投票人數 (多選題可能一人投多票)
const getUniqueVotersCount = (poll) => {
  if (!poll || !poll.votes) return 0;
  return new Set(poll.votes.map(v => v.user_id)).size;
};

// 🌟 新增：找出該投票中，不重複的已投票學生 ID 陣列
const uniqueVoterIds = computed(() => {
  if (!selectedPoll.value || !selectedPoll.value.votes) return [];
  return [...new Set(selectedPoll.value.votes.map(v => v.user_id))];
});

// 🌟 新增：已投票名單 (學生名單中 ID 存在於 uniqueVoterIds)
const votedStudents = computed(() => {
  return classStudents.value.filter(s => uniqueVoterIds.value.includes(s.id));
});

// 🌟 新增：未投票名單 (學生名單中 ID 不存在於 uniqueVoterIds)
const unvotedStudents = computed(() => {
  return classStudents.value.filter(s => !uniqueVoterIds.value.includes(s.id));
});


// 預設結構
const defaultPoll = { 
  title: '', 
  options: [{ text: '' }, { text: '' }], 
  status: 'draft',
  settings: {
    expReward: 5,
    isAnonymous: false,
    isMultipleChoice: false,
    maxChoices: 2,
    visibility: 'instant', 
    deadline: ''
  }
};
const editingItem = ref(JSON.parse(JSON.stringify(defaultPoll)));

const isConfirmModalOpen = ref(false);
const confirmAction = ref(null);
const confirmModalConfig = ref({});
const emit = defineEmits(['mode-change']);

const openConfirm = (config, onConfirm) => { confirmModalConfig.value = { ...config, cancelText: '取消' }; confirmAction.value = onConfirm; isConfirmModalOpen.value = true; };
const handleModalConfirm = () => { if (confirmAction.value) confirmAction.value(); isConfirmModalOpen.value = false; };
const handleModalCancel = () => { isConfirmModalOpen.value = false; confirmAction.value = null; };

const getStatusText = (status) => ({ draft: '📝 草稿', active: '🟢 進行中', ended: '🛑 已截止' })[status] || status;
const getStatusClass = (status) => ({
  draft: 'bg-[#333366] text-white', active: 'bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30', ended: 'bg-[#ff3366]/20 text-[#ff3366] border border-[#ff3366]/30'
})[status];

const fetchData = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { data: profile } = await supabase.from('profiles').select('id, class_code').eq('id', user.id).single();
  if (!profile || !profile.class_code) return;
  myTeacherProfile.value = profile;

  // 🌟 新增：抓取班級所有的學生名單 (用來比對誰還沒投票)
  const { data: students } = await supabase.from('profiles')
    .select('id, username, avatar_url')
    .eq('class_code', profile.class_code)
    .eq('role', 'student');
  classStudents.value = students || [];

  // 抓取投票列表與選項
  const { data: polls } = await supabase.from('polls').select('*, poll_options(*)').eq('class_code', profile.class_code).order('created_at', { ascending: false });
  
  if (polls) {
    for (let poll of polls) {
      const { data: votes } = await supabase.from('poll_votes').select('user_id, option_id').eq('poll_id', poll.id);
      poll.votes = votes || [];
      poll.totalVotes = poll.votes.length;
      poll.options = poll.poll_options || [];
      poll.options.forEach(opt => opt.votesCount = poll.votes.filter(v => v.option_id === opt.id).length);
      if (!poll.settings) poll.settings = JSON.parse(JSON.stringify(defaultPoll.settings));
    }
    pollsList.value = polls;
  }
};

const createNewItem = () => { editingItem.value = JSON.parse(JSON.stringify(defaultPoll)); viewMode.value = 'edit'; };
const editItem = (item) => { 
  editingItem.value = JSON.parse(JSON.stringify(item)); 
  if (!editingItem.value.settings) editingItem.value.settings = JSON.parse(JSON.stringify(defaultPoll.settings));
  viewMode.value = 'edit'; 
};

// 🌟 新增：打開結算報告
const viewPollResult = (item) => {
  selectedPoll.value = item;
  activeResultTab.value = 'unvoted'; // 預設打開未投票分頁，方便老師抓人
  viewMode.value = 'result';
};

const addOption = () => editingItem.value.options.push({ text: '' });
const removeOption = (index) => { if (editingItem.value.options.length <= 2) { alert('投票最少需要 2 個選項！'); return; } editingItem.value.options.splice(index, 1); };

const saveItem = async (targetStatus) => {
  if (!editingItem.value.title.trim()) { alert('請填寫主標題！'); return; }
  try {
    let pollId = editingItem.value.id;
    const pollPayload = { 
      title: editingItem.value.title, class_code: myTeacherProfile.value.class_code, 
      status: targetStatus, created_by: myTeacherProfile.value.id,
      settings: editingItem.value.settings
    };
    
    if (pollId && String(pollId).length > 15) {
      await supabase.from('polls').update(pollPayload).eq('id', pollId);
      await supabase.from('poll_options').delete().eq('poll_id', pollId);
    } else {
      const { data } = await supabase.from('polls').insert(pollPayload).select().single(); pollId = data.id;
    }
    const optionsPayload = editingItem.value.options.filter(o => o.text.trim() !== '').map(o => ({ poll_id: pollId, text: o.text }));
    await supabase.from('poll_options').insert(optionsPayload);
    alert('儲存成功！'); viewMode.value = 'list'; fetchData();
  } catch (err) { alert('儲存失敗！請確認資料庫是否已新增 settings (jsonb) 欄位。'); }
};

const updateStatus = async (item, newStatus) => { await supabase.from('polls').update({ status: newStatus }).eq('id', item.id); fetchData(); };
const publishFromList = (item) => openConfirm({ title: '發佈確認', message: `確定發佈？`, confirmText: '發佈', icon: '🚀' }, () => updateStatus(item, 'active'));
const endItem = (item) => openConfirm({ title: '截止確認', message: `確定截止？`, confirmText: '截止', icon: '🛑', isDanger: true }, () => updateStatus(item, 'ended'));
const triggerDelete = (item) => openConfirm({ title: '刪除警告', message: `確定永久刪除？`, confirmText: '刪除', icon: '🗑️', isDanger: true }, async () => {
  await supabase.from('polls').delete().eq('id', item.id); fetchData();
});

watch(viewMode, (newMode) => emit('mode-change', newMode));
defineExpose({ createNewItem });
onMounted(() => fetchData());
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(167, 139, 250, 0.3); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(167, 139, 250, 0.6); }
.animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
</style>