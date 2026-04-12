<template>
  <div class="p-8 max-w-4xl mx-auto text-white font-['Fredoka']">
    <h2 class="text-3xl font-bold mb-8 text-[#00d4aa] flex items-center">
      <span class="mr-3">❓</span> 遊戲幫助與教學
    </h2>

    <div class="bg-[#16162a] border border-[#333366] rounded-2xl p-6 mb-8 shadow-lg">
      <h3 class="text-xl text-[#f0f0f0] mb-4 border-b border-[#333366] pb-2">🎮 基本玩法</h3>
      <div class="space-y-4 text-[#a0a0b8] leading-relaxed">
        <p>
          <strong class="text-white">目標：</strong> 幫助角色順利走到終點！<br>
          在這款遊戲中，你不能直接用鍵盤操控角色。你需要運用「程式邏輯」，在左側面板組合正確的移動指令。
        </p>
        <ul class="list-disc pl-5 space-y-2">
          <li><strong>選擇指令：</strong> 從指令區挑選需要的動作（例如：向前走、左轉、右轉）。</li>
          <li><strong>排列順序：</strong> 將指令依序排列，角色會由上到下執行你的命令。</li>
          <li><strong>執行測試：</strong> 點擊「執行」按鈕，看看角色是否能避開障礙物抵達終點。</li>
        </ul>
      </div>
    </div>

    <div class="bg-[#16162a] border border-[#333366] rounded-2xl p-6 mb-8 shadow-lg">
      <h3 class="text-xl text-[#f0f0f0] mb-4 border-b border-[#333366] pb-2">🪧 介面圖示說明</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div class="bg-[#0a0e27] p-4 rounded-lg flex items-start border border-[#333366]/50">
          <div class="text-2xl mr-4">▶️</div>
          <div>
            <h4 class="text-white font-bold mb-1">執行程式</h4>
            <p class="text-sm text-[#a0a0b8]">讓角色開始按照你排好的指令移動。</p>
          </div>
        </div>

        <div class="bg-[#0a0e27] p-4 rounded-lg flex items-start border border-[#333366]/50">
          <div class="text-2xl mr-4">🔄</div>
          <div>
            <h4 class="text-white font-bold mb-1">重置關卡</h4>
            <p class="text-sm text-[#a0a0b8]">清空目前的指令，或是讓角色回到起點重新開始。</p>
          </div>
        </div>

        <div class="bg-[#0a0e27] p-4 rounded-lg flex items-start border border-[#333366]/50">
          <div class="text-2xl mr-4">⭐</div>
          <div>
            <h4 class="text-white font-bold mb-1">過關星星</h4>
            <p class="text-sm text-[#a0a0b8]">使用的指令越少，能獲得的星星越多！試著寫出最精簡的解法。</p>
          </div>
        </div>

      </div>
    </div>

    <div class="bg-[#16162a] border border-[#333366] rounded-2xl p-6 shadow-lg">
      <h3 class="text-xl text-[#f0f0f0] mb-4 border-b border-[#333366] pb-2">💡 常見問題 (FAQ)</h3>
      
      <div class="space-y-4">
        <div class="p-4 bg-[#0a0e27] rounded-lg border border-[#333366]/50">
          <h4 class="text-[#00d4aa] font-bold mb-2">Q: 為什麼角色撞到牆壁就停下來了？</h4>
          <p class="text-sm text-[#a0a0b8]">A: 當角色執行指令時如果遇到障礙物或邊界，程式就會判定失敗。請檢查你的轉彎指令是否正確喔！</p>
        </div>

        <div class="p-4 bg-[#0a0e27] rounded-lg border border-[#333366]/50">
          <h4 class="text-[#00d4aa] font-bold mb-2">Q: 如何刪除放錯的指令？</h4>
          <p class="text-sm text-[#a0a0b8]">A: 你可以將放錯的指令直接拖曳回指令區，或是點擊指令旁邊的「X」按鈕來移除它。</p>
        </div>
      </div>
    </div>

  </div>
</template>