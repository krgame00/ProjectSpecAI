<template>
  <div class="container">
    <!-- Loader -->
    <div v-if="isLoading" class="loader-wrapper">
      <div class="spinner spinner-primary"></div>
      <div class="loader-text">
        กำลังดึงข้อมูลสเปกฮาร์ดแวร์ล่าสุดจากฐานข้อมูล MySQL...
      </div>
    </div>
    
    <div v-else class="grid-layout">
      <!-- Sidebar -->
      <PriceSummary 
        :categories="categories" 
        :build="builderStore.build" 
        :catalog="catalogStore.getCategorizedHardware" 
        :totalPrice="builderStore.totalPrice" 
        :activeCategory="activeCategory"
        :compatibilityIssues="builderStore.compatibilityIssues"
        :compatibilityPasses="builderStore.compatibilityPasses"
        :hasAnyComponent="builderStore.hasAnyComponent"
        @set-active-category="activeCategory = $event"
        @remove-item="(catId) => builderStore.selectItem(catId, null)"
        @checkout="$router.push('/checkout')"
      />

      <!-- Main Content -->
      <main class="main-content">
        <HardwareSelection 
          v-if="activeCategory"
          :activeCategory="activeCategory"
          :activeCategoryInfo="activeCategoryInfo"
          :products="catalogStore.getCategorizedHardware[activeCategory] || []"
          :selectedItemId="builderStore.build[activeCategory]"
          :compatibilityIssues="builderStore.compatibilityIssues"
          :hasAnyComponent="builderStore.hasAnyComponent"
          @select-item="(catId, itemId) => builderStore.selectItem(catId, itemId)"
        />
      </main>
    </div>

    <!-- Floating Chatbot -->
    <ChatbotWindow 
      :isOpen="isChatOpen"
      :history="chatHistory"
      :isTyping="isTyping"
      @toggle-chat="$emit('toggle-chat', $event)"
      @send-message="$emit('send-message', $event)"
      @apply-build="$emit('apply-build', $event)"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import PriceSummary from '../components/PriceSummary.vue';
import HardwareSelection from '../components/HardwareSelection.vue';
import ChatbotWindow from '../components/ChatbotWindow.vue';
import { useBuilderStore } from '../stores/builder';
import { useCatalogStore } from '../stores/catalog';

const builderStore = useBuilderStore();
const catalogStore = useCatalogStore();

const isLoading = computed(() => catalogStore.isLoading);

const props = defineProps({
  isChatOpen: Boolean,
  chatHistory: Array,
  isTyping: Boolean
});

const emit = defineEmits([
  'checkout',
  'toggle-chat',
  'send-message',
  'apply-build'
]);

const categories = [
  { id: 'cpu', name: 'CPU', tooltip: 'สมองของระบบ ยิ่งคอร์เยอะ ยิ่งทำงานหลายอย่างพร้อมกันได้ดี' },
  { id: 'mobo', name: 'Motherboard', tooltip: 'แผงวงจรหลัก *ต้องเลือกซ็อกเก็ตให้ตรงกับแบรนด์ CPU*' },
  { id: 'ram', name: 'RAM', tooltip: 'หน่วยความจำชั่วคราว (DDR4 และ DDR5 ใส่ข้ามกันไม่ได้)' },
  { id: 'gpu', name: 'GPU (VGA)', tooltip: 'การ์ดจอ รับหน้าที่ประมวลผลกราฟิกและภาพ 3D' },
  { id: 'storage', name: 'Storage (SSD)', tooltip: 'พื้นที่เก็บข้อมูล เลือกใช้ NVMe SSD จะทำให้เปิดเครื่องไว' },
  { id: 'psu', name: 'Power Supply', tooltip: 'ตัวจ่ายไฟ ต้องมีกำลังไฟมากกว่าที่ชิ้นส่วนทั้งหมดใช้รวมกัน' },
  { id: 'case', name: 'Case', tooltip: 'เคสคอมพิวเตอร์ ควรตรวจสอบขนาดเมนบอร์ดและการ์ดจอที่รองรับ' }
];

const activeCategory = ref('cpu');
const activeCategoryInfo = computed(() => categories.find(c => c.id === activeCategory.value));
</script>

<style scoped>
.loader-wrapper {
  background: var(--canvas);
  border: 1px solid var(--hairline);
  box-shadow: var(--shadow-sm);
  border-radius: var(--radius-lg);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  margin-top: 2rem;
}

.spinner-primary {
  border-top-color: var(--primary);
}

.loader-text {
  color: var(--ink-mute);
  margin-top: 1rem;
}
</style>
