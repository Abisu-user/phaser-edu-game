<template>
  <div class="tower-battle h-full w-full flex flex-col bg-[#110A07] relative text-[#D7CCC8] font-serif overflow-hidden">
    
    <div class="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#3A1C0A]/20 via-[#110A07] to-black pointer-events-none z-0"></div>

    <transition name="fade">
      <div v-if="showClearModal" class="absolute inset-0 z-[110] flex items-center justify-center bg-black/85 backdrop-blur-sm">
        <div class="w-[660px] bg-[#1C110C] border-[6px] border-double border-[#D4AF37] rounded-sm p-9 shadow-[0_0_50px_rgba(218,165,32,0.4)] flex flex-col gap-7 text-center transform transition-all relative">
          <div class="absolute inset-0 border border-[#D4AF37]/30 m-2 pointer-events-none"></div>
          
          <div class="space-y-2.5 relative z-10">
            <div class="text-5xl animate-bounce drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">🏆</div>
            <h3 class="text-[#FFD700] font-black text-3xl tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">階層突破成功！通關獎勵：+{{ floorBonusCoins }} 🪙</h3>
            <p class="text-[#A08060] font-bold text-[15px]">通往更深淵的階梯已經開啟...</p>
          </div>
          <div class="flex flex-col gap-3.5 mt-2 relative z-10">
            <div class="text-[15px] text-[#8FBC8F] font-black tracking-widest text-left flex items-center gap-2.5 drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">
              <span class="w-2.5 h-2.5 bg-[#8FBC8F] rounded-full animate-pulse shadow-[0_0_5px_#8FBC8F]"></span>
              發現遠古遺物，請選擇一項女神的祝福：
            </div>
            <div class="grid grid-cols-3 gap-4.5">
              <button 
                v-for="reward in currentRewards" 
                :key="reward.id"
                @click="selectReward(reward)"
                class="group border-2 border-[#593922] bg-[#2A1810] hover:bg-[#3A2318] hover:border-[#DAA520] rounded-sm p-6 flex flex-col items-center gap-3.5 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-[0_10px_20px_rgba(0,0,0,0.8)] cursor-pointer shadow-[inset_0_0_15px_rgba(0,0,0,1)]"
              >
                <span class="text-5xl group-hover:scale-125 transition-transform duration-300 drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">{{ reward.icon }}</span>
                <div class="flex flex-col items-center mt-1">
                  <span class="text-[15px] font-black text-[#F5DEB3] group-hover:text-[#FFD700] tracking-wider drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">{{ reward.name }}</span>
                  <span class="text-xs font-bold text-[#A08060] group-hover:text-[#D7CCC8] mt-1.5">{{ reward.desc }}</span>
                </div>
              </button>
            </div>
          </div>
          <button @click="proceedToNextFloor" class="py-3.5 mt-5 rounded-sm border-2 border-[#3A2318] text-[#8C6239] hover:text-[#D7CCC8] hover:bg-[#2A1810] hover:border-[#593922] font-black tracking-widest transition-all text-[15px] relative z-10">
            放棄祝福，直接踏入下一層 ＞
          </button>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="showMenu" class="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div class="w-[350px] bg-[#1C110C] border-4 border-double border-[#8C6239] rounded-sm p-7 shadow-2xl flex flex-col gap-5 text-center">
          <h3 class="text-[#FFD700] font-black text-xl mb-2 tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">冒險者紮營選單</h3>
          <button @click="showMenu = false" class="py-3.5 rounded-sm border-2 border-[#3A2318] bg-[#2A1810] hover:bg-[#3A2318] hover:border-[#593922] text-[#F5DEB3] font-black transition-all text-[15px] shadow-md border-b-[4px] hover:border-b-[2px] hover:translate-y-[2px]">繼續探索</button>
          <button @click="confirmExit('save')" class="py-3.5 rounded-sm border-2 border-[#4299E1] bg-[#1A365D] hover:bg-[#2A4365] text-[#FFF8DC] font-black transition-all text-[15px] shadow-[0_5px_15px_rgba(0,0,0,0.6)] border-b-[4px] hover:border-b-[2px] hover:translate-y-[2px]">營地休整 (儲存並回城)</button>
          <button @click="confirmExit('abandon')" class="py-3.5 rounded-sm border-2 border-[#8B0000] bg-[#3E1010] hover:bg-[#8B0000] text-[#FFD700] hover:text-white font-black transition-all text-[15px] shadow-md border-b-[4px] hover:border-b-[2px] hover:translate-y-[2px]">逃離深淵 (放棄進度)</button>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="showGameOverModal" class="absolute inset-0 z-[120] flex items-center justify-center bg-black/95 backdrop-blur-md">
        <div class="w-[550px] bg-[#1A0F0A] border-[6px] border-double border-[#8B0000] rounded-sm p-9 flex flex-col gap-7 text-center shadow-[0_0_50px_rgba(139,0,0,0.5)]">
          <div class="text-6xl drop-shadow-[0_5px_10px_rgba(255,0,0,0.5)]">💀</div>
          <h3 class="text-[#FF0000] font-black text-3xl tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">靈魂消散 (討伐失敗)</h3>
          <div class="flex flex-col gap-4 mt-4">
            <button @click="handleRetry" class="py-4 bg-[#8B0000] hover:bg-[#A52A2A] text-[#FFD700] font-black rounded-sm border-2 border-[#DAA520] border-b-[4px] hover:border-b-[2px] hover:translate-y-[2px] active:border-b-[2px] active:translate-y-[2px] shadow-lg tracking-widest">🔄 重燃靈魂 (重置並回第 1 階)</button>
            <button @click="handleExitToLobby" class="py-4 border-2 border-[#593922] bg-[#1C110C] hover:bg-[#2A1810] text-[#A08060] hover:text-[#F5DEB3] font-black rounded-sm tracking-widest transition-colors">🚪 撤退 (返回公會大廳)</button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="fade-slide-down">
      <div v-if="radarBoss" 
           class="absolute top-[64px] left-1/2 transform -translate-x-1/2 z-[100] w-[600px] pointer-events-none flex flex-col items-center">
        
        <div class="text-center mb-1 bg-[#110A07]/90 px-10 py-1 rounded-full border border-red-900/60 shadow-[0_0_20px_rgba(185,28,28,0.9)] backdrop-blur-md relative overflow-visible">
          <span class="text-[#FF0000] font-black text-3xl tracking-[0.18em] drop-shadow-[0_3px_5px_rgba(0,0,0,1)]" 
                style="text-shadow: 0 0 20px rgba(255, 0, 0, 0.9);">
            {{ radarBoss.symbol }} {{ radarBoss.name }} {{ radarBoss.symbol }}
          </span>
          <div class="absolute top-1/2 left-0 w-1/4 h-[1px] bg-red-900 -translate-x-1/2"></div>
          <div class="absolute top-1/2 right-0 w-1/4 h-[1px] bg-red-900 translate-x-1/2"></div>
        </div>
        
        <div class="w-full bg-[#110A07]/95 border-[4px] border-[#8B0000] rounded-sm p-1.5 shadow-[0_8px_30px_rgba(139,0,0,0.7)] backdrop-blur-sm">
          <div class="w-full h-5 bg-[#1C110C] rounded-sm overflow-hidden relative border border-black shadow-inner">
            <div class="h-full bg-gradient-to-r from-[#8B0000] via-[#FF0000] to-[#8B0000] transition-all duration-300 ease-out relative"
                 :style="{ width: `${Math.max(0, (radarBoss.hp / radarBoss.maxHp) * 100)}%` }">
                 <div class="absolute top-0 left-0 w-full h-[30%] bg-white/20"></div>
            </div>
          </div>
        </div>
        
        <div class="w-full flex justify-between text-[14px] text-[#F5DEB3] font-mono mt-1 px-4 drop-shadow-[0_1px_1px_rgba(0,0,0,1)] font-bold">
          <span class="bg-[#110A07]/80 px-3 py-0.5 rounded-full backdrop-blur-sm">HP: {{ radarBoss.hp }} / {{ radarBoss.maxHp }}</span>
          <span class="text-[#FF7F50] bg-[#110A07]/80 px-3 py-0.5 rounded-full backdrop-blur-sm">⚔️ 攻擊力: {{ radarBoss.damage }}</span>
        </div>
      </div>
    </transition>

    <header class="h-[76px] flex items-center justify-between px-8 border-b-[4px] border-[#3A2318] bg-[#150C08] shrink-0 relative z-10 shadow-[0_5px_15px_rgba(0,0,0,0.8)]">
      <div class="flex items-center gap-6 relative z-10">
        <button @click="showMenu = true" class="px-5 py-2.5 rounded-sm border-2 border-[#593922] bg-[#2A1810] hover:bg-[#3A2318] text-[#F5DEB3] text-[14px] font-black transition-all shadow-[0_4px_6px_rgba(0,0,0,0.4)] border-b-[4px] hover:border-b-[2px] hover:translate-y-[2px] flex items-center gap-2">
          <span>⚙️</span> 紮營休息
        </button>
        
        <div class="flex items-center justify-center px-5 py-2 rounded-full border-2 border-[#D4AF37] bg-gradient-to-b from-[#2A1810] to-[#150C08] shadow-[0_0_10px_rgba(212,175,55,0.2)]">
          <span class="text-xl font-black text-[#C8B693] tracking-widest mr-2">深淵地下</span>
          <span class="text-xl font-black text-[#FFD700] drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">{{ floor }} <span class="text-sm">F</span></span>
        </div>
      </div>

      <div class="flex items-center bg-[#0F0805] px-6 py-2.5 rounded-full border-2 border-[#593922] shadow-[inset_0_2px_5px_rgba(0,0,0,1)] relative z-10">
        <div class="flex flex-col justify-center min-w-[220px] border-r-2 border-[#3A2318] pr-6 mr-6">
          <div class="flex justify-between items-end mb-1.5 gap-5">
            <span class="text-[#FFD700] font-black text-xl drop-shadow-[0_2px_2px_rgba(0,0,0,1)] tracking-wider leading-none">Lv.{{ level }}</span>
            <span class="text-[11px] text-[#C8B693] font-mono font-bold tracking-widest leading-none mb-[1px]">{{ xp }} / 1000</span>
          </div>
          <div class="w-full h-2.5 bg-[#150C08] border border-[#593922] rounded-full shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)] relative overflow-hidden p-[1px]">
            <div class="h-full bg-gradient-to-r from-[#2E8B57] to-[#3CB371] rounded-full transition-all duration-500 relative" 
                :style="{ width: (xp / 1000 * 100) + '%' }">
              <div class="absolute top-0 left-0 w-full h-[40%] bg-white/20 rounded-full"></div>
            </div>
          </div>
        </div>
        
        <div class="flex items-center gap-2">
          <span class="text-[22px] drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">🪙</span>
          <span class="text-2xl font-mono font-black text-[#FFD700] drop-shadow-[0_2px_2px_rgba(0,0,0,1)] tracking-wider">{{ coins }}</span>
        </div>
      </div>
    </header>

    <main class="flex-1 flex overflow-hidden p-3 gap-3 relative z-10">
      
      <aside class="w-[280px] bg-[#1C110C] border-4 border-[#3A2318] rounded-sm flex flex-col gap-6 p-5 overflow-y-auto custom-scrollbar shadow-[inset_0_0_20px_rgba(0,0,0,1)] z-10">
        <div>
          <div class="text-[12px] font-black text-[#DAA520] uppercase tracking-widest mb-3.5 border-b-2 border-[#593922] pb-1.5 drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">Quest Objective</div>
          <div class="text-[15px] font-bold text-[#F5DEB3] leading-relaxed whitespace-pre-line bg-[#0F0805] p-3.5 rounded-sm border border-[#3A2318] shadow-[inset_0_2px_5px_rgba(0,0,0,1)]">
            {{ currentObjective || '解讀古老石碑中...' }}
          </div>
        </div>

        <div>
          <div class="text-[12px] font-black text-[#8B0000] uppercase tracking-widest mb-3.5 border-b-2 border-[#8B0000]/50 pb-1.5 drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">Adventurer Status</div>
          <div class="space-y-3.5 bg-[#0F0805] p-3.5 rounded-sm border border-[#3A2318] shadow-[inset_0_2px_5px_rgba(0,0,0,1)]">
            <div v-for="stat in stats" :key="stat.label" class="flex flex-col gap-2">
              <div class="flex justify-between items-end leading-none">
                <span class="text-[12px] font-black italic drop-shadow-[0_1px_1px_rgba(0,0,0,1)]" :style="{ color: stat.colorClass.replace('text-', '') }">
                  {{ stat.label === 'HP' ? '❤️ HP' : (stat.label === 'MP' ? '🔮 MP' : '⚡ AP') }}
                </span>
                <span class="text-[12px] font-black text-[#FFF8DC] drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">{{ stat.val }} / {{ stat.max }}</span>
              </div>
              <div class="w-full h-2.5 bg-[#1C110C] border border-black rounded-full overflow-hidden shadow-inner">
                <div class="h-full transition-all relative" :class="stat.bgClass" :style="{ width: (stat.val / stat.max * 100) + '%' }">
                  <div class="absolute top-0 left-0 w-full h-[30%] bg-white/20"></div>
                </div>
              </div>
            </div>
            <div class="flex justify-between items-center bg-[#3E1010] border border-[#8B0000] px-3.5 py-2.5 rounded-sm mt-3 shadow-inner">
              <span class="text-[12px] font-black text-[#FF7F50] italic drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">⚔️ 攻擊力 (ATK)</span>
              <span class="text-[15px] font-black text-[#FFD700] drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">{{ attack || 10 }}</span>
            </div>
          </div>
        </div>

        <div>
          <div class="text-[12px] font-black text-[#8FBC8F] uppercase tracking-widest mb-3.5 border-b-2 border-[#4A5D23] pb-1.5 flex justify-between items-end drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">
            <span>Adventurer's Pouch</span>
            <transition name="fade">
              <span v-if="actionMessage" class="text-[#FFD700] normal-case text-[11px] font-bold">{{ actionMessage }}</span>
            </transition>
          </div>
          
          <div class="flex flex-col gap-3 bg-[#0F0805] p-2.5 rounded-sm border border-[#3A2318] shadow-[inset_0_2px_5px_rgba(0,0,0,1)] min-h-[66px] max-h-[240px] overflow-y-auto custom-scrollbar">
            <div v-if="consumableItems.length === 0" class="py-7 text-[12px] text-[#593922] text-center flex items-center justify-center font-black tracking-widest">
              行囊內無可用秘藥
            </div>
            
            <button
              v-for="item in consumableItems"
              :key="item.id"
              @click="useItem(item)"
              class="relative group bg-[#1C110C] border-2 border-[#3A2318] hover:border-[#8FBC8F] rounded-sm p-3.5 flex items-center gap-4.5 transition-all duration-300 ease-out active:scale-95 text-left transform-gpu hover:scale-105 hover:shadow-[0_5px_15px_rgba(0,0,0,0.8)] hover:z-20"
              :title="item.desc"
            >
              <div class="text-4xl shrink-0 group-hover:drop-shadow-[0_0_8px_rgba(143,188,143,0.6)]">{{ item.icon }}</div>
              <div class="flex flex-col flex-1 overflow-hidden">
                <div class="flex justify-between items-center">
                  <span class="text-[14px] font-black text-[#F5DEB3] group-hover:text-[#D1FAB7] truncate drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">{{ item.name }}</span>
                  <span class="text-[11px] text-[#FFD700] font-black bg-[#8B0000] border border-[#593922] px-2 py-0.5 rounded-sm ml-2 shadow-[1px_1px_0_rgba(0,0,0,0.8)]">x{{ item.quantity }}</span>
                </div>
                <span class="text-[11px] font-bold text-[#A08060] truncate mt-1 tracking-tight">{{ item.desc }}</span>
              </div>
            </button>
          </div>
        </div>

        <div v-if="radarNearby && radarNearby.length > 0">
          <div class="text-[12px] font-black text-[#FF7F50] uppercase tracking-widest mb-3.5 border-b-2 border-[#8B0000] pb-1.5 flex items-center gap-2 drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">
            <span class="animate-pulse">📡</span> Hostile Radar
          </div>
          
          <div class="flex flex-col gap-2.5">
            <transition-group name="fade">
              <div v-for="enemy in radarNearby" :key="'enemy-' + enemy.uniqueId" 
                   class="bg-[#0F0805] p-2.5 rounded-sm border border-[#4299E1]/50 shadow-[inset_0_2px_5px_rgba(0,0,0,1)]">
                <div class="flex items-center gap-2 mb-1.5">
                  <span class="text-lg drop-shadow-md">{{ enemy.symbol }}</span>
                  <span class="text-[#63B3ED] font-bold text-[13px] tracking-wider">{{ enemy.name }}</span>
                </div>
                <div class="w-full h-1.5 bg-[#1C110C] rounded-full overflow-hidden mb-1 border border-black shadow-inner">
                  <div class="h-full bg-gradient-to-r from-[#2B6CB0] to-[#4299E1] transition-all duration-300"
                       :style="{ width: `${Math.max(0, (enemy.hp / enemy.maxHp) * 100)}%` }"></div>
                </div>
                <div class="flex justify-between text-[11px] text-[#E2E8F0] font-mono">
                  <span>HP: {{ enemy.hp }} / {{ enemy.maxHp }}</span>
                  <span class="text-[#FC8181]">⚔️ {{ enemy.damage }}</span>
                </div>
              </div>
            </transition-group>
          </div>
        </div>

        <div>
          <div class="text-[12px] font-black text-[#C0C0C0] uppercase tracking-widest mb-3.5 border-b-2 border-[#593922] pb-1.5 drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">Dungeon Info</div>
          <div class="space-y-2.5 bg-[#0F0805] p-3.5 rounded-sm border border-[#3A2318] shadow-[inset_0_2px_5px_rgba(0,0,0,1)]">
            <div class="flex justify-between text-[13px]"><span class="text-[#8C6239] font-black">當前回合</span><span class="text-[#D4AF37] font-black">TURN {{ currentTurn }}</span></div>
            <div class="flex justify-between text-[13px]"><span class="text-[#8C6239] font-black">深淵深度</span><span class="text-[#D4AF37] font-black">B{{ floor * 100 }}m</span></div>
          </div>
        </div>
      </aside>

      <div class="flex-1 bg-black rounded-sm border-[8px] border-[#2A1810] overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,1)] z-0">
        <div class="absolute inset-0 border-2 border-[#593922] pointer-events-none z-10"></div>
        <div id="endless-game-container" class="w-full h-full relative z-0"></div>
      </div>

      <aside class="w-[440px] flex flex-col gap-3 z-10">
        
        <div class="h-[60%] bg-[#1A0F0A] border-4 border-[#3A2318] rounded-sm flex flex-col overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.8)] relative">
          <div class="px-5 py-3 bg-[#150C08] border-b-2 border-[#3A2318] flex justify-between items-center shrink-0 shadow-md">
            <span class="text-[12px] font-black text-[#DAA520] uppercase tracking-widest drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">Grimoire (Spell Weaver)</span>
            <button @click="clearCode" class="text-[11px] font-black text-[#8B0000] hover:text-[#FF0000] transition-colors bg-[#2A1810] px-2 py-1 rounded-sm border border-[#593922]" :disabled="isExecuting">抹除墨水</button>
          </div>
          
          <transition name="fade">
            <div v-if="commandPreview.length > 0" class="bg-[#0F0805] border-b-2 border-[#3A2318] flex gap-2.5 overflow-x-auto custom-scrollbar items-center shrink-0 p-3 shadow-inner">
              <span class="text-[11px] font-black text-[#8C6239] shrink-0 ml-2.5 drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">預計施展:</span>
              <div class="flex gap-2 shrink-0 px-2.5">
                <span v-for="(icon, index) in commandPreview" :key="index" class="w-8 h-8 flex items-center justify-center bg-[#2A1810] border border-[#593922] rounded-sm text-[15px] drop-shadow-[0_2px_2px_rgba(0,0,0,1)] animate-pulse" :style="{ animationDelay: `${index * 0.1}s` }">
                  {{ icon }}
                </span>
              </div>
            </div>
          </transition>

          <div class="flex-1 relative flex overflow-hidden bg-[#150C08]">
            <div ref="lineNumbersRef" class="w-10 bg-[#0F0805] flex flex-col items-center py-5 text-[16px] text-[#593922] font-black font-sans border-r-2 border-[#3A2318] shrink-0 overflow-hidden select-none shadow-inner leading-relaxed">
              <span v-for="n in lineCount" :key="n" class="leading-relaxed">{{ n }}</span>
            </div>
            
            <textarea 
              ref="codeEditor"
              v-model="codeContent" 
              class="flex-1 py-5 px-4 bg-transparent text-[#DAA520] font-sans font-bold tracking-wider text-[16px] resize-none focus:outline-none overflow-y-auto custom-scrollbar leading-relaxed transition-opacity drop-shadow-[0_0_2px_rgba(218,165,32,0.3)]"
              :class="{ 'opacity-50 pointer-events-none': isExecuting }"
              :readonly="isExecuting"
              placeholder="// 於此寫下法術真名..."
              spellcheck="false"
              @scroll="syncScroll"
              @keydown="handleEditorKeyDown" 
              @keyup="checkAutocomplete"
            ></textarea>

            <transition name="fade">
              <div v-if="showSuggestions" class="absolute z-50 bg-[#2A1810] border-2 border-[#DAA520] rounded-sm shadow-[0_5px_15px_rgba(0,0,0,0.8)] pb-1 min-w-[180px] bottom-1 left-14 max-h-[176px] overflow-y-auto custom-scrollbar">
                <div class="px-4 py-2 text-[11px] font-black text-[#DAA520] uppercase tracking-widest border-b border-[#593922] bg-[#150C08] sticky top-0 shadow-md">記憶中的咒語</div>
                
                <div 
                  v-for="s in suggestions" 
                  :key="s" 
                  @mousedown.prevent="applySuggestion(s)" 
                  class="px-5 py-3 text-[14px] font-black text-[#F5DEB3] hover:bg-[#3A2318] hover:text-[#FFD700] cursor-pointer transition-colors"
                >
                  {{ s }}()
                </div>
              </div>
            </transition>
          </div>

          <transition name="fade">
            <div v-if="errorMessage" class="shrink-0 p-5 bg-[#3E1010] border-t-4 border-[#8B0000] text-[#FFD700] shadow-[0_-5px_20px_rgba(139,0,0,0.5)] flex items-start justify-between backdrop-blur-sm z-50">
              <span class="text-[15px] font-black flex-1 mr-4.5 drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">⚠️ {{ errorMessage }}</span>
              <button @click="errorMessage = ''" class="text-[#FF0000] hover:text-white text-[24px] leading-none font-black drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">×</button>
            </div>
          </transition>
        </div>

        <div class="h-[40%] bg-[#1C110C] border-4 border-[#3A2318] rounded-sm flex flex-col overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
          <div class="px-5 py-3 bg-[#0F0805] border-b-2 border-[#3A2318] text-[12px] font-black text-[#A08060] uppercase tracking-widest drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">Spell Archive</div>
          <div class="flex-1 p-4 overflow-y-auto custom-scrollbar" :class="{ 'opacity-50 pointer-events-none': isExecuting }">
            <div v-for="cat in commandCategories" :key="cat.name" class="mb-5">
              <div class="text-[12px] font-black text-[#593922] mb-3 px-1 border-b border-[#3A2318] pb-1 drop-shadow-[0_1px_0_rgba(255,255,255,0.1)]">{{ cat.name }}</div>
              <div class="grid grid-cols-2 gap-2.5">
                <button v-for="cmd in cat.commands" :key="cmd.id" @click="insertCode(cmd.id)" class="text-[13px] font-black py-2.5 px-3 rounded-sm border-2 border-[#3A2318] bg-[#2A1810] hover:bg-[#3A2318] hover:border-[#8C6239] text-[#D7CCC8] hover:text-[#F5DEB3] transition-all flex items-center gap-2.5 shadow-[0_2px_4px_rgba(0,0,0,0.5)] active:translate-y-[1px]">
                  <span class="text-[15px] drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">{{ cmd.icon || '📜' }}</span> {{ cmd.label }}
                </button>
              </div>
            </div>
          </div>
          
          <div class="m-4 flex flex-col gap-3 relative z-20">
            <transition name="fade">
              <div v-if="expectedApCost > props.maxAp" class="text-[#FFD700] text-[12px] font-black text-center bg-[#8B0000] py-2 rounded-sm border-2 border-[#DAA520] flex items-center justify-center gap-2 shadow-[0_0_10px_rgba(139,0,0,0.8)]">
                <span class="animate-pulse drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">⚠️</span> 警告：魔力消耗 ({{ expectedApCost }} AP) 已超出極限，可能導致詠唱失敗！
              </div>
            </transition>

            <div class="flex gap-3">
              <button 
                v-if="isAiming" 
                @click="cancelAiming" 
                class="flex-1 py-4 bg-[#3E1010] border-2 border-[#8B0000] border-b-[4px] hover:bg-[#8B0000] text-[#FF7F50] hover:text-white font-black rounded-sm shadow-lg active:border-b-[2px] active:translate-y-[2px] transition-all text-[16px] tracking-widest"
              >
                🚫 停止詠唱 (取消瞄準)
              </button>
              <button 
                v-else 
                @click="executeCode" 
                class="flex-1 py-4 font-black rounded-sm shadow-[0_10px_20px_rgba(0,0,0,0.8)] active:translate-y-[4px] transition-all text-[16px] tracking-widest border-2 disabled:opacity-50 disabled:cursor-not-allowed" 
                :class="(codeContent.trim() && errorMessage === '' && !isExecuting) 
                  ? 'bg-[#1A365D] text-[#FFF8DC] border-[#4299E1] border-b-[6px] hover:border-b-[2px] hover:translate-y-[4px] hover:bg-[#2A4365]' 
                  : 'bg-[#150C08] text-[#593922] border-[#2A1810] border-b-[2px] translate-y-[4px]'"
                :disabled="!codeContent.trim() || errorMessage !== '' || isExecuting"
              >
                {{ isExecuting ? '✨ 魔法詠唱中...' : 'CAST SPELL (詠唱法術)' }}
              </button>
            </div>
          </div>
        </div>
      </aside>
    </main>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* 滾動條改為木質深棕色系 */
.custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
.custom-scrollbar::-webkit-scrollbar-track { background: rgba(15, 8, 5, 0.8); border-radius: 4px; border-left: 1px solid #2A1810; border-top: 1px solid #2A1810; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #593922; border-radius: 4px; border: 1px solid #3A2318; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #8C6239; }

/* 雷達動畫 */
.fade-slide-up-enter-active, .fade-slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-slide-up-enter-from, .fade-slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-down-enter-active, .fade-slide-down-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); /* 帶點彈性的進場 */
}
.fade-slide-down-enter-from, .fade-slide-down-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-30px);
}
</style>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'; 
import { COMMAND_DICT } from '../../game/config/CommandList.js'; 
import { getRandomRewards } from '../../game/config/RewardList.js';

const props = defineProps({
  floor: Number,
  hp: Number,
  maxHp: Number,
  mp: Number,
  maxMp: Number,
  ap: Number,
  maxAp: Number,
  attack: Number,
  coins: Number,
  level: Number,
  xp: Number,
  totalExp: Number,
  inventory: { type: Array, default: () => [] } ,
});

const emit = defineEmits(['stop', 'abandon', 'init-game', 'execute', 'update-stats', 'floor-cleared', 'update-inventory']);

const showMenu = ref(false); 
const codeContent = ref('');
const codeEditor = ref(null);
const errorMessage = ref("");
const lineNumbersRef = ref(null);
const showClearModal = ref(false);
const showGameOverModal = ref(false);
const currentObjective = ref('');
const isAiming = ref(false);
const pendingCommand = ref(null);
const currentRewards = ref([]);
const currentTurn = ref(1); 
const actionMessage = ref('');
const floorBonusCoins = ref(0);
const isExecuting = ref(false);
const radarBoss = ref(null);
const radarNearby = ref([]);

const handleEnemyRadar = (e) => {
  radarBoss.value = e.detail.boss;
  radarNearby.value = e.detail.nearby || [];
}

const syncStatsToPhaser = () => {
  window.dispatchEvent(new CustomEvent('tower-sync-player-stats', {
    detail: {
      attack: props.attack || 10,
      maxAp: props.maxAp || 10
    }
  }));
};

const consumableItems = computed(() => {
  return (props.inventory || []).filter(item => {
    if (item.id === 'relic_holy_maiden_prayer') return false;
    return item.type === 'consumable';
  });
});

const availableCommands = computed(() => {
  return COMMAND_DICT.filter(cmd => {
    if (!cmd.reqModule) return true;
    return (props.inventory || []).some(i => i.id === cmd.reqModule);
  });
});

const VALID_KEYWORDS = computed(() => {
  const jsKeywords = ['let', 'const', 'var', 'await', 'async', 'return', 'true', 'false', 'p'];
  return [...jsKeywords, ...availableCommands.value.map(c => c.id)];
});

const useItem = (item) => {
  const newInventory = JSON.parse(JSON.stringify(props.inventory || []));
  const itemIndex = newInventory.findIndex(i => i.id === item.id);

  if (item.id === 'relic_holy_maiden_prayer' && isGameStarted.value) {
    alert("聖女的祈禱只能在公會大廳生效，請先撤退至大廳使用。");
    return;
  }

  if (item.id === 'relic_holy_maiden_prayer') {
    const duration = 15 * 60 * 1000; // 15 分鐘
    item.expiresAt = Date.now() + duration;
    // 將這個帶有時效性的道具狀態，寫入資料庫的 inventory
    updateLobbyInventory(item); 
    actionMessage.value = "祈禱生效！EXP 提升 15%";
    return;
  }

  if (itemIndex === -1) return;

  let effectMsg = '';
  if (item.id === 'potion_small') {
    const healAmount = 30;
    emit('update-stats', { hp: Math.min(props.maxHp, props.hp + healAmount) });
    effectMsg = `+${healAmount} HP`;
  } else if (item.id === 'potion_large') {
    const healAmount = 100;
    emit('update-stats', { hp: Math.min(props.maxHp, props.hp + healAmount) });
    effectMsg = `+${healAmount} HP`;
  } else if (item.id === 'ap_battery') {
    const apRestore = 20;
    emit('update-stats', { ap: Math.min(props.maxAp, props.ap + apRestore) });
    effectMsg = `+${apRestore} AP`;
  } else {
    window.dispatchEvent(new CustomEvent('use-battle-item', { detail: { itemId: item.id } }));
    effectMsg = `使用 ${item.name}`;
  }

  newInventory[itemIndex].quantity -= 1;
  if (newInventory[itemIndex].quantity <= 0) {
    newInventory.splice(itemIndex, 1);
  }

  emit('update-inventory', newInventory);

  actionMessage.value = effectMsg;
  setTimeout(() => { actionMessage.value = ''; }, 2000);
};

const stats = computed(() => [
  { label: 'HP', val: props.hp, max: props.maxHp, bgClass: 'bg-rose-500 shadow-[0_0_8px_#ef4444]', colorClass: 'text-rose-500' },
  { label: 'MP', val: props.mp, max: props.maxMp, bgClass: 'bg-cyan-500 shadow-[0_0_8px_#06b6d4]', colorClass: 'text-cyan-500' },
  { label: 'AP', val: props.ap, max: props.maxAp, bgClass: 'bg-fuchsia-500 shadow-[0_0_8px_#d946ef]', colorClass: 'text-fuchsia-500' },
]);

const confirmExit = (type) => {
  showMenu.value = false;
  if (type === 'save') { emit('stop'); } 
  else if (type === 'abandon') {
    if (confirm('警告：確定要終止連線嗎？目前的層數與局內金幣將會消失！')) { emit('abandon'); }
  }
};

const handleFloorCleared = () => {
  currentRewards.value = getRandomRewards(3);
  showClearModal.value = true;

  floorBonusCoins.value = 30 + (props.floor * 10);
  setTimeout(() => {
    emit('update-stats', { 
      coins: props.coins + floorBonusCoins.value 
    });
    console.log(`🎉 通關第 ${props.floor} 層，獲得獎金 ${floorBonusCoins.value} 💰`);
  }, 500);
};

const selectReward = (reward) => {
  if (!reward.type || reward.type === 'stat') {
    const currentStats = {
      hp: props.hp, maxHp: props.maxHp,
      mp: props.mp, maxMp: props.maxMp,
      ap: props.ap, maxAp: props.maxAp,
      attack: props.attack || 10,
      coins: props.coins, xp: props.xp, level: props.level
    };
    emit('update-stats', reward.apply(currentStats));
  }
  else if (reward.type === 'relic') {
    window.dispatchEvent(new CustomEvent('tower-add-relic', { detail: reward.relicId }));
    actionMessage.value = `安裝晶片: ${reward.name}`;
    setTimeout(() => { actionMessage.value = ''; }, 3000);
  }
  proceedToNextFloor();
};

const proceedToNextFloor = () => {
  showClearModal.value = false;
  codeContent.value = '';
  errorMessage.value = '';
  isExecuting.value = false;
  currentTurn.value = 1;
  emit('floor-cleared'); 
};

const lineCount = computed(() => {
  if (!codeContent.value) return 25;
  const lines = codeContent.value.split('\n').length;
  return Math.max(25, lines);
});

const insertCode = (commandId) => {
  if (isExecuting.value) return; 
  
  const needTargetingSkills = ['attack', 'shoot', 'magic', 'bomb', 'laser', 'dash', 'hack_wall', 'pull', 'boomerang', 'spread_shot'];
  if (needTargetingSkills.includes(commandId)) {
    isAiming.value = true;
    pendingCommand.value = commandId;
    window.dispatchEvent(new CustomEvent('tower-start-targeting'));
    return; 
  }

  let snippet = '';
  if (commandId === 'for') { snippet = `for(let i=0; i < 3; i++){\n  \n}\n`; }
  else if (commandId === 'if') { snippet = `if (isWall(1,0)) {\n  \n}\n`; }
  else if (commandId === 'while') { snippet = `while (isWall(1,0)) {\n  \n}\n`; }
  else if (commandId === 'function') { snippet = `function mySkill() {\n  \n}\n`; }
  else if (commandId === 'isWall') { snippet = `isWall(0, 1);\n`; }
  else if (commandId === 'isEnemy') { snippet = `isEnemy(1, 0);\n`; }
  else if (commandId === 'isGoal') { snippet = `isGoal(0, -1);\n`; }
  else { snippet = `${commandId}();\n`; }
  codeContent.value += snippet;
};

const commandPreview = computed(() => {
  if (!codeContent.value) return [];
  const lines = codeContent.value.split(/[\n;]+/);
  const preview = [];
  
  const iconMap = {
    'moveUp': '↑', 'moveDown': '↓', 'moveLeft': '←', 'moveRight': '→',
    'attack': '⚔️', 'shoot': '🔫', 'wait': '⏳', 'take': '🖐️', 'dash': '⚡',
    'magic': '✨', 'bomb': '💣', 'heal': '💖'
  };

  for (const line of lines) {
    const match = line.match(/([a-zA-Z_0-9]+)\s*\(/);
    if (match && iconMap[match[1]]) {
      preview.push(iconMap[match[1]]);
    }
  }
  return preview;
});

const cancelAiming = () => {
  isAiming.value = false;
  pendingCommand.value = null;
  window.dispatchEvent(new CustomEvent('tower-cancel-targeting'));
};

const handleTargetSelected = (e) => {
  if (isAiming.value && pendingCommand.value) {
    const { dx, dy } = e.detail;
    const argsObj = { dx: dx, dy: dy };
    const argsString = JSON.stringify(argsObj).replace(/"/g, "'").replace(/,/g, ", ");
    codeContent.value += `${pendingCommand.value}(${argsString});\n`;
    isAiming.value = false;
    pendingCommand.value = null;
  }
};

const handleObjectiveUpdate = (e) => {
  currentObjective.value = e.detail;
};

const clearCode = () => {
  if (isExecuting.value) return;
  codeContent.value = '';
  errorMessage.value = '';
};

const expectedApCost = computed(() => {
  if (!codeContent.value) return 0;
  let total = 0;
  const lines = codeContent.value.split(/[\n;]+/).map(cmd => cmd.trim()).filter(cmd => cmd);
  
  lines.forEach(cmdStr => {
    const match = cmdStr.match(/^([a-zA-Z_0-9]+)/); 
    if (match) {
      const id = match[1];
      const dictCmd = COMMAND_DICT.find(c => c.id === id);
      total += dictCmd?.ap || 0;
    }
  });
  return total;
});

const executeCode = () => {
  if (errorMessage.value || isExecuting.value) return;
  const rawCode = codeContent.value.trim();
  if (!rawCode) return;
  
  isExecuting.value = true;
  emit('execute', codeContent.value); 
};

const handleApUpdate = (e) => {
  const { current, max } = e.detail;
  emit('update-stats', { ap: current, maxAp: max });
};

const handleTurnStarted = (e) => {
  isExecuting.value = false; 
  currentTurn.value = e.detail.turn;
  syncStatsToPhaser();
};

const commandCategories = computed(() => {
  const moveIds = ['moveUp', 'moveDown', 'moveLeft', 'moveRight', 'wait', 'dash'];
  const interactIds = ['take', 'open', 'hack_wall'];
  const combatIds = ['attack', 'shoot', 'magic', 'bomb', 'heal', 'laser', 'spread_shot', 'pull', 'boomerang', 'whirlwind'];
  
  return [
    { name: '🏃‍♂️ 移動與動作', theme: 'indigo', open: true, commands: availableCommands.value.filter(c => moveIds.includes(c.id)) },
    { name: '👁️ 條件與感知', theme: 'emerald', open: false, commands: availableCommands.value.filter(c => c.type === 'sensor') },
    { name: '⚙️ 互動與機制', theme: 'amber', open: false, commands: availableCommands.value.filter(c => interactIds.includes(c.id)) },
    { name: '⚔️ 攻擊與戰鬥', theme: 'rose', open: false, commands: availableCommands.value.filter(c => combatIds.includes(c.id)) },
    { name: '🧠 邏輯控制', theme: 'pink', open: false, commands: availableCommands.value.filter(c => c.type === 'logic') }
  ].filter(cat => cat.commands && cat.commands.length > 0);
});

const validateCode = () => {
  errorMessage.value = "";
  if (!codeContent.value) return;
  const codeWithoutComments = codeContent.value.replace(/\/\/.*$/gm, '');
  const words = codeWithoutComments.match(/[a-zA-Z_]+/g) || [];
  const declaredVariables = []; 

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (i > 0 && ['function', 'let', 'const', 'var'].includes(words[i - 1])) {
      declaredVariables.push(word);
      continue;
    }
    if (word.length <= 1) continue;
    
    if (!VALID_KEYWORDS.value.includes(word) && !declaredVariables.includes(word)) {
      errorMessage.value = `❌ 語法錯誤：系統不認識 '${word}' 這個指令。您是不是拼錯了？`;
      return; 
    }
  }
};

const handleRetry = () => {
  showGameOverModal.value = false;
  codeContent.value = '';
  isExecuting.value = false;
  currentTurn.value = 1;

  emit('update-stats', {
    floor: 1,
    hp: 100, 
    maxHp: 100,
    mp: 50,
    maxMp: 50,
    ap: 10,
    maxAp: 10,
    attack: 10,
    coins: props.coins 
  });
  
  window.dispatchEvent(new CustomEvent('tower-retry-game')); 
};

const handleExitToLobby = () => {
  showGameOverModal.value = false;
  emit('abandon'); 
};

watch(codeContent, validateCode);

watch(() => [props.attack, props.maxAp], syncStatsToPhaser, { immediate: true });

watch(() => props.hp, (newHp, oldHp) => {
  if (newHp <= 0 && oldHp > 0 && !showGameOverModal.value) {
    showGameOverModal.value = true;
    isExecuting.value = false; 
    window.dispatchEvent(new CustomEvent('tower-game-over-triggered')); 
  }
});

const showSuggestions = ref(false);
const suggestions = ref([]);
const currentWord = ref("");

const handleEditorKeyDown = async (e) => {
  if (isExecuting.value) return e.preventDefault(); 
  
  const el = e.target;
  const key = e.key;

  if (key === 'Tab') {
    e.preventDefault();
    if (showSuggestions.value && suggestions.value.length > 0) {
      applySuggestion(suggestions.value[0], el);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    codeContent.value = codeContent.value.substring(0, start) + "  " + codeContent.value.substring(end);
    await nextTick();
    el.selectionStart = el.selectionEnd = start + 2;
    return;
  }

  const pairs = { '{': '}', '[': ']', '(': ')', '"': '"', "'": "'" };
  const closeChars = ['}', ']', ')', '"', "'"];
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const text = codeContent.value;

  if (closeChars.includes(key) && text.charAt(start) === key) {
    e.preventDefault(); 
    el.selectionStart = el.selectionEnd = start + 1; 
    return;
  }
  const closeChar = pairs[key];
  if (closeChar) {
    e.preventDefault(); 
    codeContent.value = text.substring(0, start) + key + closeChar + text.substring(end);
    await nextTick();
    el.selectionStart = el.selectionEnd = start + 1; 
  }
};

const checkAutocomplete = (e) => {
  if (isExecuting.value) return; 
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Enter', 'Tab'].includes(e.key)) {
    showSuggestions.value = false;
    return;
  }
  
  const el = codeEditor.value || document.querySelector('textarea');
  if (!el) return;

  const cursorPosition = el.selectionStart;
  const textBeforeCursor = codeContent.value.substring(0, cursorPosition);
  const match = textBeforeCursor.match(/[a-zA-Z_]+$/);
  
  if (match) {
    currentWord.value = match[0];
    if (currentWord.value.length >= 1 && !VALID_KEYWORDS.value.includes(currentWord.value)) {
        suggestions.value = VALID_KEYWORDS.value.filter(k => k.startsWith(currentWord.value));
        showSuggestions.value = suggestions.value.length > 0;
    } else { showSuggestions.value = false; }
  } else { showSuggestions.value = false; }
};

const applySuggestion = (suggestion, targetEl = null) => {
  const el = targetEl || codeEditor.value || document.querySelector('textarea');
  if (!el) return; 
  
  const cursorPosition = el.selectionStart;
  const textBeforeCursor = codeContent.value.substring(0, cursorPosition);
  const textAfterCursor = codeContent.value.substring(cursorPosition);
  const newTextBefore = textBeforeCursor.replace(/[a-zA-Z_]+$/, suggestion);
  
  const isKeyword = ['function', 'let', 'const', 'for', 'while', 'if', 'else', 'await'].includes(suggestion);
  const appendText = isKeyword ? ' ' : '()';

  codeContent.value = newTextBefore + appendText + textAfterCursor;
  showSuggestions.value = false;

  nextTick(() => {
    const newCursorPos = newTextBefore.length + (isKeyword ? 1 : 1);
    el.selectionStart = el.selectionEnd = newCursorPos;
    el.focus();
    validateCode(); 
  });
};

const syncScroll = (e) => {
  if (lineNumbersRef.value) {
    lineNumbersRef.value.scrollTop = e.target.scrollTop;
  }
};

// 🌟 確保只有這一個處理金幣的函數
const handleCoinCollected = (e) => {
  let addCoin = e.detail.amount || 5;
  let newCoins = (props.coins || 0) + addCoin;
  emit('update-stats', { coins: newCoins });
};

// 🌟 確保只有這一個處理經驗值的函數
const handleXpGained = (e) => {
  let baseExp = e.detail.amount || 15;
  let multiplier = 1.0;
  
  const currentInventory = props.inventory || []; 

  if (currentInventory.some(i => i.id === 'relic_goddess_blessing')) multiplier += 0.25;
  const tempBuff = currentInventory.find(i => i.id === 'relic_holy_maiden_prayer');
  if (tempBuff && tempBuff.expiresAt > Date.now()) {
      multiplier += 0.15;
  }

  let finalExp = Math.floor(baseExp * multiplier);
  
  let newXp = (props.xp || 0) + finalExp;
  let newTotalExp = (props.totalExp || 0) + finalExp; 
  let newLevel = props.level || 1;
  let xpThreshold = 1000; 

  if (newXp >= xpThreshold) {
    const levelsGained = Math.floor(newXp / xpThreshold);
    newLevel += levelsGained;
    newXp = newXp % xpThreshold; 
    
    console.log(`🎉 境界突破！升級至 Lv.${newLevel}`);
    
    emit('update-stats', { 
      xp: newXp, 
      totalExp: newTotalExp,
      level: newLevel, 
      hp: props.maxHp, 
      mp: props.maxMp 
    });
  } else {
    emit('update-stats', { xp: newXp, totalExp: newTotalExp });
  }
};

// 🌟 把匿名函數提取出來，防止記憶體洩漏 (Memory Leak)
const handlePlayerHurt = (e) => emit('update-stats', { hp: Math.max(0, props.hp - e.detail.damage) });
const handlePlayerHeal = (e) => emit('update-stats', { hp: Math.min(props.maxHp, props.hp + e.detail.amount) });

onMounted(() => {
  emit('init-game');
  // 🌟 所有監聽器都統一在這裡註冊
  window.addEventListener('tower-player-hurt', handlePlayerHurt);
  window.addEventListener('tower-player-heal', handlePlayerHeal);
  window.addEventListener('tower-coin-collected', handleCoinCollected);
  window.addEventListener('tower-xp-gained', handleXpGained);
  window.addEventListener('tower-target-selected', handleTargetSelected);
  window.addEventListener('tower-objective-updated', handleObjectiveUpdate); 
  window.addEventListener('tower-floor-cleared', handleFloorCleared);
  window.addEventListener('tower-update-ap', handleApUpdate);
  window.addEventListener('tower-turn-started', handleTurnStarted);
  window.addEventListener('tower-enemy-radar', handleEnemyRadar);
});

onUnmounted(() => {
  // 🌟 確保在組件銷毀時，所有註冊過的事件都能正確無誤地被移除！
  window.removeEventListener('tower-player-hurt', handlePlayerHurt);
  window.removeEventListener('tower-player-heal', handlePlayerHeal);
  window.removeEventListener('tower-target-selected', handleTargetSelected);
  window.removeEventListener('tower-objective-updated', handleObjectiveUpdate); 
  window.removeEventListener('tower-floor-cleared', handleFloorCleared);
  window.removeEventListener('tower-coin-collected', handleCoinCollected);
  window.removeEventListener('tower-xp-gained', handleXpGained);
  window.removeEventListener('tower-update-ap', handleApUpdate);
  window.removeEventListener('tower-turn-started', handleTurnStarted);
  window.removeEventListener('tower-enemy-radar', handleEnemyRadar);
});
</script>