<template>
  <main class="min-h-screen w-full flex items-center justify-center px-6 text-[#f0f0f0]" style="background: linear-gradient(135deg, #0a0e27 0%, #1a1a3e 50%, #0f1428 100%);">
    <section class="w-full max-w-md rounded-2xl border border-[#333366] p-8 shadow-2xl" style="background:linear-gradient(135deg, rgba(30,30,46,0.92), rgba(42,42,78,0.65));">
      <button type="button" class="mb-6 text-sm text-[#a0a0b8] transition-colors hover:text-[#00d4aa]" @click="router.push('/login')">← 返回登入</button>

      <div v-if="view === 'request'">
        <p class="mb-2 text-3xl">🔐</p>
        <h1 class="text-2xl font-bold">重設密碼</h1>
        <p class="mt-3 text-sm leading-6 text-[#a0a0b8]">輸入註冊信箱後，我們會寄送一次性的安全重設連結。</p>
        <form class="mt-6" @submit.prevent="sendRecoveryEmail">
          <label class="mb-1.5 block text-xs text-[#a0a0b8]" for="recovery-email">電子信箱</label>
          <input id="recovery-email" v-model.trim="email" type="email" autocomplete="email" required class="auth-input" placeholder="name@example.com" :aria-invalid="Boolean(errorMessage)">
          <p v-if="errorMessage" class="mt-2 text-sm text-[#ff8080]" role="alert">{{ errorMessage }}</p>
          <p v-if="successMessage" class="mt-2 text-sm text-[#00d4aa]" role="status">{{ successMessage }}</p>
          <button type="submit" class="auth-button mt-5" :disabled="isLoading">{{ isLoading ? '寄送中…' : '寄送重設連結' }}</button>
        </form>
      </div>

      <div v-else-if="view === 'recover'">
        <p class="mb-2 text-3xl">✨</p>
        <h1 class="text-2xl font-bold">設定新密碼</h1>
        <p class="mt-3 text-sm leading-6 text-[#a0a0b8]">請設定一組未用於其他網站的新密碼。完成後會安全登出，請使用新密碼重新登入。</p>
        <form class="mt-6" @submit.prevent="updatePassword">
          <label class="mb-1.5 block text-xs text-[#a0a0b8]" for="new-password">新密碼</label>
          <input id="new-password" v-model="newPassword" type="password" autocomplete="new-password" required minlength="12" class="auth-input" placeholder="至少 12 個字元">
          <label class="mb-1.5 mt-4 block text-xs text-[#a0a0b8]" for="confirm-password">確認新密碼</label>
          <input id="confirm-password" v-model="confirmPassword" type="password" autocomplete="new-password" required minlength="12" class="auth-input" placeholder="再次輸入新密碼">
          <p v-if="errorMessage" class="mt-2 text-sm text-[#ff8080]" role="alert">{{ errorMessage }}</p>
          <button type="submit" class="auth-button mt-5" :disabled="isLoading">{{ isLoading ? '更新中…' : '更新密碼' }}</button>
        </form>
      </div>

      <div v-else-if="view === 'success'" class="text-center">
        <p class="mb-3 text-4xl">✅</p>
        <h1 class="text-2xl font-bold">密碼已更新</h1>
        <p class="mt-3 text-sm leading-6 text-[#a0a0b8]">請使用新密碼登入 Code Quest。</p>
        <button type="button" class="auth-button mt-6" @click="router.push('/login')">前往登入</button>
      </div>

      <div v-else class="text-center">
        <p class="mb-3 text-4xl">⚠️</p>
        <h1 class="text-2xl font-bold">連結無效或已過期</h1>
        <p class="mt-3 text-sm leading-6 text-[#a0a0b8]">請重新寄送密碼重設連結；每個連結僅能使用一次。</p>
        <button type="button" class="auth-button mt-6" @click="view = 'request'">重新寄送</button>
      </div>
    </section>
  </main>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../../supabase.js';

const router = useRouter();
const view = ref('request');
const email = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const isLoading = ref(false);
let authSubscription;

const clearMessages = () => {
  errorMessage.value = '';
  successMessage.value = '';
};

const sendRecoveryEmail = async () => {
  clearMessages();
  if (!email.value) {
    errorMessage.value = '請輸入電子信箱。';
    return;
  }
  isLoading.value = true;
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    successMessage.value = '若此信箱有帳號，重設連結已寄出。請查看收件匣與垃圾郵件。';
  } catch (error) {
    errorMessage.value = '目前無法寄送重設信，請稍後再試。';
    console.error('Password recovery request failed:', error);
  } finally {
    isLoading.value = false;
  }
};

const updatePassword = async () => {
  clearMessages();
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
    view.value = 'success';
  } catch (error) {
    errorMessage.value = '密碼更新失敗，連結可能已過期。請重新寄送重設信。';
    console.error('Password update failed:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  const { data } = supabase.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') {
      clearMessages();
      view.value = 'recover';
    }
  });
  authSubscription = data.subscription;
});

onBeforeUnmount(() => authSubscription?.unsubscribe());
</script>

<style scoped>
.auth-input { width: 100%; border: 1px solid #333355; border-radius: 8px; outline: none; background: rgba(30, 30, 46, 0.7); padding: 12px 16px; color: #f0f0f0; font-size: 14px; }
.auth-input:focus { border-color: #00d4aa; box-shadow: 0 0 12px rgba(0, 212, 170, 0.25); }
.auth-button { width: 100%; border: 0; border-radius: 8px; background: linear-gradient(135deg, #00d4aa, #00a88a); padding: 12px 16px; color: #0a0e27; font-weight: 700; cursor: pointer; transition: transform 0.2s, opacity 0.2s; }
.auth-button:hover:not(:disabled) { transform: translateY(-1px); }
.auth-button:disabled { cursor: wait; opacity: 0.6; }
</style>
