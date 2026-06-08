import { useState, useEffect, useRef } from 'react'

/**
 * 🔥 PASS HEATMAP — StatsBomb Analytics Style
 * Visualiza passes e domínio territorial de ambos times
 */
export default function PassHeatmap({ matchId, homeTeam, awayTeam }) {
  const [mode, setMode] = useState('passes') // 'passes' ou 'regions'
  const [intensity, setIntensity] = useState(0.5)

  // Dados simulados de passes (em produção viriam da API)
  const homePassData = generatePassData(homeTeam, 'home')
  const awayPassData = generatePassData(awayTeam, 'away')

  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <h2 className="section-title">Análise de Passes</h2>
          <p className="text-white/50 mt-2">Heatmap de domínio territorial e distribuição de passes</p>
        </div>

        {/* Controles */}
        <div className="flex flex-wrap gap-4 mb-8 items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setMode('passes')}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm border transition-all ${
                mode === 'passes'
                  ? 'text-white bg-brand-green border-brand-green/30'
                  : 'text-white/60 border-brand-border bg-brand-accent hover:text-white'
              }`}
            >
              ⚽ Passes
            </button>
            <button
              onClick={() => setMode('regions')}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm border transition-all ${
                mode === 'regions'
                  ? 'text-white bg-brand-green border-brand-green/30'
                  : 'text-white/60 border-brand-border bg-brand-accent hover:text-white'
              }`}
            >
              🎯 Regiões
            </button>
          </div>

          {/* Slider de intensidade */}
          <div className="flex items-center gap-3">
            <label className="text-xs text-white/50 font-bold">Intensidade:</label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={intensity}
              onChange={(e) => setIntensity(parseFloat(e.target.value))}
              className="w-32 h-2 bg-white/10 rounded-full appearance-none cursor-pointer"
            />
            <span className="text-xs text-white/70 w-8 text-right">{Math.round(intensity * 100)}%</span>
          </div>
        </div>

        {/* Campos lado a lado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Time da Casa */}
          <div className="space-y-3">
            <h3 className="font-bold text-white">{homeTeam.name}</h3>
            <HeatmapField
              teamName={homeTeam.name}
              passData={homePassData}
              mode={mode}
              intensity={intensity}
              side="home"
            />
            <StatsBar passes={homePassData.total} accuracy={85} />
          </div>

          {/* Time Visitante */}
          <div className="space-y-3">
            <h3 className="font-bold text-white text-right">{awayTeam.name}</h3>
            <HeatmapField
              teamName={awayTeam.name}
              passData={awayPassData}
              mode={mode}
              intensity={intensity}
              side="away"
            />
            <StatsBar passes={awayPassData.total} accuracy={78} />
          </div>
        </div>

        {/* Legenda */}
        <div className="mt-8 card p-6">
          <div className="flex flex-wrap gap-6 items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ background: 'rgb(0, 0, 255)' }} />
              <span className="text-xs text-white/60">Poucos passes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ background: 'rgb(0, 255, 255)' }} />
              <span className="text-xs text-white/60">Moderado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ background: 'rgb(0, 255, 0)' }} />
              <span className="text-xs text-white/60">Bastante</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ background: 'rgb(255, 255, 0)' }} />
              <span className="text-xs text-white/60">Muito</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ background: 'rgb(255, 0, 0)' }} />
              <span className="text-xs text-white/60">Domínio máximo</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

// ── Campo com Heatmap ──────────────────────────────────────────────────────
function HeatmapField({ teamName, passData, mode, intensity, side }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height

    // Desenha o campo
    drawField(ctx, width, height, side)

    // Desenha o heatmap
    drawHeatmap(ctx, width, height, passData, mode, intensity, side)
  }, [passData, mode, intensity, side])

  return (
    <div className="rounded-xl overflow-hidden border border-white/10 bg-white/2">
      <canvas
        ref={canvasRef}
        width={300}
        height={450}
        className="w-full h-auto"
      />
    </div>
  )
}

// ── Desenha o campo de futebol ────────────────────────────────────────────
function drawField(ctx, width, height, side) {
  // Fundo verde
  ctx.fillStyle = '#1a5a2a'
  ctx.fillRect(0, 0, width, height)

  // Linha branca
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'
  ctx.lineWidth = 2

  // Meio de campo
  ctx.beginPath()
  ctx.moveTo(width / 2, 0)
  ctx.lineTo(width / 2, height)
  ctx.stroke()

  // Círculo central
  ctx.beginPath()
  ctx.arc(width / 2, height / 2, 30, 0, Math.PI * 2)
  ctx.stroke()

  // Ponto do meio
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.beginPath()
  ctx.arc(width / 2, height / 2, 3, 0, Math.PI * 2)
  ctx.fill()

  // Áreas (grandes)
  ctx.strokeRect(10, height / 2 - 60, 60, 120)
  ctx.strokeRect(width - 70, height / 2 - 60, 60, 120)

  // Áreas (pequenas)
  ctx.strokeRect(10, height / 2 - 35, 40, 70)
  ctx.strokeRect(width - 50, height / 2 - 35, 40, 70)

  // Cantos arredondados das áreas
  drawRoundedCorner(ctx, width - 70, 10, 10, 10, 15, 'tl')
  drawRoundedCorner(ctx, width - 70, height - 10, 10, 10, 15, 'bl')
  drawRoundedCorner(ctx, 70, 10, 10, 10, 15, 'tr')
  drawRoundedCorner(ctx, 70, height - 10, 10, 10, 15, 'br')
}

// ── Desenha o heatmap ───────────────────────────────────────────────────
function drawHeatmap(ctx, width, height, passData, mode, intensity, side) {
  const imageData = ctx.createImageData(width, height)
  const data = imageData.data

  for (let i = 0; i < passData.points.length; i++) {
    const p = passData.points[i]

    // Cria um gradient radial ao redor do ponto
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dist = Math.sqrt((x - p.x) ** 2 + (y - p.y) ** 2)
        const radius = p.weight * 40 * intensity

        // Falloff gaussiano
        const strength = Math.exp(-((dist / (radius + 1)) ** 2)) * p.weight * intensity

        const idx = (y * width + x) * 4

        // Acumula valores
        if (data[idx + 3] === 0) {
          // Primeiro valor
          const [r, g, b] = getColor(strength)
          data[idx] = r
          data[idx + 1] = g
          data[idx + 2] = b
          data[idx + 3] = Math.min(255, strength * 200)
        } else {
          // Blenda com valor existente
          const existing = data[idx + 3] / 255
          const newStrength = strength + existing
          const [r, g, b] = getColor(Math.min(1, newStrength))

          data[idx] = r
          data[idx + 1] = g
          data[idx + 2] = b
          data[idx + 3] = Math.min(255, newStrength * 200)
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0)

  // Desenha o campo novamente por cima (semi-transparente)
  ctx.fillStyle = 'rgba(26, 90, 42, 0.3)'
  ctx.fillRect(0, 0, width, height)
}

// ── Mapeia força para cor (azul → vermelho) ────────────────────────────────
function getColor(strength) {
  // Blue → Cyan → Green → Yellow → Red
  let r, g, b

  if (strength < 0.25) {
    // Blue to Cyan
    const t = strength / 0.25
    r = 0
    g = Math.round(255 * t)
    b = 255
  } else if (strength < 0.5) {
    // Cyan to Green
    const t = (strength - 0.25) / 0.25
    r = 0
    g = 255
    b = Math.round(255 * (1 - t))
  } else if (strength < 0.75) {
    // Green to Yellow
    const t = (strength - 0.5) / 0.25
    r = Math.round(255 * t)
    g = 255
    b = 0
  } else {
    // Yellow to Red
    const t = (strength - 0.75) / 0.25
    r = 255
    g = Math.round(255 * (1 - t))
    b = 0
  }

  return [r, g, b]
}

// ── Desenha canto arredondado ──────────────────────────────────────────────
function drawRoundedCorner(ctx, x, y, w, h, r, corner) {
  ctx.beginPath()
  if (corner === 'tl') {
    ctx.arc(x + r, y + r, r, Math.PI, 1.5 * Math.PI)
  } else if (corner === 'tr') {
    ctx.arc(x + w - r, y + r, r, 1.5 * Math.PI, 2 * Math.PI)
  } else if (corner === 'br') {
    ctx.arc(x + w - r, y + h - r, r, 0, 0.5 * Math.PI)
  } else if (corner === 'bl') {
    ctx.arc(x + r, y + h - r, r, 0.5 * Math.PI, Math.PI)
  }
  ctx.stroke()
}

// ── Gera dados simulados de passes ─────────────────────────────────────────
function generatePassData(team, side) {
  const points = []
  let total = 0

  // Simula distribuição de passes (mais no meio de campo para o seu lado)
  const passZones = side === 'home'
    ? [
        { x: 75, y: 225, count: 45, weight: 0.8 },   // Zona defensiva
        { x: 150, y: 225, count: 80, weight: 1.0 },  // Meio de campo
        { x: 220, y: 225, count: 50, weight: 0.7 },  // Zona ofensiva
      ]
    : [
        { x: 225, y: 225, count: 50, weight: 0.7 },  // Zona defensiva
        { x: 150, y: 225, count: 80, weight: 1.0 },  // Meio de campo
        { x: 75, y: 225, count: 45, weight: 0.8 },   // Zona ofensiva
      ]

  passZones.forEach(zone => {
    for (let i = 0; i < zone.count; i++) {
      // Distribuição gaussiana ao redor da zona
      const angle = Math.random() * Math.PI * 2
      const distance = Math.random() ** 0.5 * 40
      const x = zone.x + Math.cos(angle) * distance
      const y = zone.y + Math.sin(angle) * distance

      points.push({
        x: Math.max(10, Math.min(290, x)),
        y: Math.max(10, Math.min(440, y)),
        weight: zone.weight,
      })

      total += zone.weight
    }
  })

  return { points, total: Math.round(total) }
}

// ── Barra de estatísticas ──────────────────────────────────────────────────
function StatsBar({ passes, accuracy }) {
  return (
    <div className="bg-brand-accent rounded-xl p-3 border border-white/10">
      <div className="flex items-center justify-between text-xs">
        <div>
          <p className="text-white/50">Passes</p>
          <p className="text-lg font-black text-white">{passes}</p>
        </div>
        <div className="text-right">
          <p className="text-white/50">Acurácia</p>
          <p className="text-lg font-black text-brand-green">{accuracy}%</p>
        </div>
      </div>
    </div>
  )
}
