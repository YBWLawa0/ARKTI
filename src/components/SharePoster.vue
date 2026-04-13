<script setup lang="ts">
import { ref } from 'vue'

import { useI18n } from '../i18n'
import { getLocalizedCharacterName, getLocalizedCharacterSeries } from '../i18n/characters'
import type { QuizResult } from '../types/quiz'

defineProps<{
  result: QuizResult
}>()

const rootEl = ref<HTMLElement | null>(null)
const { locale, t } = useI18n()

defineExpose({
  rootEl,
})
</script>

<template>
  <section ref="rootEl" class="share-poster" :style="{ '--poster-accent': result.characterMatches[0]?.accent || result.archetype.accent }">
    <div class="share-poster__header">
      <div>
        <p class="share-poster__kicker">ARKTI 角色结果 · {{ result.code }} · {{ result.archetype.name }}</p>
        <h2 class="share-poster__title">{{ result.characterMatches[0] ? getLocalizedCharacterName(result.characterMatches[0], locale) : result.archetype.name }}</h2>
        <p class="share-poster__subtitle">{{ result.characterMatches[0]?.title || result.archetype.subtitle }}</p>
      </div>
      <div class="share-poster__score">
        <span>命中感</span>
        <strong>{{ result.matchScore }}%</strong>
      </div>
    </div>

    <div class="share-poster__probability">
      <span>匹配概率</span>
      <strong>{{ result.matchProbability }}%</strong>
      <p>基于总体随机答卷命中率</p>
    </div>

    <div class="share-poster__tags">
      <span v-for="tag in (result.characterMatches[0]?.tags || (result.tags.length ? result.tags : result.archetype.tags)).slice(0, 4)" :key="tag">{{ tag }}</span>
    </div>

    <div class="share-poster__body">
      <div class="share-poster__block">
        <span>剧情位置</span>
        <p>{{ result.archetype.narrativeRole }}</p>
      </div>
      <div class="share-poster__block">
        <span>高光时刻</span>
        <p>{{ result.archetype.spotlight }}</p>
      </div>
      <div class="share-poster__block">
        <span>命中角色</span>
        <p>{{ result.characterMatches[0] ? getLocalizedCharacterName(result.characterMatches[0], locale) : t('app.common.unknownCharacter') }} / {{ result.characterMatches[0] ? getLocalizedCharacterSeries(result.characterMatches[0], locale) : t('app.common.unknownSeries') }}</p>
      </div>
    </div>

    <div class="share-poster__footer">
      <span>ARKTI</span>
      <span>不是人格诊断，是你的二次元角色卡。</span>
    </div>
  </section>
</template>

<style scoped>
.share-poster {
  position: relative;
  overflow: hidden;
  display: grid;
  gap: 20px;
  width: 100%;
  padding: 28px;
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background:
    radial-gradient(circle at top right, color-mix(in srgb, var(--poster-accent) 34%, transparent), transparent 28%),
    radial-gradient(circle at bottom left, rgba(110, 197, 255, 0.18), transparent 24%),
    linear-gradient(180deg, rgba(26, 24, 36, 0.96), rgba(16, 15, 23, 0.98));
  box-shadow: 0 24px 60px rgba(5, 4, 12, 0.45);
}

.share-poster__header,
.share-poster__footer {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.share-poster__kicker,
.share-poster__block span,
.share-poster__footer {
  color: rgba(246, 240, 255, 0.72);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-size: 0.75rem;
}

.share-poster__title {
  margin: 4px 0 6px;
  font-family: var(--display-font);
  font-size: 2.8rem;
  line-height: 1;
}

.share-poster__subtitle,
.share-poster__block p {
  margin: 0;
  color: var(--text);
  line-height: 1.6;
}

.share-poster__score {
  text-align: right;
}

.share-poster__score strong {
  display: block;
  margin-top: 6px;
  font-family: var(--display-font);
  font-size: 2.6rem;
  line-height: 1;
}

.share-poster__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.share-poster__probability {
  padding: 14px 16px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
}

.share-poster__probability span,
.share-poster__probability p {
  color: rgba(246, 240, 255, 0.72);
}

.share-poster__probability strong {
  display: block;
  margin: 6px 0 4px;
  font-family: var(--display-font);
  font-size: 2rem;
  line-height: 1;
}

.share-poster__probability p {
  margin: 0;
  font-size: 0.85rem;
}

.share-poster__tags span {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
}

.share-poster__body {
  display: grid;
  gap: 14px;
}

.share-poster__block {
  padding: 16px 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.05);
}

@media (max-width: 700px) {
  .share-poster {
    padding: 22px;
  }

  .share-poster__header,
  .share-poster__footer {
    flex-direction: column;
  }

  .share-poster__score {
    text-align: left;
  }

  .share-poster__title {
    font-size: 2.2rem;
  }
}
</style>
