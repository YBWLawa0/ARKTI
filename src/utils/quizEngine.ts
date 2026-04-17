import type {
  Archetype,
  ArchetypeId,
  CharacterMatch,
  DimensionId,
  DimensionPair,
  DimensionScore,
  MBTILetter,
  Question,
  QuestionArchetypeWeightId,
  QuizResult,
} from '../types/quiz'
import { getCharacterPopulationProbability } from './characterProbability.ts'

const DIMENSION_LETTERS: Record<DimensionPair, [MBTILetter, MBTILetter]> = {
  'E_I': ['E', 'I'],
  'S_N': ['S', 'N'],
  'T_F': ['T', 'F'],
  'J_P': ['J', 'P']
}

const TYPE_TO_ARCHETYPE: Record<string, ArchetypeId> = {
  INTJ: 'shadow-strategist',
  INTP: 'icebound-observer',
  ENTJ: 'oathbound-captain',
  ENTP: 'trickster-orbit',
  INFJ: 'gentle-healer',
  INFP: 'moonlit-guardian',
  ENFJ: 'luminous-lead',
  ENFP: 'trickster-orbit',
  ISTJ: 'moonlit-guardian',
  ISFJ: 'gentle-healer',
  ESTJ: 'oathbound-captain',
  ESFJ: 'luminous-lead',
  ISTP: 'icebound-observer',
  ISFP: 'moonlit-guardian',
  ESTP: 'chaos-spark',
  ESFP: 'chaos-spark',
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

const QUESTION_WEIGHT_FALLBACKS: Record<DimensionPair, Partial<Record<QuestionArchetypeWeightId, number>>> = {
  'E_I': { hero: 2, trickster: 2, healer: 1, lonewolf: -2, strategist: -1 },
  'S_N': { strategist: 2, trickster: 2, healer: 1, ruler: -1, guardian: -1 },
  'T_F': { strategist: 2, ruler: 1, healer: -2, guardian: -1, berserker: 1 },
  'J_P': { ruler: 2, guardian: 1, strategist: 1, trickster: -2, berserker: 0 },
}

const VECTOR_AXES: DimensionId[] = ['expression', 'temperature', 'judgement', 'order', 'agency', 'aura']
const ARCHETYPE_IDS = Object.values(ROLE_TO_ARCHETYPE)
const VECTOR_PERCENT_BASE = 0.3
const QUESTION_VECTOR_PERCENT_DENOMINATOR = 3

/**
 * Component weights total 1.0: MBTI first, then archetype, vector, and character-specific bonuses.
 */
const MBTI_DIMENSION_WEIGHT = 0.125
const MBTI_WEIGHT = MBTI_DIMENSION_WEIGHT * 4
const ARCHETYPE_WEIGHT = 0.22
const VECTOR_WEIGHT = 0.18
const CHARACTER_SPECIFIC_WEIGHT = 0.1

/** Blend archetype/vector scores toward neutral so a few combinations do not dominate random simulations. */
const ARCHETYPE_BLEND_NEUTRAL = 0.25
const ARCHETYPE_BLEND_RELATIVE = 0.75
const VECTOR_BLEND_NEUTRAL = 0.25
const VECTOR_BLEND_RAW = 0.75

/** Compress the four-dimension MBTI mean to reduce the gap between close and average matches. */
export const MBTI_MEAN_POWER = 0.56

const CLOSE_MATCH_THRESHOLD = 0.025

const MBTI_DIMENSION_PAIRS: DimensionPair[] = ['E_I', 'S_N', 'T_F', 'J_P']

// 16personalities-style dimension label config.
export const TRAIT_CONFIG = {
  'E_I': {
    label: 'Energy',
    leftLabel: 'Extraverted',
    rightLabel: 'Introverted',
    leftCN: 'Expressive',
    rightCN: 'Reserved',
    color: '#9b59b6'
  },
  'S_N': {
    label: 'Mind',
    leftLabel: 'Observant',
    rightLabel: 'Intuitive',
    leftCN: 'Observant',
    rightCN: 'Intuitive',
    color: '#3498db'
  },
  'T_F': {
    label: 'Nature',
    leftLabel: 'Thinking',
    rightLabel: 'Feeling',
    leftCN: 'Thinking',
    rightCN: 'Feeling',
    color: '#e74c3c'
  },
  'J_P': {
    label: 'Tactics',
    leftLabel: 'Judging',
    rightLabel: 'Prospecting',
    leftCN: 'Judging',
    rightCN: 'Prospecting',
    color: '#f39c12'
  }
}

export const ROLE_MAPPING: Record<string, { name: string; description: string }> = {
  INTJ: { name: 'Analysts', description: 'Analysts are imaginative and strategic thinkers, with a plan for everything.' },
  INTP: { name: 'Analysts', description: 'Analysts are imaginative and strategic thinkers, with a plan for everything.' },
  ENTJ: { name: 'Analysts', description: 'Analysts are imaginative and strategic thinkers, with a plan for everything.' },
  ENTP: { name: 'Analysts', description: 'Analysts are imaginative and strategic thinkers, with a plan for everything.' },
  INFJ: { name: 'Diplomats', description: 'Diplomats are empathetic and principled, with a deep concern for others.' },
  INFP: { name: 'Diplomats', description: 'Diplomats are empathetic and principled, with a deep concern for others.' },
  ENFJ: { name: 'Diplomats', description: 'Diplomats are empathetic and principled, with a deep concern for others.' },
  ENFP: { name: 'Diplomats', description: 'Diplomats are empathetic and principled, with a deep concern for others.' },
  ISTJ: { name: 'Sentinels', description: 'Sentinels are cooperative and practical, bringing stability and order.' },
  ISFJ: { name: 'Sentinels', description: 'Sentinels are cooperative and practical, bringing stability and order.' },
  ESTJ: { name: 'Sentinels', description: 'Sentinels are cooperative and practical, bringing stability and order.' },
  ESFJ: { name: 'Sentinels', description: 'Sentinels are cooperative and practical, bringing stability and order.' },
  ISTP: { name: 'Explorers', description: 'Explorers are utilitarian, practical, and spontaneous, shining in situations that require quick reaction.' },
  ISFP: { name: 'Explorers', description: 'Explorers are utilitarian, practical, and spontaneous, shining in situations that require quick reaction.' },
  ESTP: { name: 'Explorers', description: 'Explorers are utilitarian, practical, and spontaneous, shining in situations that require quick reaction.' },
  ESFP: { name: 'Explorers', description: 'Explorers are utilitarian, practical, and spontaneous, shining in situations that require quick reaction.' }
}

const MBTI_PATTERN = /^[EI][SN][TF][JP]$/
const DEFAULT_DEBUG_PERCENTAGES: Record<DimensionPair, number> = {
  'E_I': 78,
  'S_N': 74,
  'T_F': 72,
  'J_P': 76,
}

type DirectionalMax = Record<DimensionPair, { positive: number; negative: number }>
type ArchetypeAccumulator = Record<ArchetypeId, number>
type UserVector = Record<DimensionId, number>

type AnswerProfile = {
  scores: Record<DimensionPair, DimensionScore>
  mbtiCode: string
  archetypeRaw: ArchetypeAccumulator
  userVector: UserVector
  matchedArchetype: Archetype
}

export function calculateQuizResult({
  answers,
  questions,
  archetypes,
  characters,
}: {
  answers: number[]
  questions: Question[]
  archetypes: Archetype[]
  characters: CharacterMatch[]
}): QuizResult {
  const answerProfile = buildAnswerProfile({
    answers,
    questions,
    archetypes,
  })
  const { scores, mbtiCode, archetypeRaw, userVector, matchedArchetype } = answerProfile
  const characterRankings = rankCharactersByProfile({
    scores,
    characters,
    archetypeRaw,
    userVector,
    answers,
  })
  const leadingMatches = collectLeadingMatches(characterRankings)
  const featuredCharacter = leadingMatches[0]?.character ?? null
  const charMatches = leadingMatches.slice(0, 3).map((item) => item.character)
  const roleCode = featuredCharacter?.code ?? 'UNKN'
  const matchScore = calculateCharacterMatchScore(leadingMatches[0])
  const matchProbability = getCharacterPopulationProbability(featuredCharacter?.id)

  return {
    code: roleCode,
    mbtiCode,
    scores,
    archetype: matchedArchetype,
    tags: [matchedArchetype.narrativeRole, ...matchedArchetype.tags].slice(0, 6),
    matchScore,
    matchProbability,
    characterMatches: charMatches,
    featuredCharacter,
  }
}

function buildAnswerProfile({
  answers,
  questions,
  archetypes,
}: {
  answers: number[]
  questions: Question[]
  archetypes: Archetype[]
}): AnswerProfile {
  const rawScores: Record<DimensionPair, number> = {
    'E_I': 0, 'S_N': 0, 'T_F': 0, 'J_P': 0
  }
  const directionalMaxScores: DirectionalMax = {
    'E_I': { positive: 0, negative: 0 },
    'S_N': { positive: 0, negative: 0 },
    'T_F': { positive: 0, negative: 0 },
    'J_P': { positive: 0, negative: 0 }
  }
  const archetypeRaw = createEmptyArchetypeAccumulator()
  const userVector = createEmptyUserVector()
  const archetypeMap = new Map(archetypes.map((item) => [item.id, item]))

  questions.forEach((question, index) => {
    const answer = answers[index]
    if (!isAnsweredValue(answer)) {
      return
    }

    const { dimension, sign } = question
    rawScores[dimension] += answer * sign

    if (sign > 0) {
      directionalMaxScores[dimension].positive += 3
    } else {
      directionalMaxScores[dimension].negative += 3
    }

    const normalizedWeights = normalizeQuestionWeights(question.weights ?? QUESTION_WEIGHT_FALLBACKS[dimension])
    const questionAxisBase = createEmptyUserVector()

    for (const role of Object.keys(normalizedWeights) as QuestionArchetypeWeightId[]) {
      const value = normalizedWeights[role] ?? 0
      const archetypeId = ROLE_TO_ARCHETYPE[role]
      const archetype = archetypeMap.get(archetypeId)
      if (!archetype || value === 0) {
        continue
      }

      const weightedAnswer = answer * value
      archetypeRaw[archetypeId] += weightedAnswer

      for (const axis of VECTOR_AXES) {
        questionAxisBase[axis] += value * archetype.vector[axis]
      }
    }

    for (const axis of VECTOR_AXES) {
      const axisPercent = questionAxisBase[axis] / QUESTION_VECTOR_PERCENT_DENOMINATOR
      const axisDelta = axisPercent * VECTOR_PERCENT_BASE * answer
      userVector[axis] += axisDelta
    }
  })

  const scores = {} as Record<DimensionPair, DimensionScore>
  let mbtiCode = ''

  for (const pair in DIMENSION_LETTERS) {
    const dimension = pair as DimensionPair
    const score = normalizeDimensionScore(rawScores[dimension], directionalMaxScores[dimension])
    const [posLetter, negLetter] = DIMENSION_LETTERS[dimension]
    const dominant = score >= 0 ? posLetter : negLetter
    const intensity = Math.min(1, Math.abs(score))
    const percentage = Math.round(50 + (intensity * 50))

    scores[dimension] = {
      pair: dimension,
      score,
      dominant,
      percentage
    }
    mbtiCode += dominant
  }

  return {
    scores,
    mbtiCode,
    archetypeRaw,
    userVector,
    matchedArchetype: pickMatchedArchetype(archetypes, archetypeRaw, mbtiCode),
  }
}

function createEmptyArchetypeAccumulator(): ArchetypeAccumulator {
  return ARCHETYPE_IDS.reduce((acc, id) => {
    acc[id] = 0
    return acc
  }, {} as ArchetypeAccumulator)
}

function createEmptyUserVector(): UserVector {
  return VECTOR_AXES.reduce((acc, axis) => {
    acc[axis] = 0
    return acc
  }, {} as UserVector)
}

function isAnsweredValue(value: number) {
  return value >= -3 && value <= 3
}

function normalizeDimensionScore(
  rawScore: number,
  directionalMax: { positive: number; negative: number },
) {
  if (rawScore >= 0) {
    return rawScore / Math.max(1, directionalMax.positive)
  }

  return rawScore / Math.max(1, directionalMax.negative)
}

function normalizeQuestionWeights(weights: Partial<Record<QuestionArchetypeWeightId, number>>) {
  const completed = Object.keys(ROLE_TO_ARCHETYPE).reduce((acc, role) => {
    const typedRole = role as QuestionArchetypeWeightId
    const base = weights[typedRole] ?? 0
    acc[typedRole] = base * QUESTION_ROLE_BALANCE[typedRole]
    return acc
  }, {} as Record<QuestionArchetypeWeightId, number>)

  const values = Object.values(completed)
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length
  const centered = Object.fromEntries(
    Object.entries(completed).map(([key, value]) => [key, value - mean])
  ) as Record<QuestionArchetypeWeightId, number>

  const norm = Object.values(centered).reduce((sum, value) => sum + Math.abs(value), 0) || 1

  return Object.fromEntries(
    Object.entries(centered).map(([key, value]) => [key, value / norm])
  ) as Record<QuestionArchetypeWeightId, number>
}

function pickMatchedArchetype(
  archetypes: Archetype[],
  archetypeRaw: ArchetypeAccumulator,
  finalCode: string,
) {
  const sortedByScore = [...archetypes].sort((left, right) => {
    const delta = archetypeRaw[right.id] - archetypeRaw[left.id]
    if (delta !== 0) {
      return delta
    }

    return left.id.localeCompare(right.id, 'en')
  })

  return (
    sortedByScore[0] ??
    resolveArchetypeForMbti(finalCode, archetypes) ?? {
      id: 'luminous-lead' as ArchetypeId,
      name: 'Unclassified Traveler',
      subtitle: 'An observer who cannot be defined',
      oneLiner: 'Beyond the world, only the real self remains.',
      description: 'A special presence outside conventional categories.',
      tags: ['special result', 'rare'],
      narrativeRole: 'Observer',
      spotlight: 'A nameless intuition',
      weakness: 'Often hard for others to understand',
      keywords: ['observe', 'unique', 'off-track'],
      accent: '#aaaaaa',
      vector: { expression: 0, temperature: 0, judgement: 0, order: 0, agency: 0, aura: 0 }
    }
  )
}

type RankedCharacter = {
  character: CharacterMatch
  total: number
  mbti: number
  archetype: number
  vector: number
  specific: number
}

function rankCharactersByProfile({
  scores,
  characters,
  archetypeRaw,
  userVector,
  answers,
}: {
  scores: Record<DimensionPair, DimensionScore>
  characters: CharacterMatch[]
  archetypeRaw: ArchetypeAccumulator
  userVector: UserVector
  answers: number[]
}) {
  return [...characters]
    .map((character) => {
      const { mean: mbti, contribution: mbtiContribution } = scoreMbtiMatchCode(character.matchCode, scores)
      const archetype = scoreArchetype(character.archetypeId, archetypeRaw)
      const vector = scoreVector(userVector, character.vector)
      const specific = scoreCharacterSpecific(userVector, character, answers)
      const total =
        mbtiContribution +
        ARCHETYPE_WEIGHT * archetype +
        VECTOR_WEIGHT * vector +
        CHARACTER_SPECIFIC_WEIGHT * specific

      return {
        character,
        total,
        mbti,
        archetype,
        vector,
        specific,
      }
    })
    .sort((left, right) => {
      const totalDelta = right.total - left.total
      if (Math.abs(totalDelta) > 0.005) {
        return totalDelta
      }

      const archetypeDelta = right.archetype - left.archetype
      if (Math.abs(archetypeDelta) > 0.005) {
        return archetypeDelta
      }

      const vectorDelta = right.vector - left.vector
      if (Math.abs(vectorDelta) > 0.005) {
        return vectorDelta
      }

      const specificDelta = right.specific - left.specific
      if (Math.abs(specificDelta) > 0.005) {
        return specificDelta
      }

      return left.character.name.localeCompare(right.character.name, 'zh-Hans-CN')
    })
}

/**
 * Single MBTI dimension match score (0-1): use percentage when the dominant letter matches,
 * otherwise use 100 - percentage, then divide by 100.
 */
function scoreMbtiDimension(
  pair: DimensionPair,
  scores: Record<DimensionPair, DimensionScore>,
  expectedLetter: MBTILetter,
) {
  const actual = scores[pair]
  return (actual.dominant === expectedLetter ? actual.percentage : 100 - actual.percentage) / 100
}

/**
 * Uses only `matchCode`: each of the four dimensions contributes MBTI_DIMENSION_WEIGHT.
 * `mean` is the four-dimension average (0-1), used as a sorting tie-break.
 */
function scoreMbtiMatchCode(matchCode: string, scores: Record<DimensionPair, DimensionScore>) {
  if (!MBTI_PATTERN.test(matchCode.toUpperCase())) {
    return { mean: 0, contribution: 0 }
  }

  const normalized = matchCode.toUpperCase()
  let contribution = 0

  for (let index = 0; index < MBTI_DIMENSION_PAIRS.length; index += 1) {
    const pair = MBTI_DIMENSION_PAIRS[index]
    const expectedLetter = normalized[index] as MBTILetter
    const dim = scoreMbtiDimension(pair, scores, expectedLetter)
    contribution += MBTI_DIMENSION_WEIGHT * dim
  }

  const meanRaw = contribution / MBTI_WEIGHT
  const mean = Math.pow(meanRaw, MBTI_MEAN_POWER)
  const contributionAdjusted = MBTI_WEIGHT * mean
  return { mean, contribution: contributionAdjusted }
}

/**
 * Archetype display score (0-1): rank global raw totals, then assign the top three
 * 12/25, 8/25, and 5/25 respectively. Ties are resolved by archetypeId.
 * This is only for UI displays such as the quiz page archetype bars.
 */
export function scoreArchetypeByRank(archetypeId: ArchetypeId, archetypeRaw: ArchetypeAccumulator) {
  const sorted = (Object.keys(archetypeRaw) as ArchetypeId[]).sort((a, b) => {
    const d = archetypeRaw[b] - archetypeRaw[a]
    if (d !== 0) return d
    return a.localeCompare(b, 'en')
  })
  const rank = sorted.indexOf(archetypeId) + 1
  if (rank === 1) return 12 / 25
  if (rank === 2) return 8 / 25
  if (rank === 3) return 5 / 25
  return 0
}

/**
 * Archetype contribution score (0-1): min-max normalize this answer sheet's archetypeRaw.
 * Lower-ranked archetypes still get a non-zero value to reduce random-simulation monopolies.
 */
export function scoreArchetypeRelative(archetypeId: ArchetypeId, archetypeRaw: ArchetypeAccumulator) {
  const ids = Object.keys(archetypeRaw) as ArchetypeId[]
  const values = ids.map((id) => archetypeRaw[id])
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min
  if (span <= 1e-9) {
    return 0.5
  }
  return (archetypeRaw[archetypeId] - min) / span
}

function scoreArchetype(archetypeId: ArchetypeId, archetypeRaw: ArchetypeAccumulator) {
  const relative = scoreArchetypeRelative(archetypeId, archetypeRaw)
  return ARCHETYPE_BLEND_RELATIVE * relative + ARCHETYPE_BLEND_NEUTRAL
}

function scoreVector(
  userVector: UserVector,
  characterVector: CharacterMatch['vector'],
) {
  const cosine = cosineSimilarity(userVector, characterVector)
  const raw = (cosine + 1) / 2
  return VECTOR_BLEND_RAW * raw + VECTOR_BLEND_NEUTRAL
}

function scoreCharacterSpecific(
  userVector: UserVector,
  character: CharacterMatch,
  answers: number[],
) {
  const uniqueAxes = character.signature?.uniqueAxes
  const questionAffinity = character.signature?.questionAffinity ?? []

  // No explicit character-feature bonus config => no specific bonus.
  if (!questionAffinity.length) {
    return 0
  }

  const axisScore = !uniqueAxes || !Object.keys(uniqueAxes).length
    ? scoreVector(userVector, character.vector)
    : scoreUniqueAxes(userVector, uniqueAxes)

  const affinityScore = scoreQuestionAffinity(questionAffinity, answers)
  return axisScore * 0.45 + affinityScore * 0.55
}

function scoreUniqueAxes(
  userVector: UserVector,
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

function scoreQuestionAffinity(
  affinities: NonNullable<NonNullable<CharacterMatch['signature']>['questionAffinity']>,
  answers: number[],
) {
  let weightedScore = 0
  let weightTotal = 0

  for (const affinity of affinities) {
    const questionIndex = getQuestionIndexById(affinity.questionId)
    if (questionIndex < 0) {
      continue
    }

    const answer = answers[questionIndex]
    if (!isAnsweredValue(answer)) {
      continue
    }

    const weight = affinity.weight ?? 1
    weightedScore += evaluateAffinity(answer, affinity.expected) * weight
    weightTotal += weight
  }

  return weightTotal ? weightedScore / weightTotal : 0.5
}

function evaluateAffinity(answer: number, expected: 'agree' | 'disagree' | 'neutral') {
  if (expected === 'agree') {
    return Math.max(0, (answer + 3) / 6)
  }

  if (expected === 'disagree') {
    return Math.max(0, (3 - answer) / 6)
  }

  return Math.max(0, 1 - Math.abs(answer) / 3)
}

function getQuestionIndexById(questionId: string) {
  return Number.parseInt(questionId.replace(/^q/i, ''), 10) - 1
}

function collectLeadingMatches(rankings: RankedCharacter[]) {
  if (!rankings.length) {
    return []
  }

  const leader = rankings[0]
  const closeMatches = rankings.filter((item) => leader.total - item.total <= CLOSE_MATCH_THRESHOLD)

  if (closeMatches.length === 1) {
    return rankings
  }

  return [
    ...closeMatches,
    ...rankings.filter((item) => leader.total - item.total > CLOSE_MATCH_THRESHOLD)
  ]
}

function cosineSimilarity(
  left: UserVector,
  right: CharacterMatch['vector'],
) {
  let dot = 0
  let leftMagnitude = 0
  let rightMagnitude = 0

  for (const axis of VECTOR_AXES) {
    dot += left[axis] * right[axis]
    leftMagnitude += left[axis] * left[axis]
    rightMagnitude += right[axis] * right[axis]
  }

  const denominator = Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude)
  if (!denominator) {
    return 0
  }

  return dot / denominator
}

export function normalizeMbtiCode(mbtiCode: string) {
  const normalized = mbtiCode.trim().toUpperCase()
  return MBTI_PATTERN.test(normalized) ? normalized : null
}

export function buildScoresFromMbtiCode(
  mbtiCode: string,
  percentages: Partial<Record<DimensionPair, number>> = {},
) {
  const normalized = normalizeMbtiCode(mbtiCode)

  if (!normalized) {
    return null
  }

  const pairs: DimensionPair[] = ['E_I', 'S_N', 'T_F', 'J_P']

  return pairs.reduce((acc, pair, index) => {
    const dominant = normalized[index] as MBTILetter
    const percentage = Math.max(50, Math.min(99, Math.round(percentages[pair] ?? DEFAULT_DEBUG_PERCENTAGES[pair])))
    const sign = dominant === DIMENSION_LETTERS[pair][0] ? 1 : -1

    acc[pair] = {
      pair,
      dominant,
      percentage,
      score: sign * (percentage - 50),
    }

    return acc
  }, {} as Record<DimensionPair, DimensionScore>)
}

export function resolveArchetypeForMbti(mbtiCode: string, archetypes: Archetype[]) {
  const normalized = normalizeMbtiCode(mbtiCode)

  if (!normalized) {
    return null
  }

  const matchedArchetypeId = TYPE_TO_ARCHETYPE[normalized]
  return (
    archetypes.find((item) => item.id === matchedArchetypeId) ??
    archetypes.find((item) => item.id === 'luminous-lead') ??
    null
  )
}

export function rankCharactersForMbti({
  characters,
  mbtiCode,
  preferredCharacterId,
}: {
  characters: CharacterMatch[]
  mbtiCode: string
  preferredCharacterId?: string | null
}) {
  const normalized = normalizeMbtiCode(mbtiCode)

  if (!normalized) {
    return []
  }

  const scores = buildScoresFromMbtiCode(normalized)
  if (!scores) {
    return []
  }

  const matchedArchetypeId = TYPE_TO_ARCHETYPE[normalized]
  const emptyArchetypeRaw = createEmptyArchetypeAccumulator()
  if (matchedArchetypeId) {
    emptyArchetypeRaw[matchedArchetypeId] = 1
  }

  const ranked = rankCharactersByProfile({
    scores,
    characters,
    archetypeRaw: emptyArchetypeRaw,
    userVector: createEmptyUserVector(),
    answers: [],
  }).map((item) => item.character)

  const preferredId = preferredCharacterId?.trim().toLowerCase()
  if (!preferredId) {
    return ranked
  }

  return [...ranked].sort((left, right) => {
    if (left.id === preferredId && right.id !== preferredId) {
      return -1
    }

    if (right.id === preferredId && left.id !== preferredId) {
      return 1
    }

    return 0
  })
}

export function createDebugQuizResult({
  characterId,
  archetypes,
  characters,
}: {
  characterId: string
  archetypes: Archetype[]
  characters: CharacterMatch[]
}): QuizResult | null {
  const requestedCharacterId = characterId.trim().toLowerCase()
  const character = characters.find((item) => item.id === requestedCharacterId)

  if (!character) {
    return null
  }

  const matchedArchetype =
    archetypes.find((item) => item.id === character.archetypeId) ??
    archetypes.find((item) => item.id === 'luminous-lead') ??
    null

  if (!matchedArchetype) {
    return null
  }

  const scores = buildScoresFromMbtiCode(character.matchCode)
  if (!scores) {
    return null
  }

  return {
    code: character.code,
    mbtiCode: character.matchCode,
    scores,
    archetype: matchedArchetype,
    tags: [matchedArchetype.narrativeRole, ...matchedArchetype.tags].slice(0, 6),
    matchScore: 92,
    matchProbability: getCharacterPopulationProbability(character.id),
    characterMatches: [character],
    featuredCharacter: character,
  }
}

function calculateCharacterMatchScore(topMatch?: RankedCharacter) {
  if (!topMatch) {
    return 60
  }

  return Math.max(60, Math.min(99, Math.round(topMatch.total * 100)))
}

export function getRoleForType(mbtiType: string): { name: string; description: string } {
  const baseType = mbtiType.slice(0, 4)
  return ROLE_MAPPING[baseType] || { name: 'Explorers', description: 'Unique individuals with diverse perspectives.' }
}
