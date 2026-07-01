import { createRouter, createWebHistory } from 'vue-router'
import BuilderView from '../views/BuilderView.vue'
import AdminView from '../views/AdminView.vue'
import CheckoutView from '../components/CheckoutView.vue'
import ArticlesView from '../components/ArticlesView.vue'
import ArticleDetailView from '../components/ArticleDetailView.vue'
import ProfileView from '../views/ProfileView.vue'

const routes = [
  {
    path: '/',
    name: 'builder',
    component: BuilderView
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminView
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: CheckoutView
  },
  {
    path: '/articles',
    name: 'articles',
    component: ArticlesView
  },
  {
    path: '/article/:id',
    name: 'article-detail',
    component: ArticleDetailView
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
