import { useState, useEffect, useRef, useCallback } from 'react'
import { CommentCreateSchema, CommentReplySchema } from '../lib/validators'
import { sanitizeText } from '../lib/sanitize'

const COLORS = ['#00E676','#3B82F6','#F59E0B','#EF4444','#8B5CF6','#EC4899','#06B6D4','#84CC16']

/* ── Client ID persistente (com crypto seguro) ──────────────────────────── */
function getClientId() {
  let id = localStorage.getItem('scoutfut_client')
  if (!id) {
    // 🔐 Use crypto.getRandomValues instead of Math.random
    try {
      const bytes = new Uint8Array(16)
      crypto.getRandomValues(bytes)
      id = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')
    } catch {
      // Fallback para environments sem crypto
      id = Math.random().toString(36).slice(2) + Date.now().toString(36)
    }
    localStorage.setItem('scoutfut_client', id)
  }
  return id
}

function getSavedUser() {
  return {
    username: localStorage.getItem('scoutfut_username') ?? '',
    color:    localStorage.getItem('scoutfut_color')    ?? COLORS[0],
  }
}

function saveUser(username, color) {
  localStorage.setItem('scoutfut_username', username)
  localStorage.setItem('scoutfut_color',    color)
}

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (diff < 60)   return 'agora'
  if (diff < 3600) return `${Math.floor(diff/60)}min`
  if (diff < 86400)return `${Math.floor(diff/3600)}h`
  return `${Math.floor(diff/86400)}d`
}

/* ── Modal de comentários ────────────────────────────────────────────────── */
export default function Comments({ matchId, matchTitle, onClose, embedded = false }) {
  const clientId    = useRef(getClientId()).current
  const saved       = getSavedUser()

  const [comments,  setComments]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [sort,      setSort]      = useState('recent')
  const [username,  setUsername]  = useState(saved.username)
  const [color,     setColor]     = useState(saved.color)
  const [body,      setBody]      = useState('')
  const [replyTo,   setReplyTo]   = useState(null)  // { id, username }
  const [sending,   setSending]   = useState(false)
  const [error,     setError]     = useState(null)
  const [setup,     setSetup]     = useState(!saved.username) // primeira vez
  const bottomRef   = useRef(null)
  const inputRef    = useRef(null)

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/comments?matchId=${matchId}&sort=${sort}&clientId=${clientId}&limit=50`)
      const d = await r.json()
      setComments(d.comments ?? [])
    } catch (e) {}
    finally { setLoading(false) }
  }, [matchId, sort, clientId])

  // Polling a cada 8 segundos
  useEffect(() => {
    load()
    const id = setInterval(load, 8000)
    return () => clearInterval(id)
  }, [load])

  // ESC fecha
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [onClose])

  async function handleSend() {
    if (!body.trim() || !username.trim()) return
    setSending(true); setError(null)
    try {
      // 🔐 Validate input with Zod
      const schema = replyTo ? CommentReplySchema : CommentCreateSchema
      const validation = schema.safeParse({
        matchId,
        username: sanitizeText(username),
        body: sanitizeText(body),
        color,
        clientId,
        parentId: replyTo?.id ?? null,
      })

      if (!validation.success) {
        setError(validation.error.issues[0]?.message || 'Dados inválidos')
        return
      }

      const validData = validation.data
      saveUser(validData.username, color)

      const r = await fetch('/api/comments', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          matchId: validData.matchId,
          username: validData.username,
          color: validData.color,
          clientId: validData.clientId,
          body: replyTo ? `@${sanitizeText(replyTo.username)} ${validData.body}` : validData.body,
          parentId: replyTo?.id ?? null,
        }),
      })
      const d = await r.json()
      if (!r.ok) { setError(d.error); return }

      // Insere localmente (sem precisar de novo fetch)
      if (replyTo) {
        setComments(prev => prev.map(c =>
          c.id === replyTo.id
            ? { ...c, reply_count: (Number(c.reply_count) || 0) + 1 }
            : c
        ))
      } else {
        setComments(prev => [{ ...d.comment, liked: false }, ...prev])
      }
      setBody(''); setReplyTo(null)
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch (e) { setError('Erro ao enviar') }
    finally { setSending(false) }
  }

  async function handleLike(commentId) {
    const r = await fetch('/api/comments', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ action: 'like', commentId, clientId }),
    })
    const d = await r.json()
    setComments(prev => prev.map(c =>
      c.id === commentId ? { ...c, likes: d.likes, liked: d.liked } : c
    ))
  }

  const inner = (
    <>
        {/* Header */}
        <div className="flex-shrink-0 px-5 py-4 border-b border-brand-border flex items-center justify-between">
          {!embedded && (
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-wider font-bold">💬 Ao Vivo</p>
              <h3 className="font-black text-base mt-0.5 truncate max-w-[260px]">{matchTitle}</h3>
            </div>
          )}
          <div className="flex items-center gap-3 ml-auto">
            {/* Sort */}
            <div className="flex gap-0.5 p-0.5 rounded-lg bg-white/5 border border-white/8">
              {['recent','likes'].map(s => (
                <button key={s} onClick={() => setSort(s)}
                        className={`px-2 py-1 rounded-md text-[10px] font-bold transition
                          ${sort === s ? 'bg-white/15 text-white' : 'text-white/30 hover:text-white'}`}>
                  {s === 'recent' ? '🕐' : '❤️'}
                </button>
              ))}
            </div>
            {!embedded && (
              <button onClick={onClose}
                      className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center
                                 hover:bg-white/15 transition text-white/50 text-sm">✕</button>
            )}
          </div>
        </div>

        {/* Setup de nome (primeira vez) */}
        {setup && (
          <div className="flex-shrink-0 px-5 py-4 border-b border-brand-border bg-brand-accent/50">
            <p className="text-xs font-bold text-white/60 mb-3">Como você quer aparecer?</p>
            <div className="flex gap-2">
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Seu apelido..."
                maxLength={30}
                className="flex-1 bg-white/5 border border-brand-border rounded-xl px-3 py-2
                           text-sm text-white placeholder-white/25 focus:outline-none
                           focus:border-brand-green/50 transition"
              />
              <button onClick={() => { if (username.trim()) { saveUser(username, color); setSetup(false) }}}
                      disabled={!username.trim()}
                      className="px-4 py-2 rounded-xl bg-brand-green text-white
                                 text-sm font-black disabled:opacity-40 hover:bg-brand-redHover transition">
                OK
              </button>
            </div>
            {/* Seletor de cor */}
            <div className="flex gap-2 mt-3 items-center">
              <span className="text-xs text-white/30">Cor:</span>
              {COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)}
                        className={`w-6 h-6 rounded-full border-2 transition ${color === c ? 'border-white scale-110' : 'border-transparent'}`}
                        style={{ background: c }} />
              ))}
            </div>
          </div>
        )}

        {/* Lista de comentários */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {loading ? (
            <CommentSkeletons />
          ) : comments.length === 0 ? (
            <div className="text-center py-16 text-white/30">
              <p className="text-4xl mb-3">💬</p>
              <p className="font-semibold">Seja o primeiro a comentar!</p>
            </div>
          ) : (
            comments.map(c => (
              <CommentCard
                key={c.id}
                comment={c}
                clientId={clientId}
                onLike={() => handleLike(c.id)}
                onReply={() => { setReplyTo({ id: c.id, username: c.username }); inputRef.current?.focus() }}
              />
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input de comentário */}
        {!setup && (
          <div className="flex-shrink-0 border-t border-brand-border px-4 py-3 bg-brand-card">
            {/* Reply indicator */}
            {replyTo && (
              <div className="flex items-center justify-between mb-2 px-2 py-1.5 rounded-lg bg-white/5">
                <span className="text-xs text-white/50">
                  Respondendo <span className="text-brand-green font-bold">@{replyTo.username}</span>
                </span>
                <button onClick={() => setReplyTo(null)} className="text-white/30 hover:text-white text-sm">✕</button>
              </div>
            )}

            {error && (
              <p className="text-xs text-red-400 font-bold mb-2 px-1">{error}</p>
            )}

            <div className="flex items-center gap-2">
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center
                              text-xs font-black border border-white/10"
                   style={{ background: color + '25', color, borderColor: color + '40' }}>
                {username[0]?.toUpperCase()}
              </div>

              {/* Input */}
              <input
                ref={inputRef}
                value={body}
                onChange={e => setBody(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                placeholder={replyTo ? `Responder @${replyTo.username}...` : 'Comentar ao vivo...'}
                maxLength={500}
                className="flex-1 bg-white/5 border border-brand-border rounded-2xl px-4 py-2
                           text-sm text-white placeholder-white/25 focus:outline-none
                           focus:border-brand-green/40 transition"
              />

              {/* Enviar */}
              <button onClick={handleSend} disabled={!body.trim() || sending}
                      className="w-9 h-9 rounded-full bg-brand-green flex items-center justify-center
                                 text-white font-black disabled:opacity-40 hover:bg-brand-redHover
                                 transition active:scale-90 flex-shrink-0">
                {sending ? (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                  </svg>
                )}
              </button>
            </div>

            {/* Contador */}
            <div className="flex justify-between mt-1.5 px-1">
              <button onClick={() => setSetup(true)}
                      className="text-[10px] text-white/25 hover:text-white/50 transition">
                ✏️ {username}
              </button>
              <span className="text-[10px] text-white/20">{body.length}/500</span>
            </div>
          </div>
        )}
    </>
  )

  // Modo embutido (dentro do MatchDetails): sem modal/backdrop próprios
  if (embedded) {
    return <div className="flex flex-col flex-1 min-h-0">{inner}</div>
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
         onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div className="relative w-full sm:max-w-lg bg-brand-card border border-brand-border
                      rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col"
           onClick={e => e.stopPropagation()}>
        {inner}
      </div>
    </div>
  )
}

/* ── Card de comentário ──────────────────────────────────────────────────── */
function CommentCard({ comment: c, clientId, onLike, onReply }) {
  const [showReplies, setShowReplies] = useState(false)
  const [replies,     setReplies]     = useState([])
  const [loadingR,    setLoadingR]    = useState(false)

  async function toggleReplies() {
    if (!showReplies && replies.length === 0) {
      setLoadingR(true)
      const r = await fetch('/api/comments', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action: 'replies', parentId: c.id, clientId }),
      })
      const d = await r.json()
      setReplies(d.replies ?? [])
      setLoadingR(false)
    }
    setShowReplies(v => !v)
  }

  return (
    <div className="animate-fade-in">
      <div className="flex gap-2.5">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center
                        text-sm font-black border border-white/10 mt-0.5"
             style={{ background: c.color + '20', color: c.color, borderColor: c.color + '30' }}>
          {c.username?.[0]?.toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black" style={{ color: c.color }}>{c.username}</span>
            <span className="text-[10px] text-white/25">{timeAgo(c.created_at)}</span>
          </div>

          {/* Corpo */}
          <p className="text-sm text-white/85 leading-relaxed break-words">{c.body}</p>

          {/* Ações */}
          <div className="flex items-center gap-4 mt-2">
            {/* Like */}
            <button onClick={onLike}
                    className={`flex items-center gap-1 text-xs font-bold transition active:scale-90
                      ${c.liked ? 'text-red-400' : 'text-white/30 hover:text-white/60'}`}>
              <span className={`text-sm ${c.liked ? 'scale-110' : ''} transition-transform`}>
                {c.liked ? '❤️' : '🤍'}
              </span>
              {c.likes > 0 && <span>{c.likes}</span>}
            </button>

            {/* Reply */}
            <button onClick={onReply}
                    className="text-xs text-white/30 hover:text-white/60 font-bold transition">
              💬 Responder
            </button>

            {/* Ver replies */}
            {Number(c.reply_count) > 0 && (
              <button onClick={toggleReplies}
                      className="text-xs text-brand-green/70 hover:text-brand-green font-bold transition">
                {showReplies ? '▲' : '▼'} {c.reply_count} resposta{c.reply_count > 1 ? 's' : ''}
              </button>
            )}
          </div>

          {/* Replies */}
          {showReplies && (
            <div className="mt-3 pl-3 border-l border-white/10 space-y-3">
              {loadingR ? (
                <p className="text-xs text-white/30 animate-pulse">Carregando...</p>
              ) : replies.map(r => (
                <div key={r.id} className="flex gap-2">
                  <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center
                                  text-[10px] font-black border border-white/10"
                       style={{ background: r.color + '20', color: r.color, borderColor: r.color + '30' }}>
                    {r.username?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[11px] font-black" style={{ color: r.color }}>{r.username}</span>
                      <span className="text-[9px] text-white/25">{timeAgo(r.created_at)}</span>
                    </div>
                    <p className="text-xs text-white/80 leading-relaxed">{r.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Skeletons ─────────────────────────────────────────────────────────── */
function CommentSkeletons() {
  return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex gap-2.5 animate-pulse">
          <div className="w-9 h-9 rounded-full bg-white/8 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-white/8 rounded w-1/4" />
            <div className="h-3 bg-white/5 rounded w-3/4" />
            <div className="h-3 bg-white/5 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
