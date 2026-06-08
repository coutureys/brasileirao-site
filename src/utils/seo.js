/**
 * 🔍 SEO UTILITIES — Meta tags, Open Graph, Schema.json
 */

/**
 * Atualiza meta tags da página
 */
export function setSEOTags(config) {
  const {
    title = 'ScoutFut',
    description = 'Siga seu time com dados profissionais',
    image = 'https://brasileirao-site.vercel.app/og-image.png',
    url = 'https://brasileirao-site.vercel.app',
    type = 'website',
    author = 'ScoutFut',
  } = config

  // Title
  document.title = title

  // Meta description
  updateMeta('description', description)

  // Open Graph
  updateMeta('og:title', title, 'property')
  updateMeta('og:description', description, 'property')
  updateMeta('og:image', image, 'property')
  updateMeta('og:url', url, 'property')
  updateMeta('og:type', type, 'property')
  updateMeta('og:site_name', 'ScoutFut', 'property')

  // Twitter Card
  updateMeta('twitter:card', 'summary_large_image')
  updateMeta('twitter:title', title)
  updateMeta('twitter:description', description)
  updateMeta('twitter:image', image)

  // Additional meta tags
  updateMeta('author', author)
  updateMeta('robots', 'index, follow')
  updateMeta('theme-color', '#00E676')
  updateMeta('apple-mobile-web-app-capable', 'yes')
  updateMeta('apple-mobile-web-app-status-bar-style', 'black-translucent')

  // Canonical
  updateCanonical(url)
}

/**
 * Atualiza ou cria meta tag
 */
function updateMeta(name, content, attr = 'name') {
  let meta = document.querySelector(`meta[${attr}="${name}"]`)

  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute(attr, name)
    document.head.appendChild(meta)
  }

  meta.setAttribute('content', content)
}

/**
 * Atualiza canonical URL
 */
function updateCanonical(url) {
  let link = document.querySelector('link[rel="canonical"]')

  if (!link) {
    link = document.createElement('link')
    link.rel = 'canonical'
    document.head.appendChild(link)
  }

  link.href = url
}

/**
 * Adiciona Schema.json (JSON-LD)
 */
export function setSchema(schema) {
  let script = document.querySelector('script[type="application/ld+json"]')

  if (!script) {
    script = document.createElement('script')
    script.type = 'application/ld+json'
    document.head.appendChild(script)
  }

  script.textContent = JSON.stringify(schema)
}

/**
 * Schema para Website
 */
export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'ScoutFut',
  url: 'https://brasileirao-site.vercel.app',
  description: 'Siga seu time com dados profissionais',
  logo: 'https://brasileirao-site.vercel.app/logo.png',
  sameAs: [
    'https://twitter.com/scoutfut',
    'https://instagram.com/scoutfut',
  ],
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://brasileirao-site.vercel.app/?search={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
}

/**
 * Schema para Organização
 */
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ScoutFut',
  url: 'https://brasileirao-site.vercel.app',
  logo: 'https://brasileirao-site.vercel.app/logo.png',
  description: 'Plataforma de análise de futebol profissional',
  sameAs: [
    'https://twitter.com/scoutfut',
    'https://instagram.com/scoutfut',
  ],
  contact: {
    '@type': 'ContactPoint',
    contactType: 'Customer Service',
    email: 'contact@scoutfut.com',
    availableLanguage: 'pt-BR',
  },
}

/**
 * Schema para BreadcrumbList
 */
export function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

/**
 * Schema para Artigo/Notícia
 */
export function articleSchema(config) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: config.title,
    description: config.description,
    image: config.image,
    datePublished: config.publishedDate,
    dateModified: config.modifiedDate,
    author: {
      '@type': 'Organization',
      name: 'ScoutFut',
    },
  }
}

/**
 * Schema para Jogo de Futebol
 */
export function soccerMatchSchema(match) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `${match.homeTeam} vs ${match.awayTeam}`,
    startDate: match.startDate,
    endDate: match.endDate,
    status: match.status,
    competitor: [
      {
        '@type': 'SportsTeam',
        name: match.homeTeam,
        logo: match.homeTeamLogo,
      },
      {
        '@type': 'SportsTeam',
        name: match.awayTeam,
        logo: match.awayTeamLogo,
      },
    ],
    result: match.result && {
      '@type': 'SportsEventResult',
      resultDescription: `${match.result.homeScore}-${match.result.awayScore}`,
    },
    location: match.stadium && {
      '@type': 'Place',
      name: match.stadium,
    },
  }
}

/**
 * Schema para Pessoa (Jogador)
 */
export function personSchema(player) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: player.name,
    image: player.image,
    birthDate: player.birthDate,
    nationality: player.nationality,
    jobTitle: `${player.position} - ${player.team}`,
    affiliation: {
      '@type': 'SportsTeam',
      name: player.team,
    },
  }
}
