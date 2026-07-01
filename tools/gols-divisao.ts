/**
 * MÉDIA DE GOLS POR JOGO POR DIVISÃO — o usuário notou poucos gols na Série D.
 * Reproduz o pipeline REAL da carreira (clubes reais → elenco gerado no nível da
 * divisão → calendário de pontos corridos → quickResult/Poisson) e mede a média
 * de gols por jogo de cada divisão, simulando várias temporadas para estabilizar.
 */
import { CLUBS_BY_DIVISION } from '../src/game/clubs'
import { generateClub } from '../src/game/generate'
import { buildFixtures } from '../src/game/schedule'
import { quickResult } from '../src/game/quicksim'
import { teamStrength } from '../src/game/strength'
import { makeRng, mixSeed } from '../src/game/random'
import { DIVISIONS } from '../src/game/types'
import type { ClubState } from '../src/game/types'

const SEASONS = 200 // temporadas simuladas por divisão (380 jogos cada)

console.log('================================================================')
console.log(` MÉDIA DE GOLS POR JOGO POR DIVISÃO · ${SEASONS} temporadas cada`)
console.log('================================================================\n')
console.log('  Div │ gols/jogo │  casa  fora │ % 0-gol │ força média')
console.log('  ────┼───────────┼─────────────┼─────────┼────────────')

for (const div of DIVISIONS) {
  let games = 0, totalGoals = 0, homeGoals = 0, awayGoals = 0, nilGames = 0, strSum = 0, strN = 0

  for (let s = 0; s < SEASONS; s++) {
    const rng = makeRng(mixSeed(0x9015, mixSeed(div.charCodeAt(0), s)))
    // monta os 20 clubes da divisão (elencos gerados no nível da divisão)
    const clubs: Record<string, ClubState> = {}
    for (const def of CLUBS_BY_DIVISION[div]) clubs[def.id] = generateClub(def, div, rng)

    for (const c of Object.values(clubs)) { strSum += teamStrength(c); strN++ }

    const ids = Object.keys(clubs)
    const fixtures = buildFixtures(ids)
    for (const f of fixtures) {
      const r = quickResult(teamStrength(clubs[f.homeId]), teamStrength(clubs[f.awayId]), rng)
      games++
      totalGoals += r.homeGoals + r.awayGoals
      homeGoals += r.homeGoals
      awayGoals += r.awayGoals
      if (r.homeGoals + r.awayGoals === 0) nilGames++
    }
  }

  const f1 = (x: number) => x.toFixed(2)
  console.log(
    `   ${div}  │   ${f1(totalGoals / games)}    │  ${f1(homeGoals / games)}  ${f1(awayGoals / games)} │  ${((nilGames / games) * 100).toFixed(1)}% │   ${(strSum / strN).toFixed(1)}`,
  )
}

console.log('\n  (gols/jogo = média de gols somados dos dois times por partida)')
