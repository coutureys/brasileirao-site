/**
 * 🛡️ CSRF PROTECTION MIDDLEWARE
 * Generate and validate CSRF tokens
 */
import csrf from 'csrf'
import { randomBytes } from 'crypto'

const csrfProtection = new csrf()
const tokens = new Map() // In-memory store (use Redis in production)

/**
 * Generate CSRF token for a session
 */
export function generateCSRFToken(sessionId) {
  const secret = csrfProtection.secretSync()
  tokens.set(sessionId, secret)

  const token = csrfProtection.create(secret)
  return { token, secret }
}

/**
 * Middleware to serve CSRF token
 */
export function serveCsrfToken(req, res) {
  const sessionId = req.cookies?.sessionId || req.headers['x-session-id']

  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID required' })
  }

  const { token } = generateCSRFToken(sessionId)
  res.json({ token, sessionId })
}

/**
 * Middleware to validate CSRF token on POST/PUT/DELETE
 */
export function validateCSRFToken(req, res, next) {
  // Skip GET and OPTIONS requests
  if (['GET', 'OPTIONS', 'HEAD'].includes(req.method)) {
    return next()
  }

  const sessionId = req.cookies?.sessionId || req.headers['x-session-id']
  const token = req.headers['x-csrf-token'] || req.body?.csrfToken

  if (!sessionId || !token) {
    return res.status(403).json({ error: 'CSRF token missing' })
  }

  const secret = tokens.get(sessionId)
  if (!secret) {
    return res.status(403).json({ error: 'Invalid session' })
  }

  // Verify token
  const valid = csrfProtection.verify(secret, token)
  if (!valid) {
    return res.status(403).json({ error: 'CSRF token invalid' })
  }

  next()
}

/**
 * Middleware to set session cookie (CSRF-safe)
 */
export function setCSRFSessionCookie(req, res, next) {
  if (!req.cookies?.sessionId) {
    const sessionId = generateSessionId()
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    })
    req.sessionId = sessionId
  } else {
    req.sessionId = req.cookies.sessionId
  }
  next()
}

/**
 * Generate secure session ID using Node.js crypto (ES module safe)
 */
function generateSessionId() {
  return randomBytes(32).toString('hex')
}

/**
 * Cleanup expired tokens (call periodically)
 */
export function cleanupExpiredTokens() {
  const maxAge = 24 * 60 * 60 * 1000 // 24 hours
  const now = Date.now()

  for (const [sessionId, timestamp] of tokens.entries()) {
    if (now - timestamp > maxAge) {
      tokens.delete(sessionId)
    }
  }
}
