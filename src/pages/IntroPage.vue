<script setup lang="ts">
import { ref } from 'vue'

import { useI18n } from '../i18n'

const { t, tm } = useI18n()
const relayFeedback = ref('')

async function copyQuizLink() {
  try {
    const link = new URL('/quiz', window.location.href).toString()
    await navigator.clipboard.writeText(link)
    relayFeedback.value = t('home.relayFeedback')
  } catch {
    relayFeedback.value = t('app.common.copyFail')
  }
}
</script>

<template>
  <div class="page-stack compact">
    <section class="hero-panel center">
      <p class="eyebrow">{{ t('intro.eyebrow') }}</p>
      <h1 class="display-title">{{ t('intro.title') }}</h1>
      <p class="lead">{{ t('intro.lead') }}</p>
      <div class="cta-row" style="justify-content: center;">
        <RouterLink class="button button-primary" to="/quiz">{{ t('intro.start') }}</RouterLink>
      </div>
    </section>

    <section class="panel relay-panel" v-reveal>
      <h2 class="section-title">{{ t('intro.relayTitle') }}</h2>
      <p class="lead relay-copy">{{ t('intro.relayCopy') }}</p>
      <div class="cta-row">
        <button class="button button-secondary" type="button" @click="copyQuizLink">{{ t('intro.relayButton') }}</button>
        <RouterLink class="button button-primary" to="/quiz">{{ t('intro.start') }}</RouterLink>
      </div>
      <p v-if="relayFeedback" class="relay-feedback">{{ relayFeedback }}</p>
    </section>

    <section class="split-grid" v-reveal>
      <article class="panel">
        <h2 class="section-title">{{ t('intro.resultTitle') }}</h2>
        <div class="meta-list">
          <div v-for="item in tm<string[][]>('intro.resultItems')" :key="item[0]" class="meta-item">
            <span class="label">{{ item[0] }}</span>
            <p class="value">{{ item[1] }}</p>
          </div>
        </div>
      </article>

      <article class="panel">
        <h2 class="section-title">{{ t('intro.dimensionTitle') }}</h2>
        <div class="pill-row">
          <span v-for="dimension in tm<string[]>('intro.dimensions')" :key="dimension" class="pill">{{ dimension }}</span>
        </div>
      </article>
    </section>
  </div>
</template>

<style scoped>
.relay-panel {
  display: grid;
  gap: 14px;
  background: linear-gradient(180deg, #fbfdfd 0%, #f4faf7 100%);
  border-color: #dce9e3;
}

.relay-copy {
  margin: 0;
}

.relay-feedback {
  margin: 0;
  color: #33a474;
  font-size: 0.92rem;
  font-weight: 700;
}
</style>
