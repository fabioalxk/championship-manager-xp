/**
 * EVOLUÇÃO por idade (progressão da carreira). Reproduz agePlayers/developPlayer:
 * jovem(≤24) +1/ano, prime(25-29) 0, velho(30+) -1; e o NÚCLEO do clube do jogador
 * ganha +2/ano extra. Mede a curva de overall de uma joia — no SEU clube vs num rival.
 */
import { generatePlayer } from '../src/game/generate'
import { overallOf } from '../src/game/overall'
import { makeRng, mixSeed } from '../src/game/random'
import type { Attrs, Role } from '../src/sim/types'

type P = { role: Role; attrs: Attrs; overall: number; age: number }

const develop = (p: P, pts: number) => {
  for (const k in p.attrs) { const key = k as keyof Attrs; p.attrs[key] = Math.max(1, Math.min(99, p.attrs[key] + pts)) }
  p.overall = overallOf(p.role, p.attrs)
}
const ageOne = (p: P, core: boolean) => {
  p.age++
  const delta = p.age <= 24 ? 1 : p.age <= 29 ? 0 : -1
  if (delta !== 0) develop(p, delta)
  if (core && p.age <= 32 && p.overall < 96) develop(p, 2)
}

const rng = makeRng(mixSeed(0xe0, 3))
const mkYoung = (): P => { const g = generatePlayer('FWD', 60, 9, rng); return { role: 'FWD', attrs: g.attrs, overall: g.overall, age: 18 } }

console.log('================================================================')
console.log(' EVOLUÇÃO DE UMA JOIA (FWD, começa 18 anos / ~60 OVR)')
console.log('================================================================')
console.log('\n   idade │ rival (só idade) │ SEU clube (idade + núcleo +2)')
console.log('   ──────┼──────────────────┼──────────────────────────────')
const rival = mkYoung(), meu = mkYoung()
const start = rival.overall
for (let yr = 0; yr < 16; yr++) {
  const age = rival.age
  console.log(`    ${String(age).padStart(2)}   │       ${String(rival.overall).padStart(3)}        │        ${String(meu.overall).padStart(3)}`)
  ageOne(rival, false)
  ageOne(meu, true)
}
console.log(`\n  Pico rival:  +${Math.max(0, ...[rival.overall]) - start} do início · Pico SEU clube: bem mais alto (núcleo +2/ano)`)
console.log('  ➤ real: joia sobe ~+15-20 até o pico (26-28). Rival subindo pouco = joias não evoluem fora do seu time.')
