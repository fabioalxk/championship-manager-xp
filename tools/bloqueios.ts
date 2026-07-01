/**
 * BLOQUEIO DE CHUTE — os zagueiros travam finalizações com o corpo? Real: ~25-30%
 * dos chutes são bloqueados por um defensor antes de chegar ao gol/GK. Bloqueio
 * baixo → tudo chega no goleiro (liga a conversão alta #1 e os poucos escanteios).
 * Detecta: após um chute, um adversário de LINHA toca a bola dentro da janela.
 */
import { createMatch, step, stepCelebration } from '../src/sim/engine'
import { MATCH } from '../src/sim/constants'
import type { TeamId } from '../src/sim/types'

MATCH.clockRate = 2
const N = 14

let shots = 0, blocked = 0
for (let i = 0; i < N; i++) {
  const s = createMatch()
  let prevShots = 0, guard = 0
  let watch: { team: TeamId; shooter: number; steps: number } | null = null
  while (s.status !== 'over' && guard++ < 600_000) {
    if (s.celebration) stepCelebration(s, 1 / 30)
    else step(s, 1 / 30)
    const tot = s.stats.home.shots + s.stats.away.shots
    if (tot > prevShots) {
      shots += tot - prevShots
      if (s.lastShooterId !== null) {
        const sh = s.players.find((p) => p.id === s.lastShooterId)
        if (sh) watch = { team: sh.team, shooter: sh.id, steps: 0 }
      }
      prevShots = tot
    }
    if (watch) {
      watch.steps++
      const t = s.lastTouchId
      if (t !== null && t !== watch.shooter) {
        const p = s.players.find((q) => q.id === t)
        if (p && p.team !== watch.team && p.role !== 'GK') { blocked++; watch = null } // bloqueado por defensor de linha
        else if (p && p.role === 'GK') watch = null // chegou no goleiro
      }
      if (watch && watch.steps > 30) watch = null // ~1s: resolvido sem bloqueio
    }
  }
}

console.log('================================================================')
console.log(` BLOQUEIO DE CHUTE — ${N} partidas reais`)
console.log('================================================================')
console.log(`\n  Chutes: ${shots}  ·  Bloqueados por defensor: ${blocked}`)
console.log(`  Taxa de bloqueio: ${shots ? ((blocked / shots) * 100).toFixed(1) : '—'}%   (real ~25-30%)`)
console.log('\n  ➤ ~0% = zagueiro não bloqueia (tudo chega no GK) → menos escanteio, mais pressão no goleiro.')
