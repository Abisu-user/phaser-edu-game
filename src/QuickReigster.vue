<template>
  <div class="w-full max-w-md mx-auto bg-[#16162a] border border-[#333366] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
    
    <div class="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#00d4aa] to-[#ffbb33]"></div>

    <h2 class="text-2xl font-bold text-white mb-2 flex items-center gap-2">
      <span>🚀</span> 快速學生註冊
    </h2>
    <p class="text-[#a0a0b8] text-sm mb-6">開發用快速通道：免驗證碼，直接建立學生帳號。</p>

    <div class="space-y-4">
      
      <div>
        <label class="block text-sm font-bold text-[#a0a0b8] mb-1">玩家名稱</label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">👤</span>
          <input 
            v-model="name" 
            type="text" 
            placeholder="例如：王小明" 
            class="w-full bg-[#0a0e27] border border-[#333366] rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#00d4aa] transition-all"
          >
        </div>
      </div>

      <div>
        <label class="block text-sm font-bold text-[#a0a0b8] mb-1">電子信箱</label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">📧</span>
          <input 
            v-model="email" 
            type="email" 
            placeholder="test1@edu.com" 
            class="w-full bg-[#0a0e27] border border-[#333366] rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#00d4aa] transition-all"
          >
        </div>
      </div>

      <div>
        <label class="block text-sm font-bold text-[#a0a0b8] mb-1">密碼 (至少 6 碼)</label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">🔒</span>
          <input 
            v-model="password" 
            type="password" 
            placeholder="••••••••" 
            class="w-full bg-[#0a0e27] border border-[#333366] rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#00d4aa] transition-all"
          >
        </div>
      </div>

      <div v-if="message" class="p-3 rounded-lg text-sm font-bold animate-pulse" :class="isError ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'">
        {{ message }}
      </div>

      <button 
        @click="handleQuickRegister" 
        :disabled="isLoading || !name || !email || !password"
        class="w-full mt-6 px-4 py-3 bg-[#00d4aa] hover:bg-[#00b38f] text-[#0a0e27] font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(0,212,170,0.3)]"
      >
        <span v-if="isLoading">⏳ 建立帳號中...</span>
        <span v-else>立即建立帳號</span>
      </button>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { supabase } from '../src/supabase.js'; 

const name = ref('');
const email = ref('');
const password = ref('');
const isLoading = ref(false);
const message = ref('');
const isError = ref(false);

const handleQuickRegister = async () => {
    console.log('準備註冊，檢查 Supabase 物件:', supabase);
  isLoading.value = true;
  message.value = '';
  isError.value = false;

  try {
    // 1. 呼叫 Supabase 註冊 API
    // 這裡我們把 username 包在 options.data 裡面傳過去，觸發器有機會直接抓到它
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
          username: name.value
        }
      }
    });

    if (authError) throw authError;

    // 2. 為了保險起見，強制去 Profiles 表格更新這個人的名字跟身份！
    // 這樣可以避免資料庫 Trigger 沒有把名字寫進去，或是 role 空白的問題
    if (authData?.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          username: name.value,
          role: 'student' // 強制設定為學生
        })
        .eq('id', authData.user.id);
        
      if (profileError) {
        console.warn('⚠️ 更新 Profile 時發生錯誤 (但不影響登入):', profileError.message);
      }
    }

    // 3. 成功處理
    message.value = '✅ 帳號建立成功！現在可以直接去登入了。';
    
    // 清空表單方便建立下一個
    name.value = '';
    email.value = '';
    password.value = '';

  } catch (error) {
    isError.value = true;
    message.value = '❌ 註冊失敗: ' + error.message;
  } finally {
    isLoading.value = false;
  }
};
</script>