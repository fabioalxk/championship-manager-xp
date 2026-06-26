import type { Dir, MatchState, Player, TeamId, Vec2 } from './types'
import { AI, AIR, AREA, FIELD, FREEKICK, GK, GOAL, MOVE, PHYS, RESTART, SHOT, THROW } from './constants'
import { attackingGoalX, defendingGoalX, homePos } from './formation'
import {
  chaseLead,
  crossSpeed,
  crossSpread,
  gkDistroQuality,
  gkDistroSpread,
  gkHoldTime,
  gkKickReach,
  gkKickSpeed,
  gkThrowSpeed,
  holdMax,
  markPull,
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
  | { type: 'pass'; target: Vec2; speed: number; to: Player | null; loft?: number }
  | { type: 'shoot'; target: Vec2; speed: number; loft?: number }

/**
 * Arco de uma bola LANÇADA com altura: dado o alcance horizontal `d` (m) e um
 * pico de arco desejado `peak` (m), devolve a velocidade horizontal e a vertical
 * (loft) para a bola subir e POUSAR perto do alvo. O tempo de voo sai do pico
 * (t = √(8·peak/g)); a velocidade horizontal é d/t (limitada). É a fonte única do
 * tiro de meta, do chutão longo e do cruzamento flutuado.
 */
const arc = (d: number, peak: number): { speed: number; loft: number } => {
  const t = Math.sqrt((8 * peak) / AIR.gravity)
  const speed = clamp(d / t, AIR.arcSpeedMin, AIR.arcSpeedMax)
  return { speed, loft: clamp((AIR.gravity * t) / 2, 0, AIR.maxVz) }
}

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

/** Adversário de linha mais próximo deste jogador (para marcação individual). */
const nearestOpp = (s: MatchState, p: Player): Player =>
  opponents(s, p.team)
    .filter((o) => o.role !== 'GK')
    .reduce((b, o) => (dist(o.pos, p.pos) < dist(b.pos, p.pos) ? o : b))

/**
 * Espaço livre (m) à FRENTE do conduto rumo ao ataque: distância ao adversário
 * mais próximo que está adiante (no sentido de ataque) E dentro do corredor de
 * condução. Muito espaço = convite para CARREGAR a bola; pouco = melhor bater
 * ou passar. Infinity quando ninguém barra o caminho à frente.
 */
const forwardSpace = (s: MatchState, carrier: Player, fwd: number): number => {
  let min = Infinity
  for (const o of opponents(s, carrier.team)) {
    if (o.role === 'GK') continue
    if ((o.pos.x - carrier.pos.x) * fwd <= 0) continue // só quem está à frente
    if (Math.abs(o.pos.y - carrier.pos.y) > AI.carryLane) continue // fora da rota
    const d = dist(o.pos, carrier.pos)
    if (d < min) min = d
  }
  return min
}

/**
 * Onde a bola estará em `t` segundos, já considerando o amortecimento de rolagem.
 * Distância percorrida por uma bola com decaimento exponencial:
 *   ∫ v0·damp^τ dτ = v0·(damp^t − 1)/ln(damp).
 * Serve para o interceptador correr para ONDE a bola vai, não para onde está.
 */
const predictBall = (s: MatchState, t: number): Vec2 => {
  const b = s.ball
  // bola NO AR: ninguém a alcança em voo — corre para o ponto onde ela POUSA
  // (tempo de queda pela gravidade; no ar quase não há atrito horizontal).
  if (b.z > AIR.groundBand || b.vz > 0.1) {
    const tLand = (b.vz + Math.sqrt(b.vz * b.vz + 2 * AIR.gravity * b.z)) / AIR.gravity
    return add(b.pos, scale(b.vel, tLand))
  }
  const d = PHYS.ballDamping
  const ln = Math.log(d)
  const f = Math.abs(ln) > 1e-6 ? (Math.pow(d, t) - 1) / ln : t
  return add(b.pos, scale(b.vel, f))
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

/**
 * Chutão de ALÍVIO que FOGE do adversário (erro grave: servir o atacante). De um
 * leque de quedas à frente, escolhe a mais LIVRE — maior folga somando a linha de
 * chute e a zona de queda, para não bater no marcador nem cair no pé dele. O GK
 * melhor (gkDistroQuality) confia nessa leitura e desvia; o fraco puxa para o
 * chutão reto ao meio. O alcance cresce com kicking: os fortes vão da área ao
 * meio-campo, e numa saída difícil chutam o mais longe e limpo que conseguem.
 */
const gkClearTarget = (s: MatchState, gk: Player, fwd: number): Vec2 => {
  const base = clamp(gk.pos.x + fwd * gkKickReach(gk.attrs), 4, FIELD.w - 4)
  const foes = opponents(s, gk.team).filter((o) => o.role !== 'GK')
  let best = vec(base, FIELD.cy)
  let bestClear = -Infinity
  for (let i = 0; i < GK.clearLanes; i++) {
    const frac = GK.clearLanes > 1 ? i / (GK.clearLanes - 1) : 0.5
    const t = vec(base, clamp(FIELD.h * frac, 4, FIELD.h - 4))
    const lane = laneClearance(s, gk.pos, t, gk.team)
    const land = foes.length ? Math.min(...foes.map((o) => dist(o.pos, t))) : Infinity
    const clear = Math.min(lane, land)
    if (clear > bestClear) {
      bestClear = clear
      best = t
    }
  }
  // goleiro melhor segue a direção livre; pior tende ao chutão reto ao meio
  const straight = vec(base, FIELD.cy)
  const q = gkDistroQuality(gk.attrs)
  return add(straight, scale({ x: best.x - straight.x, y: best.y - straight.y }, q))
}

/**
 * Mira do chute: o canto do gol mais distante do goleiro adversário, recuado do
 * poste por uma margem. Um chute "no cantinho" é mais difícil de defender que no
 * meio do gol (o spread por finishing/longShots ainda decide se entra).
 */
const aimShot = (s: MatchState, carrier: Player, dir: Dir): Vec2 => {
  const gx = attackingGoalX(dir)
  const gk = teamGk(s, carrier.team === 'home' ? 'away' : 'home')
  const top = GOAL.top + AI.shotCornerInset
  const bottom = GOAL.bottom - AI.shotCornerInset
  // goleiro na metade de cima → mira embaixo, e vice-versa (lado aberto)
  const y = gk
    ? gk.pos.y < FIELD.cy
      ? bottom
      : top
    : carrier.pos.y < FIELD.cy
      ? bottom
      : top
  return vec(gx, y)
}

/**
 * Alvo de um CRUZAMENTO para a área de ataque: cai entre o primeiro pau e a marca
 * do pênalti, variando perto/longe da linha de fundo e ao longo da boca do gol.
 * Fonte única usada tanto no escanteio quanto no cruzamento de bola em jogo (ponta).
 */
const crossTarget = (s: MatchState, atkGx: number): Vec2 => {
  const into = atkGx === 0 ? 1 : -1
  const reach = RESTART.crossNear + rand(s) * (RESTART.crossFar - RESTART.crossNear)
  return vec(atkGx + into * reach, FIELD.cy + (rand(s) - 0.5) * GOAL.width)
}

/**
 * Bola alçada na área (escanteio ou cruzamento da linha de fundo). Boa parte sai
 * FLUTUADA — sobe à altura de cabeça e cai na área para o cabeceio (arco) — e o
 * resto vai rasteiro/forte (cruzamento tenso). `target` é o ponto de queda (antes
 * do ruído de mira); o ruído só vira a DIREÇÃO, então o arco mede a distância real.
 */
const crossAction = (
  s: MatchState,
  carrier: Player,
  target: Vec2,
  pressured: boolean,
): Action => {
  const aim = withNoise(s, carrier.pos, target, crossSpread(carrier.attrs, pressured))
  if (rand(s) < AIR.crossLoftChance) {
    const peak = AIR.crossPeakMin + rand(s) * (AIR.crossPeakMax - AIR.crossPeakMin)
    const a = arc(dist(carrier.pos, target), peak)
    return { type: 'pass', target: aim, speed: a.speed, to: null, loft: a.loft }
  }
  return { type: 'pass', target: aim, speed: crossSpeed(carrier.attrs), to: null }
}

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
    // sem a posse: empenho (workRate) + agressividade definem a intensidade da
    // pressão — o agressivo fecha mais e mais cedo (contrapeso ao risco de falta).
    e *= 0.75 + nrm(p.attrs.workRate) * 0.45 + nrm(p.attrs.aggression) * 0.12
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
  // corrida nas COSTAS da defesa: quem se movimenta bem (offTheBall) ataca a
  // linha de impedimento, ganhando profundidade até quase o último defensor.
  if (p.role !== 'GK' && p.id !== s.controllerId) {
    const line = offsideLineFwd(s, p.team, fwd) + AI.offsideSlack
    const push = nrm(p.attrs.offTheBall) * AI.offBallRunDepth
    tx = tx * (1 - push) + line * fwd * push
  }
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
  let tx = home.x + (ball.pos.x - home.x) * compact * pull + bias.x
  let ty = home.y + (ball.pos.y - FIELD.cy) * AI.blockShiftY * pull + bias.y
  // marcação individual: cola no adversário mais próximo (marking). Mantém um
  // PISO mesmo longe da bola (não larga o homem) e aperta conforme a COMUNICAÇÃO
  // do goleiro, que organiza a marcação da linha.
  let commTight = 1
  if (p.role === 'DEF' || p.role === 'MID') {
    const gkc = teamGk(s, p.team)
    if (gkc) commTight = 1 + nrm(gkc.attrs.communication) * 0.35
  }
  const m = markPull(p.attrs) * (0.35 + (1 - 0.35) * pull) * AI.markTight * commTight
  if (m > 1e-3) {
    const o = nearestOpp(s, p)
    tx += (o.pos.x - tx) * m
    ty += (o.pos.y - ty) * m
  }
  // a linha de defesa fica mais compacta conforme a comunicação do goleiro (item 8)
  if (p.role === 'DEF') {
    const gk = teamGk(s, p.team)
    const comm = gk ? nrm(gk.attrs.communication) : 0
    ty = FIELD.cy + (ty - FIELD.cy) * (1 - GK.commandShift * comm)
  }
  return vec(clamp(tx, 2, FIELD.w - 2), clamp(ty, 2, FIELD.h - 2))
}

/**
 * Reestruturação no TIRO DE META (Lei 16). Enquanto a jogada está congelada:
 * - o adversário aguarda FORA da grande área (não pode ficar dentro dela);
 * - quem cobra abre os zagueiros nas pontas (saída curta e segura) e sobe o
 *   meio/ataque para oferecer o lançamento.
 * É o tempo e a organização que faltavam — nada de cobrar com todo mundo
 * amontoado na área.
 */
const goalKickStation = (s: MatchState, p: Player): Vec2 => {
  const kt = s.restartTeam as TeamId
  const gx = defendingGoalX(s.attackDir[kt]) // linha de onde se cobra
  const into = gx === 0 ? 1 : -1 // sentido para dentro do campo

  const home = homePos(p, s.attackDir[p.team])

  if (p.team !== kt) {
    // adversário dentro da grande área → recua para a borda dela e espera
    const insideWidth = Math.abs(home.y - FIELD.cy) < AREA.penaltyHalfWidth
    const insideDepth = (home.x - gx) * into < AREA.penaltyDepth + RESTART.defendWait
    const tx =
      insideWidth && insideDepth
        ? gx + into * (AREA.penaltyDepth + RESTART.defendWait)
        : home.x
    return vec(clamp(tx, 2, FIELD.w - 2), home.y)
  }

  // zagueiros abrem nas pontas, na borda da área, dando saída curta segura
  if (p.role === 'DEF') {
    const wing = home.y < FIELD.cy ? -1 : 1
    return vec(
      gx + into * RESTART.outletDepth,
      clamp(FIELD.cy + wing * RESTART.outletWide, 5, FIELD.h - 5),
    )
  }
  // meias e atacantes saem da área e sobem para receber (medindo/lançamento)
  const up = RESTART.midfieldOutlet + ROLE_ADVANCE[p.role] * RESTART.attackOutlet
  return vec(clamp(gx + into * up, 5, FIELD.w - 5), home.y)
}

/**
 * Reestruturação no TIRO LIVRE (Lei 13). Enquanto a jogada está congelada:
 * - o time que cobra sobe para oferecer a jogada (o cobrador fica na bola);
 * - a defesa, numa falta PERIGOSA, arma a BARREIRA a 9,15 m na linha bola→gol
 *   (os defensores mais próximos do ponto da barreira a formam, espalhados na
 *   perpendicular); os demais mantêm a formação/marcação.
 */
const freeKickStation = (s: MatchState, p: Player): Vec2 => {
  const kt = s.restartTeam as TeamId
  const dir = s.attackDir[p.team]
  const home = homePos(p, dir)
  const spot = s.ball.pos

  // a falta tende a CHUTE DIRETO? (perto do gol e central) — se sim, NÃO se
  // amontoa o miolo: o lance é o cobrador colocando no canto por cima do paredão.
  const atkGx = attackingGoalX(s.attackDir[kt])
  const dGoal = dist(spot, vec(atkGx, FIELD.cy))
  const likelyDirect =
    Math.abs(spot.y - FIELD.cy) < FREEKICK.shootCone && dGoal < FREEKICK.dangerDist

  // time que cobra: o cobrador já está na bola; os demais sobem para o ataque
  if (p.team === kt) {
    if (p.id === s.controllerId) return p.pos
    // chute direto: espalha os companheiros nas PONTAS da área (rebote), longe do
    // canal central da batida — assim a zaga os segue para fora do miolo.
    if (likelyDirect) {
      const into = atkGx === 0 ? 1 : -1
      const wing = p.id % 2 === 0 ? 1 : -1
      const x = atkGx + into * (AREA.penaltyDepth - 2)
      const y = FIELD.cy + wing * (11 + (p.id % 3) * 3)
      return vec(clamp(x, 2, FIELD.w - 2), clamp(y, 4, FIELD.h - 4))
    }
    return attackTarget(s, p, sign(dir), home)
  }

  // defesa: só arma barreira nas faltas perigosas (perto do próprio gol). Longe,
  // defende normalmente (marca os adversários) em vez de amontoar no miolo.
  const goalC = vec(defendingGoalX(dir), FIELD.cy)
  if (dist(spot, goalC) >= FREEKICK.dangerDist) return defendTarget(s, p, home)

  // a barreira FECHA o 1º pau (o poste do lado da bola); o goleiro cobre o outro
  // canto. Quem a forma vem da FONTE ÚNICA `s.wallIds` (fixada no engine), em LEQUE
  // do poste para dentro — deixa o canto oposto (longe) para o goleiro defender.
  const idx = s.wallIds.indexOf(p.id)
  // fora da barreira: MARCA os atacantes (espalha pela área), em vez de fazer
  // muralha no miolo — abre o canal central para o chute por cima do paredão.
  if (idx < 0) {
    if (likelyDirect) {
      // só a ZAGA recua, e para as PONTAS (atrás do paredão, fora do canal central
      // do chute); os MEIAS ficam fora da área — não invadem a rota da bola correndo
      // do meio (era isso que abafava o chute curto: meia parado na frente da bola).
      if (p.role !== 'DEF') return homePos(p, dir)
      const into = goalC.x === 0 ? 1 : -1
      const wing = p.id % 2 === 0 ? 1 : -1
      const x = goalC.x + into * (AREA.goalDepth + 1)
      const y = FIELD.cy + wing * (AREA.goalHalfWidth + 2 + (p.id % 3))
      return vec(clamp(x, 2, FIELD.w - 2), clamp(y, 4, FIELD.h - 4))
    }
    return defendTarget(s, p, home)
  }

  // leque APERTADO no 1º pau: o 1º tapa o poste, os demais escalonam só uns metros
  // para dentro (wallWidth) — NÃO chega ao meio do gol, deixando o canto oposto
  // livre para o cobrador. Sem isso a barreira "cabeceia" o chute ao far corner.
  const ns = Math.sign(spot.y - FIELD.cy) || 1
  const frac = s.wallIds.length > 1 ? idx / (s.wallIds.length - 1) : 0
  const aimY = FIELD.cy + ns * (GOAL.width / 2 - frac * FREEKICK.wallWidth)
  const t = add(spot, scale(dirTo(spot, vec(goalC.x, aimY)), FREEKICK.wallDist))
  return vec(clamp(t.x, 2, FIELD.w - 2), clamp(t.y, 2, FIELD.h - 2))
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
    if (dToGoal < GK.dangerDist) {
      // no 1v1 (adversário conduzindo de frente) um goleiro de oneOnOne alto ABAFA,
      // avançando para fechar o ângulo em vez de esperar (itens 26, 34).
      const cap =
        s.controllerId !== null &&
        s.players.find((pl) => pl.id === s.controllerId)?.team !== p.team
          ? GK.dangerComeOut + nrm(p.attrs.oneOnOne) * GK.rushOneOnOne
          : GK.dangerComeOut
      comeOut = Math.min(comeOut, cap)
    }
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

  // Pênalti: todos (menos o batedor e os goleiros, já tratados acima) aguardam
  // onde foram posicionados — atrás da marca e fora da área — até a cobrança.
  if (s.penalty && p.id !== s.controllerId) return p.pos

  // Reinícios congelados: no TIRO DE META todos se reestruturam (Lei 16); nos
  // demais reinícios, o adversário do cobrador recua e mantém a formação.
  if (s.deadball > 0 && s.restartTeam) {
    if (s.goalKick) return goalKickStation(s, p)
    if (s.freeKick) return freeKickStation(s, p)
    if (p.team !== s.restartTeam) return homePos(p, dir)
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

/**
 * Melhor opção de passe do conduto: visão + progressão + companheiro livre + LANE
 * limpa. Devolve o candidato escolhido (m, d, forward, lane, score) ou undefined.
 */
const bestPass = (s: MatchState, carrier: Player, fwd: number) =>
  teammates(s, carrier.team)
    .filter((m) => m.id !== carrier.id && m.role !== 'GK')
    .map((m) => {
      const d = dist(carrier.pos, m.pos)
      const forward = (m.pos.x - carrier.pos.x) * fwd
      const free = nearestOppDist(s, m)
      const lane = laneClearance(s, carrier.pos, m.pos, carrier.team)
      // offTheBall do RECEBEDOR: um bom movimentador que ataca espaço à frente
      // vira uma opção PREFERIDA — o carrier "acha" quem faz a corrida certa.
      const runFwd = Math.max(0, m.vel.x * fwd)
      const optionPull = nrm(m.attrs.offTheBall) * runFwd * AI.offBallOption
      // vision PONDERA a leitura: quem enxerga mais valoriza o passe que
      // PROGRIDE e enfia em lane apertada (vê a opção difícil); quem enxerga
      // pouco fica preso no toque seguro de lado. Não é mais bônus fixo (que
      // não mudava a escolha) — agora reescala forward/lane por candidato.
      const vis = nrm(carrier.attrs.vision)
      // decisions PONDERA o risco: o decidido valoriza segurança (companheiro
      // livre + lane limpa) e desconta o passe arriscado em lane apertada; o
      // afobado supervaloriza enfiar pra frente sem ler o perigo.
      const dec = nrm(carrier.attrs.decisions)
      const risk = forward * Math.max(0, AI.laneSafe - lane) * AI.decisionRisk
      const score =
        forward * (0.6 + vis * AI.visionForward) +
        free * (0.6 + dec * AI.decisionSafe) +
        Math.min(lane, AI.laneSafe) * AI.laneWeight * (0.6 + vis * AI.visionLane) +
        optionPull * (0.5 + vis * 0.5) -
        risk * dec
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

/**
 * Cobrança de TIRO LIVRE (Lei 13). O que se faz com a bola PARADA depende de onde
 * a falta foi:
 *  1) DIRETO ao gol — perto e em ângulo: pancada firme (longShots), batida limpa
 *     sem marcação (spread menor) e com efeito (curva por cima/ao lado da barreira);
 *  2) LANÇAMENTO na área — avançado mas fechado: bola alçada para o cabeceio;
 *  3) RECOMPOSIÇÃO — longe: toque para o companheiro mais bem posicionado.
 */
const freeKickAction = (s: MatchState, carrier: Player, dir: Dir, fwd: number): Action => {
  const atkGx = attackingGoalX(dir)
  const goalC = vec(atkGx, FIELD.cy)
  const dGoal = dist(carrier.pos, goalC)
  const central = Math.abs(carrier.pos.y - FIELD.cy) < FREEKICK.shootCone

  // 1) CHUTE DIRETO: bola parada estende o alcance (batida sem pressão e firme).
  //    Mira o canto OPOSTO ao lado da bola — por cima/ao redor da barreira do 1º
  //    pau, no canto que sobra para o goleiro cobrir (curva por composure no engine).
  const directRange = shootRangeOf(carrier.attrs, AI.shootRange) + FREEKICK.directRangeBonus
  if (central && dGoal < directRange) {
    const ns = Math.sign(carrier.pos.y - FIELD.cy) || 1
    const aim = vec(atkGx, FIELD.cy - ns * (GOAL.width / 2 - AI.shotCornerInset))
    // CHUTE COLOCADO por cima do paredão: a bola tem de subir ACIMA do corpo ao
    // cruzar os 9,15 m E ainda cair sob o travessão no gol. Isso LIMITA a potência —
    // de perto não dá pra martelar por cima (sairia por cima do gol): exige colocar
    // (mais fraco, dipping); de longe pode bater mais forte. Deriva o teto de
    // velocidade da geometria do arco que chega na altura-alvo.
    const w = FREEKICK.wallDist
    const denom = AIR.bodyHeight + FREEKICK.wallClearMargin - (FREEKICK.targetHeight * w) / dGoal
    let speed = shotSpeed(carrier.attrs)
    if (denom > 0.05)
      speed = Math.min(speed, Math.sqrt((0.5 * AIR.gravity * w * (dGoal - w)) / denom))
    // loft para CHEGAR na altura-alvo (canto alto) — sobe sobre o paredão e baixa
    const tGoal = dGoal / speed
    const loft = clamp(
      (FREEKICK.targetHeight + 0.5 * AIR.gravity * tGoal * tGoal) / tGoal,
      0,
      AIR.maxVz,
    )
    const far = clamp((dGoal - 6) / 24, 0, 1)
    const power = clamp((speed - SHOT.speedBase) / (SHOT.speedStrength + SHOT.speedFinishing), 0, 1)
    // tiro livre é de BAIXA conversão: soma uma dispersão extra (vai por cima/raspando)
    const spread = shotSpread(carrier.attrs, far, false, power) + FREEKICK.aimSpread
    return {
      type: 'shoot',
      target: withNoise(s, carrier.pos, aim, spread),
      speed,
      loft,
    }
  }

  // 2) LANÇAMENTO na área: avançado o bastante para alçar a bola no ataque
  if (dGoal < FREEKICK.launchDist) {
    const target = crossTarget(s, atkGx)
    const a = arc(dist(carrier.pos, target), FREEKICK.launchPeak)
    return {
      type: 'pass',
      target: withNoise(s, carrier.pos, target, crossSpread(carrier.attrs, false)),
      speed: a.speed,
      to: null,
      loft: a.loft,
    }
  }

  // 3) RECOMPOSIÇÃO: longe do gol, arma a jogada com um passe ao melhor apoio
  const best = bestPass(s, carrier, fwd)
  if (best) {
    const speed = passSpeed(carrier.attrs)
    return {
      type: 'pass',
      target: withNoise(s, carrier.pos, passLeadPoint(carrier, best.m, speed), passSpread(carrier.attrs, false)),
      speed,
      to: best.m,
    }
  }
  // sem apoio: lançamento longo pra frente (sobe e cai no campo de ataque)
  const a = arc(35, AIR.longBallPeak)
  return { type: 'pass', target: vec(carrier.pos.x + fwd * 35, carrier.pos.y), speed: a.speed, to: null, loft: a.loft }
}

/** Decisão de quem está com a bola: conduzir, passar ou chutar. */
export const decideAction = (s: MatchState, carrier: Player): Action => {
  const dir = s.attackDir[carrier.team]
  const goal = vec(attackingGoalX(dir), FIELD.cy)
  const dGoal = dist(carrier.pos, goal)
  const pressured = nearestOppDist(s, carrier) < AI.pressureDist
  const fwd = sign(dir)

  // TIRO LIVRE (Lei 13): cobrança de falta fora da área — bate direto ao gol,
  // lança na área ou recompõe a jogada conforme a posição (ver `freeKickAction`).
  if (s.freeKick) return freeKickAction(s, carrier, dir, fwd)

  // ARREMESSO LATERAL (Lei 15): o cobrador LANÇA COM A MÃO — bola AÉREA (arco) e de
  // força limitada — buscando um COMPANHEIRO (nunca ele mesmo). O alcance cresce um
  // pouco com a força (lateral longo), mas nunca chega à potência de um chute.
  if (s.throwIn) {
    const reach = THROW.reachBase + nrm(carrier.attrs.strength) * THROW.reachStrength
    const mates = teammates(s, carrier.team).filter(
      (m) => m.id !== carrier.id && m.role !== 'GK',
    )
    // prefere o companheiro mais LIVRE e um pouco à frente, dentro do alcance da mão
    const pick = mates
      .map((m) => ({ m, d: dist(carrier.pos, m.pos), free: nearestOppDist(s, m), fwd: (m.pos.x - carrier.pos.x) * fwd }))
      .filter((c) => c.d >= THROW.minReach && c.d <= reach)
      .sort((a, b) => b.free + b.fwd * 0.4 - (a.free + a.fwd * 0.4))[0]
    // sem ninguém no alcance ideal → o companheiro mais próximo (jamais ele mesmo)
    const to =
      pick?.m ??
      mates.reduce((b, m) => (dist(carrier.pos, m.pos) < dist(carrier.pos, b.pos) ? m : b))
    const a = arc(dist(carrier.pos, to.pos), THROW.peak)
    const target = withNoise(s, carrier.pos, passLeadPoint(carrier, to, a.speed), THROW.spread)
    return { type: 'pass', target, speed: a.speed, to, loft: a.loft }
  }

  // Goleiro: distribui conforme a situação (itens 45-49).
  if (carrier.role === 'GK') {
    // chutão longo rumo ao meio-campo, mirando o cano de saída até o gol adversário.
    // sai SEMPRE com ALTURA (arco): a bola sobe e cai lá na frente, por cima de
    // todo mundo — é assim que o goleiro tira o tiro de meta e o alívio longo.
    const longKick = (to: Player | null, peak: number, panic = false) => {
      // com alvo, lidera o companheiro; sem alvo, MIRA A DIREÇÃO LIVRE (foge do atacante)
      const aim = to
        ? passLeadPoint(carrier, to, gkKickSpeed(carrier.attrs))
        : gkClearTarget(s, carrier, fwd)
      const a = arc(dist(carrier.pos, aim), peak)
      const target = withNoise(s, carrier.pos, aim, gkDistroSpread(carrier.attrs, true, panic))
      return { type: 'pass' as const, target, speed: a.speed, to, loft: a.loft }
    }

    // TIRO DE META: cerca de metade vai no CHUTÃO pra frente (companheiro mais
    // avançado e livre, senão ao meio-campo); a outra metade SAI JOGANDO curto num
    // zagueiro/companheiro que abriu FORA da área. Sem saída curta segura, bate longo.
    if (s.goalKick) {
      const adv = teammates(s, carrier.team)
        .filter((m) => m.id !== carrier.id && m.role !== 'GK')
        .map((m) => ({ m, fwdness: (m.pos.x - carrier.pos.x) * fwd, free: nearestOppDist(s, m) }))
        .filter((c) => c.fwdness > GK.goalKickMinFwd && c.free > GK.goalKickFree)
        .sort((a, b) => b.fwdness + b.free - (a.fwdness + a.free))[0]

      // saída curta segura: companheiro perto, bem livre e com a linha de passe limpa
      const short = teammates(s, carrier.team)
        .filter((m) => m.id !== carrier.id && m.role !== 'GK')
        .map((m) => ({
          m,
          d: dist(carrier.pos, m.pos),
          fwdness: (m.pos.x - carrier.pos.x) * fwd,
          free: nearestOppDist(s, m),
          lane: laneClearance(s, carrier.pos, m.pos, carrier.team),
        }))
        .filter((c) => c.d <= GK.shortMax && c.free > GK.shortFree && c.lane > GK.shortLane)
        .sort((a, b) => b.free + b.fwdness * 0.3 - (a.free + a.fwdness * 0.3))[0]

      if (rand(s) < GK.goalKickLongChance || !short)
        return longKick(adv?.m ?? null, AIR.goalKickPeak)
      const speed = gkThrowSpeed(carrier.attrs)
      return {
        type: 'pass',
        target: withNoise(s, carrier.pos, passLeadPoint(carrier, short.m, speed), gkDistroSpread(carrier.attrs, false, false)),
        speed,
        to: short.m,
      }
    }

    // BOLA EM JOGO: o REFLEXO manda — solta rápido, não fica dominando (gkHoldTime).
    if (!pressured && s.holdTime < gkHoldTime(carrier.attrs)) return { type: 'dribble' }

    // saída curta SEGURA: companheiro perto, bem livre e com a linha de passe limpa.
    const mate = teammates(s, carrier.team)
      .filter((m) => m.id !== carrier.id && m.role !== 'GK')
      .map((m) => ({
        m,
        d: dist(carrier.pos, m.pos),
        fwdness: (m.pos.x - carrier.pos.x) * fwd,
        free: nearestOppDist(s, m),
        lane: laneClearance(s, carrier.pos, m.pos, carrier.team),
      }))
      .filter((c) => c.d <= GK.shortMax && c.free > GK.shortFree && c.lane > GK.shortLane)
      .sort((a, b) => b.fwdness + b.free - (a.fwdness + a.free))[0]

    // sob pressão OU sem saída curta segura → chutão longo; senão, toque curto seguro.
    if (pressured || !mate) return longKick(mate?.m ?? null, AIR.longBallPeak, pressured)
    const target = withNoise(
      s, carrier.pos, passLeadPoint(carrier, mate.m, gkThrowSpeed(carrier.attrs)), gkDistroSpread(carrier.attrs, false, pressured),
    )
    return { type: 'pass', target, speed: gkThrowSpeed(carrier.attrs), to: mate.m }
  }

  // Cobrança de escanteio: na quina da linha de fundo de ATAQUE, cruza para a
  // área (entre o primeiro pau e a marca do pênalti), variando perto e longe.
  const atkGx = attackingGoalX(dir)
  const inCorner =
    Math.abs(carrier.pos.x - atkGx) < RESTART.cornerZone &&
    (carrier.pos.y < RESTART.cornerZone || carrier.pos.y > FIELD.h - RESTART.cornerZone)
  if (inCorner) {
    return crossAction(s, carrier, crossTarget(s, atkGx), pressured)
  }

  // CONDUÇÃO com espaço: livre de marcação e com a FRENTE aberta, o jogador
  // CARREGA a bola (drible em velocidade) rumo ao gol em vez de bater de primeira.
  // Quanto melhor o drible, mais aperto ele topa encarar. Só larga a bola quando
  // fecham o espaço (pressão) ou quando já chegou perto o bastante para finalizar.
  const room = forwardSpace(s, carrier, fwd)
  const canCarry =
    !pressured && room > AI.carryRoom * (1.3 - nrm(carrier.attrs.dribbling) * 0.6)

  // Dentro do alcance (escalado pela finalização) E em ângulo razoável → chuta.
  // decisions: o decidido só arrisca em ângulo bom; o afobado tenta de posições
  // piores (cone mais largo → finalizações de menor qualidade). De LONGE, porém,
  // com espaço para conduzir, encurta a distância antes de bater (não martela de fora).
  const cone = AI.shootCone * (1.3 - nrm(carrier.attrs.decisions) * 0.6)
  const central = Math.abs(carrier.pos.y - FIELD.cy) < cone
  const inShotRange = central && dGoal < shootRangeOf(carrier.attrs, AI.shootRange)
  if (inShotRange && (!canCarry || dGoal < AI.carryShootDist)) {
    // far 0..1 conforme a distância: perto pesa finishing, longe pesa longShots
    const far = clamp((dGoal - 6) / 24, 0, 1)
    const speed = shotSpeed(carrier.attrs)
    // potência 0..1 sobre a faixa do chute (base..máx) — bater forte custa mira
    const power = clamp((speed - SHOT.speedBase) / (SHOT.speedStrength + SHOT.speedFinishing), 0, 1)
    return {
      type: 'shoot',
      target: withNoise(s, carrier.pos, aimShot(s, carrier, dir), shotSpread(carrier.attrs, far, pressured, power)),
      speed,
    }
  }

  // Melhor opção de passe — visão + progressão + companheiro livre + LANE limpa.
  const best = bestPass(s, carrier, fwd)

  // CRUZAMENTO da PONTA (bola em jogo): aberto na ponta e perto da linha de fundo de
  // ATAQUE, o instinto é jogar na área (analogia ao escanteio). Cruza ao CHEGAR na
  // linha de fundo, sob PRESSÃO ou após SEGURAR demais; senão segue conduzindo (jogada
  // individual) para ganhar a linha. De vez em quando troca o cruzamento por um passe.
  const onWing = Math.abs(carrier.pos.y - FIELD.cy) > AI.crossZoneWide
  const inCrossZone = onWing && Math.abs(carrier.pos.x - atkGx) < AI.crossZoneDepth
  if (inCrossZone) {
    const atByline =
      Math.abs(carrier.pos.x - atkGx) < AI.crossBylineDepth || room < AI.crossBylineRoom
    if (atByline || pressured || s.holdTime > holdMax(carrier.attrs)) {
      // variação: às vezes constrói com um passe em vez de cruzar (jogada armada/recuo)
      if (best && rand(s) < AI.crossPassChance) {
        const speed = passSpeed(carrier.attrs)
        return {
          type: 'pass',
          target: withNoise(s, carrier.pos, passLeadPoint(carrier, best.m, speed), passSpread(carrier.attrs, pressured)),
          speed,
          to: best.m,
        }
      }
      return crossAction(s, carrier, crossTarget(s, atkGx), pressured)
    }
    // ainda com espaço e sem pressão → conduz para a linha de fundo (jogada individual)
    return { type: 'dribble' }
  }

  // frente aberta e sem pressão → CONDUZ a bola rumo ao gol (drible em velocidade),
  // encurtando a distância antes de decidir o passe ou o chute.
  if (canCarry) return { type: 'dribble' }

  // decisions: jogador decidido segura menos a bola antes de passar
  if (pressured || s.holdTime > holdMax(carrier.attrs)) {
    if (best) {
      // das pontas, bola enfiada/cruzada para frente usa o cruzamento (crossing);
      // caso contrário, é um passe normal (passing).
      const wide = Math.abs(carrier.pos.y - FIELD.cy) > FIELD.h * 0.3
      // quem cruza bem ARRISCA o cruzamento de mais longe; o fraco prefere o chão
      const crossFwdGate = AI.crossFwdBase - nrm(carrier.attrs.crossing) * AI.crossFwdSkill
      const useCross = wide && best.forward > crossFwdGate
      const speed = useCross ? crossSpeed(carrier.attrs) : passSpeed(carrier.attrs)
      const spr = useCross ? crossSpread(carrier.attrs, pressured) : passSpread(carrier.attrs, pressured)
      return {
        type: 'pass',
        target: withNoise(s, carrier.pos, passLeadPoint(carrier, best.m, speed), spr),
        speed,
        to: best.m,
      }
    }
    // sem opção: chutão para frente, ALÇADO (sobe e cai lá na frente, sem servir
    // o adversário no chão) — é o alívio "joga pra cima e corre atrás".
    const a = arc(30, AIR.longBallPeak)
    return {
      type: 'pass',
      target: vec(carrier.pos.x + fwd * 30, carrier.pos.y),
      speed: a.speed,
      to: null,
      loft: a.loft,
    }
  }

  return { type: 'dribble' }
}
