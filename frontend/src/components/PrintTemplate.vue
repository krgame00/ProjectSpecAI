<template>
  <div class="print-template-container">
    <div class="print-header">
      <div class="brand">
        <h1 class="brand-name">ForgeLabs</h1>
        <p class="brand-sub">ระบบจัดสเปกคอมอัจฉริยะ</p>
      </div>
    </div>
    
    <div class="print-title">
      <h2>ใบเสนอราคา / จัดสเปกคอมพิวเตอร์</h2>
    </div>

    <table class="print-table">
      <thead>
        <tr>
          <th width="5%" class="text-center">#</th>
          <th width="10%" class="text-center">รูป</th>
          <th width="40%">รายละเอียดสินค้า</th>
          <th width="15%" class="text-center">รหัสสินค้า</th>
          <th width="12%" class="text-right">ราคาต่อหน่วย</th>
          <th width="5%" class="text-center">จำนวน</th>
          <th width="13%" class="text-right">ราคารวม</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in selectedItems" :key="item.id">
          <td class="text-center">{{ index + 1 }}</td>
          <td class="text-center">
             <img :src="item.image" alt="" class="item-img" v-if="item.image" />
             <div class="no-img" v-else>ไม่มีรูป</div>
          </td>
          <td>
            <strong>{{ item.categoryName }}</strong> {{ item.name }}
          </td>
          <td class="text-center">SKU-{{ String(item.id).padStart(6, '0') }}</td>
          <td class="text-right">฿{{ item.price.toLocaleString() }}</td>
          <td class="text-center">1</td>
          <td class="text-right">฿{{ item.price.toLocaleString() }}</td>
        </tr>
      </tbody>
    </table>

    <div class="print-footer">
      <div class="summary-box">
        <div class="summary-row">
          <span>ยอดรวม:</span>
          <span>฿{{ totalPrice.toLocaleString() }}</span>
        </div>
        <div class="summary-row">
          <span>ส่วนลด:</span>
          <span>฿0.00</span>
        </div>
        <div class="summary-row grand-total">
          <span>จำนวนเงินทั้งหมด:</span>
          <span>฿{{ totalPrice.toLocaleString() }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  build: Object,
  catalog: Object,
  totalPrice: Number
});

const categories = [
  { id: 'cpu', numId: 1, name: 'CPU' },
  { id: 'mobo', numId: 2, name: 'MAINBOARD' },
  { id: 'ram', numId: 3, name: 'RAM' },
  { id: 'gpu', numId: 4, name: 'VGA' },
  { id: 'storage', numId: 5, name: 'STORAGE' },
  { id: 'psu', numId: 6, name: 'PSU' },
  { id: 'case', numId: 7, name: 'CASE' }
];

const getCategoryName = (numId) => {
  const cat = categories.find(c => c.numId === numId);
  return cat ? cat.name : 'OTHER';
};

const selectedItems = computed(() => {
  const items = [];
  categories.forEach(cat => {
    const itemId = props.build[cat.id];
    if (itemId) {
      const itemData = props.catalog[cat.id]?.find(i => i.id === itemId);
      if (itemData) {
        items.push({
          ...itemData,
          categoryName: cat.name
        });
      }
    }
  });
  return items;
});
</script>

<style scoped>
.print-template-container {
  display: none; /* Hidden on screen by default */
}

@media print {
  .print-template-container {
    display: block;
    width: 100%;
    color: #000;
    font-family: var(--font-sans);
    background: #fff;
  }

  /* Header */
  .print-header {
    display: flex;
    justify-content: space-between;
    border-bottom: 2px solid #000;
    padding-bottom: 10px;
    margin-bottom: 15px;
  }
  .brand-name {
    font-size: 28px;
    font-weight: 800;
    color: var(--primary-deep);
    margin: 0;
    letter-spacing: -0.5px;
  }
  .brand-sub {
    font-size: 14px;
    color: #555;
    margin: 5px 0 0 0;
  }
  .company-info {
    text-align: right;
    font-size: 12px;
    line-height: 1.5;
  }
  .company-info p {
    margin: 0;
  }

  /* Title */
  .print-title {
    text-align: center;
    margin-bottom: 15px;
  }
  .print-title h2 {
    font-size: 18px;
    margin: 0;
    font-weight: 600;
  }

  /* Table */
  .print-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
    margin-bottom: 15px;
  }
  .print-table th, .print-table td {
    padding: 10px 8px;
    border-bottom: 1px solid #f0f0f0;
    vertical-align: middle;
  }
  .print-table th {
    text-align: left;
    font-weight: 600;
    border-bottom: 1px solid #ccc;
    color: #444;
  }
  .print-table th.text-right, .print-table td.text-right { text-align: right; }
  .print-table th.text-center, .print-table td.text-center { text-align: center; }
  
  .item-img {
    width: 45px;
    height: 45px;
    object-fit: contain;
    background: #fff;
  }
  .no-img {
    width: 45px;
    height: 45px;
    background: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    color: #999;
  }

  .print-table td strong {
    color: #222;
    font-weight: 600;
  }

  /* Footer */
  .print-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }
  .summary-box {
    width: 320px;
  }
  .summary-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 10px;
    font-size: 14px;
    color: #333;
  }
  .summary-row.grand-total {
    font-weight: 700;
    font-size: 16px;
    border-top: 1px dashed #ccc;
    border-bottom: 1px dashed #ccc;
    padding: 12px 10px;
    margin-top: 8px;
    color: #000;
  }
}
</style>
