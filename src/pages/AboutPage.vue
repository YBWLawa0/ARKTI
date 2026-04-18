<script setup lang="ts">
import { useI18n } from '../i18n'

const { t, tm } = useI18n()

// Split text by sentence punctuation, preserving the punctuation.
function formatParagraphs(text: string) {
  if (!text) return []
  return text.match(/[^。！？.!?]+[。！？.!?]?/g)?.map(s => s.trim()).filter(Boolean) || [text]
}

function formatLeadBParagraph(text: string) {
  return text.replace(
    /ACGTI/g,
    `<a href="https://acgti.tianxingleo.top" target="_blank" rel="noopener noreferrer" class="acgti-link"><span class="acgti-highlight">ACGTI</span></a>`
  )
}
</script>

<template>
  <div class="page-stack about-container">
    
    <!-- Top block -->
    <div class="top-section" v-reveal>
      <article class="about-card main-card">
        <div class="main-card-header">
          <span class="eyebrow-tag">{{ t('about.eyebrow') }}</span>
          <h1 class="main-title">{{ t('about.title') }}</h1>
        </div>

        <div class="main-card-body">
          <div class="lead-group">
            <p v-for="(p, i) in formatParagraphs(t('about.leadA'))" :key="'a' + i" class="lead-text">
              {{ p }}
            </p>
            <div class="main-action-buttons">
              <a href="https://github.com/YBWLawa0/ARKTI" target="_blank" rel="noopener noreferrer" class="action-btn-primary btn-github">
                <svg style="width: 20px; height: 20px;" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                {{ t('about.star') }}
              </a>
              <a href="https://www.bilibili.com/video/BV1rVdpBMEDj/?share_source=copy_web&vd_source=90babda72a58cd66a0cb79e190722714" target="_blank" rel="noopener noreferrer" class="action-btn-primary btn-bilibili">
                <svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                {{ t('about.bilibili') }}
              </a>
              <a href="http://xhslink.com/o/8RXyvAptCKs" target="_blank" rel="noopener noreferrer" class="action-btn-primary btn-xhs">
                <svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                {{ t('about.xiaohongshu') }}
              </a>
            </div>
          </div>
          
          <div class="lead-group">
            <p v-for="(p, i) in formatParagraphs(t('about.leadB'))" :key="'b' + i" class="lead-text">
              <span v-html="formatLeadBParagraph(p)"></span>
            </p>
          </div>
        </div>
      </article>
    </div>

    <!-- Middle block -->
    <div class="middle-section about-grid" v-reveal>
      <article class="about-card side-card">
        <div class="side-card-header">
          <h2 class="section-title">{{ t('about.boundaryTitle') }}</h2>
        </div>
        <div class="meta-list">
          <div v-for="item in tm<string[][]>('about.boundaryItems')" :key="item[0]" class="meta-item">
            <span class="label">{{ item[0] }}</span>
            <p class="value">{{ item[1] }}</p>
          </div>
        </div>
      </article>

      <article class="about-card side-card">
        <div class="side-card-header">
          <h2 class="section-title">{{ t('about.shippedTitle') }}</h2>
        </div>
        <div class="timeline-list">
          <div v-for="item in tm<string[][]>('about.shippedItems')" :key="item[0]" class="timeline-item">
            <span class="label">{{ item[0] }}</span>
            <p class="value">{{ item[1] }}</p>
          </div>
        </div>
      </article>
    </div>

    <!-- Matching Mechanism Block -->
    <div class="matching-section" v-reveal>
      <article class="about-card matching-card">
        <div class="matching-card-header">
          <h2 class="section-title">{{ t('about.matchingTitle') }}</h2>
        </div>
        <div class="meta-list">
          <div v-for="item in tm<string[][]>('about.matchingItems')" :key="item[0]" class="meta-item">
            <span class="label matching-label">{{ item[0] }}</span>
            <p class="value">{{ item[1] }}</p>
          </div>
        </div>
      </article>
    </div>

    <!-- Bottom block - update log -->
    <div class="update-section" v-reveal>
      <article class="about-card update-card">
        <div class="update-card-header">
          <h2 class="section-title">{{ t('about.updateTitle') }}</h2>
        </div>
        <div class="update-list">
          <div v-for="item in tm<string[][]>('about.updateItems')" :key="item[0]" class="update-item">
            <span class="label update-label">{{ item[0] }}</span>
            <div class="update-content">
              <template v-for="(line, idx) in item[1].split('\n')" :key="idx">
                <p v-if="line.trim()" class="value">{{ line }}</p>
              </template>
            </div>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.about-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}

.about-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
  align-items: stretch;
}

.top-section {
  margin-bottom: 28px;
}

.middle-section {
  margin-bottom: 28px;
}

.about-card {
  background: #ffffff;
  border: 1px solid #edf1f5;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(17, 24, 39, 0.04);
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  overflow: hidden;
}

.about-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(17, 24, 39, 0.08);
  border-color: #dce5ef;
}

.main-card {
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.main-card-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-bottom: 1px dashed #e4e9f0;
  padding-bottom: 24px;
}

.eyebrow-tag {
  display: inline-block;
  align-self: flex-start;
  padding: 6px 14px;
  background: #f0f4f8;
  color: #5d6b78;
  font-size: 13px;
  font-weight: 700;
  border-radius: 999px;
  letter-spacing: 0.05em;
}

.main-title {
  margin: 0;
  font-size: clamp(32px, 4vw, 48px);
  font-weight: 800;
  line-height: 1.2;
  color: #2b3a47;
  letter-spacing: -0.02em;
}

.main-card-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px 40px;
}

@media (max-width: 960px) {
  .about-grid {
    grid-template-columns: 1fr;
  }
  
  .main-card-body {
    grid-template-columns: 1fr;
  }
}

.lead-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lead-text {
  margin: 0;
  font-size: 16px;
  line-height: 1.8;
  color: #4c5965;
}

.lead-text :deep(.acgti-link) {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.lead-text :deep(.acgti-highlight) {
  color: #d4af37;
  font-weight: 700;
}

.main-action-buttons {
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: flex-start;
  margin-top: 12px;
}

.action-btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 24px;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  color: #ffffff;
}

.action-btn-primary:hover {
  transform: translateY(-2px) scale(1.02);
}

.action-btn-primary:active {
  transform: scale(0.98);
}

.btn-github {
  background: #33a474;
  box-shadow: 0 4px 12px rgba(51, 164, 116, 0.25);
}
.btn-github:hover {
  background: #2b8f64;
  box-shadow: 0 8px 20px rgba(51, 164, 116, 0.35);
}

.btn-bilibili {
  background: #fb7299;
  box-shadow: 0 4px 12px rgba(251, 114, 153, 0.25);
}
.btn-bilibili:hover {
  background: #e06085;
  box-shadow: 0 8px 20px rgba(251, 114, 153, 0.35);
}

.btn-xhs {
  background: #ff2442;
  box-shadow: 0 4px 12px rgba(255, 36, 66, 0.25);
}
.btn-xhs:hover {
  background: #e61c36;
  box-shadow: 0 8px 20px rgba(255, 36, 66, 0.35);
}

.side-cards {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.side-card {
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.side-card-header {
  border-bottom: 1px dashed #e4e9f0;
  padding-bottom: 16px;
}

.section-title {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: #2b3a47;
}

.meta-list, .timeline-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.meta-item, .timeline-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label {
  font-size: 13px;
  font-weight: 800;
  color: #3f4b56;
  display: flex;
  align-items: center;
  gap: 6px;
}

.label::before {
  content: '';
  display: block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #88619a; /* Using the purple brand color for accents */
}

.timeline-item .label::before {
  background: #e4ae3a; /* Using yellow brand color for timeline accents */
}

.matching-section {
  margin-bottom: 28px;
}

.matching-card {
  padding: 32px 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.matching-card-header {
  border-bottom: 1px dashed #e4e9f0;
  padding-bottom: 16px;
}

.matching-label::before {
  background: #e5b540 !important; /* Yellow brand color for matching mechanism */
}

.update-label::before {
  background: #4899a3 !important; /* Teal color for update history */
}

.update-section {
  margin-top: 0;
}

.update-card {
  padding: 32px 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.update-card-header {
  border-bottom: 1px dashed #e4e9f0;
  padding-bottom: 16px;
}

.update-list {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.update-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.update-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-left: 14px;
  border-left: 2px solid #f0f4f8;
  margin-left: 3px;
}

.value {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #63717e;
}
</style>
