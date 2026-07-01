<template>
  <div>
    <AdminDashboard
      v-if="userRole === 'admin'"
      :orders="orders"
      :categories="categories"
      :catalog="catalog"
      :articles="articles"
      :currentUser="currentUser"
      @save-product="(data) => $emit('save-product', data)"
      @delete-product="(data) => $emit('delete-product', data)"
      @save-article="(data) => $emit('save-article', data)"
      @delete-article="(id) => $emit('delete-article', id)"
      @update-order-status="(id, status) => $emit('update-order-status', id, status)"
    />
    <div v-else class="container">
      <div class="glass-panel" style="padding: 3rem; text-align: center; margin-top: 2rem;">
        <h2>คุณไม่มีสิทธิ์เข้าถึงหน้านี้</h2>
        <p>กรุณาเข้าสู่ระบบด้วยบัญชีแอดมิน (admin)</p>
        <button class="btn btn-primary" style="margin-top: 1rem;" @click="$router.push('/')">กลับหน้าหลัก</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import AdminDashboard from '../components/AdminDashboard.vue';

const props = defineProps({
  userRole: String,
  orders: Array,
  categories: Array,
  catalog: Object,
  articles: Array,
  currentUser: Object
});

const emit = defineEmits([
  'save-product',
  'delete-product',
  'save-article',
  'delete-article',
  'update-order-status'
]);
</script>
