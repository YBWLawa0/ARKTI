import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { calculateQuizResult } from '../src/utils/quizEngine.ts'
import questions from '../src/data/questions.json' with { type: 'json' }
import archetypes from '../src/data/archetypes.json' with { type: 'json' }
import characters from '../src/data/characters.json' with { type: 'json' }

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const probabilityOut = path.join(root, 'src/data/characterProbabilities.json')

function createRng(seed) {
  let state = seed >>> 0

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0x100000000
  }
}

const answerScale = [-3, -2, -1, 0, 1, 2, 3]
/** 与 src/constants/quizSession.ts 中 QUIZ_SESSION_QUESTION_COUNT 保持一致 */
const QUIZ_SESSION_QUESTION_COUNT = 20
const rng = createRng(20260411)
const runs = 200000
const winnerCounts = new Map(characters.map((character) => [character.id, 0]))

function shufflePickSession(source, count) {
  const n = Math.min(count, source.length)
  const copy = [...source]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, n)
}

for (let index = 0; index < runs; index += 1) {
  const sessionQuestions = shufflePickSession(questions, QUIZ_SESSION_QUESTION_COUNT)
  const answers = sessionQuestions.map(() => answerScale[Math.floor(rng() * answerScale.length)])
  const result = calculateQuizResult({
    answers,
    questions: sessionQuestions,
    archetypes,
    characters,
  })
  const winnerId = result.featuredCharacter?.id
  if (winnerId) {
    winnerCounts.set(winnerId, (winnerCounts.get(winnerId) ?? 0) + 1)
  }
}

const entries = [...winnerCounts.entries()]
  .sort((left, right) => right[1] - left[1])
  .map(([id, count]) => ({
    id,
    count,
    probability: Number(((count / runs) * 100).toFixed(2)),
  }))

const probabilities = Object.fromEntries(
  characters.map((character) => {
    const count = winnerCounts.get(character.id) ?? 0
    return [character.id, Number(((count / runs) * 100).toFixed(2))]
  }),
)

const payload = {
  seed: 20260411,
  runs,
  probabilities,
}

fs.writeFileSync(probabilityOut, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
console.log(`Wrote ${path.relative(root, probabilityOut)}`)

console.log(JSON.stringify({
  seed: 20260411,
  runs,
  entries,
}, null, 2))
