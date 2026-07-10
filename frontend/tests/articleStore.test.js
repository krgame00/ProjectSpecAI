import { setActivePinia, createPinia } from 'pinia'
import { expect, test, beforeEach, describe } from 'vitest'
import { useArticleStore } from '../src/stores/article'

describe('Article Store Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

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

  test('deleteArticle removes from local state', async () => {
    const article = useArticleStore()
    article.articles = [{ id: 1, title: 'A' }, { id: 2, title: 'B' }]
    global.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    await article.deleteArticle(1)
    expect(article.articles).toHaveLength(1)
    expect(article.articles[0].id).toBe(2)
  })
})
