import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { routerKey } from 'vue-router'
import CheckoutView from '../src/components/CheckoutView.vue'
import { useBuilderStore } from '../src/stores/builder'
import { useCatalogStore } from '../src/stores/catalog'

describe('CheckoutView validation accessibility', () => {
  let pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    useCatalogStore().hardwareList = {
      cpu: [{ id: 1, name: 'INTEL Core i5', price: 7290, image: '/images/cpu.png' }]
    }
    useBuilderStore().setItem('cpu', 1)
  })

  test('associates the required-name error and focuses the field', async () => {
    const router = { push: vi.fn() }
    const wrapper = mount(CheckoutView, {
      props: {
        categories: [{ id: 'cpu', name: 'CPU' }],
        catalog: useCatalogStore().hardwareList,
        currentUser: null
      },
      attachTo: document.body,
      global: {
        plugins: [pinia],
        provide: { [routerKey]: router },
        mocks: { $router: router }
      }
    })

    await wrapper.get('.submit-btn').trigger('click')
    const name = wrapper.get('#checkout-name')

    expect(name.attributes('aria-invalid')).toBe('true')
    expect(name.attributes('aria-describedby')).toBe('checkout-name-error')
    expect(document.activeElement).toBe(name.element)
    expect(wrapper.get('#checkout-name-error').text()).not.toBe('')
    wrapper.unmount()
  })
})
