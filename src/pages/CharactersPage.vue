<script setup lang="ts">
import { useQuiz } from '../composables/useQuiz'
import { useI18n } from '../i18n'
import { getLocalizedCharacterName, getLocalizedCharacterSeries } from '../i18n/characters'
import type { CharacterMatch } from '../types/quiz'

const { characters } = useQuiz()
const { locale, t } = useI18n()

function buildCardStyle(character: CharacterMatch) {
  return {
    '--accent-color': character.accent ?? '#42b883',
    '--card-background-image': character.backgroundImage ? `url("${character.backgroundImage}")` : 'none',
    '--card-image-scale': String(character.imageScale ?? 1),
  }
}
</script>

<template>
  <div class="page-stack">
    <section class="hero-panel center compact">
      <p class="eyebrow">{{ t('characters.eyebrow') }}</p>
      <h1 class="display-title">{{ t('characters.title') }}</h1>
      <p class="lead">{{ t('characters.lead') }}</p>
    </section>

    <section class="characters-grid">
      <RouterLink
        v-for="character in characters"
        :key="character.id"
        :to="{ path: '/result', query: { character: character.id } }"
        class="character-card"
        :style="buildCardStyle(character)"
        v-reveal
      >
        <div
          class="card-image-wrap"
        >
          <img :src="character.image" :alt="getLocalizedCharacterName(character, locale)" class="card-image" loading="lazy" />
        </div>
        <div class="card-content">
          <div class="card-tags">
            <span class="card-code">{{ character.code }}</span>
            <span class="card-mbti">{{ character.matchCode }}</span>
          </div>
          <h2 class="card-name">{{ getLocalizedCharacterName(character, locale) }}</h2>
          <p class="card-source">{{ getLocalizedCharacterSeries(character, locale) }}</p>
          <p class="card-title">{{ t('characters.' + character.id + '.title', undefined, character.title) }}</p>
        </div>
      </RouterLink>
    </section>
  </div>
</template>

<style scoped>
.characters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.character-card {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.2s ease;
  text-decoration: none;
  color: inherit;
  border: 2px solid transparent;
}

.character-card:hover {
  transform: translateY(-4px);
  border-color: var(--accent-color, #42b883);
}

.card-image-wrap {
  width: 100%;
  aspect-ratio: 1;
  background-color: #f6f8ff;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  overflow: hidden;
  position: relative;
  background-image:
    linear-gradient(
      165deg,
      color-mix(in srgb, var(--accent-color, #b8c3ff) 14%, #ffffff) 0%,
      color-mix(in srgb, var(--accent-color, #b8c3ff) 20%, #ffffff) 100%
    ),
    var(--card-background-image, none);
  background-size: cover, cover;
  background-position: center, center;
  background-repeat: no-repeat;
}

.card-image-wrap::before {
  content: '';
  position: absolute;
  inset: -26%;
  pointer-events: none;
  z-index: 0;
  background:
    radial-gradient(125% 145% at 28% 36%, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0.16) 52%, rgba(255, 255, 255, 0) 100%),
    linear-gradient(rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.08));
}

.card-image {
  position: relative;
  z-index: 1;
  width: 90%;
  height: 90%;
  object-fit: contain;
  object-position: bottom;
  transform-origin: bottom center;
  transition: transform 0.3s ease;
  transform: scale(var(--card-image-scale, 1));
}

.character-card:hover .card-image {
  transform: scale(calc(var(--card-image-scale, 1) * 1.05));
}

.card-content {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.card-tags {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.card-code {
  font-weight: 800;
  font-size: 0.85rem;
  color: var(--accent-color, #42b883);
  background: color-mix(in srgb, var(--accent-color, #42b883) 15%, transparent);
  padding: 0.2rem 0.6rem;
  border-radius: 100px;
}

.card-mbti {
  font-weight: 700;
  font-size: 0.85rem;
  color: #6c757d;
  background: #e9ecef;
  padding: 0.2rem 0.6rem;
  border-radius: 100px;
}

.card-name {
  font-size: 1.25rem;
  font-weight: 800;
  margin: 0 0 0.25rem 0;
  color: #212529;
}

.card-source {
  font-size: 0.85rem;
  color: #6c757d;
  margin: 0 0 0.75rem 0;
  font-weight: 500;
}

.card-title {
  font-size: 0.9rem;
  color: #495057;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (max-width: 600px) {
  .characters-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      padding: 1rem;
  }
  
  .card-content {
    padding: 0.75rem;
  }
  
  .card-name {
    font-size: 1.1rem;
  }

  .card-tags {
    flex-wrap: wrap;
    gap: 0.25rem;
  }
  
  .card-title {
    font-size: 0.8rem;
  }
}
</style>
