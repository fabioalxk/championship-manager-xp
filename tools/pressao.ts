/**
 * INTEGRAÇÃO — PRESSÃO vs SAÍDA DE BOLA. Um time de workRate/aggression alto deve
 * RECUPERAR a bola mais ALTO no campo (pressing) do que um time passivo. Roda
 * partidas reais e mede % das recuperações que acontecem no campo de ATAQUE.
 */
import { createMatch, step, stepCelebration } from '../src/sim/engine'
import { attackingGoalX } from '../src/sim/formation'
import { FIELD, MATCH } from '../src/sim/constants'
import { rosterFor, type SeedPlayer } from '../src/sim/teams'
import type { Attrs, TeamId } from '../src/sim/types'
import { ATTR_KEYS } from './_simlib'

MATCH.clockRate = 1

const team = (over: Partial<Attrs>): SeedPlayer[] => {
  const base = Object.fromEntries(ATTR_KEYS.map((k) => [k, 55])) as unknown as Attrs
  return rosterFor('home').map((s) => ({ ...s, attrs: { ...base, ...over } }))
}

/** roda N partidas e mede, para o time 'home', recuperações e % no campo de ataque. */
const run = (label: string, homeOver: Partial<Attrs>, N: number) => {
  let recov = 0, highThird = 0
  for (let i = 0; i < N; i++) {
    const s = createMatch({ home: team(homeOver), away: team({}) })
    const dt = 1 / 30
    let prev: TeamId | null = s.possession, guard = 0
    while (s.status !== 'over' && guard++ < 300_000) {
      if (s.celebration) stepCelebration(s, dt)
      else step(s, dt)
      if (s.possession === 'home' && prev !== 'home') {
        recov++
        const gx = attackingGoalX(s.attackDir.home)
        const inAtt = gx > FIELD.w / 2 ? s.ball.pos.x > (FIELD.w * 2) / 3 : s.ball.pos.x < FIELD.w / 3
        if (inAtt) highThird++
      }
      prev = s.possession
    }
  }
  console.log(`\n### ${label}`)
  console.log(`  Recuperações/jogo:        ${(recov / N).toFixed(0)}`)
  console.log(`  % no campo de ATAQUE:     ${((highThird / recov) * 100).toFixed(1)}%  (pressing alto)`)
  console.log(`  Roubadas altas/jogo:      ${(highThird / N).toFixed(0)}`)
}

console.log('================================================================')
console.log(' PRESSÃO vs SAÍDA — recuperações no campo de ataque (real)')
console.log('   base 55 · varia só o time da casa · adversário neutro')
console.log('================================================================')

run('PRESSING alto  (workRate 90, aggression 75)', { workRate: 90, aggression: 75 }, 5)
run('PASSIVO        (workRate 25, aggression 30)', { workRate: 25, aggression: 30 }, 5)

console.log('\n✅ Esperado: o time que pressiona recupera MAIS ALTO (maior % no campo de ataque).')
