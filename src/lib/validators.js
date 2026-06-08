/**
 * 🔐 VALIDATION SCHEMAS
 * Zod schemas for all input validation (frontend + backend)
 */
import { z } from 'zod'

// ────────────────────────────────────────────────────────────────
// SEARCH & QUERIES
// ────────────────────────────────────────────────────────────────

export const SearchQuerySchema = z.object({
  query: z
    .string()
    .trim()
    .min(1, 'Busca não pode estar vazia')
    .max(50, 'Busca muito longa (máx 50 caracteres)')
    .regex(/^[a-zA-Z0-9\s\-áéíóúàâêãõç]*$/, 'Caracteres inválidos na busca'),
  limit: z.number().min(1).max(100).default(20),
})

// ────────────────────────────────────────────────────────────────
// COMMENTS
// ────────────────────────────────────────────────────────────────

export const CommentCreateSchema = z.object({
  matchId: z.string().min(1, 'Match ID requerido'),
  username: z
    .string()
    .trim()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(30, 'Nome muito longo (máx 30 caracteres)')
    .regex(/^[a-zA-Z0-9\-_áéíóúàâêãõç\s]*$/, 'Nome contém caracteres inválidos'),
  body: z
    .string()
    .trim()
    .min(1, 'Comentário não pode estar vazio')
    .max(500, 'Comentário muito longo (máx 500 caracteres)'),
  color: z
    .enum(['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange', 'cyan'])
    .default('blue'),
  clientId: z.string().min(1, 'Client ID requerido'),
})

export const CommentLikeSchema = z.object({
  commentId: z.string().min(1, 'Comment ID requerido'),
  clientId: z.string().min(1, 'Client ID requerido'),
})

export const CommentReplySchema = z.object({
  matchId: z.string().min(1, 'Match ID requerido'),
  parentId: z.string().min(1, 'Parent ID requerido'),
  username: CommentCreateSchema.shape.username,
  body: CommentCreateSchema.shape.body,
  color: CommentCreateSchema.shape.color,
  clientId: z.string().min(1, 'Client ID requerido'),
})

// ────────────────────────────────────────────────────────────────
// PLAYERS & TEAMS
// ────────────────────────────────────────────────────────────────

export const PlayerFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Nome muito curto')
    .max(100, 'Nome muito longo')
    .regex(/^[a-zA-Z\s\-áéíóúàâêãõç]*$/, 'Nome contém caracteres inválidos'),
  team_name: z
    .string()
    .trim()
    .min(2, 'Nome do time muito curto')
    .max(100, 'Nome do time muito longo'),
  position: z.enum([
    'GK',
    'CB',
    'LB',
    'RB',
    'MF',
    'CM',
    'CAM',
    'CDM',
    'LW',
    'RW',
    'ST',
    'CF',
  ]),
  goals: z.number().min(0).max(999),
  assists: z.number().min(0).max(999),
  appearances: z.number().min(0).max(999),
  yellow_cards: z.number().min(0).max(500),
  red_cards: z.number().min(0).max(50),
  season: z.number().min(1900).max(new Date().getFullYear() + 1),
})

// ────────────────────────────────────────────────────────────────
// AUTHENTICATION
// ────────────────────────────────────────────────────────────────

export const LoginSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .max(255, 'Email muito longo'),
  password: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(128, 'Senha muito longa'),
})

export const RegisterSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Nome muito curto')
    .max(100, 'Nome muito longo'),
  email: LoginSchema.shape.email,
  password: LoginSchema.shape.password,
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
})

// ────────────────────────────────────────────────────────────────
// API PARAMETERS
// ────────────────────────────────────────────────────────────────

export const MatchQuerySchema = z.object({
  league: z
    .string()
    .regex(/^[a-z0-9.]+$/, 'League inválida')
    .default('bra.1'),
  status: z
    .enum(['ALL', 'IN_PLAY', 'FINISHED', 'SCHEDULED'])
    .default('ALL'),
  limit: z.number().min(1).max(100).default(20),
})

export const StandingsQuerySchema = z.object({
  league: z.string().regex(/^[a-z0-9.]+$/),
  limit: z.number().min(1).max(100).default(20),
})

// ────────────────────────────────────────────────────────────────
// FAVORITES
// ────────────────────────────────────────────────────────────────

export const FavoriteSchema = z.object({
  type: z.enum(['player', 'team']),
  id: z.string().min(1),
  name: z.string().min(1).max(100),
})

// ────────────────────────────────────────────────────────────────
// PUSH NOTIFICATIONS
// ────────────────────────────────────────────────────────────────

export const PushSubscriptionSchema = z.object({
  endpoint: z.string().url('URL de endpoint inválida'),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
})

// ────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ────────────────────────────────────────────────────────────────

/**
 * Valida dados contra um schema e retorna {success, data, error}
 */
export function validate(schema, data) {
  try {
    const validated = schema.parse(data)
    return { success: true, data: validated, error: null }
  } catch (err) {
    const error = err.issues?.[0]?.message || 'Validação falhou'
    return { success: false, data: null, error }
  }
}

/**
 * Valida de forma segura com try-catch
 */
export function safeParse(schema, data) {
  return schema.safeParse(data)
}

export default {
  SearchQuerySchema,
  CommentCreateSchema,
  CommentLikeSchema,
  CommentReplySchema,
  PlayerFormSchema,
  LoginSchema,
  RegisterSchema,
  MatchQuerySchema,
  StandingsQuerySchema,
  FavoriteSchema,
  PushSubscriptionSchema,
  validate,
  safeParse,
}
