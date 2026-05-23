<template>
  <div class="lobby-wrapper h-full overflow-x-hidden overflow-y-auto font-sans bg-[#0f0e17]">
    <div id="app-wrapper" class="min-h-full w-full relative" style="background: linear-gradient(135deg, #0f0e17 0%, #1a1a2e 40%, #16213e 100%);">
      
      <div class="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div class="particle float-1" style="top:10%;left:15%;background:#ffbb33;animation-delay:0s;"></div>
        <div class="particle float-2" style="top:20%;left:75%;background:#00d4aa;animation-delay:0.8s;"></div>
        <div class="particle float-3" style="top:60%;left:85%;background:#ff6b6b;animation-delay:1.5s;"></div>
        <div class="particle float-1" style="top:80%;left:25%;background:#a78bfa;animation-delay:0.3s;"></div>
        <div class="particle float-2" style="top:45%;left:50%;background:#ffbb33;animation-delay:1.2s;"></div>
      </div>

      <LandingPageHeader @enter-dashboard="$emit('go-login')" />

      <section class="relative z-10 px-6 pt-10 pb-8 md:pt-16 md:pb-16 max-w-7xl mx-auto">
        <div class="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
          
          <div class="flex-1 text-center lg:text-left w-full">
            <p class="slide-up text-sm font-bold tracking-widest uppercase mb-4" style="color:#00d4aa;">🎮 邊玩邊學，輕鬆上手</p>
            <h1 class="slide-up slide-up-d1 text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 tracking-wide" style="font-family:'Fredoka',sans-serif;color:#f0f0f0;">
              用<span style="color:#ffbb33; text-shadow: 0 0 20px rgba(255,187,51,0.4);">遊戲</span>解鎖<br>程式超能力
            </h1>
            <p class="slide-up slide-up-d2 text-base sm:text-lg mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed" style="color:#a0a0b8;">
              透過闖關挑戰、角色養成與即時對戰，讓學寫程式變得跟打遊戲一樣有趣！
            </p>
            
            <div class="slide-up slide-up-d3 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button @click="$emit('go-login')" class="cta-btn px-8 py-4 rounded-xl text-lg font-black shadow-[0_5px_15px_rgba(255,187,51,0.3)]" style="background:linear-gradient(135deg,#ffbb33,#ff8800);color:#0f0e17;"> 
                🚀 開始冒險 
              </button> 
              <a href="#introduce" class="px-8 py-4 rounded-xl text-lg font-bold border-2 transition-all hover:bg-white/10 hover:border-white" style="border-color:#a0a0b8;color:#f0f0f0;"> 
                觀看介紹 
              </a>
            </div>
            
            <p class="slide-up slide-up-d4 text-[13px] font-medium text-[#ffbb33] mt-4 lg:hidden text-center px-4">
              * 📱 提醒：手機版僅開放社交與查詢功能，編寫程式闖關請使用電腦。
            </p>
            
            <div class="slide-up slide-up-d4 flex flex-wrap gap-6 sm:gap-10 mt-10 justify-center lg:justify-start">
              <div><span class="text-3xl font-black" style="color:#ffbb33;">5+</span><p class="text-[13px] font-bold mt-1 uppercase tracking-wider" style="color:#a0a0b8;">活躍玩家</p></div>
              <div><span class="text-3xl font-black" style="color:#00d4aa;">20+</span><p class="text-[13px] font-bold mt-1 uppercase tracking-wider" style="color:#a0a0b8;">遊戲關卡</p></div>
              <div><span class="text-3xl font-black" style="color:#ff6b6b;">4%</span><p class="text-[13px] font-bold mt-1 uppercase tracking-wider" style="color:#a0a0b8;">好評率</p></div>
            </div>
          </div>
          
          <div class="flex-1 relative flex justify-center w-full mt-6 lg:mt-0">
            <div class="relative w-full max-w-[300px] sm:max-w-[340px] md:max-w-[380px]">
              <div class="slide-up slide-up-d2 rounded-2xl p-1 w-full float-1 shadow-[0_20px_50px_rgba(0,0,0,0.5)]" style="background:linear-gradient(135deg,#1e1e2e,#2a2a3e);border:1px solid #333355;">
                <div class="flex gap-2 px-4 py-3" style="border-bottom:1px solid #333355;">
                  <div class="w-3 h-3 rounded-full" style="background:#ff6b6b;"></div>
                  <div class="w-3 h-3 rounded-full" style="background:#ffbb33;"></div>
                  <div class="w-3 h-3 rounded-full" style="background:#00d4aa;"></div>
                </div>
                <div class="p-4 sm:p-5 font-mono text-[13px] sm:text-sm leading-relaxed overflow-hidden" style="color:#c0c0d8;">
                  <div><span style="color:#a78bfa;">def</span> <span style="color:#ffbb33;">attack</span>(enemy):</div>
                  <div class="pl-4"><span style="color:#a78bfa;">if</span> self.power > <span style="color:#00d4aa;">10</span>:</div>
                  <div class="pl-8">enemy.hp -= self.power</div>
                  <div class="pl-8"><span style="color:#a78bfa;">return</span> <span style="color:#00d4aa;">"💥 Critical Hit!"</span></div>
                  <div class="mt-2 flex items-center gap-2"><span class="inline-block w-2 h-4 animate-pulse" style="background:#ffbb33;"></span></div>
                </div>
              </div>
              
              <div class="slide-up slide-up-d4 absolute -top-4 -right-2 sm:-right-6 px-3 sm:px-4 py-2 rounded-xl float-2 shadow-lg" style="background:linear-gradient(135deg,#00d4aa,#00b894);color:#0f0e17;font-family:'Fredoka',sans-serif;font-weight:900;">
                +999 XP ⭐
              </div>
              
              <div class="slide-up slide-up-d5 absolute -bottom-4 -left-2 sm:-left-6 px-3 sm:px-4 py-2 rounded-xl float-3 shadow-lg" style="background:linear-gradient(135deg,#a78bfa,#8b5cf6);color:#fff;font-family:'Fredoka',sans-serif;font-weight:700;font-size:0.85rem;">
                🏆 Lv. 7 程式騎士
              </div>
            </div>
          </div>
          
        </div>
      </section>

      <section id="courses" ref="coursesSection" class="relative z-10 px-6 py-16 md:py-24 max-w-7xl mx-auto">
        <h2 class="slide-up text-3xl md:text-4xl font-bold text-center mb-3" style="font-family:'Fredoka',sans-serif;color:#f0f0f0;">選擇你的冒險路線</h2>
        <p class="slide-up slide-up-d1 text-center mb-12 text-sm md:text-base font-medium" style="color:#a0a0b8;">每條路線都有獨特的遊戲機制與挑戰</p>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <CourseCard 
            v-for="(course, index) in courses" 
            :key="course.id"
            class="slide-up"
            :class="'slide-up-d' + (index + 2)"
            v-bind="course"
            @click="handleCourseClick(course.id)"
          />
        </div>
      </section>

      <section id="introduce" class="py-12 md:py-16 relative z-10 max-w-[1400px] mx-auto group">
        <div class="text-center mb-10 px-6 slide-up slide-up-d2">
          <h2 class="text-3xl md:text-4xl font-bold text-white font-['Fredoka'] tracking-wide" style="text-shadow: 0 0 15px rgba(0,212,170,0.3);">
            探索 Code Quest 的魔法
          </h2>
          <p class="text-[#a0a0b8] mt-3 text-sm md:text-base font-medium">左右滑動，看看你能在這裡體驗到什麼！</p>
        </div>

        <button @click="scrollCarousel(-1)" class="hidden md:flex absolute left-4 lg:left-8 top-[60%] -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-[#1a1a3e] border border-[#00d4aa]/50 items-center justify-center text-[#00d4aa] hover:bg-[#00d4aa] hover:text-[#0a0e27] hover:scale-110 transition-all shadow-[0_0_20px_rgba(0,212,170,0.3)] opacity-0 group-hover:opacity-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>

        <button @click="scrollCarousel(1)" class="hidden md:flex absolute right-4 lg:right-8 top-[60%] -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-[#1a1a3e] border border-[#00d4aa]/50 items-center justify-center text-[#00d4aa] hover:bg-[#00d4aa] hover:text-[#0a0e27] hover:scale-110 transition-all shadow-[0_0_20px_rgba(0,212,170,0.3)] opacity-0 group-hover:opacity-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>

        <div ref="carouselContainer" class="flex overflow-x-auto snap-x snap-mandatory gap-5 pb-8 px-6 md:px-24 hide-scrollbar slide-up slide-up-d3" style="scroll-behavior: smooth;">

          <div class="snap-center shrink-0 w-[82vw] sm:w-[320px] md:w-[380px] bg-[#1a1a3e]/80 border border-white/10 rounded-3xl overflow-hidden shadow-2xl hover:border-[#00d4aa]/50 hover:-translate-y-2 transition-all duration-300">
            <div class="h-48 md:h-52 w-full bg-[#0a0e27] relative flex flex-col items-center justify-center border-b border-white/10 group overflow-hidden">
              <img :src="getImageUrl('landing1.png')" class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
            <div class="p-5 md:p-6">
              <h3 class="text-lg md:text-xl font-bold text-white mb-2 flex items-center gap-2">
                <span class="text-2xl">🎮</span> 沉浸式闖關學習
              </h3>
              <p class="text-[#a0a0b8] text-sm leading-relaxed">
                揮別枯燥的教科書！透過組合積木程式碼操控角色，在一次次的迷宮挑戰中自然學會核心程式邏輯。
              </p>
            </div>
          </div>

          <div class="snap-center shrink-0 w-[82vw] sm:w-[320px] md:w-[380px] bg-[#1a1a3e]/80 border border-white/10 rounded-3xl overflow-hidden shadow-2xl hover:border-[#ffbb33]/50 hover:-translate-y-2 transition-all duration-300">
            <div class="h-48 md:h-52 w-full bg-[#0a0e27] relative flex flex-col items-center justify-center border-b border-white/10 group overflow-hidden">
              <img :src="getImageUrl('landing2.png')" class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div class="p-5 md:p-6">
              <h3 class="text-lg md:text-xl font-bold text-white mb-2 flex items-center gap-2">
                <span class="text-2xl">⚔️</span> 無盡深淵挑戰
              </h3>
              <p class="text-[#a0a0b8] text-sm leading-relaxed">
                挑戰隨機生成的 Roguelike 地下城迷宮模式。善用迴圈與判斷式，擊退源源不絕的怪物和BOSS，看你能否主宰深淵！
              </p>
            </div>
          </div>

          <div class="snap-center shrink-0 w-[82vw] sm:w-[320px] md:w-[380px] bg-[#1a1a3e]/80 border border-white/10 rounded-3xl overflow-hidden shadow-2xl hover:border-[#ff6b6b]/50 hover:-translate-y-2 transition-all duration-300">
            <div class="h-48 md:h-52 w-full bg-[#0a0e27] relative flex flex-col items-center justify-center border-b border-white/10 group overflow-hidden">
              <img :src="getImageUrl('landing3.png')" class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div class="p-5 md:p-6">
              <h3 class="text-lg md:text-xl font-bold text-white mb-2 flex items-center gap-2">
                <span class="text-2xl">👑</span> 公會榮譽排行榜
              </h3>
              <p class="text-[#a0a0b8] text-sm leading-relaxed">
                與全服冒險者一較高下！挑戰無盡深淵的最高樓層，或是比拚累積經驗值，在公會排行榜上刻下你的傳奇名號，成為萬人景仰的大魔法師。
              </p>
            </div>
          </div>

          <div class="snap-center shrink-0 w-[82vw] sm:w-[320px] md:w-[380px] bg-[#1a1a3e]/80 border border-white/10 rounded-3xl overflow-hidden shadow-2xl hover:border-[#38bdf8]/50 hover:-translate-y-2 transition-all duration-300">
            <div class="h-48 md:h-52 w-full bg-[#0a0e27] relative flex flex-col items-center justify-center border-b border-white/10 group overflow-hidden">
              <img :src="getImageUrl('landing4.png')" class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div class="p-5 md:p-6">
              <h3 class="text-lg md:text-xl font-bold text-white mb-2 flex items-center gap-2">
                <span class="text-2xl">💬</span> 即時社交互動
              </h3>
              <p class="text-[#a0a0b8] text-sm leading-relaxed">
                結交志同道合的程式夥伴！透過專屬頻道與好友即時交流、分享通關神操作，讓學習寫程式的冒險之路不再孤單。
              </p>
            </div>
          </div>

           <div class="snap-center shrink-0 w-[82vw] sm:w-[320px] md:w-[380px] bg-[#1a1a3e]/80 border border-white/10 rounded-3xl overflow-hidden shadow-2xl hover:border-[#ff6b6b]/50 hover:-translate-y-2 transition-all duration-300">
            <div class="h-48 md:h-52 w-full bg-[#0a0e27] relative flex flex-col items-center justify-center border-b border-white/10 group overflow-hidden">
              <img :src="getImageUrl('landing5.png')" class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div class="p-5 md:p-6">
              <h3 class="text-lg md:text-xl font-bold text-white mb-2 flex items-center gap-2">
                <span class="text-2xl">🏆</span> 榮耀成就系統
              </h3>
              <p class="text-[#a0a0b8] text-sm leading-relaxed">
                解鎖各式稀有稱號與徽章，在公會大廳向所有冒險者展示你的火力，累積經驗值成為最強魔法師！
              </p>
            </div>
          </div>

        </div>
      </section>

      <footer class="relative z-10 px-6 py-10 text-center" style="border-top:1px solid rgba(255,255,255,0.05);">
        <p class="text-[13px] font-medium tracking-wide" style="color:#a0a0b8;">
          © 2026 Code Quest — 讓每個人都能用遊戲學會寫程式 🎮
        </p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import LandingPageHeader from './LandingPageHeader.vue';
import CourseCard from './CourseCard.vue';
import img1 from '../../assets/images/landing1.png';

const getImageUrl = (name) => {
  return new URL(`../../assets/images/${name}`, import.meta.url).href;
};
const emit = defineEmits(['enter-game', 'go-login']);
const coursesSection = ref(null);
const carouselContainer = ref(null); 

// 🌟 點擊左右按鈕的滑動控制邏輯
const scrollCarousel = (direction) => {
  if (carouselContainer.value) {
    // 根據視窗大小決定每次滾動的距離 (手機滾單張，電腦滾單張)
    const scrollAmount = window.innerWidth < 768 ? 320 : 400; 
    carouselContainer.value.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
  }
};

const courses = ref([
  {
    id: 'python',
    icon: '🐍',
    title: '基礎邏輯教學',
    description: '從零開始，利用程式積木操控角色闖關打怪，學會基礎語法與邏輯思維。',
    badgeText: '入門',
    badgeColor: '#00d4aa',
    badgeBg: '#00d4aa22',
    levelsText: '20 關卡',
    progress: 65,
    barGradient: 'linear-gradient(90deg,#00d4aa,#00b894)',
    disabled: false
  },
  {
    id: 'js',
    icon: '⚔️',
    title: '教師專屬挑戰',
    description: '由你的指導老師為班級量身打造的特訓地圖!準備好接受考驗了嗎？',
    badgeText: '中級',
    badgeColor: '#ffbb33',
    badgeBg: '#ffbb3322',
    levelsText: '? 關卡',
    progress: 42,
    barGradient: 'linear-gradient(90deg,#ffbb33,#ff8800)',
    disabled: false
  },
  {
    id: 'roguelike',
    icon: '💀',
    title: '無盡地下城 (Roguelike)',
    description: '通關所有教學後解鎖。利用你學到的程式碼組合技能，挑戰隨機生成的迷宮！',
    badgeText: '未解鎖',
    badgeColor: '#ff6b6b',
    badgeBg: '#ff6b6b22',
    levelsText: '',
    progress: 0,
    barGradient: 'linear-gradient(90deg,#a78bfa,#8b5cf6)',
    disabled: true
  }
]);

const handleCourseClick = (courseId) => {
  if (courseId === 'js') {
    emit('enter-game');
  }
};

onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const bars = e.target.querySelectorAll('.xp-bar');
        bars.forEach(bar => {
          const target = bar.getAttribute('data-target');
          if(target) {
            setTimeout(() => { bar.style.width = target + '%'; }, 300);
          }
        });
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 }); 
  
  if (coursesSection.value) {
    observer.observe(coursesSection.value);
  }
});
</script>

<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 15px rgba(255, 187, 51, 0.4); }
  50% { box-shadow: 0 0 35px rgba(255, 187, 51, 0.7); }
}
@keyframes slide-up {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes particle {
  0% { transform: translateY(0) scale(1); opacity: 0.7; }
  100% { transform: translateY(-60px) scale(0); opacity: 0; }
}

.float-1 { animation: float 3.5s ease-in-out infinite; }
.float-2 { animation: float 4s ease-in-out infinite 0.5s; }
.float-3 { animation: float 4.5s ease-in-out infinite 1s; }

.slide-up { animation: slide-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both; }
.slide-up-d1 { animation-delay: 0.1s; }
.slide-up-d2 { animation-delay: 0.2s; }
.slide-up-d3 { animation-delay: 0.3s; }
.slide-up-d4 { animation-delay: 0.4s; }
.slide-up-d5 { animation-delay: 0.5s; }

.cta-btn {
  animation: pulse-glow 2.5s ease-in-out infinite;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.cta-btn:hover { transform: scale(1.04); }
.cta-btn:active { transform: scale(0.96); }

.particle {
  position: absolute;
  width: 6px; height: 6px;
  border-radius: 50%;
  animation: particle 2.5s ease-out infinite;
  pointer-events: none;
}

/* 🌟 隱藏水平滑動的預設捲軸，保持畫面乾淨 */
.hide-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
.hide-scrollbar::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}
</style>