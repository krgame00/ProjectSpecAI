<template>
  <div class="articles-view container">
    <div style="margin-bottom: 3rem; text-align: center;">
      <h2 style="font-size: var(--text-3xl); font-weight: 700; color: var(--ink);">บทความและความรู้</h2>
      <p style="color: var(--ink-mute); margin-top: 0.5rem; font-size: 1.1rem;">อัปเดตข่าวสารและเทคนิคการจัดสเปคคอมพิวเตอร์ล่าสุด</p>
    </div>

    <!-- Featured Article (Hero) -->
    <div v-if="featuredArticle" class="hero-article" @click="$emit('read-article', featuredArticle)">
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
      <div v-for="article in gridArticles" :key="article.id" class="article-card" @click="$emit('read-article', article)">
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
    
    <div v-if="!articles || articles.length === 0" style="text-align: center; color: var(--ink-mute); padding: 3rem;">
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
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.hero-article {
  display: flex; flex-direction: column; margin-bottom: 3rem;
  border-radius: var(--radius-lg); overflow: hidden; cursor: pointer;
  background: var(--canvas); border: 1px solid var(--hairline);
  box-shadow: var(--shadow-sm); transition: all var(--transition-normal);
}
@media (min-width: 768px) {
  .hero-article { flex-direction: row; height: 400px; }
}
.hero-article:hover {
  transform: translateY(-2px); box-shadow: var(--shadow-md); border-color: var(--hairline-strong);
}
.hero-image { flex: 1; position: relative; overflow: hidden; }
.hero-image img {
  width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease;
}
.hero-article:hover .hero-image img { transform: scale(1.03); }
.hero-badge {
  position: absolute; top: 1rem; left: 1rem; background: var(--primary); color: var(--on-primary);
  padding: 0.25rem 0.75rem; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 600;
  text-transform: uppercase; box-shadow: var(--shadow-sm);
}
.hero-content {
  flex: 1; padding: 2.5rem; display: flex; flex-direction: column; justify-content: center;
  background: var(--canvas-soft); border-left: 1px solid var(--hairline);
}
.hero-title {
  font-size: var(--text-2xl); font-weight: 700; margin: 1rem 0; line-height: 1.3; color: var(--ink);
}
.hero-excerpt { -webkit-line-clamp: 4; font-size: 1.05rem; margin-bottom: 2rem; color: var(--ink-mute); }

.articles-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: var(--space-xl); }
.article-card {
  display: flex; flex-direction: column; overflow: hidden; border-radius: var(--radius-lg);
  cursor: pointer; background: var(--canvas); border: 1px solid var(--hairline);
  box-shadow: var(--shadow-xs); transition: all var(--transition-normal);
}
.article-card:hover {
  transform: translateY(-2px); box-shadow: var(--shadow-md); border-color: var(--hairline-strong);
}
.article-image { width: 100%; height: 220px; overflow: hidden; background: var(--canvas-soft); }
.article-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
.article-card:hover .article-image img { transform: scale(1.03); }
.article-content { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; flex: 1; }

.article-date {
  font-size: var(--text-xs); color: var(--primary-deep); font-family: var(--font-sans); font-weight: 600; letter-spacing: 1px;
}
.article-title {
  font-size: var(--text-lg); font-weight: 600; line-height: 1.4; color: var(--ink); transition: color var(--transition-fast);
}
.article-card:hover .article-title, .hero-article:hover .hero-title { color: var(--primary-deep); }
.article-excerpt {
  font-size: var(--text-sm); color: var(--ink-mute); line-height: 1.6;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}
.read-more-link {
  font-size: 0.85rem; font-weight: 600; color: var(--primary-deep); display: inline-flex; align-items: center; transition: opacity 0.2s;
}
.article-card:hover .read-more-link, .hero-article:hover .read-more-link { opacity: 0.8; }
</style>
