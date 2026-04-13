import { readonly, ref } from 'vue'

import { localeLabels, messages } from './messages'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type AppLocale } from './types'

const STORAGE_KEY = 'arkti:locale'
const currentLocale = ref<AppLocale>(DEFAULT_LOCALE)

function normalizeLocale(input?: string | null): AppLocale | null {
  if (!input) return null
  const lower = input.toLowerCase()

  if (lower.startsWith('zh-hk') || lower.startsWith('zh-mo') || lower.startsWith('zh-tw') || lower.includes('hant')) {
    return 'zh-TW'
  }

  if (lower.startsWith('zh')) return 'zh-CN'
  if (lower.startsWith('ja')) return 'ja'
  if (lower.startsWith('en')) return 'en'

  return null
}

function applyDocumentLanguage(locale: AppLocale) {
  if (typeof document === 'undefined') return
  document.documentElement.lang = locale
}

function readStoredLocale(): AppLocale | null {
  if (typeof window === 'undefined') return null
  return normalizeLocale(window.localStorage.getItem(STORAGE_KEY))
}

function detectSystemLocale(): AppLocale {
  if (typeof navigator === 'undefined') return DEFAULT_LOCALE
  const candidates = [...(navigator.languages ?? []), navigator.language]
  for (const item of candidates) {
    const matched = normalizeLocale(item)
    if (matched) return matched
  }
  return DEFAULT_LOCALE
}

export function initI18n() {
  currentLocale.value = readStoredLocale() ?? detectSystemLocale() ?? DEFAULT_LOCALE
  applyDocumentLanguage(currentLocale.value)
}

function deepGet(target: unknown, path: string) {
  return path.split('.').reduce<unknown>((value, key) => {
    if (!value || typeof value !== 'object') return undefined
    return (value as Record<string, unknown>)[key]
  }, target)
}

function interpolate(template: string, params?: Record<string, string | number>) {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? ''))
}

export function setLocale(locale: AppLocale) {
  currentLocale.value = locale
  applyDocumentLanguage(locale)

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, locale)
  }
}

export function getLocale() {
  return currentLocale.value
}

export function t(key: string, params?: Record<string, string | number>, defaultVal?: string) {
  const value = deepGet(messages[currentLocale.value], key) ?? deepGet(messages[DEFAULT_LOCALE], key)
  return interpolate(typeof value === 'string' ? value : (defaultVal ?? key), params)
}

export function tm<T>(key: string): T {
  return (deepGet(messages[currentLocale.value], key) ?? deepGet(messages[DEFAULT_LOCALE], key)) as T
}

export function useI18n() {
  return {
    locale: readonly(currentLocale),
    localeOptions: SUPPORTED_LOCALES.map((code) => ({ code, label: localeLabels[code] })),
    setLocale,
    t,
    tm,
  }
}

export type { AppLocale } from './types'
