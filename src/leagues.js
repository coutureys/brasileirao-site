// 🟢 Todas as ligas suportadas (definições).
// Por enquanto só o Brasileirão está ATIVO. Para reativar outra liga,
// basta adicionar o id dela em ACTIVE_LEAGUE_IDS abaixo.
const ALL_LEAGUES = [
  {
    id:      'bra.1',
    name:    'Brasileirão',
    short:   'Série A',
    flag:    '🇧🇷',
    color:   '#8B0000',
    bg:      'from-red-950/40',
    border:  'border-red-900/50',
    text:    'text-red-400',
    badge:   'bg-red-950/40 text-red-400 border-red-900/50',
  },
  {
    id:      'bra.2',
    name:    'Série B',
    short:   'Série B',
    flag:    '🇧🇷',
    color:   '#00B4D8',
    bg:      'from-cyan-500/20',
    border:  'border-cyan-500/30',
    text:    'text-cyan-400',
    badge:   'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
  },
  {
    id:      'bra.copa',
    name:    'Copa do Brasil',
    short:   'Copa BR',
    flag:    '🏆',
    color:   '#FFD700',
    bg:      'from-yellow-500/20',
    border:  'border-yellow-500/30',
    text:    'text-yellow-400',
    badge:   'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  },
  {
    id:      'conmebol.libertadores',
    name:    'Libertadores',
    short:   'Libertad.',
    flag:    '🏆',
    color:   '#FF6B00',
    bg:      'from-orange-500/20',
    border:  'border-orange-500/30',
    text:    'text-orange-400',
    badge:   'bg-orange-500/15 text-orange-400 border-orange-500/20',
  },
  {
    id:      'uefa.champions',
    name:    'Champions',
    short:   'UCL',
    flag:    '⭐',
    color:   '#4A90D9',
    bg:      'from-blue-500/20',
    border:  'border-blue-500/30',
    text:    'text-blue-400',
    badge:   'bg-blue-500/15 text-blue-400 border-blue-500/20',
  },
  {
    id:      'eng.1',
    name:    'Premier League',
    short:   'Premier',
    flag:    '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    color:   '#3D195B',
    bg:      'from-purple-700/20',
    border:  'border-purple-600/30',
    text:    'text-purple-400',
    badge:   'bg-purple-500/15 text-purple-400 border-purple-500/20',
  },
  {
    id:      'esp.1',
    name:    'La Liga',
    short:   'LaLiga',
    flag:    '🇪🇸',
    color:   '#FF4B44',
    bg:      'from-red-500/20',
    border:  'border-red-500/30',
    text:    'text-red-400',
    badge:   'bg-red-500/15 text-red-400 border-red-500/20',
  },
]

// 👉 Ligas que aparecem no site. Para liberar outra, adicione o id aqui.
const ACTIVE_LEAGUE_IDS = ['bra.1']

export const LEAGUES = ALL_LEAGUES.filter(l => ACTIVE_LEAGUE_IDS.includes(l.id))

export const getLeague = (id) => ALL_LEAGUES.find(l => l.id === id) ?? LEAGUES[0]
