/**
 * DIAGNÓSTICO DE CRUZAMENTOS — o usuário suspeita que faltam CRUZAMENTOS chegando
 * na área (por isso poucas cabeçadas). Este tool mede, por jogo:
 *   • cruzamentos que CHEGAM na área (bola aérea entrando na grande área de ataque)
 *   • tentativas de cabeça  • gols de cabeça
 * Assim dá pra ver se o gargalo é FALTA DE CRUZAMENTO ou o cruzamento não virar
 * cabeçada. Mede os valores REAIS gravados (sem override), salvo configs abaixo.
 */
import { createMatch, step, stepCelebration } from '../src/sim/engine'
import { inPenaltyArea } from '../src/sim/formation'
import { AI, AIR, RESTART, CONTROL, GK } from '../src/sim/constants'
import { FIELD } from '../src/sim/constants'
const CT = CONTROL as typeof CONTROL & { aerialAtkBoxEdge: number }
import { generateClub } from '../src/game/generate'
import { lineupFor } from '../src/game/lineup'
import { CLUBS_BY_DIVISION } from '../src/game/clubs'
import { makeRng, mixSeed } from '../src/game/random'
import type { Division } from '../src/game/types'

const N = 50
const DIVS: Division[] = ['A', 'D']

type Cfg = { name: string; earlyCross?: number; crossFromDist?: number }
const AX = AI as typeof AI & { earlyCrossChance: number; crossFromDist: number }
const ORIG = { earlyCross: AX.earlyCrossChance, crossFromDist: AX.crossFromDist }
const apply = (c: Cfg) => {
  AX.earlyCrossChance = c.earlyCross ?? ORIG.earlyCross
  AX.crossFromDist = c.crossFromDist ?? ORIG.crossFromDist
}

const CONFIGS: Cfg[] = [
  { name: 'early 0.0 (off)', earlyCross: 0.0 },
  { name: 'early 0.6 (atual)', earlyCross: 0.6 },
  { name: 'early 0.85', earlyCross: 0.85, crossFromDist: 32 },
  { name: 'early 1.0 d34', earlyCross: 1.0, crossFromDist: 34 },
]

type Acc = { crossesBox: number; headAtt: number; headGoal: number; games: number }

const simMatch = (div: Division, i: number, a: Acc) => {
  const rng = makeRng(mixSeed(0xc205, mixSeed(div.charCodeAt(0), i)))
  const defs = CLUBS_BY_DIVISION[div]
  const home = generateClub(defs[(i * 2) % defs.length], div, rng).squad
  const away = generateClub(defs[(i * 2 + 1) % defs.length], div, rng).squad
  const s = createMatch({ home: lineupFor(home), away: lineupFor(away) })
  const dt = 1 / 30
  let guard = 0, prevShots = 0, prevGoals = 0, inBoxAir = false
  while (s.status !== 'over' && guard++ < 300_000) {
    if (s.celebration) { stepCelebration(s, dt); continue }
    step(s, dt)
    // rising edge: bola aérea entra em ALGUMA grande área (cruzamento/escanteio na área)
    const air = s.ball.z > AIR.groundBand
    const nowInBoxAir = air && (inPenaltyArea(s.ball.pos, 0) || inPenaltyArea(s.ball.pos, FIELD.w))
    if (nowInBoxAir && !inBoxAir) a.crossesBox++
    inBoxAir = nowInBoxAir
    const shots = s.stats.home.shots + s.stats.away.shots
    if (shots > prevShots) { prevShots = shots; if (s.lastShotHeader) a.headAtt++ }
    const goals = s.score.home + s.score.away
    if (goals > prevGoals) { prevGoals = goals; if (s.lastShotHeader) a.headGoal++ }
  }
  a.games++
}

console.log('================================================================')
console.log(` CRUZAMENTOS QUE CHEGAM NA ÁREA · ${N} jogos/divisão/config`)
console.log('================================================================\n')
console.log('  config            div │ cruz/área │ cabeça tent │ cabeça gol')

for (const c of CONFIGS) {
  apply(c)
  for (const div of DIVS) {
    const a: Acc = { crossesBox: 0, headAtt: 0, headGoal: 0, games: 0 }
    for (let i = 0; i < N; i++) simMatch(div, i, a)
    console.log(
      `  ${c.name.padEnd(16)}  ${div}  │   ${(a.crossesBox / a.games).toFixed(1)}    │    ${(a.headAtt / a.games).toFixed(2)}     │   ${(a.headGoal / a.games).toFixed(2)}`,
    )
  }
}
