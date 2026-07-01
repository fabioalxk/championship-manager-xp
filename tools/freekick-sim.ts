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
import { createMatch, setupFreeKick, step } from '../src/sim/engine'
import { FIELD, GOAL } from '../src/sim/constants'
import { attackingGoalX, freeKickKind } from '../src/sim/formation'
import { seedRng } from '../src/sim/rng'
import { vec } from '../src/sim/vector'
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

/**
 * Arma o tiro livre pelo MESMO caminho do jogo — `setupFreeKick` (escolha do
 * cobrador, TIPO da cobrança, barreira e congelamento) — e só então transforma o
 * cobrador num especialista. Assim o teste vê a barreira e a decisão REAIS; o
 * resto (física, defesa, goleiro) roda pelo `step`.
 */
const armFreeKick = (s: MatchState, team: TeamId, spot: Vec2): Player => {
  setupFreeKick(s, team, spot)
  const taker = s.players.find((p) => p.id === s.controllerId)!
  if (MODE === 'specialist') makeSpecialist(taker)
  s.lastShooterId = null
  return taker
}

type Outcome = 'goal' | 'saved' | 'blocked' | 'offTarget' | 'rebound' | 'unresolved'
type Kind = 'direct' | 'cross' | 'far'
type Result = {
  kind: Kind
  shotDirect: boolean // o cobrador BATEU direto ao gol (vs. lançou/tocou)
  outcome: Outcome
  scoredByTaker: boolean // gol creditado ao cobrador (gol direto de falta)
  reachedMouth: boolean
}

/** Roda UM tiro livre até resolver e classifica o desfecho e o TIPO de cobrança. */
const runOne = (seedTrial: number, spot: Vec2): Result => {
  const s = createMatch()
  s.rngState = seedRng(seedTrial) // variedade determinística por tentativa
  const team: TeamId = 'home'
  const taker = armFreeKick(s, team, spot)
  const kind = (s.fkKind ?? 'far') as Kind
  const score0 = s.score[team]
  const goalX = attackingGoalX(s.attackDir[team])

  let kicked = false
  let shotDirect = false
  let reachedMouth = false
  const base = { kind, shotDirect: false, scoredByTaker: false }
  const dt = 1 / 60
  for (let f = 0; f < 720; f++) {
    step(s, dt)

    if (!kicked && !s.freeKick) {
      // a cobrança saiu neste passo: foi CHUTE DIRETO se o crédito é do cobrador
      kicked = true
      shotDirect = s.lastShooterId === taker.id
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

    // GOL do time que cobra (direto do cobrador OU cabeceio de companheiro no cruzamento)
    if (s.score[team] > score0)
      return { ...base, shotDirect, outcome: 'goal', scoredByTaker: s.lastShooterId === taker.id, reachedMouth }

    // a defesa recuperou (goleiro encaixou / zagueiro afastou) → defendido/bloqueado
    if (s.controllerId !== null) {
      const owner = s.players.find((p) => p.id === s.controllerId)!
      if (owner.team !== team) {
        const lastEv = s.events[s.events.length - 1]
        return { ...base, shotDirect, outcome: lastEv && lastEv.type === 'save' ? 'saved' : 'blocked', reachedMouth }
      }
      // companheiro pegou a sobra: no CHUTE DIRETO é rebote; no CRUZAMENTO deixa a
      // jogada correr (o cabeceio/finalização pode sair) — não encerra aqui.
      if (owner.id !== taker.id && shotDirect) return { ...base, shotDirect, outcome: 'rebound', reachedMouth }
    }

    // bola morreu na linha de fundo (defesa espalmou pra escanteio / passou raspando)
    if (s.outOfPlay > 0 || s.pendingGoalLineX !== null) {
      const lastEv = s.events[s.events.length - 1]
      return { ...base, shotDirect, outcome: lastEv && lastEv.type === 'save' ? 'saved' : 'offTarget', reachedMouth }
    }
  }
  return { ...base, shotDirect, outcome: 'unresolved', reachedMouth }
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

// quantos de cada TIPO de cobrança (chute direto / cruzamento / recomposição) e o
// desfecho — valida que a falta "ocorre da forma certa" conforme o LOCAL.
const kinds: Record<Kind, number> = { direct: 0, cross: 0, far: 0 }
const goalsByKind: Record<Kind, number> = { direct: 0, cross: 0, far: 0 }
// por faixa de distância: chutes DIRETOS batidos e gols diretos
const byBand = bands.map((b) => ({ ...b, shots: 0, goals: 0 }))
let directShots = 0 // cobranças em que o batedor mandou DIRETO ao gol
let directGoals = 0 // dessas, quantas viraram GOL direto (crédito do cobrador)
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
  const r = runOne(i + 1, spot)
  kinds[r.kind]++
  if (r.outcome === 'goal') goalsByKind[r.kind]++

  if (r.shotDirect) {
    directShots++
    if (r.reachedMouth) reachedMouth++
    if (r.scoredByTaker) directGoals++
    const band = byBand.find((b) => d >= b.lo && d < b.hi)
    if (band) {
      band.shots++
      if (r.scoredByTaker) band.goals++
    }
    if (Math.abs(lateral) < 9) {
      cShots++
      if (r.scoredByTaker) cGoals++
    }
  }
}

const pct = (n: number, d: number) => (d ? ((n / d) * 100).toFixed(1) + '%' : '—')

console.log(`\n=== Tiros livres: ${N} | cobrador: ${MODE} | posições 16–34 m, ±16 m ===\n`)
console.log('TIPO de cobrança conforme o LOCAL da falta (Lei 13):')
console.log(`  🎯 chute DIRETO ....... ${kinds.direct}  (${pct(kinds.direct, N)})  → ${goalsByKind.direct} gols`)
console.log(`  🪁 CRUZAMENTO na área . ${kinds.cross}  (${pct(kinds.cross, N)})  → ${goalsByKind.cross} gols (cabeça/finalização)`)
console.log(`  🔁 recomposição ....... ${kinds.far}  (${pct(kinds.far, N)})  → ${goalsByKind.far} gols`)

console.log(`\nCHUTE DIRETO — ${directShots} batidas ao gol:`)
console.log(`  conversão de gol direto: ${directGoals}/${directShots} = ${pct(directGoals, directShots)}`)
console.log(`  chegaram na boca do gol: ${reachedMouth}/${directShots} = ${pct(reachedMouth, directShots)}  (resto = na barreira/pra fora)`)
console.log(`\n⭐ CENTRAL (|lat|<9 m) — zona clássica de tiro livre direto:`)
console.log(`  conversão: ${cGoals}/${cShots} = ${pct(cGoals, cShots)}`)

console.log('\nConversão do chute direto por distância:')
for (const b of byBand) {
  console.log(`  ${b.label}:  ${b.goals}/${b.shots}  (${pct(b.goals, b.shots)})`)
}
console.log('')
