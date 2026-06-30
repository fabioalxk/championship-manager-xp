/**
 * INTEGRAÇÃO — partidas COMPLETAS reais (createMatch + step do engine). Elencos
 * uniformes de nível controlado (forte × fraco) pra medir % de jogo REAIS: com
 * defensores, pressão e IA no campo. É o número honesto (vs o "chute limpo").
 */
import { createMatch, step, stepCelebration } from '../src/sim/engine'
import { MATCH } from '../src/sim/constants'
import { rosterFor, type SeedPlayer } from '../src/sim/teams'
import type { Attrs, MatchState } from '../src/sim/types'
import { ATTR_KEYS } from './_simlib'

// TEMPO REAL: o relógio do jogo corre 1:1 com a física, então os 90' contêm a
// quantidade REAL de ações (vs clockRate=24, que comprime ~24× as contagens).
MATCH.clockRate = 1

const uniform = (lvl: number): Attrs =>
  Object.fromEntries(ATTR_KEYS.map((k) => [k, lvl])) as unknown as Attrs
const roster = (lvl: number): SeedPlayer[] =>
  rosterFor('home').map((s) => ({ ...s, attrs: uniform(lvl) }))

const simMatch = (homeLvl: number, awayLvl: number): MatchState => {
  const s = createMatch({ home: roster(homeLvl), away: roster(awayLvl) })
  const dt = 1 / 30
  let guard = 0
  while (s.status !== 'over' && guard++ < 300_000) {
    if (s.celebration) stepCelebration(s, dt)
    else step(s, dt)
  }
  return s
}

const pct = (x: number) => (x * 100).toFixed(1) + '%'

/** roda N partidas homeLvl × awayLvl e agrega as estatísticas. */
const run = (label: string, homeLvl: number, awayLvl: number, N: number) => {
  let gH = 0, gA = 0, shH = 0, shA = 0, sotH = 0, sotA = 0
  let foul = 0, cards = 0, corners = 0, savesH = 0, savesA = 0
  let posH = 0, posTot = 0, winH = 0, draw = 0, winA = 0
  for (let i = 0; i < N; i++) {
    const s = simMatch(homeLvl, awayLvl)
    gH += s.score.home; gA += s.score.away
    if (s.score.home > s.score.away) winH++
    else if (s.score.home < s.score.away) winA++
    else draw++
    const h = s.stats.home, a = s.stats.away
    shH += h.shots; shA += a.shots; sotH += h.shotsOnTarget; sotA += a.shotsOnTarget
    foul += h.fouls + a.fouls; cards += h.yellows + a.yellows + h.reds + a.reds
    corners += h.corners + a.corners; savesH += h.saves; savesA += a.saves
    posH += h.possessionTicks; posTot += h.possessionTicks + a.possessionTicks
  }
  const shots = shH + shA, sot = sotH + sotA, goals = gH + gA
  console.log(`\n### ${label}  (${N} partidas)`)
  console.log(`  Placar médio:        casa ${(gH / N).toFixed(2)} x ${(gA / N).toFixed(2)} fora   (gols/jogo ${(goals / N).toFixed(2)})`)
  console.log(`  Resultado casa:      V ${pct(winH / N)} · E ${pct(draw / N)} · D ${pct(winA / N)}`)
  console.log(`  Chutes/jogo:         ${(shots / N).toFixed(1)}  · no alvo ${pct(sot / shots)}`)
  console.log(`  CONVERSÃO (gol/chute): ${pct(goals / shots)}   · gol por chute no alvo ${pct(goals / sot)}`)
  console.log(`  Defesas/jogo:        ${((savesH + savesA) / N).toFixed(1)}`)
  console.log(`  Posse casa:          ${pct(posH / posTot)}`)
  console.log(`  Faltas/jogo:         ${(foul / N).toFixed(1)}  · cartões/jogo ${(cards / N).toFixed(2)}`)
  console.log(`  Escanteios/jogo:     ${(corners / N).toFixed(1)}`)
}

console.log('================================================================')
console.log(' PARTIDAS COMPLETAS — TEMPO REAL (clockRate=1, 22 jogadores)')
console.log('================================================================')

run('Equilíbrio 60 × 60', 60, 60, 6)
run('Forte × Fraco  70 × 40', 70, 40, 6)

console.log('\n✅ Faixas reais p/ comparar: ~2.6 gols/jogo · ~25 chutes/jogo · conversão ~10% · ~10-14 faltas/jogo.')
