<template>
  <aside class="sidebar">
    <!-- Total Price Box -->
    <div class="total-price-box">
      <div class="price-box-glow"></div>
      <div class="total-header">
        <div class="total-icon">💰</div>
        <span class="total-label">ยอดรวมทั้งสิ้น</span>
      </div>
      <div class="total-value">฿{{ totalPrice.toLocaleString() }}</div>
      <div class="total-subtext">อัปเดตตามเวลาจริง (Real-time)</div>
      <button class="btn btn-primary checkout-btn" @click="$emit('checkout')" :disabled="!hasAnyComponent">
        <span class="btn-icon">🛒</span>
        <span>ดำเนินการสั่งซื้อ</span>
      </button>
    </div>

    <!-- Compatibility Alerts -->
    <div v-if="compatibilityIssues.length === 0 && hasAnyComponent" class="alert-box alert-success">
      <div class="alert-icon-wrap success-icon">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.5 4.5L6.5 11.5L2.5 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
      <div class="alert-text">
        <strong>สถานะ: เข้ากันได้ 100%</strong>
        <span>ฮาร์ดแวร์ทุกชิ้นสามารถทำงานร่วมกันได้อย่างสมบูรณ์</span>
      </div>
    </div>
    <div v-if="compatibilityIssues.length > 0" class="alert-box alert-danger">
      <div class="alert-icon-wrap danger-icon">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 5V8.5M8 11H8.01M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </div>
      <div class="alert-text">
        <strong>พบข้อขัดแย้ง:</strong>
        <ul>
          <li v-for="(issue, index) in compatibilityIssues" :key="index">{{ issue }}</li>
        </ul>
      </div>
    </div>

    <!-- Category List -->
    <div class="category-list-wrap">
      <div class="section-title">
        <span>เลือกหมวดหมู่ฮาร์ดแวร์</span>
        <span class="parts-count">{{ selectedCount }}/{{ categories.length }}</span>
      </div>
      <ul class="category-list">
        <li 
          v-for="cat in categories" 
          :key="cat.id" 
          :class="['category-item', { active: activeCategory === cat.id, selected: build[cat.id] }]"
          @click="$emit('set-active-category', cat.id)"
        >
          <div class="cat-indicator"></div>
          <div class="cat-content">
            <div class="cat-header">
              <span class="cat-name">{{ cat.name }}</span>
              <span class="cat-badge" v-if="build[cat.id]">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M13.5 4.5L6.5 11.5L2.5 7.5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </span>
              <span class="cat-badge empty" v-else>—</span>
            </div>
            <div class="cat-selected-item" v-if="build[cat.id]">
              <div class="item-name">{{ getItemName(cat.id, build[cat.id]) }}</div>
              <div class="item-price">฿{{ getItemPrice(cat.id, build[cat.id]) }}</div>
              <button class="sidebar-remove-btn" @click.stop="$emit('remove-item', cat.id)">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1L9 9M9 1L1 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                นำออก
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script setup>
const props = defineProps({
  categories: Array, build: Object, catalog: Object, 
  totalPrice: Number, activeCategory: String, 
  compatibilityIssues: Array, hasAnyComponent: Boolean
});
defineEmits(['set-active-category', 'remove-item', 'checkout']);

import { computed } from 'vue';

const selectedCount = computed(() => {
  return Object.values(props.build).filter(v => v !== null).length;
});

const getItemName = (catId, itemId) => {
  const item = props.catalog[catId]?.find(i => i.id === itemId);
  return item ? item.name : '';
};

const getItemPrice = (catId, itemId) => {
  const item = props.catalog[catId]?.find(i => i.id === itemId);
  return item ? item.price.toLocaleString() : '0';
};
</script>

<style scoped>
.sidebar { 
  display: flex; 
  flex-direction: column; 
  gap: var(--space-md); 
  position: sticky; 
  top: 5.5rem; 
}
.total-price-box { 
  border-radius: var(--radius-lg); 
  padding: 1.75rem;
  background: var(--canvas);
  border: 1px solid var(--hairline);
  box-shadow: var(--shadow-sm);
  position: relative;
}
.price-box-glow { display: none; }
.total-header { 
  display: flex; 
  align-items: center; 
  gap: 0.6rem;
  margin-bottom: 0.75rem;
}
.total-icon { font-size: 1.2rem; }
.total-label { 
  font-size: var(--text-sm); 
  font-weight: 500; 
  color: var(--ink-mute);
}
.total-value { 
  font-size: var(--text-2xl); 
  font-family: var(--font-sans); 
  font-weight: 600; 
  color: var(--ink);
  text-align: right;
  line-height: 1.3;
}
.total-subtext {
  font-size: var(--text-xs);
  color: var(--ink-mute-2);
  text-align: right;
  margin-top: 0.25rem;
}
.checkout-btn { 
  width: 100%; 
  margin-top: 1.25rem;
  padding: 0.85rem 1.5rem;
  font-size: var(--text-base);
  border-radius: var(--radius-sm);
}
.btn-icon { font-size: 1.15rem; }
.alert-box { 
  padding: 1rem 1.25rem; 
  border-radius: var(--radius-md); 
  font-size: var(--text-sm); 
  display: flex; 
  gap: 0.85rem; 
  align-items: flex-start;
}
.alert-success { 
  border: 1px solid var(--success);
  background: var(--canvas-soft);
}
.alert-danger { 
  border: 1px solid var(--danger);
  background: var(--canvas-soft);
}
.alert-icon-wrap {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.success-icon { 
  background: var(--success-soft); 
  color: var(--success); 
}
.danger-icon { 
  background: var(--danger-soft); 
  color: var(--danger); 
}
.alert-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.alert-text strong {
  color: var(--ink);
  font-size: var(--text-sm);
}
.alert-text span {
  font-size: var(--text-xs);
  color: var(--ink-mute);
}
.alert-box ul { 
  margin-left: 1.25rem; 
  margin-top: 0.35rem;
  font-size: var(--text-xs);
  color: var(--ink-mute);
}
.alert-box ul li { margin-bottom: 0.2rem; }
.category-list-wrap {
  background: var(--canvas);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}
.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--hairline-cool);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--ink-mute);
}
.parts-count {
  font-family: var(--font-sans);
  font-size: var(--text-xs);
  color: var(--primary-deep);
  background: var(--primary-bg);
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-full);
  font-weight: 500;
}
.category-list { list-style: none; }
.category-item { 
  padding: 0.9rem 1.25rem; 
  border-bottom: 1px solid var(--hairline-cool); 
  cursor: pointer; 
  transition: all var(--transition-fast); 
  display: flex;
  gap: 0.85rem;
  align-items: flex-start;
}
.category-item:last-child { border-bottom: none; }
.category-item:hover { background: var(--canvas-soft); }
.category-item.active { background: var(--canvas-soft); }
.cat-indicator {
  width: 3px;
  min-height: 20px;
  border-radius: var(--radius-full);
  background: transparent;
  transition: all var(--transition-fast);
  flex-shrink: 0;
  align-self: stretch;
}
.category-item.active .cat-indicator { background: var(--primary); }
.category-item.selected .cat-indicator { background: var(--primary-deep); }
.cat-content { flex: 1; min-width: 0; }
.cat-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  font-weight: 500; 
}
.cat-name { 
  font-size: var(--text-sm); 
  color: var(--ink);
}
.cat-badge { 
  width: 22px;
  height: 22px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xs);
  background: var(--success-soft);
  color: var(--success);
  flex-shrink: 0;
}
.cat-badge.empty {
  background: transparent;
  color: var(--ink-faint);
}
.cat-selected-item { margin-top: 0.5rem; }
.item-name { 
  font-size: var(--text-xs); 
  color: var(--ink-mute);
  display: -webkit-box; 
  -webkit-line-clamp: 1; 
  -webkit-box-orient: vertical; 
  overflow: hidden; 
  text-overflow: ellipsis; 
  line-height: 1.5; 
}
.item-price {
  font-family: var(--font-sans);
  font-size: var(--text-xs);
  color: var(--primary-deep);
  font-weight: 600;
  margin-top: 0.15rem;
}
.sidebar-remove-btn { 
  background: transparent; 
  color: var(--ink-mute); 
  border: 1px solid var(--hairline); 
  padding: 0.2rem 0.55rem; 
  border-radius: var(--radius-sm); 
  font-size: var(--text-xs); 
  cursor: pointer; 
  margin-top: 0.4rem; 
  width: 100%; 
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  font-family: var(--font-sans);
}
.sidebar-remove-btn:hover { 
  background: var(--danger-soft); 
  color: var(--danger);
  border-color: var(--danger-border);
}
</style>
