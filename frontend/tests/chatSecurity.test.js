import { describe, expect, test } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ChatbotWindow from '../src/components/ChatbotWindow.vue'
import { useCatalogStore } from '../src/stores/catalog'
import { useChatbotStore } from '../src/stores/chatbot'
import {
  renderSafeMarkdown,
  sanitizeSources,
  toSafeHttpsUrl
} from '../src/utils/chatSecurity'

describe('chat security utilities', () => {
  test('sanitizes executable markup and HTML-sensitive characters safely', () => {
    const input = `<img src=x onerror="alert('x')"><script>alert('hack')</script>`
    const result = renderSafeMarkdown(input)

    expect(result).not.toContain('<script>')
    expect(result).not.toContain('onerror')
  })

  test('retains the supported bold, italic, and newline presentation', () => {
    const result = renderSafeMarkdown('**bold** and *italic*\nnext')
    expect(result).toContain('<strong>bold</strong>')
    expect(result).toContain('<em>italic</em>')
    expect(result).toContain('<br>')
  })

  test('correctly renders GFM Markdown tables', () => {
    const markdownTable = `| Feature | RTX 4060 | RX 7600 |\n| :--- | :--- | :--- |\n| VRAM | 8GB | 8GB |`
    const result = renderSafeMarkdown(markdownTable)

    expect(result).toContain('<table>')
    expect(result).toContain('<thead>')
    expect(result).toContain('<tbody>')
    expect(result).toContain('Feature')
    expect(result).toContain('RTX 4060')
    expect(result).toContain('8GB')
  })

  test.each([
    ['http://example.com', null],
    ['javascript:alert(1)', null],
    ['data:text/html,hello', null],
    ['//example.com/path', null],
    ['not a url', null],
    [42, null],
    [null, null],
    ['https://Example.COM/a/../safe?q=1', 'https://example.com/safe?q=1']
  ])('accepts only canonical HTTPS URLs: %p', (input, expected) => {
    expect(toSafeHttpsUrl(input)).toBe(expected)
  })

  test('keeps only safe source records and coerces their titles', () => {
    const sources = [
      null,
      'https://example.com',
      { uri: 'javascript:alert(1)', title: 'bad' },
      { uri: 'https://Example.com/docs', title: 123 },
      { uri: 'https://safe.test/path', title: '<img onerror=alert(1)>' },
      { uri: 'not a url', title: 'broken' }
    ]

    expect(sanitizeSources(sources)).toEqual([
      { uri: 'https://example.com/docs', title: '123' },
      { uri: 'https://safe.test/path', title: '<img onerror=alert(1)>' }
    ])
    expect(sanitizeSources({ uri: 'https://example.com', title: 'nope' })).toEqual([])
  })
})

describe('ChatbotWindow safe rendering', () => {
  test('renders escaped messages and exposes only hardened HTTPS source links', () => {
    const wrapper = mount(ChatbotWindow, {
      props: {
        isOpen: true,
        isAuthenticated: true,
        isTyping: false,
        history: [{
          role: 'bot',
          text: '<img src=x onerror=alert(1)> **safe**',
          sources: [
            { uri: 'javascript:alert(1)', title: 'unsafe' },
            { uri: 'https://example.com/docs', title: '<b>documentation</b>' }
          ]
        }]
      }
    })

    const content = wrapper.get('.msg-content')
    expect(content.find('img').exists()).toBe(false)
    expect(content.find('strong').text()).toBe('safe')
    expect(content.text()).toContain('safe')

    const links = wrapper.findAll('.source-chip')
    expect(links).toHaveLength(1)
    expect(links[0].attributes('href')).toBe('https://example.com/docs')
    expect(links[0].attributes('target')).toBe('_blank')
    expect(links[0].attributes('rel')).toBe('noopener noreferrer')
    expect(links[0].find('b').exists()).toBe(false)
    expect(links[0].text()).toContain('<b>documentation</b>')
  })

  test('renders the apply-build confirmation as supported bold markdown without literal HTML tags', () => {
    setActivePinia(createPinia())
    useCatalogStore().hardwareList = {
      cpu: [{ id: 'cpu-1', name: 'CPU', price: 2500 }]
    }
    const chat = useChatbotStore()

    chat.applyBuild({ cpu: 'cpu-1' })
    const confirmation = chat.history.at(-1)
    const wrapper = mount(ChatbotWindow, {
      props: {
        isOpen: true,
        isAuthenticated: true,
        isTyping: false,
        history: [confirmation]
      }
    })
    const content = wrapper.get('.msg-content')

    expect(confirmation.text).not.toContain('<strong>')
    expect(content.find('strong').text()).toContain('จัดสเปคลงตะกร้าเรียบร้อยแล้วครับ!')
    expect(content.text()).not.toContain('<strong>')
  })
})
