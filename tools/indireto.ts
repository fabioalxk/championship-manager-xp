/**
 * TIRO LIVRE INDIRETO (feature nova do usuário) — testa a Lei 13: gol batido
 * DIRETO (só o cobrador tocou) é ANULADO; após um 2º toque, o gol VALE. Arma o
 * estado indireto, manda a bola pro gol vazio (GK afastado) e checa o desfecho.
 */
import { createMatch, step } from '../src/sim/engine'
import { FIELD } from '../src/sim/constants'

const N = 500

// away ataca o gol x=0 (home defende). Mede se o gol conta.
const trial = (secondTouch: boolean): boolean => {
  const s = createMatch()
  const away = s.players.filter((p) => p.team === 'away' && p.role !== 'GK')
  const taker = away[0]
  const other = away[1]
  // afasta o goleiro da casa pra isolar a REGRA (não a defesa)
  const gk = s.players.find((p) => p.team === 'home' && p.role === 'GK')!
  gk.pos = { x: 50, y: 6 }
  s.indirectFK = true
  s.indirectTakerId = taker.id
  s.lastTouchId = secondTouch ? other.id : taker.id // 2º toque = outro jogador
  s.controllerId = null
  s.deadball = 0
  s.kickCooldown = 0
  s.ball.pos = { x: 5, y: FIELD.cy }
  s.ball.vel = { x: -60, y: 0 } // forte rumo ao gol x=0
  s.ball.z = 0
  s.ball.vz = 0
  const before = s.score.away
  for (let i = 0; i < 30 && s.score.away === before; i++) step(s, 1 / 30)
  return s.score.away > before
}

let directGoals = 0, touchGoals = 0
for (let i = 0; i < N; i++) { if (trial(false)) directGoals++; if (trial(true)) touchGoals++ }

console.log('================================================================')
console.log(` TIRO LIVRE INDIRETO — Lei 13 · ${N} tentativas cada`)
console.log('================================================================')
console.log(`\n  Batido DIRETO (só o cobrador tocou):  ${((directGoals / N) * 100).toFixed(0)}% viraram gol   → deve ser 0% (anulado)`)
console.log(`  Com 2º TOQUE (outro jogador tocou):   ${((touchGoals / N) * 100).toFixed(0)}% viraram gol   → deve ser ~100% (vale)`)
console.log(`\n  ${directGoals === 0 && touchGoals > N * 0.9 ? '✅ Lei 13 correta: indireto direto anulado, com 2º toque vale.' : '❌ regra do indireto com problema'}`)
