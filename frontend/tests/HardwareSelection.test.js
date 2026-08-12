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

  test('exposes the selected product as the current item', () => {
    const wrapper = mount(HardwareSelection, {
      props: {
        activeCategory: 'cpu',
        activeCategoryInfo: mockActiveCategoryInfo,
        products: mockProducts,
        selectedItemId: 1,
        compatibilityIssues: [],
        hasAnyComponent: true
      }
    })

    expect(wrapper.get('.product-card.selected').attributes('aria-current')).toBe('true')
    expect(wrapper.get('.product-card.selected .add-btn').element.tagName).toBe('BUTTON')
    expect(wrapper.get('.product-card.selected .add-btn').attributes('aria-label')).toContain('Product A')
  })

  test('labels filters and exposes product details as a modal dialog', async () => {
    const wrapper = mount(HardwareSelection, {
      props: {
        activeCategory: 'cpu',
        activeCategoryInfo: mockActiveCategoryInfo,
        products: mockProducts,
        selectedItemId: null,
        compatibilityIssues: [],
        hasAnyComponent: false
      },
      attachTo: document.body
    })

    expect(wrapper.get('.search-input').attributes('aria-label')).toContain('CPU')
    expect(wrapper.get('.sort-select').attributes('aria-label')).not.toBe('')
    await wrapper.get('.details-btn').trigger('click')

    const dialog = wrapper.get('[role="dialog"]')
    expect(dialog.attributes('aria-modal')).toBe('true')
    expect(dialog.attributes('aria-labelledby')).toBe('hardware-details-title')
    expect(wrapper.get('[aria-label="ปิดรายละเอียดสินค้า"]')).toBeTruthy()
    wrapper.unmount()
  })

  test('replaces a failed product image with the category fallback', async () => {
    const wrapper = mount(HardwareSelection, {
      props: {
        activeCategory: 'cpu',
        activeCategoryInfo: mockActiveCategoryInfo,
        products: [{ ...mockProducts[0], image: '/broken.png' }],
        selectedItemId: null,
        compatibilityIssues: [],
        hasAnyComponent: false
      }
    })

    const image = wrapper.get('.product-card img')
    await image.trigger('error')

    expect(image.attributes('src')).toBe('/images/cpu.png')
  })
})
