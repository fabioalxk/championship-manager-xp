import type { Dir, MatchState, Player, TeamId, Vec2 } from './types'
import { AI, FIELD, MOVE } from './constants'
import { attackingGoalX, defendingGoalX, homePos } from './formation'
import {
  n20,
  passSpeed,
  passSpread,
  shootRangeOf,
  shotSpeed,
  shotSpread,
} from './ratings'
import { add, dirTo, dist, scale, vec } from './vector'

export type Action =
  | { type: 'dribble' }
  | { type: 'pass'; target: Vec2; speed: number; to: Player | null }
  | { type: 'shoot'; target: Vec2; speed: number }

const teammates = (s: MatchState, t: TeamId) =>
  s.players.filter((p) => p.team === t)
const opponents = (s: MatchState, t: TeamId) =>
  s.players.filter((p) => p.team !== t)

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v))

/** Jogador do time mais próximo de um ponto (ignora o GK por padrão). */
const nearestOfTeam = (
  s: MatchState,
  t: TeamId,
  point: Vec2,
  includeGK = false,
): Player => {
  const ok = (p: Player) => (includeGK || p.role !== 'GK') && p.stun <= 0
  const pool = teammates(s, t).filter(ok)
  const arr = pool.length ? pool : teammates(s, t).filter((p) => includeGK || p.role !== 'GK')
  return arr.reduce((b, p) => (dist(p.pos, point) < dist(b.pos, point) ? p : b))
}

const nearestOppDist = (s: MatchState, p: Player): number =>
  Math.min(...opponents(s, p.team).map((o) => dist(o.pos, p.pos)))

const sign = (dir: Dir): number => dir // +1 ataca para a direita

/**
 * Engajamento do jogador (0..1) conforme a proximidade da bola.
 * Perto da bola → totalmente engajado; longe → relaxa e se mexe pouco.
 * O posicionamento aumenta um pouco a antecipação.
 */
export const engagement = (s: MatchState, p: Player): number => {
  const d = dist(s.ball.pos, p.pos)
  const anticip = 0.85 + n20(p.attrs.positioning) * 0.3
  const e = (1.18 - d / MOVE.engageRange) * anticip
  return clamp(e, MOVE.engageFloor, 1)
}

/** Aplica ruído angular (rad) a uma direção e devolve um alvo distante. */
const withNoise = (from: Vec2, to: Vec2, spread: number): Vec2 => {
  const d = dirTo(from, to)
  const a = (Math.random() - 0.5) * 2 * spread
  const c = Math.cos(a)
  const s = Math.sin(a)
  return add(from, scale({ x: d.x * c - d.y * s, y: d.x * s + d.y * c }, 60))
}

/**
 * Para onde este jogador quer se mover.
 * - O mais próximo da bola persegue (antecipando o movimento).
 * - O resto mantém a formação deslizando como bloco; o GK guarda o gol.
 */
export const desiredTarget = (s: MatchState, p: Player): Vec2 => {
  const ball = s.ball
  const dir = s.attackDir[p.team]

  if (p.role === 'GK') {
    // fecha o ângulo: fica na reta bola→gol, saindo um pouco da linha
    const gx = defendingGoalX(dir)
    const goalC = vec(gx, FIELD.cy)
    const toGoal = dirTo(ball.pos, goalC)
    const comeOut = clamp(dist(ball.pos, goalC) * 0.16, 1.3, 6)
    const t = add(goalC, scale(toGoal, -comeOut))
    const xLo = gx === 0 ? 0.5 : FIELD.w - 8
    const xHi = gx === 0 ? 8 : FIELD.w - 0.5
    return vec(clamp(t.x, xLo, xHi), clamp(t.y, FIELD.cy - 9, FIELD.cy + 9))
  }

  // Bola parada: o adversário do cobrador recua e mantém a formação.
  if (s.deadball > 0 && s.restartTeam && p.team !== s.restartTeam) {
    return homePos(p, dir)
  }

  const chaser = nearestOfTeam(s, p.team, ball.pos)
  if (chaser.id === p.id) {
    return add(ball.pos, scale(ball.vel, 0.16))
  }

  // bloco desliza com a bola, mas cada um puxa conforme seu engajamento:
  // quem está longe da jogada quase não sai da posição.
  const home = homePos(p, dir)
  const pull = engagement(s, p)
  const fx = (ball.pos.x - FIELD.cx) * AI.blockShiftX * pull
  const fy = (ball.pos.y - FIELD.cy) * AI.blockShiftY * pull
  return vec(clamp(home.x + fx, 2, FIELD.w - 2), clamp(home.y + fy, 2, FIELD.h - 2))
}

/** Decisão de quem está com a bola: conduzir, passar ou chutar. */
export const decideAction = (s: MatchState, carrier: Player): Action => {
  const dir = s.attackDir[carrier.team]
  const goal = vec(attackingGoalX(dir), FIELD.cy)
  const dGoal = dist(carrier.pos, goal)
  const pressured = nearestOppDist(s, carrier) < AI.pressureDist
  const fwd = sign(dir)

  // Goleiro: distribui rápido e longe (tira a bola da área de perigo).
  if (carrier.role === 'GK') {
    const mate = teammates(s, carrier.team)
      .filter((m) => m.id !== carrier.id && m.role !== 'GK')
      .map((m) => ({ m, fwdness: (m.pos.x - carrier.pos.x) * fwd, free: nearestOppDist(s, m) }))
      .filter((c) => c.free > 4)
      .sort((a, b) => b.fwdness + b.free - (a.fwdness + a.free))[0]
    const target = mate
      ? withNoise(carrier.pos, mate.m.pos, passSpread(carrier.attrs) + 0.05)
      : vec(carrier.pos.x + fwd * 45, FIELD.cy)
    return { type: 'pass', target, speed: passSpeed(carrier.attrs) + 4, to: mate?.m ?? null }
  }

  // Dentro do alcance (escalado pela finalização) E em ângulo razoável → chuta.
  const central = Math.abs(carrier.pos.y - FIELD.cy) < AI.shootCone
  if (central && dGoal < shootRangeOf(carrier.attrs, AI.shootRange)) {
    return {
      type: 'shoot',
      target: withNoise(carrier.pos, goal, shotSpread(carrier.attrs)),
      speed: shotSpeed(carrier.attrs),
    }
  }

  // Melhor opção de passe — ponderada pela visão de quem conduz.
  const best = teammates(s, carrier.team)
    .filter((m) => m.id !== carrier.id && m.role !== 'GK')
    .map((m) => {
      const d = dist(carrier.pos, m.pos)
      const forward = (m.pos.x - carrier.pos.x) * fwd
      const free = nearestOppDist(s, m)
      const score = forward + free * 0.6 + n20(carrier.attrs.vision) * 4
      return { m, d, forward, score }
    })
    .filter((c) => c.d >= AI.passMin && c.d <= AI.passMax && c.forward > -4)
    .sort((a, b) => b.score - a.score)[0]

  if (pressured || s.holdTime > AI.maxHold) {
    if (best) {
      return {
        type: 'pass',
        target: withNoise(carrier.pos, best.m.pos, passSpread(carrier.attrs)),
        speed: passSpeed(carrier.attrs),
        to: best.m,
      }
    }
    // sem opção: chutão para frente
    return {
      type: 'pass',
      target: vec(carrier.pos.x + fwd * 30, carrier.pos.y),
      speed: passSpeed(carrier.attrs),
      to: null,
    }
  }

  return { type: 'dribble' }
}
