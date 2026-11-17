<template>
  <div id="app">
    <!-- Toast Notification Container -->
    <ToastNotification />

    <!-- Top Navigation -->
    <nav class="top-nav" v-if="$route.path !== '/admin'" :inert="chatbotStore.isOpen || showLoginModal">
      <div class="nav-content container">
        <div class="logo" @click="$router.push('/')" style="cursor: pointer; display: flex; align-items: center; gap: 10px;">
          <img src="/images/logo.png" alt="ForgeLabs Logo" style="height: 32px; width: auto; border-radius: 4px;">
          <div class="logo-text" style="display: flex; align-items: center;">Forge<span>Labs</span></div>
        </div>
        <button
          ref="navToggleRef"
          type="button"
          class="nav-toggle touch-target"
          data-test="nav-toggle"
          aria-controls="primary-navigation"
          :aria-expanded="String(isNavOpen)"
          aria-label="เปิดหรือปิดเมนูหลัก"
          @click="toggleNav"
        >
          <span aria-hidden="true">{{ isNavOpen ? '×' : '☰' }}</span>
        </button>
        <div id="primary-navigation" :class="['nav-actions', { 'is-open': isNavOpen }]">
          <div class="nav-subtitle">ระบบจัดสเปคอัจฉริยะ พร้อม AI แนะนำ</div>

          <button :class="['btn', 'btn-outline', 'btn-sm', { active: $route.path === '/build' }]" @click="navigateTo('/build')">💻 จัดสเปค</button>
          <button :class="['btn', 'btn-outline', 'btn-sm', { active: $route.path === '/articles' }]" @click="navigateTo('/articles')">📰 บทความ</button>

          <div v-if="currentUser" class="user-actions">
            <div class="nav-divider" aria-hidden="true"></div>
            <div class="user-profile-badge">
              <span class="user-name">👤 {{ currentUser.name }}</span>
              <span v-if="userRole === 'admin'" class="role-badge font-mono">ADMIN</span>
            </div>
            <button v-if="userRole === 'admin'" class="btn btn-outline btn-sm btn-admin-nav" @click="navigateTo('/admin')">⚙️ หลังบ้านแอดมิน</button>
            <button v-if="userRole !== 'admin'" class="btn btn-outline-primary btn-sm" @click="navigateTo('/profile')">ข้อมูลส่วนตัว</button>
            <button class="btn btn-outline btn-sm btn-logout" @click="logout">ออกจากระบบ</button>
          </div>
          <div v-else class="guest-actions">
            <div class="nav-divider" aria-hidden="true"></div>
            <button class="btn btn-outline btn-sm" @click="openLoginModal">เข้าสู่ระบบ</button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Views Transition via Vue Router -->
    <div ref="routeContentRef" class="route-content" :inert="showLoginModal">
    <router-view v-slot="{ Component }">
      <Transition
        name="page"
        mode="out-in"
        @before-enter="prepareRouteFocus"
        @after-enter="focusRouteDestination"
      >
        <component
          :is="Component"
          :key="$route.fullPath"
          :catalog="catalogStore.getCategorizedHardware"
          :categories="categories"
          :userRole="userRole"
          :currentUser="currentUser"
          :orders="adminStore.orders"
          :articles="articleStore.articles"
          :articles-loading="articleStore.isLoading"
          :articles-error="articleStore.error"
          @retry-articles="articleStore.fetchArticles"
          :isChatOpen="chatbotStore.isOpen"
          :chatHistory="chatbotStore.history"
          :isTyping="chatbotStore.isTyping"
          @toggle-chat="chatbotStore.toggle"
          @send-message="chatbotStore.sendMessage"
          @apply-build="chatbotStore.applyBuild"
          @clear-chat="chatbotStore.clear"
          @request-login="openLoginFromChat"
        />
      </Transition>
    </router-view>
    </div>
    <p class="sr-only" aria-live="polite" aria-atomic="true" data-test="route-announcement">
      {{ routeAnnouncement }}
    </p>

    <!-- Auth Modal -->
    <Transition name="modal">
      <div class="modal-overlay" v-if="showLoginModal" @click.self="closeLoginModal">
      <div
        ref="authDialogRef"
        class="modal-content glass-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-dialog-title"
        tabindex="-1"
      >
        <h2 id="auth-dialog-title" class="sr-only">บัญชีผู้ใช้ ForgeLabs</h2>
        <div class="modal-header">
          <div class="auth-tabs">
            <button :class="['auth-tab', { active: authTab === 'login' }]" @click="authTab = 'login'">เข้าสู่ระบบ</button>
            <button :class="['auth-tab', { active: authTab === 'register' }]" @click="authTab = 'register'">สมัครสมาชิก</button>
          </div>
          <button class="close-btn" aria-label="ปิดหน้าต่างบัญชีผู้ใช้" @click="closeLoginModal">✕</button>
        </div>

        <div class="modal-body" v-if="authTab === 'login'">
          <form @submit.prevent="handleLoginSubmit" novalidate>
            <div class="form-group">
              <label for="login-email">อีเมล</label>
              <input
                id="login-email"
                type="email"
                class="form-control"
                v-model="loginForm.email"
                placeholder="กรอกอีเมล"
                autocomplete="email"
                autocapitalize="none"
                spellcheck="false"
                required
              >
            </div>
            <div class="form-group">
              <label for="login-password">รหัสผ่าน</label>
              <div class="password-input-wrap">
                <input
                  id="login-password"
                  :type="showLoginPassword ? 'text' : 'password'"
                  class="form-control"
                  v-model="loginForm.password"
                  placeholder="กรอกรหัสผ่าน"
                  autocomplete="current-password"
                  required
                >
                <button
                  type="button"
                  class="password-toggle-btn"
                  :aria-label="showLoginPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'"
                  @click="showLoginPassword = !showLoginPassword"
                >
                  <span v-if="showLoginPassword">👁️‍🗨️</span>
                  <span v-else>👁️</span>
                </button>
              </div>
            </div>
            <button
              type="submit"
              class="btn btn-primary btn-block mt-4"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}
            </button>
          </form>
        </div>

        <div class="modal-body" v-if="authTab === 'register'">
          <form @submit.prevent="handleRegisterSubmit" novalidate>
            <div class="form-group">
              <label for="reg-name">ชื่อ</label>
              <input
                id="reg-name"
                type="text"
                class="form-control"
                v-model="registerForm.name"
                placeholder="ชื่อที่จะแสดงในระบบ"
                autocomplete="name"
                required
              >
            </div>
            <div class="form-group">
              <label for="reg-email">อีเมล</label>
              <input
                id="reg-email"
                type="email"
                class="form-control"
                v-model="registerForm.email"
                placeholder="ตั้งอีเมลของคุณ"
                autocomplete="email"
                autocapitalize="none"
                spellcheck="false"
                required
              >
            </div>
            <div class="form-group">
              <div class="form-label-row">
                <label for="reg-password">รหัสผ่าน</label>
                <span class="form-hint">อย่างน้อย 6 ตัวอักษร</span>
              </div>
              <div class="password-input-wrap">
                <input
                  id="reg-password"
                  :type="showRegPassword ? 'text' : 'password'"
                  class="form-control"
                  v-model="registerForm.password"
                  placeholder="ตั้งรหัสผ่าน"
                  autocomplete="new-password"
                  required
                >
                <button
                  type="button"
                  class="password-toggle-btn"
                  :aria-label="showRegPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'"
                  @click="showRegPassword = !showRegPassword"
                >
                  <span v-if="showRegPassword">👁️‍🗨️</span>
                  <span v-else>👁️</span>
                </button>
              </div>
            </div>
            <button
              type="submit"
              class="btn btn-primary btn-block mt-4"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? 'กำลังสร้างบัญชี...' : 'สร้างบัญชี' }}
            </button>
          </form>
        </div>
      </div>
    </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';
import { useBuilderStore } from './stores/builder';
import { useCatalogStore } from './stores/catalog';
import { useAdminStore } from './stores/admin';
import { useChatbotStore } from './stores/chatbot';
import { useArticleStore } from './stores/article';
import { useToastStore } from './stores/toast';
import ToastNotification from './components/ToastNotification.vue';
import { useDialogFocus } from './composables/useDialogFocus';

import { API_BASE } from './services/apiBase';

const authStore = useAuthStore();
const builderStore = useBuilderStore();
const catalogStore = useCatalogStore();
const adminStore = useAdminStore();
const chatbotStore = useChatbotStore();
const articleStore = useArticleStore();
const toast = useToastStore();

const currentUser = computed(() => authStore.user);
const userRole = computed(() => authStore.user?.role || 'guest');

const showLoginModal = ref(false);
const routeContentRef = ref(null);
const routeAnnouncement = ref('');
const authDialogRef = ref(null);
const authReturnFocusRef = ref(null);
const navToggleRef = ref(null);
const isNavOpen = ref(false);
const authTab = ref('login');
const isSubmitting = ref(false);
const showLoginPassword = ref(false);
const showRegPassword = ref(false);
const loginForm = reactive({ email: '', password: '' });
const registerForm = reactive({ name: '', email: '', password: '' });
const router = useRouter();

const prepareRouteFocus = () => {
  routeAnnouncement.value = ''
}

const focusRouteDestination = async () => {
  await nextTick()
  const target = routeContentRef.value?.querySelector('[data-route-focus]')
  if (!(target instanceof HTMLElement)) return

  target.focus({ preventScroll: true })
  const labelledBy = target.getAttribute('aria-labelledby')
  const heading = labelledBy
    ? document.getElementById(labelledBy)
    : target.querySelector('h1')
  routeAnnouncement.value = heading?.textContent?.trim()
    || target.getAttribute('aria-label')
    || ''
}

const toggleNav = () => {
  isNavOpen.value = !isNavOpen.value;
};

const closeNav = () => {
  isNavOpen.value = false;
};

const navigateTo = (path) => {
  closeNav();
  router.push(path);
};

const openLoginModal = (event) => {
  authReturnFocusRef.value = isNavOpen.value
    ? navToggleRef.value
    : event?.currentTarget instanceof HTMLElement ? event.currentTarget : null
  closeNav()
  authTab.value = 'login'
  showLoginPassword.value = false
  showRegPassword.value = false
  showLoginModal.value = true
}
const closeLoginModal = () => {
  showLoginModal.value = false
  showLoginPassword.value = false
  showRegPassword.value = false
}
useDialogFocus(showLoginModal, authDialogRef, closeLoginModal, authReturnFocusRef)
const openLoginFromChat = async () => {
  chatbotStore.toggle(false)
  await nextTick()
  openLoginModal({ currentTarget: document.querySelector('.chat-fab') })
}

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
  await Promise.all([
    catalogStore.fetchCatalog(),
    articleStore.fetchArticles()
  ])
  if (userRole.value === 'admin') {
    await adminStore.fetchOrders();
  }
});

const handleLoginSubmit = async () => {
  if (isSubmitting.value) return;
  if (!loginForm.email || !loginForm.password) return toast.warning('กรุณากรอกอีเมลและรหัสผ่าน');

  isSubmitting.value = true;
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
      showLoginPassword.value = false;
      toast.success(`ยินดีต้อนรับคุณ ${data.user.name}`);

      if (data.user.role === 'admin') {
        await adminStore.fetchOrders();
        router.push('/admin');
      }
    } else {
      toast.error(data.error || 'เข้าสู่ระบบล้มเหลว');
    }
  } catch (err) {
    toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
  } finally {
    isSubmitting.value = false;
  }
};

const handleRegisterSubmit = async () => {
  if (isSubmitting.value) return;
  if (!registerForm.name || !registerForm.email || !registerForm.password) return toast.warning('กรุณากรอกข้อมูลให้ครบถ้วน');
  if (registerForm.password.length < 6) return toast.warning('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');

  isSubmitting.value = true;
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerForm)
    });

    const data = await res.json();
    if (res.ok) {
      toast.success('สมัครสมาชิกสำเร็จ! กำลังเข้าสู่ระบบ...');
      authStore.setUser(data.user, data.token);
      showLoginModal.value = false;
      registerForm.name = ''; registerForm.email = ''; registerForm.password = '';
      showRegPassword.value = false;
    } else {
      toast.error(data.error || 'สมัครสมาชิกล้มเหลว');
    }
  } catch (err) {
    toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
  } finally {
    isSubmitting.value = false;
  }
};

const logout = () => {
  closeNav();
  authStore.logout();
  router.push('/');
};
</script>

<style scoped>
.modal-overlay { 
  position: fixed; 
  top: 0; left: 0; right: 0; bottom: 0; 
  background: rgba(23, 23, 23, 0.6); 
  z-index: var(--z-backdrop);
  display: flex; 
  align-items: center; 
  justify-content: center;
  padding: max(1rem, env(safe-area-inset-top)) var(--page-gutter) max(1rem, env(safe-area-inset-bottom));
}
.modal-content { 
  border-radius: var(--radius-xl); 
  width: min(100%, 420px);
  max-width: 420px; 
  max-height: calc(100dvh - 2rem - env(safe-area-inset-top) - env(safe-area-inset-bottom));
  overflow-y: auto;
  background: var(--canvas);
  border: 1px solid var(--hairline);
  box-shadow: var(--shadow-xl);
}
.nav-toggle {
  display: none;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 1px solid var(--hairline-strong);
  border-radius: var(--radius-sm);
  background: var(--canvas);
  color: var(--ink);
  cursor: pointer;
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
.form-label-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.5rem;
}
.form-label-row label {
  margin-bottom: 0;
}
.form-hint {
  font-size: var(--text-xs);
  color: var(--ink-faint);
  font-weight: 400;
}
.password-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.password-input-wrap .form-control {
  padding-right: 2.75rem;
}
.password-toggle-btn {
  position: absolute;
  right: 0.75rem;
  background: transparent;
  border: none;
  font-size: 1rem;
  line-height: 1;
  color: var(--ink-faint);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: opacity var(--transition-fast);
  opacity: 0.7;
}
.password-toggle-btn:hover {
  opacity: 1;
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

@media (max-width: 767px) {
  .nav-toggle { display: inline-flex; }
  .nav-actions {
    display: none;
    position: absolute;
    inset: 100% 0 auto;
    flex-direction: column;
    align-items: stretch;
    padding: var(--space-lg) var(--page-gutter) max(var(--space-lg), env(safe-area-inset-bottom));
    background: var(--canvas-soft);
    border-bottom: 1px solid var(--hairline-cool);
    box-shadow: var(--shadow-md);
  }
  .nav-actions.is-open { display: flex; }
  .nav-actions .btn { width: 100%; }
  .user-actions { flex-direction: column; align-items: stretch; gap: var(--space-sm); }
  .user-name { padding: var(--space-sm) 0; text-align: center; }
  .guest-actions { flex-direction: column; align-items: stretch; width: 100%; gap: var(--space-sm); }
  .nav-divider { width: 100%; height: 1px; margin: var(--space-xs) 0; }
  .user-profile-badge { width: 100%; justify-content: center; padding: 0.5rem; }
}

@media (max-width: 63.99rem) {
  .modal-enter-from .modal-content,
  .modal-leave-to .modal-content {
    transform: translateY(12px);
  }
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>


