import characterVisualsData from '../data/characterVisuals.json'
import type { CharacterMatch, QuizRecord, QuizResult } from '../types/quiz'
import { getCharacterPopulationProbability } from './characterProbability.ts'

type CharacterVisualMeta = {
  image: string
  imageScale?: number
  accent: string
  smallCharacterVideo?: string
  backgroundImage?: string
  backgroundShadow?: boolean
  backgroundPositionX?: number
  backgroundPositionY?: number
}

const characterVisuals = characterVisualsData as Record<string, CharacterVisualMeta>

function deriveLegacyCardBackground(imagePath: string | undefined) {
  if (!imagePath || /^https?:\/\//.test(imagePath)) {
    return undefined
  }

  const normalized = imagePath.split('?')[0].split('#')[0]
  const fileName = normalized.split('/').pop()
  if (!fileName) {
    return undefined
  }

  return `/ARKTI/public/images/characters/_original-backgrounds/${fileName}`
}

export function resolvePublicAsset(path: string | undefined) {
  if (!path) {
    return ''
  }

  if (/^https?:\/\//.test(path)) {
    return path
  }

  const normalized = path.startsWith('/') ? path.slice(1) : path
  return `${import.meta.env.BASE_URL}${normalized}`
}

export function hydrateCharacterVisual<T extends CharacterMatch>(character: T): T {
  const visual = characterVisuals[character.id]
  const imagePath = visual?.image ?? character.image
  const backgroundPath =
    visual?.backgroundImage ??
    character.backgroundImage ??
    deriveLegacyCardBackground(imagePath)

  const hydrated = {
    ...character,
    image: resolvePublicAsset(imagePath),
    imageScale: visual?.imageScale ?? character.imageScale,
    backgroundImage: resolvePublicAsset(backgroundPath),
    backgroundShadow: visual?.backgroundShadow ?? character.backgroundShadow,
    backgroundPositionX: visual?.backgroundPositionX ?? character.backgroundPositionX,
    backgroundPositionY: visual?.backgroundPositionY ?? character.backgroundPositionY,
    accent: visual?.accent ?? character.accent,
  }

  return hydrated
}

export function hydrateQuizResult(result: QuizResult | null): QuizResult | null {
  if (!result) {
    return null
  }

  const characterMatches = result.characterMatches.map((character) => hydrateCharacterVisual(character))
  const featuredCharacter = result.featuredCharacter ? hydrateCharacterVisual(result.featuredCharacter) : characterMatches[0] ?? null

  return {
    ...result,
    matchProbability: result.matchProbability ?? getCharacterPopulationProbability(featuredCharacter?.id),
    characterMatches,
    featuredCharacter,
  }
}

export function hydrateQuizRecord(record: QuizRecord | null): QuizRecord | null {
  if (!record) {
    return null
  }

  return {
    ...record,
    result: hydrateQuizResult(record.result) as QuizResult,
  }
}
