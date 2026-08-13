<template>
  <main class="min-h-screen w-full flex items-center justify-center px-6 text-[#f0f0f0]" style="background: linear-gradient(135deg, #0a0e27 0%, #1a1a3e 50%, #0f1428 100%);">
    <section class="w-full max-w-md rounded-2xl border border-[#333366] p-8 shadow-2xl" style="background:linear-gradient(135deg, rgba(30,30,46,0.92), rgba(42,42,78,0.65));">
      <button type="button" class="mb-6 text-sm text-[#a0a0b8] transition-colors hover:text-[#00d4aa]" @click="router.push('/login')">← 返回登入</button>

      <div v-if="step === 'email'">
        <p class="mb-2 text-3xl">🔐</p>
        <h1 class="text-2xl font-bold">重設密碼</h1>
        <p class="mt-3 text-sm leading-6 text-[#a0a0b8]">輸入註冊信箱後，我們會寄送一組 8 位數驗證碼。</p>
        <form class="mt-6" @submit.prevent="sendRecoveryCode">
          <label class="mb-1.5 block text-xs text-[#a0a0b8]" for="recovery-email">電子信箱</label>
          <input id="recovery-email" v-model.trim="email" type="email" autocomplete="email" required class="auth-input" placeholder="name@example.com" :aria-invalid="Boolean(errorMessage)">
          <p v-if="errorMessage" class="mt-2 text-sm text-[#ff8080]" role="alert">{{ errorMessage }}</p>
          <button type="submit" class="auth-button mt-5" :disabled="isLoading">{{ isLoading ? '寄送中…' : '寄送驗證碼' }}</button>
        </form>
      </div>

      <div v-else-if="step === 'code'">
        <p class="mb-2 text-3xl">✉️</p>
        <h1 class="text-2xl font-bold">輸入驗證碼</h1>
        <p class="mt-3 text-sm leading-6 text-[#a0a0b8]">驗證碼已寄至 <span class="text-[#f0f0f0]">{{ email }}</span>，請在 5 分鐘內輸入。</p>
        <p class="mt-3 text-sm font-semibold" :class="isExpired ? 'text-[#ff8080]' : 'text-[#00d4aa]'">
          {{ isExpired ? '驗證碼已失效，請重新寄送。' : `剩餘時間 ${formattedTime}` }}
        </p>
        <form class="mt-6" @submit.prevent="verifyRecoveryCode">
          <label class="mb-1.5 block text-xs text-[#a0a0b8]" for="recovery-code">8 位數驗證碼</label>
          <input id="recovery-code" v-model.trim="code" type="text" inputmode="numeric" autocomplete="one-time-code" required maxlength="8" pattern="[0-9]{8}" class="auth-input tracking-[0.35em] text-center text-lg" placeholder="00000000" :disabled="isExpired">
          <p v-if="errorMessage" class="mt-2 text-sm text-[#ff8080]" role="alert">{{ errorMessage }}</p>
          <button type="submit" class="auth-button mt-5" :disabled="isLoading || isExpired">{{ isLoading ? '驗證中…' : '驗證並繼續' }}</button>
        </form>
        <button type="button" class="mt-5 w-full text-center text-sm text-[#a0a0b8] transition-colors hover:text-[#00d4aa] disabled:cursor-not-allowed disabled:opacity-50" :disabled="resendSeconds > 0 || isLoading" @click="resendCode">
          {{ resendSeconds > 0 ? `重新發送（${resendSeconds} 秒）` : '重新發送驗證碼' }}
        </button>
        <button type="button" class="mt-3 w-full text-center text-xs text-[#a0a0b8] hover:text-white" :disabled="isLoading" @click="startOver">使用其他電子信箱</button>
      </div>

      <div v-else-if="step === 'password'">
        <p class="mb-2 text-3xl">✨</p>
        <h1 class="text-2xl font-bold">設定新密碼</h1>
        <p class="mt-3 text-sm leading-6 text-[#a0a0b8]">請使用一組未用於其他網站的新密碼。完成後需以新密碼重新登入。</p>
        <form class="mt-6" @submit.prevent="updatePassword">
          <label class="mb-1.5 block text-xs text-[#a0a0b8]" for="new-password">新密碼</label>
          <input id="new-password" v-model="newPassword" type="password" autocomplete="new-password" required minlength="12" class="auth-input" placeholder="至少 12 個字元">
          <label class="mb-1.5 mt-4 block text-xs text-[#a0a0b8]" for="confirm-password">確認新密碼</label>
          <input id="confirm-password" v-model="confirmPassword" type="password" autocomplete="new-password" required minlength="12" class="auth-input" placeholder="再次輸入新密碼">
          <p v-if="errorMessage" class="mt-2 text-sm text-[#ff8080]" role="alert">{{ errorMessage }}</p>
          <button type="submit" class="auth-button mt-5" :disabled="isLoading">{{ isLoading ? '更新中…' : '確定更改密碼' }}</button>
        </form>
      </div>

      <div v-else class="text-center">
        <p class="mb-3 text-4xl">✅</p>
        <h1 class="text-2xl font-bold">密碼已更新</h1>
        <p class="mt-3 text-sm leading-6 text-[#a0a0b8]">請使用新密碼登入 Code Quest。</p>
        <button type="button" class="auth-button mt-6" @click="router.push('/login')">前往登入</button>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../../supabase.js';

const CODE_VALIDITY_SECONDS = 5 * 60;
const RESEND_COOLDOWN_SECONDS = 60;

const router = useRouter();
const step = ref('email');
const email = ref('');
const code = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const errorMessage = ref('');
const isLoading = ref(false);
const expiresAt = ref(0);
const now = ref(Date.now());
const resendAvailableAt = ref(0);
let timerId;

const secondsRemaining = computed(() => Math.max(0, Math.ceil((expiresAt.value - now.value) / 1000)));
const resendSeconds = computed(() => Math.max(0, Math.ceil((resendAvailableAt.value - now.value) / 1000)));
const isExpired = computed(() => secondsRemaining.value === 0);
const formattedTime = computed(() => `${String(Math.floor(secondsRemaining.value / 60)).padStart(2, '0')}:${String(secondsRemaining.value % 60).padStart(2, '0')}`);

const clearError = () => { errorMessage.value = ''; };
const startTimer = () => {
  clearInterval(timerId);
  timerId = setInterval(() => { now.value = Date.now(); }, 1000);
};

const sendRecoveryCode = async () => {
  clearError();
  const normalizedEmail = email.value.trim().toLowerCase();
  if (!normalizedEmail) {
    errorMessage.value = '請輸入電子信箱。';
    return;
  }

  isLoading.value = true;
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail);
    if (error) throw error;
    email.value = normalizedEmail;
    code.value = '';
    expiresAt.value = Date.now() + CODE_VALIDITY_SECONDS * 1000;
    resendAvailableAt.value = Date.now() + RESEND_COOLDOWN_SECONDS * 1000;
    now.value = Date.now();
    startTimer();
    step.value = 'code';
  } catch (error) {
    errorMessage.value = '目前無法寄送驗證碼，請稍後再試。';
    console.error('Password recovery code request failed:', error);
  } finally {
    isLoading.value = false;
  }
};

const resendCode = async () => {
  if (resendSeconds.value > 0) return;
  await sendRecoveryCode();
};

const verifyRecoveryCode = async () => {
  clearError();
  if (isExpired.value) {
    errorMessage.value = '驗證碼已失效，請重新發送。';
    return;
  }
  if (!/^\d{8}$/.test(code.value)) {
    errorMessage.value = '請輸入 8 位數驗證碼。';
    return;
  }

  isLoading.value = true;
  try {
    const { error } = await supabase.auth.verifyOtp({
      email: email.value,
      token: code.value,
      type: 'recovery',
    });
    if (error) throw error;
    clearInterval(timerId);
    code.value = '';
    step.value = 'password';
  } catch (error) {
    errorMessage.value = '驗證碼不正確或已失效，請重新確認或發送新驗證碼。';
    console.error('Password recovery code verification failed:', error);
  } finally {
    isLoading.value = false;
  }
};

const updatePassword = async () => {
  clearError();
  if (newPassword.value.length < 12) {
    errorMessage.value = '新密碼至少需要 12 個字元。';
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = '兩次輸入的密碼不一致。';
    return;
  }

  isLoading.value = true;
  try {
    const { error } = await supabase.auth.updateUser({ password: newPassword.value });
    if (error) throw error;
    newPassword.value = '';
    confirmPassword.value = '';
    await supabase.auth.signOut();
    step.value = 'success';
  } catch (error) {
    errorMessage.value = '密碼更新失敗，請重新開始密碼重設流程。';
    console.error('Password update failed:', error);
  } finally {
    isLoading.value = false;
  }
};

const startOver = () => {
  clearError();
  clearInterval(timerId);
  code.value = '';
  expiresAt.value = 0;
  resendAvailableAt.value = 0;
  step.value = 'email';
};

onBeforeUnmount(() => clearInterval(timerId));
</script>

<style scoped>
.auth-input { width: 100%; border: 1px solid #333355; border-radius: 8px; outline: none; background: rgba(30, 30, 46, 0.7); padding: 12px 16px; color: #f0f0f0; font-size: 14px; }
.auth-input:focus { border-color: #00d4aa; box-shadow: 0 0 12px rgba(0, 212, 170, 0.25); }
.auth-button { width: 100%; border: 0; border-radius: 8px; background: linear-gradient(135deg, #00d4aa, #00a88a); padding: 12px 16px; color: #0a0e27; font-weight: 700; cursor: pointer; transition: transform 0.2s, opacity 0.2s; }
.auth-button:hover:not(:disabled) { transform: translateY(-1px); }
.auth-button:disabled { cursor: wait; opacity: 0.6; }
</style>
