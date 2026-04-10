import { createRouter, createWebHistory } from 'vue-router'
import EmailConfirmed from '../components/auth/EmailConfirmed.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/email-confirmed',
      name: 'EmailConfirmed',
      component: EmailConfirmed
    }
  ]
})

export default router