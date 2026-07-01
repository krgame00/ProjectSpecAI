<template>
  <div class="container">
    <!-- Glassmorphic Loader -->
    <div v-if="isLoading" class="loader-container glass-panel">
      <div class="spinner"></div>
      <div class="loader-text">
        กำลังดึงข้อมูลสเปกฮาร์ดแวร์ล่าสุดจากฐานข้อมูล MySQL...
      </div>
    </div>
    
    <div v-else class="grid-layout">
      <!-- Sidebar -->
      <PriceSummary 
        :categories="categories" 
        :build="build" 
        :catalog="catalog" 
        :totalPrice="totalPrice" 
        :activeCategory="activeCategory"
        :compatibilityIssues="compatibilityIssues"
        :hasAnyComponent="hasAnyComponent"
        @set-active-category="$emit('set-active-category', $event)"
        @remove-item="$emit('remove-item', $event)"
        @checkout="$emit('checkout')"
      />

      <!-- Main Content -->
      <main class="main-content">
        <HardwareSelection 
          v-if="activeCategory"
          :activeCategory="activeCategory"
          :activeCategoryInfo="activeCategoryInfo"
          :products="catalog[activeCategory]"
          :selectedItemId="build[activeCategory]"
          :compatibilityIssues="compatibilityIssues"
          :hasAnyComponent="hasAnyComponent"
          @select-item="(catId, itemId) => $emit('select-item', catId, itemId)"
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
      @apply-preset="$emit('apply-preset', $event)"
    />
  </div>
</template>

<script setup>
import PriceSummary from '../components/PriceSummary.vue';
import HardwareSelection from '../components/HardwareSelection.vue';
import ChatbotWindow from '../components/ChatbotWindow.vue';

const props = defineProps({
  isLoading: Boolean,
  categories: Array,
  build: Object,
  catalog: Object,
  totalPrice: Number,
  activeCategory: String,
  activeCategoryInfo: Object,
  compatibilityIssues: Array,
  hasAnyComponent: Boolean,
  isChatOpen: Boolean,
  chatHistory: Array,
  isTyping: Boolean
});

const emit = defineEmits([
  'set-active-category',
  'remove-item',
  'checkout',
  'select-item',
  'toggle-chat',
  'send-message',
  'apply-preset'
]);
</script>
