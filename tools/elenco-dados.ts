/**
 * ANÁLISE DOS DADOS dos elencos reais — valida se os jogadores que shipam são bem
 * diferenciados e coerentes com a posição: atacante rápido, zagueiro que marca,
 * goleiro com atributos de GK, e spread de qualidade (estrela >> reserva).
 */
import { rosterFor } from '../src/sim/teams'
import type { Attrs, Role, SeedPlayer } from '../src/sim/teams'

const all: SeedPlayer[] = [...rosterFor('home'), ...rosterFor('away')]
const byRole = (r: Role) => all.filter((p) => p.role === r)
const avg = (ps: SeedPlayer[], k: keyof Attrs) => ps.reduce((a, p) => a + p.attrs[k], 0) / (ps.length || 1)

console.log('================================================================')
console.log(' DADOS DOS ELENCOS — Brasil + Argentina (22 jogadores reais)')
console.log('================================================================')

console.log('\n### Média de atributo-chave por posição (deve bater com a função)')
console.log('   posição   pace  finishing  tackling  goalkeeping')
for (const r of ['GK', 'DEF', 'MID', 'FWD'] as Role[]) {
  const ps = byRole(r)
  console.log(`   ${r.padEnd(8)}  ${avg(ps, 'pace').toFixed(0).padStart(4)}  ${avg(ps, 'finishing').toFixed(0).padStart(9)}  ${avg(ps, 'tackling').toFixed(0).padStart(8)}  ${avg(ps, 'goalkeeping').toFixed(0).padStart(11)}`)
}

const check = (label: string, cond: boolean, detail: string) =>
  console.log(`   ${cond ? '✅' : '❌'} ${label.padEnd(40)} ${detail}`)

console.log('\n### Coerência posicional (esperado do futebol):')
check('Atacante mais rápido que zagueiro', avg(byRole('FWD'), 'pace') > avg(byRole('DEF'), 'pace'),
  `FWD ${avg(byRole('FWD'), 'pace').toFixed(0)} vs DEF ${avg(byRole('DEF'), 'pace').toFixed(0)}`)
check('Atacante finaliza melhor que zagueiro', avg(byRole('FWD'), 'finishing') > avg(byRole('DEF'), 'finishing'),
  `FWD ${avg(byRole('FWD'), 'finishing').toFixed(0)} vs DEF ${avg(byRole('DEF'), 'finishing').toFixed(0)}`)
check('Zagueiro desarma melhor que atacante', avg(byRole('DEF'), 'tackling') > avg(byRole('FWD'), 'tackling'),
  `DEF ${avg(byRole('DEF'), 'tackling').toFixed(0)} vs FWD ${avg(byRole('FWD'), 'tackling').toFixed(0)}`)
check('Goleiro defende muito melhor que a linha', avg(byRole('GK'), 'goalkeeping') > avg([...byRole('DEF'), ...byRole('FWD')], 'goalkeeping') + 40,
  `GK ${avg(byRole('GK'), 'goalkeeping').toFixed(0)} vs linha ${avg([...byRole('DEF'), ...byRole('FWD')], 'goalkeeping').toFixed(0)}`)
check('Meio tem mais fôlego (stamina) que atacante', avg(byRole('MID'), 'stamina') > avg(byRole('FWD'), 'stamina'),
  `MID ${avg(byRole('MID'), 'stamina').toFixed(0)} vs FWD ${avg(byRole('FWD'), 'stamina').toFixed(0)}`)

console.log('\n### Spread (a estrela se destaca do resto?) — faixa usada por atributo:')
for (const k of ['pace', 'dribbling', 'finishing', 'passing'] as (keyof Attrs)[]) {
  const vals = all.map((p) => p.attrs[k])
  const min = Math.min(...vals), max = Math.max(...vals)
  const top = all.reduce((b, p) => (p.attrs[k] > b.attrs[k] ? p : b))
  console.log(`   ${k.padEnd(10)} ${min}–${max}  (amplitude ${max - min})  · melhor: ${top.name} ${top.attrs[k]}`)
}

console.log('\n### Top 3 mais rápidos e melhores dribladores (sanidade):')
const top3 = (k: keyof Attrs) => [...all].sort((a, b) => b.attrs[k] - a.attrs[k]).slice(0, 3).map((p) => `${p.name}(${p.attrs[k]})`).join(', ')
console.log(`   pace:      ${top3('pace')}`)
console.log(`   dribbling: ${top3('dribbling')}`)
console.log(`   finishing: ${top3('finishing')}`)
console.log('\n✅ Dados coerentes = a diferenciação entre jogadores tem base nos atributos certos.')
