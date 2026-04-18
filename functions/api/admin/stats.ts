interface Env {
  DB: D1Database
}

interface StatsRow {
  key: string
  label: string
  count: number
}

function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...init.headers,
    },
  })
}

function normalizeRegion(value: string | null) {
  const region = String(value ?? '').trim().toUpperCase().slice(0, 8)
  return /^[A-Z]{2}$/.test(region) ? region : ''
}

function withPercentage(rows: StatsRow[], total: number) {
  return rows.map((row) => ({
    ...row,
    percentage: total > 0 ? (row.count / total) * 100 : 0,
  }))
}

async function groupedRows(env: Env, field: string, labelField: string, region: string) {
  const whereClause = region ? 'WHERE region = ?' : ''
  const statement = env.DB.prepare(
    `SELECT ${field} AS key, ${labelField} AS label, COUNT(*) AS count
     FROM result_events
     ${whereClause}
     GROUP BY ${field}, ${labelField}
     ORDER BY count DESC, label ASC
     LIMIT 100`,
  )

  const result = region ? await statement.bind(region).all<StatsRow>() : await statement.all<StatsRow>()
  return result.results ?? []
}

export async function onRequestGet({ request, env }: EventContext<Env, string, unknown>) {
  const url = new URL(request.url)
  const activeRegion = normalizeRegion(url.searchParams.get('region'))
  const totalStatement = env.DB.prepare(`SELECT COUNT(*) AS count FROM result_events ${activeRegion ? 'WHERE region = ?' : ''}`)
  const totalResult = activeRegion
    ? await totalStatement.bind(activeRegion).first<{ count: number }>()
    : await totalStatement.first<{ count: number }>()
  const total = totalResult?.count ?? 0

  const regionResult = await env.DB.prepare(
    `SELECT region, COUNT(*) AS count
     FROM result_events
     GROUP BY region
     ORDER BY count DESC, region ASC
     LIMIT 250`,
  ).all<{ region: string; count: number }>()

  const [characters, mbti, archetypes] = await Promise.all([
    groupedRows(env, 'character_id', 'character_name', activeRegion),
    groupedRows(env, 'mbti_code', 'mbti_code', activeRegion),
    groupedRows(env, 'archetype_id', 'archetype_name', activeRegion),
  ])

  return json({
    total,
    filters: {
      region: activeRegion,
    },
    regions: regionResult.results ?? [],
    characters: withPercentage(characters, total),
    mbti: withPercentage(mbti, total),
    archetypes: withPercentage(archetypes, total),
  })
}
