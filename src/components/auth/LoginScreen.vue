<template>
  <div class="h-full w-full flex items-center justify-center relative overflow-hidden" style="background: linear-gradient(135deg, #0a0e27 0%, #1a1a3e 50%, #0f1428 100%);">

    <div class="absolute inset-0 pointer-events-none">
      <div class="particle float-1" style="top:10%;left:15%;background:#ffbb33;animation-delay:0s;"></div>
      <div class="particle float-2" style="top:20%;left:75%;background:#00d4aa;animation-delay:0.8s;"></div>
      <div class="particle float-3" style="top:60%;left:85%;background:#ff6b6b;animation-delay:1.5s;"></div>
      <div class="particle float-1" style="top:80%;left:25%;background:#a78bfa;animation-delay:0.3s;"></div>
      <div class="particle float-2" style="top:45%;left:50%;background:#ffbb33;animation-delay:1.2s;"></div>
    </div>

    <div class="w-full max-w-md px-6 relative z-10">

      <div class="mb-6 slide-up flex justify-start">
        <button
          @click="$emit('back-to-home')"
          class="w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 hover:bg-[#ffbb3333] bg-[#ffbb331a] border border-[#ffbb3344] text-[#ffbb33]"
          title="返回首頁"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m12 19-7-7 7-7"/>
            <path d="M19 12H5"/>
          </svg>
        </button>
      </div>

      <div class="text-center mb-8 slide-up slide-up-d1">
        <div class="text-5xl mb-4">⚡</div>
        <h1 class="text-3xl font-bold mb-2 text-[#f0f0f0] font-['Fredoka']">Code Quest</h1>
        <p class="text-[#a0a0b8] text-sm">解鎖程式超能力</p>
      </div>

      <div v-if="isLoginMode" class="slide-up slide-up-d2">
        <form @submit.prevent="handleLogin" class="rounded-2xl p-8 border border-[#333366] backdrop-blur-md shadow-2xl" style="background:linear-gradient(135deg, rgba(30,30,46,0.8), rgba(42,42,78,0.4));">
          <h2 class="text-xl font-bold mb-6 text-[#f0f0f0] font-['Fredoka']">登入帳號</h2>

          <div class="space-y-4 mb-6">
            <div>
              <label class="block text-[#a0a0b8] text-xs mb-1.5">信箱</label>
              <input
                v-model="loginEmail"
                type="email"
                class="login-input"
                placeholder="輸入註冊信箱"
                autocomplete="email"
              >
            </div>
            <div>
              <label class="block text-[#a0a0b8] text-xs mb-1.5">密碼</label>
              <div class="relative">
                <input
                  v-model="loginPassword"
                  :type="showLoginPassword ? 'text' : 'password'"
                  class="login-input pr-10"
                  placeholder="輸入密碼"
                  autocomplete="current-password"
                >
                <button
                  type="button"
                  @click="showLoginPassword = !showLoginPassword"
                  class="eye-toggle"
                  tabindex="-1"
                >
                  <svg v-if="showLoginPassword" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <transition name="fade-msg">
            <div v-if="errorMessage" class="error-message mb-4">{{ errorMessage }}</div>
          </transition>

          <button type="submit" class="login-btn login-btn-primary mb-3" :disabled="isLoading">
            <span v-if="isLoading" class="spinner"></span>
            <span v-else>⚡ 進入遊戲</span>
          </button>
          
          <button type="button" @click="toggleMode" class="login-btn login-btn-secondary" :disabled="isLoading">
            還沒有帳號？註冊新帳號
          </button>
        </form> 
      </div>

      <div v-else class="slide-up slide-up-d2">
        <div class="rounded-2xl p-8 border border-[#333366] backdrop-blur-md shadow-2xl" style="background:linear-gradient(135deg, rgba(30,30,46,0.8), rgba(42,42,78,0.4));">
          
          <h2 class="text-xl font-bold mb-6 text-[#f0f0f0] font-['Fredoka'] text-center">
            {{ isWaitingForOtp ? '✉️ 驗證信箱' : '建立新帳號' }}
          </h2>

          <transition name="fade-msg">
            <div v-if="errorMessage" class="error-message mb-4">{{ errorMessage }}</div>
          </transition>
          <transition name="fade-msg">
            <div v-if="successMessage" class="success-message mb-4">{{ successMessage }}</div>
          </transition>

          <div v-if="!isWaitingForOtp" class="space-y-4 mb-6">
            <div>
              <label class="block text-[#a0a0b8] text-xs mb-1.5">玩家名稱</label>
              <input v-model="registerForm.username" type="text" class="login-input" placeholder="輸入玩家名稱（至少3字）" autocomplete="username">
            </div>
            <div>
              <label class="block text-[#a0a0b8] text-xs mb-1.5">信箱</label>
              <input v-model="registerForm.email" type="email" class="login-input" placeholder="輸入信箱" autocomplete="email">
            </div>

            <div>
              <label class="block text-[#a0a0b8] text-xs mb-1.5">密碼</label>
              <div class="relative">
                <input
                  v-model="registerForm.password"
                  :type="showRegisterPassword ? 'text' : 'password'"
                  class="login-input pr-10"
                  placeholder="輸入密碼（至少6位）"
                  autocomplete="new-password"
                >
                <button type="button" @click="showRegisterPassword = !showRegisterPassword" class="eye-toggle" tabindex="-1">
                  <svg v-if="showRegisterPassword" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>

              <div v-if="registerForm.password.length > 0" class="mt-2">
                <div class="h-1.5 w-full bg-[#1e1e2e] rounded-full overflow-hidden">
                  <div class="h-full transition-all duration-300 ease-out"
                       :class="passwordStrength.colorClass"
                       :style="{ width: passwordStrength.percent + '%' }">
                  </div>
                </div>
                <p class="text-[11px] mt-1 font-semibold" :class="passwordStrength.textColor">
                  {{ passwordStrength.label }}
                </p>
              </div>
            </div>

            <div>
              <label class="block text-[#a0a0b8] text-xs mb-1.5">確認密碼</label>
              <div class="relative">
                <input
                  v-model="registerForm.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  class="login-input pr-10"
                  :class="{ 'error-border': registerForm.confirmPassword.length > 0 && !isPasswordMatch }"
                  placeholder="再次輸入密碼"
                  autocomplete="new-password"
                >
                <button type="button" @click="showConfirmPassword = !showConfirmPassword" class="eye-toggle" tabindex="-1">
                  <svg v-if="showConfirmPassword" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>
              <p v-if="registerForm.confirmPassword.length > 0 && !isPasswordMatch" class="text-[11px] mt-1 text-[#ff6b6b] font-semibold flex items-center gap-1">
                ❌ 兩次輸入的密碼不一致
              </p>
              <p v-else-if="registerForm.confirmPassword.length > 0 && isPasswordMatch" class="text-[11px] mt-1 text-[#00d4aa] font-semibold flex items-center gap-1">
                ✅ 密碼一致
              </p>
            </div>
            
            <button
              @click="handleRegister"
              class="login-btn login-btn-primary mt-6"
              :disabled="!isFormValid || isLoading"
              :class="{ 'opacity-50 cursor-not-allowed': !isFormValid || isLoading }"
            >
              <span v-if="isLoading" class="spinner"></span>
              <span v-else>📧 發送驗證碼</span>
            </button>
            <button @click="toggleMode" class="login-btn login-btn-secondary mt-3" :disabled="isLoading">
              已有帳號？返回登入
            </button>
          </div>

          <div v-else class="space-y-4 mb-6 text-center animate-fade-in">
            <p class="text-[#a0a0b8] text-sm leading-relaxed mb-4">
              已發送 8 位數驗證碼至：<br>
              <span class="text-white font-bold">{{ registerForm.email }}</span>
            </p>

            <input 
              v-model="otpCode" 
              type="text" 
              placeholder="00000000" 
              maxlength="8"
              class="login-input text-center text-2xl tracking-[0.5em] font-bold py-4" 
              @keyup.enter="handleVerifyOtp"
            />

            <button
              @click="handleVerifyOtp"
              class="login-btn login-btn-primary mt-6"
              :disabled="isLoading || otpCode.length !== 8"
              :class="{ 'opacity-50 cursor-not-allowed': isLoading || otpCode.length !== 8 }"
            >
              <span v-if="isLoading" class="spinner"></span>
              <span v-else>✅ 確認驗證並註冊</span>
            </button>

            <button @click="isWaitingForOtp = false" class="text-[#a0a0b8] hover:text-white text-sm mt-4 transition-colors">
              ← 返回修改信箱
            </button>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { supabase } from '../../supabase.js';

const emit = defineEmits(['login-success', 'back-to-home']);

// ── UI 狀態 ─────────────────────────────────────────────
const isLoginMode = ref(true);
const isLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// OTP 驗證狀態 🌟
const isWaitingForOtp = ref(false);
const otpCode = ref('');

// 密碼顯示/隱藏
const showLoginPassword = ref(false);
const showRegisterPassword = ref(false);
const showConfirmPassword = ref(false);

// ── 表單資料 ────────────────────────────────────────────
const loginEmail = ref('');
const loginPassword = ref('');

const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
});

// ── 計算屬性 ──────────────────────────────────────────────
const passwordStrength = computed(() => {
  const pwd = registerForm.password;
  if (!pwd) return { percent: 0, colorClass: '', textColor: '', label: '' };

  let score = 0;
  if (pwd.length >= 6)           score++;
  if (/[A-Z]/.test(pwd))         score++;
  if (/[0-9]/.test(pwd))         score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  if (pwd.length < 6 || score <= 1) {
    return { percent: 33, colorClass: 'bg-[#ff6b6b]', textColor: 'text-[#ff6b6b]', label: '🔴 弱：建議增加長度或混合英數字' };
  } else if (score <= 3) {
    return { percent: 66, colorClass: 'bg-[#ffbb33]', textColor: 'text-[#ffbb33]', label: '🟠 中等：不錯的密碼' };
  } else {
    return { percent: 100, colorClass: 'bg-[#00d4aa]', textColor: 'text-[#00d4aa]', label: '🟢 強：非常安全！' };
  }
});

const isPasswordMatch = computed(() =>
  registerForm.password !== '' && registerForm.password === registerForm.confirmPassword
);

// 表單驗證移除了 Captcha 判斷 🌟
const isFormValid = computed(() =>
  registerForm.username.length >= 3 &&
  registerForm.email.includes('@') &&
  registerForm.password.length >= 6 &&
  isPasswordMatch.value
);

// ── 工具函式 ──────────────────────────────────────────────
let errorTimer = null;
const showError = (msg) => {
  errorMessage.value = msg;
  successMessage.value = '';
  clearTimeout(errorTimer);
  errorTimer = setTimeout(() => { errorMessage.value = ''; }, 4000);
};

const showSuccess = (msg) => {
  successMessage.value = msg;
  errorMessage.value = '';
}

const resetLoginForm = () => {
  loginEmail.value = '';
  loginPassword.value = '';
  showLoginPassword.value = false;
};

const resetRegisterForm = () => {
  Object.assign(registerForm, { username: '', email: '', password: '', confirmPassword: '' });
  otpCode.value = '';
  isWaitingForOtp.value = false;
  showRegisterPassword.value = false;
  showConfirmPassword.value = false;
};

const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value;
  errorMessage.value = '';
  successMessage.value = '';
  resetLoginForm();
  resetRegisterForm();
};

// ── 登入 ──────────────────────────────────────────────────
const handleLogin = async () => {
  if (isLoading.value) return;
  errorMessage.value = '';

  if (!loginEmail.value || !loginPassword.value) {
    showError('請輸入信箱和密碼');
    return;
  }

  isLoading.value = true;
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail.value,
      password: loginPassword.value,
    });

    if (error) throw error;

    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', data.user.id)
      .single();

    emit('login-success', profile?.username || '神秘勇者');
  } catch (err) {
    if (err.message.includes('Email not confirmed')) {
      showError('信箱尚未驗證！請去信箱收取驗證信。');
    } else {
      showError('登入失敗：帳號或密碼錯誤。');
    }
  } finally {
    isLoading.value = false;
  }
};

// ── 發送註冊驗證碼 (階段 1) 🌟 ─────────────────────────
const handleRegister = async () => {
  if (isLoading.value || !isFormValid.value) return;
  errorMessage.value = '';
  successMessage.value = '';

  isLoading.value = true;
  try {
    const { data, error } = await supabase.auth.signUp({
      email: registerForm.email,
      password: registerForm.password,
      options: { data: { username: registerForm.username } }
    });

    if (error) throw error;

    // 成功發送驗證信後，切換 UI 狀態
    isWaitingForOtp.value = true;
    showSuccess('驗證碼已發送！請前往信箱查看。');

  } catch (err) {
    if (err.message.includes('already registered')) {
      showError('此信箱已經註冊過囉！請直接登入。');
    } else {
      showError('發送驗證碼失敗，請稍後再試。');
    }
  } finally {
    isLoading.value = false;
  }
};

// ── 驗證 OTP 並建立資料 (階段 2) 🌟 ────────────────────
const handleVerifyOtp = async () => {
  if (isLoading.value || otpCode.value.length !== 8) return;
  errorMessage.value = '';
  successMessage.value = '';

  isLoading.value = true;
  try {
    // 1. 呼叫 Supabase 驗證 OTP API
    const { data, error } = await supabase.auth.verifyOtp({
      email: registerForm.email,
      token: otpCode.value,
      type: 'signup'
    });

    if (error) throw error;

    // 2. 驗證成功後，系統會自動登入，此時我們建立玩家 Profile 紀錄
    if (data.user) {
      // 先檢查 profile 是否已經存在 (預防重複寫入)
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single();

      if (!existingProfile) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{ 
            id: data.user.id, 
            username: registerForm.username, 
            level: 1, 
            xp: 0 
          }]);
          
        if (profileError) throw profileError;
      }
    }

    showSuccess('✓ 帳號建立成功！正在為您進入遊戲...');
    setTimeout(() => emit('login-success', registerForm.username), 1500);

  } catch (err) {
    if (err.message.includes('Token has expired or is invalid')) {
      showError('驗證碼錯誤或已過期，請重新確認！');
    } else {
      showError(`驗證失敗: ${err.message}`);
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* ── 輸入框 ──────────────────────────────────────────── */
.login-input {
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #333355;
  background: rgba(30,30,46,0.6);
  color: #f0f0f0;
  font-size: 14px;
  transition: all 0.2s;
  outline: none;
}
.login-input:focus {
  border-color: #ffbb33;
  box-shadow: 0 0 12px rgba(255,187,51,0.3);
  background: rgba(30,30,46,0.8);
}
.login-input::placeholder { color: #a0a0b8; }
.login-input.error-border {
  border-color: #ff6b6b !important;
  box-shadow: 0 0 8px rgba(255,107,107,0.3) !important;
}
.login-input.error-border:focus {
  background: rgba(255,107,107,0.05);
}

/* ── 眼睛按鈕 ────────────────────────────────────────── */
.eye-toggle {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  cursor: pointer;
  color: #a0a0b8;
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.2s;
}
.eye-toggle:hover { color: #ffbb33; }

/* ── 按鈕 ─────────────────────────────────────────────── */
.login-btn {
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.login-btn-primary {
  background: linear-gradient(135deg, #ffbb33, #ff8800);
  color: #0f0e17;
}
.login-btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255,187,51,0.4);
}
.login-btn-primary:active:not(:disabled) { transform: translateY(0); }
.login-btn-secondary {
  background: transparent;
  color: #00d4aa;
  border: 1px solid #00d4aa;
}
.login-btn-secondary:hover:not(:disabled) { background: rgba(0,212,170,0.1); }

/* ── Loading Spinner ─────────────────────────────────── */
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(15,14,23,0.3);
  border-top-color: #0f0e17;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  display: inline-block;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── 訊息框 ──────────────────────────────────────────── */
.error-message {
  background: rgba(255,107,107,0.1);
  border: 1px solid #ff6b6b;
  color: #ff6b6b;
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 12px;
}
.success-message {
  background: rgba(0,212,170,0.1);
  border: 1px solid #00d4aa;
  color: #00d4aa;
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 12px;
}

/* ── Transition ──────────────────────────────────────── */
.fade-msg-enter-active,
.fade-msg-leave-active { transition: opacity 0.3s, transform 0.3s; }
.fade-msg-enter-from,
.fade-msg-leave-to { opacity: 0; transform: translateY(-6px); }

/* ── 動畫 ────────────────────────────────────────────── */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-12px); }
}
@keyframes slide-up {
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes particle {
  0%   { transform: translateY(0) scale(1); opacity: 0.7; }
  100% { transform: translateY(-60px) scale(0); opacity: 0; }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.float-1 { animation: float 3s   ease-in-out infinite; }
.float-2 { animation: float 3.5s ease-in-out infinite 0.5s; }
.float-3 { animation: float 4s   ease-in-out infinite 1s; }

.slide-up    { animation: slide-up 0.6s ease-out both; }
.slide-up-d1 { animation-delay: 0.1s; }
.slide-up-d2 { animation-delay: 0.2s; }
.animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }

.particle {
  position: absolute;
  width: 6px; height: 6px;
  border-radius: 50%;
  animation: particle 2s ease-out infinite;
}
</style>