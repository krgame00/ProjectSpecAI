<template>
  <div>
    <!-- Chatbot Window -->
    <div class="chatbot-wrapper" v-show="isOpen">
      <div class="chat-header">
        <div class="chat-header-left">
          <div class="status-dot"></div>
          SpecAI
        </div>
        <button class="close-btn" @click="toggleChat(false)">✕</button>
      </div>
      <div class="chat-body" ref="chatBody">
        <div v-for="(msg, index) in history" :key="index" :class="['msg', msg.role]">
          <div v-html="msg.text"></div>
          <div v-if="msg.presets" class="quick-actions">
            <button 
              v-for="p in msg.presets" 
              :key="p.id" 
              class="quick-btn" 
              @click="applyPreset(p.id)"
            >
              {{ p.label }}
            </button>
          </div>
        </div>
        <div v-if="isTyping" class="typing-indicator">AI กำลังวิเคราะห์...</div>
      </div>
      <div class="chat-input">
        <input 
          type="text" 
          v-model="input" 
          @keyup.enter="sendMessage" 
          placeholder="พิมพ์ความต้องการ เช่น แอนิเมชัน, Wuthering..."
        >
        <button class="send-btn" @click="sendMessage">➔</button>
      </div>
    </div>

    <!-- Chatbot FAB -->
    <button class="chat-fab" v-show="!isOpen" @click="toggleChat(true)" title="เปิดแชตบอต">
      💬
    </button>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, defineProps, defineEmits } from 'vue';

const props = defineProps({
  isOpen: Boolean,
  history: Array,
  isTyping: Boolean
});

const emit = defineEmits(['toggle-chat', 'send-message', 'apply-preset']);

const input = ref('');
const chatBody = ref(null);

const toggleChat = (status) => {
  emit('toggle-chat', status);
};

const sendMessage = () => {
  if (!input.value.trim()) return;
  emit('send-message', input.value.trim());
  input.value = '';
};

const applyPreset = (presetId) => {
  emit('apply-preset', presetId);
};

// Scroll to bottom when history changes
watch(() => props.history.length, async () => {
  await nextTick();
  if (chatBody.value) {
    chatBody.value.scrollTop = chatBody.value.scrollHeight;
  }
});
</script>

<style scoped>
.chatbot-wrapper { /* styles */ }
.msg.bot { /* bot message style */ }
.msg.user { /* user message style */ }
</style>