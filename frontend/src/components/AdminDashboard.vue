<template>
  <div class="container admin-view">
    <div style="margin-bottom: 2rem;">
      <h2 style="font-size: var(--text-2xl); color: var(--accent); text-shadow: var(--accent-glow);">ระบบจัดการหลังบ้าน (Admin Panel)</h2>
      <p style="color: var(--muted);">ภาพรวมร้านค้า การสั่งซื้อ สินค้าคงคลัง และบทความ</p>
    </div>

    <div class="admin-layout">
      <aside class="admin-sidebar glass-panel">
        <ul class="admin-menu">
          <li :class="{active: adminTab === 'dashboard'}" @click="adminTab = 'dashboard'">📊 Dashboard ภาพรวม</li>
          <li :class="{active: adminTab === 'orders'}" @click="adminTab = 'orders'">📦 รายการสั่งซื้อ (Orders)</li>
          <li :class="{active: adminTab === 'inventory'}" @click="adminTab = 'inventory'">⚙️ คลังสินค้า (Inventory)</li>
          <li :class="{active: adminTab === 'articles'}" @click="adminTab = 'articles'">📰 จัดการบทความ (Articles)</li>
        </ul>
      </aside>

      <main class="admin-main">
        <!-- Dashboard Tab -->
        <div v-if="adminTab === 'dashboard'">
          <div class="stat-grid">
            <div class="stat-card glass-panel">
              <div class="stat-title">ยอดขายทั้งหมด</div>
              <div class="stat-val">฿{{ totalSales.toLocaleString() }}</div>
            </div>
            <div class="stat-card glass-panel">
              <div class="stat-title">ออเดอร์ทั้งหมด</div>
              <div class="stat-val">{{ orders.length }}</div>
            </div>
            <div class="stat-card glass-panel">
              <div class="stat-title">รอประกอบ</div>
              <div class="stat-val">{{ pendingAssemblies }}</div>
            </div>
          </div>
        </div>

        <!-- Orders Tab -->
        <div v-if="adminTab === 'orders'" class="glass-panel" style="overflow-x: auto; padding: 0;">
          <table class="data-table">
            <thead>
              <tr>
                <th>หมายเลข (ID)</th>
                <th>ลูกค้า (Customer)</th>
                <th>รูปแบบประกอบ</th>
                <th>ยอดสุทธิ (Total)</th>
                <th>สถานะ (Status)</th>
                <th>จัดการ (Action)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in orders" :key="order.id">
                <td style="font-family: var(--font-mono); font-weight: 600;">{{ order.id }}</td>
                <td>{{ order.customer }}</td>
                <td>
                  <span v-if="order.assembly === 'none'">ประกอบเอง</span>
                  <span v-else-if="order.assembly === 'standard'" style="color: var(--accent);">มาตรฐาน</span>
                  <span v-else-if="order.assembly === 'premium'" style="color: var(--warning);">พรีเมียม</span>
                </td>
                <td style="font-family: var(--font-mono); font-weight: 600;">฿{{ order.total.toLocaleString() }}</td>
                <td>
                  <span :class="['badge', 'badge-' + order.status]">
                    {{ getStatusLabel(order.status) }}
                  </span>
                </td>
                <td>
                  <select class="form-control" style="padding: 0.25rem 0.5rem; width: auto; background: var(--bg);" :value="order.status" @change="$emit('update-order-status', order.id, $event.target.value)">
                    <option value="pending">รอดำเนินการ</option>
                    <option value="assembling">กำลังประกอบ</option>
                    <option value="shipped">จัดส่งแล้ว</option>
                  </select>
                </td>
              </tr>
              <tr v-if="orders.length === 0">
                <td colspan="6" style="text-align: center; color: var(--muted); padding: 2rem;">ยังไม่มีคำสั่งซื้อในระบบ</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Inventory Tab -->
        <div v-if="adminTab === 'inventory'" class="glass-panel" style="padding: 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h3>จัดการสินค้าในระบบ</h3>
            <div style="display: flex; gap: 1rem;">
              <select class="form-control" style="width: 200px;" v-model="inventoryCategory">
                <option v-for="cat in categories" :key="'inv-'+cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
              <button class="btn btn-primary" @click="openProductModal()">+ เพิ่มสินค้า</button>
            </div>
          </div>
          <table class="data-table" v-if="catalog[inventoryCategory]">
            <thead>
              <tr>
                <th>ID</th>
                <th>ชื่อสินค้า</th>
                <th>ราคา</th>
                <th>สเปคเบื้องต้น</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in catalog[inventoryCategory]" :key="'inv-item-'+item.id">
                <td style="font-family: var(--font-mono); color: var(--muted);">{{ item.id }}</td>
                <td>{{ item.name }}</td>
                <td style="font-family: var(--font-mono); font-weight: 600;">฿{{ item.price.toLocaleString() }}</td>
                <td style="font-size: var(--text-xs); color: var(--muted);">
                  {{ item.socket || item.type || item.wattage ? (item.socket || item.type || item.wattage+'W') : '-' }}
                </td>
                <td>
                  <button class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; margin-right: 0.5rem;" @click="openProductModal(item)">แก้ไข</button>
                  <button class="btn" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; background: var(--error-bg); color: var(--error); border: 1px solid var(--error);" @click="deleteProduct(item.id)">ลบ</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Articles Tab -->
        <div v-if="adminTab === 'articles'" class="glass-panel" style="padding: 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h3>จัดการบทความ</h3>
            <button class="btn btn-primary" @click="openArticleModal()">+ เพิ่มบทความ</button>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>ภาพปก</th>
                <th>หัวข้อ</th>
                <th>วันที่</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="article in articles" :key="'art-'+article.id">
                <td style="font-family: var(--font-mono); color: var(--muted);">{{ article.id }}</td>
                <td><img :src="article.image" style="width: 50px; height: 30px; object-fit: cover; border-radius: 4px;" /></td>
                <td>{{ article.title }}</td>
                <td>{{ article.date }}</td>
                <td>
                  <button class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; margin-right: 0.5rem;" @click="openArticleModal(article)">แก้ไข</button>
                  <button class="btn" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; background: var(--error-bg); color: var(--error); border: 1px solid var(--error);" @click="deleteArticle(article.id)">ลบ</button>
                </td>
              </tr>
              <tr v-if="!articles || articles.length === 0">
                <td colspan="5" style="text-align: center; color: var(--muted); padding: 2rem;">ยังไม่มีบทความในระบบ</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>

    <!-- Product Modal -->
    <div class="modal-overlay" v-if="showProductModal" @click.self="showProductModal = false">
      <div class="modal-content glass-panel" style="max-width: 700px; padding: 0;">
        <div class="modal-header" style="padding: 1.5rem; border-bottom: 1px solid var(--glass-border); background: rgba(0,0,0,0.2);">
          <h3 style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-size: 1.5rem;">📦</span> 
            {{ editingProduct ? 'แก้ไขข้อมูลสินค้า' : 'เพิ่มสินค้าใหม่ในคลัง' }}
          </h3>
          <button class="close-btn" @click="showProductModal = false">✕</button>
        </div>
        <div class="modal-body" style="max-height: 75vh; overflow-y: auto; padding: 2rem;">
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1rem;">
            <div class="form-group" style="margin: 0;">
              <label>รหัสสินค้า (ID)</label>
              <input type="text" class="form-control" v-model="productForm.id" :disabled="!!editingProduct" style="background: rgba(0,0,0,0.1);">
            </div>
            <div class="form-group" style="margin: 0;">
              <label>ราคา (บาท)</label>
              <div style="position: relative;">
                <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--accent);">฿</span>
                <input type="number" class="form-control" v-model.number="productForm.price" style="padding-left: 2rem;">
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>ชื่อสินค้า</label>
            <input type="text" class="form-control" v-model="productForm.name" placeholder="ระบุชื่อสินค้าแบบเต็ม...">
          </div>

          <div class="form-group">
            <label>รูปภาพ (URL)</label>
            <div style="display: flex; gap: 1rem;">
              <input type="text" class="form-control" v-model="productForm.image" placeholder="/images/cpu.png" style="flex: 1;">
              <div v-if="productForm.image" style="width: 42px; height: 42px; border-radius: var(--radius-sm); border: 1px solid var(--glass-border); overflow: hidden; background: var(--bg);">
                <img :src="productForm.image" style="width: 100%; height: 100%; object-fit: cover;" @error="$event.target.style.display='none'">
              </div>
            </div>
          </div>

          <div class="form-group" style="margin-top: 1.5rem;">
            <label style="display: flex; justify-content: space-between;">
              <span>รายละเอียดสเปคเชิงลึก</span>
              <span style="font-size: 0.75rem; color: var(--muted); font-weight: normal;">(บรรทัดละ 1 รายการ)</span>
            </label>
            <textarea class="form-control" style="height: 180px; font-family: var(--font-mono); font-size: 0.9rem; line-height: 1.6; background: rgba(0,0,0,0.2);" v-model="productForm.details" placeholder="Brand: AMD&#10;Series: 5000 Series&#10;Cores/Threads: 6/12&#10;..."></textarea>
          </div>
        </div>
        <div style="padding: 1.5rem; border-top: 1px solid var(--glass-border); display: flex; justify-content: flex-end; gap: 1rem; background: rgba(0,0,0,0.2);">
          <button class="btn btn-outline" @click="showProductModal = false">ยกเลิก</button>
          <button class="btn btn-primary" style="padding: 0.5rem 2rem; font-weight: 600;" @click="saveProduct">💾 บันทึกสินค้า</button>
        </div>
      </div>
    </div>

    <!-- Article Modal -->
    <div class="modal-overlay" v-if="showArticleModal" @click.self="showArticleModal = false">
      <div class="modal-content glass-panel" style="max-width: 700px; padding: 0;">
        <div class="modal-header" style="padding: 1.5rem; border-bottom: 1px solid var(--glass-border); background: rgba(0,0,0,0.2);">
          <h3 style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-size: 1.5rem;">📝</span> 
            {{ editingArticle ? 'แก้ไขบทความ' : 'เขียนบทความใหม่' }}
          </h3>
          <button class="close-btn" @click="showArticleModal = false">✕</button>
        </div>
        <div class="modal-body" style="max-height: 75vh; overflow-y: auto; padding: 2rem;">
          
          <div class="form-group">
            <label>หัวข้อบทความ</label>
            <input type="text" class="form-control" v-model="articleForm.title" style="font-size: 1.1rem; font-weight: 600;" placeholder="ระบุหัวข้อบทความที่น่าสนใจ...">
          </div>

          <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 1.5rem; margin-bottom: 1rem;">
            <div class="form-group" style="margin: 0;">
              <label>วันที่อัปเดต</label>
              <input type="date" class="form-control" v-model="articleForm.date">
            </div>
            <div class="form-group" style="margin: 0;">
              <label>ภาพปก (URL)</label>
              <div style="display: flex; gap: 1rem;">
                <input type="text" class="form-control" v-model="articleForm.image" placeholder="https://..." style="flex: 1;">
                <div v-if="articleForm.image" style="width: 42px; height: 42px; border-radius: var(--radius-sm); border: 1px solid var(--glass-border); overflow: hidden; background: var(--bg);">
                  <img :src="articleForm.image" style="width: 100%; height: 100%; object-fit: cover;" @error="$event.target.style.display='none'">
                </div>
              </div>
            </div>
          </div>

          <div class="form-group" style="margin-top: 1.5rem;">
            <label>เนื้อหาบทความ</label>
            <textarea class="form-control" style="height: 250px; line-height: 1.6; font-size: 0.95rem; background: rgba(0,0,0,0.2);" v-model="articleForm.content" placeholder="พิมพ์เนื้อหาที่นี่..."></textarea>
          </div>
        </div>
        <div style="padding: 1.5rem; border-top: 1px solid var(--glass-border); display: flex; justify-content: flex-end; gap: 1rem; background: rgba(0,0,0,0.2);">
          <button class="btn btn-outline" @click="showArticleModal = false">ยกเลิก</button>
          <button class="btn btn-primary" style="padding: 0.5rem 2rem; font-weight: 600;" @click="saveArticle">🚀 เผยแพร่บทความ</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';

const props = defineProps({
  orders: Array, categories: Array, catalog: Object, articles: Array
});
const emit = defineEmits(['save-product', 'delete-product', 'save-article', 'delete-article']);

const adminTab = ref('dashboard');
const inventoryCategory = ref('cpu');

const totalSales = computed(() => props.orders.reduce((sum, ord) => sum + ord.total, 0));
const pendingAssemblies = computed(() => props.orders.filter(o => o.status === 'pending' || o.status === 'assembling').length);

const getStatusLabel = (status) => {
  const map = { pending: 'รอดำเนินการ', assembling: 'กำลังประกอบ', shipped: 'จัดส่งแล้ว' };
  return map[status] || status;
};

// --- Product CRUD ---
const showProductModal = ref(false);
const editingProduct = ref(null);
const productForm = reactive({ id: '', name: '', price: 0, image: '', details: '' });

const openProductModal = (product = null) => {
  if (product) {
    editingProduct.value = product;
    productForm.id = product.id;
    productForm.name = product.name;
    productForm.price = product.price;
    productForm.image = product.image || '';
    productForm.details = product.details || '';
  } else {
    editingProduct.value = null;
    productForm.id = `${inventoryCategory.value}-${Date.now().toString().slice(-4)}`;
    productForm.name = '';
    productForm.price = 0;
    productForm.image = `/images/${inventoryCategory.value}.png`;
    productForm.details = '';
  }
  showProductModal.value = true;
};

const saveProduct = () => {
  emit('save-product', {
    category: inventoryCategory.value,
    product: { ...productForm }
  });
  showProductModal.value = false;
};

const deleteProduct = (id) => {
  if (!confirm('ยืนยันการลบสินค้านี้?')) return;
  emit('delete-product', {
    category: inventoryCategory.value,
    productId: id
  });
};

// --- Article CRUD ---
const showArticleModal = ref(false);
const editingArticle = ref(null);
const articleForm = reactive({ id: 0, title: '', date: '', image: '', content: '' });

const openArticleModal = (article = null) => {
  if (article) {
    editingArticle.value = article;
    articleForm.id = article.id;
    articleForm.title = article.title;
    articleForm.date = article.date;
    articleForm.image = article.image || '';
    articleForm.content = article.content || '';
  } else {
    editingArticle.value = null;
    articleForm.id = Date.now();
    articleForm.title = '';
    articleForm.date = new Date().toISOString().split('T')[0];
    articleForm.image = 'https://placehold.co/600x400/1e1e2e/00e5ff?text=Article';
    articleForm.content = '';
  }
  showArticleModal.value = true;
};

const saveArticle = () => {
  emit('save-article', { ...articleForm });
  showArticleModal.value = false;
};

const deleteArticle = (id) => {
  if (!confirm('ยืนยันการลบบทความนี้?')) return;
  emit('delete-article', id);
};
</script>

<style scoped>
.admin-view { padding-top: 2rem; padding-bottom: 5rem; }
.admin-layout { display: grid; grid-template-columns: 250px 1fr; gap: var(--space-lg); align-items: start; }

.admin-sidebar { border-radius: var(--radius-lg); overflow: hidden; padding: 0.5rem 0; }
.admin-menu { list-style: none; }
.admin-menu li { 
  padding: 1rem 1.5rem; cursor: pointer; border-bottom: 1px solid var(--glass-border); 
  transition: all var(--transition-fast); display: flex; align-items: center; gap: 0.75rem; 
  font-size: var(--text-sm); font-weight: 500;
}
.admin-menu li:last-child { border-bottom: none; }
.admin-menu li:hover { background: rgba(255,255,255,0.05); }
.admin-menu li.active { background: rgba(255,255,255,0.05); border-left: 4px solid var(--accent); color: var(--accent); font-weight: 600;}

.stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-md); }
.stat-card { padding: 1.5rem; border-radius: var(--radius-lg); text-align: center; }
.stat-title { color: var(--muted); font-size: var(--text-sm); }
.stat-val { font-size: var(--text-3xl); font-weight: 700; color: var(--accent); margin-top: 0.5rem; font-family: var(--font-mono); text-shadow: var(--accent-glow); }

.data-table { width: 100%; border-collapse: collapse; text-align: left; }
.data-table th, .data-table td { padding: 1rem 1.5rem; border-bottom: 1px solid var(--glass-border); font-size: var(--text-sm); }
.data-table th { font-weight: 600; color: var(--muted); background: rgba(0,0,0,0.2); }
.data-table tr:hover td { background: rgba(255,255,255,0.02); }

.badge { display: inline-block; padding: 0.35rem 0.6rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
.badge-pending { background: var(--warning-bg); color: var(--warning); border: 1px solid var(--warning); }
.badge-assembling { background: var(--accent-transparent); color: var(--accent); border: 1px solid var(--accent); }
.badge-shipped { background: var(--success-bg); color: var(--success); border: 1px solid var(--success); }

/* Modal specific overrides */
.modal-overlay { z-index: 2000; }
.modal-body { padding: 1.5rem; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 0.5rem; font-size: 0.85rem; color: var(--muted); }

@media (max-width: 820px) {
  .admin-layout { grid-template-columns: 1fr; }
}
</style>
