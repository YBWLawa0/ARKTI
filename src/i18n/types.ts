export const SUPPORTED_LOCALES = ['zh-CN', 'zh-TW', 'en', 'ja'] as const

export type AppLocale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: AppLocale = 'zh-CN'
