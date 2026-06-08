import express from 'express'
import cors from 'cors'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// Carrega .env manualmente (sem import de dotenv no topo pra não quebrar se arquivo sumir)
try {
  const envPath = resolve(dirname(fileURLToPath(import.meta.url)), '..', '.env')
  const lines = readFileSync(envPath, 'utf-8').split('\n')
  for (const line of lines) {
    const [key, ...rest] = line.split('=')
    if (key && !key.startsWith('#') && rest.length) {
      process.env[key.trim()] ??= rest.join('=').trim()
    }
  }
} catch { /* .env não encontrado, usa variáveis de ambiente do sistema */ }

const API_KEY  = process.env.FOOTBALL_API_KEY
const API_BASE = 'https://api.football-data.org/v4'
const PORT     = Number(process.env.PORT ?? 3001)

const app = express()
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }))

// ── Cache simples em memória ──────────────────────────────────────────────
const cache = new Map()

async function apiFetch(path, ttlMs = 60_000) {
  const hit = cache.get(path)
  if (hit && Date.now() - hit.ts < ttlMs) return hit.data

  if (!API_KEY || API_KEY === 'insira_sua_chave_aqui') {
    throw new Error('API_KEY_MISSING')
  }

  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'X-Auth-Token': API_KEY },
  })

  if (res.status === 429) throw new Error('RATE_LIMITED')
  if (!res.ok) throw new Error(`API_ERROR_${res.status}`)

  const data = await res.json()
  cache.set(path, { data, ts: Date.now() })
  return data
}

function handleError(res, err) {
  const code = err.message
  if (code === 'API_KEY_MISSING')
    return res.status(401).json({ error: 'API_KEY_MISSING', hint: 'Adicione FOOTBALL_API_KEY no arquivo .env' })
  if (code === 'RATE_LIMITED')
    return res.status(429).json({ error: 'RATE_LIMITED', hint: 'Limite de 10 req/min atingido' })
  console.error('[server]', err.message)
  res.status(500).json({ error: err.message })
}

// ── Rotas ─────────────────────────────────────────────────────────────────

// Classificação — cache 5 min (muda apenas após rodadas)
app.get('/api/pl/standings', async (req, res) => {
  try {
    const data = await apiFetch('/competitions/PL/standings', 5 * 60_000)
    res.json(data)
  } catch (err) { handleError(res, err) }
})

// Jogos ao vivo — cache 30 s
app.get('/api/pl/matches/live', async (req, res) => {
  try {
    const data = await apiFetch('/competitions/PL/matches?status=LIVE', 30_000)
    res.json(data)
  } catch (err) { handleError(res, err) }
})

// Próximos jogos — cache 2 min
app.get('/api/pl/matches/upcoming', async (req, res) => {
  try {
    const data = await apiFetch('/competitions/PL/matches?status=SCHEDULED&limit=10', 2 * 60_000)
    res.json(data)
  } catch (err) { handleError(res, err) }
})

// Resultados recentes — cache 5 min
app.get('/api/pl/matches/results', async (req, res) => {
  try {
    const data = await apiFetch('/competitions/PL/matches?status=FINISHED&limit=10', 5 * 60_000)
    res.json(data)
  } catch (err) { handleError(res, err) }
})

// Endpoint combinado (scores page) — faz 3 chamadas mas cada uma tem cache próprio
app.get('/api/pl/matches', async (req, res) => {
  try {
    const [live, upcoming, results] = await Promise.all([
      apiFetch('/competitions/PL/matches?status=LIVE',            30_000),
      apiFetch('/competitions/PL/matches?status=SCHEDULED&limit=10', 2 * 60_000),
      apiFetch('/competitions/PL/matches?status=FINISHED&limit=10',  5 * 60_000),
    ])
    res.json({
      live:     live.matches     ?? [],
      upcoming: upcoming.matches ?? [],
      results:  results.matches  ?? [],
    })
  } catch (err) { handleError(res, err) }
})

// Health-check — frontend usa pra saber se backend está de pé
app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    keyConfigured: Boolean(API_KEY && API_KEY !== 'insira_sua_chave_aqui'),
  })
})

app.listen(PORT, () => {
  const keyOk = API_KEY && API_KEY !== 'insira_sua_chave_aqui'
  console.log(`\n⚽ Football API server → http://localhost:${PORT}`)
  console.log(`   Chave: ${keyOk ? '✅ configurada' : '⚠️  FALTANDO — edite o .env'}`)
  if (!keyOk) console.log('   Cadastro grátis: https://www.football-data.org/client/register\n')
})
