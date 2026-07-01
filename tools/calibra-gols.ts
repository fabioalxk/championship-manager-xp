/**
 * CALIBRAÇÃO DE GOLS — varre combinações de constantes do motor e mede gols/jogo
 * por divisão (motor físico, clockRate real=40), para achar o ajuste que leva
 * TODAS as divisões a ~3 gols/jogo. Não altera arquivos: muta as constantes em
 * runtime (mesmos objetos que o engine lê) e restaura entre configs.
 */
import { createMatch, step, stepCelebration } from '../src/sim/engine'
import { AI, GK, SHOT, HEAD, CONTROL, DUEL } from '../src/sim/constants'
const SH = SHOT as typeof SHOT & { spreadFloor: number; spreadScale: number; spreadTech: number; spreadCons: number }
import { generateClub } from '../src/game/generate'
import { lineupFor } from '../src/game/lineup'
import { CLUBS_BY_DIVISION } from '../src/game/clubs'
import { makeRng, mixSeed } from '../src/game/random'
import { DIVISION_LEVEL } from '../src/game/generate'
import { DIVISIONS } from '../src/game/types'
import type { Division } from '../src/game/types'

const N = 46 // partidas por divisão por config

const simGoals = (div: Division, i: number) => {
  const rng = makeRng(mixSeed(0x4d07, mixSeed(div.charCodeAt(0), i)))
  const defs = CLUBS_BY_DIVISION[div]
  const home = generateClub(defs[(i * 2) % defs.length], div, rng).squad
  const away = generateClub(defs[(i * 2 + 1) % defs.length], div, rng).squad
  const s = createMatch({ home: lineupFor(home), away: lineupFor(away) })
  const dt = 1 / 30
  let guard = 0
  while (s.status !== 'over' && guard++ < 300_000) {
    if (s.celebration) stepCelebration(s, dt)
    else step(s, dt)
  }
  return {
    goals: s.score.home + s.score.away,
    shots: s.stats.home.shots + s.stats.away.shots,
  }
}

type Cfg = {
  name: string
  shootRange?: number
  shootCone?: number
  saveBase?: number
  saveSkill?: number
  saveCap?: number
  secondChance?: number
  headBase?: number
  headCap?: number
  miscontrol?: number
  spreadScale?: number
  spreadTech?: number
  spreadCons?: number
  spreadFloor?: number
  duelSwing?: number
  baseWin?: number
  beatBase?: number
  beatSwing?: number
}

// snapshot dos originais p/ restaurar
const ORIG = {
  shootRange: AI.shootRange, shootCone: AI.shootCone,
  saveBase: GK.saveBase, saveSkill: GK.saveSkill, saveCap: GK.saveCap, secondChance: GK.secondChance,
  headBase: HEAD.base, headCap: HEAD.cap, miscontrol: CONTROL.miscontrolScale,
  spreadScale: SH.spreadScale, spreadTech: SH.spreadTech, spreadCons: SH.spreadCons, spreadFloor: SH.spreadFloor,
  duelSwing: DUEL.duelSwing, baseWin: DUEL.baseWin, beatBase: DUEL.beatBase, beatSwing: DUEL.beatSwing,
}

const apply = (c: Cfg) => {
  AI.shootRange = c.shootRange ?? ORIG.shootRange
  AI.shootCone = c.shootCone ?? ORIG.shootCone
  GK.saveBase = c.saveBase ?? ORIG.saveBase
  GK.saveSkill = c.saveSkill ?? ORIG.saveSkill
  GK.saveCap = c.saveCap ?? ORIG.saveCap
  GK.secondChance = c.secondChance ?? ORIG.secondChance
  HEAD.base = c.headBase ?? ORIG.headBase
  HEAD.cap = c.headCap ?? ORIG.headCap
  CONTROL.miscontrolScale = c.miscontrol ?? ORIG.miscontrol
  SH.spreadScale = c.spreadScale ?? ORIG.spreadScale
  SH.spreadTech = c.spreadTech ?? ORIG.spreadTech
  SH.spreadCons = c.spreadCons ?? ORIG.spreadCons
  SH.spreadFloor = c.spreadFloor ?? ORIG.spreadFloor
  DUEL.duelSwing = c.duelSwing ?? ORIG.duelSwing
  DUEL.baseWin = c.baseWin ?? ORIG.baseWin
  DUEL.beatBase = c.beatBase ?? ORIG.beatBase
  DUEL.beatSwing = c.beatSwing ?? ORIG.beatSwing
}

// base comum: range/cone largos + miscontrol baixo (inunda chutes, fecha o gap de
// QUANTIDADE) + GK reduzido. Varremos a DISPERSÃO do chute p/ fechar o gap de CONVERSÃO.
// dispersão do chute FIXA num bom valor (fecha o gap de conversão); varremos
// distância de chute + goleiro p/ trazer C e D ao patamar de 3 sem estourar A.
// dispersão + goleiro fixos num bom ponto; agora reduzimos a sensibilidade da
// CONSTRUÇÃO (duelos/dribles) p/ a Série D chegar mais ao chute de qualidade.
const BASE = {
  shootCone: 30, saveBase: 0.07, saveSkill: 0.09, saveCap: 0.80, secondChance: 0.10,
  headBase: 0.36, headCap: 0.90, spreadScale: 0.32, spreadTech: 0.30, spreadCons: 0.24, spreadFloor: 0.04,
}
// ENGINE fixo numa boa config (A~3.8, gap controlado); varremos a COMPRESSÃO dos
// níveis de divisão p/ subir C e D ao patamar de 3 sem estourar A.
const ENGINE = {
  ...BASE, shootRange: 30, shootCone: 30, miscontrol: 0.06, duelSwing: 0.7, baseWin: 0.42,
  beatBase: 0.24, beatSwing: 0.55, saveBase: 0.07, saveSkill: 0.09, saveCap: 0.80, secondChance: 0.10,
  headBase: 0.36, headCap: 0.90, spreadScale: 0.30, spreadTech: 0.30, spreadCons: 0.24, spreadFloor: 0.04,
}
const CONFIGS: Cfg[] = [{ name: 'engine', ...ENGINE }]

const LEVELS: Record<string, Record<Division, number>> = {
  'L1 76/71/66/62':    { A: 76, B: 71, C: 66, D: 62 },
  'L1b 77/71/66/61':   { A: 77, B: 71, C: 66, D: 61 },
}
const applyLevels = (lv: Record<Division, number>) => {
  for (const d of DIVISIONS as Division[]) DIVISION_LEVEL[d] = lv[d]
}

console.log('================================================================')
console.log(` CALIBRAÇÃO DE GOLS/JOGO — motor físico · ${N} jogos/div/config`)
console.log('================================================================\n')
console.log('  níveis (A/B/C/D)     │   A     B     C     D   │ chutes A/D │ conv A/D')

apply(CONFIGS[0]) // config de motor fixa
for (const [name, lv] of Object.entries(LEVELS)) {
  applyLevels(lv)
  const out: Record<string, { g: number; sh: number }> = {}
  for (const div of DIVISIONS as Division[]) {
    let g = 0, sh = 0
    for (let i = 0; i < N; i++) { const r = simGoals(div, i); g += r.goals; sh += r.shots }
    out[div] = { g: g / N, sh: sh / N }
  }
  const f = (x: number) => x.toFixed(2)
  const cv = (d: { g: number; sh: number }) => d.sh > 0 ? ((d.g / d.sh) * 100).toFixed(0) + '%' : '-'
  console.log(
    `  ${name.padEnd(20)}│ ${f(out.A.g)}  ${f(out.B.g)}  ${f(out.C.g)}  ${f(out.D.g)} │ ${out.A.sh.toFixed(1)}/${out.D.sh.toFixed(1)} │ ${cv(out.A)}/${cv(out.D)}`,
  )
}
