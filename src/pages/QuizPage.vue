<template>
  <div class="quiz-page-16p">
    <Teleport to="body">
      <div class="quiz-top-progress-bar" :aria-label="t('quiz.progressBarAria')">
        <div 
          v-for="(_, idx) in questions" 
          :key="idx" 
          class="progress-block" 
          :class="{ 'is-answered': state.answers[idx] !== undefined && isAnsweredValue(state.answers[idx]) }"
          @click="jumpToUnansweredQuestion(idx)"
          :aria-label="t('quiz.jumpQuestionAria', { index: idx + 1 })"
        ></div>
      </div>
    </Teleport>

    <main class="quiz-main">
      <section class="hero">
        <h1>{{ t('quiz.heroTitle') }}</h1>
        <p>ARKTI</p>
      </section>

      <section class="step-cards" :aria-label="t('quiz.stepsAria')">
        <article v-for="(item, i) in tm<string[][]>('quiz.steps')" :key="i" class="step-card" :class="i === 0 ? 'step-teal' : i === 1 ? 'step-green' : 'step-purple'">
          <span class="step-pill">{{ item[0] }}</span>
          <h3>{{ item[1] }}</h3>
          <p>{{ item[2] }}</p>
        </article>
      </section>

      <section class="quiz-notice" :aria-label="t('quiz.noticeAria')">
        <p>{{ t('quiz.noticeA', { count: questions.length }) }}</p>
        <p>{{ t('quiz.noticeB') }}</p>
      </section>

      <section v-if="latestResult" class="detail-toggle-bar" :aria-label="t('quiz.detailToggleAria')">
        <button
          class="detail-toggle-action detail-toggle-collapse"
          type="button"
          @click="collapseAllQuestionDetails"
        >
          {{ t('quiz.detailCollapseAll') }}
        </button>
        <button
          class="detail-toggle-action detail-toggle-expand"
          type="button"
          @click="expandAllQuestionDetails"
        >
          {{ t('quiz.detailExpandAll') }}
        </button>
      </section>
      <section v-else class="detail-toggle-bar detail-toggle-bar-placeholder">
        <div class="placeholder-box">
          <p>{{ t('quiz.detailPlaceholder') }}</p>
        </div>
      </section>

      <transition name="live-metrics-reveal">
        <aside
          v-if="latestResult && liveMetricsVisible"
          class="live-metrics-panel"
          :class="{ 'is-minimized': isLiveMetricsMinimized, 'is-positioned': !!liveMetricsPanelPosition }"
          :style="liveMetricsPanelStyle"
          ref="liveMetricsPanelRef"
          :aria-label="t('quiz.liveMetrics.aria')"
        >
          <div
            class="live-metrics-head"
            :class="{ 'is-dragging': liveMetricsDragActive }"
            @mousedown="onLiveMetricsHeadMouseDown"
          >
            <div class="live-metrics-title-row">
              <h3>{{ t('quiz.liveMetrics.title') }}</h3>
              <div class="live-metrics-actions">
                <button
                  type="button"
                  class="live-metrics-action-btn"
                  :aria-label="isLiveMetricsMinimized ? t('quiz.liveMetrics.expandAria') : t('quiz.liveMetrics.minimizeAria')"
                  @click="toggleLiveMetricsMinimized"
                >
                  {{ isLiveMetricsMinimized ? '□' : '－' }}
                </button>
                <button
                  type="button"
                  class="live-metrics-close live-metrics-action-btn"
                  :aria-label="t('quiz.liveMetrics.closeAria')"
                  @click="toggleLiveMetricsPanel"
                >
                  ×
                </button>
              </div>
            </div>
            <p>{{ t('quiz.liveMetrics.subtitle') }}</p>
          </div>

          <div class="live-metrics-scroll">
            <section v-if="!isLiveMetricsMinimized || currentMiniMetricsSection === 'mbti'" class="live-section">
              <h4>{{ t('quiz.liveMetrics.sections.mbti') }}</h4>
              <div class="live-list">
                <div v-for="item in liveMetrics.mbtiRows" :key="`mbti-${item.pair}`" class="live-trait-row">
                  <div class="live-row">
                    <span>{{ item.pair }}</span>
                    <span>{{ t('quiz.liveMetrics.dominantPath', { code: item.dominant, percentage: item.percentage }) }}</span>
                  </div>
                  <div class="live-trait-track-wrap">
                    <div class="trait-track" :style="{ backgroundColor: getMbtiColor(item.pair) }">
                      <span class="trait-center-marker"></span>
                      <span
                        class="trait-handle"
                        :style="{
                          left: `calc(${getLiveMbtiRowHandlePosition(item.pair, item.dominant, item.percentage)}% - 6px)`,
                          borderColor: getMbtiColor(item.pair),
                        }"
                      ></span>
                    </div>
                    <div class="live-trait-labels">
                      <span>{{ item.pair[0] }}</span>
                      <span>{{ item.pair[2] }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section v-if="!isLiveMetricsMinimized || currentMiniMetricsSection === 'archetype'" class="live-section">
              <h4>{{ t('quiz.liveMetrics.sections.archetype') }}</h4>
              <div class="live-list">
                <div v-for="item in liveMetrics.archetypeRows" :key="`arch-${item.id}`" class="live-row">
                  <span>{{ item.label }}</span>
                  <span>{{ item.score }}%</span>
                </div>
              </div>
            </section>

            <section v-if="!isLiveMetricsMinimized || currentMiniMetricsSection === 'vector'" class="live-section">
              <h4>{{ t('quiz.liveMetrics.sections.vector') }}</h4>
              <div class="live-vector-list">
                <div v-for="axis in liveMetrics.vectorRows" :key="`vector-${axis.axis}`" class="live-vector-row">
                  <div class="live-row">
                    <span>{{ axis.label }}</span>
                    <span>{{ axis.value }}</span>
                  </div>
                  <div class="live-vector-track">
                    <span class="live-vector-center"></span>
                    <span class="live-vector-fill" :style="{
                      left: axis.value < 0 ? `calc(50% - ${axis.width / 2}%)` : '50%',
                      width: `${axis.width / 2}%`,
                      background: axis.value < 0 ? '#88619A' : '#33A474'
                    }"></span>
                  </div>
                </div>
              </div>
            </section>

            <section v-if="!isLiveMetricsMinimized || currentMiniMetricsSection === 'character'" class="live-section">
              <h4>{{ t('quiz.liveMetrics.sections.character') }}</h4>
              <div v-if="liveMetrics.characterRows.length" class="live-list">
                <div v-for="item in liveMetrics.characterRows" :key="`char-${item.id}`" class="live-row">
                  <span>{{ item.name }}</span>
                  <span>{{ item.score }}%</span>
                </div>
              </div>
              <p v-else class="live-note">{{ t('quiz.liveMetrics.noCharacterBonus') }}</p>
            </section>

            <section v-if="!isLiveMetricsMinimized || currentMiniMetricsSection === 'final'" class="live-section">
              <h4>{{ t('quiz.liveMetrics.sections.final') }}</h4>
              <div class="live-list">
                <div v-for="item in liveMetrics.liveFinalTopRows" :key="`final-${item.id}`" class="live-row">
                  <span>{{ item.name }}</span>
                  <span>{{ item.score }}%</span>
                </div>
              </div>
            </section>
          </div>
          <div v-if="isLiveMetricsMinimized" class="live-metrics-mini-nav" :aria-label="t('quiz.liveMetrics.miniNavAria')">
            <button
              type="button"
              class="live-metrics-mini-arrow"
              :aria-label="t('quiz.liveMetrics.prevAria')"
              @click="goPrevMiniMetricsSection"
            >
              ‹
            </button>
            <div class="live-metrics-mini-dots">
              <button
                v-for="(item, idx) in MINI_METRICS_SECTIONS"
                :key="item.key"
                type="button"
                class="live-metrics-mini-dot"
                :class="{ active: idx === miniMetricsSectionIndex }"
                :aria-label="t('quiz.liveMetrics.switchToAria', { label: item.label })"
                :aria-pressed="idx === miniMetricsSectionIndex"
                @click="setMiniMetricsSectionIndex(idx)"
              ></button>
            </div>
            <button
              type="button"
              class="live-metrics-mini-arrow"
              :aria-label="t('quiz.liveMetrics.nextAria')"
              @click="goNextMiniMetricsSection"
            >
              ›
            </button>
          </div>
        </aside>
      </transition>

      <section class="question-list" :aria-label="t('quiz.questionListAria')">
        <article
          v-for="(question, idx) in questions"
          :key="question.id"
          class="question-block"
          :class="{ 
            'needs-answer': pendingUnansweredIndex === idx,
            'upcoming-dimmed': idx > firstUnansweredIndex && state.answers[idx] === undefined
          }"
          :ref="(el) => setQuestionRef(el, idx)"
          v-reveal
        >
          <div class="question-head">
            <h2>{{ t('quiz.questions.' + bankIndexFor(question), undefined, (question.text || question.prompt || t('quiz.missingQuestion'))) }}</h2>
          </div>

          <div class="question-scale">
            <span class="agree-label">{{ t('quiz.agree') }}</span>

            <div class="scale-buttons" role="radiogroup" :aria-label="t('quiz.questionLabel', { index: idx + 1 })">
              <button
                v-for="option in scaleOptions"
                :key="option.value"
                type="button"
                class="scale-btn"
                :class="[
                  option.sizeClass,
                  option.side === 'agree' ? 'agree-ring' : option.side === 'disagree' ? 'disagree-ring' : 'neutral-ring',
                  { selected: state.answers[idx] === option.value }
                ]"
                :aria-checked="state.answers[idx] === option.value"
                :aria-label="option.label"
                @click="onSelect(idx, option.value)"
              >
                <span class="checkmark" v-if="state.answers[idx] === option.value">✓</span>
              </button>
            </div>

            <span class="disagree-label">{{ t('quiz.disagree') }}</span>
          </div>

          <div class="mobile-labels">
            <span class="agree-label">{{ t('quiz.agree') }}</span>
            <span class="disagree-label">{{ t('quiz.disagree') }}</span>
          </div>

          <div v-if="latestResult && isQuestionDetailVisible(question.id)" class="scoring-cards-container">
            <article class="scoring-card" @mousemove="onCardMouseMove" @mouseleave="onCardMouseLeave">
              <div class="card-header">
                <span class="card-icon">✨</span>
                <p class="scoring-title">{{ t('quiz.scoring.mbti') }}</p>
              </div>
              <p class="mbti-pair">
                <span :class="{ 'mbti-dominant': getLiveMbtiDominant(question, idx) === question.dimension[0] }">{{ question.dimension[0] }}</span><span class="mbti-sep">_</span><span :class="{ 'mbti-dominant': getLiveMbtiDominant(question, idx) === question.dimension[2] }">{{ question.dimension[2] }}</span>
              </p>
              <div class="mbti-live-track-wrap">
                <div class="trait-track" :style="{ backgroundColor: getMbtiColor(question.dimension) }">
                  <span class="trait-center-marker"></span>
                  <span
                    class="trait-handle"
                    :style="{
                      left: `calc(${getLiveMbtiHandlePosition(idx)}% - 7px)`,
                      borderColor: getMbtiColor(question.dimension),
                    }"
                  ></span>
                </div>
                <div class="trait-labels">
                  <span :class="{ 'mbti-label-active': state.answers[idx] !== undefined && state.answers[idx]! > 0 }">{{ t('quiz.scoring.agreeTendency', { value: getMbtiDimensionHint(question).agree }) }}</span>
                  <span :class="{ 'mbti-label-active': state.answers[idx] !== undefined && state.answers[idx]! < 0 }">{{ t('quiz.scoring.disagreeTendency', { value: getMbtiDimensionHint(question).disagree }) }}</span>
                </div>
              </div>
            </article>

            <article class="scoring-card" @mousemove="onCardMouseMove" @mouseleave="onCardMouseLeave">
              <div class="card-header">
                <span class="card-icon">✨</span>
                <p class="scoring-title">{{ t('quiz.scoring.archetype') }}</p>
              </div>
              <div class="score-list">
                <div v-for="item in getQuestionArchetypeRows(question)" :key="`${question.id}-${item.archetypeId}`" class="score-row">
                  <span>{{ item.name }}</span>
                  <span :class="item.value >= 0 ? 'score-positive' : 'score-negative'">
                    {{ item.value >= 0 ? '+' : '-' }}{{ Math.round(Math.abs(item.value) * 100) }}%
                  </span>
                </div>
              </div>
            </article>

            <article class="scoring-card" @mousemove="onCardMouseMove" @mouseleave="onCardMouseLeave">
              <div class="card-header">
                <span class="card-icon">✨</span>
                <p class="scoring-title">{{ t('quiz.scoring.vector') }}</p>
              </div>
              <div class="score-list">
                <div v-for="axis in getQuestionVectorRows(question)" :key="`${question.id}-${axis.axis}`" class="vector-score-item">
                  <div class="score-row">
                    <span>{{ axis.label }}</span>
                    <span :class="axis.value >= 0 ? 'score-positive' : 'score-negative'">
                      {{ axis.scorePercent > 0 ? '+' : '' }}{{ axis.scorePercent }}%
                    </span>
                  </div>
                  <div class="vector-score-track">
                    <span class="vector-score-center"></span>
                    <span class="vector-score-fill" :style="{
                      left: axis.value < 0 ? `calc(50% - ${axis.percent / 2}%)` : '50%',
                      width: `${axis.percent / 2}%`,
                      background: axis.value < 0 ? '#88619A' : '#33A474'
                    }"></span>
                  </div>
                </div>
              </div>
            </article>

            <article class="scoring-card" @mousemove="onCardMouseMove" @mouseleave="onCardMouseLeave">
              <div class="card-header">
                <span class="card-icon">✨</span>
                <p class="scoring-title">{{ t('quiz.scoring.character') }}</p>
              </div>
              <div v-if="getQuestionAffinityRows(question.id).length" class="score-list">
                <div v-for="(affinity, i) in getQuestionAffinityRows(question.id)" :key="`${question.id}-${affinity.characterName}-${i}`" class="score-row">
                  <span>{{ t('quiz.scoring.affinityExpected', { character: affinity.characterName, expected: EXPECTED_LABELS[affinity.expected] }) }}</span>
                  <span>{{ t('quiz.scoring.weight', { value: affinity.weight }) }}</span>
                </div>
              </div>
              <p v-else class="feature-subtitle">{{ t('quiz.scoring.noAffinity') }}</p>
            </article>
          </div>

          <div class="question-detail-toggle-row" v-if="latestResult">
            <button
              class="question-detail-toggle"
              type="button"
              :aria-expanded="isQuestionDetailVisible(question.id)"
              :aria-label="isQuestionDetailVisible(question.id) ? t('quiz.detailCollapseOneAria') : t('quiz.detailExpandOneAria')"
              @click="toggleQuestionDetail(question.id)"
            >
              {{ isQuestionDetailVisible(question.id) ? t('quiz.detailCollapseOne') : t('quiz.detailExpandOne') }}
            </button>
          </div>
        </article>
      </section>

      <section class="result-form-card">
        <div class="submit-row">
          <p class="progress-hint">{{ t('quiz.progressHint', { answered: answeredCount, total: questions.length }) }}</p>
          <button
            class="submit-btn"
            type="button"
            @click="submitQuiz"
          >
            {{ t('quiz.submit') }}
          </button>
        </div>
      </section>
    </main>

    <footer class="quiz-footer">
      <div class="quiz-footer-inner">
        <div class="share-count">{{ t('quiz.footerCount', { count: questions.length }) }}</div>
        <div class="footer-links">
          <RouterLink to="/">{{ tm<Record<string, string>>('app.footer.social').home }}</RouterLink>
          <RouterLink to="/about">{{ tm<Record<string, string>>('app.footer.social').about }}</RouterLink>
          <RouterLink to="/result">{{ t('app.nav.result') }}</RouterLink>
          <span>{{ t('quiz.footerLocal') }}</span>
        </div>
        <p>{{ t('app.footer.copyright', undefined, '© 2026 ARKTI Project') }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, computed, watch, onBeforeUnmount } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import { useRouter } from 'vue-router'

import { useQuiz } from '../composables/useQuiz'
import { useI18n } from '../i18n'
import { getLocalizedCharacterName } from '../i18n/characters'
import type {
  ArchetypeId,
  DimensionId,
  DimensionPair,
  DimensionScore,
  MBTILetter,
  Question,
  QuestionArchetypeWeightId,
} from '../types/quiz'
import { submitResultStats } from '../utils/stats'
import { rankCharactersByProfile, scoreArchetypeRelative } from '../utils/quizEngine'

type ScaleSide = 'agree' | 'neutral' | 'disagree'

interface ScaleOption {
  value: number
  label: string
  side: ScaleSide
  sizeClass: string
}

const router = useRouter()
const {
  questions,
  questionMessageIndex,
  archetypes,
  characters,
  state,
  liveMetricsVisible,
  answeredCount,
  isComplete,
  latestResult,
  firstUnansweredIndex,
  jumpToQuestion,
  selectOptionAt,
  finalizeQuiz,
  toggleLiveMetricsPanel,
} = useQuiz()

function bankIndexFor(question: { id: string }) {
  const i = questionMessageIndex(question.id)
  return i >= 0 ? i : 0
}
const { locale, t, tm } = useI18n()

const questionRefs = ref<HTMLElement[]>([])
const pendingUnansweredIndex = ref<number | null>(null)
const questionDetailVisibility = ref<Record<string, boolean>>({})
const isLiveMetricsMinimized = ref(false)
const MINI_METRICS_SECTIONS = computed(() => ([
  { key: 'mbti', label: t('quiz.liveMetrics.sections.mbti') },
  { key: 'archetype', label: t('quiz.liveMetrics.sections.archetype') },
  { key: 'vector', label: t('quiz.liveMetrics.sections.vector') },
  { key: 'character', label: t('quiz.liveMetrics.sections.characterShort') },
  { key: 'final', label: t('quiz.liveMetrics.sections.finalShort') },
] as const))
const miniMetricsSectionIndex = ref(0)
const currentMiniMetricsSection = computed(
  () => MINI_METRICS_SECTIONS.value[miniMetricsSectionIndex.value]?.key ?? 'mbti',
)
const liveMetricsPanelRef = ref<HTMLElement | null>(null)
const liveMetricsPanelPosition = ref<{ top: number; left: number } | null>(null)
const liveMetricsDragActive = ref(false)
let unansweredHighlightTimer: ReturnType<typeof setTimeout> | null = null
let liveMetricsLongPressTimer: ReturnType<typeof setTimeout> | null = null
let isLiveMetricsMousePressed = false
let dragOffsetX = 0
let dragOffsetY = 0
let liveMetricsPressClientX = 0
let liveMetricsPressClientY = 0
let liveMetricsLatestClientX = 0
let liveMetricsLatestClientY = 0
const LIVE_METRICS_LONG_PRESS_MS = 60
const LIVE_METRICS_DRAG_PADDING = 8
const LIVE_METRICS_DRAG_START_DISTANCE = 4

const liveMetricsPanelStyle = computed(() => {
  if (!liveMetricsPanelPosition.value) return undefined
  return {
    top: `${liveMetricsPanelPosition.value.top}px`,
    left: `${liveMetricsPanelPosition.value.left}px`,
    right: 'auto',
    bottom: 'auto',
  }
})

function toggleLiveMetricsMinimized() {
  isLiveMetricsMinimized.value = !isLiveMetricsMinimized.value
}

function goPrevMiniMetricsSection() {
  miniMetricsSectionIndex.value =
    (miniMetricsSectionIndex.value - 1 + MINI_METRICS_SECTIONS.value.length) % MINI_METRICS_SECTIONS.value.length
}

function goNextMiniMetricsSection() {
  miniMetricsSectionIndex.value = (miniMetricsSectionIndex.value + 1) % MINI_METRICS_SECTIONS.value.length
}

function setMiniMetricsSectionIndex(nextIndex: number) {
  if (nextIndex < 0 || nextIndex >= MINI_METRICS_SECTIONS.value.length) return
  miniMetricsSectionIndex.value = nextIndex
}

function isDesktopDragAllowed(event: MouseEvent) {
  if (event.button !== 0) return false
  return window.matchMedia('(min-width: 1281px)').matches
}

function clampLiveMetricsPosition(top: number, left: number) {
  const panel = liveMetricsPanelRef.value
  if (!panel) return { top, left }
  const rect = panel.getBoundingClientRect()
  const maxLeft = Math.max(LIVE_METRICS_DRAG_PADDING, window.innerWidth - rect.width - LIVE_METRICS_DRAG_PADDING)
  const maxTop = Math.max(LIVE_METRICS_DRAG_PADDING, window.innerHeight - rect.height - LIVE_METRICS_DRAG_PADDING)
  return {
    top: Math.min(maxTop, Math.max(LIVE_METRICS_DRAG_PADDING, top)),
    left: Math.min(maxLeft, Math.max(LIVE_METRICS_DRAG_PADDING, left)),
  }
}

function clearLiveMetricsLongPressTimer() {
  if (!liveMetricsLongPressTimer) return
  clearTimeout(liveMetricsLongPressTimer)
  liveMetricsLongPressTimer = null
}

function activateLiveMetricsDragging(clientX: number, clientY: number) {
  const panel = liveMetricsPanelRef.value
  if (!panel) return false
  const rect = panel.getBoundingClientRect()
  dragOffsetX = clientX - rect.left
  dragOffsetY = clientY - rect.top
  liveMetricsPanelPosition.value = clampLiveMetricsPosition(rect.top, rect.left)
  liveMetricsDragActive.value = true
  document.body.style.userSelect = 'none'
  clearLiveMetricsLongPressTimer()
  return true
}

function stopLiveMetricsDragging() {
  clearLiveMetricsLongPressTimer()
  isLiveMetricsMousePressed = false
  window.removeEventListener('mousemove', onLiveMetricsMouseMove)
  window.removeEventListener('mouseup', onLiveMetricsMouseUp)
  if (liveMetricsDragActive.value) liveMetricsDragActive.value = false
  document.body.style.userSelect = ''
}

function onLiveMetricsMouseMove(event: MouseEvent) {
  liveMetricsLatestClientX = event.clientX
  liveMetricsLatestClientY = event.clientY
  if (!isLiveMetricsMousePressed) return
  if (!liveMetricsDragActive.value) {
    const movedX = Math.abs(event.clientX - liveMetricsPressClientX)
    const movedY = Math.abs(event.clientY - liveMetricsPressClientY)
    const shouldStartDrag = movedX >= LIVE_METRICS_DRAG_START_DISTANCE || movedY >= LIVE_METRICS_DRAG_START_DISTANCE
    if (!shouldStartDrag) return
    if (!activateLiveMetricsDragging(event.clientX, event.clientY)) return
  }
  event.preventDefault()
  const nextTop = event.clientY - dragOffsetY
  const nextLeft = event.clientX - dragOffsetX
  liveMetricsPanelPosition.value = clampLiveMetricsPosition(nextTop, nextLeft)
}

function onLiveMetricsMouseUp() {
  stopLiveMetricsDragging()
}

function onLiveMetricsHeadMouseDown(event: MouseEvent) {
  if (!isDesktopDragAllowed(event)) return
  if ((event.target as HTMLElement).closest('.live-metrics-action-btn')) return
  event.preventDefault()
  clearLiveMetricsLongPressTimer()
  const panel = liveMetricsPanelRef.value
  if (!panel) return
  isLiveMetricsMousePressed = true
  liveMetricsPressClientX = event.clientX
  liveMetricsPressClientY = event.clientY
  liveMetricsLatestClientX = event.clientX
  liveMetricsLatestClientY = event.clientY
  document.body.style.userSelect = 'none'
  window.addEventListener('mousemove', onLiveMetricsMouseMove)
  window.addEventListener('mouseup', onLiveMetricsMouseUp)
  liveMetricsLongPressTimer = setTimeout(() => {
    if (!isLiveMetricsMousePressed) return
    activateLiveMetricsDragging(liveMetricsLatestClientX, liveMetricsLatestClientY)
  }, LIVE_METRICS_LONG_PRESS_MS)
}

watch(
  liveMetricsVisible,
  (visible) => {
    if (!visible) {
      stopLiveMetricsDragging()
    }
  },
)

onBeforeUnmount(() => {
  stopLiveMetricsDragging()
})

watch(
  questions,
  (list) => {
    const nextState: Record<string, boolean> = {}
    list.forEach((question) => {
      nextState[question.id] = questionDetailVisibility.value[question.id] ?? true
    })
    questionDetailVisibility.value = nextState
  },
  { immediate: true },
)

function isQuestionDetailVisible(questionId: string) {
  return questionDetailVisibility.value[questionId] ?? true
}

function toggleQuestionDetail(questionId: string) {
  questionDetailVisibility.value[questionId] = !isQuestionDetailVisible(questionId)
}

function collapseAllQuestionDetails() {
  const nextState: Record<string, boolean> = {}
  questions.value.forEach((question) => {
    nextState[question.id] = false
  })
  questionDetailVisibility.value = nextState
}

function expandAllQuestionDetails() {
  const nextState: Record<string, boolean> = {}
  questions.value.forEach((question) => {
    nextState[question.id] = true
  })
  questionDetailVisibility.value = nextState
}

const scaleOptions = computed<ScaleOption[]>(() => {
  const scaleTitles = tm<string[]>('quiz.scale')
  return [
    { value: 3, label: scaleTitles[0], side: 'agree', sizeClass: 'size-xl' },
    { value: 2, label: scaleTitles[1], side: 'agree', sizeClass: 'size-lg' },
    { value: 1, label: scaleTitles[2], side: 'agree', sizeClass: 'size-md' },
    { value: 0, label: scaleTitles[3], side: 'neutral', sizeClass: 'size-sm' },
    { value: -1, label: scaleTitles[4], side: 'disagree', sizeClass: 'size-md' },
    { value: -2, label: scaleTitles[5], side: 'disagree', sizeClass: 'size-lg' },
    { value: -3, label: scaleTitles[6], side: 'disagree', sizeClass: 'size-xl' },
  ]
})

function onSelect(questionIndex: number, value: number) {
  selectOptionAt(questionIndex, value)
}

function onCardMouseMove(event: MouseEvent) {
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const x = event.clientX - rect.left // x position within the element
  const y = event.clientY - rect.top  // y position within the element
  const centerX = rect.width / 2
  const centerY = rect.height / 2
  
  // Calculate rotation (max 8 degrees for a subtle effect)
  const rotateX = ((y - centerY) / centerY) * -8
  const rotateY = ((x - centerX) / centerX) * 8
  
  target.style.setProperty('--rx', `${rotateX}deg`)
  target.style.setProperty('--ry', `${rotateY}deg`)
}

function onCardMouseLeave(event: MouseEvent) {
  const target = event.currentTarget as HTMLElement
  target.style.setProperty('--rx', `0deg`)
  target.style.setProperty('--ry', `0deg`)
}

const ROLE_TO_ARCHETYPE: Record<QuestionArchetypeWeightId, ArchetypeId> = {
  hero: 'luminous-lead',
  strategist: 'shadow-strategist',
  guardian: 'moonlit-guardian',
  lonewolf: 'icebound-observer',
  healer: 'gentle-healer',
  berserker: 'chaos-spark',
  trickster: 'trickster-orbit',
  ruler: 'oathbound-captain',
}

const QUESTION_ROLE_BALANCE: Record<QuestionArchetypeWeightId, number> = {
  hero: 1,
  strategist: 1,
  guardian: 1,
  lonewolf: 1,
  healer: 1,
  berserker: 1,
  trickster: 1,
  ruler: 1,
}

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

/** Keep this aligned with quizEngine DIMENSION_LETTERS: the first pole scores positive, the second scores negative. */
const mbtiPoleLabels = computed<Record<DimensionPair, { positive: string; negative: string }>>(() => {
  const labels = tm<Record<string, string[]>>('result.dimensions')
  return {
    E_I: { positive: `${labels.E_I[0]} (E)`, negative: `${labels.E_I[1]} (I)` },
    S_N: { positive: `${labels.S_N[0]} (S)`, negative: `${labels.S_N[1]} (N)` },
    T_F: { positive: `${labels.T_F[0]} (T)`, negative: `${labels.T_F[1]} (F)` },
    J_P: { positive: `${labels.J_P[0]} (J)`, negative: `${labels.J_P[1]} (P)` },
  }
})

function getMbtiDimensionHint(question: Question) {
  const { positive, negative } = mbtiPoleLabels.value[question.dimension]
  if (question.sign > 0) {
    return { agree: positive, disagree: negative }
  }
  return { agree: negative, disagree: positive }
}

const MBTI_COLORS: Record<DimensionPair, string> = {
  E_I: '#4298B4',
  S_N: '#E4AE3A',
  T_F: '#33A474',
  J_P: '#88619A',
}

function getMbtiColor(dimension: DimensionPair) {
  return MBTI_COLORS[dimension] || '#4c5965'
}

function getLiveMbtiHandlePosition(idx: number) {
  const answer = state.answers[idx]
  if (answer === undefined || answer === 0) return 50
  return 50 - (answer / 3) * 50
}

function getLiveMbtiRowHandlePosition(pair: DimensionPair, dominant: string, percentage: number) {
  const leftCode = pair[0]
  if (dominant === leftCode) {
    return 50 - (percentage - 50)
  }
  return 50 + (percentage - 50)
}

function getLiveMbtiDominant(question: Question, idx: number) {
  const answer = state.answers[idx]
  if (answer === undefined || answer === 0) return null
  const isPositivePole = (answer > 0 && question.sign > 0) || (answer < 0 && question.sign < 0)
  return isPositivePole ? question.dimension[0] : question.dimension[2]
}

const vectorAxisLabels = computed<Record<DimensionId, string>>(() => ({
  expression: t('quiz.vectorAxes.expression'),
  temperature: t('quiz.vectorAxes.temperature'),
  judgement: t('quiz.vectorAxes.judgement'),
  order: t('quiz.vectorAxes.order'),
  agency: t('quiz.vectorAxes.agency'),
  aura: t('quiz.vectorAxes.aura'),
}))

const VECTOR_AXES: DimensionId[] = ['expression', 'temperature', 'judgement', 'order', 'agency', 'aura']
const VECTOR_AXIS_BASE_MAX = 0.3
const EXPECTED_LABELS = computed(() => ({
  agree: t('quiz.expected.agree'),
  disagree: t('quiz.expected.disagree'),
  neutral: t('quiz.expected.neutral'),
}) as const)
/** Keep these weights aligned with quizEngine. */
const LIVE_VECTOR_PERCENT_DENOMINATOR = 3
const MBTI_LETTERS: Record<DimensionPair, [string, string]> = {
  E_I: ['E', 'I'],
  S_N: ['S', 'N'],
  T_F: ['T', 'F'],
  J_P: ['J', 'P'],
}

const archetypeVectorMap = computed(() => new Map(archetypes.map((item) => [item.id, item.vector])))

function completeQuestionWeights(weights: Partial<Record<QuestionArchetypeWeightId, number>> = {}) {
  return (Object.keys(ROLE_TO_ARCHETYPE) as QuestionArchetypeWeightId[]).reduce((acc, role) => {
    acc[role] = weights[role] ?? 0
    return acc
  }, {} as Record<QuestionArchetypeWeightId, number>)
}

function normalizeQuestionWeights(weights: Partial<Record<QuestionArchetypeWeightId, number>> = {}) {
  const completed = completeQuestionWeights(weights)
  const balanced = Object.fromEntries(
    (Object.keys(completed) as QuestionArchetypeWeightId[]).map((role) => [
      role,
      completed[role] * QUESTION_ROLE_BALANCE[role],
    ]),
  ) as Record<QuestionArchetypeWeightId, number>
  const values = Object.values(balanced)
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length
  const centered = Object.fromEntries(
    Object.entries(balanced).map(([key, value]) => [key, value - mean]),
  ) as Record<QuestionArchetypeWeightId, number>
  const norm = Object.values(centered).reduce((sum, value) => sum + Math.abs(value), 0) || 1
  return Object.fromEntries(
    Object.entries(centered).map(([key, value]) => [key, value / norm]),
  ) as Record<QuestionArchetypeWeightId, number>
}

function getQuestionArchetypeRows(question: Question) {
  const normalized = normalizeQuestionWeights(question.weights ?? {})
  return (Object.keys(normalized) as QuestionArchetypeWeightId[])
    .map((role) => {
      const archetypeId = ROLE_TO_ARCHETYPE[role]
      return {
        archetypeId,
        name: archetypeLabels.value[archetypeId] ?? archetypeId,
        value: normalized[role],
      }
    })
    .sort((left, right) => Math.abs(right.value) - Math.abs(left.value))
}

function getQuestionVectorRows(question: Question) {
  const normalized = normalizeQuestionWeights(question.weights ?? {})
  const raw = VECTOR_AXES.reduce((acc, axis) => {
    acc[axis] = 0
    return acc
  }, {} as Record<DimensionId, number>)

  ;(Object.keys(normalized) as QuestionArchetypeWeightId[]).forEach((role) => {
    const vector = archetypeVectorMap.value.get(ROLE_TO_ARCHETYPE[role])
    if (!vector) return
    VECTOR_AXES.forEach((axis) => {
      raw[axis] += normalized[role] * vector[axis]
    })
  })

  const maxAbs = Math.max(...Object.values(raw).map((value) => Math.abs(value)), 1)
  return VECTOR_AXES
    .map((axis) => ({
      axis,
      label: vectorAxisLabels.value[axis],
      value: raw[axis],
      percent: Math.round((Math.abs(raw[axis]) / maxAbs) * 100),
      progressPercent: Math.round(((raw[axis] + 3) / 6) * 100),
      scorePercent: Math.round((raw[axis] / 3) * 100),
    }))
}

function getQuestionAffinityRows(questionId: string) {
  return characters
    .flatMap((character) =>
      (character.signature?.questionAffinity ?? [])
        .filter((item) => item.questionId === questionId)
        .map((item) => ({
          characterName: getLocalizedCharacterName(character, locale.value),
          expected: item.expected,
          weight: item.weight ?? 1,
        })),
    )
    .sort((left, right) => right.weight - left.weight)
}

function isAnsweredValue(value: number) {
  return value >= -3 && value <= 3
}

function scoreUniqueAxesLive(
  userVector: Record<DimensionId, number>,
  uniqueAxes: Partial<Record<DimensionId, number>>,
) {
  let weightedScore = 0
  let weightTotal = 0

  for (const axis of Object.keys(uniqueAxes) as DimensionId[]) {
    const expected = uniqueAxes[axis] ?? 0
    const actual = userVector[axis]
    const axisWeight = Math.max(0.5, Math.abs(expected))
    const distance = Math.abs(actual - expected)
    const similarity = Math.max(0, 1 - distance / 18)
    weightedScore += similarity * axisWeight
    weightTotal += axisWeight
  }

  return weightTotal ? weightedScore / weightTotal : 0
}

function evaluateAffinity(answer: number, expected: 'agree' | 'disagree' | 'neutral') {
  if (expected === 'agree') return Math.max(0, (answer + 3) / 6)
  if (expected === 'disagree') return Math.max(0, (3 - answer) / 6)
  return Math.max(0, 1 - Math.abs(answer) / 3)
}

const liveMetrics = computed(() => {
  const rawScores: Record<DimensionPair, number> = { E_I: 0, S_N: 0, T_F: 0, J_P: 0 }
  const directionalMax: Record<DimensionPair, { positive: number; negative: number }> = {
    E_I: { positive: 0, negative: 0 },
    S_N: { positive: 0, negative: 0 },
    T_F: { positive: 0, negative: 0 },
    J_P: { positive: 0, negative: 0 },
  }
  const archetypeRaw = Object.values(ROLE_TO_ARCHETYPE).reduce((acc, id) => {
    acc[id] = 0
    return acc
  }, {} as Record<ArchetypeId, number>)
  const userVector = VECTOR_AXES.reduce((acc, axis) => {
    acc[axis] = 0
    return acc
  }, {} as Record<DimensionId, number>)
  const questionIdToIndex = new Map(questions.value.map((question, index) => [question.id, index]))

  questions.value.forEach((question, index) => {
    const answer = state.answers[index]
    if (!isAnsweredValue(answer)) return

    rawScores[question.dimension] += answer * question.sign
    if (question.sign > 0) directionalMax[question.dimension].positive += 3
    else directionalMax[question.dimension].negative += 3

    const normalizedWeights = normalizeQuestionWeights(question.weights ?? {})
    const questionAxisBase = VECTOR_AXES.reduce((acc, axis) => {
      acc[axis] = 0
      return acc
    }, {} as Record<DimensionId, number>)
    ;(Object.keys(normalizedWeights) as QuestionArchetypeWeightId[]).forEach((role) => {
      const archetypeId = ROLE_TO_ARCHETYPE[role]
      const weightedAnswer = answer * (normalizedWeights[role] ?? 0)
      archetypeRaw[archetypeId] += weightedAnswer

      const archetypeVector = archetypeVectorMap.value.get(archetypeId)
      if (!archetypeVector) return
      VECTOR_AXES.forEach((axis) => {
        questionAxisBase[axis] += (normalizedWeights[role] ?? 0) * archetypeVector[axis]
      })
    })

    VECTOR_AXES.forEach((axis) => {
      const axisPercent = questionAxisBase[axis] / LIVE_VECTOR_PERCENT_DENOMINATOR
      const axisDelta = VECTOR_AXIS_BASE_MAX * answer * axisPercent
      userVector[axis] += axisDelta
    })
  })

  const mbtiRows = (Object.keys(MBTI_LETTERS) as DimensionPair[]).map((pair) => {
    const max = rawScores[pair] >= 0
      ? Math.max(1, directionalMax[pair].positive)
      : Math.max(1, directionalMax[pair].negative)
    const score = rawScores[pair] / max
    const percentage = Math.round(50 + Math.min(1, Math.abs(score)) * 50)
    const dominant = score >= 0 ? MBTI_LETTERS[pair][0] : MBTI_LETTERS[pair][1]
    return { pair, dominant, percentage, score }
  })

  const scores = mbtiRows.reduce((acc, row) => {
    acc[row.pair] = {
      pair: row.pair,
      score: row.score,
      dominant: row.dominant as MBTILetter,
      percentage: row.percentage,
    }
    return acc
  }, {} as Record<DimensionPair, DimensionScore>)

  const archetypeRankOrder = (Object.keys(archetypeRaw) as ArchetypeId[]).sort((a, b) => {
    const d = archetypeRaw[b] - archetypeRaw[a]
    if (d !== 0) return d
    return a.localeCompare(b, 'en')
  })
  const archetypeRows = archetypeRankOrder.map((id) => ({
    id,
    label: archetypeLabels.value[id] ?? id,
    score: Math.round(scoreArchetypeRelative(id, archetypeRaw) * 100),
  }))

  const maxVectorAbs = Math.max(...Object.values(userVector).map((value) => Math.abs(value)), 1)
  const vectorRows = VECTOR_AXES.map((axis) => ({
    axis,
    label: vectorAxisLabels.value[axis],
    value: Number(userVector[axis].toFixed(2)),
    width: Math.round((Math.abs(userVector[axis]) / maxVectorAbs) * 100),
  }))

  const characterRows = [...characters]
    .map((character) => {
      const uniqueAxes = character.signature?.uniqueAxes
      const questionAffinity = character.signature?.questionAffinity ?? []
      if (!questionAffinity.length) {
        return null
      }
      const axisScore = !uniqueAxes || !Object.keys(uniqueAxes).length
        ? 0.5
        : scoreUniqueAxesLive(userVector, uniqueAxes)

      let weightedScore = 0
      let weightTotal = 0
      questionAffinity.forEach((affinity) => {
        const qIndex = questionIdToIndex.get(affinity.questionId)
        if (qIndex === undefined) return
        const answer = state.answers[qIndex]
        if (!isAnsweredValue(answer)) return
        const weight = affinity.weight ?? 1
        weightedScore += evaluateAffinity(answer, affinity.expected) * weight
        weightTotal += weight
      })
      const affinityScore = weightTotal ? weightedScore / weightTotal : 0
      const specificScore = axisScore * 0.45 + affinityScore * 0.55
      return { id: character.id, name: getLocalizedCharacterName(character, locale.value), score: Math.round(specificScore * 100) }
    })
    .filter((item): item is { id: string; name: string; score: number } => item !== null)
    .sort((left, right) => right.score - left.score)
    .slice(0, 6)

  const rankedForLive = rankCharactersByProfile({
    scores,
    characters,
    archetypeRaw,
    userVector,
    answers: [...state.answers],
  })
  const liveFinalTopRows = rankedForLive.slice(0, 6).map((item) => ({
    id: item.character.id,
    name: getLocalizedCharacterName(item.character, locale.value),
    score: Math.max(0, Math.min(99, Math.round(item.total * 100))),
  }))

  return { mbtiRows, archetypeRows, vectorRows, characterRows, liveFinalTopRows }
})

function setQuestionRef(element: Element | ComponentPublicInstance | null, index: number) {
  const target = element instanceof HTMLElement
    ? element
    : element && '$el' in element && element.$el instanceof HTMLElement
      ? element.$el
      : null

  if (!target) return
  questionRefs.value[index] = target
}

async function jumpToUnansweredQuestion(index: number) {
  jumpToQuestion(index)
  pendingUnansweredIndex.value = index

  if (unansweredHighlightTimer) {
    clearTimeout(unansweredHighlightTimer)
  }

  unansweredHighlightTimer = setTimeout(() => {
    pendingUnansweredIndex.value = null
  }, 1800)

  await nextTick()
  const target = questionRefs.value[index]
  if (target) {
    const targetPosition = target.getBoundingClientRect().top + window.scrollY - (window.innerHeight / 2) + (target.offsetHeight / 2)
    const startPosition = window.scrollY
    const distance = targetPosition - startPosition
    const duration = Math.min(1200, Math.max(400, Math.abs(distance) * 0.5)) // Dynamic duration between 400ms and 1200ms
    let startTime: number | null = null

    // easeInOutCubic: smooth start and end
    const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

    const animation = (currentTime: number) => {
      if (startTime === null) startTime = currentTime
      const timeElapsed = currentTime - startTime
      const progress = Math.min(timeElapsed / duration, 1)

      window.scrollTo(0, startPosition + distance * easeInOutCubic(progress))

      if (progress < 1) {
        requestAnimationFrame(animation)
      }
    }
    requestAnimationFrame(animation)
  }
}

async function submitQuiz() {
  if (!isComplete.value && firstUnansweredIndex.value >= 0) {
    await jumpToUnansweredQuestion(firstUnansweredIndex.value)
    return
  }

  const result = finalizeQuiz()
  if (!result) return
  void submitResultStats(result, locale.value)
  router.push({ name: 'result' })
}
</script>

<style scoped>
.quiz-top-progress-bar {
  position: fixed;
  top: 72px;
  left: 0;
  right: 0;
  height: 8px;
  display: flex;
  gap: 1px;
  background: #ffffff;
  z-index: 49;
  padding: 0 2px;
  box-shadow: 0 2px 8px rgba(40, 54, 64, 0.04);
}

.progress-block {
  flex: 1;
  background-color: #e4e9f0;
  cursor: pointer;
  transition: background-color 0.3s ease;
  border-radius: 2px;
}

.progress-block:hover {
  background-color: #cdd6df;
}

.progress-block.is-answered {
  background-color: #33a474;
}

.progress-block.is-answered:hover {
  background-color: #2b8b62;
}

@media (max-width: 1280px) {
  .quiz-top-progress-bar {
    top: 68px;
  }
}

:global(html.force-compact) .quiz-top-progress-bar {
  top: 68px;
}

.quiz-page-16p {
  min-height: 100vh;
  background: #ffffff;
  color: #2d3436;
  direction: ltr;
  text-align: left;
}

.quiz-main {
  max-width: 1020px;
  margin: 0 auto;
  padding: 34px 16px 56px;
}

.hero {
  text-align: center;
  margin-bottom: 34px;
}

.hero h1 {
  margin: 0;
  font-size: clamp(32px, 5vw, 50px);
  line-height: 1.1;
  color: #2d3436;
}

.hero p {
  margin: 10px 0 0;
  font-size: 14px;
  letter-spacing: 0.12em;
  color: #8191a3;
}

.step-cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 36px;
}

.step-card {
  background: #ffffff;
  border: 1px solid #edf1f5;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 8px 24px rgba(17, 24, 39, 0.05);
  min-width: 0;
  text-align: left;
}

.step-card h3 {
  margin: 10px 0 8px;
  font-size: 22px;
  color: #2e353a;
  overflow-wrap: normal;
  word-break: normal;
}

.step-card p {
  margin: 0;
  font-size: 14px;
  color: #61707f;
  line-height: 1.65;
  overflow-wrap: normal;
  word-break: normal;
}

.step-pill {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #ffffff;
  border-radius: 999px;
  padding: 4px 8px;
}

.step-teal {
  border-top: 4px solid #33a474;
}

.step-teal .step-pill {
  background: #33a474;
}

.step-green {
  border-top: 4px solid #55c391;
}

.step-green .step-pill {
  background: #55c391;
}

.step-purple {
  border-top: 4px solid #88619a;
}

.step-purple .step-pill {
  background: #88619a;
}

.question-list {
  max-width: 880px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 18px;
  border: 1px solid #eef2f6;
  overflow: hidden;
}

.question-block {
  padding: 36px 18px;
  border-bottom: 1px solid #f1f4f8;
  scroll-margin-top: 24px;
  transition: opacity 0.5s ease, filter 0.5s ease, transform 0.5s ease, background-color 0.22s ease, box-shadow 0.22s ease;
}

.question-block.upcoming-dimmed {
  opacity: 0.45;
  filter: grayscale(0.4);
}

.question-block.upcoming-dimmed:hover {
  opacity: 0.8;
  filter: grayscale(0);
  transform: translateY(0);
}

.question-block:last-child {
  border-bottom: none;
}

.question-block.needs-answer {
  background: #f6fbf8;
  box-shadow: inset 4px 0 0 #33a474;
}

.question-block h2 {
  margin: 0 0 24px;
  text-align: center;
  color: #2f3841;
  font-size: clamp(20px, 2.7vw, 28px);
  line-height: 1.35;
}

.question-scale {
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.agree-label,
.disagree-label {
  width: 64px;
  font-size: 14px;
  font-weight: 700;
}

.agree-label {
  color: #33a474;
  text-align: right;
}

.disagree-label {
  color: #88619a;
  text-align: left;
}

.scale-buttons {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  min-width: 0;
}

.scale-btn {
  border-radius: 999px;
  background: #ffffff;
  border: 3px solid;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  flex: 0 0 auto;
  transition: transform 0.18s ease, background-color 0.18s ease, opacity 0.18s ease;
}

.scale-btn::before {
  content: '';
  position: absolute;
  top: -3px; left: -3px; right: -3px; bottom: -3px;
  border-radius: 50%;
  opacity: 0;
  pointer-events: none;
}

.size-sm { width: 28px; height: 28px; }
.size-md { width: 36px; height: 36px; }
.size-lg { width: 46px; height: 46px; }
.size-xl { width: 56px; height: 56px; }

.agree-ring { border-color: #33a474; }
.agree-ring::before { background-color: #33a474; }

.disagree-ring { border-color: #88619a; }
.disagree-ring::before { background-color: #88619a; }

.neutral-ring { border-color: #9aa5b1; }
.neutral-ring::before { background-color: #9aa5b1; }

.scale-btn:not(.selected) {
  opacity: 0.65;
}

.scale-btn:hover {
  transform: translateY(-1px);
  opacity: 1;
}

.scale-btn:active {
  transform: scale(0.92);
}

@keyframes radioPop {
  0% { transform: scale(1); }
  60% { transform: scale(1.15); }
  100% { transform: scale(1.06); }
}

@keyframes radioRipple {
  0% { transform: scale(0.8); opacity: 0.4; }
  100% { transform: scale(2.2); opacity: 0; }
}

.scale-btn.selected {
  opacity: 1;
  border-color: transparent;
  transform: scale(1.06);
  animation: radioPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

.scale-btn.selected::before {
  animation: radioRipple 0.5s ease-out;
}

.scale-btn.agree-ring.selected {
  background: #33a474;
}

.scale-btn.disagree-ring.selected {
  background: #88619a;
}

.scale-btn.neutral-ring.selected {
  background: #9aa5b1;
}

.checkmark {
  color: #ffffff;
  font-size: 14px;
  line-height: 1;
  font-weight: 700;
}

.mobile-labels {
  display: none;
}

.scoring-cards-container {
  margin: 32px auto 0;
  max-width: 760px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.scoring-card {
  border: 1px solid #edf1f5;
  border-radius: 16px;
  background: #ffffff;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(17, 24, 39, 0.03);
  transition: transform 0.15s ease-out, box-shadow 0.3s ease, border-color 0.3s ease;
  position: relative;
  overflow: hidden;
  transform: perspective(1000px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) translateY(var(--ty, 0));
  transform-style: preserve-3d;
  will-change: transform;
}

.scoring-card:hover {
  --ty: -4px;
  box-shadow: 0 12px 28px rgba(17, 24, 39, 0.06);
  border-color: #dce5ef;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px dashed #e4e9f0;
}

.card-icon {
  font-size: 16px;
  line-height: 1;
  text-shadow: 0 0 2px rgba(245, 166, 35, 0.4);
}

.scoring-title {
  margin: 0;
  font-size: 14px;
  font-weight: 800;
  color: #3f4b56;
  letter-spacing: 0.02em;
}

.mbti-pair {
  margin: 0 0 16px;
  font-size: 26px;
  font-weight: 700;
  color: #3f4b56;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  letter-spacing: 0.05em;
}

.mbti-sep {
  opacity: 0.4;
  font-weight: 400;
}

.mbti-dominant {
  text-decoration: underline;
  text-underline-offset: 4px;
  text-decoration-thickness: 3px;
  color: #2b3a47;
}

.mbti-live-track-wrap {
  margin-top: 16px;
}

.trait-track {
  position: relative;
  width: 100%;
  border-radius: 999px;
  height: 6px;
  opacity: 0.85;
}

.trait-center-marker {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 4px;
  height: 12px;
  background: rgba(255, 255, 255, 0.9);
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
  transition: left 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.trait-labels {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  color: #7b8a97;
  font-size: 12px;
  line-height: 1.4;
  font-weight: 500;
}

.mbti-label-active {
  color: #4c5965;
  font-weight: 700;
}

.feature-subtitle {
  margin: 0 0 8px;
  font-size: 13px;
  line-height: 1.6;
  color: #63717e;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  word-break: break-all;
}

.feature-subtitle:last-child {
  margin-bottom: 0;
}

.score-list {
  display: grid;
  gap: 8px;
}

.vector-score-item {
  display: grid;
  gap: 6px;
}

.score-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
  line-height: 1.5;
  color: #4c5965;
  padding: 2px 0;
}

.vector-score-track {
  position: relative;
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background: #e8edf2;
  overflow: hidden;
}

.vector-score-center {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  background: rgba(255, 255, 255, 0.8);
  z-index: 1;
}

.vector-score-fill {
  position: absolute;
  height: 100%;
  border-radius: 999px;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.score-positive {
  color: #2f996a;
  font-weight: 700;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.score-negative {
  color: #8a609d;
  font-weight: 700;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.result-form-card {
  max-width: 880px;
  margin: 28px auto 0;
  padding: 28px 20px;
  border: 1px solid #edf1f5;
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(17, 24, 39, 0.05);
}

.quiz-notice {
  max-width: 880px;
  margin: 0 auto 28px;
  padding: 18px 20px;
  border-radius: 14px;
  border: 1px solid #edf1f5;
  background: #f7fafc;
  color: #5d6b78;
  display: grid;
  gap: 6px;
  line-height: 1.7;
  text-align: left;
}

.quiz-notice p {
  margin: 0;
  font-size: 14px;
}

.detail-toggle-bar {
  max-width: 880px;
  margin: 0 auto 14px;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.detail-toggle-action {
  border: 1px solid #edf1f5;
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 14px;
  font-weight: 700;
  color: #5d6b78;
  background: #ffffff;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(17, 24, 39, 0.02);
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.detail-toggle-collapse {
  color: #5d6b78;
}

.detail-toggle-expand {
  color: #2e8f64;
}

.detail-toggle-action:hover {
  background: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(17, 24, 39, 0.05);
  border-color: #dce5ef;
}

.detail-toggle-action:active {
  transform: scale(0.98);
}

.detail-toggle-action:focus-visible {
  outline: 2px solid #33a474;
  outline-offset: -2px;
}

.detail-toggle-bar-placeholder {
  display: block;
}

.placeholder-box {
  width: 100%;
  border: 1px dashed #dce5ef;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  background: #fcfcfd;
}

.placeholder-box p {
  margin: 0;
  font-size: 14px;
  color: #8b98a5;
  font-weight: 500;
  letter-spacing: 0.02em;
}

.question-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.question-head h2 {
  margin-bottom: 0;
}

.question-detail-toggle {
  border: 0;
  background: transparent;
  color: #4c5965;
  padding: 0;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: color 0.2s ease !important;
  transform: none !important;
  box-shadow: none !important;
}

.question-detail-toggle:hover {
  color: #2f3a44 !important;
  background: transparent !important;
  transform: none !important;
  box-shadow: none !important;
}

.question-detail-toggle:active {
  color: #2f3a44 !important;
  background: transparent !important;
  transform: none !important;
  box-shadow: none !important;
}

.question-detail-toggle-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 6px;
}

.question-detail-toggle:focus-visible {
  outline: 2px solid #aeb9c4;
  outline-offset: 2px;
}

.live-metrics-panel {
  position: fixed;
  top: 92px;
  right: 16px;
  width: min(360px, calc(100vw - 24px));
  max-height: calc(100vh - 110px);
  z-index: 45;
  border-radius: 14px;
  border: 1px solid #e1e8ee;
  background: #ffffff;
  box-shadow: 0 12px 36px rgba(33, 44, 56, 0.16);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.live-metrics-panel.is-minimized {
  top: auto;
  bottom: 16px;
  height: min(500px, calc(100vh - 32px));
  max-height: none;
}

.live-metrics-panel.is-minimized.is-positioned {
  top: unset;
  bottom: unset;
}

.live-metrics-reveal-enter-active,
.live-metrics-reveal-leave-active {
  transition: clip-path 0.48s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.36s ease;
  will-change: clip-path, opacity;
}

.live-metrics-reveal-enter-from,
.live-metrics-reveal-leave-to {
  clip-path: circle(24px at calc(100vw - 42px) calc(100vh - 42px));
  opacity: 0;
}

.live-metrics-reveal-enter-to,
.live-metrics-reveal-leave-from {
  clip-path: circle(140vmax at calc(100vw - 42px) calc(100vh - 42px));
  opacity: 1;
}

.live-metrics-head {
  padding: 20px 20px 16px;
  background: #ffffff;
  border-bottom: 1px solid transparent; /* Optionally add a separator here if needed */
  z-index: 2;
  flex-shrink: 0;
  user-select: none;
  -webkit-user-select: none;
}

@media (min-width: 1281px) {
  .live-metrics-head {
    cursor: default;
  }
}

.live-metrics-head h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: #2e3944;
}

.live-metrics-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.live-metrics-actions {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.live-metrics-action-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 0;
  background: transparent;
  color: #62717f;
  font-size: 18px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  appearance: none;
  cursor: pointer;
  transition: none;
  transform: none !important;
  box-shadow: none !important;
}

.live-metrics-action-btn:hover {
  color: #44515d;
  background: transparent !important;
  transform: none !important;
  box-shadow: none !important;
}

.live-metrics-action-btn:active {
  background: transparent !important;
  transform: none !important;
  box-shadow: none !important;
}

.live-metrics-action-btn:focus-visible {
  outline: 2px solid #aeb9c4;
  outline-offset: 2px;
}

.live-metrics-close {
  font-size: 20px;
}

.live-metrics-head p {
  margin: 6px 0 0;
  font-size: 13px;
  color: #8b98a5;
}

.live-metrics-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 0 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.live-metrics-panel.is-minimized .live-metrics-scroll {
  overflow-y: hidden;
  padding-bottom: 12px;
}

.live-metrics-panel.is-minimized .live-section {
  margin-bottom: 0;
  min-height: 0;
}

.live-metrics-mini-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 16px 14px;
  border-top: 1px solid #eef2f6;
}

.live-metrics-mini-arrow {
  width: 28px;
  height: 28px;
  border: 1px solid #dbe3ea;
  border-radius: 999px;
  background: #ffffff;
  color: #5d6a77;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  padding: 0;
  transform: none !important;
  box-shadow: none !important;
}

.live-metrics-mini-arrow:hover {
  border-color: #c9d3dc;
  color: #42505d;
  transform: none !important;
  box-shadow: none !important;
}

.live-metrics-mini-arrow:active {
  transform: none !important;
  box-shadow: none !important;
}

.live-metrics-mini-dots {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.live-metrics-mini-dot {
  width: 8px;
  height: 8px;
  border: 0;
  border-radius: 999px;
  background: #cfd7de;
  padding: 0;
  cursor: pointer;
  transform: none !important;
  box-shadow: none !important;
}

.live-metrics-mini-dot.active {
  width: 20px;
  background: #5cae8f;
}

/* Custom Scrollbar for live metrics panel */
.live-metrics-scroll::-webkit-scrollbar {
  width: 6px;
}

.live-metrics-scroll::-webkit-scrollbar-track {
  background: #f0f3f6;
  border-radius: 8px;
}

.live-metrics-scroll::-webkit-scrollbar-thumb {
  background: #c5d0d8;
  border-radius: 8px;
}

.live-metrics-scroll::-webkit-scrollbar-thumb:hover {
  background: #a8b5c0;
}

.live-section {
  border: 1px solid #edf1f5;
  border-radius: 12px;
  padding: 16px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(17, 24, 39, 0.02);
}

.live-section h4 {
  margin: 0 0 14px;
  font-size: 14px;
  font-weight: 800;
  color: #3f4b56;
}

.live-note {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: #8b98a5;
}

.live-list {
  display: grid;
  gap: 10px;
}

.live-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
  color: #4c5965;
}

.live-row span:first-child {
  color: #5d6b78;
}

.live-row span:last-child {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-weight: 700;
  color: #3f4b56;
}

.live-vector-list {
  display: grid;
  gap: 14px;
}

.live-vector-row .live-row {
  margin-bottom: 6px;
}

.live-vector-track {
  position: relative;
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background: #f0f4f8;
  overflow: hidden;
}

.live-vector-center {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  background: rgba(255, 255, 255, 0.8);
  z-index: 1;
}

.live-vector-fill {
  position: absolute;
  height: 100%;
  border-radius: 999px;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.live-trait-row {
  display: grid;
  gap: 8px;
  margin-bottom: 6px;
}

.live-trait-row:last-child {
  margin-bottom: 0;
}

.live-trait-track-wrap {
  position: relative;
  padding: 0 4px;
}

.live-trait-track-wrap .trait-track {
  height: 4px;
}

.live-trait-track-wrap .trait-center-marker {
  height: 10px;
}

.live-trait-track-wrap .trait-handle {
  width: 12px;
  height: 12px;
  border-width: 2px;
}

.live-trait-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 11px;
  color: #8b98a5;
  font-weight: 700;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.submit-row {
  margin-top: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.progress-hint {
  margin: 0;
  color: #6d7c8a;
  font-size: 14px;
}

.submit-btn {
  border: none;
  border-radius: 999px;
  padding: 12px 28px;
  color: #ffffff;
  background: #88619a;
  font-weight: 700;
  cursor: pointer;
}

.quiz-footer {
  margin-top: 30px;
  border-top: 1px solid #edf1f5;
  background: #f7f9fc;
}

.quiz-footer-inner {
  max-width: 1020px;
  margin: 0 auto;
  padding: 30px 16px;
  text-align: center;
}

.share-count {
  color: #3a434b;
  font-size: 24px;
  font-weight: 700;
}

.footer-links {
  margin: 16px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  justify-content: center;
}

.footer-links > * {
  color: #33a474;
  font-size: 14px;
  font-weight: 600;
}

.quiz-footer p {
  margin: 0;
  color: #8a97a5;
  font-size: 12px;
}

@media (max-width: 980px) {
  .step-cards {
    grid-template-columns: 1fr;
  }
}

/* 手机横屏、窄平板等：量表改为上下排布 + 横向滑动，避免圆点被裁切 */
@media (max-width: 1024px) {
  .quiz-main {
    padding-left: 14px;
    padding-right: 14px;
  }

  .question-block {
    padding: 28px 14px;
  }

  .question-block h2 {
    margin-bottom: 18px;
  }

  .step-cards {
    grid-template-columns: repeat(3, minmax(150px, 1fr));
    overflow-x: auto;
    padding: 0 2px 8px;
    scroll-snap-type: x proximity;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .step-cards::-webkit-scrollbar {
    display: none;
  }

  .step-card {
    scroll-snap-align: start;
  }

  .question-head {
    gap: 10px;
  }

  .question-detail-toggle-row {
    margin-top: 4px;
  }

  .question-scale {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    min-width: 0;
  }

  .agree-label,
  .disagree-label {
    display: none;
  }

  .mobile-labels {
    display: flex;
    justify-content: space-between;
    max-width: none;
    margin: 0 2px;
  }

  .mobile-labels .agree-label,
  .mobile-labels .disagree-label {
    display: block;
    width: auto;
    font-size: 13px;
    font-weight: 700;
  }

  .mobile-labels .agree-label {
    color: #33a474;
    text-align: left;
  }

  .mobile-labels .disagree-label {
    color: #88619a;
    text-align: right;
  }

  .scoring-cards-container {
    grid-template-columns: 1fr;
  }

  .scale-buttons {
    gap: 8px;
    flex-wrap: nowrap;
    justify-content: space-between;
    width: 100%;
    min-width: 0;
    max-width: 100%;
    overflow-x: visible;
    overflow-y: visible;
    padding: 2px max(2px, env(safe-area-inset-right, 0px)) 6px max(2px, env(safe-area-inset-left, 0px));
    scrollbar-width: none;
    -ms-overflow-style: none;
    -webkit-overflow-scrolling: touch;
    touch-action: manipulation;
  }

  .scale-buttons::-webkit-scrollbar {
    display: none;
  }

  .scale-btn {
    flex: 0 0 auto;
  }

  .size-sm { width: 24px; height: 24px; }
  .size-md { width: 30px; height: 30px; }
  .size-lg { width: 38px; height: 38px; }
  .size-xl { width: 46px; height: 46px; }

  .checkmark {
    font-size: 12px;
  }

  .result-form-card,
  .quiz-notice,
  .detail-toggle-bar,
  .question-list {
    margin-left: 2px;
    margin-right: 2px;
  }

  .submit-row {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .submit-btn {
    width: 100%;
  }

  .share-count {
    font-size: 20px;
  }
}

:global(html.force-compact) .quiz-main {
  padding-left: 14px;
  padding-right: 14px;
}

:global(html.force-compact) .question-scale {
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  min-width: 0;
}

:global(html.force-compact) .question-scale > .agree-label,
:global(html.force-compact) .question-scale > .disagree-label {
  display: none;
}

:global(html.force-compact) .mobile-labels {
  display: flex;
  justify-content: space-between;
  max-width: none;
  margin: 0 2px;
}

:global(html.force-compact) .mobile-labels .agree-label,
:global(html.force-compact) .mobile-labels .disagree-label {
  display: block;
  width: auto;
  font-size: 13px;
  font-weight: 700;
}

:global(html.force-compact) .mobile-labels .agree-label {
  color: #33a474;
  text-align: left;
}

:global(html.force-compact) .mobile-labels .disagree-label {
  color: #88619a;
  text-align: right;
}

:global(html.force-compact) .scale-buttons {
  gap: 8px;
  flex-wrap: nowrap;
  justify-content: space-between;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  overflow-x: visible;
  overflow-y: visible;
  padding: 2px max(2px, env(safe-area-inset-right, 0px)) 6px max(2px, env(safe-area-inset-left, 0px));
  touch-action: manipulation;
}

:global(html.force-compact) .scale-btn {
  flex: 0 0 auto;
}

:global(html.force-compact) .size-sm { width: 24px; height: 24px; }
:global(html.force-compact) .size-md { width: 30px; height: 30px; }
:global(html.force-compact) .size-lg { width: 38px; height: 38px; }
:global(html.force-compact) .size-xl { width: 46px; height: 46px; }

:global(html.force-compact) .result-form-card,
:global(html.force-compact) .quiz-notice,
:global(html.force-compact) .detail-toggle-bar,
:global(html.force-compact) .question-list {
  margin-left: 2px;
  margin-right: 2px;
}

@media (max-width: 1280px) {
  .live-metrics-panel {
    top: auto !important;
    left: 12px !important;
    right: 12px !important;
    bottom: 12px !important;
    width: auto;
    max-height: min(520px, calc(100vh - 92px));
  }

  .live-metrics-panel.is-positioned {
    top: auto !important;
    left: 12px !important;
    right: 12px !important;
    bottom: 12px !important;
  }

  .live-metrics-panel.is-minimized {
    top: auto;
    bottom: 12px;
    height: min(400px, calc(100vh - 24px));
    max-height: none;
  }

  .live-metrics-panel.is-minimized .live-metrics-head {
    padding: 14px 14px 10px;
  }

  .live-metrics-panel.is-minimized .live-metrics-head h3 {
    font-size: clamp(19px, 4.4vw, 22px);
  }

  .live-metrics-panel.is-minimized .live-metrics-head p {
    margin-top: 4px;
    font-size: clamp(11px, 2.9vw, 12px);
  }

  .live-metrics-panel.is-minimized .live-metrics-scroll {
    padding: 0 12px 8px;
    gap: 8px;
  }

  .live-metrics-panel.is-minimized .live-section {
    padding: 12px;
  }

  .live-metrics-panel.is-minimized .live-section h4 {
    margin-bottom: 10px;
    font-size: clamp(12px, 3.1vw, 13px);
  }

  .live-metrics-panel.is-minimized .live-list {
    gap: 7px;
  }

  .live-metrics-panel.is-minimized .live-row {
    font-size: clamp(10px, 2.8vw, 12px);
    gap: 8px;
  }

  .live-metrics-panel.is-minimized .live-vector-list {
    gap: 10px;
  }

  .live-metrics-panel.is-minimized .live-trait-row {
    gap: 6px;
    margin-bottom: 4px;
  }

  .live-metrics-panel.is-minimized .live-trait-labels {
    margin-top: 4px;
    font-size: clamp(9px, 2.4vw, 10px);
  }

  .live-metrics-panel.is-minimized .live-metrics-mini-nav {
    padding: 6px 12px 10px;
  }

  .live-metrics-panel.is-minimized .live-metrics-mini-arrow {
    width: 24px;
    height: 24px;
    font-size: 16px;
  }

  .live-metrics-panel.is-minimized .live-metrics-mini-dots {
    gap: 6px;
  }

  .live-metrics-panel.is-minimized .live-metrics-mini-dot {
    width: 7px;
    height: 7px;
  }

  .live-metrics-panel.is-minimized .live-metrics-mini-dot.active {
    width: 16px;
  }

  .live-metrics-reveal-enter-from,
  .live-metrics-reveal-leave-to {
    clip-path: circle(24px at calc(100vw - 36px) calc(100vh - 36px));
  }

  .live-metrics-reveal-enter-to,
  .live-metrics-reveal-leave-from {
    clip-path: circle(150vmax at calc(100vw - 36px) calc(100vh - 36px));
  }
}

@media (max-width: 520px) {
  .quiz-main {
    padding-left: 10px;
    padding-right: 10px;
    padding-top: 24px;
    padding-bottom: 44px;
  }

  .hero {
    margin-bottom: 24px;
  }

  .hero h1 {
    font-size: clamp(28px, 8vw, 38px);
  }

  .hero p {
    font-size: 12px;
  }

  .step-card {
    padding: 16px;
  }

  .step-card h3 {
    font-size: 19px;
  }

  .step-cards {
    grid-template-columns: 1fr;
    overflow-x: visible;
    padding-bottom: 0;
  }

  .step-card h3,
  .step-card p {
    max-width: 34rem;
  }

  .question-block {
    padding: 24px 12px;
  }

  .question-block h2 {
    font-size: clamp(18px, 5vw, 22px);
  }

  .scale-buttons {
    gap: 5px;
  }

  .size-sm { width: 20px; height: 20px; }
  .size-md { width: 26px; height: 26px; }
  .size-lg { width: 34px; height: 34px; }
  .size-xl { width: 42px; height: 42px; }

  .result-form-card,
  .quiz-notice,
  .detail-toggle-bar {
    padding-left: 14px;
    padding-right: 14px;
  }

  .footer-links {
    gap: 10px;
  }
}
</style>
