<template>
  <div class="hardware-selection">
    <div class="category-header">
      <div class="category-title-left">
        <div class="category-icon-wrap">
          <span class="category-emoji">{{ getCategoryEmoji(activeCategory) }}</span>
        </div>
        <div>
          <h2 class="category-title-text">{{ activeCategoryInfo.name }}</h2>
          <p class="category-subtitle">{{ products.length }} รายการ</p>
        </div>
      </div>
      <div class="tooltip-wrapper">
        <span class="tooltip-icon">?</span>
        <div class="tooltip-text">{{ activeCategoryInfo.tooltip }}</div>
      </div>
    </div>

    <div class="product-grid">
      <div 
        class="product-card" 
        v-for="item in products" 
        :key="item.id" 
        :class="{ selected: selectedItemId === item.id }"
        @click="$emit('select-item', activeCategory, item.id)"
      >
        <!-- Selected checkmark -->
        <div class="selected-badge" v-if="selectedItemId === item.id">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M13.5 4.5L6.5 11.5L2.5 7.5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        
        <button v-if="item.details" class="details-btn" @click.stop="openDetails(item)" title="ดูรายละเอียดสเปค">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 7V11M8 5H8.01M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>
        
        <div class="product-img-wrap">
          <div class="product-img">
            <img :src="item.image" :alt="item.name">
          </div>
        </div>
        
        <div class="product-info">
          <div class="product-name">{{ item.name }}</div>
          <div class="product-specs">
            <span class="spec-tag" v-if="item.socket">{{ item.socket }}</span>
            <span class="spec-tag" v-if="item.tdp">{{ item.tdp }}W</span>
            <span class="spec-tag" v-if="item.ramType">{{ item.ramType }}</span>
            <span class="spec-tag" v-if="item.type">{{ item.type }}</span>
            <span class="spec-tag" v-if="item.wattage">{{ item.wattage }}W</span>
          </div>
        </div>
        
        <div class="product-footer">
          <div class="product-price">
            <span class="price-currency">฿</span>{{ item.price.toLocaleString() }}
          </div>
          <button class="add-btn" :class="{ 'is-selected': selectedItemId === item.id }">
            <svg v-if="selectedItemId === item.id" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.5 4.5L6.5 11.5L2.5 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3V13M3 8H13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Details Modal -->
    <div class="modal-overlay" v-if="showingDetails" @click.self="showingDetails = null">
      <div class="modal-content glass-panel" style="max-width: 520px; padding: 0;">
        <div class="modal-header" style="padding: 1.5rem; border-bottom: 1px solid var(--border);">
          <h3 style="font-size: 1.15rem;">{{ showingDetails.name }}</h3>
          <button class="close-btn" @click="showingDetails = null">✕</button>
        </div>
        <div class="modal-body" style="padding: 1.5rem; white-space: pre-wrap; font-family: var(--font-mono); font-size: 0.85rem; line-height: 2; color: var(--fg); max-height: 60vh; overflow-y: auto;">
          {{ showingDetails.details }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  activeCategory: String, activeCategoryInfo: Object,
  products: Array, selectedItemId: [String, Number],
  compatibilityIssues: Array, hasAnyComponent: Boolean
});
defineEmits(['select-item']);

const showingDetails = ref(null);
const openDetails = (item) => {
  showingDetails.value = item;
};

const getCategoryEmoji = (cat) => {
  const map = {
    cpu: '🧠', mobo: '🔧', ram: '💾', 
    gpu: '🎮', storage: '💿', psu: '⚡', case: '🖥️'
  };
  return map[cat] || '📦';
};
</script>

<style scoped>
.hardware-selection { 
  display: flex; 
  flex-direction: column; 
  gap: var(--space-lg); 
}

/* Category Header */
.category-header { 
  padding: 1.25rem 1.5rem;
  border-radius: var(--radius-lg);
  display: flex; 
  align-items: center; 
  justify-content: space-between;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-card);
}
.category-title-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.category-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--accent-transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
}
.category-title-text {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--fg-bright);
  margin: 0;
}
.category-subtitle {
  font-size: var(--text-xs);
  color: var(--muted);
  margin: 0;
  margin-top: 0.1rem;
}

.tooltip-wrapper { position: relative; display: flex; align-items: center; }
.tooltip-icon { 
  display: inline-flex; align-items: center; justify-content: center; 
  width: 28px; height: 28px; border-radius: var(--radius-sm); 
  background: rgba(255,255,255,0.05); color: var(--muted); 
  font-size: var(--text-xs); font-weight: bold; cursor: help;
  transition: all var(--transition-fast);
  border: 1px solid var(--border);
}
.tooltip-icon:hover {
  background: var(--accent-transparent);
  color: var(--accent);
  border-color: var(--accent);
}
.tooltip-text {
  position: absolute; bottom: 140%; right: 0; width: 280px; 
  background: var(--bg); color: var(--fg); padding: 1rem; 
  border-radius: var(--radius-md); border: 1px solid var(--border-hover); 
  font-size: var(--text-xs); box-shadow: var(--shadow-lg); 
  opacity: 0; visibility: hidden; transition: all var(--transition-fast);
  z-index: 10;
  line-height: 1.6;
}
.tooltip-wrapper:hover .tooltip-text { opacity: 1; visibility: visible; bottom: 120%; }

/* Product Grid */
.product-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--space-md); 
}

@media (min-width: 1400px) {
  .product-grid { grid-template-columns: repeat(5, 1fr); }
}
@media (max-width: 500px) {
  .product-grid { grid-template-columns: repeat(2, 1fr); gap: var(--space-sm); }
}

/* Product Card */
.product-card { 
  border-radius: var(--radius-lg);
  padding: 1rem;
  display: flex; 
  flex-direction: column; 
  gap: 0.75rem;
  transition: all var(--transition-base);
  position: relative; 
  cursor: pointer;
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-sm);
}
.product-card:hover { 
  border-color: rgba(0, 212, 255, 0.2);
  transform: translateY(-6px);
  box-shadow: 0 16px 40px rgba(0,0,0,0.4), 0 0 20px rgba(0, 212, 255, 0.06);
}
.product-card.selected { 
  border-color: var(--accent);
  background: rgba(0, 212, 255, 0.04);
  box-shadow: var(--shadow-glow), 0 8px 30px rgba(0,0,0,0.3);
}

/* Selected Badge */
.selected-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 26px;
  height: 26px;
  border-radius: var(--radius-sm);
  background: var(--gradient-accent);
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  animation: popIn 0.3s var(--transition-spring);
}

/* Product Image */
.product-img-wrap {
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
}
.product-img { 
  width: 100%; 
  aspect-ratio: 1; 
  background: linear-gradient(145deg, rgba(20,22,30,0.8) 0%, rgba(15,17,22,0.9) 100%);
  border-radius: var(--radius-md); 
  overflow: hidden;
  display: flex; 
  align-items: center; 
  justify-content: center; 
  padding: 0.75rem;
  transition: all var(--transition-base);
}
.product-card:hover .product-img {
  background: linear-gradient(145deg, rgba(0, 212, 255, 0.03) 0%, rgba(124, 92, 252, 0.03) 100%);
}
.product-img img { 
  width: 100%; 
  height: 100%; 
  object-fit: contain;
  transition: transform var(--transition-base);
}
.product-card:hover .product-img img {
  transform: scale(1.05);
}

/* Product Info */
.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.product-name { 
  font-size: var(--text-sm); 
  font-weight: 600; 
  line-height: 1.4; 
  color: var(--fg);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.product-specs { 
  display: flex; 
  flex-wrap: wrap; 
  gap: 0.3rem; 
}
.spec-tag {
  font-size: 0.65rem;
  color: var(--muted);
  background: rgba(255,255,255,0.04);
  padding: 0.15rem 0.45rem;
  border-radius: var(--radius-xs);
  border: 1px solid var(--border);
  font-family: var(--font-mono);
  letter-spacing: 0.02em;
}

/* Product Footer */
.product-footer { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-top: auto;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border);
}
.product-price { 
  font-family: var(--font-mono); 
  font-size: var(--text-base); 
  font-weight: 700; 
  color: var(--fg-bright);
}
.price-currency {
  font-size: var(--text-xs);
  color: var(--accent);
  margin-right: 1px;
}

/* Add Button */
.add-btn { 
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--border);
  color: var(--muted); 
  width: 34px; 
  height: 34px; 
  border-radius: var(--radius-sm); 
  display: flex; 
  align-items: center; 
  justify-content: center;
  cursor: pointer; 
  transition: all var(--transition-fast);
  flex-shrink: 0;
}
.product-card:hover .add-btn { 
  border-color: var(--accent); 
  color: var(--accent);
  background: var(--accent-transparent);
}
.add-btn.is-selected { 
  background: var(--gradient-accent);
  color: #000;
  border-color: transparent;
}

/* Details Button */
.details-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  border-radius: var(--radius-sm);
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid var(--glass-border);
  color: var(--muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 5;
  transition: all var(--transition-fast);
}
.details-btn:hover {
  background: var(--accent);
  color: #000;
  border-color: var(--accent);
}

@keyframes popIn {
  from { transform: scale(0.5); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>
