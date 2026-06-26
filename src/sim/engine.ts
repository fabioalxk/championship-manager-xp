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
  ADVANTAGE,
  AI,
  AIR,
  AREA,
  CARD,
  CELEBRATION,
  COLLIDE,
  CONTROL,
  DRIBBLE,
  DUEL,
  FIELD,
  FREEKICK,
  GK,
  GOAL,
  HEAD,
  KICKOFF,
  MATCH,
  MOVE,
  PEN,
  PHYS,
  RESTART,
  SHOT,
  STAMINA,
  STOPPAGE,
} from './constants'
import { TEAMS } from './teams'
import {
  buildPlayers,
  attackingGoalX,
  defendingGoalX,
  homePos,
  inPenaltyArea,
} from './formation'
import { decideAction, desiredTarget, engagement } from './ai'
import {
  aerialPower,
  carryPower,
  controlReach,
  dribbleSpeedMul,
  flairSpin,
  footing,
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

/** Encerra a fase do tiro livre: dispersa a BARREIRA e fecha a janela do chute no
 *  ar (a bola voltou a ser disputável normalmente — defendida, rebatida ou parada). */
const endFreeKickPhase = (s: MatchState) => {
  s.wallIds = []
  s.fkShotTimer = 0
}

/** Goleiro de um time. */
const teamGk = (s: MatchState, t: TeamId): Player =>
  s.players.find((p) => p.team === t && p.role === 'GK')!

const emptyStats = (): TeamStats => ({
  shots: 0,
  shotsOnTarget: 0,
  fouls: 0,
  yellows: 0,
  reds: 0,
  tackles: 0,
  possessionTicks: 0,
  saves: 0,
  rebounds: 0,
  throwIns: 0,
  goalKicks: 0,
  corners: 0,
})

/** Soma acréscimos (s de jogo) ao tempo atual, respeitando o teto. */
const addStoppage = (s: MatchState, sec: number) => {
  s.stoppage = Math.min(STOPPAGE.max, s.stoppage + sec)
}

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
      z: 0,
      vz: 0,
      prevPos: vec(FIELD.cx, FIELD.cy),
      prevZ: 0,
      spin: 0,
      roll: 0,
    },
    possession: 'home',
    controllerId: null,
    holdTime: 0,
    kickCooldown: 0,
    tackleCooldown: 0,
    deadball: 0,
    outOfPlay: 0,
    pendingGoalLineX: null,
    goalKickWait: 0,
    restartTeam: null,
    goalKick: false,
    throwIn: false,
    freeKick: false,
    wallIds: [],
    fkShotTimer: 0,
    penalty: false,
    stoppage: 0,
    lastShooterId: null,
    lastShotDist: 0,
    lastPasserId: null,
    lastTouchId: null,
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
  // 1º tempo: o time da saída posiciona dois jogadores na bola, no centro.
  kickoff(s, s.firstKickoff)
  addEvent(s, 'kickoff', s.firstKickoff, 'Apito inicial — bola rolando!')
  return s
}

/**
 * Saída de bola realista (pontapé inicial e recomeço após o gol). Segue as
 * regras do jogo: cada time fica no SEU campo; o adversário aguarda FORA do
 * círculo central; o time que sai de bola põe DOIS jogadores sobre a bola, no
 * centro, e um deles assume a posse. A jogada congela um instante (deadball)
 * para que ninguém roube a bola no apito.
 */
const kickoff = (s: MatchState, kicking: TeamId) => {
  const center = vec(FIELD.cx, FIELD.cy)

  // 1) cada jogador no SEU campo. O time que defende a saída fica fora do
  //    círculo central; o que sai de bola pode encostar na linha do meio.
  for (const p of s.players) {
    const pos = homePos(p, s.attackDir[p.team])
    const ownGoalX = defendingGoalX(s.attackDir[p.team])
    const margin = p.team === kicking ? KICKOFF.takingMargin : KICKOFF.centerRadius
    // mantém o jogador atrás da linha de meio-campo, no seu lado do gramado
    if (ownGoalX === 0) pos.x = Math.min(pos.x, FIELD.cx - margin)
    else pos.x = Math.max(pos.x, FIELD.cx + margin)
    placeTaker(p, pos)
  }

  // 2) dois jogadores do time que sai de bola se posicionam no círculo central:
  //    os dois de linha mais próximos do meio (em geral o atacante e um meia).
  const towardOwn = defendingGoalX(s.attackDir[kicking]) === 0 ? -1 : 1
  const takers = s.players
    .filter((p) => p.team === kicking && p.role !== 'GK')
    .sort((a, b) => dist(a.pos, center) - dist(b.pos, center))
  const taker = takers[0]
  const mate = takers[1]
  placeTaker(taker, { ...center })
  if (mate)
    placeTaker(
      mate,
      vec(FIELD.cx + towardOwn * KICKOFF.mateBack, FIELD.cy + KICKOFF.mateSide),
    )

  // 3) bola no centro, nos pés do batedor; o time que sai fica com a posse.
  s.ball.pos = { ...center }
  s.ball.vel = vec(0, 0)
  s.ball.z = 0
  s.ball.vz = 0
  s.ball.prevPos = { ...s.ball.pos }
  s.ball.prevZ = 0
  s.ball.spin = 0
  s.possession = kicking
  s.controllerId = taker.id
  s.lastTouchId = taker.id
  s.restartTeam = kicking
  s.goalKick = false
  s.throwIn = false
  s.freeKick = false
  endFreeKickPhase(s)
  s.penalty = false
  s.holdTime = 0
  s.kickCooldown = 0
  s.tackleCooldown = KICKOFF.deadball + DUEL.cooldown
  s.deadball = KICKOFF.deadball
  s.outOfPlay = 0 // qualquer saída de bola pendente é cancelada pelo recomeço
  s.pendingGoalLineX = null
  s.lastPasserId = null // recomeço zera a cadeia de assistência
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
const gainReach = (p: Player, ballSpeed: number, airborne: boolean): number => {
  if (p.role !== 'GK') return controlReach(p.attrs, ballSpeed)
  // o mergulho no chute forte estica mais quem tem REFLEXO (vai mais longe no susto)
  const dive =
    clamp((ballSpeed - GK.controlSpeed) * GK.diveSpeedScale, 0, GK.diveMax) *
    (GK.diveReflexFloor + nrm(p.attrs.reflexes) * GK.diveReflexSkill)
  const aerial = airborne ? nrm(p.attrs.aerialReach) * GK.aerialClaim : 0
  return gkReach(p.attrs) + dive + aerial
}

/**
 * Altura (m) que o jogador alcança a bola: jogador de linha sobe à cabeça (+ o
 * extra da competência aérea); o goleiro chega mais alto com mãos/salto
 * (+ aerialReach). Bola ACIMA disso é intocável — passa por cima do botão.
 */
const reachHeightOf = (p: Player): number =>
  p.role === 'GK'
    ? AIR.gkReachHeight + nrm(p.attrs.aerialReach) * AIR.gkReachAerial
    : AIR.reachHeight + aerialPower(p.attrs) * AIR.reachAerial

/** Candidato à bola: o mais próximo dentro do alcance — e que a alcance NA SUA
 *  ALTURA (bola alta passa por cima). Na bola no AR, a competência aérea
 *  (jumping/heading) "encurta" a distância efetiva: quem salta/cabeceia melhor
 *  ganha a dividida mesmo um pouco mais longe. */
const ballCandidate = (s: MatchState, team?: TeamId): Player | null => {
  const ballSpeed = len(s.ball.vel)
  const airborne = s.ball.z > AIR.groundBand
  let best: Player | null = null
  let bestScore = Infinity
  for (const p of s.players) {
    if (team && p.team !== team) continue
    // barreira do tiro livre: bloqueia rasteiro com o CORPO (ballPlayerCollisions),
    // mas NÃO sobe para cabecear a bola alçada por cima — esse canto é do goleiro.
    if (s.wallIds.includes(p.id)) continue
    // chute direto de falta no ar: só o GOLEIRO o disputa; jogador de linha não
    // "alivia" de cabeça um petardo enquadrado (ainda pode bloquear rasteiro).
    if (s.fkShotTimer > 0 && p.role !== 'GK') continue
    if (s.ball.z > reachHeightOf(p)) continue // bola acima do alcance: voa por cima
    const d = dist(p.pos, s.ball.pos)
    if (d >= gainReach(p, ballSpeed, airborne)) continue
    // disputa aérea: o mais forte no alto rouba metros à distância efetiva
    const score = airborne && p.role !== 'GK'
      ? d - aerialPower(p.attrs) * CONTROL.aerialDuelEdge
      : d
    if (score < bestScore) {
      bestScore = score
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
  addStoppage(s, STOPPAGE.perFoul)
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

  // DRIBLE 1v1: antes do duelo de força, o conduto pode PASSAR pelo marcador —
  // drible+agilidade desequilibram o defensor, que morde e erra; ler bem o lance
  // (anticipation/positioning) é o que evita ser passado. Beat-the-man de verdade.
  const beat = nrm(carrier.attrs.dribbling) * 0.6 + nrm(carrier.attrs.agility) * 0.4
  const read = nrm(def.attrs.anticipation) * 0.5 + nrm(def.attrs.positioning) * 0.5
  const beatProb = clamp(DUEL.beatBase + (beat - read) * DUEL.beatSwing, 0, DUEL.beatCap)
  if (rand(s) < beatProb) {
    s.tackleCooldown = DUEL.cooldown * 2
    return
  }

  const defR = tacklePower(def.attrs)
  const attR = carryPower(carrier.attrs)
  // bote mais bravo é mais comprometido: ganha mais a bola quando acerta
  const commit = 1 + nrm(def.attrs.bravery) * DUEL.braveryCommit
  const winProb = clamp(DUEL.baseWin + (defR - attR) * DUEL.duelSwing * commit, 0.12, 0.92)

  if (rand(s) < winProb) {
    // desarme limpo — defensor fica com a bola; o atacante pode tropeçar, menos
    // se tiver bom equilíbrio (balance).
    const stagger = DUEL.staggerChance * (1 - footing(carrier.attrs) * 0.6)
    if (rand(s) < stagger) carrier.stun = DUEL.staggerStun
    s.controllerId = def.id
    s.possession = def.team
    s.holdTime = 0
    s.tackleCooldown = DUEL.cooldown
    s.stats[def.team].tackles++
    s.lastPasserId = null // posse mudou de lado: zera assistência
    return
  }

  // desarme falhou — pode ter sido falta. O risco cresce com a AGRESSIVIDADE e
  // com o quanto o zagueiro teve de se ESTICAR (overreach); ler bem o lance
  // (positioning/anticipation) deixa o bote mais limpo.
  const reachOut = clamp(dist(def.pos, s.ball.pos) / tackleRange(def.attrs), 0, 1)
  const cleanCut = nrm(def.attrs.positioning) * 0.5 + nrm(def.attrs.anticipation) * 0.5
  const foulProb =
    DUEL.foulBase +
    nrm(def.attrs.aggression) * DUEL.foulAggr +
    reachOut *
      (DUEL.foulOverreach + nrm(def.attrs.bravery) * DUEL.foulBravery) *
      (1 - cleanCut * DUEL.foulClean)
  if (rand(s) < foulProb) commitFoul(s, def, carrier)
}

/**
 * Expulsa um jogador (Lei 12): some do campo (o time segue com um a menos) e
 * limpa qualquer referência pendente a ele, para não quebrar buscas por id.
 * O goleiro não é expulso neste modelo (sem reservas para substituí-lo).
 */
const sendOff = (s: MatchState, p: Player, reason: string) => {
  s.stats[p.team].reds++
  addStoppage(s, STOPPAGE.perCard)
  addEvent(s, 'card', p.team, `🟥 ${p.name} (${TEAMS[p.team].name}) — EXPULSO (${reason})`)
  if (s.controllerId === p.id) s.controllerId = null
  if (s.lastTouchId === p.id) s.lastTouchId = null
  if (s.lastPasserId === p.id) s.lastPasserId = null
  if (s.lastShooterId === p.id) s.lastShooterId = null
  s.players = s.players.filter((q) => q.id !== p.id)
}

/** Decide e aplica o cartão de uma falta: amarelo, 2º amarelo ou vermelho direto. */
const applyCard = (s: MatchState, def: Player, penalty: boolean) => {
  const prob =
    CARD.base + nrm(def.attrs.aggression) * CARD.aggressionWeight + (penalty ? CARD.penaltyBonus : 0)
  if (rand(s) >= prob) return
  // o goleiro recebe no máximo amarelo (não há reserva para expulsá-lo). A
  // AGRESSIVIDADE pesa no vermelho DIRETO: o jogador nervoso entra mais feio.
  const redFrac = CARD.straightRedFrac * (1 + nrm(def.attrs.aggression) * CARD.straightRedAggr)
  if (def.role !== 'GK' && (rand(s) < redFrac || def.yellow))
    return sendOff(s, def, def.yellow ? '2º amarelo' : 'falta grave')
  def.yellow = true
  s.stats[def.team].yellows++
  addStoppage(s, STOPPAGE.perCard)
  addEvent(s, 'card', def.team, `🟨 ${def.name} (${TEAMS[def.team].name}) — amarelo`)
}

/**
 * Resolve uma falta: conta a falta e o cartão; se foi DENTRO da própria área do
 * infrator vira PÊNALTI; senão, aplica a LEI DA VANTAGEM (segue o jogo) ou marca
 * o tiro livre no ponto da falta.
 */
const commitFoul = (s: MatchState, def: Player, carrier: Player) => {
  s.stats[def.team].fouls++
  addStoppage(s, STOPPAGE.perFoul)

  const ownGoalX = defendingGoalX(s.attackDir[def.team])
  const penalty = inPenaltyArea(carrier.pos, ownGoalX)
  applyCard(s, def, penalty)

  // vantagem: falta no campo de ataque e o atacante seguiria com a bola
  const fwd = s.attackDir[carrier.team]
  const inAttackingHalf = (carrier.pos.x - FIELD.cx) * fwd > 0
  if (!penalty && inAttackingHalf && rand(s) < ADVANTAGE.chance) {
    addEvent(s, 'foul', def.team, `Falta de ${def.name} — vantagem, ${TEAMS[carrier.team].name} segue!`)
    return // jogo continua: o atacante mantém a posse, sem bola parada
  }

  // marca a falta: o atacante caído fica no chão (foulStun) — a jogada para e
  // vira TIRO LIVRE no ponto da falta (Lei 13). Dentro da área, é pênalti.
  carrier.stun = DUEL.foulStun * (1 - knockResist(carrier.attrs) * 0.4)
  s.controllerId = null
  s.holdTime = 0

  if (penalty) return penaltyKick(s, carrier.team, ownGoalX)

  addEvent(s, 'foul', def.team, `Falta de ${def.name} sobre ${carrier.name}`)
  setupFreeKick(s, carrier.team, { ...carrier.pos })
}

/** Avaliação do batedor de falta: chuta de longe (longShots), finaliza e bate firme (technique). */
const placedKickRating = (p: Player): number =>
  nrm(p.attrs.longShots) * 0.5 + nrm(p.attrs.finishing) * 0.3 + nrm(p.attrs.technique) * 0.2

/**
 * Arma um TIRO LIVRE (Lei 13) no `spot` para `team`. Diferente de um deadball
 * qualquer: numa falta perigosa e central o batedor é o MELHOR cobrador (bate
 * direto/lança), senão é o companheiro mais próximo; e a barreira da defesa se
 * forma sozinha em `desiredTarget`. O que se FAZ com a bola (chute direto,
 * lançamento na área ou recomposição) é decidido em `decideAction`.
 */
const setupFreeKick = (s: MatchState, team: TeamId, spot: Vec2) => {
  const atkGx = attackingGoalX(s.attackDir[team])
  const dGoal = dist(spot, vec(atkGx, FIELD.cy))
  const central = Math.abs(spot.y - FIELD.cy) < FREEKICK.shootCone
  const dangerous = dGoal < FREEKICK.dangerDist

  // o cobrador (jamais o jogador caído na falta): em posição de pancada direta,
  // o melhor batedor assume; senão, o companheiro de linha mais próximo da bola.
  const eligible = s.players.filter((p) => p.team === team && p.role !== 'GK' && p.stun <= 0)
  const pool = eligible.length
    ? eligible
    : s.players.filter((p) => p.team === team && p.role !== 'GK')
  const taker =
    dangerous && central
      ? pool.reduce((b, p) => (placedKickRating(p) > placedKickRating(b) ? p : b))
      : pool.reduce((b, p) => (dist(p.pos, spot) < dist(b.pos, spot) ? p : b))

  placeTaker(taker, spot)
  // falta perigosa congela mais: a barreira se forma e o ataque carrega a área
  placeDeadBall(s, taker, team, dangerous ? FREEKICK.deadballDanger : FREEKICK.deadball)
  s.freeKick = true

  // BARREIRA (fonte única): nas faltas perigosas, fixa quais defensores formam o
  // paredão — os mais próximos do 1º pau na linha bola→gol. A IA os posta em leque
  // e o motor os deixa bloquear rasteiro mas não cabecear a bola alçada por cima.
  if (dangerous) {
    const defTeam = other(team)
    const ns = Math.sign(spot.y - FIELD.cy) || 1
    const nearPost = vec(atkGx, FIELD.cy + ns * (GOAL.width / 2))
    const wallPt = add(spot, scale(dirTo(spot, nearPost), FREEKICK.wallDist))
    s.wallIds = s.players
      .filter((p) => p.team === defTeam && p.role !== 'GK')
      .sort((a, b) => dist(a.pos, wallPt) - dist(b.pos, wallPt))
      .slice(0, FREEKICK.wallMax)
      .map((w) => w.id)
  }
}

/**
 * Cobrança de pênalti (Lei 14): bola na marca, o melhor finalizador cobra, o
 * goleiro adversário fica na linha e TODOS os demais aguardam atrás da marca,
 * fora da grande área, até o chute (ver o trava em `desiredTarget`).
 */
const penaltyKick = (s: MatchState, team: TeamId, goalX: number) => {
  const spotX = goalX === 0 ? AREA.penaltySpot : FIELD.w - AREA.penaltySpot
  const spot = vec(spotX, FIELD.cy)
  const outfield = s.players.filter((p) => p.team === team && p.role !== 'GK')
  const taker = outfield.reduce((b, p) => (p.attrs.finishing > b.attrs.finishing ? p : b))

  const into = goalX === 0 ? 1 : -1 // sentido para dentro do campo
  const edgeX = goalX === 0 ? AREA.penaltyDepth : FIELD.w - AREA.penaltyDepth
  let k = 0
  for (const p of s.players) {
    if (p.id === taker.id) {
      placeTaker(p, { ...spot })
      continue
    }
    if (p.role === 'GK') {
      // o goleiro que defende cola na linha; o outro fica no próprio gol
      placeTaker(p, p.team === team ? homePos(p, s.attackDir[p.team]) : vec(goalX, FIELD.cy))
      continue
    }
    // demais: atrás da marca e fora da grande área, espalhados na entrada dela
    const lane = edgeX + into * (PEN.waitBack + (k % 2) * 1.6)
    const yy = clamp(FIELD.cy + ((k % 8) - 3.5) * PEN.waitSpread, 4, FIELD.h - 4)
    placeTaker(p, vec(lane, yy))
    k++
  }

  s.ball.pos = { ...spot }
  s.ball.prevPos = { ...spot }
  s.ball.prevZ = 0
  s.ball.vel = vec(0, 0)
  s.ball.z = 0
  s.ball.vz = 0
  s.ball.spin = 0
  s.possession = team
  s.controllerId = taker.id
  s.lastTouchId = taker.id
  s.restartTeam = team
  s.goalKick = false
  s.throwIn = false
  s.freeKick = false
  endFreeKickPhase(s)
  s.penalty = true
  s.holdTime = 0
  s.kickCooldown = 0
  s.tackleCooldown = PEN.deadball + DUEL.cooldown
  s.deadball = PEN.deadball
  s.lastPasserId = null
  addEvent(s, 'penalty', team, `Pênalti para ${TEAMS[team].name}! ${taker.name} vai cobrar`)
}

/** Goleiro garante a posse e abre janela protegida para distribuir (item 43). */
const gkGrab = (s: MatchState, gk: Player) => {
  s.controllerId = gk.id
  s.possession = gk.team
  s.lastTouchId = gk.id
  s.lastPasserId = null
  s.holdTime = 0
  s.tackleCooldown = GK.protectWindow
  endFreeKickPhase(s) // bola defendida: barreira/janela do chute encerram
}

/** Goleiro espalma: a bola fica VIVA, desviada para fora do gol (rebote, itens 17-19). */
const spillBall = (s: MatchState, gk: Player) => {
  const dir = s.attackDir[gk.team]
  const away = defendingGoalX(dir) === 0 ? 1 : -1 // sentido para longe do próprio gol
  // handling decide a QUALIDADE do espalmar: bom goleiro joga para o lado (longe
  // do meio do gol); o fraco solta no centro, para o perigo.
  const side = gk.pos.y >= FIELD.cy ? 1 : -1 // espalma para a banda mais próxima
  const scatter = (rand(s) - 0.5) * 1.6
  const bias = nrm(gk.attrs.handling) * GK.spillWide * (Math.PI / 2) * side
  const ang = scatter * (1 - nrm(gk.attrs.handling) * GK.spillWide) + bias
  s.ball.pos = { ...gk.pos }
  s.ball.vel = vec(Math.cos(ang) * away * GK.spillSpeed, Math.sin(ang) * GK.spillSpeed)
  s.ball.spin = 0
  s.ball.z = 0 // espalmada rola pelo chão
  s.ball.vz = 0
  s.controllerId = null
  s.possession = null
  s.lastTouchId = gk.id
  s.lastPasserId = null // rebote: o gol seguinte não é "assistido"
  s.holdTime = 0
  s.kickCooldown = GK.spillCooldown // breve respiro para a segunda bola
  s.stats[gk.team].rebounds++
  endFreeKickPhase(s) // bola espalmada: rebote VIVO (zaga volta a disputar)
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
  // 6. comando de área (communication): um goleiro que organiza a defesa força
  //    o atacante a finalizar de pior ângulo/posição — defesa mais sólida.
  p += nrm(a.communication) * GK.commandSave
  // 7. CHUTE DIRETO de falta: o goleiro está postado e à espera (bola parada) —
  //    defende bem mais que num chute de jogo, segurando a conversão na faixa real.
  if (s.fkShotTimer > 0) p += FREEKICK.gkSetBonus
  return clamp(p, GK.saveFloor, GK.saveCap)
}

/** Goleiro tenta a defesa; demais jogadores apenas dominam a bola solta. */
const tryGainLoose = (s: MatchState) => {
  if (s.controllerId !== null || s.kickCooldown > 0 || s.deadball > 0) return
  const cand = ballCandidate(s)
  if (!cand) return

  if (cand.role === 'GK') {
    // o goleiro só usa as MÃOS dentro da própria grande área (Lei 12); fora dela
    // é um jogador de linha qualquer — controla a bola com os pés.
    if (!inPenaltyArea(s.ball.pos, defendingGoalX(s.attackDir[cand.team])))
      return controlLoose(s, cand)
    const a = cand.attrs
    const speed = len(s.ball.vel)

    // CRUZAMENTO/ESCANTEIO: bola alta cruzando a área SEM ir no gol → o goleiro
    // SAI e DOMINA O ALTO (aerialReach): goleiro alto manda na área. Evita contar
    // como "defesa" de chute o que é, na verdade, abafar um cruzamento.
    const gx = defendingGoalX(s.attackDir[cand.team])
    const airborne = s.ball.z > AIR.groundBand
    const onTarget = Math.abs(ballCrossY(s, gx) - FIELD.cy) < GOAL.width / 2
    if (airborne && !onTarget) {
      const claim = clamp(
        GK.claimBase + nrm(a.aerialReach) * GK.claimSkill - speed * GK.claimSpeedPen,
        GK.claimFloor,
        GK.claimCap,
      )
      if (rand(s) < claim) {
        addEvent(s, 'save', cand.team, `${cand.name} sai e abafa o cruzamento!`)
        // cravou no alto: SEGURA se as mãos seguram; senão, SOCA para longe (punho)
        return rand(s) < gkHoldChance(a, speed) ? gkGrab(s, cand) : spillBall(s, cand)
      }
      // não cravou: aerialReach baixo deixa a bola passar / dá rebote no soco
      const drop = (1 - nrm(a.aerialReach)) * GK.fumbleScale * GK.aerialDropScale
      if (rand(s) < drop) return spillBall(s, cand)
      s.kickCooldown = 0.3 // não chegou na bola — segue viva (área ainda perigosa)
      return
    }

    // bola RASTEIRA lenta (recuo/passe atrás): domina sem disputa, mas pode dar
    // "frango" (item 24). Bola no ar não cai aqui — vira abafamento ou defesa.
    if (!airborne && speed <= GK.controlSpeed) {
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
  const dir = s.attackDir[cand.team]
  const pressured =
    nearestOpponentToPoint(s, cand.team, cand.pos, AI.pressureDist) !== null

  // BOLA NO AR ao alcance da cabeça → cabeceia:
  if (s.ball.z > AIR.groundBand) {
    // 1) atacante na área adversária: cabeçada A GOL (desvio no rumo da meta);
    if (tryHeaderOnGoal(s, cand)) return
    // 2) na própria área OU pressionado no campo de defesa: CORTA de cabeça pra
    //    cima e pra longe (tira o perigo "de qualquer maneira");
    const inOwnBox = inPenaltyArea(s.ball.pos, defendingGoalX(dir))
    const ownHalf = (cand.pos.x - FIELD.cx) * dir < 0
    if (inOwnBox || (pressured && ownHalf)) return clearUpfield(s, cand)
    // 3) sem perigo: ameniza de cabeça/peito e assume (a bola desce aos pés).
    return controlLoose(s, cand)
  }

  // BOLA RASTEIRA na própria grande área e sob pressão → afasta "de qualquer
  // maneira": com gente demais na área, é perigoso dominar — manda pra cima e pra fora.
  if (inPenaltyArea(s.ball.pos, defendingGoalX(dir)) && pressured)
    return clearUpfield(s, cand)

  // jogador de linha (ou goleiro fora da área): domina a bola com os pés.
  controlLoose(s, cand)
}

/**
 * Afastamento "de qualquer maneira": o jogador joga a bola PRA CIMA e pra FRENTE,
 * longe do próprio gol — tanto o corte de cabeça na defesa quanto o alívio da bola
 * rasteira na área lotada. Mira o rumo do ataque com um leque/scatter apertado por
 * quem cabeceia/salta melhor; a bola sobe e fica VIVA (disputa quem chega).
 */
const clearUpfield = (s: MatchState, p: Player) => {
  const goalC = vec(attackingGoalX(s.attackDir[p.team]), FIELD.cy)
  let d = dirTo(p.pos, goalC)
  if (len(d) < 1e-6) d = vec(s.attackDir[p.team], 0)
  // aerialPower aperta o leque (corte mais direcionado); o atrapalhado espirra
  const scat = AIR.clearScatter * (1 - aerialPower(p.attrs) * 0.5)
  const ang = (rand(s) - 0.5) * 2 * scat
  const c = Math.cos(ang)
  const sn = Math.sin(ang)
  d = vec(d.x * c - d.y * sn, d.x * sn + d.y * c)
  s.ball.pos = { ...p.pos }
  s.ball.vel = scale(d, AIR.clearSpeedBase + aerialPower(p.attrs) * AIR.clearSpeedSkill)
  s.ball.vz = AIR.clearVz // sobe forte (parte da altura atual do contato)
  s.ball.spin = 0
  s.controllerId = null
  s.possession = p.team
  s.lastTouchId = p.id
  s.lastPasserId = null
  s.holdTime = 0
  s.kickCooldown = 0.3
  endFreeKickPhase(s) // afastou de cabeça/alívio: encerra a fase do tiro livre
}

/**
 * Cabeceio a gol num cruzamento/escanteio: bola ALTA, vinda na direção do
 * jogador, dentro da grande área de ATAQUE → o atacante sobe e cabeceia rumo à
 * meta. A chance depende de heading/impulsão (aerialPower); a cabeçada sai mais
 * fraca que um chute de pé. Espalhamento inline (rand+rotação), como em
 * spillBall — sem withNoise/spread (não estão neste escopo).
 */
const tryHeaderOnGoal = (s: MatchState, p: Player): boolean => {
  if (p.role === 'GK') return false
  if (s.ball.z <= AIR.groundBand) return false // só bola NO AR (cabeçada de verdade)
  const goalX = attackingGoalX(s.attackDir[p.team])
  if (!inPenaltyArea(s.ball.pos, goalX)) return false // só na área de ataque
  // a bola tem de estar VINDO em cima do jogador (incidente), não se afastando
  const incoming = -(
    s.ball.vel.x * (s.ball.pos.x - p.pos.x) +
    s.ball.vel.y * (s.ball.pos.y - p.pos.y)
  )
  if (incoming <= 0) return false

  // chance de uma cabeçada ENQUADRADA: competência aérea + frieza
  const ah = aerialPower(p.attrs)
  const headChance = clamp(
    HEAD.base + ah * HEAD.skill + nrm(p.attrs.composure) * HEAD.composure,
    HEAD.floor,
    HEAD.cap,
  )
  if (rand(s) >= headChance) return false // cabeçada mal dada → cai no domínio normal

  // mira o gol e desvia a bola para lá, mais fraca que um chute de pé
  const goalC = vec(goalX, FIELD.cy)
  let dir = norm(sub(goalC, p.pos))
  if (len(dir) < 1e-6) dir = norm(s.ball.vel)
  // espalhamento inline: heading apertado mira melhor (rotaciona a direção)
  const scat = HEAD.scatter * (1 - nrm(p.attrs.heading) * HEAD.scatterAim)
  const ang = (rand(s) - 0.5) * 2 * scat
  const c = Math.cos(ang)
  const sn = Math.sin(ang)
  dir = vec(dir.x * c - dir.y * sn, dir.x * sn + dir.y * c)

  const headSpeed = HEAD.speedBase + ah * HEAD.speedSkill
  s.ball.pos = { ...p.pos }
  s.ball.vel = scale(dir, headSpeed)
  s.ball.spin = 0
  s.controllerId = null
  s.possession = p.team
  s.lastTouchId = p.id
  s.lastShooterId = p.id
  s.lastShotDist = dist(p.pos, goalC)
  s.holdTime = 0
  s.kickCooldown = 0.3
  s.stats[p.team].shots++
  addEvent(s, 'shot', p.team, `Cabeçada de ${p.name}!`)
  return true
}

/**
 * Domínio da bola solta por um jogador de LINHA (ou goleiro fora da própria
 * área): pode errar o primeiro toque e a bola escapar à frente — pior cansado e
 * sem firstTouch/composure/concentração. Senão, assume a posse.
 */
const controlLoose = (s: MatchState, cand: Player) => {
  endFreeKickPhase(s) // alguém tocou a bola: encerra a fase do tiro livre
  if (rand(s) < miscontrol(cand, len(s.ball.vel))) {
    const away = len(s.ball.vel) > 0.5 ? norm(s.ball.vel) : vec(rand(s) - 0.5, rand(s) - 0.5)
    s.ball.vel = scale(norm(away), CONTROL.squirtSpeed)
    s.lastTouchId = cand.id
    s.kickCooldown = 0.2
    return
  }
  // valida a cadeia de assistência: o passe só credita assistência se quem
  // recebeu for companheiro do passador e não ele mesmo (interceptação/auto-passe
  // invalidam o crédito).
  if (s.lastPasserId !== null) {
    const passer = byId(s, s.lastPasserId)
    if (passer.team !== cand.team || passer.id === cand.id) s.lastPasserId = null
  }
  s.controllerId = cand.id
  s.possession = cand.team
  s.lastTouchId = cand.id
  s.holdTime = 0
}

/**
 * Colisão da bola SOLTA e rápida com o CORPO dos jogadores de linha: bloqueios,
 * desvios e interceptações físicas (a bola deixa de atravessar os jogadores).
 * Cada contato é uma disputa: o jogador AMORTECE (mata a bola nos pés) ou apenas
 * DESVIA (bloqueio com ricochete), conforme a habilidade — domínio/antecipação
 * na bola rasteira, impulsão/cabeceio na bola alta (firstTouch, anticipation,
 * jumping, heading). O goleiro tem o seu próprio tratamento (gainReach/defesa).
 */
const ballPlayerCollisions = (s: MatchState) => {
  if (s.controllerId !== null) return
  const b = s.ball
  // bola acima dos ombros NÃO é bloqueada pelo corpo — passa por cima do botão
  // (o cabeceio/abafamento ao alcance é tratado em tryGainLoose).
  if (b.z > AIR.bodyHeight) return
  const speed = len(b.vel)
  if (speed < COLLIDE.minSpeed) return
  const rr = PHYS.playerRadius + PHYS.ballRadius
  for (const p of s.players) {
    if (p.role === 'GK' || p.stun > 0) continue
    // não bloqueia em si mesmo quem acabou de tocar, enquanto a bola está perto
    if (p.id === s.lastTouchId && dist(p.pos, b.pos) < COLLIDE.grace) continue
    const off = sub(b.pos, p.pos)
    const d = len(off)
    if (d >= rr || d < 1e-6) continue
    const nv = scale(off, 1 / d)
    const vn = b.vel.x * nv.x + b.vel.y * nv.y
    if (vn >= 0) continue // bola já se afastando do corpo

    b.pos = add(p.pos, scale(nv, rr)) // tira a bola de dentro do corpo
    s.lastTouchId = p.id
    const lofted = b.z > AIR.groundBand || speed > CONTROL.loftSpeed
    // na bola solta 50/50, a FORÇA (ombro a ombro) ajuda a blindar e amortecer
    // o contato em vez de só ricochetear no corpo.
    // GANHAR a bola alta é impulsão (ver aerialDuelEdge); CONTROLÁ-LA é cabeceio:
    // o grande saltador sem cabeceio alcança a bola mas a desvia (flick), não amortece.
    const skill =
      (lofted
        ? nrm(p.attrs.heading) * 0.7 + nrm(p.attrs.jumping) * 0.3
        : nrm(p.attrs.firstTouch) * 0.6 + nrm(p.attrs.anticipation) * 0.4) +
      nrm(p.attrs.strength) * COLLIDE.cushionStrength

    // o BRAVO se atira na frente da bola forte: amortece/bloqueia em vez de deixar
    // ricochetear — quanto mais rápida a bola, mais mérito tem pôr o corpo nela.
    const brave =
      nrm(p.attrs.bravery) * clamp((speed - COLLIDE.minSpeed) / COLLIDE.minSpeed, 0, 1) * COLLIDE.cushionBravery
    if (rand(s) < COLLIDE.cushionBase + skill * COLLIDE.cushionSkill + brave) {
      // AMORTECE: mata a bola nos pés; vira posse no próximo domínio
      b.vel = scale(b.vel, COLLIDE.cushionKeep)
      b.spin = 0
      s.possession = p.team
    } else {
      // BLOQUEIA/DESVIA: ricocheteia no corpo com dispersão
      b.vel = sub(b.vel, scale(nv, vn * (1 + COLLIDE.restitution)))
      const a = (rand(s) - 0.5) * COLLIDE.scatter
      const c = Math.cos(a)
      const sn = Math.sin(a)
      b.vel = vec(b.vel.x * c - b.vel.y * sn, b.vel.x * sn + b.vel.y * c)
      b.spin = 0
    }
    return // no máximo um contato por passo
  }
}

/**
 * Move a bola SOLTA um passo: no ar cai pela gravidade e quica ao tocar o gramado;
 * rasteira, curva pelo efeito (Magnus) e perde força no atrito de rolagem. Só o
 * deslocamento — bloqueios no corpo e saídas de linha ficam por conta de quem chama.
 */
const advanceBallFlight = (s: MatchState, dt: number) => {
  const airborne = s.ball.z > AIR.groundBand || s.ball.vz !== 0
  if (airborne) {
    // BOLA NO AR: cai pela gravidade e quase não perde ímpeto horizontal (cruza
    // o campo). Ao tocar o chão, QUICA (perde energia) ou assenta e volta a rolar.
    s.ball.vz -= AIR.gravity * dt
    s.ball.z += s.ball.vz * dt
    s.ball.pos = add(s.ball.pos, scale(s.ball.vel, dt))
    s.ball.vel = scale(s.ball.vel, Math.pow(AIR.airDamping, dt))
    if (s.ball.z <= 0) {
      s.ball.z = 0
      // quique: inverte e amortece a vertical; se sobrou pouco, assenta (rola).
      s.ball.vz = -s.ball.vz * AIR.bounce
      if (s.ball.vz < 1.5) s.ball.vz = 0
      s.ball.vel = scale(s.ball.vel, 0.86) // atrito do toque no gramado
    }
  } else {
    // BOLA RASTEIRA: efeito (Magnus) curva a trajetória e o atrito de rolagem freia.
    if (Math.abs(s.ball.spin) > 1e-4) {
      const u = norm(s.ball.vel)
      s.ball.vel = add(s.ball.vel, scale(perp(u), s.ball.spin * dt))
      s.ball.spin *= Math.pow(PHYS.spinDecay, dt)
    }
    s.ball.pos = add(s.ball.pos, scale(s.ball.vel, dt))
    s.ball.vel = scale(s.ball.vel, Math.pow(PHYS.ballDamping, dt))
  }
  s.ball.roll += len(s.ball.vel) * dt // giro visual proporcional à velocidade
}

const teamDefending = (s: MatchState, goalX: number): TeamId =>
  defendingGoalX(s.attackDir.home) === goalX ? 'home' : 'away'

/** Trata gols, quique na trave e os reinícios de bola fora (fundo e lateral). */
const resolveBounds = (s: MatchState) => {
  const b = s.ball
  // dentro da BOCA do gol e ABAIXO do travessão — bola por cima (z alto) não é gol
  const inMouth = b.pos.y > GOAL.top && b.pos.y < GOAL.bottom && b.z < GOAL.height

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

  // linha de fundo: gol é imediato; fora do gol a bola SEGUE rolando um instante
  // (beginGoalLineOut) antes do tiro de meta/escanteio — o jogador vê que saiu.
  if (b.pos.x <= 0) {
    if (inMouth) return scoreGoal(s, teamDefending(s, 0), 0)
    return beginGoalLineOut(s, 0)
  } else if (b.pos.x >= FIELD.w) {
    if (inMouth) return scoreGoal(s, teamDefending(s, FIELD.w), FIELD.w)
    return beginGoalLineOut(s, FIELD.w)
  }

  // laterais → arremesso lateral para o adversário de QUEM TOCOU POR ÚLTIMO
  if (b.pos.y <= 0 || b.pos.y >= FIELD.h) {
    const lastTeam =
      s.lastTouchId !== null ? byId(s, s.lastTouchId).team : s.possession
    const throwTeam = lastTeam ? other(lastTeam) : 'home'
    // o cobrador fica EM CIMA da linha lateral (não dentro do campo), no ponto em
    // que a bola saiu; um leve recuo evita re-disparar a saída de bola.
    const lineY = b.pos.y <= 0 ? RESTART.throwInInset : FIELD.h - RESTART.throwInInset
    const exitX = clamp(b.pos.x, RESTART.cornerInset, FIELD.w - RESTART.cornerInset)
    const exit = vec(exitX, lineY)
    const taker = nearestOfTeamTo(s, throwTeam, exit)
    placeTaker(taker, exit)
    placeDeadBall(s, taker, throwTeam, RESTART.throwInDeadball)
    // marca o arremesso: o cobrador LANÇA COM A MÃO (bola aérea, força limitada)
    // num companheiro, em vez de tratar a bola como um passe rasteiro qualquer.
    s.throwIn = true
    s.stats[throwTeam].throwIns++
  }
}

const nearestOfTeamTo = (s: MatchState, t: TeamId, point: Vec2): Player => {
  const ok = (p: Player) => p.team === t && p.role !== 'GK' && p.stun <= 0
  const pool = s.players.filter(ok)
  const arr = pool.length ? pool : s.players.filter((p) => p.team === t && p.role !== 'GK')
  return arr.reduce((b, p) => (dist(p.pos, point) < dist(b.pos, point) ? p : b))
}

/** Recoloca o cobrador num ponto sem rastro de interpolação no render. */
const placeTaker = (p: Player, at: Vec2) => {
  p.pos = { ...at }
  p.vel = vec(0, 0)
  p.prevPos = { ...p.pos }
  p.smTarget = { ...p.pos }
  p.settled = false
}

/**
 * Põe a bola parada nos pés do cobrador e congela a jogada: o time que reinicia
 * sai com a posse, o adversário recua (ver `desiredTarget`) e ninguém desarma na
 * cobrança. Compartilhado por tiro de meta, escanteio e arremesso lateral.
 */
const placeDeadBall = (
  s: MatchState,
  taker: Player,
  team: TeamId,
  deadball: number,
) => {
  s.ball.pos = { ...taker.pos }
  s.ball.prevPos = { ...s.ball.pos }
  s.ball.prevZ = 0
  s.ball.vel = vec(0, 0)
  s.ball.z = 0
  s.ball.vz = 0
  s.ball.spin = 0
  s.possession = team
  s.restartTeam = team
  s.goalKick = false // só o tiro de meta marca true (ver `goalKick`)
  s.throwIn = false // só o arremesso lateral marca true (ver `throwIn`)
  s.freeKick = false // só o tiro livre marca true (ver `setupFreeKick`)
  endFreeKickPhase(s) // some barreira/janela anteriores; o tiro livre repõe a sua
  s.penalty = false
  s.controllerId = taker.id
  s.lastTouchId = taker.id
  s.holdTime = 0
  s.kickCooldown = 0
  s.tackleCooldown = deadball + DUEL.cooldown
  s.deadball = deadball
  s.outOfPlay = 0 // a bola foi recolocada: encerra qualquer espera de saída
  s.pendingGoalLineX = null
  s.goalKickWait = 0 // zera a espera por área limpa (só o tiro de meta a consome)
}

/**
 * Área (em `gx`) LIVRE para o tiro de meta: ninguém além do batedor (o goleiro
 * que cobra, `takerId`) está dentro da grande área. Pela Lei 16 o adversário
 * fica fora; aqui exigimos o campo inteiro fora dela — nada de cobrar com gente
 * amontoada na área.
 */
const penaltyAreaClear = (s: MatchState, gx: number, takerId: number | null): boolean =>
  !s.players.some((p) => p.id !== takerId && inPenaltyArea(p.pos, gx))

/**
 * A bola acabou de cruzar a linha de fundo fora do gol. Em vez de reiniciar na
 * hora, abre uma janela (`outOfPlay`) em que a bola SEGUE o rumo dela morrendo
 * fora de campo; só ao fim dessa espera é que `restartGoalLine` decide tiro de
 * meta ou escanteio (ver o tratamento de `outOfPlay` em `step`). `gx` é a linha
 * por onde saiu; guarda quem tocou por último (já em `lastTouchId`) no reinício.
 */
const beginGoalLineOut = (s: MatchState, gx: number) => {
  s.outOfPlay = RESTART.goalLineOutDelay
  s.pendingGoalLineX = gx
  s.controllerId = null
  s.holdTime = 0
}

/**
 * Bola na linha de fundo, fora do gol: se foi o ATACANTE que mandou para fora
 * (finalização/cruzamento errado) → tiro de meta do time que defende; se foi o
 * DEFENSOR (desvio/recuo) → escanteio do time que ataca.
 */
const restartGoalLine = (s: MatchState, gx: number) => {
  const defender = teamDefending(s, gx)
  const attacker = other(defender)
  const lastTeam =
    s.lastTouchId !== null ? byId(s, s.lastTouchId).team : s.possession
  return lastTeam === defender
    ? cornerKick(s, attacker, gx)
    : goalKick(s, defender, gx)
}

/**
 * Tiro de meta: o goleiro põe a bola na pequena área e a IA decide entre o
 * chutão longo (kicking) e o toque curto num companheiro livre (ver
 * `decideAction`). O lado da bola acompanha onde ela saiu.
 */
const goalKick = (s: MatchState, team: TeamId, gx: number) => {
  const gk = teamGk(s, team)
  const into = gx === 0 ? 1 : -1
  const side = s.ball.pos.y < FIELD.cy ? -1 : 1
  placeTaker(
    gk,
    vec(
      gx + into * RESTART.goalAreaOut,
      clamp(FIELD.cy + side * RESTART.goalAreaSide, 2, FIELD.h - 2),
    ),
  )
  placeDeadBall(s, gk, team, RESTART.goalKickDeadball)
  // marca o tiro de meta: dispara a reestruturação (Lei 16) e tira o goleiro do
  // modo "fica cozinhando a bola" — distribui assim que o time se reorganiza.
  s.goalKick = true
  s.stats[team].goalKicks++
}

/**
 * Escanteio: o atacante mais próximo cobra da bandeirinha; ao reiniciar, a IA o
 * reconhece pela posição na quina e cruza para a área (ver `decideAction`).
 */
const cornerKick = (s: MatchState, team: TeamId, gx: number) => {
  const into = gx === 0 ? 1 : -1
  const cornerY = s.ball.pos.y < FIELD.cy ? RESTART.cornerInset : FIELD.h - RESTART.cornerInset
  const corner = vec(gx + into * RESTART.cornerInset, cornerY)
  const taker = nearestOfTeamTo(s, team, corner)
  placeTaker(taker, corner)
  placeDeadBall(s, taker, team, RESTART.cornerDeadball)
  s.stats[team].corners++
  addEvent(s, 'corner', team, `Escanteio para ${TEAMS[team].name}`)
}

/**
 * Bola na rede: registra o gol e ABRE a sequência de comemoração (não recomeça
 * de imediato). A jogada congela; quem reinicia é o time que sofreu, mas só
 * depois que a comemoração termina (ver `stepCelebration`). `goalX` é a linha
 * do gol (0 ou FIELD.w) onde a bola entrou.
 */
/** Selo de marca pessoal pelo nº de gols do autor na partida. */
const goalMilestone = (goals: number): string | null =>
  goals === 2 ? 'DOBLETE!' : goals === 3 ? 'HAT-TRICK!' : goals >= 4 ? `${goals} GOLS!` : null

/** "História" do placar logo após o gol (diff = gols do autor − do adversário). */
const goalContext = (scorer: TeamId, diff: number): string | null => {
  if (diff === 0) return 'EMPATE!'
  if (diff === 1) return `${TEAMS[scorer].name.toUpperCase()} NA FRENTE!`
  if (diff > 1) return 'AMPLIA O PLACAR!'
  return 'DIMINUI!' // marcou ainda perdendo
}

const scoreGoal = (s: MatchState, conceded: TeamId, goalX: number) => {
  const scorer = other(conceded)
  // diferença ANTES do gol — define a "história" do lance (empate/virada/etc.)
  const diffBefore = s.score[scorer] - s.score[conceded]
  s.score[scorer]++
  s.penalty = false
  addStoppage(s, STOPPAGE.perGoal) // a comemoração rouba tempo → acréscimos (Lei 7)

  const shooter = s.lastShooterId !== null ? byId(s, s.lastShooterId) : null
  // só credita o autor se ele for do time que marcou (senão é gol contra)
  const author = shooter && shooter.team === scorer ? shooter : null
  if (author) author.goals++

  // assistência: último passador, se companheiro do autor e não ele mesmo
  const passer = s.lastPasserId !== null ? byId(s, s.lastPasserId) : null
  const assist =
    passer && passer.team === scorer && (!author || passer.id !== author.id) ? passer : null

  const golaco = author !== null && s.lastShotDist >= CELEBRATION.golacoDist
  const milestone = author ? goalMilestone(author.goals) : null
  const context = goalContext(scorer, diffBefore + 1)

  const who = author ? ` ${author.name}!` : '!'
  const label = golaco ? 'GOLAÇO' : 'GOL'
  const assistTxt = assist ? ` (assist. ${assist.name})` : ''
  addEvent(s, 'goal', scorer, `⚽ ${label} ${TEAMS[scorer].of}!${who}${assistTxt}`)

  // congela a bola DENTRO da rede, no ponto em que cruzou a linha — deixa
  // visível por onde o gol entrou.
  const into = goalX === 0 ? -1 : 1
  s.ball.pos = vec(
    goalX + into * GOAL.depth * 0.55,
    clamp(s.ball.pos.y, GOAL.top + 0.4, GOAL.bottom - 0.4),
  )
  s.ball.vel = vec(0, 0)
  s.ball.z = 0
  s.ball.vz = 0
  s.ball.prevPos = { ...s.ball.pos }
  s.ball.prevZ = 0
  s.ball.spin = 0
  s.controllerId = null
  s.possession = null
  s.lastPasserId = null
  endFreeKickPhase(s)

  // ponto da comemoração: escanteio do gol, do lado em que a bola entrou
  const side = s.ball.pos.y < FIELD.cy ? CELEBRATION.spotSide : FIELD.h - CELEBRATION.spotSide
  const spotX = goalX === 0 ? CELEBRATION.spotInset : FIELD.w - CELEBRATION.spotInset

  s.celebration = {
    team: scorer,
    scorerId: author ? author.id : null,
    scorerName: author ? author.name : null,
    scorerNumber: author ? author.number : null,
    scorerGoals: author ? author.goals : 0,
    assistName: assist ? assist.name : null,
    golaco,
    milestone,
    context,
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
  s.ball.prevZ = s.ball.z

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
  s.stoppage = 0 // acréscimos são por tempo — zera para o 2º tempo
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
  s.ball.prevZ = s.ball.z

  s.time += dt * MATCH.clockRate

  // transições de tempo — cada tempo dura 45min + os ACRÉSCIMOS acumulados (Lei 7)
  if (s.half === 1 && s.time >= MATCH.halfSeconds + s.stoppage) {
    switchSides(s)
    return
  }
  if (s.time >= 2 * MATCH.halfSeconds + s.stoppage) {
    s.time = 2 * MATCH.halfSeconds + s.stoppage
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
      p.energy -= sec * STAMINA.sprintDrain * intensity * (STAMINA.drainBase - sta * STAMINA.drainStamina)
    } else {
      // recupera mais rápido quem tem melhor condição física (naturalFitness);
      // a recuperação MINGUA quanto mais exausto se está (curva real de 90min),
      // mas o bom naturalFitness achata essa queda e volta mesmo gasto.
      const depletion = 1 - (1 - p.energy) * STAMINA.recoverFade * (1 - nrm(p.attrs.naturalFitness))
      p.energy += sec * STAMINA.recover * recoverMul(p.attrs) * depletion
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
  s.fkShotTimer = Math.max(0, s.fkShotTimer - dt)

  // ----- BOLA PARADA (cobrança de falta / lateral / pênalti) -----
  if (s.deadball > 0) {
    s.deadball -= dt
    if (s.deadball <= 0) s.penalty = false // fim da espera: o pênalti pode ser batido
    // TIRO DE META (Lei 16): terminado o tempo-base de reorganização, o goleiro só
    // cobra com a ÁREA LIMPA — segura a bola enquanto houver jogador (de qualquer
    // time) dentro dela, até o teto goalKickMaxWait (não trava se alguém ficar preso).
    if (s.goalKick && s.deadball <= 0 && s.restartTeam) {
      s.goalKickWait += dt
      const gx = defendingGoalX(s.attackDir[s.restartTeam])
      if (s.goalKickWait < RESTART.goalKickMaxWait && !penaltyAreaClear(s, gx, s.controllerId))
        s.deadball = dt // mantém congelado mais um passo (continua a reorganização)
    }
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
    s.ball.z = 0 // bola parada está sempre no chão
    s.ball.vz = 0
    return
  }

  // ----- BOLA FORA (saiu pela linha de fundo, morrendo antes do reinício) -----
  if (s.outOfPlay > 0) {
    s.outOfPlay -= dt
    // os jogadores se reorganizam enquanto a bola morre fora; ninguém a disputa
    for (const p of s.players) advancePlayer(s, p, dt)
    separate(s)
    // a bola SEGUE o rumo dela, sem novas checagens de linha; prende-se na faixa
    // ao redor do campo (alambrado) para continuar visível durante a espera.
    advanceBallFlight(s, dt)
    const m = RESTART.goalLineOutMargin
    if (s.ball.pos.x < -m || s.ball.pos.x > FIELD.w + m) s.ball.vel.x = 0
    if (s.ball.pos.y < -m || s.ball.pos.y > FIELD.h + m) s.ball.vel.y = 0
    s.ball.pos.x = clamp(s.ball.pos.x, -m, FIELD.w + m)
    s.ball.pos.y = clamp(s.ball.pos.y, -m, FIELD.h + m)
    if (s.outOfPlay <= 0) {
      restartGoalLine(s, s.pendingGoalLineX ?? 0)
      s.pendingGoalLineX = null
    }
    return
  }

  if (s.possession) s.stats[s.possession].possessionTicks++

  // ----- POSSE: roubada e domínio -----
  tryTackle(s)
  tryGainLoose(s)

  // ----- DECISÃO de quem está com a bola -----
  // Uma FALTA/PÊNALTI marcada agora (em tryTackle) já pôs o cobrador com a bola e
  // abriu a bola parada (deadball) NESTE passo. Não deixe ele cobrar de imediato:
  // a jogada precisa congelar para a barreira e o ataque se posicionarem — o
  // cobrador só age quando o deadball zera (o bloco de bola parada cuida do resto).
  let dribbleDir: Vec2 | null = null
  if (s.controllerId !== null && s.deadball <= 0) {
    const carrier = byId(s, s.controllerId)
    s.holdTime += dt
    const action = decideAction(s, carrier)
    if (action.type === 'dribble') {
      const goal = vec(attackingGoalX(s.attackDir[carrier.team]), FIELD.cy)
      let dd = dirTo(carrier.pos, goal)
      // conduz protegendo a bola: desvia do marcador mais próximo (retenção)
      const foe = nearestOpponentToPoint(s, carrier.team, carrier.pos, DRIBBLE.avoidRange)
      if (foe) {
        const away = dirTo(foe.pos, carrier.pos)
        const close = clamp(
          (DRIBBLE.avoidRange - dist(foe.pos, carrier.pos)) / DRIBBLE.avoidRange,
          0,
          1,
        )
        dd = norm(add(dd, scale(away, close * DRIBBLE.avoidWeight)))
      }
      dribbleDir = dd
    } else {
      const dir = dirTo(carrier.pos, action.target)
      // herda só o componente da corrida NA direção da bola: dá o passe/chute
      // "na corrida" mais forte SEM entortar a mira (momentum sem distorção).
      const carry = Math.max(0, carrier.vel.x * dir.x + carrier.vel.y * dir.y)
      s.ball.vel = scale(dir, action.speed + carry * PHYS.releaseCarry)
      // ALTURA: lançamentos/cruzamentos/chutões alçados sobem (loft); chão = 0.
      s.ball.z = 0 // bola chutada parte do gramado
      s.ball.vz = action.loft ?? 0
      // efeito lateral: forte no chute, sutil no passe (não tira o passe da mira).
      // jogadores com mais flair imprimem mais efeito (curva) na bola
      const spinMax =
        (action.type === 'shoot' ? PHYS.maxSpin : PHYS.maxSpin * PHYS.passSpinScale) *
        flairSpin(carrier.attrs)
      // No chute, o finalizador frio CURVA a bola rumo ao canto mirado (perp do
      // alvo) em vez de efeito puramente aleatório; composure firma essa mão.
      if (action.type === 'shoot') {
        const pp = perp(dir)
        const toCorner =
          (action.target.y - s.ball.pos.y) * pp.y + (action.target.x - s.ball.pos.x) * pp.x
        const aimSign = toCorner >= 0 ? 1 : -1
        const bias = SHOT.spinAimBias * nrm(carrier.attrs.composure)
        s.ball.spin = ((1 - bias) * (rand(s) - 0.5) * 2 + bias * aimSign) * spinMax
      } else {
        s.ball.spin = (rand(s) - 0.5) * 2 * spinMax
      }
      s.lastTouchId = carrier.id
      if (action.type === 'shoot') {
        s.stats[carrier.team].shots++
        s.lastShooterId = carrier.id
        // CHUTE DIRETO de falta: abre a janela em que só o goleiro o defende (os
        // jogadores de linha não cabeceiam o petardo enquadrado; ver ballCandidate)
        if (s.freeKick) s.fkShotTimer = FREEKICK.shotWindow
        // distância ao gol no instante do chute — rotula golaço de longe
        s.lastShotDist = dist(carrier.pos, vec(attackingGoalX(s.attackDir[carrier.team]), FIELD.cy))
        addEvent(s, 'shot', carrier.team, `Chute de ${carrier.name}!`)
      } else {
        // passe: o conduto atual passa a ser o candidato a assistência
        s.lastPasserId = carrier.id
      }
      s.controllerId = null
      s.goalKick = false // bola chutada/distribuída: o tiro de meta acabou
      s.throwIn = false // bola lançada: o arremesso lateral acabou
      s.freeKick = false // bola batida/lançada: o tiro livre acabou
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
    s.ball.z = 0 // bola dominada/conduzida está no chão
    s.ball.vz = 0
    s.ball.roll += len(carrier.vel) * dt
  } else {
    advanceBallFlight(s, dt)
    ballPlayerCollisions(s) // bloqueios/desvios no corpo dos jogadores de linha
    resolveBounds(s)
  }
}
