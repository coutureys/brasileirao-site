/**
 * 🧹 SANITIZATION UTILITIES
 * DOMPurify wrappers for safe HTML handling
 */
import DOMPurify from 'dompurify'

// Configuração segura do DOMPurify
const config = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br'],
  ALLOWED_ATTR: ['href', 'title'],
  KEEP_CONTENT: true,
}

const strictConfig = {
  ALLOWED_TAGS: [],
  ALLOWED_ATTR: [],
  KEEP_CONTENT: true,
}

/**
 * Sanitiza HTML mas permite algumas tags básicas (bold, italic, links)
 * @param {string} dirty - HTML a ser sanitizado
 * @returns {string} HTML seguro
 */
export function sanitizeHTML(dirty) {
  if (!dirty || typeof dirty !== 'string') return ''
  return DOMPurify.sanitize(dirty, config)
}

/**
 * Remove TODOS os HTML tags e entidades - apenas texto puro
 * Melhor para comentários e nomes de usuário
 * @param {string} dirty - Texto a ser sanitizado
 * @returns {string} Texto puro
 */
export function sanitizeText(dirty) {
  if (!dirty || typeof dirty !== 'string') return ''
  const sanitized = DOMPurify.sanitize(dirty, strictConfig)
  // Remove HTML entities
  return decodeHTMLEntities(sanitized).trim()
}

/**
 * Decodifica HTML entities para obter texto puro
 * @param {string} text - Texto com entities
 * @returns {string} Texto decodificado
 */
function decodeHTMLEntities(text) {
  const textarea = document.createElement('textarea')
  textarea.innerHTML = text
  return textarea.value
}

/**
 * Sanitiza URL para evitar javascript: e data: URLs
 * @param {string} url - URL a ser validada
 * @returns {string} URL segura ou string vazia
 */
export function sanitizeURL(url) {
  if (!url || typeof url !== 'string') return ''

  try {
    const parsed = new URL(url)
    // Apenas permite http e https
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return url
    }
  } catch (e) {
    // URL inválida
  }

  return ''
}

/**
 * Sanitiza nomes de arquivo para evitar traversal attacks
 * @param {string} filename - Nome do arquivo
 * @returns {string} Nome seguro
 */
export function sanitizeFilename(filename) {
  if (!filename || typeof filename !== 'string') return 'file'

  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/^\.+/, '')
    .substring(0, 255)
}

/**
 * Sanitiza dados JSON recebidos da API
 * Remove ou escapa chaves perigosas
 * @param {object} data - Dados a serem sanitizados
 * @returns {object} Dados sanitizados
 */
export function sanitizeJSON(data) {
  if (!data || typeof data !== 'object') return data

  const sanitized = {}
  for (const [key, value] of Object.entries(data)) {
    // Pula chaves privadas (começam com _)
    if (key.startsWith('_')) continue

    if (typeof value === 'string') {
      sanitized[key] = sanitizeText(value)
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeJSON(value)
    } else if (typeof value !== 'function') {
      sanitized[key] = value
    }
  }
  return sanitized
}

/**
 * Escapa caracteres especiais para uso seguro em HTML
 * @param {string} str - String a ser escapada
 * @returns {string} String escapada
 */
export function escapeHTML(str) {
  if (!str || typeof str !== 'string') return ''

  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return str.replace(/[&<>"']/g, char => map[char])
}

/**
 * Valida e sanitiza email
 * @param {string} email - Email a ser validado
 * @returns {string} Email sanitizado ou string vazia
 */
export function sanitizeEmail(email) {
  if (!email || typeof email !== 'string') return ''

  const sanitized = email.toLowerCase().trim()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (emailRegex.test(sanitized)) {
    return sanitized
  }
  return ''
}

/**
 * Limpa dados sensíveis de um objeto (senhas, tokens, etc)
 * @param {object} obj - Objeto a ser limpo
 * @returns {object} Objeto sem dados sensíveis
 */
export function stripSensitiveData(obj) {
  if (!obj || typeof obj !== 'object') return obj

  const sensitiveKeys = [
    'password',
    'token',
    'secret',
    'apiKey',
    'apiSecret',
    'privateKey',
    'creditCard',
    'ssn',
  ]

  const stripped = { ...obj }
  for (const key of sensitiveKeys) {
    if (key in stripped) {
      delete stripped[key]
    }
  }
  return stripped
}

export default {
  sanitizeHTML,
  sanitizeText,
  sanitizeURL,
  sanitizeFilename,
  sanitizeJSON,
  escapeHTML,
  sanitizeEmail,
  stripSensitiveData,
}
