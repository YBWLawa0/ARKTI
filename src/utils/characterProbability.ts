import characterProbabilitiesData from '../data/characterProbabilities.json' with { type: 'json' }

const probabilityDataset = characterProbabilitiesData as {
  seed: number
  runs: number
  probabilities: Record<string, number>
}

export const CHARACTER_PROBABILITY_RUNS = probabilityDataset.runs
export const CHARACTER_PROBABILITY_SEED = probabilityDataset.seed

export function getCharacterPopulationProbability(characterId: string | null | undefined) {
  if (!characterId) {
    return 0
  }

  const hasProbability = Object.prototype.hasOwnProperty.call(probabilityDataset.probabilities, characterId)
  if (!hasProbability) {
    return 0
  }

  return Math.max(0.01, probabilityDataset.probabilities[characterId] ?? 0)
}
