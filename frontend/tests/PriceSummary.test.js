import { mount } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'
import PriceSummary from '../src/components/PriceSummary.vue'

const props = {
  totalPrice: 7290,
  hasAnyComponent: true,
  compatibilityIssues: [],
  compatibilityPasses: [],
  categories: [{ id: 'cpu', name: 'CPU' }],
  build: { cpu: 1 },
  catalog: {
    cpu: [{ id: 1, name: 'INTEL Core i5', price: 7290, specs: {} }],
    gpu: [],
    psu: []
  },
  activeCategory: 'cpu'
}

describe('PriceSummary mobile disclosure', () => {
  test('renders hardware categories as keyboard-operable buttons', async () => {
    const wrapper = mount(PriceSummary, { props })
    const category = wrapper.get('.category-button')

    expect(category.element.tagName).toBe('BUTTON')
    expect(category.attributes('aria-current')).toBe('true')
    await category.trigger('click')
    expect(wrapper.emitted('set-active-category')).toEqual([['cpu']])
  })

  test('toggles details and exposes state to assistive technology', async () => {
    const wrapper = mount(PriceSummary, { props })
    const toggle = wrapper.get('[data-test="mobile-summary-toggle"]')

    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(toggle.attributes('aria-controls')).toBe('mobile-build-summary')
    expect(wrapper.get('#mobile-build-summary').attributes('hidden')).toBeDefined()

    await toggle.trigger('click')

    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(wrapper.get('#mobile-build-summary').attributes('hidden')).toBeUndefined()
  })
})
