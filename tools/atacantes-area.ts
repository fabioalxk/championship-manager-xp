/**
 * ATACANTES NA ÁREA no cruzamento (feature nova) — quando um cruzamento está NO AR
 * sobre a grande área, quantos jogadores do time que ATACA estão DENTRO da área
 * pra cabecear? Antes: "ninguém estava na área e todo cruzamento era abafado".
 */
import { createMatch, step, stepCelebration } from '../src/sim/engine'
import { MATCH, AIR, FIELD } from '../src/sim/constants'
import { inPenaltyArea, attackingGoalX } from '../src/sim/formation'
import type { TeamId } from '../src/sim/types'

MATCH.clockRate = 2
const N = 10

let samples = 0, withRunner = 0, totalInBox = 0
for (let i = 0; i < N; i++) {
  const s = createMatch()
  let guard = 0
  while (s.status !== 'over' && guard++ < 600_000) {
    if (s.celebration) stepCelebration(s, 1 / 30)
    else step(s, 1 / 30)
    if (s.ball.z <= AIR.groundBand) continue // só bola NO AR
    // a bola está sobre/perto de alguma grande área?
    for (const gx of [0, FIELD.w]) {
      if (!inPenaltyArea(s.ball.pos, gx)) continue
      // time que ATACA esse gol (attackingGoalX == gx)
      const atk: TeamId | null = attackingGoalX(s.attackDir.home) === gx ? 'home'
        : attackingGoalX(s.attackDir.away) === gx ? 'away' : null
      if (!atk) continue
      const inBox = s.players.filter((p) => p.team === atk && p.role !== 'GK' && inPenaltyArea(p.pos, gx)).length
      samples++; totalInBox += inBox; if (inBox >= 1) withRunner++
    }
  }
}

console.log('================================================================')
console.log(` ATACANTES NA ÁREA no cruzamento — ${N} jogos`)
console.log('================================================================')
console.log(`\n  Momentos de bola alta na área: ${samples}`)
console.log(`  Média de atacantes na área:    ${samples ? (totalInBox / samples).toFixed(2) : '—'}`)
console.log(`  % com pelo menos 1 atacante:   ${samples ? ((withRunner / samples) * 100).toFixed(0) : '—'}%`)
console.log('\n  ➤ >0 atacantes = a feature funciona (tem quem cabecear); ~0 = cruzamento morre abafado.')
