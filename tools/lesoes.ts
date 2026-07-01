/**
 * LESÕES (INJURY, feature nova) — falta pode machucar o faltado (knock → perde
 * ritmo). Mede: % das faltas que machucam, lesões/jogo, e o impacto no maxSpeed
 * de quem está com knock. (`maxSpeed = base * fatigue * (1-knock)`)
 */
import { createMatch, step, stepCelebration } from '../src/sim/engine'
import { MATCH, INJURY } from '../src/sim/constants'
import { maxSpeed } from '../src/sim/ratings'
import { A, mkP } from './_simlib'

MATCH.clockRate = 2
const N = 16

let fouls = 0, injuries = 0, serious = 0
for (let i = 0; i < N; i++) {
  const s = createMatch()
  const knock = new Map<number, number>(s.players.map((p) => [p.id, 0]))
  let prevFouls = 0, guard = 0
  while (s.status !== 'over' && guard++ < 600_000) {
    if (s.celebration) stepCelebration(s, 1 / 30)
    else step(s, 1 / 30)
    for (const p of s.players) {
      const was = knock.get(p.id) ?? 0
      if (p.knock > was + 1e-6) { // knock subiu → nova lesão
        injuries++
        if (p.knock - was >= INJURY.seriousImpair - 1e-3) serious++
      }
      knock.set(p.id, p.knock)
    }
    prevFouls = s.stats.home.fouls + s.stats.away.fouls
  }
  fouls += prevFouls
}

const p = (x: number, t: number) => (t ? ((x / t) * 100).toFixed(1) : '0') + '%'
console.log('================================================================')
console.log(` LESÕES (INJURY) — ${N} partidas reais`)
console.log('================================================================')
console.log(`\n  Faltas: ${fouls}  ·  Lesões: ${injuries}  (${(injuries / N).toFixed(1)}/jogo)`)
console.log(`  % das faltas que machucam: ${p(injuries, fouls)}   (config: 6% × (1+agressão) ≈ 9-11%)`)
console.log(`  Graves: ${p(serious, injuries)} das lesões   (config seriousFrac=22%)`)
console.log('\n  Impacto no ritmo (maxSpeed) de um jogador pace 80:')
const base = A({ pace: 80, acceleration: 65 })
const v0 = maxSpeed(mkP(base))
console.log(`   sadio:        ${(v0 * 3.6).toFixed(1)} km/h`)
console.log(`   pancada leve (knock 0.10): ${(v0 * 0.9 * 3.6).toFixed(1)} km/h  (-10%)`)
console.log(`   lesão grave  (knock 0.26): ${(v0 * 0.74 * 3.6).toFixed(1)} km/h  (-26%)`)
console.log('\n  ➤ lesão deve ser ocasional (não toda falta) e o knock deve derrubar o ritmo de verdade.')
