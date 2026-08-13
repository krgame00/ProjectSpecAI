import { setActivePinia, createPinia } from 'pinia'
import { afterEach, expect, test, beforeEach, describe, vi } from 'vitest'
import { useArticleStore } from '../src/stores/article'

describe('Article Store Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => vi.restoreAllMocks())

  test('article store initial state', () => {
    const article = useArticleStore()
    expect(article.articles).toEqual([])
  })

  test('fetchArticles populates articles', async () => {
    const article = useArticleStore()
    global.fetch = () => Promise.resolve({
      ok: true,
      json: () => Promise.resolve([{ id: 1, title: 'Test Article' }])
    })
    await article.fetchArticles()
    expect(article.articles).toHaveLength(1)
    expect(article.articles[0].title).toBe('Test Article')
  })

  test('fetchArticles exposes loading then clears it on success', async () => {
    let finish
    global.fetch = vi.fn(() => new Promise(resolve => { finish = resolve }))
    const store = useArticleStore()
    const request = store.fetchArticles()
    expect(store.isLoading).toBe(true)
    finish({ ok: true, json: async () => [{ id: 1, title: 'Article' }] })
    await expect(request).resolves.toBe(true)
    expect(store.isLoading).toBe(false)
    expect(store.error).toBeNull()
  })

  test('fetchArticles exposes an actionable error for HTTP and network failures', async () => {
    const store = useArticleStore()
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503 })
    await expect(store.fetchArticles()).resolves.toBe(false)
    expect(store.error).toMatch(/503/)
    global.fetch = vi.fn().mockRejectedValue(new Error('offline'))
    await expect(store.fetchArticles()).resolves.toBe(false)
    expect(store.error).toBeTruthy()
  })

  test('deleteArticle removes from local state', async () => {
    const article = useArticleStore()
    article.articles = [{ id: 1, title: 'A' }, { id: 2, title: 'B' }]
    global.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    await article.deleteArticle(1)
    expect(article.articles).toHaveLength(1)
    expect(article.articles[0].id).toBe(2)
  })
})
