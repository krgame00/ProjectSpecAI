// @vitest-environment-options {"url":"http://localhost/"}

import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import { routerKey } from 'vue-router'
import App from '../src/App.vue'
import { useArticleStore } from '../src/stores/article'
import { useCatalogStore } from '../src/stores/catalog'

vi.mock('/images/logo.png', () => ({
  default: '/images/logo.png'
}))

const RouteRequestLogin = defineComponent({
  emits: ['request-login'],
  template: `
    <button
      data-test="route-request-login"
      @click="$emit('request-login')"
    />
  `
})

const RouterViewStub = defineComponent({
  setup(_, { slots }) {
    return () => slots.default?.({ Component: RouteRequestLogin })
  }
})

describe('App guest login request', () => {
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
    useCatalogStore().fetchCatalog = vi.fn().mockResolvedValue()
    useArticleStore().fetchArticles = vi.fn().mockResolvedValue()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  test('opens the existing modal on a routed request and resets it to login', async () => {
    const router = { push: vi.fn() }
    const wrapper = mount(App, {
      global: {
        plugins: [pinia],
        provide: {
          [routerKey]: router
        },
        mocks: {
          $route: { path: '/build' },
          $router: router
        },
        stubs: {
          RouterView: RouterViewStub
        }
      }
    })

    await wrapper.findAll('.nav-actions .btn-outline')[2].trigger('click')
    await wrapper.findAll('.auth-tab')[1].trigger('click')
    await wrapper.get('.close-btn').trigger('click')
    await nextTick()

    expect(wrapper.find('.modal-overlay').exists()).toBe(false)

    await wrapper.get('[data-test="route-request-login"]').trigger('click')
    await nextTick()

    expect(wrapper.find('.modal-overlay').exists()).toBe(true)
    expect(wrapper.get('.auth-tab.active').text()).toContain('เข้าสู่ระบบ')
  })
})
