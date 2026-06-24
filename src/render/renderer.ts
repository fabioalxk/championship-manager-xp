import type { MatchState, Player } from '../sim/types'
import { FIELD, GOAL, PHYS } from '../sim/constants'
import { TEAMS } from '../sim/teams'

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
): void => {
  const px = (m: number) => (m + PAD) * scale
  const size = canvasSize(scale)

  ctx.fillStyle = COLORS.surround
  ctx.fillRect(0, 0, size.width, size.height)

  drawPitch(ctx, px, scale)
  for (const p of state.players)
    drawPlayer(ctx, p, px, scale, p.id === state.controllerId)
  drawBall(ctx, state, px, scale)
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

const drawPlayer = (
  ctx: CanvasRenderingContext2D,
  p: Player,
  px: Px,
  scale: number,
  isController: boolean,
) => {
  const r = PHYS.playerRadius * 1.55 * scale
  const cx = px(p.pos.x)
  const cy = px(p.pos.y)
  const info = TEAMS[p.team]
  const down = p.stun > 0

  if (isController && !down) {
    ctx.beginPath()
    ctx.arc(cx, cy, r + scale * 0.4, 0, Math.PI * 2)
    ctx.fillStyle = COLORS.controller
    ctx.fill()
  }

  ctx.save()
  if (down) ctx.globalAlpha = 0.55
  ctx.beginPath()
  if (down) {
    // caído: desenha deitado (elipse achatada)
    ctx.ellipse(cx, cy, r * 1.35, r * 0.6, 0, 0, Math.PI * 2)
  } else {
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
  }
  ctx.fillStyle = info.shirt
  ctx.fill()
  ctx.lineWidth = Math.max(1, scale * 0.1)
  ctx.strokeStyle = p.yellow ? '#facc15' : 'rgba(0,0,0,0.45)'
  ctx.stroke()

  // número
  ctx.fillStyle = info.text
  ctx.font = `bold ${Math.round(r * 1.05)}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(String(p.number), cx, cy)
  ctx.restore()

  // marca de "caído"
  if (down) {
    ctx.fillStyle = '#ef4444'
    ctx.font = `bold ${Math.round(scale * 1.6)}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('✚', cx, cy - r - scale * 0.9)
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
) => {
  const r = PHYS.ballRadius * 2 * scale
  const cx = px(state.ball.pos.x)
  const cy = px(state.ball.pos.y)
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fillStyle = COLORS.ball
  ctx.fill()
  ctx.lineWidth = Math.max(1, scale * 0.07)
  ctx.strokeStyle = COLORS.ballEdge
  ctx.stroke()
}
