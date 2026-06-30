/**
 * SEQUÊNCIA DE POSSE — quantos toques o mesmo time encadeia antes de perder a
 * bola. Quantifica o fluxo do jogo: spell longo = troca de passes; spell curto =
 * jogo picado/caótico. Real ~3-4 passes por posse. Conta toques consecutivos do
 * mesmo time (controllerId muda dentro do time vs muda de lado).
 */
import { createMatch, step, stepCelebration } from '../src/sim/engine'
import { MATCH } from '../src/sim/constants'
import type { TeamId } from '../src/sim/types'

MATCH.clockRate = 2
const N = 8

const spells: number[] = []
for (let i = 0; i < N; i++) {
  const s = createMatch()
  let prevCtrl = s.controllerId
  let curTeam: TeamId | null = null, run = 0
  let guard = 0
  while (s.status !== 'over' && guard++ < 600_000) {
    if (s.celebration) stepCelebration(s, 1 / 30)
    else step(s, 1 / 30)
    if (s.controllerId !== null && s.controllerId !== prevCtrl) {
      const p = s.players.find((q) => q.id === s.controllerId)
      if (p) {
        if (p.team === curTeam) run++
        else { if (curTeam !== null) spells.push(run); curTeam = p.team; run = 1 }
      }
      prevCtrl = s.controllerId
    }
  }
  if (run > 0) spells.push(run)
}

const avg = spells.reduce((a, b) => a + b, 0) / spells.length
const one = spells.filter((x) => x === 1).length / spells.length
const long = spells.filter((x) => x >= 4).length / spells.length
console.log('================================================================')
console.log(` SEQUÊNCIA DE POSSE — ${N} jogos reais`)
console.log('================================================================')
console.log(`\n  Toques por posse (média): ${avg.toFixed(2)}   (real ~3-4 passes/posse)`)
console.log(`  Posses de 1 toque só:     ${(one * 100).toFixed(0)}%   (perde de imediato)`)
console.log(`  Posses de 4+ toques:      ${(long * 100).toFixed(0)}%   (troca de passes encaixada)`)
console.log(`  Total de posses/jogo:     ${(spells.length / N).toFixed(0)}`)
console.log('\n  ➤ média baixa (~1.5) + muitas posses de 1 toque = jogo picado (bate com passe 55%).')
