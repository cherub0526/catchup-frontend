import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/Home.vue')
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue')
    },
    {
      path: '/reset-password',
      name: 'ResetPassword',
      component: () => import('@/views/ResetPassword.vue')
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
    },
    {
      path: '/subscription',
      name: 'Subscription',
      component: () => import('@/views/Subscription.vue')
      // meta: { requiresAuth: true } - Removed to allow public access
    },
    {
      path: '/faq',
      name: 'Faq',
      component: () => import('@/views/Faq.vue')
    },
    {
      path: '/privacy-policy',
      name: 'PrivacyPolicy',
      component: () => import('@/views/PrivacyPolicy.vue')
    },
    {
      path: '/terms-of-service',
      name: 'TermsOfService',
      component: () => import('@/views/TermsOfService.vue')
    },
    {
      path: '/cookie-policy',
      name: 'CookiePolicy',
      component: () => import('@/views/CookiePolicy.vue')
    },
    {
      path: '/refund-policy',
      name: 'RefundPolicy',
      component: () => import('@/views/RefundPolicy.vue')
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

