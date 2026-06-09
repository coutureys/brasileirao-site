import express from 'express'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// 🔐 Security imports
import {
  setupSecurityHeaders,
  setupCORS,
  generalLimiter,
  limitRequestSize,
  validateContentType,
  stripSensitiveHeaders,
  logSecurityEvents,
  errorHandler,
} from '../lib/middleware/security.js'
import {
  setCSRFSessionCookie,
  serveCsrfToken,
} from '../lib/middleware/csrf.js'

// ⚙️ Handlers serverless — REAPROVEITADOS da pasta api/ (a mesma lógica
//    que roda na Vercel). Assim o dev local fica idêntico à produção:
//    dados da ESPN, sem precisar de chave, com todos os endpoints novos.
import matchesHandler     from '../api/pl/matches.js'
import matchEventsHandler from '../api/pl/match-events.js'
import matchStatsHandler  from '../api/pl/match-stats.js'
import standingsHandler   from '../api/pl/standings.js'
import phasesHandler      from '../api/pl/phases.js'
import commentsHandler    from '../api/comments.js'
import newsHandler        from '../api/scrape/news.js'
import pushHandler        from '../api/push/subscribe.js'
import dbPlayersHandler   from '../api/db/players.js'
import dbSyncHandler      from '../api/db/sync.js'
import healthHandler      from '../api/health.js'

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

const PORT = Number(process.env.PORT ?? 3001)

const app = express()

// 🔐 SECURITY MIDDLEWARE
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ limit: '10kb', extended: true }))
app.use(setupSecurityHeaders())
app.use(setupCORS())
app.use(generalLimiter)
app.use(limitRequestSize())
app.use(validateContentType())
app.use(stripSensitiveHeaders)
app.use(logSecurityEvents)
app.use(setCSRFSessionCookie)

// Adapta um handler serverless (req,res) para o Express, capturando erros async
const route = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res)).catch(next)

// ── Rotas (mesmos handlers da produção) ────────────────────────────────────
app.all('/api/pl/matches',      route(matchesHandler))
app.all('/api/pl/match-events', route(matchEventsHandler))
app.all('/api/pl/match-stats',  route(matchStatsHandler))
app.all('/api/pl/standings',    route(standingsHandler))
app.all('/api/pl/phases',       route(phasesHandler))
app.all('/api/comments',        route(commentsHandler))
app.all('/api/scrape/news',     route(newsHandler))
app.all('/api/push/subscribe',  route(pushHandler))
app.all('/api/db/players',      route(dbPlayersHandler))
app.all('/api/db/sync',         route(dbSyncHandler))
app.all('/api/health',          route(healthHandler))

// 🛡️ CSRF Token endpoint
app.get('/api/csrf-token', serveCsrfToken)

// 🚨 Global error handler (must be last)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`\n⚽ ScoutFut API (local) → http://localhost:${PORT}`)
  console.log(`   Fonte: ESPN (sem necessidade de chave)`)
  console.log(`   Banco: ${process.env.DATABASE_URL ? '✅ conectado' : '— sem DATABASE_URL (comentários/db desativados)'}\n`)
})
