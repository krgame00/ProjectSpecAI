<template>
  <div class="articles-view container">
    <div style="margin-bottom: 3rem; text-align: center;">
      <h2 style="font-size: var(--text-3xl); color: var(--accent); text-shadow: var(--accent-glow);">บทความและความรู้</h2>
      <p style="color: var(--muted); margin-top: 0.5rem; font-size: 1.1rem;">อัปเดตข่าวสารและเทคนิคการจัดสเปคคอมพิวเตอร์ล่าสุด</p>
    </div>

    <!-- Featured Article (Hero) -->
    <div v-if="featuredArticle" class="hero-article glass-panel" @click="$emit('read-article', featuredArticle)">
      <div class="hero-image">
        <img :src="featuredArticle.image_url || featuredArticle.image" :alt="featuredArticle.title" @error="$event.target.style.display='none'" />
        <div class="hero-badge">ล่าสุด</div>
      </div>
      <div class="hero-content">
        <div class="article-date">{{ featuredArticle.created_at ? new Date(featuredArticle.created_at).toLocaleDateString() : featuredArticle.date }}</div>
        <h2 class="hero-title">{{ featuredArticle.title }}</h2>
        <div class="article-excerpt hero-excerpt" v-html="featuredArticle.content"></div>
        <div class="read-more-link">อ่านต่อ ➔</div>
      </div>
    </div>

    <!-- Grid Articles -->
    <div class="articles-grid" v-if="gridArticles.length > 0">
      <div v-for="article in gridArticles" :key="article.id" class="article-card glass-panel" @click="$emit('read-article', article)">
        <div class="article-image">
          <img :src="article.image_url || article.image" :alt="article.title" @error="$event.target.style.display='none'" />
        </div>
        <div class="article-content">
          <div class="article-date">{{ article.created_at ? new Date(article.created_at).toLocaleDateString() : article.date }}</div>
          <h3 class="article-title">{{ article.title }}</h3>
          <div class="article-excerpt" v-html="article.content"></div>
          <div class="read-more-link" style="margin-top: auto;">อ่านต่อ ➔</div>
        </div>
      </div>
    </div>
    
    <div v-if="!articles || articles.length === 0" style="text-align: center; color: var(--muted); padding: 3rem;">
      ยังไม่มีบทความในขณะนี้
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  articles: Array
});

defineEmits(['read-article']);

const featuredArticle = computed(() => {
  if (!props.articles || props.articles.length === 0) return null;
  return props.articles[0];
});

const gridArticles = computed(() => {
  if (!props.articles || props.articles.length <= 1) return [];
  return props.articles.slice(1);
});
</script>

<style scoped>
.articles-view {
  padding-top: 3rem;
  padding-bottom: 5rem;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Hero Article */
.hero-article {
  display: flex;
  flex-direction: column;
  margin-bottom: 3rem;
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-base);
}
@media (min-width: 768px) {
  .hero-article {
    flex-direction: row;
    height: 400px;
  }
}
.hero-article:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.6);
  border-color: var(--accent);
}
.hero-image {
  flex: 1;
  position: relative;
  overflow: hidden;
}
.hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}
.hero-article:hover .hero-image img {
  transform: scale(1.05);
}
.hero-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: var(--accent);
  color: #fff;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
  box-shadow: 0 4px 10px rgba(var(--accent-rgb), 0.4);
}
.hero-content {
  flex: 1;
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: linear-gradient(135deg, rgba(20, 20, 25, 0.9), rgba(10, 10, 12, 0.9));
}
.hero-title {
  font-size: var(--text-2xl);
  font-weight: 800;
  margin: 1rem 0;
  line-height: 1.3;
  color: var(--fg);
}
.hero-excerpt {
  -webkit-line-clamp: 4;
  font-size: 1.05rem;
  margin-bottom: 2rem;
}

/* Grid Articles */
.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-xl);
}
.article-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-base);
}
.article-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.5);
  border-color: var(--accent);
}
.article-image {
  width: 100%;
  height: 220px;
  overflow: hidden;
  background: var(--bg);
}
.article-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}
.article-card:hover .article-image img {
  transform: scale(1.05);
}
.article-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
}

/* Common Typography & Elements */
.article-date {
  font-size: var(--text-xs);
  color: var(--accent);
  font-family: var(--font-mono);
  font-weight: 600;
  letter-spacing: 1px;
}
.article-title {
  font-size: var(--text-lg);
  font-weight: 700;
  line-height: 1.4;
  color: var(--fg);
  transition: color var(--transition-base);
}
.article-card:hover .article-title, .hero-article:hover .hero-title {
  color: var(--accent);
}
.article-excerpt {
  font-size: var(--text-sm);
  color: var(--muted);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.read-more-link {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--accent);
  display: inline-flex;
  align-items: center;
  transition: opacity 0.2s;
}
.article-card:hover .read-more-link, .hero-article:hover .read-more-link {
  opacity: 0.8;
}
</style>
