/**
 * MERCADO DE TRANSFERÊNCIAS — dá pra melhorar o elenco comprando? Mede a
 * distribuição de overall dos jogadores à venda por divisão, quantos são UPGRADE
 * sobre o nível da divisão, e se o preço (fee) escala com a qualidade.
 */
import { generateMarket, DIVISION_LEVEL } from '../src/game/generate'
import { makeRng, mixSeed } from '../src/game/random'
import { DIVISIONS } from '../src/game/types'

const COUNT = 40 // jogadores no mercado por divisão
const SEASONS = 100

console.log('================================================================')
console.log(' MERCADO — jogadores à venda por divisão')
console.log('================================================================')
console.log('\n  Div │ nível │ OVR mín-máx │ OVR médio │ % upgrade │ fee médio')
console.log('  ────┼───────┼─────────────┼───────────┼───────────┼──────────')

const feeByOvr: Record<number, { sum: number; n: number }> = {}
for (const div of DIVISIONS) {
  const lvl = DIVISION_LEVEL[div]
  let min = 99, max = 0, sum = 0, n = 0, up = 0, feeSum = 0
  for (let s = 0; s < SEASONS; s++) {
    const rng = makeRng(mixSeed(0xdead, mixSeed(div.charCodeAt(0), s)))
    for (const m of generateMarket(div, COUNT, rng)) {
      min = Math.min(min, m.overall); max = Math.max(max, m.overall)
      sum += m.overall; n++; feeSum += m.fee
      if (m.overall > lvl) up++
      const b = Math.round(m.overall / 5) * 5
      ;(feeByOvr[b] ??= { sum: 0, n: 0 }).sum += m.fee; feeByOvr[b].n++
    }
  }
  const M = (x: number) => (x / 1e6).toFixed(1) + 'M'
  console.log(`   ${div}  │  ${lvl}   │   ${min}-${max}    │    ${(sum / n).toFixed(0)}     │   ${((up / n) * 100).toFixed(0)}%    │  R$ ${M(feeSum / n)}`)
}

console.log('\n  Fee médio por faixa de overall (preço escala com qualidade?):')
for (const b of Object.keys(feeByOvr).map(Number).sort((a, c) => a - c)) {
  const v = feeByOvr[b]
  console.log(`   OVR ~${b}: R$ ${(v.sum / v.n / 1e6).toFixed(2)}M`)
}
console.log('\n  ➤ mercado deve ter upgrades (senão não dá pra evoluir) e preço subir forte com o overall.')
