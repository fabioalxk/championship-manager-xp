/**
 * TOQUES por posição/jogador — fecha o diagnóstico do "ponta não marca": a bola
 * CHEGA nas pontas? Conta cada vez que um jogador assume o controle da bola
 * (controllerId muda pra ele) e cruza toques × chutes por jogador.
 */
import { createMatch, step, stepCelebration } from '../src/sim/engine'
import { MATCH } from '../src/sim/constants'
import type { Role } from '../src/sim/types'

MATCH.clockRate = 2
const N = 8

const stat: Record<string, { touches: number; shots: number; role: Role; team: string }> = {}
const get = (name: string, role: Role, team: string) => (stat[name] ??= { touches: 0, shots: 0, role, team })

for (let i = 0; i < N; i++) {
  const s = createMatch()
  let prevCtrl: number | null = null, prevShots = 0, guard = 0
  while (s.status !== 'over' && guard++ < 600_000) {
    if (s.celebration) stepCelebration(s, 1 / 30)
    else step(s, 1 / 30)
    if (s.controllerId !== null && s.controllerId !== prevCtrl) {
      const p = s.players.find((q) => q.id === s.controllerId)
      if (p) get(p.name, p.role, p.team === 'home' ? 'BRA' : 'ARG').touches++
    }
    prevCtrl = s.controllerId
    const tot = s.stats.home.shots + s.stats.away.shots
    if (tot > prevShots && s.lastShooterId !== null) {
      const p = s.players.find((q) => q.id === s.lastShooterId)
      if (p) get(p.name, p.role, p.team === 'home' ? 'BRA' : 'ARG').shots += tot - prevShots
    }
    prevShots = tot
  }
}

console.log('================================================================')
console.log(` TOQUES × CHUTES por jogador · ${N} partidas`)
console.log('================================================================')
console.log('\n   jogador            toques/jogo  chutes/jogo  chute por toque')
const sorted = Object.entries(stat).sort((a, b) => b[1].touches - a[1].touches)
for (const [name, v] of sorted.slice(0, 12)) {
  const rate = v.touches ? ((v.shots / v.touches) * 100).toFixed(0) + '%' : '—'
  console.log(`   ${v.team} ${name.padEnd(14)} ${(v.touches / N).toFixed(0).padStart(8)}    ${(v.shots / N).toFixed(1).padStart(8)}    ${rate.padStart(8)}`)
}
console.log('\n   ➤ ponta com MUITOS toques e poucos chutes → toca pro meio (decisão de IA);')
console.log('     ponta com POUCOS toques → a bola não chega nela (construção/posicionamento).')
