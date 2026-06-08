# 📱 Mobile Responsiveness Guide

## Princípios

1. **Mobile First**: Sempre comece pelo mobile, depois use `sm:`, `md:`, `lg:`
2. **Touch Friendly**: Targets mínimo 44x44px (accessible)
3. **Safe Area**: Use `env(safe-area-inset-*)` para notches
4. **Viewport**: `<meta name="viewport" content="width=device-width, initial-scale=1">`

---

## Breakpoints Tailwind

```
Mobile:      < 640px   (sm:)
Tablet:      640px+    (md:)
Desktop:     1024px+   (lg:)
Large:       1280px+   (xl:)
```

---

## Checklist Mobile

### Header
- [ ] Logo + Menu reduzido em mobile
- [ ] Busca: Hidden até `md:` (tablet+)
- [ ] Icons ao invés de texto em mobile
- [ ] Safe area padding para notch

### Navigation
- [ ] Bottom navigation bar (57px) em mobile
- [ ] League picker: Scrollable horizontal
- [ ] Sticky top 0 com z-50

### Cards & Layout
- [ ] Grid: 1 coluna mobile, 2 tablet, 3+ desktop
- [ ] Padding: `p-3` mobile, `p-4` tablet, `p-6` desktop
- [ ] Margin: Consistente 4px gaps em mobile

### Modals & Dialogs
- [ ] Full screen em mobile (não centered)
- [ ] `h-full` ou `h-[90vh]` mobile
- [ ] Bottom sheet style (opcionalmente)

### Touch & Interaction
- [ ] Botões: Mín 44x44px
- [ ] Espaçamento entre clickables: 8px
- [ ] No hover effects em touch (use `group-hover:`)
- [ ] Feedback visual claro

### Images & Media
- [ ] Responsive: `w-full` ou `max-w-full`
- [ ] Aspect ratio: Use `aspect-*` classes
- [ ] Lazy load se necessário

### Text & Typography
- [ ] Base: `text-sm` mobile, `text-base` desktop
- [ ] Heading: `text-lg` mobile, `text-2xl` desktop
- [ ] Line length: Max 65 chars (problema em desktop grande)

---

## Exemplos Implementados

### Responsive Grid Card
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

### Bottom Nav (Mobile Only)
```jsx
<div className="md:hidden fixed bottom-0 w-full h-nav bg-brand-dark border-t">
  {/* Navigation tabs */}
</div>

<div className="pb-nav md:pb-0">
  {/* Main content with bottom padding on mobile */}
</div>
```

### Responsive Typography
```jsx
<h1 className="text-3xl sm:text-4xl lg:text-5xl font-black">
  Heading
</h1>
```

### Touch-Friendly Button
```jsx
<button className="px-4 py-3 sm:px-6 sm:py-2 min-h-[44px]">
  Action
</button>
```

### Safe Area Padding
```jsx
<header style={{ paddingTop: 'env(safe-area-inset-top)' }}>
  {/* Content */}
</header>

<footer style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
  {/* Content */}
</footer>
```

---

## Viewport Meta Tags

```html
<meta name="viewport" 
      content="width=device-width, initial-scale=1, viewport-fit=cover">
```

---

## Testing Devices

Testar com Chrome DevTools:
- iPhone 12 (390x844)
- iPhone 12 Pro Max (428x926)
- iPad Air (820x1180)
- Pixel 5 (393x851)
- Galaxy S20 (360x800)

---

## Performance Mobile

1. **Images**: Use `srcset` ou WebP
2. **CSS**: Minify e tree-shake
3. **JS**: Code-split e lazy load
4. **Fonts**: System fonts ou subset custom
5. **Animations**: Reduced motion preference

```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; }
}
```

---

## Accessibility Mobile

- [ ] Min font size 16px (avoid zoom on focus)
- [ ] Sufficient color contrast (7:1)
- [ ] Touch targets 44x44px minimum
- [ ] Semantic HTML
- [ ] ARIA labels where needed

---

## Common Gotchas

❌ Don't:
- Fixed width layouts
- Hover-only interactions
- Small tap targets (<40px)
- Auto-playing media
- Viewport zoom disabled

✅ Do:
- Flexible layouts with max-width
- Touch + hover interactions
- Generous tap targets (44x44+)
- User-controlled media
- Allow zoom (never `user-scalable=no`)

---

## Responsive Pattern Template

```jsx
function ResponsiveComponent() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {/* Mobile: 1 col, 12px gap */}
      {/* Tablet: 2 cols, 16px gap */}
      {/* Desktop: 3 cols, 16px gap */}
    </div>
  )
}
```

---

**Last Updated**: 2026-06-06
