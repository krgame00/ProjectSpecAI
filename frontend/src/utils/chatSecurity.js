import { marked } from 'marked'
import DOMPurify from 'dompurify'

marked.setOptions({
  gfm: true,
  breaks: true
})

const coerceDisplayText = (value) => {
  if (value == null) return ''

  try {
    return String(value)
  } catch {
    return ''
  }
}

export const renderSafeMarkdown = (text) => {
  const raw = coerceDisplayText(text)
  if (!raw) return ''

  try {
    const parsed = marked.parse(raw)
    return DOMPurify.sanitize(parsed, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'b', 'i', 'u', 's', 'del', 'code', 'pre',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'blockquote', 'hr', 'span'
      ],
      ALLOWED_ATTR: ['class', 'align']
    })
  } catch {
    return DOMPurify.sanitize(raw)
  }
}

export const toSafeHttpsUrl = (value) => {
  if (typeof value !== 'string') return null

  try {
    const url = new URL(value)
    return url.protocol === 'https:' ? url.href : null
  } catch {
    return null
  }
}

export const sanitizeSources = (sources) => {
  if (!Array.isArray(sources)) return []

  try {
    return sources.flatMap((source) => {
      if (!source || typeof source !== 'object' || Array.isArray(source)) return []

      const uri = toSafeHttpsUrl(source.uri)
      if (!uri) return []

      return [{ uri, title: coerceDisplayText(source.title) }]
    })
  } catch {
    return []
  }
}
