/**
 * CONTRIBUIÇÃO por jogador — os craques diferenciados dominam o placar? Roda
 * partidas reais e soma os GOLS por jogador (por nome, pois os ids reiniciam a
 * cada jogo). Valida que ataque marca, defesa não, e que as estrelas lideram.
 */
import { createMatch, step, stepCelebration } from '../src/sim/engine'
import { MATCH } from '../src/sim/constants'
import type { Role } from '../src/sim/types'

MATCH.clockRate = 2 // volume de gols sem rodar tempo real inteiro

const N = 10
const goals: Record<string, { g: number; role: Role; team: string }> = {}
let total = 0

for (let i = 0; i < N; i++) {
  const s = createMatch()
  let guard = 0
  while (s.status !== 'over' && guard++ < 600_000) {
    if (s.celebration) stepCelebration(s, 1 / 30)
    else step(s, 1 / 30)
  }
  for (const p of s.players) {
    if (!goals[p.name]) goals[p.name] = { g: 0, role: p.role, team: p.team === 'home' ? 'BRA' : 'ARG' }
    goals[p.name].g += p.goals
    total += p.goals
  }
}

console.log('================================================================')
console.log(` CONTRIBUIÇÃO — gols por jogador · ${N} partidas (Brasil × Argentina)`)
console.log('================================================================')

const sorted = Object.entries(goals).sort((a, b) => b[1].g - a[1].g)
console.log('\n   ARTILHEIROS (gols/jogo · % dos gols do time):')
const teamTotal = { BRA: 0, ARG: 0 } as Record<string, number>
for (const [, v] of sorted) teamTotal[v.team] += v.g
for (const [name, v] of sorted.slice(0, 12)) {
  const share = ((v.g / teamTotal[v.team]) * 100).toFixed(0)
  console.log(`   ${v.team}  ${name.padEnd(14)} ${v.role.padEnd(4)} ${(v.g / N).toFixed(2)}/jogo   ${share.padStart(3)}% do time`)
}

const byRole: Record<string, number> = {}
for (const [, v] of sorted) byRole[v.role] = (byRole[v.role] ?? 0) + v.g
console.log('\n   Gols por POSIÇÃO (% do total):')
for (const r of ['FWD', 'MID', 'DEF', 'GK'] as Role[])
  console.log(`   ${r.padEnd(4)} ${(((byRole[r] ?? 0) / total) * 100).toFixed(0).padStart(3)}%`)

console.log('\n   ➤ Esperado: atacantes lideram, estrelas (Vini/Messi/Endrick) no topo, zagueiros ~0%.')
