<template>
  <section class="space-y-6" aria-labelledby="analytics-heading">
    <div class="flex flex-col gap-4 rounded-2xl border border-[#333366] bg-[#16162a] p-5 shadow-lg lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h3 id="analytics-heading" class="text-xl font-black text-white">平台學習數據</h3>
        <p class="mt-1 text-sm text-[#a0a0b8]">活動指標依日期範圍計算；課程完成率與卡關排行使用全體學生的累計進度。</p>
      </div>
      <div class="flex flex-wrap items-end gap-3">
        <label class="text-sm font-bold text-[#a0a0b8]">開始日期
          <input v-model="startDate" type="date" :max="endDate" class="mt-1 block rounded-lg border border-[#333366] bg-[#0a0e27] px-3 py-2 text-white outline-none focus:border-[#9d4edd]" />
        </label>
        <label class="text-sm font-bold text-[#a0a0b8]">結束日期
          <input v-model="endDate" type="date" :min="startDate" :max="today" class="mt-1 block rounded-lg border border-[#333366] bg-[#0a0e27] px-3 py-2 text-white outline-none focus:border-[#9d4edd]" />
        </label>
        <button @click="loadAnalytics" :disabled="isLoading" class="rounded-lg bg-[#9d4edd] px-5 py-2.5 font-bold text-white transition-colors hover:bg-[#8e3ccc] disabled:cursor-not-allowed disabled:opacity-60">
          {{ isLoading ? '更新中…' : '更新數據' }}
        </button>
      </div>
    </div>

    <div v-if="errorMessage" class="rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300" role="alert">{{ errorMessage }}</div>

    <div v-if="isLoading" class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-live="polite">
      <div v-for="index in 6" :key="index" class="h-32 animate-pulse rounded-2xl border border-[#333366] bg-[#16162a]"></div>
    </div>

    <template v-else-if="hasReport">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <article v-for="card in summaryCards" :key="card.label" class="rounded-2xl border border-[#333366] bg-[#16162a] p-5 shadow-lg">
          <div class="text-2xl">{{ card.icon }}</div>
          <p class="mt-3 text-sm font-bold text-[#a0a0b8]">{{ card.label }}</p>
          <p class="mt-1 text-3xl font-black text-white">{{ card.value }}</p>
          <p class="mt-1 text-xs text-[#777799]">{{ card.hint }}</p>
        </article>
      </div>

      <div class="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <article class="rounded-2xl border border-[#333366] bg-[#16162a] p-6 shadow-lg xl:col-span-3">
          <div class="mb-5 flex items-center justify-between">
            <div>
              <h4 class="font-black text-white">每日活動</h4>
              <p class="text-sm text-[#a0a0b8]">完成關卡與不重複活躍學生</p>
            </div>
          </div>
          <div v-if="dailyActivity.length" class="space-y-3">
            <div v-for="day in dailyActivity" :key="day.date" class="grid grid-cols-[88px_1fr_auto] items-center gap-3 text-sm">
              <span class="font-bold text-[#a0a0b8]">{{ formatDate(day.date) }}</span>
              <div class="h-2 overflow-hidden rounded-full bg-[#0a0e27]">
                <div class="h-full rounded-full bg-[#00d4aa] transition-all duration-500" :style="{ width: `${activityWidth(day.completions)}%` }"></div>
              </div>
              <span class="font-black text-white">{{ day.completions }} 關 · {{ day.active_users }} 人</span>
            </div>
          </div>
          <p v-else class="py-10 text-center text-[#a0a0b8]">此日期區間尚無完成關卡紀錄。</p>
        </article>

        <article class="rounded-2xl border border-[#333366] bg-[#16162a] p-6 shadow-lg xl:col-span-2">
          <h4 class="font-black text-white">最需支援的關卡</h4>
          <p class="mb-5 text-sm text-[#a0a0b8]">依未完成學生數排序（基礎邏輯 25 關，累計）</p>
          <ol class="space-y-4">
            <li v-for="(level, index) in blockers" :key="level.level_id" class="flex items-center gap-3">
              <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#9d4edd]/20 text-sm font-black text-[#c084fc]">{{ index + 1 }}</span>
              <div class="min-w-0 flex-1">
                <div class="flex justify-between gap-3 text-sm"><span class="truncate font-bold text-white">{{ level.title }}</span><span class="shrink-0 text-[#ffbb33]">{{ level.completion_rate }}%</span></div>
                <div class="mt-1 h-1.5 overflow-hidden rounded-full bg-[#0a0e27]"><div class="h-full bg-[#ffbb33]" :style="{ width: `${level.completion_rate}%` }"></div></div>
              </div>
              <span class="shrink-0 text-xs text-[#a0a0b8]">{{ level.stuck_users }} 人未完成</span>
            </li>
          </ol>
        </article>
      </div>
    </template>

    <div v-else class="rounded-2xl border border-[#333366] bg-[#16162a] px-6 py-12 text-center text-[#a0a0b8]" role="status">
      請修正日期範圍後再載入統計報表。
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { supabase } from '../../../../supabase.js';

const toDateInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const today = toDateInput(new Date());
const monthAgo = new Date();
monthAgo.setDate(monthAgo.getDate() - 29);
const startDate = ref(toDateInput(monthAgo));
const endDate = ref(today);
const isLoading = ref(true);
const errorMessage = ref('');
const emptyAnalytics = () => ({ summary: {}, daily_activity: [], blockers: [] });
const analytics = ref(emptyAnalytics());
const hasReport = ref(false);

const summary = computed(() => analytics.value.summary || {});
const dailyActivity = computed(() => analytics.value.daily_activity || []);
const blockers = computed(() => analytics.value.blockers || []);
const summaryCards = computed(() => [
  { icon: '👥', label: '總使用者', value: summary.value.total_users ?? 0, hint: '目前啟用帳號' },
  { icon: '⚡', label: 'DAU', value: summary.value.dau ?? 0, hint: '結束日期的活躍學生' },
  { icon: '🧭', label: '區間活躍學生', value: summary.value.active_students ?? 0, hint: '日期範圍內至少完成一關' },
  { icon: '📚', label: '活躍課程／關卡', value: `${summary.value.active_courses ?? 0}／${summary.value.active_levels ?? 0}`, hint: '日期範圍內有完成紀錄' },
  { icon: '🎯', label: '基礎邏輯完成率', value: `${summary.value.completion_rate ?? 0}%`, hint: `${summary.value.student_count ?? 0} 位啟用學生 × 25 關，累計` },
  { icon: '📅', label: '統計區間', value: `${dailyActivity.value.length} 天`, hint: `${startDate.value} 至 ${endDate.value}` }
]);

const activityWidth = (value) => {
  const highest = Math.max(...dailyActivity.value.map((day) => day.completions || 0), 1);
  return Math.max(4, Math.round(((value || 0) / highest) * 100));
};
const formatDate = (value) => new Intl.DateTimeFormat('zh-TW', { month: 'numeric', day: 'numeric' }).format(new Date(`${value}T00:00:00`));

const loadAnalytics = async () => {
  if (!startDate.value || !endDate.value || startDate.value > endDate.value) {
    analytics.value = emptyAnalytics();
    hasReport.value = false;
    errorMessage.value = '請選擇有效的日期範圍。';
    return;
  }
  isLoading.value = true;
  errorMessage.value = '';
  const { data, error } = await supabase.rpc('admin_get_analytics', {
    p_start_date: startDate.value,
    p_end_date: endDate.value
  });
  if (error) {
    analytics.value = emptyAnalytics();
    hasReport.value = false;
    errorMessage.value = error.code === 'P0001' ? '沒有查看管理員數據的權限。' : '讀取數據失敗，請稍後再試。';
  } else {
    analytics.value = data || emptyAnalytics();
    hasReport.value = true;
  }
  isLoading.value = false;
};

onMounted(loadAnalytics);
</script>
