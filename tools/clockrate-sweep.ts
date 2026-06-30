/**
 * VARREDURA de clockRate — acha o valor que dá placar REALISTA com os elencos
 * reais. clockRate alto comprime o jogo (poucos eventos); baixo = tempo real.
 * Mede gols/jogo, chutes/jogo e % de 0×0 por clockRate. Alvo: ~2.6 gols, ~25 chutes.
 */
import { createMatch, step, stepCelebration } from '../src/sim/engine'
import { MATCH } from '../src/sim/constants'

const batch = (clock: number, N: number) => {
  MATCH.clockRate = clock
  let goals = 0, shots = 0, zeros = 0, sot = 0
  for (let i = 0; i < N; i++) {
    const s = createMatch()
    let guard = 0
    while (s.status !== 'over' && guard++ < 2_000_000) {
      if (s.celebration) stepCelebration(s, 1 / 30)
      else step(s, 1 / 30)
    }
    const g = s.score.home + s.score.away
    goals += g; if (g === 0) zeros++
    shots += s.stats.home.shots + s.stats.away.shots
    sot += s.stats.home.shotsOnTarget + s.stats.away.shotsOnTarget
  }
  return { clock, gpg: goals / N, spg: shots / N, zeros: (zeros / N) * 100, conv: shots ? (goals / shots) * 100 : 0, N }
}

console.log('================================================================')
console.log(' VARREDURA clockRate — Brasil × Argentina (elencos reais)')
console.log('   alvo realista: ~2.6 gols/jogo · ~25 chutes/jogo · 0×0 ~7%')
console.log('================================================================')
console.log('\n   clockRate   gols/jogo   chutes/jogo   conversão   jogos 0×0')

for (const [clock, N] of [[24, 16], [12, 12], [6, 10], [3, 8], [2, 6], [1, 5]] as [number, number][]) {
  const r = batch(clock, N)
  console.log(`   ${String(clock).padStart(7)}   ${r.gpg.toFixed(2).padStart(8)}   ${r.spg.toFixed(1).padStart(10)}   ${(r.conv.toFixed(0) + '%').padStart(8)}   ${(r.zeros.toFixed(0) + '%').padStart(7)}   (${N} jogos)`)
}

console.log('\n✅ O clockRate cujo gols/jogo cai perto de ~2.6 e chutes ~25 é o alvo do ajuste.')
