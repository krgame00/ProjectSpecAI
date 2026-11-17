import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import BuilderView from '../src/views/BuilderView.vue'
import { useAuthStore } from '../src/stores/auth'
import { useCatalogStore } from '../src/stores/catalog'
import { useBuilderStore } from '../src/stores/builder'

const mockRoute = { query: {} }
vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => ({ push: vi.fn() })
}))

const ChatbotWindowStub = defineComponent({
  props: {
    isAuthenticated: Boolean
  },
  emits: ['request-login'],
  template: `
    <div
      data-test="chatbot-window"
      :data-authenticated="String(isAuthenticated)"
    >
      <button
        data-test="stub-request-login"
        @click="$emit('request-login')"
      />
    </div>
  `
})

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

  const mountBuilderView = () => {
    return mount(BuilderView, {
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
          ChatbotWindow: ChatbotWindowStub,
          PrintTemplate: true,
          ShareBuildModal: true
        }
      }
    })
  }

  test('loads build from route query parameter when mounting', () => {
    mockRoute.query = { b: 'cpu:5' }
    mountBuilderView()
    const builder = useBuilderStore()
    expect(builder.build.cpu).toBe(5)
    mockRoute.query = {}
  })

  test('renders the chatbot for guests with unauthenticated access', () => {
    const wrapper = mountBuilderView()

    expect(wrapper.get('[data-test="chatbot-window"]').attributes('data-authenticated')).toBe('false')
  })

  test('reactively marks the chatbot authenticated after login', async () => {
    const wrapper = mountBuilderView()

    expect(wrapper.get('[data-test="chatbot-window"]').attributes('data-authenticated')).toBe('false')

    useAuthStore().setUser({ id: 7 }, 'member.jwt')
    await nextTick()

    expect(wrapper.get('[data-test="chatbot-window"]').attributes('data-authenticated')).toBe('true')
  })

  test('forwards a chatbot login request exactly once', async () => {
    const wrapper = mountBuilderView()

    await wrapper.get('[data-test="stub-request-login"]').trigger('click')

    expect(wrapper.emitted('request-login')).toHaveLength(1)
  })
})
