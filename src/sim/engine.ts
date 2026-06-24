import type {
  Dir,
  EventType,
  MatchState,
  Player,
  TeamId,
  TeamStats,
  Vec2,
} from './types'
import {
  CELEBRATION,
  CONTROL,
  DUEL,
  FIELD,
  GK,
  GOAL,
  MATCH,
  MOVE,
  PHYS,
  STAMINA,
} from './constants'
import { TEAMS } from './teams'
import { buildPlayers, attackingGoalX, defendingGoalX, homePos } from './formation'
import { decideAction, desiredTarget, engagement } from './ai'
import {
  carryPower,
  controlReach,
  dribbleSpeedMul,
  flairSpin,
  gkHoldChance,
  gkMaxSpeed,
  gkReach,
  gkSaveBase,
  knockResist,
  maxSpeed,
  miscontrol,
  nrm,
  outfieldAccel,
  recoverMul,
  tacklePower,
  tackleRange,
  turnFloorOf,
} from './ratings'
import {
  add,
  dirTo,
  dist,
  len,
  lerp,
  lerpV,
  limit,
  norm,
  perp,
  scale,
  sub,
  vec,
} from './vector'
import { rand, seedRng } from './rng'

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
  saves: 0,
  rebounds: 0,
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
    ball: {
      pos: vec(FIELD.cx, FIELD.cy),
      vel: vec(0, 0),
      prevPos: vec(FIELD.cx, FIELD.cy),
      spin: 0,
      roll: 0,
    },
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
    celebration: null,
    events: [],
    // seed variando por partida (variedade), mas determinístico DENTRO da partida
    rngState: seedRng(Date.now()),
  }
  addEvent(s, 'kickoff', 'home', 'Apito inicial — bola rolando!')
  return s
}

/** Recoloca todos na formação e a bola no centro. */
const kickoff = (s: MatchState, kicking: TeamId) => {
  for (const p of s.players) {
    p.pos = homePos(p, s.attackDir[p.team])
    p.vel = vec(0, 0)
    // sem rastro de interpolação ao teleportar para a formação
    p.prevPos = { ...p.pos }
    p.smTarget = { ...p.pos }
    p.settled = false
  }
  s.ball.pos = vec(FIELD.cx, FIELD.cy)
  s.ball.vel = vec(0, 0)
  s.ball.prevPos = { ...s.ball.pos }
  s.ball.spin = 0
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

  // histerese: já acomodado, só volta a corrigir quando o alvo se afasta bem
  // mais que a zona morta — evita ficar ligando/desligando e "tremendo" na borda.
  const restDz = p.settled ? dz * MOVE.settleHysteresis : dz
  if (d < restDz) {
    // dentro da zona: desacelera suavemente até parar
    p.settled = true
    p.vel = scale(p.vel, Math.pow(0.05, dt))
    p.pos = add(p.pos, scale(p.vel, dt))
    clampPos(p)
    return
  }
  p.settled = false

  const dir = norm(to)
  // velocidade desejada: faz uma rampa ao se aproximar da borda da zona morta
  let desired = d < dz + 2 ? maxV * ((d - dz) / 2) : maxV

  // freio na curva: quanto mais oposto o movimento atual ao desejado, mais freia.
  // jogadores mais ágeis viram perdendo menos velocidade (turnFloor maior).
  const sp = len(p.vel)
  if (sp > 0.4) {
    const cosT = (p.vel.x * dir.x + p.vel.y * dir.y) / sp
    const tf = turnFloorOf(p.attrs)
    desired *= tf + (1 - tf) * clamp((cosT + 1) / 2, 0, 1)
  }
  desired = clamp(desired, 0, maxV)

  const accel = outfieldAccel(p.attrs)
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
  if (p.role === 'GK') return advanceGk(s, p, dt)
  if (p.stun > 0) {
    p.vel = scale(p.vel, Math.pow(0.03, dt))
    p.pos = add(p.pos, scale(p.vel, dt))
    clampPos(p)
    return
  }
  const eng = engagement(s, p)
  const effMax = maxSpeed(p) * (MOVE.jogFloor + (1 - MOVE.jogFloor) * eng)
  const dz = MOVE.deadzoneMin + (1 - eng) * (MOVE.deadzoneMax - MOVE.deadzoneMin)
  // suaviza o alvo (low-pass): quando a IA muda o destino, o jogador não dá um
  // tranco — a mira escorrega até o novo ponto ao longo de alguns frames.
  const k = clamp(MOVE.targetLerp * dt, 0, 1)
  p.smTarget = lerpV(p.smTarget, desiredTarget(s, p), k)
  steer(p, p.smTarget, dt, effMax, dz)
}

/**
 * Movimento do GOLEIRO: usa agilidade/arranque próprios (não o ritmo de corrida,
 * item 25), é mais ágil de lado do que saindo de frente (anisotropia, item 31) e
 * tem zona morta pequena para não tremer na linha (item 35). Caído, desliza.
 */
const advanceGk = (s: MatchState, p: Player, dt: number) => {
  if (p.stun > 0) {
    p.vel = scale(p.vel, Math.pow(0.03, dt))
    p.pos = add(p.pos, scale(p.vel, dt))
    clampPos(p)
    return
  }
  const k = clamp(MOVE.targetLerp * dt, 0, 1)
  p.smTarget = lerpV(p.smTarget, desiredTarget(s, p), k)
  const to = sub(p.smTarget, p.pos)
  const d = len(to)
  // 1 = deslocamento lateral puro (rápido); 0 = sair de frente (mais lento)
  const lateral = d > 1e-6 ? Math.abs(to.y) / d : 1
  const maxV = gkMaxSpeed(p) * (GK.frontalSpeed + (1 - GK.frontalSpeed) * lateral)
  steer(p, p.smTarget, dt, maxV, GK.deadzone)
}

/**
 * Evita que os corpos se sobreponham: empurra para fora pares de jogadores
 * mais próximos que o diâmetro. O conduto, os caídos e o GOLEIRO não são
 * empurrados (o GK nunca é deslocado para dentro do próprio gol — itens 40, 42);
 * o outro do par é quem desvia (itens 43).
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
      const aFree = a.id !== s.controllerId && a.stun <= 0 && a.role !== 'GK'
      const bFree = b.id !== s.controllerId && b.stun <= 0 && b.role !== 'GK'
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

/**
 * Alcance para tomar a bola conforme a velocidade dela:
 * - jogador de linha: raio do primeiro toque (firstTouch) + disputa aérea
 *   (jumping/heading) quando a bola vem forte/alta;
 * - goleiro: alcance-base que se estende no mergulho (chute forte) e abraça
 *   bolas altas/cruzamentos conforme aerialReach.
 */
const gainReach = (p: Player, ballSpeed: number): number => {
  if (p.role !== 'GK') return controlReach(p.attrs, ballSpeed)
  const dive = clamp((ballSpeed - GK.controlSpeed) * GK.diveSpeedScale, 0, GK.diveMax)
  const aerial = ballSpeed > CONTROL.loftSpeed ? nrm(p.attrs.aerialReach) * GK.aerialClaim : 0
  return gkReach(p.attrs) + dive + aerial
}

/** Candidato mais próximo da bola dentro do seu alcance (ou null). */
const ballCandidate = (s: MatchState, team?: TeamId): Player | null => {
  const ballSpeed = len(s.ball.vel)
  let best: Player | null = null
  let bestScore = Infinity
  for (const p of s.players) {
    if (team && p.team !== team) continue
    const d = dist(p.pos, s.ball.pos)
    if (d < gainReach(p, ballSpeed) && d < bestScore) {
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

/**
 * Goleiro com a bola na mão NÃO pode ser desarmado; um atacante que avança em
 * cima dele comete falta a favor da defesa (item 41).
 */
const gkChargeFoul = (s: MatchState, gk: Player) => {
  const att = nearestOpponentToPoint(s, gk.team, gk.pos, GK.chargeDist)
  if (!att) return
  s.tackleCooldown = DUEL.cooldown
  if (rand(s) >= GK.chargeFoulChance * nrm(att.attrs.aggression)) return
  s.stats[att.team].fouls++
  s.deadball = DUEL.deadball
  s.possession = gk.team
  s.restartTeam = gk.team
  att.stun = GK.chargeStun
  addEvent(s, 'foul', att.team, `Carga em ${gk.name} — falta da defesa!`)
}

/** Tenta o desarme do conduto; resolve roubada, falta e cartão. */
const tryTackle = (s: MatchState) => {
  if (s.controllerId === null || s.tackleCooldown > 0) return
  const carrier = byId(s, s.controllerId)
  if (carrier.role === 'GK') return gkChargeFoul(s, carrier)
  // o marcador disputa a BOLA; quão de longe ele se atira depende da bravura.
  // procura num raio generoso e só confirma se a bola estiver dentro do SEU alcance.
  const def = nearestOpponentToPoint(s, carrier.team, s.ball.pos, DUEL.range * 1.3)
  if (!def || dist(def.pos, s.ball.pos) > tackleRange(def.attrs)) return
  s.tackleCooldown = DUEL.cooldown

  const defR = tacklePower(def.attrs)
  const attR = carryPower(carrier.attrs)
  const winProb = clamp(DUEL.baseWin + (defR - attR) * 0.9, 0.12, 0.9)

  if (rand(s) < winProb) {
    // desarme limpo — defensor fica com a bola; o atacante pode tropeçar, menos
    // se tiver bom equilíbrio (balance).
    const stagger = DUEL.staggerChance * (1 - knockResist(carrier.attrs) * 0.6)
    if (rand(s) < stagger) carrier.stun = DUEL.staggerStun
    s.controllerId = def.id
    s.possession = def.team
    s.holdTime = 0
    s.tackleCooldown = DUEL.cooldown
    s.stats[def.team].tackles++
    return
  }

  // desarme falhou — pode ter sido falta (carrinho)
  const foulProb = 0.12 + nrm(def.attrs.aggression) * 0.4
  if (rand(s) < foulProb) {
    s.stats[def.team].fouls++
    s.deadball = DUEL.deadball
    s.ball.pos = { ...carrier.pos }
    s.ball.vel = vec(0, 0)
    s.possession = carrier.team
    s.restartTeam = carrier.team
    // levou o carrinho: cai e fica no chão menos tempo se tiver equilíbrio
    carrier.stun = DUEL.foulStun * (1 - knockResist(carrier.attrs) * 0.4)
    s.controllerId = null
    s.holdTime = 0

    // cartão amarelo conforme a agressividade
    const cardProb = 0.1 + nrm(def.attrs.aggression) * 0.22
    if (rand(s) < cardProb) {
      def.yellow = true
      s.stats[def.team].yellows++
      addEvent(s, 'card', def.team, `🟨 ${def.name} (${TEAMS[def.team].name}) — amarelo`)
    }
    addEvent(s, 'foul', def.team, `Falta de ${def.name} sobre ${carrier.name}`)
  }
}

/** Goleiro garante a posse e abre janela protegida para distribuir (item 43). */
const gkGrab = (s: MatchState, gk: Player) => {
  s.controllerId = gk.id
  s.possession = gk.team
  s.holdTime = 0
  s.tackleCooldown = GK.protectWindow
}

/** Goleiro espalma: a bola fica VIVA, desviada para fora do gol (rebote, itens 17-19). */
const spillBall = (s: MatchState, gk: Player) => {
  const dir = s.attackDir[gk.team]
  const away = defendingGoalX(dir) === 0 ? 1 : -1 // sentido para longe do próprio gol
  const ang = (rand(s) - 0.5) * 1.6 // espalha para os lados
  s.ball.pos = { ...gk.pos }
  s.ball.vel = vec(Math.cos(ang) * away * GK.spillSpeed, Math.sin(ang) * GK.spillSpeed)
  s.ball.spin = 0
  s.controllerId = null
  s.possession = null
  s.holdTime = 0
  s.kickCooldown = GK.spillCooldown // breve respiro para a segunda bola
  s.stats[gk.team].rebounds++
}

/** Onde a bola cruzaria a linha do gol em X=gx (estima o canto do chute). */
const ballCrossY = (s: MatchState, gx: number): number => {
  const b = s.ball
  if (Math.abs(b.vel.x) < 1e-3) return b.pos.y
  const t = (gx - b.pos.x) / b.vel.x
  return t > 0 ? b.pos.y + b.vel.y * t : b.pos.y
}

/** Probabilidade de defesa: habilidade + ângulo + distância + posição + fadiga (itens 13-16, 22). */
const saveProbability = (s: MatchState, gk: Player, speed: number): number => {
  const a = gk.attrs
  const gx = defendingGoalX(s.attackDir[gk.team])
  const goalC = vec(gx, FIELD.cy)
  let p = GK.saveBase + gkSaveBase(a) * GK.saveSkill
  // 1. chute forte é mais difícil de defender
  p -= Math.max(0, speed - GK.saveSpeedFree) * GK.saveSpeedPen
  // 2. chute no canto (longe do meio do gol) é mais difícil (item 14)
  const ny = ballCrossY(s, gx)
  const corner = clamp(Math.abs(ny - FIELD.cy) / (GOAL.width / 2), 0, 1.4)
  p -= corner * GK.saveAnglePen
  // 3. bônus por estar bem posicionado na linha do chute (item 16)
  const align = 1 - clamp(Math.abs(gk.pos.y - ny) / GK.alignBand, 0, 1)
  p += align * GK.savePosBonus
  // 4. chute de perto dá menos tempo de reação (item 15); um bom goleiro de
  //    1v1 (oneOnOne) compensa parte dessa dificuldade fechando o ângulo.
  if (s.lastShooterId !== null) {
    const near = clamp((GK.closeShot - dist(byId(s, s.lastShooterId).pos, goalC)) / GK.closeShot, 0, 1)
    p -= near * GK.saveClosePen
    p += near * nrm(a.oneOnOne) * GK.oneOnOneBonus
  }
  // 5. fadiga reduz a defesa no fim do jogo (item 22)
  p -= (1 - gk.energy) * GK.saveFatiguePen
  return clamp(p, GK.saveFloor, GK.saveCap)
}

/** Goleiro tenta a defesa; demais jogadores apenas dominam a bola solta. */
const tryGainLoose = (s: MatchState) => {
  if (s.controllerId !== null || s.kickCooldown > 0 || s.deadball > 0) return
  const cand = ballCandidate(s)
  if (!cand) return

  if (cand.role === 'GK') {
    const a = cand.attrs
    const speed = len(s.ball.vel)
    // bola lenta (recuo/passe atrás): domina sem disputa, mas pode dar "frango" (item 24)
    if (speed <= GK.controlSpeed) {
      const fumble = (1 - nrm(a.handling)) * (1 - nrm(a.composure)) * GK.fumbleScale
      if (rand(s) < fumble) return spillBall(s, cand)
      return gkGrab(s, cand)
    }
    // é chute a gol → tentativa de defesa
    s.stats[other(cand.team)].shotsOnTarget++
    if (rand(s) < saveProbability(s, cand, speed)) {
      s.stats[cand.team].saves++
      addEvent(s, 'save', cand.team, `Defesa de ${cand.name}!`)
      // segura ou espalma conforme handling e força do chute (itens 17, 18)
      return rand(s) < gkHoldChance(a, speed) ? gkGrab(s, cand) : spillBall(s, cand)
    }
    // não defendeu limpo — ainda pode tocar e dar rebote (2ª tentativa, item 20)
    if (rand(s) < GK.secondChance * nrm(a.reflexes)) {
      s.stats[cand.team].saves++
      addEvent(s, 'save', cand.team, `${cand.name} espalma no susto!`)
      return spillBall(s, cand)
    }
    s.kickCooldown = 0.3 // não re-rola a defesa; a bola segue (talvez gol)
    return
  }
  // jogador de linha: domina a bola, mas pode errar o primeiro toque e a bola
  // escapar à frente — pior cansado e sem firstTouch/composure/concentração.
  if (rand(s) < miscontrol(cand)) {
    const away = len(s.ball.vel) > 0.5 ? norm(s.ball.vel) : vec(rand(s) - 0.5, rand(s) - 0.5)
    s.ball.vel = scale(norm(away), CONTROL.squirtSpeed)
    s.kickCooldown = 0.2
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

  // quique na trave: postes pontuais nas quinas do gol devolvem a bola
  for (const gx of [0, FIELD.w]) {
    for (const py of [GOAL.top, GOAL.bottom]) {
      const post = vec(gx, py)
      const off = sub(b.pos, post)
      const d = len(off)
      const rr = PHYS.ballRadius + PHYS.postRadius
      if (d < rr && d > 1e-6) {
        const nv = scale(off, 1 / d)
        const vn = b.vel.x * nv.x + b.vel.y * nv.y
        if (vn < 0) b.vel = sub(b.vel, scale(nv, vn * (1 + PHYS.postRestitution)))
        b.pos = add(post, scale(nv, rr))
        b.spin = 0
      }
    }
  }

  // linhas de fundo (gols)
  if (b.pos.x <= 0) {
    if (inMouth) return scoreGoal(s, teamDefending(s, 0), 0)
    b.pos.x = 0
    b.vel.x = Math.abs(b.vel.x) * 0.4
  } else if (b.pos.x >= FIELD.w) {
    if (inMouth) return scoreGoal(s, teamDefending(s, FIELD.w), FIELD.w)
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

/**
 * Bola na rede: registra o gol e ABRE a sequência de comemoração (não recomeça
 * de imediato). A jogada congela; quem reinicia é o time que sofreu, mas só
 * depois que a comemoração termina (ver `stepCelebration`). `goalX` é a linha
 * do gol (0 ou FIELD.w) onde a bola entrou.
 */
const scoreGoal = (s: MatchState, conceded: TeamId, goalX: number) => {
  const scorer = other(conceded)
  s.score[scorer]++
  const shooter = s.lastShooterId !== null ? byId(s, s.lastShooterId) : null
  // só credita o autor se ele for do time que marcou (senão é gol contra)
  const author = shooter && shooter.team === scorer ? shooter : null
  const who = author ? ` ${author.name}!` : '!'
  addEvent(s, 'goal', scorer, `⚽ GOL ${TEAMS[scorer].of}!${who}`)

  // congela a bola DENTRO da rede, no ponto em que cruzou a linha — deixa
  // visível por onde o gol entrou.
  const into = goalX === 0 ? -1 : 1
  s.ball.pos = vec(
    goalX + into * GOAL.depth * 0.55,
    clamp(s.ball.pos.y, GOAL.top + 0.4, GOAL.bottom - 0.4),
  )
  s.ball.vel = vec(0, 0)
  s.ball.prevPos = { ...s.ball.pos }
  s.ball.spin = 0
  s.controllerId = null
  s.possession = null

  // ponto da comemoração: escanteio do gol, do lado em que a bola entrou
  const side = s.ball.pos.y < FIELD.cy ? CELEBRATION.spotSide : FIELD.h - CELEBRATION.spotSide
  const spotX = goalX === 0 ? CELEBRATION.spotInset : FIELD.w - CELEBRATION.spotInset

  s.celebration = {
    team: scorer,
    scorerId: author ? author.id : null,
    scorerName: author ? author.name : null,
    scorerNumber: author ? author.number : null,
    homeScore: s.score.home,
    awayScore: s.score.away,
    minute: minute(s),
    goalX,
    spot: vec(spotX, side),
    t: 0,
  }
}

/**
 * Avança a comemoração em tempo REAL (`dtReal` em segundos de relógio de parede,
 * independente da velocidade da simulação) para que o lance seja sempre legível:
 * o autor corre até o escanteio, os companheiros o cercam e o time que sofreu
 * recua cabisbaixo. Ao fim, recoloca todos e o time que sofreu bate a saída.
 */
export const stepCelebration = (s: MatchState, dtReal: number): void => {
  const c = s.celebration
  if (!c) return

  // snapshot do passo anterior — o render interpola prev→pos (movimento suave)
  for (const p of s.players) p.prevPos = { ...p.pos }
  s.ball.prevPos = { ...s.ball.pos }

  c.t += dtReal

  for (const p of s.players) {
    // some o realce de "dono da bola" e levanta quem ficou caído
    p.ctrlAmt = lerp(p.ctrlAmt, 0, clamp(MOVE.ctrlEase * dtReal, 0, 1))
    if (p.stun > 0) p.stun = Math.max(0, p.stun - dtReal)
    p.downAmt = lerp(p.downAmt, p.stun > 0 ? 1 : 0, clamp(MOVE.downEase * dtReal, 0, 1))

    // goleiros não saem comemorando: deslizam até parar
    if (p.role === 'GK') {
      p.vel = scale(p.vel, Math.pow(0.05, dtReal))
      p.pos = add(p.pos, scale(p.vel, dtReal))
      clampPos(p)
      continue
    }

    if (p.team === c.team) {
      // time que marcou: o autor corre ao escanteio; os demais o cercam
      let target = c.spot
      if (p.id !== c.scorerId) {
        const ang = p.id * 2.39996 // espalha em torno do autor (determinístico)
        target = add(c.spot, vec(Math.cos(ang) * CELEBRATION.huddle, Math.sin(ang) * CELEBRATION.huddle))
      }
      steer(p, target, dtReal, CELEBRATION.runSpeed, 0.5)
    } else {
      // time que sofreu: volta devagar à própria formação, cabisbaixo
      steer(p, homePos(p, s.attackDir[p.team]), dtReal, CELEBRATION.runSpeed * 0.4, 1)
    }
  }
  separate(s)

  if (c.t >= CELEBRATION.duration) {
    s.celebration = null
    kickoff(s, other(c.team)) // o time que sofreu reinicia a partida
  }
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
  if (s.status === 'over' || s.celebration) return

  // snapshot do estado anterior — o render interpola prev→pos (movimento suave)
  for (const p of s.players) p.prevPos = { ...p.pos }
  s.ball.prevPos = { ...s.ball.pos }

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
    const sta = nrm(p.attrs.stamina)
    if (speed > STAMINA.jogSpeed) {
      const intensity = clamp((speed - STAMINA.jogSpeed) / STAMINA.sprintBand, 0, 1)
      p.energy -= sec * STAMINA.sprintDrain * intensity * (1.4 - sta)
    } else {
      // recupera mais rápido quem tem melhor condição física (naturalFitness)
      p.energy += sec * STAMINA.recover * recoverMul(p.attrs)
    }
    p.energy = clamp(p.energy, STAMINA.floor, 1)
    if (p.stun > 0) p.stun = Math.max(0, p.stun - dt)

    // transições visuais suaves (sem trocar de estado de repente):
    // realce de "dono da bola" e o "cair/levantar" surgem/somem com fade.
    p.ctrlAmt = lerp(p.ctrlAmt, s.controllerId === p.id ? 1 : 0, clamp(MOVE.ctrlEase * dt, 0, 1))
    p.downAmt = lerp(p.downAmt, p.stun > 0 ? 1 : 0, clamp(MOVE.downEase * dt, 0, 1))
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
      s.ball.prevPos = { ...s.ball.pos }
      s.ball.vel = vec(0, 0)
    } else {
      s.ball.vel = vec(0, 0) // a bola fica parada no ponto da falta
    }
    s.ball.spin = 0
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
      const dir = dirTo(carrier.pos, action.target)
      // herda só o componente da corrida NA direção da bola: dá o passe/chute
      // "na corrida" mais forte SEM entortar a mira (momentum sem distorção).
      const carry = Math.max(0, carrier.vel.x * dir.x + carrier.vel.y * dir.y)
      s.ball.vel = scale(dir, action.speed + carry * PHYS.releaseCarry)
      // efeito lateral: forte no chute, sutil no passe (não tira o passe da mira).
      // jogadores com mais flair imprimem mais efeito (curva) na bola
      const spinMax =
        (action.type === 'shoot' ? PHYS.maxSpin : PHYS.maxSpin * PHYS.passSpinScale) *
        flairSpin(carrier.attrs)
      s.ball.spin = (rand(s) - 0.5) * 2 * spinMax
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
    if (s.controllerId === p.id && dribbleDir && p.role !== 'GK') {
      // melhores dribladores conduzem mais rápido sem perder a bola
      steer(p, add(p.pos, scale(dribbleDir, 6)), dt, maxSpeed(p) * dribbleSpeedMul(p.attrs), 0.3)
    } else {
      // o goleiro com a bola não sai conduzindo: segura perto do gol (itens 32, 48)
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
    // a bola "persegue" o pé com uma mola (não fica rigidamente grudada)
    const target = add(carrier.pos, scale(facing, off))
    s.ball.pos = lerpV(s.ball.pos, target, clamp(PHYS.footLerp * dt, 0, 1))
    s.ball.vel = { ...carrier.vel }
    s.ball.spin = 0
    s.ball.roll += len(carrier.vel) * dt
  } else {
    // efeito (Magnus): empurra a bola perpendicular à direção e vai sumindo
    if (Math.abs(s.ball.spin) > 1e-4) {
      const u = norm(s.ball.vel)
      s.ball.vel = add(s.ball.vel, scale(perp(u), s.ball.spin * dt))
      s.ball.spin *= Math.pow(PHYS.spinDecay, dt)
    }
    s.ball.pos = add(s.ball.pos, scale(s.ball.vel, dt))
    s.ball.vel = scale(s.ball.vel, Math.pow(PHYS.ballDamping, dt))
    s.ball.roll += len(s.ball.vel) * dt // giro visual proporcional à velocidade
    resolveBounds(s)
  }
}
