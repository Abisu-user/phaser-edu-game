<template>
  <div class="flex flex-col gap-8 animate-fade-in pb-10 relative">
    
    <div>
      <h2 class="text-3xl font-bold text-white font-['Fredoka'] flex items-center gap-3">
        <span class="text-4xl drop-shadow-[0_0_15px_rgba(0,212,170,0.5)]">👤</span> 個人檔案
      </h2>
      <p class="text-[#a0a0b8] mt-2">管理您的冒險身分與設定。</p>
    </div>

    <div class="flex flex-col lg:flex-row gap-8">
      
      <div class="w-full lg:w-1/3 flex flex-col gap-6">
        <div class="bg-[#16162a] border border-[#00d4aa]/30 rounded-3xl p-8 text-center relative overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
          <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-[#00d4aa] opacity-10 blur-[50px]"></div>
          
          <div class="relative w-28 h-28 mx-auto mb-4 group cursor-pointer" @click="triggerFileInput">
            <div class="absolute inset-0 rounded-full bg-gradient-to-tr from-[#00d4aa] to-[#00b894] p-1 shadow-[0_0_20px_rgba(0,212,170,0.4)] group-hover:scale-105 transition-transform duration-300">
              <div class="w-full h-full rounded-full bg-[#0a0e27] overflow-hidden relative border-2 border-white/10 flex items-center justify-center">
                
                <img v-if="playerAvatarUrl" :src="playerAvatarUrl" class="w-full h-full object-cover" alt="玩家頭像" />
                <span v-else class="text-5xl text-white font-bold">{{ playerName ? playerName.charAt(0).toUpperCase() : '?' }}</span>
                
                <div v-if="isUploading" class="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <span class="text-white text-xs font-bold animate-pulse">上傳中...</span>
                </div>

                <div v-else class="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span class="text-white text-xs font-bold">更換頭像</span>
                </div>
              </div>
            </div>
            
            <input 
              type="file" 
              ref="fileInput" 
              class="hidden" 
              accept="image/*" 
              @change="onFileSelected" 
            />
          </div>
          
          <h3 class="text-2xl font-bold text-white font-['Fredoka'] tracking-wide relative z-10">{{ playerName }}</h3>
          <p class="text-[#a0a0b8] text-sm mb-6 relative z-10">{{ playerEmail }}</p>

          <div class="bg-black/40 rounded-2xl p-4 border border-white/5 relative z-10 text-left">
            <div class="flex justify-between items-end mb-2">
              <span class="text-white font-bold font-['Fredoka'] text-lg">Lv. {{ currentLevel }}</span>
              <span class="text-[#ffbb33] font-bold text-sm">{{ currentXP }} / {{ xpPerLevel }}</span>
            </div>
            <div class="h-2.5 w-full bg-black/60 rounded-full overflow-hidden shadow-inner">
              <div class="h-full rounded-full transition-all duration-1000 ease-out" 
                   :style="{ width: Math.min((currentXP / xpPerLevel * 100), 100) + '%', background: 'linear-gradient(90deg, #ff8800, #ffbb33)' }">
              </div>
            </div>
          </div>

          <AvatarCropModal 
            :isOpen="isCropModalOpen"
            :imageSrc="tempImageSrc"
            @close="isCropModalOpen = false"
            @confirm="uploadAvatar"
          />

        </div>
      </div>

      <div class="w-full lg:w-2/3 flex flex-col gap-6">
        
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="bg-black/20 border border-white/5 rounded-2xl p-5 text-center">
            <div class="text-3xl mb-2 opacity-80">⚡</div>
            <p class="text-[#a0a0b8] text-xs font-bold mb-1">總經驗值</p>
            <p class="text-white text-xl font-['Fredoka']">{{ totalXP }}</p>
          </div>
          <div class="bg-black/20 border border-white/5 rounded-2xl p-5 text-center">
            <div class="text-3xl mb-2 opacity-80">🔥</div>
            <p class="text-[#a0a0b8] text-xs font-bold mb-1">通關數量</p>
            <p class="text-white text-xl font-['Fredoka']">{{ clearedLevelsCount }}</p>
          </div>
          <div class="bg-black/20 border border-white/5 rounded-2xl p-5 text-center">
            <div class="text-3xl mb-2 opacity-80">🎖️</div>
            <p class="text-[#a0a0b8] text-xs font-bold mb-1">獲得徽章</p>
            <p class="text-white text-xl font-['Fredoka']">{{ unlockedBadgesCount }}</p>
          </div>
          <div class="bg-black/20 border border-white/5 rounded-2xl p-5 text-center">
            <div class="text-3xl mb-2 opacity-80">📅</div>
            <p class="text-[#a0a0b8] text-xs font-bold mb-1">加入天數</p>
            <p class="text-white text-xl font-['Fredoka']">{{ daysJoined }}</p>
          </div>
        </div>

        <div class="bg-[#16162a] border border-white/5 rounded-3xl p-8 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
          <h3 class="text-xl font-bold text-white font-['Fredoka'] mb-6 flex items-center gap-2">⚙️ 帳號設定</h3>
          
          <div class="space-y-6">
            
            <div class="flex flex-col gap-4 pb-6 border-b border-white/5">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p class="text-white font-bold">使用者名稱</p>
                  <p class="text-sm text-[#a0a0b8]">目前名稱：<span class="text-white">{{ playerName }}</span></p>
                </div>
                <button 
                  @click="toggleNameEdit"
                  class="px-5 py-2 rounded-xl text-sm font-bold transition-colors"
                  :class="isEditingName ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-[#00d4aa] text-[#0a0e27] hover:bg-[#00b894]'"
                >
                  {{ isEditingName ? '取消' : '更改名稱' }}
                </button>
              </div>

              <div v-show="isEditingName" class="mt-2 flex flex-col gap-3">
                <input 
                  v-model="newName" 
                  type="text" 
                  placeholder="輸入新的使用者名稱" 
                  class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#a0a0b8] focus:outline-none focus:border-[#00d4aa] transition-colors"
                />
                <button 
                  @click="handleUpdateName" 
                  :disabled="isUpdatingProfile"
                  class="px-5 py-3 mt-1 rounded-xl text-sm font-bold text-[#0a0e27] bg-[#00d4aa] hover:bg-[#00b894] transition-colors disabled:opacity-50 self-end w-full sm:w-auto"
                >
                  {{ isUpdatingProfile ? '更新中...' : '確認修改名稱' }}
                </button>
              </div>
            </div>

            <div class="flex flex-col gap-4 pb-6 border-b border-white/5">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p class="text-white font-bold">登入密碼</p>
                  <p class="text-sm text-[#a0a0b8]">定期更新密碼以保護您的帳號安全。</p>
                </div>
                <button 
                  @click="togglePasswordEdit"
                  class="px-5 py-2 rounded-xl text-sm font-bold transition-colors"
                  :class="isEditingPassword ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-[#00d4aa] text-[#0a0e27] hover:bg-[#00b894]'"
                >
                  {{ isEditingPassword ? '取消' : '更改密碼' }}
                </button>
              </div>

              <div v-show="isEditingPassword" class="mt-2 flex flex-col gap-3">
                <input 
                  v-model="newPassword" 
                  type="password" 
                  placeholder="輸入新密碼 (至少 6 個字元)" 
                  class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#a0a0b8] focus:outline-none focus:border-[#00d4aa] transition-colors"
                />
                <input 
                  v-model="confirmPassword" 
                  type="password" 
                  placeholder="再次輸入新密碼" 
                  class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#a0a0b8] focus:outline-none focus:border-[#00d4aa] transition-colors"
                />
                <button 
                  @click="handleUpdatePassword" 
                  :disabled="isUpdatingAuth"
                  class="px-5 py-3 mt-1 rounded-xl text-sm font-bold text-white bg-[#ff6b6b] hover:bg-[#ff4c4c] transition-colors disabled:opacity-50 self-end w-full sm:w-auto"
                >
                  {{ isUpdatingAuth ? '更新中...' : '確認修改密碼' }}
                </button>
              </div>
            </div>

            <div class="flex flex-col gap-4">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p class="text-white font-bold">綁定 Email</p>
                  <p class="text-sm text-[#a0a0b8]">目前信箱：<span class="text-white">{{ playerEmail }}</span></p>
                </div>
                <button 
                  @click="toggleEmailEdit"
                  class="px-5 py-2 rounded-xl text-sm font-bold transition-colors"
                  :class="isEditingEmail ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-[#00d4aa] text-[#0a0e27] hover:bg-[#00b894]'"
                >
                  {{ isEditingEmail ? '取消' : '更改信箱' }}
                </button>
              </div>

              <div v-show="isEditingEmail" class="mt-2 flex flex-col gap-3">
                <input 
                  v-model="newEmail" 
                  type="email" 
                  placeholder="輸入新的 Email 地址" 
                  class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#a0a0b8] focus:outline-none focus:border-[#00d4aa] transition-colors"
                />
                <div class="flex items-start gap-2 mt-1">
                  <span class="text-xl">⚠️</span>
                  <p class="text-xs text-[#ffbb33] leading-relaxed">
                    注意：修改信箱後，系統會發送「確認信」到您的新信箱。請前往點擊連結，完成驗證後才會正式生效。
                  </p>
                </div>
                <button 
                  @click="handleUpdateEmail" 
                  :disabled="isUpdatingAuth"
                  class="px-5 py-3 mt-1 rounded-xl text-sm font-bold text-[#0a0e27] bg-[#ffbb33] hover:bg-[#ffa000] transition-colors disabled:opacity-50 self-end w-full sm:w-auto"
                >
                  {{ isUpdatingAuth ? '發送中...' : '發送確認信' }}
                </button>
              </div>
            </div>

            <div v-if="playerRole === 'student'" class="mt-8 p-6 bg-[#ffbb33]/10 border border-[#ffbb33]/30 rounded-2xl">
              <div class="flex items-start gap-4">
                <div class="text-4xl">🎓</div>
                <div>
                  <h3 class="text-[#ffbb33] text-lg font-bold mb-1">想成為教育者嗎？申請教師資格</h3>
                  <p class="text-sm text-[#a0a0b8] mb-4 leading-relaxed">
                    申請成為教師後，您可以建立班級、管理學生進度，並派發專屬的程式課程。
                    <span class="text-red-400 block mt-1">⚠️ 注意：送出申請後，您的帳號將進入「待審核」狀態，需等待管理員開通後才能再次登入。</span>
                  </p>
                  
                  <button 
                    @click="applyForTeacher" 
                    :disabled="isApplying"
                    class="px-6 py-2.5 bg-[#ffbb33] hover:bg-[#ffaa00] text-[#0a0e27] font-bold rounded-xl transition-all shadow-[0_4px_14px_rgba(255,187,51,0.3)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    <span v-if="isApplying" class="animate-pulse">送出申請中...</span>
                    <span v-else>立即申請成為教師 🚀</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>

    <ConfirmModal 
      :isOpen="modalState.isOpen"
      :title="modalState.title"
      :message="modalState.message"
      :icon="modalState.icon"
      :isDanger="modalState.isDanger"
      :confirmText="modalState.confirmText"
      :cancelText="modalState.cancelText"
      @confirm="closeAlert"
      @cancel="closeAlert"
    />

  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { supabase } from '../../../supabase.js';  
import AvatarCropModal from '../AvatarCropModal.vue';
import ConfirmModal from '../../common/ConfirmModal.vue'; 

const props = defineProps({
  playerId: String,
  playerName: String,
  playerEmail: String,
  playerRole: String,
  playerAvatarUrl: { type: String, default: '' },
  currentLevel: Number,
  currentXP: Number,
  xpPerLevel: Number,
  clearedLevelsCount: Number,
  badges: Array,
  joinDate: String,
});

// 加入 'update-name' 事件
const emit = defineEmits(['update-avatar', 'update-name']);

const isApplying = ref(false);

const applyForTeacher = async () => {
  // 1. 二次確認防呆
  if (!confirm('確定要申請成為教師嗎？\n送出後系統會自動為您登出，並等待管理員審核。')) {
    return;
  }

  isApplying.value = true;

  try {
    // 2. 更新 Supabase 資料表
    const { error } = await supabase
      .from('profiles')
      .update({ 
        role: 'teacher',     // 角色轉為教師
        status: 'pending'    // 狀態設為待審核
      })
      .eq('id', props.playerId); // 對準目前登入玩家的 ID

    if (error) throw error;

    alert('✅ 已成功送出申請！請等待管理員核准。');

    await supabase.auth.signOut();
    window.location.reload(); // 重整頁面，自動退回登入畫面

  } catch (error) {
    console.error('教師申請失敗:', error.message);
    alert('申請失敗，請確認網路連線或稍後再試！');
  } finally {
    isApplying.value = false;
  }
};

// --- Modal 狀態管理 🌟 ---
const modalState = ref({
  isOpen: false,
  title: '',
  message: '',
  icon: '⚠️',
  isDanger: false,
  confirmText: '確定',
});

const showAlert = (title, message, icon = '⚠️', isDanger = false, confirmText = '確定') => {
  modalState.value = {
    isOpen: true,
    title,
    message,
    icon,
    isDanger,
    confirmText,
  };
};

const closeAlert = () => {
  modalState.value.isOpen = false;
};

// --- 頭像上傳相關變數 ---
const fileInput = ref(null);
const isUploading = ref(false);
const isCropModalOpen = ref(false);
const tempImageSrc = ref('');

// --- 帳號設定相關變數 ---
const isUpdatingProfile = ref(false); // 專門給更新使用者資料用的 Loading 狀態
const isUpdatingAuth = ref(false);

const isEditingName = ref(false);
const newName = ref('');

const isEditingPassword = ref(false);
const newPassword = ref('');
const confirmPassword = ref('');

const isEditingEmail = ref(false);
const newEmail = ref('');

const daysJoined = computed(() => {
  if (!props.joinDate) return 1;
  const start = new Date(props.joinDate);
  const today = new Date();
  const diffTime = Math.abs(today - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays || 1;
});

const totalXP = computed(() => ((props.currentLevel - 1) * props.xpPerLevel) + props.currentXP);
const unlockedBadgesCount = computed(() => props.badges.filter(b => b.isUnlocked).length);

// --- 頭像處理邏輯 ---
const triggerFileInput = () => {
  if (!isUploading.value && fileInput.value) {
    fileInput.value.click();
  }
};

const onFileSelected = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    tempImageSrc.value = e.target.result;
    isCropModalOpen.value = true;
  };
  reader.readAsDataURL(file);

  if (fileInput.value) fileInput.value.value = '';
};

const uploadAvatar = async (croppedBlob) => {
  try {
    isUploading.value = true;
    
    if (croppedBlob.size > 2 * 1024 * 1024) {
      showAlert('檔案過大', '圖片太大了！請選擇小於 2MB 的圖片。', '🚫', true);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('未登入');

    const fileName = `${user.id}/${Date.now()}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, croppedBlob, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    const { data: updateResult, error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id)
      .select();

    if (updateError) throw updateError;

    const noCacheUrl = `${publicUrl}?t=${new Date().getTime()}`;
    emit('update-avatar', noCacheUrl);
    
  } catch (error) {
    console.error('上傳失敗:', error.message);
    showAlert('上傳失敗', '上傳頭像失敗，請稍後再試！', '❌', true);
  } finally {
    isUploading.value = false;
  }
};

// --- 帳號設定邏輯 ---

// 新增：切換編輯名稱狀態 (會自動收合其他設定)
const toggleNameEdit = () => {
  isEditingName.value = !isEditingName.value;
  if (!isEditingName.value) {
    newName.value = '';
  }
  isEditingPassword.value = false;
  isEditingEmail.value = false;
};

const togglePasswordEdit = () => {
  isEditingPassword.value = !isEditingPassword.value;
  if (!isEditingPassword.value) {
    newPassword.value = '';
    confirmPassword.value = '';
  }
  isEditingName.value = false;
  isEditingEmail.value = false;
};

const toggleEmailEdit = () => {
  isEditingEmail.value = !isEditingEmail.value;
  if (!isEditingEmail.value) {
    newEmail.value = '';
  }
  isEditingName.value = false;
  isEditingPassword.value = false;
};

// 新增：更新使用者名稱處理函數
const handleUpdateName = async () => {
  if (!newName.value.trim()) {
    showAlert('格式錯誤', '名稱不能為空！', '⚠️', true);
    return;
  }
  
  try {
    isUpdatingProfile.value = true;
    
    // 取得當前登入的 user ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('未登入');

    const { error } = await supabase
      .from('profiles')
      .update({ username: newName.value.trim() }) 
      .eq('id', user.id);

    if (error) throw error;

    showAlert('修改成功', '您的使用者名稱已成功更新！', '✅', false, '了解');
    
    // 通知父組件更新 playerName prop
    emit('update-name', newName.value.trim());
    toggleNameEdit(); 
  } catch (error) {
    console.error('修改名稱失敗:', error.message);
    showAlert('修改失敗', '更新使用者名稱時發生錯誤。', '❌', true);
  } finally {
    isUpdatingProfile.value = false;
  }
};

const handleUpdatePassword = async () => {
  if (newPassword.value.length < 6) {
    showAlert('格式錯誤', '密碼至少需要 6 個字元！', '⚠️', true);
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    showAlert('密碼不一致', '兩次輸入的密碼不一致！請重新確認。', '⚠️', true);
    return;
  }

  try {
    isUpdatingAuth.value = true;
    const { error } = await supabase.auth.updateUser({ password: newPassword.value });
    if (error) throw error;

    showAlert('修改成功', '密碼修改成功！下次請使用新密碼登入。', '✅', false, '了解');
    togglePasswordEdit(); 
  } catch (error) {
    console.error('修改密碼失敗:', error.message);
    showAlert('修改失敗', error.message, '❌', true);
  } finally {
    isUpdatingAuth.value = false;
  }
};

const handleUpdateEmail = async () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newEmail.value)) {
    showAlert('格式錯誤', '請輸入有效的 Email 格式！', '⚠️', true);
    return;
  }

  try {
    isUpdatingAuth.value = true;
    
    const { error } = await supabase.auth.updateUser(
      { email: newEmail.value },
      { emailRedirectTo: `${window.location.origin}/success.html` }
    );
    
    if (error) throw error;

    showAlert('確認信已發送', '請前往新信箱點選確認連結。點擊後系統將自動更新。', '📧', false, '了解');
    toggleEmailEdit(); 
  } catch (error) {
    console.error('修改 Email 失敗:', error.message);
    showAlert('發送失敗', error.message, '❌', true);
  } finally {
    isUpdatingAuth.value = false;
  }
};

</script>