import { mount } from '@vue/test-utils'
import { parse } from '@vue/compiler-sfc'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import ArticlesView from '../src/components/ArticlesView.vue'
import articleViewSource from '../src/components/ArticlesView.vue?raw'

const RouterLinkStub = {
  name: 'RouterLink',
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
  let styleElement

  beforeAll(() => {
    styleElement = document.createElement('style')
    styleElement.textContent = parse(articleViewSource).descriptor.styles.map(style => style.content).join('\n')
    document.head.append(styleElement)
  })

  afterAll(() => styleElement.remove())

  test('renders article destinations as links and excerpts as text', () => {
    const wrapper = mountView({
      articles: [{ id: 7, title: 'Safe', content: '<b>Read me</b><script>bad()</script>' }]
    })

    const articleLink = wrapper.getComponent(RouterLinkStub)

    expect(articleLink.props('to')).toEqual({ name: 'article-detail', params: { id: 7 } })
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

  test('keeps the retry action at least 44px tall', () => {
    const wrapper = mountView({ articlesError: 'offline' })

    expect(getComputedStyle(wrapper.get('[data-test="articles-retry"]').element).minHeight).toBe('44px')
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
