/**
 * DIAGNÓSTICO do bug de bookkeeping das estatísticas. Roda partidas reais e
 * quantifica os contadores: shots vs shotsOnTarget vs goals, e DE ONDE vêm os
 * gols (passaram por um chute registrado? ou driblaram o contador?).
 * Esperado num motor consistente: shotsOnTarget <= shots e goals <= shotsOnTarget.
 */
import { createMatch, step, stepCelebration } from '../src/sim/engine'
import { MATCH } from '../src/sim/constants'
import { rosterFor, type SeedPlayer } from '../src/sim/teams'
import type { Attrs } from '../src/sim/types'
import { ATTR_KEYS } from './_simlib'

MATCH.clockRate = 1

const team = (lvl: number): SeedPlayer[] => {
  const attrs = Object.fromEntries(ATTR_KEYS.map((k) => [k, lvl])) as unknown as Attrs
  return rosterFor('home').map((s) => ({ ...s, attrs }))
}

const run = (label: string, hl: number, al: number, N: number) => {
  let shots = 0, sot = 0, goals = 0, saves = 0
  let goalFromShot = 0, goalNoShooter = 0, goalStaleOrOwn = 0
  for (let i = 0; i < N; i++) {
    const s = createMatch({ home: team(hl), away: team(al) })
    const dt = 1 / 30
    let prevH = 0, prevA = 0, guard = 0
    while (s.status !== 'over' && guard++ < 300_000) {
      if (s.celebration) stepCelebration(s, dt)
      else step(s, dt)
      if (s.score.home > prevH || s.score.away > prevA) {
        const scorer: 'home' | 'away' = s.score.home > prevH ? 'home' : 'away'
        const sh = s.lastShooterId
        if (sh === null) goalNoShooter++
        else {
          const p = s.players.find((q) => q.id === sh)
          if (p && p.team === scorer) goalFromShot++
          else goalStaleOrOwn++
        }
        prevH = s.score.home; prevA = s.score.away
      }
    }
    shots += s.stats.home.shots + s.stats.away.shots
    sot += s.stats.home.shotsOnTarget + s.stats.away.shotsOnTarget
    goals += s.score.home + s.score.away
    saves += s.stats.home.saves + s.stats.away.saves
  }
  const r = (a: number, b: number) => (b ? (a / b).toFixed(2) : '—')
  console.log(`\n### ${label}  (${N} partidas)`)
  console.log(`  shots/jogo=${(shots / N).toFixed(0)}  shotsOnTarget/jogo=${(sot / N).toFixed(0)}  goals/jogo=${(goals / N).toFixed(0)}  saves/jogo=${(saves / N).toFixed(0)}`)
  console.log(`  RATIO shotsOnTarget/shots = ${r(sot, shots)}  ${sot > shots ? '❌ >1 (rebote conta como chute no alvo)' : 'ok'}`)
  console.log(`  RATIO goals/shotsOnTarget = ${r(goals, sot)}  ${goals > sot ? '❌ >1 (gol sem o GK enfrentar o chute)' : 'ok'}`)
  console.log(`  RATIO goals/shots         = ${r(goals, shots)}  (conversão aparente)`)
  console.log(`  Origem dos gols: via chute (autor=marcador) ${((goalFromShot / goals) * 100).toFixed(0)}% · sem chute registrado ${((goalNoShooter / goals) * 100).toFixed(0)}% · id velho/contra ${((goalStaleOrOwn / goals) * 100).toFixed(0)}%`)
}

console.log('================================================================')
console.log(' DIAGNÓSTICO — consistência dos contadores de estatística')
console.log('================================================================')

run('Equilíbrio 55 × 55', 55, 55, 6)
run('Forte × Fraco 70 × 40', 70, 40, 6)

console.log('\n✅ Num motor consistente os dois RATIOS deveriam ser <= 1.00.')
