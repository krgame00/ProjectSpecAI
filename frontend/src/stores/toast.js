import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])

  function show(message, type = 'success', duration = 4000) {
    const id = Date.now() + Math.random()
    toasts.value.push({ id, message, type })
    setTimeout(() => {
      remove(id)
    }, duration)
  }

  function remove(id) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  function success(message, duration) { show(message, 'success', duration) }
  function error(message, duration) { show(message, 'error', duration) }
  function warning(message, duration) { show(message, 'warning', duration) }
  function info(message, duration) { show(message, 'info', duration) }

  return { toasts, show, remove, success, error, warning, info }
})
