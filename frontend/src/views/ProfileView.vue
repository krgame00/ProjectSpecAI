<template>
  <div class="container" style="padding-top: 4rem;">
    <div class="glass-panel" style="padding: 2rem; max-width: 600px; margin: 0 auto;">
      <h2 style="margin-bottom: 1.5rem;">ข้อมูลโปรไฟล์ (Profile)</h2>
      
      <div v-if="loading" class="text-center">
        กำลังโหลดข้อมูล...
      </div>
      
      <div v-else-if="error" class="text-danger text-center">
        {{ error }}
      </div>
      
      <div v-else>
        <div class="profile-info">
          <p><strong>ชื่อผู้ใช้งาน:</strong> {{ profile.name }}</p>
          <p><strong>อีเมล:</strong> {{ profile.email }}</p>
          <p><strong>สถานะบัญชี:</strong> <span class="badge">{{ profile.role }}</span></p>
          <p><strong>วันที่สมัคร:</strong> {{ new Date(profile.created_at).toLocaleDateString('th-TH') }}</p>
        </div>
        
        <div style="margin-top: 2rem; text-align: center;">
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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setTimeout(() => router.push('/'), 2000);
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
.profile-info p {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.badge {
  background: var(--accent);
  color: #fff;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-size: 0.9rem;
  text-transform: uppercase;
}
.text-center { text-align: center; }
.text-danger { color: #ff4d4f; }
</style>
