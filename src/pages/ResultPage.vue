<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AdsenseSlot from '../components/AdsenseSlot.vue'
import AppIcon from '../components/AppIcon.vue'
import { useShare } from '../composables/useShare'
import { useQuiz } from '../composables/useQuiz'
import characterVisualsData from '../data/characterVisuals.json'
import { useI18n } from '../i18n'
import { getLocalizedCharacterName, getLocalizedCharacterNote, getLocalizedCharacterTags } from '../i18n/characters'
import { resolvePublicAsset } from '../utils/characterVisuals'
import { normalizeMbtiCode } from '../utils/quizEngine'

const route = useRoute()
const router = useRouter()
const quiz = useQuiz()
const activeDebugResult = ref<ReturnType<typeof quiz.createDebugResult>>(null)
const result = computed(() => activeDebugResult.value ?? quiz.latestResult.value)
const isCharacterImageBroken = ref(false)
const resultHeroRef = ref<HTMLElement | null>(null)
const share = useShare()
const { locale, t, tm } = useI18n()
const resultAdSlot = String(import.meta.env.VITE_ADSENSE_SLOT_RESULT ?? '').trim()
const heroBgOffsetX = ref(0)
const heroBgOffsetY = ref(0)
const isMobile = ref(false)
const isHeroMascotTransparencySupported = ref(false)
let mobileMediaQuery: MediaQueryList | null = null
let mascotCheckToken = 0

let heroTargetX = 0
let heroTargetY = 0
let heroVelocityX = 0
let heroVelocityY = 0
let heroMotionFrame = 0
let heroIsHovering = false
const characterVisuals = characterVisualsData as Record<string, { smallCharacterVideo?: string }>

onMounted(() => {
  quiz.resumeLastResult()
  applyDebugResultFromRoute()
  mobileMediaQuery = window.matchMedia('(max-width: 768px)')
  isMobile.value = mobileMediaQuery.matches
  mobileMediaQuery.addEventListener('change', handleMobileMediaChange)

  if (!result.value) {
    void router.replace('/quiz')
  }
})

watch(
  () => [route.query.type, route.query.character],
  () => {
    applyDebugResultFromRoute()

    if (!result.value) {
      void router.replace('/quiz')
    }
  },
)

function retry() {
  quiz.resetQuiz()
  void router.push('/quiz')
}

function copyText() {
  if (!result.value) {
    return
  }
  void share.copyShareText(result.value)
}

function hideBrokenImage(event: Event) {
  isCharacterImageBroken.value = true
  const img = event.currentTarget as HTMLImageElement | null
  if (!img) return
  img.style.display = 'none'
}

function runHeroBackgroundMotion() {
  const spring = 0.12
  const damping = 0.8

  heroVelocityX += (heroTargetX - heroBgOffsetX.value) * spring
  heroVelocityY += (heroTargetY - heroBgOffsetY.value) * spring
  heroVelocityX *= damping
  heroVelocityY *= damping

  heroBgOffsetX.value += heroVelocityX
  heroBgOffsetY.value += heroVelocityY

  const nearRest =
    Math.abs(heroTargetX - heroBgOffsetX.value) < 0.12 &&
    Math.abs(heroTargetY - heroBgOffsetY.value) < 0.12 &&
    Math.abs(heroVelocityX) < 0.08 &&
    Math.abs(heroVelocityY) < 0.08

  if (!heroIsHovering && nearRest) {
    heroMotionFrame = 0
    heroVelocityX = 0
    heroVelocityY = 0
    return
  }

  heroMotionFrame = requestAnimationFrame(runHeroBackgroundMotion)
}

function ensureHeroMotion() {
  if (heroMotionFrame) {
    return
  }
  heroMotionFrame = requestAnimationFrame(runHeroBackgroundMotion)
}

function handleHeroMouseMove(event: MouseEvent) {
  if (isMobile.value) {
    return
  }

  if (!primaryCharacter.value?.backgroundImage) {
    return
  }

  const hero = resultHeroRef.value
  if (!hero) {
    return
  }

  const rect = hero.getBoundingClientRect()
  const nx = (event.clientX - rect.left) / rect.width - 0.5
  const ny = (event.clientY - rect.top) / rect.height - 0.5

  // Reverse direction to mimic camera-style parallax, with motion cap.
  const maxOffsetX = 14
  const maxOffsetY = 10
  heroTargetX = Math.max(-maxOffsetX, Math.min(maxOffsetX, -nx * 24))
  heroTargetY = Math.max(-maxOffsetY, Math.min(maxOffsetY, -ny * 18))
  heroIsHovering = true
  ensureHeroMotion()
}

function handleHeroMouseLeave() {
  if (isMobile.value) {
    return
  }
  heroIsHovering = false
}

function handleMobileMediaChange(event: MediaQueryListEvent) {
  isMobile.value = event.matches
}

function applyDebugResultFromRoute() {
  const normalizedType = normalizeMbtiCode(String(route.query.type ?? ''))
  const requestedCharacterId = String(route.query.character ?? '').trim().toLowerCase()

  if (!normalizedType && !requestedCharacterId) {
    activeDebugResult.value = null
    return
  }

  const preferredCharacter = requestedCharacterId
    ? quiz.characters.find((item) => item.id === requestedCharacterId)
    : null

  // Backward compatible with old debug links using ?type=XXXX.
  const fallbackCharacter = !preferredCharacter && normalizedType
    ? quiz.characters.find((item) => item.matchCode === normalizedType)
    : null

  const characterId = preferredCharacter?.id ?? fallbackCharacter?.id ?? ''
  activeDebugResult.value = characterId
    ? quiz.createDebugResult(characterId)
    : null
}

const primaryCharacterImage = computed(() => {
  const primary = result.value?.characterMatches?.[0]
  if (!primary) return ''
  return primary.image || `/images/characters/${primary.id}.png`
})

const primaryCharacter = computed(() => result.value?.characterMatches?.[0] ?? null)
const displayCode = computed(() => result.value?.code ?? result.value?.mbtiCode ?? '')
const resultThemeColor = computed(() => primaryCharacter.value?.accent ?? result.value?.archetype.accent ?? '#e2ad3b')
const resultHeroStyle = computed(() => ({
  backgroundColor: resultThemeColor.value,
}))
const hasHeroBackground = computed(() => Boolean(primaryCharacter.value?.backgroundImage))
const shouldShowHeroShadow = computed(() => Boolean(primaryCharacter.value?.backgroundImage && primaryCharacter.value?.backgroundShadow))
const heroCornerMascotVideo = computed(() => {
  const characterId = primaryCharacter.value?.id
  if (!characterId) {
    return ''
  }

  return resolvePublicAsset(characterVisuals[characterId]?.smallCharacterVideo)
})
const shouldShowHeroCornerMascot = computed(() => Boolean(heroCornerMascotVideo.value && isHeroMascotTransparencySupported.value))
const resultHeroImageLayerStyle = computed(() => {
  const backgroundImage = primaryCharacter.value?.backgroundImage
  if (!backgroundImage) {
    return {}
  }

  const backgroundPositionX = primaryCharacter.value?.backgroundPositionX ?? 50
  const backgroundPositionY = primaryCharacter.value?.backgroundPositionY ?? 30

  return {
    backgroundImage: `url("${backgroundImage}")`,
    backgroundSize: '115% auto',
    backgroundPosition: `calc(${backgroundPositionX}% + ${heroBgOffsetX.value}px) calc(${backgroundPositionY}% + ${heroBgOffsetY.value}px)`,
    backgroundRepeat: 'no-repeat',
  }
})
const rarityDisplay = computed(() => {
  const probability = result.value?.matchProbability ?? 0
  if (probability < 0.01) {
    return '＜0.01'
  }
  return probability.toFixed(2)
})
const strongestTrait = computed(() => {
  if (!result.value) {
    return null
  }

  return traits.value.reduce((strongest, trait) => {
    const currentScore = result.value!.scores[trait.id]

    if (!strongest || currentScore.percentage > strongest.score.percentage) {
      return {
        trait,
        score: currentScore,
      }
    }

    return strongest
  }, null as { trait: (typeof traits.value)[number]; score: (typeof result.value.scores)[TraitDimension] } | null)
})

watch(primaryCharacterImage, () => {
  isCharacterImageBroken.value = false
  heroTargetX = 0
  heroTargetY = 0
  heroBgOffsetX.value = 0
  heroBgOffsetY.value = 0
  heroVelocityX = 0
  heroVelocityY = 0
})

onBeforeUnmount(() => {
  mobileMediaQuery?.removeEventListener('change', handleMobileMediaChange)
  if (heroMotionFrame) {
    cancelAnimationFrame(heroMotionFrame)
  }
})

type TraitDimension = 'E_I' | 'S_N' | 'T_F' | 'J_P'
type VectorAxis = 'expression' | 'temperature' | 'judgement' | 'order' | 'agency' | 'aura'

const archetypeLabels = computed<Record<string, string>>(() => ({
  'luminous-lead': t('archetypes.luminous-lead.name'),
  'icebound-observer': t('archetypes.icebound-observer.name'),
  'oathbound-captain': t('archetypes.oathbound-captain.name'),
  'trickster-orbit': t('archetypes.trickster-orbit.name'),
  'gentle-healer': t('archetypes.gentle-healer.name'),
  'shadow-strategist': t('archetypes.shadow-strategist.name'),
  'chaos-spark': t('archetypes.chaos-spark.name'),
  'moonlit-guardian': t('archetypes.moonlit-guardian.name'),
}))

const vectorAxisLabels = computed<Record<VectorAxis, string>>(() => ({
  expression: t('quiz.vectorAxes.expression'),
  temperature: t('quiz.vectorAxes.temperature'),
  judgement: t('quiz.vectorAxes.judgement'),
  order: t('quiz.vectorAxes.order'),
  agency: t('quiz.vectorAxes.agency'),
  aura: t('quiz.vectorAxes.aura'),
}))

const archetypeMeta = computed(() => {
  const archetypeId = result.value?.archetype.id ?? ''
  return {
    id: archetypeId,
    label: archetypeLabels.value[archetypeId] ?? t('result.undefinedArchetype'),
  }
})

const vectorAxisRows = computed(() => {
  const vector = primaryCharacter.value?.vector
  if (!vector) {
    return [] as Array<{ axis: VectorAxis; label: string; value: number; width: number }>
  }

  const axes = Object.keys(vectorAxisLabels.value) as VectorAxis[]
  const MAX_AXIS = 3
  return axes.map((axis) => {
    const value = vector[axis]
    return {
      axis,
      label: vectorAxisLabels.value[axis],
      value,
      width: Math.min(100, Math.round((Math.abs(value) / MAX_AXIS) * 100)),
    }
  })
})

const traits = computed(() => {
  const tDims = tm<Record<string, string[]>>('result.dimensions');
  return [
    { id: 'E_I' as const, leftCode: 'E', leftLabel: tDims.E_I[0], rightCode: 'I', rightLabel: tDims.E_I[1], color: '#4298B4' },
    { id: 'S_N' as const, leftCode: 'S', leftLabel: tDims.S_N[0], rightCode: 'N', rightLabel: tDims.S_N[1], color: '#E4AE3A' },
    { id: 'T_F' as const, leftCode: 'T', leftLabel: tDims.T_F[0], rightCode: 'F', rightLabel: tDims.T_F[1], color: '#33A474' },
    { id: 'J_P' as const, leftCode: 'J', leftLabel: tDims.J_P[0], rightCode: 'P', rightLabel: tDims.J_P[1], color: '#88619A' },
  ];
})

function getHandlePosition(traitId: TraitDimension, leftCode: string) {
  if (!result.value) return 50

  const score = result.value.scores[traitId]
  const percent = score.percentage

  if (score.dominant === leftCode) {
    return 50 - (percent - 50)
  }

  return 50 + (percent - 50)
}

function getDominantTraitLabel(traitId: TraitDimension, leftCode: string, leftLabel: string, rightLabel: string) {
  if (!result.value) return ''
  return result.value.scores[traitId].dominant === leftCode ? leftLabel : rightLabel
}

function loadVideoFrame(videoSource: string) {
  return new Promise<HTMLVideoElement>((resolve, reject) => {
    const video = document.createElement('video')
    video.muted = true
    video.playsInline = true
    video.preload = 'auto'
    video.src = videoSource

    const clear = () => {
      video.onloadeddata = null
      video.onerror = null
      window.clearTimeout(timeoutId)
    }

    const timeoutId = window.setTimeout(() => {
      clear()
      reject(new Error('webm transparent check timed out'))
    }, 3500)

    video.onloadeddata = () => {
      clear()
      resolve(video)
    }

    video.onerror = () => {
      clear()
      reject(new Error('failed to load webm for transparent check'))
    }
  })
}

async function detectVideoTransparencySupport(videoSource: string) {
  try {
    const video = await loadVideoFrame(videoSource)
    const width = Math.max(1, Math.min(64, video.videoWidth || 1))
    const height = Math.max(1, Math.min(64, video.videoHeight || 1))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d', { willReadFrequently: true })

    if (!context) {
      return false
    }

    context.drawImage(video, 0, 0, width, height)

    const samplePoints = [
      [0, 0],
      [Math.max(0, width - 1), 0],
      [0, Math.max(0, height - 1)],
      [Math.max(0, width - 1), Math.max(0, height - 1)],
      [Math.floor(width / 2), 0],
      [Math.floor(width / 2), Math.max(0, height - 1)],
      [0, Math.floor(height / 2)],
      [Math.max(0, width - 1), Math.floor(height / 2)],
    ] as const

    return samplePoints.some(([x, y]) => {
      const alpha = context.getImageData(x, y, 1, 1).data[3]
      return alpha < 12
    })
  } catch {
    return false
  }
}

watch(
  heroCornerMascotVideo,
  async (videoSource) => {
    const token = ++mascotCheckToken
    isHeroMascotTransparencySupported.value = false

    if (!videoSource) {
      return
    }

    const isSupported = await detectVideoTransparencySupport(videoSource)
    if (token !== mascotCheckToken) {
      return
    }

    isHeroMascotTransparencySupported.value = isSupported
  },
  { immediate: true },
)
</script>

<template>
  <div v-if="result" class="result-page">
    <section
      v-if="isMobile"
      class="result-hero result-hero--legacy-mobile"
      :style="{ background: resultThemeColor }"
    >
      <div class="result-hero-inner">
        <div class="hero-copy type-box">
          <p class="hero-caption">{{ t('result.heroCaption') }}</p>
          <h1 class="hero-title">{{ primaryCharacter ? getLocalizedCharacterName(primaryCharacter, locale) : t('archetypes.' + result.archetype.id + '.name', undefined, result.archetype.name) }}</h1>
          <div class="hero-badge-wrap">
            <span class="hero-code">{{ displayCode }}</span>
          </div>
          <div class="hero-metrics">
            <div class="hero-metric">
              <span>{{ t('result.rarity') }}</span>
              <strong>{{ rarityDisplay }}%</strong>
            </div>
            <div class="hero-metric">
              <span>{{ t('result.match') }}</span>
              <strong>{{ result.matchScore }}%</strong>
            </div>
          </div>
          <p class="hero-quote">{{ t('archetypes.' + result.archetype.id + '.oneLiner', undefined, result.archetype.oneLiner) }}</p>

          <div class="hero-actions">
            <button class="action-btn light" @click="copyText">
              <AppIcon name="copy" />
              {{ t('result.copy') }}
            </button>
            <a href="https://github.com/YBWLawa0/ARKTI" target="_blank" rel="noopener noreferrer" class="action-btn" style="background: rgba(255, 255, 255, 0.2); color: white; text-decoration: none; border: none;">
              <svg style="width: 18px; height: 18px;" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              GitHub Star
            </a>
            <button class="action-btn ghost" @click="retry">
              <AppIcon name="refresh" />
              {{ t('result.retry') }}
            </button>
          </div>
          <p v-if="share.feedback.value" class="hero-feedback">{{ share.feedback.value }}</p>
        </div>

        <div class="hero-visual poster-box">
          <div class="poster-frame">
            <img
              v-if="primaryCharacter?.id && !isCharacterImageBroken"
              :src="primaryCharacterImage"
              :alt="primaryCharacter ? getLocalizedCharacterName(primaryCharacter, locale) : 'Character'"
              class="hero-image"
              @error="hideBrokenImage"
            />
            <div v-else class="hero-image-fallback">
              <AppIcon name="fallback" />
            </div>
          </div>
        </div>
      </div>

      <div class="hero-wave" aria-hidden="true">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0 L0,120 L1200,120 L1200,60 C1000,80 800,20 600,60 C400,100 200,40 0,0 Z" />
        </svg>
      </div>
    </section>

    <section
      v-else
      ref="resultHeroRef"
      class="result-hero"
      :style="resultHeroStyle"
      @mousemove="handleHeroMouseMove"
      @mouseleave="handleHeroMouseLeave"
    >
      <div
        v-if="hasHeroBackground"
        class="result-hero-image-layer"
        :style="resultHeroImageLayerStyle"
      ></div>
      <div v-if="shouldShowHeroShadow" class="result-hero-shadow-layer"></div>
      <div class="result-hero-inner">
        <div class="hero-copy type-box">
          <p class="hero-caption">{{ t('result.heroCaption') }}</p>
          <h1 class="hero-title">{{ primaryCharacter ? getLocalizedCharacterName(primaryCharacter, locale) : t('archetypes.' + result.archetype.id + '.name', undefined, result.archetype.name) }}</h1>
          <div class="hero-badge-wrap">
            <span class="hero-code">{{ displayCode }}</span>
          </div>
          <div class="hero-metrics">
            <div class="hero-metric">
              <span>{{ t('result.rarity') }}</span>
              <strong>{{ rarityDisplay }}%</strong>
            </div>
            <div class="hero-metric">
              <span>{{ t('result.match') }}</span>
              <strong>{{ result.matchScore }}%</strong>
            </div>
          </div>
          <p class="hero-quote">“{{ t('archetypes.' + result.archetype.id + '.oneLiner', undefined, result.archetype.oneLiner) }}”</p>

          <div class="hero-actions">
            <button class="action-btn light" @click="copyText">
              <AppIcon name="copy" />
              {{ t('result.copy') }}
            </button>
            <a href="https://github.com/YBWLawa0/ARKTI" target="_blank" rel="noopener noreferrer" class="action-btn" style="background: rgba(255, 255, 255, 0.2); color: white; text-decoration: none; border: none;">
              <svg style="width: 18px; height: 18px;" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              GitHub Star
            </a>
            <button class="action-btn ghost" @click="retry">
              <AppIcon name="refresh" />
              {{ t('result.retry') }}
            </button>
          </div>
          <p v-if="share.feedback.value" class="hero-feedback">{{ share.feedback.value }}</p>
        </div>

        <div class="hero-visual poster-box">
          <div class="poster-frame">
            <div class="hero-image-stage">
              <img
                v-if="primaryCharacter?.id && !isCharacterImageBroken"
                :src="primaryCharacterImage"
                :alt="primaryCharacter ? getLocalizedCharacterName(primaryCharacter, locale) : 'Character'"
                class="hero-image"
                @error="hideBrokenImage"
              />
              <div v-else class="hero-image-fallback">
                <AppIcon name="fallback" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="shouldShowHeroCornerMascot" class="hero-corner-mascot" aria-hidden="true">
        <video
          class="hero-corner-mascot__video"
          :src="heroCornerMascotVideo"
          autoplay
          loop
          muted
          playsinline
          preload="auto"
        ></video>
      </div>

      <div class="hero-wave" aria-hidden="true">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0 L0,120 L1200,120 L1200,60 C1000,80 800,20 600,60 C400,100 200,40 0,0 Z" />
        </svg>
      </div>
    </section>

    <div class="result-body">
      <main class="result-main">
        <section class="intro-block" v-reveal>
          <p>{{ t('archetypes.' + result.archetype.id + '.description', undefined, result.archetype.description) }}</p>
          <p>{{ primaryCharacter ? getLocalizedCharacterNote(primaryCharacter, locale) : '' }}</p>
        </section>

        <section class="traits-section" id="traits-section" v-reveal>
          <div class="section-title-wrap">
            <div class="section-index">1</div>
            <h2 class="section-title">{{ t('result.traitsTitle') }}</h2>
          </div>

          <div class="traits-card">
            <div class="traits-list">
              <div v-for="trait in traits" :key="trait.id" class="trait-row">
                <div
                  class="trait-percent"
                  :style="{
                    left: `${getHandlePosition(trait.id, trait.leftCode)}%`,
                    color: trait.color,
                  }"
                >
                  {{ result.scores[trait.id].percentage }}% {{ getDominantTraitLabel(trait.id, trait.leftCode, trait.leftLabel, trait.rightLabel) }}
                </div>

                <div class="trait-track" :style="{ backgroundColor: trait.color }">
                  <span class="trait-center-marker"></span>
                  <span
                    class="trait-handle"
                    :style="{
                      left: `calc(${getHandlePosition(trait.id, trait.leftCode)}% - 7px)`,
                      borderColor: trait.color,
                    }"
                  ></span>
                </div>

                <div class="trait-labels">
                  <span>{{ trait.leftLabel }} ({{ trait.leftCode }})</span>
                  <span>{{ trait.rightLabel }} ({{ trait.rightCode }})</span>
                </div>
              </div>
            </div>

            <aside class="traits-highlight">
              <p class="highlight-name">{{ t('result.strongest') }}</p>
              <h3 :style="{ color: strongestTrait?.trait.color ?? '#4298B4' }">
                {{ strongestTrait?.score.percentage ?? 0 }}% {{ strongestTrait ? getDominantTraitLabel(strongestTrait.trait.id, strongestTrait.trait.leftCode, strongestTrait.trait.leftLabel, strongestTrait.trait.rightLabel) : '' }}
              </h3>
              <div class="highlight-icon-wrap">
                <AppIcon name="chart" />
              </div>
              <p v-if="strongestTrait">
                {{ t('result.strongestCopy', { label: getDominantTraitLabel(strongestTrait.trait.id, strongestTrait.trait.leftCode, strongestTrait.trait.leftLabel, strongestTrait.trait.rightLabel) }) }}
              </p>
            </aside>
          </div>
        </section>

        <section v-if="primaryCharacter" class="match-breakdown-block" v-reveal>
          <h3>
            <AppIcon name="character" />
            {{ t('result.matchBreakdownTitle') }}
          </h3>
          <div class="match-breakdown-grid">
            <article class="match-breakdown-card">
              <p class="breakdown-title">{{ t('quiz.scoring.archetype') }}</p>
              <p class="archetype-id">{{ result.archetype.id }}</p>
              <p class="archetype-label">{{ archetypeMeta.label }}</p>
              <div
                v-if="result.archetype.lightSide || result.archetype.darkSide"
                class="archetype-duality"
              >
                <template v-if="result.archetype.lightSide">
                  <p class="archetype-duality-label">{{ t('result.archetypeLight') }}</p>
                  <p class="archetype-duality-text archetype-light">
                    {{ t('archetypes.' + result.archetype.id + '.lightSide', undefined, result.archetype.lightSide) }}
                  </p>
                </template>
                <template v-if="result.archetype.darkSide">
                  <p class="archetype-duality-label">{{ t('result.archetypeDark') }}</p>
                  <p class="archetype-duality-text archetype-dark">
                    {{ t('archetypes.' + result.archetype.id + '.darkSide', undefined, result.archetype.darkSide) }}
                  </p>
                </template>
              </div>
            </article>

            <article class="match-breakdown-card">
              <p class="breakdown-title">{{ t('quiz.scoring.vector') }}</p>
              <div class="vector-list">
                <div v-for="axis in vectorAxisRows" :key="axis.axis" class="vector-row">
                  <div class="vector-row-head">
                    <span>{{ axis.label }}</span>
                    <span>{{ axis.value > 0 ? '+' : '' }}{{ axis.value }}</span>
                  </div>
                  <div class="vector-track">
                    <span class="vector-center"></span>
                    <span class="vector-fill" :style="{
                      left: axis.value < 0 ? `calc(50% - ${axis.width / 2}%)` : '50%',
                      width: `${axis.width / 2}%`,
                      background: axis.value < 0 ? '#88619A' : '#33A474'
                    }"></span>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section class="analysis-grid" v-reveal>
          <article class="analysis-card good">
            <h3>
                <AppIcon name="star" />
                {{ t('result.spotlight') }}
              </h3>
            <p>{{ t('archetypes.' + result.archetype.id + '.spotlight', undefined, result.archetype.spotlight) }}</p>
          </article>
          <article class="analysis-card bad">
            <h3>
                <AppIcon name="warning" />
                {{ t('result.weakness') }}
              </h3>
            <p>{{ t('archetypes.' + result.archetype.id + '.weakness', undefined, result.archetype.weakness) }}</p>
          </article>
        </section>

        <section v-if="primaryCharacter" class="tags-block" v-reveal>
          <h3>
            <AppIcon name="character" />
            {{ t('result.tags') }}
          </h3>
          <div class="tags-wrap">
            <span v-for="tag in getLocalizedCharacterTags(primaryCharacter, locale)" :key="tag"># {{ tag }}</span>
          </div>
        </section>

        <section v-if="resultAdSlot" class="result-ad-section">
          <AdsenseSlot :slot="resultAdSlot" :label="t('app.common.sponsored')" />
        </section>
      </main>

      <aside class="result-sidebar">
        <div class="sidebar-card sidebar-poster-card">
          <div class="poster-frame">
            <div class="hero-image-stage">
              <img
                v-if="primaryCharacter?.id && !isCharacterImageBroken"
                :src="primaryCharacterImage"
                :alt="primaryCharacter ? getLocalizedCharacterName(primaryCharacter, locale) : 'Character'"
                class="hero-image"
                @error="hideBrokenImage"
              />
              <div v-else class="hero-image-fallback">
                <AppIcon name="fallback" />
              </div>
            </div>
          </div>
        </div>

        <div class="sidebar-card profile-card">
          <p class="small-title">{{ t('result.hitCharacter') }}</p>
          <h3>{{ primaryCharacter ? getLocalizedCharacterName(primaryCharacter, locale) : t('archetypes.' + result.archetype.id + '.name', undefined, result.archetype.name) }}</h3>
          <p class="profile-code">{{ displayCode }}</p>
          <p class="profile-probability">{{ t('result.matchProbability', { value: rarityDisplay }) }}</p>
        </div>

        <div class="sidebar-actions">
          <button @click="copyText">
            <AppIcon name="copy" />
            {{ t('result.share') }}
          </button>
          <p v-if="share.feedback.value" class="sidebar-feedback">{{ share.feedback.value }}</p>
        </div>

        <div class="sidebar-card relay-card">
          <p class="relay-credit">
            {{ t('result.relayCreditPrefix') }}
            <a href="https://acgti.tianxingleo.top" target="_blank" rel="noopener noreferrer">ACGTI</a>
            {{ t('result.relayCreditSuffix') }}
          </p>
          <p class="small-title">{{ t('result.relayTitle') }}</p>
          <p class="relay-copy">{{ t('result.relayCopy') }}</p>
          <p class="relay-hint">{{ t('result.relayHint') }}</p>
        </div>

        <div class="sidebar-card project-card">
          <p class="small-title">{{ t('result.ossTitle') }}</p>
          <p style="margin: 8px 0 12px; font-size: 14px; line-height: 1.5; color: #5f6b75;">
            {{ t('result.ossCopy') }}
          </p>
          <a href="https://github.com/YBWLawa0/ARKTI" target="_blank" rel="noopener noreferrer" class="project-link" style="display: flex; align-items: center; justify-content: center; gap: 6px; background: #3ba17c; color: white; border-radius: 20px; padding: 6px 12px; font-weight: 600; text-decoration: none;">
            <svg style="width: 14px; height: 14px;" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            {{ t('result.ossButton') }}
          </a>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.result-page {
  background: #f9f9f9;
  color: #333e49;
  min-height: 100vh;
  overflow-x: hidden;
  margin-left: 0;
  margin-right: 0;
  margin-bottom: -32px;
}

.result-hero {
  color: #fff;
  position: relative;
  overflow: hidden;
  padding-top: 56px;
  min-height: 90vh;
}

.result-hero--legacy-mobile {
  min-height: auto;
}

.result-hero--legacy-mobile::before {
  display: none;
}

.result-hero-image-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.result-hero-shadow-layer {
  position: absolute;
  inset: -26%;
  pointer-events: none;
  z-index: 1;
  background:
    radial-gradient(240% 240% at 50% 36%, rgba(0, 0, 0, 0.34) 0%, rgba(0, 0, 0, 0.22) 46%, rgba(0, 0, 0, 0.05) 100%),
    linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2));
}

.result-hero-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px 100px;
  display: grid;
  gap: 40px;
  grid-template-columns: 1fr;
  align-items: center;
  position: relative;
  z-index: 2;
}

@media (min-width: 768px) {
  .result-hero-inner {
    grid-template-columns: 1fr 1fr;
    padding-top: 60px;
    padding-bottom: 120px;
    gap: 60px;
  }
}

.hero-caption {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  opacity: 0.9;
  letter-spacing: 1px;
}

.hero-title {
  margin: 8px 0 0;
  font-size: clamp(48px, 8vw, 76px);
  line-height: 1.1;
  font-weight: 900;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.hero-badge-wrap {
  margin: 16px 0 0;
  display: inline-flex;
  background: rgba(255, 255, 255, 0.2);
  padding: 6px 16px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(8px);
}

.hero-code {
  font-size: clamp(24px, 4vw, 32px);
  font-weight: 800;
  letter-spacing: 2px;
}

.hero-quote {
  margin: 24px 0 0;
  max-width: 600px;
  font-size: 20px;
  line-height: 1.6;
  font-weight: 500;
  font-style: italic;
  color: rgba(193, 193, 193, 0.96);
  opacity: 0.95;
}

.hero-metrics {
  margin-top: 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.hero-metric {
  min-width: 148px;
  padding: 10px 14px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.24);
}

.hero-metric span {
  display: block;
  font-size: 12px;
  line-height: 1.4;
  opacity: 0.88;
}

.hero-metric strong {
  display: block;
  margin-top: 4px;
  font-size: 24px;
  line-height: 1;
}

.hero-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 36px;
}

.action-btn {
  border: 1px solid rgba(255, 255, 255, 0.28);
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  border-radius: 999px;
  padding: 10px 16px;
  font-weight: 700;
  display: inline-flex;
  gap: 8px;
  align-items: center;
  cursor: pointer;
}

.action-btn.light {
  background: #fff;
  border-color: #fff;
  color: #2f3a45;
}

.action-btn.ghost {
  background: transparent;
}

.hero-feedback {
  margin-top: 12px;
  font-size: 14px;
  font-weight: 700;
  opacity: 0.95;
}

.hero-visual {
  display: flex;
  justify-content: center;
  align-items: center;
  perspective: 1000px;
}

.poster-frame {
  position: relative;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.15) 0%,
    rgba(255, 255, 255, 0.05) 100%
  );
  padding: 16px 16px 40px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-right-color: rgba(255, 255, 255, 0.1);
  border-bottom-color: rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 24px 48px rgba(0, 0, 0, 0.25),
    inset 0 1px 1px rgba(255, 255, 255, 0.4),
    inset 0 0 20px rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(24px) saturate(120%);
  -webkit-backdrop-filter: blur(24px) saturate(120%);
  transform: rotate(2deg) translateY(-10px);
  max-width: 380px;
  width: 100%;
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease;
}

.poster-frame:hover {
  transform: rotate(0deg) translateY(-15px) scale(1.02);
  box-shadow: 
    0 32px 64px rgba(0, 0, 0, 0.3),
    inset 0 1px 1px rgba(255, 255, 255, 0.5),
    inset 0 0 20px rgba(255, 255, 255, 0.1);
}

.hero-image {
  width: 100%;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
}

.hero-image-stage {
  border-radius: 12px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-top-color: rgba(0, 0, 0, 0.2);
  border-left-color: rgba(0, 0, 0, 0.2);
  box-shadow: inset 0 4px 12px rgba(0, 0, 0, 0.2);
}

.hero-image-fallback {
  width: 100%;
  aspect-ratio: 1;
  background: #f4f6f8;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 80px;
  color: #cdd4d9;
}

.hero-wave {
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 64px;
  z-index: 2;
}

.hero-corner-mascot {
  position: absolute;
  left: -40px;
  bottom: 12px;
  width: 300px;
  height: 360px;
  z-index: 3;
  pointer-events: none;
  border-radius: 0;
  overflow: hidden;
  background: transparent;
  border: none;
}

.hero-corner-mascot__video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.hero-wave svg {
  width: 100%;
  height: 100%;
  display: block;
}

.hero-wave path {
  fill: #f9f9f9;
}

.result-body {
  max-width: 1280px;
  margin: 0 auto;
  padding: 26px 24px 40px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.intro-block {
  font-size: 19px;
  line-height: 1.75;
  color: #5f6b75;
  background: linear-gradient(180deg, #ffffff, #fbfdfb);
  border: 1px solid #e8ecef;
  border-radius: 18px;
  padding: 24px;
  margin-bottom: 32px;
}

.intro-block p {
  margin: 0 0 16px;
}

.intro-block p:last-child {
  margin-bottom: 0;
}

.section-title-wrap {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}

.section-index {
  width: 50px;
  height: 50px;
  border-radius: 999px;
  border: 2px solid #e4ae3a;
  color: #e4ae3a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 800;
  background: #fff;
}

.section-title {
  font-size: clamp(30px, 4vw, 44px);
  margin: 0;
  font-weight: 800;
}

.traits-card {
  background: linear-gradient(180deg, #ffffff, #fbfdfb);
  border: 1px solid #e8ecef;
  border-radius: 18px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr;
}

.traits-list {
  padding: 24px;
}

.trait-row {
  margin-bottom: 30px;
}

.trait-row:last-child {
  margin-bottom: 0;
}

.trait-percent {
  position: relative;
  width: max-content;
  transform: translateX(-50%);
  font-size: 14px;
  font-weight: 800;
  margin-bottom: 7px;
}

.trait-track {
  position: relative;
  width: 100%;
  border-radius: 999px;
  height: 6px;
}

.trait-center-marker {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 4px;
  height: 12px;
  background: rgba(255, 255, 255, 0.78);
}

.trait-handle {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 14px;
  height: 14px;
  border-radius: 999px;
  border: 3px solid;
  background: #fff;
  box-shadow: 0 2px 7px rgba(0, 0, 0, 0.16);
}

.trait-labels {
  margin-top: 9px;
  display: flex;
  justify-content: space-between;
  color: #6c7780;
  font-size: 13px;
  font-weight: 600;
}

.traits-highlight {
  border-top: 1px solid #edf0f2;
  background: #f8f9fa;
  padding: 24px;
  text-align: center;
  color: #5f6b75;
}

.traits-highlight h3 {
  margin: 5px 0 14px;
  font-size: 28px;
}

.highlight-name {
  margin: 0;
  color: #7c8791;
  font-size: 14px;
  font-weight: 700;
}

.highlight-icon-wrap {
  width: 122px;
  height: 122px;
  margin: 0 auto 14px;
  border-radius: 999px;
  border: 1px solid #e6eaed;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 52px;
  color: #a3adb6;
}

.analysis-grid {
  margin-top: 32px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.match-breakdown-block {
  margin-top: 24px;
  padding: 0;
}

.match-breakdown-block h3 {
  margin: 0 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 22px;
}

.match-breakdown-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.match-breakdown-card {
  border: 1px solid #e8ecef;
  border-radius: 12px;
  background: #fff;
  padding: 14px;
}

.breakdown-title {
  margin: 0;
  font-size: 13px;
  color: #6f7b87;
  font-weight: 800;
}

.archetype-id {
  margin: 8px 0 0;
  font-size: 22px;
  font-weight: 800;
  color: #3e4b57;
}

.archetype-label {
  margin: 4px 0 0;
  font-size: 14px;
  color: #4d5a66;
  font-weight: 700;
}

.archetype-duality {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #eef2f5;
  display: grid;
  gap: 10px;
}

.archetype-duality-label {
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.06em;
  color: #8a96a0;
  font-weight: 800;
  text-transform: uppercase;
}

.archetype-duality-text {
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
  color: #3e4b57;
  white-space: pre-line;
}

.archetype-light {
  color: #2d6a4f;
}

.archetype-dark {
  color: #5c3d6e;
}

.vector-list {
  display: grid;
  gap: 8px;
  margin-top: 8px;
}

.vector-row-head {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font-size: 13px;
  color: #4f5c68;
  font-weight: 600;
}

.vector-track {
  position: relative;
  margin-top: 5px;
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background: #edf1f4;
  overflow: hidden;
}

.vector-center {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  background: rgba(255, 255, 255, 0.8);
  z-index: 1;
}

.vector-fill {
  position: absolute;
  height: 100%;
  border-radius: 999px;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.analysis-card {
  background: linear-gradient(180deg, #ffffff, #fbfdfb);
  border: 1px solid #e8ecef;
  border-radius: 18px;
  padding: 24px;
}

.analysis-card h3 {
  margin: 0 0 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
}

.analysis-card.good h3 {
  color: #33a474;
}

.analysis-card.bad h3 {
  color: #e26666;
}

.analysis-card p {
  margin: 0;
  line-height: 1.7;
  color: #596671;
}

.tags-block {
  margin-top: 24px;
  background: linear-gradient(180deg, #ffffff, #fbfdfb);
  border: 1px solid #e8ecef;
  border-radius: 18px;
  padding: 24px;
}

.tags-block h3 {
  margin: 0 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 22px;
}

.tags-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tags-wrap span {
  border: 1px solid #e4e8eb;
  background: #f7f8f9;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 700;
  color: #596671;
}

.result-ad-section {
  margin-top: 24px;
}

.result-sidebar {
  position: relative;
}

.sidebar-card {
  background: linear-gradient(180deg, #ffffff, #fbfdfb);
  border: 1px solid #e7eaed;
  border-radius: 18px;
  padding: 20px;
  margin-bottom: 16px;
}

.sidebar-poster-card {
  display: none;
  padding: 14px;
  background: #fff;
}

.sidebar-poster-card .poster-frame {
  transform: none;
  max-width: none;
  border: 0;
  border-radius: 14px;
  padding: 12px;
  background: #f8f9fb;
  box-shadow: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.sidebar-poster-card .poster-frame:hover {
  transform: none;
  box-shadow: none;
}

.sidebar-poster-card .hero-image-stage {
  padding: 8px;
  border-radius: 12px;
  background: #fff;
  border: 1px solid #edf0f2;
  box-shadow: none;
}

.sidebar-poster-card .hero-image {
  width: 100%;
  max-width: 280px;
  display: block;
  margin: 0 auto;
}

.small-title {
  margin: 0;
  color: #7b8690;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.profile-card h3 {
  margin: 8px 0 2px;
  font-size: 28px;
}

.profile-code {
  margin: 0;
  color: #e4ae3a;
  font-size: 24px;
  font-weight: 800;
}

.profile-probability {
  margin: 10px 0 0;
  color: #5f6b75;
  font-size: 14px;
  font-weight: 700;
}

.nav-card {
  display: grid;
  gap: 2px;
}

.nav-card a {
  color: #4c5863;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  padding: 8px 4px;
  border-radius: 8px;
}

.nav-card a:hover {
  background: #f4f7f9;
  color: #2f3a45;
}

.sidebar-actions {
  display: grid;
  gap: 8px;
}

.sidebar-actions button {
  width: 100%;
  border: 1px solid #dbe1e5;
  background: #fff;
  color: #4c5863;
  border-radius: 999px;
  font-weight: 700;
  font-size: 14px;
  padding: 10px 14px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.sidebar-actions button:hover {
  border-color: #c8d0d7;
}

.sidebar-feedback {
  margin: 8px 0 0;
  font-size: 13px;
  font-weight: 700;
  color: #33a474;
  text-align: center;
}

.relay-card {
  background: linear-gradient(180deg, #ffffff, #f6fbf8);
  border-color: #d9e9e1;
}

.relay-copy {
  margin: 8px 0 0;
  font-size: 14px;
  line-height: 1.65;
  color: #4f5d67;
}

.relay-credit {
  margin: 0 0 10px;
  font-size: 13px;
  line-height: 1.6;
  color: #5f6b75;
}

.relay-credit a {
  color: #e4ae3a;
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.relay-credit a:hover {
  opacity: 0.88;
}

.relay-hint {
  margin: 10px 0 0;
  font-size: 12px;
  line-height: 1.6;
  color: #7b8690;
  font-weight: 600;
}

.project-card {
  text-align: center;
}

.project-link {
  display: inline-block;
  margin-top: 6px;
  color: #33a474;
  font-weight: 700;
  font-size: 14px;
  text-decoration: none;
}

.project-link:hover {
  text-decoration: underline;
}

.project-cta {
  margin: 6px 0 0;
  font-size: 12px;
  color: #7b8690;
  font-weight: 600;
}

@media (min-width: 960px) {
  .result-hero-inner {
    grid-template-columns: 1fr;
    align-items: center;
    padding-bottom: 120px;
  }

  .hero-visual.poster-box {
    display: none;
  }

  .result-body {
    grid-template-columns: minmax(0, 68%) minmax(280px, 32%);
    align-items: start;
    gap: 28px;
    margin-top: -30px;
  }

  .result-sidebar {
    position: sticky;
    top: 94px;
  }

  .sidebar-poster-card {
    display: block;
  }

  .traits-card {
    grid-template-columns: 65% 35%;
  }

  .traits-highlight {
    border-top: 0;
    border-left: 1px solid #edf0f2;
  }

  .analysis-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .match-breakdown-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .result-hero {
    padding-top: 34px;
    min-height: 560px;
  }

  .result-hero-inner,
  .result-body {
    padding-left: 20px;
    padding-right: 20px;
  }

  .result-hero-inner {
    padding-top: 22px;
    padding-bottom: 72px;
    gap: 16px;
  }

  .hero-caption {
    font-size: 20px;
  }

  .hero-title {
    font-size: clamp(34px, 10vw, 48px);
  }

  .hero-code {
    font-size: clamp(22px, 6vw, 30px);
  }

  .hero-quote {
    font-size: 16px;
    line-height: 1.6;
    margin-top: 14px;
  }

  .hero-metrics {
    gap: 8px;
  }

  .hero-metric {
    flex: 1 1 140px;
    min-width: 0;
    padding: 10px 12px;
  }

  .hero-metric strong {
    font-size: 21px;
  }

  .hero-image {
    width: min(320px, 100%);
  }

  .hero-wave {
    height: 50px;
  }

  .hero-corner-mascot {
    left: 24px;
    bottom: 24px;
    width: 128px;
    height: 156px;
  }

  .result-body {
    padding-top: 16px;
    padding-bottom: 24px;
    gap: 16px;
  }

  .traits-section,
  .analysis-grid,
  .tags-block,
  .result-sidebar {
    margin-left: 2px;
    margin-right: 2px;
  }

  .intro-block {
    font-size: 16px;
    line-height: 1.7;
  }

  .section-title-wrap {
    gap: 10px;
    margin-bottom: 12px;
  }

  .section-index {
    width: 40px;
    height: 40px;
    font-size: 19px;
  }

  .section-title {
    font-size: 28px;
  }

  .traits-list,
  .traits-highlight,
  .analysis-card,
  .tags-block,
  .sidebar-card {
    padding: 14px;
  }

  .trait-row {
    margin-bottom: 22px;
  }

  .trait-percent {
    font-size: 12px;
  }

  .trait-labels {
    font-size: 12px;
    gap: 10px;
  }

  .analysis-card h3,
  .tags-block h3,
  .match-breakdown-block h3 {
    font-size: 18px;
  }

  .hero-actions {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .action-btn {
    justify-content: center;
    width: 100%;
    min-height: 42px;
    font-size: 14px;
    padding: 8px 12px;
  }

  .result-sidebar {
    position: static;
  }

  .sidebar-poster-card {
    display: none;
  }

  .result-hero--legacy-mobile {
    min-height: auto;
  }

  .result-hero--legacy-mobile .hero-visual {
    margin-top: 24px;
  }

  .result-hero--legacy-mobile .poster-frame {
    background: #fff;
    padding: 16px 16px 40px;
    border-radius: 12px;
    border: 0;
    box-shadow:
      0 20px 40px rgba(0, 0, 0, 0.15),
      0 1px 3px rgba(0, 0, 0, 0.05);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    transform: rotate(2deg) translateY(-10px);
  }

  .result-hero--legacy-mobile .poster-frame:hover {
    transform: rotate(0deg) translateY(-15px) scale(1.02);
    box-shadow:
      0 30px 60px rgba(0, 0, 0, 0.2),
      0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .result-hero--legacy-mobile .hero-image {
    background: #f4f6f8;
    border: 1px solid #edf0f2;
    display: block;
    margin: 0 auto;
  }

  .result-hero--legacy-mobile .hero-image-fallback {
    margin: 0 auto;
  }
}

@media (max-width: 520px) {
  .result-hero-inner,
  .result-body {
    padding-left: 14px;
    padding-right: 14px;
  }

  .hero-title {
    font-size: clamp(30px, 10vw, 40px);
  }

  .hero-caption {
    font-size: 18px;
  }

  .hero-code {
    font-size: 22px;
  }

  .hero-image {
    width: min(270px, 100%);
  }

  .result-body {
    gap: 14px;
  }

  .trait-labels {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .profile-card h3 {
    font-size: 24px;
  }

  .profile-code {
    font-size: 21px;
  }

  .sidebar-card,
  .analysis-card,
  .traits-list,
  .traits-highlight,
  .tags-block,
  .match-breakdown-block {
    border-radius: 14px;
  }
}

</style>
