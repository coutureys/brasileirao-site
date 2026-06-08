/**
 * 🏷️ SYNC-VALUES — Valores reais do Transfermarkt
 * Raspa valores de mercado por liga e atualiza o banco
 *
 * Uso: node scripts/sync-values.mjs [league]
 *      node scripts/sync-values.mjs all
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
const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY })

const CACHE_TTL = 12 * 60 * 60 * 1000 // 12h

// ── Configuração por liga ──────────────────────────────────────────────────
const LEAGUES = {
  'bra.1': {
    name: 'Brasileirão Série A',
    competition: 'brasileirao-serie-a',
    tmUrl: 'https://www.transfermarkt.com/brasileirao-serie-a/transfermarktdaten/wettbewerb/BRA1/plus/1',
    cache: './cache-tm-bra1.json',
  },
  'bra.2': {
    name: 'Série B',
    competition: 'brasileirao-serie-b',
    tmUrl: 'https://www.transfermarkt.com/serie-b/transfermarktdaten/wettbewerb/BRA2/plus/1',
    cache: './cache-tm-bra2.json',
  },
  'bra.copa': {
    name: 'Copa do Brasil',
    competition: 'copa-do-brasil',
    tmUrl: 'https://www.transfermarkt.com/copa-do-brasil/transfermarktdaten/wettbewerb/BRC/plus/1',
    cache: './cache-tm-bracopa.json',
  },
  'conmebol.libertadores': {
    name: 'Libertadores',
    competition: 'copa-libertadores',
    tmUrl: 'https://www.transfermarkt.com/copa-libertadores/transfermarktdaten/wettbewerb/CLI/plus/1',
    cache: './cache-tm-libertadores.json',
  },
  'eng.1': {
    name: 'Premier League',
    competition: 'premier-league',
    tmUrl: 'https://www.transfermarkt.com/premier-league/transfermarktdaten/wettbewerb/GB1/plus/1',
    cache: './cache-tm-eng1.json',
  },
  'esp.1': {
    name: 'La Liga',
    competition: 'la-liga',
    tmUrl: 'https://www.transfermarkt.com/laliga/transfermarktdaten/wettbewerb/ES1/plus/1',
    cache: './cache-tm-esp1.json',
  },
}

// ── Parser de valores do Transfermarkt ────────────────────────────────────
function parseValues(markdown) {
  const results = []
  const lines   = markdown.split('\n')

  for (const line of lines) {
    // Padrão: nome do jogador + valor (€ X.XXM ou € XXK)
    // Ex: "| [Pedro](url) | ... | € 25.00M |"
    const nameMatch = line.match(/\[([^\]]{2,40})\]\(https?:\/\/www\.transfermarkt\.com\/[^\)]+\)/)
    if (!nameMatch) continue

    const name  = nameMatch[1].trim()
    if (name.length < 2 || name.length > 40) continue

    // Valor em formato TM: "€ 25.00M" "€ 500Th." "€ 1.20M"
    const valMatch = line.match(/€\s*([\d,.]+)\s*(M|Th\.|B|K)?/)
    if (!valMatch) continue

    const num    = parseFloat(valMatch[1].replace(',', '.'))
    const suffix = valMatch[2] ?? ''
    let valueNum, valueStr

    if (suffix === 'M' || suffix === 'B') {
      valueNum = suffix === 'B' ? num * 1000 : num
      valueStr = `€ ${num.toFixed(2)}M`
    } else if (suffix === 'Th.' || suffix === 'K') {
      valueNum = num / 1000  // converte para M
      valueStr = num >= 1000 ? `€ ${(num/1000).toFixed(1)}M` : `€ ${Math.round(num)}K`
    } else {
      continue
    }

    if (valueNum > 0) {
      results.push({ name, valueNum, valueStr })
    }
  }

  // Remove duplicatas por nome (mantém maior valor)
  const byName = {}
  for (const r of results) {
    if (!byName[r.name] || r.valueNum > byName[r.name].valueNum) {
      byName[r.name] = r
    }
  }

  return Object.values(byName)
}

// ── Normaliza nome para matching ──────────────────────────────────────────
function normName(name) {
  return name.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')  // remove acentos
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// ── Matching fuzzy por nome ───────────────────────────────────────────────
function findMatch(playerName, tmValues) {
  const norm = normName(playerName)

  // 1. Match exato
  let match = tmValues.find(v => normName(v.name) === norm)
  if (match) return match

  // 2. Match parcial (sobrenome)
  const parts = norm.split(' ')
  const lastName = parts[parts.length - 1]
  if (lastName.length >= 4) {
    const candidates = tmValues.filter(v => normName(v.name).includes(lastName))
    if (candidates.length === 1) return candidates[0]
  }

  // 3. Match por primeiro e último nome
  if (parts.length >= 2) {
    const first = parts[0], last = parts[parts.length - 1]
    match = tmValues.find(v => {
      const vn = normName(v.name)
      return vn.includes(first) && vn.includes(last)
    })
    if (match) return match
  }

  return null
}

// ── Sincroniza uma liga ───────────────────────────────────────────────────
async function syncLeague(leagueId) {
  const cfg = LEAGUES[leagueId]
  if (!cfg) { console.error(`❌ Liga desconhecida: ${leagueId}`); return }

  console.log(`\n${'═'.repeat(55)}`)
  console.log(`💶 ${cfg.name}`)
  console.log(`${'═'.repeat(55)}`)

  // Cache
  let markdown
  const cache     = existsSync(cfg.cache) ? JSON.parse(readFileSync(cfg.cache, 'utf-8')) : null
  const cacheValid = cache && Date.now() - cache.timestamp < CACHE_TTL

  if (cacheValid) {
    markdown = cache.markdown
    console.log(`  ✅ Cache local (${Math.floor((Date.now()-cache.timestamp)/60000)}min atrás)`)
  } else {
    console.log(`  → Raspando Transfermarkt...`)
    try {
      const result = await app.scrapeUrl(cfg.tmUrl, {
        formats: ['markdown'],
        onlyMainContent: false,
        timeout: 30000,
      })
      if (!result?.markdown) {
        console.log(`  ⚠️ Transfermarkt não retornou conteúdo — pode estar bloqueado`)
        return
      }
      markdown = result.markdown
      writeFileSync(cfg.cache, JSON.stringify({ timestamp: Date.now(), markdown }, null, 2))
      console.log(`  ✅ Raspado e cacheado`)
    } catch (e) {
      console.error(`  ❌ Erro: ${e.message}`)
      return
    }
  }

  // Parse dos valores
  const tmValues = parseValues(markdown)
  console.log(`  📊 ${tmValues.length} valores encontrados no TM`)

  if (!tmValues.length) {
    console.log(`  ⚠️ Nenhum valor encontrado — Transfermarkt pode ter bloqueado`)
    return
  }

  // Top 5 mais valiosos
  const top5 = [...tmValues].sort((a, b) => b.valueNum - a.valueNum).slice(0, 5)
  console.log(`  💰 Top 5: ${top5.map(p => `${p.name} (${p.valueStr})`).join(', ')}`)

  // Busca jogadores do banco para esta liga
  const dbPlayers = await sql`
    SELECT id, name FROM players
    WHERE competition = ${cfg.competition}
  `
  console.log(`  👤 ${dbPlayers.length} jogadores no banco`)

  // Faz matching e atualiza
  let updated = 0, notFound = 0
  for (const player of dbPlayers) {
    const match = findMatch(player.name, tmValues)
    if (match) {
      await sql`
        UPDATE players
        SET market_value = ${match.valueStr}, market_value_num = ${match.valueNum}
        WHERE id = ${player.id}
      `
      updated++
    } else {
      notFound++
    }
  }

  const pct = dbPlayers.length > 0 ? Math.round((updated/dbPlayers.length)*100) : 0
  console.log(`  ✅ Atualizados: ${updated}/${dbPlayers.length} (${pct}%) | Não encontrados: ${notFound}`)
}

// ── Execução ──────────────────────────────────────────────────────────────
const arg = process.argv[2] ?? 'bra.1'

if (arg === 'all') {
  for (const id of Object.keys(LEAGUES)) {
    try { await syncLeague(id) } catch (e) { console.error(`❌ ${id}:`, e.message) }
    await new Promise(r => setTimeout(r, 3000))
  }
  console.log('\n🏁 Valores sincronizados!')
} else {
  await syncLeague(arg)
}

process.exit(0)
