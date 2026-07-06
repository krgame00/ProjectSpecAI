<template>
  <div id="app">
    <!-- Top Navigation -->
    <nav class="top-nav" v-if="$route.path !== '/admin'">
      <div class="nav-content container">
        <div class="logo" @click="$router.push('/')" style="cursor: pointer;">Smart <span>PC Builder</span></div>
        <div class="nav-actions">
          <div class="nav-subtitle">ระบบจัดสเปคอัจฉริยะ พร้อม AI แนะนำ</div>
          
          <button :class="['btn', 'btn-outline', 'btn-sm', { active: $route.path === '/build' }]" @click="$router.push('/build')">💻 จัดสเปค</button>
          <button :class="['btn', 'btn-outline', 'btn-sm', { active: $route.path === '/articles' }]" @click="$router.push('/articles')">📰 บทความ</button>

          <!-- Admin button removed from customer nav entirely to keep it clean -->

          <div v-if="currentUser" class="user-actions">
            <span v-if="userRole !== 'admin'" class="user-name">👤 {{ currentUser.name }}</span>
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
          :articles="articles"
          :catalog="catalogStore.getCategorizedHardware"
          :categories="categories"
          :userRole="userRole"
          :currentUser="currentUser"
          :orders="orders"
          @save-product="handleSaveProduct"
          @delete-product="handleDeleteProduct"
          @save-article="handleSaveArticle"
          @delete-article="handleDeleteArticle"
          @update-order-status="handleUpdateOrderStatus"
          :isChatOpen="isChatOpen"
          :chatHistory="chatHistory"
          :isTyping="isTyping"
          @toggle-chat="isChatOpen = !isChatOpen"
          @send-message="sendMessage"
          @apply-build="applyBuild"
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
            <input type="email" class="form-control" v-model="loginForm.email" placeholder="กรอกอีเมล (เช่น admin@pc.com)" @keyup.enter="handleLoginSubmit">
          </div>
          <div class="form-group">
            <label>รหัสผ่าน</label>
            <input type="password" class="form-control" v-model="loginForm.password" placeholder="••••••••" @keyup.enter="handleLoginSubmit">
          </div>
          <button class="btn btn-primary btn-block mt-4" @click="handleLoginSubmit">เข้าสู่ระบบ</button>
        </div>

        <div class="modal-body" v-if="authTab === 'register'">
          <div class="form-group">
            <label>ชื่อ-นามสกุล</label>
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
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from './stores/auth';
import { useBuilderStore } from './stores/builder';
import { useCatalogStore } from './stores/catalog';

const authStore = useAuthStore();
const builderStore = useBuilderStore();
const catalogStore = useCatalogStore();

const currentUser = computed(() => authStore.user);
const userRole = computed(() => authStore.user?.role || 'guest');

const API_BASE = 'http://localhost:3000/api';

const showLoginModal = ref(false);
const authTab = ref('login');
const loginForm = reactive({ email: '', password: '' });
const registerForm = reactive({ name: '', email: '', password: '' });
const router = useRouter();
const route = useRoute();

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
  try {
    const res = await fetch(`${API_BASE}/articles`);
    if (res.ok) {
      const data = await res.json();
      articles.push(...data);
    }
  } catch (error) {
    console.error('Failed to load articles:', error);
  }
});

// Parent CRUD Handlers (Vue Pattern: Mutate state in parent to resolve prop mutations)
const handleSaveProduct = async ({ category, product }) => {
  const isNew = !product.id || String(product.id).startsWith('temp');
  const url = isNew ? `${API_BASE}/hardware` : `${API_BASE}/hardware/${product.id}`;
  const method = isNew ? 'POST' : 'PUT';
  
  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...product, category })
    });
    if (res.ok) {
      await catalogStore.fetchCatalog();
    }
  } catch (err) {
    console.error('Failed to save product', err);
  }
};

const handleDeleteProduct = async ({ category, productId }) => {
  try {
    const res = await fetch(`${API_BASE}/hardware/${productId}`, { method: 'DELETE' });
    if (res.ok) {
      await catalogStore.fetchCatalog();
    }
  } catch (err) {
    console.error('Failed to delete product', err);
  }
};

const handleSaveArticle = async (article) => {
  const isNew = !article.id;
  const url = isNew ? `${API_BASE}/articles` : `${API_BASE}/articles/${article.id}`;
  const method = isNew ? 'POST' : 'PUT';
  
  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(article)
    });
    if (res.ok) {
      const data = await res.json();
      if (isNew) {
        articles.push(data.article || article);
      } else {
        const idx = articles.findIndex(a => a.id === article.id);
        if (idx !== -1) articles[idx] = { ...articles[idx], ...article };
      }
    }
  } catch (err) {
    console.error('Failed to save article', err);
  }
};

const handleDeleteArticle = async (articleId) => {
  try {
    const res = await fetch(`${API_BASE}/articles/${articleId}`, { method: 'DELETE' });
    if (res.ok) {
      const idx = articles.findIndex(a => a.id === articleId);
      if (idx !== -1) articles.splice(idx, 1);
    }
  } catch (err) {
    console.error('Failed to delete article', err);
  }
};

const handleUpdateOrderStatus = async (orderId, newStatus) => {
  try {
    const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) {
      const idx = orders.findIndex(o => o.id === orderId);
      if (idx !== -1) orders[idx].status = newStatus;
    }
  } catch (err) {
    console.error('Failed to update order status', err);
  }
};

const articles = reactive([]);

const orders = reactive([
  { id: 'ORD-1001', customer: 'สกาย เกมเมอร์', assembly: 'premium', total: 49500, status: 'assembling', date: new Date().toISOString() },
  { id: 'ORD-1002', customer: 'สมชาย ไอที', assembly: 'none', total: 15300, status: 'shipped', date: new Date().toISOString() }
]);

// Chatbot State
const isChatOpen = ref(false);
const isTyping = ref(false);
const chatHistory = reactive([
  { role: 'bot', text: 'สวัสดีครับ! ยินดีต้อนรับสู่ SpecAI คุณต้องการให้ผมแนะนำสเปคคอมพิวเตอร์แบบไหนครับ?' }
]);

const handleLoginSubmit = async () => {
  if(!loginForm.email || !loginForm.password) return alert('กรุณากรอกอีเมลและรหัสผ่าน');
  
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
  if(!registerForm.name || !registerForm.email || !registerForm.password) return alert('กรุณากรอกข้อมูลให้ครบถ้วน');
  
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

const handleReadArticle = (article) => {
  selectedArticle.value = article;
  router.push(`/article/${article.id || 1}`);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Start Checkout
const handleCheckout = () => {
  if (!hasAnyComponent.value) return;
  if (userRole.value === 'guest') {
    showLoginModal.value = true;
  } else {
    router.push('/checkout');
  }
};

const onOrderPlaced = (newOrder) => {
  orders.unshift(newOrder);
  Object.keys(build).forEach(k => build[k] = null);
  router.push('/');
  chatHistory.push({
    role: 'bot',
    text: `🎉 <strong>รับคำสั่งซื้อสำเร็จ!</strong> <br>หมายเลขคำสั่งซื้อของคุณคือ <span style="color:var(--accent)">${newOrder.id}</span><br>หากต้องการสอบถามสถานะเพิ่มเติม สามารถพิมพ์ถามผมด้วยรหัสออเดอร์ได้เลยครับ`
  });
};

const sendMessage = (text) => {
  chatHistory.push({ role: 'user', text });
  isTyping.value = true;
  setTimeout(() => {
    isTyping.value = false;
    processBotResponse(text);
  }, 1200);
};

const processBotResponse = async (text) => {
  try {
    // Keep only the last 10 turns of history to prevent token bloat
    const recentHistory = chatHistory.slice(-10);
    // Exclude the very last message from history if it is the current user message
    if (recentHistory.length > 0 && recentHistory[recentHistory.length - 1].text === text) {
      recentHistory.pop();
    }

    const response = await fetch('http://localhost:3000/api/chatbot/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        message: text,
        history: recentHistory
      })
    });
    
    if (!response.ok) throw new Error('API request failed');
    
    const data = await response.json();
    chatHistory.push({ role: 'bot', text: data.reply, recommended_build: data.recommended_build });
  } catch (error) {
    console.error('Chatbot API Error:', error);
    chatHistory.push({ role: 'bot', text: 'ขออภัยครับ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ระบบ AI ได้ในขณะนี้ กรุณาตรวจสอบว่ารันระบบหลังบ้าน (Node.js) แล้ว ⚠️', recommended_build: null });
  }
};

const applyBuild = (buildObject) => {
  if (!buildObject) return;
  
  // Apply the parts to build state using builderStore
  Object.keys(buildObject).forEach(catId => {
    const itemId = buildObject[catId];
    if (itemId) {
      builderStore.setItem(catId, itemId);
    }
  });
  
  // Calculate total price for confirmation message
  let calculatedTotal = 0;
  const catalog = catalogStore.getCategorizedHardware;
  Object.keys(buildObject).forEach(catId => {
    const itemId = buildObject[catId];
    if (itemId && catalog[catId]) {
      const item = catalog[catId].find(i => i.id === itemId);
      if (item) calculatedTotal += item.price;
    }
  });

  chatHistory.push({ 
    role: 'bot', 
    text: `✅ <strong>จัดสเปคลงตะกร้าเรียบร้อยแล้วครับ!</strong> ราคารวมทั้งหมด ฿${calculatedTotal.toLocaleString()} บาท สามารถตรวจสอบรายละเอียดและปรับแก้เพิ่มเติมได้ที่หน้าจอหลักครับ`
  });
};
// Removed hardcoded applyPreset function logic
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


