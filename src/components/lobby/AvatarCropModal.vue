<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#0a0e27]/90 backdrop-blur-md animate-fade-in">
      <div class="bg-[#16162a] border border-[#00d4aa]/30 p-8 rounded-3xl max-w-lg w-full text-center shadow-[0_10px_50px_rgba(0,0,0,0.5)] animate-slide-up relative overflow-hidden">
        
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-[#00d4aa] opacity-10 blur-[50px]"></div>

        <h3 class="text-xl font-bold text-white font-['Fredoka'] mb-6 relative z-10 flex items-center justify-center gap-2">
          ✂️ 裁切您的守護頭像
        </h3>

        <div class="w-full aspect-square bg-black/80 rounded-2xl overflow-hidden mb-8 border border-white/10 relative z-10">
          <Cropper
            ref="cropperRef"
            class="w-full h-full"
            :src="imageSrc"
            :stencil-props="{ aspectRatio: 1 }"
            image-restriction="stencil"
          />
        </div>

        <div class="flex gap-4 relative z-10">
          <button @click="closeModal" class="flex-1 py-3.5 rounded-xl font-bold text-[#a0a0b8] bg-black/40 border border-white/10 hover:text-white hover:bg-white/5 transition-colors text-sm">
            取消
          </button>
          <button @click="cropAndUpload" class="flex-1 py-3.5 rounded-xl font-bold text-[#0a0e27] bg-gradient-to-r from-[#00d4aa] to-[#00b894] hover:shadow-[0_0_20px_rgba(0,212,170,0.4)] transition-all hover:-translate-y-1 text-sm flex items-center justify-center gap-2">
            確認裁切並上傳 🚀
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue';
import { Cropper } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css'; // 直接 import CSS，不用再等 CDN！

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  imageSrc: { type: String, required: true }
});

const emit = defineEmits(['close', 'confirm']);

// 取得 Cropper 元件的實例
const cropperRef = ref(null);

const closeModal = () => {
  emit('close');
};

const cropAndUpload = () => {
  if (!cropperRef.value) return;

  // 取得裁切結果的 Canvas
  const { canvas } = cropperRef.value.getResult();
  
  if (!canvas) {
    alert("圖片裁切失敗，請換一張圖片再試！");
    return;
  }

  // 為了確保輸出是你原本指定的 250x250 大小，我們建立一個新的 Canvas 來重繪
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = 250;
  finalCanvas.height = 250;
  const ctx = finalCanvas.getContext('2d');
  
  // 填上白色背景 (避免透明圖變黑底)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 250, 250);
  
  // 將裁切好的圖片畫進 250x250 的框內
  ctx.drawImage(canvas, 0, 0, 250, 250);

  // 轉換成 Blob 並上傳
  finalCanvas.toBlob((blob) => {
    if (blob) {
      emit('confirm', blob);
      closeModal();
    }
  }, 'image/jpeg', 0.9);
};
</script>

<style scoped>
/* 原本的動畫樣式保留 */
.animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
.animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* 將 vue-advanced-cropper 的預設灰底改成透明，融入你的 UI */
:deep(.vue-advanced-cropper__background) {
  background: transparent;
}
</style>