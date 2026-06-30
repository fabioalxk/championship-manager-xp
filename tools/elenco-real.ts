/**
 * ELENCOS REAIS — roda Brasil × Argentina (os rosters que SHIPAM, createMatch sem
 * args) na velocidade REAL do jogo (clockRate=24 padrão). Valida os dados de
 * atributos de verdade e mostra o placar/estatística que o jogador vê na tela.
 */
import { createMatch, step, stepCelebration } from '../src/sim/engine'

const N = 50
const scoreCount: Record<string, number> = {}
let gH = 0, gA = 0, shH = 0, shA = 0, sotH = 0, sotA = 0
let winH = 0, draw = 0, winA = 0, foul = 0, cards = 0, corners = 0, posH = 0, posT = 0
let over3 = 0, zeros = 0

for (let i = 0; i < N; i++) {
  const s = createMatch() // sem args = Brasil (casa) × Argentina (fora)
  let guard = 0
  while (s.status !== 'over' && guard++ < 300_000) {
    if (s.celebration) stepCelebration(s, 1 / 30)
    else step(s, 1 / 30)
  }
  const h = s.score.home, a = s.score.away
  gH += h; gA += a
  scoreCount[`${h}x${a}`] = (scoreCount[`${h}x${a}`] ?? 0) + 1
  if (h > a) winH++; else if (h < a) winA++; else draw++
  if (h + a >= 3) over3++
  if (h + a === 0) zeros++
  const st = s.stats
  shH += st.home.shots; shA += st.away.shots; sotH += st.home.shotsOnTarget; sotA += st.away.shotsOnTarget
  foul += st.home.fouls + st.away.fouls; cards += st.home.yellows + st.away.yellows + st.home.reds + st.away.reds
  corners += st.home.corners + st.away.corners
  posH += st.home.possessionTicks; posT += st.home.possessionTicks + st.away.possessionTicks
}

const pct = (x: number) => ((x / N) * 100).toFixed(0) + '%'
console.log('================================================================')
console.log(` ELENCOS REAIS — Brasil × Argentina · ${N} jogos · clockRate=24 (real)`)
console.log('================================================================')
console.log(`\n  Placar médio:     Brasil ${(gH / N).toFixed(2)} x ${(gA / N).toFixed(2)} Argentina`)
console.log(`  Resultado Brasil: V ${pct(winH)} · E ${pct(draw)} · D ${pct(winA)}`)
console.log(`  Gols/jogo: ${((gH + gA) / N).toFixed(2)}  ·  jogos com 0 gol: ${pct(zeros)}  ·  com 3+ gols: ${pct(over3)}`)
console.log(`  Chutes/jogo: ${((shH + shA) / N).toFixed(1)}  ·  no alvo: ${(((sotH + sotA) / (shH + shA)) * 100).toFixed(0)}%  ·  conversão: ${(((gH + gA) / (shH + shA)) * 100).toFixed(0)}%`)
console.log(`  Posse Brasil: ${((posH / posT) * 100).toFixed(0)}%  ·  Faltas/jogo: ${(foul / N).toFixed(1)}  ·  Cartões/jogo: ${(cards / N).toFixed(1)}  ·  Escanteios/jogo: ${(corners / N).toFixed(1)}`)

console.log('\n  Distribuição de placares:')
Object.entries(scoreCount).sort((a, b) => b[1] - a[1]).slice(0, 10)
  .forEach(([sc, n]) => console.log(`    ${sc.padEnd(6)} ${pct(n).padStart(4)}  ${'█'.repeat(Math.round((n / N) * 40))}`))
console.log('\n  (clockRate=24 comprime o jogo → poucos eventos/jogo; o que importa é a DISTRIBUIÇÃO e o equilíbrio)')
