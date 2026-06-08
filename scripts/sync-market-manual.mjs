/**
 * 💶 SYNC-MARKET-MANUAL — Sincronização de valores de mercado
 * Dataset completo: ~400+ jogadores de 6 ligas principais
 * Fontes: Transfermarkt, Sofascore, relatórios de mercado
 */
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const envPath = resolve(dirname(fileURLToPath(import.meta.url)), '..', '.env.local')
const envLines = readFileSync(envPath, 'utf-8').split('\n')
for (const line of envLines) {
  const [k, ...rest] = line.split('=')
  if (k && !k.startsWith('#')) process.env[k.trim()] ??= rest.join('=').trim().replace(/^"|"$/g, '')
}

import { neon } from '@neondatabase/serverless'
import { MARKET_DATA } from './market-data.mjs'

const sql = neon(process.env.DATABASE_URL)

// ── Normaliza nome ──────────────────────────────────────────────────────
function normName(name) {
  return name.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// ── Matching fuzzy ──────────────────────────────────────────────────────
function findMatch(playerName, marketValues) {
  const norm = normName(playerName)
  const parts = norm.split(' ')

  // 1. Match exato
  let match = marketValues.find(m => normName(m.name) === norm)
  if (match) return match

  // 2. Match por sobrenome
  if (parts.length >= 1) {
    const lastName = parts[parts.length - 1]
    if (lastName.length >= 3) {
      const candidates = marketValues.filter(m => {
        const mn = normName(m.name)
        const mparts = mn.split(' ')
        return mparts.some(p => p === lastName || p.includes(lastName))
      })
      if (candidates.length === 1) return candidates[0]
    }
  }

  // 3. Match contém
  const contains = marketValues.find(m => normName(m.name).includes(norm))
  if (contains) return contains

  // 4. Match reverso
  const revert = marketValues.find(m => norm.includes(normName(m.name)))
  if (revert) return revert

  return null
}

// ── Sincroniza uma liga ─────────────────────────────────────────────────
async function syncLeague(competition) {
  const values = MARKET_DATA[competition] || []

  if (values.length === 0) {
    console.log(`  ⚠️ Sem dados para ${competition}`)
    return 0
  }

  console.log(`\n📊 ${competition.toUpperCase()}: ${values.length} valores`)

  const dbPlayers = await sql`
    SELECT id, name FROM players
    WHERE competition = ${competition}
    LIMIT 2000
  `

  console.log(`  👤 ${dbPlayers.length} jogadores no banco`)

  let updated = 0
  for (const player of dbPlayers) {
    const match = findMatch(player.name, values)
    if (match) {
      // Parse valor: "€ 10.3M" ou "€ 500K"
      const numMatch = match.value.match(/€\s*([\d.]+)\s*([MK])/i)
      let valueNum = 0
      if (numMatch) {
        const num = parseFloat(numMatch[1])
        valueNum = numMatch[2].toUpperCase() === 'K' ? num / 1000 : num
      }

      await sql`
        UPDATE players
        SET market_value = ${match.value}, market_value_num = ${valueNum}
        WHERE id = ${player.id}
      `
      updated++
    }
  }

  const pct = dbPlayers.length > 0 ? Math.round((updated / dbPlayers.length) * 100) : 0
  console.log(`  ✅ Atualizados: ${updated}/${dbPlayers.length} (${pct}%)`)
  return updated
}

// ── Execução ────────────────────────────────────────────────────────────
console.log('\n' + '═'.repeat(70))
console.log('💶 SINCRONIZANDO VALORES DE MERCADO — DATASET COMPLETO')
console.log('═'.repeat(70))

let totalUpdated = 0
for (const comp of Object.keys(MARKET_DATA)) {
  const updated = await syncLeague(comp)
  totalUpdated += updated
}

console.log('\n' + '═'.repeat(70))
console.log(`🏁 PRONTO! ${totalUpdated} jogadores com valores reais de mercado`)
console.log('═'.repeat(70))
process.exit(0)
