import { computed, reactive, readonly } from 'vue'

import archetypesData from '../data/archetypes.json'
import charactersData from '../data/characters.json'
import questionsData from '../data/questions.json'
import { QUIZ_SESSION_QUESTION_COUNT } from '../constants/quizSession'
import type { Archetype, CharacterMatch, Question, QuizRecord, QuizResult } from '../types/quiz'
import { hydrateCharacterVisual, hydrateQuizRecord } from '../utils/characterVisuals'
import { calculateQuizResult, createDebugQuizResult } from '../utils/quizEngine'
import { clearLastRecord, loadLastRecord, saveLastRecord } from '../utils/storage'

const allQuestions = questionsData as Question[]
const archetypes = archetypesData as Archetype[]
const characters = (charactersData as CharacterMatch[]).map((character) => hydrateCharacterVisual(character))

const UNANSWERED = -10

function isAnsweredValue(value: number) {
  return value >= -3 && value <= 3
}

function shufflePickQuestions(source: Question[], count: number): Question[] {
  const n = Math.min(count, source.length)
  const copy = [...source]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, n)
}

function pickSessionQuestions(): Question[] {
  return shufflePickQuestions(allQuestions, QUIZ_SESSION_QUESTION_COUNT)
}

const state = reactive({
  currentIndex: 0,
  answers: [] as number[],
  sessionQuestions: [] as Question[],
  liveMetricsVisible: false,
  latestRecord: hydrateQuizRecord(loadLastRecord() as QuizRecord | null),
})

function initSessionIfNeeded() {
  if (state.sessionQuestions.length > 0) {
    return
  }
  state.sessionQuestions = pickSessionQuestions()
  state.answers = Array.from({ length: state.sessionQuestions.length }, () => UNANSWERED)
  state.currentIndex = 0
}

initSessionIfNeeded()

const questions = computed(() => state.sessionQuestions)

const currentQuestion = computed(() => state.sessionQuestions[state.currentIndex] ?? null)
const selectedOptionIndex = computed(() => state.answers[state.currentIndex] ?? UNANSWERED)
const progress = computed(() =>
  state.sessionQuestions.length > 0 ? (state.currentIndex + 1) / state.sessionQuestions.length : 0,
)
const answeredCount = computed(() => state.answers.filter((answer) => isAnsweredValue(answer)).length)
const firstUnansweredIndex = computed(() => state.answers.findIndex((answer) => !isAnsweredValue(answer)))
const canGoNext = computed(() => isAnsweredValue(selectedOptionIndex.value))
const canGoPrev = computed(() => state.currentIndex > 0)
const isComplete = computed(() => state.answers.every((answer) => isAnsweredValue(answer)))
const latestResult = computed(() => state.latestRecord?.result ?? null)

function selectOption(optionIndex: number) {
  if (!isAnsweredValue(optionIndex)) return
  state.answers[state.currentIndex] = optionIndex
}

function selectOptionAt(questionIndex: number, optionValue: number) {
  if (!isAnsweredValue(optionValue)) return
  if (questionIndex < 0 || questionIndex >= state.sessionQuestions.length) return
  state.answers[questionIndex] = optionValue
}

function goNext() {
  if (canGoNext.value && state.currentIndex < state.sessionQuestions.length - 1) {
    state.currentIndex += 1
  }
}

function goPrev() {
  if (canGoPrev.value) {
    state.currentIndex -= 1
  }
}

function jumpToQuestion(index: number) {
  if (index >= 0 && index < state.sessionQuestions.length) {
    state.currentIndex = index
  }
}

function resetQuiz(clearHistory = false) {
  state.sessionQuestions = pickSessionQuestions()
  state.answers = Array.from({ length: state.sessionQuestions.length }, () => UNANSWERED)
  state.currentIndex = 0
  state.liveMetricsVisible = false

  if (clearHistory) {
    state.latestRecord = null
    clearLastRecord()
  }
}

function finalizeQuiz(): QuizResult | null {
  if (!isComplete.value) {
    return null
  }

  const result = calculateQuizResult({
    answers: state.answers,
    questions: state.sessionQuestions,
    archetypes,
    characters,
  })

  const record: QuizRecord = {
    answers: [...state.answers],
    questionIds: state.sessionQuestions.map((q) => q.id),
    createdAt: new Date().toISOString(),
    result,
  }

  state.latestRecord = hydrateQuizRecord(record)
  saveLastRecord(record)

  return result
}

function resumeLastResult() {
  state.latestRecord = hydrateQuizRecord(loadLastRecord())
}

function toggleLiveMetricsPanel() {
  state.liveMetricsVisible = !state.liveMetricsVisible
}

function setLiveMetricsPanelVisible(visible: boolean) {
  state.liveMetricsVisible = visible
}

/** Prompt index in the JSON question bank / i18n arrays, used by quiz.questions.{index}. */
function questionMessageIndex(questionId: string) {
  return allQuestions.findIndex((q) => q.id === questionId)
}

export function useQuiz() {
  return {
    allQuestions,
    questions,
    questionMessageIndex,
    archetypes,
    characters,
    state: readonly(state),
    currentQuestion,
    selectedOptionIndex,
    progress,
    answeredCount,
    firstUnansweredIndex,
    canGoNext,
    canGoPrev,
    isComplete,
    latestResult,
    liveMetricsVisible: computed(() => state.liveMetricsVisible),
    selectOption,
    selectOptionAt,
    goNext,
    goPrev,
    jumpToQuestion,
    resetQuiz,
    finalizeQuiz,
    resumeLastResult,
    toggleLiveMetricsPanel,
    setLiveMetricsPanelVisible,
    createDebugResult: (characterId: string): QuizResult | null =>
      createDebugQuizResult({
        characterId,
        archetypes,
        characters,
      }),
  }
}
