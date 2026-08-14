import DOMPurify from 'dompurify'

const ALLOWED_TAGS = ['p', 'br', 'h2', 'h3', 'h4', 'strong', 'em', 'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'pre', 'code']
const ALLOWED_ATTR = ['href', 'src', 'alt', 'title', 'scope']
const TABLE_REGION_LABEL = 'ตารางข้อมูลบทความ'

export function sanitizeArticleHtml(value) {
  const sanitized = DOMPurify.sanitize(String(value ?? ''), {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false
  })
  const template = document.createElement('template')
  template.innerHTML = sanitized
  template.content.querySelectorAll('img').forEach(image => {
    if (!image.getAttribute('alt')?.trim()) image.remove()
  })
  template.content.querySelectorAll('table').forEach((table, index) => {
    const region = document.createElement('div')
    region.className = 'article-table-scroll'
    region.tabIndex = 0
    region.setAttribute('role', 'region')
    region.setAttribute('aria-label', `${TABLE_REGION_LABEL} ${index + 1}`)
    table.replaceWith(region)
    region.append(table)
  })
  return template.innerHTML
}

export function articleExcerpt(value, maxLength = 180) {
  const template = document.createElement('template')
  template.innerHTML = sanitizeArticleHtml(value)
  const text = (template.content.textContent ?? '').replace(/\s+/g, ' ').trim()
  return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}…` : text
}

export function formatArticleDate(value, options = { year: 'numeric', month: 'long', day: 'numeric' }) {
  if (!value) return '-'
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime())
    ? String(value)
    : new Intl.DateTimeFormat('th-TH', options).format(parsed)
}

export function articleDateTime(value) {
  if (!value) return undefined
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString()
}
