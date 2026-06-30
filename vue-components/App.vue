<template>
  <div id="app" class="container">
    <header class="header">
      <div>
        <h1>Smart PC Builder</h1>
        <p>ระบบจัดสเปคคอมพิวเตอร์พร้อมการตรวจสอบความเข้ากันได้</p>
      </div>
    </header>

    <div class="grid-layout">
      <!-- Price Summary Component (Sidebar) -->
      <PriceSummary 
        :categories="categories" 
        :build="build" 
        :catalog="catalog" 
        :totalPrice="totalPrice" 
        :activeCategory="activeCategory"
        :compatibilityIssues="compatibilityIssues"
        :hasAnyComponent="hasAnyComponent"
        @set-active-category="activeCategory = $event"
        @remove-item="selectItem($event, null)"
        @checkout="goToCheckout"
      />

      <!-- Main Hardware Selection Component -->
      <main class="main-content">
        <HardwareSelection 
          v-if="activeCategory"
          :activeCategory="activeCategory"
          :activeCategoryInfo="activeCategoryInfo"
          :products="catalog[activeCategory]"
          :selectedItemId="build[activeCategory]"
          @select-item="selectItem"
        />
      </main>
    </div>

    <!-- Chatbot Component -->
    <ChatbotWindow 
      :isOpen="isChatOpen"
      :history="chatHistory"
      :isTyping="isTyping"
      @toggle-chat="isChatOpen = $event"
      @send-message="handleUserMessage"
      @apply-preset="applyPreset"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import HardwareSelection from './components/HardwareSelection.vue';
import PriceSummary from './components/PriceSummary.vue';
import ChatbotWindow from './components/ChatbotWindow.vue';

// --- State ---
const activeCategory = ref('cpu');
const build = reactive({ cpu: null, mobo: null, ram: null, gpu: null, storage: null, psu: null, case: null });
const isChatOpen = ref(false);
const isTyping = ref(false);
const chatHistory = reactive([/* initial bot message */]);
const catalog = reactive({ /* fetched from API */ cpu: [], mobo: [] }); 
const categories = [ /* list of categories */ ];

// --- Computeds ---
const activeCategoryInfo = computed(() => categories.find(c => c.id === activeCategory.value));
const totalPrice = computed(() => { /* logic to sum selected item prices */ return 0; });
const hasAnyComponent = computed(() => Object.values(build).some(val => val !== null));
const compatibilityIssues = computed(() => { /* logic to check socket, ram, tdp */ return []; });

// --- Methods ---
const selectItem = (catId, itemId) => {
  build[catId] = itemId;
};

const handleUserMessage = async (text) => {
  chatHistory.push({ role: 'user', text });
  isTyping.value = true;
  
  // Call to Node.js Backend API
  try {
    const response = await fetch('/api/chatbot/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });
    const data = await response.json();
    chatHistory.push({ role: 'bot', text: data.reply, presets: data.presets });
  } catch (error) {
    chatHistory.push({ role: 'bot', text: 'ขออภัยครับ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้' });
  } finally {
    isTyping.value = false;
  }
};

const applyPreset = (presetId) => {
  // Logic to apply a hardware preset
};

const goToCheckout = () => {
  // Logic to switch view to checkout
};
</script>
