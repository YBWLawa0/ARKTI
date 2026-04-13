import type { QuizRecord } from '../types/quiz'

const STORAGE_KEY = 'arkti:last-result'

export function loadLastRecord(): QuizRecord | null {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as QuizRecord
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function saveLastRecord(record: QuizRecord) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record))
}

export function clearLastRecord() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(STORAGE_KEY)
}
