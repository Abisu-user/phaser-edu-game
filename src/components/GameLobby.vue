<template>
  <div class="lobby-wrapper h-full overflow-auto">
    <div id="app-wrapper" class="min-h-full w-full" style="background: linear-gradient(135deg, #0f0e17 0%, #1a1a2e 40%, #16213e 100%);">
      
      <div class="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div class="particle float-1" style="top:10%;left:15%;background:#ffbb33;animation-delay:0s;"></div>
        <div class="particle float-2" style="top:20%;left:75%;background:#00d4aa;animation-delay:0.8s;"></div>
        <div class="particle float-3" style="top:60%;left:85%;background:#ff6b6b;animation-delay:1.5s;"></div>
        <div class="particle float-1" style="top:80%;left:25%;background:#a78bfa;animation-delay:0.3s;"></div>
        <div class="particle float-2" style="top:45%;left:50%;background:#ffbb33;animation-delay:1.2s;"></div>
      </div>

      <header class="relative z-10">
        <nav class="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div class="flex items-center gap-2">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style="background: linear-gradient(135deg, #ffbb33, #ff8800);">⚡</div>
            <span class="text-xl font-bold" style="font-family:'Fredoka',sans-serif;color:#f0f0f0;">Code Quest</span>
          </div>
          <div class="hidden md:flex items-center gap-8">
            <a href="#courses" class="nav-item text-sm font-medium" style="color:#a0a0b8;">探索課程</a> 
            <a href="#leaderboard" class="nav-item text-sm font-medium" style="color:#a0a0b8;">排行榜</a> 
            <a href="#achievements" class="nav-item text-sm font-medium" style="color:#a0a0b8;">成就系統</a> 
            <button class="px-4 py-2 rounded-lg text-sm font-semibold" style="background:#ffbb33;color:#0f0e17;">登入</button>
          </div>
          <button class="md:hidden text-white" @click="isMobileMenuOpen = !isMobileMenuOpen" aria-label="開啟選單"> 
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </button>
        </nav>
        
        <div v-show="isMobileMenuOpen" class="md:hidden px-6 pb-4 flex flex-col gap-3">
          <a href="#courses" class="text-sm font-medium py-2" style="color:#a0a0b8;">探索課程</a> 
          <a href="#leaderboard" class="text-sm font-medium py-2" style="color:#a0a0b8;">排行榜</a> 
          <a href="#achievements" class="text-sm font-medium py-2" style="color:#a0a0b8;">成就系統</a> 
          <button class="px-4 py-2 rounded-lg text-sm font-semibold w-full" style="background:#ffbb33;color:#0f0e17;">登入</button>
        </div>
      </header>

      <section class="relative z-10 px-6 pt-12 pb-16 max-w-7xl mx-auto">
        <div class="flex flex-col lg:flex-row items-center gap-12">
          <div class="flex-1 text-center lg:text-left">
            <p class="slide-up text-sm font-semibold tracking-widest uppercase mb-4" style="color:#00d4aa;">🎮 邊玩邊學，輕鬆上手</p>
            <h1 class="slide-up slide-up-d1 text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6" style="font-family:'Fredoka',sans-serif;color:#f0f0f0;">
              用<span style="color:#ffbb33;">遊戲</span>解鎖<br>程式超能力
            </h1>
            <p class="slide-up slide-up-d2 text-lg mb-8 max-w-lg mx-auto lg:mx-0" style="color:#a0a0b8;">透過闖關挑戰、角色養成與即時對戰，讓學寫程式變得跟打遊戲一樣有趣！</p>
            
            <div class="slide-up slide-up-d3 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button @click="$emit('enter-game')" class="cta-btn px-8 py-4 rounded-2xl text-lg font-bold" style="background:linear-gradient(135deg,#ffbb33,#ff8800);color:#0f0e17;"> 
                🚀 開始冒險 
              </button> 
              <button class="px-8 py-4 rounded-2xl text-lg font-semibold border-2 transition-colors hover:bg-white/10" style="border-color:#a0a0b8;color:#f0f0f0;"> 
                觀看介紹 
              </button>
            </div>
            
            <div class="slide-up slide-up-d4 flex gap-8 mt-10 justify-center lg:justify-start">
              <div><span class="text-2xl font-bold" style="color:#ffbb33;">12K+</span><p class="text-xs mt-1" style="color:#a0a0b8;">活躍玩家</p></div>
              <div><span class="text-2xl font-bold" style="color:#00d4aa;">50+</span><p class="text-xs mt-1" style="color:#a0a0b8;">遊戲關卡</p></div>
              <div><span class="text-2xl font-bold" style="color:#ff6b6b;">98%</span><p class="text-xs mt-1" style="color:#a0a0b8;">好評率</p></div>
            </div>
          </div>
          
          <div class="flex-1 relative flex justify-center">
            <div class="relative">
              <div class="slide-up slide-up-d2 rounded-2xl p-1 w-80 md:w-96 float-1" style="background:linear-gradient(135deg,#1e1e2e,#2a2a3e);border:1px solid #333355;">
                <div class="flex gap-2 px-4 py-3" style="border-bottom:1px solid #333355;">
                  <div class="w-3 h-3 rounded-full" style="background:#ff6b6b;"></div>
                  <div class="w-3 h-3 rounded-full" style="background:#ffbb33;"></div>
                  <div class="w-3 h-3 rounded-full" style="background:#00d4aa;"></div>
                </div>
                <div class="p-4 font-mono text-sm leading-relaxed" style="color:#c0c0d8;">
                  <div><span style="color:#a78bfa;">def</span> <span style="color:#ffbb33;">attack</span>(enemy):</div>
                  <div class="pl-4"><span style="color:#a78bfa;">if</span> self.power > <span style="color:#00d4aa;">10</span>:</div>
                  <div class="pl-8">enemy.hp -= self.power</div>
                  <div class="pl-8"><span style="color:#a78bfa;">return</span> <span style="color:#00d4aa;">"💥 Critical Hit!"</span></div>
                  <div class="mt-2 flex items-center gap-2"><span class="inline-block w-2 h-4 animate-pulse" style="background:#ffbb33;"></span></div>
                </div>
              </div>
              <div class="slide-up slide-up-d4 absolute -top-4 -right-4 px-4 py-2 rounded-xl float-2" style="background:linear-gradient(135deg,#00d4aa,#00b894);color:#0f0e17;font-family:'Fredoka',sans-serif;font-weight:700;">+50 XP ⭐</div>
              <div class="slide-up slide-up-d5 absolute -bottom-4 -left-4 px-4 py-2 rounded-xl float-3" style="background:linear-gradient(135deg,#a78bfa,#8b5cf6);color:#fff;font-family:'Fredoka',sans-serif;font-weight:600;font-size:0.85rem;">🏆 Lv. 7 程式騎士</div>
            </div>
          </div>
        </div>
      </section>

      <section id="courses" ref="coursesSection" class="relative z-10 px-6 py-16 max-w-7xl mx-auto">
        <h2 class="slide-up text-3xl font-bold text-center mb-2" style="font-family:'Fredoka',sans-serif;color:#f0f0f0;">選擇你的冒險路線</h2>
        <p class="slide-up slide-up-d1 text-center mb-12" style="color:#a0a0b8;">每條路線都有獨特的遊戲機制與挑戰</p>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div class="course-card slide-up slide-up-d2 rounded-2xl p-6 cursor-pointer" style="background:linear-gradient(160deg,#1e1e2e,#252540);border:1px solid #333355;">
            <div class="text-4xl mb-4">🐍</div>
            <h3 class="text-xl font-bold mb-2" style="color:#f0f0f0;font-family:'Fredoka',sans-serif;">Python 大冒險</h3>
            <p class="text-sm mb-4" style="color:#a0a0b8;">從零開始，用 Python 操控角色闖關打怪，學會基礎語法與邏輯思維。</p>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="px-2 py-1 rounded-md text-xs font-semibold" style="background:#00d4aa22;color:#00d4aa;">入門</span> 
                <span class="text-xs" style="color:#a0a0b8;">20 關卡</span>
              </div>
            </div>
            <div class="mt-4 rounded-full h-2 overflow-hidden" style="background:#333355;">
              <div class="xp-bar h-full rounded-full" style="width:0%;background:linear-gradient(90deg,#00d4aa,#00b894);" data-target="65"></div>
            </div>
          </div>

          <div class="course-card slide-up slide-up-d3 rounded-2xl p-6 cursor-pointer" @click="$emit('enter-game')" style="background:linear-gradient(160deg,#1e1e2e,#252540);border:1px solid #333355;">
            <div class="text-4xl mb-4">⚔️</div>
            <h3 class="text-xl font-bold mb-2" style="color:#f0f0f0;font-family:'Fredoka',sans-serif;">JavaScript 戰場</h3>
            <p class="text-sm mb-4" style="color:#a0a0b8;">在即時對戰中寫出 JS 程式碼，擊敗對手、攻佔城池！(點擊進入)</p>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="px-2 py-1 rounded-md text-xs font-semibold" style="background:#ffbb3322;color:#ffbb33;">中級</span> 
                <span class="text-xs" style="color:#a0a0b8;">15 關卡</span>
              </div>
            </div>
            <div class="mt-4 rounded-full h-2 overflow-hidden" style="background:#333355;">
              <div class="xp-bar h-full rounded-full" style="width:0%;background:linear-gradient(90deg,#ffbb33,#ff8800);" data-target="42"></div>
            </div>
          </div>

          <div class="course-card slide-up slide-up-d4 rounded-2xl p-6 cursor-not-allowed opacity-70" style="background:linear-gradient(160deg,#1e1e2e,#252540);border:1px dashed #555;">
            <div class="text-4xl mb-4">💀</div>
            <h3 class="text-xl font-bold mb-2" style="color:#f0f0f0;font-family:'Fredoka',sans-serif;">無盡地下城 (Roguelike)</h3>
            <p class="text-sm mb-4" style="color:#a0a0b8;">通關所有教學後解鎖。利用你學到的程式碼組合技能，挑戰隨機生成的迷宮！</p>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="px-2 py-1 rounded-md text-xs font-semibold" style="background:#ff6b6b22;color:#ff6b6b;">未解鎖</span> 
              </div>
            </div>
            <div class="mt-4 rounded-full h-2 overflow-hidden" style="background:#333355;">
              <div class="xp-bar h-full rounded-full" style="width:0%;background:linear-gradient(90deg,#a78bfa,#8b5cf6);" data-target="0"></div>
            </div>
          </div>

        </div>
      </section>

      <footer class="relative z-10 px-6 py-10 text-center" style="border-top:1px solid #1e1e2e;">
        <p class="text-sm" style="color:#a0a0b8;">© 2026 Code Quest — 讓每個人都能用遊戲學會寫程式 🎮</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// 定義可以發送給父元件(App.vue)的事件
defineEmits(['enter-game']);

// 控制手機版選單
const isMobileMenuOpen = ref(false);

// 抓取課程區塊，用來做捲動動畫
const coursesSection = ref(null);

onMounted(() => {
  // 實作原有的經驗條捲動動畫 (Intersection Observer)
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const bars = e.target.querySelectorAll('.xp-bar');
        bars.forEach(bar => {
          const target = bar.getAttribute('data-target');
          setTimeout(() => { bar.style.width = target + '%'; }, 300);
        });
        // 觸發後就取消觀察，避免重複播放
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  
  // 觀察包含卡片的區塊
  if (coursesSection.value) {
    const cards = coursesSection.value.querySelectorAll('.course-card');
    cards.forEach(c => observer.observe(c));
  }
});
</script>

<style scoped>
/* 這裡保留所有原版精美的自訂義 CSS 動畫與設定 */
.lobby-wrapper { 
  font-family: 'Noto Sans TC', 'Fredoka', sans-serif; 
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(255, 187, 51, 0.3); }
  50% { box-shadow: 0 0 40px rgba(255, 187, 51, 0.6); }
}
@keyframes slide-up {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes particle {
  0% { transform: translateY(0) scale(1); opacity: 0.7; }
  100% { transform: translateY(-60px) scale(0); opacity: 0; }
}

.float-1 { animation: float 3s ease-in-out infinite; }
.float-2 { animation: float 3.5s ease-in-out infinite 0.5s; }
.float-3 { animation: float 4s ease-in-out infinite 1s; }
.slide-up { animation: slide-up 0.6s ease-out both; }
.slide-up-d1 { animation-delay: 0.1s; }
.slide-up-d2 { animation-delay: 0.2s; }
.slide-up-d3 { animation-delay: 0.3s; }
.slide-up-d4 { animation-delay: 0.4s; }
.slide-up-d5 { animation-delay: 0.5s; }
.slide-up-d6 { animation-delay: 0.6s; }

.course-card {
  transition: transform 0.3s, box-shadow 0.3s;
}
.course-card:hover:not(.cursor-not-allowed) {
  transform: translateY(-6px) scale(1.02);
}
.cta-btn {
  animation: pulse-glow 2s ease-in-out infinite;
  transition: transform 0.2s;
}
.cta-btn:hover { transform: scale(1.05); }
.cta-btn:active { transform: scale(0.97); }

.xp-bar { transition: width 1s ease-out; }

.nav-item {
  position: relative;
  transition: color 0.2s;
}
.nav-item::after {
  content: '';
  position: absolute;
  bottom: -4px; left: 0;
  width: 0; height: 2px;
  background-color: #ffbb33;
  transition: width 0.3s;
}
.nav-item:hover::after { width: 100%; }
.nav-item:hover { color: #f0f0f0 !important; }

.particle {
  position: absolute;
  width: 6px; height: 6px;
  border-radius: 50%;
  animation: particle 2s ease-out infinite;
  pointer-events: none;
}
</style>