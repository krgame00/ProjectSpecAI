<template>
  <div class="chatbot-container">
    <!-- Chatbot FAB -->
    <button ref="launcherRef" class="chat-fab" v-show="!isOpen" @click="$emit('toggle-chat', true)" aria-label="เปิด SpecAI">
      <div class="fab-glow"></div>
      <div class="fab-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M21 11.5C21 16.75 16.75 21 11.5 21C10.08 21 8.73 20.69 7.5 20.13L3 21L3.87 16.5C3.31 15.27 3 13.92 3 12.5C3 7.25 7.25 3 12.5 3C17.75 3 21 6.25 21 11.5Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="8.5" cy="12" r="1" fill="currentColor"/><circle cx="12.5" cy="12" r="1" fill="currentColor"/><circle cx="16.5" cy="12" r="1" fill="currentColor"/></svg>
      </div>
      <div class="fab-pulse"></div>
    </button>

    <!-- Chatbot Window -->
    <div
      v-if="isOpen"
      ref="dialogRef"
      class="chatbot-wrapper"
      :class="{ 'is-open': isOpen }"
      role="dialog"
      aria-modal="true"
      aria-labelledby="specai-title"
      tabindex="-1"
    >
      <!-- Header -->
      <div class="chat-header">
        <div class="chat-header-left">
          <div class="ai-avatar">
            <div class="avatar-ring"></div>
            <span>🤖</span>
          </div>
          <div class="header-info">
            <span id="specai-title" class="header-name">SpecAI</span>
            <span class="header-status">
              <span class="status-dot"></span>
              ออนไลน์ · พร้อมช่วยเหลือ
            </span>
          </div>
        </div>
        <div class="chat-header-actions">
          <button class="clear-chat-btn" title="เริ่มการสนทนาใหม่" aria-label="เริ่มการสนทนาใหม่" @click="$emit('clear-chat')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
            <span>เริ่มใหม่</span>
          </button>
          <button class="close-chat-btn" aria-label="ปิด SpecAI" @click="$emit('toggle-chat', false)">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          </button>
        </div>
      </div>
      
      <!-- Chat Body -->
      <div v-if="isAuthenticated" class="chat-body" ref="chatBodyRef">
        <div v-for="(msg, index) in history" :key="index" :class="['msg', msg.role]">
          <div class="msg-avatar" v-if="msg.role === 'bot'">
            <span class="bot-emoji">🤖</span>
          </div>
          <div class="msg-bubble">
            <div v-if="msg.image" class="msg-image">
               <img :src="msg.image" alt="Uploaded Image" />
            </div>
            <div class="msg-content">
              <span v-html="renderSafeMarkdown(msg.text)"></span>
              <span v-if="msg.isStreaming" class="streaming-caret" aria-hidden="true"></span>
            </div>
            <div v-if="sanitizeSources(msg.sources).length" class="sources-container">
              <a v-for="(source, idx) in sanitizeSources(msg.sources)" :key="idx" :href="source.uri" target="_blank" rel="noopener noreferrer" class="source-chip">
                🌐 {{ source.title.length > 25 ? source.title.substring(0, 25) + '...' : source.title }}
              </a>
            </div>
            <div v-if="msg.recommended_build" class="quick-actions">
              <button class="apply-build-btn" @click="$emit('apply-build', msg.recommended_build)">
                ✨ นำสเปคนี้ใส่ตะกร้า
              </button>
            </div>
          </div>
        </div>

        <!-- Modern Supabase-inspired Thinking Animation -->
        <div v-if="isTyping" class="typing-indicator" data-test="typing-indicator">
          <div class="msg-avatar thinking-avatar">
            <div class="avatar-ring"></div>
            <span class="bot-emoji">🤖</span>
          </div>
          <div class="typing-bubble thinking-bubble">
            <div class="thinking-header">
              <div class="thinking-badge">
                <span class="sparkle-icon">✨</span>
                <span class="thinking-text">SpecAI กำลังวิเคราะห์ข้อมูล...</span>
              </div>
              <div class="typing-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
            <div class="thinking-skeleton">
              <div class="skeleton-shimmer-bar bar-1"></div>
              <div class="skeleton-shimmer-bar bar-2"></div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="guest-chat-access" data-test="guest-chat-access">
        <h2>เข้าสู่ระบบเพื่อใช้งาน SpecAI</h2>
        <p>กรุณาเข้าสู่ระบบก่อน เพื่อใช้งานผู้ช่วย SpecAI</p>
        <button type="button" data-test="chat-login" @click="$emit('request-login')">
          เข้าสู่ระบบ
        </button>
      </div>
      
      <!-- Input -->
      <div v-if="isAuthenticated" class="chat-input-container">
        <div class="image-preview" v-if="selectedImagePreview">
          <div class="image-preview-wrapper">
             <img :src="selectedImagePreview" />
             <button class="clear-image-btn" aria-label="นำรูปภาพออก" @click="clearImage">✕</button>
          </div>
        </div>
        <div class="chat-input">
          <div class="input-wrapper">
            <button class="attach-btn" aria-label="แนบรูปภาพ" @click="fileInput.click()">
              📎
            </button>
            <input type="file" ref="fileInput" @change="handleFileChange" accept="image/*" style="display:none" />
            
            <input 
              type="text" 
              v-model="userInput" 
              @keyup.enter="handleSend" 
              placeholder="พิมพ์เป้าหมาย เช่น เน้นเล่นเกม..."
            >
            <button class="send-btn" aria-label="ส่งข้อความ" @click="handleSend" :class="{ active: userInput.trim() || selectedImageBase64 }">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import { renderSafeMarkdown, sanitizeSources } from '../utils/chatSecurity';
import { useDialogFocus } from '../composables/useDialogFocus';

const props = defineProps({
  isOpen: Boolean,
  isAuthenticated: {
    type: Boolean,
    default: false
  },
  history: Array,
  isTyping: Boolean
});

const emit = defineEmits(['toggle-chat', 'send-message', 'apply-build', 'request-login', 'clear-chat']);
const dialogRef = ref(null);
const launcherRef = ref(null);
const closeDialog = () => emit('toggle-chat', false);
useDialogFocus(() => props.isOpen, dialogRef, closeDialog, launcherRef);

const chatBodyRef = ref(null);
const isNearBottom = () => {
  const el = chatBodyRef.value;
  if (!el) return true;
  // ถ้าผู้ใช้อยู่ห่างจากด้านล่างเกิน 120px ถือว่ากำลังอ่านข้อความเก่า → ไม่เด้งลง
  return el.scrollHeight - el.scrollTop - el.clientHeight < 120;
};
const scrollToBottom = () => {
  nextTick(() => {
    const el = chatBodyRef.value;
    if (el && isNearBottom()) {
      el.scrollTop = el.scrollHeight;
    }
  });
};

watch(() => props.history, () => {
  scrollToBottom();
}, { deep: true });

watch(() => props.isTyping, () => {
  scrollToBottom();
});

const userInput = ref('');
const fileInput = ref(null);
const selectedImageBase64 = ref(null);
const selectedImagePreview = ref(null);
const selectedImageMime = ref(null);
let activeImageReader = null;
let imageReadGeneration = 0;

const cancelActiveImageRead = () => {
  imageReadGeneration += 1;
  const reader = activeImageReader;
  activeImageReader = null;
  if (typeof reader?.abort === 'function') {
    reader.abort();
  }
};

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  cancelActiveImageRead();
  const generation = imageReadGeneration;
  const reader = new FileReader();
  activeImageReader = reader;
  reader.onload = (e) => {
    if (
      generation !== imageReadGeneration ||
      reader !== activeImageReader ||
      !props.isAuthenticated
    ) return;
    activeImageReader = null;
    selectedImagePreview.value = e.target.result;
    selectedImageMime.value = file.type;
    selectedImageBase64.value = e.target.result.split(',')[1];
  };
  reader.readAsDataURL(file);
};

const clearImage = () => {
  cancelActiveImageRead();
  selectedImagePreview.value = null;
  selectedImageBase64.value = null;
  selectedImageMime.value = null;
  if (fileInput.value) fileInput.value.value = '';
};

watch(() => props.isAuthenticated, (isAuthenticated) => {
  if (!isAuthenticated) {
    userInput.value = '';
    clearImage();
  }
});

const handleSend = () => {
  if (userInput.value.trim() || selectedImageBase64.value) {
    let imageObj = null;
    if (selectedImageBase64.value) {
      imageObj = { data: selectedImageBase64.value, mimeType: selectedImageMime.value };
    }
    emit('send-message', { text: userInput.value, image: imageObj });
    userInput.value = '';
    clearImage();
    // ผู้ใช้ส่งข้อความ → เด้งลงล่างเสมอ (แม้กำลังเลื่อนดูของเก่า)
    nextTick(() => {
      const el = chatBodyRef.value;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }
};

</script>

<style scoped>
.chatbot-container { position: relative; }
.chat-fab { 
  position: fixed; 
  bottom: max(2rem, calc(1rem + env(safe-area-inset-bottom)));
  right: max(2rem, calc(1rem + env(safe-area-inset-right)));
  width: 60px; height: 60px;
  border-radius: 50%;
  background: var(--canvas-night);
  color: var(--on-dark);
  border: none;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: var(--shadow-lg);
  z-index: var(--z-chat);
  transition: all var(--transition-normal);
}
.chat-fab:hover { 
  transform: translateY(-2px); 
  box-shadow: var(--shadow-xl);
}
.fab-glow {
  position: absolute; inset: 0; border-radius: 50%;
  background: var(--primary); filter: blur(12px); opacity: 0.2;
}
.fab-pulse {
  position: absolute; inset: -4px; border-radius: 50%;
  border: 1px solid var(--primary); opacity: 0;
  animation: fabPulse 2.5s cubic-bezier(0.16, 1, 0.3, 1) infinite;
}
.fab-icon-wrap { position: relative; z-index: 2; font-size: 1.5rem; }
.chatbot-wrapper { 
  position: fixed; 
  bottom: 1.75rem; right: 1.75rem;
  width: 400px; height: 580px;
  border-radius: var(--radius-lg);
  display: flex; flex-direction: column;
  z-index: var(--z-chat); overflow: hidden;
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
.chat-header-actions {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}
.clear-chat-btn {
  background: var(--canvas-soft);
  border: 1px solid var(--hairline-cool);
  color: var(--ink-mute);
  height: 32px;
  padding: 0 0.65rem;
  border-radius: var(--radius-sm);
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
  font-size: 0.75rem;
  font-family: var(--font-sans);
  font-weight: 500;
  transition: all var(--transition-fast);
}
.clear-chat-btn:hover {
  color: var(--ink);
  background: var(--canvas);
  border-color: var(--hairline-strong);
}
.close-chat-btn { 
  background: transparent;
  border: 1px solid transparent;
  color: var(--ink-mute);
  width: 44px; height: 44px;
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
.guest-chat-access {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.85rem;
  padding: 2rem;
  text-align: center;
}
.guest-chat-access h2 {
  margin: 0;
  color: var(--ink);
  font-size: var(--text-xl);
  line-height: 1.35;
}
.guest-chat-access p {
  margin: 0;
  color: var(--ink-mute);
  font-size: var(--text-sm);
  line-height: 1.6;
}
.guest-chat-access button {
  margin-top: 0.35rem;
  padding: 0.7rem 1.25rem;
  border: 1px solid var(--primary);
  border-radius: var(--radius-full);
  background: var(--primary);
  color: var(--on-primary);
  font-family: var(--font-sans);
  font-weight: 600;
  cursor: pointer;
  min-height: 44px;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}
.guest-chat-access button:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
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
  max-width: 85%; padding: 0.75rem 1rem;
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
  background: var(--canvas-night-soft);
  border: 1px solid var(--hairline-strong);
  border-top-right-radius: 4px;
  color: var(--ink);
}
.msg-content {
  font-size: var(--text-sm);
  line-height: 1.6;
  word-break: break-word;
}
.msg-content p {
  margin: 0 0 0.5rem 0;
}
.msg-content p:last-child {
  margin-bottom: 0;
}
.msg-content ul,
.msg-content ol {
  margin: 0.35rem 0 0.5rem 1.25rem;
  padding: 0;
}
.msg-content li {
  margin-bottom: 0.25rem;
}
.msg-content h1,
.msg-content h2,
.msg-content h3,
.msg-content h4 {
  margin: 0.75rem 0 0.35rem 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--ink);
}
.msg-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 0.75rem 0;
  font-size: 0.8rem;
  background: var(--canvas);
  border-radius: var(--radius-sm);
  border: 1px solid var(--hairline-cool);
  display: block;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.msg-content th,
.msg-content td {
  padding: 0.45rem 0.65rem;
  text-align: left;
  border: 1px solid var(--hairline-cool);
  vertical-align: top;
}
.msg-content th {
  background: var(--canvas-night-soft);
  color: var(--ink);
  font-weight: 600;
  white-space: nowrap;
}
.msg-content tr:nth-child(even) td {
  background: rgba(0, 0, 0, 0.02);
}
.msg-content code {
  background: var(--canvas-night-soft);
  padding: 0.15rem 0.35rem;
  border-radius: 4px;
  font-size: 0.85em;
  font-family: monospace;
  border: 1px solid var(--hairline-cool);
}
.msg-content pre {
  background: var(--canvas-night);
  padding: 0.65rem 0.85rem;
  border-radius: var(--radius-sm);
  overflow-x: auto;
  border: 1px solid var(--hairline);
  margin: 0.5rem 0;
}
.msg-content pre code {
  background: transparent;
  padding: 0;
  border: none;
}
.quick-actions { 
  display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.85rem; 
}
.apply-build-btn {
  padding: 0.6rem 1rem; font-size: 0.85rem; font-weight: 500;
  border-radius: var(--radius-full);
  background: transparent; border: 1px solid var(--primary-border);
  color: var(--primary-deep); cursor: pointer;
  transition: all var(--transition-normal);
  font-family: var(--font-sans); white-space: nowrap;
  display: flex; align-items: center; justify-content: center; width: 100%;
}
.apply-build-btn:hover {
  background: var(--primary-bg);
  border-color: var(--primary);
  color: var(--primary);
  transform: translateY(-2px);
}
.typing-indicator {
  display: flex;
  gap: 0.65rem;
  align-items: flex-start;
  animation: typingSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.thinking-avatar {
  position: relative;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  background: var(--primary-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  flex-shrink: 0;
  box-shadow: 0 0 10px rgba(62, 207, 142, 0.35);
}

.avatar-ring {
  position: absolute;
  inset: -3px;
  border-radius: calc(var(--radius-sm) + 2px);
  border: 1.5px solid var(--primary);
  opacity: 0.8;
  animation: avatarGlowPulse 1.8s cubic-bezier(0.16, 1, 0.3, 1) infinite;
  pointer-events: none;
}

.thinking-bubble {
  background: var(--canvas);
  border: 1px solid var(--hairline-cool);
  border-radius: var(--radius-md);
  border-top-left-radius: 4px;
  padding: 0.75rem 1rem;
  box-shadow: 0 4px 16px -2px rgba(62, 207, 142, 0.08), 0 0 0 1px rgba(62, 207, 142, 0.12);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 200px;
  max-width: 80%;
  animation: thinkingGlow 2.4s ease-in-out infinite alternate;
}

.thinking-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.thinking-badge {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.sparkle-icon {
  font-size: 0.8rem;
  display: inline-block;
  animation: sparkleTwinkle 2s ease-in-out infinite;
}

.thinking-text {
  font-size: 0.75rem;
  font-weight: 500;
  font-family: var(--font-sans);
  background: linear-gradient(90deg, var(--ink) 0%, var(--primary-deep) 50%, var(--ink) 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: textShimmer 2.2s linear infinite;
  letter-spacing: -0.01em;
}

.typing-dots {
  display: flex;
  gap: 3.5px;
  align-items: center;
}

.typing-dots span {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--primary);
  animation: typingDot 1.4s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

.thinking-skeleton {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100%;
}

.skeleton-shimmer-bar {
  height: 6px;
  border-radius: 3px;
  background: linear-gradient(90deg, rgba(223, 223, 223, 0.45) 0%, rgba(62, 207, 142, 0.22) 50%, rgba(223, 223, 223, 0.45) 100%);
  background-size: 200% 100%;
  animation: skeletonWave 1.6s ease-in-out infinite;
}

.skeleton-shimmer-bar.bar-1 {
  width: 92%;
}

.skeleton-shimmer-bar.bar-2 {
  width: 65%;
  animation-delay: 0.25s;
}

.streaming-caret {
  display: inline-block;
  width: 2.5px;
  height: 1em;
  background: var(--primary);
  vertical-align: -0.15em;
  margin-left: 3px;
  border-radius: 1px;
  animation: caretBlink 0.75s ease-in-out infinite;
}
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
  width: 44px; height: 44px; border-radius: 50%;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all var(--transition-fast); flex-shrink: 0;
}
.send-btn.active {
  background: var(--primary); color: var(--on-primary); border-color: var(--primary);
}
.send-btn:hover { transform: scale(1.05); }

/* New CSS for Image and Sources */
.msg-image img { max-width: 100%; border-radius: 8px; margin-bottom: 8px; }
.sources-container { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px; }
.source-chip {
  font-size: 0.7rem; color: var(--primary); background: var(--primary-bg);
  padding: 2px 8px; border-radius: 12px; text-decoration: none; border: 1px solid var(--primary-border);
  transition: all 0.2s; white-space: nowrap;
}
.source-chip:hover { background: var(--primary); color: var(--on-primary); }

.chat-input-container { background: var(--canvas); border-top: 1px solid var(--hairline); }
.chat-input { padding: 1rem 1.25rem; }
.image-preview { padding: 1rem 1.25rem 0; display: flex; }
.image-preview-wrapper { position: relative; display: inline-block; }
.image-preview-wrapper img { height: 60px; border-radius: 8px; border: 1px solid var(--hairline-strong); }
.clear-image-btn {
  position: absolute; top: -6px; right: -6px; background: var(--danger); color: white;
  border: none; border-radius: 50%; width: 44px; height: 44px; font-size: 14px; cursor: pointer;
  transform: translate(12px, -12px);
}
.attach-btn {
  background: transparent; border: none; font-size: 1.2rem; cursor: pointer;
  width: 44px; height: 44px; padding: 0; color: var(--ink-mute); transition: color 0.2s;
  display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.attach-btn:hover { color: var(--primary); }

@keyframes msgSlideIn { 
  from { opacity: 0; transform: translateY(4px); } 
  to { opacity: 1; transform: translateY(0); } 
}
@keyframes typingSlideIn {
  from {
    opacity: 0;
    transform: translateY(6px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
@keyframes thinkingGlow {
  0% {
    box-shadow: 0 4px 16px -2px rgba(62, 207, 142, 0.06), 0 0 0 1px rgba(62, 207, 142, 0.1);
  }
  100% {
    box-shadow: 0 6px 22px -2px rgba(62, 207, 142, 0.18), 0 0 0 1px rgba(62, 207, 142, 0.28);
  }
}
@keyframes avatarGlowPulse {
  0% {
    transform: scale(0.94);
    opacity: 0.9;
  }
  50% {
    transform: scale(1.18);
    opacity: 0.25;
  }
  100% {
    transform: scale(0.94);
    opacity: 0.9;
  }
}
@keyframes sparkleTwinkle {
  0%, 100% {
    transform: rotate(0deg) scale(1);
    opacity: 0.8;
  }
  50% {
    transform: rotate(180deg) scale(1.2);
    opacity: 1;
  }
}
@keyframes textShimmer {
  0% {
    background-position: 0% center;
  }
  100% {
    background-position: 200% center;
  }
}
@keyframes skeletonWave {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}
@keyframes caretBlink {
  0%, 100% {
    opacity: 1;
    transform: scaleY(1);
  }
  50% {
    opacity: 0.1;
    transform: scaleY(0.7);
  }
}
@keyframes typingDot {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.3; }
  30% { transform: translateY(-5px); opacity: 1; }
}
@keyframes fabPulse {
  0% { transform: scale(1); opacity: 0.5; }
  100% { transform: scale(1.4); opacity: 0; }
}
@media (max-width: 820px) {
  .chatbot-wrapper { 
    inset: 0;
    width: 100%;
    height: 100vh;
    height: 100dvh;
    border-radius: 0;
    border: 0;
  }
  .chat-header {
    padding-top: calc(0.75rem + env(safe-area-inset-top));
    padding-right: calc(0.75rem + env(safe-area-inset-right));
    padding-left: calc(0.75rem + env(safe-area-inset-left));
  }
  .chat-body,
  .guest-chat-access {
    padding-right: calc(1rem + env(safe-area-inset-right));
    padding-left: calc(1rem + env(safe-area-inset-left));
  }
  .chat-input {
    padding-right: calc(0.75rem + env(safe-area-inset-right));
    padding-bottom: calc(0.75rem + env(safe-area-inset-bottom));
    padding-left: calc(0.75rem + env(safe-area-inset-left));
  }
  .chat-input input { font-size: 1rem; }
}
</style>
