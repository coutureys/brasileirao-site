import FirecrawlApp from '@mendable/firecrawl-js'

const KEY = process.env.FIRECRAWL_API_KEY
let cache = { data: null, ts: 0, v: 0 }
const TTL = 10 * 60 * 1000
const CACHE_VERSION = 3

const SOURCES = [
  { url: 'https://ge.globo.com/futebol/brasileirao-serie-a/', name: 'GloboEsporte' },
  { url: 'https://www.espn.com.br/futebol/liga/_/name/bra.1', name: 'ESPN Brasil'  },
]

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=60')

  if (!KEY) return res.status(401).json({ error: 'FIRECRAWL_API_KEY não configurada' })
  if (cache.data && Date.now() - cache.ts < TTL && cache.v === CACHE_VERSION) {
    return res.json({ news: cache.data, source: 'cache' })
  }

  try {
    const app = new FirecrawlApp({ apiKey: KEY })
    let articles = []

    for (const src of SOURCES) {
      if (articles.length >= 9) break
      try {
        const result = await app.scrapeUrl(src.url, {
          formats: ['markdown', 'links'],
          onlyMainContent: false,
          timeout: 25000,
        })
        if (!result?.markdown) continue

        // links retornados pelo Firecrawl — URLs reais dos artigos
        const pageLinks = (result.links ?? []).filter(l =>
          typeof l === 'string'
            ? isArticleUrl(l)
            : isArticleUrl(l?.url)
        ).map(l => typeof l === 'string' ? l : l.url)

        const parsed = parseArticles(result.markdown, src.name, result.metadata, src.url, pageLinks)
        articles.push(...parsed)
      } catch (e) {
        console.warn(`[news] Erro ao raspar ${src.name}:`, e.message)
      }
    }

    // Deduplica por título
    const seen = new Set()
    const unique = articles
      .filter(a => {
        if (!a.title || a.title.length < 15 || seen.has(a.title)) return false
        seen.add(a.title)
        return true
      })
      .slice(0, 9)

    cache = { data: unique, ts: Date.now(), v: CACHE_VERSION }
    res.json({ news: unique, source: 'firecrawl', count: unique.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

/* ─────────────────────────────────────────────────────── */
function parseArticles(markdown, source, metadata, sourceUrl, pageLinks) {
  const articles = []
  const lines = markdown.split('\n').filter(Boolean)

  // Mapeia imagens próximas a cada título
  const imgMap  = new Map()
  let lastImg = null
  for (const line of lines) {
    const imgM = line.match(/!\[[^\]]*\]\((https?:\/\/[^\s)]+)\)/)
    if (imgM && isContentImage(imgM[1])) lastImg = imgM[1]
    const hM = line.match(/^#{1,4}\s+(.+)/)
    if (hM && lastImg) { imgMap.set(cleanTitle(hM[1]), lastImg); lastImg = null }
  }

  let currentTitle = null
  let currentDesc  = null
  let currentImg   = null
  let currentUrl   = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const hM = line.match(/^#{1,4}\s+(.+)/)

    if (hM) {
      if (currentTitle) articles.push(buildArticle(currentTitle, currentDesc, currentImg, source, currentUrl))

      const headContent = hM[1]
      // Título pode ser um link markdown: [Texto](url)
      const titleLink = headContent.match(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/)
      currentTitle = titleLink ? cleanTitle(titleLink[1]) : cleanTitle(headContent)
      currentImg   = imgMap.get(currentTitle) ?? null
      currentDesc  = null

      // 1. URL do próprio título (mais confiável)
      if (titleLink?.[2] && isArticleUrl(titleLink[2])) {
        currentUrl = titleLink[2]
      } else {
        // 2. Procura link inline nas linhas vizinhas
        currentUrl = null
        for (let j = Math.max(0, i - 2); j < Math.min(lines.length, i + 5); j++) {
          const lM = lines[j].match(/\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/)
          if (lM && isArticleUrl(lM[2])) { currentUrl = lM[2]; break }
          const imgM = lines[j].match(/!\[[^\]]*\]\((https?:\/\/[^\s)]+)\)/)
          if (imgM && isContentImage(imgM[1]) && !currentImg) currentImg = imgM[1]
        }
        // 3. Busca no array de links da página pelo título mais parecido
        if (!currentUrl && pageLinks.length) {
          currentUrl = findBestLink(currentTitle, pageLinks) ?? sourceUrl
        }
        if (!currentUrl) currentUrl = sourceUrl
      }
      continue
    }

    if (currentTitle && !currentDesc) {
      const text = line
        .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
        .replace(/\[[^\]]+\]\([^)]+\)/g, '')
        .trim()
      if (text.length > 30 && !text.startsWith('#') && !text.startsWith('|')) {
        currentDesc = text.slice(0, 220)
      }
    }
  }

  if (currentTitle) articles.push(buildArticle(currentTitle, currentDesc, currentImg, source, currentUrl))

  const ogImages = [metadata?.ogImage, metadata?.['og:image'], metadata?.['twitter:image']]
    .flat().filter(Boolean).filter(isContentImage)

  return articles
    .filter(a => isValidArticle(a.title))
    .map((a, idx) => ({ ...a, image: a.image ?? ogImages[idx % ogImages.length] ?? null }))
}

/* Tenta achar o link da página cujo path contém palavras do título */
function findBestLink(title, links) {
  const words = title.toLowerCase()
    .replace(/[^a-záéíóúàâêôãõüçñ\s]/gi, ' ')
    .split(/\s+/)
    .filter(w => w.length > 4)
    .slice(0, 5)

  let best = null, bestScore = 0
  for (const link of links) {
    const l = link.toLowerCase()
    const score = words.filter(w => l.includes(w)).length
    if (score > bestScore) { bestScore = score; best = link }
  }
  return bestScore >= 2 ? best : null
}

function buildArticle(title, desc, image, source, url) {
  return { title, desc: desc ?? null, image: image ?? null, url: url ?? null, source, publishedAt: new Date().toISOString(), category: guessCategory(title) }
}

function cleanTitle(t) {
  return t.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*+/g, '').replace(/`/g, '').trim()
}

function isArticleUrl(url) {
  if (!url || typeof url !== 'string') return false
  if (!url.startsWith('http')) return false
  const blocked = ['logo','favicon','icon','static','cdn','assets','img','image','foto','.jpg','.jpeg','.png','.webp','.gif','.svg']
  if (blocked.some(b => url.toLowerCase().includes(b))) return false
  // URL deve ter path com mais de um segmento (artigo, não homepage)
  try { const p = new URL(url).pathname; return p.split('/').filter(Boolean).length >= 2 } catch { return false }
}

function isContentImage(url) {
  if (!url) return false
  if (url.includes('favicon') || url.includes('icon-') || url.includes('escudo_default')) return false
  if (url.includes('w=30') || url.includes('h=30') || url.length < 20) return false
  return url.startsWith('http') && (
    url.includes('glbimg') || url.includes('espncdn') || url.includes('s3.') ||
    url.includes('.jpg') || url.includes('.jpeg') || url.includes('.webp') || url.includes('.png')
  )
}

function isValidArticle(title) {
  if (!title || title.length < 15 || title.length > 250) return false
  const blocked = ['cookie','privacidade','login','cadastre','assine','veja mais','baixe o app','compartilhe','siga-nos','newsletter','publicidade']
  return !blocked.some(b => title.toLowerCase().includes(b))
}

function guessCategory(title) {
  const t = title.toLowerCase()
  if (t.includes('gol') || t.includes('placar') || t.includes('resultado')) return 'Resultado'
  if (t.includes('transfer') || t.includes('contrat') || t.includes('reforço')) return 'Transferência'
  if (t.includes('lesão') || t.includes('lesao') || t.includes('contundido')) return 'Lesão'
  if (t.includes('técnico') || t.includes('tecnico') || t.includes('treinador')) return 'Bastidores'
  if (t.includes('rodada') || t.includes('classificação') || t.includes('tabela')) return 'Série A'
  return 'Brasileirão'
}
