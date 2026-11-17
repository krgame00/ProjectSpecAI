import { mount } from '@vue/test-utils'
import { describe, expect, test, vi, beforeEach } from 'vitest'
import ShareBuildModal from '../src/components/ShareBuildModal.vue'

describe('ShareBuildModal Component', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  test('does not render when isOpen is false', () => {
    const wrapper = mount(ShareBuildModal, {
      props: {
        isOpen: false,
        shareUrl: 'https://project-spec-ai.vercel.app/builder?b=cpu:1',
        totalPrice: 25000,
        itemCount: 4
      }
    })
    expect(wrapper.find('.modal-backdrop').exists()).toBe(false)
  })

  test('renders properly and shows details when isOpen is true', () => {
    const wrapper = mount(ShareBuildModal, {
      props: {
        isOpen: true,
        shareUrl: 'https://project-spec-ai.vercel.app/builder?b=cpu:1,gpu:2',
        totalPrice: 35000,
        itemCount: 2
      }
    })
    expect(wrapper.find('.modal-backdrop').exists()).toBe(true)
    expect(wrapper.find('#share-modal-title').text()).toBe('แชร์สเปกคอมพิวเตอร์')
    expect(wrapper.find('.share-url-field').element.value).toBe('https://project-spec-ai.vercel.app/builder?b=cpu:1,gpu:2')
    expect(wrapper.text()).toContain('฿35,000')
    expect(wrapper.text()).toContain('2 รายการ')
  })

  test('emits close event when close button is clicked', async () => {
    const wrapper = mount(ShareBuildModal, {
      props: {
        isOpen: true,
        shareUrl: 'https://test.com',
        totalPrice: 10000,
        itemCount: 1
      }
    })
    const closeBtn = wrapper.find('.btn-close')
    await closeBtn.trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  test('copies URL to clipboard when copy button is clicked', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', {
      clipboard: {
        writeText: writeTextMock
      }
    })

    const wrapper = mount(ShareBuildModal, {
      props: {
        isOpen: true,
        shareUrl: 'https://project-spec-ai.vercel.app/builder?b=cpu:1',
        totalPrice: 15000,
        itemCount: 2
      }
    })

    const copyBtn = wrapper.find('.btn-copy')
    await copyBtn.trigger('click')

    expect(writeTextMock).toHaveBeenCalledWith('https://project-spec-ai.vercel.app/builder?b=cpu:1')
  })
})
