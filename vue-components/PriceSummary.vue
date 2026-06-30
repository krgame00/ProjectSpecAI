<template>
  <aside class="sidebar">
    <div class="total-price-box">
      <div class="total-header">
        <span class="total-label">ยอดรวมทั้งสิ้น (Real-time)</span>
      </div>
      <div class="total-value">฿{{ totalPrice.toLocaleString() }}</div>
      <button class="checkout-btn" @click="handleCheckout" :disabled="!hasAnyComponent">
        🛒 ดำเนินการสั่งซื้อ
      </button>
    </div>

    <!-- Compatibility Alerts -->
    <div v-if="compatibilityIssues.length > 0" class="alert-box alert-danger">
      <div>❌ พบข้อขัดแย้งของฮาร์ดแวร์:</div>
      <ul>
        <li v-for="(issue, index) in compatibilityIssues" :key="index">{{ issue }}</li>
      </ul>
    </div>

    <ul class="category-list">
      <li 
        v-for="cat in categories" 
        :key="cat.id" 
        :class="['category-item', { active: activeCategory === cat.id }]"
        @click="setActiveCategory(cat.id)"
      >
        <div class="cat-header">
          <span class="cat-name">{{ cat.name }}</span>
          <span class="cat-status" v-if="build[cat.id]">✅</span>
        </div>
        <div class="cat-selected-item" v-if="build[cat.id]">
          <div class="item-name">{{ getItemName(cat.id, build[cat.id]) }}</div>
          <button class="sidebar-remove-btn" @click.stop="removeItem(cat.id)">✕ นำออก</button>
        </div>
      </li>
    </ul>
  </aside>
</template>

<script setup>
import { computed, defineProps, defineEmits } from 'vue';

const props = defineProps({
  categories: Array,
  build: Object,
  catalog: Object,
  totalPrice: Number,
  activeCategory: String,
  compatibilityIssues: Array,
  hasAnyComponent: Boolean
});

const emit = defineEmits(['set-active-category', 'remove-item', 'checkout']);

const getItemName = (catId, itemId) => {
  const item = props.catalog[catId]?.find(i => i.id === itemId);
  return item ? item.name : '';
};

const setActiveCategory = (catId) => {
  emit('set-active-category', catId);
};

const removeItem = (catId) => {
  emit('remove-item', catId);
};

const handleCheckout = () => {
  emit('checkout');
};
</script>

<style scoped>
.sidebar { /* sidebar styles */ }
.total-price-box { /* box styles */ }
</style>