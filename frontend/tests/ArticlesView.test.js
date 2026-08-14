import { mount } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'
import ArticlesView from '../src/components/ArticlesView.vue'

const RouterLinkStub = {
  props: ['to'],
  template: '<a :href="`/article/${to.params.id}`"><slot /></a>'
}

const mountView = props => mount(ArticlesView, {
  props: {
    articles: [],
    articlesLoading: false,
    articlesError: null,
    ...props
  },
  global: { stubs: { RouterLink: RouterLinkStub } }
})

describe('ArticlesView', () => {
  test('renders article destinations as links and excerpts as text', () => {
    const wrapper = mountView({
      articles: [{ id: 7, title: 'Safe', content: '<b>Read me</b><script>bad()</script>' }]
    })

    expect(wrapper.get('a[href="/article/7"]').exists()).toBe(true)
    expect(wrapper.get('.article-excerpt').text()).toBe('Read me')
    expect(wrapper.html()).not.toContain('<script>')
  })

  test.each([
    [{ articlesLoading: true }, '[role="status"]'],
    [{ articlesError: 'offline' }, '[role="alert"]'],
    [{ articles: [] }, '[data-test="articles-empty"]']
  ])('renders a distinct request state', (override, selector) => {
    const wrapper = mountView(override)

    expect(wrapper.get(selector).exists()).toBe(true)
  })

  test('emits retry from the failure action', async () => {
    const wrapper = mountView({ articlesError: 'offline' })

    await wrapper.get('[data-test="articles-retry"]').trigger('click')

    expect(wrapper.emitted('retry-articles')).toHaveLength(1)
  })

  test('uses a labelled fallback when a cover is absent or fails to load', async () => {
    const wrapper = mountView({
      articles: [
        { id: 1, title: 'No cover', content: 'One' },
        { id: 2, title: 'Broken cover', content: 'Two', image_url: '/broken.jpg' }
      ]
    })

    expect(wrapper.get('[aria-label="ไม่มีภาพปกสำหรับ No cover"]').exists()).toBe(true)

    await wrapper.get('img[src="/broken.jpg"]').trigger('error')

    expect(wrapper.get('[aria-label="ไม่มีภาพปกสำหรับ Broken cover"]').exists()).toBe(true)
  })
})
