/**
 * PROVA DO FIX #-4 — o overallOf mis-avalia arquétipos (GK super-avaliado cross-
 * position, lateral-ala/volante/ponta subvalorizados). Mostra o overall ATUAL vs
 * um CORRIGIDO: (1) GK normalizado à escala da linha; (2) sub-perfis por posição
 * (pega o melhor entre o perfil "clássico" e o "moderno/ofensivo").
 */
import { rosterFor } from '../src/sim/teams'
import { overallOf } from '../src/game/overall'
import { gkRating, nrm } from '../src/sim/ratings'
import type { Attrs, Role } from '../src/sim/types'

const wavg = (a: Attrs, w: Partial<Record<keyof Attrs, number>>) => {
  let s = 0, t = 0
  for (const k in w) { const weight = w[k as keyof Attrs]!; s += nrm(a[k as keyof Attrs]) * weight; t += weight }
  return Math.round((s / t) * 100)
}
// perfis ALTERNATIVOS (modernos/ofensivos) além dos clássicos do overall.ts
const ALT: Record<Exclude<Role, 'GK'>, Partial<Record<keyof Attrs, number>>> = {
  DEF: { pace: 0.18, crossing: 0.16, stamina: 0.14, workRate: 0.12, tackling: 0.16, marking: 0.14, passing: 0.1 }, // lateral-ala
  MID: { tackling: 0.2, strength: 0.16, positioning: 0.16, marking: 0.14, passing: 0.12, stamina: 0.12, workRate: 0.1 }, // volante
  FWD: { pace: 0.24, dribbling: 0.22, agility: 0.16, crossing: 0.12, flair: 0.14, finishing: 0.12 }, // ponta-drible
}
const fixed = (role: Role, a: Attrs): number => {
  if (role === 'GK') return Math.round(gkRating(a) * 0.9) // normaliza a escala do GK
  return Math.max(overallOf(role, a), wavg(a, ALT[role])) // melhor entre clássico e moderno
}

const all = [...rosterFor('home'), ...rosterFor('away')]
console.log('================================================================')
console.log(' PROVA DO FIX #-4 — overall atual × corrigido (arquétipos)')
console.log('================================================================')
console.log('\n  jogador          pos   atual → corrigido   (o que muda)')
const cases: [string, string][] = [['Alisson', 'GK super-avaliado'], ['Dibu', 'GK super-avaliado'],
  ['Wendell', 'lateral-ala'], ['Molina', 'lateral-ala'], ['Casemiro', 'volante'], ['Vini Jr.', 'ponta-drible'],
  ['Raphinha', 'ponta-drible'], ['Messi', 'craque (controle)']]
for (const [name, why] of cases) {
  const p = all.find((q) => q.name === name)!
  const cur = overallOf(p.role, p.attrs), fx = fixed(p.role, p.attrs)
  const arrow = fx > cur ? '↑' : fx < cur ? '↓' : '='
  console.log(`  ${name.padEnd(14)} ${p.role.padEnd(4)} ${String(cur).padStart(3)} → ${String(fx).padStart(3)} ${arrow}   ${why}`)
}
console.log('\n  Top 5 geral ATUAL vs CORRIGIDO:')
const top = (fn: (p: typeof all[0]) => number) => [...all].sort((a, b) => fn(b) - fn(a)).slice(0, 5).map((p) => `${p.name} ${fn(p)}`).join(', ')
console.log('   atual:     ' + top((p) => overallOf(p.role, p.attrs)))
console.log('   corrigido: ' + top((p) => fixed(p.role, p.attrs)))
console.log('\n  ➤ corrigido: GK sai do topo absoluto, lateral-ala/volante/ponta sobem p/ notas justas.')
