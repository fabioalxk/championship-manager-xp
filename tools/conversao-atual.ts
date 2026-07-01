/**
 * CONVERSÃO & DEFESA — estado atual do #1 após o "chute por cima". Classifica cada
 * chute em partida real: GOL / DEFESA (GK toca) / BLOQUEIO (defensor de linha) /
 * FORA. Mede conversão e a % de defesa do GK nos chutes que chegam nele.
 */
import { createMatch, step, stepCelebration } from '../src/sim/engine'
import { MATCH } from '../src/sim/constants'
import type { TeamId } from '../src/sim/types'

MATCH.clockRate = 2
const N = 14

let shots = 0, goals = 0, saved = 0, blocked = 0, off = 0
for (let i = 0; i < N; i++) {
  const s = createMatch()
  let prevShots = 0, prevH = 0, prevA = 0, guard = 0
  let w: { team: TeamId; shooter: number; steps: number } | null = null
  const resolve = (kind: 'g' | 's' | 'b' | 'o') => { if (kind === 'g') goals++; else if (kind === 's') saved++; else if (kind === 'b') blocked++; else off++; w = null }
  while (s.status !== 'over' && guard++ < 600_000) {
    if (s.celebration) stepCelebration(s, 1 / 30)
    else step(s, 1 / 30)
    const tot = s.stats.home.shots + s.stats.away.shots
    if (tot > prevShots) {
      shots += tot - prevShots
      const sh = s.lastShooterId !== null ? s.players.find((p) => p.id === s.lastShooterId) : null
      if (sh) w = { team: sh.team, shooter: sh.id, steps: 0 }
      prevShots = tot
    }
    if (w) {
      w.steps++
      const gained = w.team === 'home' ? s.score.home - prevH : s.score.away - prevA
      if (gained > 0) resolve('g')
      else {
        const t = s.lastTouchId
        if (t !== null && t !== w.shooter) {
          const p = s.players.find((q) => q.id === t)
          if (p && p.team !== w.team) resolve(p.role === 'GK' ? 's' : 'b')
        }
        if (w && (s.throwIn || s.goalKick)) resolve('o')
        else if (w && w.steps > 40) resolve('o')
      }
    }
    prevH = s.score.home; prevA = s.score.away
  }
}

const p = (x: number, t: number) => (t ? ((x / t) * 100).toFixed(0) : '0') + '%'
const onGk = goals + saved
console.log('================================================================')
console.log(` CONVERSÃO & DEFESA (estado atual do #1) — ${N} jogos`)
console.log('================================================================')
console.log(`\n  Chutes: ${shots}`)
console.log(`  ⚽ gol:      ${p(goals, shots)}   (conversão · real ~10%)`)
console.log(`  🧤 defesa:   ${p(saved, shots)}`)
console.log(`  🧱 bloqueio: ${p(blocked, shots)}`)
console.log(`  ↗️  fora:     ${p(off, shots)}`)
console.log(`\n  Taxa de defesa do GK (dos que chegam nele): ${p(saved, onGk)}   (real ~68%)`)
console.log('\n  ➤ conversão ainda alta / defesa baixa = #1 (GK fraco) persiste apesar do "chute por cima".')
