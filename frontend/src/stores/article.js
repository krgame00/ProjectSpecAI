import { defineStore } from 'pinia'
import { adminErrorMessage, adminRequest } from '../services/adminApi'
import { useToastStore } from './toast'

const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.PROD ? 'https://projectspecai.onrender.com/api/v1' : 'http://localhost:3001/api/v1')

export const useArticleStore = defineStore('article', {
  state: () => ({
    articles: [],
    isLoading: false,
    error: null,
    requestGeneration: 0
  }),
  actions: {
    async fetchArticles() {
      const requestGeneration = ++this.requestGeneration
      this.isLoading = true
      this.error = null
      try {
        const res = await fetch(`${API_BASE}/articles`)
        if (!res.ok) throw new Error(`โหลดบทความไม่สำเร็จ (${res.status})`)
        const articles = await res.json()
        if (!Array.isArray(articles)) throw new Error('Invalid article response')
        if (requestGeneration !== this.requestGeneration) return false
        this.articles = articles
        return true
      } catch (error) {
        if (requestGeneration !== this.requestGeneration) return false
        this.error = error instanceof Error ? error.message : 'โหลดบทความไม่สำเร็จ'
        return false
      } finally {
        if (requestGeneration === this.requestGeneration) this.isLoading = false
      }
    },
    async saveArticle(article) {
      const isNew = !article.id
      const url = isNew ? '/articles' : `/articles/${article.id}`
      const method = isNew ? 'POST' : 'PUT'

      try {
        const data = await adminRequest(url, { method, body: article })
        const saved = data?.article || data
        this.requestGeneration += 1
        this.isLoading = false
        if (isNew) this.articles.push(saved)
        else {
          const idx = this.articles.findIndex(a => a.id === article.id)
          if (idx !== -1) this.articles[idx] = saved
        }
        useToastStore().success(isNew ? 'เพิ่มบทความสำเร็จ' : 'บันทึกบทความสำเร็จ')
        return saved
      } catch (err) {
        if (!err?.sessionExpired) useToastStore().error(adminErrorMessage(err, 'บันทึกบทความไม่สำเร็จ'))
        return false
      }
    },
    async deleteArticle(articleId) {
      try {
        await adminRequest(`/articles/${articleId}`, { method: 'DELETE' })
        this.requestGeneration += 1
        this.isLoading = false
        this.articles = this.articles.filter(a => a.id !== articleId)
        useToastStore().success('ลบบทความสำเร็จ')
        return true
      } catch (err) {
        if (!err?.sessionExpired) useToastStore().error(adminErrorMessage(err, 'ลบบทความไม่สำเร็จ'))
        return false
      }
    }
  }
})
