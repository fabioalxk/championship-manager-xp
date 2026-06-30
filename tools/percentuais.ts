/**
 * % DE SUCESSO por atributo — TODOS os 39 expressos como "quanto % deu certo".
 * Onde o atributo é naturalmente uma probabilidade, usa a fórmula EXATA do motor
 * (src=exato). Onde é um valor cru (m/s, segundos, ratio), monta um cenário de
 * sucesso plausível e marca (src=modelo). Varia 30/50/70/90, resto em 50.
 */
import { AI, DUEL, GK, STAMINA } from '../src/sim/constants'
import {
  chaseLead, flairSpin, footing, gkDistroSpread, gkKickReach, markPull, maxSpeed,
  miscontrol, nrm, offBallAdvance, outfieldAccel, passSpread, recoverMul, shapeMul,
} from '../src/sim/ratings'
import type { Attrs } from '../src/sim/types'
import {
  A, aerialWin, aimErr, cleanControlPct, clamp, cushions, foulCard, headerOnGoal,
  mkP, passLands, pctMC, rnd, shotResult, tackleEncounter,
} from './_simlib'

const LEVELS = [30, 50, 70, 90]
const N = 60_000
const def50 = A({})

const row = (attr: string, what: string, src: string, fn: (l: number) => number) => {
  const v = LEVELS.map(fn)
  const ok = v.every((x, i) => i === 0 || x >= v[i - 1] - 0.6)
  const cells = LEVELS.map((l, i) => `${l}=${v[i].toFixed(0)}%`).join(' ').padEnd(34)
  const flag = ok ? (Math.abs(v[3] - v[0]) < 1 ? '⚠️' : '✅') : '❌'
  console.log(`  ${attr.padEnd(14)} ${cells} ${what.padEnd(24)} ${src.padEnd(7)} ${flag}`)
}
const sec = (t: string) => console.log(`\n── ${t} ${'─'.repeat(Math.max(0, 58 - t.length))}  [%@30 50 70 90]`)

// corrida: integra sprint até D; quem chega antes (com jitter de reação) vence.
const sprintTime = (a: Attrs, D: number) => {
  const accel = outfieldAccel(a), vmax = maxSpeed(mkP(a))
  let v = 0, x = 0, t = 0
  while (x < D && t < 8) { v = Math.min(vmax, v + accel * 0.02); x += v * 0.02; t += 0.02 }
  return t
}
const raceWin = (mine: Attrs, D: number) => pctMC(N, () =>
  sprintTime(mine, D) + (rnd() - 0.5) * 0.3 < sprintTime(def50, D) + (rnd() - 0.5) * 0.3)

console.log('================================================================')
console.log(' % DE SUCESSO POR ATRIBUTO — todos os 39 em porcentagem')
console.log('   30/50/70/90 (resto 50) · exato = fórmula do motor · modelo = cenário')
console.log('================================================================')

sec('FÍSICO')
row('pace', 'vence corrida 15m', 'modelo', (l) => raceWin(A({ pace: l }), 15))
row('acceleration', 'vence arranque 6m', 'modelo', (l) => raceWin(A({ acceleration: l, pace: 70 }), 6))
row('agility', 'vence o slalom', 'modelo', (l) => pctMC(N, () => {
  const k = (a: Attrs) => 1 / (0.6 + nrm(a.agility) * 0.4) // tempo de curva (turnFloorOf)
  return k(A({ agility: l })) + (rnd() - 0.5) * 0.25 < k(def50) + (rnd() - 0.5) * 0.25
}))
row('balance', 'fica em pé no bote', 'exato', (l) => 100 * (1 - DUEL.staggerChance * (1 - footing(A({ balance: l })) * 0.6)))
row('jumping', 'ganha o salto', 'exato', (l) => pctMC(N, () => aerialWin(A({ jumping: l }), def50)))
row('strength', 'mantém a bola', 'exato', (l) => pctMC(N, () => tackleEncounter(A({ dribbling: 50, strength: l }), def50) !== 'lost'))
row('stamina', 'ritmo mantido min80', 'modelo', (l) => {
  const a = A({ stamina: l }), sta = nrm(l)
  let e = 1
  for (let s = 0; s < 4800; s++) { e -= STAMINA.sprintDrain * (STAMINA.drainBase - sta * STAMINA.drainStamina) * 0.6; e = clamp(e, STAMINA.floor, 1) }
  return 100 * maxSpeed(mkP(a, 'FWD', e)) / maxSpeed(mkP(a, 'FWD', 1))
})
row('naturalFit.', 'recupera em 90s', 'modelo', (l) => {
  const a = A({ naturalFitness: l }); let e = STAMINA.floor // exausto
  for (let s = 0; s < 90; s++) { const d = 1 - (1 - e) * STAMINA.recoverFade * (1 - nrm(l)); e += STAMINA.recover * recoverMul(a) * d; e = clamp(e, STAMINA.floor, 1) }
  return ((e - STAMINA.floor) / (1 - STAMINA.floor)) * 100 // fração do gap recuperada
})
row('workRate', 'chega 1º na bola', 'modelo', (l) => pctMC(N, () => {
  const eff = (a: Attrs, d: number) => d * (1 - nrm(a.workRate) * AI.chaseWorkRate)
  return eff(A({ workRate: l }), 6) + (rnd() - 0.5) * 1.2 < eff(def50, 6) + (rnd() - 0.5) * 1.2
}))

sec('TÉCNICO')
row('dribbling', 'passa e segue', 'exato', (l) => pctMC(N, () => tackleEncounter(A({ dribbling: l, agility: 85 }), def50) === 'through'))
row('firstTouch', 'domínio limpo', 'exato', (l) => cleanControlPct(A({ firstTouch: l }), 20))
row('technique', 'passe certo (24m)', 'exato', (l) => pctMC(N, () => passLands(passSpread(A({ technique: l, passing: 50 })), 24, 1.2)))
row('passing', 'passe certo (24m)', 'exato', (l) => pctMC(N, () => passLands(passSpread(A({ passing: l })), 24, 1.2)))
row('crossing', 'cruz. na área', 'exato', (l) => pctMC(N, () => passLands(0.26 * (1 - nrm(l) * 0.5) * 2, 30, 2.5)))
row('finishing', 'gol da área', 'exato', (l) => pctMC(N, () => shotResult(A({ finishing: l }), def50, 11, false) === 'goal'))
row('longShots', 'gol de 28m', 'exato', (l) => pctMC(N, () => shotResult(A({ longShots: l }), def50, 28, false) === 'goal'))
row('heading', 'cabeçada no gol', 'exato', (l) => pctMC(N, () => headerOnGoal(A({ heading: l, jumping: 60 }), 9)))
row('tackling', 'desarma o conduto', 'exato', (l) => pctMC(N, () => tackleEncounter(A({ dribbling: 50 }), A({ tackling: l })) === 'lost'))
row('marking', 'intercepta o marcado', 'modelo', (l) => pctMC(N, () => rnd() < markPull(A({ marking: l })) * 0.7))

sec('MENTAL')
row('vision', 'acha o passe progress.', 'exato', (l) => {
  const vis = nrm(l), dec = 0.5
  const sc = (f: number, fr: number, ln: number) => f * (0.6 + vis * AI.visionForward) + fr * (0.6 + dec * AI.decisionSafe) + Math.min(ln, AI.laneSafe) * AI.laneWeight * (0.6 + vis * AI.visionLane) - f * Math.max(0, AI.laneSafe - ln) * AI.decisionRisk * dec
  return pctMC(N, () => sc(6 + rnd() * 6, 1.5 + rnd() * 2, 1.5 + rnd() * 1.2) > sc(1 + rnd() * 4, 7 + rnd() * 5, 4 + rnd()))
})
row('anticipation', 'intercepta o passe', 'modelo', (l) => pctMC(N, () => rnd() < clamp(0.12 + nrm(l) * 0.55, 0, 1)))
row('positioning', 'bote sem falta', 'exato', (l) => pctMC(N, () => foulCard(A({ positioning: l })) === 'ok'))
row('offTheBall', 'alcança o espaço', 'modelo', (l) => pctMC(N, () => offBallAdvance(A({ offTheBall: l })) > 0.7 + rnd() * 0.7))
row('decisions', 'escolhe a ação certa', 'modelo', (l) => pctMC(N, () => {
  const dec = nrm(l), noise = (1 - dec) * 0.6
  const o = [1.0, 0.72, 0.55].map((v) => v + (rnd() - 0.5) * 2 * noise)
  return o[0] >= o[1] && o[0] >= o[2]
}))
row('composure', 'passe certo SOB pressão', 'exato', (l) => pctMC(N, () => passLands(passSpread(A({ composure: l, passing: 50 }), true), 22, 2)))
row('concentration', 'domínio limpo CANSADO', 'exato', (l) => 100 * (1 - miscontrol(mkP(A({ concentration: l }), 'FWD', 0.45), 22)))
row('consistency', 'passe dentro do alvo', 'exato', (l) => pctMC(N, () => Math.abs(18 * Math.tan(aimErr(passSpread(A({ consistency: l, passing: 50 }))))) < 1.0))
row('aggression', 'falta vira cartão', 'exato', (l) => pctMC(N, () => { const r = foulCard(A({ aggression: l })); return r === 'card' || r === 'red' }))
row('bravery', 'ganha o 50/50 forte', 'exato', (l) => pctMC(N, () => cushions(A({ bravery: l }), false, 12)))
row('teamwork', 'mantém o bloco', 'modelo', (l) => pctMC(N, () => rnd() * 1.3 < shapeMul(A({ teamwork: l }))))
row('flair', 'chute com curva', 'modelo', (l) => pctMC(N, () => rnd() < (flairSpin(A({ flair: l })) - 0.4) / 0.6 * 0.8 + 0.1))

sec('GOLEIRO')
const gkSavePct = (gk: number, distMin = 8) => {
  const G = A({ goalkeeping: gk, reflexes: gk, handling: gk, oneOnOne: gk, positioning: gk })
  let on = 0, sv = 0
  for (let i = 0; i < N; i++) { const r = shotResult(A({ finishing: 50 }), G, distMin + Math.floor(rnd() * 16), false); if (r === 'off') continue; on++; if (r === 'saved') sv++ }
  return (sv / on) * 100
}
row('goalkeeping', 'defende (no alvo)', 'exato', (l) => gkSavePct(l))
row('reflexes', 'defende (no alvo)', 'exato', (l) => gkSavePct(l))
row('handling', 'defende (no alvo)', 'exato', (l) => gkSavePct(l))
row('aerialReach', 'crava o cruzamento', 'exato', (l) => clamp(GK.claimBase + nrm(l) * GK.claimSkill - 16 * GK.claimSpeedPen, GK.claimFloor, GK.claimCap) * 100)
row('oneOnOne', 'defende o 1v1', 'exato', (l) => gkSavePct(l, 6))
row('kicking', 'tiro de meta no alcance', 'modelo', (l) => pctMC(N, () => gkKickReach(A({ kicking: l })) >= 38 + rnd() * 10))
row('throwing', 'reposição certa (24m)', 'exato', (l) => pctMC(N, () => passLands(gkDistroSpread(A({ throwing: l }), false, false), 24, 0.6)))
row('communication', 'organiza (defende+)', 'exato', (l) => gkSavePct(50) + nrm(l) * GK.commandSave * 100)

console.log('\n✅ ✅=tem efeito · ⚠️=efeito mínimo · ❌=inverteu. exato=fórmula real · modelo=cenário plausível.')
