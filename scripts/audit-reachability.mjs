import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const questions = JSON.parse(fs.readFileSync(path.join(root, 'src/data/questions.json'), 'utf8'))
const characters = JSON.parse(fs.readFileSync(path.join(root, 'src/data/characters.json'), 'utf8'))
const archetypes = JSON.parse(fs.readFileSync(path.join(root, 'src/data/archetypes.json'), 'utf8'))

const ROLE_TO_ARCHETYPE = {
  hero: 'luminous-lead',
  strategist: 'shadow-strategist',
  guardian: 'moonlit-guardian',
  lonewolf: 'icebound-observer',
  healer: 'gentle-healer',
  berserker: 'chaos-spark',
  trickster: 'trickster-orbit',
  ruler: 'oathbound-captain',
}

const DIMENSION_LETTERS = {
  E_I: ['E', 'I'],
  S_N: ['S', 'N'],
  T_F: ['T', 'F'],
  J_P: ['J', 'P'],
}

const VECTOR_AXES = ['expression', 'temperature', 'judgement', 'order', 'agency', 'aura']
const MBTI_WEIGHT = 0.25
const ARCHETYPE_WEIGHT = 0.35
const VECTOR_WEIGHT = 0.3
const CHARACTER_SPECIFIC_WEIGHT = 0.1

function normalizeQuestionWeights(weights) {
  const completed = Object.keys(ROLE_TO_ARCHETYPE).reduce((acc, role) => {
    acc[role] = weights?.[role] ?? 0
    return acc
  }, {})

  const values = Object.values(completed)
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length
  const centered = Object.fromEntries(
    Object.entries(completed).map(([key, value]) => [key, value - mean])
  )
  const norm = Object.values(centered).reduce((sum, value) => sum + Math.abs(value), 0) || 1
  return Object.fromEntries(Object.entries(centered).map(([key, value]) => [key, value / norm]))
}

function buildScores(answers) {
  const rawScores = { E_I: 0, S_N: 0, T_F: 0, J_P: 0 }
  const directionalMaxScores = {
    E_I: { positive: 0, negative: 0 },
    S_N: { positive: 0, negative: 0 },
    T_F: { positive: 0, negative: 0 },
    J_P: { positive: 0, negative: 0 },
  }
  const archetypeRaw = Object.fromEntries(archetypes.map((item) => [item.id, 0]))
  const userVector = Object.fromEntries(VECTOR_AXES.map((axis) => [axis, 0]))
  const archetypeMap = new Map(archetypes.map((item) => [item.id, item]))

  questions.forEach((question, index) => {
    const answer = answers[index]
    rawScores[question.dimension] += answer * question.sign

    if (question.sign > 0) {
      directionalMaxScores[question.dimension].positive += 3
    } else {
      directionalMaxScores[question.dimension].negative += 3
    }

    const normalizedWeights = normalizeQuestionWeights(question.weights)
    for (const role of Object.keys(normalizedWeights)) {
      const value = normalizedWeights[role]
      const archetypeId = ROLE_TO_ARCHETYPE[role]
      const archetype = archetypeMap.get(archetypeId)
      const weightedAnswer = answer * value
      archetypeRaw[archetypeId] += weightedAnswer

      for (const axis of VECTOR_AXES) {
        userVector[axis] += weightedAnswer * archetype.vector[axis]
      }
    }
  })

  const scores = {}
  let mbtiCode = ''

  for (const pair of Object.keys(DIMENSION_LETTERS)) {
    const directional = directionalMaxScores[pair]
    const raw = rawScores[pair]
    const normalized = raw >= 0 ? raw / Math.max(1, directional.positive) : raw / Math.max(1, directional.negative)
    const [left, right] = DIMENSION_LETTERS[pair]
    const dominant = normalized >= 0 ? left : right
    const percentage = Math.round(50 + Math.min(1, Math.abs(normalized)) * 50)
    scores[pair] = { dominant, percentage }
    mbtiCode += dominant
  }

  return { scores, archetypeRaw, userVector, mbtiCode }
}

function scoreMbti(code, scores) {
  if (!/^[EI][SN][TF][JP]$/.test(code)) {
    return 0
  }

  const pairs = ['E_I', 'S_N', 'T_F', 'J_P']
  let total = 0
  for (let i = 0; i < pairs.length; i += 1) {
    const pair = pairs[i]
    const actual = scores[pair]
    total += actual.dominant === code[i] ? actual.percentage : 100 - actual.percentage
  }
  return total / 400
}

function scoreArchetype(id, archetypeRaw) {
  const values = Object.values(archetypeRaw)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const spread = max - min
  if (spread <= 0.0001) {
    return archetypeRaw[id] >= 0 ? 0.55 : 0.45
  }
  return (archetypeRaw[id] - min) / spread
}

function cosine(left, right) {
  let dot = 0
  let leftMag = 0
  let rightMag = 0
  for (const axis of VECTOR_AXES) {
    dot += left[axis] * right[axis]
    leftMag += left[axis] * left[axis]
    rightMag += right[axis] * right[axis]
  }
  const denominator = Math.sqrt(leftMag) * Math.sqrt(rightMag)
  return denominator ? dot / denominator : 0
}

function scoreSpecific(userVector, character) {
  const uniqueAxes = character.signature?.uniqueAxes
  if (!uniqueAxes || !Object.keys(uniqueAxes).length) {
    return (cosine(userVector, character.vector) + 1) / 2
  }

  let weightedScore = 0
  let weightTotal = 0
  for (const axis of Object.keys(uniqueAxes)) {
    const expected = uniqueAxes[axis]
    const axisWeight = Math.max(0.5, Math.abs(expected))
    const similarity = Math.max(0, 1 - Math.abs(userVector[axis] - expected) / 18)
    weightedScore += similarity * axisWeight
    weightTotal += axisWeight
  }

  return weightTotal ? weightedScore / weightTotal : 0.5
}

function scoreCharacter(profile, character) {
  const mbti = Math.max(scoreMbti(character.matchCode, profile.scores), ...((character.matchCodeFlex ?? []).map((code) => scoreMbti(code, profile.scores))))
  const archetype = scoreArchetype(character.archetypeId, profile.archetypeRaw)
  const vector = (cosine(profile.userVector, character.vector) + 1) / 2
  const specific = scoreSpecific(profile.userVector, character)
  return MBTI_WEIGHT * mbti + ARCHETYPE_WEIGHT * archetype + VECTOR_WEIGHT * vector + CHARACTER_SPECIFIC_WEIGHT * specific
}

function randomAnswers() {
  return questions.map(() => Math.floor(Math.random() * 7) - 3)
}

const iterations = Number(process.argv[2] ?? 20000)
const counts = new Map(characters.map((character) => [character.id, 0]))

for (let index = 0; index < iterations; index += 1) {
  const profile = buildScores(randomAnswers())
  const ranked = [...characters]
    .map((character) => ({ id: character.id, score: scoreCharacter(profile, character) }))
    .sort((left, right) => right.score - left.score)

  counts.set(ranked[0].id, (counts.get(ranked[0].id) ?? 0) + 1)
}

const table = [...counts.entries()]
  .map(([id, count]) => ({
    id,
    count,
    share: Number((count / iterations).toFixed(4)),
  }))
  .sort((left, right) => left.count - right.count)

console.table(table)
