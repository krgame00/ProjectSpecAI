import { setActivePinia, createPinia } from 'pinia'
import { expect, test, beforeEach, afterEach, describe, vi } from 'vitest'
import { useChatbotStore } from '../src/stores/chatbot'
import { useAuthStore } from '../src/stores/auth'

const sseResponse = (...events) => {
  const bytes = new TextEncoder().encode(`${events.join('\n')}\n`)
  let delivered = false

  return {
    ok: true,
    status: 200,
    body: {
      getReader: () => ({
        read: async () => {
          if (delivered) return { done: true, value: undefined }
          delivered = true
          return { done: false, value: bytes }
        }
      })
    }
  }
}

const chunkedSseResponse = (...chunks) => {
  const encodedChunks = chunks.map((chunk) => new TextEncoder().encode(chunk))
  let index = 0

  return {
    ok: true,
    status: 200,
    body: {
      getReader: () => ({
        read: async () => {
          if (index >= encodedChunks.length) return { done: true, value: undefined }
          return { done: false, value: encodedChunks[index++] }
        }
      })
    }
  }
}

const httpError = (status) => ({ ok: false, status })

describe('Chatbot Store Tests', () => {
  beforeEach(() => {
    const values = new Map()
    vi.stubGlobal('localStorage', {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, String(value)),
      removeItem: (key) => values.delete(key),
      clear: () => values.clear()
    })
    setActivePinia(createPinia())
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  test('chatbot store initial state', () => {
    const chat = useChatbotStore()
    expect(chat.isOpen).toBe(false)
    expect(chat.isTyping).toBe(false)
    expect(chat.history).toHaveLength(1)
    expect(chat.history[0].role).toBe('bot')
  })

  test('toggle chat', () => {
    const chat = useChatbotStore()
    chat.toggle()
    expect(chat.isOpen).toBe(true)
    chat.toggle()
    expect(chat.isOpen).toBe(false)
  })

  test('addMessage appends to history', () => {
    const chat = useChatbotStore()
    chat.addMessage('user', 'hello')
    expect(chat.history).toHaveLength(2)
    expect(chat.history[1].text).toBe('hello')
  })

  test('clear resets to initial state', () => {
    const chat = useChatbotStore()
    chat.addMessage('user', 'hello')
    chat.clear()
    expect(chat.history).toHaveLength(1)
    expect(chat.history[0].role).toBe('bot')
  })

  test('sends the member JWT in every chatbot request', async () => {
    const auth = useAuthStore()
    auth.setUser({ id: 7 }, 'member.jwt')
    fetch.mockResolvedValue(sseResponse('event: text\ndata: {"text":"ok"}'))

    await useChatbotStore().processBotResponse('hello')

    expect(fetch).toHaveBeenCalledOnce()
    expect(fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer member.jwt')
    expect(fetch.mock.calls[0][1].headers['Content-Type']).toBe('application/json')
  })

  test('does not call fetch and explains login is required when token is absent', async () => {
    const chat = useChatbotStore()

    await chat.processBotResponse('hello')

    expect(fetch).not.toHaveBeenCalled()
    expect(chat.history).toHaveLength(2)
    expect(chat.history.at(-1)).toMatchObject({ role: 'bot' })
    expect(chat.history.at(-1).text).toMatch(/เข้าสู่ระบบ|login/i)
  })

  test('logs out and removes the saved session after HTTP 401', async () => {
    const auth = useAuthStore()
    auth.setUser({ id: 7 }, 'expired.jwt')
    localStorage.setItem('chatbot_session_id', 'owned-session')
    fetch.mockResolvedValue(httpError(401))
    const chat = useChatbotStore()

    await chat.processBotResponse('hello')

    expect(auth.token).toBeNull()
    expect(localStorage.getItem('chatbot_session_id')).toBeNull()
    expect(chat.history).toHaveLength(2)
    expect(chat.history.at(-1).text).toMatch(/หมดอายุ|expired/i)
  })

  test('uses only a saved server session and omits sessionId when none exists', async () => {
    const auth = useAuthStore()
    auth.setUser({ id: 7 }, 'member.jwt')
    const randomUUID = vi.fn()
    vi.stubGlobal('crypto', { randomUUID })
    fetch
      .mockResolvedValueOnce(sseResponse('event: text\ndata: {"text":"first"}'))
      .mockResolvedValueOnce(sseResponse('event: text\ndata: {"text":"second"}'))
    const chat = useChatbotStore()

    localStorage.setItem('chatbot_session_id', 'server-session')
    await chat.processBotResponse('with session')
    localStorage.removeItem('chatbot_session_id')
    await chat.processBotResponse('without session')

    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({
      text: 'with session',
      image: null,
      sessionId: 'server-session'
    })
    expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual({
      text: 'without session',
      image: null
    })
    expect(randomUUID).not.toHaveBeenCalled()
  })

  test('retries one stale session without sessionId and stores the replacement session', async () => {
    const auth = useAuthStore()
    auth.setUser({ id: 7 }, 'member.jwt')
    localStorage.setItem('chatbot_session_id', 'stale-session')
    fetch
      .mockResolvedValueOnce(httpError(404))
      .mockResolvedValueOnce(sseResponse(
        'event: session\ndata: {"sessionId":"replacement-session"}',
        'event: text\ndata: {"text":"recovered"}'
      ))
    const chat = useChatbotStore()

    await chat.processBotResponse('same text', { data: 'aGVsbG8=', mimeType: 'image/png' })

    expect(fetch).toHaveBeenCalledTimes(2)
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({
      text: 'same text',
      image: { data: 'aGVsbG8=', mimeType: 'image/png' },
      sessionId: 'stale-session'
    })
    expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual({
      text: 'same text',
      image: { data: 'aGVsbG8=', mimeType: 'image/png' }
    })
    expect(localStorage.getItem('chatbot_session_id')).toBe('replacement-session')
    expect(chat.history.slice(1)).toEqual([
      expect.objectContaining({ role: 'bot', text: 'recovered' })
    ])
  })

  test('keeps the SSE event type when its data arrives in a later reader chunk', async () => {
    const auth = useAuthStore()
    auth.setUser({ id: 7 }, 'member.jwt')
    fetch.mockResolvedValue(chunkedSseResponse(
      'event: session\n',
      'data: {"sessionId":"chunked-session"}\n'
    ))

    await useChatbotStore().processBotResponse('hello')

    expect(localStorage.getItem('chatbot_session_id')).toBe('chunked-session')
  })

  test('stops after the second 404 and surfaces one error message', async () => {
    const auth = useAuthStore()
    auth.setUser({ id: 7 }, 'member.jwt')
    localStorage.setItem('chatbot_session_id', 'stale-session')
    fetch.mockResolvedValue(httpError(404))
    const chat = useChatbotStore()

    await chat.processBotResponse('hello')

    expect(fetch).toHaveBeenCalledTimes(2)
    expect(localStorage.getItem('chatbot_session_id')).toBeNull()
    expect(chat.history.slice(1)).toHaveLength(1)
    expect(chat.history.at(-1)).toMatchObject({ role: 'bot' })
    expect(chat.history.at(-1).text).toMatch(/ไม่พบ|not found|session/i)
  })
})
