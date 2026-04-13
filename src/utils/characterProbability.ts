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

  return probabilityDataset.probabilities[characterId] ?? 0
}
