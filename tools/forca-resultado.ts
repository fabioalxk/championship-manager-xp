/**
 * FORÇA → RESULTADO (curva de zebra) — quão previsível é o jogo? Time da casa
 * (nível 60) contra adversários cada vez piores; mede % de vitória por diferença
 * de qualidade. Importante p/ a CARREIRA: o melhor deve vencer mais, mas zebras
 * têm que existir (gap pequeno ≈ 55-65%, não 100%).
 */
import { createMatch, step, stepCelebration } from '../src/sim/engine'
import { MATCH } from '../src/sim/constants'
import { rosterFor, type SeedPlayer } from '../src/sim/teams'
import type { Attrs } from '../src/sim/types'
import { ATTR_KEYS } from './_simlib'

MATCH.clockRate = 2
const N = 16

const team = (lvl: number): SeedPlayer[] => {
  const a = Object.fromEntries(ATTR_KEYS.map((k) => [k, lvl])) as unknown as Attrs
  return rosterFor('home').map((s) => ({ ...s, attrs: a }))
}

console.log('================================================================')
console.log(` FORÇA → RESULTADO — casa nível 60 × adversário pior · ${N} jogos/linha`)
console.log('================================================================')
console.log('\n   gap   adversário   vitória casa   empate   derrota   saldo médio')
for (const away of [60, 55, 50, 45, 40, 35]) {
  let w = 0, d = 0, l = 0, gd = 0
  for (let i = 0; i < N; i++) {
    const s = createMatch({ home: team(60), away: team(away) })
    let guard = 0
    while (s.status !== 'over' && guard++ < 600_000) {
      if (s.celebration) stepCelebration(s, 1 / 30)
      else step(s, 1 / 30)
    }
    gd += s.score.home - s.score.away
    if (s.score.home > s.score.away) w++
    else if (s.score.home === s.score.away) d++
    else l++
  }
  const p = (x: number) => ((x / N) * 100).toFixed(0).padStart(3) + '%'
  console.log(`   ${String(60 - away).padStart(3)}   ${String(away).padStart(9)}    ${p(w).padStart(11)}   ${p(d)}   ${p(l)}    ${(gd / N >= 0 ? '+' : '') + (gd / N).toFixed(1)}`)
}
console.log('\n   ➤ ideal p/ carreira: gap 0 ≈ 50%, gap pequeno (5) ~60%, gap grande (20+) ~90%+. Sem zebra = ruim.')
