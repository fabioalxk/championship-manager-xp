/**
 * INVARIANTES / robustez — varre partidas atrás de estados inválidos que indicam
 * bugs numéricos: posição/velocidade NaN ou Infinity, bola/jogador muito fora do
 * campo, energia fora de [floor,1], e partidas que NÃO terminam (deadlock).
 */
import { createMatch, step, stepCelebration } from '../src/sim/engine'
import { FIELD, MATCH, STAMINA } from '../src/sim/constants'

MATCH.clockRate = 2
const N = 8

const fin = (...xs: number[]) => xs.every((x) => Number.isFinite(x))
let nanFrames = 0, wildPos = 0, energyViol = 0, notDone = 0
let minFinalMin = Infinity, maxFinalMin = 0
const TOL = 15 // m fora do campo que ainda é "ok" (bola saindo antes do reinício)

for (let i = 0; i < N; i++) {
  const s = createMatch()
  let guard = 0, badNan = false, badWild = false, badEnergy = false
  while (s.status !== 'over' && guard++ < 800_000) {
    if (s.celebration) stepCelebration(s, 1 / 30)
    else step(s, 1 / 30)
    const b = s.ball
    if (!fin(b.pos.x, b.pos.y, b.vel.x, b.vel.y, b.z)) badNan = true
    if (b.pos.x < -TOL || b.pos.x > FIELD.w + TOL || b.pos.y < -TOL || b.pos.y > FIELD.h + TOL) badWild = true
    for (const p of s.players) {
      if (!fin(p.pos.x, p.pos.y, p.vel.x, p.vel.y, p.energy)) badNan = true
      if (p.pos.x < -TOL || p.pos.x > FIELD.w + TOL || p.pos.y < -TOL || p.pos.y > FIELD.h + TOL) badWild = true
      if (p.energy < STAMINA.floor - 0.02 || p.energy > 1.02) badEnergy = true
    }
  }
  if (s.status !== 'over') notDone++
  if (badNan) nanFrames++
  if (badWild) wildPos++
  if (badEnergy) energyViol++
  const m = s.time / 60
  minFinalMin = Math.min(minFinalMin, m); maxFinalMin = Math.max(maxFinalMin, m)
}

const pc = (x: number) => ((x / N) * 100).toFixed(0) + '%'
console.log('================================================================')
console.log(` INVARIANTES / robustez — ${N} partidas completas`)
console.log('================================================================')
console.log(`\n  Partidas com NaN/Infinity:       ${pc(nanFrames)}   ${nanFrames ? '❌ BUG numérico!' : '✅'}`)
console.log(`  Partidas com bola/jogador >15m fora: ${pc(wildPos)}   ${wildPos ? '❌ algo escapa do campo' : '✅'}`)
console.log(`  Partidas com energia fora de [${STAMINA.floor},1]: ${pc(energyViol)}   ${energyViol ? '❌' : '✅'}`)
console.log(`  Partidas que NÃO terminaram:     ${pc(notDone)}   ${notDone ? '❌ deadlock' : '✅'}`)
console.log(`  Minuto final (clock):            ${minFinalMin.toFixed(0)}–${maxFinalMin.toFixed(0)} min   (esperado ~90-96)`)
console.log('\n  ➤ tudo ✅ = motor numericamente robusto; qualquer ❌ é bug de física/estado.')
