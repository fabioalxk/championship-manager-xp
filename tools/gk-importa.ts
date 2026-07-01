/**
 * O ATRIBUTO DO GOLEIRO IMPORTA EM PARTIDA? Com `saveSkill 0.09` o GK ficou quase
 * indiferente ao nível. Testa em jogo: time com GK 90 × time com GK 30 (resto
 * igual). Se o GK 90 sofre ~o mesmo que o GK 30, o atributo virou decorativo.
 */
import { createMatch, step, stepCelebration } from '../src/sim/engine'
import { MATCH } from '../src/sim/constants'
import { rosterFor, type SeedPlayer } from '../src/sim/teams'
import type { Attrs } from '../src/sim/types'
import { ATTR_KEYS } from './_simlib'

MATCH.clockRate = 2
const N = 24
const GK_ATTRS = ['goalkeeping', 'reflexes', 'handling', 'oneOnOne', 'aerialReach', 'positioning', 'communication', 'composure']

const team = (gkLvl: number): SeedPlayer[] => {
  const base = Object.fromEntries(ATTR_KEYS.map((k) => [k, 55])) as unknown as Attrs
  return rosterFor('home').map((s) => {
    const attrs = { ...base }
    if (s.role === 'GK') for (const k of GK_ATTRS) (attrs as Record<string, number>)[k] = gkLvl
    return { ...s, attrs }
  })
}

// home tem GK 90, away tem GK 30 (resto idêntico em 55)
let concededByGood = 0, concededByBad = 0
for (let i = 0; i < N; i++) {
  const s = createMatch({ home: team(90), away: team(30) })
  let guard = 0
  while (s.status !== 'over' && guard++ < 600_000) {
    if (s.celebration) stepCelebration(s, 1 / 30)
    else step(s, 1 / 30)
  }
  concededByGood += s.score.away // gols que o GK 90 (casa) sofreu
  concededByBad += s.score.home // gols que o GK 30 (fora) sofreu
}

console.log('================================================================')
console.log(` O GOLEIRO IMPORTA? — GK 90 × GK 30 (resto igual) · ${N} jogos`)
console.log('================================================================')
console.log(`\n  Gols sofridos pelo time com GK 90: ${(concededByGood / N).toFixed(2)}/jogo`)
console.log(`  Gols sofridos pelo time com GK 30: ${(concededByBad / N).toFixed(2)}/jogo`)
const diff = (concededByBad - concededByGood) / N
console.log(`\n  Diferença: o GK ruim sofre ${diff >= 0 ? '+' : ''}${diff.toFixed(2)} gols/jogo a mais`)
console.log(`  ${Math.abs(diff) < 0.4 ? '❌ GK 90 ≈ GK 30 → o atributo do goleiro é DECORATIVO (saveSkill baixo)' : '✅ o goleiro bom sofre menos — o atributo importa'}`)
