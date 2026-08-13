import { describe, expect, test } from 'vitest'
import { articleExcerpt, formatArticleDate, sanitizeArticleHtml } from '../src/utils/articleContent'

describe('article content utilities', () => {
  test('keeps supported formatting and removes executable markup', () => {
    const html = '<h2>หัวข้อ</h2><p onclick="alert(1)">เนื้อหา</p><script>alert(1)</script><a href="javascript:alert(1)">ลิงก์</a>'
    const safe = sanitizeArticleHtml(html)
    expect(safe).toContain('<h2>หัวข้อ</h2>')
    expect(safe).not.toMatch(/script|onclick|javascript:/i)
  })

  test('turns rich content into a bounded plain-text excerpt', () => {
    expect(articleExcerpt('<p>Alpha <strong>Beta</strong></p>', 10)).toBe('Alpha Beta')
    expect(articleExcerpt(`<p>${'ก'.repeat(20)}</p>`, 10)).toBe(`${'ก'.repeat(10)}…`)
  })

  test('formats valid dates and preserves a supplied fallback', () => {
    expect(formatArticleDate('2026-08-13T00:00:00.000Z')).not.toBe('-')
    expect(formatArticleDate('วันที่เดิม')).toBe('วันที่เดิม')
    expect(formatArticleDate(null)).toBe('-')
  })
})
