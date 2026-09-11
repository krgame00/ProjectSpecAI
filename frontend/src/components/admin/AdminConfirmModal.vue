<template>
  <div class="modal-overlay" v-if="show" @click.self="$emit('close')" style="z-index: 3000;">
    <div class="modal-content glass-panel admin-modal admin-modal--confirm" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title" style="max-width: 400px; padding: 2.5rem 2rem; text-align: center;">
      <div style="font-size: 3rem; margin-bottom: 1rem; line-height: 1;">
        <span v-if="type === 'danger'">⚠️</span>
        <span v-else>❓</span>
      </div>
      <h3 id="confirm-modal-title" style="margin-bottom: 0.75rem; color: var(--ink); font-size: 1.25rem;">ยืนยันการทำรายการ</h3>
      <p style="color: var(--ink-mute); margin-bottom: 2rem; font-size: 0.95rem; line-height: 1.5;">{{ message }}</p>
      
      <div class="admin-confirm-actions">
        <button class="btn btn-outline" style="flex: 1; padding: 0.5rem 1rem;" @click="$emit('close')">ยกเลิก</button>
        <button class="btn" style="flex: 1; padding: 0.5rem 1rem; font-weight: 600;" 
          :class="type === 'danger' ? 'btn-danger' : 'btn-primary'" 
          :disabled="isConfirming" @click="$emit('confirm')">
          ตกลง
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: Boolean,
  message: String,
  type: {
    type: String,
    default: 'danger'
  },
  isConfirming: Boolean
});

defineEmits(['confirm', 'close']);
</script>
