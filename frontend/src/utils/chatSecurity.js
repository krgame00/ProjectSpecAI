const coerceDisplayText = (value) => {
  if (value == null) return ''

  try {
    return String(value)
  } catch {
    return ''
  }
}

export const renderSafeMarkdown = (text) => {
  let html = coerceDisplayText(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
  return html.replace(/\n/g, '<br>')
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
