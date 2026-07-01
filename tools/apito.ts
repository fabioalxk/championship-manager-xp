/**
 * APITO NO INTERVALO NATURAL (WHISTLE) — o árbitro encerra o tempo numa PAUSA
 * NATURAL: um reinício sem perigo (lateral longe do gol, tiro de meta) ou a bola
 * no TERÇO CENTRAL — nunca no meio de um ataque. Mede, no FIM do jogo: em que
 * contexto o apito soou e quanto tempo extra esperou ALÉM dos acréscimos.
 */
import { createMatch, step, stepCelebration } from '../src/sim/engine'
import { MATCH, WHISTLE, FIELD, AREA } from '../src/sim/constants'

MATCH.clockRate = 2
const N = 40

let central = 0, atRestart = 0, inBoxLive = 0, extraSum = 0, forced = 0
for (let i = 0; i < N; i++) {
  const s = createMatch()
  let guard = 0
  while (s.status !== 'over' && guard++ < 800_000) {
    if (s.celebration) stepCelebration(s, 1 / 30)
    else step(s, 1 / 30)
  }
  // no apito final: em que contexto a bola estava?
  const deadball = s.deadball > 0 || s.outOfPlay > 0
  const distC = Math.abs(s.ball.pos.x - FIELD.cx)
  if (deadball) atRestart++ // lateral / tiro de meta / falta sem perigo (pausa legítima)
  else if (distC <= WHISTLE.neutralHalfWidth) central++
  const nearBox = s.ball.pos.x <= AREA.penaltyDepth || s.ball.pos.x >= FIELD.w - AREA.penaltyDepth
  if (!deadball && nearBox) inBoxLive++ // bola VIVA perto da área = corte no ataque
  // espera ALÉM do alvo real (90min + acréscimos do 2º tempo) até soar o apito
  const extra = s.time - (2 * MATCH.halfSeconds + s.stoppage)
  extraSum += Math.max(0, extra)
  if (extra >= WHISTLE.maxExtraWait - 1) forced++ // apito forçado (bateu o teto)
}

const p = (x: number) => ((x / N) * 100).toFixed(0) + '%'
console.log('================================================================')
console.log(` APITO FINAL — ${N} jogos (WHISTLE)`)
console.log('================================================================')
console.log(`\n  Apito num REINÍCIO sem perigo (lateral/tiro de meta): ${p(atRestart)}`)
console.log(`  Apito com a bola viva no TERÇO CENTRAL: ${p(central)}`)
console.log(`  Apito com a bola VIVA perto de uma ÁREA: ${p(inBoxLive)}   (corte no ataque — deveria ser ~0%)`)
console.log(`  Apito "forçado" (bateu o teto ${WHISTLE.maxExtraWait}s além dos acréscimos): ${p(forced)}`)
console.log(`  Espera média além dos acréscimos: ${(extraSum / N).toFixed(0)}s de jogo`)
console.log('\n  ➤ reinício + terço central altos, bola viva na área ~0% = o árbitro espera a jogada morrer.')
