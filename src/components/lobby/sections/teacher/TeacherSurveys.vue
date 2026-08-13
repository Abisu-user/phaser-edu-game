<template>
  <div class="h-full flex flex-col relative min-h-0">
    <ToastMessage :message="notice.message" :type="notice.type" @dismiss="clearNotice" />

    <div v-if="viewMode === 'list'" class="flex-1 flex flex-col min-h-0 animate-fade-in">
      <div class="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6 pb-4">
        <div v-if="surveysList.length === 0" class="flex flex-col items-center justify-center py-20 border-2 border-dashed border-[#333366] rounded-xl bg-[#0a0e27]/50 text-[#a0a0b8]">
          <span class="text-5xl mb-4 opacity-50">📭</span>
          <p>目前還沒有任何問卷，趕快建立一個吧！</p>
        </div>

        <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div v-for="item in surveysList" :key="item.id" class="bg-[#16162a] p-5 rounded-xl border border-[#333366] flex flex-col justify-between hover:border-[#4299e1]/50 transition-all shadow-lg">
            <div>
              <div class="flex justify-between items-start mb-3">
                <h4 class="text-white font-bold text-lg leading-snug">{{ item.title }}</h4>
                <span class="text-[10px] px-2 py-1 rounded font-bold tracking-wider shrink-0" :class="getStatusClass(item.status)">
                  {{ getStatusText(item.status) }}
                </span>
              </div>
              <p class="text-sm text-[#a0a0b8] mt-2 line-clamp-2">{{ item.desc }}</p>
              
              <div class="mt-4 flex flex-wrap gap-2 text-xs">
                <span v-if="item.points" class="bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded font-bold border border-yellow-500/20">✨ {{ item.points }} EXP</span>
                <span class="bg-[#4299e1]/10 text-[#4299e1] px-2 py-1 rounded font-bold border border-[#4299e1]/30">共 {{ item.form_schema?.length || 0 }} 題</span>
                <span v-if="item.status !== 'draft'" class="bg-[#00d4aa]/10 text-[#00d4aa] px-2 py-1 rounded font-bold border border-[#00d4aa]/30">已回收: {{ getUniqueRespondentCount(item) }} 份</span>
              </div>
              
              <p v-if="item.status === 'ended'" class="text-sm text-[#ff3366] mt-3 italic">問卷已截止，可查看詳細結算報告。</p>
            </div>
            
            <div class="flex gap-2 mt-5 pt-4 border-t border-[#333366] flex-wrap">
              <button v-if="item.status !== 'ended'" @click="editItem(item)" class="flex-1 py-2 bg-[#0a0e27] hover:bg-white/10 text-white rounded-lg text-sm font-bold border border-[#333366] transition-colors shadow-inner">編輯 / 預覽</button>
              
              <button v-if="item.status === 'draft'" @click="updateStatus(item, 'active')" class="flex-1 py-2 text-white rounded-lg text-sm font-bold transition-colors bg-[#4299e1]/20 text-[#4299e1] hover:bg-[#4299e1] hover:text-[#16162a]">發佈</button>
              
              <button v-if="item.status === 'active' || item.status === 'ended'" @click="viewSurveyResult(item)" class="flex-1 py-2 text-white rounded-lg text-sm font-bold transition-colors bg-[#00d4aa]/20 text-[#00d4aa] hover:bg-[#00d4aa] hover:text-[#16162a]">查看結果</button>
              
              <button v-if="item.status === 'active'" @click="updateStatus(item, 'ended')" class="flex-1 py-2 bg-[#ff3366]/20 text-[#ff3366] hover:bg-[#ff3366] hover:text-white rounded-lg text-sm font-bold transition-colors">結束 / 結算</button>
              
              <button @click="triggerDelete(item)" class="px-3 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-sm font-bold border border-red-500/30 transition-colors shadow-inner">🗑️</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="viewMode === 'result' && selectedSurvey" class="flex-1 flex flex-col bg-[#0a0e27] rounded-xl border border-[#333366] shadow-inner mb-2 animate-fade-in relative min-h-[550px]">
      
      <div class="flex items-center justify-between p-4 border-b border-[#333366] bg-[#16162a]/80 rounded-t-xl shrink-0 backdrop-blur-sm">
        <button @click="viewMode = 'list'" class="flex items-center gap-2 text-[#a0a0b8] hover:text-[#4299e1] transition-colors text-sm font-bold bg-[#333366]/30 hover:bg-[#333366]/60 px-4 py-2 rounded-lg">
          <span>⬅</span> 返回列表
        </button>
        <div class="text-white font-bold text-lg flex items-center gap-3">
          📊 問卷結算報告
          <span class="text-[10px] px-2 py-1 rounded tracking-wider" :class="getStatusClass(selectedSurvey.status)">{{ getStatusText(selectedSurvey.status) }}</span>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto custom-scrollbar p-5 md:p-6">
        <div class="flex flex-col min-h-full">
          
          <div class="text-center mb-8 shrink-0">
            <h2 class="text-3xl font-black text-white mb-4">{{ selectedSurvey.title }}</h2>
            <div class="flex flex-wrap items-center justify-center gap-3 text-sm text-[#a0a0b8]">
              <span class="bg-[#333366]/40 border border-[#333366] px-4 py-1.5 rounded-full shadow-sm">總繳交人數: <strong class="text-white ml-1">{{ uniqueRespondentIds.length }} / {{ classStudents.length }}</strong> 人</span>
              <span class="bg-[#333366]/40 border border-[#333366] px-4 py-1.5 rounded-full shadow-sm">總題數: <strong class="text-[#4299e1] ml-1">{{ selectedSurvey.form_schema?.length || 0 }}</strong> 題</span>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 items-stretch min-h-0">
            
            <div class="lg:col-span-2 bg-[#16162a] p-6 rounded-xl border border-[#333366] shadow-lg flex flex-col h-full">
              <h3 class="text-[#4299e1] font-bold text-lg mb-6 flex items-center gap-2 shrink-0 border-b border-[#333366] pb-3">
                <span>📑</span> 題目數據總覽
              </h3>
              
              <div class="space-y-8 flex-1 overflow-y-auto custom-scrollbar pr-2">
                <div v-if="aggregatedResults.length === 0" class="text-center text-[#666688] py-10">尚無作答數據可供分析</div>
                
                <div v-for="(q, index) in aggregatedResults" :key="q.id" class="bg-[#0a0e27] border border-[#333366] p-5 rounded-xl">
                  <h4 class="text-white font-bold text-base mb-4 flex gap-2">
                    <span class="text-[#666688]">{{ index + 1 }}.</span> {{ q.title }}
                  </h4>
                  
                  <div v-if="['multiple_choice', 'checkbox', 'dropdown'].includes(q.type)" class="space-y-3">
                    <div v-for="opt in q.optionCounts" :key="opt.text" class="relative">
                      <div class="flex justify-between items-end mb-1">
                        <span class="text-[#a0a0b8] text-sm pr-4">{{ opt.text }}</span>
                        <div class="text-white font-bold text-sm">{{ opt.count }} <span class="text-xs text-[#666688] font-normal">票 ({{ q.totalAnswers > 0 ? Math.round((opt.count / q.totalAnswers) * 100) : 0 }}%)</span></div>
                      </div>
                      <div class="w-full h-2 bg-[#16162a] rounded-full overflow-hidden border border-[#333366]">
                        <div class="h-full bg-gradient-to-r from-[#4299e1] to-[#00d4aa] transition-all duration-1000 relative" :style="{ width: `${q.totalAnswers > 0 ? (opt.count / q.totalAnswers) * 100 : 0}%` }"></div>
                      </div>
                    </div>
                  </div>

                  <div v-else-if="['linear_scale', 'rating'].includes(q.type)" class="flex flex-col sm:flex-row items-center gap-6">
                    <div class="bg-[#16162a] w-24 h-24 rounded-full flex flex-col items-center justify-center border-4 border-[#4299e1] shadow-[0_0_15px_rgba(66,153,225,0.2)] shrink-0">
                      <span class="text-3xl font-black text-white">{{ q.average }}</span>
                      <span class="text-[10px] text-[#a0a0b8]">平均分數</span>
                    </div>
                    <div class="flex-1 w-full space-y-1">
                      <div v-for="(count, val) in q.frequencies" :key="val" class="flex items-center gap-2 text-xs">
                        <span class="w-4 text-right text-[#a0a0b8] font-bold">{{ val }}</span>
                        <div class="flex-1 h-1.5 bg-[#16162a] rounded-full overflow-hidden">
                          <div class="h-full bg-[#4299e1]" :style="{ width: `${(count / q.totalAnswers) * 100}%` }"></div>
                        </div>
                        <span class="w-6 text-[#666688]">{{ count }}</span>
                      </div>
                    </div>
                  </div>

                  <div v-else-if="['short_text', 'paragraph'].includes(q.type)" class="bg-[#16162a] p-3 rounded-lg max-h-[150px] overflow-y-auto custom-scrollbar border border-[#333366]/50">
                    <ul class="space-y-2">
                      <li v-for="(ans, i) in q.textAnswers" :key="i" class="text-sm text-[#a0a0b8] bg-[#0a0e27] p-2 rounded flex gap-2">
                        <span class="text-[#4299e1] shrink-0">💬</span> {{ ans }}
                      </li>
                      <li v-if="q.textAnswers.length === 0" class="text-xs text-[#666688] text-center">尚無文字回應</li>
                    </ul>
                  </div>

                  <div v-else class="text-sm text-[#666688] bg-[#16162a] p-4 rounded-lg text-center border border-[#333366]/50">
                    此題型為進階矩陣資料，建議匯出 JSON 使用外部軟體進行交叉分析。
                  </div>

                  <div class="text-right mt-3 text-[10px] text-[#666688]">有效回應數: {{ q.totalAnswers }}</div>
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-6 h-full min-h-0">
              
              <div class="bg-[#16162a] p-6 rounded-xl border border-[#333366] shadow-lg shrink-0">
                <h3 class="text-[#00d4aa] font-bold text-lg mb-4 flex items-center gap-2">
                  <span>👥</span> 繳交進度
                </h3>
                <div class="flex items-center gap-4">
                  <div class="flex-1 h-4 bg-[#0a0e27] rounded-full overflow-hidden border border-[#333366] shadow-inner relative">
                    <div class="h-full bg-[#00d4aa] transition-all duration-1000 relative" :style="{ width: `${classStudents.length > 0 ? (uniqueRespondentIds.length / classStudents.length) * 100 : 0}%` }">
                      <div class="absolute inset-0 w-full h-full opacity-30" style="background-image: linear-gradient(45deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.2) 75%, transparent 75%, transparent); background-size: 1rem 1rem;"></div>
                    </div>
                  </div>
                  <div class="text-3xl font-black text-[#00d4aa] drop-shadow-md">{{ classStudents.length > 0 ? Math.round((uniqueRespondentIds.length / classStudents.length) * 100) : 0 }}%</div>
                </div>
              </div>

              <div class="bg-[#16162a] rounded-xl border border-[#333366] shadow-lg overflow-hidden flex flex-col flex-1 min-h-[250px]">
                <div class="flex border-b border-[#333366] bg-[#0a0e27]/50 shrink-0">
                  <button @click="activeResultTab = 'submitted'" class="flex-1 py-3.5 text-sm font-bold transition-colors border-b-2" :class="activeResultTab === 'submitted' ? 'bg-[#00d4aa]/10 text-[#00d4aa] border-[#00d4aa]' : 'text-[#a0a0b8] border-transparent hover:bg-white/5 hover:text-white'">✅ 已繳交 ({{ submittedStudents.length }})</button>
                  <button @click="activeResultTab = 'unsubmitted'" class="flex-1 py-3.5 text-sm font-bold transition-colors border-b-2" :class="activeResultTab === 'unsubmitted' ? 'bg-[#ff3366]/10 text-[#ff3366] border-[#ff3366]' : 'text-[#a0a0b8] border-transparent hover:bg-white/5 hover:text-white'">❌ 未繳交 ({{ unsubmittedStudents.length }})</button>
                </div>
                
                <div class="flex-1 overflow-y-auto custom-scrollbar p-4 bg-[#0a0e27]/30">
                  <div v-if="activeResultTab === 'submitted'" class="flex flex-col gap-2">
                    <div v-for="student in submittedStudents" :key="student.id" class="flex items-center gap-3 bg-[#16162a] p-2.5 rounded-lg border border-[#00d4aa]/30 shadow-sm hover:border-[#00d4aa]/60 transition-colors">
                      <img v-if="student.avatar_url" :src="student.avatar_url" class="w-7 h-7 rounded-full object-cover border border-[#00d4aa]/50">
                      <div v-else class="w-7 h-7 rounded-full bg-[#00d4aa]/20 text-[#00d4aa] flex items-center justify-center text-[11px] font-bold border border-[#00d4aa]/50">{{ student.username ? student.username.charAt(0) : '學' }}</div>
                      <span class="text-white text-xs truncate font-medium">{{ student.username || '未命名' }}</span>
                    </div>
                    <div v-if="submittedStudents.length === 0" class="text-center text-[#666688] text-sm py-10">目前還沒有人繳交</div>
                  </div>

                  <div v-if="activeResultTab === 'unsubmitted'" class="flex flex-col gap-2">
                    <div v-for="student in unsubmittedStudents" :key="student.id" class="flex items-center gap-3 bg-[#16162a] p-2.5 rounded-lg border border-[#ff3366]/20 shadow-sm hover:border-[#ff3366]/50 transition-colors">
                      <img v-if="student.avatar_url" :src="student.avatar_url" class="w-7 h-7 rounded-full object-cover grayscale opacity-60 border border-[#ff3366]/30">
                      <div v-else class="w-7 h-7 rounded-full bg-[#ff3366]/10 text-[#ff3366] flex items-center justify-center text-[11px] font-bold border border-[#ff3366]/30">{{ student.username ? student.username.charAt(0) : '學' }}</div>
                      <span class="text-[#a0a0b8] text-xs truncate">{{ student.username || '未命名' }}</span>
                    </div>
                    <div v-if="unsubmittedStudents.length === 0" class="text-center text-[#00d4aa] font-bold text-sm py-10">🎉 太棒了！全班都已經繳交完畢！</div>
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
        
        <div class="bg-[#16162a] border-t-8 border-[#4299e1] p-6 rounded-xl shadow-lg relative">
          <input ref="titleInput" v-model="editingItem.title" type="text" placeholder="問卷標題" class="w-full bg-transparent text-3xl text-white font-black outline-none border-b border-transparent focus:border-[#4299e1] pb-2 transition-colors mb-1" :class="formErrors.title ? 'border-rose-400' : ''">
          <p v-if="formErrors.title" class="mb-3 text-sm font-medium text-rose-300" role="alert">{{ formErrors.title }}</p>
          <p v-if="formErrors.permission" class="mb-3 text-sm font-medium text-rose-300" role="alert">{{ formErrors.permission }}</p>
          <textarea v-model="editingItem.desc" placeholder="表單說明..." class="w-full bg-transparent text-[#a0a0b8] outline-none border-b border-transparent focus:border-[#4299e1] pb-2 resize-none transition-colors min-h-[60px]"></textarea>
          
          <div class="flex gap-4 mt-4 pt-4 border-t border-[#333366]">
             <div class="flex items-center gap-2">
               <span class="text-[#a0a0b8] text-sm">📅 截止日期</span>
               <input v-model="editingItem.deadline" type="date" class="bg-[#0a0e27] border border-[#333366] rounded px-2 py-1 text-white text-sm [color-scheme:dark] outline-none">
             </div>
             <div class="flex items-center gap-2">
               <span class="text-[#a0a0b8] text-sm">✨ 經驗值獎勵</span>
               <input v-model="editingItem.points" type="number" class="bg-[#0a0e27] border border-[#333366] rounded px-2 py-1 text-white text-sm w-20 outline-none">
             </div>
          </div>
        </div>

        <div v-for="(q, index) in editingItem.form_schema" :key="q.id" class="bg-[#16162a] p-6 rounded-xl border border-[#333366] shadow-md group focus-within:border-l-4 focus-within:border-l-[#4299e1] transition-all">
          <div class="flex flex-col md:flex-row gap-4 mb-5">
            <input v-model="q.title" type="text" placeholder="未命名問題" class="flex-1 bg-transparent text-lg text-white font-bold outline-none border-b border-[#333366] focus:border-[#4299e1] pb-2 transition-colors bg-[#0a0e27] px-3 py-2 rounded-t">
            <select v-model="q.type" class="bg-[#0a0e27] border border-[#333366] text-white px-3 py-2 rounded-lg outline-none focus:border-[#4299e1] w-full md:w-48 font-bold text-sm shrink-0">
              <optgroup label="文字">
                <option value="short_text">〰️ 簡答</option>
                <option value="paragraph">📝 詳答</option>
              </optgroup>
              <optgroup label="選擇">
                <option value="multiple_choice">⚪ 單選題</option>
                <option value="checkbox">☑️ 核取方塊</option>
                <option value="dropdown">🔽 下拉式選單</option>
              </optgroup>
              <optgroup label="網格與刻度">
                <option value="linear_scale">📏 線性刻度</option>
                <option value="rating">⭐ 評分</option>
                <option value="radio_grid">▦ 單選方格</option>
                <option value="checkbox_grid">🔠 核取方塊格</option>
              </optgroup>
              <optgroup label="日期與時間">
                <option value="date">📅 日期</option>
                <option value="time">🕒 時間</option>
              </optgroup>
            </select>
          </div>

          <div class="pl-2 mb-6">
            <div v-if="['multiple_choice', 'checkbox', 'dropdown'].includes(q.type)" class="space-y-2">
              <div v-for="(opt, oIndex) in q.options" :key="oIndex" class="flex items-center gap-3">
                <span v-if="q.type === 'multiple_choice'" class="text-[#666688] text-lg">⚪</span>
                <span v-else-if="q.type === 'checkbox'" class="text-[#666688] text-lg">☐</span>
                <span v-else class="text-[#666688] text-sm">{{ oIndex + 1 }}.</span>
                <input v-model="q.options[oIndex]" type="text" placeholder="選項內容" class="flex-1 bg-transparent border-b border-transparent hover:border-[#333366] focus:border-[#4299e1] text-white outline-none py-1">
                <button @click="removeOption(q, oIndex)" class="text-[#666688] hover:text-red-500">✕</button>
              </div>
              <button @click="addOption(q)" class="text-[#4299e1] text-sm font-bold flex items-center gap-1 mt-2"><span>＋</span> 新增選項</button>
            </div>

            <div v-else-if="['radio_grid', 'checkbox_grid'].includes(q.type)" class="flex flex-col md:flex-row gap-8">
              <div class="flex-1 space-y-2">
                <h5 class="text-[#a0a0b8] font-bold text-sm mb-3">列 (Rows)</h5>
                <div v-for="(row, rIndex) in q.rows" :key="'r'+rIndex" class="flex items-center gap-2">
                  <span class="text-[#666688] text-sm">{{ rIndex + 1 }}.</span>
                  <input v-model="q.rows[rIndex]" type="text" placeholder="列名稱" class="flex-1 bg-transparent border-b border-[#333366] focus:border-[#4299e1] text-white outline-none py-1">
                  <button @click="removeRow(q, rIndex)" class="text-[#666688] hover:text-red-500">✕</button>
                </div>
                <button @click="addRow(q)" class="text-[#4299e1] text-xs font-bold mt-1">＋ 新增列</button>
              </div>
              <div class="flex-1 space-y-2">
                <h5 class="text-[#a0a0b8] font-bold text-sm mb-3">欄 (Columns)</h5>
                <div v-for="(col, cIndex) in q.columns" :key="'c'+cIndex" class="flex items-center gap-2">
                  <span class="text-[#666688] text-lg">{{ q.type === 'radio_grid' ? '⚪' : '☐' }}</span>
                  <input v-model="q.columns[cIndex]" type="text" placeholder="欄名稱" class="flex-1 bg-transparent border-b border-[#333366] focus:border-[#4299e1] text-white outline-none py-1">
                  <button @click="removeColumn(q, cIndex)" class="text-[#666688] hover:text-red-500">✕</button>
                </div>
                <button @click="addColumn(q)" class="text-[#4299e1] text-xs font-bold mt-1">＋ 新增欄</button>
              </div>
            </div>

            <div v-else-if="q.type === 'linear_scale'" class="flex flex-col lg:flex-row lg:items-center gap-4 bg-[#0a0e27] p-4 rounded-xl border border-[#333366]/50 shadow-inner">
               <div class="flex items-center gap-3">
                 <span class="text-[#a0a0b8] text-sm font-bold">數值範圍：</span>
                 <select v-model="q.scale.min" class="bg-[#16162a] border border-[#333366] text-white rounded-lg px-3 py-1.5 outline-none focus:border-[#4299e1] font-bold cursor-pointer">
                   <option :value="0">0</option>
                   <option :value="1">1</option>
                 </select>
                 <span class="text-[#a0a0b8] font-bold">~</span>
                 <select v-model="q.scale.max" class="bg-[#16162a] border border-[#333366] text-white rounded-lg px-3 py-1.5 outline-none focus:border-[#4299e1] font-bold cursor-pointer">
                   <option v-for="n in 9" :key="n" :value="n+1">{{ n+1 }}</option>
                 </select>
               </div>
               
               <div class="hidden lg:block w-px h-8 bg-[#333366]"></div>
               
               <div class="flex items-center gap-3">
                 <span class="text-[#a0a0b8] text-sm font-bold shrink-0">快速標籤：</span>
                 <select v-model="q.scale.labelPreset" @change="applyPresetLabel(q)" class="bg-[#16162a] border border-[#333366] text-white rounded-lg px-3 py-1.5 outline-none focus:border-[#4299e1] text-sm cursor-pointer flex-1">
                   <option value="none">無標籤 (僅顯示數字)</option>
                   <option value="satisfaction">滿意度 (非常不滿意 ➔ 非常滿意)</option>
                   <option value="agreement">同意度 (非常不同意 ➔ 非常同意)</option>
                   <option value="difficulty">難易度 (非常簡單 ➔ 非常困難)</option>
                   <option value="frequency">頻率 (從不 ➔ 總是)</option>
                 </select>
               </div>
            </div>

            <div v-else-if="q.type === 'rating'" class="flex items-center gap-4">
              <span class="text-[#a0a0b8] text-sm">最高星數：</span>
              <select v-model="q.ratingMax" class="bg-[#0a0e27] border border-[#333366] text-white rounded px-3 py-1 outline-none">
                <option :value="3">3 星</option>
                <option :value="5">5 星</option>
                <option :value="10">10 星</option>
              </select>
              <div class="flex gap-1 text-yellow-500 text-xl ml-4">
                <span v-for="n in q.ratingMax" :key="n">★</span>
              </div>
            </div>

            <div v-else-if="q.type === 'short_text'" class="border-b border-dashed border-[#666688] w-1/2 py-2 text-[#666688] text-sm">簡短回答文字</div>
            <div v-else-if="q.type === 'paragraph'" class="border-b border-dashed border-[#666688] w-full py-2 text-[#666688] text-sm">詳答文字區域...</div>
            <div v-else-if="q.type === 'date'" class="text-[#666688] text-lg">📅 年 / 月 / 日</div>
            <div v-else-if="q.type === 'time'" class="text-[#666688] text-lg">🕒 時 : 分</div>
          </div>

          <div class="flex justify-end items-center gap-4 pt-4 border-t border-[#333366]">
            <button @click="duplicateQuestion(index)" class="text-[#a0a0b8] hover:text-white transition-colors text-sm">📑 複製</button>
            <button @click="deleteQuestion(index)" class="text-[#a0a0b8] hover:text-red-500 transition-colors text-sm">🗑️ 刪除</button>
            <div class="w-px h-6 bg-[#333366]"></div>
            <label class="flex items-center gap-2 cursor-pointer">
              <span class="text-sm font-bold" :class="q.required ? 'text-[#4299e1]' : 'text-[#a0a0b8]'">必填</span>
              <input type="checkbox" v-model="q.required" class="w-4 h-4 accent-[#4299e1]">
            </label>
          </div>
        </div>
        <div class="pb-10"></div>
      </div>

      <div class="w-16 md:w-20 bg-[#16162a] border-l border-[#333366] flex flex-col items-center py-4 md:py-6 gap-4 shrink-0 z-10 overflow-y-auto custom-scrollbar">
        <button @click="viewMode = 'list'" class="w-10 h-10 shrink-0 text-[#a0a0b8] hover:text-white bg-[#333366]/50 rounded-lg flex items-center justify-center transition-all mb-2" title="返回">⬅</button>
        <button @click="addQuestion" class="w-10 h-10 md:w-12 md:h-12 shrink-0 bg-[#4299e1]/20 hover:bg-[#4299e1] text-[#4299e1] hover:text-white rounded-full flex items-center justify-center text-xl md:text-2xl transition-all shadow-md" title="新增問題">＋</button>
        <div class="w-8 h-px bg-[#333366] shrink-0"></div>
        <button @click="viewMode = 'preview'" class="w-10 h-10 shrink-0 text-[#a0a0b8] hover:text-white hover:bg-white/10 rounded-lg flex items-center justify-center transition-all" title="學生視角預覽">👁️</button>
        <button @click="exportSurvey" class="w-10 h-10 shrink-0 text-[#a0a0b8] hover:text-white hover:bg-white/10 rounded-lg flex items-center justify-center transition-all" title="匯出 JSON">📤</button>
        <label class="w-10 h-10 shrink-0 text-[#a0a0b8] hover:text-white hover:bg-white/10 rounded-lg flex items-center justify-center transition-all cursor-pointer m-0" title="匯入 JSON">
          📥<input type="file" accept=".json" class="hidden" @change="importSurvey">
        </label>
        
        <div class="mt-auto flex flex-col gap-3 shrink-0 w-full items-center pt-4">
          <button @click="saveSurvey('draft')" class="flex flex-col items-center text-[#a0a0b8] hover:text-white group" title="存為草稿">
            <span class="text-lg group-hover:scale-110 transition-transform">💾</span>
            <span class="text-[10px] mt-1 font-bold hidden md:block">草稿</span>
          </button>
          <button @click="saveSurvey('active')" class="w-10 h-10 md:w-12 md:h-12 shrink-0 bg-[#4299e1] text-white rounded-full font-bold shadow-[0_0_15px_rgba(66,153,225,0.4)] hover:scale-110 transition-all flex items-center justify-center text-xl mt-2" title="發佈">🚀</button>
        </div>
      </div>
    </div>

    <div v-else-if="viewMode === 'preview'" class="flex-1 flex flex-col bg-[#0a0e27] rounded-xl border border-[#333366] relative overflow-hidden mb-2 animate-fade-in">
      <div class="absolute top-4 left-0 right-0 flex justify-center z-20">
        <div class="bg-[#ffbb33] text-[#16162a] px-4 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-3">
          <span>👁️ 目前為學生視角預覽模式</span>
          <button @click="viewMode = 'edit'" class="bg-[#16162a] text-white px-3 py-1 rounded-full text-xs hover:bg-black">返回編輯</button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 pt-20 flex justify-center">
        <div class="w-full max-w-3xl space-y-4">
          <div class="bg-[#16162a] border-t-8 border-[#4299e1] p-8 rounded-xl shadow-lg border border-[#333366]">
            <h1 class="text-3xl text-white font-black mb-3">{{ editingItem.title || '未命名問卷' }}</h1>
            <p class="text-[#a0a0b8] whitespace-pre-wrap">{{ editingItem.desc }}</p>
            <p class="text-red-500 text-sm mt-4 font-bold">* 必填</p>
          </div>

          <div v-for="(q, index) in editingItem.form_schema" :key="index" class="bg-[#16162a] p-8 rounded-xl shadow-md border border-[#333366]">
            <h3 class="text-white text-lg font-bold mb-4">{{ q.title || '未命名問題' }} <span v-if="q.required" class="text-red-500">*</span></h3>
            
            <input v-if="q.type === 'short_text'" type="text" placeholder="您的回答" class="w-full md:w-1/2 bg-transparent border-b border-[#666688] focus:border-[#4299e1] text-white outline-none py-2 transition-colors">
            <textarea v-else-if="q.type === 'paragraph'" placeholder="您的回答" class="w-full bg-transparent border-b border-[#666688] focus:border-[#4299e1] text-white outline-none py-2 min-h-[80px] resize-none transition-colors"></textarea>
            
            <div v-else-if="q.type === 'multiple_choice'" class="space-y-3">
              <label v-for="opt in q.options" :key="opt" class="flex items-center gap-3 cursor-pointer group">
                <input type="radio" :name="q.id" class="w-5 h-5 accent-[#4299e1] cursor-pointer">
                <span class="text-white group-hover:text-[#4299e1] transition-colors">{{ opt }}</span>
              </label>
            </div>

            <div v-else-if="q.type === 'checkbox'" class="space-y-3">
              <label v-for="opt in q.options" :key="opt" class="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" :name="q.id" class="w-5 h-5 accent-[#4299e1] cursor-pointer rounded">
                <span class="text-white group-hover:text-[#4299e1] transition-colors">{{ opt }}</span>
              </label>
            </div>

            <div v-else-if="q.type === 'dropdown'" class="w-full md:w-1/2">
              <select class="w-full bg-[#0a0e27] border border-[#333366] text-white px-4 py-3 rounded-lg outline-none focus:border-[#4299e1]">
                <option value="" disabled selected>請選擇</option>
                <option v-for="opt in q.options" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </div>

            <div v-else-if="q.type === 'linear_scale'" class="flex flex-col items-center max-w-lg mx-auto mt-4">
              <div class="flex justify-between w-full text-[#a0a0b8] text-sm mb-4">
                <span>{{ q.scale?.minLabel }}</span>
                <span>{{ q.scale?.maxLabel }}</span>
              </div>
              <div class="flex justify-between w-full">
                <label v-for="n in (q.scale?.max - q.scale?.min + 1)" :key="n" class="flex flex-col items-center gap-2 cursor-pointer">
                  <span class="text-white font-bold">{{ Number(q.scale?.min) + n - 1 }}</span>
                  <input type="radio" :name="q.id" class="w-5 h-5 accent-[#4299e1]">
                </label>
              </div>
            </div>

            <div v-else-if="q.type === 'rating'" class="flex items-center gap-2 text-3xl">
              <span v-for="n in q.ratingMax" :key="n" class="text-[#333366] hover:text-yellow-500 cursor-pointer transition-colors">★</span>
            </div>

            <div v-else-if="['radio_grid', 'checkbox_grid'].includes(q.type)" class="overflow-x-auto">
              <table class="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr>
                    <th class="p-3"></th>
                    <th v-for="col in q.columns" :key="col" class="p-3 text-center text-white font-medium">{{ col }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, rIdx) in q.rows" :key="row" class="bg-[#0a0e27]/50 border-t border-[#333366] hover:bg-[#333366]/30 transition-colors">
                    <td class="p-4 text-white font-medium">{{ row }}</td>
                    <td v-for="(col, cIdx) in q.columns" :key="cIdx" class="p-4 text-center">
                      <input :type="q.type === 'radio_grid' ? 'radio' : 'checkbox'" :name="`${q.id}_${rIdx}`" class="w-5 h-5 accent-[#4299e1] cursor-pointer">
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <input v-else-if="q.type === 'date'" type="date" class="bg-[#0a0e27] border-b border-[#666688] focus:border-[#4299e1] text-white px-3 py-2 outline-none [color-scheme:dark]">
            <input v-else-if="q.type === 'time'" type="time" class="bg-[#0a0e27] border-b border-[#666688] focus:border-[#4299e1] text-white px-3 py-2 outline-none [color-scheme:dark]">
          </div>

          <div class="flex justify-between items-center mt-6">
            <button class="px-6 py-2.5 bg-[#4299e1] text-white font-bold rounded-lg pointer-events-none opacity-50">提交</button>
            <button class="text-[#4299e1] text-sm font-bold pointer-events-none opacity-50">清除表單</button>
          </div>
          <div class="pb-20"></div>
        </div>
      </div>
    </div>
    <ConfirmModal
      :is-open="isConfirmModalOpen"
      :title="confirmModalConfig.title"
      :message="confirmModalConfig.message"
      :confirm-text="confirmModalConfig.confirmText"
      :cancel-text="confirmModalConfig.cancelText"
      :icon="confirmModalConfig.icon"
      :is-danger="confirmModalConfig.isDanger"
      @confirm="handleModalConfirm"
      @cancel="handleModalCancel"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { supabase } from '../../../../supabase.js';
import ConfirmModal from '../../../common/ConfirmModal.vue';
import ToastMessage from '../../../common/ToastMessage.vue';

const viewMode = ref('list'); // 'list', 'edit', 'preview', 'result'
const surveysList = ref([]);
const classStudents = ref([]); 
const myTeacherProfile = ref({ id: '', class_code: '', role: '' });
const emit = defineEmits(['mode-change']);
const formErrors = ref({ title: '', permission: '' });
const titleInput = ref(null);
const notice = ref({ message: '', type: 'success' });
let noticeTimer;
const isConfirmModalOpen = ref(false);
const confirmAction = ref(null);
const confirmModalConfig = ref({ title: '', message: '', confirmText: '確認', cancelText: '取消', icon: '⚠️', isDanger: false });

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
const openConfirm = (config, onConfirm) => {
  confirmModalConfig.value = { ...confirmModalConfig.value, ...config };
  confirmAction.value = onConfirm;
  isConfirmModalOpen.value = true;
};
const handleModalConfirm = () => {
  const action = confirmAction.value;
  isConfirmModalOpen.value = false;
  confirmAction.value = null;
  action?.();
};
const handleModalCancel = () => { isConfirmModalOpen.value = false; confirmAction.value = null; };

// 🌟 結算報告相關狀態
const selectedSurvey = ref(null);
const activeResultTab = ref('unsubmitted'); 

const defaultSurvey = { title: '', desc: '', deadline: '', points: 50, form_schema: [], status: 'draft' };
const editingItem = ref(JSON.parse(JSON.stringify(defaultSurvey)));

const getStatusText = (status) => ({ draft: '📝 草稿', active: '🟢 進行中', ended: '🛑 已截止' })[status] || status;
const getStatusClass = (status) => ({
  draft: 'bg-[#333366] text-white',
  active: 'bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30',
  ended: 'bg-[#ff3366]/20 text-[#ff3366] border border-[#ff3366]/30'
})[status];

// 🌟 取得不重複填答人數
const getUniqueRespondentCount = (survey) => {
  if (!survey || !survey.responses) return 0;
  return new Set(survey.responses.map(r => r.user_id)).size;
};

// 🌟 篩選出已經填寫問卷的學生 ID 集合
const uniqueRespondentIds = computed(() => {
  if (!selectedSurvey.value || !selectedSurvey.value.responses) return [];
  return [...new Set(selectedSurvey.value.responses.map(r => r.user_id))];
});

// 🌟 已繳交名單
const submittedStudents = computed(() => {
  return classStudents.value.filter(s => uniqueRespondentIds.value.includes(s.id));
});

// 🌟 未繳交名單
const unsubmittedStudents = computed(() => {
  return classStudents.value.filter(s => !uniqueRespondentIds.value.includes(s.id));
});

// 🌟 智慧數據聚合器 (將各題型的 raw answers 轉為好呈現的圖表與統計資料)
const aggregatedResults = computed(() => {
  if (!selectedSurvey.value || !selectedSurvey.value.form_schema) return [];
  const responses = selectedSurvey.value.responses || [];
  
  return selectedSurvey.value.form_schema.map(q => {
    const data = { ...q, totalAnswers: 0 };
    
    // 從所有學生的表單回覆中，抽出「這一題」的答案
    const rawAnswers = responses
      .map(r => r.answers && r.answers[q.id])
      .filter(a => a !== undefined && a !== null && a !== '');
      
    data.totalAnswers = rawAnswers.length;

    // 依據題型進行資料分析
    if (['short_text', 'paragraph', 'date', 'time'].includes(q.type)) {
      // 文字類：直接收集為清單
      data.textAnswers = rawAnswers;
      
    } else if (['multiple_choice', 'dropdown'].includes(q.type)) {
      // 單選類：計算各選項票數
      data.optionCounts = q.options.map(opt => ({
        text: opt,
        count: rawAnswers.filter(a => a === opt).length
      }));
      
    } else if (q.type === 'checkbox') {
      // 多選類：學生可能傳回 Array，拆開計算各選項票數
      data.optionCounts = q.options.map(opt => ({
        text: opt,
        count: rawAnswers.filter(a => Array.isArray(a) && a.includes(opt)).length
      }));
      
    } else if (['linear_scale', 'rating'].includes(q.type)) {
      // 評分/刻度類：計算平均值與頻率分佈圖
      const nums = rawAnswers.map(a => Number(a)).filter(n => !isNaN(n));
      data.average = nums.length ? (nums.reduce((sum, n) => sum + n, 0) / nums.length).toFixed(1) : 0;
      
      const freqs = {};
      // 初始化刻度區間確保順序
      const min = q.type === 'rating' ? 1 : Number(q.scale?.min || 1);
      const max = q.type === 'rating' ? Number(q.ratingMax || 5) : Number(q.scale?.max || 5);
      for(let i = min; i <= max; i++) freqs[i] = 0;
      
      nums.forEach(n => { if(freqs[n] !== undefined) freqs[n]++; });
      data.frequencies = freqs;
    }
    
    return data;
  });
});

const fetchData = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { data: profile, error: profileError } = await supabase.from('profiles').select('id, class_code, role').eq('id', user.id).single();
  if (profileError || !profile || profile.role !== 'teacher' || !profile.class_code) {
    showNotice('沒有班級發布權限，請確認教師帳號與班級設定。', 'error');
    return;
  }
  myTeacherProfile.value = profile;

  // 🌟 抓取班級所有的學生名單 (用來比對誰還沒寫問卷)
  const { data: students } = await supabase.from('profiles')
    .select('id, username, avatar_url')
    .eq('class_code', profile.class_code)
    .eq('role', 'student');
  classStudents.value = students || [];

  const { data: surveys } = await supabase.from('surveys').select('*').eq('class_code', profile.class_code).order('created_at', { ascending: false });
  if (surveys) {
    const surveyIds = surveys.map(survey => survey.id);
    const { data: responses } = surveyIds.length
      ? await supabase.from('survey_responses').select('survey_id, user_id, answers').in('survey_id', surveyIds)
      : { data: [] };
    const responsesBySurvey = new Map();
    for (const response of responses || []) {
      const surveyResponses = responsesBySurvey.get(response.survey_id) || [];
      surveyResponses.push(response);
      responsesBySurvey.set(response.survey_id, surveyResponses);
    }

    for (let survey of surveys) {
      // Keep the component's existing response shape while loading it in bulk.
      survey.responses = responsesBySurvey.get(survey.id) || [];
    }
    surveysList.value = surveys;
  }
};

const createNewItem = () => {
  editingItem.value = JSON.parse(JSON.stringify(defaultSurvey));
  addQuestion(); 
  viewMode.value = 'edit';
};

const editItem = (item) => {
  editingItem.value = JSON.parse(JSON.stringify(item));
  if (!editingItem.value.form_schema) editingItem.value.form_schema = [];
  viewMode.value = 'edit';
};

// 🌟 打開結算報告
const viewSurveyResult = (item) => {
  selectedSurvey.value = item;
  activeResultTab.value = 'unsubmitted'; // 預設打開未繳交分頁
  viewMode.value = 'result';
};

const addQuestion = () => {
  editingItem.value.form_schema.push({
    id: 'q_' + Date.now(), type: 'multiple_choice', title: '', required: false,
    options: ['選項 1'], rows: ['列 1'], columns: ['欄 1'], 
    scale: { min: 1, max: 5, minLabel: '', maxLabel: '', labelPreset: 'none' }, ratingMax: 5
  });
};

const duplicateQuestion = (index) => {
  const copy = JSON.parse(JSON.stringify(editingItem.value.form_schema[index]));
  copy.id = 'q_' + Date.now();
  editingItem.value.form_schema.splice(index + 1, 0, copy);
};
const deleteQuestion = (index) => editingItem.value.form_schema.splice(index, 1);
const addOption = (q) => q.options.push(`選項 ${q.options.length + 1}`);
const removeOption = (q, index) => { if (q.options.length > 1) q.options.splice(index, 1); };
const addRow = (q) => q.rows.push(`列 ${q.rows.length + 1}`);
const removeRow = (q, index) => { if (q.rows.length > 1) q.rows.splice(index, 1); };
const addColumn = (q) => q.columns.push(`欄 ${q.columns.length + 1}`);
const removeColumn = (q, index) => { if (q.columns.length > 1) q.columns.splice(index, 1); };

const applyPresetLabel = (q) => {
  const presets = {
    none: { min: '', max: '' },
    satisfaction: { min: '非常不滿意', max: '非常滿意' },
    agreement: { min: '非常不同意', max: '非常同意' },
    difficulty: { min: '非常簡單', max: '非常困難' },
    frequency: { min: '從不', max: '總是' }
  };
  if (presets[q.scale.labelPreset]) {
    q.scale.minLabel = presets[q.scale.labelPreset].min;
    q.scale.maxLabel = presets[q.scale.labelPreset].max;
  }
};

const exportSurvey = () => {
  const dataStr = JSON.stringify(editingItem.value, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${editingItem.value.title || '問卷'}.json`; a.click(); URL.revokeObjectURL(url);
};

const importSurvey = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const importedData = JSON.parse(event.target.result);
      if (importedData.form_schema) { 
        delete importedData.id; 
        delete importedData.class_code;
        delete importedData.created_by;
        delete importedData.created_at;
        importedData.status = 'draft'; 

        editingItem.value = importedData; 
        showNotice('匯入成功，已載入為全新草稿。');
      } else {
        showNotice('檔案格式錯誤，找不到問卷資料。', 'error');
      }
    } catch (err) { 
      showNotice('JSON 解析失敗，請確認檔案是否損毀。', 'error');
    }
  };
  reader.readAsText(file); 
  e.target.value = ''; 
};

const saveSurvey = async (targetStatus) => {
  formErrors.value = { title: '', permission: '' };
  if (!editingItem.value.title.trim()) {
    formErrors.value.title = '請填寫問卷標題。';
    await nextTick();
    titleInput.value?.focus();
    return;
  }
  if (!myTeacherProfile.value.id || !myTeacherProfile.value.class_code || myTeacherProfile.value.role !== 'teacher') {
    formErrors.value.permission = '沒有班級發布權限，請確認教師帳號與班級設定。';
    return;
  }
  try {
    const payload = {
      title: editingItem.value.title, description: editingItem.value.desc, deadline: editingItem.value.deadline || null,
      points: Number(editingItem.value.points) || 50, class_code: myTeacherProfile.value.class_code, status: targetStatus,
      created_by: myTeacherProfile.value.id, form_schema: editingItem.value.form_schema 
    };
    const result = editingItem.value.id
      ? await supabase.from('surveys').update(payload).eq('id', editingItem.value.id)
      : await supabase.from('surveys').insert(payload);
    if (result.error) throw result.error;
    showNotice(targetStatus === 'active' ? '問卷已成功發布。' : '問卷草稿已儲存。');
    viewMode.value = 'list';
    await fetchData();
  } catch (err) {
    console.error('問卷儲存失敗:', err);
    formErrors.value.permission = getWriteErrorMessage(err);
    showNotice(formErrors.value.permission, 'error');
  }
};

const updateStatus = async (item, newStatus) => {
  const { error } = await supabase.from('surveys').update({ status: newStatus }).eq('id', item.id);
  if (error) { showNotice(getWriteErrorMessage(error), 'error'); return; }
  showNotice(newStatus === 'active' ? '問卷已發布。' : '問卷已結束。');
  await fetchData();
};
const triggerDelete = (item) => {
  openConfirm({ title: '刪除問卷', message: `確定要永久刪除「${item.title}」嗎？此動作無法復原。`, confirmText: '永久刪除', icon: '🗑️', isDanger: true }, async () => {
    const { error } = await supabase.from('surveys').delete().eq('id', item.id);
    if (error) { showNotice(getWriteErrorMessage(error), 'error'); return; }
    showNotice('問卷已刪除。');
    await fetchData();
  });
};

watch(viewMode, (newMode) => emit('mode-change', newMode));
defineExpose({ createNewItem });
onMounted(() => fetchData());
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(66, 153, 225, 0.3); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(66, 153, 225, 0.6); }
.animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
</style>
