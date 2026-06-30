/**
 * DISTÂNCIA do chute e do gol — de onde se finaliza e se marca? Real: ~85% dos
 * gols saem de dentro da área (<16.5m). Usa s.lastShotDist (distância ao gol no
 * instante do chute, que o motor já calcula) no momento do chute e do gol.
 */
import { createMatch, step, stepCelebration } from '../src/sim/engine'
import { MATCH } from '../src/sim/constants'

MATCH.clockRate = 2
const N = 10

const band = (d: number) => (d < 16.5 ? 0 : d < 25 ? 1 : 2) // área / entrada / longe
const shotBands = [0, 0, 0]
const goalBands = [0, 0, 0]

for (let i = 0; i < N; i++) {
  const s = createMatch()
  let prevShots = 0, prevGoals = 0, guard = 0
  while (s.status !== 'over' && guard++ < 600_000) {
    if (s.celebration) stepCelebration(s, 1 / 30)
    else step(s, 1 / 30)
    const shots = s.stats.home.shots + s.stats.away.shots
    if (shots > prevShots) { shotBands[band(s.lastShotDist)] += shots - prevShots; prevShots = shots }
    const goals = s.score.home + s.score.away
    if (goals > prevGoals) { goalBands[band(s.lastShotDist)] += goals - prevGoals; prevGoals = goals }
  }
}

const tShot = shotBands.reduce((a, b) => a + b, 0)
const tGoal = goalBands.reduce((a, b) => a + b, 0)
const pc = (x: number, t: number) => (t ? ((x / t) * 100).toFixed(0) : '0') + '%'
console.log('================================================================')
console.log(` DISTÂNCIA do chute × gol — ${N} jogos reais`)
console.log('================================================================')
console.log('\n   faixa             chutes        gols')
console.log(`   área (<16.5m)     ${pc(shotBands[0], tShot).padStart(5)}        ${pc(goalBands[0], tGoal).padStart(5)}`)
console.log(`   entrada (16-25m)  ${pc(shotBands[1], tShot).padStart(5)}        ${pc(goalBands[1], tGoal).padStart(5)}`)
console.log(`   longe (25m+)      ${pc(shotBands[2], tShot).padStart(5)}        ${pc(goalBands[2], tGoal).padStart(5)}`)
console.log(`\n   gols de dentro da área: ${pc(goalBands[0], tGoal)}  (real ~85%)`)
console.log('   ➤ muito gol de longe = irreal; finalização de fora convertendo demais (liga ao GK fraco, #1).')
