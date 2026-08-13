import { defineStore } from 'pinia'

const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.PROD ? 'https://projectspecai.onrender.com/api/v1' : 'http://localhost:3001/api/v1')

function authHeaders() {
  const token = typeof localStorage !== 'undefined' && localStorage.getItem ? localStorage.getItem('token') : null
  return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
}

export const useArticleStore = defineStore('article', {
  state: () => ({
    articles: [],
    isLoading: false,
    error: null
  }),
  actions: {
    async fetchArticles() {
      this.isLoading = true
      this.error = null
      try {
        const res = await fetch(`${API_BASE}/articles`)
        if (!res.ok) throw new Error(`โหลดบทความไม่สำเร็จ (${res.status})`)
        this.articles = await res.json()
        return true
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'โหลดบทความไม่สำเร็จ'
        return false
      } finally {
        this.isLoading = false
      }
    },
    async saveArticle(article) {
      const isNew = !article.id
      const url = isNew ? `${API_BASE}/articles` : `${API_BASE}/articles/${article.id}`
      const method = isNew ? 'POST' : 'PUT'

      try {
        const res = await fetch(url, {
          method,
          headers: authHeaders(),
          body: JSON.stringify(article)
        })
        if (res.ok) {
          const data = await res.json()
          if (isNew) {
            this.articles.push(data.article || article)
          } else {
            const idx = this.articles.findIndex(a => a.id === article.id)
            if (idx !== -1) this.articles[idx] = { ...this.articles[idx], ...article }
          }
        }
      } catch (err) {
        console.error('Failed to save article', err)
      }
    },
    async deleteArticle(articleId) {
      try {
        const res = await fetch(`${API_BASE}/articles/${articleId}`, {
          method: 'DELETE',
          headers: authHeaders()
        })
        if (res.ok) {
          this.articles = this.articles.filter(a => a.id !== articleId)
        }
      } catch (err) {
        console.error('Failed to delete article', err)
      }
    }
  }
})
