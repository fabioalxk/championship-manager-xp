import type { MatchState, Player } from '../sim/types'
import { FIELD, GOAL, PHYS } from '../sim/constants'
import { TEAMS } from '../sim/teams'
import { len, lerpV, norm, perp } from '../sim/vector'

/** margem (m) ao redor do campo, para desenhar redes e arquibancada */
export const PAD = 4

export const canvasSize = (scale: number) => ({
  width: Math.round((FIELD.w + PAD * 2) * scale),
  height: Math.round((FIELD.h + PAD * 2) * scale),
})

const COLORS = {
  grassDark: '#2f8f3e',
  grassLight: '#37a448',
  surround: '#1f6b2b',
  line: 'rgba(255,255,255,0.9)',
  ball: '#f8fafc',
  ballEdge: '#0f172a',
  controller: '#fde047',
  net: 'rgba(255,255,255,0.5)',
  post: '#f8fafc',
}

export const drawMatch = (
  ctx: CanvasRenderingContext2D,
  state: MatchState,
  scale: number,
  /** fração do passo já decorrida (0..1) — interpola prev→pos no render */
  alpha = 1,
): void => {
  const px = (m: number) => (m + PAD) * scale
  const size = canvasSize(scale)

  ctx.fillStyle = COLORS.surround
  ctx.fillRect(0, 0, size.width, size.height)

  drawPitch(ctx, px, scale)
  for (const p of state.players) drawPlayer(ctx, p, px, scale, alpha)
  drawBall(ctx, state, px, scale, alpha)
  if (state.celebration) drawCelebration(ctx, state, px, scale)
}

/**
 * Pista visual em CAMPO de que saiu gol: a rede do gol que sofreu pulsa na cor
 * de quem marcou e um anel destaca a bola parada dentro da rede — fica claro
 * ONDE e de QUEM foi o gol antes mesmo de ler o banner.
 */
const drawCelebration = (
  ctx: CanvasRenderingContext2D,
  state: MatchState,
  px: Px,
  scale: number,
) => {
  const c = state.celebration!
  const accent = TEAMS[c.team].shirt
  const pulse = 0.5 + 0.5 * Math.sin(c.t * 9)

  // realça a rede do gol sofrido
  const gy0 = px(GOAL.top)
  const gy1 = px(GOAL.bottom)
  const lineX = px(c.goalX)
  const backX = c.goalX === 0 ? px(-GOAL.depth) : px(FIELD.w + GOAL.depth)
  ctx.save()
  ctx.globalAlpha = 0.2 + 0.35 * pulse
  ctx.fillStyle = accent
  ctx.fillRect(Math.min(lineX, backX), gy0, Math.abs(backX - lineX), gy1 - gy0)
  ctx.restore()

  // anel pulsante em torno da bola na rede
  const cx = px(state.ball.pos.x)
  const cy = px(state.ball.pos.y)
  ctx.save()
  ctx.globalAlpha = 0.85
  ctx.strokeStyle = accent
  ctx.lineWidth = Math.max(2, scale * 0.28)
  ctx.beginPath()
  ctx.arc(cx, cy, scale * (1.1 + pulse * 1.3), 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()
}

type Px = (m: number) => number

const drawPitch = (ctx: CanvasRenderingContext2D, px: Px, scale: number) => {
  const W = px(FIELD.w)
  const H = px(FIELD.h)
  const x0 = px(0)
  const y0 = px(0)

  // listras do gramado
  const stripes = 14
  const sw = (W - x0) / stripes
  for (let i = 0; i < stripes; i++) {
    ctx.fillStyle = i % 2 === 0 ? COLORS.grassDark : COLORS.grassLight
    ctx.fillRect(x0 + i * sw, y0, sw + 1, H - y0)
  }

  ctx.strokeStyle = COLORS.line
  ctx.lineWidth = Math.max(1.5, scale * 0.14)

  // linhas externas
  ctx.strokeRect(x0, y0, W - x0, H - y0)

  // meio-campo + círculo central
  ctx.beginPath()
  ctx.moveTo(px(FIELD.cx), y0)
  ctx.lineTo(px(FIELD.cx), H)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(px(FIELD.cx), px(FIELD.cy), 9.15 * scale, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(px(FIELD.cx), px(FIELD.cy), scale * 0.35, 0, Math.PI * 2)
  ctx.fillStyle = COLORS.line
  ctx.fill()

  drawGoalEnd(ctx, px, scale, true)
  drawGoalEnd(ctx, px, scale, false)
}

const drawGoalEnd = (
  ctx: CanvasRenderingContext2D,
  px: Px,
  scale: number,
  left: boolean,
) => {
  // grande área (16.5 x 40.3) e pequena área (5.5 x 18.3)
  const box = (depth: number, width: number) => {
    const w = depth * scale
    const h = width * scale
    const y = px(FIELD.cy) - h / 2
    const x = left ? px(0) : px(FIELD.w) - w
    ctx.strokeRect(x, y, w, h)
  }
  box(16.5, 40.3)
  box(5.5, 18.3)

  // marca do pênalti
  ctx.beginPath()
  ctx.arc(px(left ? 11 : FIELD.w - 11), px(FIELD.cy), scale * 0.3, 0, Math.PI * 2)
  ctx.fillStyle = COLORS.line
  ctx.fill()

  // gol: rede + traves
  const gy0 = px(GOAL.top)
  const gy1 = px(GOAL.bottom)
  const lineX = px(left ? 0 : FIELD.w)
  const backX = left ? px(-GOAL.depth) : px(FIELD.w + GOAL.depth)

  // rede
  ctx.fillStyle = 'rgba(255,255,255,0.10)'
  ctx.fillRect(Math.min(lineX, backX), gy0, Math.abs(backX - lineX), gy1 - gy0)
  ctx.strokeStyle = COLORS.net
  ctx.lineWidth = 1
  const cells = 5
  for (let i = 1; i < cells; i++) {
    const yy = gy0 + ((gy1 - gy0) * i) / cells
    ctx.beginPath()
    ctx.moveTo(lineX, yy)
    ctx.lineTo(backX, yy)
    ctx.stroke()
  }
  for (let i = 1; i < 3; i++) {
    const xx = lineX + ((backX - lineX) * i) / 3
    ctx.beginPath()
    ctx.moveTo(xx, gy0)
    ctx.lineTo(xx, gy1)
    ctx.stroke()
  }

  // traves (postes) + travessão lateral
  ctx.strokeStyle = COLORS.post
  ctx.lineWidth = Math.max(2.5, scale * 0.3)
  ctx.beginPath()
  ctx.moveTo(lineX, gy0)
  ctx.lineTo(backX, gy0)
  ctx.moveTo(lineX, gy1)
  ctx.lineTo(backX, gy1)
  ctx.moveTo(backX, gy0)
  ctx.lineTo(backX, gy1)
  ctx.stroke()
}

/** Sombra elíptica simples sob um corpo (dá profundidade e ancora o movimento). */
const drawShadow = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  off: number,
  a: number,
) => {
  ctx.save()
  ctx.globalAlpha = a
  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.ellipse(cx + off, cy + off, rx, ry, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

const drawPlayer = (
  ctx: CanvasRenderingContext2D,
  p: Player,
  px: Px,
  scale: number,
  alpha: number,
) => {
  const r = PHYS.playerRadius * 1.55 * scale
  // posição interpolada entre o passo anterior e o atual → movimento suave
  const ip = lerpV(p.prevPos, p.pos, alpha)
  const cx = px(ip.x)
  const cy = px(ip.y)
  const info = TEAMS[p.team]
  const down = p.downAmt // 0..1 (transição suave em pé ↔ caído)
  const speed = len(p.vel)

  drawShadow(ctx, cx, cy, r * 0.95, r * 0.55, scale * 0.4, 0.18)

  // trilha de velocidade: reforça a percepção de movimento e mascara o stepping
  if (speed > 1.5 && down < 0.5) {
    const d = norm(p.vel)
    const trail = Math.min(speed * 0.12, 2.2) * scale
    ctx.save()
    ctx.globalAlpha = 0.12 * (1 - down)
    ctx.strokeStyle = info.shirt
    ctx.lineWidth = r * 1.2
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx - d.x * trail, cy - d.y * trail)
    ctx.stroke()
    ctx.restore()
  }

  // realce do dono da bola — surge/some com fade (ctrlAmt), sem piscar
  if (p.ctrlAmt > 0.01) {
    ctx.save()
    ctx.globalAlpha = p.ctrlAmt * (1 - down)
    ctx.beginPath()
    ctx.arc(cx, cy, r + scale * 0.4, 0, Math.PI * 2)
    ctx.fillStyle = COLORS.controller
    ctx.fill()
    ctx.restore()
  }

  ctx.save()
  // corpo: interpola círculo (em pé) → elipse deitada (caído)
  ctx.globalAlpha = 1 - down * 0.45
  const rx = r * (1 + 0.35 * down)
  const ry = r * (1 - 0.4 * down)
  ctx.beginPath()
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
  ctx.fillStyle = info.shirt
  ctx.fill()
  ctx.lineWidth = Math.max(1, scale * 0.1)
  ctx.strokeStyle = p.yellow ? '#facc15' : 'rgba(0,0,0,0.45)'
  ctx.stroke()

  // seta de orientação (heading): para onde o corpo está virado, só em pé
  if (speed > 0.6 && down < 0.4) {
    const d = norm(p.vel)
    const pl = perp(d)
    const tip = { x: cx + d.x * r * 1.4, y: cy + d.y * r * 1.4 }
    const base = { x: cx + d.x * r * 0.75, y: cy + d.y * r * 0.75 }
    ctx.globalAlpha = (1 - down) * 0.85
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.beginPath()
    ctx.moveTo(tip.x, tip.y)
    ctx.lineTo(base.x + pl.x * r * 0.45, base.y + pl.y * r * 0.45)
    ctx.lineTo(base.x - pl.x * r * 0.45, base.y - pl.y * r * 0.45)
    ctx.closePath()
    ctx.fill()
  }

  // número
  ctx.globalAlpha = 1 - down * 0.4
  ctx.fillStyle = info.text
  ctx.font = `bold ${Math.round(r * 1.05)}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(String(p.number), cx, cy)
  ctx.restore()

  // marca de "caído" — aparece junto com a transição
  if (down > 0.3) {
    ctx.save()
    ctx.globalAlpha = down
    ctx.fillStyle = '#ef4444'
    ctx.font = `bold ${Math.round(scale * 1.6)}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('✚', cx, cy - r - scale * 0.9)
    ctx.restore()
  }

  // nome abaixo do botão
  ctx.font = `${Math.round(scale * 1.15)}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#0f172a'
  ctx.fillText(p.name, cx + 0.6, cy + r + scale * 1.7 + 0.6)
  ctx.fillStyle = '#fff'
  ctx.fillText(p.name, cx, cy + r + scale * 1.7)
}

const drawBall = (
  ctx: CanvasRenderingContext2D,
  state: MatchState,
  px: Px,
  scale: number,
  alpha: number,
) => {
  const b = state.ball
  const r = PHYS.ballRadius * 2 * scale
  const ip = lerpV(b.prevPos, b.pos, alpha)
  const cx = px(ip.x)
  const cy = px(ip.y)

  drawShadow(ctx, cx, cy, r * 0.9, r * 0.55, scale * 0.3, 0.2)

  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fillStyle = COLORS.ball
  ctx.fill()
  ctx.lineWidth = Math.max(1, scale * 0.07)
  ctx.strokeStyle = COLORS.ballEdge
  ctx.stroke()

  // giro visual: dois pontos que rodam com `roll` — vende a sensação de rolagem
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(b.roll)
  ctx.fillStyle = COLORS.ballEdge
  for (const sgn of [1, -1]) {
    ctx.beginPath()
    ctx.arc(sgn * r * 0.45, 0, r * 0.18, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}
