/**
 * DISTRIBUIÇÃO DO GOLEIRO em jogo — quando o GK repõe (tiro de meta/lançamento),
 * a bola chega num companheiro? Testa kicking/throwing/decisão de distribuição no
 * contexto real. Detecta a bola saindo do GK e olha quem a recebe.
 */
import { createMatch, step, stepCelebration } from '../src/sim/engine'
import { MATCH } from '../src/sim/constants'
import type { TeamId } from '../src/sim/types'

MATCH.clockRate = 2
const N = 10

let ok = 0, bad = 0
for (let i = 0; i < N; i++) {
  const s = createMatch()
  const gkTeam = new Map(s.players.filter((p) => p.role === 'GK').map((p) => [p.id, p.team]))
  let prevCtrl = s.controllerId
  let pending: TeamId | null = null
  let guard = 0
  while (s.status !== 'over' && guard++ < 600_000) {
    if (s.celebration) stepCelebration(s, 1 / 30)
    else step(s, 1 / 30)
    // GK soltou a bola (era controlador GK, virou null) → distribuição em voo
    if (prevCtrl !== null && gkTeam.has(prevCtrl) && s.controllerId === null && pending === null)
      pending = gkTeam.get(prevCtrl)!
    // recepção
    if (pending !== null && s.controllerId !== null) {
      const rec = s.players.find((p) => p.id === s.controllerId)
      if (rec) { if (rec.team === pending) ok++; else bad++; pending = null }
    }
    prevCtrl = s.controllerId
  }
}

const tot = ok + bad
console.log('================================================================')
console.log(` DISTRIBUIÇÃO DO GOLEIRO — ${N} jogos reais`)
console.log('================================================================')
console.log(`\n  Reposições do GK que chegaram a um companheiro: ${tot ? ((ok / tot) * 100).toFixed(1) : '—'}%`)
console.log(`  (de ${tot} reposições · ${(tot / N).toFixed(1)} por jogo)`)
console.log('\n  ➤ baixo demais = GK entrega a posse; ~50-65% é razoável (chutão é disputado).')
