import { createRouter, createWebHistory } from 'vue-router'

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
    component: () => import('../views/AdminView.vue')
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
    component: () => import('../views/ProfileView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
