<template>
  <main class="not-found-container" role="main">
    <div class="not-found-card hairline-border">
      <div class="not-found-badge">404 ERROR</div>
      <h1 class="not-found-title">ไม่พบหน้าที่คุณต้องการ</h1>
      <p class="not-found-desc">
        ขออภัย ลิงก์ที่คุณเปิดอาจไม่มีอยู่จริง ถูกย้าย หรือพิมพ์ URL ผิด
      </p>

      <div class="not-found-actions">
        <router-link to="/" class="btn btn-primary" id="btn-home-404">
          🏠 กลับหน้าแรก (Home)
        </router-link>
        <router-link to="/build" class="btn btn-outline" id="btn-build-404">
          ⚙️ ไปหน้าจัดสเปค (PC Builder)
        </router-link>
      </div>
    </div>
  </main>
</template>

<script setup>
</script>

<style scoped>
.not-found-container {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.not-found-card {
  max-width: 520px;
  width: 100%;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg, 12px);
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
}

.not-found-badge {
  display: inline-block;
  font-family: var(--font-mono, monospace);
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--accent);
  background: rgba(62, 207, 142, 0.12);
  border: 1px solid rgba(62, 207, 142, 0.25);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  margin-bottom: 1.5rem;
}

.not-found-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 0.75rem;
}

.not-found-desc {
  color: var(--muted);
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.not-found-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.not-found-actions .btn {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1.25rem;
  font-weight: 600;
  text-decoration: none;
  border-radius: var(--radius-md, 8px);
}
</style>
