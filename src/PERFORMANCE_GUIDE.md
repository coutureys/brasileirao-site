# ⚡ Performance & Lighthouse Guide

## 🎯 Core Web Vitals

### LCP (Largest Contentful Paint)
- **Target**: < 2.5s
- **Otimizações**:
  - Lazy load images com `loading="lazy"`
  - Preload críticas fonts
  - Minimize CSS crítico
  - Optimize server response time (TTFB < 600ms)

### FID (First Input Delay)
- **Target**: < 100ms
- **Otimizações**:
  - Code splitting com React.lazy()
  - Reduzir Main Thread work
  - Usar Web Workers para heavy computation
  - Defer non-critical JavaScript

### CLS (Cumulative Layout Shift)
- **Target**: < 0.1
- **Otimizações**:
  - Reservar espaço para imagens (aspect ratio)
  - Evitar inserir conteúdo above folding
  - Use `transform` em vez de `top/left`
  - Animar com `will-change` CSS

---

## 📊 Performance Checklist

### Bundle Size
- [ ] Total gzip < 200KB (ideal < 100KB)
- [ ] Main chunk < 150KB
- [ ] Vendor chunks separados
- [ ] Analyze com `npm run build -- --analyze`

### Images
- [ ] Use WebP com fallback
- [ ] Responsive images com `srcset`
- [ ] Lazy load com `loading="lazy"`
- [ ] Compress com TinyPNG/ImageOptim
- [ ] Max file size: 50KB para hero, 30KB para cards

### CSS
- [ ] Minify automático (Vite faz)
- [ ] Remover CSS não usado (tree-shake)
- [ ] Inline crítico CSS (< 14KB)
- [ ] Defer non-critical CSS

### JavaScript
- [ ] Code splitting por rota
- [ ] Tree-shake imports não usados
- [ ] Remove console.log em produção
- [ ] Minify & uglify automático

### Fonts
- [ ] Subset custom fonts (latin only)
- [ ] Font-display: swap
- [ ] Preconnect via link preconnect
- [ ] Load via CDN (Google Fonts)

### Server
- [ ] Gzip compression ✅
- [ ] Brotli compression (opcional)
- [ ] Cache headers: 1 year para assets, 1 day para HTML
- [ ] CDN para assets (Vercel automático)

---

## 🔧 Implementações

### Lazy Loading
```jsx
// Lazy load components
const Analytics = lazy(() => import('./pages/AnalyticsPage'))

<Suspense fallback={<LoadingSkeleton />}>
  <Analytics />
</Suspense>
```

### Image Optimization
```jsx
// Responsive images
<img
  src="image.webp"
  srcSet="image-320w.webp 320w, image-640w.webp 640w"
  sizes="(max-width: 640px) 320px, 640px"
  loading="lazy"
  alt="Description"
/>
```

### Font Loading
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">
```

### Service Worker Caching
```javascript
// Cache primeiro para assets
if (request.destination === 'image') {
  return cacheFirst(request)
}

// Network primeiro para API
if (url.pathname.startsWith('/api/')) {
  return networkFirst(request)
}
```

---

## 📈 Métricas Esperadas

| Métrica | Mobitech | Desktop |
|---------|----------|---------|
| **LCP** | < 3.5s | < 2.5s |
| **FID** | < 150ms | < 100ms |
| **CLS** | < 0.25 | < 0.1 |
| **FCP** | < 1.8s | < 1.2s |
| **TTFB** | < 800ms | < 600ms |
| **Score** | 70+ | 90+ |

---

## 🧪 Testing Tools

### Lighthouse
```bash
# Chrome DevTools → Lighthouse
# Target: 90+ score
```

### PageSpeed Insights
- https://pagespeed.web.dev/
- Mede Core Web Vitals reais

### WebPageTest
- https://www.webpagetest.org/
- Testa de múltiplas regiões

### Bundle Analysis
```bash
# Analisa chunks
npm run build -- --analyze
```

---

## 🚀 Deployment Checklist

- [ ] Gzip compression ativado
- [ ] Cache headers configurados
- [ ] Service Worker ativo
- [ ] Sitemap.xml presente
- [ ] robots.txt otimizado
- [ ] Open Graph tags OK
- [ ] Schema.json válido
- [ ] PWA installable
- [ ] Mobile viewport correto

---

## 💡 Performance Tips

1. **Priorize Critical Path**: LCP, FID, CLS
2. **Optimize Images**: Maior impacto no LCP
3. **Code Splitting**: Reduz JS inicial
4. **Service Worker**: Cache estratégias
5. **Resource Hints**: preload, prefetch, preconnect
6. **Monitor Continuously**: Use Web Vitals API

---

## 📚 Recursos

- [Web.dev Performance](https://web.dev/performance)
- [Core Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Bundle Analysis](https://bundlejs.com/)

---

**Last Updated**: 2026-06-06
