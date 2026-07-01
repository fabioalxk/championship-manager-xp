/** DEBUG pontual: no 1º escanteio, imprime os jogadores do time que cobra:
 *  papel, posição, alvo (cornerStation) e se está na área — para achar por que a
 *  área não carrega. Também acompanha a contagem na área durante o congelamento. */
import { createMatch, step, stepCelebration } from '../src/sim/engine'
import { MATCH, FIELD, AREA } from '../src/sim/constants'
import type { MatchState, TeamId } from '../src/sim/types'

MATCH.clockRate = 2
const inBox = (x: number, y: number, gx: number) =>
  Math.abs(x - gx) <= AREA.penaltyDepth && Math.abs(y - FIELD.cy) <= AREA.penaltyHalfWidth
const gxOf = (s: MatchState, team: TeamId) => (s.attackDir[team] > 0 ? FIELD.w : 0)

const s = createMatch()
let ch = 0, ca = 0, guard = 0
let team: TeamId | null = null
let maxAtk = 0
let sinceStart = 0
while (s.status !== 'over' && guard++ < 600_000) {
  if (s.celebration) stepCelebration(s, 1 / 30)
  else step(s, 1 / 30)
  if (!team) {
    if (s.stats.home.corners > ch) team = 'home'
    else if (s.stats.away.corners > ca) team = 'away'
    ch = s.stats.home.corners; ca = s.stats.away.corners
    if (team) {
      const gx = gxOf(s, team)
      console.log(`\n=== ESCANTEIO p/ ${team}  gx=${gx}  deadball=${s.deadball.toFixed(2)} ===`)
      const mine = s.players.filter((p) => p.team === team && p.role !== 'GK')
      console.log(`  jogadores de linha do time: ${mine.length}  (papéis: ${mine.map((p) => p.role).join(',')})`)
    }
    continue
  }
  // acompanha durante e logo após o congelamento
  const gx = gxOf(s, team)
  const atk = s.players.filter((p) => p.team === team && p.role !== 'GK' && inBox(p.pos.x, p.pos.y, gx)).length
  if (atk > maxAtk) maxAtk = atk
  sinceStart++
  const live = s.deadball <= 0 && s.controllerId === null
  if (live) {
    const gxc = gxOf(s, team)
    const mine = s.players.filter((p) => p.team === team && p.role !== 'GK')
    console.log(`\n  -- momento da cobrança (t=${(sinceStart / 30).toFixed(1)}s após marcar) --`)
    for (const p of mine) {
      const d = Math.hypot(p.pos.x - gxc, p.pos.y - FIELD.cy)
      const box = inBox(p.pos.x, p.pos.y, gxc) ? 'NA ÁREA' : ''
      console.log(`   ${p.role}#${p.id}  pos=(${p.pos.x.toFixed(0)},${p.pos.y.toFixed(0)})  dGoal=${d.toFixed(0)}m  smTarget=(${p.smTarget.x.toFixed(0)},${p.smTarget.y.toFixed(0)}) ${box}`)
    }
    console.log(`\n  max atacantes na área durante o congelamento: ${maxAtk}`)
    break
  }
}
