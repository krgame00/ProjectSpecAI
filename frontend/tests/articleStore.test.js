import { setActivePinia, createPinia } from 'pinia'
import { afterEach, expect, test, beforeEach, describe, vi } from 'vitest'
import { useArticleStore } from '../src/stores/article'
import { useAuthStore } from '../src/stores/auth'

const deferred = () => {
  let resolve
  const promise = new Promise(done => { resolve = done })
  return { promise, resolve }
}

const articleResponse = articles => ({
  ok: true,
  json: async () => articles
})

describe('Article Store Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal('localStorage', { getItem: vi.fn(() => null), setItem: vi.fn(), removeItem: vi.fn() })
    useAuthStore().token = 'test-token'
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

  test('keeps the newer fetch result when an older request settles last', async () => {
    const older = deferred()
    const newer = deferred()
    global.fetch = vi.fn()
      .mockReturnValueOnce(older.promise)
      .mockReturnValueOnce(newer.promise)
    const store = useArticleStore()

    const olderRequest = store.fetchArticles()
    const newerRequest = store.fetchArticles()
    newer.resolve(articleResponse([{ id: 2, title: 'Newer' }]))
    await newerRequest
    older.resolve(articleResponse([{ id: 1, title: 'Older' }]))
    await olderRequest

    expect(store.articles).toEqual([{ id: 2, title: 'Newer' }])
    expect(store.error).toBeNull()
  })

  test('keeps loading active when an older fetch settles before the current fetch', async () => {
    const older = deferred()
    const newer = deferred()
    global.fetch = vi.fn()
      .mockReturnValueOnce(older.promise)
      .mockReturnValueOnce(newer.promise)
    const store = useArticleStore()

    const olderRequest = store.fetchArticles()
    const newerRequest = store.fetchArticles()
    older.resolve(articleResponse([{ id: 1, title: 'Older' }]))
    await olderRequest

    expect(store.isLoading).toBe(true)

    newer.resolve(articleResponse([{ id: 2, title: 'Newer' }]))
    await newerRequest
    expect(store.isLoading).toBe(false)
  })

  test('does not let a pending fetch overwrite a successful save', async () => {
    const pendingFetch = deferred()
    global.fetch = vi.fn()
      .mockReturnValueOnce(pendingFetch.promise)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ article: { id: 1, title: 'Saved' } }) })
    const store = useArticleStore()
    store.articles = [{ id: 1, title: 'Before' }]

    const request = store.fetchArticles()
    await store.saveArticle({ id: 1, title: 'Saved' })
    pendingFetch.resolve(articleResponse([{ id: 1, title: 'Before' }]))
    await request

    expect(store.articles).toEqual([{ id: 1, title: 'Saved' }])
  })

  test('does not let a pending fetch restore a successfully deleted article', async () => {
    const pendingFetch = deferred()
    global.fetch = vi.fn()
      .mockReturnValueOnce(pendingFetch.promise)
      .mockResolvedValueOnce({ ok: true })
    const store = useArticleStore()
    store.articles = [{ id: 1, title: 'Delete me' }, { id: 2, title: 'Keep me' }]

    const request = store.fetchArticles()
    await store.deleteArticle(1)
    pendingFetch.resolve(articleResponse([
      { id: 1, title: 'Delete me' },
      { id: 2, title: 'Keep me' }
    ]))
    await request

    expect(store.articles).toEqual([{ id: 2, title: 'Keep me' }])
  })

  test('treats a successful non-array payload as a retryable load error', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ articles: [] }) })
      .mockResolvedValueOnce(articleResponse([{ id: 2, title: 'Recovered' }]))
    const store = useArticleStore()
    store.articles = [{ id: 1, title: 'Existing' }]

    await expect(store.fetchArticles()).resolves.toBe(false)
    expect(store.articles).toEqual([{ id: 1, title: 'Existing' }])
    expect(store.error).toBeTruthy()

    await expect(store.fetchArticles()).resolves.toBe(true)
    expect(store.articles).toEqual([{ id: 2, title: 'Recovered' }])
    expect(store.error).toBeNull()
  })

  test('deleteArticle removes from local state', async () => {
    const article = useArticleStore()
    article.articles = [{ id: 1, title: 'A' }, { id: 2, title: 'B' }]
    global.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    await article.deleteArticle(1)
    expect(article.articles).toHaveLength(1)
    expect(article.articles[0].id).toBe(2)
  })

  test('save and delete return false and preserve article state when the API fails', async () => {
    const store = useArticleStore()
    store.articles = [{ id: 1, title: 'Keep' }]
    global.fetch = vi.fn().mockResolvedValue({
      ok: false, status: 500, headers: { get: () => 'application/json' },
      json: async () => ({ error: 'write failed' })
    })

    await expect(store.saveArticle({ id: 1, title: 'Changed' })).resolves.toBe(false)
    await expect(store.deleteArticle(1)).resolves.toBe(false)
    expect(store.articles).toEqual([{ id: 1, title: 'Keep' }])
  })
})
