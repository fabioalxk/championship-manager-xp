/**
 * SENSIBILIDADE do quick-sim à FORÇA — localiza o achado da tabela aleatória.
 * Mede a % de vitória do favorito (e gols) por diferença de força no quickResult.
 * Aponta o ajuste exato em quicksim.ts (o favorito deveria vencer mais).
 */
import { quickResult } from '../src/game/quicksim'
import { makeRng, mixSeed } from '../src/game/random'

const N = 40_000
const rng = makeRng(mixSeed(0x511, 7))

console.log('================================================================')
console.log(' QUICK-SIM — % de vitória do favorito por GAP de força')
console.log('================================================================')
console.log('\n  favorito 70 (casa) × adversário pior:')
console.log('   gap  adv   vitória fav   empate   derrota   gols/jogo   saldo')
for (const away of [70, 65, 60, 55, 50, 40]) {
  let w = 0, d = 0, l = 0, gh = 0, ga = 0
  for (let i = 0; i < N; i++) {
    const r = quickResult(70, away, rng)
    gh += r.homeGoals; ga += r.awayGoals
    if (r.homeGoals > r.awayGoals) w++
    else if (r.homeGoals === r.awayGoals) d++
    else l++
  }
  const p = (x: number) => ((x / N) * 100).toFixed(0).padStart(3) + '%'
  console.log(`   ${String(70 - away).padStart(3)}  ${String(away).padStart(3)}    ${p(w).padStart(9)}   ${p(d)}   ${p(l)}    ${((gh + ga) / N).toFixed(2).padStart(6)}    ${((gh - ga) / N >= 0 ? '+' : '') + ((gh - ga) / N).toFixed(2)}`)
}
console.log('\n  ➤ ideal: gap 0 ~ casa 45% (vantagem leve); gap 20 ~ 70-75%; gap 30 ~ 85%.')
console.log('     se gap 20 dá só ~50% → quickResult ignora a força (causa da tabela aleatória).')
