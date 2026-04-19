<template>
  <div class="p-6 relative h-full flex flex-col">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-4">
        <h2 class="text-3xl font-extrabold tracking-tight text-white">社群</h2>
      </div>
      <button @click="showAddModal = true" class="bg-[#00d4aa] text-[#0a0e27] hover:bg-[#00b38f] px-6 py-2.5 rounded-2xl font-bold transition-all flex items-center shadow-[0_0_15px_rgba(0,212,170,0.3)] hover:scale-105">
        新增好友
      </button>
    </div>

    <div v-if="myId" class="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between mb-4">
      <div class="flex items-center space-x-2 overflow-hidden">
        <span class="text-white/50 text-sm whitespace-nowrap">你的 ID :</span>
        <span class="text-[#00d4aa] font-mono text-sm truncate select-all">{{ myId }}</span>
      </div>
      <button @click="copyText(myId)" :class="isCopying ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'" class="ml-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex-shrink-0">
        {{ isCopying ? '已複製！' : '複製' }}
      </button>
    </div>

    <div class="flex space-x-2 mb-6 border-b border-white/10 pb-2">
      <button @click="currentTab = 'friends'" class="px-4 py-2 rounded-lg font-bold transition-all relative" :class="currentTab === 'friends' ? 'text-white' : 'text-white/40'">
        我的好友 ({{ friends.length }})
        <div v-if="currentTab === 'friends'" class="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-[#00d4aa] rounded-full shadow-[0_0_8px_rgba(0,212,170,0.8)]"></div>
      </button>
      <button @click="currentTab = 'requests'" class="px-4 py-2 rounded-lg font-bold transition-all relative flex items-center" :class="currentTab === 'requests' ? 'text-white' : 'text-white/40'">
        好友邀請
        <span v-if="pendingRequests.length > 0" class="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold animate-bounce">{{ pendingRequests.length }}</span>
        <div v-if="currentTab === 'requests'" class="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-[#00d4aa] rounded-full shadow-[0_0_8px_rgba(0,212,170,0.8)]"></div>
      </button>
    </div>
    
    <div v-if="loading" class="flex-1 flex flex-col items-center justify-center">載入中...</div>

    <div v-else-if="currentTab === 'friends'" class="flex-1 overflow-y-auto pr-2 custom-scrollbar">
      <div v-if="friends.length === 0" class="text-center py-12 text-white/50">目前還沒有好友，趕快去新增吧！</div>
      
      <div v-else class="space-y-3">
        <div v-for="friend in friends" :key="friend.id" 
             @click="openProfile(friend)"
             class="bg-white/10 hover:bg-white/15 transition-all p-4 rounded-2xl flex items-center gap-4 border border-white/5 cursor-pointer group">
          
          <div class="relative flex-shrink-0">
            <img :src="friend.avatar_url || '/default-avatar.png'" class="w-14 h-14 rounded-full border-2 object-cover" :class="friend.role === 'teacher' ? 'border-[#ffbb33]' : 'border-white/20'" />
            <div v-if="friend.role !== 'teacher'" :class="['absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-[#151932]', checkOnline(friend.last_login_at) ? 'bg-green-500' : 'bg-gray-500']"></div>
            <div v-else class="absolute -bottom-1 -right-2 bg-[#ffbb33] text-[#0a0e27] text-[10px] px-1.5 py-0.5 rounded font-bold shadow-md">老師</div>
          </div>
          
          <div class="flex-grow">
            <div class="flex items-center space-x-2">
              <div class="font-bold text-lg transition-colors" :class="friend.role === 'teacher' ? 'text-[#ffbb33]' : 'text-white group-hover:text-[#00d4aa]'">{{ friend.username }}</div>
              <div v-if="unreadSenders.includes(friend.id)" class="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></div>
              <div v-if="friend.role !== 'teacher'" class="bg-white/10 text-[10px] px-1.5 py-0.5 rounded-md text-white/70 font-mono">Lv.{{ friend.level || 1 }}</div>
            </div>
            <div class="text-xs mt-1" :class="checkOnline(friend.last_login_at) ? 'text-green-400' : 'text-white/40'">
              {{ friend.role === 'teacher' ? '系統指導教師' : (checkOnline(friend.last_login_at) ? '目前在線上' : `上次上線：${formatLastOnline(friend.last_login_at)}`) }}
            </div>
          </div>
          
          <div class="flex items-center space-x-2">
            <button @click.stop="openChat(friend)" class="bg-white/10 hover:bg-[#00d4aa] hover:text-[#0a0e27] px-4 py-2 rounded-xl text-sm transition-all text-white/90 font-bold shadow-lg">
              查看訊息
            </button>
            <button v-if="friend.role !== 'teacher'" @click.stop="promptDeleteFriend(friend)" class="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors" title="刪除好友">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="currentTab === 'requests'" class="flex-1 overflow-y-auto pr-2 custom-scrollbar">
      <div v-if="pendingRequests.length === 0" class="text-center py-12 text-white/50">沒有好友邀請。</div>
      <div v-else class="space-y-3">
        <div v-for="req in pendingRequests" :key="req.id" class="bg-white/10 p-4 rounded-2xl flex items-center gap-4 border border-[#00d4aa]/30">
          <img :src="req.avatar_url || '/default-avatar.png'" class="w-14 h-14 rounded-full object-cover" />
          <div class="flex-grow">
            <div class="font-bold text-lg text-white">{{ req.username }}</div>
            <div class="text-xs text-white/60">想加您為好友</div>
          </div>
          <div class="flex space-x-2">
            <button @click="rejectRequest(req.id)" class="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors text-sm">拒絕</button>
            <button @click="acceptRequest(req.id)" class="px-4 py-1.5 rounded-lg bg-[#00d4aa] text-[#0a0e27] hover:bg-[#00b38f] font-bold transition-transform text-sm">接受</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" @click.self="closeAddModal">
      <div class="bg-[#151932] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl transform transition-all flex flex-col max-h-[80vh]">
        <div class="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5 flex-shrink-0">
          <h3 class="text-xl font-bold text-white flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#00d4aa] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            尋找玩家
          </h3>
          <button @click="closeAddModal" class="text-white/50 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="p-6 flex flex-col flex-1 overflow-hidden">
          <div class="mb-2 flex-shrink-0">
            <label class="block text-sm font-medium text-white/70 mb-2">請輸入玩家名稱 或 UUID：</label>
            <div class="flex space-x-2">
              <input 
                v-model="searchQuery" 
                @keyup.enter="searchPlayer"
                type="text" 
                placeholder="例如: abisu 或 123e4567-..." 
                class="flex-1 bg-black/30 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#00d4aa] font-mono text-sm"
              />
              <button 
                @click="searchPlayer" 
                :disabled="isSearching"
                class="bg-[#00d4aa] text-[#0a0e27] hover:bg-[#00b38f] px-4 py-2.5 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {{ isSearching ? '搜尋中...' : '搜尋' }}
              </button>
            </div>
            <p v-if="searchError" class="text-red-400 text-sm mt-2 font-medium">{{ searchError }}</p>
          </div>

          <div v-if="searchResults.length > 0" class="mt-4 space-y-3 overflow-y-auto custom-scrollbar pr-2 pb-2 flex-1">
            <div v-for="user in searchResults" :key="user.id" class="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between animate-fade-in">
              <div class="flex items-center space-x-3 overflow-hidden flex-1 pr-2">
                <img :src="user.avatar_url || '/default-avatar.png'" class="w-10 h-10 rounded-full border-2 border-white/20 object-cover flex-shrink-0" />
                <div class="overflow-hidden w-full">
                  <div class="font-bold text-white text-sm truncate">{{ user.username }}</div>
                  <div class="text-[10px] text-white/50">Lv.{{ user.level || 1 }} 玩家</div>
                  <div class="text-[9px] text-[#00d4aa]/70 font-mono truncate select-all mt-0.5" title="點擊選取複製">ID: {{ user.id }}</div>
                </div>
              </div>
              
              <button 
                @click="sendFriendRequest(user)" 
                :disabled="isAlreadyFriend(user.id) || recentlyInvited.has(user.id)"
                :class="isAlreadyFriend(user.id) || recentlyInvited.has(user.id) ? 'bg-white/10 text-white/40 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:scale-105'"
                class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex-shrink-0">
                {{ recentlyInvited.has(user.id) ? '已發送邀請' : (isAlreadyFriend(user.id) ? '已是好友' : '送出邀請') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showProfileModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" @click.self="closeProfile">
      <div class="bg-gradient-to-b from-[#1a1f3c] to-[#0f1225] border border-white/20 rounded-3xl w-full max-w-sm overflow-hidden shadow-[0_0_40px_rgba(0,212,170,0.15)] transform transition-all relative">
        <button @click="closeProfile" class="absolute top-4 right-4 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-2 transition-all z-10">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div class="h-24 bg-[#00d4aa]/20 relative overflow-hidden">
          <div class="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-30"></div>
        </div>

        <div class="px-6 pb-6 relative flex flex-col items-center mt-[-40px]">
          <div class="relative">
            <img :src="selectedProfile.avatar_url || '/default-avatar.png'" class="w-24 h-24 rounded-full border-4 border-[#0f1225] object-cover bg-[#0f1225] shadow-lg" />
            <div :class="['absolute bottom-1 right-1 w-6 h-6 rounded-full border-4 border-[#0f1225]', checkOnline(selectedProfile.last_login_at) ? 'bg-green-500' : 'bg-gray-500']"></div>
          </div>
          
          <h3 class="text-2xl font-extrabold text-white mt-3">{{ selectedProfile.username }}</h3>
          <p class="text-sm" :class="checkOnline(selectedProfile.last_login_at) ? 'text-green-400' : 'text-white/40'">
            {{ checkOnline(selectedProfile.last_login_at) ? '線上' : '離線' }}
          </p>

          <div class="w-full mt-6 space-y-3">
            <div class="bg-white/5 rounded-xl p-3 flex justify-between items-center border border-white/5">
              <span class="text-white/50 text-sm font-medium">玩家 ID</span>
              <div class="flex items-center space-x-2">
                <span class="text-[#00d4aa] font-mono text-xs w-24 truncate">{{ selectedProfile.id }}</span>
                <button @click="copyText(selectedProfile.id)" class="text-white/40 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></button>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-3">
              <div class="bg-white/5 rounded-xl p-4 flex flex-col items-center justify-center border border-white/5">
                <span class="text-white/50 text-xs mb-1">玩家等級</span>
                <span class="text-2xl font-black text-white">Lv.{{ selectedProfile.level || 1 }}</span>
              </div>
              <div class="bg-white/5 rounded-xl p-4 flex flex-col items-center justify-center border border-white/5">
                <span class="text-white/50 text-xs mb-1">通關數量</span>
                <span v-if="isFetchingProfile" class="text-xl animate-pulse text-white/50">...</span>
                <span v-else class="text-2xl font-black text-[#ffbb33]">{{ profileStats.clearedLevels }}</span>
              </div>
            </div>
          </div>

          <div class="w-full mt-6 flex flex-col gap-2">
            <button @click="closeProfile(); openChat(selectedProfile)" class="w-full bg-[#00d4aa] text-[#0a0e27] hover:bg-[#00b38f] py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(0,212,170,0.3)]">
              發送訊息
            </button>
            <button v-if="selectedProfile.role !== 'teacher'" @click="promptDeleteFriend(selectedProfile)" class="w-full bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 py-2.5 rounded-xl font-bold transition-all mt-2 text-sm">
              解除好友關係
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showChatModal" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" @click.self="closeChat">
      <div class="bg-[#151932] border border-white/10 rounded-2xl w-full max-w-lg h-[80vh] flex flex-col shadow-2xl overflow-hidden transform transition-all">
        
        <div class="px-4 py-3 bg-white/5 border-b border-white/10 flex justify-between items-center flex-shrink-0">
          <div class="flex items-center space-x-3">
            <div class="relative">
              <img :src="activeChatFriend.avatar_url || '/default-avatar.png'" class="w-10 h-10 rounded-full border-2 border-white/10 object-cover" />
              <div :class="['absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#151932]', checkOnline(activeChatFriend.last_login_at) ? 'bg-green-500' : 'bg-gray-500']"></div>
            </div>
            <div>
              <div class="font-bold text-white leading-tight">{{ activeChatFriend.username }}</div>
              <div class="text-[10px]" :class="checkOnline(activeChatFriend.last_login_at) ? 'text-green-400' : 'text-white/40'">
                {{ checkOnline(activeChatFriend.last_login_at) ? '線上' : '離線' }}
              </div>
            </div>
          </div>
          <button @click="closeChat" class="text-white/50 hover:text-white p-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div class="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col space-y-4" ref="chatScrollRef">
          <div v-if="chatMessages.length === 0" class="flex-1 flex items-center justify-center flex-col text-white/30 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            <p>這是一段新對話的開始</p>
          </div>
          
          <div v-for="msg in chatMessages" :key="msg.id" 
               class="max-w-[75%] flex flex-col" 
               :class="msg.sender_id === myId ? 'self-end items-end' : 'self-start items-start'">
            
            <div class="px-4 py-2 rounded-2xl text-sm" 
                 :class="[
                   msg.sender_id === myId ? 'bg-[#00d4aa] text-[#0a0e27] rounded-tr-sm' : 
                   (activeChatFriend.role === 'teacher' ? 'bg-[#ffbb33]/10 border border-[#ffbb33]/30 text-[#ffbb33] rounded-tl-sm' : 'bg-white/10 text-white rounded-tl-sm')
                 ]">
              <div v-if="activeChatFriend.role === 'teacher' && msg.sender_id !== myId" class="text-[10px] font-bold mb-1 opacity-80">📢 教師 / 系統通知</div>
              <div class="whitespace-pre-wrap">{{ msg.content }}</div>
            </div>
            <div class="text-[10px] text-white/30 mt-1 px-1">{{ formatChatTime(msg.created_at) }}</div>
          </div>
        </div>

        <div class="p-3 bg-white/5 border-t border-white/10 flex-shrink-0">
          <div v-if="activeChatFriend.role === 'teacher'" class="text-center text-[#a0a0b8] text-sm py-2">
            🔒 此為教師廣播頻道，無法直接回覆
          </div>
          <div v-else class="flex space-x-2">
            <input 
              v-model="newMessage" 
              @keyup.enter="sendMessage"
              type="text" 
              placeholder="輸入訊息..." 
              class="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#00d4aa]/50"
            />
            <button 
              @click="sendMessage" 
              :disabled="!newMessage.trim()"
              class="bg-[#00d4aa] text-[#0a0e27] px-4 rounded-xl font-bold disabled:opacity-50 transition-colors flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transform rotate-90" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
            </button>
          </div>
        </div>

        <div class="p-3 bg-white/5 border-t border-white/10 flex-shrink-0">
          <div class="flex space-x-2">
            <input 
              v-model="newMessage" 
              @keyup.enter="sendMessage"
              type="text" 
              placeholder="輸入訊息..." 
              class="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#00d4aa]/50"
            />
            <button 
              @click="sendMessage" 
              :disabled="!newMessage.trim()"
              class="bg-[#00d4aa] text-[#0a0e27] px-4 rounded-xl font-bold disabled:opacity-50 transition-colors flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transform rotate-90" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
            </button>
          </div>
        </div>

      </div>
    </div>

    <div v-if="showDeleteConfirm" class="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" @click.self="cancelDeleteFriend">
      <div class="bg-[#151932] border border-red-500/30 rounded-2xl w-full max-w-sm p-6 shadow-[0_0_40px_rgba(239,68,68,0.2)] transform transition-all text-center">
        <div class="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 class="text-xl font-bold text-white mb-2">確定解除好友？</h3>
        <p class="text-white/60 text-sm mb-6">您將與 <span class="text-white font-bold">{{ friendToDelete?.username }}</span> 解除好友關係，雙方的好友名單都會被移除，且此操作無法復原。</p>
        
        <div class="flex space-x-3">
          <button @click="cancelDeleteFriend" class="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-bold transition-colors">
            取消
          </button>
          <button @click="executeDeleteFriend" class="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold transition-colors shadow-lg">
            確定刪除
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { supabase } from '../../../supabase';

const currentTab = ref('friends'); 
const friends = ref([]);
const pendingRequests = ref([]); 
const loading = ref(true);
const currentTime = ref(new Date().getTime());
let timer = null;
let friendStatusChannel = null;
let friendshipChannel = null;
let backgroundMessageSubscription = null;

const myId = ref('');
const showAddModal = ref(false);
const searchQuery = ref('');

const searchResults = ref([]);
const isSearching = ref(false);
const searchError = ref('');
const isCopying = ref(false);
const unreadSenders = ref([]);

const recentlyInvited = ref(new Set());

const showProfileModal = ref(false);
const selectedProfile = ref(null);
const profileStats = ref({ clearedLevels: 0 });
const isFetchingProfile = ref(false);

const showChatModal = ref(false);
const activeChatFriend = ref(null);
const chatMessages = ref([]);
const newMessage = ref('');
const chatScrollRef = ref(null);
let messageSubscription = null;

const showDeleteConfirm = ref(false);
const friendToDelete = ref(null);

const fetchData = async () => {
  loading.value = true;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  myId.value = user.id;

  try {
    // 1. 撈取好友 (🌟 記得加上 role 欄位)
    const { data: friendsData } = await supabase
      .from('friendships')
      .select(`friend_id, profiles:friend_id ( id, username, avatar_url, last_login_at, level, role )`)
      .eq('user_id', user.id)
      .eq('status', 'accepted');
      
    let loadedFriends = friendsData ? friendsData.map(item => item.profiles) : [];

    // 2. 撈取好友邀請 (🌟 記得加上 role 欄位)
    const { data: requestsData } = await supabase
      .from('friendships')
      .select(`user_id, profiles:user_id ( id, username, avatar_url, level, role )`)
      .eq('friend_id', user.id)
      .eq('status', 'pending');
    if (requestsData) pendingRequests.value = requestsData.map(item => item.profiles);

    // ==========================================
    // 🌟 3. 新增：撈取曾經傳訊息給我的「老師」，並加入列表
    // ==========================================
    const { data: msgs } = await supabase
      .from('direct_messages')
      .select('sender_id')
      .eq('receiver_id', user.id);

    if (msgs && msgs.length > 0) {
      // 找出所有發送者的 ID
      const senderIds = [...new Set(msgs.map(m => m.sender_id))];
      // 過濾掉已經在好友名單裡的人
      const nonFriendIds = senderIds.filter(id => !loadedFriends.some(f => f.id === id));
      
      if (nonFriendIds.length > 0) {
        // 去 profiles 抓出這些人，而且只抓老師
        const { data: teacherProfiles } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, last_login_at, level, role')
          .in('id', nonFriendIds)
          .eq('role', 'teacher');
          
        if (teacherProfiles) {
          // 將老師加到好友列表的「最上面」
          loadedFriends = [...teacherProfiles, ...loadedFriends];
        }
      }
    }

    friends.value = loadedFriends;

    setupFriendsRealtime();
    setupFriendshipRealtime();
  } catch (error) {
    console.error('獲取資料失敗:', error);
  } finally {
    loading.value = false;
  }
};

const setupFriendsRealtime = () => {
  if (friendStatusChannel) return;
  friendStatusChannel = supabase
    .channel('friend-status')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, (payload) => {
        const updatedProfile = payload.new;
        const index = friends.value.findIndex(f => f.id === updatedProfile.id);
        if (index !== -1) friends.value[index].last_login_at = updatedProfile.last_login_at;
      })
    .subscribe();
};

const setupBackgroundMessageListener = () => {
  if (backgroundMessageSubscription) return;
  // 👇 頻道名稱加上自己的 ID
  backgroundMessageSubscription = supabase
    .channel(`friends-bg-${myId.value}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages' }, (payload) => {
      console.log("【好友背景監聽】收到新訊息", payload.new);
      const msg = payload.new;
      if (msg.receiver_id === myId.value) {
        if (!showChatModal.value || activeChatFriend.value?.id !== msg.sender_id) {
          if (!unreadSenders.value.includes(msg.sender_id)) {
            unreadSenders.value.push(msg.sender_id);
          }
        }
      }
    })
    .subscribe();
};

const setupFriendshipRealtime = () => {
  if (friendshipChannel) return;
  friendshipChannel = supabase
    .channel('friendships-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'friendships' }, () => {
      fetchData(); 
    })
    .subscribe();
};

const checkOnline = (lastLogin) => {
  if (!lastLogin) return false;
  return (currentTime.value - new Date(lastLogin).getTime()) / 60000 <= 5;
};

const formatLastOnline = (lastLogin) => {
  if (!lastLogin) return '從未登入';
  const now = new Date();
  const date = new Date(lastLogin);
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return '剛剛上線';
  if (diffInMinutes < 60) return `${diffInMinutes} 分鐘前`;
  if (diffInHours < 24) return `${diffInHours} 小時前`;
  if (diffInDays === 1) return '昨天';
  if (diffInDays < 7) return `${diffInDays} 天前`;
  return `${date.getMonth() + 1}月${date.getDate()}日`;
};

const formatChatTime = (isoString) => {
  const date = new Date(isoString);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    isCopying.value = true;
    setTimeout(() => { isCopying.value = false; }, 2000);
  } catch (err) {
    console.error('複製失敗:', err);
  }
};

const searchPlayer = async () => { 
  const query = searchQuery.value.trim();
  if (!query) return;
  
  isSearching.value = true; 
  searchError.value = ''; 
  searchResults.value = [];
  
  if (query === myId.value) { 
    searchError.value = '您不能加自己為好友喔！'; 
    isSearching.value = false; 
    return; 
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isUuid = uuidRegex.test(query);
  
  try {
    let data = [];
    if (isUuid) {
      const { data: resData, error } = await supabase.from('profiles').select('id, username, avatar_url, level').eq('id', query).single();
      if (!error && resData) data = [resData];
    } else {
      const { data: resData, error } = await supabase.from('profiles').select('id, username, avatar_url, level').ilike('username', `%${query}%`).limit(10);
      if (!error && resData) data = resData;
    }

    data = data.filter(user => user.id !== myId.value);

    if (data.length === 0) {
      searchError.value = '找不到符合的玩家';
    } else {
      searchResults.value = data;
    }
  } catch (err) { 
    searchError.value = '搜尋失敗，請稍後再試'; 
  } finally { 
    isSearching.value = false; 
  }
};

const isAlreadyFriend = (userId) => {
  return friends.value.some(f => f.id === userId);
};

const sendFriendRequest = async (targetUser) => { 
  try {
    const { data: existing } = await supabase.from('friendships').select('id').eq('user_id', myId.value).eq('friend_id', targetUser.id).single();
    if (existing) { 
      alert('已發送過邀請或是對方已邀請您！'); 
      recentlyInvited.value.add(targetUser.id);
      return; 
    }
    await supabase.from('friendships').insert([{ user_id: myId.value, friend_id: targetUser.id, status: 'pending' }]);
    
    recentlyInvited.value.add(targetUser.id);
    alert(`已向 ${targetUser.username} 發送好友邀請！`);
  } catch (err) { 
    console.error('發送失敗:', err);
    alert('發送失敗，請稍後再試。'); 
  }
};

const acceptRequest = async (senderId) => { 
  await supabase.from('friendships').update({ status: 'accepted' }).eq('user_id', senderId).eq('friend_id', myId.value);
  await supabase.from('friendships').insert([{ user_id: myId.value, friend_id: senderId, status: 'accepted' }]);
};

const rejectRequest = async (senderId) => { 
  await supabase.from('friendships').delete().eq('user_id', senderId).eq('friend_id', myId.value).eq('status', 'pending');
};

const closeAddModal = () => { 
  showAddModal.value = false; 
  searchQuery.value = ''; 
  searchResults.value = []; 
  searchError.value = ''; 
};

const openProfile = async (friend) => {
  selectedProfile.value = friend;
  showProfileModal.value = true;
  isFetchingProfile.value = true;
  try {
    const { count, error } = await supabase
      .from('user_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', friend.id);
    
    profileStats.value.clearedLevels = error ? 0 : (count || 0);
  } catch (err) {
    console.error('獲取進度失敗', err);
  } finally {
    isFetchingProfile.value = false;
  }
};

const closeProfile = () => {
  showProfileModal.value = false;
  selectedProfile.value = null;
};

const promptDeleteFriend = (friend) => {
  friendToDelete.value = friend;
  showDeleteConfirm.value = true;
};

const cancelDeleteFriend = () => {
  showDeleteConfirm.value = false;
  friendToDelete.value = null;
};

const executeDeleteFriend = async () => {
  if (!friendToDelete.value) return;

  try {
    await supabase.from('friendships').delete().match({ user_id: myId.value, friend_id: friendToDelete.value.id });
    await supabase.from('friendships').delete().match({ user_id: friendToDelete.value.id, friend_id: myId.value });
    
    showDeleteConfirm.value = false;
    friendToDelete.value = null;
    if (showProfileModal.value) closeProfile();
    
  } catch (error) {
    console.error('刪除好友失敗:', error);
    alert('刪除失敗，請稍後再試。');
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (chatScrollRef.value) {
      chatScrollRef.value.scrollTop = chatScrollRef.value.scrollHeight;
    }
  });
};

const openChat = async (friend) => {
  activeChatFriend.value = friend;
  showChatModal.value = true;

  unreadSenders.value = unreadSenders.value.filter(id => id !== friend.id);
  
  const { data } = await supabase
    .from('direct_messages')
    .select('*')
    .or(`and(sender_id.eq.${myId.value},receiver_id.eq.${friend.id}),and(sender_id.eq.${friend.id},receiver_id.eq.${myId.value})`)
    .order('created_at', { ascending: true });
    
  chatMessages.value = data || [];
  scrollToBottom();

  if (messageSubscription) supabase.removeChannel(messageSubscription);
  
  messageSubscription = supabase.channel(`chat-${myId.value}-${friend.id}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages' }, (payload) => {
      console.log("【聊天室監聽】收到新訊息", payload.new);
      const msg = payload.new;
      if (msg.sender_id === friend.id && msg.receiver_id === myId.value) {
        chatMessages.value.push(msg);
        scrollToBottom();
      }
    }).subscribe();
};

const closeChat = () => {
  showChatModal.value = false;
  activeChatFriend.value = null;
  if (messageSubscription) {
    supabase.removeChannel(messageSubscription);
    messageSubscription = null;
  }
};

const sendMessage = async () => {
  if (!newMessage.value.trim() || !activeChatFriend.value) return;
  const content = newMessage.value.trim();
  newMessage.value = ''; 
  
  chatMessages.value.push({
    id: 'temp-' + Date.now(), // 給個暫時的 ID
    sender_id: myId.value,
    receiver_id: activeChatFriend.value.id,
    content: content,
    created_at: new Date().toISOString()
  });
  scrollToBottom();

  // 然後才在背景非同步寫入資料庫
  await supabase.from('direct_messages').insert({
    sender_id: myId.value,
    receiver_id: activeChatFriend.value.id,
    content: content
  });
};

onMounted(() => {
  fetchData();
  timer = setInterval(() => { currentTime.value = new Date().getTime(); }, 30000);
  setupBackgroundMessageListener();
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
  if (friendStatusChannel) supabase.removeChannel(friendStatusChannel);
  if (friendshipChannel) supabase.removeChannel(friendshipChannel);
  if (messageSubscription) supabase.removeChannel(messageSubscription);
  if (backgroundMessageSubscription) supabase.removeChannel(backgroundMessageSubscription);
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 212, 170, 0.5); }
</style>