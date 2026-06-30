/**
 * INTEGRAÇÃO — CURVA DE 90 MIN (cansaço). Time com POUCA stamina deve ceder mais
 * no fim. Roda partidas reais (clockRate=1) e distribui os gols por TERÇO do jogo
 * (0-30 / 30-60 / 60-90). Espera-se que o time exausto leve mais gols no 3º terço.
 */
import { createMatch, step, stepCelebration } from '../src/sim/engine'
import { MATCH } from '../src/sim/constants'
import { rosterFor, type SeedPlayer } from '../src/sim/teams'
import type { Attrs } from '../src/sim/types'
import { ATTR_KEYS } from './_simlib'

MATCH.clockRate = 1

const team = (base: number, stamina: number): SeedPlayer[] => {
  const attrs = Object.fromEntries(ATTR_KEYS.map((k) => [k, base])) as unknown as Attrs
  return rosterFor('home').map((s) => ({ ...s, attrs: { ...attrs, stamina, naturalFitness: stamina } }))
}

const N = 8
// fatigado (stamina 30) em CASA × resistente (stamina 85) FORA; resto igual (60).
const periodGoals = { home: [0, 0, 0], away: [0, 0, 0] }
let energyEndHome = 0, energyEndAway = 0

for (let i = 0; i < N; i++) {
  const s = createMatch({ home: team(60, 30), away: team(60, 85) })
  const dt = 1 / 30
  let prevH = 0, prevA = 0, guard = 0
  while (s.status !== 'over' && guard++ < 300_000) {
    if (s.celebration) stepCelebration(s, dt)
    else step(s, dt)
    const period = s.time < 1800 ? 0 : s.time < 3600 ? 1 : 2
    if (s.score.home > prevH) { periodGoals.home[period]++; prevH = s.score.home }
    if (s.score.away > prevA) { periodGoals.away[period]++; prevA = s.score.away }
  }
  // energia média do time de linha ao fim
  const e = (t: 'home' | 'away') => {
    const ps = s.players.filter((p) => p.team === t && p.role !== 'GK')
    return ps.reduce((a, p) => a + p.energy, 0) / ps.length
  }
  energyEndHome += e('home'); energyEndAway += e('away')
}

const pct = (x: number, tot: number) => tot ? ((x / tot) * 100).toFixed(0) + '%' : '—'
const sumH = periodGoals.home.reduce((a, b) => a + b, 0)
const sumA = periodGoals.away.reduce((a, b) => a + b, 0)

console.log('================================================================')
console.log(' CURVA DE 90 MIN — fatigado (stamina 30) CASA × resistente (85) FORA')
console.log(`   ${N} partidas reais · resto dos atributos = 60`)
console.log('================================================================')
console.log('\n   GOLS SOFRIDOS por terço (quem leva mais no fim cansou):')
console.log('   terço:            0-30min   30-60min   60-90min')
console.log(`   leva o FATIGADO:  ${['', '', ''].map((_, p) => pct(periodGoals.away[p], sumA).padStart(8)).join('  ')}   (gols do time resistente, ${sumA} total)`)
console.log(`   leva o RESISTENTE:${['', '', ''].map((_, p) => pct(periodGoals.home[p], sumH).padStart(8)).join('  ')}   (gols do time fatigado, ${sumH} total)`)
console.log(`\n   Energia média no fim:  fatigado ${(energyEndHome / N).toFixed(2)}  ·  resistente ${(energyEndAway / N).toFixed(2)}`)
const lateAway = periodGoals.away[2] / sumA, earlyAway = periodGoals.away[0] / sumA
console.log(`\n   ➤ Time resistente marca ${pct(periodGoals.away[2], sumA)} dos seus gols no ÚLTIMO terço vs ${pct(periodGoals.away[0], sumA)} no 1º`)
console.log(`   ${lateAway > earlyAway ? '✅ o fatigado CEDE mais no fim (curva de cansaço funciona)' : '⚠️ sem aumento no fim — cansaço pode estar fraco'}`)
