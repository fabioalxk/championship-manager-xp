/**
 * PROVA DO FIX #-3 — a evolução atual faz SEU time bola-de-neve e o mundo estagnar
 * (carreira fácil). Compara 3 regras numa joia (18/60) ao longo de 10 temporadas:
 * (a) rival hoje (+1 jovem, prime FLAT), (b) SEU clube hoje (+1 +2 núcleo = +3),
 * (c) balanceada (todos crescem parecido, prime com pico leve, sem bônus só-seu).
 */
import { generatePlayer } from '../src/game/generate'
import { overallOf } from '../src/game/overall'
import { makeRng, mixSeed } from '../src/game/random'
import type { Attrs, Role } from '../src/sim/types'

type P = { role: Role; attrs: Attrs; overall: number; age: number }
const dev = (p: P, pts: number) => { for (const k in p.attrs) { const key = k as keyof Attrs; p.attrs[key] = Math.max(1, Math.min(99, p.attrs[key] + pts)) } p.overall = overallOf(p.role, p.attrs) }

// (a) rival hoje: jovem +1, prime 0, velho -1
const ruleRival = (p: P) => { p.age++; const d = p.age <= 24 ? 1 : p.age <= 29 ? 0 : -1; if (d) dev(p, d) }
// (b) SEU clube hoje: rival + núcleo +2 (idade<=32, ovr<96)
const ruleMeu = (p: P) => { ruleRival(p); if (p.age <= 32 && p.overall < 96) dev(p, 2) }
// (c) balanceada: jovem +2, PICO no prime (25-28 +1), declínio 30+ (-1); igual p/ todos
const ruleBal = (p: P) => { p.age++; const d = p.age <= 24 ? 2 : p.age <= 28 ? 1 : p.age <= 30 ? 0 : -1; if (d) dev(p, d) }

const rng = makeRng(mixSeed(0xf1, 5))
const seed = (): P => { const g = generatePlayer('FWD', 60, 9, rng); return { role: 'FWD', attrs: { ...g.attrs }, overall: g.overall, age: 18 } }
const rival = seed(), meu = { ...seed(), attrs: { ...seed().attrs } }, balR = seed(), balM = seed()
// para a regra balanceada, "seu" e "rival" seguem a MESMA regra (c)
const A = seed(), B = seed()

console.log('================================================================')
console.log(' PROVA DO FIX #-3 — evolução de uma joia (18/60 OVR), 10 temporadas')
console.log('================================================================')
console.log('\n idade │ rival(hoje) │ SEU(hoje) │ GAP │ balanceado(todos) │ GAP')
console.log(' ──────┼────────────┼───────────┼─────┼───────────────────┼─────')
for (let yr = 0; yr <= 12; yr++) {
  const gapHoje = meu.overall - rival.overall
  const gapBal = A.overall - B.overall
  if (yr % 2 === 0)
    console.log(`  ${String(rival.age).padStart(2)}   │    ${String(rival.overall).padStart(3)}     │    ${String(meu.overall).padStart(3)}    │ ${(gapHoje >= 0 ? '+' : '') + gapHoje}  │       ${String(A.overall).padStart(3)}         │  ${(gapBal >= 0 ? '+' : '') + gapBal}`)
  ruleRival(rival); ruleMeu(meu); ruleBal(A); ruleBal(B)
}
console.log('\n  ➤ HOJE: seu jogador dispara e o gap p/ o rival cresce (bola-de-neve = carreira fácil).')
console.log('    BALANCEADO: todos evoluem parecido → gap ~0 (o mundo acompanha, a carreira tem desafio).')
