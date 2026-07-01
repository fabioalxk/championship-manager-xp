/**
 * GOLS AÉREOS (impacto real do cruzamento OP) — % dos gols que nascem de uma
 * jogada AÉREA (a bola esteve no ar logo antes do gol = cruzamento/cabeça). Se
 * for alto (>25%), o cruzamento OP (31% isolado, it.61) domina; se baixo, é como
 * a falta: OP no isolado mas raro em jogo. Real: ~15-20% dos gols são de cabeça.
 */
import { createMatch, step, stepCelebration } from '../src/sim/engine'
import { MATCH, AIR } from '../src/sim/constants'

MATCH.clockRate = 2
const N = 16

let goals = 0, aereo = 0
for (let i = 0; i < N; i++) {
  const s = createMatch()
  let prev = 0, sinceAir = 999, guard = 0
  while (s.status !== 'over' && guard++ < 600_000) {
    if (s.celebration) stepCelebration(s, 1 / 30)
    else step(s, 1 / 30)
    sinceAir = s.ball.z > AIR.groundBand ? 0 : sinceAir + 1
    const tot = s.score.home + s.score.away
    if (tot > prev) { goals += tot - prev; if (sinceAir < 45) aereo += tot - prev; prev = tot } // bola no ar nos últimos ~3s de jogo
  }
}

console.log('================================================================')
console.log(` GOLS AÉREOS — ${N} partidas reais`)
console.log('================================================================')
console.log(`\n  Gols totais: ${goals}  (${(goals / N).toFixed(1)}/jogo)`)
console.log(`  De jogada AÉREA (cruzamento/cabeça): ${aereo}  →  ${goals ? ((aereo / goals) * 100).toFixed(0) : '—'}%   (real ~15-20%)`)
console.log(`  De chão (chute):                     ${goals - aereo}  →  ${goals ? (((goals - aereo) / goals) * 100).toFixed(0) : '—'}%`)
console.log('\n  ➤ >25% aéreo = o cruzamento OP domina (corrigir HEAD.scatter/GK); ~15-20% = saudável.')
