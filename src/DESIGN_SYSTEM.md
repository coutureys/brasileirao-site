# 🎨 ScoutFut Design System

## 📋 Índice
1. [Cores](#cores)
2. [Tipografia](#tipografia)
3. [Componentes](#componentes)
4. [Espaçamento](#espaçamento)
5. [Sombras & Efeitos](#sombras--efeitos)
6. [Estados](#estados)

---

## 🎨 Cores

### Paleta Principal
```
Verde (Brand)      #10b981 → Ações, CTA, Destaque
Branco             #ffffff → Texto principal
Preto/Dark         #0a0e1a → Background
Cinza              #ffffff40 → Texto secundário
```

### Cores Secundárias
```
Amarelo            #f59e0b → Atenção, WARNING
Vermelho           #ef4444 → Erro, DANGER
Azul               #3b82f6 → Info, Secondary
Roxo               #8b5cf6 → Accent
```

### Gradientes
```
Hero Gradient      from-brand-accent via-brand-dark to-brand-dark
Green Glow         from-brand-green/20 to-transparent
Success            from-green-500/20 to-green-500/5
```

---

## 🔤 Tipografia

### Fontes
- **Família:** Inter (Google Fonts)
- **Weights:** 400, 500, 600, 700, 800, 900

### Tamanhos

| Elemento | Classe | Tamanho | Weight | Uso |
|----------|--------|---------|--------|-----|
| **Heading 1** | `text-5xl sm:text-6xl` | 3rem - 3.75rem | 900 | Hero, Página |
| **Heading 2** | `text-3xl` | 1.875rem | 900 | Seção |
| **Heading 3** | `text-2xl` | 1.5rem | 800 | Subsection |
| **Heading 4** | `text-xl` | 1.25rem | 700 | Card title |
| **Body** | `text-base` | 1rem | 400-500 | Conteúdo |
| **Small** | `text-sm` | 0.875rem | 500 | Metadata |
| **Tiny** | `text-xs` | 0.75rem | 500 | Badge, Helper |

---

## 🧩 Componentes

### Botões

**Primário (CTA)**
```jsx
<button className="px-6 py-3 bg-brand-green text-brand-dark font-bold rounded-xl
                   hover:bg-green-400 hover:shadow-lg active:scale-95 transition-all">
  Ação Principal
</button>
```

**Secundário**
```jsx
<button className="px-6 py-3 bg-white/10 border border-white/20 text-white font-bold rounded-xl
                   hover:bg-white/20 active:scale-95 transition-all">
  Ação Secundária
</button>
```

**Danger**
```jsx
<button className="px-6 py-3 bg-red-500/10 border border-red-500/30 text-red-400 font-bold rounded-xl
                   hover:bg-red-500/20 active:scale-95 transition-all">
  Deletar
</button>
```

### Cards

**Padrão**
```jsx
<div className="card p-6 rounded-xl border border-brand-border bg-brand-card
                hover:bg-white/3 transition">
  Conteúdo
</div>
```

**Com Gradient**
```jsx
<div className="bg-gradient-to-br from-brand-green/15 via-brand-green/10 to-brand-green/5
                border border-brand-green/30 rounded-xl p-6">
  Conteúdo
</div>
```

### Badges

**Status**
```jsx
<span className="inline-block px-2.5 py-1 bg-brand-green/20 text-brand-green
               text-xs font-bold rounded-lg">
  Ao Vivo
</span>
```

**Rating**
```jsx
<div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center">
  <span className="text-white font-black">8.5</span>
</div>
```

### Modais

```jsx
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
  {/* Overlay */}
  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
  
  {/* Modal */}
  <div className="relative bg-brand-card border border-brand-border rounded-3xl
                  max-w-4xl w-full max-h-[90vh] overflow-y-auto">
    Conteúdo
  </div>
</div>
```

### Tabelas

```jsx
<table className="w-full">
  <thead>
    <tr className="border-b border-brand-border">
      <th className="text-left py-3 px-4 text-xs font-bold text-white/60">Coluna</th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b border-brand-border/50 hover:bg-white/3">
      <td className="py-3 px-4">Conteúdo</td>
    </tr>
  </tbody>
</table>
```

---

## 📏 Espaçamento

**Base:** 8px (Tailwind padrão)

| Classe | Pixels | Uso |
|--------|--------|-----|
| `p-2` | 8px | Padding pequeno (botões, badges) |
| `p-3` | 12px | Padding cards pequenos |
| `p-4` | 16px | Padding padrão |
| `p-6` | 24px | Padding cards |
| `p-8` | 32px | Padding seções |
| `gap-2` | 8px | Gap pequeno |
| `gap-3` | 12px | Gap padrão |
| `gap-4` | 16px | Gap médio |
| `gap-6` | 24px | Gap grande |

**Seções:** `py-12 sm:py-16` ou `py-16 sm:py-20` entre seções principais

---

## 🎭 Sombras & Efeitos

### Sombras

```css
/* Pequena */
box-shadow: 0 1px 2px rgba(0,0,0,0.05);

/* Média */
box-shadow: 0 4px 6px rgba(0,0,0,0.1);

/* Grande (cards) */
box-shadow: 0 10px 15px rgba(0,0,0,0.1);

/* Glow (brand-green) */
box-shadow: 0 0 20px rgba(16,185,129,0.3);
```

### Transições

```css
/* Padrão */
transition-all duration-200;

/* Suave */
transition-all duration-300;

/* Rápido (hover) */
transition-all duration-150;
```

### Animações

```css
/* Pulse */
animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;

/* Scale hover */
hover:scale-105 transition-transform duration-300;

/* Slide up entrada */
animation: slideUp 0.3s ease-out;
```

---

## 🔄 Estados

### Hover
```
Botões: scale-105, shadow-lg
Cards: bg-white/3, border highlight
Links: text-brand-green
```

### Active/Pressed
```
Botões: scale-95 (pressed feel)
Opacidade: 80%
```

### Disabled
```
Opacidade: 50%
Cursor: not-allowed
Sem hover effects
```

### Loading
```
opacity-50
Skeleton screens (pulse animation)
Spinner spinner-border
```

### Error
```
Border: border-red-500/30
Background: bg-red-500/10
Text: text-red-400
```

---

## 📱 Responsive Breakpoints

```
Mobile:  < 640px
Tablet:  640px - 1024px
Desktop: > 1024px
```

Use `sm:`, `md:`, `lg:` prefixes from Tailwind

---

## ✨ Regras Gerais

1. **Consistência:** Use componentes documentados acima
2. **Cores:** Apenas cores listadas na paleta
3. **Espaçamento:** Sempre múltiplos de 8px
4. **Tipografia:** Seguir tamanhos definidos
5. **Animações:** Use duration-200 ou duration-300, sempre smooth
6. **Acessibilidade:** Manter contraste (7:1 mínimo)
7. **Mobile first:** Sempre começar mobile, depois `sm:` `md:` `lg:`

---

## 📚 Exemplos Completos

### Card com Button
```jsx
<div className="card p-6 rounded-xl border border-brand-border">
  <h3 className="text-lg font-black text-white mb-2">Título</h3>
  <p className="text-sm text-white/60 mb-4">Descrição</p>
  <button className="px-4 py-2 bg-brand-green text-brand-dark font-bold rounded-lg
                     hover:bg-green-400 active:scale-95 transition-all">
    Ação
  </button>
</div>
```

### Alert/Warning
```jsx
<div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
  <p className="text-sm text-yellow-400 font-bold">⚠️ Atenção</p>
  <p className="text-sm text-white/60 mt-1">Mensagem de aviso</p>
</div>
```

### Stats Section
```jsx
<div className="grid grid-cols-3 gap-4">
  {[
    { icon: '⭐', label: 'Favoritos', value: '5' },
    { icon: '⚽', label: 'Gols', value: '12' },
    { icon: '📊', label: 'Média', value: '7.8' },
  ].map(stat => (
    <div key={stat.label} className="bg-white/3 border border-white/5 rounded-xl p-4">
      <p className="text-2xl mb-2">{stat.icon}</p>
      <p className="text-xs text-white/50 mb-1">{stat.label}</p>
      <p className="text-xl font-black text-white">{stat.value}</p>
    </div>
  ))}
</div>
```

---

**Última atualização:** 2026-06-06
**Versão:** 1.0
