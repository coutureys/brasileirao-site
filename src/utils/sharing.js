/**
 * 📤 SHARING — Compartilhar em redes sociais
 */

export const shareOptions = (data) => {
  const {
    title,
    description,
    url = window.location.href,
    image = 'https://brasileirao-site.vercel.app/og-image.png',
    hashtags = '#ScoutFut #Futebol',
  } = data

  return {
    whatsapp: () => {
      const text = encodeURIComponent(`${title}\n\n${description}\n\n${url}`)
      window.open(`https://wa.me/?text=${text}`, '_blank')
    },

    twitter: () => {
      const text = encodeURIComponent(`${title}\n\n${description}\n\n${hashtags}`)
      window.open(
        `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`,
        '_blank'
      )
    },

    facebook: () => {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        '_blank'
      )
    },

    telegram: () => {
      const text = encodeURIComponent(`${title}\n\n${description}`)
      window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${text}`, '_blank')
    },

    linkedIn: () => {
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
        '_blank'
      )
    },

    reddit: () => {
      window.open(
        `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
        '_blank'
      )
    },

    email: () => {
      const body = encodeURIComponent(`${title}\n\n${description}\n\n${url}`)
      window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${body}`)
    },

    copy: () => {
      navigator.clipboard.writeText(`${title}\n${description}\n${url}`)
      return true
    },
  }
}

export const shareableText = (match) => {
  return {
    title: `${match.homeTeam} ${match.score.home} x ${match.score.away} ${match.awayTeam}`,
    description: `Veja este jogo incrível no ScoutFut! ⚽\nAnálises ao vivo, estatísticas e ratings de jogadores.`,
    hashtags: '#ScoutFut #Futebol #BrasileirãoSérieA',
  }
}

export const shareablePlayer = (player) => {
  return {
    title: `${player.name} - ${player.rating}/10 ⭐`,
    description: `Veja o desempenho e análise detalhada de ${player.name} no ScoutFut!`,
    hashtags: '#ScoutFut #${player.name.replace(/ /g, '')} #Futebol',
  }
}

export const shareableTeam = (team) => {
  return {
    title: `${team.name} - Ranking, Estatísticas e Análises`,
    description: `Acompanhe ${team.name} com dados profissionais no ScoutFut. Tabela, próximos jogos, analytics em tempo real.`,
    hashtags: `#ScoutFut #${team.name.replace(/ /g, '')} #BrasileirãoSérieA`,
  }
}
