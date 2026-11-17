<template>
  <div 
    v-if="isOpen" 
    class="modal-backdrop" 
    role="dialog" 
    aria-modal="true" 
    aria-labelledby="share-modal-title"
    @click.self="$emit('close')"
  >
    <div class="share-modal-card">
      <!-- Modal Header -->
      <div class="share-modal-header">
        <div class="header-left">
          <span class="badge-emerald">FORGELABS // SHARE</span>
          <h2 id="share-modal-title" class="share-modal-title">แชร์สเปกคอมพิวเตอร์</h2>
        </div>
        <button 
          type="button" 
          class="btn-close" 
          aria-label="ปิดหน้าต่าง"
          @click="$emit('close')"
        >
          ✕
        </button>
      </div>

      <!-- Quick Summary -->
      <div class="share-summary-strip font-mono">
        <div>
          <span class="summary-label">ยอดรวมโดยประมาณ:</span>
          <strong class="text-emerald">฿{{ (totalPrice || 0).toLocaleString() }}</strong>
        </div>
        <div>
          <span class="summary-label">จำนวนอุปกรณ์:</span>
          <span>{{ itemCount || 0 }} รายการ</span>
        </div>
      </div>

      <!-- URL Input & Copy -->
      <div class="share-input-section">
        <label for="share-url-input" class="input-label">ลิงก์แชร์สเปก (เปิดได้ทุกอุปกรณ์โดยไม่ต้องล็อกอิน)</label>
        <div class="url-input-wrap">
          <input 
            id="share-url-input" 
            ref="urlInput"
            type="text" 
            class="share-url-field font-mono" 
            readonly 
            :value="shareUrl" 
            @focus="$event.target.select()"
          />
          <button 
            type="button" 
            class="btn btn-primary btn-copy"
            @click="handleCopy"
          >
            <span v-if="isCopied">✓ คัดลอกแล้ว</span>
            <span v-else>คัดลอกลิงก์</span>
          </button>
        </div>
        <p v-if="isCopied" class="copy-success-tip">✓ คัดลอกลิงก์สเปกลงคลิปบอร์ดเรียบร้อยแล้ว</p>
      </div>

      <!-- QR Code Section -->
      <div class="qr-container">
        <div class="qr-box">
          <img v-if="qrDataUrl" :src="qrDataUrl" alt="QR Code สเปกคอม" class="qr-image" />
          <div v-else class="qr-loading">กำลังสร้าง QR Code...</div>
        </div>
        <div class="qr-desc">
          <strong>📱 สแกนเพื่อเปิดบนมือถือ</strong>
          <p>เปิดกล้องโทรศัพท์มือถือแล้วสแกน QR Code นี้ เพื่อดูสเปกและเช็กราคาได้ทันทีที่หน้าร้าน</p>
        </div>
      </div>

      <!-- Actions Footer -->
      <div class="share-modal-footer">
        <button type="button" class="btn btn-secondary" @click="handlePrint">
          🖨️ พิมพ์ใบเสนอราคา (PDF)
        </button>
        <button type="button" class="btn btn-outline" @click="$emit('close')">
          ปิดหน้าต่าง
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import QRCode from 'qrcode';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  shareUrl: {
    type: String,
    default: ''
  },
  totalPrice: {
    type: Number,
    default: 0
  },
  itemCount: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['close']);

const isCopied = ref(false);
const qrDataUrl = ref('');
const urlInput = ref(null);

const generateQr = async (url) => {
  if (!url) {
    qrDataUrl.value = '';
    return;
  }
  try {
    qrDataUrl.value = await QRCode.toDataURL(url, {
      width: 150,
      margin: 1,
      color: {
        dark: '#111827',
        light: '#ffffff'
      }
    });
  } catch (e) {
    qrDataUrl.value = '';
  }
};

watch(() => props.shareUrl, (newUrl) => {
  if (props.isOpen && newUrl) {
    generateQr(newUrl);
  }
}, { immediate: true });

watch(() => props.isOpen, (open) => {
  if (open) {
    isCopied.value = false;
    if (props.shareUrl) {
      generateQr(props.shareUrl);
    }
  }
});

const handleCopy = async () => {
  if (!props.shareUrl) return;
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(props.shareUrl);
    } else if (urlInput.value) {
      urlInput.value.select();
      document.execCommand('copy');
    }
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 2500);
  } catch (err) {
    if (urlInput.value) {
      urlInput.value.select();
    }
  }
};

const handlePrint = () => {
  emit('close');
  setTimeout(() => {
    window.print();
  }, 100);
};
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
}

.share-modal-card {
  background: var(--canvas-night, #171717);
  border: 1px solid var(--hairline-cool, rgba(255, 255, 255, 0.12));
  border-radius: var(--radius-lg, 12px);
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  padding: 24px;
  color: var(--ink, #ffffff);
  animation: modalFadeIn 0.15s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.97);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.share-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.badge-emerald {
  font-size: 11px;
  font-weight: 700;
  color: var(--primary, #3ecf8e);
  letter-spacing: 0.05em;
  display: block;
  margin-bottom: 4px;
}

.share-modal-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--on-dark, #ffffff);
  margin: 0;
}

.btn-close {
  background: transparent;
  border: 1px solid transparent;
  font-size: 16px;
  color: var(--ink-mute, #a1a1aa);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--radius-sm, 6px);
  transition: all 0.15s;
}

.btn-close:hover {
  background: var(--canvas-soft, #27272a);
  border-color: var(--hairline-cool, rgba(255, 255, 255, 0.12));
  color: var(--ink, #ffffff);
}

.share-summary-strip {
  background: var(--canvas-soft, #1f1f23);
  border: 1px solid var(--hairline-cool, rgba(255, 255, 255, 0.12));
  border-radius: var(--radius-sm, 6px);
  padding: 10px 14px;
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin-bottom: 16px;
  color: var(--ink, #ffffff);
}

.summary-label {
  color: var(--ink-mute, #a1a1aa);
  margin-right: 6px;
}

.share-input-section {
  margin-bottom: 20px;
}

.input-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-mute, #a1a1aa);
  margin-bottom: 6px;
}

.url-input-wrap {
  display: flex;
  gap: 8px;
}

.share-url-field {
  flex: 1;
  padding: 9px 12px;
  border: 1px solid var(--hairline-cool, rgba(255, 255, 255, 0.15));
  border-radius: var(--radius-sm, 6px);
  font-size: 13px;
  background: var(--canvas-soft, #1f1f23);
  color: var(--ink, #ffffff);
  outline: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: border-color var(--transition-fast, 0.15s);
}

.share-url-field:focus {
  border-color: var(--primary, #3ecf8e);
  background: var(--canvas-night, #171717);
}

.btn-copy {
  padding: 9px 16px;
  font-size: 13px;
  white-space: nowrap;
}

.copy-success-tip {
  font-size: 12px;
  color: var(--primary, #3ecf8e);
  font-weight: 600;
  margin-top: 6px;
}

.qr-container {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px;
  background: var(--canvas-soft, #1f1f23);
  border: 1px solid var(--hairline-cool, rgba(255, 255, 255, 0.12));
  border-radius: var(--radius-md, 8px);
  margin-bottom: 20px;
}

.qr-box {
  width: 90px;
  height: 90px;
  background: #ffffff;
  border: 1px solid var(--hairline-cool, rgba(255, 255, 255, 0.12));
  border-radius: var(--radius-sm, 6px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  padding: 4px;
}

.qr-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.qr-loading {
  font-size: 10px;
  color: var(--ink-mute, #a1a1aa);
  text-align: center;
}

.qr-desc strong {
  display: block;
  font-size: 13px;
  color: var(--ink, #ffffff);
  margin-bottom: 4px;
}

.qr-desc p {
  font-size: 12px;
  color: var(--ink-mute, #a1a1aa);
  line-height: 1.4;
  margin: 0;
}

.share-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-outline {
  background: var(--canvas-soft, #1f1f23);
  border: 1px solid var(--hairline-cool, rgba(255, 255, 255, 0.15));
  color: var(--ink, #ffffff);
  padding: 8px 16px;
  border-radius: var(--radius-sm, 6px);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-outline:hover {
  background: var(--canvas-night, #27272a);
  border-color: var(--hairline-strong, rgba(255, 255, 255, 0.25));
}
</style>
