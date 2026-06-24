import type { Dir, MatchState, Player, TeamId, Vec2 } from './types'
import { AI, FIELD, GK, MOVE, PHYS } from './constants'
import { attackingGoalX, defendingGoalX, homePos } from './formation'
import {
  chaseLead,
  gkDistroSpread,
  gkKickSpeed,
  gkThrowSpeed,
  holdMax,
  nrm,
  offBallAdvance,
  passSpeed,
  passSpread,
  shapeMul,
  shootRangeOf,
  shotSpeed,
  shotSpread,
} from './ratings'
import { add, dirTo, dist, scale, vec } from './vector'
import { rand } from './rng'

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

/**
 * Onde a bola estará em `t` segundos, já considerando o amortecimento de rolagem.
 * Distância percorrida por uma bola com decaimento exponencial:
 *   ∫ v0·damp^τ dτ = v0·(damp^t − 1)/ln(damp).
 * Serve para o interceptador correr para ONDE a bola vai, não para onde está.
 */
const predictBall = (s: MatchState, t: number): Vec2 => {
  const d = PHYS.ballDamping
  const ln = Math.log(d)
  const f = Math.abs(ln) > 1e-6 ? (Math.pow(d, t) - 1) / ln : t
  return add(s.ball.pos, scale(s.ball.vel, f))
}

/** Tempo aproximado (s) de um passe percorrer `d` metros (perde ~15% no caminho). */
const passTravelTime = (d: number, speed: number): number => d / (speed * 0.85)

/**
 * Ponto de recepção LIDERADO: mira onde o companheiro estará quando a bola
 * chegar (posição + velocidade × tempo de voo), para receber em movimento.
 */
const passLeadPoint = (carrier: Player, m: Player, speed: number): Vec2 => {
  // limita a antecipação: o recebedor não segue em linha reta por muito tempo
  const t = clamp(passTravelTime(dist(carrier.pos, m.pos), speed), 0, 0.8)
  return add(m.pos, scale(m.vel, t))
}

/**
 * Folga (m) da linha de passe `from→to`: menor distância de um adversário ao
 * segmento. Lane curta = passe que seria interceptado.
 */
const laneClearance = (
  s: MatchState,
  from: Vec2,
  to: Vec2,
  t: TeamId,
): number => {
  const seg = { x: to.x - from.x, y: to.y - from.y }
  const segLen2 = seg.x * seg.x + seg.y * seg.y
  let min = Infinity
  for (const o of opponents(s, t)) {
    if (o.role === 'GK') continue
    const w = { x: o.pos.x - from.x, y: o.pos.y - from.y }
    const proj =
      segLen2 > 1e-6 ? clamp((w.x * seg.x + w.y * seg.y) / segLen2, 0, 1) : 0
    const closest = add(from, scale(seg, proj))
    const d = dist(o.pos, closest)
    if (d < min) min = d
  }
  return min
}

const teamGk = (s: MatchState, t: TeamId): Player | undefined =>
  s.players.find((p) => p.team === t && p.role === 'GK')

const sign = (dir: Dir): number => dir // +1 ataca para a direita

/**
 * Engajamento do jogador (0..1) conforme a proximidade da bola.
 * Perto da bola → totalmente engajado; longe → relaxa e se mexe pouco.
 * O posicionamento aumenta a antecipação; sem a posse, o empenho (workRate)
 * define a intensidade da pressão/marcação.
 */
export const engagement = (s: MatchState, p: Player): number => {
  const d = dist(s.ball.pos, p.pos)
  const anticip = 0.85 + nrm(p.attrs.positioning) * 0.3
  let e = (1.18 - d / MOVE.engageRange) * anticip
  if (s.possession && s.possession !== p.team)
    e *= 0.75 + nrm(p.attrs.workRate) * 0.45
  return clamp(e, MOVE.engageFloor, 1)
}

/** Aplica ruído angular (rad) a uma direção e devolve um alvo distante. */
const withNoise = (
  st: MatchState,
  from: Vec2,
  to: Vec2,
  spread: number,
): Vec2 => {
  const d = dirTo(from, to)
  const a = (rand(st) - 0.5) * 2 * spread
  const c = Math.cos(a)
  const s = Math.sin(a)
  return add(from, scale({ x: d.x * c - d.y * s, y: d.x * s + d.y * c }, 60))
}

/** Quanto cada função avança em profundidade no ataque (0..1). */
const ROLE_ADVANCE: Record<Player['role'], number> = {
  GK: 0,
  DEF: 0.2,
  MID: 0.55,
  FWD: 0.9,
}

/** Tendência posicional individual estável (sem tremer) — variação humana. */
const humanBias = (p: Player): Vec2 => {
  const a = ((p.id * 73) % 7) - 3 // -3..3
  const b = ((p.id * 31) % 5) - 2 // -2..2
  return vec((a / 3) * AI.humanJitter, (b / 2) * AI.humanJitter)
}

/** Forwardness (X projetado no sentido de ataque) do último defensor adversário. */
const offsideLineFwd = (s: MatchState, attackTeam: TeamId, fwd: number): number =>
  Math.max(
    ...opponents(s, attackTeam)
      .filter((o) => o.role !== 'GK')
      .map((o) => o.pos.x * fwd),
  )

/** Alvo no ATAQUE: sobe em bloco, ganha profundidade e corre nas costas da defesa. */
const attackTarget = (s: MatchState, p: Player, fwd: number, home: Vec2): Vec2 => {
  const ball = s.ball
  const pull = engagement(s, p)
  const ballFwd = clamp(((ball.pos.x - FIELD.cx) * fwd) / (FIELD.w / 2), 0, 1)
  // profundidade da corrida escalada pela movimentação sem bola (offTheBall)
  const adv = ROLE_ADVANCE[p.role] * (0.4 + ballFwd * 0.9) * offBallAdvance(p.attrs)
  const bias = humanBias(p)

  let tx = home.x + fwd * adv * AI.attackPush + bias.x
  const ty = home.y + (ball.pos.y - FIELD.cy) * AI.blockShiftY * pull + bias.y

  // corrida em profundidade respeitando a linha de impedimento
  const capFwd = offsideLineFwd(s, p.team, fwd) + AI.offsideSlack
  if (tx * fwd > capFwd) tx = capFwd * fwd

  return vec(clamp(tx, 2, FIELD.w - 2), clamp(ty, 2, FIELD.h - 2))
}

/** Alvo na DEFESA: bloco compacto que comprime para a linha da bola e bascula. */
const defendTarget = (s: MatchState, p: Player, home: Vec2): Vec2 => {
  const ball = s.ball
  const pull = engagement(s, p)
  const bias = humanBias(p)
  // entrosamento (teamwork) mantém o bloco mais compacto ao defender
  const compact = AI.compactX * shapeMul(p.attrs)
  const tx = home.x + (ball.pos.x - home.x) * compact * pull + bias.x
  let ty = home.y + (ball.pos.y - FIELD.cy) * AI.blockShiftY * pull + bias.y
  // a linha de defesa fica mais compacta conforme a comunicação do goleiro (item 8)
  if (p.role === 'DEF') {
    const gk = teamGk(s, p.team)
    const comm = gk ? nrm(gk.attrs.communication) : 0
    ty = FIELD.cy + (ty - FIELD.cy) * (1 - GK.commandShift * comm)
  }
  return vec(clamp(tx, 2, FIELD.w - 2), clamp(ty, 2, FIELD.h - 2))
}

/**
 * Para onde este jogador quer se mover.
 * - O mais próximo da bola persegue (antecipando o movimento).
 * - Com a bola: sobe e corre sem bola; sem a bola: bloco compacto que bascula.
 * - O GK guarda o gol.
 */
export const desiredTarget = (s: MatchState, p: Player): Vec2 => {
  const ball = s.ball
  const dir = s.attackDir[p.team]

  if (p.role === 'GK') {
    const gx = defendingGoalX(dir)
    const goalC = vec(gx, FIELD.cy)
    // antecipa para onde a bola VAI, não só onde está (item 28)
    const aim = add(ball.pos, scale(ball.vel, GK.anticipation))
    const toGoal = dirTo(aim, goalC)
    const dToGoal = dist(aim, goalC)
    // sweeper: sai mais conforme o atributo oneOnOne (itens 26, 34)
    const sweep = GK.comeOutBase + nrm(p.attrs.oneOnOne) * GK.comeOutSkill
    let comeOut = clamp(dToGoal * sweep, GK.comeOutMin, GK.comeOutMax)
    // perigo iminente (bola perto) → segura a linha para reagir ao chute (item 27)
    if (dToGoal < GK.dangerDist) comeOut = Math.min(comeOut, GK.dangerComeOut)
    // bola parada contra → cola na linha cobrindo o 1º pau (item 33)
    if (s.deadball > 0 && s.restartTeam && s.restartTeam !== p.team)
      comeOut = GK.comeOutMin
    const t = add(goalC, scale(toGoal, -comeOut))
    // puxa para o lado da bola, cobrindo o canto curto/longo (item 29)
    const post = (aim.y - FIELD.cy) * GK.postBias
    const xLo = gx === 0 ? GK.boxNear : FIELD.w - GK.boxDepth
    const xHi = gx === 0 ? GK.boxDepth : FIELD.w - GK.boxNear
    return vec(
      clamp(t.x, xLo, xHi),
      clamp(t.y + post, FIELD.cy - GK.lateralRange, FIELD.cy + GK.lateralRange),
    )
  }

  // Bola parada: o adversário do cobrador recua e mantém a formação.
  if (s.deadball > 0 && s.restartTeam && p.team !== s.restartTeam) {
    return homePos(p, dir)
  }

  const chaser = nearestOfTeam(s, p.team, ball.pos)
  if (chaser.id === p.id) {
    // corre para o ponto de interceptação (onde a bola VAI), não para onde está;
    // quem antecipa melhor (anticipation) lê a trajetória com mais avanço
    return predictBall(s, chaseLead(p.attrs))
  }

  const home = homePos(p, dir)
  return s.possession === p.team
    ? attackTarget(s, p, sign(dir), home)
    : defendTarget(s, p, home)
}

/** Decisão de quem está com a bola: conduzir, passar ou chutar. */
export const decideAction = (s: MatchState, carrier: Player): Action => {
  const dir = s.attackDir[carrier.team]
  const goal = vec(attackingGoalX(dir), FIELD.cy)
  const dGoal = dist(carrier.pos, goal)
  const pressured = nearestOppDist(s, carrier) < AI.pressureDist
  const fwd = sign(dir)

  // Goleiro: segura um instante e distribui conforme a pressão (itens 45-49).
  if (carrier.role === 'GK') {
    // queima tempo / espera abrir opção, salvo se pressionado (item 48)
    if (!pressured && s.holdTime < GK.holdTime) return { type: 'dribble' }

    const mate = teammates(s, carrier.team)
      .filter((m) => m.id !== carrier.id && m.role !== 'GK')
      .map((m) => ({ m, fwdness: (m.pos.x - carrier.pos.x) * fwd, free: nearestOppDist(s, m) }))
      .filter((c) => c.free > 4)
      .sort((a, b) => b.fwdness + b.free - (a.fwdness + a.free))[0]

    // sob pressão OU sem saída curta segura → chutão longo (kicking);
    // senão, sai jogando curto e seguro no companheiro livre (throwing).
    const goLong = pressured || !mate
    if (goLong) {
      const target = mate
        ? withNoise(s, carrier.pos, mate.m.pos, gkDistroSpread(carrier.attrs, true, pressured))
        : vec(carrier.pos.x + fwd * 45, FIELD.cy)
      return { type: 'pass', target, speed: gkKickSpeed(carrier.attrs), to: mate?.m ?? null }
    }
    const target = withNoise(
      s, carrier.pos, mate.m.pos, gkDistroSpread(carrier.attrs, false, pressured),
    )
    return { type: 'pass', target, speed: gkThrowSpeed(carrier.attrs), to: mate.m }
  }

  // Dentro do alcance (escalado pela finalização) E em ângulo razoável → chuta.
  const central = Math.abs(carrier.pos.y - FIELD.cy) < AI.shootCone
  if (central && dGoal < shootRangeOf(carrier.attrs, AI.shootRange)) {
    // far 0..1 conforme a distância: perto pesa finishing, longe pesa longShots
    const far = clamp((dGoal - 6) / 24, 0, 1)
    return {
      type: 'shoot',
      target: withNoise(s, carrier.pos, goal, shotSpread(carrier.attrs, far, pressured)),
      speed: shotSpeed(carrier.attrs),
    }
  }

  // Melhor opção de passe — visão + progressão + companheiro livre + LANE limpa.
  const best = teammates(s, carrier.team)
    .filter((m) => m.id !== carrier.id && m.role !== 'GK')
    .map((m) => {
      const d = dist(carrier.pos, m.pos)
      const forward = (m.pos.x - carrier.pos.x) * fwd
      const free = nearestOppDist(s, m)
      const lane = laneClearance(s, carrier.pos, m.pos, carrier.team)
      const score =
        forward +
        free * 0.6 +
        Math.min(lane, AI.laneSafe) * AI.laneWeight +
        nrm(carrier.attrs.vision) * 4
      return { m, d, forward, lane, score }
    })
    // descarta passes longos demais, para trás demais ou com a linha estrangulada
    .filter(
      (c) =>
        c.d >= AI.passMin &&
        c.d <= AI.passMax &&
        c.forward > -4 &&
        c.lane > AI.laneBlocked,
    )
    .sort((a, b) => b.score - a.score)[0]

  // decisions: jogador decidido segura menos a bola antes de passar
  if (pressured || s.holdTime > holdMax(carrier.attrs)) {
    if (best) {
      const speed = passSpeed(carrier.attrs)
      return {
        type: 'pass',
        target: withNoise(
          s,
          carrier.pos,
          passLeadPoint(carrier, best.m, speed),
          passSpread(carrier.attrs),
        ),
        speed,
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
