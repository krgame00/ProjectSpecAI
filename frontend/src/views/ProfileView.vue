<template>
  <main class="container profile-page" aria-labelledby="profile-title">
    <section class="profile-card">
      <header class="profile-header">
        <p class="profile-eyebrow">บัญชีสมาชิก</p>
        <h1 id="profile-title">ข้อมูลโปรไฟล์</h1>
      </header>

      <div
        v-if="loading"
        class="profile-state"
        role="status"
        aria-live="polite"
      >
        กำลังโหลดข้อมูลโปรไฟล์
      </div>

      <div v-else-if="error" class="profile-state profile-error" role="alert">
        <p>{{ error }}</p>
        <button
          class="btn btn-primary"
          data-test="profile-retry"
          type="button"
          @click="loadProfile"
        >
          ลองอีกครั้ง
        </button>
      </div>

      <template v-else-if="profile">
        <dl class="profile-details">
          <div>
            <dt>ชื่อผู้ใช้งาน</dt>
            <dd>{{ profile.name || '-' }}</dd>
          </div>
          <div>
            <dt>อีเมล</dt>
            <dd>{{ profile.email || '-' }}</dd>
          </div>
          <div>
            <dt>สถานะบัญชี</dt>
            <dd><span class="badge">{{ profile.role || '-' }}</span></dd>
          </div>
          <div>
            <dt>วันที่สมัคร</dt>
            <dd>{{ formattedCreatedAt }}</dd>
          </div>
        </dl>

        <footer class="profile-danger-zone">
          <button
            class="btn btn-outline-danger"
            data-test="profile-signout"
            type="button"
            @click="logout"
          >
            ออกจากระบบ
          </button>
        </footer>
      </template>
    </section>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const profile = ref(null);
const loading = ref(true);
const error = ref(null);
let mounted = true;
let activeRequestController = null;

const formattedCreatedAt = computed(() => {
  if (!profile.value?.created_at) return '-';
  const date = new Date(profile.value.created_at);
  return Number.isNaN(date.getTime())
    ? '-'
    : new Intl.DateTimeFormat('th-TH').format(date);
});

const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.PROD ? 'https://projectspecai.onrender.com/api/v1' : 'http://localhost:3001/api/v1');

async function loadProfile() {
  const requestToken = authStore.token;
  if (!requestToken) {
    await router.replace('/');
    return;
  }

  activeRequestController?.abort();
  const requestController = new AbortController();
  activeRequestController = requestController;
  loading.value = true;
  error.value = null;

  try {
    const response = await fetch(`${API_BASE}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${requestToken}`
      },
      signal: requestController.signal
    });

    if (!isCurrentRequest(requestToken, requestController)) return;

    if (response.status === 401) {
      authStore.logout();
      await router.replace('/');
      return;
    }

    if (!response.ok) {
      throw new Error(`ไม่สามารถดึงข้อมูลโปรไฟล์ได้ (Error: ${response.status})`);
    }

    const data = await response.json();
    if (isCurrentRequest(requestToken, requestController)) {
      profile.value = data;
    }
  } catch (reason) {
    if (!isCurrentRequest(requestToken, requestController)) return;
    error.value = reason instanceof Error
      ? reason.message
      : 'ไม่สามารถดึงข้อมูลโปรไฟล์ได้';
  } finally {
    if (mounted && activeRequestController === requestController) {
      loading.value = false;
      activeRequestController = null;
    }
  }
}

function isCurrentRequest(requestToken, requestController) {
  return mounted
    && activeRequestController === requestController
    && authStore.token === requestToken;
}

function logout() {
  authStore.logout();
  router.replace('/');
}

onMounted(loadProfile);
onBeforeUnmount(() => {
  mounted = false;
  activeRequestController?.abort();
  activeRequestController = null;
});
</script>

<style scoped>
.profile-page {
  padding-block: clamp(2rem, 6vw, 5rem);
}

.profile-card {
  width: 100%;
  max-width: 44rem;
  margin: 0 auto;
  padding: clamp(1.25rem, 4vw, 2.5rem);
  background: var(--canvas-soft);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-lg);
}

.profile-header {
  padding-bottom: clamp(1.25rem, 3vw, 2rem);
  border-bottom: 1px solid var(--hairline-cool);
}

.profile-eyebrow {
  margin-bottom: var(--space-xs);
  color: var(--primary);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: 500;
}

.profile-header h1 {
  font-size: var(--text-3xl);
  font-weight: 600;
  overflow-wrap: anywhere;
  text-wrap: balance;
}

.profile-state {
  display: flex;
  min-height: 10rem;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: var(--space-lg);
  color: var(--ink-mute);
  line-height: 1.6;
}

.profile-error p {
  color: var(--danger);
  overflow-wrap: anywhere;
}

.profile-details {
  margin: 0;
}

.profile-details > div {
  display: grid;
  min-width: 0;
  gap: var(--space-xs);
  padding-block: var(--space-lg);
  border-bottom: 1px solid var(--hairline-cool);
}

.profile-details > div:last-child {
  border-bottom: none;
}

.profile-details dt {
  color: var(--ink-mute);
  font-size: var(--text-sm);
  font-weight: 500;
}

.profile-details dd {
  min-width: 0;
  margin: 0;
  color: var(--ink);
  overflow-wrap: anywhere;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  color: var(--primary);
  background: var(--primary-bg);
  border: 1px solid var(--primary-border);
  border-radius: var(--radius-full);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
}

.profile-state .btn,
.profile-danger-zone .btn {
  width: 100%;
  min-height: 44px;
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast);
}

.profile-state .btn:focus-visible,
.profile-danger-zone .btn:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 3px;
}

.profile-danger-zone {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--space-sm);
  padding-top: var(--space-xl);
  border-top: 1px solid var(--hairline-cool);
}

.profile-danger-zone .btn-outline-danger:hover {
  background: rgba(255, 34, 1, 0.08);
}

@media (min-width: 40rem) {
  .profile-details > div {
    grid-template-columns: minmax(8rem, 11rem) minmax(0, 1fr);
    align-items: center;
    column-gap: var(--space-xl);
  }

  .profile-details dd {
    text-align: right;
  }

  .profile-state .btn,
  .profile-danger-zone .btn {
    width: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .profile-state .btn,
  .profile-danger-zone .btn {
    transition: none;
  }
}
</style>
