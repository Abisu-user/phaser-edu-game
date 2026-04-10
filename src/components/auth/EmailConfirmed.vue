<template>
  <div class="min-h-screen bg-[#0a0e27] flex items-center justify-center p-6 font-['Fredoka']">
    <div class="bg-[#16162a] border border-[#00d4aa]/30 rounded-3xl p-8 max-w-sm w-full text-center shadow-[0_10px_40px_rgba(0,0,0,0.5)] animate-fade-in">
      
      <div class="w-20 h-20 mx-auto bg-[#00d4aa]/10 rounded-full flex items-center justify-center mb-6 border border-[#00d4aa]/30 shadow-[0_0_20px_rgba(0,212,170,0.2)]">
        <span class="text-4xl drop-shadow-md">✅</span>
      </div>
      
      <h2 class="text-2xl font-bold text-white mb-4 tracking-wide">信箱驗證成功！</h2>
      
      <p class="text-[#a0a0b8] text-sm mb-8 leading-relaxed">
        您的信箱已經成功更新。<br><br>
        您現在可以安全地關閉這個視窗，並回到您原本的裝置繼續您的冒險。
      </p>

    </div>
  </div>
</template>

<style scoped>
/* 簡單的淡入動畫 */
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>