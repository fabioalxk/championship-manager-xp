/**
 * Teste headless do loop de carreira: roda o auto-play e confirma que dá para
 * ZERAR (campeão da Série A) partindo da Série D, exercitando rodadas, fim de
 * temporada, transferências, ofertas e transições de divisão.
 *
 * Execução: `node --import tsx src/game/selftest.ts` ou via esbuild→node.
 */
import { newCareer, autoPlay } from './career'
import { CLUBS_BY_DIVISION } from './clubs'

const runs = 20
let wins = 0
let totalSeasons = 0
let maxSeasons = 0
const t0 = Date.now()

for (let i = 0; i < runs; i++) {
  const startClub = CLUBS_BY_DIVISION.D[i % CLUBS_BY_DIVISION.D.length].id
  const state = newCareer(`Técnico ${i}`, startClub, 1000 + i * 7)
  const result = autoPlay(state)
  if (result.won) wins++
  totalSeasons += result.seasons
  maxSeasons = Math.max(maxSeasons, result.seasons)
}

const ms = Date.now() - t0
console.log(`Vitórias (zerou): ${wins}/${runs}`)
console.log(`Temporadas médias até zerar: ${(totalSeasons / runs).toFixed(1)} (máx ${maxSeasons})`)
console.log(`Tempo total de ${runs} carreiras: ${ms} ms (${(ms / runs).toFixed(1)} ms/carreira)`)

if (wins < runs) {
  throw new Error('FALHA: nem toda carreira zerou no auto-play.')
}
console.log('OK: todas as carreiras zeraram.')
