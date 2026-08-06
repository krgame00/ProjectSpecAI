<template>
  <div class="hardware-selection">
    <div class="category-header">
      <div class="category-title-left">
        <div class="category-icon-wrap">
          <span class="category-emoji">{{ getCategoryEmoji(activeCategory) }}</span>
        </div>
        <div>
          <h2 class="category-title-text">{{ activeCategoryInfo.name }}</h2>
          <p class="category-subtitle">
            <template v-if="searchQuery">
              พบ {{ filteredProducts.length }} ชิ้น จากทั้งหมด {{ products.length }} ชิ้น
            </template>
            <template v-else>
              {{ products.length }} ชิ้น
            </template>
          </p>
        </div>
      </div>
      <div class="tooltip-wrapper">
        <span class="tooltip-icon">?</span>
        <div class="tooltip-text">{{ activeCategoryInfo.tooltip }}</div>
      </div>
    </div>

    <!-- Filters Bar -->
    <div class="filters-bar">
      <div class="search-bar-wrapper">
        <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input type="text" v-model="searchQuery" class="search-input"
          :placeholder="`ค้นหา ${activeCategoryInfo.name}...`">
        <button v-if="searchQuery" class="clear-search-btn" @click="searchQuery = ''" title="ล้างการค้นหา">✕</button>
      </div>

      <div class="sort-wrapper">
        <select v-model="sortOrder" class="sort-select">
          <option value="default">เรียงตามความนิยม</option>
          <option value="price_asc">ราคา: ต่ำไปสูง</option>
          <option value="price_desc">ราคา: สูงไปต่ำ</option>
        </select>
        <div class="sort-icon-wrap">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>
    </div>

    <div class="product-grid" v-if="filteredProducts.length > 0">
      <div class="product-card hairline-grid" v-for="item in filteredProducts" :key="item.id"
        :class="{ selected: selectedItemId === item.id }" @click="$emit('select-item', activeCategory, item.id)">
        <!-- Selected checkmark -->
        <div class="selected-badge" v-if="selectedItemId === item.id" title="คลิกเพื่อยกเลิกการเลือก">
          <svg class="check-icon" width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M13.5 4.5L6.5 11.5L2.5 7.5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
          <svg class="cross-icon" width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
        </div>

        <button class="details-btn" @click.stop="openDetails(item)" title="ดูรายละเอียดสเปค">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>

        <div class="product-img-wrap">
          <div class="product-img">
            <img :src="item.image" :alt="item.name">
          </div>
        </div>

        <div class="product-info">
          <div class="product-name">{{ item.name }}</div>
          <div class="product-specs">
            <span class="spec-tag" v-for="(spec, idx) in getItemSpecsList(activeCategory, item)" :key="idx"
              :title="`${spec.label}: ${spec.value}`">
              <span class="tag-label">{{ spec.label }}:</span>
              <span class="spec-value">{{ spec.value }}</span>
            </span>
          </div>
        </div>

        <div class="product-footer">
          <div class="product-price font-mono">
            <template v-if="item.price > 0">
              <span class="price-currency">฿</span>{{ item.price.toLocaleString() }}
            </template>
            <template v-else>
              <span style="font-size: 0.85rem; color: var(--danger); font-weight: 500;">เช็คราคาหน้าร้าน</span>
            </template>
          </div>
          <button class="add-btn" :class="{ 'is-selected': selectedItemId === item.id }">
            <svg v-if="selectedItemId === item.id" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13.5 4.5L6.5 11.5L2.5 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3V13M3 8H13" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div v-else class="empty-search">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" style="color: var(--ink-mute); margin-bottom: 1rem;">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <p>ไม่พบอุปกรณ์ที่ตรงกับ "{{ searchQuery }}"</p>
      <button class="clear-btn" @click="searchQuery = ''">ล้างการค้นหา</button>
    </div>

    <!-- Details Modal -->
    <div class="modal-overlay" v-if="showingDetails" @click.self="showingDetails = null">
      <div class="modal-content"
        style="max-width: 520px; padding: 0; background: var(--canvas); border: 1px solid var(--hairline); border-radius: var(--radius-lg); box-shadow: var(--shadow-xl);">
        <div class="modal-header"
          style="padding: 1.5rem; border-bottom: 1px solid var(--hairline); display: flex; justify-content: space-between; align-items: center;">
          <h3 style="font-size: 1.15rem; margin: 0; color: var(--ink);">{{ showingDetails.name }}</h3>
          <button class="close-btn" @click="showingDetails = null"
            style="background: transparent; border: none; font-size: 1.25rem; color: var(--ink-mute); cursor: pointer;">✕</button>
        </div>
        <div class="modal-body"
          style="padding: 1.5rem; white-space: pre-wrap; font-family: var(--font-mono); font-size: 0.85rem; line-height: 2; color: var(--ink-secondary); max-height: 60vh; overflow-y: auto; background: var(--canvas-soft);">
          {{ showingDetails.details || 'ไม่มีข้อมูลรายละเอียดเพิ่มเติมสำหรับสินค้านี้' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  activeCategory: String, activeCategoryInfo: Object,
  products: Array, selectedItemId: [String, Number],
  compatibilityIssues: Array, hasAnyComponent: Boolean
});
defineEmits(['select-item']);

const searchQuery = ref('');
const sortOrder = ref('default');

const filteredProducts = computed(() => {
  let result = [...props.products];

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(p => p.name.toLowerCase().includes(q));
  }

  if (sortOrder.value === 'price_asc') {
    result.sort((a, b) => a.price - b.price);
  } else if (sortOrder.value === 'price_desc') {
    result.sort((a, b) => b.price - a.price);
  }

  return result;
});

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
  const s = item.specifications || {};

  if (catId === 'cpu') {
    const socket = item.socket || s['Socket Type'] || s['CPU Socket'];
    if (socket) specs.push({ label: 'Socket', value: socket });
    if (s['Cores']) specs.push({ label: 'Cores', value: s['Cores'].replace(/Cores?/i, '').trim() });
    else if (s['Cores/Threads']) specs.push({ label: 'Cores/Threads', value: s['Cores/Threads'] });
    if (s['Threads']) specs.push({ label: 'Threads', value: s['Threads'].replace(/Threads?/i, '').trim() });
    if (item.tdp || s['TDP']) specs.push({ label: 'TDP', value: item.tdp ? `${item.tdp}W` : s['TDP'] });
  } else if (catId === 'mobo') {
    const socket = item.socket || s['CPU Socket'] || s['Socket Type'];
    if (socket) specs.push({ label: 'Socket', value: socket });
    const ram = item.ramType || s['Memory Type'];
    if (ram) specs.push({ label: 'RAM', value: ram });
    if (s['Form Factor']) specs.push({ label: 'Form', value: s['Form Factor'] });
    if (s['Max Memory']) specs.push({ label: 'Max RAM', value: s['Max Memory'] });
  } else if (catId === 'ram') {
    const type = item.type || s['Memory Type'];
    if (type) specs.push({ label: 'Type', value: type });
    if (s['Memory Capacity'] || s['Capacity']) specs.push({ label: 'Capacity', value: s['Memory Capacity'] || s['Capacity'] });
    if (s['Speed'] || s['Memory Speed']) specs.push({ label: 'Speed', value: s['Speed'] || s['Memory Speed'] });
  } else if (catId === 'gpu') {
    if (s['Memory Size'] || s['VRAM']) specs.push({ label: 'VRAM', value: s['Memory Size'] || s['VRAM'] });
    if (s['Power Requirement'] || item.tdp) specs.push({ label: 'Rec. PSU', value: s['Power Requirement'] || `${item.tdp}W` });
    if (item.specifications?.['Length (mm)'] || s['Dimension']) {
      const len = item.specifications?.['Length (mm)'] || s['Dimension'];
      specs.push({ label: 'Size', value: typeof len === 'number' ? `${len} mm` : len });
    }
  } else if (catId === 'storage') {
    if (s['Form Factor'] || s['Interface'] || s['Type']) specs.push({ label: 'Type', value: s['Form Factor'] || s['Interface'] || s['Type'] });
    if (s['Capacity']) specs.push({ label: 'Capacity', value: s['Capacity'] });
    if (s['Read Speed']) specs.push({ label: 'Read', value: s['Read Speed'] });
  } else if (catId === 'psu') {
    const w = item.wattage || s['Continuous Power W'] || s['Wattage'];
    if (w) specs.push({ label: 'Power', value: typeof w === 'number' ? `${w}W` : w });
    if (s['Energy Efficient'] || s['80 Plus']) specs.push({ label: 'Efficiency', value: s['Energy Efficient'] || s['80 Plus'] });
  } else if (catId === 'case') {
    if (s['Mainboard Support'] || s['Form Factor Support']) specs.push({ label: 'Board', value: s['Mainboard Support'] || s['Form Factor Support'] });
    if (s['Max GPU Length (mm)'] || s['VGA Support']) {
      const g = s['Max GPU Length (mm)'] || s['VGA Support'];
      specs.push({ label: 'Max GPU', value: typeof g === 'number' ? `${g} mm` : g });
    }
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

.category-emoji {
  font-size: 1.5rem;
}

.category-title-text {
  margin: 0;
  font-size: var(--text-xl);
  color: var(--ink);
  font-weight: 600;
}

.category-subtitle {
  margin: 0.25rem 0 0;
  color: var(--ink-mute);
  font-size: 0.85rem;
}

.filters-bar {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.search-bar-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  background: var(--canvas-soft);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-lg);
  padding: 0 1rem;
  transition: all 0.2s ease;
}

.search-bar-wrapper:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.search-icon {
  color: var(--ink-mute);
  margin-right: 0.75rem;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--ink);
  font-size: 0.95rem;
  padding: 1rem 0;
  outline: none;
}

.search-input::placeholder {
  color: var(--ink-mute);
}

.sort-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.sort-select {
  appearance: none;
  background: var(--canvas-soft);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-lg);
  color: var(--ink);
  font-size: 0.95rem;
  padding: 1rem 2.5rem 1rem 1.25rem;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
  font-family: inherit;
}

.sort-select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.sort-icon-wrap {
  position: absolute;
  right: 1rem;
  pointer-events: none;
  color: var(--ink-mute);
  display: flex;
  align-items: center;
}

.clear-search-btn {
  background: transparent;
  border: none;
  color: var(--ink-mute);
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0.5rem;
}

.clear-search-btn:hover {
  color: var(--ink);
}

.empty-search {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--canvas);
  border: 1px dashed var(--hairline);
  border-radius: var(--radius-lg);
  color: var(--ink-secondary);
}

.empty-search .clear-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: var(--canvas-soft);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-md);
  color: var(--ink);
  cursor: pointer;
}

.empty-search .clear-btn:hover {
  background: var(--hairline);
}

.tooltip-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.tooltip-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  background: var(--canvas-soft);
  color: var(--ink-mute);
  font-size: var(--text-xs);
  font-weight: 500;
  cursor: help;
  transition: all var(--transition-fast);
  border: 1px solid var(--hairline);
}

.tooltip-icon:hover {
  background: var(--canvas-soft);
  color: var(--ink);
  border-color: var(--ink-mute-2);
}

.tooltip-text {
  position: absolute;
  bottom: 140%;
  right: 0;
  width: 280px;
  background: var(--canvas-night);
  color: var(--on-dark);
  padding: 1rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--canvas-night);
  font-size: var(--text-xs);
  box-shadow: var(--shadow-lg);
  opacity: 0;
  visibility: hidden;
  transition: all var(--transition-fast);
  z-index: 10;
  line-height: 1.6;
}

.tooltip-wrapper:hover .tooltip-text {
  opacity: 1;
  visibility: visible;
  bottom: 120%;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--space-md);
}

@media (min-width: 1400px) {
  .product-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media (max-width: 500px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-sm);
  }
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
  background: #ff4d4f;
  /* Danger red */
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

.product-card:hover .product-img {
  background: var(--canvas);
}

.product-img img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform var(--transition-normal);
}

.product-card:hover .product-img img {
  transform: scale(1.05);
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  justify-content: space-between;
}

.product-name {
  font-size: var(--text-sm);
  font-weight: 500;
  line-height: 1.4;
  color: var(--ink);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  /* autoprefixer: ignore next */
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.8em;
}

.product-specs {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  width: 100%;
  margin-top: auto;
}

.spec-tag {
  font-size: 0.7rem;
  color: var(--ink-secondary);
  background: var(--canvas-soft);
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--hairline-cool);
  font-family: var(--font-sans);
  letter-spacing: 0.01em;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.tag-label {
  color: var(--ink-mute);
  font-weight: 500;
  font-size: 0.68rem;
  white-space: nowrap;
}

.spec-value {
  color: var(--ink);
  font-weight: 500;
  font-size: 0.68rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: right;
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
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--ink);
}

.price-currency {
  font-size: var(--text-sm);
  color: var(--ink-mute);
  margin-right: 2px;
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-content {
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 520px;
  overflow: hidden;
  background: var(--canvas);
  border: 1px solid var(--hairline);
  box-shadow: var(--shadow-xl);
  animation: popIn 0.2s ease-out;
}

@keyframes popIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
