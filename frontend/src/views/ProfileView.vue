<template>
  <div class="container profile-container">
    <div class="profile-card">
      <h2 class="profile-title">ข้อมูลโปรไฟล์ (Profile)</h2>
      
      <div v-if="loading" class="text-center loading-text">
        กำลังโหลดข้อมูล...
      </div>
      
      <div v-else-if="error" class="text-center error-text">
        <p>{{ error }}</p>
        <button
          class="btn btn-outline-danger"
          data-test="profile-retry"
          type="button"
          @click="loadProfile"
        >
          ลองอีกครั้ง
        </button>
      </div>
      
      <div v-else-if="profile">
        <div class="profile-info">
          <p><strong>ชื่อผู้ใช้งาน:</strong> <span>{{ profile.name }}</span></p>
          <p><strong>อีเมล:</strong> <span>{{ profile.email }}</span></p>
          <p><strong>สถานะบัญชี:</strong> <span class="badge">{{ profile.role }}</span></p>
          <p><strong>วันที่สมัคร:</strong> <span>{{ profile.created_at ? new Date(profile.created_at).toLocaleDateString('th-TH') : '-' }}</span></p>
        </div>
        
        <div class="logout-wrapper">
          <button
            class="btn btn-outline-danger"
            data-test="profile-sign-out"
            type="button"
            @click="logout"
          >
            ออกจากระบบ
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const profile = ref(null);
const loading = ref(true);
const error = ref(null);

const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.PROD ? 'https://projectspecai.onrender.com/api/v1' : 'http://localhost:3001/api/v1');

async function loadProfile() {
  if (!authStore.token) {
    await router.replace('/');
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const response = await fetch(`${API_BASE}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    });

    if (response.status === 401) {
      authStore.logout();
      await router.replace('/');
      return;
    }

    if (!response.ok) {
      throw new Error(`ไม่สามารถดึงข้อมูลโปรไฟล์ได้ (Error: ${response.status})`);
    }

    profile.value = await response.json();
  } catch (reason) {
    error.value = reason instanceof Error
      ? reason.message
      : 'ไม่สามารถดึงข้อมูลโปรไฟล์ได้';
  } finally {
    loading.value = false;
  }
}

function logout() {
  authStore.logout();
  router.replace('/');
}

onMounted(loadProfile);
</script>

<style scoped>
.profile-container {
  padding-top: 4rem;
}

.profile-card {
  padding: 2.5rem;
  max-width: 600px;
  margin: 0 auto;
  background: var(--canvas);
  border-radius: var(--radius-lg);
  border: 1px solid var(--hairline);
  box-shadow: var(--shadow-sm);
}

.profile-title {
  margin-bottom: 2rem;
  font-weight: 600;
  color: var(--ink);
}

.loading-text {
  color: var(--ink-mute);
}

.error-text {
  color: var(--danger);
}

.logout-wrapper {
  margin-top: 2.5rem;
  text-align: center;
}

.profile-info p {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1rem;
  color: var(--ink);
  margin-bottom: 0;
  padding: 1rem 0;
  border-bottom: 1px solid var(--hairline-cool);
}
.profile-info p:last-child {
  border-bottom: none;
}
.profile-info strong {
  font-weight: 500;
  color: var(--ink-mute);
}
.badge {
  background: var(--primary-bg);
  color: var(--primary-deep);
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  border: 1px solid var(--primary-border);
}
.text-center { text-align: center; }
.btn-danger {
  background: var(--danger);
  color: #fff;
  border: 1px solid var(--danger);
  padding: 0.6rem 2rem;
  border-radius: var(--radius-md);
  font-weight: 500;
}
.btn-danger:hover {
  background: var(--danger);
  opacity: 0.9;
}
.btn-outline-danger {
  background: transparent;
  color: var(--danger);
  border: 1px solid var(--danger);
  padding: 0.6rem 2rem;
  border-radius: var(--radius-md);
  font-weight: 500;
  transition: all var(--transition-fast);
}
.btn-outline-danger:hover {
  background: rgba(255, 34, 1, 0.1);
}
</style>
