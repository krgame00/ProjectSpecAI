import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

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
    component: () => import('../components/CheckoutView.vue'),
    meta: { requiresAuth: true }
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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return next({ name: 'landing' })
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'landing' })
  }

  next()
})

export default router
