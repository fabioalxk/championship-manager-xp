import type {
  Dir,
  EventType,
  MatchState,
  Player,
  TeamId,
  TeamStats,
  Vec2,
} from './types'
import { DUEL, FIELD, GOAL, MATCH, MOVE, PHYS, STAMINA } from './constants'
import { TEAMS } from './teams'
import { buildPlayers, attackingGoalX, defendingGoalX, homePos } from './formation'
import { decideAction, desiredTarget, engagement } from './ai'
import { maxSpeed, n20 } from './ratings'
import { add, dirTo, dist, len, limit, norm, scale, sub, vec } from './vector'

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v))

const byId = (s: MatchState, id: number): Player =>
  s.players.find((p) => p.id === id)!

const other = (t: TeamId): TeamId => (t === 'home' ? 'away' : 'home')

const emptyStats = (): TeamStats => ({
  shots: 0,
  shotsOnTarget: 0,
  fouls: 0,
  yellows: 0,
  tackles: 0,
  possessionTicks: 0,
})

/** Minuto de jogo atual (1..90), para os eventos. */
const minute = (s: MatchState): number =>
  Math.min(90, Math.max(1, Math.ceil(s.time / 60)))

const addEvent = (
  s: MatchState,
  type: EventType,
  team: TeamId | null,
  text: string,
) => {
  s.events.push({ minute: minute(s), type, team, text })
  if (s.events.length > 60) s.events.shift()
}

/** Cria uma partida nova: Brasil ataca para a direita no 1º tempo. */
export const createMatch = (): MatchState => {
  const s: MatchState = {
    players: buildPlayers(),
    ball: { pos: vec(FIELD.cx, FIELD.cy), vel: vec(0, 0) },
    possession: 'home',
    controllerId: null,
    holdTime: 0,
    kickCooldown: 0.6,
    tackleCooldown: 0,
    deadball: 0,
    restartTeam: null,
    lastShooterId: null,
    score: { home: 0, away: 0 },
    time: 0,
    half: 1,
    status: 'play',
    attackDir: { home: 1, away: -1 },
    firstKickoff: 'home',
    stats: { home: emptyStats(), away: emptyStats() },
    events: [],
  }
  addEvent(s, 'kickoff', 'home', 'Apito inicial — bola rolando!')
  return s
}

/** Recoloca todos na formação e a bola no centro. */
const kickoff = (s: MatchState, kicking: TeamId) => {
  for (const p of s.players) {
    p.pos = homePos(p, s.attackDir[p.team])
    p.vel = vec(0, 0)
  }
  s.ball.pos = vec(FIELD.cx, FIELD.cy)
  s.ball.vel = vec(0, 0)
  s.possession = kicking
  // o time que reinicia sai com a bola (evita gol relâmpago no recomeço)
  s.controllerId = nearestOfTeamTo(s, kicking, s.ball.pos).id
  s.restartTeam = kicking
  s.holdTime = 0
  s.kickCooldown = 0
  s.tackleCooldown = 0.8
  s.deadball = 0.5
}

const clampPos = (p: Player) => {
  p.pos.x = clamp(p.pos.x, 0, FIELD.w)
  p.pos.y = clamp(p.pos.y, 0, FIELD.h)
}

/**
 * Move um jogador rumo a um alvo de forma SUAVE:
 * - zona morta (dz): perto do alvo não corrige a posição (sem tremer);
 * - freia ao fazer curva (vira em arco, sem mudanças bruscas de direção);
 * - aceleração/agilidade proporcional ao ritmo do jogador.
 */
const steer = (p: Player, target: Vec2, dt: number, maxV: number, dz = 0.6) => {
  const to = sub(target, p.pos)
  const d = len(to)

  if (d < dz) {
    // dentro da zona: desacelera suavemente até parar
    p.vel = scale(p.vel, Math.pow(0.05, dt))
    p.pos = add(p.pos, scale(p.vel, dt))
    clampPos(p)
    return
  }

  const dir = norm(to)
  // velocidade desejada: faz uma rampa ao se aproximar da borda da zona morta
  let desired = d < dz + 2 ? maxV * ((d - dz) / 2) : maxV

  // freio na curva: quanto mais oposto o movimento atual ao desejado, mais freia
  const sp = len(p.vel)
  if (sp > 0.4) {
    const cosT = (p.vel.x * dir.x + p.vel.y * dir.y) / sp
    desired *= MOVE.turnFloor + (1 - MOVE.turnFloor) * clamp((cosT + 1) / 2, 0, 1)
  }
  desired = clamp(desired, 0, maxV)

  const accel = PHYS.playerAccel * (0.7 + n20(p.attrs.pace) * 0.6)
  const dv = limit(sub(scale(dir, desired), p.vel), accel * dt)
  p.vel = limit(add(p.vel, dv), maxV)
  p.pos = add(p.pos, scale(p.vel, dt))
  clampPos(p)
}

/**
 * Avança um jogador SEM a bola: se está caído, desliza até parar; senão,
 * move-se rumo ao seu alvo com velocidade e zona morta conforme o engajamento.
 */
const advancePlayer = (s: MatchState, p: Player, dt: number) => {
  if (p.stun > 0) {
    p.vel = scale(p.vel, Math.pow(0.03, dt))
    p.pos = add(p.pos, scale(p.vel, dt))
    clampPos(p)
    return
  }
  const eng = engagement(s, p)
  const effMax = maxSpeed(p) * (MOVE.jogFloor + (1 - MOVE.jogFloor) * eng)
  const dz = MOVE.deadzoneMin + (1 - eng) * (MOVE.deadzoneMax - MOVE.deadzoneMin)
  steer(p, desiredTarget(s, p), dt, effMax, dz)
}

/**
 * Evita que os corpos se sobreponham: empurra para fora pares de jogadores
 * mais próximos que o diâmetro. O conduto e os caídos não são empurrados
 * (mantêm o controle/posição); o outro do par desvia (itens 40, 42, 43).
 */
const separate = (s: MatchState) => {
  const minD = PHYS.playerRadius * 2
  for (let i = 0; i < s.players.length; i++) {
    for (let j = i + 1; j < s.players.length; j++) {
      const a = s.players[i]
      const b = s.players[j]
      const to = sub(b.pos, a.pos)
      const d = len(to)
      if (d >= minD || d < 1e-6) continue

      const u = scale(to, 1 / d)
      const overlap = minD - d
      const aFree = a.id !== s.controllerId && a.stun <= 0
      const bFree = b.id !== s.controllerId && b.stun <= 0
      if (aFree && bFree) {
        a.pos = sub(a.pos, scale(u, overlap / 2))
        b.pos = add(b.pos, scale(u, overlap / 2))
      } else if (aFree) {
        a.pos = sub(a.pos, scale(u, overlap))
      } else if (bFree) {
        b.pos = add(b.pos, scale(u, overlap))
      }
      if (aFree) clampPos(a)
      if (bFree) clampPos(b)
    }
  }
}

const reachOf = (p: Player): number =>
  p.role === 'GK' ? PHYS.gkReach : PHYS.controlRadius

/** Candidato mais próximo da bola dentro do seu alcance (ou null). */
const ballCandidate = (s: MatchState, team?: TeamId): Player | null => {
  let best: Player | null = null
  let bestScore = Infinity
  for (const p of s.players) {
    if (team && p.team !== team) continue
    const d = dist(p.pos, s.ball.pos)
    if (d < reachOf(p) && d < bestScore) {
      bestScore = d
      best = p
    }
  }
  return best
}

/** Adversário do time `t` mais próximo de um ponto, dentro de `range`. */
const nearestOpponentToPoint = (
  s: MatchState,
  t: TeamId,
  point: Vec2,
  range: number,
): Player | null => {
  let best: Player | null = null
  let bestD = range
  for (const o of s.players) {
    if (o.team === t) continue
    const d = dist(o.pos, point)
    if (d < bestD) {
      bestD = d
      best = o
    }
  }
  return best
}

/** Tenta o desarme do conduto; resolve roubada, falta e cartão. */
const tryTackle = (s: MatchState) => {
  if (s.controllerId === null || s.tackleCooldown > 0) return
  const carrier = byId(s, s.controllerId)
  // o marcador disputa a BOLA (que fica logo à frente do conduto)
  const def = nearestOpponentToPoint(s, carrier.team, s.ball.pos, DUEL.range)
  if (!def) return
  s.tackleCooldown = DUEL.cooldown

  const defR = n20(def.attrs.tackling) * 0.6 + n20(def.attrs.strength) * 0.4
  const attR = n20(carrier.attrs.dribbling) * 0.6 + n20(carrier.attrs.strength) * 0.4
  const winProb = clamp(DUEL.baseWin + (defR - attR) * 0.9, 0.12, 0.9)

  if (Math.random() < winProb) {
    // desarme limpo — defensor fica com a bola; às vezes o atacante tropeça
    if (Math.random() < DUEL.staggerChance) carrier.stun = DUEL.staggerStun
    s.controllerId = def.id
    s.possession = def.team
    s.holdTime = 0
    s.tackleCooldown = DUEL.cooldown
    s.stats[def.team].tackles++
    return
  }

  // desarme falhou — pode ter sido falta (carrinho)
  const foulProb = 0.12 + n20(def.attrs.aggression) * 0.4
  if (Math.random() < foulProb) {
    s.stats[def.team].fouls++
    s.deadball = DUEL.deadball
    s.ball.pos = { ...carrier.pos }
    s.ball.vel = vec(0, 0)
    s.possession = carrier.team
    s.restartTeam = carrier.team
    // levou o carrinho: cai e fica no chão; um companheiro vem cobrar a falta
    carrier.stun = DUEL.foulStun
    s.controllerId = null
    s.holdTime = 0

    // cartão amarelo conforme a agressividade
    const cardProb = 0.1 + n20(def.attrs.aggression) * 0.22
    if (Math.random() < cardProb) {
      def.yellow = true
      s.stats[def.team].yellows++
      addEvent(s, 'card', def.team, `🟨 ${def.name} (${TEAMS[def.team].name}) — amarelo`)
    }
    addEvent(s, 'foul', def.team, `Falta de ${def.name} sobre ${carrier.name}`)
  }
}

/** Goleiro tenta a defesa; demais jogadores apenas dominam a bola solta. */
const tryGainLoose = (s: MatchState) => {
  if (s.controllerId !== null || s.kickCooldown > 0 || s.deadball > 0) return
  const cand = ballCandidate(s)
  if (!cand) return

  if (cand.role === 'GK') {
    const speed = len(s.ball.vel)
    // bola lenta (recuo/passe): domina sem disputa
    if (speed <= 12) {
      s.controllerId = cand.id
      s.possession = cand.team
      s.holdTime = 0
      s.tackleCooldown = 0.6 // janela protegida p/ distribuir
      return
    }
    // chute: UMA tentativa de defesa; se falhar, fica bloqueado até a bola passar
    s.stats[other(cand.team)].shotsOnTarget++
    const saveProb = clamp(
      0.5 + n20(cand.attrs.goalkeeping) * 0.42 - (speed - 22) * 0.008,
      0.2,
      0.95,
    )
    if (Math.random() < saveProb) {
      s.controllerId = cand.id
      s.possession = cand.team
      s.holdTime = 0
      s.tackleCooldown = 0.6 // janela protegida p/ distribuir
      addEvent(s, 'save', cand.team, `Defesa de ${cand.name}!`)
    } else {
      s.kickCooldown = 0.3 // não re-rola a defesa; a bola segue (talvez gol)
    }
    return
  }
  s.controllerId = cand.id
  s.possession = cand.team
  s.holdTime = 0
}

const teamDefending = (s: MatchState, goalX: number): TeamId =>
  defendingGoalX(s.attackDir.home) === goalX ? 'home' : 'away'

/** Trata gols, ricochete nas laterais e lateral/tiro de meta simplificados. */
const resolveBounds = (s: MatchState) => {
  const b = s.ball
  const inMouth = b.pos.y > GOAL.top && b.pos.y < GOAL.bottom

  // linhas de fundo (gols)
  if (b.pos.x <= 0) {
    if (inMouth) return scoreGoal(s, teamDefending(s, 0))
    b.pos.x = 0
    b.vel.x = Math.abs(b.vel.x) * 0.4
  } else if (b.pos.x >= FIELD.w) {
    if (inMouth) return scoreGoal(s, teamDefending(s, FIELD.w))
    b.pos.x = FIELD.w
    b.vel.x = -Math.abs(b.vel.x) * 0.4
  }

  // laterais → arremesso para o adversário de quem tocou por último
  if (b.pos.y <= 0 || b.pos.y >= FIELD.h) {
    b.pos.y = clamp(b.pos.y, 0.5, FIELD.h - 0.5)
    b.vel = vec(0, 0)
    const throwTeam = s.possession ? other(s.possession) : 'home'
    const taker = nearestOfTeamTo(s, throwTeam, b.pos)
    s.possession = throwTeam
    s.restartTeam = throwTeam
    s.controllerId = taker.id
    s.holdTime = 0
    s.deadball = 0.4
  }
}

const nearestOfTeamTo = (s: MatchState, t: TeamId, point: Vec2): Player => {
  const ok = (p: Player) => p.team === t && p.role !== 'GK' && p.stun <= 0
  const pool = s.players.filter(ok)
  const arr = pool.length ? pool : s.players.filter((p) => p.team === t && p.role !== 'GK')
  return arr.reduce((b, p) => (dist(p.pos, point) < dist(b.pos, point) ? p : b))
}

const scoreGoal = (s: MatchState, conceded: TeamId) => {
  const scorer = other(conceded)
  s.score[scorer]++
  const shooter =
    s.lastShooterId !== null ? byId(s, s.lastShooterId) : null
  const who = shooter && shooter.team === scorer ? ` ${shooter.name}!` : '!'
  addEvent(s, 'goal', scorer, `⚽ GOL ${TEAMS[scorer].of}!${who}`)
  kickoff(s, conceded)
}

const switchSides = (s: MatchState) => {
  s.half = 2
  s.attackDir.home = (s.attackDir.home * -1) as Dir
  s.attackDir.away = (s.attackDir.away * -1) as Dir
  addEvent(s, 'half', null, '⏱️ Fim do 1º tempo — troca de lados')
  kickoff(s, other(s.firstKickoff))
  addEvent(s, 'kickoff', other(s.firstKickoff), 'Começa o 2º tempo!')
}

/** Avança a simulação em um passo fixo `dt` (segundos reais). */
export const step = (s: MatchState, dt: number): void => {
  if (s.status === 'over') return

  s.time += dt * MATCH.clockRate

  // transições de tempo
  if (s.half === 1 && s.time >= MATCH.halfSeconds) {
    switchSides(s)
    return
  }
  if (s.time >= 2 * MATCH.halfSeconds) {
    s.time = 2 * MATCH.halfSeconds
    s.status = 'over'
    const r = `${s.score.home} x ${s.score.away}`
    addEvent(s, 'fulltime', null, `🏁 Fim de jogo — Brasil ${r} Argentina`)
    return
  }

  // cansaço por ESFORÇO (gasta correndo, recupera andando) + atordoamento
  const sec = dt * MATCH.clockRate
  for (const p of s.players) {
    const speed = len(p.vel)
    const sta = n20(p.attrs.stamina)
    if (speed > STAMINA.jogSpeed) {
      const intensity = clamp((speed - STAMINA.jogSpeed) / STAMINA.sprintBand, 0, 1)
      p.energy -= sec * STAMINA.sprintDrain * intensity * (1.4 - sta)
    } else {
      p.energy += sec * STAMINA.recover * (0.6 + sta)
    }
    p.energy = clamp(p.energy, STAMINA.floor, 1)
    if (p.stun > 0) p.stun = Math.max(0, p.stun - dt)
  }

  s.kickCooldown = Math.max(0, s.kickCooldown - dt)
  s.tackleCooldown = Math.max(0, s.tackleCooldown - dt)

  // ----- BOLA PARADA (cobrança de falta / lateral) -----
  if (s.deadball > 0) {
    s.deadball -= dt
    for (const p of s.players) {
      if (p.id === s.controllerId) continue
      advancePlayer(s, p, dt)
    }
    if (s.controllerId !== null) {
      const taker = byId(s, s.controllerId)
      s.ball.pos = { ...taker.pos }
      s.ball.vel = vec(0, 0)
    } else {
      s.ball.vel = vec(0, 0) // a bola fica parada no ponto da falta
    }
    return
  }

  if (s.possession) s.stats[s.possession].possessionTicks++

  // ----- POSSE: roubada e domínio -----
  tryTackle(s)
  tryGainLoose(s)

  // ----- DECISÃO de quem está com a bola -----
  let dribbleDir: Vec2 | null = null
  if (s.controllerId !== null) {
    const carrier = byId(s, s.controllerId)
    s.holdTime += dt
    const action = decideAction(s, carrier)
    if (action.type === 'dribble') {
      const goal = vec(attackingGoalX(s.attackDir[carrier.team]), FIELD.cy)
      dribbleDir = dirTo(carrier.pos, goal)
    } else {
      s.ball.vel = scale(dirTo(carrier.pos, action.target), action.speed)
      if (action.type === 'shoot') {
        s.stats[carrier.team].shots++
        s.lastShooterId = carrier.id
        addEvent(s, 'shot', carrier.team, `Chute de ${carrier.name}!`)
      }
      s.controllerId = null
      s.holdTime = 0
      s.kickCooldown = 0.3
    }
  }

  // ----- MOVIMENTO -----
  for (const p of s.players) {
    if (s.controllerId === p.id && dribbleDir) {
      steer(p, add(p.pos, scale(dribbleDir, 6)), dt, maxSpeed(p) * PHYS.dribbleSpeed, 0.3)
    } else {
      advancePlayer(s, p, dt)
    }
  }
  separate(s)

  // ----- FÍSICA DA BOLA -----
  if (s.controllerId !== null) {
    const carrier = byId(s, s.controllerId)
    const facing =
      dribbleDir ??
      (len(carrier.vel) > 0.1
        ? norm(carrier.vel)
        : dirTo(carrier.pos, vec(attackingGoalX(s.attackDir[carrier.team]), FIELD.cy)))
    const off = PHYS.playerRadius + PHYS.ballRadius + PHYS.dribblePush
    s.ball.pos = add(carrier.pos, scale(facing, off))
    s.ball.vel = { ...carrier.vel }
  } else {
    s.ball.pos = add(s.ball.pos, scale(s.ball.vel, dt))
    s.ball.vel = scale(s.ball.vel, Math.pow(PHYS.ballDamping, dt))
    resolveBounds(s)
  }
}
