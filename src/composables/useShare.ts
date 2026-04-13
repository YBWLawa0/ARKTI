import { ref } from 'vue'

import type { QuizResult } from '../types/quiz'
import { getLocale, t } from '../i18n'
import { getLocalizedCharacterName, getLocalizedCharacterSeries } from '../i18n/characters'

let htmlToImageLoader: Promise<typeof import('html-to-image')> | null = null

function createShareText(result: QuizResult) {
  const featured = result.characterMatches[0]
  const locale = getLocale()

  return [
    t('app.common.shareCode', { code: result.code }),
    featured
      ? t('app.common.shareCharacter', {
          name: getLocalizedCharacterName(featured, locale),
          series: getLocalizedCharacterSeries(featured, locale),
        })
      : t('app.common.shareUnknown'),
    t('app.common.shareProbability', { prob: result.matchProbability }),
    t('app.common.shareProbabilityDesc'),
    t('app.common.shareArchetype', { name: result.archetype.name }),
    result.archetype.subtitle,
    t('app.common.shareRole', { role: result.archetype.narrativeRole }),
  ].join('\n')
}

export function useShare() {
  const isExporting = ref(false)
  const feedback = ref('')

  async function exportPoster(target: HTMLElement | null, result: QuizResult) {
    if (!target || isExporting.value) {
      return
    }

    isExporting.value = true
    feedback.value = ''

    try {
      htmlToImageLoader ??= import('html-to-image')
      const { toPng } = await htmlToImageLoader
      const dataUrl = await toPng(target, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#100f17',
      })

      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `arkti-${result.archetype.id}.png`
      link.click()
      feedback.value = t('app.common.exportSuccess')
    } catch {
      feedback.value = t('app.common.exportFail')
    } finally {
      isExporting.value = false
    }
  }

  async function copyShareText(result: QuizResult) {
    const text = createShareText(result)

    try {
      await navigator.clipboard.writeText(text)
      feedback.value = t('app.common.copySuccess')
    } catch {
      feedback.value = t('app.common.copyFail')
    }
  }

  return {
    isExporting,
    feedback,
    exportPoster,
    copyShareText,
  }
}
