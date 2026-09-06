import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toast'

const routes = [
  {
    path: '/',
    name: 'landing',
    component: () => import('../views/LandingView.vue')
  },
  {
    path: '/build',
    name: 'builder',
    component: () => import('../views/BuilderView.vue')
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('../views/AdminView.vue'),
    meta: { requiresAdmin: true }
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: () => import('../components/CheckoutView.vue')
  },
  {
    path: '/articles',
    name: 'articles',
    component: () => import('../components/ArticlesView.vue')
  },
  {
    path: '/article/:id',
    name: 'article-detail',
    component: () => import('../components/ArticleDetailView.vue')
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0, left: 0 }
  }
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    try {
      const toastStore = useToastStore()
      toastStore.warning('คุณไม่มีสิทธิ์เข้าถึงส่วนผู้ดูแลระบบ (Admin Only)')
    } catch (e) {}
    return next({ name: 'landing' })
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    try {
      const toastStore = useToastStore()
      toastStore.info('กรุณาเข้าสู่ระบบก่อนดำเนินการต่อ')
    } catch (e) {}
    return next({ name: 'landing' })
  }

  next()
})

export default router
