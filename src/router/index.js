import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue')
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/views/Dashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/player',
      name: 'Player',
      component: () => import('@/views/Player.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('@/views/Settings.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// 路由守衛
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // 等待初始化完成
  if (!authStore.isInitialized) {
    // 如果還沒初始化，先讓路由通過，App.vue 會處理跳轉
    next()
    return
  }
  
  // 需要認證的路由
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } 
  // 已登入使用者訪問登入頁面，重定向到 dashboard
  else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/dashboard')
  } 
  else {
    next()
  }
})

export default router

