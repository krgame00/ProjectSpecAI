<template>
  <div class="container admin-view">
    <header class="admin-heading">
      <h2 style="font-size: var(--text-2xl); color: var(--accent); text-shadow: var(--accent-glow);">ระบบจัดการหลังบ้าน (Admin Panel)</h2>
      <p style="color: var(--muted);">ภาพรวมร้านค้า การสั่งซื้อ สินค้าคงคลัง และบทความ</p>
    </header>

    <div class="admin-layout">
      <aside class="admin-sidebar">
        <ul class="admin-menu admin-tabs" role="tablist" aria-label="ส่วนจัดการระบบ">
          <li v-for="tab in adminTabs" :key="tab.id" role="presentation">
            <button
              type="button"
              role="tab"
              :id="`admin-tab-${tab.id}`"
              :aria-controls="`admin-panel-${tab.id}`"
              :aria-selected="adminTab === tab.id"
              :class="{ active: adminTab === tab.id }"
              @click="selectAdminTab(tab.id)"
            >
              <span aria-hidden="true">{{ tab.icon }}</span>
              <span>{{ tab.label }}</span>
            </button>
          </li>
        </ul>
        <div class="admin-return">
          <button class="btn btn-outline" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem;" @click="$router.push('/')">
            <span aria-hidden="true">⬅️</span><span class="admin-return__label">กลับหน้าร้านค้า</span>
          </button>
        </div>
      </aside>

      <main class="admin-main">
        <!-- Dashboard Tab -->
        <AdminOverviewTab v-if="adminTab === 'dashboard'" :orders="orders" />

        <!-- Users Tab -->
        <AdminUsersTab v-if="adminTab === 'users'" :current-user="currentUser" @request-confirm="showConfirm" />

        <!-- Admin Profile Tab -->
        <div v-if="adminTab === 'profile'" id="admin-panel-profile" role="tabpanel" aria-labelledby="admin-tab-profile">
          <ProfileView embedded />
        </div>

        <!-- Orders Tab -->
        <AdminOrdersTab v-if="adminTab === 'orders'" :orders="orders" :catalog="catalog" />

        <!-- Inventory Tab -->
        <AdminInventoryTab v-if="adminTab === 'inventory'" :catalog="catalog" :categories="categories" @request-confirm="showConfirm" />

        <!-- Articles Tab -->
        <AdminArticlesTab v-if="adminTab === 'articles'" :articles="articles" @request-confirm="showConfirm" />
      </main>
    </div>

    <!-- Confirm Modal -->
    <AdminConfirmModal
      :show="confirmModal.show"
      :message="confirmModal.message"
      :type="confirmModal.type"
      :is-confirming="isConfirming"
      @confirm="executeConfirm"
      @close="closeConfirm"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import ProfileView from '../views/ProfileView.vue';
import AdminOverviewTab from './admin/AdminOverviewTab.vue';
import AdminOrdersTab from './admin/AdminOrdersTab.vue';
import AdminInventoryTab from './admin/AdminInventoryTab.vue';
import AdminArticlesTab from './admin/AdminArticlesTab.vue';
import AdminUsersTab from './admin/AdminUsersTab.vue';
import AdminConfirmModal from './admin/AdminConfirmModal.vue';
import { useAdminStore } from '../stores/admin';

const props = defineProps({
  orders: {
    type: Array,
    default: () => []
  },
  categories: {
    type: Array,
    default: () => []
  },
  catalog: {
    type: Object,
    default: () => ({})
  },
  articles: {
    type: Array,
    default: () => []
  },
  currentUser: {
    type: Object,
    default: () => ({})
  }
});

const adminStore = useAdminStore();
const adminTab = ref('dashboard');

const adminTabs = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard ภาพรวม' },
  { id: 'orders', icon: '📦', label: 'รายการสั่งซื้อ (Orders)' },
  { id: 'inventory', icon: '⚙️', label: 'คลังสินค้า (Inventory)' },
  { id: 'articles', icon: '📰', label: 'จัดการบทความ (Articles)' },
  { id: 'users', icon: '👥', label: 'จัดการสมาชิก (Users)' },
  { id: 'profile', icon: '👤', label: 'ข้อมูลโปรไฟล์แอดมิน' }
];

const fetchUsers = async () => {
  await adminStore.fetchUsers();
};

const selectAdminTab = (tabId) => {
  adminTab.value = tabId;
  if (tabId === 'users') fetchUsers();
};

onMounted(() => {
  fetchUsers();
});

// --- Custom Confirm Modal ---
const confirmModal = reactive({
  show: false,
  message: '',
  onConfirm: null,
  type: 'danger'
});
const isConfirming = ref(false);

const showConfirm = (message, onConfirmCallback, type = 'danger') => {
  confirmModal.message = message;
  confirmModal.onConfirm = onConfirmCallback;
  confirmModal.type = type;
  confirmModal.show = true;
};

const closeConfirm = () => {
  confirmModal.show = false;
  confirmModal.onConfirm = null;
};

const executeConfirm = async () => {
  if (!confirmModal.onConfirm || isConfirming.value) return;
  isConfirming.value = true;
  try {
    await confirmModal.onConfirm();
  } finally {
    isConfirming.value = false;
    closeConfirm();
  }
};
</script>

<style scoped>
.admin-view { 
  padding-top: 2rem; 
  padding-bottom: 5rem;
  min-height: 100vh;
  background-color: var(--canvas);
  color: var(--ink);
}
.admin-heading { margin-bottom: 2rem; }
.admin-heading p { margin: 0.35rem 0 0; }
.admin-layout { display: grid; grid-template-columns: 220px minmax(0, 1fr); gap: var(--space-lg); align-items: start; }
.admin-main { min-width: 0; }

.admin-sidebar { 
  background: var(--canvas); border-radius: var(--radius-lg); 
  border: 1px solid var(--hairline); overflow: hidden; padding: 0.5rem 0 0 0; 
  box-shadow: var(--shadow-sm);
  display: flex; flex-direction: column;
  position: sticky; top: 1rem;
}
.admin-return { padding: 1rem; border-top: 1px solid var(--hairline-cool); }
.admin-menu { list-style: none; margin: 0; padding: 0; }
.admin-menu li { border-bottom: 1px solid var(--hairline-cool); }
.admin-menu li:last-child { border-bottom: none; }
.admin-menu button {
  width: 100%; padding: 1rem 1.5rem; cursor: pointer; border: 1px solid transparent;
  background: transparent; transition: background-color var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
  display: flex; align-items: center; gap: 0.75rem; text-align: left;
  font: inherit; font-size: var(--text-sm); font-weight: 500; color: var(--ink-mute);
}
.admin-menu button:hover { background: var(--canvas-soft); color: var(--ink); }
.admin-menu button.active { background: var(--canvas-soft); border-color: var(--hairline-strong); color: var(--primary-deep); font-weight: 600;}

:deep(.admin-card) {
  background: var(--canvas);
  border: 1px solid var(--hairline);
  box-shadow: var(--shadow-sm);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
:deep(.admin-section-card) { padding: 0; }
:deep(.admin-toolbar) { display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
:deep(.admin-toolbar__actions), :deep(.admin-actions) { display: flex; align-items: center; gap: 0.75rem; }
:deep(.admin-row-actions) { display: flex; align-items: center; gap: 0.5rem; white-space: nowrap; }
:deep(.admin-row-action) {
  display: inline-flex; align-items: center; justify-content: center;
  width: 4.5rem; min-height: 32px; padding: 0.25rem 0.6rem; font-size: 0.8rem;
}
:deep(.admin-category-select) { width: 200px; }
:deep(.operations-header) {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 1.5rem;
  padding: 1.5rem 1.5rem 1rem;
}
:deep(.operations-header h3) { margin: 0; color: var(--ink); font-size: var(--text-lg); line-height: 1.35; }
:deep(.operations-description) { margin: 0.35rem 0 0; color: var(--ink-mute); font-size: var(--text-sm); line-height: 1.55; }
:deep(.operations-count) {
  flex: 0 0 auto; padding: 0.35rem 0.7rem; border: 1px solid var(--hairline);
  border-radius: var(--radius-pill); color: var(--primary-deep); background: var(--canvas-soft);
  font-family: var(--font-mono); font-size: var(--text-xs); font-weight: 600;
}
:deep(.operations-toolbar) {
  display: grid; grid-template-columns: minmax(14rem, 1fr) minmax(10rem, auto) auto minmax(0, auto);
  align-items: end; gap: 0.75rem; padding: 0 1.5rem 1.25rem;
}
:deep(.operations-search), :deep(.operations-filter) { display: grid; gap: 0.4rem; min-width: 0; }
:deep(.operations-search > span), :deep(.operations-filter > span) { color: var(--ink-mute); font-size: var(--text-xs); font-weight: 600; }
:deep(.operations-search .form-control), :deep(.operations-filter .form-control) { width: 100%; min-height: 40px; }
:deep(.operations-actions) { display: flex; align-items: center; justify-content: flex-end; gap: 0.75rem; }
:deep(.operations-actions .btn), :deep(.operations-toolbar > .btn) { min-height: 40px; white-space: nowrap; }
:deep(.admin-table-region) { max-width: 100%; max-height: min(66vh, 720px); overflow: auto; border-top: 1px solid var(--hairline-cool); }
:deep(.admin-mobile-list) { display: none; padding: 1rem; }
:deep(.admin-mobile-card) { padding: 1rem; border: 1px solid var(--hairline-cool); background: var(--canvas-soft); }
:deep(.admin-mobile-card + .admin-mobile-card) { margin-top: 0.75rem; }
:deep(.admin-mobile-card__heading) { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
:deep(.admin-mobile-card__heading strong) { overflow-wrap: anywhere; }
:deep(.admin-mobile-card__id) { color: var(--ink-mute); font-family: var(--font-mono); font-size: var(--text-xs); }
:deep(.admin-mobile-card__facts) { display: grid; gap: 0.75rem; margin: 1rem 0; }
:deep(.admin-mobile-card__facts div) { display: grid; grid-template-columns: minmax(5rem, 0.4fr) 1fr; gap: 0.75rem; }
:deep(.admin-mobile-card__facts dt) { color: var(--ink-mute); }
:deep(.admin-mobile-card__facts dd) { margin: 0; overflow-wrap: anywhere; }
:deep(.admin-mobile-card__media) { display: flex; align-items: center; gap: 0.75rem; margin: 1rem 0; color: var(--ink-mute); }
:deep(.admin-mobile-card__media img) { width: 64px; height: 44px; object-fit: cover; border-radius: var(--radius-sm); }
:deep(.admin-empty) { margin: 0; padding: 2rem 1rem; text-align: center; color: var(--ink-mute); }
:deep(.admin-no-results) { display: grid; justify-items: center; gap: 0.85rem; border-top: 1px solid var(--hairline-cool); }
:deep(.admin-no-results p) { margin: 0; }
:deep(.admin-chart-card) { margin-top: 2rem; padding: 2rem; }
:deep(.admin-chart) { height: clamp(240px, 32vw, 320px); }
:deep(.order-meta-grid) { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 0.5rem; }
:deep(.admin-media-field) { display: flex; gap: 1rem; align-items: flex-start; }
:deep(.admin-media-field > *) { min-width: 0; }
:deep(.admin-spec-row) { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; }
:deep(.admin-confirm-actions) { display: flex; justify-content: center; gap: 1rem; }

:deep(.stat-grid) { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-md); }
:deep(.stat-card) { 
  padding: 1.5rem; border-radius: var(--radius-lg); text-align: left; 
  background: var(--canvas); border: 1px solid var(--hairline); box-shadow: var(--shadow-sm);
  display: flex; flex-direction: column; gap: 0.5rem;
}
:deep(.stat-title) { color: var(--ink-mute); font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
:deep(.stat-val) { font-size: var(--text-3xl); font-weight: 700; color: var(--ink); font-family: var(--font-sans); }
:deep(.stat-insight) { font-size: 0.8rem; color: var(--ink-mute-2); font-weight: 500; }
:deep(.stat-insight.positive) { color: var(--primary-deep); }
:deep(.stat-insight.alert) { color: var(--warning); }

:deep(.data-table) { width: 100%; border-collapse: separate; border-spacing: 0; text-align: left; }
:deep(.data-table th), :deep(.data-table td) { padding: 0.85rem 1rem; font-size: var(--text-sm); border-bottom: 1px solid var(--hairline-cool); vertical-align: middle; }
:deep(.data-table thead) { position: sticky; top: 0; z-index: 3; }
:deep(.data-table th) { font-weight: 600; color: var(--ink-mute); background: var(--canvas-soft); letter-spacing: 0.025em; font-size: 0.75rem; white-space: nowrap; }
:deep(.data-table tr:hover td) { background: var(--canvas-soft); }
:deep(.data-table td) { color: var(--ink); }
:deep(#admin-panel-articles .data-table th:nth-child(3)),
:deep(#admin-panel-articles .data-table td:nth-child(3)) { width: 50%; }
:deep(#admin-panel-inventory .data-table th:last-child),
:deep(#admin-panel-inventory .data-table td:last-child),
:deep(#admin-panel-articles .data-table th:last-child),
:deep(#admin-panel-articles .data-table td:last-child) { width: 1%; white-space: nowrap; }
:deep(#admin-panel-articles .data-table td:nth-child(3)) { max-width: 34rem; }
:deep(.article-title-text) {
  display: -webkit-box; overflow: hidden; overflow-wrap: anywhere;
  -webkit-box-orient: vertical; -webkit-line-clamp: 2;
}

:deep(.badge) { display: inline-flex; align-items: center; padding: 0.35rem 0.75rem; border-radius: var(--radius-pill); font-size: 0.75rem; font-weight: 600; letter-spacing: 0.02em; }
:deep(.status-badge.pending) { background: var(--warning-alpha); color: var(--warning); border: 1px solid var(--warning-border); }
:deep(.status-badge.assembling) { background: var(--primary-alpha); color: var(--primary-deep); border: 1px solid var(--primary-border); }
:deep(.status-badge.completed) { background: var(--success-alpha); color: var(--success); border: 1px solid var(--success-border); }

/* Modal specific overrides */
:deep(.modal-overlay) { 
  position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
  background: var(--overlay); backdrop-filter: blur(4px); 
  display: flex; align-items: center; justify-content: center; 
  z-index: 2000; 
}
:deep(.modal-content) {
  width: 100%; max-width: 700px;
  background: var(--canvas-night);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
}
:deep(.admin-modal) { display: flex; flex-direction: column; max-height: calc(100dvh - 2rem); }
:deep(.admin-modal__body) { min-height: 0; flex: 1 1 auto; }
:deep(.admin-modal__footer) { flex: 0 0 auto; }
:deep(.admin-form-grid) { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 1.5rem; margin-bottom: 1rem; }
:deep(.admin-form-grid--article) { grid-template-columns: minmax(0, 1fr) minmax(0, 2fr); }
:deep(.modal-header) { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid var(--hairline-cool); background: rgba(0,0,0,0.2); }
:deep(.modal-body) { padding: 2rem; max-height: 75vh; overflow-y: auto; }
:deep(.close-btn) { background: none; border: none; font-size: 1.25rem; color: var(--ink-mute); cursor: pointer; transition: color var(--transition-fast); }
:deep(.close-btn:hover) { color: var(--danger); }
:deep(.form-group) { margin-bottom: 1rem; }
:deep(.form-group label) { display: block; margin-bottom: 0.5rem; font-size: 0.85rem; color: var(--ink-mute); font-weight: 500;}

:deep(.btn-danger) { background: var(--error-bg, #441111); color: var(--error, #ff4444); border: 1px solid var(--error, #ff4444); }
:deep(.btn-danger:hover) { background: var(--error, #ff4444); color: #fff; }

.admin-tabs button:focus-visible,
:deep(.admin-table-region:focus-visible),
:deep(.operations-toolbar .form-control:focus-visible),
:deep(.operations-toolbar .btn:focus-visible),
:deep(.admin-mobile-card .btn:focus-visible),
:deep(.admin-modal .btn:focus-visible),
:deep(.admin-modal .form-control:focus-visible),
:deep(.close-btn:focus-visible) {
  outline: 3px solid var(--primary);
  outline-offset: 2px;
}

@media (max-width: 1024px) {
  .admin-layout { grid-template-columns: minmax(0, 1fr); gap: 1rem; }
  .admin-sidebar {
    top: 0; z-index: 50; min-height: 0; padding: 0;
    display: grid; grid-template-columns: minmax(0, 1fr) auto;
    border-radius: 0 0 var(--radius-md) var(--radius-md);
    overflow: visible;
  }
  .admin-tabs {
    position: sticky; top: 0; z-index: 51;
    display: flex; min-width: 0; overflow-x: auto; overscroll-behavior-inline: contain;
    scrollbar-width: thin; background: var(--canvas);
  }
  .admin-menu li { flex: 0 0 auto; border: 0; }
  .admin-menu button { width: auto; min-height: 48px; padding: 0.75rem 1rem; white-space: nowrap; }
  .admin-return { margin: 0 !important; padding: 0.35rem !important; border: 0 !important; background: var(--canvas); }
  .admin-return .btn { min-height: 44px; white-space: nowrap; }
  :deep(.stat-grid) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  :deep(.operations-toolbar) { grid-template-columns: minmax(12rem, 1fr) minmax(10rem, 0.65fr) auto; }
  :deep(.operations-actions) { grid-column: 1 / -1; justify-content: flex-start; }
  :deep(.admin-toolbar) { align-items: flex-start; flex-wrap: wrap; }
  :deep(.admin-toolbar__actions) { flex-wrap: wrap; justify-content: flex-end; }
  :deep(.admin-table-region .data-table) { min-width: 760px; }
  :deep(.admin-table-region .data-table th:first-child),
  :deep(.admin-table-region .data-table td:first-child) { position: sticky; left: 0; z-index: 1; background: var(--canvas); }
  :deep(.admin-table-region .data-table th:first-child) { background: var(--canvas-soft); z-index: 2; }
}

@media (max-width: 640px) {
  .admin-view { padding-top: 1rem; padding-bottom: 3rem; }
  .admin-heading { margin-bottom: 1rem; }
  .admin-heading h2 { font-size: clamp(1.25rem, 6vw, var(--text-2xl)) !important; line-height: 1.25; }
  .admin-heading p { font-size: var(--text-sm); }
  .admin-menu button { min-height: 44px; padding: 0.65rem 0.85rem; }
  .admin-return__label { display: none; }
  .admin-return .btn { width: 44px !important; padding: 0; }
  :deep(.stat-grid) { grid-template-columns: minmax(0, 1fr); }
  :deep(.stat-card) { padding: 1rem; }
  :deep(.stat-val) { font-size: var(--text-2xl); }
  :deep(.admin-chart-card) { margin-top: 1rem; padding: 1rem; }
  :deep(.admin-chart) { height: clamp(220px, 80vw, 280px); }
  :deep(.admin-section-card) { padding: 0; }
  :deep(.operations-header) { align-items: center; padding: 1rem; gap: 0.75rem; }
  :deep(.operations-description) { font-size: var(--text-xs); }
  :deep(.operations-count) { padding-inline: 0.6rem; }
  :deep(.operations-toolbar) { grid-template-columns: minmax(0, 1fr); padding: 0 1rem 1rem; }
  :deep(.operations-actions) { grid-column: auto; display: grid; grid-template-columns: minmax(0, 1fr); width: 100%; }
  :deep(.operations-actions .btn), :deep(.operations-toolbar > .btn) { width: 100%; min-height: 44px; }
  :deep(.admin-toolbar) { flex-direction: column; align-items: stretch; margin: 0; padding: 1rem; }
  :deep(.admin-toolbar__actions) { display: grid; grid-template-columns: minmax(0, 1fr); width: 100%; }
  :deep(.admin-toolbar__actions .btn), :deep(.admin-category-select) { width: 100%; min-height: 44px; }
  :deep(.admin-table-region) { display: none; }
  :deep(.admin-mobile-list) { display: block; }
  :deep(.admin-mobile-card) { border-radius: var(--radius-md); }
  :deep(.admin-mobile-card__facts div) { grid-template-columns: minmax(4.5rem, 0.4fr) minmax(0, 1fr); }
  :deep(.admin-actions) { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
  :deep(.admin-actions--stack) { grid-template-columns: minmax(0, 1fr); }
  :deep(.admin-actions .btn), :deep(.admin-actions .form-control) { width: 100%; min-height: 44px; }
  :deep(.modal-overlay) { padding: 0; align-items: stretch; }
  :deep(.admin-modal:not(.admin-modal--confirm)) {
    width: 100dvw; height: 100dvh; max-width: none !important; max-height: none;
    border: 0; border-radius: 0;
  }
  :deep(.admin-modal--confirm) { width: calc(100dvw - 2rem); max-height: calc(100dvh - 2rem); margin: auto; padding: 1.5rem 1rem !important; }
  :deep(.modal-header) { position: sticky; top: 0; z-index: 2; padding: 1rem !important; }
  :deep(.modal-header h3) { min-width: 0; font-size: 1rem !important; line-height: 1.35; }
  :deep(.close-btn) { min-width: 44px; min-height: 44px; flex: 0 0 44px; }
  :deep(.admin-modal__body) { max-height: none !important; padding: 1rem !important; }
  :deep(.admin-modal__footer) {
    position: sticky; bottom: 0; z-index: 2; padding: 0.75rem 1rem !important;
    display: grid !important; grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  :deep(.admin-modal__footer .btn) { width: 100%; min-height: 44px; padding-inline: 0.75rem !important; }
  :deep(.admin-form-grid), :deep(.admin-form-grid--article) { grid-template-columns: minmax(0, 1fr); gap: 1rem; }
  :deep(.order-meta-grid) { grid-template-columns: minmax(0, 1fr); }
  :deep(.admin-media-field) { align-items: stretch; gap: 0.75rem; }
  :deep(.admin-spec-row) { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr) 44px; }
  :deep(.admin-spec-row .btn) { min-height: 44px; padding: 0 !important; }
  :deep(.admin-confirm-actions) { gap: 0.75rem; }
  :deep(.admin-confirm-actions .btn) { min-height: 44px; }
}

@media (prefers-reduced-motion: reduce) {
  .admin-view *, .admin-view *::before, .admin-view *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
</style>
