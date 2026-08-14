import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { routeLocationKey, routerKey } from 'vue-router'
import ArticleDetailView from '../src/components/ArticleDetailView.vue'

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
})
