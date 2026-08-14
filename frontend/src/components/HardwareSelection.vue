<template>
  <div class="hardware-selection">
    <div class="category-header" :inert="Boolean(showingDetails)">
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
        <button type="button" class="tooltip-icon" :aria-expanded="String(isGuidanceOpen)" aria-controls="category-guidance" @click="isGuidanceOpen = !isGuidanceOpen">?</button>
        <div id="category-guidance" class="tooltip-text" :class="{ 'is-open': isGuidanceOpen }">{{ activeCategoryInfo.tooltip }}</div>
      </div>
    </div>

    <!-- Filters Bar -->
    <div class="filters-bar" :inert="Boolean(showingDetails)">
      <div class="search-bar-wrapper">
        <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input type="text" v-model="searchQuery" class="search-input" :aria-label="`ค้นหา ${activeCategoryInfo.name}`"
          :placeholder="`ค้นหา ${activeCategoryInfo.name}...`">
        <button v-if="searchQuery" class="clear-search-btn" aria-label="ล้างการค้นหา" @click="searchQuery = ''">✕</button>
      </div>

      <div class="sort-wrapper">
        <select v-model="sortOrder" class="sort-select" aria-label="เรียงลำดับสินค้า">
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

    <div class="product-grid" v-if="filteredProducts.length > 0" :inert="Boolean(showingDetails)">
      <div class="product-card hairline-grid" v-for="item in filteredProducts" :key="item.id"
        :class="{ selected: selectedItemId === item.id }"
        :aria-current="selectedItemId === item.id ? 'true' : undefined"
        @click="$emit('select-item', activeCategory, item.id)">
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

        <button class="details-btn" :aria-label="`ดูรายละเอียด ${item.name}`" @click.stop="openDetails(item, $event.currentTarget)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>

        <div class="product-img-wrap">
          <div class="product-img">
            <img :src="item.image" :alt="item.name" @error="handleProductImageError">
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
          <button
            class="add-btn"
            :class="{ 'is-selected': selectedItemId === item.id }"
            :aria-label="selectedItemId === item.id ? `ยกเลิกการเลือก ${item.name}` : `เลือก ${item.name}`"
            @click.stop="$emit('select-item', activeCategory, item.id)"
          >
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

    <div v-else class="empty-search" :inert="Boolean(showingDetails)">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" style="color: var(--ink-mute); margin-bottom: 1rem;">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <p>ไม่พบอุปกรณ์ที่ตรงกับ "{{ searchQuery }}"</p>
      <button class="clear-btn" @click="searchQuery = ''">ล้างการค้นหา</button>
    </div>

    <!-- Details Modal -->
    <div class="modal-overlay" v-if="showingDetails" @click.self="closeDetails">
      <div ref="detailsDialogRef" class="modal-content detail-modal-content" role="dialog" aria-modal="true" aria-labelledby="hardware-details-title" tabindex="-1">
        <div class="modal-header detail-modal-header">
          <div class="header-left">
            <span class="product-category-badge">{{ activeCategoryInfo?.name || 'Hardware' }}</span>
            <h3 id="hardware-details-title" class="modal-title">{{ showingDetails.name }}</h3>
          </div>
          <button class="close-btn" aria-label="ปิดรายละเอียดสินค้า" @click="closeDetails">✕</button>
        </div>
        
        <div class="modal-body detail-modal-body">
          <!-- Image and Price Overview -->
          <div class="product-overview-card">
            <div class="product-img-wrapper">
              <img :src="showingDetails.image || '/images/default.png'" :alt="showingDetails.name" class="modal-product-img" />
            </div>
            <div class="product-price-info">
              <span class="price-label">ราคาประมาณ</span>
              <span class="price-value">฿{{ Number(showingDetails.price || 0).toLocaleString() }}</span>
              <button 
                class="btn-select-modal" 
                :class="{ 'selected': selectedItemId === showingDetails.id }"
                @click="$emit('select-item', activeCategory, showingDetails.id); showingDetails = null;"
              >
                {{ selectedItemId === showingDetails.id ? '✓ อุปกรณ์ที่เลือกอยู่' : '+ เลือกอุปกรณ์นี้' }}
              </button>
            </div>
          </div>

          <!-- Rich Specifications Grid -->
          <div class="specs-section">
            <h4 class="specs-title">⚡ คุณสมบัติและสเปกเชิงลึก (Specifications)</h4>
            
            <div v-if="Object.keys(getCleanModalSpecs(showingDetails)).length > 0" class="specs-grid">
              <div v-for="(val, key) in getCleanModalSpecs(showingDetails)" :key="key" class="spec-row">
                <span class="spec-label">{{ key }}</span>
                <span class="spec-val">{{ val }}</span>
              </div>
            </div>
            
            <div v-else-if="showingDetails.details" class="raw-details-text">
              {{ showingDetails.details }}
            </div>

            <div v-else class="empty-specs-notice">
              ไม่มีข้อมูลคุณสมบัติเพิ่มเติมสำหรับอุปกรณ์ชิ้นนี้
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useDialogFocus } from '../composables/useDialogFocus';

const props = defineProps({
  activeCategory: String, activeCategoryInfo: Object,
  products: Array, selectedItemId: [String, Number],
  compatibilityIssues: Array, hasAnyComponent: Boolean
});
defineEmits(['select-item']);

const searchQuery = ref('');
const sortOrder = ref('default');
const isGuidanceOpen = ref(false);

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
const detailsDialogRef = ref(null);
const detailsTriggerRef = ref(null);
const openDetails = (item, trigger) => {
  detailsTriggerRef.value = trigger;
  showingDetails.value = item;
};
const closeDetails = () => {
  showingDetails.value = null;
};
useDialogFocus(showingDetails, detailsDialogRef, closeDetails, detailsTriggerRef);

const handleProductImageError = (event) => {
  const image = event.currentTarget;
  if (image.dataset.fallbackApplied === 'true') return;
  image.dataset.fallbackApplied = 'true';
  image.src = `/images/${props.activeCategory}.png`;
};

const getCategoryEmoji = (cat) => {
  const map = {
    cpu: '🧠', mobo: '🔧', ram: '💾',
    gpu: '🎮', storage: '💿', psu: '⚡', case: '🖥️'
  };
  return map[cat] || '📦';
};

const getCleanModalSpecs = (item) => {
  if (!item || !item.specifications) return {};
  const clean = {};
  const junkPattern = /<|href|iframe|script|style|googletagmanager|ad_storage|analytics_storage|fill|stroke|evenodd|overflow|font-size|translate|svg|g id|use overflow|color:/i;
  for (const [k, v] of Object.entries(item.specifications)) {
    if (!junkPattern.test(k) && !junkPattern.test(String(v)) && v !== null && v !== undefined && String(v).trim() !== '') {
      clean[k] = v;
    }
  }
  return clean;
};

const getItemSpecsList = (catId, item) => {
  if (!item) return [];
  const specs = [];
  const s = item.specifications || {};

  if (catId === 'cpu') {
    const socket = item.socket || s['Socket Type'] || s['CPU Socket'];
    if (socket) specs.push({ label: 'Socket', value: socket });
    const cores = item.cores || s['Cores'];
    if (cores) {
      let coreVal = String(cores).replace(/Cores?/i, '').trim();
      const n = (item.name || '').toUpperCase();
      if (coreVal === '10' && (n.includes('14400') || n.includes('13400') || n.includes('12600') || n.includes('225'))) {
        coreVal = '10 (6P+4E)';
      } else if (coreVal === '14' && (n.includes('14600') || n.includes('13600') || n.includes('250'))) {
        coreVal = '14 (6P+8E)';
      } else if (coreVal === '20' && (n.includes('14700') || n.includes('13700') || n.includes('270'))) {
        coreVal = '20 (8P+12E)';
      } else if (coreVal === '24' && (n.includes('14900') || n.includes('13900') || n.includes('285'))) {
        coreVal = '24 (8P+16E)';
      }
      specs.push({ label: 'Cores', value: coreVal });
    }
    const threads = item.threads || s['Threads'];
    if (threads) specs.push({ label: 'Threads', value: String(threads).replace(/Threads?/i, '').trim() });
    const tdp = item.tdp || s['TDP'];
    if (tdp) specs.push({ label: 'TDP', value: typeof tdp === 'number' ? `${tdp}W` : (String(tdp).endsWith('W') ? tdp : `${tdp}W`) });
  } else if (catId === 'mobo') {
    const socket = item.socket || s['CPU Socket'] || s['Socket Type'];
    if (socket) specs.push({ label: 'Socket', value: socket });
    const ram = item.ramType || s['Memory Type'];
    if (ram) specs.push({ label: 'RAM', value: ram });
    const form = item.formFactor || s['Form Factor'];
    if (form) specs.push({ label: 'Form', value: form });
    if (s['Max Memory']) specs.push({ label: 'Max RAM', value: s['Max Memory'] });
  } else if (catId === 'ram') {
    const type = item.type || s['Memory Type'] || (item.name?.includes('DDR5') ? 'DDR5' : 'DDR4');
    if (type) specs.push({ label: 'Type', value: type });
    const cap = s['Capacity'] || (item.capacityGb ? `${item.capacityGb} GB` : s['Memory Capacity']);
    if (cap) specs.push({ label: 'Capacity', value: cap });
    const speed = item.busSpeed ? `${item.busSpeed} MHz` : (s['Speed'] || s['Memory Speed']);
    if (speed) specs.push({ label: 'Speed', value: typeof speed === 'number' ? `${speed} MHz` : speed });
    const color = s['Color'] || (/WHITE/i.test(item.name) ? 'White' : (/SILVER/i.test(item.name) ? 'Silver' : (/RGB/i.test(item.name) ? 'RGB Black' : 'Black')));
    if (color) specs.push({ label: 'Color', value: color });
  } else if (catId === 'gpu') {
    const chipset = s['GPU Model'] || item.chipset;
    if (chipset) specs.push({ label: 'Chipset', value: chipset });
    const vram = s['VRAM'] || (item.vramGb ? `${item.vramGb} GB` : s['Memory Size']);
    if (vram) specs.push({ label: 'VRAM', value: vram });
    const len = item.lengthMm || item.specifications?.['Length (mm)'] || s['Dimension'];
    if (len) specs.push({ label: 'Length', value: typeof len === 'number' ? `${len} mm` : (String(len).includes('mm') ? len : `${len} mm`) });
    const psu = item.tdp || s['Power Requirement'] || s['Power Supply Requirement'];
    if (psu) specs.push({ label: 'Rec. PSU', value: typeof psu === 'number' ? `${psu}W` : (String(psu).endsWith('W') ? psu : `${psu}W`) });
  } else if (catId === 'storage') {
    const type = item.type || s['Type'] || s['Form Factor'] || s['Interface'];
    if (type) specs.push({ label: 'Type', value: type });
    const cap = item.capacityGb ? (item.capacityGb >= 1000 ? `${item.capacityGb / 1000} TB` : `${item.capacityGb} GB`) : s['Capacity'];
    if (cap && cap !== '0 GB') specs.push({ label: 'Capacity', value: cap });
    const read = item.readSpeedMbs ? `${item.readSpeedMbs} MB/s` : s['Read Speed'];
    if (read) specs.push({ label: 'Read', value: typeof read === 'number' ? `${read} MB/s` : read });
    const write = item.writeSpeedMbs ? `${item.writeSpeedMbs} MB/s` : s['Write Speed'];
    if (write) specs.push({ label: 'Write', value: typeof write === 'number' ? `${write} MB/s` : write });
  } else if (catId === 'psu') {
    const w = item.wattage || s['Wattage'] || s['Continuous Power W'];
    if (w) specs.push({ label: 'Power', value: typeof w === 'number' ? `${w}W` : (String(w).endsWith('W') ? w : `${w}W`) });
    const eff = item.efficiencyRating || s['Efficiency'] || s['80 Plus'];
    if (eff) specs.push({ label: 'Efficiency', value: eff });
    const mod = s['Modularity'] || (item.name?.includes('GOLD') || item.name?.includes('PLATINUM') ? 'Full Modular' : 'Non-Modular');
    if (mod) specs.push({ label: 'Modular', value: mod });
    const fan = s['Fan Size'] || '120 mm';
    if (fan) specs.push({ label: 'Fan Size', value: fan });
  } else if (catId === 'case') {
    const form = s['Form Factor'] || (item.name?.includes('MINI-ITX') ? 'Mini-ITX' : (item.name?.includes('mATX') ? 'Micro-ATX' : 'Mid Tower'));
    if (form) specs.push({ label: 'Form', value: form });
    const board = item.formFactorSupport || s['Motherboard Support'] || s['Form Factor Support'];
    if (board) specs.push({ label: 'Board', value: board });
    const g = item.maxGpuLength || s['Max GPU Length'] || s['VGA Support'];
    if (g) specs.push({ label: 'Max GPU', value: typeof g === 'number' ? `${g} mm` : (String(g).includes('mm') ? g : `${g} mm`) });
    const color = s['Color'] || (/WHITE/i.test(item.name) ? 'White' : (/PINK/i.test(item.name) ? 'Pink' : 'Black'));
    if (color) specs.push({ label: 'Color', value: color });
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
  gap: 1rem;
  flex-wrap: wrap;
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
  flex-direction: column;
  gap: 0.75rem;
  align-items: stretch;
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
  min-width: 0;
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
  width: 100%;
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

.tooltip-wrapper:hover .tooltip-text,
.tooltip-wrapper:focus-within .tooltip-text,
.tooltip-text.is-open {
  opacity: 1;
  visibility: visible;
  bottom: 120%;
}

.product-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-md);
}

@media (min-width: 23rem) {
  .product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 48rem) {
  .filters-bar { flex-direction: row; align-items: center; }
  .sort-select { width: auto; }
  .product-grid {
    grid-template-columns: repeat(auto-fit, minmax(12.5rem, 1fr));
  }
}

@media (min-width: 87.5rem) {
  .product-grid { grid-template-columns: repeat(5, minmax(0, 1fr)); }
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
  min-width: 0;
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

.product-name,
.spec-value {
  overflow-wrap: anywhere;
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
  z-index: var(--z-backdrop);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: max(1rem, env(safe-area-inset-top)) var(--page-gutter) max(1rem, env(safe-area-inset-bottom));
}

.modal-content {
  border-radius: var(--radius-lg);
  width: min(100%, 42.5rem);
  max-width: 520px;
  max-height: calc(100dvh - 2rem - env(safe-area-inset-top) - env(safe-area-inset-bottom));
  overflow-y: auto;
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

.modal-content.detail-modal-content {
  max-width: 680px;
  width: 95%;
  border-radius: var(--radius-xl, 16px);
  background: var(--canvas, #ffffff);
  border: 1px solid var(--hairline, #e2e8f0);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  max-height: calc(100dvh - 2rem - env(safe-area-inset-top) - env(safe-area-inset-bottom));
}

@media (hover: none) {
  .product-card:hover {
    transform: none;
    box-shadow: var(--shadow-xs);
  }
}

.detail-modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--hairline, #e2e8f0);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: var(--canvas-soft, #f8fafc);
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding-right: 1rem;
}

.product-category-badge {
  display: inline-block;
  align-self: flex-start;
  padding: 0.15rem 0.5rem;
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.25);
  font-size: 0.725rem;
  font-weight: 600;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.modal-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--ink, #0f172a);
  margin: 0;
  line-height: 1.35;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.25rem;
  color: var(--ink-mute, #64748b);
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.close-btn:hover {
  background: rgba(0,0,0,0.06);
  color: var(--ink, #0f172a);
}

.detail-modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.product-overview-card {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  padding: 1.25rem;
  background: var(--canvas-soft, #f8fafc);
  border: 1px solid var(--hairline, #e2e8f0);
  border-radius: var(--radius-lg, 12px);
}

@media (max-width: 540px) {
  .product-overview-card {
    flex-direction: column;
    text-align: center;
  }
}

.product-img-wrapper {
  width: 140px;
  height: 140px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--canvas, #1e293b);
  border: 1px solid var(--hairline, rgba(255, 255, 255, 0.1));
  border-radius: 10px;
  padding: 0.5rem;
}

.modal-product-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.product-price-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-grow: 1;
}

.price-label {
  font-size: 0.75rem;
  color: var(--ink-mute, #94a3b8);
  text-transform: uppercase;
  font-weight: 600;
}

.price-value {
  font-size: 1.6rem;
  font-weight: 800;
  color: #10b981;
}

.btn-select-modal {
  margin-top: 0.25rem;
  padding: 0.65rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  border: none;
  background: #10b981;
  color: #ffffff;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
}

.btn-select-modal:hover {
  background: #059669;
}

.btn-select-modal.selected {
  background: #3b82f6;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
}

.specs-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.specs-title {
  font-size: 0.925rem;
  font-weight: 700;
  color: var(--ink, #f8fafc);
  margin: 0;
}

.specs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 0.65rem;
}

.spec-row {
  display: flex;
  flex-direction: column;
  padding: 0.65rem 0.85rem;
  background: var(--canvas-soft, rgba(255, 255, 255, 0.04));
  border: 1px solid var(--hairline, rgba(255, 255, 255, 0.1));
  border-radius: 8px;
  gap: 0.2rem;
}

.spec-label {
  font-size: 0.725rem;
  color: var(--ink-mute, #94a3b8);
  font-weight: 600;
}

.spec-val {
  font-size: 0.85rem;
  color: var(--ink, #f8fafc);
  font-weight: 500;
  word-break: break-word;
}

.raw-details-text {
  padding: 1rem;
  background: var(--canvas-soft, rgba(255, 255, 255, 0.04));
  border: 1px solid var(--hairline, rgba(255, 255, 255, 0.1));
  border-radius: 8px;
  font-size: 0.85rem;
  line-height: 1.7;
  color: var(--ink-secondary, #cbd5e1);
  white-space: pre-wrap;
}

.empty-specs-notice {
  padding: 1.5rem;
  text-align: center;
  color: var(--ink-mute, #94a3b8);
  font-size: 0.85rem;
  background: var(--canvas-soft, rgba(255, 255, 255, 0.04));
  border-radius: 8px;
}
</style>
