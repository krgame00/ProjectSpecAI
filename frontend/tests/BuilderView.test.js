import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { nextTick } from 'vue'
import BuilderView from '../src/views/BuilderView.vue'
import { useAuthStore } from '../src/stores/auth'
import { useCatalogStore } from '../src/stores/catalog'

describe('BuilderView chatbot access', () => {
  let pinia

  beforeEach(() => {
    const values = new Map()
    vi.stubGlobal('localStorage', {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, String(value)),
      removeItem: (key) => values.delete(key),
      clear: () => values.clear()
    })
    pinia = createPinia()
    setActivePinia(pinia)
    useCatalogStore().hardwareList = { cpu: [] }
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  test('omits the chatbot for guests and reactively shows it after login', async () => {
    const wrapper = mount(BuilderView, {
      props: {
        isChatOpen: false,
        chatHistory: [],
        isTyping: false
      },
      global: {
        plugins: [pinia],
        stubs: {
          PriceSummary: true,
          HardwareSelection: true,
          ChatbotWindow: true,
          PrintTemplate: true
        }
      }
    })

    expect(wrapper.find('chatbot-window-stub').exists()).toBe(false)

    useAuthStore().setUser({ id: 7 }, 'member.jwt')
    await nextTick()

    expect(wrapper.find('chatbot-window-stub').exists()).toBe(true)
  })
})
