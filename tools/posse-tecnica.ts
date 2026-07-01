/**
 * O QUE CONTROLA A POSSE? Time TÉCNICO (passe/técnica/visão/composure/firstTouch
 * altos) vs time TOSCO, resto igual. Mede posse % e acerto de passe. Esperado:
 * o time técnico domina a bola (real: times técnicos têm 60%+ de posse).
 */
import { createMatch, step, stepCelebration } from '../src/sim/engine'
import { MATCH } from '../src/sim/constants'
import { rosterFor, type SeedPlayer } from '../src/sim/teams'
import type { Attrs, TeamId } from '../src/sim/types'
import { ATTR_KEYS } from './_simlib'

MATCH.clockRate = 2
const N = 12
const TECH = ['passing', 'technique', 'vision', 'composure', 'firstTouch', 'decisions', 'dribbling']

const team = (techLvl: number): SeedPlayer[] => {
  const a = Object.fromEntries(ATTR_KEYS.map((k) => [k, 55])) as unknown as Attrs
  for (const k of TECH) (a as Record<string, number>)[k] = techLvl
  return rosterFor('home').map((s) => ({ ...s, attrs: { ...a } }))
}

let posH = 0, posT = 0
const pass: Record<TeamId, { ok: number; bad: number }> = { home: { ok: 0, bad: 0 }, away: { ok: 0, bad: 0 } }

for (let i = 0; i < N; i++) {
  const s = createMatch({ home: team(85), away: team(40) }) // casa TÉCNICA × fora TOSCA
  let prevPasser = s.lastPasserId, pending: TeamId | null = null, guard = 0
  while (s.status !== 'over' && guard++ < 600_000) {
    if (s.celebration) stepCelebration(s, 1 / 30)
    else step(s, 1 / 30)
    if (s.lastPasserId !== prevPasser && s.lastPasserId !== null) {
      const p = s.players.find((q) => q.id === s.lastPasserId); if (p) pending = p.team; prevPasser = s.lastPasserId
    }
    if (pending !== null && s.controllerId !== null) {
      const r = s.players.find((q) => q.id === s.controllerId)
      if (r) { if (r.team === pending) pass[pending].ok++; else pass[pending].bad++; pending = null }
    }
  }
  posH += s.stats.home.possessionTicks; posT += s.stats.home.possessionTicks + s.stats.away.possessionTicks
}

const acc = (t: TeamId) => { const v = pass[t]; return v.ok + v.bad ? ((v.ok / (v.ok + v.bad)) * 100).toFixed(0) + '%' : '—' }
console.log('================================================================')
console.log(` POSSE × TÉCNICA — técnico(85) × tosco(40), resto 55 · ${N} jogos`)
console.log('================================================================')
console.log(`\n  Posse do time TÉCNICO:   ${((posH / posT) * 100).toFixed(0)}%   (real: técnico domina, ~60%+)`)
console.log(`  Acerto de passe TÉCNICO: ${acc('home')}`)
console.log(`  Acerto de passe TOSCO:   ${acc('away')}`)
console.log(`\n  ➤ se a posse do técnico ~50% → técnica NÃO controla a bola (passe/visão pesam pouco no domínio).`)
