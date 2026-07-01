/**
 * PROVA DO FIX #-2 — simula a tabela SE cada clube tivesse um TIER DE FORÇA (uns
 * "grandes", outros fracos). Mesmo pipeline da carreira, mas soma um offset por
 * clube à força (gauss, amplitude ~±12) antes do quickResult. Mostra que a tabela
 * vira realista (campeão-forte ~50%, Spearman ~0.7) — o que o #-2 pede.
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

const run = (tierStd: number) => {
  let champStrong = 0, rhoSum = 0, champPts = 0, strongPos = 0, amp = 0
  for (let s = 0; s < SEASONS; s++) {
    const rng = makeRng(mixSeed(0x7ab1, s))
    const clubs: Record<string, ClubState> = {}
    for (const def of CLUBS_BY_DIVISION[DIV]) clubs[def.id] = generateClub(def, DIV, rng)
    const ids = Object.keys(clubs)
    const pts: Record<string, number> = Object.fromEntries(ids.map((i) => [i, 0]))
    // FORÇA EFETIVA = força do elenco + TIER do clube (o fix simulado)
    const str: Record<string, number> = Object.fromEntries(ids.map((i) => [i, teamStrength(clubs[i]) + rng.gauss() * tierStd]))
    const sv = Object.values(str); amp += Math.max(...sv) - Math.min(...sv)
    for (const f of buildFixtures(ids)) {
      const r = quickResult(str[f.homeId], str[f.awayId], rng)
      if (r.homeGoals > r.awayGoals) pts[f.homeId] += 3
      else if (r.homeGoals < r.awayGoals) pts[f.awayId] += 3
      else { pts[f.homeId]++; pts[f.awayId]++ }
    }
    const byPts = [...ids].sort((a, b) => pts[b] - pts[a])
    const byStr = [...ids].sort((a, b) => str[b] - str[a])
    if (byPts[0] === byStr[0]) champStrong++
    champPts += pts[byPts[0]]; strongPos += byPts.indexOf(byStr[0]) + 1
    const pS: Record<string, number> = {}; byStr.forEach((id, i) => (pS[id] = i))
    const pP: Record<string, number> = {}; byPts.forEach((id, i) => (pP[id] = i))
    let d2 = 0; for (const id of ids) d2 += (pS[id] - pP[id]) ** 2
    rhoSum += 1 - (6 * d2) / (ids.length * (ids.length ** 2 - 1))
  }
  return { champStrong: (champStrong / SEASONS) * 100, rho: rhoSum / SEASONS, champPts: champPts / SEASONS, strongPos: strongPos / SEASONS, amp: amp / SEASONS }
}

console.log('================================================================')
console.log(' PROVA DO FIX #-2 — tabela com TIER DE FORÇA por clube')
console.log('================================================================')
console.log('\n  tier(std)  amplit.força   campeão-forte   Spearman   pos.mais-forte   pts campeão')
for (const std of [0, 3, 5, 8]) {
  const r = run(std)
  console.log(`  ${String(std).padStart(6)}     ${r.amp.toFixed(1).padStart(6)}         ${(r.champStrong.toFixed(0) + '%').padStart(6)}        ${r.rho.toFixed(2)}       ${r.strongPos.toFixed(1)}º           ${r.champPts.toFixed(0)}`)
}
console.log('\n  ➤ std 0 = hoje (sem tier, aleatório). std ~5-8 → campeão-forte ~40-55%, Spearman ~0.7 = realista.')
