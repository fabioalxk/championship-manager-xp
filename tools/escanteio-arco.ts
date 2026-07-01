/**
 * ARCO DA COBRANÇA do escanteio: mede SÓ o voo da cobrança (do chute do cobrador
 * até o 1º contato na área) — pico de altura e velocidade horizontal de saída —
 * para checar se a bola sai AÉREA (alta) e mais LENTA (flutuada), não esticada.
 */
import { createMatch, step, stepCelebration } from '../src/sim/engine'
import { MATCH } from '../src/sim/constants'
import type { TeamId } from '../src/sim/types'

MATCH.clockRate = 2
const N = 16

let n = 0, sumApex = 0, sumSpeed = 0, sumFlight = 0
for (let i = 0; i < N; i++) {
  const s = createMatch()
  let ch = 0, ca = 0, guard = 0
  let w: null | {
    team: TeamId; taker: number; apex: number; speed0: number; steps: number; started: boolean;
  } = null
  while (s.status !== 'over' && guard++ < 600_000) {
    if (s.celebration) stepCelebration(s, 1 / 30)
    else step(s, 1 / 30)
    if (s.stats.home.corners > ch) { ch = s.stats.home.corners; w = { team: 'home', taker: -1, apex: 0, speed0: 0, steps: 0, started: false } }
    if (s.stats.away.corners > ca) { ca = s.stats.away.corners; w = { team: 'away', taker: -1, apex: 0, speed0: 0, steps: 0, started: false } }
    if (w) {
      const live = s.deadball <= 0 && s.controllerId === null
      if (live && !w.started) {
        // 1º frame após a cobrança: guarda o cobrador e a velocidade de saída
        w.started = true
        w.taker = s.lastTouchId ?? -1
        w.speed0 = Math.hypot(s.ball.vel.x, s.ball.vel.y)
      }
      if (w.started) {
        w.steps++
        if (s.ball.z > w.apex) w.apex = s.ball.z
        // encerra no 1º contato de OUTRO jogador (a bola foi disputada na área)
        const touchedOther = s.lastTouchId !== null && s.lastTouchId !== w.taker
        if (touchedOther || w.steps > 120) {
          if (w.speed0 > 1) { n++; sumApex += w.apex; sumSpeed += w.speed0; sumFlight += w.steps / 30 }
          w = null
        }
      }
    }
  }
}

console.log('================================================================')
console.log(` ARCO DA COBRANÇA — ${N} partidas (${n} escanteios medidos)`)
console.log('================================================================')
console.log(`\n  Pico de altura da cobrança:  ${(sumApex / n).toFixed(2)} m`)
console.log(`  Velocidade de saída:         ${(sumSpeed / n).toFixed(1)} m/s`)
console.log(`  Tempo de voo até o 1º toque: ${(sumFlight / n).toFixed(2)} s`)
console.log('\n  ➤ mais AÉREO = pico mais alto + velocidade menor + mais tempo de voo (flutua).')
