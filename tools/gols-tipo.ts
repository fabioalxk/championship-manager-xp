/**
 * DIAGNÓSTICO DE TIPOS DE GOL/CHUTE — o usuário reclama: chutes só de fora da
 * área, ninguém entra na área p/ chutar, e nunca sai gol de cabeça. Este tool
 * roda o motor físico real e classifica cada CHUTE e cada GOL em:
 *   • cabeça vs pé   • dentro vs fora da grande área
 * para quantificar o problema antes/depois do ajuste.
 */
import { createMatch, step, stepCelebration } from '../src/sim/engine'
import { inPenaltyArea, attackingGoalX } from '../src/sim/formation'
import { AI, AIR, HEAD, GK, CONTROL } from '../src/sim/constants'
const CT = CONTROL as typeof CONTROL & { aerialAtkBoxEdge: number }
import { generateClub } from '../src/game/generate'
import { lineupFor } from '../src/game/lineup'
import { CLUBS_BY_DIVISION } from '../src/game/clubs'
import { makeRng, mixSeed } from '../src/game/random'
import type { Division } from '../src/game/types'

const N = 60
const DIVS: Division[] = ['A', 'B', 'C', 'D']

type Cfg = {
  name: string
  shootRange?: number; shootCone?: number; carryShootDist?: number
  crossLoftChance?: number; crossZoneWide?: number; crossBylineDepth?: number; crossZoneDepth?: number
  crossPassChance?: number; crossBylineRoom?: number; crossPeakMin?: number; crossPeakMax?: number
  headBase?: number; headCap?: number; headScatter?: number; headSpeedBase?: number; headSpeedSkill?: number
  gkClaimBase?: number; aerialDuelEdge?: number; aerialReach?: number
  reachHeight?: number; reachAerial?: number; atkBoxEdge?: number
}
const ORIG = {
  shootRange: AI.shootRange, shootCone: AI.shootCone, carryShootDist: AI.carryShootDist,
  crossLoftChance: AIR.crossLoftChance, crossZoneWide: AI.crossZoneWide, crossBylineDepth: AI.crossBylineDepth,
  crossZoneDepth: AI.crossZoneDepth, crossPassChance: AI.crossPassChance, crossBylineRoom: AI.crossBylineRoom,
  crossPeakMin: AIR.crossPeakMin, crossPeakMax: AIR.crossPeakMax,
  headBase: HEAD.base, headCap: HEAD.cap, gkClaimBase: GK.claimBase, aerialDuelEdge: CONTROL.aerialDuelEdge,
  aerialReach: CONTROL.aerialReach, headScatter: HEAD.scatter, headSpeedBase: HEAD.speedBase, headSpeedSkill: HEAD.speedSkill,
  reachHeight: AIR.reachHeight, reachAerial: AIR.reachAerial, atkBoxEdge: CT.aerialAtkBoxEdge,
}
const apply = (c: Cfg) => {
  AI.shootRange = c.shootRange ?? ORIG.shootRange
  AI.shootCone = c.shootCone ?? ORIG.shootCone
  AI.carryShootDist = c.carryShootDist ?? ORIG.carryShootDist
  AIR.crossLoftChance = c.crossLoftChance ?? ORIG.crossLoftChance
  AI.crossZoneWide = c.crossZoneWide ?? ORIG.crossZoneWide
  AI.crossBylineDepth = c.crossBylineDepth ?? ORIG.crossBylineDepth
  AI.crossZoneDepth = c.crossZoneDepth ?? ORIG.crossZoneDepth
  AI.crossPassChance = c.crossPassChance ?? ORIG.crossPassChance
  AI.crossBylineRoom = c.crossBylineRoom ?? ORIG.crossBylineRoom
  AIR.crossPeakMin = c.crossPeakMin ?? ORIG.crossPeakMin
  AIR.crossPeakMax = c.crossPeakMax ?? ORIG.crossPeakMax
  HEAD.base = c.headBase ?? ORIG.headBase
  HEAD.cap = c.headCap ?? ORIG.headCap
  GK.claimBase = c.gkClaimBase ?? ORIG.gkClaimBase
  CONTROL.aerialDuelEdge = c.aerialDuelEdge ?? ORIG.aerialDuelEdge
  CONTROL.aerialReach = c.aerialReach ?? ORIG.aerialReach
  HEAD.scatter = c.headScatter ?? ORIG.headScatter
  HEAD.speedBase = c.headSpeedBase ?? ORIG.headSpeedBase
  HEAD.speedSkill = c.headSpeedSkill ?? ORIG.headSpeedSkill
  AIR.reachHeight = c.reachHeight ?? ORIG.reachHeight
  AIR.reachAerial = c.reachAerial ?? ORIG.reachAerial
  CT.aerialAtkBoxEdge = c.atkBoxEdge ?? ORIG.atkBoxEdge
}
// HIPÓTESE: cruzamento FLUTUADO passa por cima das cabeças (pico 2.2-3.4m > alcance
// 2.45m). Testar cruzamento mais TENSO/baixo (na altura da cabeça) + volume + invasão.
const B = {
  shootCone: 19, aerialDuelEdge: 2.2, gkClaimBase: 0.18, headBase: 0.44, crossLoftChance: 0.85,
  crossZoneWide: 10, crossZoneDepth: 30, crossBylineDepth: 20, crossBylineRoom: 6, crossPassChance: 0.15,
}
// COM a nova IA (converge no ponto de queda do cruzamento): varre o jogo aéreo
// p/ atingir ≥0,5 gol de cabeça/jogo.
// CONVERSÃO da cabeçada FIXA num bom ponto; varre o VOLUME de cruzamento p/ subir
// as TENTATIVAS de ~0.4 para ~0.7+ (necessário p/ ≥0.5 gol de cabeça).
const A = {
  aerialReach: 1.8, aerialDuelEdge: 3.2, gkClaimBase: 0.10, headBase: 0.54, headCap: 0.96,
  headScatter: 0.22, headSpeedBase: 15, headSpeedSkill: 9,
}
// sem overrides: mede os valores REAIS gravados nos arquivos.
const CONFIGS: Cfg[] = [{ name: 'valores atuais' }]

type Acc = {
  goals: number; goalsHead: number; goalsBox: number; goalsOutBox: number
  shots: number; shotsHead: number; shotsBox: number
}

const simMatch = (div: Division, i: number, acc: Acc) => {
  const rng = makeRng(mixSeed(0x70b0, mixSeed(div.charCodeAt(0), i)))
  const defs = CLUBS_BY_DIVISION[div]
  const home = generateClub(defs[(i * 2) % defs.length], div, rng).squad
  const away = generateClub(defs[(i * 2 + 1) % defs.length], div, rng).squad
  const s = createMatch({ home: lineupFor(home), away: lineupFor(away) })
  const dt = 1 / 30
  let guard = 0
  let prevShots = 0
  let prevGoals = 0
  // info do último chute (capturada no instante do chute p/ classificar o gol)
  let lastInBox = false
  while (s.status !== 'over' && guard++ < 300_000) {
    if (s.celebration) { stepCelebration(s, dt); continue }
    step(s, dt)
    const shots = s.stats.home.shots + s.stats.away.shots
    if (shots > prevShots) {
      prevShots = shots
      const sh = s.lastShooterId !== null ? s.players.find((p) => p.id === s.lastShooterId) : null
      const inBox = sh ? inPenaltyArea(sh.pos, attackingGoalX(s.attackDir[sh.team])) : false
      lastInBox = inBox
      acc.shots++
      if (s.lastShotHeader) acc.shotsHead++
      if (inBox) acc.shotsBox++
    }
    const goals = s.score.home + s.score.away
    if (goals > prevGoals) {
      prevGoals = goals
      acc.goals++
      if (s.lastShotHeader) acc.goalsHead++
      if (lastInBox) acc.goalsBox++
      else acc.goalsOutBox++
    }
  }
}

console.log('================================================================')
console.log(` TIPOS DE GOL/CHUTE — motor físico · ${N} jogos/divisão/config`)
console.log('================================================================\n')
console.log('  config           div │ gols │  cabeça (gol/tent)  │ gol box │ chutes(box%)')

const pct = (x: number, tot: number) => tot ? ((x / tot) * 100).toFixed(0) + '%' : '-'
for (const c of CONFIGS) {
  apply(c)
  for (const div of DIVS) {
    const a: Acc = { goals: 0, goalsHead: 0, goalsBox: 0, goalsOutBox: 0, shots: 0, shotsHead: 0, shotsBox: 0 }
    for (let i = 0; i < N; i++) simMatch(div, i, a)
    console.log(
      `  ${(c.name).padEnd(16)} ${div}  │ ${(a.goals / N).toFixed(2)} │ gol ${(a.goalsHead / N).toFixed(2)} tent ${(a.shotsHead / N).toFixed(2)} │  ${pct(a.goalsBox, a.goals).padStart(4)}   │ ${(a.shots / N).toFixed(1)} (${pct(a.shotsBox, a.shots)})`,
    )
  }
}
