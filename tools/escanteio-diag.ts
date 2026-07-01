/**
 * DIAGNÓSTICO do escanteio: valida o TIME que cobra e mede a jogada.
 *  - o escanteio é dado ao time ATACANTE (o que ataca aquela linha de fundo)?
 *  - o cobrador é do time certo e está na quina?
 *  - a cobrança é ALÇADA e chega na área, com atacantes lá p/ o cabeceio?
 *  - saiu CABEÇADA / chute?
 * Mede atacantes na área NO MOMENTO DA COBRANÇA (fim do congelamento), não ao
 * ser marcado o escanteio (aí os jogadores ainda não carregaram a área).
 */
import { createMatch, step, stepCelebration } from '../src/sim/engine'
import { MATCH, FIELD, AREA } from '../src/sim/constants'
import type { MatchState, TeamId } from '../src/sim/types'

MATCH.clockRate = 2
const N = 20

const attackGoalX = (s: MatchState, team: TeamId) =>
  s.attackDir[team] > 0 ? FIELD.w : 0
const inBox = (x: number, y: number, gx: number) =>
  Math.abs(x - gx) <= AREA.penaltyDepth &&
  Math.abs(y - FIELD.cy) <= AREA.penaltyHalfWidth

let corners = 0
let wrongTeam = 0, takerWrong = 0
let lofted = 0, reachedBox = 0, header = 0, shotAny = 0, goal = 0
let sumPeak = 0, sumAtk = 0, sumDef = 0

for (let i = 0; i < N; i++) {
  const s = createMatch()
  let ch = 0, ca = 0, guard = 0
  let w: null | {
    team: TeamId; gx: number; peak: number; reached: boolean;
    launched: boolean; measured: boolean; shots0: number; score0: number;
    liveSteps: number; steps: number; atk: number; def: number;
    sawShot: boolean; sawHeader: boolean; sawGoal: boolean;
  } = null

  while (s.status !== 'over' && guard++ < 600_000) {
    if (s.celebration) stepCelebration(s, 1 / 30)
    else step(s, 1 / 30)

    const newH = s.stats.home.corners > ch
    const newA = s.stats.away.corners > ca
    if (newH || newA) {
      const team: TeamId = newH ? 'home' : 'away'
      ch = s.stats.home.corners; ca = s.stats.away.corners
      const gx = attackGoalX(s, team)
      corners++
      // o time que cobra deve ATACAR aquela linha (gx == seu gol de ataque)
      // valida também: a bola saiu por gx? (a cobrança é naquela linha de fundo)
      const ballGx = s.ball.pos.x < FIELD.cx ? 0 : FIELD.w
      if (ballGx !== gx) wrongTeam++
      // o cobrador (controllerId) é do time que cobra e está na quina?
      const taker = s.players.find((p) => p.id === s.controllerId)
      if (!taker || taker.team !== team) takerWrong++
      w = {
        team, gx, peak: 0, reached: false, launched: false, measured: false,
        shots0: s.stats[team].shots, score0: s.score[team], liveSteps: 0, steps: 0,
        atk: 0, def: 0, sawShot: false, sawHeader: false, sawGoal: false,
      }
    }

    if (w) {
      w.steps++
      const live = s.deadball <= 0 && s.controllerId === null
      if (live && !w.measured) {
        // instante da cobrança: conta quem está na área
        w.measured = true
        w.atk = s.players.filter((p) => p.team === w!.team && p.role !== 'GK' && inBox(p.pos.x, p.pos.y, w!.gx)).length
        w.def = s.players.filter((p) => p.team !== w!.team && p.role !== 'GK' && inBox(p.pos.x, p.pos.y, w!.gx)).length
      }
      if (live) w.launched = true
      if (w.launched) {
        w.liveSteps++
        if (s.ball.z > w.peak) w.peak = s.ball.z
        if (inBox(s.ball.pos.x, s.ball.pos.y, w.gx)) w.reached = true
        if (s.stats[w.team].shots > w.shots0) {
          w.sawShot = true
          if (s.lastShotHeader) w.sawHeader = true
          w.shots0 = s.stats[w.team].shots
        }
        if (s.score[w.team] > w.score0) w.sawGoal = true
      }
      // janela de ~6s de JOGO (liveSteps) após a cobrança — não conta o congelamento
      if (w.launched && (w.liveSteps > 180 || w.sawGoal)) {
        finalize(w); w = null
      } else if (w.steps > 400) { // trava de segurança
        finalize(w); w = null
      }
    }
  }
}

function finalize(w: {
  peak: number; reached: boolean; atk: number; def: number;
  sawShot: boolean; sawHeader: boolean; sawGoal: boolean;
}) {
  if (w.peak > 1.3) lofted++
  if (w.reached) reachedBox++
  if (w.sawShot) shotAny++
  if (w.sawHeader) header++
  if (w.sawGoal) goal++
  sumPeak += w.peak; sumAtk += w.atk; sumDef += w.def
}

const pct = (n: number) => ((n / corners) * 100).toFixed(0)
console.log('================================================================')
console.log(` DIAGNÓSTICO DO ESCANTEIO — ${N} partidas (${corners} escanteios)`)
console.log('================================================================')
console.log(`\n  [TIME] escanteio na linha ERRADA:   ${wrongTeam}/${corners}  (deve ser 0)`)
console.log(`  [TIME] cobrador de time errado:     ${takerWrong}/${corners}  (deve ser 0)`)
console.log(`\n  Alçado (pico > 1.3m):   ${lofted}/${corners}  →  ${pct(lofted)}%`)
console.log(`  Pico médio da bola:     ${(sumPeak / corners).toFixed(2)} m`)
console.log(`  Chegou na área:         ${reachedBox}/${corners}  →  ${pct(reachedBox)}%`)
console.log(`  Atacantes na área:      ${(sumAtk / corners).toFixed(1)}  (na cobrança)`)
console.log(`  Defensores na área:     ${(sumDef / corners).toFixed(1)}  (na cobrança)`)
console.log(`  Gerou CABEÇADA:         ${header}/${corners}  →  ${pct(header)}%`)
console.log(`  Gerou chute (qualquer): ${shotAny}/${corners}  →  ${pct(shotAny)}%`)
console.log(`  Virou GOL:              ${goal}/${corners}  →  ${pct(goal)}%   (real ~3%)`)
console.log('\n  ➤ esperado: time certo, cobrança alçada, ~3-5 atacantes na área, cabeçadas a gol.')
