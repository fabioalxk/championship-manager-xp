/**
 * DEFESA DO GK POR DISTÂNCIA (refina o #1) — o goleiro salva pior de perto (1v1)
 * ou de longe? Classifica cada chute (gol/defesa) por distância ao gol e mede a
 * taxa de defesa em cada faixa. Real: salva ~55% de longe, ~30% de perto (1v1 é
 * duro), mas nunca ~0. Se salva quase nada de perto → problema é o 1v1/saída.
 */
import { createMatch, step, stepCelebration } from '../src/sim/engine'
import { MATCH } from '../src/sim/constants'
import type { TeamId } from '../src/sim/types'

MATCH.clockRate = 2
const N = 16
const band = (d: number) => (d < 8 ? 0 : d < 13 ? 1 : d < 18 ? 2 : 3) // 1v1 / área / entrada / longe
const LBL = ['perto (<8m,1v1)', 'área (8-13m)', 'entrada (13-18m)', 'longe (18m+)']
const g = [0, 0, 0, 0], sv = [0, 0, 0, 0]

for (let i = 0; i < N; i++) {
  const s = createMatch()
  let prevShots = 0, prevH = 0, prevA = 0, guard = 0
  let w: { team: TeamId; shooter: number; steps: number; b: number } | null = null
  while (s.status !== 'over' && guard++ < 600_000) {
    if (s.celebration) stepCelebration(s, 1 / 30)
    else step(s, 1 / 30)
    const tot = s.stats.home.shots + s.stats.away.shots
    if (tot > prevShots) {
      const sh = s.lastShooterId !== null ? s.players.find((p) => p.id === s.lastShooterId) : null
      if (sh) w = { team: sh.team, shooter: sh.id, steps: 0, b: band(s.lastShotDist) }
      prevShots = tot
    }
    if (w) {
      w.steps++
      const gained = w.team === 'home' ? s.score.home - prevH : s.score.away - prevA
      if (gained > 0) { g[w.b]++; w = null }
      else {
        const t = s.lastTouchId
        if (t !== null && t !== w.shooter) {
          const p = s.players.find((q) => q.id === t)
          if (p && p.team !== w.team && p.role === 'GK') { sv[w.b]++; w = null }
          else if (p && p.team !== w.team) w = null // bloqueio de linha: fora da conta
        }
        if (w && w.steps > 40) w = null
      }
    }
    prevH = s.score.home; prevA = s.score.away
  }
}

console.log('================================================================')
console.log(` DEFESA DO GK POR DISTÂNCIA — ${N} jogos`)
console.log('================================================================')
console.log('\n  faixa                gol   defesa   taxa de defesa')
for (let b = 0; b < 4; b++) {
  const tot = g[b] + sv[b]
  console.log(`  ${LBL[b].padEnd(18)} ${String(g[b]).padStart(5)} ${String(sv[b]).padStart(7)}   ${tot ? ((sv[b] / tot) * 100).toFixed(0) + '%' : '—'}`)
}
console.log('\n  ➤ se "perto" salva ~0% → o GK apanha no 1v1 (lever: oneOnOne/saída); se todas baixas → fórmula geral.')
