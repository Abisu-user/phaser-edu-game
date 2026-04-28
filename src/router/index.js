import { createRouter, createWebHistory } from 'vue-router';

// 1. 統一引入所有需要的組件 (路徑請根據你實際資料夾位置檢查)
import LandingPage from '../components/lobby/LandingPage.vue';
import LoginScreen from '../components/auth/LoginScreen.vue';
import PlayerDashboard from '../components/lobby/PlayerDashboard.vue';
import GameLevel from '../components/level/GameLevel.vue';
import EndlessLevel from '../components/roguelike/EndlessLevel.vue'; 

// 2. 定義唯一的路由表
const routes = [
  { 
    path: '/', 
    name: 'LandingPage',
    component: LandingPage 
  },
  { 
    path: '/login', 
    name: 'Login',
    component: LoginScreen 
  },
  { 
    path: '/dashboard', 
    name: 'Dashboard',
    component: PlayerDashboard 
  },
  { 
    path: '/level', 
    name: 'Level',
    component: GameLevel 
  },
  { 
    path: '/endless-tower', 
    name: 'EndlessTower',
    component: EndlessLevel 
  }
];

// 3. 建立路由實體
const router = createRouter({
  history: createWebHistory(), 
  routes
});

export default router;