/**
 * TABELA DA LIGA é justa? Simula temporadas (quick-sim) e mede: o time mais FORTE
 * é campeão? A força prevê a posição (correlação de Spearman)? Pontuação do
 * campeão realista? Valida o núcleo da CARREIRA (pontos corridos).
 */
import { CLUBS_BY_DIVISION } from '../src/game/clubs'
import { generateClub } from '../src/game/generate'
import { buildFixtures } from '../src/game/schedule'
import { quickResult } from '../src/game/quicksim'
import { teamStrength } from '../src/game/strength'
import { makeRng, mixSeed } from '../src/game/random'
import type { ClubState } from '../src/game/types'

const SEASONS = 200
const DIV = 'A'

let champIsStrongest = 0, champPtsSum = 0, lastPtsSum = 0, rhoSum = 0
let strongestPosSum = 0, weakestPosSum = 0, nTeams = 0

for (let s = 0; s < SEASONS; s++) {
  const rng = makeRng(mixSeed(0x7ab1, s))
  const clubs: Record<string, ClubState> = {}
  for (const def of CLUBS_BY_DIVISION[DIV]) clubs[def.id] = generateClub(def, DIV, rng)
  const ids = Object.keys(clubs)
  const pts: Record<string, number> = Object.fromEntries(ids.map((i) => [i, 0]))
  const str: Record<string, number> = Object.fromEntries(ids.map((i) => [i, teamStrength(clubs[i])]))

  for (const f of buildFixtures(ids)) {
    const r = quickResult(str[f.homeId], str[f.awayId], rng)
    if (r.homeGoals > r.awayGoals) pts[f.homeId] += 3
    else if (r.homeGoals < r.awayGoals) pts[f.awayId] += 3
    else { pts[f.homeId]++; pts[f.awayId]++ }
  }

  const byPts = [...ids].sort((a, b) => pts[b] - pts[a]) // tabela final
  const byStr = [...ids].sort((a, b) => str[b] - str[a]) // ranking de força
  nTeams = ids.length

  if (byPts[0] === byStr[0]) champIsStrongest++
  champPtsSum += pts[byPts[0]]
  lastPtsSum += pts[byPts[byPts.length - 1]]
  strongestPosSum += byPts.indexOf(byStr[0]) + 1
  weakestPosSum += byPts.indexOf(byStr[byStr.length - 1]) + 1

  // Spearman entre força e pontos
  const posStr: Record<string, number> = {}; byStr.forEach((id, i) => (posStr[id] = i))
  const posPts: Record<string, number> = {}; byPts.forEach((id, i) => (posPts[id] = i))
  let d2 = 0; for (const id of ids) d2 += (posStr[id] - posPts[id]) ** 2
  rhoSum += 1 - (6 * d2) / (nTeams * (nTeams ** 2 - 1))
}

const avg = (x: number) => (x / SEASONS).toFixed(1)
console.log('================================================================')
console.log(` TABELA DA LIGA (Série ${DIV}) — ${SEASONS} temporadas · ${nTeams} times, 38 jogos`)
console.log('================================================================')
console.log(`\n  Campeão = o time mais FORTE:   ${((champIsStrongest / SEASONS) * 100).toFixed(0)}%   (real ~40-55%; zebra existe)`)
console.log(`  Correlação força↔posição (Spearman): ${(rhoSum / SEASONS).toFixed(2)}   (1=perfeito, real ~0.6-0.8)`)
console.log(`  Posição final do MAIS FORTE:   ${avg(strongestPosSum)}º   ·   do MAIS FRACO: ${avg(weakestPosSum)}º`)
console.log(`  Pontos do campeão: ${avg(champPtsSum)}   ·   do lanterna: ${avg(lastPtsSum)}   (real campeão ~80-90)`)
console.log('\n  ➤ Spearman ~0.7 e campeão-forte ~50% = liga realista (força importa, mas há zebra).')
