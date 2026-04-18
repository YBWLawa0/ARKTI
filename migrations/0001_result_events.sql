CREATE TABLE IF NOT EXISTS result_events (
  event_id TEXT PRIMARY KEY,
  session_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  region TEXT NOT NULL DEFAULT 'XX',
  locale TEXT,
  character_id TEXT NOT NULL,
  character_name TEXT NOT NULL,
  mbti_code TEXT NOT NULL,
  archetype_id TEXT NOT NULL,
  archetype_name TEXT,
  match_score INTEGER
);

CREATE INDEX IF NOT EXISTS idx_result_events_region ON result_events(region);
CREATE INDEX IF NOT EXISTS idx_result_events_character ON result_events(character_id);
CREATE INDEX IF NOT EXISTS idx_result_events_mbti ON result_events(mbti_code);
CREATE INDEX IF NOT EXISTS idx_result_events_archetype ON result_events(archetype_id);
CREATE INDEX IF NOT EXISTS idx_result_events_created_at ON result_events(created_at);
