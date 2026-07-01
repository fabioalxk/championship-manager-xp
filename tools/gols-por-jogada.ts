/**
 * ORIGEM DOS GOLS — a regressão da falta (27% de conversão) vaza pro jogo? Mede
 * a % de gols que saem de FALTA DIRETA (fkShotTimer ativo no gol) vs jogo aberto,
 * em partidas reais. Real: ~5-8% dos gols são de falta direta.
 */
import { createMatch, step, stepCelebration } from '../src/sim/engine'
import { MATCH } from '../src/sim/constants'

MATCH.clockRate = 2
const N = 14

let goals = 0, fkGoals = 0, fkShots = 0
for (let i = 0; i < N; i++) {
  const s = createMatch()
  let prev = 0, prevFk = 0, guard = 0
  while (s.status !== 'over' && guard++ < 600_000) {
    if (s.celebration) stepCelebration(s, 1 / 30)
    else step(s, 1 / 30)
    if (s.fkShotTimer > 0 && prevFk <= 0) fkShots++ // novo chute de falta batido
    prevFk = s.fkShotTimer
    const tot = s.score.home + s.score.away
    if (tot > prev) { goals += tot - prev; if (s.fkShotTimer > 0) fkGoals += tot - prev; prev = tot }
  }
}
console.log('  (chutes de falta batidos no total: ' + fkShots + ' = ' + (fkShots / N).toFixed(1) + '/jogo)')

console.log('================================================================')
console.log(` ORIGEM DOS GOLS — ${N} partidas reais`)
console.log('================================================================')
console.log(`\n  Gols totais: ${goals}  (${(goals / N).toFixed(1)}/jogo)`)
console.log(`  De FALTA direta: ${fkGoals}  →  ${goals ? ((fkGoals / goals) * 100).toFixed(0) : '—'}%   (real ~5-8%)`)
console.log(`  De jogo aberto:  ${goals - fkGoals}  →  ${goals ? (((goals - fkGoals) / goals) * 100).toFixed(0) : '—'}%`)
console.log('\n  ➤ se a falta virou >15% dos gols, a regressão (falta OP) contamina o placar do jogo.')
