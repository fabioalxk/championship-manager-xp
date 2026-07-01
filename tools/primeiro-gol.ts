/**
 * PRIMEIRO GOL → RESULTADO (momentum). Quem abre o placar vence quanto %? Real
 * ~70%. ~50% = sem momentum/proteção de vantagem; ~95% = vantagem decisiva demais.
 * clockRate=6 dá placar mais realista (~2 gols/jogo), onde o 1º gol importa.
 */
import { createMatch, step, stepCelebration } from '../src/sim/engine'
import { MATCH } from '../src/sim/constants'
import type { TeamId } from '../src/sim/types'

MATCH.clockRate = 6
const N = 30

let decided = 0, firstWon = 0, firstDrew = 0, firstLost = 0, scoreless = 0

for (let i = 0; i < N; i++) {
  const s = createMatch()
  let first: TeamId | null = null, prevH = 0, prevA = 0, guard = 0
  while (s.status !== 'over' && guard++ < 800_000) {
    if (s.celebration) stepCelebration(s, 1 / 30)
    else step(s, 1 / 30)
    if (first === null) {
      if (s.score.home > prevH) first = 'home'
      else if (s.score.away > prevA) first = 'away'
    }
    prevH = s.score.home; prevA = s.score.away
  }
  if (first === null) { scoreless++; continue }
  decided++
  const winner: TeamId | 'draw' = s.score.home > s.score.away ? 'home' : s.score.away > s.score.home ? 'away' : 'draw'
  if (winner === first) firstWon++
  else if (winner === 'draw') firstDrew++
  else firstLost++
}

const p = (x: number) => ((x / decided) * 100).toFixed(0) + '%'
console.log('================================================================')
console.log(` PRIMEIRO GOL → RESULTADO — ${N} jogos (clockRate=6)`)
console.log('================================================================')
console.log(`\n  Jogos com gol: ${decided}/${N}  (sem gol: ${scoreless})`)
console.log(`\n  Quem marcou PRIMEIRO:`)
console.log(`    venceu:   ${p(firstWon)}   (real ~70%)`)
console.log(`    empatou:  ${p(firstDrew)}`)
console.log(`    perdeu:   ${p(firstLost)}`)
console.log(`\n  ➤ ~70% = momentum saudável; ~50% = abrir o placar não vale nada; ~95% = vantagem decisiva demais.`)
