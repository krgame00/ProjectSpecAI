<template>
  <div class="toast-container">
    <TransitionGroup name="toast-slide">
      <div 
        v-for="toast in toastStore.toasts" 
        :key="toast.id" 
        :class="['toast-item', `toast-${toast.type}`]"
        @click="toastStore.remove(toast.id)"
      >
        <div class="toast-icon">
          <span v-if="toast.type === 'success'">✅</span>
          <span v-else-if="toast.type === 'error'">🚨</span>
          <span v-else-if="toast.type === 'warning'">⚠️</span>
          <span v-else>ℹ️</span>
        </div>
        <div class="toast-content">
          <div class="toast-message">{{ toast.message }}</div>
        </div>
        <button class="toast-close" @click.stop="toastStore.remove(toast.id)">&times;</button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useToastStore } from '../stores/toast'
const toastStore = useToastStore()
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 420px;
  width: calc(100vw - 3rem);
  pointer-events: none;
}

.toast-item {
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 0.9rem 1.1rem;
  background: rgba(28, 28, 28, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid var(--hairline-cool, #2a2a2a);
  border-radius: var(--radius-lg, 12px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  color: var(--ink, #ffffff);
  font-size: 0.9rem;
  line-height: 1.4;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toast-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 35px rgba(0, 0, 0, 0.45);
}

.toast-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
  margin-top: 1px;
}

.toast-content {
  flex: 1;
  white-space: pre-line;
  word-break: break-word;
}

.toast-message {
  font-weight: 500;
}

.toast-close {
  background: none;
  border: none;
  color: var(--ink-mute, #a0a0a0);
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  margin-left: 0.5rem;
  transition: color 0.15s;
}

.toast-close:hover {
  color: var(--ink, #ffffff);
}

/* Variant Styles */
.toast-success {
  border-left: 4px solid var(--primary, #3ecf8e);
  background: linear-gradient(135deg, rgba(62, 207, 142, 0.12) 0%, rgba(28, 28, 28, 0.96) 100%);
}

.toast-error {
  border-left: 4px solid var(--danger, #ff2201);
  background: linear-gradient(135deg, rgba(255, 34, 1, 0.12) 0%, rgba(28, 28, 28, 0.96) 100%);
}

.toast-warning {
  border-left: 4px solid var(--warning, #ffdb13);
  background: linear-gradient(135deg, rgba(255, 219, 19, 0.12) 0%, rgba(28, 28, 28, 0.96) 100%);
}

.toast-info {
  border-left: 4px solid #3b82f6;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(28, 28, 28, 0.96) 100%);
}

/* Animations */
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-slide-enter-from {
  opacity: 0;
  transform: translateX(40px) scale(0.95);
}

.toast-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}
</style>
