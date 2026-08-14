import { mount } from '@vue/test-utils'
import { parse } from '@vue/compiler-sfc'
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import { routeLocationKey, routerKey } from 'vue-router'
import ArticleDetailView from '../src/components/ArticleDetailView.vue'
import articleDetailSource from '../src/components/ArticleDetailView.vue?raw'

const mountedWrappers = []

const mountDetail = ({
  articles = [],
  articlesLoading = false,
  articlesError = null,
  routeId = '7',
  router = { push: vi.fn() }
} = {}) => {
  const wrapper = mount(ArticleDetailView, {
    props: { articles, articlesLoading, articlesError },
    global: {
      provide: {
        [routeLocationKey]: { params: { id: routeId } },
        [routerKey]: router
      },
      stubs: {
        RouterLink: {
          props: ['to'],
          template: '<a :href="typeof to === \'string\' ? to : to.path"><slot /></a>'
        }
      }
    }
  })

  mountedWrappers.push(wrapper)
  return wrapper
}

afterEach(() => {
  mountedWrappers.splice(0).forEach(wrapper => wrapper.unmount())
})

describe('ArticleDetailView', () => {
  let styleElement

  beforeAll(() => {
    styleElement = document.createElement('style')
    styleElement.textContent = parse(articleDetailSource).descriptor.styles.map(style => style.content).join('\n')
    document.head.append(styleElement)
  })

  afterAll(() => styleElement.remove())

  test('sanitizes rich article content and does not navigate on Escape', () => {
    const router = { push: vi.fn() }
    const wrapper = mountDetail({
      articles: [{
        id: 7,
        title: 'Article',
        content: '<p>Safe</p><img src=x onerror=alert(1)><script>bad()</script>'
      }],
      routeId: '7',
      router
    })

    expect(wrapper.get('.article-content').html()).toContain('<p>Safe</p>')
    expect(wrapper.get('.article-content').html()).not.toMatch(/onerror|script/i)

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    expect(router.push).not.toHaveBeenCalled()
  })

  test('keeps a sanitized table semantic inside a named focusable scroll region', async () => {
    const wrapper = mountDetail({
      articles: [{
        id: 7,
        title: 'Wide specifications',
        created_at: '2026-08-13T00:00:00.000Z',
        content: '<table tabindex="4" aria-label="Spoofed"><tbody><tr><td>GPU</td><td>Very wide value</td></tr></tbody></table>'
      }]
    })

    const region = wrapper.get('.article-table-scroll')
    expect(region.attributes()).toMatchObject({
      tabindex: '0',
      role: 'region',
      'aria-label': 'ตารางข้อมูลบทความ 1'
    })
    expect(region.get('table').attributes('tabindex')).toBeUndefined()
    expect(region.get('table').attributes('aria-label')).toBeUndefined()

    Object.defineProperty(region.element, 'clientWidth', { configurable: true, value: 200 })
    Object.defineProperty(region.element, 'scrollWidth', { configurable: true, value: 800 })
    region.element.scrollLeft = 0
    await region.trigger('keydown', { key: 'ArrowRight' })
    expect(region.element.scrollLeft).toBeGreaterThan(0)
  })

  test('adds a machine-readable datetime for a valid article date', () => {
    const wrapper = mountDetail({
      articles: [{
        id: 7,
        title: 'Dated article',
        created_at: '2026-08-13T00:00:00.000Z',
        content: '<p>Body</p>'
      }]
    })

    expect(wrapper.get('time').attributes('datetime')).toBe('2026-08-13T00:00:00.000Z')
  })

  test.each([
    [{ articlesLoading: true }, '[role="status"]'],
    [{ articlesError: 'offline' }, '[role="alert"]'],
    [{ articles: [], articlesLoading: false, articlesError: null }, '[data-test="article-not-found"]']
  ])('renders a distinct detail state', (props, selector) => {
    expect(mountDetail({ ...props, routeId: '404' }).get(selector).exists()).toBe(true)
  })

  test('emits retry from the failure action', async () => {
    const wrapper = mountDetail({ articlesError: 'offline' })

    await wrapper.get('[data-test="article-retry"]').trigger('click')

    expect(wrapper.emitted('retry-articles')).toHaveLength(1)
  })

  test('uses a stable fallback when an article cover is missing or fails', async () => {
    const missingCover = mountDetail({
      articles: [{ id: 7, title: 'No cover', content: '<p>Body</p>' }],
      routeId: '7'
    })

    expect(missingCover.get('.article-image-fallback').attributes('role')).toBe('img')
    expect(missingCover.get('.article-image-fallback').attributes('aria-label')).toBe('ไม่มีภาพปกสำหรับ No cover')

    const brokenCover = mountDetail({
      articles: [{ id: 8, title: 'Broken cover', content: '<p>Body</p>', image_url: '/broken.jpg' }],
      routeId: '8'
    })

    await brokenCover.get('img[src="/broken.jpg"]').trigger('error')

    expect(brokenCover.get('.article-image-fallback').attributes('aria-label')).toBe('ไม่มีภาพปกสำหรับ Broken cover')
  })

  test('retries a failed cover when the same article receives a corrected image URL', async () => {
    const wrapper = mountDetail({
      articles: [{ id: 7, title: 'Corrected cover', content: 'Body', image_url: '/broken.jpg' }]
    })

    await wrapper.get('img[src="/broken.jpg"]').trigger('error')
    expect(wrapper.find('img').exists()).toBe(false)

    await wrapper.setProps({
      articles: [{ id: 7, title: 'Corrected cover', content: 'Body', image_url: '/corrected.jpg' }]
    })

    expect(wrapper.get('img[src="/corrected.jpg"]').attributes('alt')).toBe('Corrected cover')
  })

  test('keeps the detail error back link at least 44px tall', () => {
    const wrapper = mountDetail({ articlesError: 'offline' })
    const styles = getComputedStyle(wrapper.get('.text-link').element)

    expect(styles.display).toBe('inline-flex')
    expect(styles.minHeight).toBe('44px')
  })
})
