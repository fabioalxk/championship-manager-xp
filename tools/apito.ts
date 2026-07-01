/**
 * APITO NO INTERVALO NATURAL (WHISTLE, feature nova) — o árbitro encerra o tempo
 * com a bola no TERÇO CENTRAL (jogada morta), não no meio de um ataque. Mede, no
 * FIM do jogo: % com a bola na faixa neutra e quanto tempo extra esperou.
 */
import { createMatch, step, stepCelebration } from '../src/sim/engine'
import { MATCH, WHISTLE, FIELD, AREA } from '../src/sim/constants'

MATCH.clockRate = 2
const N = 40

let central = 0, inBox = 0, extraSum = 0, forced = 0
const target = 2 * (45 * 60) // 2 tempos de 45min (s de jogo), sem acréscimos p/ referência
for (let i = 0; i < N; i++) {
  const s = createMatch()
  let guard = 0
  while (s.status !== 'over' && guard++ < 800_000) {
    if (s.celebration) stepCelebration(s, 1 / 30)
    else step(s, 1 / 30)
  }
  // no apito final: onde está a bola?
  const distC = Math.abs(s.ball.pos.x - FIELD.cx)
  if (distC <= WHISTLE.neutralHalfWidth) central++
  const nearBox = s.ball.pos.x <= AREA.penaltyDepth || s.ball.pos.x >= FIELD.w - AREA.penaltyDepth
  if (nearBox) inBox++
  const extra = s.time - target
  extraSum += Math.max(0, extra)
  if (extra >= WHISTLE.maxExtraWait - 1) forced++ // provável apito forçado (bateu o teto)
}

const p = (x: number) => ((x / N) * 100).toFixed(0) + '%'
console.log('================================================================')
console.log(` APITO FINAL — ${N} jogos (WHISTLE)`)
console.log('================================================================')
console.log(`\n  Bola no TERÇO CENTRAL no apito: ${p(central)}   (o objetivo da feature)`)
console.log(`  Bola perto de uma ÁREA no apito: ${p(inBox)}   (deveria ser raro)`)
console.log(`  Apito "forçado" (bateu o teto ${WHISTLE.maxExtraWait}s): ${p(forced)}`)
console.log('\n  ➤ alta % central + baixa % na área = o árbitro espera a jogada morrer (feature funciona).')
