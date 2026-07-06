<template>
  <div class="container checkout-view">
    <div class="header-action">
      <button class="btn btn-outline" @click="$emit('go-back')">← กลับไปหน้าจัดสเปค</button>
      <h2 style="margin: 0;">สรุปรายการสั่งซื้อ</h2>
    </div>
    
    <div class="checkout-grid">
      <div class="left-col">
        <div class="panel glass-panel">
          <h3>รายการฮาร์ดแวร์ที่เลือก</h3>
          <div v-for="cat in categories" :key="'co-'+cat.id">
            <div v-if="build[cat.id]" class="checkout-item-row">
              <div class="checkout-item-info">
                <div class="checkout-item-img">
                  <img :src="getItem(cat.id, build[cat.id]).image" alt="">
                </div>
                <div>
                  <div class="item-cat">{{ cat.name }}</div>
                  <div class="item-name">{{ getItem(cat.id, build[cat.id]).name }}</div>
                </div>
              </div>
              <div class="checkout-item-price">฿{{ getItem(cat.id, build[cat.id]).price.toLocaleString() }}</div>
            </div>
          </div>
        </div>

        <div class="panel glass-panel">
          <h3>ข้อมูลการจัดส่ง</h3>
          <div class="form-group">
            <label>ชื่อ-นามสกุล ผู้รับ</label>
            <input type="text" class="form-control" v-model="customer.name" placeholder="ระบุชื่อ-นามสกุล">
          </div>
          <div class="form-group">
            <label>ที่อยู่สำหรับจัดส่ง</label>
            <textarea class="form-control" v-model="customer.address" rows="3" placeholder="ระบุที่อยู่จัดส่งแบบครบถ้วน"></textarea>
          </div>
          <div class="form-group">
            <label>เบอร์โทรศัพท์</label>
            <input type="text" class="form-control" v-model="customer.phone" placeholder="08X-XXX-XXXX">
          </div>
        </div>
      </div>

      <div class="right-col">
        <div class="panel glass-panel sticky">
          <h3>บริการประกอบเครื่อง</h3>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" v-model="assemblyChoice" value="none">
              <div class="radio-content">
                <span>นำชิ้นส่วนไปประกอบเอง</span>
                <span class="free">ฟรี</span>
              </div>
            </label>
            <label class="radio-label">
              <input type="radio" v-model="assemblyChoice" value="standard">
              <div class="radio-content">
                <span>ประกอบมาตรฐาน</span>
                <span class="cost">+฿500</span>
              </div>
            </label>
            <label class="radio-label">
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
            <span>฿{{ totalPrice.toLocaleString() }}</span>
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

          <button class="btn btn-primary" style="width: 100%; margin-top: 2rem;" @click="handlePlaceOrder">ยืนยันคำสั่งซื้อ (Confirm Order)</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';

const props = defineProps({
  categories: Array, build: Object, catalog: Object, 
  totalPrice: Number, currentUser: Object
});
const emit = defineEmits(['go-back', 'order-placed']);

const customer = reactive({ name: '', address: '', phone: '' });
const assemblyChoice = ref('none');

const getItem = (catId, itemId) => props.catalog[catId]?.find(i => i.id === itemId);

const assemblyFee = computed(() => {
  if (assemblyChoice.value === 'standard') return 500;
  if (assemblyChoice.value === 'premium') return 1000;
  return 0;
});

const grandTotal = computed(() => props.totalPrice + assemblyFee.value);

onMounted(() => {
  if (props.currentUser) {
    customer.name = props.currentUser.name;
  }
});

const handlePlaceOrder = async () => {
  if (!customer.name.trim()) return alert('กรุณาระบุชื่อ-นามสกุลผู้รับ');
  
  try {
    const response = await fetch('http://localhost:3000/api/orders', {
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
        build_items: props.build
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create order on server');
    }

    const data = await response.json();
    if (data.success) {
      const newOrder = {
        id: data.order_id,
        customer: customer.name,
        assembly: assemblyChoice.value,
        total: grandTotal.value,
        status: 'assembling',
        date: new Date().toISOString()
      };
      emit('order-placed', newOrder);
    } else {
      alert('เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ: ' + (data.error || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error placing order:', error);
    alert('ไม่สามารถส่งคำสั่งซื้อไปยังเซิร์ฟเวอร์หลังบ้านได้ กรุณาตรวจสอบว่าเซิร์ฟเวอร์เปิดอยู่');
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
.form-group { margin-bottom: 1.35rem; }
.form-group label { 
  display: block; margin-bottom: 0.5rem; font-size: var(--text-sm); 
  color: var(--ink-mute); font-weight: 500;
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
@media (max-width: 1024px) {
  .checkout-grid { grid-template-columns: 1fr; }
  .sticky { position: static; }
}
</style>
