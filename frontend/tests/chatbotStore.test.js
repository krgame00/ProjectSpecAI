import { setActivePinia, createPinia } from 'pinia'
import { expect, test, beforeEach, describe } from 'vitest'
import { useChatbotStore } from '../src/stores/chatbot'

describe('Chatbot Store Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
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
})
