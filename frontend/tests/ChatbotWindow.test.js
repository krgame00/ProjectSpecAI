import { describe, expect, test } from 'vitest'
import { mount } from '@vue/test-utils'
import ChatbotWindow from '../src/components/ChatbotWindow.vue'

const guestProps = {
  isOpen: true,
  isAuthenticated: false,
  isTyping: true,
  history: [{ role: 'bot', text: 'member-only history' }]
}

describe('ChatbotWindow access presentation', () => {
  test('shows the guest message and CTA without member history or controls', () => {
    const wrapper = mount(ChatbotWindow, { props: guestProps })

    const guestAccess = wrapper.get('[data-test="guest-chat-access"]')
    expect(guestAccess.text()).toContain('เน€เธเนเธฒเธชเธนเนเธฃเธฐเธเธเน€เธเธทเนเธญเนเธเนเธเธฒเธ SpecAI')
    expect(guestAccess.text()).toContain('เธเธฃเธธเธ“เธฒเน€เธเนเธฒเธชเธนเนเธฃเธฐเธเธเธเนเธญเธ เน€เธเธทเนเธญเนเธเนเธเธฒเธเธเธนเนเธเนเธงเธข SpecAI')
    expect(wrapper.get('[data-test="chat-login"]').text()).toBe('เน€เธเนเธฒเธชเธนเนเธฃเธฐเธเธ')
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
})
