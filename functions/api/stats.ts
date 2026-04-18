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

function handleGet() {
  return json({
    error: 'Stats reads are available from the protected admin API only.',
  }, { status: 404 })
}

export const onRequestGet = handleGet
export const onRequestPost = handlePost
