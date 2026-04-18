interface Env {
  DB: D1Database
}

interface StatsEventPayload {
  eventId?: unknown
  sessionId?: unknown
  locale?: unknown
  characterId?: unknown
  characterName?: unknown
  mbtiCode?: unknown
  archetypeId?: unknown
  archetypeName?: unknown
  matchScore?: unknown
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
      ...init.headers,
    },
  })
}

function readText(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function readNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function normalizeRegion(value: unknown) {
  const region = readText(value, 8).toUpperCase()
  return /^[A-Z]{2}$/.test(region) ? region : 'XX'
}

function withPercentage(rows: StatsRow[], total: number) {
  return rows.map((row) => ({
    ...row,
    percentage: total > 0 ? (row.count / total) * 100 : 0,
  }))
}

async function handlePost({ request, env }: EventContext<Env, string, unknown>) {
  let payload: StatsEventPayload

  try {
    payload = await request.json()
  } catch {
    return json({ error: 'Invalid JSON.' }, { status: 400 })
  }

  const eventId = readText(payload.eventId, 64) || crypto.randomUUID()
  const sessionId = readText(payload.sessionId, 64)
  const characterId = readText(payload.characterId, 80)
  const characterName = readText(payload.characterName, 120)
  const mbtiCode = readText(payload.mbtiCode, 8).toUpperCase()
  const archetypeId = readText(payload.archetypeId, 80)
  const archetypeName = readText(payload.archetypeName, 120)
  const locale = readText(payload.locale, 16)
  const region = normalizeRegion(request.cf?.country)
  const matchScore = readNumber(payload.matchScore)

  if (!characterId || !characterName || !mbtiCode || !archetypeId) {
    return json({ error: 'Missing result fields.' }, { status: 400 })
  }

  await env.DB.prepare(
    `INSERT OR IGNORE INTO result_events (
      event_id,
      session_id,
      created_at,
      region,
      locale,
      character_id,
      character_name,
      mbti_code,
      archetype_id,
      archetype_name,
      match_score
    ) VALUES (?, ?, datetime('now'), ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(eventId, sessionId, region, locale, characterId, characterName, mbtiCode, archetypeId, archetypeName, matchScore)
    .run()

  return json({ ok: true })
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

async function handleGet({ request, env }: EventContext<Env, string, unknown>) {
  const url = new URL(request.url)
  const region = normalizeRegion(url.searchParams.get('region') || '')
  const activeRegion = region === 'XX' && !url.searchParams.has('region') ? '' : region
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

export const onRequestGet = handleGet
export const onRequestPost = handlePost
