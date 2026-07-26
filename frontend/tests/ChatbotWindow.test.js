import { afterEach, describe, expect, test, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import ChatbotWindow from '../src/components/ChatbotWindow.vue'

const guestProps = {
  isOpen: true,
  isAuthenticated: false,
  isTyping: true,
  history: [{ role: 'bot', text: 'member-only history' }]
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ChatbotWindow access presentation', () => {
  test('shows the guest message and CTA without member history or controls', () => {
    const wrapper = mount(ChatbotWindow, { props: guestProps })

    const guestAccess = wrapper.get('[data-test="guest-chat-access"]')
    expect(guestAccess.text()).toContain('เข้าสู่ระบบเพื่อใช้งาน SpecAI')
    expect(guestAccess.text()).toContain('กรุณาเข้าสู่ระบบก่อน เพื่อใช้งานผู้ช่วย SpecAI')
    expect(wrapper.get('[data-test="chat-login"]').text()).toBe('เข้าสู่ระบบ')
    expect(wrapper.find('.msg').exists()).toBe(false)
    expect(wrapper.find('.typing-indicator').exists()).toBe(false)
    expect(wrapper.find('.chat-input-container').exists()).toBe(false)
  })

  test('emits request-login exactly once when the guest CTA is clicked', async () => {
    const wrapper = mount(ChatbotWindow, { props: guestProps })

    await wrapper.get('[data-test="chat-login"]').trigger('click')

    expect(wrapper.emitted('request-login')).toHaveLength(1)
  })

  test('retains member history and input controls for authenticated users', () => {
    const wrapper = mount(ChatbotWindow, {
      props: {
        ...guestProps,
        isAuthenticated: true,
        isTyping: false
      }
    })

    expect(wrapper.get('.msg-content').text()).toBe('member-only history')
    expect(wrapper.find('.chat-input-container').exists()).toBe(true)
    expect(wrapper.find('[data-test="guest-chat-access"]').exists()).toBe(false)
  })

  test('clears text and image drafts when an authenticated user logs out', async () => {
    vi.stubGlobal('FileReader', class {
      readAsDataURL() {
        this.onload({
          target: { result: 'data:image/png;base64,aW1hZ2UtYnl0ZXM=' }
        })
      }
    })
    const wrapper = mount(ChatbotWindow, {
      props: {
        ...guestProps,
        isAuthenticated: true,
        isTyping: false
      }
    })
    const textInput = wrapper.get('.chat-input input[type="text"]')
    const fileInput = wrapper.get('input[type="file"]')
    const image = new File(['image-bytes'], 'draft.png', { type: 'image/png' })

    await textInput.setValue('private draft')
    Object.defineProperty(fileInput.element, 'files', {
      configurable: true,
      value: [image]
    })
    await fileInput.trigger('change')
    await flushPromises()

    expect(wrapper.find('.image-preview').exists()).toBe(true)

    await wrapper.setProps({ isAuthenticated: false })
    await wrapper.setProps({ isAuthenticated: true })

    expect(wrapper.get('.chat-input input[type="text"]').element.value).toBe('')
    expect(wrapper.find('.image-preview').exists()).toBe(false)
  })
})
