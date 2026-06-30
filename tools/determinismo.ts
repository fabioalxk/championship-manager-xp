/**
 * DETERMINISMO & COLISÃO DE SEED. (1) Mesma seed deve dar o MESMO placar (replay/
 * debug). (2) createMatch usa Date.now() como seed — se chamado rápido em loop
 * (simular temporada), partidas podem pegar o mesmo ms e sair IDÊNTICAS.
 */
import { createMatch, step, stepCelebration } from '../src/sim/engine'
import { MATCH } from '../src/sim/constants'
import { seedRng } from '../src/sim/rng'

MATCH.clockRate = 2

const runSeed = (seed: number) => {
  const s = createMatch()
  s.rngState = seedRng(seed) // força a seed e roda
  let g = 0
  while (s.status !== 'over' && g++ < 600_000) {
    if (s.celebration) stepCelebration(s, 1 / 30)
    else step(s, 1 / 30)
  }
  return `${s.score.home}-${s.score.away} (chutes ${s.stats.home.shots}/${s.stats.away.shots})`
}

console.log('================================================================')
console.log(' DETERMINISMO & COLISÃO DE SEED')
console.log('================================================================')

console.log('\n  (1) Reprodutibilidade — mesma seed deve repetir o placar:')
const a = runSeed(12345)
const b = runSeed(12345)
const c = runSeed(67890)
console.log(`     seed 12345 (1ª): ${a}`)
console.log(`     seed 12345 (2ª): ${b}`)
console.log(`     seed 67890:      ${c}`)
console.log(`     ${a === b ? '✅ reprodutível (replay/debug funcionam)' : '❌ NÃO reprodutível (mesma seed, placar diferente!)'}`)
console.log(`     ${a !== c ? '✅ seeds diferentes → jogos diferentes' : '⚠️ seeds diferentes deram o mesmo placar'}`)

console.log('\n  (2) Colisão de seed em loop rápido (createMatch sem rodar):')
const seeds = new Set<number>()
const M = 2000
for (let i = 0; i < M; i++) seeds.add(createMatch().rngState)
const uniq = seeds.size
console.log(`     ${M} partidas criadas → ${uniq} seeds distintas (${((uniq / M) * 100).toFixed(0)}%)`)
console.log(`     ${uniq >= M * 0.95 ? '✅ seeds praticamente únicas' : `⚠️ COLISÃO: ${M - uniq} partidas (${(((M - uniq) / M) * 100).toFixed(0)}%) compartilham seed → jogos idênticos numa simulação em massa (carreira)`}`)
