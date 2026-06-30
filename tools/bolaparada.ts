/**
 * INTEGRAÇÃO — BOLA PARADA (cruzamento/escanteio). Pipeline real do motor: o GK
 * pode CRAVAR a bola (aerialReach); senão, atacante × defensor disputam o alto
 * (aerialDuelEdge); quem ganha cabeceia (HEAD); o GK ainda pode defender.
 * Mede % de cruzamento que vira CABEÇADA PERIGOSA e % que vira GOL.
 */
import { GK, HEAD } from '../src/sim/constants'
import { aerialPower, nrm } from '../src/sim/ratings'
import type { Attrs } from '../src/sim/types'
import { A, aerialWin, clamp, gkSaveProb, headerOnGoal, pctMC, rnd } from './_simlib'

const N = 80_000
const CROSS_SPEED = 16

type Out = 'claimed' | 'cleared' | 'offtarget' | 'saved' | 'goal'
const cross = (atkLvl: number, defLvl: number): Out => {
  const att: Attrs = A({ jumping: atkLvl, heading: atkLvl })
  const def: Attrs = A({ jumping: defLvl, heading: defLvl })
  const G: Attrs = A({ aerialReach: defLvl, goalkeeping: defLvl, reflexes: defLvl, oneOnOne: defLvl, positioning: defLvl })
  // 1) GK crava o cruzamento?
  const claim = clamp(GK.claimBase + nrm(defLvl) * GK.claimSkill - CROSS_SPEED * GK.claimSpeedPen, GK.claimFloor, GK.claimCap)
  if (rnd() < claim) return 'claimed'
  // 2) duelo aéreo atacante × defensor
  if (!aerialWin(att, def)) return 'cleared'
  // 3) cabeçada enquadrada?
  if (!headerOnGoal(att, 8)) return 'offtarget'
  // 4) defesa do GK na cabeçada (mais fraca/perto que um chute)
  const headSpeed = HEAD.speedBase + aerialPower(att) * HEAD.speedSkill
  if (rnd() < gkSaveProb(G, headSpeed, 8, rnd() * 0.8)) return 'saved'
  return 'goal'
}

const pctOf = (atk: number, def: number, want: (o: Out) => boolean) =>
  pctMC(N, () => want(cross(atk, def)))

const LV = [30, 50, 70, 90]
const cell = (v: number) => v.toFixed(0).padStart(5) + '%'

console.log('================================================================')
console.log(' BOLA PARADA — cruzamento: ataque aéreo × defesa aérea (+GK)')
console.log(`   N=${N} · fórmulas reais (claim, duelo aéreo, cabeçada, defesa)`)
console.log('================================================================')

const matrix = (title: string, want: (o: Out) => boolean) => {
  console.log(`\n### ${title}`)
  console.log('   ataque ↓  defesa →')
  console.log('        ' + LV.map((c) => String(c).padStart(6)).join(''))
  for (const r of LV) console.log(`   ${String(r).padStart(4)}  ` + LV.map((c) => cell(pctOf(r, c, want))).join(' '))
}

matrix('1. % do cruzamento que vira CABEÇADA PERIGOSA (no gol)', (o) => o === 'goal' || o === 'saved')
matrix('2. % do cruzamento que vira GOL', (o) => o === 'goal')

// distribuição-base num confronto equilibrado 50×50
const dist: Record<Out, number> = { claimed: 0, cleared: 0, offtarget: 0, saved: 0, goal: 0 }
for (let i = 0; i < N; i++) dist[cross(50, 50)]++
console.log('\n### Onde MORRE o cruzamento (equilíbrio 50×50):')
for (const k of ['claimed', 'cleared', 'offtarget', 'saved', 'goal'] as Out[])
  console.log(`   ${k.padEnd(10)} ${((dist[k] / N) * 100).toFixed(1)}%`)
console.log('\n   (real: ~3% dos escanteios viram gol; cruzamento perigoso é minoria)')
