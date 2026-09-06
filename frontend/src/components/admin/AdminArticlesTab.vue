<template>
  <div id="admin-panel-articles" role="tabpanel" aria-labelledby="admin-tab-articles" class="admin-card admin-section-card">
    <header class="operations-header">
      <div>
        <h3>จัดการบทความ</h3>
        <p class="operations-description">ค้นหา ตรวจสอบวันที่เผยแพร่ และดูแลเนื้อหาความรู้</p>
      </div>
      <output class="operations-count" data-test="articles-result-count" aria-live="polite">{{ filteredArticles.length }} รายการ</output>
    </header>
    <div class="operations-toolbar" role="search" aria-label="ค้นหาและกรองบทความ">
      <label class="operations-search">
        <span>ค้นหาบทความ</span>
        <input v-model="articleQuery" data-test="articles-search" class="form-control" type="search" placeholder="หัวข้อหรือ ID">
      </label>
      <label class="operations-filter">
        <span>วันที่เผยแพร่</span>
        <input v-model="articleDate" data-test="articles-date-filter" class="form-control" type="date">
      </label>
      <button v-if="articleQuery || articleDate" data-test="articles-reset" class="btn btn-outline" type="button" @click="resetArticleFilters">ล้างตัวกรอง</button>
      <div class="operations-actions">
        <button class="btn btn-primary" data-test="add-article" @click="openArticleModal()">+ เพิ่มบทความ</button>
      </div>
    </div>
    <div class="admin-table-region" data-test="articles-table-region" tabindex="0" aria-label="ตารางบทความ เลื่อนแนวนอนเพื่อดูข้อมูลเพิ่มเติม">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>ภาพปก</th>
            <th>หัวข้อ</th>
            <th>วันที่</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="article in filteredArticles" :key="'art-'+article.id">
            <td style="font-family: var(--font-mono); color: var(--muted);">{{ article.id }}</td>
            <td><img :src="article.image" :alt="`ภาพปก ${article.title}`" style="width: 50px; height: 30px; object-fit: cover; border-radius: 4px;" /></td>
            <td><span class="article-title-text">{{ article.title }}</span></td>
            <td>{{ article.date }}</td>
            <td>
              <div class="admin-row-actions">
                <button class="btn btn-outline btn-sm admin-row-action" @click="openArticleModal(article)">แก้ไข</button>
                <button class="btn btn-outline-danger btn-sm admin-row-action" @click="deleteArticle(article.id)">ลบ</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="admin-mobile-list" aria-label="รายการบทความ">
      <article v-for="article in filteredArticles" :key="'article-card-'+article.id" class="admin-mobile-card" :data-test="`article-card-${article.id}`">
        <div class="admin-mobile-card__heading">
          <strong>{{ article.title }}</strong>
          <span class="admin-mobile-card__id">#{{ article.id }}</span>
        </div>
        <div class="admin-mobile-card__media">
          <img v-if="article.image" :src="article.image" :alt="`ภาพปก ${article.title}`">
          <span v-else aria-hidden="true">📰</span>
          <time :datetime="article.date">{{ article.date }}</time>
        </div>
        <div class="admin-actions">
          <button class="btn btn-outline" @click="openArticleModal(article)">แก้ไข</button>
          <button class="btn btn-outline-danger" @click="deleteArticle(article.id)">ลบ</button>
        </div>
      </article>
    </div>
    <p v-if="!articles || articles.length === 0" class="admin-empty" data-test="articles-empty">ยังไม่มีบทความในระบบ</p>
    <div v-else-if="filteredArticles.length === 0" class="admin-empty admin-no-results" data-test="articles-no-results">
      <p>ไม่พบบทความที่ตรงกับตัวกรอง</p>
      <button class="btn btn-outline" type="button" @click="resetArticleFilters">ล้างตัวกรอง</button>
    </div>

    <!-- Article Modal -->
    <div class="modal-overlay" data-test="article-modal" v-if="showArticleModal" @click.self="!isSavingArticle && (showArticleModal = false)">
      <div class="modal-content glass-panel admin-modal" role="dialog" aria-modal="true" aria-labelledby="article-modal-title" style="max-width: 700px; padding: 0;">
        <div class="modal-header" style="padding: 1.5rem; border-bottom: 1px solid var(--glass-border); background: rgba(0,0,0,0.2);">
          <h3 id="article-modal-title" style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-size: 1.5rem;">📝</span> 
            {{ editingArticle ? 'แก้ไขบทความ' : 'เขียนบทความใหม่' }}
          </h3>
          <button class="close-btn" aria-label="ปิดฟอร์มบทความ" @click="showArticleModal = false">✕</button>
        </div>
        <div class="modal-body admin-modal__body" style="max-height: 75vh; overflow-y: auto; padding: 2rem;">
          
          <div class="form-group">
            <label>หัวข้อบทความ</label>
            <input type="text" class="form-control" v-model="articleForm.title" style="font-size: 1.1rem; font-weight: 600;" placeholder="ระบุหัวข้อบทความที่น่าสนใจ...">
          </div>

          <div class="admin-form-grid admin-form-grid--article">
            <div class="form-group" style="margin: 0;">
              <label>วันที่อัปเดต</label>
              <input type="date" class="form-control" v-model="articleForm.date">
            </div>
            <div class="form-group" style="margin: 0;">
              <label>ภาพปก (อัปโหลดรูปภาพ)</label>
              <div class="admin-media-field">
                <div style="flex: 1; display: flex; flex-direction: column; gap: 0.5rem;">
                  <input type="file" accept="image/*" class="form-control" @change="uploadArticleImage" :disabled="isUploadingArticleImage" style="padding-top: 0.5rem;">
                  <small v-if="isUploadingArticleImage" style="color: var(--primary);">กำลังอัปโหลด...</small>
                  <input type="text" class="form-control" v-model="articleForm.image" placeholder="หรือวาง URL รูปภาพ" style="font-size: 0.8rem; padding: 0.4rem;" @input="articleImgError = false">
                </div>
                <div style="width: 80px; height: 80px; border-radius: var(--radius-sm); border: 1px dashed var(--hairline-strong); overflow: hidden; background: var(--canvas-soft); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <template v-if="articleForm.image">
                    <div v-if="articleImgError" style="font-size: 0.7rem; color: var(--danger); text-align: center; padding: 0.2rem;">
                      ⚠️<br>โหลดไม่สำเร็จ
                    </div>
                    <img v-else :src="articleForm.image" style="width: 100%; height: 100%; object-fit: cover;" @error="articleImgError = true">
                  </template>
                  <div v-else style="font-size: 1.5rem; color: var(--ink-mute-2);">🖼️</div>
                </div>
              </div>
            </div>
          </div>

          <div class="form-group" style="margin-top: 1.5rem;">
            <label>เนื้อหาบทความ</label>
            <textarea class="form-control" style="height: 250px; line-height: 1.6; font-size: 0.95rem; background: var(--canvas-soft);" v-model="articleForm.content" placeholder="พิมพ์เนื้อหาที่นี่..."></textarea>
          </div>
        </div>
        <div class="admin-modal__footer" style="padding: 1.5rem; border-top: 1px solid var(--hairline); display: flex; justify-content: flex-end; gap: 1rem; background: var(--canvas-soft);">
          <button class="btn btn-outline" :disabled="isSavingArticle" @click="showArticleModal = false">ยกเลิก</button>
          <button class="btn btn-primary" data-test="save-article" :disabled="isSavingArticle" style="padding: 0.5rem 2rem; font-weight: 600;" @click="saveArticle">{{ isSavingArticle ? 'กำลังบันทึก…' : '🚀 เผยแพร่บทความ' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useArticleStore } from '../../stores/article';
import { useToastStore } from '../../stores/toast';
import { adminRequest, API_BASE } from '../../services/adminApi';
import { filterArticles } from '../../utils/adminCollectionFilters';

const props = defineProps({
  articles: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['request-confirm']);

const articleStore = useArticleStore();
const toast = useToastStore();

const articleQuery = ref('');
const articleDate = ref('');
const isUploadingArticleImage = ref(false);

const filteredArticles = computed(() => filterArticles(props.articles || [], {
  query: articleQuery.value,
  date: articleDate.value
}));

const resetArticleFilters = () => {
  articleQuery.value = '';
  articleDate.value = '';
};

// --- Article CRUD ---
const showArticleModal = ref(false);
const editingArticle = ref(null);
const articleImgError = ref(false);
const articleForm = reactive({ id: 0, title: '', date: '', image: '', content: '' });
const isSavingArticle = ref(false);

const uploadArticleImage = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  isUploadingArticleImage.value = true;
  const formData = new FormData();
  formData.append('image', file);

  try {
    const data = await adminRequest('/upload', { method: 'POST', body: formData });
    if (data?.success) {
      const baseUrl = API_BASE.replace('/api/v1', '');
      articleForm.image = baseUrl + data.url;
      articleImgError.value = false;
      toast.success('อัปโหลดรูปภาพสำเร็จ');
    } else {
      toast.error('อัปโหลดรูปล้มเหลว: ' + (data?.error || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    if (!error?.sessionExpired) toast.error(error?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเพื่ออัปโหลดรูปภาพ');
  } finally {
    isUploadingArticleImage.value = false;
  }
};

const openArticleModal = (article = null) => {
  articleImgError.value = false;
  if (article) {
    editingArticle.value = article;
    articleForm.id = article.id;
    articleForm.title = article.title;
    articleForm.date = article.date;
    articleForm.image = article.image || '';
    articleForm.content = article.content || '';
  } else {
    editingArticle.value = null;
    articleForm.id = null;
    articleForm.title = '';
    articleForm.date = new Date().toISOString().split('T')[0];
    articleForm.image = '/images/articles/article-01-monitors-144hz-vs-240hz.jpg';
    articleForm.content = '';
  }
  showArticleModal.value = true;
};

const saveArticle = async () => {
  if (isSavingArticle.value) return;
  isSavingArticle.value = true;
  let saved = false;
  try { saved = await articleStore.saveArticle({ ...articleForm }); }
  finally { isSavingArticle.value = false; }
  if (saved) showArticleModal.value = false;
};

const deleteArticle = (id) => {
  emit('request-confirm', 'ยืนยันการลบบทความนี้?', () => {
    return articleStore.deleteArticle(id);
  }, 'danger');
};
</script>
