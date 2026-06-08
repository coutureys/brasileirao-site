/**
 * 🔐 SECURITY MIDDLEWARE
 * Helmet headers, CORS, rate limiting, request validation
 */
import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'

/**
 * Setup security headers with Helmet
 */
export function setupSecurityHeaders() {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        fontSrc: ["'self'"],
        connectSrc: ["'self'", 'https://api.football-data.org', 'https://api-football-v1.p.rapidapi.com'],
      },
    },
    frameguard: { action: 'deny' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    noSniff: true,
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
  })
}

/**
 * Setup CORS with restricted origins
 */
export function setupCORS() {
  const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [
    'http://localhost:5173',
    'http://localhost:4173',
    'http://localhost:3001',
  ]

  // Add Vercel deployment URLs if in production
  if (process.env.NODE_ENV === 'production') {
    allowedOrigins.push('https://brasileirao-site.vercel.app')
    allowedOrigins.push('https://scoutfut.vercel.app')
  }

  return cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    optionsSuccessStatus: 200,
  })
}

/**
 * General rate limiter (100 requests per 15 minutes)
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Muitas requisições deste IP, tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || req.socket?.remoteAddress || 'unknown',
  handler: (req, res) => {
    res.status(429).json({
      error: 'Rate limit exceeded',
      retryAfter: req.rateLimit?.resetTime,
    })
  },
})

/**
 * Strict rate limiter for authentication (5 requests per 15 minutes)
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  skipSuccessfulRequests: true,
  keyGenerator: (req) => req.body?.email || req.ip,
})

/**
 * Rate limiter for comments (10 requests per 15 minutes)
 */
export const commentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Você está comentando muito rapidamente. Aguarde um pouco.',
  keyGenerator: (req) => req.body?.clientId || req.ip,
})

/**
 * Rate limiter for search (30 requests per 15 minutes)
 */
export const searchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Muitas buscas. Tente novamente mais tarde.',
})

/**
 * Middleware to limit request body size
 */
export function limitRequestSize() {
  return (req, res, next) => {
    const contentLength = parseInt(req.headers['content-length'] || 0)
    const maxSize = 10 * 1024 // 10KB

    if (contentLength > maxSize) {
      return res.status(413).json({
        error: 'Payload muito grande',
        maxSize: `${maxSize / 1024}KB`,
      })
    }
    next()
  }
}

/**
 * Middleware to validate Content-Type
 */
export function validateContentType() {
  return (req, res, next) => {
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const contentType = req.headers['content-type']

      if (!contentType || !contentType.includes('application/json')) {
        return res.status(415).json({
          error: 'Unsupported Media Type. Use application/json',
        })
      }
    }
    next()
  }
}

/**
 * Middleware for secure error handling
 */
export function errorHandler(err, req, res, next) {
  console.error('[ERROR]', err.message)

  // Don't expose error details to client in production
  const message = process.env.NODE_ENV === 'production'
    ? 'Erro interno do servidor'
    : err.message

  const statusCode = err.statusCode || 500

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  })
}

/**
 * Middleware to remove sensitive headers
 */
export function stripSensitiveHeaders(req, res, next) {
  res.removeHeader('X-Powered-By')
  res.removeHeader('Server')
  next()
}

/**
 * Middleware to log security events
 */
export function logSecurityEvents(req, res, next) {
  const start = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - start
    const statusCode = res.statusCode

    // Log rate limit hits
    if (statusCode === 429) {
      console.warn(`[RATE_LIMIT] ${req.method} ${req.path} from ${req.ip}`)
    }

    // Log 4xx and 5xx errors
    if (statusCode >= 400) {
      console.warn(`[${statusCode}] ${req.method} ${req.path} - ${duration}ms`)
    }

    // Log successful admin/auth requests
    if (req.path.includes('/auth') || req.path.includes('/admin')) {
      console.info(`[${statusCode}] ${req.method} ${req.path} - ${duration}ms`)
    }
  })

  next()
}
