import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import ToastNotification from '../src/components/ToastNotification.vue'
import { useToastStore } from '../src/stores/toast'

describe('ToastNotification accessibility', () => {
  let pinia

  beforeEach(() => {
    vi.useFakeTimers()
    pinia = createPinia()
    setActivePinia(pinia)
  })

  test('announces urgent and informative messages with named dismiss buttons', async () => {
    const wrapper = mount(ToastNotification, { global: { plugins: [pinia] } })
    const toast = useToastStore()

    toast.error('กรุณาตรวจสอบข้อมูล')
    toast.success('บันทึกสำเร็จ')
    await wrapper.vm.$nextTick()

    expect(wrapper.get('.toast-error').attributes('role')).toBe('alert')
    expect(wrapper.get('.toast-success').attributes('role')).toBe('status')
    expect(wrapper.findAll('[aria-label="ปิดการแจ้งเตือน"]')).toHaveLength(2)
  })
})
