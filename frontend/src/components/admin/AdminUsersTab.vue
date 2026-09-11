<template>
  <div id="admin-panel-users" role="tabpanel" aria-labelledby="admin-tab-users" class="admin-card">
    <header class="operations-header">
      <div>
        <h3>จัดการสมาชิก</h3>
        <p class="operations-description">ค้นหาบัญชี ตรวจสอบสิทธิ์ และจัดการสมาชิกในระบบ</p>
      </div>
      <output class="operations-count" data-test="users-result-count" aria-live="polite">{{ filteredUsers.length }} รายการ</output>
    </header>
    <div class="operations-toolbar" role="search" aria-label="ค้นหาและกรองสมาชิก">
      <label class="operations-search">
        <span>ค้นหาสมาชิก</span>
        <input v-model="userQuery" data-test="users-search" class="form-control" type="search" placeholder="ชื่อ อีเมล หรือ ID">
      </label>
      <label class="operations-filter">
        <span>สิทธิ์</span>
        <select v-model="userRole" data-test="users-role-filter" class="form-control">
          <option value="all">ทุกสิทธิ์</option>
          <option value="admin">Admin</option>
          <option value="customer">Customer</option>
        </select>
      </label>
      <button v-if="userQuery || userRole !== 'all'" data-test="users-reset" class="btn btn-outline" type="button" @click="resetUserFilters">ล้างตัวกรอง</button>
    </div>
    <div class="admin-table-region" data-test="users-table-region" tabindex="0" aria-label="ตารางสมาชิก เลื่อนแนวนอนเพื่อดูข้อมูลเพิ่มเติม">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>ชื่อ-นามสกุล</th>
            <th>อีเมล</th>
            <th>สถานะ (Role)</th>
            <th>วันที่สมัคร</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>
              <span :class="['status-badge', user.role === 'admin' ? 'completed' : 'pending']">
                {{ user.role }}
              </span>
            </td>
            <td>{{ new Date(user.created_at).toLocaleDateString('th-TH') }}</td>
            <td>
              <div style="display: flex; gap: 0.5rem; justify-content: center;">
                <button class="btn btn-outline btn-sm" @click="toggleUserRole(user)" :disabled="user.id === currentUser.id || pendingUserId === user.id">
                  ปรับสิทธิ์
                </button>
                <button class="btn btn-outline-danger btn-sm" @click="deleteUser(user.id)" :disabled="user.id === currentUser.id || pendingUserId === user.id">
                  ลบ
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="admin-mobile-list" aria-label="รายชื่อสมาชิก">
      <article v-for="user in filteredUsers" :key="'user-card-'+user.id" class="admin-mobile-card" :data-test="`user-card-${user.id}`">
        <div class="admin-mobile-card__heading">
          <strong>{{ user.name }}</strong>
          <span class="admin-mobile-card__id">#{{ user.id }}</span>
        </div>
        <dl class="admin-mobile-card__facts">
          <div><dt>อีเมล</dt><dd>{{ user.email || '-' }}</dd></div>
          <div><dt>สิทธิ์</dt><dd><span :class="['status-badge', user.role === 'admin' ? 'completed' : 'pending']">{{ user.role }}</span></dd></div>
          <div><dt>วันที่สมัคร</dt><dd>{{ new Date(user.created_at).toLocaleDateString('th-TH') }}</dd></div>
        </dl>
        <div class="admin-actions">
          <button class="btn btn-outline" @click="toggleUserRole(user)" :disabled="user.id === currentUser.id || pendingUserId === user.id">ปรับสิทธิ์</button>
          <button class="btn btn-outline-danger" @click="deleteUser(user.id)" :disabled="user.id === currentUser.id || pendingUserId === user.id">ลบ</button>
        </div>
      </article>
    </div>
    <p v-if="users.length === 0" class="admin-empty" data-test="users-empty">ยังไม่มีสมาชิกในระบบ</p>
    <div v-else-if="filteredUsers.length === 0" class="admin-empty admin-no-results" data-test="users-no-results">
      <p>ไม่พบสมาชิกที่ตรงกับตัวกรอง</p>
      <button class="btn btn-outline" type="button" @click="resetUserFilters">ล้างตัวกรอง</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAdminStore } from '../../stores/admin';
import { filterUsers } from '../../utils/adminCollectionFilters';

const props = defineProps({
  currentUser: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['request-confirm']);

const adminStore = useAdminStore();
const users = computed(() => adminStore.users);

const userQuery = ref('');
const userRole = ref('all');
const pendingUserId = ref(null);

const filteredUsers = computed(() => filterUsers(users.value || [], {
  query: userQuery.value,
  role: userRole.value
}));

const resetUserFilters = () => {
  userQuery.value = '';
  userRole.value = 'all';
};

const toggleUserRole = (user) => {
  emit('request-confirm', `คุณแน่ใจว่าต้องการเปลี่ยนสิทธิ์ของ ${user.name} หรือไม่?`, async () => {
    pendingUserId.value = user.id;
    try { return await adminStore.toggleUserRole(user); }
    finally { pendingUserId.value = null; }
  }, 'warning');
};

const deleteUser = (id) => {
  emit('request-confirm', 'คุณแน่ใจว่าต้องการลบบัญชีนี้? การกระทำนี้ไม่สามารถยกเลิกได้!', async () => {
    pendingUserId.value = id;
    try { return await adminStore.deleteUser(id); }
    finally { pendingUserId.value = null; }
  }, 'danger');
};
</script>
