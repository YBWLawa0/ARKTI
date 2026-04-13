import { calculateQuizResult } from '../src/utils/quizEngine.ts'
import questions from '../src/data/questions.json' with { type: 'json' }
import archetypes from '../src/data/archetypes.json' with { type: 'json' }
import characters from '../src/data/characters.json' with { type: 'json' }

function createRng(seed) {
  let state = seed >>> 0

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0x100000000
  }
}

const answerScale = [-3, -2, -1, 0, 1, 2, 3]
const rng = createRng(20260411)
const runs = 200000
const winnerCounts = new Map(characters.map((character) => [character.id, 0]))

for (let index = 0; index < runs; index += 1) {
  const answers = questions.map(() => answerScale[Math.floor(rng() * answerScale.length)])
  const result = calculateQuizResult({
    answers,
    questions,
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

console.log(JSON.stringify({
  seed: 20260411,
  runs,
  entries,
}, null, 2))
