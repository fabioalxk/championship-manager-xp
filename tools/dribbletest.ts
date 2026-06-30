/**
 * Monte Carlo do duelo 1v1 (take-on) — mede quantas vezes um atacante elite
 * passa pelo marcador, MANTÉM a bola e segue pra frente. Importa as constantes e
 * ratings REAIS do motor e reproduz a resolução do tryTackle verbatim.
 */
import { DUEL } from '../src/sim/constants'
import { nrm, footing, tacklePower, carryPower } from '../src/sim/ratings'
import type { Attrs } from '../src/sim/types'

void footing // (mantém o import alinhado ao motor; não usado direto aqui)

const ATTR_KEYS = [
  'pace','acceleration','stamina','strength','agility','balance','jumping','naturalFitness',
  'tackling','marking','heading','firstTouch','passing','technique','dribbling','crossing','finishing','longShots','workRate',
  'vision','anticipation','positioning','offTheBall','decisions','composure','concentration','consistency','aggression','bravery','teamwork','flair',
  'goalkeeping','reflexes','handling','aerialReach','oneOnOne','kicking','throwing','communication',
]

const A = (o: Partial<Attrs>): Attrs => ({
  ...(Object.fromEntries(ATTR_KEYS.map((k) => [k, 50])) as unknown as Attrs),
  ...o,
})

const rnd = () => Math.random()
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

// BEFORE: constantes antigas + beat NÃO criava separação (só dobrava cooldown)
const OLD = { beatBase: 0.16, beatSwing: 0.7, beatCap: 0.62 }
type Mode = 'after' | 'before'

/** Uma TENTATIVA de desarme — reproduz tryTackle. */
const attempt = (att: Attrs, def: Attrs, mode: Mode): 'beat' | 'lost' | 'foul' | 'held' => {
  const beat = nrm(att.dribbling) * 0.6 + nrm(att.agility) * 0.4
  const read = nrm(def.anticipation) * 0.5 + nrm(def.positioning) * 0.5
  const c = mode === 'after' ? DUEL : OLD
  const beatProb = clamp(c.beatBase + (beat - read) * c.beatSwing, 0, c.beatCap)
  if (rnd() < beatProb) return 'beat'

  const defR = tacklePower(def)
  const attR = carryPower(att)
  const commit = 1 + nrm(def.bravery) * DUEL.braveryCommit
  const winProb = clamp(DUEL.baseWin + (defR - attR) * DUEL.duelSwing * commit, 0.12, 0.92)
  if (rnd() < winProb) return 'lost'

  const reachOut = rnd()
  const cleanCut = nrm(def.positioning) * 0.5 + nrm(def.anticipation) * 0.5
  const foulProb =
    DUEL.foulBase + nrm(def.aggression) * DUEL.foulAggr +
    reachOut * (DUEL.foulOverreach + nrm(def.bravery) * DUEL.foulBravery) * (1 - cleanCut * DUEL.foulClean)
  if (rnd() < foulProb) return 'foul'
  return 'held'
}

/** Encontro 1v1 sustentado: o marcador insiste até resolver. AFTER: um beat
 *  ENCERRA (explode com separação). BEFORE: beat só continua o loop (colado). */
const encounter = (att: Attrs, def: Attrs, mode: Mode) => {
  const MAX = 12
  for (let i = 0; i < MAX; i++) {
    const r = attempt(att, def, mode)
    if (r === 'lost') return 'dispossessed'
    if (r === 'foul') return 'foul'
    if (r === 'beat' && mode === 'after') return 'through'
    // held / (before)beat → tenta de novo
  }
  return mode === 'after' ? 'through' : 'stuck'
}

const N = 200_000
const pct = (x: number) => ((x / N) * 100).toFixed(1) + '%'

const run = (label: string, att: Attrs, def: Attrs, mode: Mode) => {
  const single = { beat: 0, lost: 0, foul: 0, held: 0 }
  for (let i = 0; i < N; i++) single[attempt(att, def, mode)]++
  const enc: Record<string, number> = {}
  for (let i = 0; i < N; i++) {
    const r = encounter(att, def, mode)
    enc[r] = (enc[r] ?? 0) + 1
  }
  console.log(`\n### ${label} [${mode}]`)
  console.log(`  1 tentativa:  passou=${pct(single.beat)}  perdeu=${pct(single.lost)}  segurou(falta)=${pct(single.foul)}  travado=${pct(single.held)}`)
  const through = enc.through ?? 0
  const keeps = through + (enc.foul ?? 0) + (enc.stuck ?? 0)
  console.log(`  ENCONTRO 1v1: PASSOU E SEGUIU=${pct(through)} | perdeu a bola=${pct(enc.dispossessed ?? 0)} | manteve posse total=${pct(keeps)}`)
}

console.log('====================================================================')
console.log(' ATACANTE drible=100  vs  DEFENSOR defesa=50   (N=200k por cenário)')
console.log('====================================================================')

const def50 = A({})
const attPure = A({ dribbling: 100, agility: 100, strength: 70, balance: 85 })
const attReal = A({ dribbling: 100, agility: 85, strength: 70, balance: 80 })

run('Pura: drible100/agil100', attPure, def50, 'before')
run('Pura: drible100/agil100', attPure, def50, 'after')
run('Realista: drible100/agil85', attReal, def50, 'before')
run('Realista: drible100/agil85', attReal, def50, 'after')
run('Mediano 50 vs 50 (referência)', A({}), def50, 'after')
