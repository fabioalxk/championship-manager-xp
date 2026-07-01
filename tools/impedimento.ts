/**
 * IMPEDIMENTO (feature nova, Lei 11) — frequência de impedimentos apitados por
 * jogo. Real: ~2-3/jogo. Muito → toda bola em profundidade é apitada (mata o
 * jogo); ~0 → a regra não pega. Detecta os eventos "Impedimento" conforme surgem.
 */
import { createMatch, step, stepCelebration } from '../src/sim/engine'
import { MATCH } from '../src/sim/constants'

MATCH.clockRate = 2
const N = 12

let offsides = 0, throughBalls = 0
for (let i = 0; i < N; i++) {
  const s = createMatch()
  let lastKey = '', guard = 0
  while (s.status !== 'over' && guard++ < 600_000) {
    if (s.celebration) stepCelebration(s, 1 / 30)
    else step(s, 1 / 30)
    const e = s.events[s.events.length - 1]
    if (e) {
      const key = `${e.minute}:${e.text}`
      if (key !== lastKey && /impedimento/i.test(e.text)) offsides++
      lastKey = key
    }
  }
}

console.log('================================================================')
console.log(` IMPEDIMENTO — ${N} jogos reais (clockRate=2)`)
console.log('================================================================')
console.log(`\n  Impedimentos apitados: ${offsides}  →  ${(offsides / N).toFixed(1)}/jogo   (real ~2-3)`)
console.log('  (nota: clockRate=2 tem muito mais lances/jogo que o real, então a')
console.log('   contagem absoluta tende a ser inflada — o que importa é NÃO ser ~0 nem absurdo)')
console.log('\n  ➤ ~0 = regra não pega · muito alto = mata o jogo em profundidade.')
