/**
 * SIMETRIA (casa × fora) — dois times IDÊNTICOS deveriam dar ~50/50. Se a casa
 * vence consistentemente mais, há viés de mando indevido (bug de coordenada,
 * kickoff, direção de ataque...). Roda N alto pra separar ruído de viés real.
 */
import { createMatch, step, stepCelebration } from '../src/sim/engine'
import { MATCH } from '../src/sim/constants'
import { rosterFor, type SeedPlayer } from '../src/sim/teams'
import type { Attrs } from '../src/sim/types'
import { ATTR_KEYS } from './_simlib'

MATCH.clockRate = 2
const N = 50

const team = (): SeedPlayer[] => {
  const a = Object.fromEntries(ATTR_KEYS.map((k) => [k, 60])) as unknown as Attrs
  return rosterFor('home').map((s) => ({ ...s, attrs: a }))
}

let winH = 0, winA = 0, draw = 0, gH = 0, gA = 0, posH = 0, posT = 0, shH = 0, shA = 0
for (let i = 0; i < N; i++) {
  const s = createMatch({ home: team(), away: team() })
  let guard = 0
  while (s.status !== 'over' && guard++ < 600_000) {
    if (s.celebration) stepCelebration(s, 1 / 30)
    else step(s, 1 / 30)
  }
  gH += s.score.home; gA += s.score.away
  if (s.score.home > s.score.away) winH++
  else if (s.score.home < s.score.away) winA++
  else draw++
  posH += s.stats.home.possessionTicks; posT += s.stats.home.possessionTicks + s.stats.away.possessionTicks
  shH += s.stats.home.shots; shA += s.stats.away.shots
}

const p = (x: number) => ((x / N) * 100).toFixed(0) + '%'
console.log('================================================================')
console.log(` SIMETRIA — times IDÊNTICOS (nível 60) · ${N} jogos`)
console.log('================================================================')
console.log(`\n  Vitórias:  casa ${p(winH)}  ·  empate ${p(draw)}  ·  fora ${p(winA)}`)
console.log(`  Gols:      casa ${(gH / N).toFixed(1)} × ${(gA / N).toFixed(1)} fora`)
console.log(`  Posse:     casa ${((posH / posT) * 100).toFixed(0)}%`)
console.log(`  Chutes:    casa ${(shH / N).toFixed(0)} × ${(shA / N).toFixed(0)} fora`)
const skew = Math.abs(winH - winA) / N
console.log(`\n  ➤ ${skew < 0.12 ? '✅ simétrico (diferença dentro do ruído estatístico)' : '⚠️ VIÉS de mando: a casa vence consistentemente mais (bug a investigar)'}`)
