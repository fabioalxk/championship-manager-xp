/**
 * EQUILÍBRIO do confronto — depois de deixar os elencos diversos, Brasil ×
 * Argentina segue competitivo? (não quero ter desbalanceado os times sem querer).
 * Roda head-to-head num clockRate decisivo e mede V/E/D, placar e posse.
 */
import { createMatch, step, stepCelebration } from '../src/sim/engine'
import { MATCH } from '../src/sim/constants'

MATCH.clockRate = 2
const N = 14

let winB = 0, draw = 0, winA = 0, gB = 0, gA = 0, posB = 0, posT = 0, shB = 0, shA = 0
for (let i = 0; i < N; i++) {
  const s = createMatch()
  let guard = 0
  while (s.status !== 'over' && guard++ < 600_000) {
    if (s.celebration) stepCelebration(s, 1 / 30)
    else step(s, 1 / 30)
  }
  gB += s.score.home; gA += s.score.away
  if (s.score.home > s.score.away) winB++
  else if (s.score.home < s.score.away) winA++
  else draw++
  posB += s.stats.home.possessionTicks; posT += s.stats.home.possessionTicks + s.stats.away.possessionTicks
  shB += s.stats.home.shots; shA += s.stats.away.shots
}

const p = (x: number) => ((x / N) * 100).toFixed(0) + '%'
console.log('================================================================')
console.log(` EQUILÍBRIO — Brasil × Argentina (elencos diversos) · ${N} jogos`)
console.log('================================================================')
console.log(`\n  Resultado:   Brasil V ${p(winB)} · E ${p(draw)} · D ${p(winA)} Argentina`)
console.log(`  Placar médio: ${(gB / N).toFixed(1)} x ${(gA / N).toFixed(1)}`)
console.log(`  Posse Brasil: ${((posB / posT) * 100).toFixed(0)}%`)
console.log(`  Chutes:       ${(shB / N).toFixed(0)} x ${(shA / N).toFixed(0)}`)
const edge = Math.abs(winB - winA) / N
console.log(`\n  ➤ ${edge < 0.25 ? '✅ confronto equilibrado (a diversidade não quebrou o balanço)' : '⚠️ um time domina — desbalanço'}`)
