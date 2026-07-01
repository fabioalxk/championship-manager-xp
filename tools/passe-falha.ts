/**
 * DECOMPOSIÇÃO DA FALHA DE PASSE (#8) — dos passes que falham, quantos são
 * INTERCEPTADOS (adversário pega) vs JOGADOS PRA FORA (erro de mira)? Aponta o
 * lever certo: interceptação (markPull/chaseLead) vs passSpread. Real: a maioria
 * dos passes completa; das falhas, interceptação e "fora" se dividem.
 */
import { createMatch, step, stepCelebration } from '../src/sim/engine'
import { MATCH } from '../src/sim/constants'
import type { TeamId } from '../src/sim/types'

MATCH.clockRate = 2
const N = 10

let ok = 0, intercept = 0, out = 0
for (let i = 0; i < N; i++) {
  const s = createMatch()
  let prevPasser = s.lastPasserId
  let pending: TeamId | null = null
  let guard = 0
  while (s.status !== 'over' && guard++ < 600_000) {
    if (s.celebration) stepCelebration(s, 1 / 30)
    else step(s, 1 / 30)
    if (s.lastPasserId !== prevPasser && s.lastPasserId !== null) {
      const p = s.players.find((q) => q.id === s.lastPasserId); if (p) pending = p.team; prevPasser = s.lastPasserId
    }
    if (pending !== null) {
      // saiu pra fora antes de alguém controlar?
      if (s.throwIn || s.goalKick) { out++; pending = null }
      else if (s.controllerId !== null) {
        const r = s.players.find((q) => q.id === s.controllerId)
        if (r) { if (r.team === pending) ok++; else intercept++; pending = null }
      }
    }
  }
}

const tot = ok + intercept + out
const fails = intercept + out
const p = (x: number, t: number) => (t ? ((x / t) * 100).toFixed(0) : '0') + '%'
console.log('================================================================')
console.log(` DECOMPOSIÇÃO DA FALHA DE PASSE — ${N} jogos`)
console.log('================================================================')
console.log(`\n  Passes: ${tot}`)
console.log(`  ✅ completos:     ${p(ok, tot)}`)
console.log(`  🥷 interceptados: ${p(intercept, tot)}   (${p(intercept, fails)} das FALHAS)`)
console.log(`  ↗️  fora/erro mira: ${p(out, tot)}   (${p(out, fails)} das FALHAS)`)
console.log('\n  ➤ se interceptação domina as falhas → lever = markPull/chaseLead (defesa fácil demais).')
console.log('    se "fora" domina → lever = passSpread (mira do passe ruim demais).')
