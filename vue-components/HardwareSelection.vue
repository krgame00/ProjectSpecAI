<template>
  <div class="product-grid" v-if="activeCategory">
    <!-- Active Category Header -->
    <div class="category-title" v-if="activeCategoryInfo">
      <span>{{ activeCategoryInfo.name }}</span>
      <span class="tooltip-icon" :title="activeCategoryInfo.tooltip">?</span>
    </div>

    <!-- Products -->
    <div 
      class="product-card" 
      v-for="item in products" 
      :key="item.id" 
      :class="{ selected: selectedItemId === item.id }"
      @click="selectItem(item.id)"
    >
      <div class="product-img">
        <img :src="item.image" :alt="item.name">
      </div>
      <div class="product-name">{{ item.name }}</div>
      <div class="product-specs">
        <span v-if="item.socket">Socket: {{ item.socket }}</span>
        <span v-if="item.tdp">| TDP: {{ item.tdp }}W</span>
        <span v-if="item.ramType">| RAM: {{ item.ramType }}</span>
        <span v-if="item.type">| Type: {{ item.type }}</span>
        <span v-if="item.wattage">| {{ item.wattage }}W</span>
      </div>
      <div class="product-footer">
        <div class="product-price">฿{{ item.price.toLocaleString() }}</div>
        <button class="add-btn">
          <span v-if="selectedItemId === item.id">✓</span>
          <span v-else>+</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  activeCategory: String,
  activeCategoryInfo: Object,
  products: Array,
  selectedItemId: String
});

const emit = defineEmits(['select-item']);

const selectItem = (itemId) => {
  emit('select-item', props.activeCategory, itemId);
};
</script>

<style scoped>
/* Component-specific styles for hardware list */
.product-grid { display: grid; gap: 1rem; }
.product-card { /* styles */ }
.tooltip-icon { cursor: help; }
</style>