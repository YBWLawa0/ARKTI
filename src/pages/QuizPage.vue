<template>
  <div class="quiz-page-16p">
    <main class="quiz-main">
      <section class="hero">
        <h1>{{ t('quiz.heroTitle') }}</h1>
        <p>ARKTI</p>
      </section>

      <section class="step-cards" aria-label="测试步骤">
        <article v-for="(item, i) in tm<string[][]>('quiz.steps')" :key="i" class="step-card" :class="i === 0 ? 'step-teal' : i === 1 ? 'step-green' : 'step-purple'">
          <span class="step-pill">{{ item[0] }}</span>
          <h3>{{ item[1] }}</h3>
          <p>{{ item[2] }}</p>
        </article>
      </section>

      <section class="quiz-notice" aria-label="测试说明">
        <p>{{ t('quiz.noticeA', { count: questions.length }) }}</p>
        <p>{{ t('quiz.noticeB') }}</p>
      </section>

      <section class="question-list" aria-label="测试题目">
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
          <h2>{{ t('quiz.questions.' + idx, undefined, (question.text || question.prompt || t('quiz.missingQuestion'))) }}</h2>

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
          <RouterLink to="/intro">{{ tm<Record<string, string>>('app.footer.social').intro }}</RouterLink>
          <RouterLink to="/about">{{ tm<Record<string, string>>('app.footer.social').about }}</RouterLink>
          <RouterLink to="/result">{{ t('app.nav.result') }}</RouterLink>
          <span>{{ t('quiz.footerLocal') }}</span>
        </div>
        <p>© 2026 ARKTI Project</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, computed } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import { useRouter } from 'vue-router'

import { useQuiz } from '../composables/useQuiz'
import { useI18n } from '../i18n'

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
  state,
  answeredCount,
  isComplete,
  firstUnansweredIndex,
  jumpToQuestion,
  selectOptionAt,
  finalizeQuiz,
} = useQuiz()
const { t, tm } = useI18n()

const questionRefs = ref<HTMLElement[]>([])
const pendingUnansweredIndex = ref<number | null>(null)
let unansweredHighlightTimer: ReturnType<typeof setTimeout> | null = null

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
  router.push({ name: 'result' })
}
</script>

<style scoped>
.quiz-page-16p {
  min-height: 100vh;
  background: #ffffff;
  color: #2d3436;
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
}

.step-card h3 {
  margin: 10px 0 8px;
  font-size: 22px;
  color: #2e353a;
}

.step-card p {
  margin: 0;
  font-size: 14px;
  color: #61707f;
  line-height: 1.65;
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
}

.quiz-notice p {
  margin: 0;
  font-size: 14px;
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

@media (max-width: 760px) {
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

  .question-scale {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
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

  .scale-buttons {
    gap: 8px;
    flex-wrap: nowrap;
    justify-content: space-between;
    overflow-x: auto;
    padding: 2px 2px 6px;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .scale-buttons::-webkit-scrollbar {
    display: none;
  }

  .scale-btn {
    flex: none;
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

  .question-block {
    padding: 24px 12px;
  }

  .question-block h2 {
    font-size: clamp(18px, 5vw, 22px);
  }

  .scale-buttons {
    gap: 6px;
  }

  .result-form-card,
  .quiz-notice {
    padding-left: 14px;
    padding-right: 14px;
  }

  .footer-links {
    gap: 10px;
  }
}
</style>
