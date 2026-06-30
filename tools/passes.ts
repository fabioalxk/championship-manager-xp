/**
 * ACERTO DE PASSE em partida real — métrica fundamental nunca medida. Detecta
 * cada passe (lastPasserId muda) e olha quem RECEBE: companheiro = completo,
 * adversário/saída = errado. Benchmark real: ~80% de acerto.
 */
import { createMatch, step, stepCelebration } from '../src/sim/engine'
import { MATCH } from '../src/sim/constants'
import type { TeamId } from '../src/sim/types'

MATCH.clockRate = 2
const N = 8

const acc: Record<TeamId, { ok: number; bad: number }> = { home: { ok: 0, bad: 0 }, away: { ok: 0, bad: 0 } }

for (let i = 0; i < N; i++) {
  const s = createMatch()
  let prevPasser = s.lastPasserId
  let pending: TeamId | null = null
  let guard = 0
  while (s.status !== 'over' && guard++ < 600_000) {
    if (s.celebration) stepCelebration(s, 1 / 30)
    else step(s, 1 / 30)
    // novo passe?
    if (s.lastPasserId !== prevPasser && s.lastPasserId !== null) {
      const passer = s.players.find((p) => p.id === s.lastPasserId)
      if (passer) pending = passer.team
      prevPasser = s.lastPasserId
    }
    // recepção do passe pendente
    if (pending !== null && s.controllerId !== null) {
      const rec = s.players.find((p) => p.id === s.controllerId)
      if (rec) {
        if (rec.team === pending) acc[pending].ok++
        else acc[pending].bad++
        pending = null
      }
    }
  }
}

const pct = (t: TeamId) => {
  const tot = acc[t].ok + acc[t].bad
  return tot ? ((acc[t].ok / tot) * 100).toFixed(1) + '%' : '—'
}
const totOk = acc.home.ok + acc.away.ok
const totAll = totOk + acc.home.bad + acc.away.bad

console.log('================================================================')
console.log(` ACERTO DE PASSE — ${N} jogos reais (Brasil × Argentina)`)
console.log('================================================================')
console.log(`\n  Geral:     ${((totOk / totAll) * 100).toFixed(1)}%   (real ~80%)`)
console.log(`  Brasil:    ${pct('home')}`)
console.log(`  Argentina: ${pct('away')}`)
console.log(`  Passes tentados/jogo: ${(totAll / N).toFixed(0)}`)
console.log('\n  ➤ se muito abaixo de ~80% → passe erra demais (ou intercepta demais); muito acima → fácil demais.')
