<template>
  <div id="app">
    <!-- Top Navigation -->
    <nav class="top-nav">
      <div class="nav-content container">
        <div class="logo">Smart <span>PC Builder</span></div>
        <div class="nav-actions">
          <div class="nav-subtitle">ระบบจัดสเปคอัจฉริยะ พร้อม AI แนะนำ</div>
          
          <button :class="['btn', 'btn-outline', 'btn-sm', { active: currentView === 'builder' }]" @click="currentView = 'builder'">💻 จัดสเปค</button>
          <button :class="['btn', 'btn-outline', 'btn-sm', { active: currentView === 'articles' }]" @click="currentView = 'articles'">📰 บทความ</button>

          <button v-if="userRole === 'admin'" :class="['btn', 'btn-outline', 'btn-sm', { active: currentView === 'admin' }]" @click="toggleAdmin">
            {{ currentView === 'admin' ? '← กลับหน้าร้าน' : '🛠 ระบบหลังบ้าน' }}
          </button>

          <div v-if="currentUser" class="user-actions">
            <span class="user-name">👤 {{ currentUser.name }}</span>
            <button class="btn btn-outline-danger btn-sm" @click="logout">ออกจากระบบ</button>
          </div>
          <div v-else>
            <button class="btn btn-outline btn-sm" @click="showLoginModal = true">เข้าสู่ระบบ</button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Views Transition -->
    <Transition name="page" mode="out-in">
      <!-- Builder View -->
      <div class="container" v-if="currentView === 'builder'">
      <!-- Glassmorphic Loader (Frontend Pattern) -->
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
          @set-active-category="activeCategory = $event"
          @remove-item="selectItem($event, null)"
          @checkout="handleCheckout"
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
            @select-item="selectItem"
          />
        </main>
      </div>

      <!-- Floating Chatbot -->
      <ChatbotWindow 
        :isOpen="isChatOpen"
        :history="chatHistory"
        :isTyping="isTyping"
        @toggle-chat="isChatOpen = $event"
        @send-message="sendMessage"
        @apply-preset="applyPreset"
      />
    </div>

    <!-- Checkout View -->
    <CheckoutView
      v-else-if="currentView === 'checkout'"
      :categories="categories"
      :build="build"
      :catalog="catalog"
      :totalPrice="totalPrice"
      :currentUser="currentUser"
      @go-back="currentView = 'builder'"
      @order-placed="onOrderPlaced"
    />

    <AdminDashboard
      v-else-if="currentView === 'admin' && userRole === 'admin'"
      :orders="orders"
      :categories="categories"
      :catalog="catalog"
      :articles="articles"
      @save-product="handleSaveProduct"
      @delete-product="handleDeleteProduct"
      @save-article="handleSaveArticle"
      @delete-article="handleDeleteArticle"
      @update-order-status="handleUpdateOrderStatus"
    />

    <!-- Articles View -->
    <ArticlesView
      v-else-if="currentView === 'articles'"
      :articles="articles"
      @read-article="handleReadArticle"
    />

    <!-- Article Detail View -->
    <ArticleDetailView
      v-else-if="currentView === 'article-detail'"
      :article="selectedArticle"
      @go-back="currentView = 'articles'"
    />
    </Transition>

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
            <label>ชื่อผู้ใช้งาน</label>
            <input type="text" class="form-control" v-model="loginForm.username" placeholder="กรอกชื่อผู้ใช้ (พิมพ์ admin)" @keyup.enter="handleLoginSubmit">
          </div>
          <div class="form-group">
            <label>รหัสผ่าน</label>
            <input type="password" class="form-control" v-model="loginForm.password" placeholder="••••••••" @keyup.enter="handleLoginSubmit">
          </div>
          <button class="btn btn-primary btn-block mt-4" @click="handleLoginSubmit">เข้าสู่ระบบ</button>
          
          <div class="demo-login-section">
            <span class="demo-login-title">--- โหมดจำลอง (Quick Login) ---</span>
            <div class="demo-login-actions">
              <button class="btn btn-outline btn-sm" @click="login('user')">User Demo</button>
              <button class="btn btn-outline btn-sm" @click="login('admin')">Admin Demo</button>
            </div>
          </div>
        </div>

        <div class="modal-body" v-if="authTab === 'register'">
          <div class="form-group">
            <label>ชื่อ-นามสกุล</label>
            <input type="text" class="form-control" v-model="registerForm.name" placeholder="ชื่อที่จะแสดงในระบบ">
          </div>
          <div class="form-group">
            <label>ชื่อผู้ใช้งาน</label>
            <input type="text" class="form-control" v-model="registerForm.username" placeholder="ตั้งชื่อผู้ใช้ของคุณ">
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
import { ref, reactive, computed, onMounted } from 'vue';
import PriceSummary from './components/PriceSummary.vue';
import HardwareSelection from './components/HardwareSelection.vue';
import ChatbotWindow from './components/ChatbotWindow.vue';
import CheckoutView from './components/CheckoutView.vue';
import AdminDashboard from './components/AdminDashboard.vue';
import ArticlesView from './components/ArticlesView.vue';
import ArticleDetailView from './components/ArticleDetailView.vue';

const API_BASE = 'http://localhost:3000/api';

// --- State ---
const currentUser = ref(null);
const userRole = ref('guest'); 
const showLoginModal = ref(false);
const authTab = ref('login');
const loginForm = reactive({ username: '', password: '' });
const registerForm = reactive({ name: '', username: '', password: '' });
const currentView = ref('builder'); 
const selectedArticle = ref(null);
const isLoading = ref(true);

// Fetch catalog from backend API on mount (Frontend Pattern: Dynamic loading)
onMounted(async () => {
  try {
    const response = await fetch('http://localhost:3000/api/hardware/catalog');
    if (response.ok) {
      const data = await response.json();
      // Synchronize database data into the catalog reactive object
      Object.keys(data).forEach(key => {
        catalog[key] = data[key];
      });
      console.log('✅ Catalog synchronized with database successfully.');
    } else {
      console.warn('⚠️ Server catalog response was not ok, using static fallback.');
    }
  } catch (error) {
    console.error('⚠️ Could not connect to API server for catalog, using static fallback:', error);
  } finally {
    isLoading.value = false;
  }
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
      const data = await res.json();
      const targetCategory = catalog[category];
      if (!targetCategory) return;

      if (isNew) {
        targetCategory.push({ ...product, id: data.id || product.id });
      } else {
        const idx = targetCategory.findIndex(p => p.id === product.id);
        if (idx !== -1) targetCategory[idx] = { ...targetCategory[idx], ...product };
      }
    }
  } catch (err) {
    console.error('Failed to save product', err);
  }
};

const handleDeleteProduct = async ({ category, productId }) => {
  try {
    const res = await fetch(`${API_BASE}/hardware/${productId}`, { method: 'DELETE' });
    if (res.ok) {
      const targetCategory = catalog[category];
      if (!targetCategory) return;
      const idx = targetCategory.findIndex(p => p.id === productId);
      if (idx !== -1) targetCategory.splice(idx, 1);
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

// Data Sources (Articles will be fetched from API soon)
const articles = reactive([]);

const categories = [
  { id: 'cpu', name: 'CPU', tooltip: 'สมองของระบบ ยิ่งคอร์เยอะ ยิ่งทำงานหลายอย่างพร้อมกันได้ดี' },
  { id: 'mobo', name: 'Motherboard', tooltip: 'แผงวงจรหลัก *ต้องเลือกซ็อกเก็ตให้ตรงกับแบรนด์ CPU*' },
  { id: 'ram', name: 'RAM', tooltip: 'หน่วยความจำชั่วคราว (DDR4 และ DDR5 ใส่ข้ามกันไม่ได้)' },
  { id: 'gpu', name: 'GPU (VGA)', tooltip: 'การ์ดจอ รับหน้าที่ประมวลผลกราฟิกและภาพ 3D' },
  { id: 'storage', name: 'Storage (SSD)', tooltip: 'พื้นที่เก็บข้อมูล เลือกใช้ NVMe SSD จะทำให้เปิดเครื่องไว' },
  { id: 'psu', name: 'Power Supply', tooltip: 'ตัวจ่ายไฟ ต้องมีกำลังไฟมากกว่าที่ชิ้นส่วนทั้งหมดใช้รวมกัน' },
  { id: 'case', name: 'Case', tooltip: 'เคสคอมพิวเตอร์ ควรตรวจสอบขนาดเมนบอร์ดและการ์ดจอที่รองรับ' }
];

const catalog = reactive({
  cpu: [
    {id:1,name:'AMD RYZEN 5 5600G (65W)',price:4990,image:'/images/cpu.png',socket:'AM4',tdp:65},
    {id:2,name:'AMD RYZEN 3 3200G (65W)',price:1990,image:'/images/cpu.png',socket:'AM4',tdp:65},
    {id:3,name:'AMD RYZEN 5 3400G (65W)',price:2350,image:'/images/cpu.png',socket:'AM4',tdp:65},
    {id:4,name:'Intel Core i5-13400F (65W)',price:6500,image:'/images/cpu.png',socket:'LGA1700',tdp:65},
    {id:5,name:'Intel Core i5-3470 (77W)',price:1200,image:'/images/cpu.png',socket:'LGA1155',tdp:77},
    {id:6,name:'Intel Core i7-14700K (125W)',price:15000,image:'/images/cpu.png',socket:'LGA1700',tdp:125},
    {id:7,name:'AMD Ryzen 5 7600 (65W)',price:7500,image:'/images/cpu.png',socket:'AM5',tdp:65},
    {id:8,name:'AMD Ryzen 9 7950X (170W)',price:22000,image:'/images/cpu.png',socket:'AM5',tdp:170},
    {id:9,name:'Intel Core i3-12100F (58W)',price:3200,image:'/images/cpu.png',socket:'LGA1700',tdp:58},
    {id:10,name:'Intel Core i5-12400F (65W)',price:4500,image:'/images/cpu.png',socket:'LGA1700',tdp:65},
  ],
  mobo: [
    {id:11,name:'LONGWELL H77',price:1420,image:'/images/mobo.png',socket:'LGA1155',ramType:'DDR3'},
    {id:12,name:'ASROCK A520M-HVS DDR4',price:1380,image:'/images/mobo.png',socket:'AM4',ramType:'DDR4'},
    {id:13,name:'MSI A520M-A PRO DDR4',price:1355,image:'/images/mobo.png',socket:'AM4',ramType:'DDR4'},
    {id:14,name:'ASUS TUF GAMING B760M-PLUS',price:5500,image:'/images/mobo.png',socket:'LGA1700',ramType:'DDR5'},
    {id:15,name:'MSI PRO B650-P WIFI',price:6000,image:'/images/mobo.png',socket:'AM5',ramType:'DDR5'},
    {id:16,name:'GIGABYTE H610M S2H',price:2800,image:'/images/mobo.png',socket:'LGA1700',ramType:'DDR4'},
    {id:17,name:'MSI PRO H610M-G',price:2500,image:'/images/mobo.png',socket:'LGA1700',ramType:'DDR4'},
    {id:18,name:'GIGABYTE B650 AORUS ELITE AX',price:8500,image:'/images/mobo.png',socket:'AM5',ramType:'DDR5'},
    {id:19,name:'ASRock X670E Taichi',price:16000,image:'/images/mobo.png',socket:'AM5',ramType:'DDR5'},
    {id:20,name:'MSI MAG B550 TOMAHAWK',price:5500,image:'/images/mobo.png',socket:'AM4',ramType:'DDR4'},
  ],
  ram: [
    {id:21,name:'BLACKBERRY DDR3(1333) 4GB 8 CHIP',price:360,image:'/images/ram.png',type:'DDR3',capacity:4},
    {id:22,name:'HYNIX DDR3(1600) 8GB 16 CHIP',price:705,image:'/images/ram.png',type:'DDR3',capacity:8},
    {id:23,name:'Kingston FURY Beast 8GB DDR4 3200MHz',price:1400,image:'/images/ram.png',type:'DDR4',capacity:8},
    {id:24,name:'Kingston FURY Beast 16GB DDR4 3200MHz',price:2800,image:'/images/ram.png',type:'DDR4',capacity:16},
    {id:25,name:'Kingston FURY Beast 16GB DDR5 5200MHz',price:3500,image:'/images/ram.png',type:'DDR5',capacity:16},
    {id:26,name:'Kingston FURY Beast 32GB DDR5 5600MHz',price:6500,image:'/images/ram.png',type:'DDR5',capacity:32},
    {id:27,name:'Corsair Vengeance 16GB (2x8) DDR5',price:2500,image:'/images/ram.png',type:'DDR5',capacity:16},
    {id:28,name:'Corsair Vengeance RGB Pro 32GB DDR4',price:3500,image:'/images/ram.png',type:'DDR4',capacity:32},
    {id:29,name:'G.Skill Trident Z5 32GB DDR5-6000',price:5200,image:'/images/ram.png',type:'DDR5',capacity:32},
    {id:30,name:'TeamGroup T-Force Delta 16GB DDR4',price:1800,image:'/images/ram.png',type:'DDR4',capacity:16},
  ],
  gpu: [
    {id:31,name:'POWER COLOR RADEON RX 6500XT FIGHTER V3 4GB',price:5240,image:'/images/gpu.png',tdp:65},
    {id:32,name:'ASUS RADEON RX 7600 DUAL O8G EVO 8GB',price:8520,image:'/images/gpu.png',tdp:165},
    {id:33,name:'SAPPHIRE RADEON RX 7800 XT PULSE GAMING 16GB',price:19000,image:'/images/gpu.png',tdp:263},
    {id:34,name:'LONGWELL GEFORCE GT 210 1GB DDR3',price:885,image:'/images/gpu.png',tdp:30},
    {id:35,name:'NVIDIA RTX 4060 8GB',price:11000,image:'/images/gpu.png',tdp:115},
    {id:36,name:'NVIDIA RTX 4070 SUPER 12GB',price:24000,image:'/images/gpu.png',tdp:220},
    {id:37,name:'AMD Radeon RX 7900 XTX 24GB',price:38000,image:'/images/gpu.png',tdp:355},
    {id:38,name:'NVIDIA RTX 4060 Ti 8GB',price:14500,image:'/images/gpu.png',tdp:160},
    {id:39,name:'NVIDIA RTX 4090 24GB',price:75000,image:'/images/gpu.png',tdp:450},
    {id:40,name:'Intel Arc A750 8GB',price:7500,image:'/images/gpu.png',tdp:225},
  ],
  storage: [
    {id:41,name:'SEAGATE 500 GB HDD (7200RPM)',price:880,image:'/images/storage.png'},
    {id:42,name:'WD 1 TB HDD BLUE (5400RPM)',price:3435,image:'/images/storage.png'},
    {id:43,name:'APACER 128 GB SSD SATA AS350X',price:1070,image:'/images/storage.png'},
    {id:44,name:'BLACKBERRY 128 GB SSD SATA (BBR128GST1)',price:925,image:'/images/storage.png'},
    {id:45,name:'WD 250 GB SSD M.2 PCIe 3.0 BLUE SN570',price:1290,image:'/images/storage.png'},
    {id:46,name:'KINGSTON 500 GB SSD M.2 PCIe 3.0 NV2',price:1450,image:'/images/storage.png'},
    {id:47,name:'WD 1 TB SSD M.2 PCIe 4.0 BLACK SN850X',price:3790,image:'/images/storage.png'},
    {id:48,name:'SAMSUNG 2 TB SSD M.2 PCIe 4.0 990 PRO',price:6890,image:'/images/storage.png'},
    {id:49,name:'Crucial 1 TB SSD M.2 PCIe 4.0 P3 Plus',price:2100,image:'/images/storage.png'},
    {id:50,name:'TOSHIBA 2 TB HDD P300 RED',price:3930,image:'/images/storage.png'},
  ],
  psu: [
    {id:51,name:'DTECH 450W PW053 SFX',price:500,image:'/images/psu.png',wattage:450},
    {id:52,name:'OKER 500W SFX',price:340,image:'/images/psu.png',wattage:500},
    {id:53,name:'NUBWO 550W NPS-030',price:437,image:'/images/psu.png',wattage:550},
    {id:54,name:'ITSONAS 400W DARK FOREST 1U 80+ SILVER',price:2320,image:'/images/psu.png',wattage:400},
    {id:55,name:'CORSAIR 650W CX650M 80+ BRONZE',price:2450,image:'/images/psu.png',wattage:650},
    {id:56,name:'THERMALTAKE 750W TOUGHPOWER GF 80+ GOLD',price:3590,image:'/images/psu.png',wattage:750},
    {id:57,name:'SEASONIC 850W FOCUS GX-850 80+ GOLD',price:4990,image:'/images/psu.png',wattage:850},
    {id:58,name:'CORSAIR 1000W RM1000x 80+ GOLD',price:6850,image:'/images/psu.png',wattage:1000},
    {id:59,name:'MSI 650W MAG A650BN 80+ BRONZE',price:1800,image:'/images/psu.png',wattage:650},
    {id:60,name:'ASUS 1200W ROG Thor 80+ PLATINUM',price:11000,image:'/images/psu.png',wattage:1200},
  ],
  case: [
    {id:61,name:'VIKINGS VALHALLA VK1 MINI-ITX (NP)',price:467,image:'/images/case.png'},
    {id:62,name:'VIKINGS VALHALLA VK3 MINI-ITX (NP)',price:467,image:'/images/case.png'},
    {id:63,name:'MONTECH AIR 100 ARGB BLACK ATX',price:1690,image:'/images/case.png'},
    {id:64,name:'NZXT H5 FLOW BLACK ATX',price:2990,image:'/images/case.png'},
    {id:65,name:'CORSAIR 4000D AIRFLOW BLACK ATX',price:3190,image:'/images/case.png'},
    {id:66,name:'LIAN LI O11 DYNAMIC EVO BLACK E-ATX',price:5490,image:'/images/case.png'},
    {id:67,name:'NZXT H9 Flow ATX',price:5800,image:'/images/case.png'},
    {id:68,name:'Phanteks Eclipse P400A ATX',price:2900,image:'/images/case.png'},
    {id:69,name:'Fractal Design Meshify C ATX',price:3500,image:'/images/case.png'},
    {id:70,name:'Aerocool Cylon RGB ATX',price:1200,image:'/images/case.png'},
  ],
});

const presetsData = {
  'anim': { cpu: 1013, mobo: 1041, ram: 1081, gpu: 1123, storage: 1160, psu: 1200, case: 1240 },
  'emu': { cpu: 1015, mobo: 1041, ram: 1081, gpu: 1120, storage: 1160, psu: 1200, case: 1240 },
  'budget': { cpu: 1003, mobo: 1041, ram: 1081, gpu: 1144, storage: 1160, psu: 1200, case: 1240 }
};

const orders = reactive([
  { id: 'ORD-1001', customer: 'สกาย เกมเมอร์', assembly: 'premium', total: 49500, status: 'assembling', date: new Date().toISOString() },
  { id: 'ORD-1002', customer: 'สมชาย ไอที', assembly: 'none', total: 15300, status: 'shipped', date: new Date().toISOString() }
]);

const build = reactive({ cpu: null, mobo: null, ram: null, gpu: null, storage: null, psu: null, case: null });
const hasAnyComponent = computed(() => Object.values(build).some(val => val !== null));
const activeCategory = ref('cpu');
const activeCategoryInfo = computed(() => categories.find(c => c.id === activeCategory.value));

const isChatOpen = ref(false);
const isTyping = ref(false);
const chatHistory = reactive([
  { 
    role: 'bot', 
    text: 'สวัสดีครับ! ผมคือ <strong>SpecAI</strong> ผมช่วยคุณจัดสเปคคอมพิวเตอร์ให้ตรงกับการใช้งานที่สุดได้ครับ <br><br>💡 คุณสามารถพิมพ์บอกความต้องการ หรือเลือกจาก Use Case ด้านล่างได้เลยครับ:',
    presets: [
      { id: 'anim', label: '🎬 สเปคทำงานแอนิเมชัน' },
      { id: 'emu', label: '🎮 เล่น Wuthering Waves + อีมู' },
      { id: 'budget', label: '💰 สเปคประหยัดงบ (1080p)' }
    ]
  }
]);

// --- Computeds ---
const getItem = (catId, itemId) => catalog[catId]?.find(i => i.id === itemId);
const getPrice = (catId) => build[catId] ? (getItem(catId, build[catId])?.price || 0) : 0;
const totalPrice = computed(() => categories.reduce((sum, cat) => sum + getPrice(cat.id), 0));

const compatibilityIssues = computed(() => {
  const issues = [];
  const cCpu = build.cpu ? getItem('cpu', build.cpu) : null;
  const cMobo = build.mobo ? getItem('mobo', build.mobo) : null;
  const cRam = build.ram ? getItem('ram', build.ram) : null;
  const cGpu = build.gpu ? getItem('gpu', build.gpu) : null;
  const cPsu = build.psu ? getItem('psu', build.psu) : null;

  if (cCpu && cMobo && cCpu.socket !== cMobo.socket) issues.push(`ซ็อกเก็ตไม่ตรง: CPU เป็น ${cCpu.socket} แต่เมนบอร์ดรองรับเฉพาะ ${cMobo.socket}`);
  if (cMobo && cRam && cMobo.ramType !== cRam.type) issues.push(`ประเภท RAM ไม่ตรง: เมนบอร์ดรองรับ ${cMobo.ramType} แต่คุณเลือก ${cRam.type}`);
  if (cPsu) {
    let totalTdp = 50;
    if (cCpu) totalTdp += cCpu.tdp;
    if (cGpu) totalTdp += cGpu.tdp;
    const recommendedWattage = totalTdp * 1.3;
    if (cPsu.wattage < recommendedWattage) issues.push(`กำลังไฟอาจไม่พอ: ระบบต้องการไฟขั้นต่ำ ${Math.ceil(recommendedWattage)}W แต่ PSU ที่เลือกจ่ายได้ ${cPsu.wattage}W`);
  }
  return issues;
});

// --- Methods ---
const selectItem = (catId, itemId) => {
  build[catId] = itemId;
};

const handleLoginSubmit = () => {
  if(!loginForm.username) return alert('กรุณากรอกชื่อผู้ใช้งาน');
  login(loginForm.username.toLowerCase() === 'admin' ? 'admin' : 'user');
};

const handleRegisterSubmit = () => {
  if(!registerForm.name || !registerForm.username) return alert('กรุณากรอกข้อมูลให้ครบถ้วน');
  alert('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
  authTab.value = 'login';
  loginForm.username = registerForm.username;
  registerForm.name = ''; registerForm.username = ''; registerForm.password = '';
};

const login = (role) => {
  userRole.value = role;
  const name = loginForm.username.trim() || (role === 'admin' ? 'Admin Manager' : 'General User');
  currentUser.value = { name };
  showLoginModal.value = false;
  loginForm.username = ''; loginForm.password = '';
};

const logout = () => {
  userRole.value = 'guest';
  currentUser.value = null;
  currentView.value = 'builder';
};

const toggleAdmin = () => {
  currentView.value = currentView.value === 'admin' ? 'builder' : 'admin';
};

const handleReadArticle = (article) => {
  selectedArticle.value = article;
  currentView.value = 'article-detail';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Start Checkout
const handleCheckout = () => {
  if (!hasAnyComponent.value) return;
  if (userRole.value === 'guest') {
    showLoginModal.value = true;
  } else {
    currentView.value = 'checkout';
  }
};

const onOrderPlaced = (newOrder) => {
  orders.unshift(newOrder);
  Object.keys(build).forEach(k => build[k] = null);
  currentView.value = 'builder';
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
    chatHistory.push({ role: 'bot', text: data.reply, presets: data.presets });
  } catch (error) {
    console.error('Chatbot API Error:', error);
    chatHistory.push({ role: 'bot', text: 'ขออภัยครับ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ระบบ AI ได้ในขณะนี้ กรุณาตรวจสอบว่ารันระบบหลังบ้าน (Node.js) แล้ว ⚠️', presets: null });
  }
};

const applyPreset = (presetId) => {
  const spec = presetsData[presetId];
  if (spec) {
    // 1. Apply the parts to build state
    Object.keys(spec).forEach(key => build[key] = spec[key]);
    
    // 2. Calculate total price
    let calculatedTotal = 0;
    Object.keys(spec).forEach(catId => {
      const itemId = spec[catId];
      const item = catalog[catId]?.find(i => i.id === itemId);
      if (item) {
        calculatedTotal += item.price;
      }
    });

    // 3. Generate detailed explanation (Rich UI details)
    let explanationText = "";
    if (presetId === 'anim') {
      explanationText = `
        ✅ <strong>อัปเดตสเปคสายทำงาน 3D & แอนิเมชัน เรียบร้อยครับ!</strong><br><br>
        💸 <strong>ราคารวมสเปคนี้:</strong> <span style="color:var(--accent); font-weight:700; font-size:var(--text-lg)">฿${calculatedTotal.toLocaleString()}</span><br><br>
        🔍 <strong>เหตุผลที่เลือกสเปคนี้:</strong><br>
        - เลือกใช้ <strong>Intel Core i7-14700K</strong> ที่มีคอร์ประมวลผลสูงถึง 20 Cores ทำให้เรนเดอร์งานได้เร็วและประมวลผลฟิสิกส์ในโปรแกรม 3D ได้ยอดเยี่ยม<br>
        - ใส่ <strong>RAM 32GB DDR5</strong> เพื่อให้รองรับการเปิดโปรแกรมทำกราฟิกและเรนเดอร์หลายตัวพร้อมกันโดยระบบไม่หน่วง<br>
        - จับคู่กับ <strong>RTX 4070 SUPER 12GB</strong> ซึ่งประมวลผลกราฟิกและรองรับ CUDA/OptiX เร่งความเร็วการเรนเดอร์ใน Blender หรือ Maya ได้ดีมาก<br><br>
        💡 <strong>คำแนะนำการอัปเกรด (หากต้องการประสิทธิภาพเพิ่ม):</strong><br>
        หากเพิ่มเงินประมาณ 51,000 บาท แนะนำขยับการ์ดจอเป็น <strong>RTX 4090 24GB</strong> จะเพิ่มความเร็วเรนเดอร์ 3D ขึ้นอีกมหาศาล และได้ VRAM 24GB สำหรับงานฉากใหญ่ๆ ได้สบายครับ
      `;
    } else if (presetId === 'emu') {
      explanationText = `
        ✅ <strong>อัปเดตสเปคสายบอทอีมู & หลายจอ เรียบร้อยครับ!</strong><br><br>
        💸 <strong>ราคารวมสเปคนี้:</strong> <span style="color:var(--accent); font-weight:700; font-size:var(--text-lg)">฿${calculatedTotal.toLocaleString()}</span><br><br>
        🔍 <strong>เหตุผลที่เลือกสเปคนี้:</strong><br>
        - เลือกใช้ <strong>AMD Ryzen 9 7950X</strong> สุดยอด CPU 16 Cores / 32 Threads เหมาะมากสำหรับการเปิดบอทเกมหรือ Emulator พร้อมกัน 8-12 จอได้อย่างไหลลื่น<br>
        - จัด <strong>RAM 32GB DDR5</strong> ซึ่งช่วยให้แบ่งแรมให้โปรแกรมจำลองหน้าจอได้อย่างเพียงพอ<br>
        - การ์ดจอ <strong>RTX 4060 8GB</strong> ช่วยขับกราฟิก 1080p หลายจอและประหยัดพลังงานไฟได้เป็นอย่างดี<br><br>
        💡 <strong>คำแนะนำการอัปเกรด (หากต้องการประสิทธิภาพเพิ่ม):</strong><br>
        หากเพิ่มเงินอีกประมาณ 13,000 บาท แนะนำให้เปลี่ยนการ์ดจอเป็น <strong>RTX 4070 SUPER 12GB</strong> จะทำให้คุณสลับมาเล่นเกมระดับ AAA ความละเอียด 2K แบบปรับสุดได้อย่างราบรื่นมากยิ่งขึ้นครับ
      `;
    } else if (presetId === 'budget') {
      explanationText = `
        ✅ <strong>อัปเดตสเปคสายประหยัดงบ คุ้มค่าที่สุด เรียบร้อยครับ!</strong><br><br>
        💸 <strong>ราคารวมสเปคนี้:</strong> <span style="color:var(--accent); font-weight:700; font-size:var(--text-lg)">฿${calculatedTotal.toLocaleString()}</span><br><br>
        🔍 <strong>เหตุผลที่เลือกสเปคนี้:</strong><br>
        - ใช้ <strong>Intel Core i5-13400F</strong> จับคู่กับ <strong>RTX 4060 8GB</strong> เป็นคู่สเปคประหยัดพลังงานยอดนิยม เล่นเกม 1080p ปรับ High/Ultra ได้ลื่นไหลทุกเกมในปัจจุบัน<br>
        - เลือก <strong>RAM 16GB DDR4</strong> ประหยัดงบและเพียงพอกับการเล่นเกมมาตรฐานในยุคปัจจุบัน<br>
        - อุปกรณ์อื่น ๆ เน้นความคุ้มค่าและความเสถียรเป็นหลัก<br><br>
        💡 <strong>คำแนะนำการอัปเกรด (หากต้องการประสิทธิภาพเพิ่ม):</strong><br>
        หากเพิ่มเงินอีกประมาณ 6,400 บาท แนะนำขยับบอร์ดเป็นซีรีส์ B760 และแรมเป็น <strong>DDR5 32GB</strong> ซึ่งจะช่วยให้เปิดโปรแกรมพื้นหลังขณะเล่นเกมได้ดีขึ้น และรองรับการอัปเกรดฮาร์ดแวร์ในระยะยาวอีกหลายปีครับ
      `;
    } else {
      explanationText = `✅ <strong>อัปเดตสเปคเรียบร้อยครับ!</strong> ราคารวมทั้งหมด ฿${calculatedTotal.toLocaleString()} บาท ดูรายละเอียดได้ที่ฝั่งซ้ายเลยครับ`;
    }

    chatHistory.push({ role: 'bot', text: explanationText });
  }
};
</script>

<style scoped>
.modal-overlay { 
  position: fixed; 
  top: 0; left: 0; right: 0; bottom: 0; 
  background: rgba(10, 11, 15, 0.85); 
  backdrop-filter: blur(12px) saturate(1.2); 
  -webkit-backdrop-filter: blur(12px) saturate(1.2);
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
  background: var(--bg);
  border: 1px solid var(--border-hover);
  box-shadow: var(--shadow-lg), 0 0 40px rgba(0, 212, 255, 0.04);
}
.modal-header { 
  padding: 1.5rem 1.75rem 0; 
  border-bottom: 1px solid var(--border); 
  display: flex; 
  justify-content: space-between; 
  align-items: flex-start;
  padding-bottom: 1rem;
}
.close-btn { 
  background: rgba(255,255,255,0.04); 
  border: 1px solid var(--border); 
  color: var(--muted); 
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
  background: var(--danger-bg);
  border-color: var(--danger-border);
}
.modal-body { padding: 1.75rem; }
.form-group { margin-bottom: 1.35rem; }
.form-group label { 
  display: block; 
  margin-bottom: 0.5rem; 
  font-size: var(--text-xs); 
  color: var(--muted);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.auth-tabs { display: flex; gap: 0; margin-bottom: -1px; }
.auth-tab { 
  background: transparent; 
  border: none; 
  color: var(--muted); 
  font-size: var(--text-sm); 
  font-weight: 600; 
  padding: 0.6rem 1.2rem; 
  cursor: pointer; 
  border-bottom: 2px solid transparent; 
  transition: all var(--transition-fast);
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  font-family: var(--font-display);
}
.auth-tab:hover { 
  color: var(--fg); 
  background: rgba(255,255,255,0.02);
}
.auth-tab.active { 
  color: var(--accent); 
  border-bottom-color: var(--accent);
  background: rgba(0, 212, 255, 0.04);
}

/* Page Transition */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-enter-active .modal-content {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-leave-active .modal-content {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: translateY(30px) scale(0.97);
}

.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 450px;
  gap: 2rem;
  padding: 3rem;
  border-radius: var(--radius-xl);
  margin: var(--space-xl) 0;
  text-align: center;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  position: relative;
  overflow: hidden;
}
.loader-container::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -30%;
  width: 160%;
  height: 200%;
  background: radial-gradient(ellipse at center, rgba(0, 212, 255, 0.04) 0%, transparent 60%);
  pointer-events: none;
  animation: loaderGlow 3s ease-in-out infinite alternate;
}
.spinner {
  width: 52px;
  height: 52px;
  border: 3px solid rgba(255, 255, 255, 0.04);
  border-radius: 50%;
  border-top-color: var(--accent);
  border-right-color: var(--accent-secondary);
  animation: spin 0.8s linear infinite;
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.15);
  position: relative;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
@keyframes loaderGlow {
  from { opacity: 0.5; transform: scale(1); }
  to { opacity: 1; transform: scale(1.1); }
}
</style>
