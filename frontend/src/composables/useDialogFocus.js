import { nextTick, onBeforeUnmount, watch } from 'vue'

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',')

export function useDialogFocus(isOpen, dialogRef, close, returnFocusRef) {
  let previousFocus = null

  const onKeydown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      close()
      return
    }

    if (event.key !== 'Tab' || !dialogRef.value) return
    const focusable = [...dialogRef.value.querySelectorAll(focusableSelector)]
      .filter(element => !element.hidden && element.getAttribute('aria-hidden') !== 'true')
    if (!focusable.length) {
      event.preventDefault()
      dialogRef.value.focus()
      return
    }

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  const stopListening = () => document.removeEventListener('keydown', onKeydown)

  watch(isOpen, async (open) => {
    if (open) {
      previousFocus = document.activeElement
      await nextTick()
      document.addEventListener('keydown', onKeydown)
      const first = dialogRef.value?.querySelector(focusableSelector)
      ;(first || dialogRef.value)?.focus()
      return
    }

    stopListening()
    await nextTick()
    const returnTarget = returnFocusRef?.value || previousFocus
    if (returnTarget?.isConnected) returnTarget.focus()
  }, { immediate: true })

  onBeforeUnmount(stopListening)
}
