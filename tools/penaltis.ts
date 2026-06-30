/**
 * PÊNALTIS — conversão (benchmark real ~75-78%). Detecta o pênalti marcado
 * (s.penalty vira true), o momento da batida (s.penalty volta a false) e observa
 * se sai gol na janela seguinte = convertido; senão = perdido/defendido.
 */
import { createMatch, step, stepCelebration } from '../src/sim/engine'
import { GK, GOAL, MATCH } from '../src/sim/constants'
import { gkSaveBase, nrm, shotSpeed, shotSpread } from '../src/sim/ratings'
import type { Attrs } from '../src/sim/types'
import { A, aimErr, clamp, pctMC, rnd } from './_simlib'

MATCH.clockRate = 2
const N = 30

let penalties = 0, scored = 0
for (let i = 0; i < N; i++) {
  const s = createMatch()
  let phase: 'none' | 'awarded' | 'taken' = 'none'
  let goalsBefore = 0, watch = 0, guard = 0
  while (s.status !== 'over' && guard++ < 600_000) {
    if (s.celebration) stepCelebration(s, 1 / 30)
    else step(s, 1 / 30)
    const goals = s.score.home + s.score.away
    if (s.penalty && phase === 'none') { phase = 'awarded'; penalties++ }
    else if (phase === 'awarded' && !s.penalty) { phase = 'taken'; goalsBefore = goals; watch = 0 }
    else if (phase === 'taken') {
      watch++
      if (goals > goalsBefore) { scored++; phase = 'none' }
      else if (watch > 90) phase = 'none' // ~3s sem gol = perdeu/defendeu
    }
  }
}

console.log('================================================================')
console.log(` PÊNALTIS — ${N} jogos reais`)
console.log('================================================================')
console.log(`\n  Pênaltis marcados: ${penalties}  (${(penalties / N).toFixed(1)}/jogo)`)
console.log(`  Convertidos:       ${scored}  →  ${penalties ? ((scored / penalties) * 100).toFixed(0) : '—'}%   (real ~75-78%)`)
console.log('  (amostra de jogo é pequena — pênalti é raro; ver a cobrança ISOLADA abaixo)')

// ---- cobrança ISOLADA (fiel): chute da marca (~11m) no canto, GK centrado ----
const penalty = (sh: Attrs, gk: Attrs) => pctMC(200_000, () => {
  const spr = shotSpread(sh, 0, false, 0.4)
  const aimOff = (GOAL.width / 2) * 0.85 // mira o canto
  const lateral = aimOff + 11 * Math.tan(aimErr(spr))
  if (Math.abs(lateral) > GOAL.width / 2) return false // jogou fora
  const speed = shotSpeed(sh)
  const corner = Math.abs(lateral) / (GOAL.width / 2)
  const align = clamp(1 - Math.abs(lateral) / GK.alignBand, 0, 1) // GK no centro, bola no canto
  let p = GK.saveBase + gkSaveBase(gk) * GK.saveSkill
  p -= Math.max(0, speed - GK.saveSpeedFree) * GK.saveSpeedPen
  p -= corner * GK.saveAnglePen
  p += align * GK.savePosBonus
  const near = clamp((GK.closeShot - 11) / GK.closeShot, 0, 1)
  p -= near * GK.saveClosePen
  p += near * nrm(gk.oneOnOne) * GK.oneOnOneBonus
  return rnd() >= clamp(p, GK.saveFloor, GK.saveCap) // gol se NÃO defendeu
})

const craque = A({ finishing: 90, composure: 95, technique: 88, strength: 70, longShots: 85 })
const medio = A({ finishing: 60, composure: 60, technique: 60, strength: 60 })
console.log('\n  COBRANÇA ISOLADA — % de conversão (real ~75-78%):')
console.log(`   craque (fin90/comp95) vs GK 50: ${penalty(craque, A({ goalkeeping: 50, reflexes: 50, oneOnOne: 50 })).toFixed(0)}%`)
console.log(`   craque               vs GK 80: ${penalty(craque, A({ goalkeeping: 80, reflexes: 80, oneOnOne: 80 })).toFixed(0)}%`)
console.log(`   médio  (fin60/comp60) vs GK 50: ${penalty(medio, A({ goalkeeping: 50, reflexes: 50, oneOnOne: 50 })).toFixed(0)}%`)
console.log('\n  ➤ muito abaixo de ~75% = o motor trata pênalti como chute normal (GK reage); falta a vantagem do batedor.')
