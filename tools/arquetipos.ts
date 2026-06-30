/**
 * ARQUÉTIPOS — os jogadores reais (agora plurais) se comportam DIFERENTE? Pega
 * craques de perfis opostos e roda nos duelos do motor: drible, físico, corrida,
 * jogo aéreo e finalização. Prova que força num atributo vira % alto NAQUELE duelo
 * e fraqueza vira % baixo. (fórmulas reais de _simlib)
 */
import { maxSpeed, nrm, outfieldAccel } from '../src/sim/ratings'
import { rosterFor } from '../src/sim/teams'
import type { Attrs } from '../src/sim/types'
import { A, aerialWin, clamp, mkP, pctMC, rnd, shotResult, tackleEncounter } from './_simlib'

const N = 80_000
const todos = [...rosterFor('home'), ...rosterFor('away')]
const at = (name: string): Attrs => {
  const p = todos.find((q) => q.name === name)
  if (!p) throw new Error('não achei ' + name)
  return p.attrs
}

// referências médias para os confrontos
const zagMedio = A({ tackling: 68, positioning: 68, anticipation: 68, marking: 68, strength: 68, bravery: 55 })
const medioAir = A({ jumping: 62, heading: 62 })
const medioRun = A({ pace: 63, acceleration: 63 })
const gkMedio = A({ goalkeeping: 70, reflexes: 70, oneOnOne: 70, positioning: 70 })

const sprintT = (a: Attrs, D: number) => {
  const acc = outfieldAccel(a), vmax = maxSpeed(mkP(a))
  let v = 0, x = 0, t = 0
  while (x < D && t < 10) { v = Math.min(vmax, v + acc * 0.02); x += v * 0.02; t += 0.02 }
  return t
}
const raceWin = (a: Attrs) => pctMC(N, () => sprintT(a, 14) + (rnd() - 0.5) * 0.25 < sprintT(medioRun, 14) + (rnd() - 0.5) * 0.25)

// métricas (todas em %)
const drible = (a: Attrs) => pctMC(N, () => tackleEncounter(a, zagMedio) === 'through')
// ombro-a-ombro (modelo): força + equilíbrio vs um adversário médio (força 65)
const ombro = (a: Attrs) => {
  const me = nrm(a.strength) * 0.7 + nrm(a.balance) * 0.3
  const foe = nrm(65) * 0.7 + nrm(60) * 0.3
  return pctMC(N, () => rnd() < clamp(0.5 + (me - foe) * 1.4, 0.04, 0.96))
}
const aereo = (a: Attrs) => pctMC(N, () => aerialWin(a, medioAir))
const gol = (a: Attrs) => pctMC(N, () => shotResult(a, gkMedio, 11, false) === 'goal')

const FEAT = ['Vini Jr.', 'Messi', 'Di María', 'Endrick', 'Raphinha', 'Bruno G.', 'Casemiro', 'Gabriel M.', 'Otamendi']

console.log('================================================================')
console.log(' ARQUÉTIPOS — cada craque nos duelos do motor (tudo em %)')
console.log(`   referências: zagueiro/atacante/goleiro médios · N=${N}`)
console.log('================================================================')
console.log('\n   jogador        drible  ombro  corrida  aéreo   gol(área)')
for (const name of FEAT) {
  const a = at(name)
  const r = [drible(a), ombro(a), raceWin(a), aereo(a), gol(a)]
  console.log(`   ${name.padEnd(13)} ${r.map((v) => (v.toFixed(0) + '%').padStart(6)).join('  ')}`)
}
console.log('\n   ➤ leitura: cada um deve BRILHAR na sua força e AFUNDAR na fraqueza —')
console.log('     Vini/Messi driblam muito; Messi/Otamendi perdem corrida; Gabriel/Otamendi mandam no alto;')
console.log('     Casemiro/Otamendi quase não driblam; Endrick/Messi finalizam; o veterano lento não corre.')
