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

      <div v-if="childViewMode === 'list'" class="mt-4 sm:mt-0">
        <button @click="triggerCreateNew" class="px-5 py-2.5 rounded-lg font-bold text-white transition-all shadow-md flex items-center gap-2"
                :class="activeTab === 'polls' ? 'bg-[#a78bfa] hover:bg-[#9061f9]' : 'bg-[#4299e1] hover:bg-[#3182ce]'">
          <span>＋</span> {{ activeTab === 'polls' ? '建立新投票' : '建立新問卷' }}
        </button>
      </div>

    </div>

    <div class="flex-1 overflow-hidden min-h-0 relative">
      <transition name="fade-slide" mode="out-in">
        <TeacherPolls v-if="activeTab === 'polls'" ref="activeComponentRef" @mode-change="handleModeChange" />
        <TeacherSurveys v-else-if="activeTab === 'surveys'" ref="activeComponentRef" @mode-change="handleModeChange" />
      </transition>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import TeacherPolls from './TeacherPolls.vue'; 
import TeacherSurveys from './TeacherSurveys.vue'; 

const activeTab = ref('polls'); 
const childViewMode = ref('list'); // 追蹤子元件目前的模式 (列表或編輯)
const activeComponentRef = ref(null); // 用來抓取目前顯示的子元件

// 切換頁籤時，重置模式
const switchTab = (tab) => {
  activeTab.value = tab;
  childViewMode.value = 'list'; 
};

// 接收子元件傳來的模式變化 (隱藏或顯示建立按鈕)
const handleModeChange = (mode) => {
  childViewMode.value = mode;
};

// 🌟 點擊按鈕時，呼叫子元件內部的 createNewItem 方法
const triggerCreateNew = () => {
  if (activeComponentRef.value && activeComponentRef.value.createNewItem) {
    activeComponentRef.value.createNewItem();
  }
};
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.3s ease; }
.fade-slide-enter-from { opacity: 0; transform: translateY(10px); }
.fade-slide-leave-to { opacity: 0; transform: translateY(-10px); }
</style>