<template>
  <div class="chatbot-container">
    <!-- Chatbot FAB -->
    <button class="chat-fab" v-show="!isOpen" @click="$emit('toggle-chat', true)" title="เปิดแชตบอต SpecAI">
      <div class="fab-glow"></div>
      <div class="fab-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M21 11.5C21 16.75 16.75 21 11.5 21C10.08 21 8.73 20.69 7.5 20.13L3 21L3.87 16.5C3.31 15.27 3 13.92 3 12.5C3 7.25 7.25 3 12.5 3C17.75 3 21 6.25 21 11.5Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="8.5" cy="12" r="1" fill="currentColor"/><circle cx="12.5" cy="12" r="1" fill="currentColor"/><circle cx="16.5" cy="12" r="1" fill="currentColor"/></svg>
      </div>
      <div class="fab-pulse"></div>
    </button>

    <!-- Chatbot Window -->
    <div class="chatbot-wrapper" :class="{ 'is-open': isOpen }">
      <!-- Header -->
      <div class="chat-header">
        <div class="chat-header-left">
          <div class="ai-avatar">
            <div class="avatar-ring"></div>
            <span>🤖</span>
          </div>
          <div class="header-info">
            <span class="header-name">SpecAI</span>
            <span class="header-status">
              <span class="status-dot"></span>
              ออนไลน์ · พร้อมช่วยเหลือ
            </span>
          </div>
        </div>
        <button class="close-chat-btn" @click="$emit('toggle-chat', false)">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>
      </div>
      
      <!-- Chat Body -->
      <div class="chat-body" id="chatBody">
        <div v-for="(msg, index) in history" :key="index" :class="['msg', msg.role]">
          <div class="msg-avatar" v-if="msg.role === 'bot'">🤖</div>
          <div class="msg-bubble">
            <div class="msg-content" v-html="renderMarkdown(msg.text)"></div>
            <div v-if="msg.recommended_build" class="quick-actions">
              <button class="apply-build-btn" @click="$emit('apply-build', msg.recommended_build)">
                ✨ นำสเปคนี้ใส่ตะกร้า
              </button>
            </div>
          </div>
        </div>
        <div v-if="isTyping" class="typing-indicator">
          <div class="msg-avatar">🤖</div>
          <div class="typing-bubble">
            <div class="typing-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Input -->
      <div class="chat-input">
        <div class="input-wrapper">
          <input 
            type="text" 
            v-model="userInput" 
            @keyup.enter="handleSend" 
            placeholder="พิมพ์เป้าหมาย เช่น เน้นเล่นเกม..."
          >
          <button class="send-btn" @click="handleSend" :class="{ active: userInput.trim() }">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  isOpen: Boolean,
  history: Array,
  isTyping: Boolean
});

const emit = defineEmits(['toggle-chat', 'send-message', 'apply-build']);

const userInput = ref('');

const handleSend = () => {
  if (userInput.value.trim()) {
    emit('send-message', userInput.value);
    userInput.value = '';
  }
};

const renderMarkdown = (text) => {
  if (!text) return '';
  // Basic markdown to HTML
  let html = text;
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/\n/g, '<br>');
  return html;
};
</script>

<style scoped>
.chatbot-container { position: relative; }
.chat-fab { 
  position: fixed; 
  bottom: 2rem; right: 2rem;
  width: 60px; height: 60px;
  border-radius: 50%;
  background: var(--canvas-night);
  color: var(--on-dark);
  border: none;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: var(--shadow-lg);
  z-index: 99;
  transition: all var(--transition-normal);
}
.chat-fab:hover { 
  transform: translateY(-2px); 
  box-shadow: var(--shadow-xl);
}
.fab-icon-wrap { position: relative; z-index: 2; font-size: 1.5rem; }
.chatbot-wrapper { 
  position: fixed; 
  bottom: 1.75rem; right: 1.75rem;
  width: 400px; height: 580px;
  border-radius: var(--radius-lg);
  display: flex; flex-direction: column;
  z-index: 100; overflow: hidden;
  transform-origin: bottom right;
  transition: transform var(--transition-base), opacity var(--transition-base);
  opacity: 0; pointer-events: none; 
  transform: scale(0.95) translateY(10px);
  background: var(--canvas);
  border: 1px solid var(--hairline);
  box-shadow: var(--shadow-xl);
}
.chatbot-wrapper.is-open {
  opacity: 1; pointer-events: auto; 
  transform: scale(1) translateY(0);
}
.chat-header { 
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--hairline-cool);
  display: flex; align-items: center; justify-content: space-between;
  background: var(--canvas-soft);
}
.chat-header-left { display: flex; align-items: center; gap: 0.75rem; }
.ai-avatar {
  width: 38px; height: 38px;
  border-radius: var(--radius-md);
  background: var(--primary-bg);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem; position: relative;
}
.header-info { display: flex; flex-direction: column; }
.header-name {
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: var(--text-base);
  color: var(--ink);
}
.header-status {
  font-size: 0.75rem;
  color: var(--ink-mute);
  display: flex; align-items: center; gap: 0.35rem;
}
.status-dot { 
  width: 6px; height: 6px; 
  background: var(--success); 
  border-radius: 50%; 
}
.close-chat-btn { 
  background: transparent;
  border: 1px solid transparent;
  color: var(--ink-mute);
  width: 32px; height: 32px;
  border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}
.close-chat-btn:hover { 
  color: var(--ink); 
  background: var(--canvas);
  border-color: var(--hairline);
}
.chat-body { 
  flex: 1; overflow-y: auto; padding: 1.25rem; 
  display: flex; flex-direction: column; gap: 1rem; 
}
.msg { 
  display: flex; gap: 0.6rem; align-items: flex-start;
  animation: msgSlideIn 0.2s ease-out;
}
.msg.user { flex-direction: row-reverse; }
.msg-avatar {
  width: 28px; height: 28px;
  border-radius: var(--radius-sm);
  background: var(--primary-bg);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.85rem; flex-shrink: 0;
}
.msg-bubble { 
  max-width: 80%; padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  font-size: var(--text-sm); line-height: 1.5;
}
.msg.bot .msg-bubble { 
  background: var(--canvas-soft);
  border: 1px solid var(--hairline-cool);
  border-top-left-radius: 4px;
  color: var(--ink);
}
.msg.user .msg-bubble { 
  background: var(--primary-bg);
  border: 1px solid var(--primary-border);
  border-top-right-radius: 4px;
  color: var(--ink);
}
.quick-actions { 
  display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.85rem; 
}
.apply-build-btn {
  padding: 0.5rem 1rem; font-size: 0.85rem; font-weight: 500;
  border-radius: var(--radius-full);
  background: var(--primary); border: 1px solid var(--primary);
  color: var(--on-primary); cursor: pointer;
  transition: all var(--transition-fast);
  font-family: var(--font-sans); white-space: nowrap;
  box-shadow: var(--shadow-sm);
  display: flex; align-items: center; justify-content: center; width: 100%;
}
.apply-build-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  filter: brightness(1.1);
}
.typing-indicator { display: flex; gap: 0.6rem; align-items: flex-start; }
.typing-bubble {
  background: var(--canvas-soft);
  border: 1px solid var(--hairline-cool);
  border-radius: var(--radius-md); border-top-left-radius: 4px;
  padding: 0.85rem 1.2rem;
}
.typing-dots { display: flex; gap: 4px; align-items: center; }
.typing-dots span {
  width: 6px; height: 6px; border-radius: 50%; background: var(--ink-faint);
  animation: typingDot 1.4s infinite;
}
.typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.typing-dots span:nth-child(3) { animation-delay: 0.4s; }
.chat-input { 
  padding: 1rem 1.25rem;
  background: var(--canvas); border-top: 1px solid var(--hairline);
}
.input-wrapper {
  display: flex; gap: 0.6rem; align-items: center;
  background: var(--canvas-soft); border: 1px solid var(--hairline-cool);
  border-radius: var(--radius-full);
  padding: 0.3rem 0.4rem 0.3rem 1.1rem;
  transition: border-color var(--transition-fast);
}
.input-wrapper:focus-within {
  border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-bg);
}
.chat-input input { 
  flex: 1; padding: 0.55rem 0; border: none; background: transparent;
  color: var(--ink); font-family: var(--font-sans); font-size: var(--text-sm); outline: none;
}
.chat-input input::placeholder { color: var(--ink-faint); }
.send-btn { 
  background: var(--canvas); border: 1px solid var(--hairline); color: var(--ink-mute);
  width: 36px; height: 36px; border-radius: 50%;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all var(--transition-fast); flex-shrink: 0;
}
.send-btn.active {
  background: var(--primary); color: var(--on-primary); border-color: var(--primary);
}
.send-btn:hover { transform: scale(1.05); }
@keyframes msgSlideIn { 
  from { opacity: 0; transform: translateY(4px); } 
  to { opacity: 1; transform: translateY(0); } 
}
@keyframes typingDot {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-4px); opacity: 1; }
}
@media (max-width: 820px) {
  .chatbot-wrapper { 
    bottom: 0; right: 0; left: 0; width: 100%; height: 75vh;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  }
}
</style>
