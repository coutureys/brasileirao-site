/**
 * /api/comments — endpoint único para comentários
 *
 * GET  ?matchId=X&sort=recent|likes&limit=50
 * POST { action: 'create', matchId, username, color, body, parentId?, clientId }
 * POST { action: 'like',   commentId, clientId }
 */
import { sql, setupTables } from '../lib/db.js'

// ── Filtro de palavrões ──────────────────────────────────────────────────
const BLOCKED = ['merda','porra','caralho','fdp','viado','buceta','puta','desgraça','arrombado','cu ','imbecil','idiota','lixo']

function moderate(text) {
  const lower = text.toLowerCase()
  return BLOCKED.some(w => lower.includes(w))
}

// ── Cores de avatar ──────────────────────────────────────────────────────
const COLORS = ['#00E676','#3B82F6','#F59E0B','#EF4444','#8B5CF6','#EC4899','#06B6D4','#84CC16']

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    await setupTables()

    /* ── GET: lista comentários ───────────────────────────────────────── */
    if (req.method === 'GET') {
      const { matchId, sort = 'recent', limit = 50, clientId = '' } = req.query
      if (!matchId) return res.status(400).json({ error: 'matchId obrigatório' })

      const lim = Math.min(Number(limit), 100)

      // Comentários raiz com contagem de replies
      const rows = sort === 'likes'
        ? await sql`
            SELECT c.*,
              (SELECT COUNT(*) FROM comments r WHERE r.parent_id = c.id) AS reply_count,
              EXISTS(SELECT 1 FROM comment_likes l WHERE l.comment_id = c.id AND l.client_id = ${clientId}) AS liked
            FROM comments c
            WHERE c.match_id = ${matchId} AND c.parent_id IS NULL
            ORDER BY c.likes DESC, c.created_at DESC
            LIMIT ${lim}`
        : await sql`
            SELECT c.*,
              (SELECT COUNT(*) FROM comments r WHERE r.parent_id = c.id) AS reply_count,
              EXISTS(SELECT 1 FROM comment_likes l WHERE l.comment_id = c.id AND l.client_id = ${clientId}) AS liked
            FROM comments c
            WHERE c.match_id = ${matchId} AND c.parent_id IS NULL
            ORDER BY c.created_at DESC
            LIMIT ${lim}`

      return res.json({ comments: rows, total: rows.length })
    }

    /* ── POST ─────────────────────────────────────────────────────────── */
    if (req.method === 'POST') {
      const { action } = req.body

      /* Criar comentário */
      if (action === 'create') {
        const { matchId, username, color, body, parentId, clientId } = req.body

        if (!matchId || !username?.trim() || !body?.trim())
          return res.status(400).json({ error: 'matchId, username e body obrigatórios' })

        if (body.length > 500) return res.status(400).json({ error: 'Máximo 500 caracteres' })
        if (moderate(body))   return res.status(400).json({ error: '⚠️ Comentário bloqueado pela moderação' })

        const safeUser  = username.trim().slice(0, 30)
        const safeBody  = body.trim()
        const safeColor = COLORS.includes(color) ? color : COLORS[0]

        const [comment] = await sql`
          INSERT INTO comments (match_id, parent_id, username, color, body)
          VALUES (${matchId}, ${parentId ?? null}, ${safeUser}, ${safeColor}, ${safeBody})
          RETURNING *
        `

        return res.status(201).json({ comment: { ...comment, reply_count: 0, liked: false } })
      }

      /* Like / Unlike */
      if (action === 'like') {
        const { commentId, clientId } = req.body
        if (!commentId || !clientId) return res.status(400).json({ error: 'commentId e clientId obrigatórios' })

        // Verifica se já curtiu
        const [existing] = await sql`
          SELECT 1 FROM comment_likes WHERE comment_id = ${commentId} AND client_id = ${clientId}
        `

        let likes
        if (existing) {
          // Remove like
          await sql`DELETE FROM comment_likes WHERE comment_id = ${commentId} AND client_id = ${clientId}`
          const [updated] = await sql`UPDATE comments SET likes = likes - 1 WHERE id = ${commentId} RETURNING likes`
          likes = updated.likes
        } else {
          // Adiciona like
          await sql`INSERT INTO comment_likes (comment_id, client_id) VALUES (${commentId}, ${clientId}) ON CONFLICT DO NOTHING`
          const [updated] = await sql`UPDATE comments SET likes = likes + 1 WHERE id = ${commentId} RETURNING likes`
          likes = updated.likes
        }

        return res.json({ liked: !existing, likes })
      }

      /* Buscar replies de um comentário */
      if (action === 'replies') {
        const { parentId, clientId = '' } = req.body
        if (!parentId) return res.status(400).json({ error: 'parentId obrigatório' })

        const replies = await sql`
          SELECT c.*,
            EXISTS(SELECT 1 FROM comment_likes l WHERE l.comment_id = c.id AND l.client_id = ${clientId}) AS liked
          FROM comments c
          WHERE c.parent_id = ${parentId}
          ORDER BY c.created_at ASC
          LIMIT 20
        `
        return res.json({ replies })
      }

      return res.status(400).json({ error: 'action inválida' })
    }

    res.status(405).json({ error: 'Método não permitido' })
  } catch (err) {
    console.error('[comments]', err)
    res.status(500).json({ error: err.message })
  }
}
