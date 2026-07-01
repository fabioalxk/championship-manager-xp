/**
 * MARGEM DE VITÓRIA — os jogos são competitivos ou goleada? Distribui o saldo
 * final (|gols casa - fora|). Real: ~25% empate, ~30% por 1, ~35% por 2-3,
 * ~8% goleada (4+). Elencos reais, clockRate=6 (placar ~realista).
 */
import { createMatch, step, stepCelebration } from '../src/sim/engine'
import { MATCH } from '../src/sim/constants'

MATCH.clockRate = 6
const N = 30

const buck = [0, 0, 0, 0] // empate / 1 / 2-3 / 4+
let gptot = 0
for (let i = 0; i < N; i++) {
  const s = createMatch()
  let guard = 0
  while (s.status !== 'over' && guard++ < 800_000) {
    if (s.celebration) stepCelebration(s, 1 / 30)
    else step(s, 1 / 30)
  }
  const d = Math.abs(s.score.home - s.score.away)
  gptot += s.score.home + s.score.away
  buck[d === 0 ? 0 : d === 1 ? 1 : d <= 3 ? 2 : 3]++
}

const p = (x: number) => ((x / N) * 100).toFixed(0) + '%'
console.log('================================================================')
console.log(` MARGEM DE VITÓRIA — ${N} jogos (elencos reais, clockRate=6)`)
console.log('================================================================')
console.log(`\n  Gols/jogo: ${(gptot / N).toFixed(2)}`)
console.log(`\n  empate:       ${p(buck[0])}   (real ~25%)`)
console.log(`  por 1 gol:    ${p(buck[1])}   (real ~30%)`)
console.log(`  por 2-3 gols: ${p(buck[2])}   (real ~35%)`)
console.log(`  goleada (4+): ${p(buck[3])}   (real ~8%)`)
console.log(`\n  ➤ muita goleada = jogos pouco competitivos; pouco empate = sem jogo travado.`)
