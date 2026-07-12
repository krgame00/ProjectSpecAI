<template>
  <div id="app">
    <!-- Top Navigation -->
    <nav class="top-nav" v-if="$route.path !== '/admin'">
      <div class="nav-content container">
        <div class="logo" @click="$router.push('/')" style="cursor: pointer; display: flex; align-items: center; gap: 10px;">
          <img src="/images/logo.png" alt="ForgeLabs Logo" style="height: 32px; width: auto; border-radius: 4px;">
          <div class="logo-text" style="display: flex; align-items: center;">Forge<span>Labs</span></div>
        </div>
        <div class="nav-actions">
          <div class="nav-subtitle">ระบบจัดสเปคอัจฉริยะ พร้อม AI แนะนำ</div>

          <button :class="['btn', 'btn-outline', 'btn-sm', { active: $route.path === '/build' }]" @click="$router.push('/build')">💻 จัดสเปค</button>
          <button :class="['btn', 'btn-outline', 'btn-sm', { active: $route.path === '/articles' }]" @click="$router.push('/articles')">📰 บทความ</button>

          <div v-if="currentUser" class="user-actions">
            <span v-if="userRole !== 'admin'" class="user-name">👤 {{ currentUser.name }}</span>
            <button v-if="userRole === 'admin'" class="btn btn-primary btn-sm" @click="$router.push('/admin')">⚙️ หลังบ้านแอดมิน</button>
            <button v-if="userRole !== 'admin'" class="btn btn-outline-primary btn-sm" @click="$router.push('/profile')">ข้อมูลส่วนตัว</button>
            <button class="btn btn-outline-danger btn-sm" @click="logout">ออกจากระบบ</button>
          </div>
          <div v-else>
            <button class="btn btn-outline btn-sm" @click="showLoginModal = true">เข้าสู่ระบบ</button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Views Transition via Vue Router -->
    <router-view v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component
          :is="Component"
          :catalog="catalogStore.getCategorizedHardware"
          :categories="categories"
          :userRole="userRole"
          :currentUser="currentUser"
          :orders="adminStore.orders"
          :articles="articleStore.articles"
          @save-product="adminStore.saveProduct"
          @delete-product="adminStore.deleteProduct"
          @save-article="articleStore.saveArticle"
          @delete-article="articleStore.deleteArticle"
          @update-order-status="adminStore.updateOrderStatus"
          :isChatOpen="chatbotStore.isOpen"
          :chatHistory="chatbotStore.history"
          :isTyping="chatbotStore.isTyping"
          @toggle-chat="chatbotStore.toggle"
          @send-message="chatbotStore.sendMessage"
          @apply-build="chatbotStore.applyBuild"
        />
      </Transition>
    </router-view>

    <!-- Auth Modal -->
    <Transition name="modal">
      <div class="modal-overlay" v-if="showLoginModal" @click.self="showLoginModal = false">
      <div class="modal-content glass-panel">
        <div class="modal-header">
          <div class="auth-tabs">
            <button :class="['auth-tab', { active: authTab === 'login' }]" @click="authTab = 'login'">เข้าสู่ระบบ</button>
            <button :class="['auth-tab', { active: authTab === 'register' }]" @click="authTab = 'register'">สมัครสมาชิก</button>
          </div>
          <button class="close-btn" @click="showLoginModal = false">✕</button>
        </div>

        <div class="modal-body" v-if="authTab === 'login'">
          <div class="form-group">
            <label>อีเมล</label>
            <input type="email" class="form-control" v-model="loginForm.email" placeholder="กรอกอีเมล" @keyup.enter="handleLoginSubmit">
          </div>
          <div class="form-group">
            <label>รหัสผ่าน</label>
            <input type="password" class="form-control" v-model="loginForm.password" placeholder="กรอกรหัสผ่าน" @keyup.enter="handleLoginSubmit">
          </div>
          <button class="btn btn-primary btn-block mt-4" @click="handleLoginSubmit">เข้าสู่ระบบ</button>
        </div>

        <div class="modal-body" v-if="authTab === 'register'">
          <div class="form-group">
            <label>ชื่อ</label>
            <input type="text" class="form-control" v-model="registerForm.name" placeholder="ชื่อที่จะแสดงในระบบ">
          </div>
          <div class="form-group">
            <label>อีเมล</label>
            <input type="email" class="form-control" v-model="registerForm.email" placeholder="ตั้งอีเมลของคุณ">
          </div>
          <div class="form-group">
            <label>รหัสผ่าน</label>
            <input type="password" class="form-control" v-model="registerForm.password" placeholder="ตั้งรหัสผ่าน">
          </div>
          <button class="btn btn-primary btn-block mt-4" @click="handleRegisterSubmit">สร้างบัญชี</button>
        </div>
      </div>
    </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';
import { useBuilderStore } from './stores/builder';
import { useCatalogStore } from './stores/catalog';
import { useAdminStore } from './stores/admin';
import { useChatbotStore } from './stores/chatbot';
import { useArticleStore } from './stores/article';

const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.PROD ? 'https://projectspecai-production.up.railway.app/api/v1' : 'http://localhost:3000/api/v1');

const authStore = useAuthStore();
const builderStore = useBuilderStore();
const catalogStore = useCatalogStore();
const adminStore = useAdminStore();
const chatbotStore = useChatbotStore();
const articleStore = useArticleStore();

const currentUser = computed(() => authStore.user);
const userRole = computed(() => authStore.user?.role || 'guest');

const showLoginModal = ref(false);
const authTab = ref('login');
const loginForm = reactive({ email: '', password: '' });
const registerForm = reactive({ name: '', email: '', password: '' });
const router = useRouter();

const categories = [
  { id: 'cpu', name: 'CPU', tooltip: 'สมองของระบบ' },
  { id: 'mobo', name: 'Motherboard', tooltip: 'แผงวงจรหลัก' },
  { id: 'ram', name: 'RAM', tooltip: 'หน่วยความจำ' },
  { id: 'gpu', name: 'GPU (VGA)', tooltip: 'การ์ดจอ' },
  { id: 'storage', name: 'Storage (SSD)', tooltip: 'พื้นที่เก็บข้อมูล' },
  { id: 'psu', name: 'Power Supply', tooltip: 'ตัวจ่ายไฟ' },
  { id: 'case', name: 'Case', tooltip: 'เคสคอมพิวเตอร์' }
];

onMounted(async () => {
  await catalogStore.fetchCatalog();
  await articleStore.fetchArticles();
  if (userRole.value === 'admin') {
    await adminStore.fetchOrders();
  }
});

const handleLoginSubmit = async () => {
  if (!loginForm.email || !loginForm.password) return alert('กรุณากรอกอีเมลและรหัสผ่าน');

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginForm)
    });

    const data = await res.json();
    if (res.ok) {
      authStore.setUser(data.user, data.token);
      showLoginModal.value = false;
      loginForm.email = ''; loginForm.password = '';

      if (data.user.role === 'admin') {
        await adminStore.fetchOrders();
        router.push('/admin');
      }
    } else {
      alert(data.error || 'เข้าสู่ระบบล้มเหลว');
    }
  } catch (err) {
    alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
  }
};

const handleRegisterSubmit = async () => {
  if (!registerForm.name || !registerForm.email || !registerForm.password) return alert('กรุณากรอกข้อมูลให้ครบถ้วน');

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerForm)
    });

    const data = await res.json();
    if (res.ok) {
      alert('สมัครสมาชิกสำเร็จ! กำลังเข้าสู่ระบบ...');
      authStore.setUser(data.user, data.token);
      showLoginModal.value = false;
      registerForm.name = ''; registerForm.email = ''; registerForm.password = '';
    } else {
      alert(data.error || 'สมัครสมาชิกล้มเหลว');
    }
  } catch (err) {
    alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
  }
};

const logout = () => {
  authStore.logout();
  router.push('/');
};

const handleCheckout = () => {
  if (!builderStore.hasAnyComponent) return;
  if (userRole.value === 'guest') {
    showLoginModal.value = true;
  } else {
    router.push('/checkout');
  }
};
</script>

<style scoped>
.modal-overlay { 
  position: fixed; 
  top: 0; left: 0; right: 0; bottom: 0; 
  background: rgba(23, 23, 23, 0.6); 
  z-index: 200; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
}
.modal-content { 
  border-radius: var(--radius-xl); 
  width: 90%; 
  max-width: 420px; 
  overflow: hidden; 
  background: var(--canvas);
  border: 1px solid var(--hairline);
  box-shadow: var(--shadow-xl);
}
.modal-header { 
  padding: 1.5rem 1.75rem 0; 
  border-bottom: 1px solid var(--hairline-cool); 
  display: flex; 
  justify-content: space-between; 
  align-items: flex-start;
  padding-bottom: 1rem;
}
.close-btn { 
  background: var(--canvas-soft); 
  border: 1px solid var(--hairline); 
  color: var(--ink-mute); 
  font-size: 1rem;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.close-btn:hover { 
  color: var(--danger); 
  background: var(--danger-soft);
  border-color: var(--danger-border);
}
.modal-body { padding: 1.75rem; }
.form-group { margin-bottom: 1.35rem; }
.form-group label { 
  display: block; 
  margin-bottom: 0.5rem; 
  font-size: var(--text-sm); 
  color: var(--ink-mute);
  font-weight: 500;
}
.auth-tabs { display: flex; gap: 0; margin-bottom: -1px; }
.auth-tab { 
  background: transparent; 
  border: none; 
  color: var(--ink-mute); 
  font-size: var(--text-base); 
  font-weight: 500; 
  padding: 0.6rem 1.2rem; 
  cursor: pointer; 
  border-bottom: 2px solid transparent; 
  transition: all var(--transition-fast);
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  font-family: var(--font-sans);
}
.auth-tab:hover { 
  color: var(--ink); 
  background: var(--canvas-soft);
}
.auth-tab.active { 
  color: var(--primary-deep); 
  border-bottom-color: var(--primary);
}
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-enter-active .modal-content {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-leave-active .modal-content {
  transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: translateY(12px) scale(0.98);
}
.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1.5rem;
  padding: 3rem;
  border-radius: var(--radius-lg);
  margin: var(--space-xl) 0;
  text-align: center;
  background: var(--canvas-soft);
  border: 1px solid var(--hairline-cool);
}
.loader-text {
  color: var(--ink-mute);
  font-size: var(--text-md);
}
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--hairline);
  border-radius: 50%;
  border-top-color: var(--primary);
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>


