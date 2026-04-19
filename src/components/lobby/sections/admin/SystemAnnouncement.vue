<template>
  <div v-if="announcement" class="w-full bg-[#9d4edd]/20 border-b border-[#9d4edd]/30 backdrop-blur-md overflow-hidden py-2 relative z-[60] flex-shrink-0 shadow-md">
    <div class="max-w-7xl mx-auto px-4 flex items-center gap-3">
      <span class="flex-shrink-0 text-lg animate-bounce">📢</span>
      
      <div class="flex-1 overflow-hidden whitespace-nowrap relative h-6">
        <div class="absolute animate-marquee flex items-center gap-8">
          <span class="text-white font-bold text-sm tracking-wide">
            {{ announcement }}
          </span>
          <span class="text-white font-bold text-sm tracking-wide">
            {{ announcement }}
          </span>
        </div>
      </div>

      <div class="flex-shrink-0 px-2 py-0.5 bg-[#9d4edd] text-white text-[10px] font-bold rounded uppercase tracking-tighter shadow-sm">
        System News
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { supabase } from '../../../../supabase.js';

const announcement = ref('');
let subscription = null;

// 取得最新公告
const fetchAnnouncement = async () => {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('announcement_text')
      .eq('id', 1)
      .single();

    if (error) throw error;
    announcement.value = data?.announcement_text || '';
  } catch (err) {
    console.error('公告載入失敗:', err);
  }
};

// 🌟 進階功能：即時更新 (Real-time)
// 當管理員在後台一按下儲存，玩家的大廳公告會「秒變」，不用重新整理！
const subscribeToChanges = () => {
  subscription = supabase
    .channel('system_changes')
    .on('postgres_changes', { 
      event: 'UPDATE', 
      schema: 'public', 
      table: 'system_settings' 
    }, (payload) => {
      announcement.value = payload.new.announcement_text;
    })
    .subscribe();
};

onMounted(() => {
  fetchAnnouncement();
  subscribeToChanges();
});

onUnmounted(() => {
  if (subscription) supabase.removeChannel(subscription);
});
</script>

<style scoped>
/* 跑馬燈動畫 */
.animate-marquee {
  display: inline-block;
  padding-left: 100%;
  animation: marquee 20s linear infinite;
}

@keyframes marquee {
  0% { transform: translate(0, 0); }
  100% { transform: translate(-100%, 0); }
}

/* 暫停效果：滑鼠移上去公告會停住，方便閱讀 */
.animate-marquee:hover {
  animation-play-state: paused;
}
</style>