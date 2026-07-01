/**
 * CARREIRA COMPLETA (rica) — roda carreiras inteiras (newCareer+autoPlay) e mede
 * além de "temporadas até zerar": reputação final e o GAP de força do SEU time vs
 * os rivais ao vencer a Série A (confirma o #-3 snowball no contexto real).
 */
import { newCareer, autoPlay } from '../src/game/career'
import { CLUBS_BY_DIVISION } from '../src/game/clubs'
import { teamStrength } from '../src/game/strength'
import type { CareerState } from '../src/game/types'

const N = 20
let seasonsSum = 0, repSum = 0, gapSum = 0, myStrSum = 0, rivalStrSum = 0

for (let i = 0; i < N; i++) {
  const startClub = CLUBS_BY_DIVISION.D[i % CLUBS_BY_DIVISION.D.length].id
  const state: CareerState = newCareer(`Técnico ${i}`, startClub, 1000 + i * 7)
  const result = autoPlay(state)
  seasonsSum += result.seasons
  repSum += state.reputation
  // força do meu time vs média dos rivais na divisão final
  const my = teamStrength(state.clubs[state.clubId])
  const rivals = Object.values(state.clubs).filter((c) => c.id !== state.clubId).map(teamStrength)
  const rivalAvg = rivals.reduce((a, b) => a + b, 0) / rivals.length
  myStrSum += my; rivalStrSum += rivalAvg; gapSum += my - rivalAvg
}

console.log('================================================================')
console.log(` CARREIRA COMPLETA — ${N} carreiras (D → título na Série A)`)
console.log('================================================================')
console.log(`\n  Temporadas até zerar (média): ${(seasonsSum / N).toFixed(1)}`)
console.log(`  Reputação final (média):      ${(repSum / N).toFixed(0)} / 100`)
console.log(`\n  Ao vencer a Série A:`)
console.log(`   força do MEU time:      ${(myStrSum / N).toFixed(1)}`)
console.log(`   força média dos RIVAIS: ${(rivalStrSum / N).toFixed(1)}`)
console.log(`   GAP: ${(gapSum / N >= 0 ? '+' : '') + (gapSum / N).toFixed(1)}`)
console.log('\n  ➤ GAP grande (>8) = seu time bola-de-neve (#-3, fácil). GAP pequeno (~2-4) = liga competitiva.')
