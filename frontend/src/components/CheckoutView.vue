<template>
  <div class="container checkout-view">
    <div class="header-action">
      <button class="btn btn-outline" @click="router.push('/build')">← กลับไปหน้าจัดสเปค</button>
      <h2 style="margin: 0;">สรุปรายการสั่งซื้อ</h2>
    </div>
    
    <div v-if="!builderStore.hasAnyComponent" class="empty-state">
      <div class="empty-icon">🛒</div>
      <h3>ตะกร้าสินค้าว่างเปล่า</h3>
      <p>คุณยังไม่ได้เลือกฮาร์ดแวร์ใดๆ กรุณากลับไปที่หน้าจัดสเปคเพื่อเลือกสินค้าเข้าตะกร้า</p>
      <button class="btn btn-primary" @click="router.push('/build')">เริ่มจัดสเปคเลย</button>
    </div>

    <div v-else class="checkout-grid">
      <div class="left-col">
        <div class="panel glass-panel">
          <h3>รายการฮาร์ดแวร์ที่เลือก</h3>
          <div v-for="cat in categories" :key="'co-'+cat.id">
            <div v-if="builderStore.build[cat.id]" class="checkout-item-row">
              <div class="checkout-item-info">
                <div class="checkout-item-img">
                  <img :src="getItem(cat.id, builderStore.build[cat.id]).image" alt="">
                </div>
                <div>
                  <div class="item-cat">{{ cat.name }}</div>
                  <div class="item-name">{{ getItem(cat.id, builderStore.build[cat.id]).name }}</div>
                </div>
              </div>
              <div class="checkout-item-price">฿{{ getItem(cat.id, builderStore.build[cat.id]).price.toLocaleString() }}</div>
            </div>
          </div>
        </div>

        <div class="panel glass-panel">
          <h3>ข้อมูลการจัดส่ง</h3>
          <div class="form-group">
            <label>ชื่อ-นามสกุล ผู้รับ <span class="required">*</span></label>
            <input type="text" class="form-control" v-model="customer.name" placeholder="ระบุชื่อ-นามสกุล" :class="{ 'input-error': errorMessage && !customer.name.trim() }">
          </div>
          <div class="form-group">
            <label>ที่อยู่สำหรับจัดส่ง</label>
            <textarea class="form-control" v-model="customer.address" rows="3" placeholder="ระบุที่อยู่จัดส่งแบบครบถ้วน"></textarea>
          </div>
          <div class="form-group">
            <label>เบอร์โทรศัพท์</label>
            <input type="text" class="form-control" v-model="customer.phone" placeholder="08X-XXX-XXXX">
          </div>
          
          <div v-if="errorMessage" class="error-message">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 5V8.5M8 11H8.01M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            <span>{{ errorMessage }}</span>
          </div>
        </div>
      </div>

      <div class="right-col">
        <div class="panel glass-panel sticky">
          <h3>บริการประกอบเครื่อง</h3>
          <div class="radio-group">
            <label class="radio-label" :class="{ active: assemblyChoice === 'none' }">
              <input type="radio" v-model="assemblyChoice" value="none">
              <div class="radio-content">
                <span>นำชิ้นส่วนไปประกอบเอง</span>
                <span class="free">ฟรี</span>
              </div>
            </label>
            <label class="radio-label" :class="{ active: assemblyChoice === 'standard' }">
              <input type="radio" v-model="assemblyChoice" value="standard">
              <div class="radio-content">
                <span>ประกอบมาตรฐาน</span>
                <span class="cost">+฿500</span>
              </div>
            </label>
            <label class="radio-label" :class="{ active: assemblyChoice === 'premium' }">
              <input type="radio" v-model="assemblyChoice" value="premium">
              <div class="radio-content">
                <span>ประกอบพรีเมียม (จัดสายสวยงาม)</span>
                <span class="cost">+฿1,000</span>
              </div>
            </label>
          </div>
          
          <hr>
          
          <div class="summary-row">
            <span class="label">มูลค่าสินค้า</span>
            <span>฿{{ builderStore.totalPrice.toLocaleString() }}</span>
          </div>
          <div class="summary-row">
            <span class="label">ค่าบริการประกอบ</span>
            <span>฿{{ assemblyFee.toLocaleString() }}</span>
          </div>
          <div class="summary-row">
            <span class="label">ค่าจัดส่ง</span>
            <span class="free">ฟรี</span>
          </div>
          
          <div class="summary-total">
            <span>ยอดสุทธิ</span>
            <span>฿{{ grandTotal.toLocaleString() }}</span>
          </div>

          <button 
            class="btn btn-primary submit-btn" 
            @click="handlePlaceOrder" 
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting" class="spinner-small"></span>
            <span v-else>ยืนยันคำสั่งซื้อ (Confirm Order)</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useBuilderStore } from '../stores/builder';

const props = defineProps({
  categories: Array, catalog: Object, currentUser: Object
});
const emit = defineEmits(['order-placed']);

const router = useRouter();
const builderStore = useBuilderStore();

const customer = reactive({ name: '', address: '', phone: '' });
const assemblyChoice = ref('none');
const isSubmitting = ref(false);
const errorMessage = ref('');

const getItem = (catId, itemId) => props.catalog[catId]?.find(i => i.id === itemId);

const assemblyFee = computed(() => {
  if (assemblyChoice.value === 'standard') return 500;
  if (assemblyChoice.value === 'premium') return 1000;
  return 0;
});

const grandTotal = computed(() => builderStore.totalPrice + assemblyFee.value);

onMounted(() => {
  if (props.currentUser) {
    customer.name = props.currentUser.name;
  }
});

const handlePlaceOrder = async () => {
  errorMessage.value = '';
  if (!customer.name.trim()) {
    customer.name = 'ลูกค้าทดสอบ'; // Default for testing if left blank
  }
  
  isSubmitting.value = true;
  try {
    const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.PROD ? 'https://projectspecai-production.up.railway.app/api/v1' : 'http://localhost:3000/api/v1');
    const response = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customer_name: customer.name,
        customer_address: customer.address,
        customer_phone: customer.phone,
        assembly_type: assemblyChoice.value,
        total_price: grandTotal.value,
        build_items: builderStore.build
      })
    });

    let data;
    try {
      data = await response.json();
    } catch (e) {
      throw new Error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    }

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create order on server');
    }

    if (data.success) {
      alert(`🎉 ${data.message}\nรหัสคำสั่งซื้อ: ${data.order_id}`);
      builderStore.clearBuild();
      router.push('/build');
    } else {
      errorMessage.value = 'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ: ' + (data.error || 'Unknown error');
    }
  } catch (error) {
    console.error('Error placing order:', error);
    errorMessage.value = error.message || 'ไม่สามารถส่งคำสั่งซื้อไปยังเซิร์ฟเวอร์หลังบ้านได้ กรุณาตรวจสอบว่าเซิร์ฟเวอร์เปิดอยู่';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.checkout-view { padding-top: 2rem; padding-bottom: 5rem; }
.header-action { 
  display: flex; gap: 1.25rem; align-items: center; margin-bottom: 2.5rem; 
}
.header-action h2 {
  font-size: var(--text-xl); font-weight: 600; color: var(--ink);
}
.checkout-grid { 
  display: grid; grid-template-columns: 1.5fr 1fr; gap: var(--space-lg); align-items: start; 
}
.left-col { display: flex; flex-direction: column; gap: var(--space-lg); }
.panel { 
  padding: 2rem; border-radius: var(--radius-lg);
  background: var(--canvas); border: 1px solid var(--hairline);
  box-shadow: var(--shadow-sm);
}
.panel h3 { 
  margin-bottom: 1.5rem; font-size: var(--text-lg); font-weight: 600; color: var(--ink);
}
.checkout-item-row { 
  display: flex; justify-content: space-between; align-items: center; 
  padding: 1rem 0; border-bottom: 1px solid var(--hairline-cool);
}
.checkout-item-row:last-child { border-bottom: none; }
.checkout-item-info { display: flex; align-items: center; gap: 1rem; }
.checkout-item-img { 
  width: 56px; height: 56px; 
  background: var(--canvas-soft); border-radius: var(--radius-sm); 
  overflow: hidden; display: flex; align-items: center; justify-content: center; padding: 0.4rem;
  border: 1px solid var(--hairline-cool);
}
.checkout-item-img img { width: 100%; height: 100%; object-fit: contain; }
.item-cat { 
  font-size: var(--text-xs); color: var(--ink-mute); font-weight: 500;
}
.item-name { 
  font-weight: 500; font-size: var(--text-sm); color: var(--ink); margin-top: 0.15rem;
}
.checkout-item-price { 
  font-family: var(--font-sans); font-weight: 600; color: var(--ink);
}
.form-group { margin-bottom: var(--space-md); }
.form-group label { 
  display: block; margin-bottom: 0.5rem; font-size: var(--text-sm); 
  color: var(--ink-mute); font-weight: 500;
}
.required { color: var(--danger); }
.input-error { border-color: var(--danger) !important; box-shadow: 0 0 0 1px var(--danger); }
.error-message { 
  display: flex; align-items: center; gap: 0.5rem; margin-top: 1rem;
  padding: 0.75rem 1rem; background: var(--danger-soft); 
  color: var(--danger); border-radius: var(--radius-sm); font-size: var(--text-sm);
  border: 1px solid var(--danger-border); font-weight: 500;
}
.sticky { position: sticky; top: 5.5rem; }
.radio-group { display: flex; flex-direction: column; gap: 0.75rem; }
.radio-label { 
  display: flex; align-items: center; gap: 1rem; 
  background: var(--canvas); padding: 1rem 1.25rem; 
  border-radius: var(--radius-md); border: 1px solid var(--hairline); 
  cursor: pointer; transition: all var(--transition-fast); 
}
.radio-label:hover { 
  border-color: var(--hairline-strong); background: var(--canvas-soft);
}
.radio-label.active { 
  border-color: var(--primary); background: var(--primary-bg);
}
.radio-label input { accent-color: var(--primary); transform: scale(1.1); }
.radio-content { 
  display: flex; justify-content: space-between; width: 100%; font-size: var(--text-sm); 
}
.free { color: var(--success); font-weight: 600; }
.cost { color: var(--primary-deep); font-weight: 600; }
hr { border: 0; height: 1px; background: var(--hairline-cool); margin: 1.5rem 0; }
.summary-row { 
  display: flex; justify-content: space-between; margin-bottom: 0.75rem; font-size: var(--text-sm);
}
.summary-row .label { color: var(--ink-mute); }
.summary-total { 
  display: flex; justify-content: space-between; font-size: var(--text-xl); font-weight: 600; 
  margin-top: 1.5rem; font-family: var(--font-sans); color: var(--ink);
}
.submit-btn { width: 100%; margin-top: 2rem; display: flex; justify-content: center; }
.spinner-small {
  width: 20px; height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s ease-in-out infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Empty State */
.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 4rem 2rem; text-align: center;
  background: var(--canvas); border-radius: var(--radius-lg);
  border: 1px dashed var(--hairline-strong);
  margin-top: 1rem;
}
.empty-icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.6; }
.empty-state h3 { font-size: var(--text-lg); color: var(--ink); margin-bottom: 0.5rem; }
.empty-state p { color: var(--ink-mute); margin-bottom: 2rem; max-width: 400px; }

@media (max-width: 1024px) {
  .checkout-grid { grid-template-columns: 1fr; }
  .sticky { position: static; }
}
</style>
