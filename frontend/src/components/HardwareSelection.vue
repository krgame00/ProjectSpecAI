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
        <div class="selected-badge" v-if="selectedItemId === item.id" title="คลิกเพื่อยกเลิกการเลือก">
          <svg class="check-icon" width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M13.5 4.5L6.5 11.5L2.5 7.5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <svg class="cross-icon" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        
        <button class="details-btn" @click.stop="openDetails(item)" title="ดูรายละเอียดสเปค">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
        
        <div class="product-img-wrap">
          <div class="product-img">
            <img :src="item.image" :alt="item.name">
          </div>
        </div>
        
        <div class="product-info">
          <div class="product-name">{{ item.name }}</div>
          <div class="product-specs">
            <span class="spec-tag" v-for="(spec, idx) in getItemSpecsList(activeCategory, item)" :key="idx">
              <span class="tag-label">{{ spec.label }}:</span> {{ spec.value }}
            </span>
          </div>
        </div>
        
        <div class="product-footer">
          <div class="product-price">
            <template v-if="item.price > 0">
              <span class="price-currency">฿</span>{{ item.price.toLocaleString() }}
            </template>
            <template v-else>
              <span style="font-size: 0.85rem; color: var(--danger); font-weight: 500;">เช็คราคาหน้าร้าน</span>
            </template>
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
      <div class="modal-content" style="max-width: 520px; padding: 0; background: var(--canvas); border: 1px solid var(--hairline); border-radius: var(--radius-lg); box-shadow: var(--shadow-xl);">
        <div class="modal-header" style="padding: 1.5rem; border-bottom: 1px solid var(--hairline); display: flex; justify-content: space-between; align-items: center;">
          <h3 style="font-size: 1.15rem; margin: 0; color: var(--ink);">{{ showingDetails.name }}</h3>
          <button class="close-btn" @click="showingDetails = null" style="background: transparent; border: none; font-size: 1.25rem; color: var(--ink-mute); cursor: pointer;">✕</button>
        </div>
        <div class="modal-body" style="padding: 1.5rem; white-space: pre-wrap; font-family: var(--font-mono); font-size: 0.85rem; line-height: 2; color: var(--ink-secondary); max-height: 60vh; overflow-y: auto; background: var(--canvas-soft);">
          {{ showingDetails.details || 'ไม่มีข้อมูลรายละเอียดเพิ่มเติมสำหรับสินค้านี้' }}
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

const getItemSpecsList = (catId, item) => {
  if (!item) return [];
  const specs = [];
  
  if (item.socket) specs.push({ label: 'Socket', value: item.socket });
  if (catId === 'mobo' && item.ramType) specs.push({ label: 'DDR', value: item.ramType });
  if (catId === 'ram' && item.type) specs.push({ label: 'ประเภท', value: item.type });
  if (catId === 'psu' && item.wattage) specs.push({ label: 'กำลังไฟ', value: `${item.wattage}W` });
  
  const s = item.specifications || {};
  if (catId === 'cpu') {
    if (s['Cores/Threads']) specs.push({ label: 'คอร์/เธรด', value: s['Cores/Threads'] });
    if (s['Base Clock']) specs.push({ label: 'ความเร็วพื้นฐาน', value: s['Base Clock'] });
    if (s['Boost Clock']) specs.push({ label: 'ความเร็วบูสต์', value: s['Boost Clock'] });
    if (item.tdp) specs.push({ label: 'TDP', value: `${item.tdp}W` });
  } else if (catId === 'mobo') {
    if (s['Form Factor']) specs.push({ label: 'ฟอร์มแฟคเตอร์', value: s['Form Factor'] });
  } else if (catId === 'ram') {
    if (s['Capacity']) specs.push({ label: 'ความจุ', value: s['Capacity'] });
  } else if (catId === 'gpu') {
    if (s['VRAM']) specs.push({ label: 'VRAM', value: s['VRAM'] });
    if (item.tdp) specs.push({ label: 'TDP', value: `${item.tdp}W` });
    if (s['Length (mm)']) specs.push({ label: 'ความยาว', value: `${s['Length (mm)']}mm` });
  } else if (catId === 'storage') {
    if (s['Type']) specs.push({ label: 'ประเภท', value: s['Type'] });
    if (s['Capacity']) specs.push({ label: 'ความจุ', value: s['Capacity'] });
  } else if (catId === 'psu') {
    if (s['Efficiency Rating']) specs.push({ label: 'มาตรฐาน', value: s['Efficiency Rating'] });
  } else if (catId === 'case') {
    if (s['Form Factor Support']) specs.push({ label: 'รองรับบอร์ด', value: s['Form Factor Support'] });
    if (s['Max GPU Length (mm)']) specs.push({ label: 'GPU ยาวสุด', value: `${s['Max GPU Length (mm)']}mm` });
  }
  return specs;
};
</script>

<style scoped>
.hardware-selection { 
  display: flex; 
  flex-direction: column; 
  gap: var(--space-lg); 
}
.category-header { 
  padding: 1.25rem 1.5rem;
  border-radius: var(--radius-lg);
  display: flex; 
  align-items: center; 
  justify-content: space-between;
  background: var(--canvas);
  border: 1px solid var(--hairline);
  box-shadow: var(--shadow-sm);
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
  background: var(--canvas-soft);
  border: 1px solid var(--hairline-cool);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
}
.category-title-text {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--ink);
  margin: 0;
}
.category-subtitle {
  font-size: var(--text-xs);
  color: var(--ink-mute);
  margin: 0;
  margin-top: 0.1rem;
}
.tooltip-wrapper { position: relative; display: flex; align-items: center; }
.tooltip-icon { 
  display: inline-flex; align-items: center; justify-content: center; 
  width: 28px; height: 28px; border-radius: var(--radius-sm); 
  background: var(--canvas-soft); color: var(--ink-mute); 
  font-size: var(--text-xs); font-weight: 500; cursor: help;
  transition: all var(--transition-fast);
  border: 1px solid var(--hairline);
}
.tooltip-icon:hover {
  background: var(--canvas-soft);
  color: var(--ink);
  border-color: var(--ink-mute-2);
}
.tooltip-text {
  position: absolute; bottom: 140%; right: 0; width: 280px; 
  background: var(--canvas-night); color: var(--on-dark); padding: 1rem; 
  border-radius: var(--radius-md); border: 1px solid var(--canvas-night); 
  font-size: var(--text-xs); box-shadow: var(--shadow-lg); 
  opacity: 0; visibility: hidden; transition: all var(--transition-fast);
  z-index: 10;
  line-height: 1.6;
}
.tooltip-wrapper:hover .tooltip-text { opacity: 1; visibility: visible; bottom: 120%; }
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
.product-card { 
  border-radius: var(--radius-lg);
  padding: 1rem;
  display: flex; 
  flex-direction: column; 
  gap: 0.75rem;
  transition: all var(--transition-normal);
  position: relative; 
  cursor: pointer;
  background: var(--canvas);
  border: 1px solid var(--hairline);
  box-shadow: var(--shadow-xs);
}
.product-card:hover { 
  border-color: var(--hairline-strong);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
.product-card.selected { 
  border-color: var(--primary);
  background: var(--canvas);
  box-shadow: 0 0 0 1px var(--primary), var(--shadow-md);
}
.selected-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 26px;
  height: 26px;
  border-radius: var(--radius-sm);
  background: var(--primary);
  color: var(--on-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  animation: popIn 0.2s var(--ease-out);
  transition: all 0.2s ease;
}
.selected-badge .cross-icon {
  display: none;
}
.product-card.selected:hover .selected-badge {
  background: #ff4d4f; /* Danger red */
  color: white;
  transform: scale(1.1);
}
.product-card.selected:hover .selected-badge .check-icon {
  display: none;
}
.product-card.selected:hover .selected-badge .cross-icon {
  display: block;
}
.product-img-wrap {
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
}
.product-img { 
  width: 100%; 
  aspect-ratio: 1; 
  background: var(--canvas-soft);
  border-radius: var(--radius-md); 
  overflow: hidden;
  display: flex; 
  align-items: center; 
  justify-content: center; 
  padding: 0.75rem;
  transition: all var(--transition-normal);
}
.product-card:hover .product-img { background: var(--canvas); }
.product-img img { 
  width: 100%; 
  height: 100%; 
  object-fit: contain;
  transition: transform var(--transition-normal);
}
.product-card:hover .product-img img { transform: scale(1.05); }
.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.product-name { 
  font-size: var(--text-sm); 
  font-weight: 500; 
  line-height: 1.4; 
  color: var(--ink);
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
  color: var(--ink-secondary);
  background: var(--canvas-soft);
  padding: 0.15rem 0.45rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--hairline-cool);
  font-family: var(--font-sans);
  letter-spacing: 0.02em;
}
.tag-label {
  color: var(--ink-mute);
  font-weight: 500;
  margin-right: 0.1rem;
}
.product-footer { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-top: auto;
  padding-top: 0.5rem;
  border-top: 1px solid var(--hairline-cool);
}
.product-price { 
  font-family: var(--font-sans); 
  font-size: var(--text-base); 
  font-weight: 600; 
  color: var(--ink);
}
.price-currency {
  font-size: var(--text-xs);
  color: var(--ink-mute);
  margin-right: 1px;
}
.add-btn { 
  background: var(--canvas-soft);
  border: 1px solid var(--hairline);
  color: var(--ink-mute); 
  width: 32px; 
  height: 32px; 
  border-radius: var(--radius-sm); 
  display: flex; 
  align-items: center; 
  justify-content: center;
  cursor: pointer; 
  transition: all var(--transition-fast);
  flex-shrink: 0;
}
.product-card:hover .add-btn { 
  border-color: var(--ink-mute-2); 
  color: var(--ink);
  background: var(--canvas);
}
.add-btn.is-selected { 
  background: var(--primary);
  color: var(--on-primary);
  border-color: var(--primary);
}
.details-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  border-radius: var(--radius-sm);
  background: var(--canvas);
  border: 1px solid var(--hairline);
  color: var(--ink-mute);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 5;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);
}
.details-btn:hover {
  background: var(--canvas-soft);
  color: var(--ink);
  border-color: var(--hairline-strong);
}
@keyframes popIn {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>
