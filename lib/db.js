import { neon } from '@neondatabase/serverless'

const URL = process.env.DATABASE_URL

if (!URL) console.warn('[db] DATABASE_URL não configurada')

// Neon cria uma nova conexão HTTP por request — ideal para serverless
// Não precisa de cache de conexão como Mongoose
export const sql = URL ? neon(URL) : null

export const dbAvailable = () => Boolean(URL)

// Cria as tabelas se não existirem (idempotente)
export async function setupTables() {
  if (!sql) return

  await sql`
    CREATE TABLE IF NOT EXISTS matches (
      id          SERIAL PRIMARY KEY,
      espn_id     TEXT UNIQUE NOT NULL,
      competition TEXT        NOT NULL DEFAULT 'brasileirao-serie-a',
      season      INT         NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
      status      TEXT        NOT NULL DEFAULT 'AGENDADO',
      minute      TEXT,
      round       TEXT,
      stadium     TEXT,
      utc_date    TIMESTAMPTZ,
      home_id     TEXT,
      home_name   TEXT        NOT NULL,
      home_abbr   TEXT,
      home_crest  TEXT,
      home_score  INT,
      away_id     TEXT,
      away_name   TEXT        NOT NULL,
      away_abbr   TEXT,
      away_crest  TEXT,
      away_score  INT,
      synced_at   TIMESTAMPTZ DEFAULT NOW(),
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      updated_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS teams (
      id            SERIAL PRIMARY KEY,
      espn_id       TEXT        NOT NULL,
      competition   TEXT        NOT NULL DEFAULT 'brasileirao-serie-a',
      season        INT         NOT NULL,
      name          TEXT        NOT NULL,
      abbr          TEXT,
      crest         TEXT,
      position      INT         DEFAULT 0,
      points        INT         DEFAULT 0,
      played        INT         DEFAULT 0,
      wins          INT         DEFAULT 0,
      draws         INT         DEFAULT 0,
      losses        INT         DEFAULT 0,
      goals_for     INT         DEFAULT 0,
      goals_against INT         DEFAULT 0,
      goal_diff     INT         DEFAULT 0,
      synced_at     TIMESTAMPTZ DEFAULT NOW(),
      created_at    TIMESTAMPTZ DEFAULT NOW(),
      updated_at    TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE (espn_id, season, competition)
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS players (
      id             SERIAL PRIMARY KEY,
      espn_id        TEXT,
      competition    TEXT        NOT NULL DEFAULT 'brasileirao-serie-a',
      season         INT         NOT NULL,
      name           TEXT        NOT NULL,
      team_name      TEXT,
      team_id        TEXT,
      team_crest     TEXT,
      position       TEXT        DEFAULT 'Unknown',
      appearances    INT         DEFAULT 0,
      goals          INT         DEFAULT 0,
      assists        INT         DEFAULT 0,
      yellow_cards   INT         DEFAULT 0,
      red_cards      INT         DEFAULT 0,
      minutes_played INT         DEFAULT 0,
      synced_at      TIMESTAMPTZ DEFAULT NOW(),
      created_at     TIMESTAMPTZ DEFAULT NOW(),
      updated_at     TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE (espn_id, season, competition)
    )
  `

  // Coluna market_value nos players (add se não existe)
  await sql`ALTER TABLE players ADD COLUMN IF NOT EXISTS market_value TEXT`.catch(() => {})
  await sql`ALTER TABLE players ADD COLUMN IF NOT EXISTS market_value_num NUMERIC`.catch(() => {})

  // Tabela de comentários
  await sql`
    CREATE TABLE IF NOT EXISTS comments (
      id         SERIAL PRIMARY KEY,
      match_id   TEXT        NOT NULL,
      parent_id  INT         REFERENCES comments(id) ON DELETE CASCADE,
      username   TEXT        NOT NULL,
      color      TEXT        NOT NULL DEFAULT '#00E676',
      body       TEXT        NOT NULL,
      likes      INT         NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS idx_comments_match ON comments(match_id, created_at DESC)`

  // Tabela de likes (evita duplo like)
  await sql`
    CREATE TABLE IF NOT EXISTS comment_likes (
      comment_id INT  NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
      client_id  TEXT NOT NULL,
      PRIMARY KEY (comment_id, client_id)
    )
  `

  // Tabela de push subscriptions
  await sql`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id         SERIAL PRIMARY KEY,
      endpoint   TEXT UNIQUE NOT NULL,
      p256dh     TEXT,
      auth       TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  // Índices de performance
  await sql`CREATE INDEX IF NOT EXISTS idx_matches_status  ON matches (status)`
  await sql`CREATE INDEX IF NOT EXISTS idx_matches_season  ON matches (season, competition)`
  await sql`CREATE INDEX IF NOT EXISTS idx_matches_date    ON matches (utc_date DESC)`
  await sql`CREATE INDEX IF NOT EXISTS idx_teams_season    ON teams (season, competition, position)`
  await sql`CREATE INDEX IF NOT EXISTS idx_players_goals   ON players (season, competition, goals DESC)`
}
