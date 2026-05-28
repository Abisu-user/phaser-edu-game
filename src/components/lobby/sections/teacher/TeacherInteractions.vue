<template>
  <div class="animate-fade-in bg-[#16162a] border border-[#333366] rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl h-[calc(100vh-120px)] flex flex-col">
    
    <div class="flex flex-col sm:flex-row justify-between items-center bg-[#0a0e27] p-5 rounded-2xl border shadow-lg mb-6 shrink-0 transition-colors duration-300"
         :class="activeTab === 'polls' ? 'border-[#a78bfa]/30 shadow-[0_0_20px_rgba(167,139,250,0.15)]' : 'border-[#4299e1]/30 shadow-[0_0_20px_rgba(66,153,225,0.15)]'">
      <div class="flex items-center gap-5">
        <div class="w-14 h-14 bg-[#16162a] border-2 rounded-xl flex items-center justify-center text-3xl transition-colors duration-300"
             :class="activeTab === 'polls' ? 'border-[#a78bfa] shadow-[0_0_15px_rgba(167,139,250,0.3)]' : 'border-[#4299e1] shadow-[0_0_15px_rgba(66,153,225,0.3)]'">
          {{ activeTab === 'polls' ? '📊' : '📝' }}
        </div>
        <div>
          <h2 class="text-sm font-bold text-[#a0a0b8] tracking-widest mb-1">互動內容管理</h2>
          <div class="flex gap-4">
            <button @click="switchTab('polls')" :class="activeTab === 'polls' ? 'text-[#a78bfa] text-2xl font-black drop-shadow-md' : 'text-[#a0a0b8] text-xl font-bold hover:text-white transition-colors'">投票系統</button>
            <span class="text-[#333366] text-2xl">|</span>
            <button @click="switchTab('surveys')" :class="activeTab === 'surveys' ? 'text-[#4299e1] text-2xl font-black drop-shadow-md' : 'text-[#a0a0b8] text-xl font-bold hover:text-white transition-colors'">問卷系統</button>
          </div>
        </div>
      </div>
      <div v-if="viewMode === 'list'" class="mt-4 sm:mt-0">
        <button @click="createNewItem" class="px-5 py-2.5 rounded-lg font-bold text-white transition-all shadow-md flex items-center gap-2"
                :class="activeTab === 'polls' ? 'bg-[#a78bfa] hover:bg-[#9061f9]' : 'bg-[#4299e1] hover:bg-[#3182ce]'">
          <span>＋</span> {{ activeTab === 'polls' ? '建立新投票' : '建立新問卷' }}
        </button>
      </div>
    </div>

    <div v-if="viewMode === 'list'" class="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6 animate-fade-in pb-4 min-h-0">
      
      <div v-if="itemsList.length === 0" class="flex flex-col items-center justify-center py-20 border-2 border-dashed border-[#333366] rounded-xl bg-[#0a0e27]/50 text-[#a0a0b8]">
        <span class="text-5xl mb-4 opacity-50">📭</span>
        <p>目前還沒有任何{{ activeTab === 'polls' ? '投票' : '問卷' }}，趕快建立一個吧！</p>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div v-for="item in itemsList" :key="item.id" class="bg-[#16162a] p-5 rounded-xl border border-[#333366] flex flex-col justify-between hover:border-[#a0a0b8]/50 transition-all shadow-lg">
          
          <div>
            <div class="flex justify-between items-start mb-3">
              <h4 class="text-white font-bold text-lg leading-snug">{{ item.title }}</h4>
              <span class="text-[10px] px-2 py-1 rounded font-bold tracking-wider shrink-0" :class="getStatusClass(item.status)">
                {{ getStatusText(item.status) }}
              </span>
            </div>

            <template v-if="activeTab === 'polls' && item.status !== 'draft'">
              <div v-if="item.status === 'active'" class="space-y-3 mt-3 bg-[#0a0e27] p-3.5 rounded-xl border border-[#a78bfa]/20 shadow-inner">
                <div class="text-xs text-[#a78bfa] font-bold flex justify-between items-center mb-1">
                  <span>📈 即時數據監控</span>
                  <span class="bg-[#a78bfa]/10 px-2 py-0.5 rounded text-white">已投: {{ item.totalVotes }} 票</span>
                </div>
                <div v-for="opt in item.options" :key="opt.id" class="space-y-1">
                  <div class="flex justify-between text-xs font-medium">
                    <span class="text-[#a0a0b8] truncate max-w-[70%]">{{ opt.text }}</span>
                    <span class="text-white font-bold">{{ opt.votesCount || 0 }} 票 ({{ item.totalVotes > 0 ? Math.round((opt.votesCount / item.totalVotes) * 100) : 0 }}%)</span>
                  </div>
                  <div class="w-full h-2 bg-[#16162a] rounded-full overflow-hidden border border-white/5">
                    <div class="h-full bg-gradient-to-r from-[#a78bfa] to-[#818cf8] transition-all duration-500" :style="{ width: `${item.totalVotes > 0 ? (opt.votesCount / item.totalVotes) * 100 : 0}%` }"></div>
                  </div>
                </div>
              </div>

              <div v-if="item.status === 'ended'" class="space-y-4 mt-3 bg-[#0a0e27] p-3.5 rounded-xl border border-[#ff3366]/20 shadow-inner">
                <div class="text-xs text-[#ff3366] font-bold flex justify-between items-center">
                  <span>🏆 最終計票總結</span>
                  <span class="bg-[#ff3366]/10 text-white px-2 py-0.5 rounded font-black">總票數: {{ item.totalVotes }} 票</span>
                </div>
                <div class="space-y-2">
                  <div v-for="opt in item.options" :key="opt.id" class="relative flex justify-between items-center text-xs p-2 bg-[#16162a] rounded border border-[#333366] overflow-hidden">
                    <div class="absolute left-0 top-0 bottom-0 bg-[#00d4aa]/15 transition-all duration-500" :style="{ width: `${item.totalVotes > 0 ? (opt.votesCount / item.totalVotes) * 100 : 0}%` }"></div>
                    <span class="text-[#a0a0b8] font-medium relative z-10">{{ opt.text }}</span>
                    <span class="text-[#00d4aa] font-bold relative z-10">{{ opt.votesCount || 0 }} 票 <span class="text-[#00d4aa]/60 ml-0.5 font-medium">({{ item.totalVotes > 0 ? Math.round((opt.votesCount / item.totalVotes) * 100) : 0 }}%)</span></span>
                  </div>
                </div>
                
                <div class="border-t border-[#333366] pt-3 mt-2">
                  <div class="text-xs text-[#ffbb33] font-bold mb-2 flex justify-between items-center">
                    <span>⚠️ 未作答名單</span>
                    <span class="bg-[#ffbb33]/20 px-2 py-0.5 rounded text-[#ffbb33]">{{ item.unvotedStudents?.length || 0 }} 人</span>
                  </div>
                  <div class="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto custom-scrollbar p-2 bg-black/20 rounded-lg border border-[#333366]/50 shadow-inner">
                    <span v-for="student in item.unvotedStudents" :key="student.id" class="text-[11px] bg-red-950/50 text-red-300 border border-red-900/50 px-2 py-1 rounded flex items-center gap-1">
                      👤 {{ student.username || '未命名' }}
                    </span>
                    <span v-if="item.unvotedStudents?.length === 0" class="text-xs text-[#00d4aa] font-bold italic py-2 w-full text-center">🎉 完美！全班皆已完成投票！</span>
                  </div>
                </div>
              </div>
              <p v-if="item.status === 'draft'" class="text-sm text-[#666688] mt-2 italic">此投票仍為草稿，發佈後可即時追蹤票數。</p>
            </template>


            <template v-if="activeTab === 'surveys'">
              <p class="text-sm text-[#a0a0b8] mt-2 line-clamp-2">{{ item.desc }}</p>
              
              <div v-if="item.status === 'active'" class="mt-3 flex items-center gap-3 text-xs">
                <span class="bg-[#4299e1]/10 text-[#4299e1] px-2 py-1 rounded font-bold border border-[#4299e1]/30">共 {{ item.form_schema?.length || 0 }} 題</span>
                <span class="bg-[#00d4aa]/10 text-[#00d4aa] px-2 py-1 rounded font-bold border border-[#00d4aa]/30">已回收: {{ item.totalResponses || 0 }} 份</span>
              </div>

              <div v-if="item.status === 'ended'" class="space-y-4 mt-4 bg-[#0a0e27] p-4 rounded-xl border border-[#4299e1]/30 shadow-inner">
                <div class="text-xs text-[#4299e1] font-bold flex justify-between items-center border-b border-[#4299e1]/20 pb-2">
                  <span class="text-sm">📊 問卷結果大數據</span>
                  <span class="bg-[#4299e1] text-[#0a0e27] px-2 py-0.5 rounded font-black">回收份數: {{ item.totalResponses || 0 }} 份</span>
                </div>
                
                <div class="max-h-[380px] overflow-y-auto custom-scrollbar pr-2 space-y-5">
                  <div v-for="(q, index) in item.form_schema" :key="q.id">
                    <h5 class="text-white text-[13px] font-bold mb-2 leading-tight">Q{{ index + 1 }}. {{ q.title }}</h5>
                    
                    <div v-if="q.type === 'radio'" class="space-y-1.5">
                      <div v-for="stat in q.stats" :key="stat.text" class="relative flex justify-between items-center text-xs p-2 bg-[#16162a] rounded border border-[#333366] overflow-hidden">
                        <div class="absolute left-0 top-0 bottom-0 bg-[#4299e1]/20 transition-all duration-500" :style="{ width: `${stat.percentage}%` }"></div>
                        <span class="text-[#a0a0b8] font-medium relative z-10 w-2/3 truncate">{{ stat.text }}</span>
                        <span class="text-[#4299e1] font-bold relative z-10 shrink-0">{{ stat.count }} 票 <span class="text-[#4299e1]/60">({{ stat.percentage }}%)</span></span>
                      </div>
                    </div>

                    <div v-else-if="q.type === 'text'" class="mt-2">
                      <div class="text-[11px] text-[#8888aa] mb-1.5 flex justify-between items-center">
                        <span>💬 學生文字回答</span>
                        <span class="bg-[#333366]/50 px-1.5 py-0.5 rounded">共 {{ q.textAnswers?.length || 0 }} 則</span>
                      </div>
                      <div class="bg-black/20 rounded-lg border border-[#333366] max-h-[160px] overflow-y-auto custom-scrollbar p-2.5 space-y-2 shadow-inner">
                        <div v-if="!q.textAnswers || q.textAnswers.length === 0" class="text-xs text-[#666688] italic text-center py-4">尚無任何文字回答。</div>
                        <div v-else v-for="(ans, i) in q.textAnswers" :key="i" class="text-[13px] text-[#a0a0b8] bg-[#16162a] p-3 rounded-md border border-white/5 leading-relaxed relative shadow-sm">
                          <div class="absolute left-0 top-0 bottom-0 w-1 bg-[#4299e1]/50 rounded-l-md"></div>
                          {{ ans }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="border-t border-[#333366] pt-3">
                  <div class="text-xs text-[#ffbb33] font-bold mb-2 flex justify-between items-center">
                    <span>⚠️ 未交問卷名單</span>
                    <span class="bg-[#ffbb33]/20 px-2 py-0.5 rounded text-[#ffbb33]">{{ item.unvotedStudents?.length || 0 }} 人</span>
                  </div>
                  <div class="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto custom-scrollbar p-2 bg-black/20 rounded-lg border border-[#333366]/50 shadow-inner">
                    <span v-for="student in item.unvotedStudents" :key="student.id" class="text-[11px] bg-red-950/50 text-red-300 border border-red-900/50 px-2 py-1 rounded flex items-center gap-1">
                      👤 {{ student.username || '未命名' }}
                    </span>
                    <span v-if="item.unvotedStudents?.length === 0" class="text-xs text-[#00d4aa] font-bold italic py-2 w-full text-center">🎉 完美！全班皆已繳交問卷！</span>
                  </div>
                </div>
              </div>

            </template>
          </div>
          
          <div class="flex gap-2 mt-5 pt-4 border-t border-[#333366] flex-wrap">
            <button @click="editItem(item)" class="flex-1 py-2 bg-[#0a0e27] hover:bg-white/10 text-white rounded-lg text-sm font-bold border border-[#333366] transition-colors shadow-inner">編輯 / 查看</button>
            
            <button v-if="item.status === 'draft'" @click="publishFromList(item)" class="flex-1 py-2 text-white rounded-lg text-sm font-bold transition-colors" :class="activeTab === 'polls' ? 'bg-[#a78bfa]/20 text-[#a78bfa] hover:bg-[#a78bfa] hover:text-[#16162a]' : 'bg-[#4299e1]/20 text-[#4299e1] hover:bg-[#4299e1] hover:text-[#16162a]'">發佈</button>
            
            <button v-if="item.status === 'active'" @click="endItem(item)" class="flex-1 py-2 bg-[#ff3366]/20 text-[#ff3366] hover:bg-[#ff3366] hover:text-white rounded-lg text-sm font-bold transition-colors">結束 / 結算</button>
            
            <button v-if="item.status === 'ended'" @click="reopenItem(item)" class="flex-1 py-2 bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/30 hover:bg-[#00d4aa] hover:text-[#16162a] rounded-lg text-sm font-bold transition-colors shadow-inner">
              🔓 重新開放
            </button>

            <button @click="triggerDelete(item)" class="px-3 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-sm font-bold border border-red-500/30 transition-colors shadow-inner flex items-center justify-center" title="刪除此項目">🗑️</button>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="viewMode === 'edit'" class="flex-1 flex flex-col h-full animate-fade-in-up min-h-0">
        <div class="flex-1 overflow-y-auto custom-scrollbar pr-3 space-y-6 pb-6 min-h-0">
        
        <div class="space-y-2">
          <label class="text-[#a0a0b8] font-bold text-sm">主標題 <span class="text-red-500">*</span></label>
          <input v-model="editingItem.title" type="text" placeholder="請輸入吸睛的標題..." class="w-full bg-[#0a0e27] border-2 border-[#333366] focus:border-white rounded-xl px-4 py-3 text-white font-bold outline-none transition-colors">
        </div>

        <template v-if="activeTab === 'polls'">
          <div class="space-y-3">
            <label class="text-[#a0a0b8] font-bold text-sm flex justify-between items-center">
              <span>選項設定 <span class="text-red-500">*</span></span>
              <span class="text-xs font-normal text-[#666688]">最少需 2 個選項</span>
            </label>
            <div class="space-y-3">
              <div v-for="(opt, index) in editingItem.options" :key="index" class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-[#333366] flex items-center justify-center text-white text-xs font-bold shrink-0">{{ index + 1 }}</div>
                <input v-model="opt.text" type="text" placeholder="請輸入選項內容..." class="flex-1 bg-[#0a0e27] border border-[#333366] focus:border-[#a78bfa] rounded-lg px-4 py-2 text-white outline-none transition-colors">
                <button @click="removeOption(index)" class="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors shrink-0" title="移除選項">✕</button>
              </div>
            </div>
            <button @click="addOption" class="w-full py-3 mt-2 border-2 border-dashed border-[#333366] hover:border-[#a78bfa] text-[#a0a0b8] hover:text-[#a78bfa] rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
              <span>＋</span> 新增選項
            </button>
          </div>
        </template>

        <template v-if="activeTab === 'surveys'">
          <div class="space-y-2">
            <label class="text-[#a0a0b8] font-bold text-sm">問卷描述</label>
            <textarea v-model="editingItem.desc" placeholder="請描述這份問卷的目的或作答指引..." class="w-full bg-[#0a0e27] border-2 border-[#333366] focus:border-[#4299e1] rounded-xl px-4 py-3 text-white outline-none transition-colors min-h-[80px] resize-none"></textarea>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-[#a0a0b8] font-bold text-sm">截止日期</label>
              <input v-model="editingItem.deadline" type="date" class="w-full bg-[#0a0e27] border-2 border-[#333366] focus:border-[#4299e1] rounded-xl px-4 py-3 text-white outline-none transition-colors [color-scheme:dark]">
            </div>
            <div class="space-y-2">
              <label class="text-[#a0a0b8] font-bold text-sm">完成獎勵 (積分)</label>
              <input v-model="editingItem.points" type="number" placeholder="例如: 50" class="w-full bg-[#0a0e27] border-2 border-[#333366] focus:border-[#4299e1] rounded-xl px-4 py-3 text-white outline-none transition-colors">
            </div>
          </div>

          <div class="mt-8 border-t border-[#333366] pt-6">
            <h3 class="text-[#4299e1] font-bold text-lg mb-4 flex items-center gap-2">📋 自訂題目編輯器</h3>
            
            <div v-for="(q, qIndex) in editingItem.form_schema" :key="q.id" class="bg-[#0a0e27] p-5 rounded-xl border border-[#333366] mb-5 relative group">
              <button @click="removeSurveyQuestion(qIndex)" class="absolute -right-3 -top-3 w-8 h-8 bg-[#16162a] border border-[#333366] rounded-full text-[#a0a0b8] hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors flex items-center justify-center z-10 shadow-lg" title="刪除題目">✕</button>
              
              <div class="flex flex-col sm:flex-row gap-3 mb-4">
                <input v-model="q.title" type="text" :placeholder="`未命名問題 ${qIndex + 1}`" class="flex-1 bg-[#16162a] border-b-2 border-[#333366] focus:border-[#4299e1] px-2 py-2 text-white font-bold outline-none transition-colors">
                <select v-model="q.type" class="bg-[#16162a] border border-[#333366] text-white px-3 py-2 rounded-lg outline-none focus:border-[#4299e1]">
                  <option value="radio">⚪ 單選題</option>
                  <option value="text">📝 簡答題</option>
                </select>
              </div>

              <div v-if="q.type === 'radio'" class="space-y-2 pl-4">
                <div v-for="(opt, oIndex) in q.options" :key="oIndex" class="flex items-center gap-2">
                  <span class="text-[#a0a0b8]">⚪</span>
                  <input v-model="q.options[oIndex]" type="text" :placeholder="`選項 ${oIndex + 1}`" class="bg-transparent border-b border-[#333366] focus:border-[#4299e1] px-2 py-1 text-sm text-white outline-none w-2/3">
                  <button @click="removeSurveyOption(qIndex, oIndex)" class="text-[#666688] hover:text-red-500 px-2" title="移除選項">✕</button>
                </div>
                <button @click="addSurveyOption(qIndex)" class="text-[#4299e1] hover:text-[#63b3ed] text-sm font-bold flex items-center gap-1 mt-2">
                  <span>＋</span> 新增選項
                </button>
              </div>

              <div v-if="q.type === 'text'" class="pl-4">
                <div class="border-b border-dashed border-[#666688] w-2/3 py-2 text-[#666688] text-sm">簡答文字區域...</div>
              </div>

              <div class="flex justify-end items-center mt-6 pt-3 border-t border-[#333366]/50">
                <label class="flex items-center gap-2 cursor-pointer">
                  <span class="text-sm text-[#a0a0b8] font-bold">必填</span>
                  <input type="checkbox" v-model="q.required" class="w-4 h-4 accent-[#4299e1]">
                </label>
              </div>
            </div>

            <div class="flex gap-3">
              <button @click="addSurveyQuestion('radio')" class="flex-1 py-3 border-2 border-dashed border-[#333366] hover:border-[#4299e1] text-[#a0a0b8] hover:text-[#4299e1] rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                <span>＋</span> 新增單選題
              </button>
              <button @click="addSurveyQuestion('text')" class="flex-1 py-3 border-2 border-dashed border-[#333366] hover:border-[#4299e1] text-[#a0a0b8] hover:text-[#4299e1] rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                <span>＋</span> 新增簡答題
              </button>
            </div>
          </div>
        </template>
      </div>

      <div class="pt-5 border-t border-[#333366] mt-4 flex flex-wrap gap-3 items-center justify-end shrink-0">
        <button @click="cancelEdit" class="px-5 py-2.5 rounded-lg font-bold text-[#a0a0b8] hover:bg-white/10 transition-colors mr-auto">取消</button>
        <button @click="openPreview" class="px-5 py-2.5 rounded-lg font-bold bg-[#333366] hover:bg-[#444477] text-white transition-colors flex items-center gap-2">
          👁️ 學生視角預覽
        </button>
        <button @click="saveItem('draft')" class="px-5 py-2.5 rounded-lg font-bold border border-[#a0a0b8] text-[#a0a0b8] hover:bg-white/10 transition-colors">
          儲存草稿
        </button>
        <button @click="saveItem('active')" class="px-6 py-2.5 rounded-lg font-bold text-[#16162a] transition-all shadow-md"
                :class="activeTab === 'polls' ? 'bg-[#a78bfa] hover:bg-[#9061f9]' : 'bg-[#4299e1] hover:bg-[#3182ce]'">
          🚀 儲存並發佈
        </button>
      </div>
    </div>

    <div v-else-if="viewMode === 'preview'" class="flex-1 flex flex-col h-full animate-fade-in min-h-0">
        <div class="flex-1 overflow-y-auto custom-scrollbar flex justify-center items-start pt-4 pb-10 min-h-0">
        <span>👀 目前為學生視角預覽模式，不會產生實際資料變更。</span>
        <button @click="viewMode = 'edit'" class="px-3 py-1 bg-[#ffbb33] text-[#16162a] rounded hover:bg-[#ffcc66] transition-colors">返回編輯</button>
      </div>

      <div class="flex-1 overflow-y-auto custom-scrollbar flex justify-center items-start pt-4 pb-10 min-h-0">
        <div v-if="activeTab === 'polls'" class="w-full max-w-md bg-[#16162a] p-6 rounded-xl border border-[#a78bfa]/40 shadow-[0_0_20px_rgba(167,139,250,0.2)]">
          <h4 class="text-white font-bold mb-5 leading-relaxed text-lg">{{ editingItem.title || '【未命名投票】' }}</h4>
          <div class="space-y-3">
            <label v-for="(opt, i) in editingItem.options" :key="i" class="flex items-center gap-3 p-3.5 rounded-lg bg-[#0a0e27] border border-[#333366] hover:border-[#a78bfa]/50 cursor-pointer transition-all">
              <input type="radio" name="preview-poll" class="w-4 h-4 accent-[#a78bfa]">
              <span class="text-sm font-medium text-[#a0a0b8]">{{ opt.text || `選項 ${i+1}` }}</span>
            </label>
          </div>
          <button class="mt-6 w-full py-3 rounded-lg font-bold bg-[#a78bfa] text-[#16162a] shadow-md pointer-events-none">送出選擇 (預覽)</button>
        </div>

        <div v-if="activeTab === 'surveys'" class="w-full max-w-2xl bg-[#0a0e27] border border-[#4299e1]/30 rounded-2xl flex flex-col overflow-hidden shadow-[0_0_30px_rgba(66,153,225,0.1)]">
          <div class="p-6 md:p-8 bg-gradient-to-b from-[#4299e1]/10 to-transparent border-b border-[#333366] shrink-0">
            <h2 class="text-2xl font-black text-white mb-3">{{ editingItem.title || '【未命名問卷】' }}</h2>
            <p class="text-[#a0a0b8] text-sm leading-relaxed">{{ editingItem.desc || '尚未填寫問卷描述...' }}</p>
          </div>
          <div class="p-6 md:p-8 space-y-8">
            <div v-if="!editingItem.form_schema || editingItem.form_schema.length === 0" class="text-center text-[#666688] italic py-10">尚無建立任何題目</div>
            <div v-for="(q, index) in editingItem.form_schema" :key="q.id" class="space-y-4">
              <h4 class="text-white font-bold text-lg flex items-center gap-2">
                <span class="text-[#4299e1]">{{ index + 1 }}.</span> {{ q.title || '未命名問題' }}
                <span v-if="q.required" class="text-red-500">*</span>
              </h4>
              <div v-if="q.type === 'radio'" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label v-for="opt in q.options" :key="opt" class="flex items-center gap-3 p-4 rounded-xl border border-[#333366] bg-[#16162a] cursor-pointer hover:border-[#4299e1]/50">
                  <input type="radio" :name="q.id" class="accent-[#4299e1] w-4 h-4">
                  <span class="text-[#a0a0b8] font-bold">{{ opt }}</span>
                </label>
              </div>
              <textarea v-if="q.type === 'text'" placeholder="您的回答..." class="w-full bg-[#16162a] border-2 border-[#333366] rounded-xl p-4 text-white min-h-[100px] resize-none outline-none pointer-events-none"></textarea>
            </div>
          </div>
          <div class="p-5 border-t border-[#333366] bg-[#16162a]/80 text-right flex justify-between items-center">
            <div class="flex items-center gap-2">
              <span class="text-[11px] bg-[#4299e1]/10 text-[#4299e1] px-2.5 py-1 rounded-md font-bold tracking-wider border border-[#4299e1]/30">⏳ 截止: {{ editingItem.deadline || '未設定' }}</span>
              <span class="text-[11px] bg-[#ffbb33]/10 text-[#ffbb33] px-2.5 py-1 rounded-md border border-[#ffbb33]/30">{{ editingItem.points ? `+${editingItem.points}` : '+0' }} 積分</span>
            </div>
            <button class="px-8 py-3 rounded-lg font-bold text-white bg-[#4299e1] pointer-events-none">確認送出表單</button>
          </div>
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
import { supabase } from '../../../../supabase.js';
import ConfirmModal from '../../../common/ConfirmModal.vue'; 

// === 狀態管理 ===
const activeTab = ref('polls'); 
const viewMode = ref('list'); 
const editingItem = ref(null);
const myTeacherProfile = ref({ id: '', class_code: '' });
const mockPolls = ref([]);
const mockSurveys = ref([]);

const itemsList = computed(() => activeTab.value === 'polls' ? mockPolls.value : mockSurveys.value);

// === 彈跳視窗控制系統 ===
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

// === 狀態樣式輔助 ===
const getStatusText = (status) => ({ draft: '📝 草稿', active: '🟢 進行中', ended: '🛑 已截止' })[status] || status;
const getStatusClass = (status) => ({
  draft: 'bg-[#333366] text-white',
  active: 'bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30',
  ended: 'bg-[#ff3366]/20 text-[#ff3366] border border-[#ff3366]/30'
})[status];

// === 系統初始化與資料抓取 ===
const initTeacher = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { data: profile } = await supabase.from('profiles').select('id, class_code').eq('id', user.id).single();
  if (profile) {
    myTeacherProfile.value = profile;
    await fetchData();
  }
};

const fetchData = async () => {
  if (!myTeacherProfile.value.class_code) return;
  
  // 抓取全班學生名單 (用於計算缺交)
  const { data: allStudents } = await supabase.from('profiles')
    .select('id, username')
    .eq('class_code', myTeacherProfile.value.class_code)
    .eq('role', 'student');

  if (activeTab.value === 'polls') {
    const { data: polls } = await supabase.from('polls')
      .select('*, poll_options(*)')
      .eq('class_code', myTeacherProfile.value.class_code)
      .order('created_at', { ascending: false });
    
    if (polls) {
      for (let poll of polls) {
        const { data: votes } = await supabase.from('poll_votes').select('user_id, option_id').eq('poll_id', poll.id);
        poll.votes = votes || [];
        poll.totalVotes = poll.votes.length;
        poll.options = poll.poll_options || [];

        poll.options.forEach(opt => {
          opt.votesCount = poll.votes.filter(v => v.option_id === opt.id).length;
        });

        if (allStudents) {
          const votedUserIds = poll.votes.map(v => v.user_id);
          poll.unvotedStudents = allStudents.filter(s => !votedUserIds.includes(s.id));
        } else { poll.unvotedStudents = []; }
      }
      mockPolls.value = polls;
    }
  } else {
    // 讀取問卷並統計資料
    const { data: surveys } = await supabase.from('surveys')
      .select('*')
      .eq('class_code', myTeacherProfile.value.class_code)
      .order('created_at', { ascending: false });
    
    if (surveys) {
      for (let survey of surveys) {
        survey.form_schema = survey.form_schema || [];
        
        // 抓取此問卷的所有回答
        const { data: responses } = await supabase.from('survey_responses')
          .select('user_id, answers')
          .eq('survey_id', survey.id);
        
        survey.totalResponses = responses ? responses.length : 0;
        const validResponses = responses || [];

        // 計算未交名單
        if (allStudents) {
          const respondedUserIds = validResponses.map(r => r.user_id);
          survey.unvotedStudents = allStudents.filter(s => !respondedUserIds.includes(s.id));
        } else { survey.unvotedStudents = []; }

        // 解析與統計表單數據
        survey.form_schema.forEach(q => {
          if (q.type === 'radio') {
            q.stats = q.options.map(opt => {
              const count = validResponses.filter(r => r.answers && r.answers[q.id] === opt).length;
              return {
                text: opt,
                count: count,
                percentage: survey.totalResponses > 0 ? Math.round((count / survey.totalResponses) * 100) : 0
              };
            });
          } else if (q.type === 'text') {
            q.textAnswers = validResponses
              .map(r => r.answers ? r.answers[q.id] : null)
              .filter(ans => ans && String(ans).trim() !== '');
          }
        });
      }
      mockSurveys.value = surveys;
    }
  }
};

const switchTab = (tab) => { activeTab.value = tab; viewMode.value = 'list'; fetchData(); };

// === 建立與編輯內容邏輯 ===
const createNewItem = () => {
  if (activeTab.value === 'polls') {
    editingItem.value = { title: '', options: [{ text: '' }, { text: '' }], status: 'draft' };
  } else {
    editingItem.value = { title: '', description: '', desc: '', deadline: '', points: 50, status: 'draft', form_schema: [] };
  }
  viewMode.value = 'edit';
};

const editItem = async (item) => {
  editingItem.value = JSON.parse(JSON.stringify(item));
  if (activeTab.value === 'surveys') {
    editingItem.value.desc = editingItem.value.description;
    editingItem.value.form_schema = editingItem.value.form_schema || [];
  }
  if (activeTab.value === 'polls' && !editingItem.value.options) { editingItem.value.options = []; }
  viewMode.value = 'edit';
};

const openPreview = () => { viewMode.value = 'preview'; };

// 問卷題目建構器邏輯
const addSurveyQuestion = (type) => { editingItem.value.form_schema.push({ id: 'q_' + Date.now(), type: type, title: '', options: type === 'radio' ? ['選項 1'] : [], required: true }); };
const removeSurveyQuestion = (index) => editingItem.value.form_schema.splice(index, 1);
const addSurveyOption = (qIndex) => editingItem.value.form_schema[qIndex].options.push('');
const removeSurveyOption = (qIndex, oIndex) => editingItem.value.form_schema[qIndex].options.splice(oIndex, 1);

// 投票選項增減邏輯
const addOption = () => editingItem.value.options.push({ text: '' });
const removeOption = (index) => { if (editingItem.value.options.length <= 2) { alert('投票最少需要 2 個選項！'); return; } editingItem.value.options.splice(index, 1); };

// === 資料儲存與更新邏輯 ===
const cancelEdit = () => {
  openConfirm({ title: '放棄編輯？', message: '確定要放棄編輯嗎？未儲存的內容將會遺失。', confirmText: '放棄編輯', icon: '⚠️', isDanger: true }, () => { viewMode.value = 'list'; });
};

const saveItem = async (targetStatus) => {
  if (!editingItem.value.title.trim()) { alert('請填寫主標題！'); return; }

  try {
    if (activeTab.value === 'polls') {
      let pollId = editingItem.value.id;
      const pollPayload = { title: editingItem.value.title, class_code: myTeacherProfile.value.class_code, status: targetStatus, created_by: myTeacherProfile.value.id };
      if (pollId && String(pollId).length > 15) {
        await supabase.from('polls').update(pollPayload).eq('id', pollId);
        await supabase.from('poll_options').delete().eq('poll_id', pollId);
      } else {
        const { data } = await supabase.from('polls').insert(pollPayload).select().single(); pollId = data.id;
      }
      const optionsPayload = editingItem.value.options.filter(o => o.text.trim() !== '').map(o => ({ poll_id: pollId, text: o.text }));
      await supabase.from('poll_options').insert(optionsPayload);

    } else {
      const surveyPayload = {
        title: editingItem.value.title, description: editingItem.value.desc, deadline: editingItem.value.deadline || null,
        points: Number(editingItem.value.points) || 50, class_code: myTeacherProfile.value.class_code, status: targetStatus,
        created_by: myTeacherProfile.value.id, form_schema: editingItem.value.form_schema 
      };
      if (editingItem.value.id && String(editingItem.value.id).length > 15) { await supabase.from('surveys').update(surveyPayload).eq('id', editingItem.value.id); } 
      else { await supabase.from('surveys').insert(surveyPayload); }
    }

    alert(targetStatus === 'active' ? '🚀 發佈成功！學生端已同步更新。' : '💾 草稿儲存成功！');
    viewMode.value = 'list';
    fetchData();
  } catch (err) { alert('儲存失敗，請檢查網絡連線。'); }
};

const updateStatus = async (item, newStatus) => {
  const table = activeTab.value === 'polls' ? 'polls' : 'surveys';
  const { error } = await supabase.from(table).update({ status: newStatus }).eq('id', item.id);
  if (!error) {
    const msg = newStatus === 'ended' ? '🔒 已成功截止/結算！' : (newStatus === 'active' ? '🟢 已重新開放發佈！' : '狀態更新成功！');
    alert(msg);
    fetchData();
  }
};

// 操作觸發區塊
const publishFromList = (item) => openConfirm({ title: '發佈確認', message: `確定要直接發佈「${item.title}」嗎？`, confirmText: '確認發佈', icon: '🚀' }, () => updateStatus(item, 'active'));
const endItem = (item) => openConfirm({ title: '截止確認', message: `確定要將「${item.title}」截止嗎？\n截止後將鎖定名單並進行數據統計。`, confirmText: '確認截止', icon: '🛑', isDanger: true }, () => updateStatus(item, 'ended'));

const reopenItem = (item) => {
  openConfirm({
    title: '重新開放', 
    message: `確定要重新開放「${item.title}」嗎？\n重新開放後，先前尚未填寫的學生將可以繼續作答。`, 
    confirmText: '確認開放', 
    icon: '🔓', 
    isDanger: false 
  }, () => updateStatus(item, 'active'));
};

const triggerDelete = (item) => {
  const typeText = activeTab.value === 'polls' ? '投票' : '問卷';
  openConfirm({ title: '永久刪除警告', message: `確定要刪除「${item.title}」嗎？\n這將會連同所有學生的數據一併「永久刪除」，此動作無法復原！`, confirmText: '永久刪除', icon: '🗑️', isDanger: true }, async () => {
    try {
      const { error } = await supabase.from(activeTab.value === 'polls' ? 'polls' : 'surveys').delete().eq('id', item.id);
      if (error) throw error;
      alert(`✅ 已成功刪除該則${typeText}！`);
      await fetchData(); 
    } catch (err) { alert('系統錯誤，刪除失敗，請稍後再試。'); }
  });
};

onMounted(() => initTeacher());
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
.animate-fade-in-up { animation: fadeInUp 0.3s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(160, 160, 184, 0.3); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(160, 160, 184, 0.6); }
</style>