export type DimensionId =
  | 'expression'
  | 'temperature'
  | 'judgement'
  | 'order'
  | 'agency'
  | 'aura'

export type ArchetypeId =
  | 'luminous-lead'
  | 'icebound-observer'
  | 'oathbound-captain'
  | 'trickster-orbit'
  | 'gentle-healer'
  | 'shadow-strategist'
  | 'chaos-spark'
  | 'moonlit-guardian'

export type DimensionPair = 'E_I' | 'S_N' | 'T_F' | 'J_P'

export type MBTILetter = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P'

export type QuestionArchetypeWeightId =
  | 'hero'
  | 'strategist'
  | 'guardian'
  | 'lonewolf'
  | 'healer'
  | 'berserker'
  | 'trickster'
  | 'ruler'

export interface QuestionOption {
  id: string
  label: string
  tone: string
  weights: Partial<Record<QuestionArchetypeWeightId, number>>
}

export interface Question {
  id: string
  text?: string
  prompt?: string
  scene: string
  options?: QuestionOption[]
  weights?: Partial<Record<QuestionArchetypeWeightId, number>>
  dimension: DimensionPair
  sign: 1 | -1
}

export interface Archetype {
  id: ArchetypeId
  name: string
  subtitle: string
  oneLiner: string
  description: string
  tags: string[]
  narrativeRole: string
  spotlight: string
  weakness: string
  keywords: string[]
  accent: string
  vector: Record<DimensionId, number>
  /** Light side, or the strength-facing aspect. */
  lightSide?: string
  /** Dark side, or the shadow-facing body copy. */
  darkSide?: string
}

export interface CharacterMatch {
  id: string
  name: string
  series: string
  image?: string
  imageScale?: number
  backgroundImage?: string
  backgroundShadow?: boolean
  backgroundPositionX?: number
  backgroundPositionY?: number
  accent?: string
  matchCode: string
  code: string
  title?: string
  archetypeId: ArchetypeId
  tags: string[]
  note: string
  vector: Record<DimensionId, number>
  signature?: {
    uniqueAxes?: Partial<Record<DimensionId, number>>
    questionAffinity?: Array<{
      questionId: string
      expected: 'agree' | 'disagree' | 'neutral'
      weight?: number
    }>
  }
  quotes?: Array<Array<{ speaker: string; line: string }>>
}

export interface DimensionScore {
  pair: DimensionPair
  score: number
  dominant: MBTILetter
  percentage: number
}

export interface QuizRecord {
  answers: number[]
  /** Question id order for this answer sheet, aligned with answers. */
  questionIds?: string[]
  createdAt: string
  result: QuizResult
}

export interface QuizResult {
  code: string
  mbtiCode: string
  archetype: Archetype
  scores: Record<DimensionPair, DimensionScore>
  tags: string[]
  matchScore: number
  matchProbability: number
  characterMatches: CharacterMatch[]
  featuredCharacter: CharacterMatch | null
}

// 16personalities-style extra types.
export interface TraitBar {
  label: string
  leftLabel: string
  rightLabel: string
  percentage: number
  dominant: 'left' | 'right'
  color: string
}

export interface RoleCard {
  title: string
  subtitle: string
  description: string
  imageUrl?: string
  learnMoreUrl?: string
}
