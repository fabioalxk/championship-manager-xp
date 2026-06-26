/**
 * SIMULAÇÃO À PARTE (fora do jogo) — taxa de GOL DIRETO em tiros livres.
 *
 * Não é gameplay: é um banco de provas que arma N tiros livres em posições
 * aleatórias realistas e usa o MESMO motor do jogo (decisão de cobrança + física
 * + barreira + goleiro) para medir quantas batidas viram GOL DIRETAMENTE.
 *
 * "Gol direto" = a bola entra no gol vinda do CHUTE do cobrador (crédito do gol
 * é dele), sem a defesa recuperar nem um companheiro rechutar. Lançamentos na
 * área (cruzamento de falta) NÃO contam como chute direto.
 *
 * Rodar (na raiz do projeto):
 *   node_modules/.bin/esbuild tools/freekick-sim.ts --bundle --platform=node \
 *     --format=esm --outfile=tmp-fk.mjs && node tmp-fk.mjs && rm tmp-fk.mjs
 *
 * Argumentos opcionais: node tmp-fk.mjs <nTrials> (padrão 1000).
 */
import { createMatch, step } from '../src/sim/engine'
import { DUEL, FIELD, FREEKICK, GOAL } from '../src/sim/constants'
import { attackingGoalX } from '../src/sim/formation'
import { nrm } from '../src/sim/ratings'
import { seedRng } from '../src/sim/rng'
import { dist, vec } from '../src/sim/vector'
import type { MatchState, Player, TeamId, Vec2 } from '../src/sim/types'

/** Modo de qualidade do cobrador testado. */
const MODE = (process.argv[3] ?? 'specialist') as 'specialist' | 'best'

/** Transforma o cobrador num BOM batedor de falta (especialista) — é a faixa que
 *  o usuário quer calibrar (~5–8%). Não altera o jogo: é só o sujeito do teste. */
const makeSpecialist = (p: Player) => {
  p.attrs.longShots = 90
  p.attrs.finishing = 88
  p.attrs.technique = 90
  p.attrs.composure = 88
  p.attrs.strength = 82
  p.attrs.flair = 85
}

/** RNG próprio do banco de provas (não mexe no RNG da partida) — varia as posições. */
const makeRng = (seed: number) => {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

/** Mesma avaliação de batedor do engine (longShots/finishing/technique). */
const placedKickRating = (p: Player): number =>
  nrm(p.attrs.longShots) * 0.5 + nrm(p.attrs.finishing) * 0.3 + nrm(p.attrs.technique) * 0.2

/**
 * Arma o tiro livre no estado da partida — espelha `setupFreeKick`+`placeDeadBall`
 * do engine (que são internos). O resto (decisão, barreira, física, defesa) roda
 * pelo `step` real.
 */
const armFreeKick = (s: MatchState, team: TeamId, spot: Vec2): Player => {
  const pool = s.players.filter((p) => p.team === team && p.role !== 'GK')
  const taker = pool.reduce((b, p) => (placedKickRating(p) > placedKickRating(b) ? p : b))
  if (MODE === 'specialist') makeSpecialist(taker)

  taker.pos = { ...spot }
  taker.vel = vec(0, 0)
  taker.prevPos = { ...spot }
  taker.smTarget = { ...spot }
  taker.settled = false

  const b = s.ball
  b.pos = { ...spot }
  b.prevPos = { ...spot }
  b.prevZ = 0
  b.vel = vec(0, 0)
  b.z = 0
  b.vz = 0
  b.spin = 0

  const atkGx = attackingGoalX(s.attackDir[team])
  const dGoal = dist(spot, vec(atkGx, FIELD.cy))
  const dangerous = dGoal < FREEKICK.dangerDist
  const deadball = dangerous ? FREEKICK.deadballDanger : FREEKICK.deadball

  s.possession = team
  s.restartTeam = team
  s.goalKick = false
  s.throwIn = false
  s.penalty = false
  s.freeKick = true
  s.controllerId = taker.id
  s.lastTouchId = taker.id
  s.lastShooterId = null
  s.lastPasserId = null
  s.holdTime = 0
  s.kickCooldown = 0
  s.tackleCooldown = deadball + DUEL.cooldown
  s.deadball = deadball
  s.outOfPlay = 0
  s.pendingGoalLineX = null
  s.goalKickWait = 0
  return taker
}

type Outcome = 'goal' | 'saved' | 'blocked' | 'offTarget' | 'rebound' | 'launch' | 'unresolved'
type Result = { outcome: Outcome; reachedMouth: boolean }

/** Roda UM tiro livre até resolver e classifica o desfecho. */
const runOne = (seedTrial: number, spot: Vec2): Result => {
  const s = createMatch()
  s.rngState = seedRng(seedTrial) // variedade determinística por tentativa
  const team: TeamId = 'home'
  const taker = armFreeKick(s, team, spot)
  const score0 = s.score[team]
  const goalX = attackingGoalX(s.attackDir[team])

  let kicked = false
  let reachedMouth = false
  const dt = 1 / 60
  for (let f = 0; f < 720; f++) {
    step(s, dt)

    if (!kicked && !s.freeKick) {
      // a cobrança saiu neste passo: chute direto se o crédito foi do cobrador
      kicked = true
      if (s.lastShooterId !== taker.id) return { outcome: 'launch', reachedMouth: false }
    }
    if (!kicked) continue

    // a bola chegou perto da BOCA do gol (pra separar "abafada na área" de "defesa")
    if (
      Math.abs(s.ball.pos.x - goalX) < 2 &&
      s.ball.pos.y > GOAL.top &&
      s.ball.pos.y < GOAL.bottom &&
      s.ball.z < GOAL.height
    )
      reachedMouth = true

    // GOL: placar do cobrador subiu (autor = cobrador, pois lastShooterId é dele)
    if (s.score[team] > score0) return { outcome: 'goal', reachedMouth: true }

    // a defesa recuperou (goleiro encaixou / zagueiro dominou) → defendido/bloqueado
    if (s.controllerId !== null) {
      const owner = s.players.find((p) => p.id === s.controllerId)!
      if (owner.team !== team) {
        const lastEv = s.events[s.events.length - 1]
        return { outcome: lastEv && lastEv.type === 'save' ? 'saved' : 'blocked', reachedMouth }
      }
      if (owner.id !== taker.id) return { outcome: 'rebound', reachedMouth }
    }

    // bola morreu na linha de fundo (defesa espalmou pra escanteio / passou raspando)
    if (s.outOfPlay > 0 || s.pendingGoalLineX !== null) {
      const lastEv = s.events[s.events.length - 1]
      return { outcome: lastEv && lastEv.type === 'save' ? 'saved' : 'offTarget', reachedMouth }
    }
  }
  return { outcome: 'unresolved', reachedMouth }
}

// ---------------------------------------------------------------------------
const N = Number(process.argv[2] ?? 1000)
const rng = makeRng(20260625)

const bands = [
  { label: '16–22 m', lo: 16, hi: 22 },
  { label: '22–26 m', lo: 22, hi: 26 },
  { label: '26–30 m', lo: 26, hi: 30 },
  { label: '30–36 m', lo: 30, hi: 36 },
]

const tally: Record<Outcome, number> = {
  goal: 0, saved: 0, blocked: 0, offTarget: 0, rebound: 0, launch: 0, unresolved: 0,
}
// por faixa: chutes diretos e gols (entre os que o cobrador BATEU direto)
const byBand = bands.map((b) => ({ ...b, shots: 0, goals: 0 }))
let directShots = 0
let reachedMouth = 0
// subconjunto CENTRAL (|lateral| < 9 m) — a zona clássica de tiro livre direto
let cShots = 0
let cGoals = 0

for (let i = 0; i < N; i++) {
  // posição realista de falta perigosa: 16–34 m do gol atacado (direita)
  const d = 16 + rng() * 18 // 16..34 m
  const lateral = (rng() - 0.5) * 2 * 16 // ±16 m do eixo
  const atkGx = FIELD.w
  const spot = vec(atkGx - d, FIELD.cy + lateral)
  const { outcome, reachedMouth: rm } = runOne(i + 1, spot)
  tally[outcome]++

  if (outcome !== 'launch') {
    directShots++
    if (rm) reachedMouth++
    const band = byBand.find((b) => d >= b.lo && d < b.hi)
    if (band) {
      band.shots++
      if (outcome === 'goal') band.goals++
    }
    if (Math.abs(lateral) < 9) {
      cShots++
      if (outcome === 'goal') cGoals++
    }
  }
}

const pct = (n: number) => ((n / N) * 100).toFixed(1) + '%'
const pctShots = (n: number) => (directShots ? ((n / directShots) * 100).toFixed(1) + '%' : '—')

console.log(`\n=== Tiros livres: ${N} | cobrador: ${MODE} | posições 16–34 m, ±16 m ===\n`)
console.log('Desfecho de TODAS as batidas:')
console.log(`  ⚽ gol DIRETO ......... ${tally.goal}  (${pct(tally.goal)})`)
console.log(`  🧤 defendido .......... ${tally.saved}  (${pct(tally.saved)})`)
console.log(`  🧱 na barreira ........ ${tally.blocked}  (${pct(tally.blocked)})`)
console.log(`  ↗️  fora / raspando .... ${tally.offTarget}  (${pct(tally.offTarget)})`)
console.log(`  ♻️  sobra/rebote ....... ${tally.rebound}  (${pct(tally.rebound)})`)
console.log(`  🎯 lançou (não bateu) . ${tally.launch}  (${pct(tally.launch)})`)
console.log(`  ⏳ não resolveu ....... ${tally.unresolved}  (${pct(tally.unresolved)})`)

console.log(`\nEntre as ${directShots} batidas DIRETAS:`)
console.log(`  conversão de gol direto: ${tally.goal}/${directShots} = ${pctShots(tally.goal)}`)
console.log(`  chegaram na boca do gol: ${reachedMouth}/${directShots} = ${pctShots(reachedMouth)}  (resto = abafado/bloqueado antes)`)
console.log(`\n⭐ CENTRAL (|lat|<9 m) — zona clássica de tiro livre direto:`)
console.log(`  conversão: ${cGoals}/${cShots} = ${cShots ? ((cGoals / cShots) * 100).toFixed(1) + '%' : '—'}`)

console.log('\nConversão por distância (só chutes diretos):')
for (const b of byBand) {
  const r = b.shots ? ((b.goals / b.shots) * 100).toFixed(1) + '%' : '—'
  console.log(`  ${b.label}:  ${b.goals}/${b.shots}  (${r})`)
}
console.log('')
