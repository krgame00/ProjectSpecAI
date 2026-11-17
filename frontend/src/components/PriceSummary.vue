<template>
  <aside :class="['sidebar', { 'is-mobile-open': isMobileSummaryOpen }]">
    <button
      type="button"
      class="mobile-summary-toggle"
      data-test="mobile-summary-toggle"
      aria-controls="mobile-build-summary"
      :aria-expanded="String(isMobileSummaryOpen)"
      @click="toggleMobileSummary"
    >
      <span>ยอดรวม <strong>฿{{ totalPrice.toLocaleString() }}</strong></span>
      <span aria-hidden="true">{{ isMobileSummaryOpen ? '⌄' : '⌃' }}</span>
    </button>

    <div
      id="mobile-build-summary"
      class="summary-details"
      :hidden="isCompactViewport && !isMobileSummaryOpen"
    >
    <!-- Total Price Box -->
    <div class="total-price-box hairline-grid">
      <div class="price-box-glow"></div>
      <div class="total-header">
        <span class="badge-emerald">01 // TELEMETRY & BUILD</span>
        <span class="status-dot"></span>
      </div>
      <div class="total-value font-mono text-emerald">฿{{ totalPrice.toLocaleString() }}</div>
      <div class="total-subtext font-mono">อัปเดตราคาแบบ Real-time</div>

      <div class="action-buttons">
        <button class="btn btn-primary checkout-btn" @click="$emit('checkout')" :disabled="!hasAnyComponent">
          <span>🛒 สั่งซื้อสินค้า</span>
        </button>
        <button class="btn btn-secondary share-btn" type="button" @click="$emit('open-share')" :disabled="!hasAnyComponent" title="แชร์สเปกนี้">
          <span>🔗 แชร์สเปก</span>
        </button>
        <button class="btn btn-secondary print-btn" @click="printSpec" :disabled="!hasAnyComponent">
          <span>🖨️ พิมพ์ / PDF</span>
        </button>
      </div>

      <!-- Real-time Budget Distribution Meter -->
      <div v-if="hasAnyComponent && budgetBreakdown && budgetBreakdown.segments && budgetBreakdown.segments.length > 0" class="budget-meter-wrap font-mono">
        <div class="meter-header">
          <span>BUDGET BREAKDOWN</span>
          <span>{{ budgetBreakdown.segments.length }} หมวด</span>
        </div>
        <div class="budget-bar">
          <div 
            v-for="seg in budgetBreakdown.segments" 
            :key="seg.id" 
            class="budget-bar-segment" 
            :style="{ width: seg.percentage + '%', backgroundColor: seg.color }"
            :title="`${seg.label}: ${seg.percentage}% (฿${seg.amount.toLocaleString()})`"
          ></div>
        </div>
        <div class="budget-legend">
          <div v-for="seg in budgetBreakdown.segments.slice(0, 4)" :key="seg.id" class="legend-chip">
            <span class="legend-color-dot" :style="{ backgroundColor: seg.color }"></span>
            <span>{{ seg.label }} {{ seg.percentage }}%</span>
          </div>
        </div>
      </div>

      <!-- Real-time PSU Wattage Meter Gauge (Moved Down) -->
      <div v-if="hasAnyComponent" class="wattage-meter-wrap font-mono">
        <div class="meter-header">
          <span>ESTIMATED POWER</span>
          <span>{{ estimatedWattage }}W / {{ recommendedWattage }}W</span>
        </div>
        <div class="meter-bar-bg">
          <div class="meter-bar-fill" :style="{ width: Math.min((estimatedWattage / recommendedWattage) * 100, 100) + '%' }"></div>
        </div>
        <div class="meter-footer text-emerald">
          ⚡ {{ recommendedWattage }}W PSU RECOMMENDED
        </div>
      </div>
    </div>

    <!-- Compatibility Alerts -->
    <div v-if="hasAnyComponent" class="alert-box" :class="compatibilityIssues.length > 0 ? 'alert-danger' : 'alert-success'">
      <div class="alert-icon-wrap" :class="compatibilityIssues.length > 0 ? 'danger-icon' : 'success-icon'">
        <svg v-if="compatibilityIssues.length === 0" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.5 4.5L6.5 11.5L2.5 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 5V8.5M8 11H8.01M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </div>
      <div class="alert-text">
        <strong>สถานะ: {{ compatibilityIssues.length === 0 ? 'เข้ากันได้ 100%' : 'พบข้อขัดแย้งบางส่วน' }}</strong>
        <span v-if="combinedReport.length === 0">ฮาร์ดแวร์ทุกชิ้นสามารถทำงานร่วมกันได้อย่างสมบูรณ์</span>
        <ul v-else class="mixed-report-list">
          <li v-for="(item, index) in combinedReport" :key="index" :class="item.type">
            <span class="report-icon">{{ item.type === 'issue' ? '❌' : '✅' }}</span>
            <span class="report-text">{{ item.text }}</span>
          </li>
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
        >
          <button
            type="button"
            class="category-button"
            :aria-current="activeCategory === cat.id ? 'true' : undefined"
            @click="selectCategory(cat.id)"
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
            </div>
          </button>
          <div class="cat-selected-item" v-if="build[cat.id]">
            <div class="selected-compact-wrap">
              <div class="item-name" :title="getItemName(cat.id, build[cat.id])">{{ getItemName(cat.id, build[cat.id]) }}</div>
              
              <div class="selected-row-meta">
                <div class="meta-details">
                  <span class="item-price font-mono" v-if="getItemPrice(cat.id, build[cat.id]) !== '0'">
                    ฿{{ getItemPrice(cat.id, build[cat.id]) }}
                  </span>
                  <span class="item-price contact-price" v-else>ติดต่อสอบถาม</span>
                  
                  <!-- Compact Specs Chips (High-density inline tags) -->
                  <div class="item-specs-compact" v-if="getItemSpecsList(cat.id, build[cat.id]).length">
                    <span 
                      v-for="(spec, idx) in getItemSpecsList(cat.id, build[cat.id])" 
                      :key="idx" 
                      class="spec-chip font-mono"
                      :title="`${spec.label}: ${spec.value}`"
                    >
                      {{ spec.value }}
                    </span>
                  </div>
                </div>

                <button 
                  class="sidebar-remove-btn" 
                  type="button"
                  :aria-label="`นำ ${cat.name} ออก`"
                  title="นำออก"
                  @click.stop="$emit('remove-item', cat.id)"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1L9 9M9 1L1 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                  <span class="remove-text">นำออก</span>
                </button>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
    </div>
  </aside>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { calcTotalTdp } from '../utils/compatibility';
import { getItemSpecsList as formatSpecs } from '../utils/hardwareSpecs';

const props = defineProps({
  categories: Array, build: Object, catalog: Object, 
  totalPrice: Number, activeCategory: String, 
  compatibilityIssues: Array, compatibilityPasses: Array, hasAnyComponent: Boolean,
  budgetBreakdown: Object
});
const emit = defineEmits(['set-active-category', 'remove-item', 'checkout', 'open-share']);

const isMobileSummaryOpen = ref(false);
const isCompactViewport = ref(true);
let compactMediaQuery;

const syncCompactViewport = (event) => {
  isCompactViewport.value = event.matches;
  if (!event.matches) isMobileSummaryOpen.value = false;
};

onMounted(() => {
  if (typeof window.matchMedia !== 'function') return;
  compactMediaQuery = window.matchMedia('(max-width: 1023px)');
  syncCompactViewport(compactMediaQuery);
  compactMediaQuery.addEventListener?.('change', syncCompactViewport);
});

onBeforeUnmount(() => {
  compactMediaQuery?.removeEventListener?.('change', syncCompactViewport);
});

const toggleMobileSummary = () => {
  isMobileSummaryOpen.value = !isMobileSummaryOpen.value;
};

const selectCategory = (categoryId) => {
  emit('set-active-category', categoryId);
  if (isCompactViewport.value) isMobileSummaryOpen.value = false;
};

const selectedCount = computed(() => {
  return Object.values(props.build).filter(v => v !== null).length;
});

const estimatedWattage = computed(() => {
  if (!props.catalog) return 0;
  const cpu = props.catalog.cpu?.find(i => i.id === props.build.cpu);
  const gpu = props.catalog.gpu?.find(i => i.id === props.build.gpu);
  const mobo = props.build.mobo;
  const ram = props.build.ram;
  const storage = props.build.storage;
  
  return calcTotalTdp(cpu, gpu, mobo, ram, storage);
});

const recommendedWattage = computed(() => {
  if (!props.catalog) return 650;
  const psu = props.catalog.psu?.find(i => i.id === props.build.psu);
  if (psu && psu.wattage) return Number(psu.wattage);
  const est = estimatedWattage.value;
  return est > 0 ? Math.ceil((est * 1.3) / 50) * 50 : 650;
});

const combinedReport = computed(() => {
  if (!props.hasAnyComponent) return [];
  const report = [];
  if (props.compatibilityIssues) {
    props.compatibilityIssues.forEach(issue => report.push({ type: 'issue', text: issue }));
  }
  if (props.compatibilityPasses) {
    props.compatibilityPasses.forEach(pass => report.push({ type: 'pass', text: pass }));
  }
  return report;
});

const getItemName = (catId, itemId) => {
  const item = props.catalog[catId]?.find(i => i.id === itemId);
  return item ? item.name : '';
};

const getItemPrice = (catId, itemId) => {
  const item = props.catalog[catId]?.find(i => i.id === itemId);
  return item ? item.price.toLocaleString() : '0';
};

const getItemSpecsList = (catId, itemId) => {
  const item = props.catalog[catId]?.find(i => i.id === itemId);
  return formatSpecs(catId, item);
};

const printSpec = () => {
  window.print();
};
</script>

<style scoped>
.sidebar { 
  display: flex; 
  flex-direction: column; 
  gap: var(--space-md); 
  min-width: 0;
}
.summary-details {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}
.summary-details[hidden] { display: none; }
.mobile-summary-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 52px;
  padding: 0.75rem 1rem;
  border: 1px solid var(--hairline-strong);
  border-radius: var(--radius-md);
  background: var(--canvas-soft);
  color: var(--ink);
  font-weight: 500;
  cursor: pointer;
}
.mobile-summary-toggle strong { color: var(--primary); }
.category-button {
  width: 100%;
  min-width: 0;
  min-height: 48px;
  padding: 0.9rem 1.25rem;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  display: flex;
  gap: 0.85rem;
  align-items: flex-start;
}

@media (max-width: 63.99rem) {
  .sidebar {
    position: fixed;
    z-index: var(--z-sticky);
    left: max(1rem, env(safe-area-inset-left));
    right: max(6rem, calc(5rem + env(safe-area-inset-right)));
    bottom: max(0.75rem, env(safe-area-inset-bottom));
    gap: 0.5rem;
  }
  .summary-details {
    max-height: min(60dvh, 32rem);
    overflow-y: auto;
    overscroll-behavior-y: auto;
    padding: 0.5rem;
    border: 1px solid var(--hairline);
    border-radius: var(--radius-lg);
    background: var(--canvas);
    box-shadow: var(--shadow-lg);
  }
  .summary-details > * {
    flex-shrink: 0;
  }
}

@media (max-width: 63.99rem) and (max-height: 43.75rem) {
  .summary-details {
    max-height: 48dvh;
  }
}

@media (min-width: 64rem) {
  .sidebar {
    position: sticky;
    top: 5.5rem;
  }
  .mobile-summary-toggle { display: none; }
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
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1.25rem;
}
.checkout-btn, .print-btn { 
  width: 100%; 
  padding: 0.85rem 1.5rem;
  font-size: var(--text-base);
  border-radius: var(--radius-sm);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}
.print-btn {
  background: transparent;
  color: var(--ink);
  border: 1px solid var(--hairline-cool);
}
.print-btn:hover {
  background: var(--canvas-soft);
  border-color: var(--ink-mute);
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
  margin-left: 0; 
  margin-top: 0.5rem;
  font-size: var(--text-xs);
  color: var(--ink-mute);
  padding: 0;
  list-style: none;
}
.mixed-report-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.mixed-report-list li {
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
  line-height: 1.4;
}
.mixed-report-list li.issue .report-text {
  color: var(--danger);
  font-weight: 500;
}
.mixed-report-list li.pass .report-text {
  color: var(--success);
}
.report-icon {
  flex-shrink: 0;
  font-size: 0.75rem;
  margin-top: 0.1rem;
}
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
  padding: 0;
  border-bottom: 1px solid var(--hairline-cool); 
  cursor: pointer; 
  transition: all var(--transition-fast); 
  display: block;
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
  background: transparent;
  color: #3ecf8e;
  flex-shrink: 0;
}
.cat-badge.empty {
  background: transparent;
  color: var(--ink-faint);
}

/* Impeccable live: colorize variant 2 */
.alert-icon-wrap.success-icon {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: 9999px;
  color: #ffffff;
  background-color: #3ecf8e;
  box-shadow: 0 2px 8px color-mix(in oklch, #3ecf8e 40%, transparent);
}

.category-item.selected .category-button {
  padding: 0.7rem 1.25rem 0.3rem;
  min-height: auto;
}
.cat-selected-item { 
  margin-top: 0; 
  padding: 0 1.25rem 0.7rem; 
}
.selected-compact-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  background: var(--canvas-soft);
  border: 1px solid var(--hairline-cool);
  border-radius: var(--radius-sm);
  padding: 0.45rem 0.65rem;
  transition: all var(--transition-fast);
}
.selected-compact-wrap:hover {
  border-color: var(--hairline-strong);
}
.selected-compact-wrap .item-name { 
  font-size: var(--text-xs); 
  color: var(--ink);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden; 
  text-overflow: ellipsis; 
  line-height: 1.35; 
}
.selected-row-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
.meta-details {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.45rem;
  min-width: 0;
  flex: 1;
}
.meta-details .item-price {
  font-family: var(--font-sans);
  font-size: var(--text-xs);
  color: var(--primary-deep);
  font-weight: 700;
  white-space: nowrap;
}
.meta-details .contact-price {
  color: var(--danger);
  font-weight: 500;
}
.item-specs-compact {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.25rem;
}
.spec-chip {
  font-size: 0.62rem;
  padding: 1px 5px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.04);
  color: var(--ink-mute);
  border: 1px solid var(--hairline-cool);
  white-space: nowrap;
  line-height: 1.2;
}
.sidebar-remove-btn { 
  background: transparent; 
  color: var(--ink-faint); 
  border: 1px solid var(--hairline-cool); 
  padding: 0 0.55rem; 
  border-radius: var(--radius-sm); 
  font-size: 0.7rem; 
  cursor: pointer; 
  min-width: 44px;
  min-height: 44px;
  transition: all var(--transition-fast);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  font-family: var(--font-sans);
  flex-shrink: 0;
  white-space: nowrap;
}
.sidebar-remove-btn:hover {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.35);
  color: var(--danger);
}
.sidebar-remove-btn .remove-text {
  font-size: 0.68rem;
}

/* Wattage Meter Gauge */
.wattage-meter-wrap {
  margin: 1rem 0;
  padding: 0.85rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px dashed var(--hairline-cool);
  border-radius: var(--radius-sm);
}

.meter-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--ink-mute);
  margin-bottom: 0.5rem;
}

.meter-bar-bg {
  height: 6px;
  background: #222222;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.meter-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), #4ade80);
  border-radius: 3px;
  transition: width 0.4s var(--ease-out);
}

.meter-footer {
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
}

/* Budget Breakdown Meter */
.budget-meter-wrap {
  margin: 0.75rem 0 1rem;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px dashed var(--hairline-cool);
  border-radius: var(--radius-sm);
}

.budget-bar {
  height: 8px;
  background: #222222;
  border-radius: 4px;
  display: flex;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.budget-bar-segment {
  height: 100%;
  transition: width 0.3s ease;
}

.budget-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.7rem;
  color: var(--ink-mute);
}

.legend-chip {
  display: flex;
  align-items: center;
  gap: 4px;
}

.legend-color-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
</style>
