<template>
  <div class="h-full flex flex-col items-center justify-center text-center py-20 opacity-80 bg-[#16162a] rounded-2xl border border-[#333366] shadow-inner min-h-[400px]">
    <div class="text-7xl mb-6 grayscale drop-shadow-lg">{{ icon }}</div>
    <h3 class="text-3xl font-bold text-white mb-3">{{ title }}</h3>
    <p class="text-[#a0a0b8] max-w-md text-lg leading-relaxed">
      {{ desc }}<br>功能正在開發中，未來你可以在這裡進行進階設定。
    </p>
    <div class="mt-8 px-6 py-2 border-2 border-[#333366] bg-[#0a0e27]/50 rounded-full text-sm font-bold text-[#a0a0b8]">
      Module Under Construction
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: String,
  title: String,
  desc: String
});
</script>