<template>
  <div id="admin-panel-orders" role="tabpanel" aria-labelledby="admin-tab-orders" class="admin-card hairline-grid">
    <header class="operations-header">
      <div>
        <h3>รายการสั่งซื้อ</h3>
        <p class="operations-description">ติดตามคำสั่งซื้อและอัปเดตสถานะงานประกอบ</p>
      </div>
      <output class="operations-count" data-test="orders-result-count" aria-live="polite">{{ filteredOrders.length }} รายการ</output>
    </header>
    <div class="operations-toolbar" role="search" aria-label="ค้นหาและกรองคำสั่งซื้อ">
      <label class="operations-search">
        <span>ค้นหาคำสั่งซื้อ</span>
        <input v-model="orderQuery" data-test="orders-search" class="form-control" type="search" placeholder="หมายเลขออเดอร์หรือลูกค้า">
      </label>
      <label class="operations-filter">
        <span>สถานะ</span>
        <select v-model="orderStatus" data-test="orders-status-filter" class="form-control">
          <option value="all">ทุกสถานะ</option>
          <option value="pending">รอดำเนินการ</option>
          <option value="assembling">กำลังประกอบ</option>
          <option value="shipped">จัดส่งแล้ว</option>
        </select>
      </label>
      <button v-if="orderQuery || orderStatus !== 'all'" data-test="orders-reset" class="btn btn-outline" type="button" @click="resetOrderFilters">ล้างตัวกรอง</button>
    </div>
    <div class="admin-table-region" data-test="orders-table-region" tabindex="0" aria-label="ตารางคำสั่งซื้อ เลื่อนแนวนอนเพื่อดูข้อมูลเพิ่มเติม">
      <table class="data-table hairline-grid">
        <thead>
          <tr class="font-mono">
            <th>หมายเลข (ID)</th>
            <th>ลูกค้า (CUSTOMER)</th>
            <th>รูปแบบประกอบ (ASSEMBLY)</th>
            <th>ยอดสุทธิ (TOTAL)</th>
            <th>สถานะ (STATUS)</th>
            <th>จัดการ (ACTION)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in filteredOrders" :key="order.id">
            <td style="font-family: var(--font-mono); font-weight: 600;">
              {{ order.id }}
              <div style="font-size: 0.75rem; color: var(--muted); margin-top: 0.25rem; font-weight: normal;">
                {{ new Date(order.created_at || order.date).toLocaleDateString('th-TH') }}
              </div>
            </td>
            <td>{{ order.customer_name || order.customer }}</td>
            <td>
              <span v-if="order.assembly_type === 'none' || order.assembly === 'none'">ประกอบเอง</span>
              <span v-else-if="order.assembly_type === 'standard' || order.assembly === 'standard'" style="color: var(--accent);">มาตรฐาน</span>
              <span v-else-if="order.assembly_type === 'premium' || order.assembly === 'premium'" style="color: var(--warning);">พรีเมียม</span>
            </td>
            <td style="font-family: var(--font-mono); font-weight: 600;">฿{{ (order.total_price || order.total || 0).toLocaleString() }}</td>
            <td>
              <span :class="['badge', 'badge-' + order.status]">
                {{ getStatusLabel(order.status) }}
              </span>
            </td>
            <td>
              <div style="display: flex; gap: 0.5rem; align-items: center;">
                <select class="form-control" style="padding: 0.25rem 0.5rem; width: auto; background: var(--canvas); color: var(--ink); height: 32px;" :value="order.status" :disabled="pendingOrderId === order.id" @change="updateOrderStatus(order, $event)">
                  <option value="pending" style="background: var(--canvas); color: var(--ink);">รอดำเนินการ</option>
                  <option value="assembling" style="background: var(--canvas); color: var(--ink);">กำลังประกอบ</option>
                  <option value="shipped" style="background: var(--canvas); color: var(--ink);">จัดส่งแล้ว</option>
                </select>
                <button class="btn btn-outline btn-sm" style="height: 32px; display: flex; align-items: center; justify-content: center;" @click="openOrderModal(order)">
                  📄 รายละเอียด
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="admin-mobile-list" aria-label="รายการคำสั่งซื้อ">
      <article v-for="order in filteredOrders" :key="'order-card-'+order.id" class="admin-mobile-card" :data-test="`order-card-${order.id}`">
        <div class="admin-mobile-card__heading">
          <strong>{{ order.id }}</strong>
          <span class="badge" :class="'badge-' + order.status">{{ getStatusLabel(order.status) }}</span>
        </div>
        <dl class="admin-mobile-card__facts">
          <div><dt>ลูกค้า</dt><dd>{{ order.customer_name || order.customer }}</dd></div>
          <div><dt>ยอดสุทธิ</dt><dd>฿{{ (order.total_price || order.total || 0).toLocaleString() }}</dd></div>
          <div><dt>วันที่</dt><dd>{{ new Date(order.created_at || order.date).toLocaleDateString('th-TH') }}</dd></div>
        </dl>
        <div class="admin-actions admin-actions--stack">
          <label class="sr-only" :for="`order-status-${order.id}`">สถานะคำสั่งซื้อ {{ order.id }}</label>
          <select :id="`order-status-${order.id}`" class="form-control" :value="order.status" :disabled="pendingOrderId === order.id" @change="updateOrderStatus(order, $event)">
            <option value="pending">รอดำเนินการ</option>
            <option value="assembling">กำลังประกอบ</option>
            <option value="shipped">จัดส่งแล้ว</option>
          </select>
          <button class="btn btn-outline" @click="openOrderModal(order)">📄 รายละเอียด</button>
        </div>
      </article>
    </div>
    <p v-if="orders.length === 0" class="admin-empty" data-test="orders-empty">ยังไม่มีคำสั่งซื้อในระบบ</p>
    <div v-else-if="filteredOrders.length === 0" class="admin-empty admin-no-results" data-test="orders-no-results">
      <p>ไม่พบคำสั่งซื้อที่ตรงกับตัวกรอง</p>
      <button class="btn btn-outline" type="button" @click="resetOrderFilters">ล้างตัวกรอง</button>
    </div>

    <!-- Order Details Modal -->
    <div class="modal-overlay" v-if="showOrderModal" @click.self="showOrderModal = false">
      <div class="modal-content glass-panel admin-modal" role="dialog" aria-modal="true" aria-labelledby="order-modal-title" style="max-width: 600px; padding: 0;">
        <div class="modal-header" style="padding: 1.5rem; border-bottom: 1px solid var(--glass-border); background: rgba(0,0,0,0.2);">
          <h3 id="order-modal-title" style="display: flex; align-items: center; gap: 0.5rem; font-size: 1.25rem;">
            <span>📄</span> 
            รายละเอียดคำสั่งซื้อ {{ selectedOrder?.id }}
          </h3>
          <button class="close-btn" aria-label="ปิดรายละเอียดคำสั่งซื้อ" @click="showOrderModal = false">✕</button>
        </div>
        <div class="modal-body admin-modal__body" style="max-height: 70vh; overflow-y: auto; padding: 1.5rem;">
          <div class="order-meta-grid" style="margin-bottom: 1.5rem; font-size: 0.9rem; color: var(--ink-mute);">
            <div><strong>ลูกค้า:</strong> {{ selectedOrder?.customer_name || selectedOrder?.customer }}</div>
            <div><strong>รูปแบบประกอบ:</strong> {{ selectedOrder?.assembly_type || selectedOrder?.assembly }}</div>
            <div><strong>เบอร์โทร:</strong> {{ selectedOrder?.customer_phone || '-' }}</div>
            <div><strong>ยอดสุทธิ:</strong> ฿{{ (selectedOrder?.total_price || selectedOrder?.total || 0).toLocaleString() }}</div>
            <div style="grid-column: 1 / -1;"><strong>ที่อยู่:</strong> {{ selectedOrder?.customer_address || '-' }}</div>
          </div>
          
          <h4 style="margin-bottom: 1rem; color: var(--ink); border-bottom: 1px solid var(--hairline-cool); padding-bottom: 0.5rem;">รายการสินค้าที่สั่งซื้อ</h4>
          <div v-if="selectedOrder?.build_items && Object.keys(selectedOrder.build_items).length > 0" style="display: flex; flex-direction: column; gap: 0.75rem;">
            <div v-for="(itemId, category) in selectedOrder.build_items" :key="category" style="display: flex; align-items: center; gap: 1rem; background: var(--canvas-soft); padding: 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--hairline-cool);">
              <div style="width: 40px; height: 40px; background: var(--canvas); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; padding: 0.25rem;">
                <img v-if="getHardwareItem(category, itemId)?.image" :src="getHardwareItem(category, itemId).image" style="width: 100%; height: 100%; object-fit: contain;">
                <span v-else>📦</span>
              </div>
              <div style="flex: 1; min-width: 0;">
                <div style="font-size: 0.7rem; color: var(--ink-mute); text-transform: uppercase;">{{ category }}</div>
                <div style="font-size: 0.9rem; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  {{ getHardwareItem(category, itemId)?.name || 'ไม่พบข้อมูลสินค้า (ID: ' + itemId + ')' }}
                </div>
              </div>
              <div style="font-weight: 600; font-family: var(--font-mono);">
                ฿{{ (getHardwareItem(category, itemId)?.price || 0).toLocaleString() }}
              </div>
            </div>
          </div>
          <div v-else style="text-align: center; color: var(--muted); padding: 1rem;">ไม่มีข้อมูลรายการชิ้นส่วน</div>
        </div>
        <div class="admin-modal__footer" style="padding: 1.5rem; border-top: 1px solid var(--glass-border); display: flex; justify-content: flex-end; background: rgba(0,0,0,0.2);">
          <button class="btn btn-outline" @click="showOrderModal = false">ปิด</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAdminStore } from '../../stores/admin';
import { filterOrders } from '../../utils/adminCollectionFilters';

const props = defineProps({
  orders: {
    type: Array,
    default: () => []
  },
  catalog: {
    type: Object,
    default: () => ({})
  }
});

const adminStore = useAdminStore();
const orderQuery = ref('');
const orderStatus = ref('all');
const pendingOrderId = ref(null);

const filteredOrders = computed(() => filterOrders(props.orders || [], {
  query: orderQuery.value,
  status: orderStatus.value
}));

const resetOrderFilters = () => {
  orderQuery.value = '';
  orderStatus.value = 'all';
};

const getStatusLabel = (status) => {
  const map = { pending: 'รอดำเนินการ', assembling: 'กำลังประกอบ', shipped: 'จัดส่งแล้ว' };
  return map[status] || status;
};

const updateOrderStatus = async (order, event) => {
  const nextStatus = event.target.value;
  pendingOrderId.value = order.id;
  const success = await adminStore.updateOrderStatus(order.id, nextStatus);
  if (!success) event.target.value = order.status;
  pendingOrderId.value = null;
};

// --- Order Details Modal ---
const showOrderModal = ref(false);
const selectedOrder = ref(null);

const openOrderModal = (order) => {
  selectedOrder.value = order;
  showOrderModal.value = true;
};

const getHardwareItem = (category, itemId) => {
  if (!props.catalog || !props.catalog[category]) return null;
  return props.catalog[category].find(item => item.id == itemId);
};
</script>
