import { describe, expect, test } from 'vitest'
import { articleExcerpt, formatArticleDate, sanitizeArticleHtml } from '../src/utils/articleContent'

describe('article content utilities', () => {
  test('keeps supported formatting and removes executable markup', () => {
    const html = '<h2>หัวข้อ</h2><p onclick="alert(1)">เนื้อหา</p><script>alert(1)</script><a href="javascript:alert(1)">ลิงก์</a>'
    const safe = sanitizeArticleHtml(html)
    expect(safe).toContain('<h2>หัวข้อ</h2>')
    expect(safe).not.toMatch(/script|onclick|javascript:/i)
  })

  test('removes rich-content images without non-empty alternative text', () => {
    const safe = sanitizeArticleHtml([
      '<img src="missing.jpg">',
      '<img src="empty.jpg" alt="">',
      '<img src="blank.jpg" alt="   ">',
      '<img src="kept.jpg" alt="แผนผังการติดตั้ง CPU">'
    ].join(''))
    const template = document.createElement('template')
    template.innerHTML = safe

    const images = [...template.content.querySelectorAll('img')]
    expect(images).toHaveLength(1)
    expect(images[0].getAttribute('src')).toBe('kept.jpg')
    expect(images[0].getAttribute('alt')).toBe('แผนผังการติดตั้ง CPU')
  })

  test('removes ARIA attributes outside the explicit rich-content allowlist', () => {
    const safe = sanitizeArticleHtml('<p aria-label="Spoofed label" aria-hidden="true">Visible copy</p>')

    expect(safe).toBe('<p>Visible copy</p>')
  })

  test('adds trusted named table regions only after stripping author focus and ARIA', () => {
    const safe = sanitizeArticleHtml([
      '<div class="article-table-scroll" tabindex="7" role="application" aria-label="Spoofed wrapper">',
      '<table class="author-table" tabindex="9" role="presentation" aria-label="Spoofed table">',
      '<tbody><tr><td>Specification</td></tr></tbody>',
      '</table></div>'
    ].join(''))
    const template = document.createElement('template')
    template.innerHTML = safe

    const regions = [...template.content.querySelectorAll('.article-table-scroll')]
    const table = template.content.querySelector('table')

    expect(regions).toHaveLength(1)
    expect(regions[0].getAttribute('tabindex')).toBe('0')
    expect(regions[0].getAttribute('role')).toBe('region')
    expect(regions[0].getAttribute('aria-label')).toBe('ตารางข้อมูลบทความ 1')
    expect(regions[0].querySelector('table')).toBe(table)
    expect(table?.hasAttribute('class')).toBe(false)
    expect(table?.hasAttribute('tabindex')).toBe(false)
    expect(table?.hasAttribute('role')).toBe(false)
    expect(table?.hasAttribute('aria-label')).toBe(false)
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
