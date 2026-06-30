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

/* Total Price Box */
.total-price-box { 
  border-radius: var(--radius-lg); 
  padding: 1.75rem;
  background: var(--gradient-surface);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-card);
  position: relative;
  overflow: hidden;
}
.price-box-glow {
  position: absolute;
  top: -50%;
  left: -30%;
  width: 160%;
  height: 100%;
  background: radial-gradient(ellipse at center, rgba(0, 212, 255, 0.06) 0%, transparent 70%);
  pointer-events: none;
}
.total-header { 
  display: flex; 
  align-items: center; 
  gap: 0.6rem;
  margin-bottom: 0.75rem;
  position: relative;
}
.total-icon {
  font-size: 1.2rem;
}
.total-label { 
  font-size: var(--text-sm); 
  font-weight: 600; 
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.total-value { 
  font-size: var(--text-2xl); 
  font-family: var(--font-mono); 
  font-weight: 800; 
  background: var(--gradient-accent);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: right;
  position: relative;
  line-height: 1.3;
}
.total-subtext {
  font-size: var(--text-xs);
  color: var(--muted);
  text-align: right;
  margin-top: 0.25rem;
  opacity: 0.7;
}
.checkout-btn { 
  width: 100%; 
  margin-top: 1.25rem;
  padding: 0.85rem 1.5rem;
  font-size: var(--text-base);
  border-radius: var(--radius-md);
}
.btn-icon {
  font-size: 1.15rem;
}

/* Alerts */
.alert-box { 
  padding: 1rem 1.25rem; 
  border-radius: var(--radius-md); 
  font-size: var(--text-sm); 
  display: flex; 
  gap: 0.85rem; 
  align-items: flex-start;
  animation: slideDown 0.3s ease;
}
.alert-success { 
  background: var(--success-bg); 
  border: 1px solid var(--success-border); 
}
.alert-danger { 
  background: var(--danger-bg); 
  border: 1px solid var(--danger-border); 
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
  background: var(--success-bg); 
  color: var(--success); 
}
.danger-icon { 
  background: var(--danger-bg); 
  color: var(--danger); 
}
.alert-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.alert-text strong {
  color: var(--fg-bright);
  font-size: var(--text-sm);
}
.alert-text span {
  font-size: var(--text-xs);
  color: var(--muted);
}
.alert-box ul { 
  margin-left: 1.25rem; 
  margin-top: 0.35rem;
  font-size: var(--text-xs);
  color: var(--muted);
}
.alert-box ul li {
  margin-bottom: 0.2rem;
}

/* Category List */
.category-list-wrap {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-card);
}
.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.parts-count {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--accent);
  background: var(--accent-transparent);
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-full);
}
.category-list { 
  list-style: none; 
}
.category-item { 
  padding: 0.9rem 1.25rem; 
  border-bottom: 1px solid var(--border); 
  cursor: pointer; 
  transition: all var(--transition-fast); 
  display: flex;
  gap: 0.85rem;
  align-items: flex-start;
  position: relative;
}
.category-item:last-child { border-bottom: none; }
.category-item:hover { 
  background: rgba(255,255,255,0.02); 
}
.category-item.active { 
  background: var(--accent-transparent);
}
.cat-indicator {
  width: 3px;
  height: 100%;
  min-height: 20px;
  border-radius: var(--radius-full);
  background: transparent;
  transition: all var(--transition-fast);
  flex-shrink: 0;
  align-self: stretch;
}
.category-item.active .cat-indicator {
  background: var(--gradient-accent);
  box-shadow: 0 0 8px rgba(0, 212, 255, 0.4);
}
.category-item.selected .cat-indicator {
  background: var(--success);
}
.cat-content {
  flex: 1;
  min-width: 0;
}
.cat-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  font-weight: 600; 
}
.cat-name { 
  font-size: var(--text-sm); 
  color: var(--fg);
}
.cat-badge { 
  width: 22px;
  height: 22px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xs);
  background: var(--success-bg);
  color: var(--success);
  flex-shrink: 0;
}
.cat-badge.empty {
  background: transparent;
  color: var(--muted);
  opacity: 0.3;
}
.cat-selected-item { 
  margin-top: 0.5rem;
}
.item-name { 
  font-size: var(--text-xs); 
  color: var(--muted);
  display: -webkit-box; 
  -webkit-line-clamp: 1; 
  -webkit-box-orient: vertical; 
  overflow: hidden; 
  text-overflow: ellipsis; 
  line-height: 1.5; 
}
.item-price {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--accent);
  font-weight: 600;
  margin-top: 0.15rem;
}
.sidebar-remove-btn { 
  background: transparent; 
  color: var(--danger); 
  border: 1px solid var(--danger-border); 
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
  font-family: var(--font-body);
}
.sidebar-remove-btn:hover { 
  background: var(--danger); 
  color: #fff;
  border-color: var(--danger);
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
