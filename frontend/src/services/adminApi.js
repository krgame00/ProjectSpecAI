import router from '../router'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toast'

export const API_BASE = import.meta.env.VITE_API_BASE
  || (import.meta.env.PROD ? 'https://projectspecai.onrender.com/api/v1' : 'http://localhost:3001/api/v1')

export class AdminApiError extends Error {
  constructor(message, status = 0, sessionExpired = false) {
    super(message)
    this.name = 'AdminApiError'
    this.status = status
    this.sessionExpired = sessionExpired
  }
}

async function parseResponse(response) {
  if (response.status === 204) return null
  const type = response.headers?.get?.('content-type') || ''
  if (type.includes('application/json') || typeof response.json === 'function') {
    try { return await response.json() } catch { return null }
  }
  if (typeof response.text === 'function') return (await response.text()) || null
  return null
}

export async function adminRequest(path, options = {}) {
  const auth = useAuthStore()
  const headers = { ...(options.headers || {}) }
  if (auth.token) headers.Authorization = `Bearer ${auth.token}`
  let body = options.body
  if (body != null && !(body instanceof FormData) && typeof body !== 'string') {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json'
    body = JSON.stringify(body)
  }

  let response
  try {
    response = await fetch(`${API_BASE}${path}`, { ...options, headers, body })
  } catch (error) {
    throw new AdminApiError(error?.message || 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้')
  }
  const data = await parseResponse(response)
  if (response.ok) return data

  const sessionExpired = response.status === 401 || response.status === 403
  const message = data?.error || data?.message || (typeof data === 'string' ? data : `คำขอล้มเหลว (${response.status})`)
  if (sessionExpired) {
    auth.logout()
    useToastStore().error('Session Admin หมดอายุ กรุณาเข้าสู่ระบบใหม่')
    await router.replace({ name: 'landing', query: { login: 'required' } })
  }
  throw new AdminApiError(message, response.status, sessionExpired)
}

export function adminErrorMessage(error, fallback) {
  return error instanceof AdminApiError && error.message ? error.message : fallback
}
