/**
 * GOLS/JOGO POR DIVISÃO — MOTOR FÍSICO COMPLETO (o que o jogador ASSISTE).
 * Diferente do quick-sim (Poisson), aqui rodamos a partida animada de verdade
 * (createMatch + step) com elencos REAIS gerados no nível de cada divisão,
 * escalados via lineupFor — exatamente como MatchView faz na carreira.
 * Objetivo: checar se a Série D realmente produz menos gols no motor.
 */
import { createMatch, step, stepCelebration } from '../src/sim/engine'
import { generateClub } from '../src/game/generate'
import { lineupFor } from '../src/game/lineup'
import { CLUBS_BY_DIVISION } from '../src/game/clubs'
import { makeRng, mixSeed } from '../src/game/random'
import { DIVISIONS } from '../src/game/types'
import type { Division } from '../src/game/types'
import type { MatchState } from '../src/sim/types'

// clockRate NÃO é alterado: usa o default (40) — a MESMA densidade de jogo que o
// jogador vê quando assiste a partida na carreira (MatchView).
const N = 40 // partidas por divisão

const simMatch = (homeSquad: ReturnType<typeof generateClub>['squad'], awaySquad: ReturnType<typeof generateClub>['squad']): MatchState => {
  const s = createMatch({ home: lineupFor(homeSquad), away: lineupFor(awaySquad) })
  const dt = 1 / 30
  let guard = 0
  while (s.status !== 'over' && guard++ < 300_000) {
    if (s.celebration) stepCelebration(s, dt)
    else step(s, dt)
  }
  return s
}

console.log('================================================================')
console.log(` GOLS/JOGO POR DIVISÃO — MOTOR FÍSICO (clockRate real=40) · ${N} jogos/div`)
console.log('================================================================\n')
console.log('  Div │ gols/jogo │ casa  fora │ chutes │ conv. │ defesas')
console.log('  ────┼───────────┼────────────┼────────┼───────┼────────')

for (const div of DIVISIONS as Division[]) {
  const defs = CLUBS_BY_DIVISION[div]
  let gH = 0, gA = 0, shots = 0, sot = 0, saves = 0

  for (let i = 0; i < N; i++) {
    const rng = makeRng(mixSeed(0x4d07, mixSeed(div.charCodeAt(0), i)))
    // dois clubes distintos da divisão, elencos no nível da divisão
    const hDef = defs[(i * 2) % defs.length]
    const aDef = defs[(i * 2 + 1) % defs.length]
    const home = generateClub(hDef, div, rng).squad
    const away = generateClub(aDef, div, rng).squad
    const s = simMatch(home, away)
    gH += s.score.home; gA += s.score.away
    shots += s.stats.home.shots + s.stats.away.shots
    sot += s.stats.home.shotsOnTarget + s.stats.away.shotsOnTarget
    saves += s.stats.home.saves + s.stats.away.saves
  }

  const goals = gH + gA
  const f2 = (x: number) => x.toFixed(2)
  console.log(
    `   ${div}  │   ${f2(goals / N)}    │ ${f2(gH / N)} ${f2(gA / N)}  │  ${(shots / N).toFixed(1)}  │ ${((goals / shots) * 100).toFixed(1)}% │  ${(saves / N).toFixed(1)}`,
  )
}

console.log('\n  conv. = gols / chutes   ·   (referência saudável: ~2.6 gols/jogo)')
