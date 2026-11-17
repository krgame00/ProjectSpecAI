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
  background: rgba(17, 24, 39, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
}

.share-modal-card {
  background: var(--bg-surface, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  padding: 24px;
  color: var(--text-main, #111827);
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
  color: #059669;
  letter-spacing: 0.05em;
  display: block;
  margin-bottom: 4px;
}

.share-modal-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 18px;
  color: #6b7280;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.15s;
}

.btn-close:hover {
  background: #f3f4f6;
  color: #111827;
}

.share-summary-strip {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 10px 14px;
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin-bottom: 16px;
}

.summary-label {
  color: #6b7280;
  margin-right: 6px;
}

.share-input-section {
  margin-bottom: 20px;
}

.input-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 6px;
}

.url-input-wrap {
  display: flex;
  gap: 8px;
}

.share-url-field {
  flex: 1;
  padding: 9px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  background: #f9fafb;
  color: #111827;
  outline: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.share-url-field:focus {
  border-color: #10b981;
  background: #ffffff;
}

.btn-copy {
  padding: 9px 16px;
  font-size: 13px;
  white-space: nowrap;
}

.copy-success-tip {
  font-size: 12px;
  color: #059669;
  font-weight: 600;
  margin-top: 6px;
}

.qr-container {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 20px;
}

.qr-box {
  width: 90px;
  height: 90px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.qr-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.qr-loading {
  font-size: 10px;
  color: #9ca3af;
  text-align: center;
}

.qr-desc strong {
  display: block;
  font-size: 13px;
  margin-bottom: 4px;
}

.qr-desc p {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
  margin: 0;
}

.share-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-outline {
  background: #ffffff;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-outline:hover {
  background: #f9fafb;
}
</style>
