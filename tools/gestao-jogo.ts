/**
 * GESTÃO DE JOGO (gameUrgency, feature nova) — no fim da partida, o time que
 * PERDE compromete mais gente à frente e o que GANHA recua. Mede o avanço médio
 * dos jogadores de linha do time da casa conforme o placar, no fim do jogo.
 */
import { createMatch, step } from '../src/sim/engine'
import { MATCH } from '../src/sim/constants'

import { FIELD } from '../src/sim/constants'

// forma DEFENSIVA: bola com o ADVERSÁRIO no meio → mede o avanço médio da linha da
// casa (x maior = bloco alto/pressiona; x menor = recua e protege). Isola a
// urgência da posse de bola (que confundia a medição anterior).
const homeAdvance = (scoreDiff: number, minute: number): number => {
  const s = createMatch()
  s.time = minute * 60
  s.score.home = Math.max(0, scoreDiff)
  s.score.away = Math.max(0, -scoreDiff)
  // dá a bola a um meia adversário no centro (home DEFENDE)
  const away = s.players.find((p) => p.team === 'away' && p.role === 'MID')!
  away.pos = { x: FIELD.cx, y: FIELD.cy }
  s.ball.pos = { x: FIELD.cx, y: FIELD.cy }
  s.controllerId = away.id
  s.possession = 'away'
  for (let i = 0; i < 150; i++) step(s, 1 / 30)
  const outs = s.players.filter((p) => p.team === 'home' && p.role !== 'GK')
  return outs.reduce((a, p) => a + p.pos.x, 0) / outs.length
}

console.log('================================================================')
console.log(' GESTÃO DE JOGO — avanço do time da casa por placar (min 88)')
console.log('================================================================')
console.log('\n  placar da casa   avanço médio (m no eixo de ataque)')
const drawn = homeAdvance(0, 88)
for (const [lbl, diff] of [['perdendo por 2', -2], ['perdendo por 1', -1], ['empatando', 0], ['ganhando por 1', 1], ['ganhando por 2', 2]] as [string, number][]) {
  const adv = homeAdvance(diff, 88)
  const rel = adv - drawn
  console.log(`  ${lbl.padEnd(16)} ${adv.toFixed(1)} m   (${rel >= 0 ? '+' : ''}${rel.toFixed(1)} vs empate)`)
}
console.log('\n  Comparando início (min 20) × fim (min 88), perdendo por 1:')
console.log(`   min 20: ${homeAdvance(-1, 20).toFixed(1)} m  ·  min 88: ${homeAdvance(-1, 88).toFixed(1)} m`)
console.log('\n  ➤ esperado: perdendo no fim → avança MAIS; ganhando no fim → recua. Sem efeito = gestão não liga.')
