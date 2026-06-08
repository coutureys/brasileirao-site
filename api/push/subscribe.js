// POST /api/push/subscribe — salva subscription no banco
import { sql, setupTables } from '../../lib/db.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  await setupTables()

  if (req.method === 'POST') {
    const { subscription } = req.body
    if (!subscription?.endpoint) return res.status(400).json({ error: 'Subscription inválida' })

    await sql`
      INSERT INTO push_subscriptions (endpoint, p256dh, auth, created_at)
      VALUES (
        ${subscription.endpoint},
        ${subscription.keys?.p256dh ?? null},
        ${subscription.keys?.auth   ?? null},
        NOW()
      )
      ON CONFLICT (endpoint) DO UPDATE SET
        p256dh = EXCLUDED.p256dh,
        auth   = EXCLUDED.auth
    `.catch(() => {})

    return res.json({ ok: true })
  }

  if (req.method === 'DELETE') {
    const { endpoint } = req.body
    if (endpoint) await sql`DELETE FROM push_subscriptions WHERE endpoint = ${endpoint}`.catch(() => {})
    return res.json({ ok: true })
  }

  res.status(405).json({ error: 'Método não permitido' })
}
