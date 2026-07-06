<template>
  <div class="landing-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <div class="badge">✨ New: AI-Powered Builder</div>
        <h1 class="hero-title">Build Your Dream PC,<br>Powered by AI.</h1>
        <p class="hero-subtitle">
          จัดสเปคคอมพิวเตอร์แบบอัจฉริยะ ตรวจสอบความเข้ากันได้แบบ Real-time พร้อมผู้ช่วย AI ที่ช่วยคุณเลือกฮาร์ดแวร์ที่ดีที่สุดตามงบประมาณและการใช้งานของคุณ
        </p>
        <div class="hero-actions">
          <router-link to="/build" class="btn btn-primary btn-lg pulse-effect">
            เริ่มจัดสเปคเลย
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 8px;"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </router-link>
          <a href="#features" class="btn btn-outline btn-lg">ดูฟีเจอร์ทั้งหมด</a>
        </div>
      </div>
      
      <div class="hero-3d-scene">
        <div class="card-3d card-cpu">
          <div class="card-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
          </div>
          <div class="card-info">
            <div class="card-title">Core i9 Processor</div>
            <div class="card-desc">24 Cores / 32 Threads</div>
          </div>
        </div>
        
        <div class="card-3d card-gpu">
          <div class="card-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line><path d="M7 15h.01"></path><path d="M12 15h.01"></path><path d="M17 15h.01"></path></svg>
          </div>
          <div class="card-info">
            <div class="card-title">RTX 4090 GPU</div>
            <div class="card-desc">24GB GDDR6X</div>
          </div>
        </div>

        <div class="card-3d card-ram">
          <div class="card-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="10" rx="2"></rect><path d="M6 7v10"></path><path d="M10 7v10"></path><path d="M14 7v10"></path><path d="M18 7v10"></path></svg>
          </div>
          <div class="card-info">
            <div class="card-title">64GB DDR5 RAM</div>
            <div class="card-desc">6000MHz CL30</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="features">
      <div class="section-header">
        <h2 class="section-title">Why Use PCSpec?</h2>
        <p class="section-subtitle">ฟีเจอร์ที่ออกแบบมาเพื่อให้การประกอบคอมพิวเตอร์เป็นเรื่องง่าย</p>
      </div>
      
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">⚡</div>
          <h3>Smart Compatibility</h3>
          <p>ระบบตรวจสอบความเข้ากันได้แบบเรียลไทม์ ซ็อกเก็ต CPU/Mobo, แรม DDR4/5 และคำนวณกำลังไฟ PSU อัตโนมัติ</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🤖</div>
          <h3>SpecAI Assistant</h3>
          <p>แชตบอตผู้ช่วยส่วนตัว เพียงแค่บอกงบประมาณและสายงาน AI จะจัดเซ็ตที่คุ้มค่าที่สุดให้คุณในพริบตา</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📦</div>
          <h3>Live Catalog</h3>
          <p>ข้อมูลสินค้า ราคา และรูปภาพกว่า 270+ รายการ อัปเดตล่าสุดจากฐานข้อมูลโดยตรง</p>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-content">
        <div class="brand">PCSpec</div>
        <div class="copyright">© 2026 PCSpec. All rights reserved.</div>
      </div>
    </footer>
  </div>
</template>

<script setup>
// Landing page uses standard vue router links
</script>

<style scoped>
.landing-page {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 70px);
  background-color: var(--canvas);
}

/* Hero Section */
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 6rem 2rem 4rem;
  background: radial-gradient(circle at center, rgba(62, 207, 142, 0.08) 0%, var(--canvas) 70%);
  border-bottom: 1px solid var(--hairline);
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: -20%;
  left: 50%;
  transform: translateX(-50%);
  width: 80vw;
  height: 80vw;
  background: radial-gradient(circle, rgba(62,207,142,0.1) 0%, rgba(17,17,17,0) 70%);
  z-index: 0;
  pointer-events: none;
}

.hero-content {
  max-width: 800px;
  position: relative;
  z-index: 1;
}

.badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: rgba(62,207,142,0.1);
  color: var(--primary-deep);
  border: 1px solid rgba(62,207,142,0.2);
  border-radius: var(--radius-pill);
  font-size: var(--text-sm);
  font-weight: 500;
  margin-bottom: 2rem;
}

.hero-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  line-height: 1.1;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 1.5rem;
  letter-spacing: -0.02em;
}

.hero-subtitle {
  font-size: var(--text-lg);
  color: var(--ink-mute);
  line-height: 1.6;
  margin-bottom: 2.5rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-lg {
  padding: 0.8rem 1.5rem;
  font-size: 1.1rem;
  display: inline-flex;
  align-items: center;
}

.pulse-effect {
  position: relative;
}
.pulse-effect::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  border-radius: inherit;
  box-shadow: 0 0 0 0 rgba(62,207,142,0.4);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(62,207,142,0.4); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(62,207,142,0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(62,207,142,0); }
}

/* 3D Scene */
.hero-3d-scene {
  margin-top: 5rem;
  width: 100%;
  max-width: 800px;
  height: 300px;
  position: relative;
  z-index: 1;
  perspective: 1200px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.card-3d {
  position: absolute;
  background: var(--canvas-soft);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  width: 260px;
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  backdrop-filter: blur(8px);
}

.card-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-md);
  background: var(--canvas);
  border: 1px solid var(--hairline);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
}

.card-title {
  font-weight: 600;
  color: var(--ink);
  font-size: 1.1rem;
}

.card-desc {
  color: var(--ink-mute);
  font-size: 0.85rem;
}

.card-cpu {
  transform: rotateX(15deg) rotateY(-20deg) translateZ(0px) translateX(-180px) translateY(20px);
  animation: float-1 6s ease-in-out infinite;
  z-index: 2;
}

.card-gpu {
  transform: rotateX(15deg) rotateY(0deg) translateZ(50px) translateY(-30px);
  animation: float-2 7s ease-in-out infinite;
  background: var(--canvas);
  border-color: var(--primary-alpha);
  box-shadow: 0 16px 32px rgba(62, 207, 142, 0.1);
  z-index: 3;
}

.card-ram {
  transform: rotateX(15deg) rotateY(20deg) translateZ(-50px) translateX(180px) translateY(40px);
  animation: float-3 5.5s ease-in-out infinite;
  z-index: 1;
}

@keyframes float-1 {
  0%, 100% { transform: rotateX(15deg) rotateY(-20deg) translateZ(0px) translateX(-180px) translateY(20px); }
  50% { transform: rotateX(15deg) rotateY(-20deg) translateZ(0px) translateX(-180px) translateY(5px); }
}

@keyframes float-2 {
  0%, 100% { transform: rotateX(15deg) rotateY(0deg) translateZ(50px) translateY(-30px); }
  50% { transform: rotateX(15deg) rotateY(0deg) translateZ(50px) translateY(-15px); }
}

@keyframes float-3 {
  0%, 100% { transform: rotateX(15deg) rotateY(20deg) translateZ(-50px) translateX(180px) translateY(40px); }
  50% { transform: rotateX(15deg) rotateY(20deg) translateZ(-50px) translateX(180px) translateY(25px); }
}

/* Features Section */
.features {
  padding: 6rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 1rem;
}

.section-subtitle {
  font-size: var(--text-lg);
  color: var(--ink-mute);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  padding: 2.5rem;
  background: var(--canvas-soft);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-lg);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  background: var(--canvas);
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  border: 1px solid var(--hairline);
}

.feature-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--ink);
}

.feature-card p {
  color: var(--ink-mute);
  line-height: 1.6;
}

/* Footer */
.footer {
  margin-top: auto;
  border-top: 1px solid var(--hairline);
  padding: 2rem;
  background: var(--canvas-soft);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--ink);
  letter-spacing: -0.5px;
}

.copyright {
  color: var(--ink-mute);
  font-size: var(--text-sm);
}

@media (max-width: 768px) {
  .hero-title { font-size: 2.5rem; }
  .hero-actions { flex-direction: column; }
  .hero-3d-scene { height: auto; flex-direction: column; gap: 1rem; perspective: none; }
  .card-cpu, .card-gpu, .card-ram { position: relative; transform: none !important; animation: none; width: 100%; max-width: 300px; }
  .footer-content { flex-direction: column; gap: 1rem; text-align: center; }
}
</style>
