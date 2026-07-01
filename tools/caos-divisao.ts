/**
 * CAOS POR DIVISÃO (feature ativa do usuário) — as divisões baixas geram jogadores
 * mais IRREGULARES (pace 90/força 20 no mesmo cara)? Mede o desvio-padrão dos
 * atributos DENTRO de cada jogador e a fração com "spike" (atributo bem acima da
 * própria média) — deve crescer da Série A para a D.
 */
import { CLUBS_BY_DIVISION } from '../src/game/clubs'
import { generateClub } from '../src/game/generate'
import { makeRng, mixSeed } from '../src/game/random'
import { DIVISIONS } from '../src/game/types'
import type { Attrs } from '../src/sim/types'

const OUT = ['pace', 'acceleration', 'agility', 'strength', 'jumping', 'dribbling', 'firstTouch', 'passing',
  'finishing', 'tackling', 'marking', 'heading', 'vision', 'positioning', 'composure'] as (keyof Attrs)[]

console.log('================================================================')
console.log(' CAOS POR DIVISÃO — irregularidade dos jogadores (deve subir A→D)')
console.log('================================================================')
console.log('\n  Div │ σ interno médio │ amplitude interna │ % com spike (>+18) │ % com buraco (<-18)')
console.log('  ────┼─────────────────┼───────────────────┼────────────────────┼─────────────────────')

for (const div of DIVISIONS) {
  let sdSum = 0, ampSum = 0, spike = 0, hole = 0, nP = 0
  for (let s = 0; s < 40; s++) {
    const rng = makeRng(mixSeed(0xca05, mixSeed(div.charCodeAt(0), s)))
    for (const def of CLUBS_BY_DIVISION[div]) {
      for (const p of generateClub(def, div, rng).squad) {
        if (p.role === 'GK') continue
        const vals = OUT.map((k) => p.attrs[k])
        const m = vals.reduce((a, b) => a + b, 0) / vals.length
        const sd = Math.sqrt(vals.reduce((a, b) => a + (b - m) ** 2, 0) / vals.length)
        sdSum += sd; ampSum += Math.max(...vals) - Math.min(...vals)
        if (Math.max(...vals) - m > 18) spike++
        if (m - Math.min(...vals) > 18) hole++
        nP++
      }
    }
  }
  const pc = (x: number) => ((x / nP) * 100).toFixed(0) + '%'
  console.log(`   ${div}  │      ${(sdSum / nP).toFixed(1).padStart(4)}       │       ${(ampSum / nP).toFixed(0).padStart(3)}         │        ${pc(spike).padStart(4)}        │       ${pc(hole).padStart(4)}`)
}
console.log('\n  ➤ σ e amplitude subindo A→D = elencos crus e irregulares nas divisões baixas (o objetivo do caos).')
