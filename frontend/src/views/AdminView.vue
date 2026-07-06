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
      <div class="unauthorized-card">
        <h2 class="unauthorized-title">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</h2>
        <p class="unauthorized-desc">กรุณาเข้าสู่ระบบด้วยบัญชีผู้ดูแลระบบ (Admin) เพื่อเข้าใช้งาน</p>
        <button class="btn btn-primary btn-home" @click="$router.push('/')">กลับสู่หน้าหลัก</button>
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

<style scoped>
.unauthorized-card {
  background: var(--canvas);
  border: 1px solid var(--hairline);
  box-shadow: var(--shadow-sm);
  border-radius: var(--radius-lg);
  padding: 3rem;
  text-align: center;
  margin-top: 2rem;
}

.unauthorized-title {
  font-family: var(--font-sans);
  color: var(--ink);
  margin-bottom: 0.5rem;
}

.unauthorized-desc {
  color: var(--ink-mute);
  margin-bottom: 1.5rem;
}

.btn-home {
  padding: 0.75rem 2rem;
}
</style>
