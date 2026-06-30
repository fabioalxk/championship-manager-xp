/**
 * Simulações ISOLADAS por atributo (ver atributoTestChecklist.md): varia UM
 * atributo (30/50/70/90), resto em 50, e mede uma métrica do motor. Os duelos
 * vivem em _simlib.ts (fonte única). Confrontos 2-lados ficam em confrontos.ts.
 */
import { DUEL, STAMINA } from '../src/sim/constants'
import {
  chaseLead, crossSpread, flairSpin, footing, gkHoldChance, gkKickReach, gkReach,
  gkThrowSpeed, holdMax, markPull, maxSpeed, miscontrol, nrm, offBallAdvance,
  outfieldAccel, passSpread, recoverMul, shapeMul, shotSpeed, tackleRange, turnFloorOf,
} from '../src/sim/ratings'
import type { Attrs, Player } from '../src/sim/types'
import {
  A, aerialWin, aimErr, cleanControlPct, clamp, cushions, foulCard, headerOnGoal,
  mkP, passLands, pctMC, rnd, shotResult, tackleEncounter,
} from './_simlib'

const LEVELS = [30, 50, 70, 90]
const N = 60_000

const sweep = (
  attr: string, unit: string, metric: (lvl: number) => number,
  { higherBetter = true, fmt = (v: number) => v.toFixed(1) } = {},
) => {
  const vals = LEVELS.map(metric)
  const ok = vals.every((v, i) => i === 0 || (higherBetter ? v >= vals[i - 1] - 1e-9 : v <= vals[i - 1] + 1e-9))
  const cells = LEVELS.map((l, i) => `${l}=${fmt(vals[i])}`).join('  ')
  const span = Math.abs(vals[vals.length - 1] - vals[0])
  const flag = !ok ? '❌ não-monotônico' : span < 1e-6 ? '⚠️ sem efeito' : '✅'
  console.log(`  ${attr.padEnd(15)} ${cells.padEnd(46)} ${unit.padEnd(10)} ${flag}`)
}
const sec = (t: string) => console.log(`\n── ${t} ${'─'.repeat(Math.max(0, 60 - t.length))}`)

/** integra um sprint do 0 até cobrir distM; retorna o tempo (s). */
const sprintTime = (p: Player, distM: number) => {
  const accel = outfieldAccel(p.attrs), vmax = maxSpeed(p)
  let v = 0, x = 0, t = 0
  const dt = 0.02
  while (x < distM && t < 10) { v = Math.min(vmax, v + accel * dt); x += v * dt; t += dt }
  return t
}
/** minutos de JOGO sprintando até a energia bater no piso (exaustão). */
const minsToExhaust = (a: Attrs) => {
  const sta = nrm(a.stamina), fit = nrm(a.naturalFitness)
  let e = 1, t = 0
  while (e > STAMINA.floor + 0.001 && t < 6000) {
    e -= STAMINA.sprintDrain * (STAMINA.drainBase - sta * STAMINA.drainStamina)
    const depletion = 1 - (1 - e) * STAMINA.recoverFade * (1 - fit)
    e += 0.15 * STAMINA.recover * recoverMul(a) * depletion
    e = clamp(e, STAMINA.floor, 1)
    t++
  }
  return t / 60
}

console.log('================================================================')
console.log(' SIMULAÇÃO POR ATRIBUTO — variando 30/50/70/90 (resto em 50)')
console.log(`   N=${N} por ponto · funções e fórmulas REAIS do motor`)
console.log('================================================================')

const def50 = A({})

sec('FÍSICO')
sweep('pace', 'm/s topo', (l) => maxSpeed(mkP(A({ pace: l }))))
sweep('acceleration', 's p/ 10m', (l) => sprintTime(mkP(A({ acceleration: l, pace: 80 })), 10), { higherBetter: false, fmt: (v) => v.toFixed(2) })
sweep('agility', 'ret.curva', (l) => turnFloorOf(A({ agility: l })), { fmt: (v) => v.toFixed(2) })
sweep('balance', '% fica em pé', (l) => 100 * (1 - DUEL.staggerChance * (1 - footing(A({ balance: l })) * 0.6)))
sweep('jumping', '% gana aérea', (l) => pctMC(N, () => aerialWin(A({ jumping: l }), def50)))
sweep('strength', 'm/s chute', (l) => shotSpeed(A({ strength: l })))
sweep('strength', '% mantém bola', (l) => pctMC(N, () => tackleEncounter(A({ dribbling: 50, strength: l }), def50) !== 'lost'))
sweep('stamina', 'min até exaust', (l) => minsToExhaust(A({ stamina: l })), { fmt: (v) => v.toFixed(1) })
sweep('naturalFit.', 'min até exaust', (l) => minsToExhaust(A({ naturalFitness: l })), { fmt: (v) => v.toFixed(1) })
sweep('workRate', 'm alcance bote', (l) => tackleRange(A({ workRate: l })), { fmt: (v) => v.toFixed(2) })

sec('TÉCNICO')
sweep('dribbling', '% passa+segue', (l) => pctMC(N, () => tackleEncounter(A({ dribbling: l, agility: 85 }), def50) === 'through'))
sweep('firstTouch', '% domínio bom', (l) => cleanControlPct(A({ firstTouch: l }), 20))
sweep('technique', '% passe certo', (l) => pctMC(N, () => passLands(passSpread(A({ technique: l, passing: 50 })), 24, 1.2)))
sweep('passing', '% passe certo', (l) => pctMC(N, () => passLands(passSpread(A({ passing: l })), 24, 1.2)))
sweep('crossing', '% cruz. na área', (l) => pctMC(N, () => passLands(crossSpread(A({ crossing: l })), 30, 2.5)))
sweep('finishing', '% gol (área)', (l) => pctMC(N, () => shotResult(A({ finishing: l }), def50, 11, false) === 'goal'))
sweep('longShots', '% gol (28m)', (l) => pctMC(N, () => shotResult(A({ longShots: l }), def50, 28, false) === 'goal'))
sweep('heading', '% cabec. no gol', (l) => pctMC(N, () => headerOnGoal(A({ heading: l, jumping: 60 }), 9)))
sweep('tackling', '% desarme', (l) => pctMC(N, () => tackleEncounter(A({ dribbling: 50 }), A({ tackling: l })) === 'lost'))
sweep('marking', 'cola 0..1', (l) => markPull(A({ marking: l })), { fmt: (v) => v.toFixed(2) })

sec('MENTAL')
sweep('anticipation', 'lead intercept', (l) => chaseLead(A({ anticipation: l })), { fmt: (v) => v.toFixed(2) })
sweep('positioning', '% bote s/falta', (l) => pctMC(N, () => foulCard(A({ positioning: l })) === 'ok'))
sweep('offTheBall', 'avanço corrida', (l) => offBallAdvance(A({ offTheBall: l })), { fmt: (v) => v.toFixed(2) })
sweep('decisions', 's segura bola', (l) => holdMax(A({ decisions: l })), { fmt: (v) => v.toFixed(2) })
sweep('composure', 'Δ% sob pressão', (l) => {
  const calm = pctMC(N, () => passLands(passSpread(A({ composure: l, passing: 50 }), false), 22, 2))
  const press = pctMC(N, () => passLands(passSpread(A({ composure: l, passing: 50 }), true), 22, 2))
  return calm - press
}, { higherBetter: false, fmt: (v) => v.toFixed(1) })
sweep('concentration', 'Δ% cansado', (l) => {
  const fresh = 100 * (1 - miscontrol(mkP(A({ concentration: l }), 'FWD', 1), 22))
  const tired = 100 * (1 - miscontrol(mkP(A({ concentration: l }), 'FWD', 0.45), 22))
  return fresh - tired
}, { higherBetter: false, fmt: (v) => v.toFixed(1) })
sweep('consistency', 'σ erro (m)', (l) => {
  const errs: number[] = []
  for (let i = 0; i < N; i++) errs.push(Math.abs(20 * Math.tan(aimErr(passSpread(A({ consistency: l, passing: 50 }))))))
  const m = errs.reduce((s, e) => s + e, 0) / errs.length
  return Math.sqrt(errs.reduce((s, e) => s + (e - m) ** 2, 0) / errs.length)
}, { higherBetter: false, fmt: (v) => v.toFixed(2) })
sweep('aggression', 'cartões/100 botes', (l) => pctMC(N, () => { const r = foulCard(A({ aggression: l })); return r === 'card' || r === 'red' }))
sweep('bravery', '% ganha 50/50', (l) => pctMC(N, () => cushions(A({ bravery: l }), false, 12)))
sweep('teamwork', 'bloco 0..1', (l) => shapeMul(A({ teamwork: l })), { fmt: (v) => v.toFixed(2) })
sweep('flair', 'efeito curva', (l) => flairSpin(A({ flair: l })), { fmt: (v) => v.toFixed(2) })
console.log('  vision         (seleção de passe — lógica de IA, não probabilística; ver checklist)')

sec('GOLEIRO')
sweep('goalkeeping', '% defende', (l) => pctMC(N, () => shotResult(A({}), A({ goalkeeping: l }), 16, false) === 'saved'))
sweep('reflexes', '% defende perto', (l) => pctMC(N, () => shotResult(A({ finishing: 70 }), A({ reflexes: l }), 10, false) === 'saved'))
sweep('reflexes', 'm alcance', (l) => gkReach(A({ reflexes: l })), { fmt: (v) => v.toFixed(2) })
sweep('handling', '% segura', (l) => pctMC(N, () => rnd() < gkHoldChance(A({ handling: l }), 22)))
sweep('aerialReach', 'altura alcance', (l) => 2.45 + nrm(l) * 0.85, { fmt: (v) => v.toFixed(2) })
sweep('oneOnOne', '% def. 1v1', (l) => pctMC(N, () => shotResult(A({ finishing: 70 }), A({ oneOnOne: l }), 8, false) === 'saved'))
sweep('kicking', 'm tiro de meta', (l) => gkKickReach(A({ kicking: l })), { fmt: (v) => v.toFixed(1) })
sweep('throwing', 'm/s reposição', (l) => gkThrowSpeed(A({ throwing: l })))
sweep('communication', '% defende', (l) => pctMC(N, () => shotResult(A({}), A({ communication: l, goalkeeping: 60 }), 16, false) === 'saved'))

console.log('\n✅ Legenda: ✅ monotônico · ❌ inverteu · ⚠️ sem efeito. Δ = quanto a métrica PIORA (menor=melhor).')
