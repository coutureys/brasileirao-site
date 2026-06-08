# 🎯 SCOUTFUT PLAN SYSTEM

## Sistema de 2 Planos: Free vs Pro

ScoutFut implementa um modelo profissional de monetização com 2 planos usando diferentes APIs:

---

## 📋 Comparação Planos

| Feature | FREE | PRO |
|---------|------|-----|
| **Scores ao vivo** | ✅ | ✅ |
| **Tabela** | ✅ | ✅ |
| **Próximos jogos** | ✅ | ✅ |
| **Stats básicas** (posse, passes, cartões) | ✅ | ✅ |
| **xG (Expected Goals)** | ❌ | ✅ |
| **Chances claras** | ❌ | ✅ |
| **Rating de jogadores** | ❌ | ✅ |
| **Timeline completa** | ❌ | ✅ |
| **Stats avançadas** | ❌ | ✅ |
| **Sem anúncios** | ❌ | ✅ |
| **API** | Football-Data | API-Football |

---

## 🔧 Configuração

### 1. Variável de Ambiente

```bash
VITE_USER_PLAN=free    # ou 'pro'
```

### 2. Chaves de API

```env
VITE_FOOTBALLDATA_KEY=76ac466144d348a0868a3eedeabc6234
VITE_APIFOOTBALL_KEY=640002959e090d21539435fc8a7f88c6
```

### 3. Endpoints

```env
VITE_FOOTBALLDATA_API=https://api.football-data.org/v4
VITE_APIFOOTBALL_API=https://api-football-v1.p.rapidapi.com/v3
```

---

## 🚀 Como Usar

### 1. Verificar Plano do Usuário

```javascript
import { usePlan } from '../hooks/usePlan'

function MyComponent() {
  const { plan, isPro, isFree, features } = usePlan()

  if (isFree) {
    return <FreeLimitedContent />
  }

  return <ProContent />
}
```

### 2. Buscar Dados Conforme Plano

```javascript
import { getApiService } from '../services/matchDataService'

async function loadMatchData(matchId, plan) {
  const apiService = getApiService(plan)

  if (plan === 'pro') {
    // PRO: Dados completos em paralelo
    const data = await apiService.getCompleteData(matchId)
    return data // { match, stats, players, events }
  } else {
    // FREE: Dados básicos
    const match = await apiService.getMatch(matchId)
    return match
  }
}
```

### 3. Mostrar UI Diferente

```javascript
function MatchDetails({ matchId }) {
  const { plan } = usePlan()

  return (
    <>
      {/* Sempre mostra */}
      <BasicStats />

      {/* Apenas PRO */}
      {plan === 'pro' && (
        <>
          <XGStats />
          <PlayerRatings />
          <MatchTimeline />
        </>
      )}

      {/* FREE: CTA para upgrade */}
      {plan === 'free' && <UpgradeCTA />}
    </>
  )
}
```

---

## 🎯 Free vs Pro em Detalhes

### FREE Plan (Football-Data.org)

**Vantagens:**
- ✅ Não requer RapidAPI (mais simples)
- ✅ Dados em tempo real
- ✅ Suporta múltiplas ligas

**Limitações:**
- ❌ Stats básicas apenas
- ❌ Sem ratings de jogadores
- ❌ Sem xG
- ❌ Sem timeline detalhada

**API Requests:**
```
GET /matches/{id}
GET /competitions/{id}/standings
GET /competitions/{id}/matches?status=SCHEDULED
```

### PRO Plan (API-Football)

**Vantagens:**
- ✅ xG (Expected Goals)
- ✅ Ratings detalhados
- ✅ Timeline completa com eventos
- ✅ Chances claras
- ✅ Stats avançadas

**Requer:**
- ⚠️ RapidAPI subscription
- ⚠️ Rate limit control

**API Requests (Promise.all paralelo):**
```javascript
await Promise.all([
  getMatch(id),           // Dados do jogo
  getMatchStats(id),      // Stats (xG, posse, etc)
  getPlayerStats(id),     // Ratings de jogadores
  getMatchEvents(id),     // Timeline completa
])
```

---

## 💾 Caching

Sistema automático de cache:

```javascript
const CACHE_DURATION = 5 * 60 * 1000  // 5 minutos

// Dados em cache são reutilizados
const data = await cachedFetch(key, fetchFn)

// Dados expirados são revalidados
// Se API falhar, cache expirado é retornado
```

---

## 🎨 UI Components

### PlanUpgradeModal

Modal bonito mostrando comparação de planos:
- Preço: R$ 9,90/mês ou R$ 99/ano
- Features listadas
- Call-to-action para upgrade

### PlanSwitcher

Dev tool (só aparece em dev):
- Botão para alternar free ↔ pro
- Testa features diferentes

### MatchDetailsAdvanced

Mostra stats diferentes conforme plano:
- FREE: Stats básicas + CTA upgrade
- PRO: Stats completas + xG + ratings

---

## 📊 Próximos Passos

### 1. Integrar Pagamento

```javascript
import Stripe from '@stripe/stripe-js'

async function handleUpgrade() {
  const stripe = await Stripe(import.meta.env.VITE_STRIPE_KEY)
  await stripe.redirectToCheckout({ sessionId })
}
```

### 2. Webhook para Confirmação

```javascript
// POST /api/webhooks/stripe
app.post('/api/webhooks/stripe', (req, res) => {
  if (event.type === 'payment_intent.succeeded') {
    // Atualizar user.plan = 'pro' no DB
    // Email de confirmação
  }
})
```

### 3. Verificação no Backend

```javascript
// Verificar token JWT
if (user.plan !== 'pro') {
  return res.status(403).json({ error: 'Pro plan required' })
}
```

---

## 🔒 Segurança

⚠️ **IMPORTANTE**: Plano é salvo em `localStorage` apenas para UX.

**Verificação real** deve ser feita no backend:

```javascript
// ❌ NÃO confie em localStorage para gating
if (localStorage.getItem('scoutfut-plan') === 'pro') { }

// ✅ SIM: Verificar JWT token
if (user.subscriptionStatus === 'active') { }
```

---

## 📈 Monetização

### Revenue Model

```
Monthly User: $9.90 × 50,000 = $495,000/mês
Yearly User:  $99/ano × 10,000 = $990,000/ano
-----------
Total Annual: ~$6M potencial
```

### Retention Strategy

- 7 dias trial grátis
- Cancelamento fácil
- Suporte prioritário PRO
- Features periódicas novas

---

## 🚨 Troubleshooting

**Plan não está trocando?**
- Verificar localStorage: `localStorage.getItem('scoutfut-plan')`
- Limpar cache: `npm run build && npm run preview`
- Verificar PlanProvider está em App.jsx

**API retornando erro?**
- Verificar .env variables
- Testar chaves em Postman
- Checar rate limits

**Dados do PRO não aparecem?**
- Verificar que user.plan === 'pro'
- Checar console por erros de API
- Verificar Promise.all no getCompleteData()

---

## 📚 Files

```
PlanContext.jsx          — Estado global do plano
usePlan.js               — Hook para acessar plano
matchDataService.js      — Seletor de API
MatchDetailsAdvanced.jsx — UI com stats diferentes
PlanUpgradeModal.jsx     — Modal de upgrade
PlanSwitcher.jsx         — Dev tool
```

---

**Pronto para monetizar! 🚀**
