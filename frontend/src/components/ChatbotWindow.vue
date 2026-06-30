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
            <div v-html="msg.text"></div>
            <div v-if="msg.presets" class="quick-actions">
              <button v-for="p in msg.presets" :key="p.id" class="preset-btn" @click="$emit('apply-preset', p.id)">
                {{ p.label }}
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

const emit = defineEmits(['toggle-chat', 'send-message', 'apply-preset']);

const userInput = ref('');

const handleSend = () => {
  if (userInput.value.trim()) {
    emit('send-message', userInput.value);
    userInput.value = '';
  }
};
</script>

<style scoped>
/* FAB Button */
.chat-fab { 
  position: fixed; 
  bottom: 1.75rem; 
  right: 1.75rem;
  width: 58px; 
  height: 58px;
  background: var(--gradient-accent);
  color: #000;
  border: none; 
  border-radius: var(--radius-lg);
  display: flex; 
  align-items: center; 
  justify-content: center;
  cursor: pointer;
  z-index: 100;
  transition: all var(--transition-base);
  overflow: visible;
}
.fab-icon {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}
.fab-glow {
  position: absolute;
  inset: -4px;
  border-radius: inherit;
  background: var(--gradient-accent);
  opacity: 0.3;
  filter: blur(12px);
  z-index: 0;
  transition: opacity var(--transition-base);
}
.fab-pulse {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border: 2px solid var(--accent);
  animation: fabPulse 2s ease-out infinite;
  z-index: 1;
}
.chat-fab:hover { 
  transform: scale(1.08); 
}
.chat-fab:hover .fab-glow { opacity: 0.5; }

/* Chat Window */
.chatbot-wrapper { 
  position: fixed; 
  bottom: 1.75rem; 
  right: 1.75rem;
  width: 400px; 
  height: 580px;
  border-radius: var(--radius-xl);
  display: flex; 
  flex-direction: column;
  z-index: 100; 
  overflow: hidden;
  transform-origin: bottom right;
  transition: transform var(--transition-base), opacity var(--transition-base);
  opacity: 0; 
  pointer-events: none; 
  transform: scale(0.9) translateY(20px);
  background: rgba(10, 11, 15, 0.95);
  backdrop-filter: blur(30px) saturate(1.5);
  -webkit-backdrop-filter: blur(30px) saturate(1.5);
  border: 1px solid var(--border-hover);
  box-shadow: 0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(0, 212, 255, 0.05);
}
.chatbot-wrapper.is-open {
  opacity: 1; 
  pointer-events: auto; 
  transform: scale(1) translateY(0);
}

/* Header */
.chat-header { 
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border);
  display: flex; 
  align-items: center; 
  justify-content: space-between;
  background: rgba(0,0,0,0.2);
}
.chat-header-left { 
  display: flex; 
  align-items: center; 
  gap: 0.75rem; 
}
.ai-avatar {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-md);
  background: var(--accent-transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  position: relative;
}
.avatar-ring {
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  border: 1.5px solid var(--accent);
  opacity: 0.3;
}
.header-info {
  display: flex;
  flex-direction: column;
}
.header-name {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--text-base);
  color: var(--fg-bright);
}
.header-status {
  font-size: 0.7rem;
  color: var(--muted);
  display: flex;
  align-items: center;
  gap: 0.35rem;
}
.status-dot { 
  width: 6px; 
  height: 6px; 
  background: var(--success); 
  border-radius: 50%; 
  box-shadow: 0 0 6px var(--success);
  animation: pulse 2s infinite;
}
.close-chat-btn { 
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--border);
  color: var(--muted);
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}
.close-chat-btn:hover { 
  color: var(--fg); 
  background: rgba(255,255,255,0.08);
  border-color: var(--border-hover);
}

/* Chat Body */
.chat-body { 
  flex: 1; 
  overflow-y: auto; 
  padding: 1.25rem; 
  display: flex; 
  flex-direction: column; 
  gap: 1rem; 
}
.msg { 
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;
  animation: msgSlideIn 0.3s ease;
}
.msg.user {
  flex-direction: row-reverse;
}
.msg-avatar {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  background: var(--accent-transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  flex-shrink: 0;
}
.msg-bubble { 
  max-width: 80%;
  padding: 0.85rem 1rem;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  line-height: 1.6;
}
.msg.bot .msg-bubble { 
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--border);
  border-top-left-radius: 4px;
  color: var(--fg);
}
.msg.user .msg-bubble { 
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.12) 0%, rgba(124, 92, 252, 0.12) 100%);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-top-right-radius: 4px;
  color: var(--fg);
}

/* Quick Action Presets */
.quick-actions { 
  display: flex; 
  flex-wrap: wrap; 
  gap: 0.4rem; 
  margin-top: 0.85rem; 
}
.preset-btn {
  padding: 0.35rem 0.7rem;
  font-size: 0.72rem;
  border-radius: var(--radius-full);
  background: transparent;
  border: 1px solid var(--border-hover);
  color: var(--fg);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: var(--font-body);
  white-space: nowrap;
}
.preset-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-transparent);
}

/* Typing */
.typing-indicator { 
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;
}
.typing-bubble {
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  border-top-left-radius: 4px;
  padding: 0.85rem 1.2rem;
}
.typing-dots {
  display: flex;
  gap: 4px;
  align-items: center;
}
.typing-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--muted);
  animation: typingDot 1.4s infinite;
}
.typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.typing-dots span:nth-child(3) { animation-delay: 0.4s; }

/* Input */
.chat-input { 
  padding: 1rem 1.25rem;
  background: rgba(0,0,0,0.25);
  border-top: 1px solid var(--border);
}
.input-wrapper {
  display: flex;
  gap: 0.6rem;
  align-items: center;
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--border);
  border-radius: var(--radius-full);
  padding: 0.3rem 0.4rem 0.3rem 1.1rem;
  transition: border-color var(--transition-fast);
}
.input-wrapper:focus-within {
  border-color: rgba(0, 212, 255, 0.3);
  box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.06);
}
.chat-input input { 
  flex: 1;
  padding: 0.55rem 0;
  border: none;
  background: transparent;
  color: var(--fg);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  outline: none;
}
.chat-input input::placeholder {
  color: var(--muted);
  opacity: 0.5;
}
.send-btn { 
  background: rgba(255,255,255,0.05);
  color: var(--muted);
  border: none;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}
.send-btn.active {
  background: var(--gradient-accent);
  color: #000;
}
.send-btn:hover { 
  transform: scale(1.05);
}

/* Animations */
@keyframes pulse { 
  0%, 100% { opacity: 0.6; } 
  50% { opacity: 1; box-shadow: 0 0 10px var(--success); } 
}
@keyframes fabPulse {
  0% { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(1.5); opacity: 0; }
}
@keyframes msgSlideIn { 
  from { opacity: 0; transform: translateY(8px); } 
  to { opacity: 1; transform: translateY(0); } 
}
@keyframes typingDot {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.3; }
  30% { transform: translateY(-4px); opacity: 1; }
}

/* Mobile */
@media (max-width: 820px) {
  .chatbot-wrapper { 
    bottom: 0; right: 0; left: 0;
    width: 100%; 
    height: 65vh;
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  }
}
</style>
