import type { QuizResult } from '../types/quiz'

export interface StatsSummaryRow {
  key: string
  label: string
  count: number
  percentage: number
}

export interface StatsRegionRow {
  region: string
  count: number
}

export interface StatsSummary {
  total: number
  filters: {
    region: string
  }
  regions: StatsRegionRow[]
  characters: StatsSummaryRow[]
  mbti: StatsSummaryRow[]
  archetypes: StatsSummaryRow[]
}

function getStatsSessionId() {
  const key = 'arkti:stats:session-id'

  try {
    const existing = localStorage.getItem(key)
    if (existing) {
      return existing
    }

    const id = crypto.randomUUID()
    localStorage.setItem(key, id)
    return id
  } catch {
    return crypto.randomUUID()
  }
}

export async function submitResultStats(result: QuizResult, locale: string) {
  const primaryCharacter = result.characterMatches[0]

  if (!primaryCharacter) {
    return
  }

  try {
    await fetch('/api/stats', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        eventId: crypto.randomUUID(),
        sessionId: getStatsSessionId(),
        locale,
        characterId: primaryCharacter.id,
        characterName: primaryCharacter.name,
        mbtiCode: result.mbtiCode,
        archetypeId: result.archetype.id,
        archetypeName: result.archetype.name,
        matchScore: result.matchScore,
      }),
      keepalive: true,
    })
  } catch {
    // Stats must never block the result flow.
  }
}

export async function fetchStatsSummary(region = ''): Promise<StatsSummary> {
  const params = new URLSearchParams()
  if (region) {
    params.set('region', region)
  }

  const response = await fetch(`/api/stats${params.size ? `?${params.toString()}` : ''}`)
  if (!response.ok) {
    throw new Error(`Failed to load stats: ${response.status}`)
  }

  return response.json() as Promise<StatsSummary>
}
