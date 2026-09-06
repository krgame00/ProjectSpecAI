<template>
  <div id="admin-panel-inventory" role="tabpanel" aria-labelledby="admin-tab-inventory" class="admin-card admin-section-card">
    <header class="operations-header">
      <div>
        <h3>จัดการสินค้า</h3>
        <p class="operations-description">ดูแลแคตตาล็อก สเปก และราคาสินค้าแยกตามหมวดหมู่</p>
      </div>
      <output class="operations-count" data-test="products-result-count" aria-live="polite">{{ filteredProducts.length }} รายการ</output>
    </header>
    <div class="operations-toolbar" role="search" aria-label="ค้นหาและกรองสินค้า">
      <label class="operations-search">
        <span>ค้นหาสินค้า</span>
        <input v-model="productQuery" data-test="products-search" class="form-control" type="search" placeholder="ชื่อ ID หรือสเปก">
      </label>
      <label class="operations-filter">
        <span>หมวดหมู่</span>
        <select class="form-control admin-category-select" v-model="inventoryCategory">
          <option v-for="cat in categories" :key="'inv-'+cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
      </label>
      <button v-if="productQuery" data-test="products-reset" class="btn btn-outline" type="button" @click="resetProductFilters">ล้างตัวกรอง</button>
      <div class="operations-actions">
        <button class="btn btn-outline" @click="handleSyncPrices" :disabled="isSyncingPrices">
          <span v-if="isSyncingPrices" class="spinner-small"></span>
          <span v-else aria-hidden="true">🔄</span>
          {{ isSyncingPrices ? 'กำลังซิงก์ราคา…' : 'ซิงก์ราคาล่าสุด' }}
        </button>
        <button class="btn btn-primary" data-test="add-product" @click="openProductModal()">+ เพิ่มสินค้า</button>
      </div>
    </div>
    <div class="admin-table-region" data-test="inventory-table-region" tabindex="0" aria-label="ตารางสินค้า เลื่อนแนวนอนเพื่อดูข้อมูลเพิ่มเติม">
      <table class="data-table">
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
          <tr v-for="item in filteredProducts" :key="'inv-item-'+item.id">
            <td style="font-family: var(--font-mono); color: var(--muted);">{{ item.id }}</td>
            <td>{{ item.name }}</td>
            <td style="font-family: var(--font-mono); font-weight: 600;">฿{{ item.price.toLocaleString() }}</td>
            <td style="font-size: var(--text-xs); color: var(--muted);">
              {{ item.socket || item.type || item.wattage ? (item.socket || item.type || item.wattage+'W') : '-' }}
            </td>
            <td>
              <div class="admin-row-actions">
                <button class="btn btn-outline btn-sm admin-row-action" @click="openProductModal(item)">แก้ไข</button>
                <button class="btn btn-outline-danger btn-sm admin-row-action" @click="deleteProduct(item.id)">ลบ</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="admin-mobile-list" aria-label="รายการสินค้า">
      <article v-for="item in filteredProducts" :key="'product-card-'+item.id" class="admin-mobile-card" :data-test="`product-card-${item.id}`">
        <div class="admin-mobile-card__heading">
          <strong>{{ item.name }}</strong>
          <span class="admin-mobile-card__id">#{{ item.id }}</span>
        </div>
        <dl class="admin-mobile-card__facts">
          <div><dt>ราคา</dt><dd>฿{{ item.price.toLocaleString() }}</dd></div>
          <div><dt>สเปค</dt><dd>{{ item.socket || item.type || (item.wattage ? item.wattage + 'W' : '-') }}</dd></div>
        </dl>
        <div class="admin-actions">
          <button class="btn btn-outline" @click="openProductModal(item)">แก้ไข</button>
          <button class="btn btn-outline-danger" @click="deleteProduct(item.id)">ลบ</button>
        </div>
      </article>
    </div>
    <p v-if="!catalog[inventoryCategory] || catalog[inventoryCategory].length === 0" class="admin-empty" data-test="products-empty">ยังไม่มีสินค้าในหมวดนี้</p>
    <div v-else-if="filteredProducts.length === 0" class="admin-empty admin-no-results" data-test="products-no-results">
      <p>ไม่พบสินค้าที่ตรงกับคำค้นหา</p>
      <button class="btn btn-outline" type="button" @click="resetProductFilters">ล้างตัวกรอง</button>
    </div>

    <!-- Product Modal -->
    <div class="modal-overlay" data-test="product-modal" v-if="showProductModal" @click.self="!isSavingProduct && (showProductModal = false)">
      <div class="modal-content glass-panel admin-modal" role="dialog" aria-modal="true" aria-labelledby="product-modal-title" style="max-width: 700px; padding: 0;">
        <div class="modal-header" style="padding: 1.5rem; border-bottom: 1px solid var(--glass-border); background: rgba(0,0,0,0.2);">
          <h3 id="product-modal-title" style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-size: 1.5rem;">📦</span> 
            {{ editingProduct ? 'แก้ไขข้อมูลสินค้า' : 'เพิ่มสินค้าใหม่ในคลัง' }}
          </h3>
          <button class="close-btn" aria-label="ปิดฟอร์มสินค้า" @click="showProductModal = false">✕</button>
        </div>
        <div class="modal-body admin-modal__body" style="max-height: 75vh; overflow-y: auto; padding: 2rem;">
          
          <div class="admin-form-grid">
            <div class="form-group" style="margin: 0;">
              <label>รหัสสินค้า (ID)</label>
              <input type="text" class="form-control" v-model="productForm.id" disabled placeholder="ระบบจะสร้าง ID ให้อัตโนมัติ" style="background: rgba(0,0,0,0.1);">
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
            <input type="text" data-test="product-name" class="form-control" v-model="productForm.name" placeholder="ระบุชื่อสินค้าแบบเต็ม...">
          </div>

          <div class="form-group">
            <label>รูปภาพ (URL)</label>
            <div class="admin-media-field">
              <input type="text" class="form-control" v-model="productForm.image" placeholder="ระบุ URL รูปภาพ (เช่น /images/cpu.png)" style="flex: 1;" @input="productImgError = false">
              <div style="width: 80px; height: 80px; border-radius: var(--radius-sm); border: 1px dashed var(--hairline-strong); overflow: hidden; background: var(--canvas-soft); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <template v-if="productForm.image">
                  <div v-if="productImgError" style="font-size: 0.7rem; color: var(--danger); text-align: center; padding: 0.2rem;">
                    ⚠️<br>โหลดไม่สำเร็จ
                  </div>
                  <img v-else :src="productForm.image" style="width: 100%; height: 100%; object-fit: cover;" @error="productImgError = true">
                </template>
                <div v-else style="font-size: 1.5rem; color: var(--ink-mute-2);">🖼️</div>
              </div>
            </div>
          </div>

          <div class="form-group" style="margin-top: 1.5rem;">
            <label style="display: flex; justify-content: space-between;">
              <span>รายละเอียดสเปค (JSON)</span>
              <span style="font-size: 0.75rem; color: var(--muted); font-weight: normal;">(เช่น Socket: AM4)</span>
            </label>
            <div style="background: var(--canvas-soft); border: 1px solid var(--hairline); border-radius: var(--radius-sm); padding: 1rem;">
              <div v-for="(spec, index) in productForm.specList" :key="index" class="admin-spec-row">
                <input type="text" class="form-control" v-model="spec.key" placeholder="Key" style="flex: 1; padding: 0.4rem; font-size: 0.85rem;">
                <input type="text" class="form-control" v-model="spec.value" placeholder="Value" style="flex: 2; padding: 0.4rem; font-size: 0.85rem;">
                <button class="btn btn-outline-danger" style="padding: 0.4rem 0.6rem;" @click="removeSpec(index)">✕</button>
              </div>
              <button class="btn btn-outline" style="width: 100%; margin-top: 0.5rem; font-size: 0.85rem; border-style: dashed;" @click="addSpec">+ เพิ่มข้อมูลสเปค</button>
            </div>
          </div>
        </div>
        <div class="admin-modal__footer" style="padding: 1.5rem; border-top: 1px solid var(--glass-border); display: flex; justify-content: flex-end; gap: 1rem; background: rgba(0,0,0,0.2);">
          <button class="btn btn-outline" :disabled="isSavingProduct" @click="showProductModal = false">ยกเลิก</button>
          <button class="btn btn-primary" data-test="save-product" :disabled="isSavingProduct" style="padding: 0.5rem 2rem; font-weight: 600;" @click="saveProduct">{{ isSavingProduct ? 'กำลังบันทึก…' : '💾 บันทึกสินค้า' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useAdminStore } from '../../stores/admin';
import { useCatalogStore } from '../../stores/catalog';
import { filterProducts } from '../../utils/adminCollectionFilters';

const props = defineProps({
  catalog: {
    type: Object,
    default: () => ({})
  },
  categories: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['request-confirm']);

const adminStore = useAdminStore();
const inventoryCategory = ref('cpu');
const productQuery = ref('');

const filteredProducts = computed(() => filterProducts(
  props.catalog?.[inventoryCategory.value] || [],
  { query: productQuery.value }
));

const resetProductFilters = () => { productQuery.value = ''; };

// --- Price Sync ---
const isSyncingPrices = ref(false);
const handleSyncPrices = async () => {
  if (isSyncingPrices.value) return;
  isSyncingPrices.value = true;
  try {
    const result = await adminStore.syncPrices(null, 200);
    if (result && result.updated > 0) {
      const catalogStore = useCatalogStore();
      await catalogStore.fetchCatalog();
    }
  } finally {
    isSyncingPrices.value = false;
  }
};

// --- Product CRUD ---
const showProductModal = ref(false);
const editingProduct = ref(null);
const productImgError = ref(false);
const productForm = reactive({ id: null, name: '', price: 0, image: '', specList: [] });
const isSavingProduct = ref(false);

const openProductModal = (product = null) => {
  productImgError.value = false;
  
  const templates = {
    cpu: ['Socket', 'Cores', 'Threads', 'Base Clock', 'Boost Clock', 'TDP'],
    mobo: ['Socket', 'Form Factor', 'Chipset', 'Memory Type', 'Max Memory'],
    ram: ['Type', 'Capacity', 'Speed', 'CAS Latency'],
    gpu: ['GPU', 'VRAM', 'Base Clock', 'Boost Clock', 'Length', 'TDP'],
    storage: ['Capacity', 'Interface', 'Form Factor', 'Read Speed', 'Write Speed'],
    psu: ['Wattage', 'Form Factor', 'Efficiency', 'Modular'],
    case: ['Form Factor', 'Max GPU Length', 'Max CPU Cooler Height', 'Type']
  };
  
  const categoryKeys = templates[inventoryCategory.value] || ['Specification'];

  if (product) {
    editingProduct.value = product;
    productForm.id = product.id;
    productForm.name = product.name;
    productForm.price = product.price;
    productForm.image = product.image || '';
    
    const specs = { ...(product.specifications || {}) };
    const typedByCategory = {
      cpu: { Socket: product.socket, Cores: product.cores, Threads: product.threads, TDP: product.tdp },
      mobo: { Socket: product.socket, 'Form Factor': product.formFactor, 'Memory Type': product.ramType },
      ram: { Type: product.type, Capacity: product.capacityGb, Speed: product.busSpeed },
      gpu: { GPU: product.chipset, VRAM: product.vramGb, Length: product.lengthMm, TDP: product.tdp },
      storage: { Type: product.type, Capacity: product.capacityGb, 'Read Speed': product.readSpeedMbs, 'Write Speed': product.writeSpeedMbs },
      psu: { Wattage: product.wattage, Efficiency: product.efficiencyRating },
      case: { 'Form Factor': product.formFactorSupport, 'Max GPU Length': product.maxGpuLength }
    };
    Object.entries(typedByCategory[inventoryCategory.value] || {}).forEach(([key, value]) => {
      if ((specs[key] === undefined || specs[key] === '') && value != null) specs[key] = value;
    });
    const mergedSpecs = categoryKeys.map(key => ({
      key, 
      value: specs[key] !== undefined ? String(specs[key]) : ''
    }));

    Object.entries(specs).forEach(([key, value]) => {
      if (!categoryKeys.includes(key)) {
        mergedSpecs.push({ key, value: String(value) });
      }
    });
    
    productForm.specList = mergedSpecs;
  } else {
    editingProduct.value = null;
    productForm.id = null;
    productForm.name = '';
    productForm.price = 0;
    productForm.image = `/images/${inventoryCategory.value}.png`;
    
    productForm.specList = categoryKeys.map(key => ({ key, value: '' }));
  }
  showProductModal.value = true;
};

const addSpec = () => productForm.specList.push({ key: '', value: '' });
const removeSpec = (index) => productForm.specList.splice(index, 1);

const saveProduct = async () => {
  if (isSavingProduct.value) return;
  const specObj = {};
  productForm.specList.forEach(item => {
    if (item.key.trim()) specObj[item.key.trim()] = item.value;
  });

  isSavingProduct.value = true;
  let saved = false;
  try {
    saved = await adminStore.saveProduct({
      category: inventoryCategory.value,
      product: {
        id: productForm.id,
        name: productForm.name,
        price: productForm.price,
        image: productForm.image,
        specifications: specObj
      }
    });
  } finally { isSavingProduct.value = false; }
  if (saved) showProductModal.value = false;
};

const deleteProduct = (id) => {
  emit('request-confirm', 'ยืนยันการลบสินค้านี้?', () => {
    return adminStore.deleteProduct({
      category: inventoryCategory.value,
      productId: id
    });
  }, 'danger');
};
</script>
