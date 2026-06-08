/**
 * 💶 SYNC-MARKET-VALUES — Valores reais do Soccerway
 * Raspa valores de mercado para cada jogador e atualiza o banco
 *
 * Uso: node scripts/sync-market-values.mjs [league]
 *      node scripts/sync-market-values.mjs all
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

const CACHE_TTL = 24 * 60 * 60 * 1000 // 24h

// ── URLs do Soccerway por liga ──────────────────────────────────────────
const LEAGUES = {
  'bra.1': {
    name: 'Brasileirão Série A',
    competition: 'brasileirao-serie-a',
    url: 'https://us.soccerway.com/national/brazil/serie-a/20245/statistics/',
    cache: './cache-sw-bra1.json',
  },
  'bra.2': {
    name: 'Série B',
    competition: 'brasileirao-serie-b',
    url: 'https://us.soccerway.com/national/brazil/serie-b/20246/statistics/',
    cache: './cache-sw-bra2.json',
  },
  'bra.copa': {
    name: 'Copa do Brasil',
    competition: 'copa-do-brasil',
    url: 'https://us.soccerway.com/tournament/brazil/copa-do-brasil/2024/statistics/',
    cache: './cache-sw-bracopa.json',
  },
  'conmebol.libertadores': {
    name: 'Libertadores',
    competition: 'copa-libertadores',
    url: 'https://us.soccerway.com/international/south-america/copa-libertadores/2024/statistics/',
    cache: './cache-sw-libertadores.json',
  },
  'eng.1': {
    name: 'Premier League',
    competition: 'premier-league',
    url: 'https://us.soccerway.com/national/england/premier-league/20245/statistics/',
    cache: './cache-sw-eng1.json',
  },
  'esp.1': {
    name: 'La Liga',
    competition: 'la-liga',
    url: 'https://us.soccerway.com/national/spain/primera-division/20245/statistics/',
    cache: './cache-sw-esp1.json',
  },
}

// ── Parse HTML com valores do Soccerway ─────────────────────────────────
function parsePlayerValues(html) {
  const results = []

  // Padrão: <tr> com dados de jogador
  // Procura por padrões como:
  // Nome | Time | €X.XM | Posição
  const rows = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) || []

  for (const row of rows) {
    // Procura por links de jogador
    const nameMatch = row.match(/<a[^>]*href="[^"]*player[^"]*"[^>]*>([^<]+)<\/a>/)
    if (!nameMatch) continue

    const name = nameMatch[1].trim()
    if (name.length < 2 || name.length > 50) continue

    // Procura por valor em € (formato: €5.5M, €45K, €2.1M, etc)
    const valueMatch = row.match(/€\s*([\d.]+)\s*([MK](?:B)?)/i)
    if (!valueMatch) continue

    const num = parseFloat(valueMatch[1])
    const suffix = valueMatch[2].toUpperCase()

    let valueNum, valueStr
    if (suffix === 'M' || suffix === 'MB') {
      valueNum = num
      valueStr = `€ ${num.toFixed(1)}M`
    } else if (suffix === 'K') {
      valueNum = num / 1000 // converte K para M
      valueStr = num >= 1000 ? `€ ${(num/1000).toFixed(1)}M` : `€ ${Math.round(num)}K`
    } else {
      continue
    }

    if (valueNum > 0.01) {
      results.push({ name, valueNum, valueStr })
    }
  }

  // Remove duplicatas (mantém maior valor)
  const byName = {}
  for (const r of results) {
    if (!byName[r.name] || r.valueNum > byName[r.name].valueNum) {
      byName[r.name] = r
    }
  }

  return Object.values(byName)
}

// ── Normaliza nome para matching fuzzy ──────────────────────────────────
function normName(name) {
  return name.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')  // remove acentos
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// ── Busca jogador pelo nome com fuzzy matching ────────────────────────
function findMatch(playerName, swValues) {
  const norm = normName(playerName)
  const parts = norm.split(' ')

  // 1. Match exato
  let match = swValues.find(v => normName(v.name) === norm)
  if (match) return match

  // 2. Match por sobrenome (último nome)
  const lastName = parts[parts.length - 1]
  if (lastName.length >= 3) {
    const candidates = swValues.filter(v => {
      const vn = normName(v.name)
      const vparts = vn.split(' ')
      return vparts[vparts.length - 1] === lastName
    })
    if (candidates.length === 1) return candidates[0]
    if (candidates.length > 1) {
      // Se múltiplos, tenta primeiro + último
      const first = parts[0]
      const exact = candidates.find(c => normName(c.name).startsWith(first))
      if (exact) return exact
    }
  }

  // 3. Match por contém (se nome curto)
  if (norm.length >= 4 && norm.length <= 15) {
    const contains = swValues.filter(v => normName(v.name).includes(norm))
    if (contains.length === 1) return contains[0]
  }

  // 4. Match reverso (nome do Soccerway contém nome do banco)
  const contain = swValues.find(v => normName(v.name).includes(norm))
  if (contain) return contain

  return null
}

// ── Sincroniza uma liga ─────────────────────────────────────────────────
async function syncLeague(leagueId) {
  const cfg = LEAGUES[leagueId]
  if (!cfg) {
    console.error(`❌ Liga desconhecida: ${leagueId}`)
    return
  }

  console.log(`\n${'═'.repeat(60)}`)
  console.log(`💶 ${cfg.name}`)
  console.log(`${'═'.repeat(60)}`)

  // Verifica cache
  let html
  const cache = existsSync(cfg.cache) ? JSON.parse(readFileSync(cfg.cache, 'utf-8')) : null
  const cacheValid = cache && Date.now() - cache.timestamp < CACHE_TTL

  if (cacheValid) {
    html = cache.html
    console.log(`  ✅ Cache local (${Math.floor((Date.now() - cache.timestamp) / 60000)}min atrás)`)
  } else {
    console.log(`  → Raspando Soccerway...`)
    try {
      const result = await app.scrapeUrl(cfg.url, {
        formats: ['html'],
        onlyMainContent: false,
        timeout: 45000,
        waitFor: 3000,
      })
      if (!result?.html) {
        console.log(`  ⚠️ Soccerway não retornou conteúdo`)
        return
      }
      html = result.html
      writeFileSync(cfg.cache, JSON.stringify({ timestamp: Date.now(), html }, null, 2))
      console.log(`  ✅ Raspado e cacheado`)
    } catch (e) {
      console.error(`  ❌ Erro: ${e.message}`)
      return
    }
  }

  // Parse dos valores
  const swValues = parsePlayerValues(html)
  console.log(`  📊 ${swValues.length} valores encontrados no Soccerway`)

  if (swValues.length === 0) {
    console.log(`  ⚠️ Nenhum valor encontrado — estrutura pode ter mudado`)
    return
  }

  // Top 5 mais valiosos
  const top5 = [...swValues].sort((a, b) => b.valueNum - a.valueNum).slice(0, 5)
  console.log(`  💰 Top 5: ${top5.map(p => `${p.name} (${p.valueStr})`).join(' | ')}`)

  // Busca jogadores do banco
  const dbPlayers = await sql`
    SELECT id, name FROM players
    WHERE competition = ${cfg.competition}
    LIMIT 1000
  `
  console.log(`  👤 ${dbPlayers.length} jogadores no banco`)

  // Faz matching e atualiza
  let updated = 0, notFound = 0, errors = 0
  const missed = []

  for (const player of dbPlayers) {
    try {
      const match = findMatch(player.name, swValues)
      if (match) {
        await sql`
          UPDATE players
          SET market_value = ${match.valueStr}, market_value_num = ${match.valueNum}
          WHERE id = ${player.id}
        `
        updated++
      } else {
        notFound++
        if (missed.length < 5) missed.push(player.name)
      }
    } catch (e) {
      errors++
      console.error(`    ❌ ${player.name}: ${e.message}`)
    }
  }

  const pct = dbPlayers.length > 0 ? Math.round((updated / dbPlayers.length) * 100) : 0
  console.log(`  ✅ Atualizados: ${updated}/${dbPlayers.length} (${pct}%)`)
  console.log(`  ⚠️ Não encontrados: ${notFound} | Erros: ${errors}`)
  if (missed.length > 0) {
    console.log(`     Ex: ${missed.join(', ')}`)
  }
}

// ── Execução ────────────────────────────────────────────────────────────
const arg = process.argv[2] ?? 'bra.1'

if (arg === 'all') {
  for (const id of Object.keys(LEAGUES)) {
    try {
      await syncLeague(id)
    } catch (e) {
      console.error(`❌ ${id}:`, e.message)
    }
    await new Promise(r => setTimeout(r, 4000))
  }
  console.log('\n🏁 Valores de mercado sincronizados!')
} else {
  await syncLeague(arg)
}

process.exit(0)
