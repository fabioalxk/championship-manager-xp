/**
 * CHUTES por posição/jogador — localiza por que as pontas não marcam: elas não
 * CHUTAM (a IA nunca cria a finalização) ou chutam e ERRAM? Instrumenta cada
 * chute pelo lastShooterId no instante em que o contador de chutes sobe.
 */
import { createMatch, step, stepCelebration } from '../src/sim/engine'
import { MATCH } from '../src/sim/constants'
import type { Role } from '../src/sim/types'

MATCH.clockRate = 2
const N = 10

const sh: Record<string, { shots: number; goals: number; role: Role; team: string }> = {}
const get = (name: string, role: Role, team: string) => (sh[name] ??= { shots: 0, goals: 0, role, team })

for (let i = 0; i < N; i++) {
  const s = createMatch()
  let prevShots = 0, guard = 0
  while (s.status !== 'over' && guard++ < 600_000) {
    if (s.celebration) stepCelebration(s, 1 / 30)
    else step(s, 1 / 30)
    const tot = s.stats.home.shots + s.stats.away.shots
    if (tot > prevShots && s.lastShooterId !== null) {
      const p = s.players.find((q) => q.id === s.lastShooterId)
      if (p) get(p.name, p.role, p.team === 'home' ? 'BRA' : 'ARG').shots += tot - prevShots
    }
    prevShots = tot
  }
  for (const p of s.players) get(p.name, p.role, p.team === 'home' ? 'BRA' : 'ARG').goals += p.goals
}

console.log('================================================================')
console.log(` CHUTES × GOLS por jogador · ${N} partidas`)
console.log('================================================================')
const sorted = Object.entries(sh).sort((a, b) => b[1].shots - a[1].shots)
console.log('\n   jogador            chutes/jogo  gols/jogo  conversão')
for (const [name, v] of sorted.slice(0, 12)) {
  if (v.shots < 0.1 && v.goals < 0.1) continue
  const conv = v.shots ? ((v.goals / v.shots) * 100).toFixed(0) + '%' : '—'
  console.log(`   ${v.team} ${name.padEnd(14)} ${(v.shots / N).toFixed(1).padStart(8)}   ${(v.goals / N).toFixed(1).padStart(7)}   ${conv.padStart(7)}`)
}

const byRole: Record<string, { s: number; g: number }> = {}
for (const [, v] of Object.entries(sh)) { (byRole[v.role] ??= { s: 0, g: 0 }).s += v.shots; byRole[v.role].g += v.goals }
console.log('\n   por POSIÇÃO:   chutes/jogo   gols/jogo   conversão')
for (const r of ['FWD', 'MID', 'DEF'] as Role[]) {
  const b = byRole[r] ?? { s: 0, g: 0 }
  console.log(`   ${r.padEnd(4)}          ${(b.s / N).toFixed(1).padStart(8)}    ${(b.g / N).toFixed(1).padStart(7)}    ${b.s ? ((b.g / b.s) * 100).toFixed(0) + '%' : '—'}`)
}
console.log('\n   ➤ se a ponta tem POUCOS chutes → IA não a usa; se tem chutes e poucos gols → finalização/ângulo.')
