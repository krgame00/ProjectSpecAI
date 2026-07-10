import { defineStore } from 'pinia'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api/v1'

export const useArticleStore = defineStore('article', {
  state: () => ({
    articles: []
  }),
  actions: {
    async fetchArticles() {
      try {
        const res = await fetch(`${API_BASE}/articles`)
        if (res.ok) {
          this.articles = await res.json()
        }
      } catch (err) {
        console.error('Failed to load articles:', err)
      }
    },
    async saveArticle(article) {
      const isNew = !article.id
      const url = isNew ? `${API_BASE}/articles` : `${API_BASE}/articles/${article.id}`
      const method = isNew ? 'POST' : 'PUT'

      try {
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
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
        const res = await fetch(`${API_BASE}/articles/${articleId}`, { method: 'DELETE' })
        if (res.ok) {
          this.articles = this.articles.filter(a => a.id !== articleId)
        }
      } catch (err) {
        console.error('Failed to delete article', err)
      }
    }
  }
})
