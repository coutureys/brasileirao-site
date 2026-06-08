/**
 * 🚀 SYNC-STATS MULTI-LIGA
 * Raspa FBref via Firecrawl para todas as ligas suportadas
 * Uso: node scripts/sync-stats.js [league]
 * Ex:  node scripts/sync-stats.js bra.1
 *      node scripts/sync-stats.js all
 */
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const envPath = resolve(dirname(fileURLToPath(import.meta.url)), '..', '.env.local')
const envLines = readFileSync(envPath, 'utf-8').split('\n')
for (const line of envLines) {
  const [k, ...rest] = line.split('=')
  if (k && !k.startsWith('#')) process.env[k.trim()] ??= rest.join('=').trim().replace(/^"|"$/g, '')
}

import FirecrawlApp from '@mendable/firecrawl-js'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

// ── Configuração de ligas ──────────────────────────────────────────────────
const LEAGUES = {
  'bra.1': {
    name:        'Brasileirão Série A',
    competition: 'brasileirao-serie-a',
    fbref:       'https://fbref.com/en/comps/24/stats/Serie-A-Stats',
    cache:       './cache-bra1.json',
  },
  'bra.2': {
    name:        'Brasileirão Série B',
    competition: 'brasileirao-serie-b',
    fbref:       'https://fbref.com/en/comps/73/stats/Serie-B-Stats',
    cache:       './cache-bra2.json',
  },
  'bra.copa': {
    name:        'Copa do Brasil',
    competition: 'copa-do-brasil',
    fbref:       'https://fbref.com/en/comps/61/stats/Copa-do-Brasil-Stats',
    cache:       './cache-bracopa.json',
  },
  'conmebol.libertadores': {
    name:        'Copa Libertadores',
    competition: 'copa-libertadores',
    fbref:       'https://fbref.com/en/comps/14/stats/Copa-Libertadores-Stats',
    cache:       './cache-libertadores.json',
  },
  'uefa.champions': {
    name:        'Champions League',
    competition: 'champions-league',
    fbref:       'https://fbref.com/en/comps/8/shooting/Champions-League-Stats',
    cache:       './cache-ucl.json',
  },
  'eng.1': {
    name:        'Premier League',
    competition: 'premier-league',
    fbref:       'https://fbref.com/en/comps/9/stats/Premier-League-Stats',
    cache:       './cache-eng1.json',
  },
  'esp.1': {
    name:        'La Liga',
    competition: 'la-liga',
    fbref:       'https://fbref.com/en/comps/12/stats/La-Liga-Stats',
    cache:       './cache-esp1.json',
  },
}

const CACHE_TTL   = 6 * 60 * 60 * 1000
const BATCH_SIZE  = 100
const PARALLEL    = 2
const season      = new Date().getFullYear()

const delay = ms => new Promise(r => setTimeout(r, ms))

async function withBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try { return await fn() }
    catch (e) {
      const isRL = e.response?.status === 429 || e.message?.includes('rate')
      if (isRL && i < maxRetries - 1) {
        const wait = Math.pow(2, i) * 1000 + Math.random() * 500
        console.warn(`  ⏸️ Rate limit! Aguardando ${Math.round(wait)}ms`)
        await delay(wait)
      } else throw e
    }
  }
}

function parsePlayers(markdown) {
  const players = []
  const lines = markdown.split('\n').filter(l => l.includes('|') && l.includes('/players/') && !l.includes('---'))
  for (const line of lines) {
    const cols = line.split('|').map(c => c.trim()).filter(Boolean)
    if (cols.length < 14) continue
    const nameM = cols[1]?.match(/\[([^\]]+)\]/)
    if (!nameM) continue
    const teamM = cols[4]?.match(/\[([^\]]+)\]/)
    const n = (i) => parseInt(String(cols[i] ?? '0').replace(/,/g, '')) || 0
    const pos = normPos(cols[3]?.trim())
    players.push({
      name:        nameM[1].trim(),
      team:        teamM ? teamM[1].trim() : (cols[4]?.trim() ?? null),
      position:    pos,
      appearances: n(7),
      goals:       n(11),
      assists:     n(12),
      yellowCards: n(17),
      redCards:    n(18),
    })
  }
  return players
}

function normPos(raw) {
  if (!raw) return 'Unknown'
  const p = raw.toUpperCase()
  if (p.includes('GK')) return 'Goalkeeper'
  if (p.includes('DF')) return 'Defender'
  if (p.includes('MF')) return 'Midfielder'
  return (p.includes('FW') || p.includes('AT')) ? 'Forward' : 'Unknown'
}

async function syncLeague(leagueId) {
  const cfg = LEAGUES[leagueId]
  if (!cfg) { console.error(`❌ Liga desconhecida: ${leagueId}`); return }

  console.log(`\n${'═'.repeat(55)}`)
  console.log(`⚽ ${cfg.name}`)
  console.log(`${'═'.repeat(55)}`)

  // 1️⃣ Cache ou scrape
  let markdown
  const cache = existsSync(cfg.cache) ? JSON.parse(readFileSync(cfg.cache, 'utf-8')) : null
  const cacheValid = cache && Date.now() - cache.timestamp < CACHE_TTL

  if (cacheValid) {
    markdown = cache.markdown
    const age = Math.floor((Date.now() - cache.timestamp) / 60000)
    console.log(`  ✅ Cache local (${age}min atrás)`)
  } else {
    console.log(`  → Raspando FBref: ${cfg.fbref}`)
    const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY })
    const result = await withBackoff(() =>
      app.scrapeUrl(cfg.fbref, { formats: ['markdown'], onlyMainContent: false, timeout: 30000 })
    )
    if (!result?.markdown) {
      console.error(`  ❌ Sem conteúdo retornado — pulando`)
      return
    }
    markdown = result.markdown
    writeFileSync(cfg.cache, JSON.stringify({ timestamp: Date.now(), markdown }, null, 2))
    console.log(`  ✅ Raspado e cacheado`)
  }

  // 2️⃣ Parse
  const players = parsePlayers(markdown)
  if (!players.length) {
    console.log(`  ⚠️ Nenhum jogador encontrado — FBref pode ter mudado o formato`)
    return
  }
  const top = players.sort((a,b) => b.goals - a.goals)[0]
  console.log(`  📊 ${players.length} jogadores | Top: ${top.name} (${top.goals} gols)`)

  // 3️⃣ Limpa registros antigos da liga e insere novos
  await sql`DELETE FROM players WHERE competition = ${cfg.competition} AND season = ${season}`
  console.log(`  🗑️ Registros antigos removidos`)

  // 4️⃣ Batch insert
  const batches = []
  for (let i = 0; i < players.length; i += BATCH_SIZE) batches.push(players.slice(i, i + BATCH_SIZE))

  let saved = 0, errors = 0
  const start = Date.now()

  for (let i = 0; i < batches.length; i += PARALLEL) {
    const group = batches.slice(i, i + PARALLEL)
    await Promise.all(group.map(async (batch, idx) => {
      const batchNum = i + idx + 1
      try {
        const inserts = batch.map(p => sql`
          INSERT INTO players (competition, season, name, team_name, position,
            goals, assists, appearances, yellow_cards, red_cards, synced_at, updated_at)
          VALUES (${cfg.competition}, ${season}, ${p.name}, ${p.team}, ${p.position},
            ${p.goals}, ${p.assists}, ${p.appearances}, ${p.yellowCards}, ${p.redCards}, NOW(), NOW())
          ON CONFLICT DO NOTHING
        `)
        await Promise.all(inserts)
        saved += batch.length
        process.stdout.write(`\r  ⏳ Batch ${batchNum}/${batches.length} (${saved} salvos)`)
      } catch(e) {
        errors++
        console.error(`\n  ❌ Batch ${batchNum}: ${e.message.slice(0,70)}`)
      }
    }))
  }

  const dur = Math.round((Date.now() - start) / 1000)
  console.log(`\n  ✅ ${saved} jogadores em ${dur}s | Erros: ${errors}`)
}

// ── Execução ──────────────────────────────────────────────────────────────
const arg = process.argv[2] ?? 'bra.1'

if (arg === 'all') {
  console.log('🌍 Sincronizando TODAS as ligas...')
  for (const id of Object.keys(LEAGUES)) {
    try { await syncLeague(id) }
    catch(e) { console.error(`\n❌ Erro em ${id}:`, e.message) }
    await delay(2000) // pausa entre ligas para não sobrecarregar o Firecrawl
  }
  console.log('\n🏁 Todas as ligas sincronizadas!')
} else {
  await syncLeague(arg)
}

process.exit(0)
