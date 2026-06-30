<template>
  <div class="article-detail-view" v-if="article">
    <!-- Hero Image Section with Navigation -->
    <div class="hero-header">
      <div class="back-nav container">
        <button class="btn btn-outline btn-sm back-btn" @click="$emit('go-back')">
          ← กลับไปหน้าบทความ
        </button>
      </div>
      <img 
        :src="article.image_url || article.image" 
        :alt="article.title" 
        class="hero-img"
        @error="$event.target.style.display='none'"
      />
      <div class="hero-overlay"></div>
    </div>

    <!-- Article Content -->
    <div class="article-body-container container">
      <div class="article-meta">
        <span class="article-date">{{ article.created_at ? new Date(article.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) : article.date }}</span>
        <span class="article-category">| เทคนิคและรีวิว</span>
      </div>
      
      <h1 class="article-title">{{ article.title }}</h1>
      
      <div class="article-content" v-html="article.content"></div>
      
      <div class="article-footer">
        <button class="btn btn-primary" @click="$emit('go-back')">กลับไปอ่านบทความอื่น</button>
      </div>
    </div>
  </div>
  <div v-else class="container" style="text-align: center; padding: 5rem; color: var(--muted);">
    ไม่พบบทความ หรือกำลังโหลด...
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';

const props = defineProps({
  article: {
    type: Object,
    required: true
  }
});
const emit = defineEmits(['go-back']);

const handleKeydown = (e) => {
  if (e.key === 'Escape') emit('go-back');
};

onMounted(() => window.addEventListener('keydown', handleKeydown));
onUnmounted(() => window.removeEventListener('keydown', handleKeydown));
</script>

<style scoped>
.article-detail-view {
  animation: fadeIn 0.4s ease-out;
  padding-bottom: 5rem;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Navigation */
.back-nav {
  padding: 1.5rem 0;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 10;
}
.back-btn {
  border-radius: var(--radius-full);
  padding: 0.5rem 1.5rem;
  font-weight: 600;
  background: rgba(10, 10, 12, 0.8);
  backdrop-filter: blur(10px);
  outline: none;
  transition: all var(--transition-base);
}
.back-btn:hover {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}
.back-btn:focus-visible {
  box-shadow: 0 0 0 2px var(--bg), 0 0 0 4px var(--accent);
}

/* Hero Section */
.hero-header {
  position: relative;
  width: 100%;
  height: 45vh;
  min-height: 400px;
  max-height: 600px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-alt);
}
.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}
.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(10,10,12,0.1) 0%, rgba(10,10,12,0.8) 80%, var(--bg) 100%);
  z-index: 2;
}

/* Article Body */
.article-body-container {
  position: relative;
  z-index: 3;
  max-width: 800px;
  margin: 0 auto;
  margin-top: -40px; /* Pull content slightly up into the gradient */
  background: var(--bg);
  padding: var(--space-lg) var(--space-md);
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04);
}
@media (min-width: 768px) {
  .article-body-container {
    margin-top: -80px;
    padding: var(--space-xl) var(--space-xl);
  }
}

.article-meta {
  font-size: 0.95rem;
  color: var(--muted);
  margin-bottom: var(--space-sm);
  font-family: var(--font-mono);
}
.article-category {
  color: var(--accent);
  margin-left: var(--space-xs);
}

.article-title {
  font-size: var(--text-3xl);
  line-height: 1.3;
  font-weight: 800;
  color: var(--fg);
  margin-bottom: var(--space-xl);
}
@media (min-width: 768px) {
  .article-title {
    font-size: 2.5rem;
  }
}

.article-content {
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--fg);
}

.article-content :deep(strong) {
  color: var(--accent);
  font-weight: 700;
}
.article-content :deep(p) {
  margin-bottom: var(--space-md);
}
.article-content :deep(h2), .article-content :deep(h3) {
  color: var(--fg);
  margin-top: var(--space-xl);
  margin-bottom: var(--space-sm);
}
.article-content :deep(ul) {
  margin-bottom: var(--space-md);
  padding-left: var(--space-md);
}
.article-content :deep(li) {
  margin-bottom: var(--space-xs);
}

.article-footer {
  margin-top: var(--space-xl);
  padding-top: var(--space-lg);
  border-top: 1px solid rgba(255,255,255,0.1);
  text-align: center;
}
</style>
