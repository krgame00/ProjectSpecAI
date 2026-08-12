<template>
  <div class="toast-container">
    <TransitionGroup name="toast-slide">
      <div 
        v-for="toast in toastStore.toasts" 
        :key="toast.id" 
        :class="['toast-item', `toast-${toast.type}`]"
        :role="toast.type === 'error' ? 'alert' : 'status'"
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
        <button class="toast-close" aria-label="ปิดการแจ้งเตือน" @click.stop="toastStore.remove(toast.id)">&times;</button>
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
  top: max(1rem, calc(0.5rem + env(safe-area-inset-top)));
  right: max(1rem, calc(0.5rem + env(safe-area-inset-right)));
  z-index: var(--z-toast);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 26rem;
  width: calc(100vw - 2rem - env(safe-area-inset-left) - env(safe-area-inset-right));
  pointer-events: none;
}

.toast-item {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 0.9rem 1.1rem;
  background: var(--canvas);
  border: 1px solid var(--hairline-strong);
  border-radius: var(--radius-lg, 12px);
  box-shadow: var(--shadow-lg);
  color: var(--ink);
  font-size: 0.9rem;
  line-height: 1.4;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toast-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
  margin-top: 1px;
}

.toast-content {
  flex: 1;
  min-width: 0;
  white-space: pre-line;
  overflow-wrap: anywhere;
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
  width: 44px;
  height: 44px;
  padding: 0;
  margin: -0.55rem -0.7rem -0.55rem 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s;
}

.toast-close:hover {
  color: var(--ink, #ffffff);
}

/* Variant Styles */
.toast-success {
  border-color: var(--success);
}
.toast-success .toast-icon { color: var(--success); }

.toast-error {
  border-color: var(--danger);
}
.toast-error .toast-icon { color: var(--danger); }

.toast-warning {
  border-color: var(--warning);
}
.toast-warning .toast-icon { color: var(--warning); }

.toast-info {
  border-color: var(--primary);
}
.toast-info .toast-icon { color: var(--primary); }

@media (hover: hover) and (pointer: fine) {
  .toast-item:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-xl);
  }
}

@media (max-width: 30rem) {
  .toast-container {
    right: calc(0.5rem + env(safe-area-inset-right));
    left: calc(0.5rem + env(safe-area-inset-left));
    width: auto;
  }
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

@media (max-width: 30rem) {
  .toast-slide-enter-from {
    transform: translateY(-0.75rem);
  }
}
</style>
