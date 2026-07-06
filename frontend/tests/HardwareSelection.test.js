import { mount } from '@vue/test-utils'
import { expect, test, describe } from 'vitest'
import HardwareSelection from '../src/components/HardwareSelection.vue'

describe('HardwareSelection.vue', () => {
  const mockProducts = [
    { id: 1, name: 'Product A', price: 1000, category: 'cpu' },
    { id: 2, name: 'Product B', price: 2000, category: 'cpu' }
  ]
  const mockActiveCategoryInfo = { id: 'cpu', name: 'CPU', tooltip: 'Test CPU' }

  test('renders products correctly', () => {
    const wrapper = mount(HardwareSelection, {
      props: {
        activeCategory: 'cpu',
        activeCategoryInfo: mockActiveCategoryInfo,
        products: mockProducts,
        selectedItemId: null,
        compatibilityIssues: [],
        hasAnyComponent: false
      }
    })

    const cards = wrapper.findAll('.product-card')
    expect(cards.length).toBe(2)
    expect(wrapper.text()).toContain('Product A')
    expect(wrapper.text()).toContain('Product B')
  })

  test('emits select-item event when clicked', async () => {
    const wrapper = mount(HardwareSelection, {
      props: {
        activeCategory: 'cpu',
        activeCategoryInfo: mockActiveCategoryInfo,
        products: mockProducts,
        selectedItemId: null,
        compatibilityIssues: [],
        hasAnyComponent: false
      }
    })

    const cards = wrapper.findAll('.product-card')
    await cards[0].trigger('click')
    
    expect(wrapper.emitted()).toHaveProperty('select-item')
    expect(wrapper.emitted('select-item')[0]).toEqual(['cpu', 1])
  })

  test('shows selected badge when item is selected', () => {
    const wrapper = mount(HardwareSelection, {
      props: {
        activeCategory: 'cpu',
        activeCategoryInfo: mockActiveCategoryInfo,
        products: mockProducts,
        selectedItemId: 1,
        compatibilityIssues: [],
        hasAnyComponent: false
      }
    })

    const badge = wrapper.find('.selected-badge')
    expect(badge.exists()).toBe(true)
  })
})
