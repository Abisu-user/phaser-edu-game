<template>
  <div class="p-8 max-w-6xl mx-auto text-white font-['Fredoka']">
    <div class="flex items-center justify-between mb-8 border-b border-[#333366] pb-4">
      <h2 class="text-3xl font-bold text-[#ff6b6b] flex items-center gap-3">
        <span>🛠️</span> 系統管理後台
      </h2>
      <div class="px-4 py-1.5 bg-red-500/20 text-red-400 border border-red-500/50 rounded-full text-sm font-bold tracking-widest">
        ADMIN ONLY
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      
      <div class="bg-[#16162a] border border-[#333366] rounded-2xl p-6 shadow-lg hover:border-[#ff6b6b]/50 transition-colors cursor-pointer group">
        <div class="text-4xl mb-4 group-hover:scale-110 transition-transform">👥</div>
        <h3 class="text-xl text-white font-bold mb-2">玩家帳號管理</h3>
        <p class="text-[#a0a0b8] text-sm leading-relaxed">
          查看所有註冊玩家、修改密碼、封鎖違規帳號或調整權限身分。
        </p>
        <button class="mt-4 w-full py-2 bg-[#0a0e27] text-[#ff6b6b] border border-[#ff6b6b]/30 rounded-lg group-hover:bg-[#ff6b6b]/10 transition-colors">
          進入管理
        </button>
      </div>

      <div class="bg-[#16162a] border border-[#333366] rounded-2xl p-6 shadow-lg hover:border-[#00d4aa]/50 transition-colors cursor-pointer group">
        <div class="text-4xl mb-4 group-hover:scale-110 transition-transform">🗺️</div>
        <h3 class="text-xl text-white font-bold mb-2">關卡與地圖編輯</h3>
        <p class="text-[#a0a0b8] text-sm leading-relaxed">
          設計新的程式邏輯關卡，設定過關條件與障礙物配置。
        </p>
        <button class="mt-4 w-full py-2 bg-[#0a0e27] text-[#00d4aa] border border-[#00d4aa]/30 rounded-lg group-hover:bg-[#00d4aa]/10 transition-colors">
          開啟編輯器
        </button>
      </div>

      <div class="bg-[#16162a] border border-[#333366] rounded-2xl p-6 shadow-lg hover:border-[#ffbb33]/50 transition-colors cursor-pointer group">
        <div class="text-4xl mb-4 group-hover:scale-110 transition-transform">📊</div>
        <h3 class="text-xl text-white font-bold mb-2">遊戲數據統計</h3>
        <p class="text-[#a0a0b8] text-sm leading-relaxed">
          檢視每日活躍登入人數、各關卡卡關率與全服學習進度。
        </p>
        <button class="mt-4 w-full py-2 bg-[#0a0e27] text-[#ffbb33] border border-[#ffbb33]/30 rounded-lg group-hover:bg-[#ffbb33]/10 transition-colors">
          查看報表
        </button>
      </div>

    </div>

    <div class="mt-8 p-6 bg-[#0a0e27]/50 border border-dashed border-[#333366] rounded-2xl text-center">
      <p class="text-[#a0a0b8]">🚀 這裡先預留版面，等學生端功能完善後，我們再來實作這裡的具體功能！</p>
    </div>
  </div>
</template>

<script setup>
// 目前僅為預留框架，未來會在這裡串接 Supabase 抓取全服資料的邏輯
</script>