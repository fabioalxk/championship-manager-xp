/**
 * VELOCIDADE dos jogadores — prova que uns são CONSIDERAVELMENTE mais rápidos.
 * Mede velocidade de topo (km/h), tempos de sprint (10/20/30/40 m) e o DUELO
 * direto (o mais rápido chega antes na bola). Usa maxSpeed/outfieldAccel reais.
 */
import { createMatch, step, stepCelebration } from '../src/sim/engine'
import { MATCH } from '../src/sim/constants'
import { rosterFor, type SeedPlayer } from '../src/sim/teams'
import { maxSpeed, outfieldAccel } from '../src/sim/ratings'
import type { Attrs } from '../src/sim/types'
import { A, ATTR_KEYS, mkP, pctMC, rnd } from './_simlib'

const kmh = (ms: number) => ms * 3.6

// integra o sprint do 0: distância coberta após t s, e tempo para cobrir D m.
const dt = 0.01
const distAfter = (a: Attrs, t: number) => {
  const acc = outfieldAccel(a), vmax = maxSpeed(mkP(a))
  let v = 0, x = 0
  for (let s = 0; s < t; s += dt) { v = Math.min(vmax, v + acc * dt); x += v * dt }
  return x
}
const timeFor = (a: Attrs, D: number) => {
  const acc = outfieldAccel(a), vmax = maxSpeed(mkP(a))
  let v = 0, x = 0, t = 0
  while (x < D && t < 12) { v = Math.min(vmax, v + acc * dt); x += v * dt; t += dt }
  return t
}

// arquétipos (pace, acceleration)
const ARCH: [string, number, number][] = [
  ['Zagueirão lento', 35, 40],
  ['Mediano', 55, 55],
  ['Lateral rápido', 78, 75],
  ['Ponta veloz', 92, 90],
  ['Foguete (elite)', 99, 96],
]

console.log('================================================================')
console.log(' VELOCIDADE DOS JOGADORES — quão mais rápido é um do outro')
console.log('================================================================')

console.log('\n### Velocidade de TOPO e tempos de sprint')
console.log('   arquétipo          topo(km/h)   10m     20m     30m     40m')
for (const [name, p, a] of ARCH) {
  const at = A({ pace: p, acceleration: a })
  const top = kmh(maxSpeed(mkP(at)))
  const t = [10, 20, 30, 40].map((D) => timeFor(at, D).toFixed(2) + 's')
  console.log(`   ${name.padEnd(18)} ${top.toFixed(1).padStart(6)}     ${t.map((x) => x.padStart(6)).join('  ')}`)
}
console.log('   (real: elite ~34-36 km/h e ~4.0-4.3s nos 30m · zagueiro lento ~30 km/h)')

console.log('\n### GAP no duelo: distância entre eles quando o + rápido faz 30m')
const base = A({ pace: 55, acceleration: 55 })
for (const [name, p, a] of ARCH) {
  if (p === 55) continue
  const fast = A({ pace: p, acceleration: a })
  const tFast = timeFor(fast, 30)
  const gap = 30 - distAfter(base, tFast)
  console.log(`   ${name.padEnd(18)} chega aos 30m ${gap >= 0 ? gap.toFixed(1) + 'm à frente do mediano' : 'atrás do mediano'}`)
}

console.log('\n### % que CHEGA PRIMEIRO numa bola 50/50 (ambos a 14m, c/ reação)')
const race = (mine: Attrs, foe: Attrs, D = 14) =>
  pctMC(200_000, () => timeFor(mine, D) + (rnd() - 0.5) * 0.25 < timeFor(foe, D) + (rnd() - 0.5) * 0.25)
const med = A({ pace: 55, acceleration: 55 })
const lento = A({ pace: 35, acceleration: 40 })
const ponta = A({ pace: 92, acceleration: 90 })
console.log(`   Ponta veloz   vs Mediano:        ${race(ponta, med).toFixed(0)}%`)
console.log(`   Ponta veloz   vs Zagueirão lento:${race(ponta, lento).toFixed(0)}%`)
console.log(`   Mediano       vs Zagueirão lento:${race(med, lento).toFixed(0)}%`)
console.log(`   Mediano       vs Mediano (50/50):${race(med, med).toFixed(0)}%`)

console.log('\n✅ Esperado: a ponta veloz quase sempre ganha a corrida; o gap em 30m é nítido (vários metros).')

// ---- a velocidade vira VANTAGEM numa PARTIDA real? ----
MATCH.clockRate = 1
const teamPace = (pc: number): SeedPlayer[] => {
  const attrs = Object.fromEntries(ATTR_KEYS.map((k) => [k, 55])) as unknown as Attrs
  return rosterFor('home').map((s) => ({ ...s, attrs: { ...attrs, pace: pc, acceleration: pc } }))
}
const N = 6
let shF = 0, shS = 0, gF = 0, gS = 0, winF = 0, posF = 0, posT = 0
for (let i = 0; i < N; i++) {
  const s = createMatch({ home: teamPace(88), away: teamPace(35) }) // casa RÁPIDA × fora LENTA
  let guard = 0
  while (s.status !== 'over' && guard++ < 300_000) { if (s.celebration) stepCelebration(s, 1 / 30); else step(s, 1 / 30) }
  shF += s.stats.home.shots; shS += s.stats.away.shots
  gF += s.score.home; gS += s.score.away
  if (s.score.home > s.score.away) winF++
  posF += s.stats.home.possessionTicks; posT += s.stats.home.possessionTicks + s.stats.away.possessionTicks
}
console.log('\n### A velocidade vira VANTAGEM na partida? (rápido 88 × lento 35, resto 55)')
console.log(`   Gols:      rápido ${(gF / N).toFixed(1)} × ${(gS / N).toFixed(1)} lento`)
console.log(`   Chutes:    rápido ${(shF / N).toFixed(0)} × ${(shS / N).toFixed(0)} lento`)
console.log(`   Posse rápido: ${((posF / posT) * 100).toFixed(0)}%   ·   Vitórias do rápido: ${((winF / N) * 100).toFixed(0)}%`)
console.log('   ➤ ' + (gF > gS * 1.3 ? '✅ o time rápido domina (velocidade vale numa partida)' : '⚠️ velocidade rende pouco em jogo'))
