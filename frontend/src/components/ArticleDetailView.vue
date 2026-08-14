<template>
  <main v-if="articlesLoading" class="article-state" role="status" aria-live="polite">
    <p>กำลังโหลดบทความ</p>
  </main>

  <main v-else-if="articlesError" class="article-state" role="alert">
    <h1>โหลดบทความไม่สำเร็จ</h1>
    <p>{{ articlesError }}</p>
    <div class="article-state-actions">
      <button class="btn btn-primary" type="button" data-test="article-retry" @click="$emit('retry-articles')">
        ลองอีกครั้ง
      </button>
      <RouterLink class="text-link" to="/articles">กลับไปหน้าบทความ</RouterLink>
    </div>
  </main>

  <main v-else-if="!article" class="article-state" data-test="article-not-found">
    <h1>ไม่พบบทความ</h1>
    <p>บทความนี้อาจถูกย้ายหรือลบแล้ว</p>
    <RouterLink class="btn btn-outline" to="/articles">กลับไปหน้าบทความ</RouterLink>
  </main>

  <article v-else class="article-detail-view">
    <RouterLink class="back-link" to="/articles">← กลับไปหน้าบทความ</RouterLink>

    <div class="hero-header">
      <img
        v-if="coverVisible"
        class="hero-img"
        :src="articleImage"
        :alt="article.title"
        @error="coverFailed = true"
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

    <div class="article-body-container">
      <time class="article-date">{{ formatArticleDate(article.created_at || article.date) }}</time>
      <h1 class="article-title">{{ article.title }}</h1>
      <div class="article-content" v-html="safeContent"></div>
    </div>
  </article>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { formatArticleDate, sanitizeArticleHtml } from '../utils/articleContent'

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

const route = useRoute()
const coverFailed = ref(false)
const article = computed(() => props.articles.find(item => String(item.id) === String(route.params.id)) ?? null)
const safeContent = computed(() => sanitizeArticleHtml(article.value?.content))
const articleImage = computed(() => article.value?.image_url || article.value?.image || '')
const coverVisible = computed(() => Boolean(articleImage.value) && !coverFailed.value)

watch(() => article.value?.id, () => {
  coverFailed.value = false
})
</script>

<style scoped>
.article-detail-view {
  width: 100%;
  max-width: 76rem;
  min-width: 0;
  margin: 0 auto;
  padding: clamp(1rem, 3vw, 2rem) var(--page-gutter) var(--space-huge);
  color: var(--ink);
}

.back-link,
.text-link {
  color: var(--primary);
  font-weight: 600;
  text-decoration: none;
  text-underline-offset: 0.2em;
}

.back-link {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  margin-bottom: var(--space-lg);
}

.back-link:hover,
.text-link:hover {
  color: var(--primary-deep);
  text-decoration: underline;
}

.hero-header {
  position: relative;
  display: flex;
  width: 100%;
  height: clamp(13rem, 42vw, 32rem);
  aspect-ratio: 16 / 9;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid var(--hairline);
  border-radius: var(--radius-lg);
  background: var(--canvas-soft);
}

.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.article-image-fallback {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  background: var(--canvas-soft);
  font-family: var(--font-mono);
  font-size: clamp(1.25rem, 4vw, 2.25rem);
  font-weight: 600;
  letter-spacing: 0.04em;
}

.article-body-container {
  width: min(100%, 70ch);
  min-width: 0;
  margin: clamp(1.5rem, 4vw, 3rem) auto 0;
}

.article-date {
  display: block;
  margin-bottom: var(--space-sm);
  color: var(--ink-mute);
  font-size: var(--text-sm);
}

.article-title {
  margin: 0 0 clamp(1.5rem, 4vw, 2.5rem);
  color: var(--ink);
  font-size: var(--text-3xl);
  font-weight: 600;
  line-height: 1.2;
  overflow-wrap: anywhere;
  text-wrap: balance;
}

.article-content {
  max-width: 100%;
  min-width: 0;
  color: var(--ink-secondary);
  font-size: 1.0625rem;
  line-height: 1.75;
  overflow-wrap: anywhere;
}

.article-content :deep(p) {
  margin: 0 0 var(--space-lg);
  text-wrap: pretty;
}

.article-content :deep(h2),
.article-content :deep(h3),
.article-content :deep(h4) {
  margin: var(--space-xxl) 0 var(--space-md);
  color: var(--ink);
  font-weight: 600;
  line-height: 1.3;
  overflow-wrap: anywhere;
  text-wrap: balance;
}

.article-content :deep(h2) {
  font-size: var(--text-2xl);
}

.article-content :deep(h3) {
  font-size: var(--text-xl);
}

.article-content :deep(h4) {
  font-size: var(--text-lg);
}

.article-content :deep(ul),
.article-content :deep(ol) {
  margin: 0 0 var(--space-lg);
  padding-inline-start: clamp(1.25rem, 4vw, 2rem);
}

.article-content :deep(li) {
  margin-bottom: var(--space-sm);
}

.article-content :deep(blockquote) {
  margin: var(--space-xl) 0;
  padding: var(--space-lg);
  border: 1px solid var(--hairline-strong);
  border-radius: var(--radius-md);
  color: var(--ink);
  background: var(--canvas-soft);
}

.article-content :deep(a) {
  color: var(--primary);
  overflow-wrap: anywhere;
  text-decoration: underline;
  text-underline-offset: 0.18em;
}

.article-content :deep(img) {
  display: block;
  max-width: 100%;
  height: auto;
  margin: var(--space-xl) auto;
  border-radius: var(--radius-md);
}

.article-content :deep(table) {
  display: block;
  max-width: 100%;
  margin: var(--space-xl) 0;
  overflow-x: auto;
  border-collapse: collapse;
  overscroll-behavior-inline: contain;
}

.article-content :deep(th),
.article-content :deep(td) {
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--hairline);
  text-align: start;
  white-space: nowrap;
}

.article-content :deep(th) {
  color: var(--ink);
  background: var(--canvas-soft);
  font-weight: 600;
}

.article-content :deep(pre) {
  max-width: 100%;
  margin: var(--space-xl) 0;
  padding: var(--space-lg);
  overflow-x: auto;
  border: 1px solid var(--hairline);
  border-radius: var(--radius-md);
  background: var(--canvas-soft);
  overscroll-behavior-inline: contain;
}

.article-content :deep(code) {
  font-family: var(--font-mono);
  font-size: 0.9em;
  overflow-wrap: anywhere;
}

.article-content :deep(:not(pre) > code) {
  padding: 0.12em 0.35em;
  border-radius: var(--radius-xs);
  color: var(--ink);
  background: var(--canvas-soft);
}

.article-state {
  display: flex;
  width: min(calc(100% - (2 * var(--page-gutter))), 42rem);
  min-height: clamp(18rem, 50vh, 28rem);
  margin: clamp(1rem, 4vw, 3rem) auto;
  padding: clamp(1.5rem, 5vw, 3rem);
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-lg);
  color: var(--ink-mute);
  background: var(--canvas-soft);
  text-align: center;
}

.article-state h1,
.article-state p {
  margin: 0;
}

.article-state h1 {
  color: var(--ink);
  font-size: var(--text-2xl);
  line-height: 1.25;
  text-wrap: balance;
}

.article-state-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-lg);
  flex-wrap: wrap;
}

.article-state .btn {
  min-height: 44px;
}

@media (max-width: 40rem) {
  .article-detail-view {
    padding-top: var(--space-md);
  }

  .hero-header {
    height: clamp(12rem, 62vw, 18rem);
    aspect-ratio: 4 / 3;
    border-radius: var(--radius-md);
  }

  .article-content {
    font-size: 1rem;
    line-height: 1.7;
  }

  .article-state-actions {
    width: 100%;
    flex-direction: column;
  }
}
</style>
