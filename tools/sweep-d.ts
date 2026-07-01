/** Varre o nível-base da Série D: mede nota média (pós-caos) x gols/jogo no MOTOR. */
import { createMatch, step, stepCelebration } from '../src/sim/engine'
import { generateClub, generateSquad, DIVISION_LEVEL } from '../src/game/generate'
import { overallOf } from '../src/game/overall'
import { lineupFor } from '../src/game/lineup'
import { CLUBS_BY_DIVISION } from '../src/game/clubs'
import { makeRng, mixSeed } from '../src/game/random'
import type { MatchState } from '../src/sim/types'

const N = 40
const simMatch = (h: ReturnType<typeof generateClub>['squad'], a: ReturnType<typeof generateClub>['squad']): MatchState => {
  const s = createMatch({ home: lineupFor(h), away: lineupFor(a) })
  const dt = 1 / 30
  let guard = 0
  while (s.status !== 'over' && guard++ < 300_000) {
    if (s.celebration) stepCelebration(s, dt)
    else step(s, dt)
  }
  return s
}

console.log('  baseD │ nota média │ gols/jogo │ chutes')
console.log('  ──────┼────────────┼───────────┼───────')
for (const base of [41, 48, 55, 62, 64]) {
  DIVISION_LEVEL.D = base
  // nota média pós-caos
  let ovSum = 0, ovN = 0
  for (let s = 0; s < 30; s++) {
    for (const p of generateSquad('D', makeRng(2000 + s))) {
      if (p.role === 'GK') continue
      ovSum += overallOf(p.role, p.attrs); ovN++
    }
  }
  const defs = CLUBS_BY_DIVISION.D
  let goals = 0, shots = 0
  for (let i = 0; i < N; i++) {
    const rng = makeRng(mixSeed(0x4d07, mixSeed('D'.charCodeAt(0), i)))
    const home = generateClub(defs[(i * 2) % defs.length], 'D', rng).squad
    const away = generateClub(defs[(i * 2 + 1) % defs.length], 'D', rng).squad
    const st = simMatch(home, away)
    goals += st.score.home + st.score.away
    shots += st.stats.home.shots + st.stats.away.shots
  }
  console.log(`   ${base}  │    ${(ovSum / ovN).toFixed(1)}    │   ${(goals / N).toFixed(2)}    │  ${(shots / N).toFixed(1)}`)
}
