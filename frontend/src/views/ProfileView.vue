<template>
  <div class="container profile-container">
    <div class="profile-card">
      <h2 class="profile-title">ข้อมูลโปรไฟล์ (Profile)</h2>
      
      <div v-if="loading" class="text-center loading-text">
        กำลังโหลดข้อมูล...
      </div>
      
      <div v-else-if="error" class="text-center error-text">
        {{ error }}
      </div>
      
      <div v-else>
        <div class="profile-info">
          <p><strong>ชื่อผู้ใช้งาน:</strong> <span>{{ profile.name }}</span></p>
          <p><strong>อีเมล:</strong> <span>{{ profile.email }}</span></p>
          <p><strong>สถานะบัญชี:</strong> <span class="badge">{{ profile.role }}</span></p>
          <p><strong>วันที่สมัคร:</strong> <span>{{ profile.created_at ? new Date(profile.created_at).toLocaleDateString('th-TH') : '-' }}</span></p>
        </div>
        
        <div class="logout-wrapper">
          <button class="btn btn-outline-danger" @click="logout">ออกจากระบบ</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const profile = ref({});
const loading = ref(true);
const error = ref('');

const API_BASE = 'http://localhost:3000/api';

onMounted(async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('ไม่สามารถดึงข้อมูลโปรไฟล์ได้ (Session อาจหมดอายุ)');
    }

    const data = await response.json();
    profile.value = data;
  } catch (err) {
    error.value = err.message;
    console.error('Profile fetch error:', err);
    // Only redirect if it's an auth error, not a random network error
    if (err.message.includes('Session')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setTimeout(() => router.push('/'), 2000);
    }
  } finally {
    loading.value = false;
  }
});

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/'; // Force reload to clear App.vue state
};
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
