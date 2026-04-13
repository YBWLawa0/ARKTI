import { computed, reactive, readonly } from 'vue'

import archetypesData from '../data/archetypes.json'
import charactersData from '../data/characters.json'
import questionsData from '../data/questions.json'
import type { Archetype, CharacterMatch, Question, QuizRecord, QuizResult } from '../types/quiz'
import { hydrateCharacterVisual, hydrateQuizRecord } from '../utils/characterVisuals'
import { calculateQuizResult, createDebugQuizResult } from '../utils/quizEngine'
import { clearLastRecord, loadLastRecord, saveLastRecord } from '../utils/storage'

const questions = questionsData as Question[]
const archetypes = archetypesData as Archetype[]
const characters = (charactersData as CharacterMatch[]).map((character) => hydrateCharacterVisual(character))

const UNANSWERED = -10

function isAnsweredValue(value: number) {
  return value >= -3 && value <= 3
}

const emptyAnswers = () => Array.from({ length: questions.length }, () => UNANSWERED)

const state = reactive({
  currentIndex: 0,
  answers: emptyAnswers(),
  latestRecord: hydrateQuizRecord(loadLastRecord() as QuizRecord | null),
})

const currentQuestion = computed(() => questions[state.currentIndex] ?? null)
const selectedOptionIndex = computed(() => state.answers[state.currentIndex] ?? UNANSWERED)
const progress = computed(() => (state.currentIndex + 1) / questions.length)
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
  if (questionIndex < 0 || questionIndex >= questions.length) return
  state.answers[questionIndex] = optionValue
}

function goNext() {
  if (canGoNext.value && state.currentIndex < questions.length - 1) {
    state.currentIndex += 1
  }
}

function goPrev() {
  if (canGoPrev.value) {
    state.currentIndex -= 1
  }
}

function jumpToQuestion(index: number) {
  if (index >= 0 && index < questions.length) {
    state.currentIndex = index
  }
}

function resetQuiz(clearHistory = false) {
  state.currentIndex = 0
  state.answers = emptyAnswers()

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
    questions,
    archetypes,
    characters,
  })

  const record: QuizRecord = {
    answers: [...state.answers],
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

export function useQuiz() {
  return {
    questions,
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
    selectOption,
    selectOptionAt,
    goNext,
    goPrev,
    jumpToQuestion,
    resetQuiz,
    finalizeQuiz,
    resumeLastResult,
    createDebugResult: (characterId: string): QuizResult | null =>
      createDebugQuizResult({
        characterId,
        archetypes,
        characters,
      }),
  }
}
