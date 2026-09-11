<template>
  <main class="articles-view container" data-route-focus tabindex="-1" aria-labelledby="articles-title">
    <header class="articles-header">
      <h1 id="articles-title">บทความและความรู้</h1>
      <p>อัปเดตข่าวสารและเทคนิคการจัดสเปคคอมพิวเตอร์ล่าสุด</p>
    </header>

    <section v-if="articlesLoading" class="articles-skeleton" role="status" aria-live="polite">
      <span class="sr-only">กำลังโหลดบทความ</span>
      <div class="skeleton-feature" aria-hidden="true">
        <span class="skeleton-block skeleton-image"></span>
        <span class="skeleton-copy"></span>
      </div>
      <div class="skeleton-grid" aria-hidden="true">
        <span v-for="item in 3" :key="item" class="skeleton-block skeleton-card"></span>
      </div>
    </section>

    <section v-else-if="articlesError" class="articles-state" role="alert">
      <h2>โหลดบทความไม่สำเร็จ</h2>
      <p>{{ articlesError }}</p>
      <button class="btn btn-primary" type="button" data-test="articles-retry" @click="$emit('retry-articles')">
        ลองอีกครั้ง
      </button>
    </section>

    <section v-else-if="articles.length === 0" class="articles-state" data-test="articles-empty">
      <h2>ยังไม่มีบทความ</h2>
      <p>บทความและเคล็ดลับใหม่จะปรากฏที่นี่</p>
    </section>

    <template v-else>
      <RouterLink
        class="hero-article"
        :to="{ name: 'article-detail', params: { id: featuredArticle.id } }"
      >
        <div class="hero-image">
          <img
            v-if="coverVisible(featuredArticle)"
            :src="articleImage(featuredArticle)"
            :alt="featuredArticle.title"
            @error="markCoverFailed(featuredArticle)"
          />
          <div
            v-else
            class="article-image-fallback"
            role="img"
            :aria-label="`ไม่มีภาพปกสำหรับ ${featuredArticle.title}`"
          >
            PCSpec
          </div>
          <span class="hero-badge">ล่าสุด</span>
        </div>
        <div class="hero-content">
          <time :datetime="articleDateTime(featuredArticle.created_at || featuredArticle.date)">{{ formatArticleDate(featuredArticle.created_at || featuredArticle.date) }}</time>
          <h2>{{ featuredArticle.title }}</h2>
          <p class="article-excerpt hero-excerpt">{{ articleExcerpt(featuredArticle.content) }}</p>
          <span class="read-more-link">อ่านต่อ →</span>
        </div>
      </RouterLink>

      <section v-if="gridArticles.length" class="articles-grid" aria-labelledby="articles-grid-heading">
        <h2 id="articles-grid-heading" class="sr-only">บทความเพิ่มเติม</h2>
        <RouterLink
          v-for="article in gridArticles"
          :key="article.id"
          class="article-card"
          :to="{ name: 'article-detail', params: { id: article.id } }"
        >
          <div class="article-image">
            <img
              v-if="coverVisible(article)"
              :src="articleImage(article)"
              :alt="article.title"
              @error="markCoverFailed(article)"
            />
            <div
              v-else
              class="article-image-fallback"
              role="img"
              :aria-label="`ไม่มีภาพปกสำหรับ ${article.title}`"
            >
              PCSpec
            </div>
          </div>
          <div class="article-content">
            <time :datetime="articleDateTime(article.created_at || article.date)">{{ formatArticleDate(article.created_at || article.date) }}</time>
            <h3>{{ article.title }}</h3>
            <p class="article-excerpt">{{ articleExcerpt(article.content) }}</p>
            <span class="read-more-link">อ่านต่อ →</span>
          </div>
        </RouterLink>
      </section>
    </template>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import { articleDateTime, articleExcerpt, formatArticleDate } from '../utils/articleContent'

const props = defineProps({
  articles: {
    type: Array,
    default: () => []
  },
  articlesLoading: {
    type: Boolean,
    default: false
  },
  articlesError: {
    type: String,
    default: null
  }
})

defineEmits(['retry-articles'])

const failedCovers = ref(new Map())
const featuredArticle = computed(() => props.articles[0])
const gridArticles = computed(() => props.articles.slice(1))
const articleImage = article => article.image_url || article.image || ''
const coverVisible = article => {
  const image = articleImage(article)
  return Boolean(image) && failedCovers.value.get(article.id) !== image
}
const markCoverFailed = article => failedCovers.value.set(article.id, articleImage(article))
</script>

<style scoped>
.articles-view {
  padding-block: var(--space-xxl) var(--space-huge);
}

.articles-view:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: -2px;
}

.articles-header {
  max-width: 44rem;
  margin-bottom: var(--space-xxl);
}

.articles-header h1 {
  font-size: var(--text-2xl);
  font-weight: 500;
  letter-spacing: -0.02em;
  text-wrap: balance;
}

.articles-header p,
.articles-state p {
  max-width: 65ch;
  margin-top: var(--space-sm);
  color: var(--ink-mute);
  line-height: 1.65;
  text-wrap: pretty;
}

.articles-state {
  display: flex;
  min-height: 15rem;
  padding: var(--space-xl);
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  border: 1px solid var(--hairline);
  border-radius: var(--radius-lg);
  background: var(--canvas-soft);
}

.articles-state .btn {
  min-height: 44px;
  margin-top: var(--space-xl);
}

.hero-article,
.article-card {
  color: var(--ink);
  text-decoration: none;
  border: 1px solid var(--hairline);
  border-radius: var(--radius-lg);
  background: var(--canvas);
  overflow: hidden;
  transition: border-color var(--transition-normal), background-color var(--transition-normal);
}

.hero-article {
  display: flex;
  margin-bottom: var(--space-xxl);
  flex-direction: column;
}

.hero-image,
.article-image {
  position: relative;
  overflow: hidden;
  background: var(--canvas-soft);
}

.hero-image {
  min-height: 0;
  max-height: 18rem;
  aspect-ratio: 16 / 10;
  flex: none;
}

.hero-image img,
.article-image img,
.article-image-fallback {
  width: 100%;
  height: 100%;
}

.hero-image img,
.article-image img {
  object-fit: cover;
  transition: transform var(--transition-normal);
}

.article-image-fallback {
  display: grid;
  min-height: inherit;
  place-items: center;
  color: var(--ink-mute);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  letter-spacing: 0.08em;
  background: var(--canvas-soft);
}

.hero-badge {
  position: absolute;
  top: var(--space-md);
  left: var(--space-md);
  padding: var(--space-xxs) var(--space-sm);
  border-radius: var(--radius-full);
  background: var(--primary);
  color: var(--on-primary);
  font-size: var(--text-xs);
  font-weight: 600;
}

.hero-content,
.article-content {
  display: flex;
  padding: var(--space-xl);
  flex-direction: column;
  align-items: flex-start;
}

.hero-content time,
.article-content time {
  color: var(--ink-mute);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
}

.hero-content h2,
.article-content h3 {
  margin-top: var(--space-md);
  font-weight: 500;
  text-wrap: balance;
  transition: color var(--transition-fast);
}

.hero-content h2 {
  font-size: var(--text-xl);
}

.article-content h3 {
  font-size: var(--text-lg);
}

.article-excerpt {
  display: -webkit-box;
  margin-top: var(--space-md);
  overflow: hidden;
  color: var(--ink-mute);
  font-size: var(--text-sm);
  line-height: 1.65;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.hero-excerpt {
  -webkit-line-clamp: 4;
}

.read-more-link {
  margin-top: var(--space-xl);
  color: var(--primary);
  font-size: var(--text-sm);
  font-weight: 600;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 17rem), 1fr));
  gap: var(--space-lg);
}

.article-card {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.article-image {
  min-height: 12rem;
  aspect-ratio: 16 / 10;
}

.article-content {
  flex: 1;
}

.article-content .read-more-link {
  margin-top: auto;
  padding-top: var(--space-xl);
}

.hero-article:focus,
.hero-article:focus-visible,
.article-card:focus,
.article-card:focus-visible {
  border-color: var(--primary);
  outline: 2px solid var(--primary);
  outline-offset: 3px;
}

.articles-skeleton {
  display: grid;
  gap: var(--space-lg);
}

.skeleton-feature,
.skeleton-grid {
  display: grid;
  gap: var(--space-lg);
}

.skeleton-feature {
  min-height: 22rem;
  padding: var(--space-lg);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-lg);
}

.skeleton-block,
.skeleton-copy {
  display: block;
  border-radius: var(--radius-md);
  background: var(--canvas-soft);
  animation: skeleton-pulse 1.4s ease-in-out infinite alternate;
}

.skeleton-image {
  min-height: 13rem;
}

.skeleton-copy {
  min-height: 8rem;
}

.skeleton-grid {
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 17rem), 1fr));
}

.skeleton-card {
  min-height: 20rem;
  border: 1px solid var(--hairline);
}

@keyframes skeleton-pulse {
  from { opacity: 0.55; }
  to { opacity: 1; }
}

@media (min-width: 48rem) {
  .articles-view {
    padding-top: var(--space-huge);
  }

  .hero-article,
  .skeleton-feature {
    grid-template-columns: minmax(0, 1.25fr) minmax(18rem, 0.75fr);
  }

  .hero-article {
    display: grid;
    min-height: 24rem;
  }

  .hero-image {
    min-height: 24rem;
    max-height: none;
    aspect-ratio: auto;
  }

  .hero-content {
    justify-content: center;
    border-left: 1px solid var(--hairline);
  }

  .skeleton-feature {
    display: grid;
  }
}

@media (hover: hover) {
  .hero-article:hover,
  .article-card:hover {
    border-color: var(--hairline-strong);
    background: var(--canvas-soft);
    text-decoration: none;
  }

  .hero-article:hover h2,
  .article-card:hover h3 {
    color: var(--primary);
  }

  .hero-article:hover img,
  .article-card:hover img {
    transform: scale(1.02);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-article,
  .article-card,
  .hero-image img,
  .article-image img {
    transition: none;
  }

  .skeleton-block,
  .skeleton-copy {
    animation: none;
  }
}
</style>
