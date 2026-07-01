/**
 * ESCANTEIOS em partida real — frequência e perigo. Conta escanteios/jogo (stats)
 * e quantos viram GOL do time que cobra numa janela curta após a cobrança.
 * Real: ~10 escanteios/jogo, ~3% viram gol.
 */
import { createMatch, step, stepCelebration } from '../src/sim/engine'
import { MATCH } from '../src/sim/constants'
import type { TeamId } from '../src/sim/types'

MATCH.clockRate = 2
const N = 14

let corners = 0, cornerGoals = 0
for (let i = 0; i < N; i++) {
  const s = createMatch()
  let ch = 0, ca = 0, prevH = 0, prevA = 0, guard = 0
  let watch: { team: TeamId; steps: number; live: boolean } | null = null
  while (s.status !== 'over' && guard++ < 600_000) {
    if (s.celebration) stepCelebration(s, 1 / 30)
    else step(s, 1 / 30)
    // escanteio novo?
    if (s.stats.home.corners > ch) { corners += s.stats.home.corners - ch; ch = s.stats.home.corners; watch = { team: 'home', steps: 0, live: false } }
    if (s.stats.away.corners > ca) { corners += s.stats.away.corners - ca; ca = s.stats.away.corners; watch = { team: 'away', steps: 0, live: false } }
    // gol do time que cobrou dentro da janela? A janela só corre DEPOIS da cobrança
    // (a bola parada/congelamento não conta — senão o deadball longo comeria a janela).
    if (watch) {
      if (!watch.live && s.deadball <= 0 && s.controllerId === null) watch.live = true
      const gained = watch.team === 'home' ? s.score.home - prevH : s.score.away - prevA
      if (gained > 0) { cornerGoals++; watch = null }
      else if (watch.live && ++watch.steps > 120) watch = null // ~4s de JOGO expirou
    }
    prevH = s.score.home; prevA = s.score.away
  }
}

console.log('================================================================')
console.log(` ESCANTEIOS — ${N} partidas reais`)
console.log('================================================================')
console.log(`\n  Escanteios/jogo: ${(corners / N).toFixed(1)}   (real ~10)`)
console.log(`  Viraram gol:     ${cornerGoals}  →  ${corners ? ((cornerGoals / corners) * 100).toFixed(1) : '—'}%   (real ~3%)`)
console.log('\n  ➤ poucos escanteios = jogo não gera pressão de área; muito gol de escanteio = bola parada OP.')
